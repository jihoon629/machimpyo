const express = require('express');
const multer = require('multer');

const userinfoController = require('./controller/userController');
const getWillController = require('./controller/getWillController');
const registerWillController = require('./controller/registerWillController');
const ocrController = require('./controller/ocrController');
const adminController = require('./controller/adminController');

const router = express.Router();

const storage = multer.memoryStorage();
const MAX_IMAGE_COUNT = 5;
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/wills/my-wills', getWillController.getMyWills);
router.get('/wills/designatedViewers-wills', getWillController.getDesignatedViewersWills);
router.get('/details/:willId', getWillController.getWillDetails);
router.get('/image/:imageRecordId', getWillController.getWillImage);

router.post('/register', registerWillController.registerWill);
router.post('/register-with-images', upload.array('imageFiles', MAX_IMAGE_COUNT), registerWillController.registerWillWithImage);

router.post('/ocr/extract-text', upload.single('file'), ocrController.extractText);

router.post('/auth/register', userinfoController.registerUser);
router.post('/auth/login', userinfoController.loginUser);
router.get('/queryByName/:username', userinfoController.getUserDetailsByUsername);

router.get('/admin/users', adminController.getAllUsers);
router.delete('/admin/users/:username', adminController.deleteUser);

router.get('/admin/wills', adminController.getAllWills);
router.get('/admin/wills/:willId', adminController.getWillDetailById);

router.get('/admin/will-meta', adminController.getAllWillMeta);
router.patch('/will-meta/:id/status', adminController.updateWillMetaStatus);

module.exports = router;
