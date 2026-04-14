'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

// ── Validation ────────────────────────────────────────────────────────────────

function validateEmail(v: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    ? null
    : 'Enter a valid email address.';
}

function validatePassword(v: string): string | null {
  return v.length > 0 ? null : 'Password is required.';
}

// ── SVG icons (self-contained, no external dependency) ────────────────────────

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M13 1h10v10H13z" />
      <path fill="#7FBA00" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

function SocialButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="shrink-0">{icon}</span>
      <span>Continue with {label}</span>
    </button>
  );
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#7c3aed" />
      <path d="M8 16L16 8L24 16L16 24Z" fill="white" />
      <circle cx="16" cy="16" r="4" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LoginForm() {
  const { login, isLoading, error: authError } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;
  const isFormValid = !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;
    await login(email, password, rememberMe);
  };

  const handleSocialLogin = async (provider: string) => {
    await login(`user@via-${provider}.com`, `${provider}-oauth`, true);
  };

  const handleForgotPassword = () => {
    showToast('Password reset link sent — check your inbox.', 'info');
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel (desktop only) ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-2xl font-bold tracking-tight">telohive</span>
        </div>

        <div>
          <p className="text-4xl font-semibold leading-snug mb-4">
            Find your perfect workspace, anywhere.
          </p>
          <p className="text-white/70 text-lg leading-relaxed">
            Book coworking spaces, private offices, and meeting rooms in seconds.
          </p>
        </div>

        <div className="flex gap-6 text-white/60 text-sm font-medium">
          <span>10,000+ Spaces</span>
          <span>150+ Cities</span>
          <span>50K+ Members</span>
        </div>
      </div>

      {/* ── Form panel ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Logo size={28} />
            <span className="text-xl font-bold text-gray-900">telohive</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 mb-8 text-sm text-gray-500">
            Sign in to your account to continue.
          </p>

          {/* Auth-level error banner */}
          {authError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-describedby={emailError ? 'email-error' : undefined}
                aria-invalid={emailError ? true : undefined}
                placeholder="you@example.com"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                  emailError
                    ? 'border-red-400 bg-red-50 focus:ring-red-300'
                    : 'border-gray-300 bg-white focus:border-violet-500 focus:ring-violet-500'
                }`}
              />
              {emailError && <FieldError id="email-error" message={emailError} />}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-violet-600 transition-colors hover:text-violet-800"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  aria-invalid={passwordError ? true : undefined}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                    passwordError
                      ? 'border-red-400 bg-red-50 focus:ring-red-300'
                      : 'border-gray-300 bg-white focus:border-violet-500 focus:ring-violet-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {passwordError && (
                <FieldError id="password-error" message={passwordError} />
              )}
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-600">Remember me for 7 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">
              or continue with
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social login */}
          <div className="flex flex-col gap-2.5">
            <SocialButton
              label="Google"
              icon={<GoogleIcon />}
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            />
            <SocialButton
              label="Microsoft"
              icon={<MicrosoftIcon />}
              onClick={() => handleSocialLogin('microsoft')}
              disabled={isLoading}
            />
            <SocialButton
              label="Apple"
              icon={<AppleIcon />}
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
            />
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-violet-600 transition-colors hover:text-violet-800"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
