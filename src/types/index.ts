export type EnhancementMode = 'ai-coding' | 'image-generation' | 'juggernaut-xl';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  enhancementMode?: EnhancementMode;
  metadata?: {
    positivePrompt?: string;
    negativePrompt?: string;
    originalPrompt?: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  enhancementMode: EnhancementMode;
}

export interface AppSettings {
  defaultEnhancementMode: EnhancementMode;
  enableJuggernautXLSyntax: boolean;
  theme: 'dark' | 'light';
  autoSaveChats: boolean;
}

export interface PromptEnhancementRequest {
  originalPrompt: string;
  mode: EnhancementMode;
  enableAdvancedSyntax?: boolean;
  context?: string;
}

export interface PromptEnhancementResponse {
  enhancedPrompt: string;
  positivePrompt?: string;
  negativePrompt?: string;
  explanation?: string;
  suggestions?: string[];
}

export interface JuggernautXLConfig {
  enableWeightModifiers: boolean;
  enableNegativePrompts: boolean;
  defaultPositiveWeights: string[];
  defaultNegativeWeights: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultEnhancementMode: 'juggernaut-xl',
  enableJuggernautXLSyntax: true,
  theme: 'dark',
  autoSaveChats: true,
};

export const ENHANCEMENT_MODE_LABELS: Record<EnhancementMode, string> = {
  'ai-coding': 'AI Coding Assistant',
  'image-generation': 'Image Generation',
  'juggernaut-xl': 'JuggernautXL',
};

export const ENHANCEMENT_MODE_DESCRIPTIONS: Record<EnhancementMode, string> = {
  'ai-coding': 'Optimize prompts for AI coding assistants like Cursor, Augment, and Windsurf IDEs',
  'image-generation': 'Enhance prompts for general image generation models',
  'juggernaut-xl': 'Specialized enhancement for JuggernautXL with weight modifiers and negative prompts',
};
