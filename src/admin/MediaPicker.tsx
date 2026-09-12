import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Upload, X, FileText } from 'lucide-react';
import { Button, Modal, useToast } from './ui';
import { listMedia, uploadMedia, mediaUrl, type MediaRow } from './media';

function isImage(m: MediaRow): boolean {
  return (m.mime_type ?? '').startsWith('image/');
}

function Thumb({ m, size = 64 }: { m: MediaRow; size?: number }) {
  if (isImage(m)) {
    return <img src={mediaUrl(m)} alt={m.alt_text ?? m.filename ?? ''} width={size} height={size}
      style={{ objectFit: 'cover', width: size, height: size, borderRadius: 8, border: '1px solid var(--color-border)' }} />;
  }
  return (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
      <FileText size={22} />
    </div>
  );
}

/**
 * Pick or upload a media item for a `*_media_id` field.
 * `value` is the currently selected media id (or null); `onChange` reports the id.
 */
export function MediaPicker({ label, value, onChange, accept, folder = 'uploads' }: {
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
  accept?: string;
  folder?: 'uploads' | 'frames' | 'certificates';
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = items.find((m) => m.id === value) ?? null;

  const load = async () => {
    setLoading(true);
    try { setItems(await listMedia()); }
    catch (e) { push('error', `Could not load media: ${(e as Error).message}`); }
    setLoading(false);
  };

  // Resolve the current selection's thumbnail even before the picker is opened.
  useEffect(() => {
    if (value && !items.length) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const openPicker = async () => { setOpen(true); if (!items.length) await load(); };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      if (accept && !accept.split(',').some(type => type.trim() === file.type || (type.trim() === 'image/*' && file.type.startsWith('image/')))) throw new Error('Choose a file type supported by this field.');
      const row = await uploadMedia(file, undefined, folder);
      setItems((xs) => [row, ...xs]);
      onChange(row.id);
      push('success', 'Uploaded.');
      setOpen(false);
    } catch (e) {
      push('error', `Upload failed: ${(e as Error).message}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div className="media-picker">
        {selected ? (
          <div className="media-current">
            <Thumb m={selected} />
            <div style={{ minWidth: 0 }}>
              <div className="row-title" style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.filename ?? 'Selected'}</div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                <Button variant="ghost" onClick={openPicker} type="button">Change</Button>
                <Button variant="ghost" onClick={() => onChange(null)} type="button"><X size={14} /> Remove</Button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" className="media-empty" onClick={openPicker}>
            <ImagePlus size={18} /> Choose or upload…
          </button>
        )}
      </div>

      {open ? (
        <Modal title="Media library" wide onClose={() => setOpen(false)}
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input ref={fileRef} type="file" hidden accept={accept}
                onChange={(e) => onFile(e.target.files?.[0])} />
              <Button type="button" loading={uploading} onClick={() => fileRef.current?.click()}><Upload size={15} /> Upload new</Button>
              {value ? <Button variant="ghost" type="button" onClick={() => { onChange(null); setOpen(false); }}>Clear selection</Button> : null}
            </div>
          }>
          {loading ? <div className="center-screen" style={{ minHeight: '8rem' }}><span className="spinner" /></div> : (
            items.length ? (
              <div className="media-grid">
                {items.filter(m => !accept || accept.split(',').some(type => type.trim() === m.mime_type || (type.trim() === 'image/*' && isImage(m)))).map((m) => (
                  <button key={m.id} type="button"
                    className={`media-cell ${m.id === value ? 'sel' : ''}`}
                    onClick={() => { onChange(m.id); setOpen(false); }}
                    title={m.filename ?? ''}>
                    <Thumb m={m} size={92} />
                    <span className="media-name">{m.filename ?? 'file'}</span>
                  </button>
                ))}
              </div>
            ) : <p className="page-sub">No media yet. Upload your first file.</p>
          )}
        </Modal>
      ) : null}
    </div>
  );
}
