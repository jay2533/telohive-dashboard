import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — Telohive',
  description: 'Sign in to your Telohive account to find and book workspaces.',
};

export default function LoginPage() {
  return <LoginForm />;
}
