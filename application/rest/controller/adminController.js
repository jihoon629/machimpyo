const pool = require('../db');
const sdk = require('../sdk'); 
const getWillService = require('../service/getWillService'); // 서비스 파일 임포트

// 관리자 권한 체크 함수
async function isNotAdmin(req) {
    let usernameForCheck;

    // 1. req.user.username 확인 (Passport 등 표준적인 인증 라이브러리 사용 시)
    if (req.user && req.user.username) {
        usernameForCheck = req.user.username;
        console.log(`isNotAdmin: Found username in req.user.username: ${usernameForCheck}`);
    } 
    // 2. req.session.username 확인 (서버 측 세션에 직접 저장한 경우)
    else if (req.session && req.session.username) {
        usernameForCheck = req.session.username;
        console.log(`isNotAdmin: Found username in req.session.username: ${usernameForCheck}`);
    }
    // 3. 커스텀 헤더 'x-user-username' 확인 (클라이언트가 헤더에 직접 실어 보낸 경우)
    else if (req.headers && req.headers['x-user-username']) {
        usernameForCheck = req.headers['x-user-username'];
        console.log(`isNotAdmin: Found username in 'x-user-username' header: ${usernameForCheck}`);
    }
    // 4. 어디에도 사용자 이름 정보가 없는 경우
    else {
        console.warn('isNotAdmin: Username not found in req.user, req.session, or x-user-username header. Assuming not an admin.');
        return true; // 사용자 정보가 없으면 관리자가 아닌 것으로 간주
    }

    console.log(`isNotAdmin: Checking admin status for user: ${usernameForCheck}`);

    try {
        const query = 'SELECT role FROM Users WHERE username = ?';
        const [rows] = await pool.execute(query, [usernameForCheck]);

        if (rows.length === 0) {
            console.warn(`isNotAdmin: User '${usernameForCheck}' not found in database. Assuming not an admin.`);
            return true;
        }

        const userRole = rows[0].role;
        if (userRole === 'admin') {
            console.info(`isNotAdmin: User '${usernameForCheck}' has role '${userRole}'. Returning false (is an admin).`);
            return false; // 관리자이므로 false 반환
        } else {
            console.info(`isNotAdmin: User '${usernameForCheck}' has role '${userRole}'. Returning true (is not an admin).`);
            return true; // 관리자가 아니므로 true 반환
        }
    } catch (error) {
        console.error(`isNotAdmin: Error querying database for user '${usernameForCheck}':`, error);
        return true; // DB 오류 시 안전하게 관리자가 아닌 것으로 처리
    }
}

// ... (getAllUsers, deleteUser, getAllWills, getWillDetailById, updateWillMetaStatus 함수 및 module.exports는 기존 코드 유지) ...
// 전체 사용자 목록 조회
async function getAllUsers(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    try {
        console.log('[👤 사용자 목록 요청]');
        const [rows] = await pool.execute('SELECT * FROM Users');
        console.log(`[사용자 수] ${rows.length}명`);
        res.json(rows);
    } catch (err) {
        console.error('[ getAllUsers 실패]:', err);
        res.status(500).json({ error: '전체 사용자 불러오기 실패' });
    }
}

// 사용자 삭제
async function deleteUser(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'username이 필요합니다.' });

    try {
        console.log(`[사용자 삭제 시도] ${username}`);
        const [result] = await pool.execute('DELETE FROM Users WHERE username = ?', [username]);
        if (result.affectedRows === 0) {
            console.log('[ 사용자 없음]');
            return res.status(404).json({ error: '사용자 없음' });
        }
        console.log('[ 사용자 삭제 성공]');
        res.json({ message: '사용자 삭제 성공' });
    } catch (err) {
        console.error('[ deleteUser 실패]:', err);
        res.status(500).json({ error: '사용자 삭제 실패' });
    }
}

