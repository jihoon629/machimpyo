const { decrypt, calculateHash } = require('../utils/encryption'); 
const pool = require('../db'); 
const sdk = require('../sdk'); 

/**
 * 특정 사용자의 모든 유언장 목록을 블록체인에서 조회하는 서비스 함수입니다.
 * 컨트롤러에서 username이 제공되었음을 가정합니다.
 */
async function getMyWillsService(username) {

    try {
        console.log(`Service: Requesting GetMyWills from chaincode for username: ${username}`);
        const resultBuffer = await sdk.send(true, 'GetMyWills', [username]); 

        if (resultBuffer && resultBuffer.length > 0) {
            const userWills = JSON.parse(resultBuffer.toString());
            console.log(`Service: Found ${userWills.length} wills for username '${username}' from chaincode.`);
            return userWills; 
        }
        
        console.log(`Service: No wills found for username '${username}' from chaincode.`);
        return [];
    } catch (error) {
        console.error('Service Error in getMyWillsService:', error.stack || error);
        // 서비스 로직 수행 중 발생한 에러는 status를 포함할 수 있음 (예: SDK 에러)
        // 그렇지 않다면 일반적인 서버 에러로 처리
        if (!error.status) { error.status = 500; }
        throw error;
    }
}

/**
 * 특정 유언장의 상세 정보를 조회하는 서비스 함수입니다.
 * 컨트롤러에서 blockchainWillId와 username이 제공되었음을 가정합니다.
 */
async function getWillDetailsService(blockchainWillId, username) {
    let connection; 
    try {
        console.log(`Service: Fetching details from blockchain for will ID: ${blockchainWillId} by user: ${username}`);
        const blockchainDataBuffer = await sdk.send(true, 'GetWillDetails', [String(blockchainWillId), String(username)]);

        if (!blockchainDataBuffer || blockchainDataBuffer.length === 0) {
            const error = new Error(`Service Error: Will with ID ${blockchainWillId} not found on blockchain for user ${username}, or access denied.`);
            error.status = 404; // 리소스 없음 또는 접근 불가
            throw error;
        }

        let blockchainWill;
        try {
            blockchainWill = JSON.parse(blockchainDataBuffer.toString());
            if (blockchainWill && blockchainWill.images === null) {
                console.log(`Service (getWillDetailsService): Correcting null images for will ID ${blockchainWillId} to []`);
                blockchainWill.images = [];
            }
        } catch (parseError) {
            console.error("Service Error: Failed to parse blockchain response:", parseError, "Raw data:", blockchainDataBuffer.toString());
            throw Object.assign(new Error('Service Error: Failed to parse will data from blockchain.'), { status: 500, cause: parseError });
        }

        // 블록체인 데이터에서 핵심 정보 추출 및 추가 유효성 검사 (데이터 무결성 관련)
        const { contentHash: storedTextHash, offChainStorageRef: textDbRecordId, images: imageMetadataArray } = blockchainWill;
        console.log("Service: Extracted imageMetadataArray from blockchainWill.Images:", JSON.stringify(imageMetadataArray, null, 2));

        if (!storedTextHash || !textDbRecordId) {
            console.error("Service Error: Blockchain data missing crucial fields (contentHash or offChainStorageRef):", blockchainWill);
            throw Object.assign(new Error('Service Error: Incomplete will data from blockchain (missing hash or DB ref for text).'), { status: 500 });
        }

        connection = await pool.getConnection(); 

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

        const currentTextHash = calculateHash(decryptedContent);
        if (currentTextHash !== storedTextHash) {
            console.warn(`Service Warning: Text data integrity check FAILED for will ${blockchainWillId}. Stored hash: ${storedTextHash}, Current hash: ${currentTextHash}`);
            throw Object.assign(new Error('Text data integrity check failed. The will content may have been tampered with.'), { status: 409 }); // 충돌 상태
        }
        console.log(`Service: Text data integrity check passed for will ${blockchainWillId}.`);

        const imageDataUrls = []; 
        console.log("Service: Checking if imageMetadataArray is valid and has length > 0. Is valid?", !!imageMetadataArray, "Length:", imageMetadataArray ? imageMetadataArray.length : 'N/A');

        if (imageMetadataArray && imageMetadataArray.length > 0) {
            for (const imgMeta of imageMetadataArray) {
                const imageDbRefId = imgMeta.imageOffChainRef; 
                const storedImageHash = imgMeta.imageHash;    

                if (!imageDbRefId || !storedImageHash) {
                    console.warn(`Service Warning: Skipping image for will ${blockchainWillId} due to missing imageOffChainRef or imageHash in metadata:`, imgMeta);
                    imageDataUrls.push({ id: imageDbRefId || 'unknown_id', url: null, error: "Missing metadata from blockchain", fileName: imgMeta.fileName || 'Unknown Filename' });
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
                        imageDataUrls.push({ id: imageDbRefId, url: null, error: "Integrity check failed", fileName: imgMeta.fileName });
                    } else {
                        console.log(`Service: Image data integrity check passed for will ${blockchainWillId}, image ref ${imageDbRefId}.`);
                        imageDataUrls.push({
                            id: imageDbRefId,
                            url: `data:${imageMimeType};base64,${imageBuffer.toString('base64')}`,
                            fileName: imgMeta.fileName,
                            originalHash: storedImageHash 
                        });
                    }
                } else {
                    console.warn(`Service Warning: Image data for will ${blockchainWillId} (image ref: ${imageDbRefId}) not found in DB or image_data is null.`);
                    imageDataUrls.push({ id: imageDbRefId, url: null, error: "Not found in DB", fileName: imgMeta.fileName });
                }
            }
        }

        return {
            ...blockchainWill, 
            originalContent: decryptedContent,
            imageDataUrls: imageDataUrls 
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
 * 컨트롤러에서 imageRecordId가 제공되었음을 가정합니다.
 */
async function getWillImageService(imageRecordId) { 

    const query = `SELECT image_data, mime_type, file_name FROM WillImages WHERE id = ?`; 
    const [rows] = await pool.execute(query, [imageRecordId]);

    if (rows.length === 0 || !rows[0].image_data) {
        throw Object.assign(new Error('Image not found in WillImages database for the given record ID.'), { status: 404 });
    }
    return {
        buffer: rows[0].image_data,
        mimeType: rows[0].mime_type,
        fileName: rows[0].file_name 
    };
}

module.exports = {
    getMyWillsService,
    getWillDetailsService,
    getWillImageService
};