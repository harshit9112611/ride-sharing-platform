import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ collegeEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form, rememberMe);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid email or password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[45%] bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <img src="/logo.png" alt="LNCTShares" className="h-10 w-auto" />
        </div>
        <div className="max-w-sm">
          <h1 className="font-display text-3xl font-bold leading-tight text-white">
            Campus Ride-Sharing Platform
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Connect with peers and share rides across campus conveniently and safely.
          </p>
        </div>
        <p className="text-xs text-slate-500">Trusted by students across campus</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 lg:hidden">
            <img src="/logo.png" alt="LNCTShares" className="h-9 w-auto" />
          </div>

          <h2 className="font-display text-2xl font-bold text-text-primary">Sign in</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-error" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="collegeEmail" className="mb-1.5 block text-sm font-medium text-text-primary">
                College Email
              </label>
              <input
                id="collegeEmail"
                name="collegeEmail"
                type="email"
                autoComplete="email"
                required
                value={form.collegeEmail}
                onChange={handleChange}
                className="input-field"
                placeholder="you@college.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-accent hover:underline">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
