type Media = { bucket: string; storage_path: string; mime_type?: string } | null;
type Credential = { name: string; issuer: string | null; description: string | null; credential_url: string | null; file: Media; thumbnail: Media };
type Frame = { caption: string | null; image: Media };
type Portfolio = { sections: { key: string; is_visible: boolean; in_nav: boolean }[]; certificates: Credential[]; frames: Frame[] };
const base = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}
function mediaUrl(media: Media): string | null {
  return media && base ? `${base}/storage/v1/object/public/${encodeURIComponent(media.bucket)}/${media.storage_path.split('/').map(encodeURIComponent).join('/')}` : null;
}
function safeUrl(value: string | null) {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
function certificateCard(item: Credential) {
  const card = element('article', 'credential-card');
  const cover = element('div', 'credential-cover');
  const source = mediaUrl(item.thumbnail) || (item.file?.mime_type?.startsWith('image/') ? mediaUrl(item.file) : null);
  if (source) {
    const img = element('img'); img.src = source; img.alt = item.name; img.loading = 'lazy'; cover.append(img);
  } else {
    const template = document.getElementById('credential-icon') as HTMLTemplateElement | null;
    if (template) cover.append(template.content.cloneNode(true));
  }
  const body = element('div', 'credential-body');
  body.append(element('h3', '', item.name));
  if (item.issuer) body.append(element('p', '', item.issuer));
  if (item.description) body.append(element('p', '', item.description));
  const href = safeUrl(item.credential_url) || mediaUrl(item.file);
  if (href) { const link = element('a', '', item.credential_url ? 'View credential ↗' : 'Open certificate ↗'); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; body.append(link); }
  card.append(cover, body); return card;
}
function frameCard(item: Frame) {
  const figure = element('figure', 'managed-frame');
  const source = mediaUrl(item.image);
  if (!source) return figure;
  const button = element('button'); button.type = 'button'; button.dataset.frameSrc = source;
  button.dataset.frameCaption = item.caption || ''; button.setAttribute('aria-label', item.caption ? `View ${item.caption}` : 'View photo');
  const img = element('img'); img.src = source; img.alt = item.caption || 'Community photo'; img.loading = 'lazy';
  button.append(img); figure.append(button);
  if (item.caption?.trim()) figure.append(element('figcaption', '', item.caption));
  return figure;
}
let pending = false;
async function refreshManagedContent() {
  if (!base || !key || pending || location.pathname.startsWith('/adminprashant')) return;
  pending = true;
  try {
    const response = await fetch(`${base}/rest/v1/rpc/public_portfolio`, {
      method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(10000), cache: 'no-store',
    });
    if (!response.ok) throw new Error('Content unavailable');
    const data: Portfolio = await response.json();
    for (const name of ['frames', 'certificates']) {
      const section = data.sections.find(s => s.key === name);
      document.querySelectorAll<HTMLElement>(`[data-managed-nav="${name}"]`).forEach(link => { link.hidden = !(section?.is_visible && section.in_nav); });
      const container = document.querySelector<HTMLElement>(name === 'frames' ? '[data-frames-page]' : '#certificates');
      if (container) container.hidden = !section?.is_visible;
      if (name === 'frames') {
        const unavailable = document.querySelector<HTMLElement>('[data-frames-unavailable]');
        if (unavailable) { unavailable.hidden = !!section?.is_visible; unavailable.querySelector('p')!.textContent = 'Frames is not available right now. Please check back later.'; }
      }
    }
    const slider = document.querySelector('.credential-slider');
    if (slider) slider.replaceChildren(...data.certificates.map(certificateCard));
    const certEmpty = document.querySelector<HTMLElement>('[data-cert-empty]');
    if (certEmpty) certEmpty.hidden = data.certificates.length > 0;
    const frameGrid = document.querySelector('[data-managed-frames]');
    if (frameGrid) frameGrid.replaceChildren(...data.frames.filter(f => f.image).map(frameCard));
    const frameEmpty = document.querySelector<HTMLElement>('.frames-empty');
    if (frameEmpty) frameEmpty.hidden = data.frames.length > 0;
  } catch {
    const unavailable = document.querySelector<HTMLElement>('[data-frames-unavailable] p');
    if (unavailable) unavailable.textContent = 'The photo collection could not load. Please refresh to try again.';
  } finally { pending = false; }
}
void refreshManagedContent();
document.addEventListener('visibilitychange', () => { if (!document.hidden) void refreshManagedContent(); });
document.querySelectorAll<HTMLButtonElement>('[data-slide]').forEach(button => button.addEventListener('click', () => {
  const slider = document.querySelector('.credential-slider');
  slider?.scrollBy({ left: (button.dataset.slide === 'next' ? 1 : -1) * slider.clientWidth * .9, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}));
