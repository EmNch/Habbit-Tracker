import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return NextResponse.json({ error: 'Neautentificat' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');

  let query = supabase
    .from('transactions')
    .select('*, category:budget_categories(*)')
    .eq('user_id', user.user.id);

  if (month) {
    const date = new Date(month + '-01');
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('sv-SE');
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).toLocaleDateString('sv-SE');
    query = query.gte('transaction_date', start).lt('transaction_date', end);
  }

  const { data } = await query.order('transaction_date', { ascending: false });

  const transactions = data ?? [];

  const header = 'Dată,Tip,Categorie,Sumă (RON),Notă';
  const rows = transactions.map((t: any) => {
    const amount = (t.amount_cents / 100).toFixed(2);
    const kind = t.kind === 'expense' ? 'Cheltuială' : 'Venit';
    const catName = t.category?.name || '';
    const note = (t.note || '').replace(/"/g, '""');
    return `${t.transaction_date},${kind},"${catName}",${amount},"${note}"`;
  });

  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="buget-${month || 'tot'}.csv"`,
    },
  });
}
