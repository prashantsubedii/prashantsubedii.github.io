// Pinned GitHub repositories + on-demand README fetching, both at build time.
// pinned.json is produced by .github/workflows/update-pinned.yml. READMEs are
// fetched from the GitHub API during `astro build` and rendered on our own
// /projects/<slug> pages. Fails soft (empty README) if the network is down.
import fs from 'node:fs';
import path from 'node:path';
import { renderMarkdown } from './markdown';

export interface Repo {
  name: string;
  slug: string;
  owner: string;
  description: string;
  url: string;
  defaultBranch: string;
  openGraphImage: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: string | null;
  topics: string[];
}

export function repoSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getPinnedRepos(): Repo[] {
  try {
    const p = path.join(process.cwd(), 'public', 'assets', 'pinned.json');
    const json = JSON.parse(fs.readFileSync(p, 'utf-8'));
    const list = Array.isArray(json.pinnedRepos) ? json.pinnedRepos : [];
    return list.map((r: any) => {
      const m = String(r.url ?? '').match(/github\.com\/([^/]+)\/([^/]+)/i);
      const owner = m ? m[1] : 'prashantsubedii';
      const slug = repoSlug(r.name);
      const localExtension = ['webp', 'png'].find(ext => fs.existsSync(path.join(process.cwd(), 'public', 'assets', 'projects', `${slug}.${ext}`)));
      return {
        name: r.name, slug, owner,
        description: r.description ?? '', url: r.url,
        defaultBranch: r.defaultBranch ?? 'main', openGraphImage: localExtension ? `/assets/projects/${slug}.${localExtension}` : r.openGraphImage ?? '',
        stars: r.stars ?? 0, forks: r.forks ?? 0,
        language: r.language ?? null, languageColor: r.languageColor ?? null,
        topics: Array.isArray(r.topics) ? r.topics : [],
      } as Repo;
    });
  } catch {
    return [];
  }
}

/** Rewrite README relative image/link URLs so they resolve against the repo. */
function absolutize(html: string, repo: Repo): string {
  const rawBase = `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${repo.defaultBranch}/`;
  const blobBase = `https://github.com/${repo.owner}/${repo.name}/blob/${repo.defaultBranch}/`;
  return html
    .replace(/(<img[^>]+src=")(?!https?:|data:)\/?([^"]+)"/gi, (_m, pre, p) => `${pre}${rawBase}${p}"`)
    .replace(/(<a[^>]+href=")(?!https?:|#|mailto:)\/?([^"]+)"/gi, (_m, pre, p) => `${pre}${blobBase}${p}"`);
}

/** Fetch a repo's README and return sanitized, absolutized HTML ('' on failure). */
export async function getRepoReadmeHtml(repo: Repo): Promise<string> {
  try {
    const token = import.meta.env.GITHUB_TOKEN as string | undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/readme`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.raw+json',
        'User-Agent': 'portfolio-build',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    clearTimeout(timer);
    if (!res.ok) return '';
    const md = await res.text();
    return absolutize(renderMarkdown(md), repo);
  } catch {
    return '';
  }
}
