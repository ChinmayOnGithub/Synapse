import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import client from 'prom-client';
import { config } from './config/env.js';
import { connectDB } from './config/database.js';
import { healthCheck } from './controllers/healthController.js';
import { WebSocketController } from './controllers/websocketController.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticate } from './middlewares/auth.js';
import { checkBanned } from './middlewares/checkBanned.js';
import { requireAdmin } from './middlewares/admin.js';
import { Logger } from './utils/logger.js';
import * as authController from './controllers/authController.js';
import * as roomController from './controllers/roomController.js';
import * as adminController from './controllers/adminController.js';

const app = express();

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.get('/healthz', healthCheck);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/google', authController.googleAuth);
app.post('/api/auth/refresh', authController.refreshToken);
app.post('/api/auth/logout', authController.logout);
app.put('/api/auth/profile', authenticate, authController.updateProfile);
app.put('/api/auth/password', authenticate, authController.changePassword);
app.post('/api/auth/set-password', authenticate, authController.setPassword);

app.post('/api/rooms', authenticate, checkBanned, roomController.createRoom);
app.post('/api/rooms/join', authenticate, checkBanned, roomController.joinRoom);
app.get('/api/rooms', authenticate, checkBanned, roomController.getUserRooms);
app.get('/api/rooms/:roomId', authenticate, checkBanned, roomController.getRoomDetails);
app.patch('/api/rooms/:roomId/settings', authenticate, checkBanned, roomController.updateRoomSettings);
app.delete('/api/rooms/:roomId/users/:targetUserId', authenticate, checkBanned, roomController.kickUser);
app.post('/api/rooms/:roomId/leave', authenticate, checkBanned, roomController.leaveRoom);
app.delete('/api/rooms/:roomId', authenticate, checkBanned, roomController.deleteRoom);
app.patch('/api/rooms/:roomId/archive', authenticate, checkBanned, roomController.archiveRoom);

app.get('/api/admin/stats', authenticate, requireAdmin, adminController.getStats);
app.get('/api/admin/users', authenticate, requireAdmin, adminController.getAllUsers);
app.post('/api/admin/users/:userId/ban', authenticate, requireAdmin, adminController.banUser);
app.post('/api/admin/users/:userId/unban', authenticate, requireAdmin, adminController.unbanUser);
app.delete('/api/admin/users/:userId', authenticate, requireAdmin, adminController.deleteUser);
app.get('/api/admin/rooms', authenticate, requireAdmin, adminController.getAllRooms);
app.delete('/api/admin/rooms/:roomId', authenticate, requireAdmin, adminController.deleteRoom);
app.get('/api/admin/rooms/:roomId/messages', authenticate, requireAdmin, adminController.getRoomMessages);

app.use(errorHandler);

const server: Server = app.listen(config.port, async () => {
  Logger.info(`Server listening on port ${config.port}`);
  await connectDB();
});

const wss = new WebSocketServer({ server });
new WebSocketController(wss, register);

process.on('SIGTERM', () => {
  Logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    Logger.info('HTTP server closed');
  });
});

export { app, server };
