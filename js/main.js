// ===== Splash Screen =====
function initSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    
    if (!splashScreen) return;
    
    // Apply current theme to splash screen
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        splashScreen.classList.add('light-theme');
    }
    
    // Hide splash screen after 1.5 seconds
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    }, 1500);
}

// Initialize splash screen immediately
initSplashScreen();

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme') || 'dark';

// Set initial theme
if (currentTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
} else {
    body.setAttribute('data-theme', 'light');
    if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'light') {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
}

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', () => {
    // Update current year in footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
    
    // Initialize skills animation
    initSkillsAnimation();
    
    // Load GitHub pinned projects
    loadPinnedProjects();
    
    // Load Medium blogs
    loadMediumBlogs();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize contact form
    initContactForm();
    
    // Setup popup listeners
    setupPopupListeners();
    
    // Initialize title line animations
    initTitleLineAnimations();
    
    // Initialize README modal
    initReadmeModal();
    
    // Initialize blog modal
    initBlogModal();

});

function viewAllArticles() {
    const projectsContainer = document.getElementById('projectsContainer');
    if (!projectsContainer) return;
    
    // Store current projects content for back button
    if (!window.originalProjectsContent) {
        window.originalProjectsContent = projectsContainer.innerHTML;
    }
    
    // Show loading while fetching blogs if not loaded
    projectsContainer.innerHTML = `
        <div class="projects-loading">
            <div class="loading-spinner"></div>
            <p>Loading articles...</p>
        </div>
    `;
    
    // Load blogs if not already loaded
    if (!allBlogs || allBlogs.length === 0) {
        loadMediumBlogsForProjects();
    } else {
        displayAllArticlesInProjects();
    }
}

