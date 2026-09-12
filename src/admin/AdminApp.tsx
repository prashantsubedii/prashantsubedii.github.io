import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, User, Briefcase, GraduationCap, Wrench, FolderGit2,
  Award, Newspaper, Share2, Image, Search, Settings, BarChart3, LogOut,
  Menu, Sparkles, ListOrdered, Camera,
} from 'lucide-react';
import { useAuth } from './useAuth';
import { Button, Field, Input, ToastProvider } from './ui';
import { isSupabaseConfigured } from '../lib/supabase';
import Dashboard from './pages/Dashboard';
import HeroEditor from './pages/HeroEditor';
import SectionsManager from './pages/SectionsManager';
const Analytics = lazy(() => import('./pages/Analytics'));
import AboutEditor from './pages/AboutEditor';
import ExperienceEditor from './pages/ExperienceEditor';
import EducationEditor from './pages/EducationEditor';
import SkillsEditor from './pages/SkillsEditor';
import ProjectsEditor from './pages/ProjectsEditor';
import CertificatesEditor from './pages/CertificatesEditor';
import BlogEditor from './pages/BlogEditor';
import SnapshotsEditor from './pages/SnapshotsEditor';
import SocialEditor from './pages/SocialEditor';
import MediaManager from './pages/MediaManager';
import SeoEditor from './pages/SeoEditor';
import SettingsEditor from './pages/SettingsEditor';
import Placeholder from './pages/Placeholder';

interface NavDef { key: string; label: string; icon: React.ComponentType<{ size?: number }>; group: string; }
const NAV: NavDef[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Overview' },
  { key: 'hero', label: 'Hero', icon: Sparkles, group: 'Content' },
  { key: 'about', label: 'About', icon: User, group: 'Content' },
  { key: 'experience', label: 'Experience', icon: Briefcase, group: 'Content' },
  { key: 'education', label: 'Education', icon: GraduationCap, group: 'Content' },
  { key: 'skills', label: 'Skills', icon: Wrench, group: 'Content' },
  { key: 'projects', label: 'Projects', icon: FolderGit2, group: 'Content' },
  { key: 'certificates', label: 'Certificates', icon: Award, group: 'Content' },
  { key: 'blog', label: 'Blog', icon: Newspaper, group: 'Content' },
  { key: 'snapshots', label: 'Frames', icon: Camera, group: 'Content' },
  { key: 'sections', label: 'Sections & Order', icon: ListOrdered, group: 'Structure' },
  { key: 'social', label: 'Social Links', icon: Share2, group: 'Structure' },
  { key: 'media', label: 'Media', icon: Image, group: 'Structure' },
  { key: 'seo', label: 'SEO', icon: Search, group: 'Structure' },
  { key: 'settings', label: 'Site Settings', icon: Settings, group: 'Structure' },
];

function useHashRoute(): [string, (k: string) => void] {
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || 'dashboard');
  useEffect(() => {
    const on = () => setRoute(window.location.hash.replace('#', '') || 'dashboard');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const nav = (k: string) => { window.location.hash = k; };
  return [route, nav];
}

function LoginScreen({ onSubmit, error }: { onSubmit: (e: string, p: string) => Promise<void>; error: string | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="auth-wrap">
      <div className="auth-card card" style={{ padding: '1.75rem' }}>
        <img src="/favicon.svg" width="52" height="52" alt="PS." className="auth-mark" />
        <p className="auth-eyebrow">PORTFOLIO STUDIO</p>
        <h1>Admin sign in</h1>
        <p className="sub">Authorized administrator only.</p>
        <form className="auth-form" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await onSubmit(email.trim(), password); } finally { setPassword(''); setBusy(false); } }}>
          <Field label="Email">
            <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error ? <div className="banner error">{error}</div> : null}
          <Button type="submit" loading={busy}>Sign in</Button>
        </form>
      </div>
    </div>
  );
}

function CenterMessage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="center-screen">
      <div className="auth-card card" style={{ padding: '1.75rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{title}</h1>
        <div style={{ color: 'var(--color-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const auth = useAuth();
  const [route, nav] = useHashRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = useMemo(() => NAV.find((n) => n.key === route) ?? NAV[0], [route]);
  const groups = useMemo(() => {
    const g: Record<string, NavDef[]> = {};
    for (const n of NAV) (g[n.group] ??= []).push(n);
    return g;
  }, []);

  if (auth.status === 'unconfigured' || !isSupabaseConfigured) {
    return (
      <div className="admin-root">
        <CenterMessage title="Supabase not configured">
          Set <code>PUBLIC_SUPABASE_URL</code> and <code>PUBLIC_SUPABASE_ANON_KEY</code> in your
          environment, then reload. See <code>.env.example</code> and <code>supabase/SETUP.md</code>.
        </CenterMessage>
      </div>
    );
  }
  if (auth.status === 'loading' || auth.status === 'checking') {
    return <div className="admin-root"><div className="center-screen"><span className="spinner" /></div></div>;
  }
  if (auth.status === 'signed-out') {
    return <div className="admin-root"><LoginScreen onSubmit={auth.signIn} error={auth.error} /></div>;
  }
  if (auth.status === 'denied') {
    return (
      <div className="admin-root">
        <CenterMessage title="Access denied">
          This account is not authorized. <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={auth.signOut}>Sign out</button>
        </CenterMessage>
      </div>
    );
  }

  // status === 'admin'
  const renderPage = () => {
    switch (route) {
      case 'dashboard': return <Dashboard onNavigate={nav} />;
      case 'analytics': return <Analytics />;
      case 'hero': return <HeroEditor />;
      case 'about': return <AboutEditor />;
      case 'experience': return <ExperienceEditor />;
      case 'education': return <EducationEditor />;
      case 'skills': return <SkillsEditor />;
      case 'projects': return <ProjectsEditor />;
      case 'certificates': return <CertificatesEditor />;
      case 'blog': return <BlogEditor />;
      case 'snapshots': return <SnapshotsEditor />;
      case 'sections': return <SectionsManager />;
      case 'social': return <SocialEditor />;
      case 'media': return <MediaManager />;
      case 'seo': return <SeoEditor />;
      case 'settings': return <SettingsEditor />;
      default: return <Placeholder title={current.label} routeKey={route} />;
    }
  };

  return (
    <ToastProvider>
      <div className="admin-root admin-shell">
        {sidebarOpen ? <div className="admin-backdrop" onClick={() => setSidebarOpen(false)} /> : null}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-head">
            <img src="/favicon.svg" width="38" height="38" alt="PS." />
            <strong style={{ fontSize: '0.95rem' }}>Portfolio CMS</strong>
          </div>
          <nav className="sidebar-nav">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="sidebar-group">{group}</div>
                {items.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button key={n.key} className={`nav-item ${route === n.key ? 'active' : ''}`}
                      onClick={() => { nav(n.key); setSidebarOpen(false); }}>
                      <Icon size={17} /> {n.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="sidebar-foot">
            <button className="nav-item" onClick={auth.signOut}><LogOut size={17} /> Sign out</button>
          </div>
        </aside>

        <div className="admin-main">
          <div className="admin-topbar">
            <button className="menu-btn nav-item" style={{ width: 'auto' }} onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
            <strong>{current.label}</strong>
            <span style={{ marginLeft: 'auto', color: 'var(--color-muted)', fontSize: '0.82rem' }}>{auth.user?.email}</span>
          </div>
          <main className="admin-content"><Suspense fallback={<div className="center-screen"><span className="spinner" /></div>}>{renderPage()}</Suspense></main>
        </div>
      </div>
    </ToastProvider>
  );
}
