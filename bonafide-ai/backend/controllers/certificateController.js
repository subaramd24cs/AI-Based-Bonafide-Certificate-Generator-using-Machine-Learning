const Certificate = require('../models/Certificate');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { generateCertificate } = require('../services/certificateService');
const path = require('path');
const fs = require('fs');

const generateCertificateFile = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.adminStatus !== 'approved') {
      return res.status(400).json({ message: 'Application is not approved' });
    }

    const existingCert = await Certificate.findOne({ applicationId: application._id });
    if (existingCert) {
      return res.status(400).json({ message: 'Certificate already generated', certificate: existingCert });
    }

    const tempCert = new Certificate({
      applicationId: application._id,
      studentId: application.studentId,
      certificatePath: ''
    });
    await tempCert.save();

    const result = await generateCertificate({
      studentName: application.studentName,
      registerNumber: application.registerNumber,
      course: application.course,
      department: application.department,
      year: application.year,
      semester: application.semester,
      purpose: application.purpose
    }, tempCert.certificateId);

    tempCert.certificatePath = result.filePath;
    await tempCert.save();

    await Notification.create({
      userId: application.studentId,
      message: `Your bonafide certificate ${tempCert.certificateId} has been generated and is ready for download.`,
      type: 'certificate_generated'
    });

    res.status(201).json({
      certificateId: tempCert.certificateId,
      downloadUrl: `/api/certificates/${tempCert._id}/download`,
      verificationUrl: result.verificationUrl,
      issueDate: tempCert.issueDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (!fs.existsSync(certificate.certificatePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    res.download(certificate.certificatePath, `${certificate.certificateId}.pdf`);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('applicationId')
      .populate('studentId', 'name registerNumber department course');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found', valid: false });
    }

    res.json({
      valid: certificate.verificationStatus === 'valid',
      certificateId: certificate.certificateId,
      studentName: certificate.studentId.name,
      registerNumber: certificate.studentId.registerNumber,
      department: certificate.studentId.department,
      course: certificate.studentId.course,
      issueDate: certificate.issueDate,
      status: certificate.verificationStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCertificateByApplication = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ applicationId: req.params.applicationId })
      .populate('applicationId');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found for this application' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  generateCertificateFile,
  downloadCertificate,
  verifyCertificate,
  getCertificateByApplication
};