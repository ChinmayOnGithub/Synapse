import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { Room } from '@/types';
import { toast } from 'sonner';
import { CreateRoomModal } from '@/components/CreateRoomModal';
import { JoinRoomModal } from '@/components/JoinRoomModal';
import { RoomOptionsMenu } from '@/components/RoomOptionsMenu';
import { Chat } from '@/pages/Chat';
import { Profile } from '@/pages/Profile';
import { Plus, Hash, LogOut, User } from 'lucide-react';

export const MainLayout = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const loadRooms = async () => {
    try {
      const data = await api.get<{ rooms: Room[] }>('/api/rooms');
      setRooms(data.rooms);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-white">Synapse</h1>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => navigate('/profile')}
                className="bg-[#21262d] hover:bg-[#30363d] text-gray-300 h-8 w-8 p-0"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-[#21262d] hover:bg-[#30363d] text-gray-300 h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {user?.username}
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Rooms</span>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="bg-transparent hover:bg-[#30363d] text-gray-400 h-6 w-6 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="px-2 py-4 text-sm text-gray-500">Loading...</div>
            ) : rooms.length === 0 ? (
              <div className="px-2 py-4 text-sm text-gray-500">
                No rooms yet
              </div>
            ) : (
              <div className="space-y-1">
                {rooms.map((room) => (
                  <RoomItem key={room.id} room={room} onUpdate={loadRooms} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-[#30363d] flex-shrink-0">
          <Button
            onClick={() => setJoinOpen(true)}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white text-sm"
            size="sm"
          >
            Join Room
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/rooms" element={<WelcomeScreen />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={loadRooms} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} onSuccess={loadRooms} />
    </div>
  );
};

const RoomItem = ({ room, onUpdate }: { room: Room; onUpdate: () => void }) => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useAuthStore();
  const isActive = roomId === room.id;
  const isOwner = room.ownerId === user?.id;

  return (
    <div
      className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
        isActive
          ? 'bg-[#30363d] text-white'
          : 'text-gray-400 hover:bg-[#21262d] hover:text-gray-300'
      }`}
    >
      <button
        onClick={() => navigate(`/chat/${room.id}`)}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <Hash className="h-4 w-4 shrink-0" />
        <span className="text-sm truncate">{room.name}</span>
        {room.isArchived && (
          <span className="text-xs text-gray-500">(archived)</span>
        )}
      </button>
      <RoomOptionsMenu
        roomId={room.id}
        roomName={room.name}
        isOwner={isOwner}
        isArchived={room.isArchived}
        onSuccess={onUpdate}
      />
    </div>
  );
};

const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-300 mb-2">Welcome to Synapse</h2>
        <p className="text-gray-500">Select a room from the sidebar to start chatting</p>
      </div>
    </div>
  );
};
