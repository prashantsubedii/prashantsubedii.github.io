// Supabase Edge Function: analytics beacon (cookieless, privacy-friendly).
// Deploy: supabase functions deploy track --no-verify-jwt
//
// The public page POSTs { path, referrer } here. This function runs on the
// server, so it can read the visitor's IP (never exposed to the browser),
// geolocate it, and record a page view. Uniqueness uses a daily-rotating
// salted hash of ip+ua — no cookies, no durable identifier, GDPR-friendly.
//
// Secrets (set with `supabase secrets set`): ANALYTICS_SALT, ALLOWED_ORIGIN.
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '';
const SALT = Deno.env.get('ANALYTICS_SALT') ?? '';

const cors = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

const BOT = /(bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|preview)/i;

function ua(uaStr: string) {
  const s = uaStr.toLowerCase();
  const device = /mobile|iphone|android(?!.*tablet)/.test(s) ? 'mobile'
    : /ipad|tablet/.test(s) ? 'tablet' : 'desktop';
  const browser = s.includes('edg/') ? 'Edge' : s.includes('chrome') ? 'Chrome'
    : s.includes('firefox') ? 'Firefox' : s.includes('safari') ? 'Safari' : 'Other';
  const os = s.includes('windows') ? 'Windows' : /mac os|macintosh/.test(s) ? 'macOS'
    : s.includes('android') ? 'Android' : /iphone|ipad|ios/.test(s) ? 'iOS'
    : s.includes('linux') ? 'Linux' : 'Other';
  return { device, browser, os };
}

async function sha256(input: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (!SALT || SALT.length < 32 || !ALLOWED_ORIGIN || ALLOWED_ORIGIN === '*') return new Response('Analytics not configured', { status: 503 });
  if (req.headers.get('origin') !== ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403 });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

  try {
    const uaStr = req.headers.get('user-agent') ?? '';
    if (BOT.test(uaStr)) return new Response('ok', { headers: cors }); // ignore bots

    if (Number(req.headers.get('content-length') || 0) > 2048) return new Response('Too large', { status: 413, headers: cors });
    const input = await req.text();
    if (input.length > 2048) return new Response('Too large', { status: 413, headers: cors });
    const body = JSON.parse(input);
    const path = typeof body.path === 'string' ? body.path : '';
    if (!path.startsWith('/') || path.startsWith('//') || path.length > 512 || /[?#\r\n]/.test(path) || path.startsWith('/adminprashant')) return new Response('Invalid path', { status: 400, headers: cors });
    let referrerHost: string | null = null;
    try { if (body.referrer) referrerHost = new URL(String(body.referrer)).hostname; } catch { /* ignore */ }

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';

    // Daily-rotating anonymous visitor id.
    const day = new Date().toISOString().slice(0, 10);
    const visitorHash = await sha256(`${SALT}:${day}:${ip}:${uaStr}`);

    // Geolocate (keyless). Failures degrade to nulls — never block the beacon.
    let geo: { country?: string; country_code?: string; region?: string; city?: string } = {};
    try {
      if (ip !== 'unknown') {
        const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,country_code,region,city`, { signal: AbortSignal.timeout(1800) });
        const j = await r.json();
        if (j.success) geo = { country: j.country, country_code: j.country_code, region: j.region, city: j.city };
      }
    } catch { /* ignore geo errors */ }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // First hit for this visitor today?
    const { count } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('visitor_hash', visitorHash)
      .gte('ts', `${day}T00:00:00Z`);

    const { device, browser, os } = ua(uaStr);
    const { error } = await supabase.from('analytics_events').insert({
      path, referrer_host: referrerHost, visitor_hash: visitorHash,
      is_unique: (count ?? 0) === 0,
      country: geo.country ?? null, country_code: geo.country_code ?? null,
      region: geo.region ?? null, city: geo.city ?? null,
      device, browser, os,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'content-type': 'application/json' },
    });
  } catch (_e) {
    // Analytics must never surface errors to visitors.
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } });
  }
});