async function loadMediumBlogsForProjects() {
    try {
        // Use RSS to JSON proxy
        const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://medium.com/feed/@prashantsubedii');
        
        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Parse and map the response
        if (result.status === 'ok' && result.items) {
            const blogs = result.items.map(item => ({
                title: item.title || 'Untitled',
                description: cleanHTML(item.description || item.content || ''),
                excerpt: cleanHTML(item.description || item.content || '').substring(0, 150) + '...',
                thumbnail: item.thumbnail || extractImageFromContent(item.content) || 'https://via.placeholder.com/600x400?text=Blog+Post',
                link: item.link || '',
                pubDate: item.pubDate || '',
                content: item.content || item.description || '',
                categories: item.categories || []
            }));
            
            allBlogs = blogs;
            displayAllArticlesInProjects();
        } else {
            throw new Error(result.message || 'Invalid response from RSS proxy');
        }
        
    } catch (error) {
        console.error('Error loading Medium blogs:', error);
        const projectsContainer = document.getElementById('projectsContainer');
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">Unable to load articles. Please try again later.</p>
                    <button onclick="viewAllArticles()" class="btn btn-primary" style="margin-right: 1rem;">
                        <i class="fas fa-redo"></i>
                        <span>Retry</span>
                    </button>
                    <button onclick="backToProjects()" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        <span>Back to Projects</span>
                    </button>
                </div>
            `;
        }
    }
}

function displayAllArticlesInProjects() {
    const projectsContainer = document.getElementById('projectsContainer');
    if (!projectsContainer || !allBlogs) return;
    
    projectsContainer.innerHTML = '';
    
    // Add back button at the top
    const backButton = document.createElement('div');
    backButton.style.textAlign = 'left';
    backButton.style.marginBottom = '2rem';
    backButton.innerHTML = `
        <button onclick="backToProjects()" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-arrow-left"></i>
            <span>Back to Projects</span>
        </button>
    `;
    projectsContainer.appendChild(backButton);
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'All Articles';
    title.style.textAlign = 'center';
    title.style.marginBottom = '2rem';
    title.style.color = 'var(--text-primary)';
    projectsContainer.appendChild(title);
    
    // Display all blogs
    allBlogs.forEach(blog => {
        const blogCard = createBlogCard(blog);
        projectsContainer.appendChild(blogCard);
    });
}

function backToProjects() {
    const projectsContainer = document.getElementById('projectsContainer');
    if (projectsContainer && window.originalProjectsContent) {
        projectsContainer.innerHTML = window.originalProjectsContent;
    } else {
        // Fallback: reload projects
        loadGitHubProjects();
    }
}
function initTitleLineAnimations() {
    const titleLines = document.querySelectorAll('.title-line-decoration');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    titleLines.forEach(line => {
        observer.observe(line);
    });
}

// ===== Smooth Scrolling =====
function initSmoothScrolling() {
    // Logo click to scroll to top
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Nav links smooth scroll
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                const hamburger = document.querySelector('.hamburger');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // "Let's Get Connected" button
    const connectBtn = document.querySelector('a[href="#contact"]');
    if (connectBtn) {
        connectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const offsetTop = contactSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Footer links smooth scroll
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ===== Skills Animation =====
function initSkillsAnimation() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    if (skillItems.length === 0) return;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillItem = entry.target;
                const progressBar = skillItem.querySelector('.skill-progress');
                const percentageElement = skillItem.querySelector('.skill-percentage');
                const targetPercent = parseInt(percentageElement.getAttribute('data-percent'));
                
                animateSkillBar(progressBar, percentageElement, targetPercent);
                observer.unobserve(skillItem);
            }
        });
    }, observerOptions);
    
    skillItems.forEach(item => {
        observer.observe(item);
    });
    
    // Initialize tab switching
    initSkillsTabs();
}

function initSkillsTabs() {
    const tabButtons = document.querySelectorAll('.skills-tab-btn');
    const skillContainers = document.querySelectorAll('.skills-container');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and containers
            tabButtons.forEach(b => b.classList.remove('active'));
            skillContainers.forEach(container => container.classList.remove('active'));
            
            // Add active class to clicked button and corresponding container
            btn.classList.add('active');
            const activeTab = document.getElementById(`${tabName}-tab`);
            if (activeTab) {
                activeTab.classList.add('active');
                
                // Trigger animation for skill bars in this container
                const skillItems = activeTab.querySelectorAll('.skill-item');
                skillItems.forEach(item => {
                    const progressBar = item.querySelector('.skill-progress');
                    const percentageElement = item.querySelector('.skill-percentage');
                    
                    // Reset the animation
                    progressBar.style.width = '0%';
                    percentageElement.textContent = '0%';
                    
                    // Trigger animation
                    setTimeout(() => {
                        const targetPercent = parseInt(percentageElement.getAttribute('data-percent'));
                        animateSkillBar(progressBar, percentageElement, targetPercent);
                    }, 50);
                });
            }
        });
    });
}

function animateSkillBar(progressBar, percentageElement, targetPercent) {
    // Use CSS transition for smooth animation
    const duration = 800; // Match the CSS transition duration
    const steps = 60;
    let currentStep = 0;
    
    const timer = setInterval(() => {
        currentStep++;
        const progress = (currentStep / steps) * targetPercent;
        percentageElement.textContent = Math.round(progress) + '%';
        
        if (currentStep >= steps) {
            percentageElement.textContent = targetPercent + '%';
            progressBar.style.width = targetPercent + '%';
            clearInterval(timer);
        }
    }, duration / steps);
    
    // Trigger the width animation with CSS transition
    progressBar.style.width = targetPercent + '%';
}

// ===== GitHub Pinned Projects (via GraphQL API) =====
// Helper function for fetch with timeout
const fetchWithTimeout = (url, options = {}, timeout = 5000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout')), timeout)
        )
    ]);
};

async function loadPinnedProjects() {
    const container = document.getElementById('pinnedProjectsContainer');
    if (!container) return;
    
    // Show loading
    container.innerHTML = `
        <div class="projects-loading">
            <div class="loading-spinner"></div>
            <p>Loading pinned projects...</p>
        </div>
    `;
    
    const username = 'prashantsubedii';
    
    try {
        let pinnedRepos = null;
        
        // Try Netlify function first (uses GitHub GraphQL API with PAT) - with timeout
        // Only try if NOT on GitHub Pages (check if .netlify exists)
        const isGitHubPages = !window.location.hostname.includes('netlify');
        if (!isGitHubPages) {
            try {
                const response = await fetchWithTimeout('/.netlify/functions/github-pinned', {}, 3000);
                if (response.ok) {
                    const data = await response.json();
                    console.log('GitHub Response:', data);
                    if (data.success && data.pinnedRepos && data.pinnedRepos.length > 0) {
                        pinnedRepos = data.pinnedRepos;
                        console.log('Pinned Repos with Images:', pinnedRepos.map(r => ({ name: r.name, image: r.image })));
                    }
                }
            } catch (e) {
                console.log('Netlify function not available, trying fallback...', e.message);
            }
        } else {
            console.log('Detected GitHub Pages deployment, skipping Netlify function');
        }
        
        // Fallback 1: Try egoist API - with timeout
        if (!pinnedRepos) {
            try {
                const fallbackResponse = await fetchWithTimeout(`https://gh-pinned-repos.egoist.dev/?username=${username}`, {}, 5000);
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData && fallbackData.length > 0) {
                        pinnedRepos = fallbackData.map(repo => ({
                            name: repo.repo,
                            description: repo.description || 'No description available.',
                            url: repo.link,
                            defaultBranch: 'main',
                            openGraphImage: `https://opengraph.githubassets.com/1/${username}/${repo.repo}`,
                            stars: repo.stars || 0,
                            forks: repo.forks || 0,
                            language: repo.language || null,
                            languageColor: null,
                            topics: []
                        }));
                        console.log('Successfully loaded pinned repos from egoist API');
                    }
                }
            } catch (e) {
                console.log('Egoist API failed, trying next fallback...', e.message);
            }
        }
        
        // Fallback 2: Try Deno API - with timeout
        if (!pinnedRepos) {
            try {
                const denoResponse = await fetchWithTimeout(`https://gh-pinned-repos-tsj7ta5xfhep.deno.dev/?username=${username}`, {}, 5000);
                if (denoResponse.ok) {
                    const denoData = await denoResponse.json();
                    if (denoData && denoData.length > 0) {
                        pinnedRepos = denoData.map(repo => ({
                            name: repo.repo,
                            description: repo.description || 'No description available.',
                            url: repo.link,
                            defaultBranch: 'main',
                            openGraphImage: `https://opengraph.githubassets.com/1/${username}/${repo.repo}`,
                            stars: repo.stars || 0,
                            forks: repo.forks || 0,
                            language: repo.language || null,
                            languageColor: null,
                            topics: []
                        }));
                        console.log('Successfully loaded pinned repos from Deno API');
                    }
                }
            } catch (e) {
                console.log('Deno API failed, using hardcoded fallback...', e.message);
            }
        }
        
        // Fallback 3: Hardcoded pinned repos (your current 2 pinned repos)
        if (!pinnedRepos) {
            pinnedRepos = [
                {
                    name: 'SkillBazar',
                    description: 'SkillBazar is a fiverr like freelancing platform based in Nepal',
                    url: 'https://github.com/prashantsubedii/SkillBazar',
                    defaultBranch: 'main',
                    openGraphImage: 'https://opengraph.githubassets.com/1/prashantsubedii/SkillBazar',
                    stars: 1,
                    forks: 0,
                    language: 'Python',
                    languageColor: '#3572A5',
                    topics: []
                },
                {
                    name: 'Basic-Python',
                    description: 'This repository contains basic Python programs written during my Python learning journey. It includes simple practice codes created in VS Code, starting from zero level concepts such as variables, data types, conditions, loops, and basic functions.',
                    url: 'https://github.com/prashantsubedii/Basic-Python',
                    defaultBranch: 'main',
                    openGraphImage: 'https://opengraph.githubassets.com/1/prashantsubedii/Basic-Python',
                    stars: 0,
                    forks: 0,
                    language: 'Python',
                    languageColor: '#3572A5',
                    topics: []
                }
            ];
        }
        
        // Clear loading
        container.innerHTML = '';
        
        if (pinnedRepos && pinnedRepos.length > 0) {
            pinnedRepos.forEach(repo => {
                const card = createPinnedProjectCard(repo);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                    <p style="color: var(--text-secondary);">No pinned projects yet.</p>
                    <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fab fa-github"></i>
                        <span>Visit GitHub Profile</span>
                    </a>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading pinned projects:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                <p style="color: var(--text-secondary);">Unable to load pinned projects.</p>
                <button onclick="loadPinnedProjects()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i>
                    <span>Retry</span>
                </button>
            </div>
        `;
    }
}

function createPinnedProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card-new';
    
    const repoName = repo.name;
    const repoUrl = repo.url;
    
    // Language colors mapping for fallback
    const languageColors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'C++': '#f34b7d',
        'C': '#555555',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#ffac45',
        'Kotlin': '#A97BFF',
        'Dart': '#00B4AB'
    };
    
    const langColor = repo.languageColor || languageColors[repo.language] || '#6e7681';
    
    // Build tags HTML - show language and topics
    let tagsHTML = '';
    const allTags = [];
    if (repo.language) allTags.push(repo.language);
    if (repo.topics && repo.topics.length > 0) {
        allTags.push(...repo.topics.slice(0, 5));
    }
    if (allTags.length > 0) {
        tagsHTML = `
            <div class="project-tags">
                ${allTags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
        `;
    }
    
    // Build thumbnail URL from repo's thumbnail.png file
    const defaultBranch = repo.defaultBranch || 'main';
    const thumbnailUrl = `https://raw.githubusercontent.com/prashantsubedii/${repoName}/${defaultBranch}/thumbnail.png`;
    const fallbackUrl = repo.openGraphImage || `https://opengraph.githubassets.com/1/prashantsubedii/${repoName}`;
    
    console.log(`Project ${repoName} thumbnail URL:`, thumbnailUrl);
    console.log(`Project ${repoName} fallback URL:`, fallbackUrl);
    
    const imageHTML = `
        <img src="${thumbnailUrl}" alt="${repoName}" class="project-card-image" 
             onload="console.log('Thumbnail loaded for ${repoName}')" 
             onerror="console.log('Thumbnail failed for ${repoName}, using fallback'); this.onerror=null; this.src='${fallbackUrl}';">
        <div class="project-card-image-fallback" style="display: none;"><i class="fab fa-github"></i></div>
    `;
    
    card.innerHTML = `
        <div class="project-card-thumbnail">
            ${imageHTML}
        </div>
        <div class="project-card-body">
            <h3 class="project-card-title">${repoName}</h3>
            <p class="project-card-desc">${repo.description || 'No description available.'}</p>
            ${tagsHTML}
            <div class="project-card-actions">
                <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="project-action-btn primary">
                    <span>View Source Code</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
                <button class="project-action-btn secondary view-readme-btn" data-owner="prashantsubedii" data-repo="${repoName}" data-url="${repoUrl}">
                    <span>Read Article</span>
                    <i class="fas fa-book-open"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listener for README button
    const readmeBtn = card.querySelector('.view-readme-btn');
    if (readmeBtn) {
        readmeBtn.addEventListener('click', () => {
            showReadme(repoName, repoUrl);
        });
    }
    
    return card;
}

// ===== GitHub Projects =====
async function loadGitHubProjects() {
    const projectsContainer = document.getElementById('projectsContainer');
    if (!projectsContainer) return;
    
    // Show loading indicator
    let loadingIndicator = projectsContainer.querySelector('.projects-loading');
    if (!loadingIndicator) {
        projectsContainer.innerHTML = `
            <div class="projects-loading">
                <div class="loading-spinner"></div>
                <p>Loading projects...</p>
            </div>
        `;
        loadingIndicator = projectsContainer.querySelector('.projects-loading');
    } else {
        loadingIndicator.style.display = 'block';
    }
    
    // Remove static SkillBazar card (we'll show all repositories dynamically)
    const staticCard = projectsContainer.querySelector('.project-card');
    if (staticCard && staticCard.querySelector('.project-title')?.textContent === 'SkillBazar') {
        staticCard.remove();
    }
    
    try {
        // Detect if running on GitHub Pages
        const isGitHubPages = !window.location.hostname.includes('netlify');
        
        // Try Netlify endpoint first (only on Netlify), then fallback
        let result = null;
        
        if (!isGitHubPages) {
            try {
                const response = await fetchWithTimeout('/.netlify/functions/github-projects', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }, 5000);
                
                if (response.ok) {
                    result = await response.json();
                }
            } catch (e) {
                console.log('Netlify function not available, trying fallback...', e.message);
            }
        } else {
            console.log('Detected GitHub Pages deployment, skipping Netlify function');
        }
        
        // If still no result, show static fallback projects
        if (!result || !result.success) {
            result = {
                success: true,
                projects: [
                    {
                        name: 'SkillBazar',
                        body: 'SkillBazar is a Fiverr-like freelancing platform based in Nepal',
                        url: 'https://github.com/prashantsubedii/SkillBazar',
                        updatedAt: new Date().toISOString()
                    }
                ]
            };
            console.log('Using static fallback projects');
        }
        
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Handle response for GitHub Projects (boards)
        if (result.success && Array.isArray(result.projects)) {
            const projects = result.projects.slice(0, 3);
            if (projects.length > 0) {
                projectsContainer.innerHTML = '';
                projects.forEach(project => {
                    const projectCard = createGitHubProjectBoardCard(project);
                    projectsContainer.appendChild(projectCard);
                });
            } else {
                projectsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No public GitHub Projects found. Visit <a href="https://github.com/prashantsubedii" target="_blank">GitHub</a> to see my repositories.</p>';
            }
        } else {
            throw new Error(result.error || 'Invalid response from server');
        }
        // Create a card for GitHub Project (board)
        function createGitHubProjectBoardCard(project) {
            const card = document.createElement('div');
            card.className = 'project-card';

            card.innerHTML = `
                <div class="project-header">
                    <div class="project-icon">
                        <i class="fab fa-github"></i>
                    </div>
                </div>
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.body ? project.body.substring(0, 160) + (project.body.length > 160 ? '...' : '') : 'No description available.'}</p>
                <div class="project-buttons">
                    <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary project-btn">
                        <i class="fas fa-columns"></i>
                        <span>View Project Board</span>
                    </a>
                </div>
                <div class="project-meta" style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9em;">
                    Last updated: ${new Date(project.updatedAt).toLocaleDateString()}
                </div>
            `;
            return card;
        }
        
    } catch (error) {
        console.error('Error loading GitHub projects:', error);
        
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Show user-friendly error message
        const errorMessage = error.message || 'Unable to load projects';
        projectsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${errorMessage}</p>
                <button onclick="loadGitHubProjects()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i>
                    <span>Retry</span>
                </button>
            </div>
        `;
    }
}

function createProjectCardFromGraphQL(repo) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'project-card-wrapper';
    
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const topics = repo.repositoryTopics?.nodes?.map(node => node.topic.name) || [];
    let topicsHTML = '';
    
    if (topics.length > 0) {
        topicsHTML = topics.slice(0, 5).map(topic => 
            `<span class="project-topic">${topic}</span>`
        ).join('');
    } else if (repo.primaryLanguage) {
        topicsHTML = `<span class="project-topic">${repo.primaryLanguage.name}</span>`;
    }
    
    const repoName = repo.name;
    const repoUrl = repo.url;
    
    // Extract owner and repo from URL for README fetching
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repoSlug = urlParts[1];
    
    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon">
                <i class="fab fa-github"></i>
            </div>
        </div>
        <h3 class="project-title">${repoName}</h3>
        <p class="project-description">${repo.description || 'No description available.'}</p>
        ${topicsHTML ? `<div class="project-topics">${topicsHTML}</div>` : ''}
        <div class="project-buttons">
            <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary project-btn">
                <i class="fas fa-code"></i>
                <span>View Source Code</span>
            </a>
            <button class="btn btn-secondary project-btn view-readme-btn" data-owner="${owner}" data-repo="${repoSlug}" data-url="${repoUrl}">
                <i class="fas fa-book"></i>
                <span>View Article</span>
            </button>
        </div>
    `;
    
    // Create inline README container
    const readmeContainer = document.createElement('div');
    readmeContainer.className = 'project-readme-container';
    readmeContainer.style.display = 'none';
    
    // Add event listener for view article button
    const viewArticleBtn = card.querySelector('.view-readme-btn');
    if (viewArticleBtn) {
        viewArticleBtn.addEventListener('click', async () => {
            await toggleReadmeInline(readmeContainer, viewArticleBtn, owner, repoSlug, repoUrl);
        });
    }
    
    // Append card and README container to wrapper
    cardWrapper.appendChild(card);
    cardWrapper.appendChild(readmeContainer);
    
    return cardWrapper;
}

function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Topics might not be available in REST API, so we'll use language as a fallback
    const topics = repo.topics || [];
    let topicsHTML = '';
    
    if (topics.length > 0) {
        topicsHTML = topics.slice(0, 5).map(topic => 
            `<span class="project-topic">${topic}</span>`
        ).join('');
    } else if (repo.language) {
        // Use language as a topic if topics aren't available
        topicsHTML = `<span class="project-topic">${repo.language}</span>`;
    }
    
    const repoName = repo.name;
    const repoUrl = repo.html_url;
    
    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon">
                <i class="fab fa-github"></i>
            </div>
        </div>
        <h3 class="project-title">${repoName}</h3>
        <p class="project-description">${repo.description || 'No description available.'}</p>
        ${topicsHTML ? `<div class="project-topics">${topicsHTML}</div>` : ''}
        <div class="project-buttons">
            <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary project-btn">
                <i class="fas fa-code"></i>
                <span>View Source Code</span>
            </a>
            <button class="btn btn-secondary project-btn view-readme-btn" data-repo="${repoName}" data-url="${repoUrl}">
                <i class="fas fa-book"></i>
                <span>View Article</span>
            </button>
        </div>
    `;
    
    // Add event listener for view article button
    const viewArticleBtn = card.querySelector('.view-readme-btn');
    if (viewArticleBtn) {
        viewArticleBtn.addEventListener('click', () => {
            showReadme(repoName, repoUrl);
        });
    }
    
    return card;
}

