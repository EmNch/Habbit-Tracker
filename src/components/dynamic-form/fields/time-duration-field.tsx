'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { FieldProps } from './types';

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}

export function TimeDurationField({ field, value, onChange }: FieldProps) {
  const totalMinutes = (value as number) ?? 0;
  const [hours, setHours] = useState(Math.floor(totalMinutes / 60));
  const [minutes, setMinutes] = useState(totalMinutes % 60);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
  }, [totalMinutes]);

  const commitManual = useCallback(
    (h: number, m: number) => {
      const total = Math.max(0, h * 60 + m);
      onChange(total);
    },
    [onChange],
  );

  function handleHourChange(v: string) {
    const h = Math.max(0, parseInt(v) || 0);
    setHours(h);
    commitManual(h, minutes);
  }

  function handleMinuteChange(v: string) {
    const m = Math.max(0, Math.min(59, parseInt(v) || 0));
    setMinutes(m);
    commitManual(hours, m);
  }

  // Timer controls
  function startTimer() {
    startRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }

  function pauseTimer() {
    setRunning(false);
  }

  function commitTimer() {
    const total = hours * 60 + minutes + Math.floor(elapsed / 60);
    onChange(total);
    setHours(Math.floor(total / 60));
    setMinutes(total % 60);
    setElapsed(0);
    setRunning(false);
  }

  function resetTimer() {
    setRunning(false);
    setElapsed(0);
    onChange(0);
    setHours(0);
    setMinutes(0);
  }

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(secs);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const displayMinutes = hours * 60 + minutes + Math.floor(elapsed / 60);
  const displaySecs = elapsed % 60;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Timer display */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-3 text-center">
        <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white tabular-nums">
          {String(Math.floor(displayMinutes / 60)).padStart(2, '0')}:
          {String(displayMinutes % 60).padStart(2, '0')}
          {running && <span className="text-indigo-500">:{String(displaySecs).padStart(2, '0')}</span>}
        </span>
        {totalMinutes > 0 && !running && elapsed === 0 && (
          <p className="text-xs text-gray-400 mt-1">Total: {formatDuration(totalMinutes)}</p>
        )}
      </div>

      {/* Timer buttons */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {!running ? (
          <button
            type="button"
            onClick={startTimer}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              pauseTimer();
              commitTimer();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition"
          >
            <Pause className="w-4 h-4" />
            Stop
          </button>
        )}
        <button
          type="button"
          onClick={resetTimer}
          className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Manual input */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            min={0}
            value={hours || ''}
            onChange={(e) => handleHourChange(e.target.value)}
            placeholder="0"
            disabled={running}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50"
          />
          <span className="text-xs text-gray-400 block text-center mt-0.5">ore</span>
        </div>
        <span className="text-lg font-bold text-gray-400 mt-[-16px]">:</span>
        <div className="flex-1">
          <input
            type="number"
            min={0}
            max={59}
            value={minutes || ''}
            onChange={(e) => handleMinuteChange(e.target.value)}
            placeholder="0"
            disabled={running}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:opacity-50"
          />
          <span className="text-xs text-gray-400 block text-center mt-0.5">minute</span>
        </div>
      </div>
    </div>
  );
}
