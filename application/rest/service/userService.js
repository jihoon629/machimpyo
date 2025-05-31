// application/rest/service/userService.js
const pool = require('../db'); // 데이터베이스 연결 풀 (경로 수정)
const { v4: uuidv4 } = require('uuid'); // 고유 ID 생성을 위한 uuid 라이브러리

/**
 * 사용자 회원가입 서비스
 */
async function registerUserService(username, password, phone, name, birth) {
    try {
        // 사용자 중복 확인
        const [existing] = await pool.execute('SELECT id FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) {
            const error = new Error('이미 존재하는 사용자입니다.');
            error.status = 409; // Conflict
            throw error;
        }

        // 새 사용자 등록
        const userId = uuidv4();
        const insertQuery = 'INSERT INTO Users (id, username, password, phone, name, birth) VALUES (?, ?, ?, ?, ?, ?)';
        await pool.execute(insertQuery, [userId, username, password, phone, name, birth]);

        return { message: '회원가입 성공', userId: userId };
    } catch (error) {
        console.error('Service Error in registerUserService:', error);
        // 이미 status가 있는 에러는 그대로 throw, 없으면 500으로 설정
        if (!error.status) {
            const serviceError = new Error('회원가입 처리 중 서버 오류가 발생했습니다.');
            serviceError.status = 500;
            serviceError.cause = error;
            throw serviceError;
        }
        throw error;
    }
}

/**
 * 사용자 로그인 서비스
 */
async function loginUserService(username, password) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, username, name, phone, birth FROM Users WHERE username = ? AND password = ?', // 비밀번호는 제외하고 필요한 정보만 반환
            [username, password]
        );

        if (rows.length === 0) {
            const error = new Error('로그인 정보가 일치하지 않습니다.');
            error.status = 401; // Unauthorized
            throw error;
        }
        // rows[0]에는 사용자 ID, 이름 등이 포함됨 (비밀번호 제외)
        return { message: '로그인 성공', user: rows[0] };
    } catch (error) {
        console.error('Service Error in loginUserService:', error);
        if (!error.status) {
            const serviceError = new Error('로그인 처리 중 서버 오류가 발생했습니다.');
            serviceError.status = 500;
            serviceError.cause = error;
            throw serviceError;
        }
        throw error;
    }
}

/**
 * 사용자 아이디로 실명 조회 서비스
 */
async function getUserRealNameByUsernameService(username) {
    try {
        const [rows] = await pool.execute(
            'SELECT name FROM Users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            const error = new Error('해당 사용자를 찾을 수 없습니다.');
            error.status = 404; // Not Found
            throw error;
        }
        return { realName: rows[0].name };
    } catch (error) {
        console.error('Service Error in getUserRealNameByUsernameService:', error);
        if (!error.status) {
            const serviceError = new Error('실명 조회 처리 중 서버 오류가 발생했습니다.');
            serviceError.status = 500;
            serviceError.cause = error;
            throw serviceError;
        }
        throw error;
    }
}

module.exports = {
    registerUserService,
    loginUserService,
    getUserRealNameByUsernameService,
};