// ===== Mobile Menu =====
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// ===== Contact Form =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        console.error('✗ Contact form not found');
        return;
    }
    
    console.log('✓ Contact form found - using Formspree');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const nameField = contactForm.querySelector('#name');
        const emailField = contactForm.querySelector('#email');
        const messageField = contactForm.querySelector('#message');
        
        // Get values
        const name = nameField ? nameField.value.trim() : '';
        const email = emailField ? emailField.value.trim() : '';
        const message = messageField ? messageField.value.trim() : '';
        
        // Validate
        if (!name || !email || !message) {
            showContactPopup('Validation Error', 'Please fill in all fields.', 'error');
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showContactPopup('Invalid Email', 'Please enter a valid email address.', 'error');
            return false;
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        }
        
        // Prepare form data
        const formData = new FormData(contactForm);
        
        // Submit to Formspree via fetch (no page redirect)
        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log('✓ Email sent successfully!');
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Show success popup
                    showContactPopup('Thank You!', 'Your message has been sent successfully!', 'success');
                    
                    // Reset button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
                    }
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('✗ Email send failed:', error);
                showContactPopup('Send Failed', 'Failed to send message. Please try again.', 'error');
                
                // Reset button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
                }
            });
        
        return false;
    });
}

// ===== Popup Setup =====
function setupPopupListeners() {
    // Initialize popup close button
    const popupCloseBtn = document.querySelector('.contact-popup-close');
    console.log('Popup close button found:', !!popupCloseBtn);
    
    if (popupCloseBtn) {
        popupCloseBtn.addEventListener('click', () => {
            console.log('Close button clicked');
            hideContactPopup();
        });
    }
    
    // Close popup when clicking outside
    const contactPopup = document.getElementById('contactPopup');
    console.log('Popup element found:', !!contactPopup);
    
    if (contactPopup) {
        contactPopup.addEventListener('click', (e) => {
            if (e.target === contactPopup) {
                console.log('Background clicked, closing popup');
                hideContactPopup();
            }
        });
    }
    
    // Close popup with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactPopup && contactPopup.classList.contains('active')) {
            console.log('Escape key pressed, closing popup');
            hideContactPopup();
        }
    });
}

