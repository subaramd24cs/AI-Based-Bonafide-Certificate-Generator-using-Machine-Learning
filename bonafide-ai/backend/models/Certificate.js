const mongoose = require('mongoose');
const { isMemoryMode } = require('../store/memoryHelper');

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  certificatePath: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  verificationStatus: { type: String, enum: ['valid', 'revoked', 'expired'], default: 'valid' }
}, { timestamps: true });

if (isMemoryMode()) {
  const { getModel } = require('../store/inMemoryStore');
  module.exports = getModel('certificate');
} else {
  certificateSchema.pre('save', async function(next) {
    if (!this.certificateId) {
      const year = new Date().getFullYear();
      const count = await mongoose.model('Certificate').countDocuments();
      this.certificateId = `CERT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
  });
  module.exports = mongoose.model('Certificate', certificateSchema);
}
