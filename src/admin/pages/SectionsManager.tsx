import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { Toggle, useToast } from '../ui';

interface SectionRow { key: string; label: string; is_visible: boolean; in_nav: boolean; sort_order: number; }

export default function SectionsManager() {
  const sb = getSupabase();
  const { push } = useToast();
  const [rows, setRows] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sb) return;
    (async () => {
      const { data, error } = await sb.from('sections').select('*').order('sort_order');
      if (error) push('error', 'Could not load sections. Please refresh.');
      setRows((data as SectionRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const persist = async (key: string, patch: Partial<SectionRow>) => {
    if (!sb || saving) return;
    setSaving(true);
    const { error } = await sb.from('sections').update(patch).eq('key', key).select('key').single();
    if (error) push('error', `Update failed: ${error.message}`);
    else { setRows(rows => rows.map(row => row.key === key ? { ...row, ...patch } : row)); push('success', 'Section setting saved.'); }
    setSaving(false);
  };

  const toggle = (key: string, field: 'is_visible' | 'in_nav', v: boolean) => {
    void persist(key, { [field]: v, ...(field === 'is_visible' && ['frames','certificates'].includes(key) ? { in_nav: v } : {}) });
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...rows];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    // Renumber sort_order by position.
    const renum = next.map((r, i) => ({ ...r, sort_order: (i + 1) * 10 }));
    if (!sb) return;
    setSaving(true);
    const { error } = await sb.from('sections').upsert(
      renum,
    );
    push(error ? 'error' : 'success', error ? 'Reorder failed' : 'Order saved.');
    if (!error) setRows(renum);
    setSaving(false);
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Sections & Order</h1>
      <p className="page-sub">
        Frames and Certificates switches update the public site on its next page load.
        Certificates always follow Featured Projects. Other sections and ordering update after deployment.
      </p>

      <div className="row-list">
        {rows.map((r, i) => (
          <div key={r.key} className="row-item card">
            <div className="order-btns">
              <button className="nav-item" style={{ width: 'auto', padding: '0.15rem' }} aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp size={16} /></button>
              <button className="nav-item" style={{ width: 'auto', padding: '0.15rem' }} aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}><ChevronDown size={16} /></button>
            </div>
            <div className="grow">
              <div className="row-title">{r.label}</div>
              <div className="row-meta">#{r.key}</div>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="row-meta" style={{ marginBottom: '0.25rem' }}>Visible</div>
                <Toggle disabled={saving} label={`Show ${r.label}`} checked={r.is_visible} onChange={(v) => toggle(r.key, 'is_visible', v)} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="row-meta" style={{ marginBottom: '0.25rem' }}>In nav</div>
                <Toggle disabled={saving} label={`${r.label} in navigation`} checked={r.in_nav} onChange={(v) => toggle(r.key, 'in_nav', v)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
