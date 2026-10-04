import type { Notification } from '@/types';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'mastery',
    title: 'Mastery Increased',
    message: 'Your overall mastery increased to 72% in NLP',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'notif-002',
    type: 'recommendation',
    title: 'New Recommendation',
    message: 'A new learning recommendation is available for Statistics',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 'notif-003',
    type: 'quiz',
    title: "Today's Quiz",
    message: 'You completed today\'s quiz with 80% accuracy',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'notif-004',
    type: 'streak',
    title: 'Learning Streak',
    message: 'You\'re on a 5-day learning streak. Keep it up!',
    time: 'Yesterday',
    read: true,
  },
];
