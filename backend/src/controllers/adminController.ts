import { Response } from 'express';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { AuthRequest } from '../middlewares/auth.js';
import { Logger } from '../utils/logger.js';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    Logger.error('Get all users error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    if (userId === adminId) {
      res.status(400).json({ error: 'Cannot ban yourself' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ error: 'Cannot ban another admin' });
      return;
    }

    user.isBanned = true;
    await user.save();

    Logger.info('User banned', { userId, bannedBy: adminId });

    res.status(200).json({ message: 'User banned successfully' });
  } catch (error: any) {
    Logger.error('Ban user error', { error: error.message });
    res.status(500).json({ error: 'Failed to ban user' });
  }
};

export const unbanUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.isBanned = false;
    await user.save();

    Logger.info('User unbanned', { userId, unbannedBy: adminId });

    res.status(200).json({ message: 'User unbanned successfully' });
  } catch (error: any) {
    Logger.error('Unban user error', { error: error.message });
    res.status(500).json({ error: 'Failed to unban user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    if (userId === adminId) {
      res.status(400).json({ error: 'Cannot delete yourself' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ error: 'Cannot delete another admin' });
      return;
    }

    await Room.updateMany(
      { users: userId },
      { $pull: { users: userId } }
    );

    await Room.deleteMany({ createdBy: userId, users: { $size: 0 } });

    await Message.deleteMany({ user: userId });

    await User.findByIdAndDelete(userId);

    Logger.info('User deleted', { userId, deletedBy: adminId });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    Logger.error('Delete user error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getAllRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const rooms = await Room.find(query)
      .populate('createdBy', 'username email avatar')
      .populate('users', 'username email avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Room.countDocuments(query);

    res.status(200).json({
      rooms,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    Logger.error('Get all rooms error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const adminId = req.user?.userId;

    const room = await Room.findById(roomId);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    await Message.deleteMany({ room: roomId });

    await Room.findByIdAndDelete(roomId);

    Logger.info('Room deleted by admin', { roomId, deletedBy: adminId });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error: any) {
    Logger.error('Delete room error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

export const getRoomMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ room: roomId })
      .populate('user', 'username email avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ timestamp: -1 });

    const total = await Message.countDocuments({ room: roomId });

    res.status(200).json({
      messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    Logger.error('Get room messages error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalRooms = await Room.countDocuments();
    const totalMessages = await Message.countDocuments();

    const recentUsers = await User.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRooms = await Room.find()
      .populate('createdBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      stats: {
        totalUsers,
        bannedUsers,
        activeUsers: totalUsers - bannedUsers,
        totalRooms,
        totalMessages,
      },
      recentUsers,
      recentRooms,
    });
  } catch (error: any) {
    Logger.error('Get stats error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
