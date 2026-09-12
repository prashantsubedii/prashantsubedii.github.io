import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { Toggle, useToast } from './ui';

export default function SectionVisibility({ section, label }: { section: 'frames' | 'certificates'; label: string }) {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const { push } = useToast();
  useEffect(() => {
    let active = true;
    const sb = getSupabase();
    if (sb) void sb.from('sections').select('is_visible').eq('key', section).single().then(({ data, error }) => {
      if (!active) return;
      if (error) setFailed(true); else setVisible(data.is_visible);
    });
    return () => { active = false; };
  }, [section]);
  async function toggle(next: boolean) {
    const sb = getSupabase();
    if (!sb || busy) return;
    setBusy(true);
    try {
      const { data, error } = await sb.from('sections').update({ is_visible: next, in_nav: next }).eq('key', section).select('key').single();
      if (error || !data) throw new Error('The section could not be saved.');
      setVisible(next);
      push('success', `${label} ${next ? 'published' : 'hidden'}. The public page and navigation update on their next load.`);
    } catch { push('error', 'Could not save visibility. Your previous setting is unchanged.'); }
    finally { setBusy(false); }
  }
  return <div className="section-visibility card">
    <span className="section-visibility-icon">{visible ? <Eye size={22} /> : <EyeOff size={22} />}</span>
    <div className="grow"><strong>{label} on the public site</strong><p>{failed ? 'Section setup is missing. Run live-content.sql before publishing.' : visible === null ? 'Loading visibility…' : visible ? 'Visible in the navigation and public page.' : 'Hidden from the public page and navigation. You can still manage items here.'}</p></div>
    <Toggle checked={visible === true} disabled={busy || visible === null} onChange={toggle} label={`Show ${label}`} />
  </div>;
}
