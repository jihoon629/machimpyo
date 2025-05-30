// application/rest/routes.js
const express = require('express');
const userinfoController = require('./userinfoController');
const willController = require('./controller');
const ocrController = require('./ocrController');
const router = express.Router();
const multer = require('multer'); // multer 임포트

// Multer 설정
const storage = multer.memoryStorage(); // 파일을 메모리에 저장 (다른 옵션도 가능: diskStorage)
const MAX_IMAGE_COUNT = 5; // 최대 업로드 가능 이미지 수 (예시)
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 파일 크기 제한 (예: 10MB), 선택 사항
});

// --- 유언장 관련 라우트 ---
router.post('/register', willController.registerWill); // 텍스트 전용 유언 등록
router.get('/wills/my-wills', willController.getMyWills); // 내 유언장 목록 조회
router.get('/details/:willId', willController.getWillDetails); // 특정 유언장 상세 조회

// 여러 이미지 업로드를 위해 수정된 라우트
router.post(
    '/register-with-images', // 엔드포인트 이름도 복수형으로 변경하는 것을 권장 (선택 사항)
    upload.array('imageFiles', MAX_IMAGE_COUNT), // 'imageFiles' 필드명으로 최대 MAX_IMAGE_COUNT개의 파일
    willController.registerWillWithImage // 컨트롤러 함수는 동일 (내부에서 req.files 사용)
);

// 이미지 직접 조회를 위한 라우트 (컨트롤러 변경사항에 맞춰 파라미터명 변경 가능)
router.get('/image/:imageRecordId', willController.getWillImage); // 파라미터명 imageRecordId로 변경 권장


// --- OCR 관련 라우트 ---
// OCR은 여전히 단일 파일을 처리한다고 가정
router.post('/ocr/extract-text', upload.single('file'), ocrController.extractText);

// --- 사용자 인증 관련 라우트 ---
router.post('/auth/register', userinfoController.registerUser);
router.post('/auth/login', userinfoController.loginUser);
router.get('/queryByName/:username', userinfoController.getUserRealNameByUsername);


module.exports = router;