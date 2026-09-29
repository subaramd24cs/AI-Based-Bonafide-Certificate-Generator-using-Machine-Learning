const express = require('express');
const router = express.Router();
const {
  generateCertificateFile,
  downloadCertificate,
  verifyCertificate,
  getCertificateByApplication
} = require('../controllers/certificateController');
const { protect, adminProtect } = require('../middleware/auth');

router.post('/generate/:applicationId', adminProtect, generateCertificateFile);
router.get('/:id/download', protect, downloadCertificate);
router.get('/verify/:certificateId', verifyCertificate);
router.get('/application/:applicationId', protect, getCertificateByApplication);

module.exports = router;