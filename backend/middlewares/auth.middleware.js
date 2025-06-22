const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const BlacklistToken = require('../models/blacklistToken.model');

module.exports = async (req, res, next) => {
  let token = null;
  // Check for token in cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // If not in cookies, check Authorization header and set cookie if found
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    // Store the token in cookies for future requests
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
  if (!token) {
    console.log('No token found.');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  console.log('Token received:', token);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  // Use BlacklistToken model for blacklist check
  const isBlacklisted = await BlacklistToken.findOne({ token });
  if (isBlacklisted) {
    console.log('Token is blacklisted.');
    return res.status(401).json({ message: 'Token is blacklisted. Please log in again.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    const user = await userModel.findById(decoded._id).select('-password');
    if (!user) {
      console.log('User not found for provided token.');
      return res.status(401).json({ message: 'User not found for provided token.' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
