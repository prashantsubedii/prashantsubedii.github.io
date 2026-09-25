// Content types for the portfolio. The data itself lives in src/lib/content.ts.

export interface SiteSettings {
  site_name: string;
  logo_url: string | null;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  social_image_url: string | null;
  canonical_domain: string;
  twitter_handle: string | null;
  contact_email: string | null;
  contact_location: string | null;
  footer_tagline: string | null;
  footer_copyright: string | null;
}

export interface Hero {
  headline: string;
  descriptor: string;
  description: string;
  availability_text: string | null;
  show_availability: boolean;
  image_url: string | null;
  primary_cta_label: string | null;
  primary_cta_url: string | null;
  secondary_cta_label: string | null;
  secondary_cta_url: string | null;
}

export interface About {
  heading: string;
  bio: string;
  image_url: string | null;
  resume_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  highlights: { id: string; label: string; icon: string | null }[];
  stats: { id: string; label: string; value: string }[];
}

export interface SectionMeta {
  heading?: string | null; eyebrow?: string | null; description?: string | null; body?: string | null; show_external?: boolean;
  key: string;
  label: string;
  is_visible: boolean;
  in_nav: boolean;
  sort_order: number;
}

export interface Experience {
  id: string;
  organization: string;
  role: string;
  employment_type: string | null;
  work_mode: string | null;
  location: string | null;
  organization_url: string | null;
  logo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string[];
  technologies: string[];
  sort_order: number;
}

export interface Education {
  id: string;
  institution: string;
  program: string | null;
  degree: string | null;
  location: string | null;
  institution_url: string | null;
  logo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  highlights: string[];
  sort_order: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  skills: Skill[];
}

export interface Skill {
  id: string;
  category_id: string | null;
  name: string;
  icon: string | null;
  icon_url: string | null;
  description: string | null;
  level: number | null;   // 0-100 proficiency, shown as a progress bar
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  technologies: string[];
  category: string | null;
  project_date: string | null;
  is_featured: boolean;
  sort_order: number;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  tags: string[];
  sort_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  icon: string | null;
  sort_order: number;
}
