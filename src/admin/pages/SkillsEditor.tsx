import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { Button, Field, Input, Textarea, Modal, useToast, useConfirm } from '../ui';

interface Category { id: string; name: string; icon: string | null; is_visible: boolean; sort_order: number; }
interface Skill { id: string; category_id: string | null; name: string; icon: string | null; description: string | null; level: number | null; is_visible: boolean; sort_order: number; }

type CatDraft = { id?: string; name: string; icon: string };
type SkillDraft = { id?: string; category_id: string; name: string; icon: string; description: string; level: number };

export default function SkillsEditor() {
  const sb = getSupabase();
  const { push } = useToast();
  const confirm = useConfirm();
  const [cats, setCats] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [catDraft, setCatDraft] = useState<CatDraft | null>(null);
  const [skillDraft, setSkillDraft] = useState<SkillDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!sb) { setLoading(false); return; }
    const [{ data: c }, { data: s }] = await Promise.all([
      sb.from('skill_categories').select('*').order('sort_order'),
      sb.from('skills').select('*').order('sort_order'),
    ]);
    setCats((c as Category[]) ?? []);
    setSkills((s as Skill[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  // ---- category ops --------------------------------------------------------
  const saveCat = async () => {
    if (!sb || !catDraft) return;
    if (!catDraft.name.trim()) { push('error', 'Name is required.'); return; }
    setSaving(true);
    const payload = { name: catDraft.name.trim(), icon: catDraft.icon || null };
    if (catDraft.id) {
      const { error } = await sb.from('skill_categories').update(payload).eq('id', catDraft.id);
      if (error) { push('error', error.message); setSaving(false); return; }
      setCats((xs) => xs.map((c) => (c.id === catDraft.id ? { ...c, ...payload } : c)));
    } else {
      const sort_order = cats.reduce((m, c) => Math.max(m, c.sort_order), 0) + 10;
      const { data, error } = await sb.from('skill_categories').insert({ ...payload, is_visible: true, sort_order }).select().single();
      if (error) { push('error', error.message); setSaving(false); return; }
      setCats((xs) => [...xs, data as Category]);
    }
    setSaving(false); setCatDraft(null); push('success', 'Saved.');
  };

  const removeCat = async (c: Category) => {
    if (!sb) return;
    if (!confirm(`Delete category "${c.name}"? Its skills will be unlinked.`)) return;
    const { error } = await sb.from('skill_categories').delete().eq('id', c.id);
    if (error) { push('error', error.message); return; }
    setCats((xs) => xs.filter((x) => x.id !== c.id));
    setSkills((xs) => xs.map((s) => (s.category_id === c.id ? { ...s, category_id: null } : s)));
    push('success', 'Deleted.');
  };

  const toggleCat = async (c: Category) => {
    if (!sb) return;
    const next = !c.is_visible;
    setCats((xs) => xs.map((x) => (x.id === c.id ? { ...x, is_visible: next } : x)));
    const { error } = await sb.from('skill_categories').update({ is_visible: next }).eq('id', c.id);
    if (error) push('error', error.message);
  };

  const moveCat = async (index: number, dir: -1 | 1) => {
    if (!sb) return;
    const next = [...cats];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    const renum = next.map((c, i) => ({ ...c, sort_order: (i + 1) * 10 }));
    setCats(renum);
    const { error } = await sb.from('skill_categories').upsert(renum.map((c) => ({ id: c.id, sort_order: c.sort_order })));
    if (error) push('error', error.message);
  };

  // ---- skill ops -----------------------------------------------------------
  const saveSkill = async () => {
    if (!sb || !skillDraft) return;
    if (!skillDraft.name.trim()) { push('error', 'Name is required.'); return; }
    setSaving(true);
    const payload = {
      category_id: skillDraft.category_id, name: skillDraft.name.trim(),
      icon: skillDraft.icon || null, description: skillDraft.description || null,
      level: Math.max(0, Math.min(100, skillDraft.level || 0)),
    };
    if (skillDraft.id) {
      const { error } = await sb.from('skills').update(payload).eq('id', skillDraft.id);
      if (error) { push('error', error.message); setSaving(false); return; }
      setSkills((xs) => xs.map((s) => (s.id === skillDraft.id ? { ...s, ...payload } : s)));
    } else {
      const siblings = skills.filter((s) => s.category_id === skillDraft.category_id);
      const sort_order = siblings.reduce((m, s) => Math.max(m, s.sort_order), 0) + 10;
      const { data, error } = await sb.from('skills').insert({ ...payload, is_visible: true, sort_order }).select().single();
      if (error) { push('error', error.message); setSaving(false); return; }
      setSkills((xs) => [...xs, data as Skill]);
    }
    setSaving(false); setSkillDraft(null); push('success', 'Saved.');
  };

  const removeSkill = async (s: Skill) => {
    if (!sb) return;
    if (!confirm(`Delete skill "${s.name}"?`)) return;
    const { error } = await sb.from('skills').delete().eq('id', s.id);
    if (error) { push('error', error.message); return; }
    setSkills((xs) => xs.filter((x) => x.id !== s.id));
    push('success', 'Deleted.');
  };

  if (loading) return <div className="center-screen"><span className="spinner" /></div>;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Skills</h1>
          <p className="page-sub">Group skills into categories. Reorder categories, and manage skills within each.</p>
        </div>
        <Button onClick={() => setCatDraft({ name: '', icon: '' })}><Plus size={16} /> Add category</Button>
      </div>

      {cats.length ? (
        <div className="row-list">
          {cats.map((c, i) => {
            const mine = skills.filter((s) => s.category_id === c.id);
            return (
              <div key={c.id} className={`card skill-cat ${c.is_visible ? '' : 'is-hidden'}`}>
                <div className="skill-cat-head">
                  <div className="order-btns">
                    <button className="nav-item" style={{ width: 'auto', padding: '0.15rem' }} aria-label="Move up" disabled={i === 0} onClick={() => moveCat(i, -1)}><ChevronUp size={16} /></button>
                    <button className="nav-item" style={{ width: 'auto', padding: '0.15rem' }} aria-label="Move down" disabled={i === cats.length - 1} onClick={() => moveCat(i, 1)}><ChevronDown size={16} /></button>
                  </div>
                  <div className="grow">
                    <div className="row-title">{c.name}</div>
                    <div className="row-meta">{mine.length} skill{mine.length === 1 ? '' : 's'}{c.icon ? ` · ${c.icon}` : ''}</div>
                  </div>
                  <div className="row-actions">
                    <button className="icon-btn" aria-label={c.is_visible ? 'Hide' : 'Show'} onClick={() => toggleCat(c)}>{c.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                    <button className="icon-btn" aria-label="Edit category" onClick={() => setCatDraft({ id: c.id, name: c.name, icon: c.icon ?? '' })}><Pencil size={16} /></button>
                    <button className="icon-btn danger" aria-label="Delete category" onClick={() => removeCat(c)}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="skill-chips">
                  {mine.map((s) => (
                    <span key={s.id} className={`skill-chip ${s.is_visible ? '' : 'dim'}`}>
                      {s.name}
                      <button aria-label={`Edit ${s.name}`} onClick={() => setSkillDraft({ id: s.id, category_id: c.id, name: s.name, icon: s.icon ?? '', description: s.description ?? '', level: s.level ?? 60 })}><Pencil size={12} /></button>
                      <button aria-label={`Delete ${s.name}`} onClick={() => removeSkill(s)}><Trash2 size={12} /></button>
                    </span>
                  ))}
                  <button className="skill-add" onClick={() => setSkillDraft({ category_id: c.id, name: '', icon: '', description: '', level: 60 })}><Plus size={13} /> Add skill</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : <div className="empty card">No skill categories yet. Add your first category.</div>}

      {catDraft ? (
        <Modal title={catDraft.id ? 'Edit category' : 'Add category'} onClose={() => setCatDraft(null)}
          footer={<><Button variant="ghost" onClick={() => setCatDraft(null)}>Cancel</Button><Button onClick={saveCat} loading={saving}>Save</Button></>}>
          <div className="form-grid">
            <Field label="Name"><Input value={catDraft.name} onChange={(e) => setCatDraft({ ...catDraft, name: e.target.value })} autoFocus /></Field>
            <Field label="Icon" hint="lucide icon name (optional)"><Input value={catDraft.icon} onChange={(e) => setCatDraft({ ...catDraft, icon: e.target.value })} /></Field>
          </div>
        </Modal>
      ) : null}

      {skillDraft ? (
        <Modal title={skillDraft.id ? 'Edit skill' : 'Add skill'} onClose={() => setSkillDraft(null)}
          footer={<><Button variant="ghost" onClick={() => setSkillDraft(null)}>Cancel</Button><Button onClick={saveSkill} loading={saving}>Save</Button></>}>
          <div className="form-grid">
            <Field label="Name"><Input value={skillDraft.name} onChange={(e) => setSkillDraft({ ...skillDraft, name: e.target.value })} autoFocus /></Field>
            <Field label="Icon" hint="lucide name for soft skills; tech logos auto-detect from the name"><Input value={skillDraft.icon} onChange={(e) => setSkillDraft({ ...skillDraft, icon: e.target.value })} /></Field>
            <Field label={`Proficiency: ${skillDraft.level}%`} hint="0–100, shown as a progress bar">
              <input type="range" min="0" max="100" step="5" value={skillDraft.level} onChange={(e) => setSkillDraft({ ...skillDraft, level: Number(e.target.value) })} style={{ width: '100%' }} />
            </Field>
            <Field label="Description" hint="Optional"><Textarea value={skillDraft.description} onChange={(e) => setSkillDraft({ ...skillDraft, description: e.target.value })} /></Field>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
