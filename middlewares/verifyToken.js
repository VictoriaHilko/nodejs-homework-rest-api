const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { Types } = require('mongoose');
const { jwtSecret } = require('../configs/serverConfig');


const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token not provided');
    }

    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findOne({ _id: new Types.ObjectId(decoded.userId), token: token });

    if (!user) {
      res.status(401).json({ message: 'Not authorized' });
      throw new Error('User not found');
      
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    console.error(error);

    // Check if the error is due to token expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = { verifyToken };
