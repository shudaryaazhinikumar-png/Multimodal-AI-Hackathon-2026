import type { UserProfile, BackendStudent, BackendAuthResponse } from '@/types';
import { mockUser } from '../mock/mockData';
import { apiRequest, USE_MOCK } from '../api/client';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function adaptStudentToUserProfile(student: BackendStudent): UserProfile {
  return {
    id: student.id,
    name: student.name || 'Student',
    email: student.email,
    avatar: student.avatar || (student.name ? student.name.charAt(0).toUpperCase() : 'S'),
    learningField: student.education || 'General Studies',
    level: 'intermediate',
    goal: student.learningGoal || 'Master Concepts',
    dailyTarget: '45 mins',
    streak: 1,
    topics: ['Study Materials', 'Knowledge Base', 'AI Tutor'],
    joinedAt: student.joinedDate || 'Recently',
    bio: student.learningGoal || '',
  };
}

export async function login(email: string, password: string): Promise<UserProfile> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const user: UserProfile = { ...mockUser, email };
    localStorage.setItem(TOKEN_KEY, `mock-token-${Date.now()}`);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  const data = await apiRequest<BackendAuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  localStorage.setItem(TOKEN_KEY, data.token);
  const user = adaptStudentToUserProfile(data);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function signup(name: string, email: string, password: string): Promise<UserProfile> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const user: UserProfile = {
      ...mockUser,
      id: `u-${Date.now()}`,
      name,
      email,
      joinedAt: new Date().toISOString().split('T')[0],
      streak: 0,
    };
    localStorage.setItem(TOKEN_KEY, `mock-token-${Date.now()}`);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  const data = await apiRequest<BackendAuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: { name, email, password },
  });

  localStorage.setItem(TOKEN_KEY, data.token);
  const user = adaptStudentToUserProfile(data);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  if (!USE_MOCK) {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network / token error on logout
    }
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  if (USE_MOCK) {
    return getCurrentUser();
  }

  try {
    const data = await apiRequest<BackendStudent>('/api/auth/me');
    const user = adaptStudentToUserProfile(data);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function getCurrentUser(): UserProfile | null {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export async function loginWithGoogle(): Promise<UserProfile> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    const user: UserProfile = { ...mockUser, email: 'alex.google@example.com' };
    localStorage.setItem(TOKEN_KEY, `mock-token-${Date.now()}`);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }
  throw new Error('Google sign-in is not supported on this server. Please sign in with email and password.');
}

