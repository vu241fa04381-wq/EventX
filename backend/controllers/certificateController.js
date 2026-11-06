const Certificate = require('../models/Certificate');
const { generateCertificatePDF } = require('../services/certificateService');

// @desc    Get user's certificates
// @route   GET /api/certificates/my
// @access  Private
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('event', 'title startDate endDate category venue image')
      .sort({ issuedDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email college');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Certificate as PDF
// @route   GET /api/certificates/:id/download
// @access  Private
const downloadCertificatePDF = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    // Must be certificate owner or admin/organizer
    if (
      certificate.user.toString() !== req.user._id.toString() &&
      req.user.role === 'student'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to download this certificate.',
      });
    }

    const pdfBuffer = await generateCertificatePDF({
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      eventTitle: certificate.eventTitle,
      eventDate: certificate.eventDate,
      organizerName: certificate.organizerName,
      verificationCode: certificate.verificationCode,
    });

    const safeFilename = `Certificate-${certificate.certificateId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Public verification of certificate
// @route   GET /api/certificates/verify/:identifier
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const certificate = await Certificate.findOne({
      $or: [{ certificateId: identifier }, { verificationCode: identifier }],
    }).populate('event', 'title category startDate venue');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Certificate could not be verified. Invalid ID or Code.',
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      certificate: {
        certificateId: certificate.certificateId,
        recipientName: certificate.recipientName,
        eventTitle: certificate.eventTitle,
        eventDate: certificate.eventDate,
        organizerName: certificate.organizerName,
        issuedDate: certificate.issuedDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCertificates,
  getCertificateById,
  downloadCertificatePDF,
  verifyCertificate,
};
