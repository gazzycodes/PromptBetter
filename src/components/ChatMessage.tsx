import React from 'react';
import { Copy, User, Bot, Check } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      let textToCopy = message.content;

      // For JuggernautXL messages with positive/negative prompts, copy all sections
      if (message.metadata?.positivePrompt && message.metadata?.negativePrompt) {
        textToCopy = `Enhanced Prompt:
${message.content}

Positive Prompt:
${message.metadata.positivePrompt}

Negative Prompt:
${message.metadata.negativePrompt}`;
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatContent = (content: string) => {
    // Handle JuggernautXL positive/negative prompts
    if (message.metadata?.positivePrompt && message.metadata?.negativePrompt) {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Enhanced Prompt:</h4>
            <div className="bg-slate-700/50 p-3 rounded border-l-4 border-blue-500">
              <pre className="whitespace-pre-wrap text-sm">{content}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-2">Positive Prompt:</h4>
            <div className="bg-green-900/20 p-3 rounded border-l-4 border-green-500">
              <pre className="whitespace-pre-wrap text-sm">{message.metadata.positivePrompt}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-2">Negative Prompt:</h4>
            <div className="bg-red-900/20 p-3 rounded border-l-4 border-red-500">
              <pre className="whitespace-pre-wrap text-sm">{message.metadata.negativePrompt}</pre>
            </div>
          </div>
        </div>
      );
    }

    // Handle markdown-like formatting for AI coding prompts
    if (message.enhancementMode === 'ai-coding') {
      return (
        <div className="prose prose-invert prose-sm max-w-none">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      );
    }

    // Default formatting
    return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
  };

  return (
    <div className={`chat-message ${message.role} group relative`}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.role === 'user'
            ? 'bg-blue-600'
            : 'bg-slate-700 border border-blue-500/30'
        }`}>
          {message.role === 'user' ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-blue-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs text-gray-400">
              {message.role === 'user' ? 'You' : 'PromptBetter'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {message.enhancementMode && (
              <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">
                {message.enhancementMode.replace('-', ' ').toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="text-gray-100">
            {formatContent(message.content)}
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-700 rounded"
          title="Copy message"
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} className="text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};
