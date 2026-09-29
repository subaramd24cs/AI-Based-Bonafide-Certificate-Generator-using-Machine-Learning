const mongoose = require('mongoose');
const { isMemoryMode } = require('../store/memoryHelper');

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  registerNumber: { type: String, required: true },
  department: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  attendance: { type: Number, required: true, min: 0, max: 100 },
  cgpa: { type: Number, required: true, min: 0, max: 10, default: 7.5 },
  feeStatus: { type: String, enum: ['Paid', 'Pending'], required: true, default: 'Paid' },
  previousBonafideCount: { type: Number, default: 0, min: 0 },
  academicStatus: { type: String, enum: ['Good', 'Average', 'Poor'], default: 'Good' },
  previousApplicationStatus: { type: String, enum: ['Approved', 'Rejected', 'None'], default: 'Approved' },
  disciplinaryStatus: { type: String, enum: ['Clear', 'Warning'], default: 'Clear' },
  purpose: { type: String, required: true, trim: true },
  documentPath: { type: String },
  mlPrediction: { type: String, enum: ['Approved', 'Rejected', 'pending'], default: 'pending' },
  mlConfidence: { type: Number, default: 0 },
  adminStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminRemarks: { type: String },
  certificateId: { type: String }
}, { timestamps: true });

if (isMemoryMode()) {
  const { getModel } = require('../store/inMemoryStore');
  module.exports = getModel('application');
} else {
  applicationSchema.pre('save', async function(next) {
    if (!this.applicationId) {
      const year = new Date().getFullYear();
      const count = await mongoose.model('Application').countDocuments();
      this.applicationId = `BON-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
  });
  module.exports = mongoose.model('Application', applicationSchema);
}
