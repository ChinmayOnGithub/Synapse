import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  roomId: string;
  canAnyoneShare: boolean;
  isLocked: boolean;
  isAnonymous?: boolean;
}

export const RoomSettingsModal = ({ open, onClose, roomId, canAnyoneShare, isLocked, isAnonymous }: Props) => {
  const [shareEnabled, setShareEnabled] = useState(canAnyoneShare);
  const [locked, setLocked] = useState(isLocked);
  const [anonymous, setAnonymous] = useState(isAnonymous || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(`/api/rooms/${roomId}/settings`, {
        canAnyoneShare: shareEnabled,
        isLocked: locked,
        isAnonymous: anonymous,
      });
      toast.success('Settings updated');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-[#30363d] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Room Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={shareEnabled}
              onChange={(e) => setShareEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-[#238636] focus:ring-[#58a6ff]"
            />
            <span>Allow anyone to share code</span>
          </label>
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={locked}
              onChange={(e) => setLocked(e.target.checked)}
              className="h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-[#238636] focus:ring-[#58a6ff]"
            />
            <span>Lock room (prevent new joins)</span>
          </label>
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-[#238636] focus:ring-[#58a6ff]"
            />
            <span>Anonymous room (hide members list)</span>
          </label>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white"
            >
              {loading ? 'Saving...' : 'Save'}
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
