## Synapse - Multi-Room Real-time Chat with Join Codes

A production-ready WebSocket-based multi-room messaging service with authentication, join codes, code snippet sharing, and complete DevOps pipeline.

## Features

- User authentication with JWT (access + refresh tokens)
- Multi-room chat with unique join codes
- Real-time WebSocket communication
- MongoDB message persistence
- Room admin controls (lock room, kick users)
- Code snippet sharing with syntax highlighting support
- User profiles with avatars
- Prometheus metrics integration
- Health check endpoints
- Production-ready architecture

## Tech Stack

- Backend: Node.js, TypeScript, Express, WebSocket
- Database: MongoDB with Mongoose
- Authentication: JWT (dual token: access + refresh)
- Monitoring: Prometheus
- CI/CD: GitHub Actions
- Containerization: Docker
- Orchestration: Kubernetes (Minikube)
- GitOps: ArgoCD
- IaC: Terraform (AWS S3, IAM)

## Project Structure

```
synapse/
├── src/
│   ├── config/          # Database and environment config
│   ├── controllers/     # Auth, Room, WebSocket, Health controllers
│   ├── models/          # User, Room, Message models
│   ├── middlewares/     # Auth and error handling
│   ├── utils/           # JWT and logger utilities
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── k8s/                 # Kubernetes manifests
├── infra/               # Terraform files
├── .github/workflows/   # CI/CD pipelines
└── Dockerfile           # Multi-stage Docker build
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Docker (optional)

### Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Update .env with your MongoDB Atlas URI and secrets:
```
PORT=8000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/synapse
NODE_ENV=development
ACCESS_TOKEN_SECRET=your-secure-access-secret
REFRESH_TOKEN_SECRET=your-secure-refresh-secret
```

### Running

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "avatar": "https://example.com/avatar.jpg" (optional)
}

Response:
{
  "user": {
    "id": "...",
    "username": "john",
    "email": "john@example.com",
    "avatar": "..."
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: Same as register
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

Response:
{
  "accessToken": "..."
}
```

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "..."
}
```

### Rooms

All room endpoints require authentication header:
```
Authorization: Bearer <accessToken>
```

#### Create Room
```http
POST /api/rooms
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My Room",
  "avatar": "https://example.com/room.jpg" (optional)
}

Response:
{
  "room": {
    "id": "...",
    "name": "My Room",
    "joinCode": "A1B2C3",
    "createdBy": {...},
    "users": [...],
    "avatar": "...",
    "settings": {
      "canAnyoneShare": true,
      "isLocked": false
    },
    "createdAt": "..."
  }
}
```

#### Join Room
```http
POST /api/rooms/join
Content-Type: application/json
Authorization: Bearer <token>

{
  "joinCode": "A1B2C3"
}

Response: Room object
```

#### Get User Rooms
```http
GET /api/rooms
Authorization: Bearer <token>

Response:
{
  "rooms": [...]
}
```

#### Update Room Settings (Owner only)
```http
PATCH /api/rooms/:roomId/settings
Content-Type: application/json
Authorization: Bearer <token>

{
  "canAnyoneShare": false,
  "isLocked": true
}

Response:
{
  "settings": {
    "canAnyoneShare": false,
    "isLocked": true
  }
}
```

#### Kick User (Owner only)
```http
DELETE /api/rooms/:roomId/users/:targetUserId
Authorization: Bearer <token>

Response:
{
  "message": "User kicked successfully"
}
```

## WebSocket Protocol

### Connection

Connect with access token:
```javascript
const ws = new WebSocket('ws://localhost:8000?token=<accessToken>');
```

### Messages

#### Join Room
```javascript
ws.send(JSON.stringify({
  type: 'join_room',
  roomId: '...'
}));
```

#### Leave Room
```javascript
ws.send(JSON.stringify({
  type: 'leave_room'
}));
```

#### Send Message
```javascript
ws.send(JSON.stringify({
  type: 'message',
  text: 'Hello everyone!'
}));
```

#### Share Code
```javascript
ws.send(JSON.stringify({
  type: 'code',
  code: 'console.log("Hello");',
  language: 'javascript'
}));
```

### Received Messages

#### User Joined
```javascript
{
  type: 'user_joined',
  username: 'john',
  userId: '...'
}
```

#### User Left
```javascript
{
  type: 'user_left',
  username: 'john',
  userId: '...'
}
```

#### Chat Message
```javascript
{
  type: 'message',
  id: '...',
  user: {
    username: 'john',
    avatar: '...'
  },
  text: 'Hello!',
  timestamp: '...'
}
```

#### Code Snippet
```javascript
{
  type: 'code',
  id: '...',
  user: {
    username: 'john',
    avatar: '...'
  },
  code: 'console.log("Hello");',
  language: 'javascript',
  timestamp: '...'
}
```

## Development Roadmap

See DEVOPS_ROADMAP.md for the complete 5-phase implementation plan.

Current Status: Phase 1 Complete

- Phase 1: Application Structure (Complete)
- Phase 2: CI/CD Pipeline (Next)
- Phase 3: Terraform Infrastructure (Planned)
- Phase 4: Kubernetes + ArgoCD (Planned)
- Phase 5: Cloud Deployment (Planned)

## License

MIT
