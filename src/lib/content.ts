// All portfolio content lives here. Edit this file (and the files in public/)
// to update the site, then rebuild. Getters stay async so pages don't need to
// change if content ever moves to another source.
import type {
  About, Certificate, Education, Experience, Hero, Project,
  SectionMeta, SiteSettings, Skill, SkillCategory, SocialLink,
} from './types';

// ---------------------------------------------------------------------------
// Site settings / SEO
// ---------------------------------------------------------------------------
const SETTINGS: SiteSettings = {
  site_name: 'Prashant Subedi',
  logo_url: null,
  seo_title: 'Prashant Subedi | AI/ML Engineer & Researcher',
  seo_description:
    'Prashant Subedi is an aspiring AI/ML engineer, researcher and tech community builder from Chitwan, Nepal, exploring machine learning and bringing people together to learn and build.',
  seo_keywords: ['Prashant Subedi', 'Aspiring AI ML Engineer Nepal', 'AI Researcher Nepal', 'CSIT', 'CSITAN Chitwan', 'Tech mentor in Chitwan'],
  social_image_url: '/assets/images/profile.jpg',
  canonical_domain: 'https://www.prashantsubedi.info.np',
  twitter_handle: '@prashantsubedii',
  contact_email: 'contactprashantsubedi@gmail.com',
  contact_location: 'Chitwan, Nepal',
  footer_tagline: 'AI/ML Engineer and Researcher',
  footer_copyright: `© ${new Date().getFullYear()} Prashant Subedi`,
};

