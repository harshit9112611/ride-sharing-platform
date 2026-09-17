import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/auth';

export default function VerifyEmail() {
  const { search } = useLocation();
  const token = new URLSearchParams(search).get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('The verification link is missing a token.');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Unable to verify your email.');
      }
    }

    verify();
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error('Enter your college email address');
      return;
    }

    setResending(true);
    try {
      const { data } = await authApi.resendVerification(email);
      toast.success(data.message || 'Verification email sent');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to resend the verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent" />
            <h1 className="mt-5 font-display text-2xl font-bold">Verifying your email</h1>
            <p className="mt-2 text-sm text-text-secondary">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-5 font-display text-2xl font-bold">Email verified</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Your email is verified. You can now sign in and post rides.
            </p>
            <Link to="/login" className="btn-accent mt-6 inline-flex px-5 py-3">
              Go to login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-error" />
            <h1 className="mt-5 font-display text-2xl font-bold">Verification failed</h1>
            <p className="mt-2 text-sm text-text-secondary">{message}</p>

            <form onSubmit={handleResend} className="mt-6 space-y-3 text-left">
              <label htmlFor="email" className="block text-sm font-medium">
                Resend verification email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-field"
                placeholder="you@college.edu"
              />
              <button type="submit" disabled={resending} className="btn-accent w-full py-3">
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Resend verification email
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
