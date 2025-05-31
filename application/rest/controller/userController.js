// application/rest/userinfoController.js
const pool = require('../db'); // 데이터베이스 연결 풀 가져오기 (db.js)
const { v4: uuidv4 } = require('uuid'); // 고유 ID 생성을 위한 uuid 라이브러리
const userService = require('../service/userService'); // 사용자 서비스 모듈 임포트



// 회원가입
async function registerUser(req, res) {
    const { username, password, phone, name, birth } = req.body;

    if (!username || !password || !phone || !name || !birth) {
        return res.status(400).json({ error: '모든 필수 항목을 입력하세요.' });
    }

    try {
        const [existing] = await pool.execute('SELECT * FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ error: '이미 존재하는 사용자입니다.' });
        }

        const insertQuery = 'INSERT INTO Users (id, username, password, phone, name, birth) VALUES (?, ?, ?, ?, ?, ?)';
        await pool.execute(insertQuery, [uuidv4(), username, password, phone, name, birth]);

        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ error: '서버 오류' });
    }
}


// ---------- 로그인 ----------
async function loginUser(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요.' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM Users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: '로그인 정보가 일치하지 않습니다.' });
        }

        res.json({ message: '로그인 성공', user: rows[0] });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ error: '서버 오류' });
    }
}


// 사용자 아이디로 사용자 상세 정보(실명 및 전화번호) 조회 컨트롤러
// 함수 이름을 getUserDetailsByUsername로 변경
async function getUserDetailsByUsername(req, res, next) {
    const { username } = req.params; // URL 파라미터에서 username 추출

    // 컨트롤러: username 파라미터 유효성 검사
    if (!username) {
        const error = new Error('사용자 아이디(username)가 URL 파라미터로 필요합니다.');
        error.status = 400;
        return next(error); // 에러 핸들러로 전달
    }

    try {
        // 변경된 서비스 함수 호출
        const userDetails = await userService.getUserDetailsByUsernameService(username);
        
        // 클라이언트에 realName과 phone 모두 전달 (서비스에서 반환하는 형식에 맞춤)
        res.json({ realName: userDetails.realName, phone: userDetails.phone });
    } catch (error) {
        // 서비스에서 발생한 에러(status 포함)를 중앙 에러 핸들러로 전달
        console.error(`Controller Error in getUserDetailsByUsername for username ${username}: ${error.message}`); // 함수명 변경
        next(error);
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserDetailsByUsername, // export 이름 변경
};