// ===== Contact Popup Functions =====
function showContactPopup(title, message, type = 'success') {
    console.log('showContactPopup called:', { title, message, type });
    
    const popup = document.getElementById('contactPopup');
    console.log('Popup element found:', !!popup);
    
    if (!popup) {
        console.error('✗ Popup element not found!');
        return;
    }
    
    const popupTitle = popup.querySelector('.contact-popup-title');
    const popupMessage = popup.querySelector('.contact-popup-message');
    const popupIcon = popup.querySelector('.contact-popup-icon i');
    
    console.log('Popup parts found:', {
        title: !!popupTitle,
        message: !!popupMessage,
        icon: !!popupIcon
    });
    
    // Update popup content
    if (popupTitle) popupTitle.textContent = title;
    if (popupMessage) popupMessage.textContent = message;
    
    // Update icon based on type
    if (popupIcon) {
        if (type === 'error') {
            popupIcon.className = 'fas fa-exclamation-circle';
            popup.classList.add('error');
        } else {
            popupIcon.className = 'fas fa-check-circle';
            popup.classList.remove('error');
        }
    }
    
    // Show popup
    popup.classList.add('active');
    console.log('✓ Popup shown');
}

function hideContactPopup() {
    const popup = document.getElementById('contactPopup');
    if (popup) {
        popup.classList.remove('active');
        console.log('✓ Popup hidden');
    }
}

