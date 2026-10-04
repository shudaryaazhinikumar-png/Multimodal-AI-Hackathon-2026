import { api } from './api';
import { mockStudent } from '@/data/mockStudent';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  learningGoal: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('auth_token', token);
      return mockStudent;
    }
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async signup(signupData: SignupData) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 1000));
      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('auth_token', token);
      return { ...mockStudent, name: signupData.name, email: signupData.email, learningGoal: signupData.learningGoal };
    }
    const { data } = await api.post('/auth/signup', signupData);
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async logout() {
    localStorage.removeItem('auth_token');
    if (!USE_MOCK) {
      await api.post('/auth/logout', {});
    }
  },

  getCurrentUser() {
    const token = localStorage.getItem('auth_token');
    if (token && USE_MOCK) return mockStudent;
    return null;
  },
};
