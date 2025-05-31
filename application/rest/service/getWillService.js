// application/rest/service/getWillService.js

const { decrypt, calculateHash } = require('../utils/encryption'); 
const pool = require('../db'); 
const sdk = require('../sdk'); 
const userService = require('./userService'); // userService 임포트 추가





async function getWillDetailsService(blockchainWillId, username) {
    let connection;
    try {
        console.log(`Service: Fetching details from blockchain for will ID: ${blockchainWillId} by user: ${username}`);

        let viewerIdentityJSONString = "{}";
        try {
            const userDetails = await userService.getUserDetailsByUsernameService(username);
            if (userDetails && userDetails.realName && userDetails.phone) {
                viewerIdentityJSONString = JSON.stringify({
                    name: userDetails.realName,
                    phone: userDetails.phone
                });
                console.log(`Service: Successfully fetched user details for viewerIdentityJSON for username '${username}'.`);
            } else {
                console.warn(`Service: User details (realName or phone) not found or incomplete for username '${username}' via userService. Sending default viewerIdentityJSON.`);
            }
        } catch (userError) {
            console.error(`Service: Error fetching user details from userService for username '${username}': ${userError.message}. Sending default viewerIdentityJSON.`);
        }

        console.log(`Service: Calling chaincode 'GetWillDetails' with WillID: ${blockchainWillId}, Username: ${username}, ViewerIdentity: ${viewerIdentityJSONString}`);
        
        let blockchainDataBuffer;
        try {
            blockchainDataBuffer = await sdk.send(
                true,
                'GetWillDetails',
                [String(blockchainWillId), String(username), viewerIdentityJSONString]
            );
        } catch (chaincodeError) {
            // 체인코드 에러 특별 처리
            if (chaincodeError.message && chaincodeError.message.toLowerCase().includes("access denied")) {
                console.warn(`Service: Access denied by chaincode for will ID ${blockchainWillId}, user ${username}. Message: ${chaincodeError.message}`);
                // 사용자 친화적인 메시지로 변경하여 throw
                const accessDeniedError = new Error(`해당 유언장(ID: ${blockchainWillId})에 접근할 권한이 없습니다. 작성자 본인이거나 지정된 열람자만 내용을 확인할 수 있습니다.`);
                accessDeniedError.status = 403; // 403 Forbidden
                throw accessDeniedError;
            }
            // 그 외 체인코드 에러는 그대로 throw (혹은 좀 더 일반적인 메시지로 변경)
            console.error(`Service: Chaincode error during 'GetWillDetails' for will ID ${blockchainWillId}: ${chaincodeError.stack || chaincodeError}`);
            const serviceError = new Error(`블록체인에서 유언장 정보를 가져오는 중 오류가 발생했습니다. (Will ID: ${blockchainWillId})`);
            serviceError.status = 500; // 내부 서버 오류
            serviceError.cause = chaincodeError; // 원인 에러 첨부
            throw serviceError;
        }


        if (!blockchainDataBuffer || blockchainDataBuffer.length === 0) {
            // 이 경우는 체인코드에서 에러 없이 비어있는 응답을 주는 경우 (거의 발생하지 않을 것으로 예상)
            const error = new Error(`Service Error: Will with ID ${blockchainWillId} not found on blockchain for user ${username}, or no data returned.`);
            error.status = 404;
            throw error;
        }

        let blockchainWill;
        try {
            blockchainWill = JSON.parse(blockchainDataBuffer.toString());
            if (blockchainWill && blockchainWill.images === null) {
                blockchainWill.images = [];
            }
            if (blockchainWill && blockchainWill.designatedViewers === null) {
                blockchainWill.designatedViewers = [];
            }
        } catch (parseError) {
            console.error("Service Error: Failed to parse blockchain response:", parseError, "Raw data:", blockchainDataBuffer.toString());
            throw Object.assign(new Error('Service Error: Failed to parse will data from blockchain.'), { status: 500, cause: parseError });
        }

        const { contentHash: storedTextHash, offChainStorageRef: textDbRecordId, images: imageMetadataArray } = blockchainWill;
        if (!storedTextHash || !textDbRecordId) {
            console.error("Service Error: Blockchain data missing crucial fields (contentHash or offChainStorageRef):", blockchainWill);
            throw Object.assign(new Error('Service Error: Incomplete will data from blockchain (missing hash or DB ref for text).'), { status: 500 });
        }

        connection = await pool.getConnection();
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
            throw Object.assign(new Error('유언장 원본 내용의 무결성 검증에 실패했습니다. 내용이 변경되었을 수 있습니다.'), { status: 409 });
        }
        console.log(`Service: Text data integrity check passed for will ${blockchainWillId}.`);

        const imageDataUrls = [];
        if (imageMetadataArray && imageMetadataArray.length > 0) {
            for (const imgMeta of imageMetadataArray) {
                const imageDbRefId = imgMeta.imageOffChainRef;
                const storedImageHash = imgMeta.imageHash;

                if (!imageDbRefId || !storedImageHash) {
                    console.warn(`Service: Image metadata missing for will ${blockchainWillId}. ImageOffChainRef: ${imageDbRefId}, ImageHash: ${storedImageHash}`);
                    imageDataUrls.push({ id: imageDbRefId || 'unknown_id', url: null, error: "Missing metadata from blockchain", fileName: imgMeta.fileName || 'Unknown Filename' });
                    continue;
                }
                const selectImageQuery = `SELECT image_data, mime_type FROM WillImages WHERE id = ?`;
                const [imageRows] = await connection.execute(selectImageQuery, [imageDbRefId]);

                if (imageRows.length > 0 && imageRows[0].image_data) {
                    const imageBuffer = imageRows[0].image_data;
                    const imageMimeType = imageRows[0].mime_type;
                    const currentImageHash = calculateHash(imageBuffer);
                    if (currentImageHash !== storedImageHash) {
                        console.warn(`Service Warning: Image data integrity check FAILED for will ${blockchainWillId}, image ref ${imageDbRefId}. Stored hash: ${storedImageHash}, Current hash: ${currentImageHash}`);
                        imageDataUrls.push({ id: imageDbRefId, url: null, error: "이미지 무결성 검증 실패", fileName: imgMeta.fileName });
                    } else {
                        imageDataUrls.push({
                            id: imageDbRefId,
                            url: `data:${imageMimeType};base64,${imageBuffer.toString('base64')}`,
                            fileName: imgMeta.fileName,
                            originalHash: storedImageHash
                        });
                    }
                } else {
                    console.warn(`Service Warning: Image data not found in DB for will ${blockchainWillId}, image ref ${imageDbRefId}.`);
                    imageDataUrls.push({ id: imageDbRefId, url: null, error: "이미지 없음 (DB)", fileName: imgMeta.fileName });
                }
            }
        }
        return {
            ...blockchainWill,
            originalContent: decryptedContent,
            imageDataUrls: imageDataUrls
        };

    } catch (error) {
        // 이미 사용자 친화적인 메시지와 status가 설정된 경우 그대로 throw
        if (error.status) {
            console.error(`Service Error (propagating with status ${error.status}) in getWillDetailsService for ID ${blockchainWillId}, user ${username}: ${error.message}`);
            throw error;
        }
        // 그 외 일반적인 내부 오류 처리
        console.error(`Service Error (internal) in getWillDetailsService for ID ${blockchainWillId}, user ${username}:`, error.stack || error);
        const internalError = new Error('유언장 정보를 조회하는 중 서버 내부 오류가 발생했습니다.');
        internalError.status = 500;
        throw internalError;
    } finally {
        if (connection) connection.release();
    }
}

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


