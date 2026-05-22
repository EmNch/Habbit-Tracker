'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import { createDebt, payDebtPartial, deleteDebt } from '@/lib/actions/debts';
import type { Debt, DebtSummary } from '@/lib/types';

function formatLei(cents: number): string {
  return (cents / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function getDueStatus(dueDate: string | null): { label: string; color: string } {
  if (!dueDate) return { label: 'Fără termen', color: 'text-gray-400' };
  const days = daysUntil(dueDate);
  if (days < 0) return { label: `Expirat ${Math.abs(days)} zile`, color: 'text-red-500' };
  if (days === 0) return { label: 'Scadent azi', color: 'text-red-500' };
  if (days <= 7) return { label: `${days} zile`, color: 'text-orange-500' };
  if (days <= 30) return { label: `${days} zile`, color: 'text-amber-500' };
  return { label: `${days} zile`, color: 'text-gray-400' };
}

// =============================================

function AddDebtSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit() {
    if (!name.trim() || !amount) return;
    setSaving(true);
    const fd = new FormData();
    fd.set('name', name);
    fd.set('creditor', creditor);
    fd.set('total_amount', amount);
    fd.set('due_date', dueDate);
    fd.set('notes', notes);
    startTransition(async () => {
      await createDebt(fd);
      setSaving(false);
      setName(''); setCreditor(''); setAmount(''); setDueDate(''); setNotes('');
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl p-5 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datorie nouă</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Trash2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-3">
          <input type="text" placeholder="Nume datorie *" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input type="text" placeholder="Creditor (opțional)" value={creditor} onChange={(e) => setCreditor(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input type="number" step="0.01" min="0" placeholder="Suma totală (lei) *" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input type="text" placeholder="Note (opțional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <button onClick={handleSubmit} disabled={saving || pending || !name.trim() || !amount} className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
          {saving || pending ? 'Se salvează...' : 'Adaugă datoria'}
        </button>
      </div>
    </div>
  );
}

function PayDebtSheet({ debt, open, onClose }: { debt: Debt | null; open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open || !debt) return null;

  const remaining = debt.total_amount_cents - debt.paid_amount_cents;

  function handleSubmit() {
    if (!debt) return;
    const payCents = Math.round(parseFloat(amount) * 100);
    if (!payCents || payCents <= 0) return;
    setSaving(true);
    startTransition(async () => {
      await payDebtPartial(debt.id, payCents);
      setSaving(false);
      setAmount('');
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-2xl p-5 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plată: {debt.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Trash2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-3">Rămas: <span className="font-semibold text-gray-900 dark:text-white">{formatLei(remaining)} lei</span></p>
        <input type="number" step="0.01" min="0.01" max={remaining / 100} placeholder="Suma (lei)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
        <div className="flex gap-2 mt-2">
          {[25, 50, 75, 100].map((pct) => (
            <button key={pct} onClick={() => setAmount((remaining * pct / 100 / 100).toFixed(2))} className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">{pct}%</button>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={saving || pending || !amount} className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
          {saving || pending ? 'Se procesează...' : 'Plătește'}
        </button>
      </div>
    </div>
  );
}

// =============================================

interface DebtsSectionProps {
  debtSummary: DebtSummary;
}

export function DebtsSection({ debtSummary }: DebtsSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [payDebt, setPayDebt] = useState<Debt | null>(null);
  const [pending, startTransition] = useTransition();
  const { debts, totalDebtCents, totalPaidCents, totalRemainingCents } = debtSummary;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total datorii</p>
          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatLei(totalRemainingCents)} lei</p>
          {totalPaidCents > 0 && (
            <p className="text-[10px] text-gray-400">plătit {formatLei(totalPaidCents)} din {formatLei(totalDebtCents)} lei</p>
          )}
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition">
          <Plus className="w-4 h-4" />
          Datorie
        </button>
      </div>

      {debts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Nicio datorie activă</p>
      ) : (
        <div className="space-y-2">
          {debts.map((debt) => {
            const remaining = debt.total_amount_cents - debt.paid_amount_cents;
            const paidPercent = debt.total_amount_cents > 0 ? Math.round((debt.paid_amount_cents / debt.total_amount_cents) * 100) : 0;
            const due = getDueStatus(debt.due_date);
            const isOverdue = debt.due_date && daysUntil(debt.due_date) < 0;

            return (
              <div key={debt.id} className={`rounded-xl border p-3 ${isOverdue ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{debt.name}</p>
                    {debt.creditor && <p className="text-xs text-gray-400">către {debt.creditor}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {remaining > 0 && (
                      <button onClick={() => setPayDebt(debt)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="Plătește">
                        <ChevronRight className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button onClick={() => startTransition(async () => { await deleteDebt(debt.id); })} disabled={pending} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition" title="Șterge">
                      <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{formatLei(debt.paid_amount_cents)} / {formatLei(debt.total_amount_cents)} lei</span>
                  <span className={due.color}>{due.label}</span>
                </div>

                <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${paidPercent >= 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, paidPercent)}%` }} />
                </div>

                {debt.due_date && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Scadent: {new Date(debt.due_date + 'T00:00:00').toLocaleDateString('ro-RO')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddDebtSheet open={showAdd} onClose={() => setShowAdd(false)} />
      <PayDebtSheet debt={payDebt} open={!!payDebt} onClose={() => setPayDebt(null)} />
    </div>
  );
}
