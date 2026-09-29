const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllApplications,
  getApplicationDetail,
  approveApplication,
  rejectApplication,
  getApplicationsByMonth,
  getDepartmentStats,
  getStudentDetails
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/auth');

router.use(adminProtect);

router.get('/dashboard', getDashboard);
router.get('/applications', getAllApplications);
router.get('/applications/:id', getApplicationDetail);
router.put('/applications/:id/approve', approveApplication);
router.put('/applications/:id/reject', rejectApplication);
router.get('/reports/monthly', getApplicationsByMonth);
router.get('/reports/department', getDepartmentStats);
router.get('/students/:id', getStudentDetails);

module.exports = router;