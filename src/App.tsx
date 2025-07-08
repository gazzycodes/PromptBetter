import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { EnhancementModeSelector } from './components/EnhancementModeSelector';
import { promptEnhancer } from './services/promptEnhancer';
import { EnhancementMode } from './types';

const AppContent: React.FC = () => {
  const { state, actions } = useApp();

  const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
  const chatAreaRef = React.useRef<HTMLDivElement>(null);

  // Auto-select first chat if no chat is selected but chats exist
  React.useEffect(() => {
    if (!state.currentChatId && state.chats.length > 0) {
      actions.selectChat(state.chats[0].id);
    }
  }, [state.currentChatId, state.chats, actions]);

  // Auto-scroll to bottom when new messages are added or loading state changes
  React.useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentChat?.messages, state.isLoading]);

  const handleSendMessage = async (content: string) => {
    let chatId = state.currentChatId;

    if (!chatId) {
      // Create new chat if none exists
      const newChat = actions.createNewChat(state.currentMode);
      chatId = newChat.id;
    }

    // Add user message
    actions.addMessage(chatId, {
      content,
      role: 'user',
      enhancementMode: state.currentMode,
    });

    // Set loading state
    actions.setLoading(true);
    actions.setError(null);

    try {
      // Enhance the prompt
      const result = await promptEnhancer.enhancePrompt({
        originalPrompt: content,
        mode: state.currentMode,
        enableAdvancedSyntax: state.settings.enableJuggernautXLSyntax,
      });

      if ('error' in result) {
        actions.setError(result.error);
        return;
      }

      // Add assistant response
      actions.addMessage(chatId, {
        content: result.enhancedPrompt,
        role: 'assistant',
        enhancementMode: state.currentMode,
        metadata: {
          positivePrompt: result.positivePrompt,
          negativePrompt: result.negativePrompt,
          originalPrompt: content,
        },
      });
    } catch (error) {
      actions.setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      actions.setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChat = actions.createNewChat(state.currentMode);
    actions.selectChat(newChat.id);
  };

  const handleModeChange = (mode: EnhancementMode) => {
    actions.setCurrentMode(mode);
    actions.updateSettings({ defaultEnhancementMode: mode });
  };

  const handleToggleJuggernautXLSyntax = (enabled: boolean) => {
    actions.updateSettings({ enableJuggernautXLSyntax: enabled });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <ChatSidebar
        chats={state.chats}
        currentChatId={state.currentChatId}
        onSelectChat={actions.selectChat}
        onNewChat={handleNewChat}
        onDeleteChat={actions.deleteChat}
        onOpenSettings={() => console.log('Settings clicked')}
        currentMode={state.currentMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Enhancement Mode Selector */}
        <EnhancementModeSelector
          currentMode={state.currentMode}
          onModeChange={handleModeChange}
          enableJuggernautXLSyntax={state.settings.enableJuggernautXLSyntax}
          onToggleJuggernautXLSyntax={handleToggleJuggernautXLSyntax}
        />

        {/* Chat Area */}
        <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            {currentChat ? (
              <>
                {currentChat.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {state.isLoading && <TypingIndicator />}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-2xl font-bold mb-2">Welcome to PromptBetter</h2>
                <p className="text-gray-400 mb-6">
                  Enhance your prompts for AI coding assistants, image generation, and JuggernautXL
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-600/20 border border-red-500/30 text-red-200 p-4 mx-4 mb-4 rounded-lg">
            <p>{state.error}</p>
            <button
              onClick={() => actions.setError(null)}
              className="text-red-400 hover:text-red-300 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={state.isLoading}
          placeholder={`Describe your ${state.currentMode.replace('-', ' ')} prompt to enhance...`}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
