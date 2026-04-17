import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create account — TeloHive',
  description: 'Join TeloHive and start booking workspaces that fit your flow.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
