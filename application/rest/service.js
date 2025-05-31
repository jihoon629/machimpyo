// application/rest/service.js
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pool = require('./db'); // DB 연결 풀
const sdk = require('./sdk'); // Fabric SDK 호출 모듈

// --- 암호화 관련 설정 및 함수 (기존과 동일) ---
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY_HEX || '1eb81515f8a41062210838ed8bfa294ed58d67ffb8c902c2b281efc30c5451df';
let ENCRYPTION_KEY;
if (ENCRYPTION_KEY) {
    console.log("ENCRYPTION_KEY (Buffer length):", ENCRYPTION_KEY.length); // 32바이트여야 함
}
if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
    console.error("CRITICAL ERROR: ENCRYPTION_KEY_HEX is not set correctly.");
} else {
    ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
    console.log("Encryption key loaded successfully in service.js.");
}
const IV_LENGTH = 12;


function encrypt(text) {
    if (!ENCRYPTION_KEY) {
        throw new Error("Encryption key is not configured. Cannot encrypt data.");
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted, authTag: authTag };
}

function decrypt(encryptedPayload) {
    if (!ENCRYPTION_KEY) {
        throw new Error("Encryption key is not configured. Cannot decrypt data.");
    }
    try {
        const iv = Buffer.from(encryptedPayload.iv, 'hex');
        const authTag = Buffer.from(encryptedPayload.authTag, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedPayload.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error("Decryption failed in service.js:", error.message);
        // 복호화 실패는 중요한 문제이므로 null 반환 대신 에러 throw 고려
        const decryptError = new Error("Failed to decrypt data. It may be corrupted or the key is incorrect.");
        decryptError.status = 500; // 내부 서버 오류
        decryptError.cause = error;
        throw decryptError;
    }
}

function calculateHash(inputData) { // 파라미터 이름을 inputData 등으로 변경
    return crypto.createHash('sha256').update(inputData).digest('hex'); // 변경된 파라미터 이름 사용
}
// --- 암호화 관련 설정 및 함수 끝 ---


/**
 * 텍스트 기반 유언장을 등록하는 서비스 함수입니다. (이미지 미포함)
 * 체인코드 RegisterWill의 변경된 시그니처에 맞게 호출합니다.
 */
async function registerWillService(title, originalContent, beneficiaries, testatorId) {
    if (!title || !originalContent || !testatorId) {
        const error = new Error('Service Error: Missing required parameters for will registration.');
        error.status = 400;
        throw error;
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const contentHash = calculateHash(originalContent);
        const encryptedPayload = encrypt(originalContent);

        if (!encryptedPayload || !encryptedPayload.iv || !encryptedPayload.encryptedData || !encryptedPayload.authTag) {
            throw Object.assign(new Error('Service Error: Failed to encrypt will content correctly.'), { status: 500 });
        }

        const willDbId = uuidv4(); // DB Wills 테이블 레코드용 고유 ID 생성
        const insertTextWillQuery = `
            INSERT INTO Wills (id, testator_id, encrypted_content, encryption_iv, encryption_auth_tag, title) 
            VALUES (?, ?, ?, ?, ?, ?) 
        `; // title도 Wills 테이블에 저장하도록 추가 (선택 사항, GetWillDetails에서 활용 가능)
        await connection.execute(insertTextWillQuery, [
            willDbId,
            testatorId,
            encryptedPayload.encryptedData,
            encryptedPayload.iv,
            encryptedPayload.authTag,
            title // title 저장
        ]);
        console.log(`Service (registerWillService): Text will content stored in MariaDB (Wills table) with ID: ${willDbId} for testator: ${testatorId}`);

        const beneficiariesJSONString = JSON.stringify(beneficiaries || []);
        const offChainStorageRef = willDbId; // DB Wills 테이블 ID를 오프체인 참조로 사용

        // 체인코드 RegisterWill 함수 호출 인자 준비 (변경된 시그니처에 맞게)
        // 순서: id, testatorID, title, contentHash, offChainStorageRef, beneficiariesJSON, imagesJSON
        const chaincodeArgs = [
            String(willDbId),             // 유언장 ID (DB ID와 일치)
            String(testatorId),
            String(title),
            String(contentHash),
            String(offChainStorageRef),
            beneficiariesJSONString,
            "[]"                          // imagesJSON: 텍스트 전용이므로 빈 이미지 배열 "[]" 전달
        ];
        console.log(`Service (registerWillService): Invoking chaincode 'RegisterWill' with args: ${JSON.stringify(chaincodeArgs)}`);

        const chaincodeResponseBuffer = await sdk.send(false, 'RegisterWill', chaincodeArgs);

        let blockchainResponse = ""; // 체인코드 응답은 보통 문자열 메시지 (예: "Will 'ID' registered successfully...")
        if (chaincodeResponseBuffer && chaincodeResponseBuffer.length > 0) {
            blockchainResponse = chaincodeResponseBuffer.toString();
        }
        console.log(`Service (registerWillService): Chaincode 'RegisterWill' response: ${blockchainResponse}`);


        await connection.commit();

        return {
            message: blockchainResponse, // 체인코드로부터 받은 메시지
            dbRecordId: willDbId,        // DB에 저장된 Wills 레코드 ID
            blockchainWillId: willDbId   // 블록체인에 등록된 Will의 ID (DB ID와 동일하게 사용)
        };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Service Error during text will registration:', error.stack || error);
        if (!error.status) { error.status = 500; }
        throw error;
    } finally {
        if (connection) connection.release();
    }
}


/**
 * 유언장과 여러 이미지를 함께 등록하는 서비스 함수입니다. (대폭 수정됨)
 * @param {string} title - 유언장 제목.
 * @param {string} originalContent - 유언장 원본 내용 (암호화 대상).
 * @param {string} beneficiariesInput - 수혜자 목록 (JSON 문자열).
 * @param {string} testatorId - 유언자 ID (사용자명).
 * @param {Array<object>} imageFiles - 업로드된 이미지 파일 객체 배열 (multer의 req.files).
 *                                    각 객체는 { buffer: Buffer, mimetype: string, originalname: string } 형태.
 * @returns {Promise<{message: string, dbRecordId: string, blockchainWillId: string}>}
 */
async function registerWillWithImagesService(title, originalContent, beneficiariesInput, testatorId, imageFiles) {
    if (!title || !originalContent || !testatorId) {
        const error = new Error('Service Error: Missing required text parameters for will registration.');
        error.status = 400;
        throw error;
    }
    // 이미지 파일 배열 유효성 검증 (이미지가 선택 사항이 아니라면)
    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0) {
        // 이미지가 필수인 경우 에러 처리, 선택 사항이면 이 검사를 수정하거나 imageFiles가 없을 때 다른 로직 실행
        const error = new Error('Service Error: At least one image file is required.');
        error.status = 400;
        throw error;
    }
    for (const imageFile of imageFiles) {
        if (!imageFile || !imageFile.buffer || !imageFile.mimetype || !imageFile.originalname) {
            const error = new Error('Service Error: Each image file must be valid (buffer, mimetype, originalname).');
            error.status = 400;
            throw error;
        }
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. 텍스트 유언 내용 처리 (암호화 및 해시 계산)
        const contentHash = calculateHash(originalContent);
        const encryptedPayload = encrypt(originalContent);
        if (!encryptedPayload || !encryptedPayload.iv || !encryptedPayload.encryptedData || !encryptedPayload.authTag) {
            throw Object.assign(new Error('Service Error: Failed to encrypt will content correctly.'), { status: 500 });
        }

        const willDbId = uuidv4(); // Wills 테이블 레코드용 고유 ID (이 ID가 블록체인 Will ID로도 사용됨)

        // 2. Wills 테이블에 텍스트 유언 암호화 정보 저장 (이미지 데이터는 WillImages 테이블로 분리)
        const insertTextWillQuery = `
        INSERT INTO Wills (id, testator_id, encrypted_content, encryption_iv, encryption_auth_tag,title) 
        VALUES (?, ?, ?, ?, ?,?) 
    `; // 'title' 제거
    await connection.execute(insertTextWillQuery, [
        willDbId,
        testatorId,
        encryptedPayload.encryptedData,
        encryptedPayload.iv,
        encryptedPayload.authTag, // title 파라미터 제거
        title
    ]);
        console.log(`Service (registerWillWithImagesService): Text will content stored in MariaDB (Wills table) with ID: ${willDbId} for testator: ${testatorId}`);

        // 3. 여러 이미지 처리 및 WillImages 테이블에 저장, 체인코드용 메타데이터 준비
        const imageMetadataForChaincode = [];
        if (imageFiles && imageFiles.length > 0) {
            for (const imageFile of imageFiles) {
                const imageBuffer = imageFile.buffer;
                const imageMimeType = imageFile.mimetype;
                
                // --- 파일명 인코딩 복원 시도 ---
                let imageOriginalName = imageFile.originalname;
                console.log(`Service DEBUG: multer originalname (raw): '${imageOriginalName}'`);

                // 7bit 인코딩으로 들어오는 경우, latin1으로 간주하고 UTF-8로 변환 시도
                // (multer가 encoding: '7bit'로 주는 것은 내용물 인코딩일 수 있고, 파일명은 다를 수 있음)
                // 이 변환은 시행착오가 필요할 수 있습니다.
                try {
                    const rawAsLatin1 = Buffer.from(imageOriginalName, 'latin1');
                    const restoredFilename = rawAsLatin1.toString('utf-8');

                    // 간단한 휴리스틱: 변환 후에도 깨진 문자(�)가 있거나, 너무 짧아지거나, 특정 패턴이 아니면 원본 사용
                    if (restoredFilename.includes('�') || restoredFilename.length < 2) {
                         console.log(`Service DEBUG: Filename restoration (latin1->utf8) seemed to fail or result in invalid chars. Keeping raw originalname: '${imageOriginalName}'`);
                    } else {
                        // 변환이 어느 정도 성공적이라고 판단되면 복원된 이름 사용
                        console.log(`Service DEBUG: Restored filename (latin1->utf8): '${restoredFilename}'`);
                        imageOriginalName = restoredFilename;
                    }
                } catch (e) {
                    console.error("Service DEBUG: Error during filename encoding restoration:", e);
                    // 에러 발생 시 원본 이름 유지
                }
                // ---------------------------------

                const imageHash = calculateHash(imageBuffer);
                const imageRecordId = uuidv4();

                console.log(`Service DEBUG: multer encoding (from multer obj): '${imageFile.encoding}'`);
                console.log(`Service DEBUG: multer mimetype: '${imageMimeType}'`);
                console.log(`Service DEBUG: Filename to be saved to DB (after potential restoration): '${imageOriginalName}'`);
                                
                const insertImageQuery = `
                    INSERT INTO WillImages (id, will_db_id, image_data, mime_type, file_name)
                    VALUES (?, ?, ?, ?, ?)
                `;
                await connection.execute(insertImageQuery, [
                    imageRecordId,
                    willDbId,
                    imageBuffer,
                    imageMimeType,
                    imageOriginalName // 복원된 또는 원본 파일명 사용
                ]);
                console.log(`Service (registerWillWithImagesService): Image '${imageOriginalName}' stored in MariaDB ...`);

                imageMetadataForChaincode.push({
                    imageHash: imageHash,
                    imageOffChainRef: imageRecordId, 
                    fileName: imageOriginalName // 복원된 또는 원본 파일명 사용
                });
            }
        }

        // 4. 블록체인에 전달할 인자 준비
        const beneficiariesChaincodeArg = beneficiariesInput || "[]";
        const imagesJSONString = JSON.stringify(imageMetadataForChaincode); // 이미지 메타데이터 배열을 JSON 문자열로
        const offChainStorageRefForText = willDbId; // 텍스트 유언 내용의 DB 참조 ID (Wills 테이블 ID)

        // 체인코드 `RegisterWill` 함수 호출 인자 (변경된 시그니처에 맞게)
        // 순서: id, testatorID, title, contentHash, offChainStorageRef, beneficiariesJSON, imagesJSON
        const chaincodeArgs = [
            String(willDbId),                   // 유언장 ID (Wills 테이블 ID와 동일)
            String(testatorId),
            String(title),
            String(contentHash),
            String(offChainStorageRefForText),
            beneficiariesChaincodeArg,
            imagesJSONString                    // 여러 이미지 메타데이터 JSON 문자열
        ];
        console.log(`Service (registerWillWithImagesService): Invoking chaincode 'RegisterWill' with args: ${JSON.stringify(chaincodeArgs)}`);

        const chaincodeResponseBuffer = await sdk.send(false, 'RegisterWill', chaincodeArgs);

        let blockchainResponse = "";
        if (chaincodeResponseBuffer && chaincodeResponseBuffer.length > 0) {
            blockchainResponse = chaincodeResponseBuffer.toString();
        }
        console.log(`Service (registerWillWithImagesService): Chaincode 'RegisterWill' response: ${blockchainResponse}`);

        await connection.commit();

        return {
            message: blockchainResponse,
            dbRecordId: willDbId,        // DB Wills 테이블의 ID
            blockchainWillId: willDbId   // 블록체인 Will ID (DB ID와 동일)
        };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Service Error during will with images registration:', error.stack || error);
        if (!error.status) { error.status = 500; }
        throw error;
    } finally {
        if (connection) connection.release();
    }
}


