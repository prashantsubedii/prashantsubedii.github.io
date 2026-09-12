import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';
import { Button } from '../ui';

const COUNT_TABLES: { table: string; label: string; route: string }[] = [
  { table: 'projects', label: 'Projects', route: 'projects' },
  { table: 'snapshots', label: 'Frames', route: 'snapshots' },
  { table: 'certificates', label: 'Certificates', route: 'certificates' },
  { table: 'blog_posts', label: 'Blog posts', route: 'blog' },
];

export default function Dashboard({ onNavigate }: { onNavigate: (k: string) => void }) {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    (async () => {
      const next: Record<string, number | null> = {};
      await Promise.all(COUNT_TABLES.map(async (c) => {
        const { count } = await sb.from(c.table).select('*', { count: 'exact', head: true });
        next[c.table] = count ?? 0;
      }));
      setCounts(next);
    })();
  }, []);

  return (
    <div>
      <h1 className="page-title">Welcome back</h1>
      <p className="page-sub">Manage your portfolio content, structure, and analytics from here.</p>

      <div className="stat-cards" style={{ marginTop: '1.25rem' }}>
        {COUNT_TABLES.map((c) => (
          <button key={c.table} className="stat-card card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => onNavigate(c.route)}>
            <div className="v">{counts[c.table] ?? '—'}</div>
            <div className="l">{c.label}</div>
          </button>
        ))}
      </div>

      <div className="panel card">
        <h2 style={{ fontWeight: 700 }}>Quick actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.85rem' }}>
          <Button variant="ghost" onClick={() => onNavigate('hero')}>Edit hero</Button>
          <Button variant="ghost" onClick={() => onNavigate('sections')}>Reorder sections</Button>
          <Button variant="ghost" onClick={() => onNavigate('blog')}>Write a post</Button>
          <Button variant="ghost" onClick={() => onNavigate('analytics')}>View analytics</Button>
        </div>
      </div>

      <div className="panel card">
        <h2 style={{ fontWeight: 700 }}>Publishing</h2>
        <p className="page-sub" style={{ marginTop: '0.5rem' }}>
          Frames and Certificates update on the next public page load, including visibility switches.
          Other portfolio edits appear after the site's deployment workflow rebuilds the pages.
        </p>
      </div>
    </div>
  );
}
