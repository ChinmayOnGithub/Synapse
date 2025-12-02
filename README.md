# Synapse - Real-time Chat Platform

Full-stack TypeScript application demonstrating modern web development, real-time communication, and DevOps practices.

## Architecture

### System Design
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Vercel    │         │   AWS EC2   │         │  MongoDB    │
│  (Frontend) │────────▶│  (Backend)  │────────▶│   Atlas     │
│   React     │  HTTPS  │   Node.js   │  TCP    │  Database   │
│   + Vite    │         │ + WebSocket │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │
       │                       │
       └───────────────────────┘
            WebSocket (wss://)
```

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Zustand for state management
- WebSocket client for real-time updates

**Backend**
- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose ODM
- WebSocket server (ws library)
- JWT authentication
- Google OAuth 2.0

**DevOps**
- GitHub Actions for CI/CD
- Docker for containerization
- Prometheus for monitoring
- ESLint for code quality
- Jest for testing

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Local Development

1. Clone repository
```bash
git clone https://github.com/yourusername/synapse-chat.git
cd synapse-chat
```

2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with MongoDB URI and JWT secrets
npm run dev
```

3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure .env with backend URL
npm run dev
```

4. Access application at http://localhost:5173

## Environment Configuration

### Backend (.env)
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/synapse
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

## API Architecture

### REST Endpoints

**Authentication**
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/google` - Google OAuth
- POST `/api/auth/refresh` - Token refresh
- PUT `/api/auth/profile` - Update profile
- PUT `/api/auth/password` - Change password

**Rooms**
- GET `/api/rooms` - List user rooms
- POST `/api/rooms` - Create room
- POST `/api/rooms/join` - Join with code
- GET `/api/rooms/:id` - Room details
- PATCH `/api/rooms/:id/settings` - Update settings
- DELETE `/api/rooms/:id` - Delete room
- POST `/api/rooms/:id/leave` - Leave room

**Admin**
- GET `/api/admin/stats` - System statistics
- GET `/api/admin/users` - List all users
- POST `/api/admin/users/:id/ban` - Ban user
- DELETE `/api/admin/users/:id` - Delete user

### WebSocket Protocol

**Client to Server**
```json
{
  "type": "message",
  "roomId": "room-id",
  "text": "message content"
}
```

**Server to Client**
```json
{
  "type": "message",
  "id": "msg-id",
  "user": { "username": "user", "avatar": "url" },
  "text": "message content",
  "timestamp": "2025-12-03T00:00:00.000Z"
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

The project uses GitHub Actions for automated CI/CD. Workflow file: `.github/workflows/ci.yml`

**Continuous Integration (on push/PR)**

Backend CI:
- Checkout code
- Setup Node.js 20 with npm cache
- Install dependencies (`npm ci`)
- Run ESLint linting
- Run Vitest tests
- Build TypeScript to JavaScript

Frontend CI:
- Checkout code
- Setup Node.js 20 with npm cache
- Install dependencies (`npm ci`)
- Run ESLint linting
- Build production bundle with Vite

Docker Build (on main branch push only):
- Build multi-stage Docker images
- Push to GitHub Container Registry (GHCR)
- Tag with branch name, commit SHA, and `latest`
- Use Docker layer caching for faster builds

**Continuous Deployment**
- Frontend: Auto-deploy to Vercel on push to main
- Backend: Manual deployment to EC2 (or configure auto-deploy)

### Code Quality Gates
- ESLint with TypeScript rules (backend & frontend)
- TypeScript strict mode enabled
- No linting errors allowed (warnings permitted)
- All tests must pass
- Build must succeed

### Running CI Checks Locally

```bash
# Backend
cd backend
npm run lint      # ESLint check
npm test          # Run tests
npm run build     # TypeScript compilation

# Frontend
cd frontend
npm run lint      # ESLint check
npm run build     # Production build
```

## Deployment

### Frontend (Vercel)
```bash
# Vercel Configuration
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Environment Variables: VITE_API_URL, VITE_WS_URL, VITE_GOOGLE_CLIENT_ID
```

### Backend (AWS EC2)
```bash
# EC2 Deployment
ssh ubuntu@your-ec2-ip
git clone <repo>
cd synapse-chat/backend
npm install
npm run build
pm2 start dist/app.js --name synapse-backend
pm2 startup
pm2 save

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/synapse
# Configure proxy_pass to localhost:8000
sudo systemctl restart nginx
```

### Docker Deployment
```bash
# Build images
docker build -t synapse-backend ./backend
docker build -t synapse-frontend ./frontend

# Run with Docker Compose
docker-compose up -d
```

## Monitoring

### Prometheus Metrics
- HTTP request duration
- WebSocket connections
- Active users
- Message throughput
- Error rates

Access metrics at: http://localhost:8000/metrics

### Health Check
```bash
curl http://localhost:8000/healthz
```

## Database Schema

### Users Collection
```typescript
{
  username: string
  email: string
  password: string (hashed)
  avatar?: string
  role: 'user' | 'admin'
  isGoogleUser: boolean
  isBanned: boolean
  createdAt: Date
}
```

### Rooms Collection
```typescript
{
  name: string
  joinCode: string (6-char hex)
  createdBy: ObjectId
  users: ObjectId[]
  settings: {
    canAnyoneShare: boolean
    isLocked: boolean
    isAnonymous: boolean
  }
  isArchived: boolean
  createdAt: Date
}
```

## Security

- Password hashing with bcrypt (10 rounds)
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days expiry)
- CORS configuration
- Input validation
- XSS protection
- Rate limiting ready

## Performance

- WebSocket for real-time updates (no polling)
- Message grouping reduces DOM nodes
- Lazy loading for modals
- Optimized re-renders
- Efficient database queries with indexes

## Development

### Build Commands
```bash
# Backend
npm run build    # Compile TypeScript
npm run dev      # Development with nodemon

# Frontend
npm run build    # Production build
npm run dev      # Development server
npm run lint     # ESLint check
```

### Testing
```bash
# Backend
npm test         # Run Jest tests
npm run test:watch  # Watch mode

# Frontend
npm test         # Run Vitest tests
npm run test:coverage  # Coverage report
```

## Project Statistics

- Language: TypeScript (100%)
- Lines of Code: ~15,000+
- Components: 50+
- API Endpoints: 20+
- Database Models: 5
- Real-time Events: 10+

## License

MIT License - See LICENSE file for details

## Author

Chinmay Patil
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

Built to demonstrate full-stack development, real-time systems, and DevOps practices.
