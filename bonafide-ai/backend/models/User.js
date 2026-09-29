const mongoose = require('mongoose');
const { isMemoryMode } = require('../store/memoryHelper');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  registerNumber: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1, max: 5 },
  semester: { type: Number, required: true, min: 1, max: 10 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  mobile: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

if (isMemoryMode()) {
  const { getModel } = require('../store/inMemoryStore');
  module.exports = getModel('user');
} else {
  module.exports = mongoose.model('User', userSchema);
}
