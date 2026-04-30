'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { DynamicForm } from '@/components/dynamic-form/dynamic-form';
import { FieldChart } from '@/components/analytics/field-chart';
import { useAutoSave } from '@/hooks/use-auto-save';
import { getHabitWithFields } from '@/lib/actions/habits';
import { getEntry, getEntries } from '@/lib/actions/entries';
import { deleteHabit } from '@/lib/actions/habits';
import { formatDisplayDate, today } from '@/lib/utils/date';
import type { HabitWithFields, HabitEntry, EntryValues } from '@/lib/types';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;

  const [habit, setHabit] = useState<HabitWithFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today());
  const [values, setValues] = useState<EntryValues>({});
  const [history, setHistory] = useState<HabitEntry[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fieldDefs = habit?.field_definitions ?? [];
  const { status, scheduleSave, immediateSave, initializeSaved } = useAutoSave(
    habitId,
    selectedDate,
    fieldDefs,
  );

  const loadHabit = useCallback(async () => {
    const data = await getHabitWithFields(habitId);
    setHabit(data);
    setLoading(false);
  }, [habitId]);

  const loadEntry = useCallback(async () => {
    const entry = await getEntry(habitId, selectedDate);
    const entryValues = entry ? (entry.values as EntryValues) : {};
    setValues(entryValues);
    initializeSaved(entryValues);
  }, [habitId, selectedDate, initializeSaved]);

  const loadHistory = useCallback(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const entries = await getEntries(
      habitId,
      thirtyDaysAgo.toISOString().split('T')[0],
      today(),
    );
    setHistory(entries);
  }, [habitId]);

  useEffect(() => {
    loadHabit();
  }, [loadHabit]);

  useEffect(() => {
    if (habit) {
      loadEntry();
    }
  }, [habit, selectedDate, loadEntry]);

  useEffect(() => {
    if (habit) {
      loadHistory();
    }
  }, [habit, loadHistory]);

  function handleChange(key: string, value: string | number | boolean | null) {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    scheduleSave(newValues);
  }

  function navigateDate(days: number) {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yy}-${mm}-${dd}`);
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteHabit(habitId);
    router.push('/habits');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">
          Obiceiul nu a fost găsit
        </p>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 text-sm mt-2 inline-block">
          Înapoi la dashboard
        </Link>
      </div>
    );
  }

  const isToday = selectedDate === today();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {habit.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/habits/${habitId}/edit`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
          >
            <Edit3 className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition ${
              confirmDelete
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {confirmDelete && (
            <span className="text-xs text-red-500">Apasă din nou pentru ștergere</span>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 text-gray-900 dark:text-white font-medium"
          >
            <Calendar className="w-4 h-4" />
            {formatDisplayDate(selectedDate)}
            {isToday && (
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                Azi
              </span>
            )}
          </button>
          <button
            onClick={() => navigateDate(1)}
            disabled={isToday}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Mini Calendar */}
        {showCalendar && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-7 gap-1 text-center">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <span key={i} className="text-xs text-gray-400 py-1">
                  {day}
                </span>
              ))}
              {generateCalendarDays(selectedDate).map((day, idx) => {
                const yy = day.getFullYear();
                const mm = String(day.getMonth() + 1).padStart(2, '0');
                const dd = String(day.getDate()).padStart(2, '0');
                const dateStr = `${yy}-${mm}-${dd}`;
                const hasEntry = history.some((e) => e.entry_date === dateStr);
                const isSelected = dateStr === selectedDate;
                const isFuture = dateStr > today();

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (!isFuture) {
                        setSelectedDate(dateStr);
                        setShowCalendar(false);
                      }
                    }}
                    disabled={isFuture}
                    className={`w-8 h-8 rounded-full text-xs flex items-center justify-center relative transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : hasEntry
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    } ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {day.getDate()}
                    {hasEntry && !isSelected && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <DynamicForm
          fields={habit.field_definitions}
          values={values}
          onChange={handleChange}
        />
      </div>

      {/* Save Status */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          {status === 'idle' && (
            <span className="text-gray-400">Nicio modificare</span>
          )}
          {status === 'saving' && (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
              <span className="text-indigo-500">Se salvează...</span>
            </>
          )}
          {status === 'saved' && (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Salvat</span>
            </>
          )}
          {status === 'error' && (
            <span className="text-red-500">Eroare la salvare</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              showAnalytics
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
          <button
            onClick={() => immediateSave(values)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            <Save className="w-3.5 h-3.5" />
            Salvează
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && habit.field_definitions.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Analytics (ultimele 30 zile)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {habit.field_definitions
              .filter((f) => !f.is_deleted)
              .map((field) => (
                <FieldChart key={field.id} field={field} entries={history} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function generateCalendarDays(dateStr: string): Date[] {
  const date = new Date(dateStr + 'T00:00:00');
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Adjust for Monday start
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: Date[] = [];

  // Previous month days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Fill to 42 cells (6 weeks)
  while (days.length < 42) {
    const d = new Date(year, month + 1, days.length - startOffset - lastDay.getDate() + 1);
    days.push(d);
  }

  return days;
}