// ===== README Modal =====
function initReadmeModal() {
    const modal = document.getElementById('readmeModal');
    const closeBtn = document.getElementById('readmeModalClose');
    const backBtn = document.getElementById('readmeModalBack');
    
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('active');
        }
    };
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ===== Inline README Functions =====
async function toggleReadmeInline(readmeContainer, button, owner, repo, repoUrl) {
    const isVisible = readmeContainer.style.display !== 'none';
    
    if (isVisible) {
        // Hide README
        readmeContainer.style.display = 'none';
        button.innerHTML = '<i class="fas fa-book"></i><span>View Article</span>';
        button.classList.remove('active');
    } else {
        // Show README
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
        button.disabled = true;
        readmeContainer.style.display = 'block';
        
        // Check if README is already loaded
        if (!readmeContainer.dataset.loaded) {
            try {
                // Try Netlify endpoint first, fallback to Vercel
                let apiEndpoint = `/.netlify/functions/github-readme?owner=${owner}&repo=${repo}`;
                let response;
                let result;
                
                try {
                    response = await fetch(apiEndpoint);
                    
                    // If Netlify endpoint returns 404, try Vercel
                    if (response.status === 404) {
                        apiEndpoint = `/api/github-readme?owner=${owner}&repo=${repo}`;
                        response = await fetch(apiEndpoint);
                    }
                    
                    result = await response.json();
                } catch (fetchError) {
                    // If Netlify fails, try Vercel
                    apiEndpoint = `/api/github-readme?owner=${owner}&repo=${repo}`;
                    response = await fetch(apiEndpoint);
                    result = await response.json();
                }
                
                if (response.ok && result.success) {
                    let readmeContent = result.content;
                    
                    // Remove emojis
                    readmeContent = removeEmojis(readmeContent);
                    
                    // Remove project structure section
                    readmeContent = removeProjectStructure(readmeContent);
                    
                    // Clean up extra whitespace
                    readmeContent = readmeContent.replace(/\n{3,}/g, '\n\n');
                    
                    // Convert Markdown to HTML
                    let htmlContent = convertMarkdownToHTML(readmeContent);
                    
                    readmeContainer.innerHTML = `
                        <div class="readme-content">
                            ${htmlContent}
                        </div>
                    `;
                    readmeContainer.dataset.loaded = 'true';
                } else {
                    throw new Error(result.error || 'Failed to fetch README');
                }
            } catch (error) {
                console.error('Error loading README:', error);
                readmeContainer.innerHTML = `
                    <div class="readme-error">
                        <p>Unable to load README for this repository.</p>
                        <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View on GitHub</a>
                    </div>
                `;
            }
        }
        
        button.innerHTML = '<i class="fas fa-book"></i><span>Hide Article</span>';
        button.disabled = false;
        button.classList.add('active');
    }
}