/**
 * 특정 사용자의 모든 유언장 목록을 블록체인에서 조회하는 서비스 함수입니다. (기존과 거의 동일)
 */
async function getMyWillsService(username) {
    // ... 기존 코드 (내부 로직은 변경 없음, 반환되는 Will 객체에 Images 필드가 포함될 것) ...
    if (!username) {
        throw Object.assign(new Error("Username is required to fetch user's wills."), { status: 400 });
    }
    try {
        console.log(`Service: Requesting GetMyWills from chaincode for username: ${username}`);
        const resultBuffer = await sdk.send(true, 'GetMyWills', [username]); 

        if (resultBuffer && resultBuffer.length > 0) {
            const userWills = JSON.parse(resultBuffer.toString());
            console.log(`Service: Found ${userWills.length} wills for username '${username}' from chaincode.`);
            return userWills; // 각 Will 객체는 Images 필드를 포함할 것임
        }
        
        console.log(`Service: No wills found for username '${username}' from chaincode.`);
        return [];
    } catch (error) {
        console.error('Service Error in getMyWillsService:', error.stack || error);
        if (!error.status) { error.status = 500; }
        throw error;
    }
}

/**
 * 특정 유언장의 상세 정보를 조회하는 서비스 함수입니다. (여러 이미지 처리하도록 수정)
 */
