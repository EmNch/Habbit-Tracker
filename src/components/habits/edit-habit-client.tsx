'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { updateHabit } from '@/lib/actions/habits';
import { addField, softDeleteField } from '@/lib/actions/fields';
import { FIELD_TYPES, FIELD_TYPE_LABELS } from '@/lib/types';
import { ReminderSettings } from '@/components/habits/reminder-settings';
import type { HabitWithFields, FieldType, FieldOptions } from '@/lib/types';

interface NewField {
  label: string;
  type: FieldType;
  options: FieldOptions;
  isRequired: boolean;
}

export function EditHabitClient({ habit: initialHabit }: { habit: HabitWithFields }) {
  const router = useRouter();
  const habitId = initialHabit.id;

  const [habit, setHabit] = useState(initialHabit);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialHabit.name);
  const [description, setDescription] = useState(initialHabit.description);
  const [newField, setNewField] = useState<NewField>({
    label: '',
    type: 'text',
    options: {},
    isRequired: false,
  });
  const [error, setError] = useState('');

  async function handleSaveBasic(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('color', habit.color);
    formData.append('icon', habit.icon);
    await updateHabit(habitId, formData);
    setSaving(false);
  }

  const reloadHabit = useCallback(async () => {
    const { getHabitWithFields } = await import('@/lib/actions/habits');
    const data = await getHabitWithFields(habitId);
    if (data) setHabit(data);
  }, [habitId]);

  async function handleAddField() {
    if (!newField.label.trim()) return;
    const key = newField.label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    setError('');
    const result = await addField(
      habitId,
      key,
      newField.label,
      newField.type,
      newField.options,
      newField.isRequired,
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setNewField({ label: '', type: 'text', options: {}, isRequired: false });
    reloadHabit();
  }

  async function handleDeleteField(fieldId: string) {
    await softDeleteField(fieldId, habitId);
    reloadHabit();
  }

  return (
    <>
      {/* Basic Info */}
      <form onSubmit={handleSaveBasic} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Informații de bază
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nume
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descriere
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition"
        >
          {saving ? 'Se salvează...' : 'Salvează'}
        </button>
      </form>

      {/* Reminder Settings */}
      <ReminderSettings
        habitId={habitId}
        initialEnabled={habit.reminder_enabled}
        initialTime={habit.reminder_time}
      />

      {/* Field Definitions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Câmpuri ({habit.field_definitions.length})
        </h2>

        <div className="space-y-2">
          {habit.field_definitions.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {field.field_label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {FIELD_TYPE_LABELS[field.field_type]}
                </span>
                {field.is_required && (
                  <span className="text-xs text-red-500 ml-1">*obligatoriu</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteField(field.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition"
                title="Șterge câmp (soft delete - istoricul se păstrează)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Adaugă câmp nou
          </h3>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs p-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              placeholder="Nume câmp"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select
              value={newField.type}
              onChange={(e) =>
                setNewField({
                  ...newField,
                  type: e.target.value as FieldType,
                  options:
                    e.target.value === 'slider'
                      ? { min: 0, max: 10, step: 1 }
                      : e.target.value === 'select'
                        ? { options: ['Opțiune 1'] }
                        : {},
                })
              }
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {FIELD_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {newField.type === 'slider' && (
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={newField.options.min ?? 0}
                onChange={(e) =>
                  setNewField({ ...newField, options: { ...newField.options, min: Number(e.target.value) } })
                }
                placeholder="Min"
                className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
              />
              <input
                type="number"
                value={newField.options.max ?? 100}
                onChange={(e) =>
                  setNewField({ ...newField, options: { ...newField.options, max: Number(e.target.value) } })
                }
                placeholder="Max"
                className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
              />
              <input
                type="number"
                value={newField.options.step ?? 1}
                onChange={(e) =>
                  setNewField({ ...newField, options: { ...newField.options, step: Number(e.target.value) } })
                }
                placeholder="Step"
                className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
              />
            </div>
          )}

          {newField.type === 'select' && (
            <input
              type="text"
              value={newField.options.options?.join(', ') ?? ''}
              onChange={(e) =>
                setNewField({
                  ...newField,
                  options: { ...newField.options, options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) },
                })
              }
              placeholder="Opțiuni separate prin virgulă"
              className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
            />
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={newField.isRequired}
                onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
              />
              Obligatoriu
            </label>
            <button
              type="button"
              onClick={handleAddField}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Adaugă
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
