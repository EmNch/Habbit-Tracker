'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateReminder(
  habitId: string,
  enabled: boolean,
  time: string | null,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Neautentificat' };

  const { error } = await supabase
    .from('habits')
    .update({
      reminder_enabled: enabled,
      reminder_time: enabled && time ? time : null,
    })
    .eq('id', habitId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/habits/${habitId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Neautentificat' };

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      },
      { onConflict: 'user_id,endpoint' },
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function removePushSubscription(endpoint: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Neautentificat' };

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