async function getWillDetailsService(blockchainWillId, username) {
    if (!blockchainWillId || !username) {
        const error = new Error('Service Error: Blockchain Will ID and Username are required.');
        error.status = 400;
        throw error;
    }

    let connection; // DB 커넥션은 이미지 조회 시 필요
    try {
        console.log(`Service: Fetching details from blockchain for will ID: ${blockchainWillId} by user: ${username}`);
        // 1. 블록체인에서 유언장 메타데이터 가져오기
        const blockchainDataBuffer = await sdk.send(true, 'GetWillDetails', [String(blockchainWillId), String(username)]);

        if (!blockchainDataBuffer || blockchainDataBuffer.length === 0) {
            const error = new Error(`Service Error: Will with ID ${blockchainWillId} not found on blockchain for user ${username}, or access denied.`);
            error.status = 404;
            throw error;
        }

        let blockchainWill;

        try {
            blockchainWill = JSON.parse(blockchainDataBuffer.toString());
            if (blockchainWill && blockchainWill.images === null) {
                console.log(`Service (getWillDetailsService): Correcting null images for will ID ${blockchainWillId} to []`);
                blockchainWill.images = []; // null을 빈 배열로 변경
            }
        } catch (parseError) {
            console.error("Service Error: Failed to parse blockchain response:", parseError, "Raw data:", blockchainDataBuffer.toString());
            throw Object.assign(new Error('Service Error: Failed to parse will data from blockchain.'), { status: 500, cause: parseError });
        }

        // 블록체인 데이터에서 필수 참조 정보 추출
        // 이제 blockchainWill.Images (배열) 와 blockchainWill.OffChainStorageRef (Wills 테이블 ID) 사용
        const { contentHash: storedTextHash, offChainStorageRef: textDbRecordId, images: imageMetadataArray } = blockchainWill;
        console.log("Service: Extracted imageMetadataArray from blockchainWill.Images:", JSON.stringify(imageMetadataArray, null, 2));

        if (!storedTextHash || !textDbRecordId) {
            console.error("Service Error: Blockchain data missing crucial fields (contentHash or offChainStorageRef):", blockchainWill);
            throw Object.assign(new Error('Service Error: Incomplete will data from blockchain (missing hash or DB ref for text).'), { status: 500 });
        }

        connection = await pool.getConnection(); // 이미지 조회를 위해 DB 커넥션 여기서 획득

        // 2. MariaDB에서 암호화된 텍스트 유언 내용 가져오기 (Wills 테이블)
        console.log(`Service: Fetching encrypted text content from MariaDB (Wills table) for record ID: ${textDbRecordId}`);
        const selectTextQuery = `SELECT encrypted_content, encryption_iv, encryption_auth_tag FROM Wills WHERE id = ?`;
        const [textRows] = await connection.execute(selectTextQuery, [textDbRecordId]);

        if (textRows.length === 0) {
            throw Object.assign(new Error(`Service Error: Will text content not found in database for reference ID ${textDbRecordId}.`), { status: 404 });
        }
        const encryptedTextPayloadFromDb = {
            iv: textRows[0].encryption_iv,
            encryptedData: textRows[0].encrypted_content,
            authTag: textRows[0].encryption_auth_tag
        };
        const decryptedContent = decrypt(encryptedTextPayloadFromDb);

        // 3. 텍스트 유언 내용 무결성 검증
        const currentTextHash = calculateHash(decryptedContent);
        if (currentTextHash !== storedTextHash) {
            console.warn(`Service Warning: Text data integrity check FAILED for will ${blockchainWillId}. Stored hash: ${storedTextHash}, Current hash: ${currentTextHash}`);
            throw Object.assign(new Error('Text data integrity check failed. The will content may have been tampered with.'), { status: 409 });
        }
        console.log(`Service: Text data integrity check passed for will ${blockchainWillId}.`);

        // 4. 여러 이미지 데이터 처리 (imageMetadataArray 사용)
        const imageDataUrls = []; // 여러 이미지 데이터 URL을 담을 배열
        console.log("Service: Checking if imageMetadataArray is valid and has length > 0. Is valid?", !!imageMetadataArray, "Length:", imageMetadataArray ? imageMetadataArray.length : 'N/A');

        if (imageMetadataArray && imageMetadataArray.length > 0) {
            for (const imgMeta of imageMetadataArray) {
                const imageDbRefId = imgMeta.imageOffChainRef; // WillImages 테이블의 ID
                const storedImageHash = imgMeta.imageHash;    // 블록체인에 저장된 특정 이미지의 해시

                if (!imageDbRefId || !storedImageHash) {
                    console.warn(`Service Warning: Skipping image for will ${blockchainWillId} due to missing imageOffChainRef or imageHash in metadata:`, imgMeta);
                    continue;
                }

                console.log(`Service: Fetching image data from MariaDB (WillImages table) for image record ID: ${imageDbRefId}`);
                const selectImageQuery = `SELECT image_data, mime_type FROM WillImages WHERE id = ?`;
                const [imageRows] = await connection.execute(selectImageQuery, [imageDbRefId]);

                if (imageRows.length > 0 && imageRows[0].image_data) {
                    const imageBuffer = imageRows[0].image_data;
                    const imageMimeType = imageRows[0].mime_type;

                    const currentImageHash = calculateHash(imageBuffer);
                    if (currentImageHash !== storedImageHash) {
                        console.warn(`Service Warning: Image data integrity check FAILED for will ${blockchainWillId}, image ref ${imageDbRefId}. Stored hash: ${storedImageHash}, Current hash: ${currentImageHash}`);
                        // 이미지 무결성 실패 시 해당 이미지는 건너뛰거나, 에러 처리 또는 null 추가 등 정책 결정
                        imageDataUrls.push({ id: imageDbRefId, url: null, error: "Integrity check failed", fileName: imgMeta.fileName });
                    } else {
                        console.log(`Service: Image data integrity check passed for will ${blockchainWillId}, image ref ${imageDbRefId}.`);
                        imageDataUrls.push({
                            id: imageDbRefId,
                            url: `data:${imageMimeType};base64,${imageBuffer.toString('base64')}`,
                            fileName: imgMeta.fileName,
                            originalHash: storedImageHash // 디버깅/검증용
                        });
                    }
                } else {
                    console.warn(`Service Warning: Image data for will ${blockchainWillId} (image ref: ${imageDbRefId}) not found in DB or image_data is null.`);
                    imageDataUrls.push({ id: imageDbRefId, url: null, error: "Not found in DB", fileName: imgMeta.fileName });
                }
            }
        }

        // 5. 최종 결과 조합하여 반환
        return {
            ...blockchainWill, // 블록체인 메타데이터 (Images 필드 포함)
            originalContent: decryptedContent,
            imageDataUrls: imageDataUrls // 이미지 데이터 URL 배열
        };

    } catch (error) {
        console.error(`Service Error in getWillDetailsService for ID ${blockchainWillId}, user ${username}:`, error.stack || error);
        if (!error.status) { error.status = 500; }
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * DB WillImages 레코드 ID를 기반으로 특정 유언장 이미지를 직접 제공하는 서비스 함수입니다.
 * @param {string} imageRecordId - WillImages 테이블에서 이미지를 조회할 ID.
 * @returns {Promise<{buffer: Buffer, mimeType: string}>} 이미지 버퍼와 MIME 타입.
 */
async function getWillImageService(imageRecordId) { // 파라미터 변경 및 테이블 변경
    if (!imageRecordId) {
        throw Object.assign(new Error('Image record ID is required to fetch the image.'), { status: 400 });
    }
    // WillImages 테이블에서 이미지 데이터와 MIME 타입을 직접 조회
    const query = `SELECT image_data, mime_type, file_name FROM WillImages WHERE id = ?`; // file_name도 가져올 수 있음
    const [rows] = await pool.execute(query, [imageRecordId]);

    if (rows.length === 0 || !rows[0].image_data) {
        throw Object.assign(new Error('Image not found in WillImages database for the given record ID.'), { status: 404 });
    }
    return {
        buffer: rows[0].image_data,
        mimeType: rows[0].mime_type,
        fileName: rows[0].file_name // 원본 파일 이름도 반환 (선택 사항)
    };
}

module.exports = {
    registerWillService,
    registerWillWithImagesService, // 이름 변경 없음 (내부 로직만 변경)
    getMyWillsService,
    getWillDetailsService,
    getWillImageService
};

// encrypt, decrypt, calculateHash 함수들은 내부적으로만 사용되므로, 외부로 export 할 필요는 없음