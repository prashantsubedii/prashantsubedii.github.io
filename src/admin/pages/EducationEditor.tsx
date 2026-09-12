import { CollectionManager, type BaseRow } from '../collection';
import { Field, Input, Textarea, Toggle, TagInput } from '../ui';
import { dateRange } from '../../lib/format';

interface EduRow extends BaseRow {
  id?: string;
  institution: string;
  program: string | null;
  degree: string | null;
  location: string | null;
  institution_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  highlights: string[];
  is_visible: boolean;
  sort_order: number;
}

export default function EducationEditor() {
  return (
    <CollectionManager<EduRow>
      config={{
        table: 'education',
        title: 'Education',
        subtitle: 'Institutions and programs. Reorder to control how they appear.',
        addLabel: 'Add education',
        emptyText: 'No education entries yet.',
        modalTitle: (isNew) => (isNew ? 'Add education' : 'Edit education'),
        newDraft: () => ({
          institution: '', program: '', degree: '', location: '', institution_url: '',
          start_date: null, end_date: null, is_current: false, description: '',
          highlights: [], is_visible: true, sort_order: 0,
        }),
        validate: (d) => (!d.institution.trim() ? 'Institution is required.' : null),
        summary: (r) => (
          <>
            <div className="row-title">{r.program || r.degree || 'Program'} · {r.institution}</div>
            <div className="row-meta">{dateRange(r.start_date, r.end_date, r.is_current)}{r.location ? ` — ${r.location}` : ''}</div>
          </>
        ),
        toPayload: (r) => ({
          institution: r.institution.trim(), program: r.program || null, degree: r.degree || null,
          location: r.location || null, institution_url: r.institution_url || null,
          start_date: r.start_date || null, end_date: r.is_current ? null : (r.end_date || null),
          is_current: r.is_current, description: r.description || null,
          highlights: r.highlights, is_visible: r.is_visible,
        }),
        form: (d, set) => (
          <>
            <Field label="Institution"><Input value={d.institution} onChange={(e) => set('institution', e.target.value)} /></Field>
            <div className="form-row-2">
              <Field label="Program" hint="e.g. B.Sc. CSIT"><Input value={d.program ?? ''} onChange={(e) => set('program', e.target.value)} /></Field>
              <Field label="Degree" hint="Full degree name"><Input value={d.degree ?? ''} onChange={(e) => set('degree', e.target.value)} /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Location"><Input value={d.location ?? ''} onChange={(e) => set('location', e.target.value)} /></Field>
              <Field label="Institution URL"><Input value={d.institution_url ?? ''} onChange={(e) => set('institution_url', e.target.value)} placeholder="https://…" /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Start date"><Input type="date" value={d.start_date ?? ''} onChange={(e) => set('start_date', e.target.value || null)} /></Field>
              <Field label="End date" hint="Leave blank if current"><Input type="date" value={d.end_date ?? ''} disabled={d.is_current} onChange={(e) => set('end_date', e.target.value || null)} /></Field>
            </div>
            <Field label="Currently studying"><Toggle checked={d.is_current} onChange={(v) => set('is_current', v)} label={d.is_current ? 'Present' : 'Completed'} /></Field>
            <Field label="Description"><Textarea value={d.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field>
            <Field label="Highlights" hint="Press Enter to add each"><TagInput value={d.highlights} onChange={(v) => set('highlights', v)} placeholder="Add a highlight…" /></Field>
          </>
        ),
      }}
    />
  );
}
