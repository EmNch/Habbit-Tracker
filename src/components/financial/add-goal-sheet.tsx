'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { createSavingsGoal } from '@/lib/actions/financial';

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💻', '📱', '🏖️', '💰', '🎁', '⭐'];
const GOAL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'];

interface AddGoalSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AddGoalSheet({ open, onClose }: AddGoalSheetProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#6366f1');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit() {
    if (!name.trim() || !targetAmount) return;
    setSaving(true);
    const fd = new FormData();
    fd.set('name', name);
    fd.set('target_amount', targetAmount);
    fd.set('icon', icon);
    fd.set('color', color);
    fd.set('deadline', deadline);
    startTransition(async () => {
      await createSavingsGoal(fd);
      setSaving(false);
      setName('');
      setTargetAmount('');
      setIcon('🎯');
      setColor('#6366f1');
      setDeadline('');
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--surface)] rounded-t-3xl p-5 pb-8 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Obiectiv de economii</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nume obiectiv *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Suma țintă (lei) *"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Icon</p>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition ${
                    icon === i ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Culoare</p>
            <div className="flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || pending || !name.trim() || !targetAmount}
          className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
        >
          {saving || pending ? 'Se salvează...' : 'Creează obiectivul'}
        </button>
      </div>
    </div>
  );
}
