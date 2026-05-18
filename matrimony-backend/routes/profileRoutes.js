const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitForm1, getForm1, getMyFullProfile } = require('../controllers/profileController');
const { uploadPhoto, completePhotoUpload, deletePhoto } = require('../controllers/photoController');
const { submitForm2, getForm2 } = require('../controllers/form2Controller');
const upload = require('../config/multer');

// Form 1 routes
router.post('/form1/submit', authMiddleware, submitForm1);
router.get('/form1', authMiddleware, getForm1);
router.get('/me', authMiddleware, getMyFullProfile);
router.get('/form1/review-status', authMiddleware, require('../controllers/profileController').getForm1ReviewStatus);

// Photo upload routes
router.post('/upload-photo', authMiddleware, upload.single('photo'), uploadPhoto);
router.post('/complete-photos', authMiddleware, completePhotoUpload);
router.delete('/photo/:photoType', authMiddleware, deletePhoto);

// Form 2 routes
router.post('/form2/submit', authMiddleware, submitForm2);
router.get('/form2', authMiddleware, getForm2);

module.exports = router;