// 내가 지정 열람자로 등록된 유언장 목록 조회 서비스
async function getWillsViewableByUserService(username) {
    console.log(`Service: Fetching wills viewable by user '${username}'`);
    if (!username) {
        const error = new Error("사용자 이름(username)이 필요합니다.");
        error.status = 400;
        throw error;
    }

    let viewerIdentityJSONString = "{}";
    try {
        // userService를 사용하여 사용자의 이름과 전화번호 조회
        const userDetails = await userService.getUserDetailsByUsernameService(username);
        if (userDetails && userDetails.realName && userDetails.phone) {
            viewerIdentityJSONString = JSON.stringify({
                name: userDetails.realName,
                phone: userDetails.phone
            });
            console.log(`Service: Successfully fetched user details for viewerIdentityJSON for username '${username}'.`);
        } else {
            // 이 경우, 사용자는 존재하나 이름/전화번호가 없거나 불완전.
            // 지정 열람자로서 유언장을 조회하려면 이름과 전화번호가 모두 필요하므로,
            // 이 경우 조회 가능한 유언장이 없을 가능성이 높습니다.
            // 체인코드에서 viewerIdentityJSON의 name, phone 필드가 비어있으면 에러를 반환하므로
            // 여기서 적절히 처리하거나, 빈 목록을 반환하도록 할 수 있습니다.
            console.warn(`Service: User details (realName or phone) not found or incomplete for username '${username}'. Cannot effectively query for viewable wills.`);
            // 빈 배열을 반환하거나, 특정 에러를 던질 수 있습니다. 여기서는 빈 배열을 반환하도록 처리합니다.
            // 혹은, 에러를 던져서 사용자에게 프로필 정보를 업데이트하도록 유도할 수도 있습니다.
            // 예: const error = new Error("지정 열람자 조회를 위해 사용자의 이름과 전화번호 정보가 필요합니다. 프로필을 확인해주세요.");
            // error.status = 400; throw error;
            return []; // 이름 또는 전화번호가 없으면 조회 가능한 유언장이 없다고 간주
        }
    } catch (userError) {
        // userService에서 사용자를 찾지 못한 경우 (404) 등
        console.error(`Service: Error fetching user details from userService for username '${username}': ${userError.message}.`);
        if (userError.status === 404) {
            const error = new Error(`사용자 '${username}'을(를) 찾을 수 없습니다.`);
            error.status = 404;
            throw error;
        }
        // 그 외 userService 에러
        const serviceError = new Error("사용자 정보를 가져오는 중 오류가 발생했습니다.");
        serviceError.status = userError.status || 500;
        serviceError.cause = userError;
        throw serviceError;
    }

    try {
        console.log(`Service: Calling chaincode 'GetWillsViewableByMe' with ViewerIdentity: ${viewerIdentityJSONString}`);
        const blockchainDataBuffer = await sdk.send(
            true, // query (read-only)
            'GetWillsViewableByMe', // 체인코드 함수 이름
            [viewerIdentityJSONString]    // 파라미터
        );

        if (!blockchainDataBuffer || blockchainDataBuffer.length === 0) {
            // 체인코드에서 정상적으로 빈 목록을 반환하는 경우 [] 바이트 배열이 올 수 있음
            console.log(`Service: No wills found viewable by user '${username}' or chaincode returned empty data.`);
            return []; // 빈 배열 반환
        }

        const viewableWills = JSON.parse(blockchainDataBuffer.toString());
        console.log(`Service: Successfully fetched ${viewableWills.length} wills viewable by user '${username}'.`);
        return viewableWills;

    } catch (chaincodeError) {
        console.error(`Service: Chaincode error during 'GetWillsViewableByMe' for user '${username}': ${chaincodeError.stack || chaincodeError}`);
        // 체인코드에서 발생한 특정 에러 메시지(예: viewerIdentityJSON 파싱 실패 등)를 클라이언트에게 전달할지,
        // 아니면 일반적인 메시지로 감쌀지 결정할 수 있습니다.
        // 여기서는 체인코드 에러를 좀 더 일반적인 메시지로 감쌉니다.
        const serviceError = new Error(`지정 열람자 유언장 목록을 블록체인에서 가져오는 중 오류가 발생했습니다.`);
        serviceError.status = 500; // 체인코드 에러는 일반적으로 500으로 처리
        serviceError.cause = chaincodeError;
        throw serviceError;
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
    getWillImageService,
    getWillsViewableByUserService
};