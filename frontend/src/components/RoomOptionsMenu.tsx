import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MoreVertical, Trash2, LogOut, Archive, ArchiveRestore } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface RoomOptionsMenuProps {
  roomId: string;
  roomName: string;
  isOwner: boolean;
  isArchived?: boolean;
  onSuccess: () => void;
}

export const RoomOptionsMenu = ({ roomId, roomName, isOwner, isArchived, onSuccess }: RoomOptionsMenuProps) => {
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    if (!window.confirm(`Are you sure you want to leave "${roomName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/rooms/${roomId}/leave`, {});
      toast.success('Left room successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave room');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${roomName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/rooms/${roomId}`);
      toast.success('Room deleted successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      const response = await api.patch<{ message: string; isArchived: boolean }>(`/api/rooms/${roomId}/archive`, {});
      toast.success(response.message);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          size="sm"
          disabled={loading}
          className="h-6 w-6 p-0 bg-transparent hover:bg-[#30363d] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-[#161b22] border border-[#30363d] rounded-lg p-1 shadow-lg z-50"
          sideOffset={5}
          onClick={(e) => e.stopPropagation()}
        >
          {isOwner ? (
            <>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#30363d] rounded cursor-pointer outline-none"
                onSelect={handleArchive}
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4" />
                    <span>Unarchive</span>
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    <span>Archive</span>
                  </>
                )}
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-[#30363d] my-1" />
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#30363d] rounded cursor-pointer outline-none"
                onSelect={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Room</span>
              </DropdownMenu.Item>
            </>
          ) : (
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#30363d] rounded cursor-pointer outline-none"
              onSelect={handleLeave}
            >
              <LogOut className="h-4 w-4" />
              <span>Leave Room</span>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