// Keep the modal function for backward compatibility (if needed elsewhere)
async function showReadme(repoName, repoUrl) {
    const modal = document.getElementById('readmeModal');
    const modalTitle = document.getElementById('readmeModalTitle');
    const modalBody = document.getElementById('readmeModalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    // Extract owner and repo from URL
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];
    
    modalTitle.textContent = repoName;
    modalBody.innerHTML = `
        <div class="readme-loading">
            <div class="loading-spinner"></div>
            <p>Loading README...</p>
        </div>
    `;
    modal.classList.add('active');
    
    try {
        // Fetch README directly from GitHub raw content
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
        const response = await fetch(rawUrl);
        
        if (!response.ok) {
            // Try master branch if main doesn't exist
            const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
            const masterResponse = await fetch(masterUrl);
            
            if (!masterResponse.ok) {
                throw new Error('README not found');
            }
            
            const readmeContent = await masterResponse.text();
            displayReadmeContent(readmeContent, modalBody, repoUrl);
        } else {
            const readmeContent = await response.text();
            displayReadmeContent(readmeContent, modalBody, repoUrl);
        }
    } catch (error) {
        console.error('Error loading README:', error);
        modalBody.innerHTML = `
            <div class="readme-loading">
                <p style="color: var(--text-secondary);">Unable to load README for this repository.</p>
                <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color); margin-top: 1rem; display: inline-block;">View on GitHub</a>
            </div>
        `;
    }
}

function displayReadmeContent(readmeContent, modalBody, repoUrl) {
    // Remove emojis
    readmeContent = removeEmojis(readmeContent);
    
    // Remove project structure section
    readmeContent = removeProjectStructure(readmeContent);
    
    // Clean up extra whitespace
    readmeContent = readmeContent.replace(/\n{3,}/g, '\n\n');
    
    // Convert Markdown to HTML
    let htmlContent = convertMarkdownToHTML(readmeContent);
    
    modalBody.innerHTML = `
        <div class="readme-content">
            ${htmlContent}
        </div>
    `;
}

function removeEmojis(text) {
    // Remove emojis using regex pattern
    // This covers most emoji ranges including:
    // - Emoticons
    // - Miscellaneous symbols and pictographs
    // - Transport and map symbols
    // - Flags
    // - And other emoji ranges
    return text.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
               .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
               .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
               .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags (iOS)
               .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
               .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
               .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
               .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
               .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
               .replace(/[\u{1FA70}-\u{1FAFF}]/gu, ''); // Symbols and Pictographs Extended-A
}

function removeProjectStructure(text) {
    // Split into lines for easier processing
    const lines = text.split('\n');
    const filteredLines = [];
    let skipSection = false;
    let inCodeBlock = false;
    let codeBlockStart = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase().trim();
        
        // Track code blocks
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            codeBlockStart = inCodeBlock;
        }
        
        // Check if this line starts a "Project Structure" section
        // Look for headers like "## Project Structure", "### Project Structure", etc.
        if (!skipSection && 
            (lowerLine.includes('project structure') || 
             lowerLine.includes('structure') && lowerLine.includes('project')) && 
            (line.startsWith('#') || line.startsWith('##') || line.startsWith('###') || line.startsWith('####'))) {
            skipSection = true;
            continue; // Skip this header line
        }
        
        // If we're in a skip section
        if (skipSection) {
            // Check if this is a new major section (starts with #, ##, or ###)
            // Stop skipping when we hit a new section that's not project structure
            if ((line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) && 
                !lowerLine.includes('structure') && 
                !lowerLine.includes('project structure')) {
                skipSection = false;
                // Don't skip this new section header
                filteredLines.push(line);
            }
            // Continue skipping everything else in the project structure section
            continue;
        }
        
        // Keep all lines that are not in the project structure section
        filteredLines.push(line);
    }
    
    return filteredLines.join('\n');
}

function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    
    // Paragraphs (handle remaining text)
    html = html.split('\n\n').map(para => {
        if (para.trim() && !para.match(/^<[h|u|o|p|b|d]/)) {
            return `<p>${para}</p>`;
        }
        return para;
    }).join('\n');
    
    return html;
}

// ===== Initialize README buttons dynamically =====

// ===== Medium Blog Functions =====
let allBlogs = [];
let showingAllBlogs = false;

