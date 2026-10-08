import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        req.user = await Worker.findById(decoded.id).select('-password');
      }
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if user is suspended or banned
      if (req.user.status === 'suspended' || req.user.status === 'banned') {
        return res.status(403).json({ message: `Your account is ${req.user.status}. Access is restricted.` });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user?.role} is not authorized to access this route` });
    }
    next();
  };
};
