import { geminiApi } from './geminiApi';

// Mock fetch for testing
global.fetch = jest.fn();

describe('GeminiApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  test('should initialize with default rate limits', () => {
    const rateLimits = geminiApi.getRateLimitStatus();
    expect(rateLimits.requestsPerMinute).toBe(15);
    expect(rateLimits.requestsPerDay).toBe(1500);
    expect(rateLimits.currentMinuteRequests).toBe(0);
    expect(rateLimits.currentDayRequests).toBe(0);
  });

  test('should generate content successfully', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Enhanced prompt response' }]
          },
          finishReason: 'STOP'
        }
      ]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await geminiApi.generateContent('Test prompt');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBe('Enhanced prompt response');
    }
  });

  test('should handle API errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: { message: 'Invalid request' } }),
    });

    const result = await geminiApi.generateContent('Test prompt');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('API request failed');
    }
  });

  test('should enforce rate limits', async () => {
    // Simulate exceeding minute rate limit
    const rateLimits = geminiApi.getRateLimitStatus();
    
    // Mock localStorage to simulate rate limit state
    localStorage.setItem('gemini_rate_limits', JSON.stringify({
      currentMinuteRequests: 15,
      currentDayRequests: 10,
      lastRequestTime: Date.now() - 30000, // 30 seconds ago
      dailyResetTime: Date.now() + 24 * 60 * 60 * 1000,
    }));

    const result = await geminiApi.generateContent('Test prompt');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Rate limit exceeded');
    }
  });
});
