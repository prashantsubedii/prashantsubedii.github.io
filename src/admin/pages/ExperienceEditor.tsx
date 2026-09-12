import { CollectionManager, type BaseRow } from '../collection';
import { Field, Input, Textarea, Toggle, TagInput } from '../ui';
import { dateRange } from '../../lib/format';

interface ExpRow extends BaseRow {
  id?: string;
  organization: string;
  role: string;
  employment_type: string | null;
  work_mode: string | null;
  location: string | null;
  organization_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string[];
  technologies: string[];
  is_visible: boolean;
  sort_order: number;
}

export default function ExperienceEditor() {
  return (
    <CollectionManager<ExpRow>
      config={{
        table: 'experience',
        title: 'Experience',
        subtitle: "Roles and contributions. Reorder to control how they appear; hide any you don't want live.",
        addLabel: 'Add role',
        emptyText: 'No experience entries yet.',
        modalTitle: (isNew) => (isNew ? 'Add role' : 'Edit role'),
        newDraft: () => ({
          organization: '', role: '', employment_type: '', work_mode: '', location: '',
          organization_url: '', start_date: null, end_date: null, is_current: false,
          description: '', achievements: [], technologies: [], is_visible: true, sort_order: 0,
        }),
        validate: (d) => (!d.organization.trim() ? 'Organization is required.' : !d.role.trim() ? 'Role is required.' : null),
        summary: (r) => (
          <>
            <div className="row-title">{r.role} · {r.organization}</div>
            <div className="row-meta">{dateRange(r.start_date, r.end_date, r.is_current)}{r.location ? ` — ${r.location}` : ''}</div>
          </>
        ),
        toPayload: (r) => ({
          organization: r.organization.trim(), role: r.role.trim(),
          employment_type: r.employment_type || null, work_mode: r.work_mode || null,
          location: r.location || null, organization_url: r.organization_url || null,
          start_date: r.start_date || null, end_date: r.is_current ? null : (r.end_date || null),
          is_current: r.is_current, description: r.description || null,
          achievements: r.achievements, technologies: r.technologies, is_visible: r.is_visible,
        }),
        form: (d, set) => (
          <>
            <div className="form-row-2">
              <Field label="Role"><Input value={d.role} onChange={(e) => set('role', e.target.value)} /></Field>
              <Field label="Organization"><Input value={d.organization} onChange={(e) => set('organization', e.target.value)} /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Employment type" hint="Full-time, Part-time, Volunteer…"><Input value={d.employment_type ?? ''} onChange={(e) => set('employment_type', e.target.value)} /></Field>
              <Field label="Work mode" hint="On-site, Remote, Hybrid"><Input value={d.work_mode ?? ''} onChange={(e) => set('work_mode', e.target.value)} /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Location"><Input value={d.location ?? ''} onChange={(e) => set('location', e.target.value)} /></Field>
              <Field label="Organization URL"><Input value={d.organization_url ?? ''} onChange={(e) => set('organization_url', e.target.value)} placeholder="https://…" /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Start date"><Input type="date" value={d.start_date ?? ''} onChange={(e) => set('start_date', e.target.value || null)} /></Field>
              <Field label="End date" hint="Leave blank if current"><Input type="date" value={d.end_date ?? ''} disabled={d.is_current} onChange={(e) => set('end_date', e.target.value || null)} /></Field>
            </div>
            <Field label="Currently here"><Toggle checked={d.is_current} onChange={(v) => set('is_current', v)} label={d.is_current ? 'Present' : 'Ended'} /></Field>
            <Field label="Description"><Textarea value={d.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field>
            <Field label="Achievements" hint="Press Enter to add each"><TagInput value={d.achievements} onChange={(v) => set('achievements', v)} placeholder="Add an achievement…" /></Field>
            <Field label="Technologies" hint="Press Enter to add each"><TagInput value={d.technologies} onChange={(v) => set('technologies', v)} placeholder="Add a technology…" /></Field>
          </>
        ),
      }}
    />
  );
}
