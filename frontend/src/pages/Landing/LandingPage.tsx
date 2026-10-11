import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  Library,
  ClipboardCheck,
  RefreshCw,
  Upload,
  Lightbulb,
  ArrowRight,
  FileText,
  Video,
  Presentation,
  StickyNote,
  Sparkles,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBadge } from '@/components/clay/ClayBadge';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Tutoring',
      desc: 'Ask questions and receive personalized explanations tailored to your level.',
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      icon: Library,
      title: 'Source-Cited Knowledge',
      desc: 'Every important answer connects back to your learning material.',
      color: '#5AAB86',
      bg: '#E0F2ED',
    },
    {
      icon: ClipboardCheck,
      title: 'Adaptive Assessments',
      desc: 'Questions adapt to your performance in real time.',
      color: '#E2795C',
      bg: '#FDE8DD',
    },
    {
      icon: RefreshCw,
      title: 'Personalized Revision',
      desc: 'The system identifies weak areas and recommends what to study next.',
      color: '#E0B23E',
      bg: '#FDF4DC',
    },
  ];

  const steps = [
    { num: '01', title: 'Upload', desc: 'Add your lectures, textbooks, slides, and notes.', icon: Upload },
    { num: '02', title: 'Understand', desc: 'AI processes and indexes your materials.', icon: Brain },
    { num: '03', title: 'Practice', desc: 'Take adaptive assessments tuned to your level.', icon: ClipboardCheck },
    { num: '04', title: 'Improve', desc: 'Get personalized revision recommendations.', icon: TrendingUp },
  ];

  const sourceTypes = [
    { icon: FileText, label: 'PDF', color: '#E2795C' },
    { icon: Video, label: 'Video', color: '#7C3AED' },
    { icon: Presentation, label: 'Slides', color: '#5AAB86' },
    { icon: StickyNote, label: 'Notes', color: '#E0B23E' },
  ];

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 border-b border-ivory-200 bg-ivory-50/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-clay bg-violet-600 shadow-clay-raised">
              <Brain size={22} className="text-white" />
            </div>
            <span className="text-lg font-bold text-charcoal-900">AI Study Companion</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-clay-600 hover:text-charcoal-900">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-clay-600 hover:text-charcoal-900">How It Works</a>
            <a href="#tutor" className="text-sm font-medium text-clay-600 hover:text-charcoal-900">AI Tutor</a>
            <a href="#adaptive" className="text-sm font-medium text-clay-600 hover:text-charcoal-900">Adaptive Learning</a>
            <a href="#knowledge" className="text-sm font-medium text-clay-600 hover:text-charcoal-900">Knowledge Base</a>
          </div>
          <div className="flex items-center gap-3">
            <ClayButton variant="ghost" size="sm" onClick={() => navigate('/login')}>Log In</ClayButton>
            <ClayButton variant="primary" size="sm" onClick={() => navigate('/signup')}>Get Started</ClayButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ClayBadge variant="violet" className="mb-6 px-4 py-2">
                <Sparkles size={14} />
                Powered by Adaptive AI
              </ClayBadge>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
                Your AI Tutor.
                <br />
                <span className="text-violet-600">Built Around the Way You Learn.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-clay-600">
                Turn lectures, textbooks, slides and notes into a personalized learning experience powered by adaptive AI.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ClayButton size="lg" onClick={() => navigate('/signup')}>
                  Start Learning
                  <ArrowRight size={18} className="ml-2 inline" />
                </ClayButton>
                <ClayButton variant="secondary" size="lg" onClick={() => navigate('/demo')}>
                  Try Demo
                </ClayButton>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="space-y-4">
                {/* Documents row */}
                <div className="flex justify-center gap-3">
                  {sourceTypes.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-clay shadow-clay"
                          style={{ backgroundColor: `${s.color}20` }}
                        >
                          <Icon size={24} style={{ color: s.color }} />
                        </div>
                        <span className="text-xs font-medium text-clay-600">{s.label}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Arrow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center"
                >
                  <ChevronDown size={24} className="text-clay-400" />
                </motion.div>

                {/* AI Understanding */}
                <ClayCard raised className="mx-auto max-w-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-clay bg-violet-100 shadow-clay-sm">
                      <Brain size={24} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-900">AI Understanding</p>
                      <p className="text-xs text-clay-500">Source-cited knowledge base</p>
                    </div>
                  </div>
                </ClayCard>

                {/* Arrow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex justify-center"
                >
                  <ChevronDown size={24} className="text-clay-400" />
                </motion.div>

                {/* Personalized Learning */}
                <ClayCard className="mx-auto max-w-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-clay bg-mint-100 shadow-clay-sm">
                      <Lightbulb size={24} className="text-mint-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-900">Personalized Learning</p>
                      <p className="text-xs text-clay-500">Adaptive tutoring & assessment</p>
                    </div>
                  </div>
                </ClayCard>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">Everything you need to learn smarter</h2>
            <p className="mt-4 text-lg text-clay-600">Four powerful features working together as one coherent learning experience.</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <ClayCard key={f.title} hover delay={i * 0.1}>
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-clay shadow-clay-sm"
                    style={{ backgroundColor: f.bg }}
                  >
                    <Icon size={26} style={{ color: f.color }} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-charcoal-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-clay-600">{f.desc}</p>
                </ClayCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-clay-600">From raw materials to mastery in four steps.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative">
                  {i < steps.length - 1 && (
                    <div className="absolute left-full top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-clay-300 to-transparent md:block" />
                  )}
                  <ClayCard hover delay={i * 0.1} className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-clay bg-violet-100 shadow-clay-sm">
                      <Icon size={24} className="text-violet-600" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-violet-600">{step.num}</p>
                    <h3 className="mt-1 text-lg font-bold text-charcoal-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-clay-600">{step.desc}</p>
                  </ClayCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Tutor Showcase */}
      <section id="tutor" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ClayBadge variant="violet" className="mb-4">AI Tutor</ClayBadge>
              <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
                Ask anything. Get answers grounded in your materials.
              </h2>
              <p className="mt-4 text-lg text-clay-600">
                Every answer cites the exact source — lecture, textbook page, or slide — so you always know where the knowledge comes from.
              </p>
              <ClayButton className="mt-6" onClick={() => navigate('/signup')}>
                Try AI Tutor
                <ArrowRight size={18} className="ml-2 inline" />
              </ClayButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ClayCard className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">A</div>
                  <div className="flex-1 rounded-clay bg-violet-600 p-3 text-sm text-white shadow-clay-raised">
                    Explain backpropagation simply.
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                    <Brain size={16} className="text-violet-600" />
                  </div>
                  <div className="flex-1 rounded-clay bg-ivory-100 p-3 text-sm text-charcoal-800 shadow-clay-pressed">
                    Think of backpropagation as working backward through a model to understand which parameters contributed to the error...
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-11">
                  <ClayBadge variant="info">
                    <FileText size={12} />
                    Lecture 04 · Page 18
                  </ClayBadge>
                </div>
              </ClayCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Knowledge Base Showcase */}
      <section id="knowledge" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">Your personal knowledge base</h2>
            <p className="mt-4 text-lg text-clay-600">All your learning materials, unified and searchable.</p>
          </motion.div>
          <div className="grid items-center gap-8 lg:grid-cols-3">
            <ClayCard className="text-center">
              <div className="flex flex-wrap justify-center gap-3">
                {sourceTypes.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className="flex h-12 w-12 items-center justify-center rounded-clay shadow-clay-sm"
                      style={{ backgroundColor: `${s.color}20` }}
                    >
                      <Icon size={20} style={{ color: s.color }} />
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-clay-600">Lectures, textbooks, slides & notes</p>
            </ClayCard>
            <div className="flex flex-col items-center gap-2">
              <ChevronDown size={28} className="text-violet-400" />
              <ClayCard raised className="w-full text-center">
                <p className="font-bold text-charcoal-900">Unified Knowledge Base</p>
                <p className="mt-1 text-xs text-clay-500">Searchable · Source-cited · AI-ready</p>
              </ClayCard>
              <ChevronDown size={28} className="text-violet-400" />
            </div>
            <div className="space-y-3">
              <ClayCard className="flex items-center gap-3 py-4">
                <MessageSquare size={20} className="text-violet-600" />
                <span className="text-sm font-medium text-charcoal-900">AI Tutor</span>
              </ClayCard>
              <ClayCard className="flex items-center gap-3 py-4">
                <ClipboardCheck size={20} className="text-peach-400" />
                <span className="text-sm font-medium text-charcoal-900">Adaptive Assessment</span>
              </ClayCard>
            </div>
          </div>
        </div>
      </section>

      {/* Adaptive Learning Showcase */}
      <section id="adaptive" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="space-y-3">
                {[
                  { label: 'Beginner', color: '#5AAB86', bg: '#E0F2ED', desc: 'Building foundations' },
                  { label: 'Intermediate', color: '#E0B23E', bg: '#FDF4DC', desc: 'Strengthening understanding' },
                  { label: 'Advanced', color: '#E2795C', bg: '#FDE8DD', desc: 'Mastering complexity' },
                ].map((level, i) => (
                  <motion.div
                    key={level.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <ClayCard className="flex items-center gap-4" style={{ backgroundColor: level.bg }}>
                      <div className="flex-1">
                        <p className="font-bold text-charcoal-900">{level.label}</p>
                        <p className="text-xs text-clay-600">{level.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-white/50">
                          <div className="h-full rounded-full" style={{ width: `${(i + 1) * 33}%`, backgroundColor: level.color }} />
                        </div>
                      </div>
                    </ClayCard>
                    {i < 2 && <div className="flex justify-center py-1"><ChevronDown size={20} className="text-clay-400" /></div>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <ClayBadge variant="violet" className="mb-4">Adaptive Learning</ClayBadge>
              <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
                Difficulty that adapts to you.
              </h2>
              <p className="mt-4 text-lg text-clay-600">
                The assessment engine tracks your performance and adjusts question difficulty in real time — so you're always challenged at the right level.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <ClayCard raised className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-charcoal-900 sm:text-4xl">
                Stop studying harder.
                <br />
                <span className="text-violet-600">Start learning smarter.</span>
              </h2>
              <ClayButton size="lg" className="mt-8" onClick={() => navigate('/signup')}>
                Create Your Free Account
                <ArrowRight size={18} className="ml-2 inline" />
              </ClayButton>
            </motion.div>
          </ClayCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ivory-200 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-clay bg-violet-600 shadow-clay-sm">
                  <Brain size={16} className="text-white" />
                </div>
                <span className="font-bold text-charcoal-900">AI Study Companion</span>
              </div>
              <p className="mt-3 text-sm text-clay-500">Adaptive learning powered by AI.</p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-charcoal-900">Product</p>
              <ul className="space-y-2 text-sm text-clay-600">
                <li><button onClick={() => navigate('/signup')} className="hover:text-charcoal-900">AI Tutor</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-charcoal-900">Knowledge Base</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-charcoal-900">Assessments</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-charcoal-900">Progress</button></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-charcoal-900">Resources</p>
              <ul className="space-y-2 text-sm text-clay-600">
                <li><a href="#how-it-works" className="hover:text-charcoal-900">How It Works</a></li>
                <li><button onClick={() => navigate('/demo')} className="hover:text-charcoal-900">Learning</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-ivory-200 pt-6 text-center text-xs text-clay-400">
            © 2026 AI Study Companion. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
