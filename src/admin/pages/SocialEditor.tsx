import { CollectionManager, type BaseRow } from '../collection';
import { Field, Input } from '../ui';

interface SocialRow extends BaseRow {
  id?: string;
  platform: string;
  label: string | null;
  url: string;
  icon: string | null;
  is_visible: boolean;
  sort_order: number;
}

export default function SocialEditor() {
  return (
    <CollectionManager<SocialRow>
      config={{
        table: 'social_links',
        title: 'Social Links',
        subtitle: 'Links shown in the hero, footer, and contact section. Reorder to control their order.',
        addLabel: 'Add link',
        emptyText: 'No social links yet.',
        modalTitle: (isNew) => (isNew ? 'Add social link' : 'Edit social link'),
        newDraft: () => ({ platform: '', label: '', url: '', icon: '', is_visible: true, sort_order: 0 }),
        validate: (d) => (!d.platform.trim() ? 'Platform is required.' : !d.url.trim() ? 'URL is required.' : null),
        summary: (r) => (
          <>
            <div className="row-title">{r.label || r.platform}</div>
            <div className="row-meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</div>
          </>
        ),
        toPayload: (r) => ({
          platform: r.platform.trim(), label: r.label || null, url: r.url.trim(),
          icon: r.icon || null, is_visible: r.is_visible,
        }),
        form: (d, set) => (
          <>
            <div className="form-row-2">
              <Field label="Platform" hint="github, linkedin, medium, email…"><Input value={d.platform} onChange={(e) => set('platform', e.target.value)} /></Field>
              <Field label="Label" hint="Optional display name"><Input value={d.label ?? ''} onChange={(e) => set('label', e.target.value)} /></Field>
            </div>
            <Field label="URL" hint="Full URL, or mailto: for email"><Input value={d.url} onChange={(e) => set('url', e.target.value)} placeholder="https://…" /></Field>
            <Field label="Icon" hint="lucide icon name (e.g. github, linkedin, mail, pen-tool)"><Input value={d.icon ?? ''} onChange={(e) => set('icon', e.target.value)} /></Field>
          </>
        ),
      }}
    />
  );
}
