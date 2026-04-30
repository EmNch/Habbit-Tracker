import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HabitFlow - Autentificare',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
