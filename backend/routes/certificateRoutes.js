const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  getCertificateById,
  downloadCertificatePDF,
  verifyCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyCertificates);
router.get('/verify/:identifier', verifyCertificate);
router.get('/:id/download', protect, downloadCertificatePDF);
router.get('/:id', protect, getCertificateById);

module.exports = router;
