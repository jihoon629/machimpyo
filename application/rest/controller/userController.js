// application/rest/controller/userController.js
const userService = require('../service/userService'); // 사용자 서비스 모듈 임포트 (경로 수정)

// 회원가입 컨트롤러
async function registerUser(req, res, next) {
    const { username, password, phone, name, birth } = req.body;

    // 컨트롤러: 필수 입력 항목 유효성 검사
    if (!username || !password || !phone || !name || !birth) {
        // 모든 필수 항목을 명시적으로 나열하는 것이 좋습니다.
        const error = new Error('모든 필수 항목(username, password, phone, name, birth)을 입력하세요.');
        error.status = 400;
        return next(error);
    }

    try {
        const result = await userService.registerUserService(username, password, phone, name, birth);
        // 서비스에서 반환된 메시지와 userId 사용 (선택적)
        res.status(201).json({ message: result.message, userId: result.userId });
    } catch (error) {
        // 서비스에서 발생한 에러(status 포함)를 중앙 에러 핸들러로 전달
        console.error(`Controller Error in registerUser: ${error.message}`);
        next(error);
    }
}

// 로그인 컨트롤러
async function loginUser(req, res, next) {
    const { username, password } = req.body;

    // 컨트롤러: 아이디, 비밀번호 유효성 검사
    if (!username || !password) {
        const error = new Error('아이디와 비밀번호를 입력하세요.');
        error.status = 400;
        return next(error);
    }

    try {
        const result = await userService.loginUserService(username, password);
        // 서비스에서 반환된 사용자 정보 포함
        res.json({ message: result.message, user: result.user });
    } catch (error) {
        console.error(`Controller Error in loginUser: ${error.message}`);
        next(error);
    }
}

// 사용자 아이디로 실명 조회 컨트롤러
async function getUserRealNameByUsername(req, res, next) {
    const { username } = req.params; // URL 파라미터에서 username 추출

    // 컨트롤러: username 파라미터 유효성 검사
    if (!username) {
        // 이 경우는 보통 라우트 매칭 시 username이 없으면 해당 라우트가 호출되지 않음.
        // 하지만 명시적으로 방어 코드를 넣을 수 있음.
        const error = new Error('사용자 아이디(username)가 URL 파라미터로 필요합니다.');
        error.status = 400;
        return next(error);
    }

    try {
        const result = await userService.getUserRealNameByUsernameService(username);
        res.json({ realName: result.realName });
    } catch (error) {
        console.error(`Controller Error in getUserRealNameByUsername for username ${username}: ${error.message}`);
        next(error);
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserRealNameByUsername,
};