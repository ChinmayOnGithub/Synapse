# Synapse - Real-time Developer Chat Platform

A modern, full-stack real-time chat application built with TypeScript, featuring WebSocket communication, Google OAuth, and a developer-focused UI.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=flat&logo=socket.io&logoColor=white)

## ✨ Features

### Core Functionality
- 🚀 **Real-time Messaging** - WebSocket-powered instant communication
- 👥 **Room Management** - Create, join, archive, and manage chat rooms
- 🔐 **Authentication** - JWT + Google OAuth 2.0 integration
- 💻 **Code Sharing** - Syntax-highlighted code snippets with copy functionality
- 🔗 **Rich Link Previews** - Automatic link detection with preview cards
- 📱 **Responsive Design** - Professional dark terminal theme

### Advanced Features
- ⚡ **Message Grouping** - Smart grouping like WhatsApp/Discord
- 🎨 **Resizable UI** - Draggable panels for customized layout
- 👤 **Profile Management** - Avatar URLs, password changes, account settings
- 🔒 **Role-Based Access** - Admin panel with user management
- 📊 **Monitoring** - Prometheus metrics integration
- 🌐 **Multi-line Input** - Shift+Enter for new lines

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **UI Components:** Radix UI, shadcn/ui
- **Real-time:** WebSocket client

### Backend
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcrypt, Google OAuth 2.0
- **Real-time:** WebSocket (ws library)
- **Monitoring:** Prometheus

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/synapse-chat.git
cd synapse-chat
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 📦 Environment Variables

### Backend (.env)
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/synapse
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🏗️ Project Structure

```
synapse-chat/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── middlewares/    # Auth, error handling
│   │   ├── utils/          # Helpers, JWT, logger
│   │   └── app.ts          # Express app
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # API client, utils
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
└── README.md
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Vercel will auto-deploy from GitHub
# Configure in vercel.json:
# - Root Directory: frontend
# - Build Command: npm run build
# - Output Directory: dist
```

### Backend (AWS EC2)
```bash
# On EC2 instance:
git clone <repo>
cd synapse-chat/backend
npm install
npm run build
pm2 start dist/app.js --name synapse-backend
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh access token

### Rooms
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create new room
- `POST /api/rooms/join` - Join room with code
- `PATCH /api/rooms/:id/settings` - Update room settings

### WebSocket Events
- `message` - Send/receive text messages
- `code` - Share code snippets
- `user:joined` - User joined room
- `user:left` - User left room

## 🎯 Key Features Explained

### Message Grouping
Messages from the same user within 60 seconds are automatically grouped together, reducing visual clutter while maintaining readability.

### Link Previews
URLs with `https://` protocol automatically generate rich preview cards with favicon and domain information. Plain domains (e.g., `example.com`) are made clickable without preview cards.

### Code Sharing
Developers can share code snippets with syntax highlighting. Each snippet includes:
- Language indicator
- Copy button
- Proper formatting
- Timestamp

### Room Management
- Create private rooms with join codes
- Archive rooms for later reference
- Lock rooms to prevent new members
- Anonymous mode to hide member lists

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by Discord, Slack, and WhatsApp
- Designed for developers, by developers

---

⭐ Star this repo if you find it helpful!
