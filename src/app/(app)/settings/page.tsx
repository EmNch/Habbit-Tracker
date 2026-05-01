'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Bell, BellOff } from 'lucide-react';
import { logout } from '@/lib/actions/auth';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export default function SettingsPage() {
  const router = useRouter();
  const { permission, subscribed, requestPermissionAndSubscribe } =
    usePushSubscription();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Setari
      </h1>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Notificari
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {subscribed ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {subscribed
                  ? 'Notificarile sunt active'
                  : 'Notificarile nu sunt activate'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {permission === 'denied'
                  ? 'Notificarile sunt blocate in browser. Activeaza-le din setarile site-ului.'
                  : permission === 'granted'
                    ? 'Permisiunea a fost acordata'
                    : 'Apasa pentru a activa'}
              </p>
            </div>
          </div>
        </div>
        {!subscribed && permission !== 'denied' && (
          <button
            onClick={requestPermissionAndSubscribe}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            Activeaza notificarile
          </button>
        )}
      </div>

      {/* Account */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Cont
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-sm font-medium w-full"
          >
            <LogOut className="w-4 h-4" />
            Deconectare
          </button>
        </div>
      </div>
    </div>
  );
}
