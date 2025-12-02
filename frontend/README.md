# Synapse Chat Frontend

A minimal, fast, production-ready React frontend for multi-room real-time chat with admin panel.

## Tech Stack

- React 19 + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- Zustand (state management)
- React Router
- WebSocket for real-time messaging

## Features

- **Authentication**: Login/Register with JWT tokens + Google OAuth 2.0
- **Rooms**: Create rooms, join with codes, real-time messaging
- **Code Sharing**: Share code snippets with syntax highlighting
- **Room Management**: Owners can configure settings and manage users
- **Admin Panel**: User and room management, statistics
- **Real-time**: WebSocket-based instant messaging
- **Responsive**: Mobile-friendly design

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running on http://localhost:8000

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

For Google OAuth setup, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

### Development

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Default Admin Account

- Email: admin@synapse.com
- Password: admin123456

## API Endpoints

Backend API: http://localhost:8000
WebSocket: ws://localhost:8000

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── admin/       # Admin-specific components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utilities (API client, etc.)
├── pages/           # Page components
├── store/           # Zustand stores
└── types/           # TypeScript types
```

## Pages

- `/login` - Login page
- `/register` - Registration page
- `/rooms` - Room list (protected)
- `/chat/:roomId` - Chat room (protected)
- `/admin` - Admin panel (admin only)

## Troubleshooting

Having issues? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common problems and solutions.

## Documentation

- [README.md](./README.md) - Project overview
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Google OAuth setup (optional)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [CODE_QUALITY_CHECKLIST.md](./CODE_QUALITY_CHECKLIST.md) - Quality checklist
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details

## License

MIT
