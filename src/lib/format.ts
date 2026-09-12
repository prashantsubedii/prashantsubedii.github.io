// Small formatting helpers shared by public components.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2024-12-01' -> 'Dec 2024'. Returns '' for null/invalid. */
export function monthYear(date: string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Human date range, e.g. 'Dec 2024 to Present'. */
export function dateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  const s = monthYear(start);
  const e = isCurrent || !end ? 'Present' : monthYear(end);
  if (!s && !e) return '';
  if (!s) return e;
  return `${s} to ${e}`;
}

/** Estimate reading time from markdown/plain text (~200 wpm). */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
