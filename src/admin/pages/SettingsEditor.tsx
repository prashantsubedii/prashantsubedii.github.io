import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Button, Field, Input, Toggle, useToast } from '../ui';
import { MediaPicker } from '../MediaPicker';

interface SettingsRow {
  id: number;
  site_name: string;
  logo_media_id: string | null;
  contact_email: string | null;
  contact_location: string | null;
  footer_tagline: string | null;
  footer_copyright: string | null;
  analytics_enabled: boolean;
}

const EMPTY: SettingsRow = {
  id: 1, site_name: '', logo_media_id: null, contact_email: '', contact_location: '',
  footer_tagline: '', footer_copyright: '', analytics_enabled: true,
};

export default function SettingsEditor() {
  const sb = getSupabase();
  const { push } = useToast();
  const [row, setRow] = useState<SettingsRow>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sb) { setLoading(false); return; }
    (async () => {
      const { data } = await sb.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (data) setRow({ ...EMPTY, ...data });
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof SettingsRow>(k: K, v: SettingsRow[K]) => setRow((r) => ({ ...r, [k]: v }));

  const save = async () => {
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from('site_settings').upsert({
      id: 1, site_name: row.site_name.trim() || 'Prashant Subedi', logo_media_id: row.logo_media_id,
      contact_email: row.contact_email || null, contact_location: row.contact_location || null,
      footer_tagline: row.footer_tagline || null, footer_copyright: row.footer_copyright || null,
      analytics_enabled: row.analytics_enabled,
    });
    setSaving(false);
    push(error ? 'error' : 'success', error ? `Save failed: ${error.message}` : 'Settings saved.');
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Site Settings</h1>
          <p className="page-sub">Branding, contact details, footer, and feature flags.</p>
        </div>
        <Button onClick={save} loading={saving}>Save changes</Button>
      </div>

      <div className="panel card form-grid">
        <Field label="Site name"><Input value={row.site_name} onChange={(e) => set('site_name', e.target.value)} /></Field>
        <MediaPicker label="Logo" value={row.logo_media_id} onChange={(id) => set('logo_media_id', id)} accept="image/*" />
        <div className="form-row-2">
          <Field label="Contact email"><Input type="email" value={row.contact_email ?? ''} onChange={(e) => set('contact_email', e.target.value)} /></Field>
          <Field label="Contact location"><Input value={row.contact_location ?? ''} onChange={(e) => set('contact_location', e.target.value)} placeholder="Chitwan, Nepal" /></Field>
        </div>
        <Field label="Footer tagline"><Input value={row.footer_tagline ?? ''} onChange={(e) => set('footer_tagline', e.target.value)} /></Field>
        <Field label="Footer copyright" hint="e.g. © 2026 Prashant Subedi"><Input value={row.footer_copyright ?? ''} onChange={(e) => set('footer_copyright', e.target.value)} /></Field>
        <Field label="Analytics" hint="Cookieless page-view tracking"><Toggle checked={row.analytics_enabled} onChange={(v) => set('analytics_enabled', v)} label={row.analytics_enabled ? 'Enabled' : 'Disabled'} /></Field>
      </div>
    </div>
  );
}
