export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt?: string;
  isGoogleUser?: boolean;
}

export interface Room {
  id: string;
  name: string;
  avatar?: string;
  joinCode: string;
  ownerId: string;
  createdBy?: any;
  users?: any[];
  canAnyoneShare: boolean;
  isLocked: boolean;
  isAnonymous?: boolean;
  isArchived?: boolean;
  createdAt?: string;
}

export interface Message {
  id: string;
  type: 'message' | 'code' | 'system';
  user?: {
    username: string;
    avatar?: string;
  };
  text?: string;
  code?: string;
  language?: string;
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AdminStats {
  totalUsers: number;
  totalRooms: number;
  activeUsers: number;
  bannedUsers: number;
}

export interface AdminUser extends User {
  isBanned: boolean;
  createdAt: string;
}

export interface AdminRoom extends Room {
  userCount: number;
  createdAt: string;
}
