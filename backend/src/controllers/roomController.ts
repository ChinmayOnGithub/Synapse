import { Response } from 'express';
import Room from '../models/Room.js';
import { AuthRequest } from '../middlewares/auth.js';
import { Logger } from '../utils/logger.js';
import { randomBytes } from 'crypto';

const generateJoinCode = (): string => {
  return randomBytes(3).toString('hex').toUpperCase();
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      res.status(400).json({ error: 'Room name is required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let joinCode = generateJoinCode();
    let existingRoom = await Room.findOne({ joinCode });
    
    while (existingRoom) {
      joinCode = generateJoinCode();
      existingRoom = await Room.findOne({ joinCode });
    }

    const room = new Room({
      name,
      joinCode,
      createdBy: userId,
      users: [userId],
      avatar: avatar || null,
    });

    await room.save();
    await room.populate('createdBy', 'username avatar');

    Logger.info('Room created', { roomId: room._id, joinCode, createdBy: userId });

    res.status(201).json({
      room: {
        id: room._id,
        name: room.name,
        joinCode: room.joinCode,
        createdBy: room.createdBy,
        ownerId: room.createdBy._id || room.createdBy,
        users: room.users,
        avatar: room.avatar,
        canAnyoneShare: room.settings.canAnyoneShare,
        isLocked: room.settings.isLocked,
        createdAt: room.createdAt,
      },
    });
  } catch (error: any) {
    Logger.error('Room creation error', { error: error.message });
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { joinCode } = req.body;
    const userId = req.user?.userId;

    if (!joinCode) {
      res.status(400).json({ error: 'Join code is required' });
      return;
    }

    const room = await Room.findOne({ joinCode: joinCode.toUpperCase() });
    
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.settings.isLocked) {
      res.status(403).json({ error: 'Room is locked' });
      return;
    }

    if (room.users.includes(userId as any)) {
      res.status(400).json({ error: 'Already in this room' });
      return;
    }

    room.users.push(userId as any);
    await room.save();

    await room.populate('createdBy', 'username avatar');
    await room.populate('users', 'username avatar');

    Logger.info('User joined room', { roomId: room._id, userId });

    res.status(200).json({
      room: {
        id: room._id,
        name: room.name,
        joinCode: room.joinCode,
        createdBy: room.createdBy,
        ownerId: room.createdBy._id || room.createdBy,
        users: room.users,
        avatar: room.avatar,
        canAnyoneShare: room.settings.canAnyoneShare,
        isLocked: room.settings.isLocked,
        createdAt: room.createdAt,
      },
    });
  } catch (error: any) {
    Logger.error('Join room error', { error: error.message });
    res.status(500).json({ error: 'Failed to join room' });
  }
};

export const getUserRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const rooms = await Room.find({ users: userId })
      .populate('createdBy', 'username avatar')
      .populate('users', 'username avatar')
      .sort({ createdAt: -1 });

    const formattedRooms = rooms.map(room => ({
      id: room._id,
      name: room.name,
      joinCode: room.joinCode,
      createdBy: room.createdBy,
      ownerId: room.createdBy._id || room.createdBy,
      users: room.users,
      avatar: room.avatar,
      canAnyoneShare: room.settings.canAnyoneShare,
      isLocked: room.settings.isLocked,
      createdAt: room.createdAt,
    }));

    res.status(200).json({ rooms: formattedRooms });
  } catch (error: any) {
    Logger.error('Get user rooms error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const updateRoomSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { canAnyoneShare, isLocked, isAnonymous } = req.body;
    const userId = req.user?.userId;

    const room = await Room.findById(roomId);
    
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only room owner can update settings' });
      return;
    }

    if (typeof canAnyoneShare === 'boolean') {
      room.settings.canAnyoneShare = canAnyoneShare;
    }
    
    if (typeof isLocked === 'boolean') {
      room.settings.isLocked = isLocked;
    }

    if (typeof isAnonymous === 'boolean') {
      room.settings.isAnonymous = isAnonymous;
    }

    await room.save();

    Logger.info('Room settings updated', { roomId, userId });

    res.status(200).json({ settings: room.settings });
  } catch (error: any) {
    Logger.error('Update room settings error', { error: error.message });
    res.status(500).json({ error: 'Failed to update room settings' });
  }
};

export const kickUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId, targetUserId } = req.params;
    const userId = req.user?.userId;

    const room = await Room.findById(roomId);
    
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only room owner can kick users' });
      return;
    }

    if (targetUserId === userId) {
      res.status(400).json({ error: 'Cannot kick yourself' });
      return;
    }

    room.users = room.users.filter(u => u.toString() !== targetUserId);
    await room.save();

    Logger.info('User kicked from room', { roomId, targetUserId, kickedBy: userId });

    res.status(200).json({ message: 'User kicked successfully' });
  } catch (error: any) {
    Logger.error('Kick user error', { error: error.message });
    res.status(500).json({ error: 'Failed to kick user' });
  }
};

export const leaveRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    const room = await Room.findById(roomId);
    
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.createdBy.toString() === userId) {
      res.status(400).json({ error: 'Room owner cannot leave. Delete the room instead.' });
      return;
    }

    room.users = room.users.filter(u => u.toString() !== userId);
    await room.save();

    Logger.info('User left room', { roomId, userId });

    res.status(200).json({ message: 'Left room successfully' });
  } catch (error: any) {
    Logger.error('Leave room error', { error: error.message });
    res.status(500).json({ error: 'Failed to leave room' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    const room = await Room.findById(roomId);
    
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only room owner can delete the room' });
      return;
    }

    await Room.findByIdAndDelete(roomId);

    Logger.info('Room deleted', { roomId, userId });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error: any) {
    Logger.error('Delete room error', { error: error.message });
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

export const archiveRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    const room = await Room.findById(roomId);
    
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'Only room owner can archive the room' });
      return;
    }

    room.isArchived = !room.isArchived;
    await room.save();

    Logger.info('Room archive status toggled', { roomId, userId, isArchived: room.isArchived });

    res.status(200).json({ 
      message: room.isArchived ? 'Room archived successfully' : 'Room unarchived successfully',
      isArchived: room.isArchived 
    });
  } catch (error: any) {
    Logger.error('Archive room error', { error: error.message });
    res.status(500).json({ error: 'Failed to archive room' });
  }
};

export const getRoomDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    const room = await Room.findById(roomId)
      .populate('createdBy', 'username avatar id')
      .populate('users', 'username avatar id');
    
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.users.some(u => u._id.toString() === userId)) {
      res.status(403).json({ error: 'You are not a member of this room' });
      return;
    }

    res.status(200).json({
      room: {
        id: room._id,
        name: room.name,
        joinCode: room.joinCode,
        createdBy: room.createdBy,
        ownerId: room.createdBy._id || room.createdBy,
        users: room.users,
        avatar: room.avatar,
        canAnyoneShare: room.settings.canAnyoneShare,
        isLocked: room.settings.isLocked,
        isAnonymous: room.settings.isAnonymous,
        isArchived: room.isArchived,
        createdAt: room.createdAt,
      },
    });
  } catch (error: any) {
    Logger.error('Get room details error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
};
