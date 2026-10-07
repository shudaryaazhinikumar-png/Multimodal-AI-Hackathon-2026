import axios from 'axios';
import { api } from './api';
import { mockChatHistory, defaultAiResponse, mockAiResponses, mockChatSources } from '@/data/mockChat';
import type { ChatMessage } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export class TutorServiceError extends Error {}

function displayTimestamp(timestamp: string) {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) return timestamp;

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? timestamp
    : new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}

function toUserFacingError(error: unknown) {
  if (!axios.isAxiosError<{ code?: string }>(error)) {
    return new TutorServiceError('The tutor service is temporarily unavailable. Please try again.');
  }
  const response = error.response;
  const code = response?.data?.code;

  if (response?.status === 401) {
    return new TutorServiceError('Your session has expired. Please sign in again.');
  }
  if (code === 'invalid_message') {
    return new TutorServiceError('Enter a message of up to 1000 characters.');
  }
  if (code === 'no_relevant_material') {
    return new TutorServiceError('No relevant study material was found. Upload or process materials, then try again.');
  }
  if (code === 'retrieval_unavailable') {
    return new TutorServiceError('Study material search is temporarily unavailable. Please try again.');
  }
  if (response?.status) {
    return new TutorServiceError('The tutor service is temporarily unavailable. Please try again.');
  }
  return new TutorServiceError('Unable to reach the tutor service. Check your connection and try again.');
}

function normalizeMessage(message: ChatMessage): ChatMessage {
  return { ...message, timestamp: displayTimestamp(message.timestamp) };
}

export const tutorService = {
  isMockMode: USE_MOCK,

  async getChatHistory(): Promise<ChatMessage[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return mockChatHistory;
    }
    try {
      const { data } = await api.get<ChatMessage[]>('/tutor/history');
      return data.map(normalizeMessage);
    } catch (error) {
      throw toUserFacingError(error);
    }
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
    try {
      const { data } = await api.post<ChatMessage>('/tutor/chat', { content, action });
      return normalizeMessage(data);
    } catch (error) {
      throw toUserFacingError(error);
    }
  },
};
