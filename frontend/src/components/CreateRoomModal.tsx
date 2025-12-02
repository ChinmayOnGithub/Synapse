import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRoomModal = ({ open, onClose, onSuccess }: Props) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/rooms', { name, avatar: avatar || undefined });
      toast.success('Room created successfully');
      setName('');
      setAvatar('');
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-[#30363d] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
          />
          <Input
            placeholder="Avatar URL (optional)"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
          />
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white"
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
