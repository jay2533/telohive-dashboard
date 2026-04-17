import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — TeloHive',
  description: 'Sign in to your TeloHive account to find and book workspaces.',
};

export default function LoginPage() {
  return <LoginForm />;
}
