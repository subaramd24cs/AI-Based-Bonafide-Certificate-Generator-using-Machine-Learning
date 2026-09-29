const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { predictEligibility } = require('../services/mlService');

const createApplication = async (req, res) => {
  try {
    const {
      attendance,
      cgpa,
      feeStatus,
      previousBonafideCount,
      academicStatus,
      previousApplicationStatus,
      disciplinaryStatus,
      purpose
    } = req.body;

    const applicationPayload = {
      attendance: Number(attendance),
      cgpa: Number(cgpa || 7.5),
      feeStatus: feeStatus || 'Paid',
      semester: req.user.semester,
      academicStatus: academicStatus || 'Good',
      previousBonafideCount: Number(previousBonafideCount || 0),
      purpose: purpose || 'Scholarship',
      previousApplicationStatus: previousApplicationStatus || 'Approved',
      disciplinaryStatus: disciplinaryStatus || 'Clear',
      course: req.user.course,
      department: req.user.department
    };

    // Trigger Keras ML prediction via FastAPI
    const mlResult = await predictEligibility(applicationPayload);

    const application = await Application.create({
      studentId: req.user._id,
      studentName: req.user.name,
      registerNumber: req.user.registerNumber,
      department: req.user.department,
      course: req.user.course,
      year: req.user.year,
      semester: req.user.semester,
      attendance: Number(attendance),
      cgpa: Number(cgpa || 7.5),
      feeStatus: feeStatus || 'Paid',
      previousBonafideCount: Number(previousBonafideCount || 0),
      academicStatus: academicStatus || 'Good',
      previousApplicationStatus: previousApplicationStatus || 'Approved',
      disciplinaryStatus: disciplinaryStatus || 'Clear',
      purpose,
      mlPrediction: mlResult.prediction,
      mlConfidence: mlResult.confidence,
      adminStatus: 'pending'
    });

    await Notification.create({
      userId: req.user._id,
      message: `Your application ${application.applicationId} has been submitted successfully with AI recommendation: ${mlResult.prediction}.`,
      type: 'application_submitted'
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.documentPath = req.file.path;
    await application.save();

    res.json({ message: 'Document uploaded successfully', documentPath: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createApplication, getMyApplications, getApplicationById, uploadDocument };