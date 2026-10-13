import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayInput } from '@/components/clay/ClayInput';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Unable to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setError('Google sign-in failed. Please try again.');
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
            <h1 className="text-2xl font-bold text-charcoal-900">Welcome back</h1>
            <p className="mt-1 text-sm text-clay-600">Log in to continue your learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ClayInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              error={error && !email ? 'Email is required' : ''}
            />
            <div>
              <ClayInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                error={error && !password ? 'Password is required' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-1.5 text-xs text-clay-500 hover:text-charcoal-700"
              >
                {showPassword ? <EyeOff size={14} className="inline" /> : <Eye size={14} className="inline" />}
                {' '}{showPassword ? 'Hide' : 'Show'} password
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-clay-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-md border-clay-300 text-violet-600 focus:ring-violet-400"
                />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rounded-clay bg-peach-100 px-4 py-3 text-sm text-peach-500">
                {error}
              </div>
            )}

            <ClayButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </ClayButton>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-ivory-200" />
            <span className="text-xs text-clay-400">or</span>
            <div className="h-px flex-1 bg-ivory-200" />
          </div>

          <ClayButton variant="secondary" fullWidth size="lg" onClick={handleGoogle} disabled={loading}>
            <svg className="mr-2 inline" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </ClayButton>

          <p className="text-center text-sm text-clay-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700">
              Create one
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
