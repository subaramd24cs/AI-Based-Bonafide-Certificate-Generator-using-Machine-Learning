const express = require('express');
const router = express.Router();
const { createApplication, getMyApplications, getApplicationById, uploadDocument } = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, createApplication);
router.get('/', protect, getMyApplications);
router.get('/:id', protect, getApplicationById);
router.post('/:id/document', protect, upload.single('document'), uploadDocument);

module.exports = router;