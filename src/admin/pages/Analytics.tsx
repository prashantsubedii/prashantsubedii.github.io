import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { getSupabase } from '../../lib/supabase';

type Overview = { views: number; uniques: number; countries: number };
type Series = { bucket: string; views: number; uniques: number };
type Top = { label: string; views: number; uniques: number };

const RANGES = [
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: '90', label: 'Last 90 days', days: 90 },
];

export default function Analytics() {
  const sb = getSupabase();
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [countries, setCountries] = useState<Top[]>([]);
  const [cities, setCities] = useState<Top[]>([]);
  const [pages, setPages] = useState<Top[]>([]);
  const [referrers, setReferrers] = useState<Top[]>([]);
  const [devices, setDevices] = useState<Top[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - days * 864e5);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [days]);

  useEffect(() => {
    if (!sb) return;
    let active = true;
    setLoading(true); setErr(null);
    (async () => {
      const args = { p_from: range.from, p_to: range.to };
      const [ov, ts, co, ci, pa, re, de] = await Promise.all([
        sb.rpc('analytics_overview', args),
        sb.rpc('analytics_timeseries', { ...args, p_bucket: 'day' }),
        sb.rpc('analytics_top', { p_dimension: 'country', ...args, p_limit: 8 }),
        sb.rpc('analytics_top', { p_dimension: 'city', ...args, p_limit: 8 }),
        sb.rpc('analytics_top', { p_dimension: 'path', ...args, p_limit: 8 }),
        sb.rpc('analytics_top', { p_dimension: 'referrer_host', ...args, p_limit: 8 }),
        sb.rpc('analytics_top', { p_dimension: 'device', ...args, p_limit: 5 }),
      ]);
      if (!active) return;
      if ([ov,ts,co,ci,pa,re,de].some(r => r.error)) {
        setErr('Analytics could not load. Check the connection and database setup.');
      } else {
        setOverview((ov.data?.[0] as Overview) ?? { views: 0, uniques: 0, countries: 0 });
        setSeries(((ts.data as Series[]) ?? []).map((d) => ({ ...d, bucket: d.bucket.slice(5, 10) })));
        setCountries((co.data as Top[]) ?? []);
        setCities((ci.data as Top[]) ?? []);
        setPages((pa.data as Top[]) ?? []);
        setReferrers((re.data as Top[]) ?? []);
        setDevices((de.data as Top[]) ?? []);
      }
      setLoading(false);
    })().catch(() => { if (active) { setErr('Analytics could not load. Please try again.'); setLoading(false); } });
    return () => { active = false; };
  }, [range.from, range.to]);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Page views, daily unique visits and approximate visitor geography. No advertising cookies.</p>
        </div>
        <select className="select" style={{ width: 'auto' }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {RANGES.map((r) => <option key={r.key} value={r.days}>{r.label}</option>)}
        </select>
      </div>

      {err ? <div className="banner warn" style={{ marginTop: '1rem' }}>{err}</div> : null}
      {loading ? <div className="center-screen"><span className="spinner" /></div> : err ? null : (
        <>
          <div className="stat-cards" style={{ marginTop: '1.25rem' }}>
            <div className="stat-card card"><div className="v">{overview?.views ?? 0}</div><div className="l">Page views</div></div>
            <div className="stat-card card"><div className="v">{overview?.uniques ?? 0}</div><div className="l">Daily unique visits</div></div>
            <div className="stat-card card"><div className="v">{overview?.countries ?? 0}</div><div className="l">Countries</div></div>
            <div className="stat-card card"><div className="v">{cities[0]?.label ?? '—'}</div><div className="l">Top city</div></div>
          </div>

          <div className="panel card">
            <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Traffic over time</h2>
            {series.length ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={series} margin={{ left: -18, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="views" stroke="#2563eb" fill="url(#g)" strokeWidth={2} />
                    <Area type="monotone" dataKey="uniques" stroke="#25b67d" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="page-sub">No data yet for this range.</p>}
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr', marginTop: '1.25rem' }}>
            <TopList title="Top countries" rows={countries} />
            <TopList title="Top cities" rows={cities} />
            <TopList title="Most visited pages" rows={pages} />
            <TopList title="Traffic sources" rows={referrers} />
            <TopList title="Devices" rows={devices} />
          </div>
          <p className="page-sub" style={{ marginTop: '1rem' }}>Unique visits reset daily; a returning person can count again on another day. Geography is estimated from IP location and may be affected by VPNs. Age and gender are not collected.</p>
        </>
      )}
    </div>
  );
}

function TopList({ title, rows }: { title: string; rows: Top[] }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <div className="panel card" style={{ marginTop: 0 }}>
      <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{title}</h2>
      {rows.length ? (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {rows.map((r) => (
            <div key={r.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                <span>{r.label}</span><span style={{ color: 'var(--color-muted)' }}>{r.views}</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 999 }}>
                <div style={{ width: `${(r.views / max) * 100}%`, height: '100%', background: 'var(--color-brand)', borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      ) : <p className="page-sub">No data yet.</p>}
    </div>
  );
}