// 전체 유언장 목록 조회
async function getAllWills(req, res) {  
      let logUsername = 'N/A';
    if (req.user && req.user.username) {
        logUsername = req.user.username;
    } else if (req.session && req.session.username) {
        logUsername = req.session.username + " (from session)";
    }
    console.log(`getAllWills called by user: ${logUsername}`);


    

   // 1. 관리자 권한 확인 (isNotAdmin은 비동기 함수이므로 await 사용)
    if (await isNotAdmin(req)) { // isNotAdmin이 true이면 (즉, 관리자가 아니면)
        return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    // 이 지점은 호출자가 외부 DB 기준으로 관리자임이 확인된 상태입니다.

    try {
        console.log('[📜 전체 유언장 목록 조회 요청 (관리자)]');

        // 2. 체인코드 호출을 위한 준비
        const chaincodeFunction = 'GetAllWillsByAdmin';
        const adminChaincodeToken = "admin"; // 체인코드가 첫 번째 인자로 기대하는 토큰
        const chaincodeArgs = [adminChaincodeToken];

        // 3. sdk.send 함수를 사용하여 체인코드 호출
  
        console.log(`Calling chaincode '${chaincodeFunction}' with args: ${JSON.stringify(chaincodeArgs)} using SDK user '${process.env.FABRIC_USER_ID || 'appUser'}'`);
        
        const resultBuffer = await sdk.send(true, chaincodeFunction, chaincodeArgs);

        if (!resultBuffer) {
            // sdk.send에서 오류가 발생하지 않았지만 결과 버퍼가 없는 경우 (예: 체인코드가 빈 버퍼 반환)
            console.warn(`[getAllWills] Chaincode function '${chaincodeFunction}' returned no result or an empty buffer.`);
            return res.status(200).json([]); // 빈 배열 또는 적절한 응답
        }
        
        const allWillsString = resultBuffer.toString('utf8');
        const allWills = JSON.parse(allWillsString);

        console.log(`[전체 유언장 수] ${allWills.length}건`);
        res.json(allWills);

    } catch (error) {
        console.error(`[getAllWills 실패]: ${error.message}`);
        // sdk.send에서 throw한 오류는 이미 status와 message를 가질 수 있음
        const statusCode = error.status || 500;
        const errorMessage = error.message || '전체 유언장 목록 조회 중 서버 오류 발생';
        res.status(statusCode).json({ error: errorMessage });
    }
}

async function getWillDetailById(req, res) {
    let logUsername = 'N/A';
    // ... (기존 사용자 로깅 부분 유지) ...
    if (req.user && req.user.username) {
        logUsername = req.user.username;
    } else if (req.session && req.session.username) {
        logUsername = req.session.username + " (from session)";
    } else if (req.headers && req.headers['x-user-username']){
        logUsername = req.headers['x-user-username'] + " (from X-User-Username header)";
    }
    console.log(`getWillDetailById (admin) called by user: ${logUsername}, for willId (hashed): ${req.params.willId}`);


    if (await isNotAdmin(req)) {
        return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    const { willId } = req.params; // 이 willId는 체인코드에 저장된 해시된 ID여야 함
    if (!willId) {
        return res.status(400).json({ error: 'willId 파라미터(해시된 유언장 ID)가 필요합니다.' });
    }

    try {
        console.log(`[📜 특정 유언장 상세 조회 요청 (관리자)] Hashed ID: ${willId}`);

        // 서비스 계층의 새로운 함수 호출
        const comprehensiveWillDetails = await getWillService.getWillDetailsForAdminService(willId);

        console.log(`[특정 유언장 상세 정보 조회 성공 (관리자)] Hashed ID: ${willId}`);
        res.json(comprehensiveWillDetails);

    } catch (error) {
        console.error(`[getWillDetailById (admin) 실패] Hashed ID: ${willId}: ${error.message || error}`);
        const statusCode = error.status || 500; // 서비스에서 status를 설정해줄 것임
        const errorMessage = error.message || `ID가 ${willId}인 유언장 상세 정보 조회 중 서버 오류 발생`;
        res.status(statusCode).json({ error: errorMessage });
    }
}


// 유언장 상태(사망 여부) 승인/거절 업데이트
async function updateWillMetaStatus(req, res) {

}

module.exports = {
    getAllUsers,
    deleteUser,
    getAllWills,
    getWillDetailById,
    updateWillMetaStatus
};
