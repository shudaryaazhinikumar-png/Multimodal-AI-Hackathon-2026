import type { UserProfile, LearningPreferences, BackendStudent } from '@/types';
import { mockUser } from '../mock/mockData';
import { apiRequest, USE_MOCK } from './client';
import { adaptStudentToUserProfile } from '../auth';

const PREFERENCES_KEY = 'user_preferences';
const USER_KEY = 'auth_user';

export async function getProfile(): Promise<UserProfile> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const stored = localStorage.getItem('user_profile');
    if (stored) return JSON.parse(stored);
    return mockUser;
  }

  const data = await apiRequest<BackendStudent>('/api/auth/profile');
  const user = adaptStudentToUserProfile(data);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const updated = { ...mockUser, ...updates };
    localStorage.setItem('user_profile', JSON.stringify(updated));
    return updated;
  }

  const payload: Record<string, string> = {};
  if (updates.learningField !== undefined) {
    payload.education = updates.learningField;
  }
  if (updates.goal !== undefined) {
    payload.learningGoal = updates.goal;
  } else if (updates.bio !== undefined) {
    payload.learningGoal = updates.bio;
  }
  if (updates.avatar !== undefined) {
    payload.avatar = updates.avatar;
  }

  const data = await apiRequest<BackendStudent>('/api/auth/profile', {
    method: 'PATCH',
    body: payload,
  });

  const user = adaptStudentToUserProfile(data);
  // Preserve any local view fields if needed
  const merged: UserProfile = {
    ...user,
    ...(updates.dailyTarget ? { dailyTarget: updates.dailyTarget } : {}),
    ...(updates.level ? { level: updates.level } : {}),
    ...(updates.streak !== undefined ? { streak: updates.streak } : {}),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(merged));
  return merged;
}

export async function getLearningPreferences(): Promise<LearningPreferences> {
  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  return {
    explanationStyle: 'simplified',
    pace: 'medium',
    dailyReminder: true,
    emailNotifications: false,
    theme: 'light',
  };
}

export async function updateLearningPreferences(
  updates: Partial<LearningPreferences>
): Promise<LearningPreferences> {
  const current = await getLearningPreferences();
  const updated = { ...current, ...updates };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  return updated;
}

