const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getDashboard = async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ adminStatus: 'pending' });
    const approved = await Application.countDocuments({ adminStatus: 'approved' });
    const rejected = await Application.countDocuments({ adminStatus: 'rejected' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      total,
      pending,
      approved,
      rejected,
      totalStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.adminStatus = status;
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      applications,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getApplicationDetail = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('studentId', 'name email mobile');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.adminStatus = 'approved';
    application.adminRemarks = req.body.remarks || 'Approved';
    await application.save();

    await Notification.create({
      userId: application.studentId,
      message: `Your application ${application.applicationId} has been approved.`,
      type: 'application_approved'
    });

    res.json({ message: 'Application approved successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.adminStatus = 'rejected';
    application.adminRemarks = req.body.remarks || 'Rejected';
    await application.save();

    await Notification.create({
      userId: application.studentId,
      message: `Your application ${application.applicationId} has been rejected. Reason: ${application.adminRemarks}`,
      type: 'application_rejected'
    });

    res.json({ message: 'Application rejected', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getApplicationsByMonth = async (req, res) => {
  try {
    const result = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = result.map(item => ({
      month: months[item._id.month - 1],
      year: item._id.year,
      count: item.count
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDepartmentStats = async (req, res) => {
  try {
    const result = await Application.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const stats = result.map(item => ({
      department: item._id,
      count: item.count
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const applications = await Application.find({ studentId: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ student, applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboard,
  getAllApplications,
  getApplicationDetail,
  approveApplication,
  rejectApplication,
  getApplicationsByMonth,
  getDepartmentStats,
  getStudentDetails
};