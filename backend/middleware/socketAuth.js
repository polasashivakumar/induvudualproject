const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token ||
      (socket.handshake?.headers?.authorization || '').split(' ')[1];
    if (!token) return next(new Error('Not authorized'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret123');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.data.user = user;
    next();
  } catch (err) {
    console.error('Socket auth error:', err.message);
    next(new Error('Authentication error'));
  }
};
