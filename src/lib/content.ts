// Build-time content layer. Reads published CMS content from Supabase when it
// is configured; otherwise returns sensible defaults so the site always builds
// and renders. All getters are safe to call during `astro build`.
import { getSupabase, isSupabaseConfigured } from './supabase';
import type {
  About, BlogPost, Certificate, Education, Experience, Hero, Project,
  SectionMeta, SiteSettings, Skill, SkillCategory, SocialLink, Snapshot,
} from './types';

// ---------------------------------------------------------------------------
// Media resolution: map media.id -> public URL.
// ---------------------------------------------------------------------------
async function loadMediaMap(): Promise<Record<string, string>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data } = await sb.from('media').select('id,bucket,storage_path');
  const base = (import.meta.env.PUBLIC_SUPABASE_URL as string) ?? '';
  const map: Record<string, string> = {};
  for (const m of data ?? []) {
    map[m.id] = `${base}/storage/v1/object/public/${m.bucket}/${m.storage_path}`;
  }
  return map;
}

// ---------------------------------------------------------------------------
// Defaults (used when Supabase is not configured). Mirror supabase/seed.sql.
// ---------------------------------------------------------------------------
const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'Prashant Subedi',
  logo_url: null,
  seo_title: 'Prashant Subedi | Aspiring AI/ML Engineer & Researcher',
  seo_description:
    'Prashant Subedi is an aspiring AI/ML engineer, researcher and tech community builder from Nepal, exploring machine learning and bringing people together to learn and build.',
  seo_keywords: ['Prashant Subedi', 'Aspiring AI/ML Engineer Nepal', 'Machine Learning', 'CSITAN Chitwan'],
  social_image_url: '/assets/images/profile.jpg',
  canonical_domain: 'https://www.prashantsubedi.info.np',
  twitter_handle: '@prashantsubedii',
  contact_email: 'contactprashantsubedi@gmail.com',
  contact_location: 'Chitwan, Nepal',
  footer_tagline: 'Aspiring AI/ML Engineer, Researcher and Tech Community Builder',
  footer_copyright: `© ${new Date().getFullYear()} Prashant Subedi`,
  analytics_enabled: true,
};

const DEFAULT_HERO: Hero = {
  headline: 'Prashant Subedi',
  descriptor: 'Aspiring AI/ML Engineer, Researcher and Tech Community Builder',
  description:
    'I explore how machine learning can solve meaningful problems. Based in Nepal, I turn curiosity into practical AI projects and bring people together through workshops, hackathons and shared learning.',
  availability_text: null,
  show_availability: false,
  image_url: '/assets/images/profile.jpg',
  primary_cta_label: 'View Projects',
  primary_cta_url: '#featured-projects',
  secondary_cta_label: 'Get in touch',
  secondary_cta_url: '#contact',
};

const DEFAULT_ABOUT: About = {
  heading: 'About',
  bio:
    "I'm an aspiring AI/ML engineer and researcher pursuing B.Sc. CSIT in Chitwan, Nepal. I am interested in understanding intelligent systems and applying them to challenges that matter.\n\n" +
    'My work centers on learning machine learning fundamentals, experimenting with data and developing practical AI projects. ForestSathi, a wildfire risk prediction system for Nepal, is one way I am putting that learning into practice.\n\n' +
    'I also serve as Vice President of CSITAN Chitwan, the student CSIT community, where I help organize events, workshops, and hackathons (including CSITAN Hackfest 2024) that give students a place to learn and build together. I care about community as much as I care about the work itself.',
  image_url: '/assets/images/about.jpg',
  resume_url: '/assets/CV.pdf',
  cta_label: 'Download CV',
  cta_url: '/assets/CV.pdf',
  highlights: [
    { id: 'h1', label: 'Applied AI exploration', icon: 'brain' },
    { id: 'h2', label: 'Tech community building', icon: 'users' },
    { id: 'h3', label: 'Research-driven thinking', icon: 'search' },
  ],
  stats: [],
};

