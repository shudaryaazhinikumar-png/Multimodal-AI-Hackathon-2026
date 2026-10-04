import { api } from './api';
import { mockChatHistory, defaultAiResponse, mockAiResponses, mockChatSources } from '@/data/mockChat';
import type { ChatMessage } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const tutorService = {
  async getChatHistory(): Promise<ChatMessage[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return mockChatHistory;
    }
    const { data } = await api.get('/tutor/history');
    return data;
  },

  async sendMessage(content: string, action?: string): Promise<ChatMessage> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 1200));
      const lowerContent = content.toLowerCase();
      let response = defaultAiResponse;
      if (action && mockAiResponses[action]) {
        response = mockAiResponses[action];
      } else {
        for (const key of Object.keys(mockAiResponses)) {
          if (lowerContent.includes(key)) {
            response = mockAiResponses[key];
            break;
          }
        }
      }
      return {
        id: `msg-${Date.now()}`,
        role: 'ai',
        content: response,
        sources: mockChatSources,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
    }
    const { data } = await api.post('/tutor/chat', { content, action });
    return data;
  },
};
