import fs from 'node:fs';
import path from 'node:path';

/** Read local images at build time (and on each dev-page request). */
export function getLocalFrames() {
  const folder = path.join(process.cwd(), 'public', 'frames');
  if (!fs.existsSync(folder)) return [];
  const supported = /\.(jpe?g|jfif|png|webp|avif|gif|svg|bmp|ico)$/i;
  function walk(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      if (entry.name.startsWith('.')) return [];
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(file) : supported.test(entry.name) ? [file] : [];
    });
  }
  return walk(folder).sort((a,b) => a.localeCompare(b, undefined, { numeric: true })).map(file => {
    const relative = path.relative(folder, file).split(path.sep).map(encodeURIComponent).join('/');
    const caption = path.basename(file, path.extname(file)).replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { image_url: `/frames/${relative}`, caption, location: null, taken_on: null };
  });
}
