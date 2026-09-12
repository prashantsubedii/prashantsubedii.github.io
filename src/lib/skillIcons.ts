// Map a skill name to a colored tech logo (devicon, served from jsDelivr).
// Returns null when there's no known logo, so the UI can fall back to initials.
const DEVICON: Record<string, string> = {
  python: 'python/python-original',
  javascript: 'javascript/javascript-original',
  js: 'javascript/javascript-original',
  typescript: 'typescript/typescript-original',
  ts: 'typescript/typescript-original',
  'c++': 'cplusplus/cplusplus-original',
  cpp: 'cplusplus/cplusplus-original',
  'c#': 'csharp/csharp-original',
  java: 'java/java-original',
  go: 'go/go-original-wordmark',
  rust: 'rust/rust-original',
  php: 'php/php-original',
  ruby: 'ruby/ruby-original',
  html: 'html5/html5-original',
  'html/css': 'html5/html5-original',
  html5: 'html5/html5-original',
  css: 'css3/css3-original',
  css3: 'css3/css3-original',
  tailwind: 'tailwindcss/tailwindcss-original',
  tailwindcss: 'tailwindcss/tailwindcss-original',
  bootstrap: 'bootstrap/bootstrap-original',
  sass: 'sass/sass-original',
  react: 'react/react-original',
  vue: 'vuejs/vuejs-original',
  angular: 'angularjs/angularjs-original',
  svelte: 'svelte/svelte-original',
  astro: 'astro/astro-original',
  next: 'nextjs/nextjs-original',
  'next.js': 'nextjs/nextjs-original',
  node: 'nodejs/nodejs-original',
  'node.js': 'nodejs/nodejs-original',
  nodejs: 'nodejs/nodejs-original',
  express: 'express/express-original',
  django: 'django/django-plain',
  flask: 'flask/flask-original',
  fastapi: 'fastapi/fastapi-original',
  laravel: 'laravel/laravel-original',
  spring: 'spring/spring-original',
  postgresql: 'postgresql/postgresql-original',
  postgres: 'postgresql/postgresql-original',
  mysql: 'mysql/mysql-original',
  mongodb: 'mongodb/mongodb-original',
  redis: 'redis/redis-original',
  sqlite: 'sqlite/sqlite-original',
  supabase: 'supabase/supabase-original',
  firebase: 'firebase/firebase-plain',
  git: 'git/git-original',
  github: 'github/github-original',
  gitlab: 'gitlab/gitlab-original',
  docker: 'docker/docker-original',
  kubernetes: 'kubernetes/kubernetes-plain',
  linux: 'linux/linux-original',
  bash: 'bash/bash-original',
  vscode: 'vscode/vscode-original',
  figma: 'figma/figma-original',
  numpy: 'numpy/numpy-original',
  pandas: 'pandas/pandas-original',
  tensorflow: 'tensorflow/tensorflow-original',
  pytorch: 'pytorch/pytorch-original',
  'scikit-learn': 'scikitlearn/scikitlearn-original',
  sklearn: 'scikitlearn/scikitlearn-original',
  jupyter: 'jupyter/jupyter-original',
  opencv: 'opencv/opencv-original',
};

/** Some logos are dark and need a light tile behind them to stay visible. */
const DARK_LOGOS = new Set(['django', 'express', 'github', 'flask', 'bash', 'rust']);

const LOCAL_ICONS: Record<string, string> = {
  c: '/assets/tech/c-language.svg',
};

const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

export function skillIconUrl(name: string): string | null {
  const key = name.toLowerCase().trim();
  if (LOCAL_ICONS[key]) return LOCAL_ICONS[key];
  const path = DEVICON[key];
  return path ? `${BASE}/${path}.svg` : null;
}

export function skillIsDark(name: string): boolean {
  return DARK_LOGOS.has(name.toLowerCase().trim());
}

/** Two-letter fallback used when no logo exists. */
export function skillInitials(name: string): string {
  const clean = name.replace(/[^A-Za-z0-9+# ]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}
