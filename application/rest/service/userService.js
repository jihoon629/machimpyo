// application/rest/service/userService.js
const pool = require('../db'); // 데이터베이스 연결 풀 (경로 수정)
const { v4: uuidv4 } = require('uuid'); // 고유 ID 생성을 위한 uuid 라이브러리

/**
 * 사용자 회원가입 서비스
 */
async function registerUserService(userData) {
    const {
        email,
        password,
        phone,
        name,
        birth, // 일반 사용자: 필수, 공증인: 선택 (undefined 가능)
        gender, // 일반 사용자: 필수, 공증인: 선택 (undefined 가능)
        address, // 공통: 필수 또는 선택 (undefined 가능) - 정책에 따라
        role, // 필수
        companyName, // 공증인: 필수, 일반 사용자: 선택 (undefined 가능)
        registrationNumber // 공증인: 필수, 일반 사용자: 선택 (undefined 가능)
    } = userData;

    // userData 객체 및 주요 값들 로깅 (디버깅용)
    console.log('Service received userData for registration:', JSON.stringify(userData, null, 2));
    console.log('Values for DB:', { email, password, phone, name, birth, gender, address, role, companyName, registrationNumber });


    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 이메일 중복 확인
        const [existingByEmail] = await connection.execute('SELECT id FROM Users WHERE email = ?', [email]);
        if (existingByEmail.length > 0) {
            const error = new Error('이미 사용 중인 이메일입니다.');
            error.status = 409;
            throw error;
        }

        // 공증인의 경우 사업자등록번호 중복 확인
        if (role === 'notary' && registrationNumber) {
            const [existingByRegNum] = await connection.execute('SELECT id FROM Users WHERE registration_number = ?', [registrationNumber]);
            if (existingByRegNum.length > 0) {
                const error = new Error('이미 등록된 사업자등록번호입니다.');
                error.status = 409;
                throw error;
            }
        }

        const userId = uuidv4();
        const insertQuery = `
            INSERT INTO Users 
            (id, email, password, phone, name, birth, gender, address, role, company_name, registration_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // params 배열 구성 시 undefined를 null로 명시적 변환
        const params = [
            userId,
            email,
            password, // 해싱 전 평문 비밀번호
            phone || null, // phone도 혹시 undefined일 경우를 대비 (필수라면 컨트롤러에서 검증)
            name,
            birth || null, // birth가 undefined면 null로
            (role === 'user' && gender) ? gender : null, // role이 user이고 gender가 있으면 gender, 아니면 null
            address || null, // address가 undefined면 null로
            role, // role은 필수라고 가정 (컨트롤러에서 검증)
            (role === 'notary' && companyName) ? companyName : null, // role이 notary고 companyName 있으면 companyName, 아니면 null
            (role === 'notary' && registrationNumber) ? registrationNumber : null // role이 notary고 registrationNumber 있으면 registrationNumber, 아니면 null
        ];

        console.log('Parameters for INSERT query:', JSON.stringify(params, null, 2)); // 실제 DB로 전달될 파라미터 확인

        await connection.execute(insertQuery, params);
        await connection.commit();

        return { message: '회원가입 성공', userId: userId, email: email, role: role };

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Service Error in registerUserService:', error.message, error.stack); // 스택 트레이스도 함께 로깅
        if (error.message && error.message.includes('Bind parameters must not contain undefined')) {
             // 이 경우, params 배열 로깅이 도움이 됨
             console.error('Offending params might be:', JSON.stringify(params, null, 2)); // 오류 발생 시의 params 값 재확인
        }
        if (!error.status) {
            const serviceError = new Error('회원가입 처리 중 서버 오류가 발생했습니다.');
            serviceError.status = 500;
            serviceError.cause = error;
            throw serviceError;
        }
        throw error;
    } finally {
        if (connection) connection.release();
    }
}
/**
 * 사용자 로그인 서비스
 */
async function loginUserService(username, password) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, email, name, phone, birth FROM Users WHERE email = ? AND password = ?', // 비밀번호는 제외하고 필요한 정보만 반환
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
 * 사용자 아이디로 실명,전번 조회 서비스
 */
async function getUserDetailsByUsernameService(username) {
    try {
        // SELECT 절에 phone 추가
        const [rows] = await pool.execute(
            'SELECT name, phone FROM Users WHERE email = ?',
            [username]
        );

        if (rows.length === 0) {
            const error = new Error('해당 사용자를 찾을 수 없습니다.');
            error.status = 404; // Not Found
            throw error;
        }
        // 반환 객체에 realName과 phone 모두 포함
        return { realName: rows[0].name, phone: rows[0].phone };
    } catch (error) {
        console.error('Service Error in getUserDetailsByUsernameService:', error); // 함수명 변경
        if (!error.status) {
            const serviceError = new Error('사용자 정보 조회 처리 중 서버 오류가 발생했습니다.'); // 메시지 변경
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
    getUserDetailsByUsernameService,
};