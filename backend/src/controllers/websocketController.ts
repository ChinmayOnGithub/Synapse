import WebSocket from 'ws';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import { Logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/jwt.js';
import client from 'prom-client';

interface ClientInfo {
  userId: string;
  username: string;
  roomId?: string;
  lastActivity: number;
}

export class WebSocketController {
  private clients: Map<WebSocket, ClientInfo>;
  private roomClients: Map<string, Set<WebSocket>>; // Track clients per room
  private wss: WebSocket.Server;
  private wsConnectionsGauge: client.Gauge;
  private wsMessagesCounter: client.Counter;
  private wsRoomGauge: client.Gauge;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CLIENT_TIMEOUT = 60000; // 60 seconds

  constructor(wss: WebSocket.Server, register: client.Registry) {
    this.clients = new Map();
    this.roomClients = new Map();
    this.wss = wss;

    this.wsConnectionsGauge = new client.Gauge({
      name: 'websocket_connections_total',
      help: 'Total number of active WebSocket connections',
      registers: [register],
    });

    this.wsMessagesCounter = new client.Counter({
      name: 'websocket_messages_total',
      help: 'Total number of WebSocket messages received',
      labelNames: ['type'],
      registers: [register],
    });

    this.wsRoomGauge = new client.Gauge({
      name: 'websocket_active_rooms_total',
      help: 'Total number of rooms with active connections',
      registers: [register],
    });

    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      this.clients.forEach((clientInfo, ws) => {
        // Check if client is inactive
        if (now - clientInfo.lastActivity > this.CLIENT_TIMEOUT) {
          Logger.warn('Client timeout, closing connection', { userId: clientInfo.userId });
          ws.close(1000, 'Timeout');
          return;
        }

        // Send ping to keep connection alive
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  public shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.forEach((_, ws) => {
      ws.close(1000, 'Server shutdown');
    });
    this.clients.clear();
    this.roomClients.clear();
  }

  private setupWebSocketServer(): void {
    this.wss.on('headers', (headers) => {
      headers.push('Access-Control-Allow-Origin: *');
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: WebSocket, req: any): void {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      const decoded = verifyAccessToken(token);
      
      this.clients.set(ws, {
        userId: decoded.userId,
        username: decoded.username,
        lastActivity: Date.now(),
      });

      this.wsConnectionsGauge.set(this.clients.size);

      Logger.info('WebSocket client connected', { userId: decoded.userId, username: decoded.username });

      ws.on('message', (raw: Buffer) => {
        this.handleMessage(ws, raw);
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        Logger.error('WebSocket error', { error: error.message });
      });

      ws.on('pong', () => {
        const clientInfo = this.clients.get(ws);
        if (clientInfo) {
          clientInfo.lastActivity = Date.now();
        }
      });

      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected successfully',
      }));
    } catch (error: any) {
      Logger.error('WebSocket authentication failed', { error: error.message });
      ws.close(1008, 'Invalid token');
    }
  }

  private async handleMessage(ws: WebSocket, raw: Buffer): Promise<void> {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    // Update last activity
    clientInfo.lastActivity = Date.now();

    let msg: any;

    try {
      msg = JSON.parse(raw.toString());
    } catch {
      Logger.warn('Received non-JSON message');
      return;
    }

    switch (msg.type) {
      case 'join_room':
        await this.handleJoinRoom(ws, clientInfo, msg.roomId);
        break;
      case 'leave_room':
        await this.handleLeaveRoom(ws, clientInfo);
        break;
      case 'message':
        await this.handleChatMessage(ws, clientInfo, msg.text);
        break;
      case 'code':
        await this.handleCodeShare(ws, clientInfo, msg.code, msg.language);
        break;
      default:
        Logger.warn('Unknown message type', { type: msg.type });
    }
  }

  private async handleJoinRoom(ws: WebSocket, clientInfo: ClientInfo, roomId: string): Promise<void> {
    try {
      const room = await Room.findById(roomId);
      
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }

      if (!room.users.some(u => u.toString() === clientInfo.userId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not a member of this room' }));
        return;
      }

      // Leave previous room if in one
      if (clientInfo.roomId) {
        await this.handleLeaveRoom(ws, clientInfo);
      }

      clientInfo.roomId = roomId;
      
      // Add to room tracking
      if (!this.roomClients.has(roomId)) {
        this.roomClients.set(roomId, new Set());
      }
      this.roomClients.get(roomId)!.add(ws);
      this.wsRoomGauge.set(this.roomClients.size);

      this.wsMessagesCounter.inc({ type: 'join_room' });

      Logger.info('User joined room via WebSocket', { 
        userId: clientInfo.userId, 
        roomId,
        activeInRoom: this.roomClients.get(roomId)!.size 
      });

      // Load message history (last 50 messages)
      const messages = await Message.find({ room: roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .populate('user', 'username avatar')
        .lean();

      // Reverse to show oldest first
      const formattedMessages = messages.reverse().map(msg => {
        if (msg.type === 'system') {
          return {
            type: 'system',
            id: msg._id,
            text: msg.text,
            timestamp: msg.timestamp,
          };
        } else if (msg.type === 'code') {
          return {
            type: 'code',
            id: msg._id,
            user: msg.user,
            code: msg.text,
            language: msg.codeLanguage,
            timestamp: msg.timestamp,
          };
        } else {
          return {
            type: 'message',
            id: msg._id,
            user: msg.user,
            text: msg.text,
            timestamp: msg.timestamp,
          };
        }
      });

      // Send message history to the user
      ws.send(JSON.stringify({
        type: 'message_history',
        messages: formattedMessages,
      }));

      // Create and broadcast system message for user joined
      const systemMessage = await Message.create({
        user: null,
        room: roomId,
        text: `${clientInfo.username} joined the room`,
        type: 'system',
      });

      this.broadcastToRoom(roomId, {
        type: 'system',
        id: systemMessage._id,
        text: systemMessage.text,
        timestamp: systemMessage.timestamp,
      });

      ws.send(JSON.stringify({
        type: 'room_joined',
        roomId,
        message: 'Joined room successfully',
      }));
    } catch (error: any) {
      Logger.error('Join room error', { error: error.message });
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to join room' }));
    }
  }

  private async handleLeaveRoom(ws: WebSocket, clientInfo: ClientInfo): Promise<void> {
    if (!clientInfo.roomId) return;

    const roomId = clientInfo.roomId;
    
    // Remove from room tracking
    const roomSet = this.roomClients.get(roomId);
    if (roomSet) {
      roomSet.delete(ws);
      if (roomSet.size === 0) {
        // No one left in room, clean up
        this.roomClients.delete(roomId);
        Logger.info('Room now empty, cleaned up', { roomId });
      }
      this.wsRoomGauge.set(this.roomClients.size);
    }

    clientInfo.roomId = undefined;

    // Create and broadcast system message for user left
    try {
      const systemMessage = await Message.create({
        user: null,
        room: roomId,
        text: `${clientInfo.username} left the room`,
        type: 'system',
      });

      this.broadcastToRoom(roomId, {
        type: 'system',
        id: systemMessage._id,
        text: systemMessage.text,
        timestamp: systemMessage.timestamp,
      });
    } catch (error: any) {
      Logger.error('Failed to create system message', { error: error.message });
    }

    ws.send(JSON.stringify({
      type: 'room_left',
      message: 'Left room successfully',
    }));

    Logger.info('User left room', { 
      userId: clientInfo.userId, 
      roomId,
      remainingInRoom: roomSet?.size || 0
    });
  }

  private async handleChatMessage(ws: WebSocket, clientInfo: ClientInfo, text: string): Promise<void> {
    if (!clientInfo.roomId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not in a room' }));
      return;
    }

    if (!text || typeof text !== 'string') {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      return;
    }

    this.wsMessagesCounter.inc({ type: 'message' });

    try {
      const message = await Message.create({
        user: clientInfo.userId,
        room: clientInfo.roomId,
        text,
        type: 'text',
      });

      await message.populate('user', 'username avatar');

      const payload = {
        type: 'message',
        id: message._id,
        user: message.user,
        text: message.text,
        timestamp: message.timestamp,
      };

      this.broadcastToRoom(clientInfo.roomId, payload);

      Logger.info('Message sent', { userId: clientInfo.userId, roomId: clientInfo.roomId });
    } catch (error: any) {
      Logger.error('Failed to save message', { error: error.message });
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
    }
  }

  private async handleCodeShare(ws: WebSocket, clientInfo: ClientInfo, code: string, language: string): Promise<void> {
    if (!clientInfo.roomId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not in a room' }));
      return;
    }

    try {
      const room = await Room.findById(clientInfo.roomId);
      
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }

      if (!room.settings.canAnyoneShare && room.createdBy.toString() !== clientInfo.userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Only room owner can share code' }));
        return;
      }

      this.wsMessagesCounter.inc({ type: 'code' });

      const message = await Message.create({
        user: clientInfo.userId,
        room: clientInfo.roomId,
        text: code,
        type: 'code',
        codeLanguage: language || 'plaintext',
      });

      await message.populate('user', 'username avatar');

      const payload = {
        type: 'code',
        id: message._id,
        user: message.user,
        code: message.text,
        language: message.codeLanguage,
        timestamp: message.timestamp,
      };

      this.broadcastToRoom(clientInfo.roomId, payload);

      Logger.info('Code shared', { userId: clientInfo.userId, roomId: clientInfo.roomId, language });
    } catch (error: any) {
      Logger.error('Failed to share code', { error: error.message });
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to share code' }));
    }
  }

  private async handleDisconnection(ws: WebSocket): Promise<void> {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    // Leave room if in one
    if (clientInfo.roomId) {
      const roomId = clientInfo.roomId;
      const roomSet = this.roomClients.get(roomId);
      if (roomSet) {
        roomSet.delete(ws);
        if (roomSet.size === 0) {
          this.roomClients.delete(roomId);
        }
        this.wsRoomGauge.set(this.roomClients.size);
      }

      // Create system message for user left
      try {
        const systemMessage = await Message.create({
          user: null,
          room: roomId,
          text: `${clientInfo.username} left the room`,
          type: 'system',
        });

        this.broadcastToRoom(roomId, {
          type: 'system',
          id: systemMessage._id,
          text: systemMessage.text,
          timestamp: systemMessage.timestamp,
        }, ws);
      } catch (error: any) {
        Logger.error('Failed to create system message on disconnect', { error: error.message });
      }
    }

    this.clients.delete(ws);
    this.wsConnectionsGauge.set(this.clients.size);

    Logger.info('WebSocket client disconnected', { 
      userId: clientInfo.userId,
      wasInRoom: !!clientInfo.roomId 
    });
  }

  private broadcastToRoom(roomId: string, payload: any, excludeWs?: WebSocket): void {
    const roomSet = this.roomClients.get(roomId);
    if (!roomSet || roomSet.size === 0) return;

    const message = JSON.stringify(payload);
    let sentCount = 0;

    roomSet.forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
          sentCount++;
        } catch (error: any) {
          Logger.error('Failed to send message to client', { error: error.message });
        }
      }
    });

    Logger.debug('Broadcast to room', { roomId, recipients: sentCount, type: payload.type });
  }

  // Get room statistics
  public getRoomStats(roomId: string): { activeConnections: number } {
    const roomSet = this.roomClients.get(roomId);
    return {
      activeConnections: roomSet?.size || 0,
    };
  }

  // Get all active rooms
  public getActiveRooms(): string[] {
    return Array.from(this.roomClients.keys());
  }
}