const DEFAULT_SECTIONS: SectionMeta[] = [
  { key: 'about', label: 'About', is_visible: true, in_nav: true, sort_order: 10 },
  { key: 'experience', label: 'Experience', is_visible: true, in_nav: true, sort_order: 20 },
  { key: 'education', label: 'Education', is_visible: true, in_nav: true, sort_order: 30 },
  { key: 'skills', label: 'Skills', is_visible: true, in_nav: true, sort_order: 40 },
  { key: 'featured-projects', label: 'Projects', is_visible: true, in_nav: true, sort_order: 50 },
  { key: 'certificates', label: 'Certificates', is_visible: false, in_nav: true, sort_order: 60 },
  { key: 'blog', label: 'Blog', is_visible: true, in_nav: true, sort_order: 70 },
  { key: 'contact', label: 'Contact', is_visible: true, in_nav: true, sort_order: 80 },
];

const DEFAULT_EXPERIENCE: Experience[] = [
  {
    id: 'seed-csitan', organization: 'CSIT Association of Nepal, Chitwan',
    role: 'Vice President', employment_type: 'Volunteer', work_mode: 'Hybrid',
    location: 'Chitwan, Nepal', organization_url: 'https://chitwan.csitan.org.np',
    logo_url: null, start_date: '2024-12-01', end_date: null, is_current: true,
    description:
      'Help lead a student technology community: coordinating events, workshops, and hackathons and supporting technology programs for CSIT students. Previously served as an Executive Member. Helped organize CSITAN Hackfest 2024, a nationwide hackathon.',
    achievements: [], technologies: [], sort_order: 10,
  },
  {
    id: 'seed-synergy', organization: 'Synergy Media, Chitwan',
    role: 'Creative Designer', employment_type: 'Full-time', work_mode: 'Hybrid',
    location: 'Chitwan, Nepal', organization_url: null, logo_url: null,
    start_date: null, end_date: null, is_current: true,
    description:
      'Design brand and digital visuals including graphics, social media creatives, and website UI, and support web and general technical and IT work.',
    achievements: [], technologies: [], sort_order: 20,
  },
];

const DEFAULT_EDUCATION: Education[] = [
  {
    id: 'seed-lumbini', institution: 'Lumbini ICT Campus (Tribhuvan University)',
    program: 'B.Sc. CSIT',
    degree: 'Bachelor of Science in Computer Science and Information Technology',
    location: 'Chitwan, Nepal', institution_url: null, logo_url: null,
    start_date: null, end_date: null, is_current: true,
    description: 'Undergraduate study in computer science and information technology.',
    highlights: [], sort_order: 10,
  },
  {
    // TODO(prashant): replace the institution name + years with your real school.
    id: 'seed-school', institution: 'Gaindakot Namuna Secondary School',
    program: '+2 Computer Science (NEB)',
    degree: 'Higher Secondary Education in Computer Science',
    location: 'Chitwan, Nepal', institution_url: null, logo_url: null,
    start_date: null, end_date: null, is_current: false,
    description: 'Higher secondary studies in computer science, building a foundation in programming, computing and mathematics.',
    highlights: [], sort_order: 20,
  },
];

