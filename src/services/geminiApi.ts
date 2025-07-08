export interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  requestsPerDay: number;
  currentMinuteRequests: number;
  currentDayRequests: number;
  lastRequestTime: number;
  dailyResetTime: number;
}

class GeminiApiService {
  private readonly apiKey = 'AIzaSyAeYLOEC29HIYE0lu-0yc7zi9BUkXAKOB4';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private readonly rateLimits: RateLimitInfo = {
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    currentMinuteRequests: 0,
    currentDayRequests: 0,
    lastRequestTime: 0,
    dailyResetTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  };

  constructor() {
    this.loadRateLimitFromStorage();
  }

  private loadRateLimitFromStorage(): void {
    const stored = localStorage.getItem('gemini_rate_limits');
    if (stored) {
      const parsedLimits = JSON.parse(stored);
      this.rateLimits.currentMinuteRequests = parsedLimits.currentMinuteRequests || 0;
      this.rateLimits.currentDayRequests = parsedLimits.currentDayRequests || 0;
      this.rateLimits.lastRequestTime = parsedLimits.lastRequestTime || 0;
      this.rateLimits.dailyResetTime = parsedLimits.dailyResetTime || Date.now() + 24 * 60 * 60 * 1000;
    }
  }

  private saveRateLimitToStorage(): void {
    localStorage.setItem('gemini_rate_limits', JSON.stringify({
      currentMinuteRequests: this.rateLimits.currentMinuteRequests,
      currentDayRequests: this.rateLimits.currentDayRequests,
      lastRequestTime: this.rateLimits.lastRequestTime,
      dailyResetTime: this.rateLimits.dailyResetTime,
    }));
  }

  private updateRateLimits(): void {
    const now = Date.now();
    
    // Reset daily counter if 24 hours have passed
    if (now > this.rateLimits.dailyResetTime) {
      this.rateLimits.currentDayRequests = 0;
      this.rateLimits.dailyResetTime = now + 24 * 60 * 60 * 1000;
    }
    
    // Reset minute counter if 1 minute has passed
    if (now - this.rateLimits.lastRequestTime > 60 * 1000) {
      this.rateLimits.currentMinuteRequests = 0;
    }
    
    this.rateLimits.lastRequestTime = now;
    this.rateLimits.currentMinuteRequests++;
    this.rateLimits.currentDayRequests++;
    
    this.saveRateLimitToStorage();
  }

  private checkRateLimits(): { allowed: boolean; error?: string } {
    const now = Date.now();
    
    // Check daily limit
    if (this.rateLimits.currentDayRequests >= this.rateLimits.requestsPerDay) {
      const resetTime = new Date(this.rateLimits.dailyResetTime);
      return {
        allowed: false,
        error: `Daily rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`
      };
    }
    
    // Check minute limit
    if (now - this.rateLimits.lastRequestTime < 60 * 1000 && 
        this.rateLimits.currentMinuteRequests >= this.rateLimits.requestsPerMinute) {
      return {
        allowed: false,
        error: 'Rate limit exceeded. Please wait a minute before making another request.'
      };
    }
    
    return { allowed: true };
  }

  public getRateLimitStatus(): RateLimitInfo {
    return { ...this.rateLimits };
  }

  public async generateContent(prompt: string, config?: {
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ success: true; content: string } | { success: false; error: string }> {
    try {
      // Check rate limits
      const rateLimitCheck = this.checkRateLimits();
      if (!rateLimitCheck.allowed) {
        return { success: false, error: rateLimitCheck.error! };
      }

      const requestBody: GeminiRequest = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: config?.temperature || 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: config?.maxTokens || 2048,
        }
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from the API');
      }

      const content = data.candidates[0].content.parts[0].text;
      
      // Update rate limits after successful request
      this.updateRateLimits();
      
      return { success: true, content };
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}

export const geminiApi = new GeminiApiService();
