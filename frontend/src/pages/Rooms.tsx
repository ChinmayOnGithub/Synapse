import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { Room } from '@/types';
import { toast } from 'sonner';
import { CreateRoomModal } from '@/components/CreateRoomModal';
import { JoinRoomModal } from '@/components/JoinRoomModal';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

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

  const handleLogout = async () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1d29] p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Rooms</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, <span className="text-gray-900 dark:text-white font-medium">{user?.username}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            {user?.role === 'admin' && (
              <Button 
                onClick={() => navigate('/admin')} 
                variant="outline"
                className="border-gray-300 dark:border-[#2d3142] bg-white dark:bg-[#23263a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3142]"
              >
                Admin Panel
              </Button>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="border-gray-300 dark:border-[#2d3142] bg-white dark:bg-[#23263a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3142]"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Button 
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Room
          </Button>
          <Button 
            onClick={() => setJoinOpen(true)} 
            variant="outline"
            className="border-gray-300 dark:border-[#2d3142] bg-white dark:bg-[#23263a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3142]"
          >
            Join Room
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <Card className="border-gray-200 dark:border-[#2d3142] bg-gray-50 dark:bg-[#23263a]">
            <CardContent className="py-8 text-center text-gray-600 dark:text-gray-400">
              No rooms yet. Create or join one to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="cursor-pointer transition-all hover:border-blue-500/50 border-gray-200 dark:border-[#2d3142] bg-gray-50 dark:bg-[#23263a] hover:bg-gray-100 dark:hover:bg-[#2a2d42]"
                onClick={() => navigate(`/chat/${room.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={room.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white font-semibold">
                        {room.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-base text-gray-900 dark:text-white font-medium">{room.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Join code: <span className="text-blue-600 dark:text-blue-500 font-mono">{room.joinCode}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={loadRooms} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} onSuccess={loadRooms} />
    </div>
  );
};
