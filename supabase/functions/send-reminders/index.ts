import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, icon, user_id, reminder_time, reminder_timezone')
    .eq('reminder_enabled', true)
    .eq('is_active', true);

  if (!habits || habits.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = new Date();

  const dueHabits = habits.filter((habit) => {
    if (!habit.reminder_time) return false;
    const localTime = new Date(
      now.toLocaleString('en-US', { timeZone: habit.reminder_timezone || 'Europe/Bucharest' }),
    );
    const localHH = String(localTime.getHours()).padStart(2, '0');
    const localMM = String(localTime.getMinutes()).padStart(2, '0');
    // reminder_time is stored as 'HH:mm:ss' from Postgres TIME type
    const habitHHmm = habit.reminder_time.substring(0, 5);
    return habitHHmm === `${localHH}:${localMM}`;
  });

  if (dueHabits.length === 0) {
    return new Response(JSON.stringify({ sent: 0, checked: habits.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const byUser = new Map<string, typeof dueHabits>();
  for (const h of dueHabits) {
    if (!byUser.has(h.user_id)) byUser.set(h.user_id, []);
    byUser.get(h.user_id)!.push(h);
  }

  let sentCount = 0;

  for (const [userId, userHabits] of byUser) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (!subs || subs.length === 0) continue;

    for (const habit of userHabits) {
      const payload = JSON.stringify({
        title: `${habit.icon} ${habit.name}`,
        body: `E timpul pentru: ${habit.name}!`,
        url: `/habits/${habit.id}`,
        tag: `reminder-${habit.id}`,
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth_key },
            },
            payload,
          );
          sentCount++;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ sent: sentCount, due: dueHabits.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
