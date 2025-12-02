import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { X, Copy, Check, Users, Settings, Hash, Crown, ChevronDown, ChevronUp, Code2, Link as LinkIcon, UserPlus, Mail, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import type { Message } from '@/types';

interface RoomInfoPanelProps {
  roomId: string;
  messages: Message[];
  onClose: () => void;
  onOpenSettings: () => void;
  initialWidth?: number;
}

type Tab = 'resources' | 'members';

const CodeSnippetCard = ({ message }: { message: Message }) => {
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(message.code || '');
      setCodeCopied(true);
      toast.success('Code copied');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 hover:border-[#484f58] transition-colors min-w-0">
      <div className="flex items-center gap-2 mb-2 min-w-0">
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarImage src={message.user?.avatar} />
          <AvatarFallback className="bg-[#238636] text-white text-xs">
            {message.user?.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-300 truncate">{message.user?.username}</span>
        <span className="text-xs text-gray-500 ml-auto shrink-0">
          {new Date(message.timestamp).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="text-xs text-[#58a6ff] font-mono bg-[#161b22] px-2 py-1 rounded">
          {message.language}
        </div>
        <Button
          size="sm"
          onClick={handleCopyCode}
          className="h-6 px-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 shrink-0"
        >
          {codeCopied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <div className="relative bg-[#161b22] rounded p-2 min-w-0 overflow-hidden">
        <pre className="text-xs font-mono text-[#7ee787] overflow-x-auto whitespace-pre-wrap break-words max-w-full">
          <code className="block">{message.code}</code>
        </pre>
      </div>
    </div>
  );
};

export const RoomInfoPanel = ({ roomId, messages, onClose, onOpenSettings, initialWidth = 320 }: RoomInfoPanelProps) => {
  const { user } = useAuthStore();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    loadRoomDetails();
  }, [roomId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const loadRoomDetails = async () => {
    try {
      const data = await api.get<{ room: any }>(`/api/rooms/${roomId}`);
      setRoom(data.room);
      
      // Generate QR code
      const qrData = `Join code: ${data.room.joinCode}`;
      const qr = await QRCode.toDataURL(qrData, {
        width: 180,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#0d1117',
        },
      });
      setQrCode(qr);
    } catch {
      toast.error('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.joinCode);
      setCopied(true);
      toast.success('Join code copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Join ${room.name} on Synapse`);
    const body = encodeURIComponent(`Join my room on Synapse!\n\nRoom: ${room.name}\nJoin Code: ${room.joinCode}\n\nEnter this code to join the conversation.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const isOwner = room?.ownerId === user?.id;

  // Filter messages by type
  const codeMessages = messages.filter(m => m.type === 'code');
  const linkMessages = messages.filter(m => m.text && /https?:\/\//.test(m.text || ''));
  const resourceCount = codeMessages.length + linkMessages.length;

  if (loading) {
    return (
      <div style={{ width: `${width}px` }} className="bg-[#161b22] border-l border-[#30363d] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div style={{ width: `${width}px` }} className="bg-[#161b22] border-l border-[#30363d] flex relative">
      {/* Resize Handle */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#58a6ff] transition-colors z-10"
      />

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between shrink-0">
          <h2 className="text-white font-semibold">Room Info</h2>
          <Button
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 bg-transparent hover:bg-[#30363d] text-gray-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Overview Section (Always visible at top) */}
        <div className="p-4 border-b border-[#30363d] space-y-4 shrink-0 overflow-hidden">
          {/* Room Name */}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 truncate">
              <Hash className="h-5 w-5 shrink-0" />
              <span className="truncate">{room.name}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Created {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 min-w-0">
              <div className="text-2xl font-bold text-white">{resourceCount}</div>
              <div className="text-xs text-gray-400">Resources</div>
            </div>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 min-w-0">
              <div className="text-2xl font-bold text-white">{room.users?.length || 0}</div>
              <div className="text-xs text-gray-400">Members</div>
            </div>
          </div>

          {/* Add Member Button */}
          <Button
            onClick={() => setShowInvite(!showInvite)}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
            {showInvite ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </Button>

          {/* Expandable Invite Card */}
          {showInvite && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 min-w-0">
              {/* Join Code */}
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-sm font-medium text-gray-300">Join Code</span>
                  <Button
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-7 px-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        <span className="text-xs">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded px-4 py-3 text-center min-w-0">
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-[#58a6ff] tracking-wider break-all">
                    {room.joinCode}
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-300 mb-2">Scan to Join</p>
                  <div className="flex justify-center p-3 bg-[#161b22] rounded border border-[#30363d]">
                    <img src={qrCode} alt="QR Code" className="rounded max-w-full h-auto" style={{ maxWidth: '180px' }} />
                  </div>
                </div>
              )}

              {/* Share Options */}
              <div className="space-y-2 min-w-0">
                <p className="text-sm font-medium text-gray-300">Share via</p>
                <div className="grid grid-cols-2 gap-2 min-w-0">
                  <Button
                    size="sm"
                    onClick={handleShareEmail}
                    className="bg-[#21262d] hover:bg-[#30363d] text-gray-300 min-w-0"
                  >
                    <Mail className="h-4 w-4 mr-1 shrink-0" />
                    <span className="truncate">Email</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCopyCode}
                    className="bg-[#21262d] hover:bg-[#30363d] text-gray-300 min-w-0"
                  >
                    <Share2 className="h-4 w-4 mr-1 shrink-0" />
                    <span className="truncate">Copy</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Button (Owner only) */}
          {isOwner && (
            <Button
              onClick={onOpenSettings}
              className="w-full bg-[#21262d] hover:bg-[#30363d] text-gray-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Room Settings
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-[#30363d] flex shrink-0 overflow-hidden">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors min-w-0 ${
              activeTab === 'resources'
                ? 'border-[#58a6ff] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Code2 className="h-4 w-4 shrink-0" />
            <span className="truncate">Resources</span>
            {resourceCount > 0 && (
              <span className="bg-[#30363d] text-gray-300 text-xs px-1.5 py-0.5 rounded shrink-0">
                {resourceCount}
              </span>
            )}
          </button>
          {!room.isAnonymous && (
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors min-w-0 ${
                activeTab === 'members'
                  ? 'border-[#58a6ff] text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate">Members</span>
              <span className="bg-[#30363d] text-gray-300 text-xs px-1.5 py-0.5 rounded shrink-0">
                {room.users?.length || 0}
              </span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-w-0">
          {activeTab === 'resources' && (
            <div className="p-4 space-y-4 min-w-0">
              {/* Code Snippets */}
              {codeMessages.length > 0 && (
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Code2 className="h-4 w-4 shrink-0" />
                    <span>Code Snippets ({codeMessages.length})</span>
                  </h4>
                  <div className="space-y-2 min-w-0">
                    {codeMessages.map((msg) => (
                      <CodeSnippetCard key={msg.id} message={msg} />
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {linkMessages.length > 0 && (
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 shrink-0" />
                    <span>Links ({linkMessages.length})</span>
                  </h4>
                  <div className="space-y-2 min-w-0">
                    {linkMessages.map((msg) => (
                      <div key={msg.id} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 hover:border-[#484f58] transition-colors min-w-0">
                        <div className="flex items-center gap-2 mb-2 min-w-0">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={msg.user?.avatar} />
                            <AvatarFallback className="bg-[#238636] text-white text-xs">
                              {msg.user?.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-300 truncate">{msg.user?.username}</span>
                          <span className="text-xs text-gray-500 ml-auto shrink-0">
                            {new Date(msg.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={msg.text}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#58a6ff] hover:underline break-all block"
                        >
                          {msg.text}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {resourceCount === 0 && (
                <div className="text-center py-12">
                  <Code2 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No resources shared yet</p>
                  <p className="text-gray-600 text-xs mt-1">Code snippets and links will appear here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && !room.isAnonymous && (
            <div className="p-4 space-y-2 min-w-0">
              {room.users?.map((member: any) => (
                <div
                  key={member.id || member._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0d1117] transition-colors min-w-0"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-[#238636] text-white text-sm">
                      {member.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{member.username}</p>
                      {(member.id || member._id) === room.ownerId && (
                        <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {(member.id || member._id) === room.ownerId ? 'Room Owner' : 'Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