/** Formspree endpoint the contact form posts to. Empty string disables the form. */
export const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/mregongl';

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const HERO: Hero = {
  headline: 'Prashant Subedi',
  descriptor: 'Aspiring AI/ML Engineer, Researcher and Tech Community Builder',
  description:
    'I explore how machine learning can solve meaningful problems. Based in Nepal, I turn curiosity into practical AI projects and bring people together through workshops, hackathons and shared learning.',
  availability_text: null,
  show_availability: false,
  image_url: '/assets/images/profile.jpg',
  primary_cta_label: 'Download CV',
  primary_cta_url: '/assets/CV.pdf',
  secondary_cta_label: 'Get in touch',
  secondary_cta_url: '#contact',
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
const ABOUT: About = {
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

// ---------------------------------------------------------------------------
// Homepage sections: order, visibility and whether they appear in the nav.
// ---------------------------------------------------------------------------
const SECTIONS: SectionMeta[] = [
  { key: 'hero', label: 'Hero', is_visible: true, in_nav: false, sort_order: 0 },
  { key: 'about', label: 'About', is_visible: true, in_nav: true, sort_order: 10 },
  { key: 'experience', label: 'Experience', is_visible: true, in_nav: true, sort_order: 20 },
  { key: 'education', label: 'Education', is_visible: true, in_nav: true, sort_order: 30 },
  { key: 'skills', label: 'Skills', is_visible: true, in_nav: true, sort_order: 40 },
  { key: 'featured-projects', label: 'Projects', is_visible: true, in_nav: true, sort_order: 50 },
  // Shown automatically once CERTIFICATES below has entries.
  { key: 'certificates', label: 'Certificates', is_visible: true, in_nav: true, sort_order: 60 },
  { key: 'blog', label: 'Blog', is_visible: true, in_nav: true, sort_order: 70 },
  { key: 'contact', label: 'Contact', is_visible: true, in_nav: true, sort_order: 80 },
];

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------
const EXPERIENCE: Experience[] = [
  {
    id: 'csitan', organization: 'CSIT Association of Nepal, Chitwan',
    role: 'Vice President', employment_type: 'Volunteer', work_mode: 'Hybrid',
    location: 'Chitwan, Nepal', organization_url: 'https://chitwan.csitan.org.np',
    logo_url: null, start_date: '2024-12-01', end_date: null, is_current: true,
    description:
      'Help lead a student technology community: coordinating events, workshops, and hackathons and supporting technology programs for CSIT students. Previously served as an Executive Member. Helped organize CSITAN Hackfest 2024, a nationwide hackathon.',
    achievements: [], technologies: [], sort_order: 10,
  },
  {
    id: 'synergy', organization: 'Synergy Media, Chitwan',
    role: 'Creative Designer', employment_type: 'Full-time', work_mode: 'Hybrid',
    location: 'Chitwan, Nepal', organization_url: null, logo_url: null,
    start_date: null, end_date: null, is_current: true,
    description:
      'Create brand and digital visuals, including graphics, social media creative and website UI, while supporting general technical and IT work.',
    achievements: [], technologies: [], sort_order: 20,
  },
];

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------
const EDUCATION: Education[] = [
  {
    id: 'lumbini', institution: 'Lumbini ICT Campus (Tribhuvan University)',
    program: 'B.Sc. CSIT',
    degree: 'Bachelor of Science in Computer Science and Information Technology',
    location: 'Chitwan, Nepal', institution_url: null, logo_url: null,
    start_date: null, end_date: null, is_current: true,
    description: 'Undergraduate study in computer science and information technology.',
    highlights: [], sort_order: 10,
  },
  {
    id: 'gaindakot', institution: 'Gaindakot Namuna Secondary School',
    program: '+2 Computer Science (NEB)',
    degree: 'Higher Secondary Education in Computer Science',
    location: 'Chitwan, Nepal', institution_url: null, logo_url: null,
    start_date: null, end_date: null, is_current: false,
    description: 'Higher secondary studies in computer science, building a foundation in programming, computing and mathematics.',
    highlights: [], sort_order: 20,
  },
];

// ---------------------------------------------------------------------------
// Skills. `level` is 0-100 and drives the progress bar.
// ---------------------------------------------------------------------------
const sk = (category_id: string, id: string, name: string, level: number, order: number, icon: string | null = null): Skill =>
  ({ id, category_id, name, icon, icon_url: null, description: null, level, sort_order: order });

const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'c-lang', name: 'Languages', icon: 'code', sort_order: 10, skills: [
    sk('c-lang', 'k1', 'Python', 85, 1),
    sk('c-lang', 'k2', 'JavaScript', 70, 2),
    sk('c-lang', 'k3', 'C / C++', 72, 3),
  ]},
  { id: 'c-front', name: 'Frontend', icon: 'layout', sort_order: 20, skills: [
    sk('c-front', 'k4', 'HTML & CSS', 86, 1),
    sk('c-front', 'k5', 'React', 62, 2),
  ]},
  { id: 'c-back', name: 'Backend', icon: 'server', sort_order: 30, skills: [
    sk('c-back', 'k6', 'Django', 75, 1),
  ]},
  { id: 'c-db', name: 'Databases', icon: 'database', sort_order: 40, skills: [
    sk('c-db', 'k7', 'MySQL', 74, 1),
    sk('c-db', 'k8', 'SQL', 74, 2),
  ]},
  { id: 'c-aiml', name: 'AI/ML (learning)', icon: 'brain', sort_order: 50, skills: [
    sk('c-aiml', 'k9', 'Python for AI / ML', 85, 1),
    sk('c-aiml', 'k10', 'Machine Learning (scikit-learn)', 78, 2),
    sk('c-aiml', 'k11', 'Deep Learning (PyTorch / TensorFlow)', 72, 3),
    sk('c-aiml', 'k12', 'NLP & LLMs', 68, 4),
    sk('c-aiml', 'k13', 'Data Analysis (NumPy / Pandas)', 80, 5),
  ]},
  { id: 'c-tools', name: 'Tools', icon: 'wrench', sort_order: 60, skills: [
    sk('c-tools', 'k14', 'Git & GitHub', 85, 1),
    sk('c-tools', 'k15', 'Docker & Linux', 70, 2),
  ]},
  { id: 'c-soft', name: 'Soft Skills', icon: 'sparkles', sort_order: 70, skills: [
    sk('c-soft', 'k16', 'Research & Analysis', 80, 1, 'search'),
    sk('c-soft', 'k17', 'Problem Solving', 82, 2, 'target'),
    sk('c-soft', 'k18', 'Communication', 80, 3, 'message-circle'),
    sk('c-soft', 'k19', 'Team Collaboration', 82, 4, 'users'),
  ]},
];

