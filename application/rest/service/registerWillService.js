const { v4: uuidv4 } = require('uuid');
const { encrypt, calculateHash } = require('../utils/encryption'); // decrypt는 여기서는 불필요
const pool = require('../db'); // DB 연결 풀
const sdk = require('../sdk'); // Fabric SDK 호출 모듈

// 내부 헬퍼 함수: 실제 유언장 등록 로직 수행
async function _registerWillCore(connection, { title, originalContent, beneficiariesInput, testatorId }, imageFiles) {
    // 1. 고유 ID 생성
    const willDbId = uuidv4(); // Wills 테이블 및 블록체인 Will ID로 사용될 고유 ID

    // 2. 텍스트 유언 내용 처리 (해시 및 암호화)
    const contentHash = calculateHash(originalContent);
    const encryptedPayload = encrypt(originalContent);
    if (!encryptedPayload || !encryptedPayload.iv || !encryptedPayload.encryptedData || !encryptedPayload.authTag) {
        throw Object.assign(new Error('Core Error: Failed to encrypt will content correctly.'), { status: 500 });
    }

    // 3. Wills 테이블에 텍스트 유언 정보 저장 (title 포함)
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

    // 4. 이미지 처리 (imageFiles가 제공된 경우)
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
    const beneficiariesChaincodeArg = beneficiariesInput || "[]"; 
    const imagesJSONString = JSON.stringify(imageMetadataForChaincode);
    const offChainStorageRefForText = willDbId; 

    const chaincodeArgs = [
        String(willDbId),
        String(testatorId),
        String(title),
        String(contentHash),
        String(offChainStorageRefForText),
        beneficiariesChaincodeArg, 
        imagesJSONString
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


async function registerWillService(title, originalContent, beneficiaries, testatorId) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const beneficiariesJSONString = JSON.stringify(beneficiaries || []);

        const result = await _registerWillCore(connection, 
            { title, originalContent, beneficiariesInput: beneficiariesJSONString, testatorId },
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

async function registerWillWithImagesService(title, originalContent, beneficiariesInput, testatorId, imageFiles) {
    // 컨트롤러에서 기본 유효성 검사 (필수 필드, 이미지 존재 여부, 이미지 개수 제한 등)를 수행한 것으로 가정합니다.
    // 서비스 레벨에서는 각 이미지 파일의 상세 유효성(내용물)을 검사합니다.
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

        let beneficiariesChaincodeArg;
        if (typeof beneficiariesInput === 'string') {
            try {
                JSON.parse(beneficiariesInput); 
                beneficiariesChaincodeArg = beneficiariesInput;
            } catch (e) {
                console.warn("Service (registerWillWithImagesService): beneficiariesInput was a string but not valid JSON. Defaulting to []. Input:", beneficiariesInput);
                beneficiariesChaincodeArg = "[]";
            }
        } else {
            beneficiariesChaincodeArg = JSON.stringify(beneficiariesInput || []);
        }
        
        const result = await _registerWillCore(connection, 
            { title, originalContent, beneficiariesInput: beneficiariesChaincodeArg, testatorId },
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