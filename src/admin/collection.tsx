import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { Button, Modal, useToast, useConfirm } from './ui';

export interface BaseRow {
  id?: string;
  sort_order?: number;
  is_visible?: boolean;
  [key: string]: unknown;
}

export interface CollectionConfig<T extends BaseRow> {
  table: string;
  title: string;
  subtitle?: string;
  select?: string;
  hasVisibility?: boolean;
  hasOrder?: boolean;
  addLabel?: string;
  emptyText?: string;
  newDraft: () => T;
  /** Compact summary shown in the list row. */
  summary: (row: T) => React.ReactNode;
  /** Editing form; `set` patches one field of the draft. */
  form: (draft: T, set: <K extends keyof T>(k: K, v: T[K]) => void) => React.ReactNode;
  /** Map a row to the DB payload (strip UI-only fields; omit id for inserts). */
  toPayload: (row: T) => Record<string, unknown>;
  /** Optional client-side validation; return an error message to block save. */
  validate?: (draft: T) => string | null;
  /** Title for the edit modal, e.g. (row) => row.id ? 'Edit role' : 'Add role'. */
  modalTitle?: (isNew: boolean) => string;
}

export function CollectionManager<T extends BaseRow>({ config }: { config: CollectionConfig<T> }) {
  const sb = getSupabase();
  const { push } = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);

  const order = config.hasOrder ?? true;
  const vis = config.hasVisibility ?? true;

  const load = async () => {
    if (!sb) { setLoading(false); return; }
    const q = sb.from(config.table).select(config.select ?? '*');
    const { data, error } = order
      ? await q.order('sort_order')
      : await q.order('created_at', { ascending: false });
    if (error) push('error', `Load failed: ${error.message}`);
    setRows(((data as unknown) as T[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const set = <K extends keyof T>(k: K, v: T[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const openNew = () => { setDraft(config.newDraft()); setIsNew(true); };
  const openEdit = (row: T) => { setDraft({ ...row }); setIsNew(false); };

  const save = async () => {
    if (!sb || !draft) return;
    const err = config.validate?.(draft);
    if (err) { push('error', err); return; }
    setSaving(true);
    const payload = config.toPayload(draft);
    if (isNew) {
      if (order) {
        const maxOrder = rows.reduce((m, r) => Math.max(m, r.sort_order ?? 0), 0);
        (payload as Record<string, unknown>).sort_order = maxOrder + 10;
      }
      const { data, error } = await sb.from(config.table).insert(payload).select().single();
      if (error) { push('error', `Save failed: ${error.message}`); setSaving(false); return; }
      setRows((xs) => [...xs, data as T].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    } else {
      const { error } = await sb.from(config.table).update(payload).eq('id', draft.id as string);
      if (error) { push('error', `Save failed: ${error.message}`); setSaving(false); return; }
      setRows((xs) => xs.map((r) => (r.id === draft.id ? { ...r, ...draft } : r)));
    }
    setSaving(false);
    setDraft(null);
    push('success', 'Saved.');
  };

  const remove = async (row: T) => {
    if (!sb) return;
    if (!confirm('Delete this item? This cannot be undone.')) return;
    const { error } = await sb.from(config.table).delete().eq('id', row.id as string);
    if (error) { push('error', `Delete failed: ${error.message}`); return; }
    setRows((xs) => xs.filter((r) => r.id !== row.id));
    push('success', 'Deleted.');
  };

  const toggleVisible = async (row: T) => {
    if (!sb) return;
    const next = !(row.is_visible ?? true);
    const { error } = await sb.from(config.table).update({ is_visible: next }).eq('id', row.id as string).select('id').single();
    if (error) push('error', `Update failed: ${error.message}`);
    else setRows((xs) => xs.map((r) => (r.id === row.id ? { ...r, is_visible: next } : r)));
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!sb) return;
    const next = [...rows];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const renum = next.map((r, i) => ({ ...r, sort_order: (i + 1) * 10 }));
    const { error } = await sb.from(config.table).upsert(
      renum.map((r) => ({ ...config.toPayload(r), id: r.id, sort_order: r.sort_order })),
    );
    if (error) push('error', `Reorder failed: ${error.message}`);
    else setRows(renum);
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  const modalTitle = config.modalTitle?.(isNew) ?? (isNew ? `Add — ${config.title}` : `Edit — ${config.title}`);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">{config.title}</h1>
          {config.subtitle ? <p className="page-sub">{config.subtitle}</p> : null}
        </div>
        <Button onClick={openNew}><Plus size={16} /> {config.addLabel ?? 'Add new'}</Button>
      </div>

      {rows.length ? (
        <div className="row-list">
          {rows.map((r, i) => (
            <div key={r.id ?? i} className={`row-item card ${vis && r.is_visible === false ? 'is-hidden' : ''}`}>
              {order ? (
                <div className="order-btns">
                  <button className="nav-item" style={{ width: 'auto', padding: '0.15rem' }} aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp size={16} /></button>
                  <button className="nav-item" style={{ width: 'auto', padding: '0.15rem' }} aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}><ChevronDown size={16} /></button>
                </div>
              ) : null}
              <div className="grow">{config.summary(r)}</div>
              <div className="row-actions">
                {vis ? (
                  <button className="icon-btn" aria-label={r.is_visible === false ? 'Show' : 'Hide'} title={r.is_visible === false ? 'Hidden — click to show' : 'Visible — click to hide'} onClick={() => toggleVisible(r)}>
                    {r.is_visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                ) : null}
                <button className="icon-btn" aria-label="Edit" onClick={() => openEdit(r)}><Pencil size={16} /></button>
                <button className="icon-btn danger" aria-label="Delete" onClick={() => remove(r)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty card">{config.emptyText ?? 'Nothing here yet. Add your first item.'}</div>
      )}

      {draft ? (
        <Modal title={modalTitle} wide onClose={() => setDraft(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>}>
          <div className="form-grid">{config.form(draft, set)}</div>
        </Modal>
      ) : null}
    </div>
  );
}
