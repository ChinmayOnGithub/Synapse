import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import User from '../models/User.js';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
