import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { Chat, Message, EnhancementMode, AppSettings, DEFAULT_SETTINGS } from '../types';
import { chatManager } from '../services/chatManager';

interface AppState {
  chats: Chat[];
  currentChatId: string | null;
  currentMode: EnhancementMode;
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_CURRENT_CHAT'; payload: string | null }
  | { type: 'SET_CURRENT_MODE'; payload: EnhancementMode }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: { chatId: string; updates: Partial<Chat> } }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } };

const initialState: AppState = {
  chats: [],
  currentChatId: null,
  currentMode: 'juggernaut-xl',
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChatId: action.payload };
    
    case 'SET_CURRENT_MODE':
      return { ...state, currentMode: action.payload };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_CHAT':
      return { 
        ...state, 
        chats: [action.payload, ...state.chats],
        currentChatId: action.payload.id 
      };
    
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? { ...chat, ...action.payload.updates, updatedAt: Date.now() }
            : chat
        ),
      };
    
    case 'DELETE_CHAT':
      const filteredChats = state.chats.filter(chat => chat.id !== action.payload);
      return {
        ...state,
        chats: filteredChats,
        currentChatId: state.currentChatId === action.payload 
          ? (filteredChats.length > 0 ? filteredChats[0].id : null)
          : state.currentChatId,
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...chat.messages, action.payload.message],
                updatedAt: Date.now(),
              }
            : chat
        ),
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loadChats: () => void;
    createNewChat: (mode?: EnhancementMode) => Chat;
    selectChat: (chatId: string) => void;
    deleteChat: (chatId: string) => void;
    addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => Message | null;
    updateSettings: (settings: Partial<AppSettings>) => void;
    setCurrentMode: (mode: EnhancementMode) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('promptbetter_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'SET_SETTINGS', payload: { ...DEFAULT_SETTINGS, ...settings } });
        dispatch({ type: 'SET_CURRENT_MODE', payload: settings.defaultEnhancementMode || 'juggernaut-xl' });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('promptbetter_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  const loadChats = useCallback(() => {
    const chats = chatManager.getChats();
    dispatch({ type: 'SET_CHATS', payload: chats });
  }, []);

  const createNewChat = useCallback((mode?: EnhancementMode): Chat => {
    const enhancementMode = mode || state.currentMode;
    const newChat = chatManager.createChat(enhancementMode);
    dispatch({ type: 'ADD_CHAT', payload: newChat });
    return newChat;
  }, [state.currentMode]);

  const selectChat = useCallback((chatId: string) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    if (chatManager.deleteChat(chatId)) {
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
    }
  }, []);

  const addMessage = useCallback((chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Message | null => {
    const newMessage = chatManager.addMessage(chatId, message);
    if (newMessage) {
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message: newMessage } });
    }
    return newMessage;
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });

    if (newSettings.defaultEnhancementMode) {
      dispatch({ type: 'SET_CURRENT_MODE', payload: newSettings.defaultEnhancementMode });
    }
  }, [state.settings]);

  const setCurrentMode = useCallback((mode: EnhancementMode) => {
    dispatch({ type: 'SET_CURRENT_MODE', payload: mode });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const actions = useMemo(() => ({
    loadChats,
    createNewChat,
    selectChat,
    deleteChat,
    addMessage,
    updateSettings,
    setCurrentMode,
    setLoading,
    setError,
  }), [loadChats, createNewChat, selectChat, deleteChat, addMessage, updateSettings, setCurrentMode, setLoading, setError]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};
