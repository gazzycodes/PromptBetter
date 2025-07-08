import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, Zap } from 'lucide-react';
import { Chat, EnhancementMode, ENHANCEMENT_MODE_LABELS } from '../types';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onOpenSettings: () => void;
  currentMode: EnhancementMode;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenSettings,
  currentMode,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getModeIcon = (mode: EnhancementMode) => {
    switch (mode) {
      case 'ai-coding':
        return '💻';
      case 'image-generation':
        return '🎨';
      case 'juggernaut-xl':
        return '⚡';
      default:
        return '💬';
    }
  };

  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="text-blue-400" size={24} />
            <h1 className="text-xl font-bold text-white">PromptBetter</h1>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} className="text-gray-400" />
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Current Mode Indicator */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Current Mode:</span>
          <span className="flex items-center space-x-1 text-blue-300">
            <span>{getModeIcon(currentMode)}</span>
            <span>{ENHANCEMENT_MODE_LABELS[currentMode]}</span>
          </span>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation!</p>
          </div>
        ) : (
          <div className="p-2">
            {sortedChats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  currentChatId === chat.id
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'hover:bg-slate-700'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">{getModeIcon(chat.enhancementMode)}</span>
                      <h3 className="text-sm font-medium text-white truncate">
                        {chat.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      {formatDate(chat.updatedAt)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                    title="Delete chat"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-gray-400">
        <p>Powered by Google Gemini 2.0 Flash</p>
        <p className="mt-1">Rate limits: 15/min, 1500/day</p>
      </div>
    </div>
  );
};