const DEFAULT_SOCIALS: SocialLink[] = [
  { id: 's-instagram', platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/prashanttsubedi/', icon: 'instagram', sort_order: 50 },
  { id: 's1', platform: 'github', label: 'GitHub', url: 'https://github.com/prashantsubedii', icon: 'github', sort_order: 10 },
  { id: 's2', platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/prashantsubedii', icon: 'linkedin', sort_order: 20 },
  { id: 's3', platform: 'medium', label: 'Medium', url: 'https://medium.com/@prashantsubedii', icon: 'pen-tool', sort_order: 30 },
  { id: 's4', platform: 'email', label: 'Email', url: 'mailto:contactprashantsubedi@gmail.com', icon: 'mail', sort_order: 40 },
];

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_SETTINGS;
  const [{ data }, media] = await Promise.all([
    sb.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    loadMediaMap(),
  ]);
  if (!data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    logo_url: data.logo_media_id ? media[data.logo_media_id] ?? null : null,
    social_image_url: data.social_image_media_id ? media[data.social_image_media_id] ?? DEFAULT_SETTINGS.social_image_url : DEFAULT_SETTINGS.social_image_url,
  };
}

export async function getHero(): Promise<Hero> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_HERO;
  const [{ data }, media] = await Promise.all([
    sb.from('hero').select('*').eq('id', 1).maybeSingle(),
    loadMediaMap(),
  ]);
  if (!data) return DEFAULT_HERO;
  return {
    ...DEFAULT_HERO, ...data,
    image_url: data.image_media_id ? media[data.image_media_id] ?? DEFAULT_HERO.image_url : DEFAULT_HERO.image_url,
  };
}

export async function getAbout(): Promise<About> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_ABOUT;
  const [{ data }, hl, st, media] = await Promise.all([
    sb.from('about').select('*').eq('id', 1).maybeSingle(),
    sb.from('about_highlights').select('*').eq('is_visible', true).order('sort_order'),
    sb.from('about_stats').select('*').eq('is_visible', true).order('sort_order'),
    loadMediaMap(),
  ]);
  if (!data) return DEFAULT_ABOUT;
  return {
    ...DEFAULT_ABOUT, ...data,
    image_url: data.image_media_id ? media[data.image_media_id] ?? DEFAULT_ABOUT.image_url : DEFAULT_ABOUT.image_url,
    highlights: (hl.data ?? []).map((h) => ({ id: h.id, label: h.label, icon: h.icon })),
    stats: (st.data ?? []).map((s) => ({ id: s.id, label: s.label, value: s.value })),
  };
}

export async function getSections(): Promise<SectionMeta[]> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_SECTIONS;
  const { data } = await sb.from('sections').select('*').order('sort_order');
  return data && data.length ? (data as SectionMeta[]) : DEFAULT_SECTIONS;
}

export async function getExperience(): Promise<Experience[]> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_EXPERIENCE;
  const { data } = await sb.from('experience').select('*').eq('is_visible', true).order('sort_order');
  return (data as Experience[] | null) ?? DEFAULT_EXPERIENCE;
}

export async function getEducation(): Promise<Education[]> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_EDUCATION;
  const { data } = await sb.from('education').select('*').eq('is_visible', true).order('sort_order');
  return (data as Education[] | null) ?? DEFAULT_EDUCATION;
}

const sk = (category_id: string, id: string, name: string, level: number, order: number, icon: string | null = null): Skill =>
  ({ id, category_id, name, icon, icon_url: null, description: null, level, sort_order: order });

const DEFAULT_SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'c-lang', name: 'Languages', icon: 'code', sort_order: 10, skills: [
    sk('c-lang', 'k1', 'Python', 88, 1),
    sk('c-lang', 'k2', 'JavaScript', 78, 2),
    sk('c-lang', 'k3', 'C', 72, 3),
  ]},
  { id: 'c-aiml', name: 'AI / ML', icon: 'brain', sort_order: 20, skills: [
    sk('c-aiml', 'k4', 'NumPy', 70, 1),
    sk('c-aiml', 'k5', 'Pandas', 70, 2),
    sk('c-aiml', 'k6', 'scikit-learn', 62, 3),
    sk('c-aiml', 'k7', 'ML fundamentals', 66, 4, 'brain'),
  ]},
  { id: 'c-tools', name: 'Tools & Frameworks', icon: 'wrench', sort_order: 30, skills: [
    sk('c-tools', 'k8', 'HTML/CSS', 85, 1),
    sk('c-tools', 'k9', 'Django', 72, 2),
    sk('c-tools', 'k10', 'Git', 82, 3),
    sk('c-tools', 'k11', 'Linux', 60, 4),
  ]},
  { id: 'c-soft', name: 'Soft Skills', icon: 'sparkles', sort_order: 40, skills: [
    sk('c-soft', 'k12', 'Communication', 85, 1, 'message-circle'),
    sk('c-soft', 'k13', 'Teamwork', 88, 2, 'users'),
    sk('c-soft', 'k14', 'Leadership', 80, 3, 'target'),
    sk('c-soft', 'k15', 'Event organizing', 85, 4, 'calendar'),
  ]},
];