async function loadMediumBlogs() {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer) return;
    
    const isBlogsPage = window.location.pathname.includes('blogs.html');
    showingAllBlogs = isBlogsPage; // Show all blogs on blogs page
    
    // Check cache first
    const cacheKey = 'medium_blogs_cache';
    const cacheTime = 'medium_blogs_cache_time';
    const cacheAge = 30 * 60 * 1000; // 30 minutes
    
    try {
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTime);
        
        if (cachedData && cachedTime) {
            const age = Date.now() - parseInt(cachedTime);
            if (age < cacheAge) {
                const blogs = JSON.parse(cachedData);
                allBlogs = blogs;
                window.allBlogs = blogs; // Make accessible globally
                if (isBlogsPage) {
                    displayBlogs(blogs); // Show all blogs on blogs page
                } else {
                    displayBlogs(blogs.slice(0, 3)); // Show first 3 on home page
                }
                return;
            }
        }
    } catch (e) {
        console.log('Cache read error:', e);
    }
    
    // Show loading indicator
    let loadingIndicator = blogContainer.querySelector('.blogs-loading');
    if (!loadingIndicator) {
        blogContainer.innerHTML = `
            <div class="blogs-loading">
                <div class="loading-spinner"></div>
                <p>Loading blogs...</p>
            </div>
        `;
        loadingIndicator = blogContainer.querySelector('.blogs-loading');
    } else {
        loadingIndicator.style.display = 'block';
    }
    
    try {
        // Use RSS to JSON proxy
        const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://medium.com/feed/@prashantsubedii');
        
        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Debug: Log what we received
        console.log('Medium RSS Response:', result);
        console.log('Total articles fetched:', result.items?.length || 0);
        
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Parse and map the response
        if (result.status === 'ok' && result.items) {
            const blogs = result.items.map(item => ({
                title: item.title || 'Untitled',
                description: cleanHTML(item.description || item.content || ''),
                excerpt: cleanHTML(item.description || item.content || '').substring(0, 120) + '...',
                thumbnail: item.thumbnail || extractImageFromContent(item.content) || 'https://via.placeholder.com/600x400?text=Blog+Post',
                link: item.link || '',
                pubDate: item.pubDate || '',
                content: item.content || item.description || '',
                categories: item.categories || []
            }));
            
            console.log('Parsed blogs:', blogs.map(b => b.title));
            
            allBlogs = blogs;
            window.allBlogs = blogs; // Make accessible globally for filtering
            
            // Cache the blogs
            try {
                localStorage.setItem(cacheKey, JSON.stringify(blogs));
                localStorage.setItem(cacheTime, Date.now().toString());
            } catch (e) {
                console.log('Cache write error:', e);
            }
            
            // Display blogs based on page
            if (isBlogsPage) {
                displayBlogs(blogs); // Show all blogs on blogs page
            } else {
                displayBlogs(blogs.slice(0, 3)); // Show first 3 on home page
            }
            
        } else {
            throw new Error(result.message || 'Invalid response from RSS proxy');
        }
        
    } catch (error) {
        console.error('Error loading Medium blogs:', error);
        
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Show error message
        const errorMessage = error.name === 'AbortError' 
            ? 'Request timeout. Please try again later.'
            : 'Unable to load blogs. Please try again later.';
            
        blogContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${errorMessage}</p>
                <button onclick="loadMediumBlogs()" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i>
                    <span>Retry</span>
                </button>
            </div>
        `;
    }
}

function cleanHTML(html) {
    if (!html) return '';
    // Remove HTML tags
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function extractImageFromContent(content) {
    if (!content) return null;
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
    return imgMatch ? imgMatch[1] : null;
}

function displayBlogs(blogs) {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer) return;
    
    const isBlogsPage = window.location.pathname.includes('blogs.html');
    
    blogContainer.innerHTML = '';
    
    blogs.forEach((blog, index) => {
        const blogCard = createBlogCard(blog);
        blogContainer.appendChild(blogCard);
    });
    
    // Add View All link after cards on home page only
    if (!isBlogsPage && !showingAllBlogs) {
        const viewAllDiv = document.createElement('div');
        viewAllDiv.className = 'blog-view-all';
        viewAllDiv.innerHTML = `
            <a href="blogs.html" class="view-all-link">
                View All Blogs <i class="fas fa-arrow-right"></i>
            </a>
        `;
        blogContainer.appendChild(viewAllDiv);
    }
}

function viewAllBlogs() {
    showingAllBlogs = true;
    displayBlogs(allBlogs);
    
    // Scroll to blog section
    const blogSection = document.getElementById('blog');
    if (blogSection) {
        const offsetTop = blogSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function createBlogCard(blog) {
    const card = document.createElement('div');
    card.className = 'blog-card-new';
    
    // Get categories from article (these are the actual Medium tags)
    let categoryTags = [];
    if (blog.categories && blog.categories.length > 0) {
        // Take up to 2 categories from the article
        categoryTags = blog.categories.slice(0, 2);
    } else {
        categoryTags = ['Technology'];
    }
    
    // Format date nicely
    const formattedDate = blog.pubDate ? formatDate(blog.pubDate) : '';
    
    // Create category badges HTML
    const categoryHTML = categoryTags.map(cat => 
        `<span class="blog-card-category">${cat}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="blog-card-thumbnail">
            <img src="${blog.thumbnail}" alt="${blog.title}" class="blog-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="blog-card-img-fallback" style="display: none;"><i class="fas fa-newspaper"></i></div>
            <div class="blog-card-categories">${categoryHTML}</div>
        </div>
        <div class="blog-card-body">
            ${formattedDate ? `<span class="blog-card-date"><i class="far fa-calendar"></i> ${formattedDate}</span>` : ''}
            <h3 class="blog-card-heading">${blog.title}</h3>
            <p class="blog-card-desc">${blog.excerpt}</p>
            <button class="blog-read-more" data-link="${blog.link}">
                Read Article <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Add click event
    const readMoreBtn = card.querySelector('.blog-read-more');
    const handleClick = () => {
        showBlogContent(blog.link, blog.title, blog.content || blog.description, blog.thumbnail, blog.pubDate, blog.categories);
    };
    
    readMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleClick();
    });
    
    card.addEventListener('click', handleClick);
    
    return card;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Blog Modal Functions =====
function initBlogModal() {
    const modal = document.getElementById('blogModal');
    const closeBtn = document.getElementById('blogModalClose');
    const backBtn = document.getElementById('blogModalBack');
    
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('active');
        }
    };
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

