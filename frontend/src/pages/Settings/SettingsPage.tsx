import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, Bell, Palette, Shield, LogOut, Check, Brain } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayTabs } from '@/components/clay/ClayTabs';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [notifications, setNotifications] = useState({ daily: true, email: false, weekly: true });
  const [theme, setTheme] = useState('light');
  const [privacy, setPrivacy] = useState({ analytics: true, shareProgress: false });
  const [savedToast, setSavedToast] = useState(false);
  const [explanationStyle, setExplanationStyle] = useState('simplified');
  const [pace, setPace] = useState('medium');

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'preferences', label: 'Learning', icon: GraduationCap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const showSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-charcoal-900">Settings</h1>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Section tabs */}
        <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-clay px-4 py-2.5 text-sm font-medium transition-all',
                  activeSection === section.id
                    ? 'bg-clay-50 text-violet-700 shadow-clay-raised'
                    : 'text-clay-600 hover:bg-ivory-100'
                )}
              >
                <Icon size={18} />
                {section.label}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 rounded-clay bg-peach-100 px-4 py-2.5 text-sm font-medium text-peach-500 hover:bg-peach-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Content */}
        <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeSection === 'account' && (
            <ClayCard className="space-y-4">
              <h2 className="text-lg font-bold text-charcoal-900">Account Settings</h2>
              <ClayInput label="Full Name" defaultValue={user?.name || 'Alex Chen'} />
              <ClayInput label="Email" type="email" defaultValue={user?.email || 'alex@example.com'} />
              <ClayInput label="Bio" defaultValue="CS student passionate about machine learning and AI." />
              <ClayButton onClick={showSaved}>Save Changes</ClayButton>
            </ClayCard>
          )}

          {activeSection === 'preferences' && (
            <ClayCard className="space-y-4">
              <h2 className="text-lg font-bold text-charcoal-900">Learning Preferences</h2>
              <div>
                <p className="mb-2 text-sm font-medium text-charcoal-700">Explanation Style</p>
                <ClayTabs
                  tabs={[
                    { id: 'simplified', label: 'Simplified' },
                    { id: 'detailed', label: 'Detailed' },
                    { id: 'technical', label: 'Technical' },
                  ]}
                  activeTab={explanationStyle}
                  onChange={setExplanationStyle}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-charcoal-700">Pace</p>
                <ClayTabs
                  tabs={[
                    { id: 'slow', label: 'Slow' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'fast', label: 'Fast' },
                  ]}
                  activeTab={pace}
                  onChange={setPace}
                />
              </div>
              <ClayButton onClick={showSaved}>Save Preferences</ClayButton>
            </ClayCard>
          )}

          {activeSection === 'notifications' && (
            <ClayCard className="space-y-4">
              <h2 className="text-lg font-bold text-charcoal-900">Notifications</h2>
              {[
                { key: 'daily', label: 'Daily study reminder', desc: 'Get reminded to study each day' },
                { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
                { key: 'weekly', label: 'Weekly progress report', desc: 'Summary of your weekly progress' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-clay bg-ivory-100 p-4 shadow-clay-pressed">
                  <div>
                    <p className="text-sm font-medium text-charcoal-900">{item.label}</p>
                    <p className="text-xs text-clay-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={cn(
                      'relative h-7 w-12 rounded-full transition-all',
                      notifications[item.key as keyof typeof notifications] ? 'bg-violet-600' : 'bg-clay-300'
                    )}
                  >
                    <motion.div
                      animate={{ x: notifications[item.key as keyof typeof notifications] ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </ClayCard>
          )}

          {activeSection === 'appearance' && (
            <ClayCard className="space-y-4">
              <h2 className="text-lg font-bold text-charcoal-900">Appearance</h2>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'auto'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-clay p-4 transition-all',
                      theme === t ? 'bg-violet-50 ring-2 ring-violet-400' : 'bg-ivory-100 hover:bg-ivory-200'
                    )}
                  >
                    <div className={cn('h-12 w-12 rounded-clay shadow-clay-sm', t === 'light' ? 'bg-ivory-100' : t === 'dark' ? 'bg-charcoal-900' : 'bg-gradient-to-br from-ivory-100 to-charcoal-900')} />
                    <span className={cn('text-sm font-medium capitalize', theme === t ? 'text-violet-700' : 'text-charcoal-700')}>{t}</span>
                  </button>
                ))}
              </div>
              <div className="rounded-clay bg-ivory-100 p-4 shadow-clay-pressed">
                <p className="mb-3 text-sm font-semibold text-charcoal-900">Preview</p>
                <div className={cn(
                  'rounded-clay p-4 transition-all',
                  theme === 'dark' ? 'bg-charcoal-900' : theme === 'auto' ? 'bg-gradient-to-br from-ivory-50 to-charcoal-900' : 'bg-ivory-50'
                )}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-clay bg-violet-600">
                      <Brain size={12} className="text-white" />
                    </div>
                    <span className={cn('text-xs font-bold', theme === 'light' ? 'text-charcoal-900' : 'text-white')}>AI Study Companion</span>
                  </div>
                  <div className={cn('mb-2 rounded-clay p-2', theme === 'light' ? 'bg-white shadow-clay-sm' : 'bg-white/10')}>
                    <div className={cn('mb-1 text-xs font-semibold', theme === 'light' ? 'text-charcoal-900' : 'text-white')}>Neural Networks</div>
                    <div className="h-1.5 w-full rounded-full bg-violet-200">
                      <div className="h-full w-3/4 rounded-full bg-violet-500" />
                    </div>
                  </div>
                  <div className={cn('inline-block rounded-full px-3 py-1 text-xs font-semibold', theme === 'light' ? 'bg-violet-100 text-violet-700' : 'bg-violet-500/20 text-violet-300')}>
                    92% Mastery
                  </div>
                </div>
              </div>
              <ClayButton onClick={showSaved}>Save Appearance</ClayButton>
            </ClayCard>
          )}

          {activeSection === 'privacy' && (
            <ClayCard className="space-y-4">
              <h2 className="text-lg font-bold text-charcoal-900">Privacy</h2>
              {[
                { key: 'analytics', label: 'Anonymous analytics', desc: 'Help improve the product with anonymous data' },
                { key: 'shareProgress', label: 'Share progress', desc: 'Allow your progress to be visible to others' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-clay bg-ivory-100 p-4 shadow-clay-pressed">
                  <div>
                    <p className="text-sm font-medium text-charcoal-900">{item.label}</p>
                    <p className="text-xs text-clay-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key as keyof typeof privacy] })}
                    className={cn(
                      'relative h-7 w-12 rounded-full transition-all',
                      privacy[item.key as keyof typeof privacy] ? 'bg-violet-600' : 'bg-clay-300'
                    )}
                  >
                    <motion.div
                      animate={{ x: privacy[item.key as keyof typeof privacy] ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </ClayCard>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-clay bg-mint-500 px-4 py-2.5 text-sm text-white shadow-clay-xl lg:bottom-8"
          >
            <Check size={16} />
            Saved successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
