// Render CMS markdown to sanitized HTML. Runs at build time (static output),
// but sanitizing anyway keeps us safe if content ever renders on the client.
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return '';
  const raw = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
