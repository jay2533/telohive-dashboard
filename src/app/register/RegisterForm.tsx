'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

// ── Validation ────────────────────────────────────────────────────────────────

function validateName(v: string): string | null {
  if (v.trim().length < 2) return 'Full name must be at least 2 characters.';
  return null;
}

function validateEmail(v: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    ? null
    : 'Enter a valid email address.';
}

function validatePassword(v: string): string | null {
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(v)) return 'Password must include at least one letter.';
  if (!/[0-9]/.test(v)) return 'Password must include at least one number.';
  return null;
}

function validatePhone(v: string): string | null {
  const digits = v.replace(/\D/g, '');
  if (digits.length === 0) return 'Phone number is required.';
  if (digits.length < 10) return 'Enter a valid phone number (at least 10 digits).';
  return null;
}

function validateConfirm(password: string, confirm: string): string | null {
  return confirm === password ? null : 'Passwords do not match.';
}

// ── Password strength ─────────────────────────────────────────────────────────

function passwordStrength(v: string): { score: number; label: string; color: string } {
  if (v.length === 0) return { score: 0, label: '', color: '' };
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
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

function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  show,
  onToggleShow,
  error,
  errorId,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  show: boolean;
  onToggleShow: () => void;
  error: string | null;
  errorId: string;
  autoComplete: string;
  placeholder: string;
}) {
  const inputBase = 'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors';
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          placeholder={placeholder}
          className={`${inputBase} pr-10 ${
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-300'
              : 'border-gray-300 bg-white focus:ring-indigo-500'
          }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition-colors hover:text-gray-600"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Touched = {
  name: boolean;
  phone: boolean;
  email: boolean;
  password: boolean;
  confirm: boolean;
};

export default function RegisterForm() {
  const { register, isLoading, error: authError } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<Touched>({
    name: false,
    phone: false,
    email: false,
    password: false,
    confirm: false,
  });

  const touch = (field: keyof Touched) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const nameError    = touched.name    ? validateName(name)                 : null;
  const phoneError   = touched.phone   ? validatePhone(phone)               : null;
  const emailError   = touched.email   ? validateEmail(email)               : null;
  const passwordError = touched.password ? validatePassword(password)       : null;
  const confirmError = touched.confirm ? validateConfirm(password, confirm) : null;

  const isFormValid =
    !validateName(name) &&
    !validatePhone(phone) &&
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validateConfirm(password, confirm);

  const strength = passwordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, password: true, confirm: true });
    if (!isFormValid) return;
    await register({ name, phone, email, password });
  };

  const inputBase = 'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors';
  const inputNormal = `${inputBase} border-gray-300 bg-white focus:ring-indigo-500`;
  const inputError  = `${inputBase} border-red-400 bg-red-50 focus:ring-red-300`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl p-8">

          {/* Wordmark + product line */}
          <div className="mb-8">
            <p className="text-xl font-bold text-gray-900 tracking-tight mb-1">TeloHive</p>
            <p className="text-sm text-gray-500">Find and book workspace by the hour or day.</p>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">It&apos;s free to sign up.</p>

          {/* Auth-level error */}
          {authError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => touch('name')}
                aria-describedby={nameError ? 'name-error' : undefined}
                aria-invalid={nameError ? true : undefined}
                placeholder="Jane Smith"
                className={nameError ? inputError : inputNormal}
              />
              {nameError && <FieldError id="name-error" message={nameError} />}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => touch('phone')}
                aria-describedby={phoneError ? 'phone-error' : undefined}
                aria-invalid={phoneError ? true : undefined}
                placeholder="+1 (555) 000-0000"
                className={phoneError ? inputError : inputNormal}
              />
              {phoneError && <FieldError id="phone-error" message={phoneError} />}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch('email')}
                aria-describedby={emailError ? 'email-error' : undefined}
                aria-invalid={emailError ? true : undefined}
                placeholder="you@example.com"
                className={emailError ? inputError : inputNormal}
              />
              {emailError && <FieldError id="email-error" message={emailError} />}
            </div>

            {/* Password */}
            <div>
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                onBlur={() => touch('password')}
                show={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                error={passwordError}
                errorId="password-error"
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((segment) => (
                      <div
                        key={segment}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          segment <= strength.score ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-gray-500">
                      Strength:{' '}
                      <span className="font-medium text-gray-700">{strength.label}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <PasswordInput
              id="confirm-password"
              label="Confirm password"
              value={confirm}
              onChange={setConfirm}
              onBlur={() => touch('confirm')}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              error={confirmError}
              errorId="confirm-error"
              autoComplete="new-password"
              placeholder="Repeat your password"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-xs text-gray-400">
              By signing up you agree to our{' '}
              <span className="text-indigo-600 cursor-pointer hover:underline">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-indigo-600 cursor-pointer hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
