import { v4 as uuidv4 } from 'uuid';
import { Chat, Message, EnhancementMode } from '../types';

class ChatManagerService {
  private readonly STORAGE_KEY = 'promptbetter_chats';
  private readonly SETTINGS_KEY = 'promptbetter_settings';

  public getChats(): Chat[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const chats = JSON.parse(stored);
      return Array.isArray(chats) ? chats : [];
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  }

  public saveChats(chats: Chat[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  public createChat(enhancementMode: EnhancementMode, title?: string): Chat {
    const now = Date.now();
    const chat: Chat = {
      id: uuidv4(),
      title: title || `New ${enhancementMode.replace('-', ' ')} chat`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      enhancementMode,
    };

    const chats = this.getChats();
    chats.unshift(chat);
    this.saveChats(chats);

    return chat;
  }

  public updateChat(chatId: string, updates: Partial<Chat>): Chat | null {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex === -1) return null;

    chats[chatIndex] = {
      ...chats[chatIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveChats(chats);
    return chats[chatIndex];
  }

  public deleteChat(chatId: string): boolean {
    const chats = this.getChats();
    const filteredChats = chats.filter(chat => chat.id !== chatId);
    
    if (filteredChats.length === chats.length) return false;

    this.saveChats(filteredChats);
    return true;
  }

  public addMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Message | null {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex === -1) return null;

    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    chats[chatIndex].messages.push(newMessage);
    chats[chatIndex].updatedAt = Date.now();

    // Update chat title based on first user message
    if (message.role === 'user' && chats[chatIndex].messages.length === 1) {
      const title = message.content.length > 50 
        ? message.content.substring(0, 50) + '...'
        : message.content;
      chats[chatIndex].title = title;
    }

    this.saveChats(chats);
    return newMessage;
  }

  public getChat(chatId: string): Chat | null {
    const chats = this.getChats();
    return chats.find(chat => chat.id === chatId) || null;
  }

  public getChatMessages(chatId: string): Message[] {
    const chat = this.getChat(chatId);
    return chat ? chat.messages : [];
  }

  public updateMessage(chatId: string, messageId: string, updates: Partial<Message>): Message | null {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    
    if (chatIndex === -1) return null;

    const messageIndex = chats[chatIndex].messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return null;

    chats[chatIndex].messages[messageIndex] = {
      ...chats[chatIndex].messages[messageIndex],
      ...updates,
    };

    chats[chatIndex].updatedAt = Date.now();
    this.saveChats(chats);

    return chats[chatIndex].messages[messageIndex];
  }

  public clearAllChats(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public exportChats(): string {
    const chats = this.getChats();
    return JSON.stringify(chats, null, 2);
  }

  public importChats(jsonData: string): { success: boolean; error?: string } {
    try {
      const importedChats = JSON.parse(jsonData);
      
      if (!Array.isArray(importedChats)) {
        return { success: false, error: 'Invalid format: expected array of chats' };
      }

      // Validate chat structure
      for (const chat of importedChats) {
        if (!chat.id || !chat.title || !Array.isArray(chat.messages)) {
          return { success: false, error: 'Invalid chat structure' };
        }
      }

      this.saveChats(importedChats);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse JSON' 
      };
    }
  }

  public getConversationContext(chatId: string, maxMessages: number = 10): string {
    const messages = this.getChatMessages(chatId);
    const recentMessages = messages.slice(-maxMessages);
    
    return recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');
  }

  public searchChats(query: string): Chat[] {
    const chats = this.getChats();
    const lowercaseQuery = query.toLowerCase();
    
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(lowercaseQuery) ||
      chat.messages.some(msg => 
        msg.content.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  public getChatStats(): {
    totalChats: number;
    totalMessages: number;
    modeDistribution: Record<EnhancementMode, number>;
  } {
    const chats = this.getChats();
    const modeDistribution: Record<EnhancementMode, number> = {
      'ai-coding': 0,
      'image-generation': 0,
      'juggernaut-xl': 0,
    };

    let totalMessages = 0;

    chats.forEach(chat => {
      modeDistribution[chat.enhancementMode]++;
      totalMessages += chat.messages.length;
    });

    return {
      totalChats: chats.length,
      totalMessages,
      modeDistribution,
    };
  }
}

export const chatManager = new ChatManagerService();
