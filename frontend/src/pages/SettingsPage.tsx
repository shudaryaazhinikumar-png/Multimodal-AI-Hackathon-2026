import { useState } from 'react';
import {
  Settings as SettingsIcon,
  GraduationCap,
  Sparkles,
  Bell,
  Shield,
  Sun,
  Globe,
  Clock,
  Target,
  BellRing,
  MessageSquare,
  BookOpen,
  Lock,
  Trash2,
  CheckSquare2,
  Trophy,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

const tabs = [
  { key: 'general', label: 'General', icon: SettingsIcon },
  { key: 'learning', label: 'Learning', icon: GraduationCap },
  { key: 'tutor', label: 'AI Tutor', icon: Sparkles },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'privacy', label: 'Privacy', icon: Shield },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-surface-elevated'}`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('UTC+05:30 IST');
  const [dailyGoal, setDailyGoal] = useState('60 min');
  const [prefDifficulty, setPrefDifficulty] = useState('Adaptive');
  const [responseStyle, setResponseStyle] = useState('Detailed');
  const [explanationDepth, setExplanationDepth] = useState('Medium');
  const [citationPref, setCitationPref] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [achievementNotifs, setAchievementNotifs] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Settings" subtitle="Manage your application and learning preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Tabs sidebar */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'bg-primary-soft text-primary' : 'text-text-secondary hover:bg-surface-elevated'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'general' && (
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Sun size={16} /> Theme
                  </label>
                  <div className="flex gap-2">
                    {['dark', 'light'].map((t) => (
                      <button key={t} onClick={() => setTheme(t)} className={`rounded-lg border px-4 py-2 text-sm capitalize transition-colors ${theme === t ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text-secondary hover:border-primary/40'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Globe size={16} /> Language
                  </label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-text-primary focus:border-primary focus:outline-none">
                    <option>English</option><option>Hindi</option><option>Spanish</option><option>French</option><option>German</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Clock size={16} /> Timezone
                  </label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-text-primary focus:border-primary focus:outline-none">
                    <option>UTC+05:30 IST</option><option>UTC-08:00 PST</option><option>UTC+00:00 GMT</option><option>UTC+01:00 CET</option><option>UTC+09:00 JST</option>
                  </select>
                </div>
                <Button onClick={() => toast('success', 'Settings saved.')}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'learning' && (
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Clock size={16} /> Daily Study Goal
                  </label>
                  <div className="flex gap-2">
                    {['30 min', '60 min', '90 min', '120 min'].map((g) => (
                      <button key={g} onClick={() => setDailyGoal(g)} className={`rounded-lg border px-4 py-2 text-sm transition-colors ${dailyGoal === g ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text-secondary hover:border-primary/40'}`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Target size={16} /> Preferred Difficulty
                  </label>
                  <div className="flex gap-2">
                    {['Adaptive', 'Beginner', 'Intermediate', 'Advanced'].map((d) => (
                      <button key={d} onClick={() => setPrefDifficulty(d)} className={`rounded-lg border px-4 py-2 text-sm transition-colors ${prefDifficulty === d ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text-secondary hover:border-primary/40'}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated p-4">
                  <div className="flex items-center gap-3">
                    <BellRing size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Study Reminders</p>
                      <p className="text-xs text-text-secondary">Get notified when it's time to study</p>
                    </div>
                  </div>
                  <Toggle enabled={studyReminders} onChange={() => setStudyReminders(!studyReminders)} />
                </div>
                <Button onClick={() => toast('success', 'Learning preferences saved.')}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'tutor' && (
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <MessageSquare size={16} /> Response Style
                  </label>
                  <div className="flex gap-2">
                    {['Concise', 'Balanced', 'Detailed'].map((s) => (
                      <button key={s} onClick={() => setResponseStyle(s)} className={`rounded-lg border px-4 py-2 text-sm transition-colors ${responseStyle === s ? 'border-plum bg-plum-soft text-plum' : 'border-border bg-surface text-text-secondary hover:border-plum/40'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <BookOpen size={16} /> Explanation Depth
                  </label>
                  <div className="flex gap-2">
                    {['Short', 'Medium', 'Deep'].map((d) => (
                      <button key={d} onClick={() => setExplanationDepth(d)} className={`rounded-lg border px-4 py-2 text-sm transition-colors ${explanationDepth === d ? 'border-plum bg-plum-soft text-plum' : 'border-border bg-surface text-text-secondary hover:border-plum/40'}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-plum" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Citation Preference</p>
                      <p className="text-xs text-text-secondary">Always show source citations in AI responses</p>
                    </div>
                  </div>
                  <Toggle enabled={citationPref} onChange={() => setCitationPref(!citationPref)} />
                </div>
                <Button variant="ai" onClick={() => toast('success', 'AI Tutor preferences saved.')}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {[
                  { label: 'Quiz Reminders', desc: 'Get reminded about pending quizzes', state: quizReminders, set: setQuizReminders, icon: CheckSquare2 },
                  { label: 'Study Reminders', desc: 'Daily study session notifications', state: studyReminders, set: setStudyReminders, icon: BellRing },
                  { label: 'Achievement Notifications', desc: 'Celebrate milestones and streaks', state: achievementNotifs, set: setAchievementNotifs, icon: Trophy },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated p-4">
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-primary" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.label}</p>
                        <p className="text-xs text-text-secondary">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle enabled={item.state} onChange={() => item.set(!item.state)} />
                  </div>
                ))}
                <Button onClick={() => toast('success', 'Notification preferences saved.')}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="rounded-lg border border-border bg-surface-elevated p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock size={18} className="text-text-secondary" />
                    <p className="text-sm font-medium text-text-primary">Data Controls</p>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">Manage how your learning data is used.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toast('info', 'Exporting data...')}>Export My Data</Button>
                    <Button size="sm" variant="secondary" onClick={() => toast('info', 'Clearing search history...')}>Clear History</Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen size={18} className="text-text-secondary" />
                    <p className="text-sm font-medium text-text-primary">Uploaded Materials</p>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">Manage your uploaded learning materials and knowledge base.</p>
                  <Button size="sm" variant="secondary" onClick={() => toast('info', 'Manage materials...')}>Manage Materials</Button>
                </div>
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Trash2 size={18} className="text-danger" />
                    <p className="text-sm font-medium text-danger">Delete Account</p>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => toast('error', 'Account deletion is not available in demo mode.')}
        title="Delete Account?"
        message="This will permanently delete your account, all uploaded materials, quiz history, and progress data. This action cannot be undone."
        confirmLabel="Delete Permanently"
        danger
      />
    </div>
  );
}
