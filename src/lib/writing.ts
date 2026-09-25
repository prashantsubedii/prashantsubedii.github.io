import { getMediumPosts, type MediumPost } from './medium';

/** Articles shown on the site, pulled from Medium at build time. */
export async function getWritingPosts(handle: string): Promise<MediumPost[]> {
  const posts = await getMediumPosts(handle, 24);
  return [...posts].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}
