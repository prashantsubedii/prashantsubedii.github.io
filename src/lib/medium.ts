// Build-time Medium integration. Fetches the author's RSS feed and parses it
// into typed posts (title, link, cover image, tags, excerpt, reading time).
// Runs during `astro build`; fails soft (returns []) so the site always builds
// even offline or if Medium is unreachable.
import DOMPurify from 'isomorphic-dompurify';
import { readingMinutes } from './format';

export interface MediumPost {
  slug: string;            // last URL segment, used for /blog/[slug]
  title: string;
  url: string;             // canonical Medium URL
  date: string | null;     // ISO
  thumbnail: string | null;
  tags: string[];
  excerpt: string;
  readingMinutes: number;
  content: string;         // sanitized full HTML (for on-site rendering)
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '…');
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeEntities(m[1]).trim() : null;
}

function upgradeImage(src: string): string {
  // Medium serves feed thumbnails tiny (…/max/854/…). Ask for a larger crop.
  return src.replace(/\/(?:max|fit\/c)\/\d+(?:\/\d+\/\d+)?\//, '/max/1200/');
}

/**
 * @param handle Medium username without the leading '@' (e.g. 'prashantsubedii')
 */
const feedCache = new Map<string, { expires: number; posts: Promise<MediumPost[]> }>();

export async function getMediumPosts(handle: string, limit = 6): Promise<MediumPost[]> {
  const key = handle.replace(/^@/, '').trim();
  if (!key) return [];
  let cached = feedCache.get(key);
  if (!cached || cached.expires <= Date.now()) {
    cached = { expires: Date.now() + 5 * 60_000, posts: fetchMediumPosts(key) };
    feedCache.set(key, cached);
  }
  return (await cached.posts).slice(0, limit);
}

async function fetchMediumPosts(handle: string): Promise<MediumPost[]> {
  if (!handle) return [];
  const feed = `https://medium.com/feed/@${handle.replace(/^@/, '')}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(feed, {
      signal: controller.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (portfolio build)' },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const xml = await res.text();

    const items = xml.split(/<item>/).slice(1).map((s) => s.split('</item>')[0]);
    const posts: MediumPost[] = [];
    for (const it of items) {
      const title = tag(it, 'title');
      const rawLink = tag(it, 'link');
      if (!title || !rawLink) continue;
      const url = rawLink.split('?')[0];

      const rawContent = (it.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1]) ?? '';
      const decoded = decodeEntities(rawContent);
      const imgMatch = decoded.match(/<img[^>]+src="([^"]+)"/i);
      const thumbnail = imgMatch ? upgradeImage(imgMatch[1]) : null;

      const text = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const excerpt = text.slice(0, 180).replace(/\s+\S*$/, '') + (text.length > 180 ? '…' : '');

      // Sanitize the full HTML so we can render it safely on our own page.
      const content = DOMPurify.sanitize(decoded, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
          'strong', 'em', 'b', 'i', 'figure', 'figcaption', 'img', 'hr', 'br', 'em', 'span'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
      });

      const tags = [...it.matchAll(/<category>([\s\S]*?)<\/category>/gi)]
        .map((m) => decodeEntities(m[1]).trim()).filter(Boolean).slice(0, 4);

      const pub = tag(it, 'pubDate');
      const date = pub ? new Date(pub).toISOString() : null;
      const slug = (url.split('?')[0].split('/').pop() || '').trim() || `post-${posts.length + 1}`;

      posts.push({ slug, title, url, date, thumbnail, tags, excerpt, readingMinutes: readingMinutes(text), content });
    }
    return posts;
  } catch {
    return [];
  }
}

/** Extract a Medium handle from a social URL like https://medium.com/@name. */
export function mediumHandleFrom(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/medium\.com\/@?([A-Za-z0-9._-]+)/i) || url.match(/([A-Za-z0-9._-]+)\.medium\.com/i);
  return m ? m[1].replace(/^@/, '') : null;
}
