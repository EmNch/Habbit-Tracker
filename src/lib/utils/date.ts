import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return format(d, 'dd MMM yyyy', { locale: ro });
}

export function today(): string {
  return new Date().toLocaleDateString('sv-SE');
}
