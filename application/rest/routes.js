// application/rest/routes.js
const express = require('express');
const mypageController = require('./controller/mypageController');

const userinfoController = require('./controller/userController');
const getWillController = require('./controller/getWillController');
const registerWillController = require('./controller/registerWillController');
const ocrController = require('./controller/ocrController');

const router = express.Router();
const multer = require('multer'); // multer 임포트

// Multer 설정
const storage = multer.memoryStorage(); // 파일을 메모리에 저장 (다른 옵션도 가능: diskStorage)
const MAX_IMAGE_COUNT = 5; // 최대 업로드 가능 이미지 수 (예시)
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 파일 크기 제한 (예: 10MB), 선택 사항
});

// --- 유언장 조회관련 라우트 ---
router.get('/wills/my-wills', getWillController.getMyWills); // 내 유언장 목록 조회
router.get('/wills/designatedViewers-wills', getWillController.getDesignatedViewersWills); // 볼수있는 유언장 목록 조회

router.get('/details/:willId', getWillController.getWillDetails); // 특정 유언장 상세 조회
router.get('/image/:imageRecordId', getWillController.getWillImage); //  이미지 직접 조회를 위한 라우트



//---유언장 등록 라우트
router.post('/register', registerWillController.registerWill); // 텍스트 전용 유언 등록
router.post(
    '/register-with-images', // 엔드포인트 이름도 복수형으로 변경하는 것을 권장 (선택 사항)
    upload.array('imageFiles', MAX_IMAGE_COUNT), // 'imageFiles' 필드명으로 최대 MAX_IMAGE_COUNT개의 파일
    registerWillController.registerWillWithImage // 컨트롤러 함수는 동일 (내부에서 req.files 사용)
);



// --- OCR 관련 라우트 ---
router.post('/ocr/extract-text', upload.single('file'), ocrController.extractText);

// --- 사용자 인증 관련 라우트 ---
router.post('/auth/register', userinfoController.registerUser);
router.post('/auth/login', userinfoController.loginUser);
router.get('/queryByName/:username', userinfoController.getUserDetailsByUsername);

router.get('/mypage/profile', mypageController.getUserProfile);
router.post('/mypage/update-profile', mypageController.updateUserProfile);
router.post('/mypage/update-profile-extended', mypageController.updateUserProfileExtended);
router.post('/mypage/update-password', mypageController.updateUserPassword);
router.post('/mypage/will-status/register', mypageController.registerWillMeta);
router.get('/mypage/will-status/list', mypageController.listWillMetaByUser);

module.exports = router;