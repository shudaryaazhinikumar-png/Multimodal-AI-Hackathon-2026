import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayInput } from '@/components/clay/ClayInput';
import { useAuth } from '@/hooks/useAuth';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/onboarding');
    } catch {
      setErrors({ form: 'Unable to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-clay bg-violet-600 shadow-clay-raised">
              <Brain size={24} className="text-white" />
            </div>
            <span className="text-lg font-bold text-charcoal-900">AI Study Companion</span>
          </Link>
        </div>

        <ClayCard className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Create your account</h1>
            <p className="mt-1 text-sm text-clay-600">Start your personalized learning journey today.</p>
          </div>

          {errors.form && (
            <div className="rounded-clay bg-peach-100 px-4 py-3 text-sm text-peach-500">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <ClayInput
              label="Full Name"
              placeholder="Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={18} />}
              error={errors.name}
            />
            <ClayInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              error={errors.email}
            />
            <div>
              <ClayInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                error={errors.password}
              />
            </div>
            <ClayInput
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              icon={<Lock size={18} />}
              error={errors.confirm}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-clay-500 hover:text-charcoal-700"
            >
              {showPassword ? <EyeOff size={14} className="inline" /> : <Eye size={14} className="inline" />}
              {' '}{showPassword ? 'Hide' : 'Show'} passwords
            </button>

            <ClayButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </ClayButton>
          </form>

          <p className="text-center text-sm text-clay-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700">
              Log in
            </Link>
          </p>
        </ClayCard>

        <Link to="/" className="mt-4 flex items-center justify-center gap-1 text-sm text-clay-500 hover:text-charcoal-700">
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
