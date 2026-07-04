'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { GoogleButton } from './GoogleButton';
import { Spinner } from './Spinner';
import { X, Sparkles, ArrowLeft } from 'lucide-react';

type Mode = 'login' | 'signup';
type Step = 'login' | 'signup' | 'otp' | 'forgot' | 'reset';

interface AuthModalContextValue {
  open: (mode?: Mode) => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');

  const open = useCallback((m: Mode = 'login') => {
    setMode(m);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ open, close }}>
      {children}
      {isOpen && <AuthModalView initialMode={mode} onClose={close} />}
    </AuthModalContext.Provider>
  );
}

function AuthModalView({ initialMode, onClose }: { initialMode: Mode; onClose: () => void }) {
  const { login, register, verifyOtp, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [flowEmail, setFlowEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const goto = (s: Step) => {
    setError('');
    setStep(s);
  };

  const finish = () => {
    onClose();
    router.push('/dashboard');
  };

  const wrap = (fn: () => Promise<void>) => async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const doLogin = wrap(async () => {
    try {
      await login(email, password);
      finish();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403 && err.message === 'EMAIL_NOT_VERIFIED') {
        setFlowEmail(email);
        setNote(`We sent a 4-digit code to ${email}.`);
        setStep('otp');
        return;
      }
      throw err;
    }
  });

  const doSignup = wrap(async () => {
    const res = await register(name, email, password);
    setFlowEmail(res.email);
    setNote(`We sent a 4-digit code to ${res.email}.`);
    setStep('otp');
  });

  const doOtp = wrap(async () => {
    await verifyOtp(flowEmail, code);
    finish();
  });

  const doForgot = wrap(async () => {
    await api.forgotPassword(email);
    setFlowEmail(email);
    setNote(`If an account exists for ${email}, we sent a reset code.`);
    setStep('reset');
  });

  const doReset = wrap(async () => {
    await api.resetPassword(flowEmail, code, newPassword);
    setCode('');
    setPassword('');
    setNote('Password reset — please log in.');
    setStep('login');
  });

  const onGoogle = async (idToken: string) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(idToken);
      finish();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign-in failed.');
      setLoading(false);
    }
  };

  const resend = async () => {
    setNote('');
    try {
      await api.resendOtp(flowEmail);
      setNote('A new code is on its way.');
    } catch {
      /* ignore */
    }
  };

  const titles: Record<Step, { t: string; s: string }> = {
    login: { t: 'Welcome back', s: 'Log in to keep coaching your career.' },
    signup: { t: 'Create your account', s: 'Start with a free AI run — no card required.' },
    otp: { t: 'Verify your email', s: `Enter the 4-digit code we emailed you.` },
    forgot: { t: 'Reset your password', s: 'We’ll email you a 4-digit code.' },
    reset: { t: 'Set a new password', s: 'Enter the code and your new password.' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-[min(92vw,28rem)] animate-fade-up rounded-2xl border border-line bg-surface p-5 sm:p-7 shadow-lift">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink">
          <X className="h-5 w-5" />
        </button>

        {(step === 'otp' || step === 'forgot' || step === 'reset') && (
          <button onClick={() => goto('login')} className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to log in
          </button>
        )}

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-ink">{titles[step].t}</h2>
        <p className="mt-1 text-sm text-ink-soft">{titles[step].s}</p>

        {note && <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{note}</p>}
        {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        {step === 'login' && (
          <form onSubmit={doLogin} className="mt-5 space-y-3.5">
            <Field id="l-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="l-pw" className="label mb-0">Password</label>
                <button type="button" onClick={() => goto('forgot')} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Forgot?
                </button>
              </div>
              <input id="l-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input mt-1.5" placeholder="••••••••" />
            </div>
            <Submit loading={loading}>Log in</Submit>
          </form>
        )}

        {step === 'signup' && (
          <form onSubmit={doSignup} className="mt-5 space-y-3.5">
            <Field id="s-name" label="Name" value={name} onChange={setName} placeholder="Alex Rivera" />
            <Field id="s-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
            <Field id="s-pw" label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
            <Submit loading={loading}>Create account</Submit>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={doOtp} className="mt-5 space-y-3.5">
            <OtpInput value={code} onChange={setCode} />
            <Submit loading={loading}>Verify & continue</Submit>
            <p className="text-center text-sm text-ink-soft">
              Didn’t get it?{' '}
              <button type="button" onClick={resend} className="font-semibold text-brand-600 hover:text-brand-700">Resend code</button>
            </p>
          </form>
        )}

        {step === 'forgot' && (
          <form onSubmit={doForgot} className="mt-5 space-y-3.5">
            <Field id="f-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
            <Submit loading={loading}>Send reset code</Submit>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={doReset} className="mt-5 space-y-3.5">
            <OtpInput value={code} onChange={setCode} />
            <Field id="r-pw" label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
            <Submit loading={loading}>Reset password</Submit>
          </form>
        )}

        {(step === 'login' || step === 'signup') && (
          <>
            <div className="mt-5">
              <GoogleButton
                onCredential={onGoogle}
                onUnavailable={() => setError('Google sign-in isn’t configured on this server yet. Use email/password, or add a Google client ID.')}
              />
            </div>
            <p className="mt-5 text-center text-sm text-ink-soft">
              {step === 'signup' ? 'Already have an account?' : 'New to CheckMyResume?'}{' '}
              <button onClick={() => goto(step === 'signup' ? 'login' : 'signup')} className="font-semibold text-brand-600 hover:text-brand-700">
                {step === 'signup' ? 'Log in' : 'Sign up free'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        className="input"
      />
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="otp" className="label">Verification code</label>
      <input
        id="otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        required
        placeholder="0000"
        className="input text-center text-2xl font-bold tracking-[0.6em]"
      />
    </div>
  );
}

function Submit({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={loading} className="btn-brand w-full py-3">
      {loading ? <Spinner /> : children}
    </button>
  );
}
