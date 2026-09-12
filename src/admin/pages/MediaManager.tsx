import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, FileText, Copy } from 'lucide-react';
import { Button, Field, Input, Modal, useToast, useConfirm } from '../ui';
import { listMedia, uploadMedia, deleteMedia, updateMediaAlt, mediaUrl, type MediaRow } from '../media';

function isImage(m: MediaRow) { return (m.mime_type ?? '').startsWith('image/'); }
function humanSize(n: number | null) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaManager() {
  const { push } = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [alt, setAlt] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await listMedia()); }
    catch (e) { push('error', `Load failed: ${(e as Error).message}`); }
    setLoading(false);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    for (const f of Array.from(files)) {
      try {
        const row = await uploadMedia(f);
        setItems((xs) => [row, ...xs]);
      } catch (e) {
        push('error', `Upload failed (${f.name}): ${(e as Error).message}`);
      }
    }
    setUploading(false);
    push('success', 'Upload complete.');
    if (fileRef.current) fileRef.current.value = '';
  };

  const remove = async (m: MediaRow) => {
    if (!confirm(`Delete "${m.filename ?? 'file'}"? References to it will show a broken image until updated.`)) return;
    try {
      await deleteMedia(m);
      setItems((xs) => xs.filter((x) => x.id !== m.id));
      push('success', 'Deleted.');
    } catch (e) { push('error', `Delete failed: ${(e as Error).message}`); }
  };

  const saveAlt = async () => {
    if (!editing) return;
    try {
      await updateMediaAlt(editing.id, alt);
      setItems((xs) => xs.map((x) => (x.id === editing.id ? { ...x, alt_text: alt } : x)));
      setEditing(null);
      push('success', 'Saved.');
    } catch (e) { push('error', `Save failed: ${(e as Error).message}`); }
  };

  const copyUrl = async (m: MediaRow) => {
    try { await navigator.clipboard.writeText(mediaUrl(m)); push('success', 'URL copied.'); }
    catch { push('error', 'Could not copy.'); }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Media</h1>
          <p className="page-sub">Images and files (max 10&nbsp;MB each). PNG, JPEG, WebP, GIF, SVG, and PDF are allowed.</p>
        </div>
        <input ref={fileRef} type="file" hidden multiple accept="image/*,application/pdf" onChange={(e) => onFiles(e.target.files)} />
        <Button loading={uploading} onClick={() => fileRef.current?.click()}><Upload size={16} /> Upload</Button>
      </div>

      {loading ? <div className="center-screen"><span className="spinner" /></div> : (
        items.length ? (
          <div className="media-grid manage" style={{ marginTop: '1.25rem' }}>
            {items.map((m) => (
              <div key={m.id} className="media-manage-cell card">
                <div className="media-manage-thumb">
                  {isImage(m)
                    ? <img src={mediaUrl(m)} alt={m.alt_text ?? m.filename ?? ''} loading="lazy" />
                    : <div className="file-ph"><FileText size={26} /></div>}
                </div>
                <div className="media-manage-meta">
                  <div className="row-title" style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.filename ?? ''}>{m.filename ?? 'file'}</div>
                  <div className="row-meta">{humanSize(m.size_bytes)}{m.width ? ` · ${m.width}×${m.height}` : ''}</div>
                  {!m.alt_text && isImage(m) ? <div className="row-meta" style={{ color: '#f59e0b' }}>No alt text</div> : null}
                </div>
                <div className="media-manage-actions">
                  <button className="icon-btn" aria-label="Copy URL" title="Copy URL" onClick={() => copyUrl(m)}><Copy size={15} /></button>
                  <button className="icon-btn" aria-label="Edit alt text" onClick={() => { setEditing(m); setAlt(m.alt_text ?? ''); }}>Alt</button>
                  <button className="icon-btn danger" aria-label="Delete" onClick={() => remove(m)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty card">No media yet. Upload your first file.</div>
      )}

      {editing ? (
        <Modal title="Alt text" onClose={() => setEditing(null)}
          footer={<>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveAlt}>Save</Button>
          </>}>
          <Field label="Alt text" hint="Describe the image for screen readers and SEO">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} autoFocus />
          </Field>
        </Modal>
      ) : null}
    </div>
  );
}
