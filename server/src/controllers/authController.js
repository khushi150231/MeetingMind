const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const config = require('../config/env');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasCustomApiKey: false,
        hasServerApiKey: Boolean(config.AI_API_KEY)
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +customApiKey');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasCustomApiKey: Boolean(user.customApiKey),
        hasServerApiKey: Boolean(config.AI_API_KEY)
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+customApiKey');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        hasCustomApiKey: Boolean(user.customApiKey),
        // Masked key for security if exists
        customApiKeyMasked: user.customApiKey
          ? `${user.customApiKey.slice(0, 4)}••••••••${user.customApiKey.slice(-4)}`
          : null,
        hasServerApiKey: Boolean(config.AI_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & AI key settings
// @route   PUT /api/auth/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    const { name, customApiKey } = req.body;
    const user = await User.findById(req.user._id).select('+customApiKey');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name.trim();
    if (customApiKey !== undefined) {
      user.customApiKey = customApiKey ? customApiKey.trim() : '';
    }

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasCustomApiKey: Boolean(user.customApiKey),
        customApiKeyMasked: user.customApiKey
          ? `${user.customApiKey.slice(0, 4)}••••••••${user.customApiKey.slice(-4)}`
          : null,
        hasServerApiKey: Boolean(config.AI_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateSettings,
  logoutUser
};
