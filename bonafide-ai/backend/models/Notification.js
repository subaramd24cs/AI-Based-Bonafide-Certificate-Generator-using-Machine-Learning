const mongoose = require('mongoose');
const { isMemoryMode } = require('../store/memoryHelper');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['application_submitted', 'application_approved', 'application_rejected', 'certificate_generated', 'general'], default: 'general' }
}, { timestamps: true });

if (isMemoryMode()) {
  const { getModel } = require('../store/inMemoryStore');
  module.exports = getModel('notification');
} else {
  module.exports = mongoose.model('Notification', notificationSchema);
}
