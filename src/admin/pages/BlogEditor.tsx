import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { Button, Field, Input, Textarea, TagInput, Select, Modal, useToast, useConfirm } from '../ui';
import { MediaPicker } from '../MediaPicker';
import { readingMinutes } from '../../lib/format';

type Status = 'draft' | 'published' | 'archived';

interface Post {
  id?: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_media_id: string | null;
  tags: string[];
  status: Status;
  published_at: string | null;
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image_media_id: string | null;
  is_indexable: boolean;
}

const EMPTY: Post = {
  slug: '', title: '', excerpt: '', body: '', cover_media_id: null, tags: [],
  status: 'draft', published_at: null, reading_minutes: null, seo_title: '',
  seo_description: '', seo_image_media_id: null, is_indexable: true,
};

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

const STATUS_LABEL: Record<Status, string> = { draft: 'Draft', published: 'Published', archived: 'Archived' };

export default function BlogEditor() {
  const sb = getSupabase();
  const { push } = useToast();
  const confirm = useConfirm();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!sb) { setLoading(false); return; }
    const { data, error } = await sb.from('blog_posts').select('*').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
    if (error) push('error', error.message);
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const set = <K extends keyof Post>(k: K, v: Post[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const openNew = () => { setDraft({ ...EMPTY }); setIsNew(true); setSlugTouched(false); };
  const openEdit = (p: Post) => { setDraft({ ...p }); setIsNew(false); setSlugTouched(true); };

  const save = async () => {
    if (!sb || !draft) return;
    if (!draft.title.trim()) { push('error', 'Title is required.'); return; }
    const slug = (draft.slug.trim() || slugify(draft.title));
    if (!slug) { push('error', 'A valid slug is required.'); return; }
    setSaving(true);
    const publishedAt = draft.status === 'published' ? (draft.published_at ?? new Date().toISOString()) : draft.published_at;
    const payload = {
      slug, title: draft.title.trim(), excerpt: draft.excerpt || null, body: draft.body,
      cover_media_id: draft.cover_media_id, tags: draft.tags, status: draft.status,
      published_at: publishedAt, reading_minutes: readingMinutes(draft.body),
      seo_title: draft.seo_title || null, seo_description: draft.seo_description || null,
      seo_image_media_id: draft.seo_image_media_id, is_indexable: draft.is_indexable,
    };
    if (isNew) {
      const { data, error } = await sb.from('blog_posts').insert(payload).select().single();
      if (error) { push('error', error.code === '23505' ? 'That slug is already taken.' : error.message); setSaving(false); return; }
      setPosts((xs) => [data as Post, ...xs]);
    } else {
      const { error } = await sb.from('blog_posts').update(payload).eq('id', draft.id as string);
      if (error) { push('error', error.code === '23505' ? 'That slug is already taken.' : error.message); setSaving(false); return; }
      setPosts((xs) => xs.map((p) => (p.id === draft.id ? { ...p, ...payload } : p)));
    }
    setSaving(false); setDraft(null); push('success', 'Saved.');
  };

  const remove = async (p: Post) => {
    if (!sb) return;
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const { error } = await sb.from('blog_posts').delete().eq('id', p.id as string);
    if (error) { push('error', error.message); return; }
    setPosts((xs) => xs.filter((x) => x.id !== p.id));
    push('success', 'Deleted.');
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Blog</h1>
          <p className="page-sub">Write posts with drafts, tags, cover image, and per-post SEO. Only published posts appear on the site.</p>
        </div>
        <Button onClick={openNew}><Plus size={16} /> New post</Button>
      </div>

      {posts.length ? (
        <div className="row-list">
          {posts.map((p) => (
            <div key={p.id} className="row-item card">
              <div className="grow">
                <div className="row-title">{p.title}</div>
                <div className="row-meta">/{p.slug}{p.reading_minutes ? ` · ${p.reading_minutes} min` : ''}</div>
              </div>
              <span className={`status-badge ${p.status}`}>{STATUS_LABEL[p.status]}</span>
              <div className="row-actions">
                <button className="icon-btn" aria-label="Edit" onClick={() => openEdit(p)}><Pencil size={16} /></button>
                <button className="icon-btn danger" aria-label="Delete" onClick={() => remove(p)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="empty card">No posts yet. Write your first one.</div>}

      {draft ? (
        <Modal title={isNew ? 'New post' : 'Edit post'} wide onClose={() => setDraft(null)}
          footer={<><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={save} loading={saving}>Save</Button></>}>
          <div className="form-grid">
            <Field label="Title">
              <Input value={draft.title} autoFocus
                onChange={(e) => { const v = e.target.value; set('title', v); if (!slugTouched) set('slug', slugify(v)); }} />
            </Field>
            <div className="form-row-2">
              <Field label="Slug" hint="URL path segment">
                <Input value={draft.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} />
              </Field>
              <Field label="Status">
                <Select value={draft.status} onChange={(e) => set('status', e.target.value as Status)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
            </div>
            <Field label="Excerpt" hint="Short summary shown in listings"><Textarea value={draft.excerpt ?? ''} onChange={(e) => set('excerpt', e.target.value)} /></Field>
            <MediaPicker label="Cover image" value={draft.cover_media_id} onChange={(id) => set('cover_media_id', id)} accept="image/*" />
            <Field label="Body" hint="Markdown"><Textarea value={draft.body} onChange={(e) => set('body', e.target.value)} style={{ minHeight: '16rem', fontFamily: 'ui-monospace, monospace' }} /></Field>
            <Field label="Tags" hint="Press Enter to add each"><TagInput value={draft.tags} onChange={(v) => set('tags', v)} placeholder="Add a tag…" /></Field>

            <hr className="divider" />
            <div className="row-meta" style={{ fontWeight: 600 }}>SEO (optional — falls back to title/excerpt)</div>
            <Field label="SEO title"><Input value={draft.seo_title ?? ''} onChange={(e) => set('seo_title', e.target.value)} /></Field>
            <Field label="SEO description"><Textarea value={draft.seo_description ?? ''} onChange={(e) => set('seo_description', e.target.value)} /></Field>
            <MediaPicker label="SEO / social image" value={draft.seo_image_media_id} onChange={(id) => set('seo_image_media_id', id)} accept="image/*" />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
