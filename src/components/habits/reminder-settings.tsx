'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushSubscription } from '@/hooks/use-push-subscription';
import { updateReminder } from '@/lib/actions/reminders';

interface ReminderSettingsProps {
  habitId?: string;
  initialEnabled?: boolean;
  initialTime?: string | null;
  onChange?: (enabled: boolean, time: string | null) => void;
}

export function ReminderSettings({
  habitId,
  initialEnabled = false,
  initialTime = null,
  onChange,
}: ReminderSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime || '09:00');
  const [saving, setSaving] = useState(false);
  const [timezone] = useState(
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Europe/Bucharest',
  );
  const { permission, subscribed, requestPermissionAndSubscribe } =
    usePushSubscription();

  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  useEffect(() => {
    if (initialTime) setTime(initialTime);
  }, [initialTime]);

  const handleToggle = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    if (newEnabled && permission !== 'granted') {
      const ok = await requestPermissionAndSubscribe();
      if (!ok) {
        setEnabled(false);
        return;
      }
    }

    if (habitId) {
      setSaving(true);
      await updateReminder(habitId, newEnabled, newEnabled ? time : null);
      setSaving(false);
    }

    onChange?.(newEnabled, newEnabled ? time : null);
  };

  const handleTimeChange = async (newTime: string) => {
    setTime(newTime);

    if (habitId && enabled) {
      setSaving(true);
      await updateReminder(habitId, true, newTime);
      setSaving(false);
    }

    onChange?.(enabled, newTime);
  };

  const needsPermission = enabled && permission !== 'granted';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-5 h-5 text-indigo-600" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Remindere
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Primeste notificari la ora setata
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {needsPermission && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            Notificarile nu sunt activate. Permite notificarile pentru a primi
            remindere.
          </p>
          <button
            type="button"
            onClick={requestPermissionAndSubscribe}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Permite notificarile
          </button>
        </div>
      )}

      {enabled && permission === 'granted' && !subscribed && (
        <button
          type="button"
          onClick={requestPermissionAndSubscribe}
          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
            Activeaza notificarile push
        </button>
      )}

      {enabled && subscribed && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ora reminder-ului
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fus orar: {timezone}
          </p>
        </div>
      )}

      {enabled && permission === 'denied' && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            Notificarile sunt blocate. Te rog sa le activezi din setarile
            browser-ului (Site Settings &rarr; Notifications).
          </p>
        </div>
      )}

      {saving && (
        <p className="text-xs text-gray-400">Se salveaza...</p>
      )}

      {/* Hidden inputs for form submission */}
      {onChange && (
        <>
          <input type="hidden" name="reminder_enabled" value={String(enabled)} />
          <input type="hidden" name="reminder_time" value={enabled ? time : ''} />
          <input type="hidden" name="reminder_timezone" value={timezone} />
        </>
      )}
    </div>
  );
}
