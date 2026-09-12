import { CollectionManager, type BaseRow } from '../collection';
import { Field, Input, Textarea, TagInput } from '../ui';
import { MediaPicker } from '../MediaPicker';
import { monthYear } from '../../lib/format';
import SectionVisibility from '../SectionVisibility';

interface SnapRow extends BaseRow {
  id?: string;
  image_media_id: string | null;
  caption: string | null;
  location: string | null;
  taken_on: string | null;
  tags: string[];
  is_visible: boolean;
  sort_order: number;
}

export default function SnapshotsEditor() {
  return (
    <><SectionVisibility section="frames" label="Frames" /><CollectionManager<SnapRow>
      config={{
        table: 'snapshots',
        title: 'Frames',
        subtitle: 'Upload moments from events, hackathons and shared learning. Captions are optional. Published photos appear on /frames.',
        addLabel: 'Add photo',
        emptyText: 'No frames yet. Upload your first photo.',
        modalTitle: (isNew) => (isNew ? 'Add photo' : 'Edit photo'),
        newDraft: () => ({ image_media_id: null, caption: '', location: '', taken_on: null, tags: [], is_visible: true, sort_order: 0 }),
        validate: (d) => (!d.image_media_id ? 'An image is required.' : null),
        summary: (r) => (
          <>
            <div className="row-title">{r.caption || 'Photo without caption'}</div>
            <div className="row-meta">{[r.location, monthYear(r.taken_on)].filter(Boolean).join(' · ') || '—'}</div>
          </>
        ),
        toPayload: (r) => ({
          image_media_id: r.image_media_id, caption: r.caption || null, location: r.location || null,
          taken_on: r.taken_on || null, tags: r.tags, is_visible: r.is_visible,
        }),
        form: (d, set) => (
          <>
            <MediaPicker label="Photo" folder="frames" value={d.image_media_id} onChange={(id) => set('image_media_id', id)} accept="image/jpeg,image/png,image/webp,image/gif,image/avif" />
            <Field label="Caption" hint="Optional. Leave blank for an image-only frame."><Textarea value={d.caption ?? ''} onChange={(e) => set('caption', e.target.value)} /></Field>
            <div className="form-row-2">
              <Field label="Location"><Input value={d.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="Chitwan, Nepal" /></Field>
              <Field label="Date"><Input type="date" value={d.taken_on ?? ''} onChange={(e) => set('taken_on', e.target.value || null)} /></Field>
            </div>
            <Field label="Tags" hint="Press Enter to add each"><TagInput value={d.tags} onChange={(v) => set('tags', v)} placeholder="hackathon, workshop…" /></Field>
          </>
        ),
      }}
    /></>
  );
}
