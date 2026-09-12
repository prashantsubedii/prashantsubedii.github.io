-- ============================================================================
--  Default content seed. Everything here is editable from /adminprashant.
--  Only facts stated in the project brief or the existing site are used; no
--  metrics, awards, or responsibilities are invented. Placeholders are marked.
--  Safe to run once on a fresh database.
-- ============================================================================

-- Singletons -----------------------------------------------------------------
insert into public.site_settings (id, site_name, seo_title, seo_description, seo_keywords,
  contact_email, contact_location, footer_tagline, footer_copyright)
values (1, 'Prashant Subedi',
  'Prashant Subedi | Aspiring AI/ML Engineer & Researcher',
  'Prashant Subedi is an aspiring AI/ML engineer, researcher and tech community builder from Nepal, exploring machine learning and bringing people together to learn and build.',
  array['Prashant Subedi','Aspiring AI ML Engineer Nepal','AI Researcher Nepal','CSIT','CSITAN Chitwan','Tech Community Builder'],
  'contactprashantsubedi@gmail.com', 'Chitwan, Nepal',
  'Aspiring AI/ML Engineer, Researcher and Tech Community Builder',
  '© ' || extract(year from now())::text || ' Prashant Subedi')
on conflict (id) do nothing;

insert into public.hero (id, headline, descriptor, description, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url)
values (1,
  'Prashant Subedi',
  'Aspiring AI/ML Engineer, Researcher and Tech Community Builder',
  'I explore how machine learning can solve meaningful problems. Based in Nepal, I turn curiosity into practical AI projects and bring people together through workshops, hackathons and shared learning.',
  'Download CV', '/assets/CV.pdf', 'Get in touch', '#contact')
on conflict (id) do nothing;

insert into public.about (id, heading, bio, cta_label, cta_url)
values (1, 'About',
  'I am an aspiring AI/ML engineer and researcher pursuing B.Sc. CSIT in Chitwan, Nepal. My work centers on learning machine learning fundamentals, experimenting with data and developing practical AI projects like ForestSathi. As Vice President of CSITAN Chitwan, I help bring people together through workshops, hackathons and shared learning.',
  'Download CV', '/assets/CV.pdf')
on conflict (id) do nothing;

-- Section registry (order + visibility) --------------------------------------
insert into public.sections (key, label, is_visible, in_nav, sort_order) values
  ('about',            'About',                   true, true, 10),
  ('experience',       'Experience',              true, true, 20),
  ('education',        'Education',                true, true, 30),
  ('skills',           'Skills',                   true, true, 40),
  ('featured-projects','Projects',                 true, true, 50),
  ('certificates',     'Certificates',             false, true, 60),
  ('blog',             'Blog',                     true, true, 70),
  ('contact',          'Contact',                  true, true, 80)
on conflict (key) do nothing;

-- Experience (from the brief; no invented achievements/metrics) ---------------
insert into public.experience
  (organization, role, employment_type, work_mode, location, organization_url,
   start_date, end_date, is_current, description, is_visible, sort_order)
values
  ('CSIT Association of Nepal, Chitwan', 'Vice President', 'Volunteer', 'Hybrid',
   'Chitwan, Nepal', 'https://chitwan.csitan.org.np',
   '2024-12-01', null, true,
   'Help lead a student technology community: coordinating events, workshops, and hackathons and supporting technology programs for CSIT students. Previously served as an Executive Member. Helped organize CSITAN Hackfest 2024, a nationwide hackathon. (Dates and details editable from admin.)',
   true, 10),
  ('Synergy Media, Chitwan', 'Creative Designer', 'Full-time', 'Hybrid',
   'Chitwan, Nepal', null,
   null, null, false,
   'Create brand and digital visuals, including graphics, social media creative and website UI, while supporting general technical and IT work.',
   true, 20)
on conflict do nothing;

-- Education (from the existing site''s structured data; editable) --------------
insert into public.education
  (institution, program, degree, is_current, description, is_visible, sort_order)
values
  ('Lumbini ICT Campus (Tribhuvan University)', 'B.Sc. CSIT',
   'Bachelor of Science in Computer Science and Information Technology', true,
   'Undergraduate study in computer science and information technology. (Editable from admin.)',
   true, 10)
on conflict do nothing;

-- Skill categories ------------------------------------------------------------
insert into public.skill_categories (name, icon, sort_order) values
  ('Languages',    'code',      10),
  ('Frontend',     'layout',    20),
  ('Backend',      'server',    30),
  ('Databases',    'database',  40),
  ('AI/ML (learning)', 'brain', 50),
  ('Tools',        'wrench',    60)
on conflict do nothing;

-- Social links (from existing site sameAs; edit/remove any that are inactive) -
insert into public.social_links (platform, label, url, icon, sort_order) values
  ('github',   'GitHub',   'https://github.com/prashantsubedii',        'github',   10),
  ('linkedin', 'LinkedIn', 'https://linkedin.com/in/prashantsubedii',   'linkedin', 20),
  ('medium',   'Medium',   'https://medium.com/@prashantsubedii',       'pen-tool', 30),
  ('email',    'Email',    'mailto:contactprashantsubedi@gmail.com',    'mail',     40)
on conflict do nothing;

-- Additional profile details
insert into public.education (institution, program, degree, is_current, description, is_visible, sort_order)
select 'Gaindakot Namuna Secondary School', '+2 Computer Science (NEB)', 'Higher Secondary Education in Computer Science', false, 'Higher secondary studies in computer science, building a foundation in programming, computing and mathematics.', true, 20
where not exists (select 1 from public.education where institution = 'Gaindakot Namuna Secondary School');
insert into public.social_links (platform, label, url, sort_order)
select 'instagram', 'Instagram', 'https://www.instagram.com/prashanttsubedi/', 50
where not exists (select 1 from public.social_links where platform = 'instagram');
