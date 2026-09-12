// Documented MyMemory GET API: at most 500 UTF-8 bytes per segment.
const CACHE_KEY = 'portfolio:ne:v1';
const cache = new Map<string, string>();
try {
  const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  if (Array.isArray(saved)) for (const pair of saved.slice(-1000)) {
    if (Array.isArray(pair) && pair.length === 2 && pair.every(v => typeof v === 'string')) cache.set(pair[0], pair[1]);
  }
} catch { /* Storage may be disabled. */ }

export function translationChunks(text: string): string[] {
  const chunks: string[] = [];
  const encoder = new TextEncoder();
  let current = '';
  for (const token of text.match(/\S+\s*|\s+/g) ?? []) {
    if (encoder.encode(current + token).length > 450 && current) { chunks.push(current); current = ''; }
    for (const char of token) {
      if (encoder.encode(current + char).length > 450) { chunks.push(current); current = ''; }
      current += char;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function translateText(text: string, signal: AbortSignal): Promise<string> {
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
  const known = cache.get(text);
  if (known) return known;
  const output: string[] = [];
  for (const chunk of translationChunks(text)) {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', chunk.trim());
    url.searchParams.set('langpair', 'en|ne');
    const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
    if (!response.ok) throw new Error('Translation service unavailable');
    const data = await response.json();
    const result = data.responseData?.translatedText;
    if (Number(data.responseStatus) !== 200 || data.quotaFinished || typeof result !== 'string' || !result.trim()) throw new Error('Translation service limit reached');
    output.push((chunk.match(/^\s*/)?.[0] ?? '') + result + (chunk.match(/\s*$/)?.[0] ?? ''));
  }
  const translated = output.join('');
  cache.set(text, translated);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify([...cache].slice(-1000))); } catch { /* Cache is optional. */ }
  return translated;
}