export async function getSkillCategories(): Promise<SkillCategory[]> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_SKILL_CATEGORIES;
  const [{ data: cats }, { data: skills }] = await Promise.all([
    sb.from('skill_categories').select('*').eq('is_visible', true).order('sort_order'),
    sb.from('skills').select('*').eq('is_visible', true).order('sort_order'),
  ]);
  return (cats ?? []).map((c) => ({
    id: c.id, name: c.name, icon: c.icon, sort_order: c.sort_order,
    skills: (skills ?? []).filter((s: Skill) => s.category_id === c.id)
      .map((s) => ({ ...s, level: s.level ?? null })),
  }));
}

export async function getProjects(): Promise<Project[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const [{ data }, media] = await Promise.all([
    sb.from('projects').select('*').eq('is_visible', true).order('sort_order'),
    loadMediaMap(),
  ]);
  return (data ?? []).map((p) => ({
    ...p, image_url: p.image_media_id ? media[p.image_media_id] ?? null : null,
  })) as Project[];
}

export async function getCertificates(): Promise<Certificate[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const [{ data }, media] = await Promise.all([
    sb.from('certificates').select('*').eq('is_visible', true).order('sort_order'),
    loadMediaMap(),
  ]);
  return (data ?? []).map((c) => ({
    ...c,
    file_url: c.file_media_id ? media[c.file_media_id] ?? null : null,
    thumbnail_url: c.thumbnail_media_id ? media[c.thumbnail_media_id] ?? null : null,
  })) as Certificate[];
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const sb = getSupabase();
  if (!sb) return DEFAULT_SOCIALS;
  const { data } = await sb.from('social_links').select('*').eq('is_visible', true).order('sort_order');
  return (data as SocialLink[] | null) ?? DEFAULT_SOCIALS;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const [{ data }, media] = await Promise.all([
    sb.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false }),
    loadMediaMap(),
  ]);
  return (data ?? []).map((p) => ({
    ...p, cover_url: p.cover_media_id ? media[p.cover_media_id] ?? null : null,
    seo_image_url: p.seo_image_media_id ? media[p.seo_image_media_id] ?? null : null,
  })) as BlogPost[];
}

export async function getSnapshots(): Promise<Snapshot[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const [{ data }, media] = await Promise.all([
    sb.from('snapshots').select('*').eq('is_visible', true).order('sort_order'),
    loadMediaMap(),
  ]);
  return (data ?? []).map((s) => ({
    id: s.id, caption: s.caption, location: s.location, taken_on: s.taken_on,
    tags: s.tags ?? [], sort_order: s.sort_order,
    image_url: s.image_media_id ? media[s.image_media_id] ?? null : null,
  })) as Snapshot[];
}

/** Convenience bundle used by the homepage. */
export async function getHomeContent() {
  const [settings, hero, about, sections, experience, education, skills, projects, certificates, socials, posts] =
    await Promise.all([
      getSiteSettings(), getHero(), getAbout(), getSections(), getExperience(),
      getEducation(), getSkillCategories(), getProjects(), getCertificates(),
      getSocialLinks(), getPublishedPosts(),
    ]);
  return { settings, hero, about, sections, experience, education, skills, projects, certificates, socials, posts, isSupabaseConfigured };
}
