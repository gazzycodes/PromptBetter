import { chatManager } from './chatManager';
import { EnhancementMode } from '../types';

describe('ChatManagerService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    chatManager.clearAllChats();
  });

  test('should create a new chat', () => {
    const chat = chatManager.createChat('juggernaut-xl', 'Test Chat');
    
    expect(chat.id).toBeDefined();
    expect(chat.title).toBe('Test Chat');
    expect(chat.enhancementMode).toBe('juggernaut-xl');
    expect(chat.messages).toEqual([]);
    expect(chat.createdAt).toBeDefined();
    expect(chat.updatedAt).toBeDefined();
  });

  test('should add message to chat', () => {
    const chat = chatManager.createChat('ai-coding');
    const message = chatManager.addMessage(chat.id, {
      content: 'Test message',
      role: 'user',
      enhancementMode: 'ai-coding',
    });

    expect(message).toBeDefined();
    expect(message?.content).toBe('Test message');
    expect(message?.role).toBe('user');
    expect(message?.id).toBeDefined();
    expect(message?.timestamp).toBeDefined();
  });

  test('should update chat title based on first user message', () => {
    const chat = chatManager.createChat('image-generation');
    chatManager.addMessage(chat.id, {
      content: 'This is a very long message that should be truncated when used as title',
      role: 'user',
      enhancementMode: 'image-generation',
    });

    const updatedChat = chatManager.getChat(chat.id);
    expect(updatedChat?.title).toBe('This is a very long message that should be truncat...');
  });

  test('should delete chat', () => {
    const chat = chatManager.createChat('juggernaut-xl');
    const deleted = chatManager.deleteChat(chat.id);
    
    expect(deleted).toBe(true);
    expect(chatManager.getChat(chat.id)).toBeNull();
  });

  test('should get chat statistics', () => {
    chatManager.createChat('ai-coding');
    chatManager.createChat('image-generation');
    chatManager.createChat('juggernaut-xl');

    const stats = chatManager.getChatStats();
    
    expect(stats.totalChats).toBe(3);
    expect(stats.modeDistribution['ai-coding']).toBe(1);
    expect(stats.modeDistribution['image-generation']).toBe(1);
    expect(stats.modeDistribution['juggernaut-xl']).toBe(1);
  });

  test('should search chats by content', () => {
    const chat1 = chatManager.createChat('ai-coding', 'React Development');
    const chat2 = chatManager.createChat('image-generation', 'Art Creation');
    
    chatManager.addMessage(chat1.id, {
      content: 'How to use React hooks?',
      role: 'user',
      enhancementMode: 'ai-coding',
    });

    const results = chatManager.searchChats('React');
    expect(results).toHaveLength(2); // Both title and message match
  });

  test('should export and import chats', () => {
    const chat = chatManager.createChat('juggernaut-xl', 'Test Export');
    chatManager.addMessage(chat.id, {
      content: 'Test message',
      role: 'user',
      enhancementMode: 'juggernaut-xl',
    });

    const exported = chatManager.exportChats();
    chatManager.clearAllChats();
    
    const importResult = chatManager.importChats(exported);
    expect(importResult.success).toBe(true);
    
    const chats = chatManager.getChats();
    expect(chats).toHaveLength(1);
    expect(chats[0].title).toBe('Test Export');
  });
});
