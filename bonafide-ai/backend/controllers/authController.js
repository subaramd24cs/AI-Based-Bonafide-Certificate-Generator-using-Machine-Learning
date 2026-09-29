const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const register = async (req, res) => {
  try {
    const { name, registerNumber, department, course, year, semester, email, mobile, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { registerNumber }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      registerNumber,
      department,
      course,
      year,
      semester,
      email,
      mobile,
      password: hashedPassword,
      role: 'student'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      registerNumber: user.registerNumber,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      registerNumber: user.registerNumber,
      email: user.email,
      role: user.role,
      department: user.department,
      course: user.course,
      year: user.year,
      semester: user.semester,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, year, semester } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.mobile = mobile || user.mobile;
      user.year = year || user.year;
      user.semester = semester || user.semester;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        registerNumber: updatedUser.registerNumber,
        email: updatedUser.email,
        department: updatedUser.department,
        course: updatedUser.course,
        year: updatedUser.year,
        semester: updatedUser.semester,
        mobile: updatedUser.mobile,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };