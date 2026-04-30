'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { createHabit } from '@/lib/actions/habits';
import { addField } from '@/lib/actions/fields';
import { FIELD_TYPES, FIELD_TYPE_LABELS } from '@/lib/types';
import type { FieldType, FieldOptions } from '@/lib/types';

interface PendingField {
  key: string;
  label: string;
  type: FieldType;
  options: FieldOptions;
  isRequired: boolean;
}

const ICONS = ['📋', '📖', '🏋️', '🧘', '💤', '🎯', '💪', '🎨', '🎵', '🌱', '💻', '🧠'];

export default function NewHabitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('📋');
  const [fields, setFields] = useState<PendingField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addNewField() {
    const key = `field_${fields.length + 1}_${Date.now()}`;
    setFields([
      ...fields,
      {
        key,
        label: '',
        type: 'text',
        options: {},
        isRequired: false,
      },
    ]);
  }

  function updateField(index: number, updates: Partial<PendingField>) {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Numele este obligatoriu');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('color', color);
    formData.append('icon', icon);

    const result = await createHabit(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const habitId = result.id!;

    // Add all fields - generate key from label at submit time
    for (const field of fields) {
      if (!field.label.trim()) continue;
      const fieldKey = field.label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        || `field_${Date.now()}`;
      await addField(habitId, fieldKey, field.label, field.type, field.options, field.isRequired);
    }

    router.push(`/habits/${habitId}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/habits"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Obicei nou
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Informații de bază
          </h2>

          {/* Icon selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition ${
                    icon === i
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nume obicei *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="ex: Citit carte, Antrenament, Meditație"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
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
              placeholder="Descriere opțională..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Culoare
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Field Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Câmpuri personalizate
            </h2>
            <button
              type="button"
              onClick={addNewField}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Adaugă câmp
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Adaugă câmpuri pentru a personaliza acest obicei
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.key}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(index, {
                          label: e.target.value,
                        })
                      }
                      placeholder="Nume câmp (ex: Pagini citite)"
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(index, {
                          type: e.target.value as FieldType,
                          options:
                            e.target.value === 'slider'
                              ? { min: 0, max: 10, step: 1 }
                              : e.target.value === 'select'
                                ? { options: ['Opțiune 1', 'Opțiune 2'] }
                                : {},
                        })
                      }
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {FIELD_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Type-specific options */}
                {(field.type === 'slider') && (
                  <div className="grid grid-cols-3 gap-2 ml-7">
                    <input
                      type="number"
                      value={field.options.min ?? 0}
                      onChange={(e) =>
                        updateField(index, {
                          options: { ...field.options, min: Number(e.target.value) },
                        })
                      }
                      placeholder="Min"
                      className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                    <input
                      type="number"
                      value={field.options.max ?? 100}
                      onChange={(e) =>
                        updateField(index, {
                          options: { ...field.options, max: Number(e.target.value) },
                        })
                      }
                      placeholder="Max"
                      className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                    <input
                      type="number"
                      value={field.options.step ?? 1}
                      onChange={(e) =>
                        updateField(index, {
                          options: { ...field.options, step: Number(e.target.value) },
                        })
                      }
                      placeholder="Step"
                      className="px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                )}

                {field.type === 'select' && (
                  <div className="ml-7">
                    <input
                      type="text"
                      value={field.options.options?.join(', ') ?? ''}
                      onChange={(e) =>
                        updateField(index, {
                          options: {
                            ...field.options,
                            options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      placeholder="Opțiuni separate prin virgulă (ex: Forță, Cardio, Flexibilitate)"
                      className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 ml-7">
                  <input
                    type="checkbox"
                    id={`required_${index}`}
                    checked={field.isRequired}
                    onChange={(e) =>
                      updateField(index, { isRequired: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`required_${index}`}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    Obligatoriu
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link
            href="/habits"
            className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Anulează
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition"
          >
            {loading ? 'Se creează...' : 'Creează obiceiul'}
          </button>
        </div>
      </form>
    </div>
  );
}
