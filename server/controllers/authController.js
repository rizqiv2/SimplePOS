const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const auditLog = require('../utils/auditLogger');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({ username, email, password, role: role || 'cashier' });
    const token = generateToken(user.id);

    await auditLog(user.id, 'REGISTER', 'User', user.id, { username: user.username, email: user.email, role: user.role }, req);

    res.status(201).json({
      success: true,
      data: {
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id);

    await auditLog(user.id, 'LOGIN', 'User', user.id, { username: user.username }, req);

    res.status(200).json({
      success: true,
      data: {
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      },
      message: 'Logged in successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};