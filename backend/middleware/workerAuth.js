import jwt from 'jsonwebtoken';
import Worker from '../models/Worker.js';
import User from '../models/User.js';

export const protectWorker = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let worker = await Worker.findById(decoded.id).select('-password');
      if (!worker) {
        worker = await User.findById(decoded.id).select('-password');
      }

      if (!worker || worker.role !== 'worker') {
        return res.status(401).json({ message: 'Not authorized, worker not found' });
      }

      req.user = worker;
      next();
    } catch (error) {
      console.error('Worker auth error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
