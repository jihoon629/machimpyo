const { v4: uuidv4 } = require('uuid');
const { encrypt, calculateHash } = require('../utils/encryption');
const pool = require('../db'); 
const sdk = require('../sdk'); 

// 내부 헬퍼 함수: 실제 유언장 등록 로직 수행
// beneficiariesInput 파라미터명을 designatedViewersJSON으로 변경
async function _registerWillCore(connection, { title, originalContent, designatedViewersJSON, testatorId }, imageFiles) {
    // 1. 고유 ID 생성
    const willDbId = uuidv4(); 

    // 2. 텍스트 유언 내용 처리 (해시 및 암호화)
    const contentHash = calculateHash(originalContent);
    const encryptedPayload = encrypt(originalContent);
    if (!encryptedPayload || !encryptedPayload.iv || !encryptedPayload.encryptedData || !encryptedPayload.authTag) {
        throw Object.assign(new Error('Core Error: Failed to encrypt will content correctly.'), { status: 500 });
    }

    // 3. Wills 테이블에 텍스트 유언 정보 저장
    const insertTextWillQuery = `
        INSERT INTO Wills (id, testator_id, encrypted_content, encryption_iv, encryption_auth_tag, title) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(insertTextWillQuery, [
        willDbId,
        testatorId,
        encryptedPayload.encryptedData,
        encryptedPayload.iv,
        encryptedPayload.authTag,
        title
    ]);
    console.log(`Core (_registerWillCore): Text will content stored in MariaDB (Wills table) with ID: ${willDbId} for testator: ${testatorId}`);

    // 4. 이미지 처리
    const imageMetadataForChaincode = [];
    if (imageFiles && imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
            const imageBuffer = imageFile.buffer;
            const imageMimeType = imageFile.mimetype;
            let imageOriginalName = imageFile.originalname;

            try {
                const rawAsLatin1 = Buffer.from(imageOriginalName, 'latin1');
                const restoredFilename = rawAsLatin1.toString('utf-8');
                if (!restoredFilename.includes('�') && restoredFilename.length >= 2) {
                    imageOriginalName = restoredFilename;
                }
            } catch (e) {
                console.error("Core DEBUG: Error during filename encoding restoration:", e);
            }

            const imageHash = calculateHash(imageBuffer);
            const imageRecordId = uuidv4(); 

            const insertImageQuery = `
                INSERT INTO WillImages (id, will_db_id, image_data, mime_type, file_name)
                VALUES (?, ?, ?, ?, ?)
            `;
            await connection.execute(insertImageQuery, [
                imageRecordId,
                willDbId, 
                imageBuffer,
                imageMimeType,
                imageOriginalName
            ]);
            console.log(`Core (_registerWillCore): Image '${imageOriginalName}' stored in MariaDB (WillImages table) with ID: ${imageRecordId}`);

            imageMetadataForChaincode.push({
                imageHash: imageHash,
                imageOffChainRef: imageRecordId, 
                fileName: imageOriginalName
            });
        }
    }

    // 5. 블록체인에 전달할 인자 준비
    // designatedViewersJSON 파라미터 사용 (체인코드에서 이 이름으로 기대)
    const designatedViewersChaincodeArg = designatedViewersJSON || "[]"; 
    const imagesJSONString = JSON.stringify(imageMetadataForChaincode);
    const offChainStorageRefForText = willDbId; 

    const createdAtString = new Date().toISOString(); // 클라이언트에서 시간 생성

    // 체인코드 RegisterWill 함수 시그니처에 맞게 designatedViewersChaincodeArg 전달
    const chaincodeArgs = [
        String(willDbId),
        String(testatorId),
        String(title),
        String(contentHash),
        String(offChainStorageRefForText),
        designatedViewersChaincodeArg, // 변경된 파라미터명 사용
        imagesJSONString,
        createdAtString
    ];

    console.log(`Core (_registerWillCore): Invoking chaincode 'RegisterWill' with args: ${JSON.stringify(chaincodeArgs)}`);

    const chaincodeResponseBuffer = await sdk.send(false, 'RegisterWill', chaincodeArgs);
    let blockchainResponse = chaincodeResponseBuffer && chaincodeResponseBuffer.length > 0 ? chaincodeResponseBuffer.toString() : "Chaincode execution successful (no specific message).";
    console.log(`Core (_registerWillCore): Chaincode 'RegisterWill' response: ${blockchainResponse}`);

    return {
        message: blockchainResponse,
        dbRecordId: willDbId,
        blockchainWillId: willDbId
    };
}

// 이미지 없는 유언장 등록 서비스
// 컨트롤러에서 designatedViewers (JS 객체 배열 또는 undefined)를 받음
async function registerWillService(title, originalContent, designatedViewers, testatorId) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // designatedViewers를 JSON 문자열로 변환
        const designatedViewersJSONString = JSON.stringify(designatedViewers || []);

        const result = await _registerWillCore(connection, 
            { 
                title, 
                originalContent, 
                designatedViewersJSON: designatedViewersJSONString, // _registerWillCore에 JSON 문자열 전달
                testatorId 
            },
            null // 이미지 파일 없음
        );

        await connection.commit();
        return result;

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Service Error (registerWillService):', error.stack || error);
        if (!error.status) { error.status = 500; } 
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

// 이미지 있는 유언장 등록 서비스
// 컨트롤러에서 designatedViewersInput (JSON 문자열 또는 undefined)을 받음
async function registerWillWithImagesService(title, originalContent, designatedViewersInput, testatorId, imageFiles) {
    // 각 이미지 파일의 상세 유효성 검사
    for (const imageFile of imageFiles) {
        if (!imageFile || !imageFile.buffer || !imageFile.mimetype || !imageFile.originalname) {
            const error = new Error('Service Error: Each image file must be valid and contain buffer, mimetype, and originalname.');
            error.status = 400; 
            throw error;
        }
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // designatedViewersInput이 문자열 형태의 JSON으로 오므로, 유효성 검사 후 그대로 사용하거나 기본값 "[]" 사용
        let designatedViewersJSONString = "[]"; // 기본값
        if (typeof designatedViewersInput === 'string' && designatedViewersInput.trim() !== "") {
            try {
                JSON.parse(designatedViewersInput); // 유효한 JSON인지 확인
                designatedViewersJSONString = designatedViewersInput;
            } catch (e) {
                console.warn("Service (registerWillWithImagesService): designatedViewersInput was a string but not valid JSON. Defaulting to []. Input:", designatedViewersInput);
                // 유효하지 않은 JSON 문자열이면 기본값 "[]" 사용
            }
        }
        
        const result = await _registerWillCore(connection, 
            { 
                title, 
                originalContent, 
                designatedViewersJSON: designatedViewersJSONString, // _registerWillCore에 JSON 문자열 전달
                testatorId 
            },
            imageFiles
        );

        await connection.commit();
        return result;

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Service Error (registerWillWithImagesService):', error.stack || error);
        if (!error.status) { error.status = 500; }
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = {
    registerWillService,
    registerWillWithImagesService
};