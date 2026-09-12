// Media helpers for the admin CMS: upload bytes to the public "media" storage
// bucket, record metadata in public.media, and resolve ids back to public URLs.
// Mirrors the URL scheme used by src/lib/content.ts.
import { getSupabase } from '../lib/supabase';

export interface MediaRow {
  id: string;
  storage_path: string;
  bucket: string;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
}

const BUCKET = 'media';

/** Public URL for a media row (bucket is public-read). */
export function mediaUrl(m: Pick<MediaRow, 'bucket' | 'storage_path'>): string {
  const base = (import.meta.env.PUBLIC_SUPABASE_URL as string) ?? '';
  return `${base}/storage/v1/object/public/${m.bucket}/${m.storage_path}`;
}

/** Build a fast id -> URL lookup for resolving stored references in editors. */
export async function loadMediaMap(): Promise<Record<string, MediaRow>> {
  const rows = await listMedia();
  const map: Record<string, MediaRow> = {};
  for (const m of rows) map[m.id] = m;
  return map;
}

export async function listMedia(): Promise<MediaRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('media').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as MediaRow[]) ?? [];
}

function slugifyName(name: string): string {
  const dot = name.lastIndexOf('.');
  const stem = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'file';
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  return ext ? `${stem}.${ext}` : stem;
}

/** Read pixel dimensions for raster/vector images; null for non-images. */
async function imageDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith('image/')) return { width: null, height: null };
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return { width: null, height: null };
  }
}

/** Upload a file and create its media row. Returns the created row. */
export async function uploadMedia(file: File, altText?: string, folder: 'uploads' | 'frames' | 'certificates' = 'uploads'): Promise<MediaRow> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase is not configured.');

  const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/avif','application/pdf'];
  if (!allowed.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, GIF, AVIF or PDF file.');
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('Files must be between 1 byte and 10 MB.');
  const { width, height } = await imageDimensions(file);
  if (file.type.startsWith('image/') && (!width || !height || width * height > 40000000)) throw new Error('Use a valid image smaller than 40 megapixels.');
  if (file.type === 'application/pdf' && !(await file.slice(0, 5).text()).startsWith('%PDF-')) throw new Error('This file is not a valid PDF.');
  const safe = slugifyName(file.name);
  const path = `${folder}/${crypto.randomUUID()}-${safe}`;

  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
  if (upErr) throw upErr;

  const { data, error } = await sb.from('media').insert({
    storage_path: path,
    bucket: BUCKET,
    filename: file.name,
    mime_type: file.type || null,
    size_bytes: file.size,
    width,
    height,
    alt_text: altText ?? null,
  }).select().single();

  if (error) {
    // Best-effort cleanup so we never leave an orphaned object.
    await sb.storage.from(BUCKET).remove([path]).catch(() => {});
    throw error;
  }
  return data as MediaRow;
}

/** Remove the stored object and its media row. */
export async function deleteMedia(m: MediaRow): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error: storageError } = await sb.storage.from(m.bucket).remove([m.storage_path]);
  if (storageError) throw storageError;
  const { error } = await sb.from('media').delete().eq('id', m.id);
  if (error) throw error;
}

export async function updateMediaAlt(id: string, alt_text: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('media').update({ alt_text }).eq('id', id);
  if (error) throw error;
}
