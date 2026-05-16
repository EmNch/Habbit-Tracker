export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parseCents(display: string): number {
  const cleaned = display.replace(/\./g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned) * 100) || 0;
}