// ---------------------------------------------------------------------------
// Projects. The homepage shows pinned GitHub repos (public/assets/pinned.json,
// synced by .github/workflows/update-pinned.yml). Add entries here with
// `is_featured: true` to show hand-picked projects instead.
// ---------------------------------------------------------------------------
const PROJECTS: Project[] = [];

// ---------------------------------------------------------------------------
// Certificates. Put images/PDFs in public/assets/certificates/ and reference
// them as '/assets/certificates/<file>'. The section appears once this has entries.
// ---------------------------------------------------------------------------
const CERTIFICATES: Certificate[] = [];

// ---------------------------------------------------------------------------
// Social links (hero shows GitHub, LinkedIn and ResearchGate; contact + footer show all).
// ---------------------------------------------------------------------------
const SOCIALS: SocialLink[] = [
  { id: 'github', platform: 'github', label: 'GitHub', url: 'https://github.com/prashantsubedii', icon: 'github', sort_order: 10 },
  { id: 'linkedin', platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/prashantsubedii', icon: 'linkedin', sort_order: 20 },
  { id: 'researchgate', platform: 'researchgate', label: 'ResearchGate', url: 'https://www.researchgate.net/profile/Prashant-Subedi-7', icon: 'researchgate', sort_order: 25 },
  { id: 'medium', platform: 'medium', label: 'Medium', url: 'https://medium.com/@prashantsubedii', icon: 'pen-tool', sort_order: 30 },
  { id: 'email', platform: 'email', label: 'Email', url: 'mailto:contactprashantsubedi@gmail.com', icon: 'mail', sort_order: 40 },
  { id: 'instagram', platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/prashanttsubedi/', icon: 'instagram', sort_order: 50 },
];

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------
const bySortOrder = <T extends { sort_order: number }>(items: T[]) => [...items].sort((a, b) => a.sort_order - b.sort_order);

export async function getSiteSettings(): Promise<SiteSettings> { return SETTINGS; }
export async function getHero(): Promise<Hero> { return HERO; }
export async function getAbout(): Promise<About> { return ABOUT; }
export async function getSections(): Promise<SectionMeta[]> {
  // Hide the certificates section (and its nav link) until there is something to show.
  return bySortOrder(SECTIONS.map((s) =>
    s.key === 'certificates' && !CERTIFICATES.length ? { ...s, is_visible: false, in_nav: false } : s));
}
export async function getExperience(): Promise<Experience[]> { return bySortOrder(EXPERIENCE); }
export async function getEducation(): Promise<Education[]> { return bySortOrder(EDUCATION); }
export async function getSkillCategories(): Promise<SkillCategory[]> { return bySortOrder(SKILL_CATEGORIES); }
export async function getProjects(): Promise<Project[]> { return bySortOrder(PROJECTS); }
export async function getCertificates(): Promise<Certificate[]> { return bySortOrder(CERTIFICATES); }
export async function getSocialLinks(): Promise<SocialLink[]> { return bySortOrder(SOCIALS); }

/** Convenience bundle used by the homepage. */
export async function getHomeContent() {
  const [settings, hero, about, sections, experience, education, skills, projects, certificates, socials] =
    await Promise.all([
      getSiteSettings(), getHero(), getAbout(), getSections(), getExperience(),
      getEducation(), getSkillCategories(), getProjects(), getCertificates(), getSocialLinks(),
    ]);
  return { settings, hero, about, sections, experience, education, skills, projects, certificates, socials };
}
