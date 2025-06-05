const express = require('express');
const multer = require('multer');

const userinfoController = require('./controller/userController');
const getWillController = require('./controller/getWillController');
const registerWillController = require('./controller/registerWillController');
const ocrController = require('./controller/ocrController');
const adminController = require('./controller/adminController');
const mypageController =require('./controller/mypageController');
const router = express.Router();

const storage = multer.memoryStorage();
const MAX_IMAGE_COUNT = 5;
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
// --- 유언장 조회관련 라우트 ---
router.get('/wills/my-wills', getWillController.getMyWills);// 내 유언장 목록 조회
router.get('/wills/designatedViewers-wills', getWillController.getDesignatedViewersWills); // 볼수있는 유언장 목록 조회
router.get('/details/:willId', getWillController.getWillDetails); // 특정 유언장 상세 조회
router.get('/image/:imageRecordId', getWillController.getWillImage);  //  이미지 직접 조회를 위한 라우트


router.post('/register', registerWillController.registerWill);// 텍스트 전용 유언 등록
router.post('/register-with-images', upload.array('imageFiles', MAX_IMAGE_COUNT), registerWillController.registerWillWithImage); //이미지 유언장등록

router.post('/ocr/extract-text', upload.single('file'), ocrController.extractText); //ocr

router.post('/auth/register', userinfoController.registerUser); //회원가입
router.post('/auth/login', userinfoController.loginUser); //로그인
router.get('/queryByName/:username', userinfoController.getUserDetailsByUsername); //이름이랑 전번찾기

router.get('/admin/users', adminController.getAllUsers); /// 전체 사용자 목록 조회
router.delete('/admin/users/:username', adminController.deleteUser); // 유저 삭제

router.get('/admin/wills', adminController.getAllWills); //전체 유언장 목록 조회
router.get('/admin/wills/:willId', adminController.getWillDetailById); // 특정 유언장 상세 조회
router.get('/mypage/status-counts/:username', mypageController.getMyWillStatusCounts);
router.get('/kkk/:username',mypageController.getUserProfile);
// router.patch('/will-meta/:id/status', adminController.updateWillMetaStatus); // 유언장 상태(사망 여부) 승인/거절 업데이트

module.exports = router;
