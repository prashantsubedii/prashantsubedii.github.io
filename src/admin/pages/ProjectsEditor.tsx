import { CollectionManager, type BaseRow } from '../collection';
import { Field, Input, Textarea, Toggle, TagInput } from '../ui';
import { MediaPicker } from '../MediaPicker';
import { monthYear } from '../../lib/format';

interface ProjRow extends BaseRow {
  id?: string;
  title: string;
  description: string | null;
  image_media_id: string | null;
  github_url: string | null;
  live_url: string | null;
  technologies: string[];
  category: string | null;
  project_date: string | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
}

export default function ProjectsEditor() {
  return (
    <CollectionManager<ProjRow>
      config={{
        table: 'projects',
        title: 'Projects',
        subtitle: 'Manually curated projects. GitHub-pinned repos also appear automatically on the site.',
        addLabel: 'Add project',
        emptyText: 'No manual projects yet. Pinned GitHub repos still show on the site.',
        modalTitle: (isNew) => (isNew ? 'Add project' : 'Edit project'),
        newDraft: () => ({
          title: '', description: '', image_media_id: null, github_url: '', live_url: '',
          technologies: [], category: '', project_date: null, is_featured: false,
          is_visible: true, sort_order: 0,
        }),
        validate: (d) => (!d.title.trim() ? 'Title is required.' : null),
        summary: (r) => (
          <>
            <div className="row-title">{r.title}{r.is_featured ? ' ★' : ''}</div>
            <div className="row-meta">{[r.category, monthYear(r.project_date)].filter(Boolean).join(' · ') || '—'}</div>
          </>
        ),
        toPayload: (r) => ({
          title: r.title.trim(), description: r.description || null, image_media_id: r.image_media_id,
          github_url: r.github_url || null, live_url: r.live_url || null,
          technologies: r.technologies, category: r.category || null,
          project_date: r.project_date || null, is_featured: r.is_featured, is_visible: r.is_visible,
        }),
        form: (d, set) => (
          <>
            <Field label="Title"><Input value={d.title} onChange={(e) => set('title', e.target.value)} /></Field>
            <Field label="Description"><Textarea value={d.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field>
            <MediaPicker label="Cover image" value={d.image_media_id} onChange={(id) => set('image_media_id', id)} accept="image/*" />
            <div className="form-row-2">
              <Field label="GitHub URL"><Input value={d.github_url ?? ''} onChange={(e) => set('github_url', e.target.value)} placeholder="https://github.com/…" /></Field>
              <Field label="Live URL"><Input value={d.live_url ?? ''} onChange={(e) => set('live_url', e.target.value)} placeholder="https://…" /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Category"><Input value={d.category ?? ''} onChange={(e) => set('category', e.target.value)} /></Field>
              <Field label="Date"><Input type="date" value={d.project_date ?? ''} onChange={(e) => set('project_date', e.target.value || null)} /></Field>
            </div>
            <Field label="Technologies" hint="Press Enter to add each"><TagInput value={d.technologies} onChange={(v) => set('technologies', v)} placeholder="Add a technology…" /></Field>
            <Field label="Featured" hint="Featured projects can be emphasized on the site"><Toggle checked={d.is_featured} onChange={(v) => set('is_featured', v)} label={d.is_featured ? 'Featured' : 'Normal'} /></Field>
          </>
        ),
      }}
    />
  );
}
