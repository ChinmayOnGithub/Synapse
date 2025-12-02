import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Message } from '@/types';

interface Props {
  message: Message;
  showAvatar?: boolean;
  showUsername?: boolean;
}

export const MessageBubble = ({ message, showAvatar = true, showUsername = true }: Props) => {
  // System message (user joined/left)
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-[#21262d] text-gray-500 text-xs px-3 py-1 rounded">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.type === 'code') {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(message.code || '');
        setCopied(true);
        toast.success('Code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Failed to copy code');
      }
    };

    return (
      <div className={`flex gap-3 ${showUsername ? '' : 'mt-0.5'}`}>
        {showAvatar ? (
          <Avatar className="h-7 w-7 mt-0.5">
            <AvatarImage src={message.user?.avatar} />
            <AvatarFallback className="bg-[#238636] text-white text-xs">
              {message.user?.username[0]}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-7 shrink-0 flex items-start justify-end pt-1">
            <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        <div className="flex-1">
          {showUsername && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-medium text-white">{message.user?.username}</span>
              <span className="text-xs text-gray-500 font-mono">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>
          )}
          <div className="rounded bg-[#161b22] border border-[#30363d] p-3 relative group">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#58a6ff] font-mono">{message.language}</span>
                {!showUsername && (
                  <span className="text-[10px] text-gray-600 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <pre className="overflow-x-auto text-sm font-mono">
              <code className="text-[#7ee787]">{message.code}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Extract URLs from message text (with and without protocol)
  const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const matches = message.text?.match(urlRegex) || [];
  
  // Separate URLs with protocol (for preview cards) and without (just clickable)
  const urlsWithProtocol = matches.filter(match => match.startsWith('http://') || match.startsWith('https://'));
  const hasLinks = matches.length > 0;

  // Split text into parts (text and links)
  const renderTextWithLinks = (text: string) => {
    if (!hasLinks) return text;
    
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('http://') || part.startsWith('https://') ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#58a6ff] hover:underline break-all inline-flex items-center gap-1"
          >
            {part}
            <svg className="h-3 w-3 inline shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 hover:bg-[#161b22] -mx-2 px-2 rounded group ${showUsername ? 'py-1' : 'py-0.5'}`}>
      {showAvatar ? (
        <Avatar className="h-7 w-7 mt-0.5">
          <AvatarImage src={message.user?.avatar} />
          <AvatarFallback className="bg-[#238636] text-white text-xs">
            {message.user?.username[0]}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-7 shrink-0 flex items-start justify-end pt-1">
          <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        {showUsername && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-medium text-white">{message.user?.username}</span>
            <span className="text-xs text-gray-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        )}
        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
          {renderTextWithLinks(message.text || '')}
        </div>
        
        {/* Link Preview Cards - Only for URLs with https:// */}
        {urlsWithProtocol.length > 0 && (
          <div className="mt-2 space-y-2">
            {urlsWithProtocol.slice(0, 2).map((url, index) => (
              <LinkPreview key={index} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LinkPreview = ({ url }: { url: string }) => {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).origin;
      return `${domain}/favicon.ico`;
    } catch {
      return null;
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-l-4 border-[#58a6ff] bg-[#161b22] hover:bg-[#1c2128] transition-colors rounded-r p-3 group/link"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getFavicon(url) && (
              <img 
                src={getFavicon(url) || ''} 
                alt="" 
                className="h-4 w-4 shrink-0"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            )}
            <span className="text-xs text-gray-400 truncate">{getDomain(url)}</span>
          </div>
          <div className="text-sm text-[#58a6ff] group-hover/link:underline truncate">
            {url}
          </div>
        </div>
        <svg className="h-4 w-4 text-gray-500 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
};
