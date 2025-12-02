import { Request, Response } from 'express';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { Logger } from '../utils/logger.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      avatar: avatar || null,
    });

    const accessToken = generateAccessToken({ userId: user._id.toString(), username: user.username });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), username: user.username });

    user.refreshToken = refreshToken;
    await user.save();

    Logger.info('User registered', { userId: user._id, username: user.username });

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        isGoogleUser: user.isGoogleUser,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    Logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ error: 'Your account has been banned' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken({ userId: user._id.toString(), username: user.username });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), username: user.username });

    user.refreshToken = refreshToken;
    await user.save();

    Logger.info('User logged in', { userId: user._id, username: user.username });

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        isGoogleUser: user.isGoogleUser,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    Logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken({ userId: user._id.toString(), username: user.username });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error: any) {
    Logger.error('Token refresh error', { error: error.message });
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'Google credential is required' });
      return;
    }

    // Decode the JWT token from Google (without verification for now)
    // In production, you should verify this with Google's API
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      res.status(400).json({ error: 'Invalid Google credential' });
      return;
    }

    // Check if user exists by email (link accounts)
    let user = await User.findOne({ email });

    if (user) {
      // User exists, check if banned
      if (user.isBanned) {
        res.status(403).json({ error: 'Your account has been banned' });
        return;
      }

      // Update Google info if not already set
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        user.googleId = googleId;
        // Only update avatar if user doesn't have one
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
        Logger.info('Linked Google account to existing user', { userId: user._id, username: user.username });
      }
    } else {
      // Create new user with Google
      const username = name || email.split('@')[0];
      let finalUsername = username;
      
      // Ensure unique username
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      user = await User.create({
        username: finalUsername,
        email,
        password: Math.random().toString(36).slice(-12), // Random password for Google users
        avatar: picture || null,
        isGoogleUser: true,
        googleId: googleId,
      });

      Logger.info('User registered via Google', { userId: user._id, username: user.username });
    }

    const accessToken = generateAccessToken({ userId: user._id.toString(), username: user.username });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), username: user.username });

    user.refreshToken = refreshToken;
    await user.save();

    Logger.info('User logged in via Google', { userId: user._id, username: user.username });

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        isGoogleUser: user.isGoogleUser,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    Logger.error('Google auth error', { error: error.message });
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch {
    res.status(200).json({ message: 'Logged out successfully' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { username, email, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        res.status(400).json({ error: 'Username already taken' });
        return;
      }
      user.username = username;
    }

    // Check if email is taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        res.status(400).json({ error: 'Email already taken' });
        return;
      }
      user.email = email;
    }

    // Update avatar if provided
    if (avatar !== undefined) {
      user.avatar = avatar || null;
    }

    await user.save();

    Logger.info('Profile updated', { userId: user._id, username: user.username });

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        isGoogleUser: user.isGoogleUser,
      },
    });
  } catch (error: any) {
    Logger.error('Profile update error', { error: error.message });
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    Logger.info('Password changed', { userId: user._id, username: user.username });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    Logger.error('Password change error', { error: error.message });
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const setPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ error: 'New password is required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Only allow Google users to set password
    if (!user.isGoogleUser) {
      res.status(400).json({ error: 'This endpoint is only for Google users' });
      return;
    }

    user.password = newPassword;
    await user.save();

    Logger.info('Password set for Google user', { userId: user._id, username: user.username });

    res.status(200).json({ message: 'Password set successfully. You can now login with email and password.' });
  } catch (error: any) {
    Logger.error('Set password error', { error: error.message });
    res.status(500).json({ error: 'Failed to set password' });
  }
};
