import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Button, Field, Input, Textarea, Toggle, useToast } from '../ui';
import { MediaPicker } from '../MediaPicker';

interface HeroRow {
  id: number;
  headline: string; descriptor: string; description: string;
  availability_text: string | null; show_availability: boolean;
  image_media_id: string | null;
  primary_cta_label: string | null; primary_cta_url: string | null;
  secondary_cta_label: string | null; secondary_cta_url: string | null;
}

const EMPTY: HeroRow = {
  id: 1, headline: '', descriptor: '', description: '',
  availability_text: '', show_availability: false, image_media_id: null,
  primary_cta_label: '', primary_cta_url: '', secondary_cta_label: '', secondary_cta_url: '',
};

export default function HeroEditor() {
  const sb = getSupabase();
  const { push } = useToast();
  const [row, setRow] = useState<HeroRow>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sb) return;
    (async () => {
      const { data } = await sb.from('hero').select('*').eq('id', 1).maybeSingle();
      if (data) setRow({ ...EMPTY, ...data });
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof HeroRow>(k: K, v: HeroRow[K]) => setRow((r) => ({ ...r, [k]: v }));

  const save = async () => {
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from('hero').upsert({ ...row, id: 1 });
    setSaving(false);
    push(error ? 'error' : 'success', error ? `Save failed: ${error.message}` : 'Hero saved.');
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Hero</h1>
          <p className="page-sub">The first thing visitors see. Keep it credible and concise.</p>
        </div>
        <Button onClick={save} loading={saving}>Save changes</Button>
      </div>

      <div className="panel card form-grid">
        <Field label="Headline"><Input value={row.headline} onChange={(e) => set('headline', e.target.value)} /></Field>
        <Field label="Professional descriptor" hint="e.g. Aspiring AI/ML Engineer, Researcher and Tech Community Builder">
          <Input value={row.descriptor} onChange={(e) => set('descriptor', e.target.value)} />
        </Field>
        <Field label="Supporting description">
          <Textarea value={row.description} onChange={(e) => set('description', e.target.value)} />
        </Field>

        <div className="form-row-2">
          <Field label="Availability text" hint="Optional status line">
            <Input value={row.availability_text ?? ''} onChange={(e) => set('availability_text', e.target.value)} />
          </Field>
          <Field label="Show availability">
            <Toggle checked={row.show_availability} onChange={(v) => set('show_availability', v)} label={row.show_availability ? 'Visible' : 'Hidden'} />
          </Field>
        </div>

        <div className="form-row-2">
          <Field label="Primary button label"><Input value={row.primary_cta_label ?? ''} onChange={(e) => set('primary_cta_label', e.target.value)} /></Field>
          <Field label="Primary button URL"><Input value={row.primary_cta_url ?? ''} onChange={(e) => set('primary_cta_url', e.target.value)} /></Field>
        </div>
        <div className="form-row-2">
          <Field label="Secondary button label"><Input value={row.secondary_cta_label ?? ''} onChange={(e) => set('secondary_cta_label', e.target.value)} /></Field>
          <Field label="Secondary button URL"><Input value={row.secondary_cta_url ?? ''} onChange={(e) => set('secondary_cta_url', e.target.value)} /></Field>
        </div>

        <MediaPicker label="Hero image" value={row.image_media_id} onChange={(id) => set('image_media_id', id)} accept="image/*" />
      </div>
    </div>
  );
}
