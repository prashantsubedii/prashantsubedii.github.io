import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Button, Field, Input, Textarea, TagInput, useToast } from '../ui';
import { MediaPicker } from '../MediaPicker';

interface SeoRow {
  id: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  social_image_media_id: string | null;
  canonical_domain: string;
  twitter_handle: string | null;
}

const EMPTY: SeoRow = {
  id: 1, seo_title: '', seo_description: '', seo_keywords: [],
  social_image_media_id: null, canonical_domain: 'https://www.prashantsubedi.info.np', twitter_handle: '',
};

export default function SeoEditor() {
  const sb = getSupabase();
  const { push } = useToast();
  const [row, setRow] = useState<SeoRow>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sb) { setLoading(false); return; }
    (async () => {
      const { data } = await sb.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (data) setRow({ ...EMPTY, ...data, seo_keywords: data.seo_keywords ?? [] });
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof SeoRow>(k: K, v: SeoRow[K]) => setRow((r) => ({ ...r, [k]: v }));

  const save = async () => {
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from('site_settings').upsert({
      id: 1, seo_title: row.seo_title.trim(), seo_description: row.seo_description.trim(),
      seo_keywords: row.seo_keywords, social_image_media_id: row.social_image_media_id,
      canonical_domain: row.canonical_domain.trim().replace(/\/$/, ''), twitter_handle: row.twitter_handle || null,
    });
    setSaving(false);
    push(error ? 'error' : 'success', error ? `Save failed: ${error.message}` : 'SEO saved.');
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">SEO</h1>
          <p className="page-sub">Global search-engine and social-sharing defaults. Blog posts can override these per post.</p>
        </div>
        <Button onClick={save} loading={saving}>Save changes</Button>
      </div>

      <div className="panel card form-grid">
        <Field label="SEO title" hint="Shown in the browser tab and search results"><Input value={row.seo_title} onChange={(e) => set('seo_title', e.target.value)} /></Field>
        <Field label="SEO description" hint="~150–160 characters"><Textarea value={row.seo_description} onChange={(e) => set('seo_description', e.target.value)} /></Field>
        <Field label="Keywords" hint="Press Enter to add each"><TagInput value={row.seo_keywords} onChange={(v) => set('seo_keywords', v)} placeholder="Add a keyword…" /></Field>
        <MediaPicker label="Social share image" value={row.social_image_media_id} onChange={(id) => set('social_image_media_id', id)} accept="image/*" />
        <div className="form-row-2">
          <Field label="Canonical domain"><Input value={row.canonical_domain} onChange={(e) => set('canonical_domain', e.target.value)} placeholder="https://www.example.com" /></Field>
          <Field label="Twitter handle"><Input value={row.twitter_handle ?? ''} onChange={(e) => set('twitter_handle', e.target.value)} placeholder="@handle" /></Field>
        </div>
      </div>
    </div>
  );
}
