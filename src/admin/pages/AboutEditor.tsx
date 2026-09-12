import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Button, Field, Input, Textarea } from '../ui';
import { useToast } from '../ui';
import { MediaPicker } from '../MediaPicker';
import { CollectionManager, type BaseRow } from '../collection';

interface AboutRow {
  id: number;
  heading: string;
  bio: string;
  image_media_id: string | null;
  resume_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

const EMPTY: AboutRow = { id: 1, heading: 'About', bio: '', image_media_id: null, resume_url: '', cta_label: '', cta_url: '' };

interface HighlightRow extends BaseRow { id?: string; label: string; icon: string | null; is_visible: boolean; sort_order: number; }
interface StatRow extends BaseRow { id?: string; label: string; value: string; is_visible: boolean; sort_order: number; }

export default function AboutEditor() {
  const sb = getSupabase();
  const { push } = useToast();
  const [row, setRow] = useState<AboutRow>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sb) { setLoading(false); return; }
    (async () => {
      const { data } = await sb.from('about').select('*').eq('id', 1).maybeSingle();
      if (data) setRow({ ...EMPTY, ...data });
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof AboutRow>(k: K, v: AboutRow[K]) => setRow((r) => ({ ...r, [k]: v }));

  const save = async () => {
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from('about').upsert({
      id: 1, heading: row.heading, bio: row.bio, image_media_id: row.image_media_id,
      resume_url: row.resume_url || null, cta_label: row.cta_label || null, cta_url: row.cta_url || null,
    });
    setSaving(false);
    push(error ? 'error' : 'success', error ? `Save failed: ${error.message}` : 'About saved.');
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">About</h1>
          <p className="page-sub">Your bio, profile image, resume link, and the highlights and stats shown in the About section.</p>
        </div>
        <Button onClick={save} loading={saving}>Save changes</Button>
      </div>

      <div className="panel card form-grid">
        <Field label="Heading"><Input value={row.heading} onChange={(e) => set('heading', e.target.value)} /></Field>
        <Field label="Bio" hint="Markdown supported"><Textarea value={row.bio} onChange={(e) => set('bio', e.target.value)} style={{ minHeight: '10rem' }} /></Field>
        <MediaPicker label="Profile image" value={row.image_media_id} onChange={(id) => set('image_media_id', id)} accept="image/*" />
        <div className="form-row-2">
          <Field label="Resume URL" hint="Link to your CV/resume"><Input value={row.resume_url ?? ''} onChange={(e) => set('resume_url', e.target.value)} placeholder="/assets/CV.pdf" /></Field>
          <Field label="CTA URL"><Input value={row.cta_url ?? ''} onChange={(e) => set('cta_url', e.target.value)} /></Field>
        </div>
        <Field label="CTA label" hint="e.g. Download CV"><Input value={row.cta_label ?? ''} onChange={(e) => set('cta_label', e.target.value)} /></Field>
      </div>

      <hr className="divider" />
      <CollectionManager<HighlightRow>
        config={{
          table: 'about_highlights',
          title: 'Highlights',
          subtitle: 'Short points about what you do. Reorder to control their order.',
          addLabel: 'Add highlight',
          emptyText: 'No highlights yet.',
          modalTitle: (isNew) => (isNew ? 'Add highlight' : 'Edit highlight'),
          newDraft: () => ({ label: '', icon: '', is_visible: true, sort_order: 0 }),
          validate: (d) => (!d.label.trim() ? 'Label is required.' : null),
          summary: (r) => <div className="row-title">{r.label}</div>,
          toPayload: (r) => ({ label: r.label.trim(), icon: r.icon || null, is_visible: r.is_visible }),
          form: (d, set2) => (
            <>
              <Field label="Label"><Input value={d.label} onChange={(e) => set2('label', e.target.value)} /></Field>
              <Field label="Icon" hint="lucide icon name (optional)"><Input value={d.icon ?? ''} onChange={(e) => set2('icon', e.target.value)} /></Field>
            </>
          ),
        }}
      />

      <hr className="divider" />
      <CollectionManager<StatRow>
        config={{
          table: 'about_stats',
          title: 'Stats',
          subtitle: 'Key numbers (e.g. events organized). Reorder to control their order.',
          addLabel: 'Add stat',
          emptyText: 'No stats yet.',
          modalTitle: (isNew) => (isNew ? 'Add stat' : 'Edit stat'),
          newDraft: () => ({ label: '', value: '', is_visible: true, sort_order: 0 }),
          validate: (d) => (!d.label.trim() ? 'Label is required.' : !d.value.trim() ? 'Value is required.' : null),
          summary: (r) => <div className="row-title">{r.value} — <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>{r.label}</span></div>,
          toPayload: (r) => ({ label: r.label.trim(), value: r.value.trim(), is_visible: r.is_visible }),
          form: (d, set2) => (
            <div className="form-row-2">
              <Field label="Value" hint="e.g. 10+"><Input value={d.value} onChange={(e) => set2('value', e.target.value)} /></Field>
              <Field label="Label" hint="e.g. Events organized"><Input value={d.label} onChange={(e) => set2('label', e.target.value)} /></Field>
            </div>
          ),
        }}
      />
    </div>
  );
}
