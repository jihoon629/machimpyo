const willService = require('../service/registerWillService'); // 서비스 계층 모듈 임포트

// 유언장 등록 처리
async function registerWill(req, res, next) {
    const { title, originalContent, beneficiaries, testatorId } = req.body;

    // 기본적인 입력 값 검증 
    if (!title || !originalContent || !testatorId) {
        // 400 Bad Request 에러 객체 생성
        const error = new Error('Missing required fields: title, originalContent, and testatorId are required.');
        error.status = 400;
        return next(error); // 중앙 에러 핸들러로 전달
    }

    try {
        const result = await willService.registerWillService(title, originalContent, beneficiaries, testatorId);
        res.status(201).json({
            message: 'Will registered successfully.',
            blockchainWillId: result.blockchainWillId,
            dbRecordId: result.dbRecordId
        });
    } catch (error) {
        // service 계층에서 발생한 에러를 중앙 에러 핸들러로 전달
        // 에러 객체에 status 코드가 포함되어 있을 것으로 기대 (service에서 설정)
        console.error(`Controller Error in registerWill: ${error.message}`);
        next(error);
    }
}
// 유언장 등록 처리 (이미지)
async function registerWillWithImage(req, res, next) {
    const { title, originalContent, beneficiaries, testatorId } = req.body;
    const imageFiles = req.files; 

    // 기본적인 텍스트 입력 값 검증
    if (!title || !originalContent || !testatorId) {
        const error = new Error('Missing required text fields: title, originalContent, and testatorId are required.');
        error.status = 400;
        return next(error);
    }

    // 이미지 파일 배열 기본 존재 유무 검증 (controller에서 수행)
    if (!imageFiles || imageFiles.length === 0) {
        const error = new Error('At least one image file is required.');
        error.status = 400;
        return next(error);
    }

    try {
        const result = await willService.registerWillWithImagesService(
            title,
            originalContent,
            beneficiaries, 
            testatorId,
            imageFiles 
        );
        res.status(201).json({ 
            message: 'Will with image(s) registered successfully.',
            blockchainWillId: result.blockchainWillId, 
            dbRecordId: result.dbRecordId             
        });
    } catch (error) {
        console.error(`Controller Error in registerWillWithImage: ${error.message}`);
        next(error);
    }
}


module.exports = {
    registerWill,
    registerWillWithImage, // 이름은 그대로, 내부 호출만 변경
};