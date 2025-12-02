import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import User from '../models/User.js';

export const checkBanned = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);

    if (user && user.isBanned) {
      res.status(403).json({ error: 'Your account has been banned' });
      return;
    }

    next();
  } catch (error) {
    next();
  }
};
