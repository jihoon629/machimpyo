const notaryService = require('../service/notaryService'); // 공증인 정보 서비스 (생성 예정)

/**
 * 공증인 자신의 상세 정보를 생성하거나 업데이트합니다.
 * 요청 본문(req.body)에는 company_phone, consultation_phone,
 * phone_consultation_fee, visit_consultation_fee, tags (배열), description 등이 포함됩니다.
 */
async function upsertOwnNotaryDetails(req, res) {
    // 인증된 사용자, 특히 공증인인지 확인하는 미들웨어가 먼저 실행되었다고 가정 (예: isNotary)
    // req.user.id 또는 req.session.userId 등을 통해 현재 로그인한 공증인의 ID를 가져옵니다.
    const userId = req.user?.id || req.session?.userId;

    if (!userId) {
        return res.status(401).json({ error: '인증되지 않은 사용자입니다. 먼저 로그인해주세요.' });
    }

    const detailsData = {
        company_phone: req.body.company_phone,
        consultation_phone: req.body.consultation_phone,
        phone_consultation_fee: req.body.phone_consultation_fee,
        visit_consultation_fee: req.body.visit_consultation_fee,
        tags: req.body.tags, // 프론트에서 배열 형태로 전달 ['태그1', '태그2']
        description: req.body.description,
    };

    // 필수 필드 기본 유효성 검사 (더 구체적인 검사는 서비스 계층 또는 별도 유효성 검사기 사용)
    if (!detailsData.description || !detailsData.tags) {
        // 예시: 상세소개와 태그는 필수라고 가정
        // return res.status(400).json({ error: '상세 소개와 태그는 필수 입력 항목입니다.' });
    }
    if (detailsData.tags && !Array.isArray(detailsData.tags)) {
        return res.status(400).json({ error: '태그는 배열 형태여야 합니다.' });
    }

    try {
        console.log(`[공증인 정보 저장/업데이트 요청] 사용자 ID: ${userId}, 데이터:`, detailsData);
        const result = await notaryService.upsertNotaryDetailsByUserId(userId, detailsData);
        res.status(200).json({ message: '공증인 정보가 성공적으로 저장/업데이트되었습니다.', data: result });
    } catch (error) {
        console.error(`[upsertOwnNotaryDetails 실패] 사용자 ID: ${userId}:`, error.message, error.stack);
        const statusCode = error.status || 500;
        res.status(statusCode).json({ error: error.message || '공증인 정보 처리 중 서버 오류 발생' });
    }
}
async function getPublicNotaryDetailsById(req, res) {
    const { userId } = req.params; // URL에서 공증인의 Users.id 가져오기

    if (!userId) {
        return res.status(400).json({ error: '조회할 공증인의 ID가 필요합니다.' });
    }

    try {
        console.log(`[공개용 공증인 정보 조회 요청] 공증인 Users ID: ${userId}`);
        // 이 서비스 함수는 NotaryDetails와 Users 테이블을 조인하여 필요한 공증인 공개 정보를 함께 반환
        const notaryProfile = await notaryService.getPublicNotaryProfileByUserId(userId);

        if (!notaryProfile) {
            // 정보가 없는 공증인 ID를 요청한 경우 404
            return res.status(404).json({ error: `ID가 ${userId}인 공증인 정보를 찾을 수 없습니다.` });
        }
        res.status(200).json(notaryProfile); // 조회된 공증인 프로필 정보 반환
    } catch (error) {
        console.error(`[getPublicNotaryDetailsById 실패] 공증인 Users ID: ${userId}:`, error.message, error.stack);
        const statusCode = error.status || 500;
        res.status(statusCode).json({ error: error.message || '공증인 정보 조회 중 서버 오류 발생' });
    }
}
module.exports = {
    upsertOwnNotaryDetails,
    getPublicNotaryDetailsById
};