async function showBlogContent(blogLink, blogTitle, blogContent, blogThumbnail, blogDate, blogCategories) {
    const modal = document.getElementById('blogModal');
    const modalTitle = document.getElementById('blogModalTitle');
    const modalBody = document.getElementById('blogModalBody');
    const closeBtn = document.getElementById('blogModalClose');
    const backBtn = document.getElementById('blogModalBack');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    // Set title in header (will be hidden on mobile via CSS)
    modalTitle.textContent = blogTitle;
    
    // Format date
    const formattedDate = blogDate ? formatDate(blogDate) : '';
    
    // Build tags HTML
    let tagsHTML = '';
    if (blogCategories && blogCategories.length > 0) {
        tagsHTML = `
            <div class="blog-detail-tags">
                <span class="tags-label">Tags:</span>
                ${blogCategories.map(cat => `<span class="blog-detail-tag">${cat}</span>`).join('')}
            </div>
        `;
    }
    
    // Show loading
    modalBody.innerHTML = `
        <div class="blog-loading">
            <div class="loading-spinner"></div>
            <p>Loading blog...</p>
        </div>
    `;
    modal.classList.add('active');
    
    // Re-attach event listeners for modal close buttons
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    if (closeBtn && !closeBtn.dataset.listenerAttached) {
        closeBtn.addEventListener('click', closeModal);
        closeBtn.dataset.listenerAttached = 'true';
    }
    
    if (backBtn && !backBtn.dataset.listenerAttached) {
        backBtn.addEventListener('click', closeModal);
        backBtn.dataset.listenerAttached = 'true';
    }
    
    try {
        // Clean and format the content
        let content = blogContent || '';
        
        // Remove script tags and other unwanted elements
        content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        
        // Make sure images have proper styling
        content = content.replace(/<img/gi, '<img style="max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0;"');
        
        // Make links open in new tab
        content = content.replace(/<a href=/gi, '<a target="_blank" rel="noopener noreferrer" href=');
        
        // Build recommendations HTML from other blogs
        let recommendationsHTML = '';
        if (window.allBlogs && window.allBlogs.length > 1) {
            const otherBlogs = window.allBlogs.filter(b => b.title !== blogTitle).slice(0, 3);
            if (otherBlogs.length > 0) {
                recommendationsHTML = `
                    <div class="blog-recommendations">
                        <h3 class="recommendations-title">Recommended for you</h3>
                        <div class="recommendations-grid">
                            ${otherBlogs.map((blog, index) => `
                                <div class="recommendation-card" data-blog-index="${window.allBlogs.findIndex(b => b.title === blog.title)}">
                                    <div class="recommendation-thumbnail">
                                        <img src="${blog.thumbnail}" alt="${blog.title}" onerror="this.style.display='none';">
                                        ${blog.categories && blog.categories[0] ? `<span class="recommendation-category">${blog.categories[0]}</span>` : ''}
                                    </div>
                                    <div class="recommendation-body">
                                        <span class="recommendation-date"><i class="far fa-calendar"></i> ${blog.pubDate ? formatDate(blog.pubDate) : ''}</span>
                                        <h4 class="recommendation-title">${blog.title}</h4>
                                        <p class="recommendation-desc">${cleanHTML(blog.description || '').substring(0, 80)}...</p>
                                        <span class="recommendation-link">Read Article <i class="fas fa-arrow-right"></i></span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        const blogHTML = `
            <div class="blog-detail-hero">
                ${blogThumbnail ? `<img src="${blogThumbnail}" alt="${blogTitle}" class="blog-detail-image">` : ''}
            </div>
            <div class="blog-detail-header">
                <h1 class="blog-detail-title">${blogTitle}</h1>
                <div class="blog-detail-meta">
                    <div class="blog-detail-author">
                        <img src="assets/images/profile.jpg" alt="Prashant Subedi" class="author-avatar">
                        <div class="author-info">
                            <span class="author-name">Prashant Subedi</span>
                            <span class="author-handle">@prashantsubedii</span>
                        </div>
                    </div>
                    <div class="blog-detail-stats">
                        ${formattedDate ? `<span class="stat-item"><i class="far fa-calendar"></i> ${formattedDate}</span>` : ''}
                        <span class="stat-item"><i class="far fa-clock"></i> 5 min read</span>
                    </div>
                </div>
            </div>
            <div class="blog-detail-content">
                ${content || '<p style="color: var(--text-secondary);">Content not available. Please visit the original post.</p>'}
            </div>
            ${tagsHTML}
            <div class="blog-detail-footer">
                <a href="${blogLink}" target="_blank" rel="noopener noreferrer" class="btn-read-on-medium">
                    <i class="fab fa-medium"></i> Read on Medium
                </a>
            </div>
            ${recommendationsHTML}
        `;
        
        modalBody.innerHTML = blogHTML;
        
        // Add click listeners for recommendation cards
        const recommendationCards = modalBody.querySelectorAll('.recommendation-card');
        recommendationCards.forEach(card => {
            card.addEventListener('click', () => {
                const blogIndex = parseInt(card.dataset.blogIndex);
                if (window.allBlogs && window.allBlogs[blogIndex]) {
                    const blog = window.allBlogs[blogIndex];
                    // Scroll modal to top before loading new content
                    const modal = document.getElementById('blogModal');
                    if (modal) modal.scrollTop = 0;
                    // Load the clicked blog
                    showBlogContent(
                        blog.link,
                        blog.title,
                        blog.content || blog.description,
                        blog.thumbnail,
                        blog.pubDate,
                        blog.categories || []
                    );
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading blog content:', error);
        modalBody.innerHTML = `
            <div class="blog-loading">
                <p style="color: var(--text-secondary);">Unable to load blog content.</p>
                <a href="${blogLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fab fa-medium"></i>
                    <span>View on Medium</span>
                </a>
            </div>
        `;
    }
}

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 30px rgba(30, 58, 138, 0.2)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(30, 58, 138, 0.1)';
        }
    }
});
