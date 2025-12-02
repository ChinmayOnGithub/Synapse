import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Room, Message } from '@/types';
import { toast } from 'sonner';
import { MessageBubble } from '@/components/MessageBubble';
import { CodeShareModal } from '@/components/CodeShareModal';
import { RoomSettingsModal } from '@/components/RoomSettingsModal';
import { RoomInfoPanel } from '@/components/RoomInfoPanel';
import { Info, ChevronDown } from 'lucide-react';

const SystemMessageGroup = ({ messages }: { messages: Message[] }) => {
  const [collapsed, setCollapsed] = useState(true);

  if (messages.length === 0) return null;

  if (messages.length === 1) {
    return <MessageBubble message={messages[0]} />;
  }

  return (
    <div className="flex flex-col items-center my-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-gray-300 text-xs px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${!collapsed ? 'rotate-180' : ''}`} />
        <span className="font-medium">{collapsed ? `${messages.length} system messages` : 'Hide messages'}</span>
      </button>
      
      {!collapsed && (
        <div className="w-full mt-3 space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className="animate-in slide-in-from-top-1 fade-in"
              style={{ animationDelay: `${index * 50}ms`, animationDuration: '200ms' }}
            >
              <MessageBubble message={msg} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Chat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [text, setText] = useState('');
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { messages, connected, reconnecting, sendMessage, sendCode } = useWebSocket(roomId || null);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const loadRoom = async () => {
      try {
        const data = await api.get<{ rooms: Room[] }>('/api/rooms');
        const currentRoom = data.rooms.find((r) => r.id === roomId);
        if (currentRoom) {
          setRoom(currentRoom);
        } else {
          toast.error('Room not found');
          navigate('/rooms');
        }
      } catch {
        toast.error('Failed to load room');
        navigate('/rooms');
      }
    };

    loadRoom();
  }, [roomId, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group consecutive messages from same user within 1 minute
  const groupedMessages = messages.reduce((acc: any[], msg, index) => {
    if (msg.type === 'system') {
      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.type === 'systemGroup') {
        lastGroup.messages.push(msg);
      } else {
        acc.push({ type: 'systemGroup', messages: [msg], id: `group-${index}` });
      }
    } else {
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const isSameUser = prevMsg && prevMsg.user?.username === msg.user?.username && prevMsg.type !== 'system';
      const timeDiff = prevMsg ? new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() : Infinity;
      const withinMinute = timeDiff < 60000; // 1 minute

      acc.push({
        ...msg,
        showAvatar: !isSameUser || !withinMinute,
        showUsername: !isSameUser || !withinMinute,
      });
    }
    return acc;
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
    }
  };

  const handleShareCode = (code: string, language: string) => {
    sendCode(code, language);
  };

  return (
    <div className="flex h-full bg-[#0d1117]">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="border-b border-[#30363d] bg-[#161b22] px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-white"># {room?.name}</h1>
              <p className="text-xs flex items-center gap-1.5 mt-0.5">
                {connected ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-gray-500">Connected</span>
                  </>
                ) : reconnecting ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                    <span className="text-gray-500">Reconnecting...</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span className="text-gray-500">Disconnected</span>
                  </>
                )}
              </p>
            </div>
            <Button 
              onClick={() => setInfoPanelOpen(!infoPanelOpen)} 
              size="sm"
              className="bg-[#21262d] hover:bg-[#30363d] text-gray-300"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 relative">
        <div>
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No messages yet. Start the conversation!
            </div>
          )}
          {groupedMessages.map((item, index) => {
            const prevItem = index > 0 ? groupedMessages[index - 1] : null;
            const isNewGroup = !prevItem || item.type === 'systemGroup' || prevItem.type === 'systemGroup' || item.showUsername;
            const marginClass = isNewGroup ? 'mt-4' : 'mt-0.5';

            if (item.type === 'systemGroup') {
              return <div key={item.id} className={marginClass}><SystemMessageGroup messages={item.messages} /></div>;
            }
            return (
              <div key={item.id} className={marginClass}>
                <MessageBubble
                  message={item}
                  showAvatar={item.showAvatar}
                  showUsername={item.showUsername}
                />
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="sticky bottom-4 left-0 right-0 flex justify-center pointer-events-none z-10 mt-4">
            <button
              onClick={scrollToBottom}
              className="pointer-events-auto bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-300 hover:text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 hover:shadow-xl flex items-center gap-2 text-sm font-medium"
              aria-label="Scroll to bottom"
            >
              <span>Jump to latest</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#30363d] bg-[#161b22] px-4 py-3 shrink-0">
        <form onSubmit={handleSendMessage} className="space-y-2">
          {/* Toolbar */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              onClick={() => setCodeModalOpen(true)}
              disabled={!connected}
              className="h-8 px-3 bg-transparent hover:bg-[#30363d] text-gray-400 hover:text-gray-300 transition-colors"
              title="Share code snippet"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="ml-1.5 text-xs font-medium">Code</span>
            </Button>
            
            <Button
              type="button"
              size="sm"
              disabled={!connected}
              className="h-8 px-3 bg-transparent hover:bg-[#30363d] text-gray-400 hover:text-gray-300 transition-colors"
              title="Attach file"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="ml-1.5 text-xs font-medium">File</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={!connected}
              className="h-8 px-3 bg-transparent hover:bg-[#30363d] text-gray-400 hover:text-gray-300 transition-colors"
              title="Insert link"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="ml-1.5 text-xs font-medium">Link</span>
            </Button>

            <div className="flex-1" />

            <span className="text-xs text-gray-600">
              {connected ? 'Connected' : reconnecting ? 'Reconnecting...' : 'Disconnected'}
            </span>
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <textarea
              placeholder="Type a message... (Shift+Enter for new line)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={!connected}
              rows={1}
              className="flex-1 resize-none bg-[#0d1117] border border-[#30363d] text-white placeholder:text-gray-500 focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] rounded-md px-3 py-2 text-sm focus:outline-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <Button 
              type="submit" 
              disabled={!connected || !text.trim()}
              className="bg-[#238636] hover:bg-[#2ea043] text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 self-end"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </form>
      </div>

      <CodeShareModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        onShare={handleShareCode}
      />

        {room && (
          <RoomSettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            roomId={room.id}
            canAnyoneShare={room.canAnyoneShare}
            isLocked={room.isLocked}
            isAnonymous={room.isAnonymous}
          />
        )}
      </div>

      {/* Room Info Panel */}
      {infoPanelOpen && roomId && (
        <RoomInfoPanel
          roomId={roomId}
          messages={messages}
          onClose={() => setInfoPanelOpen(false)}
          onOpenSettings={() => {
            setInfoPanelOpen(false);
            setSettingsOpen(true);
          }}
        />
      )}
    </div>
  );
};
