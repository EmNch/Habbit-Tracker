'use client';

import { useState, useRef, useCallback } from 'react';
import type { EntryValues, HabitFieldDefinition } from '@/lib/types';
import { saveHabitEntry } from '@/lib/actions/entries';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave(
  habitId: string,
  date: string,
  fieldDefinitions: HabitFieldDefinition[],
) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const lastSavedJson = useRef<string>('{}');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldsRef = useRef(fieldDefinitions);
  fieldsRef.current = fieldDefinitions;

  const save = useCallback(
    async (values: EntryValues) => {
      setStatus('saving');
      const result = await saveHabitEntry(habitId, date, values, fieldsRef.current);
      if (result.success) {
        setStatus('saved');
        lastSavedJson.current = JSON.stringify(values);
      } else {
        setStatus('error');
      }
    },
    [habitId, date],
  );

  const scheduleSave = useCallback(
    (values: EntryValues) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const json = JSON.stringify(values);
      if (json === lastSavedJson.current) {
        return;
      }

      timeoutRef.current = setTimeout(() => {
        save(values);
      }, 800);
    },
    [save],
  );

  const immediateSave = useCallback(
    async (values: EntryValues) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      await save(values);
    },
    [save],
  );

  const initializeSaved = useCallback((values: EntryValues) => {
    lastSavedJson.current = JSON.stringify(values);
    setStatus('idle');
  }, []);

  return { status, scheduleSave, immediateSave, initializeSaved };
}
