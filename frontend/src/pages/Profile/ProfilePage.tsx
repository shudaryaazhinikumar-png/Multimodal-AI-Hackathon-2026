import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, GraduationCap, Target, Clock, Flame, BookOpen, User, Calendar } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { LoadingState } from '@/components/ui/States';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/services/api/userApi';
import type { UserProfile } from '@/types';

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  if (loading || !profile) return <LoadingState label="Loading profile..." />;

  const displayName = user?.name || profile.name;

  const infoItems = [
    { icon: GraduationCap, label: 'Learning Field', value: profile.learningField },
    { icon: Target, label: 'Current Level', value: profile.level.charAt(0).toUpperCase() + profile.level.slice(1) },
    { icon: Clock, label: 'Daily Target', value: profile.dailyTarget },
    { icon: Flame, label: 'Learning Streak', value: `${profile.streak} days` },
    { icon: Calendar, label: 'Member Since', value: profile.joinedAt },
    { icon: Mail, label: 'Email', value: profile.email },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-charcoal-900">Profile</h1>

      {/* Profile Header */}
      <ClayCard raised delay={0.05}>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-clay-2xl bg-violet-600 shadow-clay-raised">
            <span className="text-3xl font-bold text-white">{displayName.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-900">{displayName}</h2>
            {profile.bio && <p className="mt-1 text-sm text-clay-600">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <ClayBadge variant="violet">{profile.learningField}</ClayBadge>
              <ClayBadge variant="success">{profile.level}</ClayBadge>
              <ClayBadge variant="warning">{profile.goal}</ClayBadge>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Learning Goal */}
      <ClayCard delay={0.1}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-clay bg-violet-100 shadow-clay-sm">
            <Target size={24} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-clay-500">Learning Goal</p>
            <p className="text-lg font-bold text-charcoal-900">{profile.goal}</p>
          </div>
        </div>
      </ClayCard>

      {/* Account Information */}
      <ClayCard delay={0.15}>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-charcoal-900">
          <User size={20} className="text-violet-600" />
          Account Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {infoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-center gap-3 rounded-clay bg-ivory-100 p-3 shadow-clay-pressed"
              >
                <Icon size={18} className="shrink-0 text-clay-500" />
                <div className="min-w-0">
                  <p className="text-xs text-clay-500">{item.label}</p>
                  <p className="truncate text-sm font-medium text-charcoal-900">{item.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ClayCard>

      {/* Topics */}
      <ClayCard delay={0.25}>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-charcoal-900">
          <BookOpen size={20} className="text-violet-600" />
          Learning Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.topics.map((topic, i) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <ClayBadge variant="violet" className="px-4 py-2 text-sm">{topic}</ClayBadge>
            </motion.div>
          ))}
        </div>
      </ClayCard>
    </div>
  );
}
