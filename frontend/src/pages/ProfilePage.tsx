import { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Target,
  Calendar,
  Flame,
  Clock,
  CheckSquare,
  Edit2,
  Key,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEducation, setEditEducation] = useState(user?.education || '');

  if (!user) return null;

  const stats = [
    { label: 'Study Streak', value: `${user.studyStreak} days`, icon: Flame, color: 'text-gold', bg: 'bg-gold-soft' },
    { label: 'Total Study Time', value: user.totalStudyTime, icon: Clock, color: 'text-primary', bg: 'bg-primary-soft' },
    { label: 'Quizzes Completed', value: user.quizzesCompleted, icon: CheckSquare, color: 'text-sage', bg: 'bg-sage-soft' },
  ];

  const infoItems = [
    { label: 'Full Name', value: user.name, icon: UserIcon },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Education', value: user.education, icon: GraduationCap },
    { label: 'Learning Goal', value: user.learningGoal, icon: Target },
    { label: 'Joined Date', value: user.joinedDate, icon: Calendar },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account and learning preferences." />

      {/* Profile header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
              {user.avatar}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-text-primary">{user.name}</h2>
              <p className="text-text-secondary mt-1">{user.email}</p>
              <p className="text-sm text-text-secondary mt-2">{user.education}</p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button size="sm" icon={<Edit2 size={14} />} onClick={() => setEditOpen(true)}>Edit Profile</Button>
                <Button size="sm" variant="secondary" icon={<Key size={14} />} onClick={() => setPasswordOpen(true)}>Change Password</Button>
                <Button size="sm" variant="ai" icon={<Sparkles size={14} />} onClick={() => setGoalOpen(true)}>Update Goals</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info table */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Account Information</h2>
          <div className="space-y-4">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                  <item.icon size={16} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary">{item.label}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Full Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Education</label>
            <input
              value={editEducation}
              onChange={(e) => setEditEducation(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={() => { setEditOpen(false); toast('success', 'Profile updated successfully.'); }} className="flex-1">Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-text-primary focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-text-primary focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-border bg-surface py-2.5 px-4 text-text-primary focus:border-primary focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setPasswordOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={() => { setPasswordOpen(false); toast('success', 'Password changed successfully.'); }} className="flex-1">Update Password</Button>
          </div>
        </div>
      </Modal>

      {/* Update Goals Modal */}
      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Update Learning Goals">
        <div className="space-y-3">
          {['University studies', 'Exam preparation', 'Skill development', 'Professional learning', 'Personal learning'].map((goal) => (
            <button
              key={goal}
              onClick={() => { setGoalOpen(false); toast('success', `Learning goal updated to: ${goal}`); }}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                user.learningGoal === goal ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-text-secondary hover:border-primary/40'
              }`}
            >
              <Target size={16} />
              {goal}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
