import { CollectionManager, type BaseRow } from '../collection';
import { Field, Input, Textarea, TagInput } from '../ui';
import { MediaPicker } from '../MediaPicker';
import { monthYear } from '../../lib/format';
import SectionVisibility from '../SectionVisibility';

interface CertRow extends BaseRow {
  id?: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  file_media_id: string | null;
  thumbnail_media_id: string | null;
  description: string | null;
  tags: string[];
  is_visible: boolean;
  sort_order: number;
}

export default function CertificatesEditor() {
  return (
    <><SectionVisibility section="certificates" label="Certificates" /><CollectionManager<CertRow>
      config={{
        table: 'certificates',
        title: 'Certificates & Learning',
        subtitle: 'Credentials, courses, and learning milestones. Link to a verification page or upload a file.',
        addLabel: 'Add credential',
        emptyText: 'No certificates yet.',
        modalTitle: (isNew) => (isNew ? 'Add credential' : 'Edit credential'),
        newDraft: () => ({
          name: '', issuer: '', issue_date: null, expiry_date: null, credential_id: '',
          credential_url: '', file_media_id: null, thumbnail_media_id: null, description: '',
          tags: [], is_visible: true, sort_order: 0,
        }),
        validate: (d) => !d.name.trim() ? 'Name is required.' : !d.file_media_id && !d.credential_url?.trim() ? 'Upload a certificate or enter its online credential URL.' : d.credential_url && !/^https?:\/\/\S+$/i.test(d.credential_url.trim()) ? 'Use a complete https:// credential URL.' : null,
        summary: (r) => (
          <>
            <div className="row-title">{r.name}</div>
            <div className="row-meta">{[r.issuer, monthYear(r.issue_date)].filter(Boolean).join(' · ') || '—'}</div>
          </>
        ),
        toPayload: (r) => ({
          name: r.name.trim(), issuer: r.issuer || null, issue_date: r.issue_date || null,
          expiry_date: r.expiry_date || null, credential_id: r.credential_id || null,
          credential_url: r.credential_url || null, file_media_id: r.file_media_id,
          thumbnail_media_id: r.thumbnail_media_id, description: r.description || null,
          tags: r.tags, is_visible: r.is_visible,
        }),
        form: (d, set) => (
          <>
            <div className="form-row-2">
              <Field label="Name"><Input value={d.name} onChange={(e) => set('name', e.target.value)} /></Field>
              <Field label="Issuer"><Input value={d.issuer ?? ''} onChange={(e) => set('issuer', e.target.value)} /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Issue date"><Input type="date" value={d.issue_date ?? ''} onChange={(e) => set('issue_date', e.target.value || null)} /></Field>
              <Field label="Expiry date" hint="Optional"><Input type="date" value={d.expiry_date ?? ''} onChange={(e) => set('expiry_date', e.target.value || null)} /></Field>
            </div>
            <div className="form-row-2">
              <Field label="Credential ID" hint="Optional"><Input value={d.credential_id ?? ''} onChange={(e) => set('credential_id', e.target.value)} /></Field>
              <Field label="Verification URL"><Input value={d.credential_url ?? ''} onChange={(e) => set('credential_url', e.target.value)} placeholder="https://…" /></Field>
            </div>
            <MediaPicker label="Certificate file" folder="certificates" value={d.file_media_id} onChange={(id) => set('file_media_id', id)} accept="image/jpeg,image/png,image/webp,application/pdf" />
            <MediaPicker label="Thumbnail image (optional)" folder="certificates" value={d.thumbnail_media_id} onChange={(id) => set('thumbnail_media_id', id)} accept="image/jpeg,image/png,image/webp" />
            <Field label="Description"><Textarea value={d.description ?? ''} onChange={(e) => set('description', e.target.value)} /></Field>
            <Field label="Tags" hint="Press Enter to add each"><TagInput value={d.tags} onChange={(v) => set('tags', v)} placeholder="Add a tag…" /></Field>
          </>
        ),
      }}
    /></>
  );
}
