const express = require('express');
const multer = require('multer');

const userinfoController = require('./controller/userController');
const getWillController = require('./controller/getWillController');
const registerWillController = require('./controller/registerWillController');
const ocrController = require('./controller/ocrController');
const adminController = require('./controller/adminController');

const router = express.Router();

// 일반 이미지 업로드용 설정
const storage = multer.memoryStorage();
const MAX_IMAGE_COUNT = 5;
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// 증빙자료 업로드용 설정
const proofUpload = multer({ storage: multer.memoryStorage() });

// 유언장 관련
router.get('/wills/my-wills', getWillController.getMyWills);
router.get('/wills/designatedViewers-wills', getWillController.getDesignatedViewersWills);
router.get('/details/:willId', getWillController.getWillDetails);
router.get('/image/:imageRecordId', getWillController.getWillImage);

// 유언장 등록
router.post('/register', registerWillController.registerWill);
router.post('/register-with-images', upload.array('imageFiles', MAX_IMAGE_COUNT), registerWillController.registerWillWithImage);

// OCR
router.post('/ocr/extract-text', upload.single('file'), ocrController.extractText);

// 사용자 인증
router.post('/auth/register', userinfoController.registerUser);
router.post('/auth/login', userinfoController.loginUser);
router.get('/queryByName/:username', userinfoController.getUserDetailsByUsername);

// 관리자 기능
router.get('/admin/users', adminController.getAllUsers);
router.delete('/admin/users/:username', adminController.deleteUser);
router.get('/admin/wills', adminController.getAllWills);
router.get('/admin/wills/:willId', adminController.getWillDetailById);
router.get('/admin/will-meta', adminController.getAllWillMeta);
router.patch('/will-meta/:id/status', adminController.updateWillMetaStatus);

// 증빙자료 제출 및 다운로드 추가 라우트
router.post('/admin/will-meta/upload-proof', proofUpload.single('proofFile'), adminController.uploadDeathProof);
router.get('/admin/will-meta/download-proof/:id', adminController.downloadDeathProof);

module.exports = router; 