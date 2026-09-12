import { Hammer } from 'lucide-react';

// Consistent placeholder for CMS modules being delivered in later phases.
// The database tables + RLS already exist, so wiring each editor is incremental.
const NOTES: Record<string, string> = {
  about: 'Edit bio, highlights, stats, profile image, and resume link.',
  experience: 'Add/edit roles with dates, tags, achievements, reorder and visibility.',
  education: 'Add/edit institutions, programs, dates, highlights.',
  skills: 'Manage categories and skills, icons, ordering, visibility.',
  projects: 'Manage projects (title, links, tech, image, featured, order).',
  certificates: 'Add credentials with URLs or uploaded files.',
  blog: 'Write posts with drafts, slug, cover, tags, and SEO fields.',
  social: 'Manage social links shown in hero, footer, and contact.',
  media: 'Upload and manage images and files, with alt text and validation.',
  seo: 'Global and per-page SEO: titles, descriptions, social image, indexing.',
  settings: 'Site name, contact details, footer, feature flags.',
};

export default function Placeholder({ title, routeKey }: { title: string; routeKey: string }) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">{NOTES[routeKey] ?? 'This module is coming soon.'}</p>
      <div className="panel card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
        <Hammer size={20} />
        <div>
          <strong>Editor coming in the next phase.</strong>
          <p className="page-sub" style={{ marginTop: '0.25rem' }}>
            The database table and security policies for “{title}” are already in place — the
            visual editor is being wired up in the agreed phased rollout.
          </p>
        </div>
      </div>
    </div>
  );
}
