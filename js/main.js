// Handle SkillBazar README modal for static card
document.addEventListener('DOMContentLoaded', () => {
    const readmeBtn = document.getElementById('viewSkillBazarReadme');
    const modal = document.getElementById('readmeModal');
    const modalTitle = document.getElementById('readmeModalTitle');
    const modalBody = document.getElementById('readmeModalBody');
    const modalBack = document.getElementById('readmeModalBack');
    const modalClose = document.getElementById('readmeModalClose');
    if (readmeBtn) {
        readmeBtn.addEventListener('click', async () => {
            if (modal && modalTitle && modalBody) {
                modalTitle.textContent = 'SkillBazar README';
                modalBody.innerHTML = '<div class="readme-loading"><div class="loading-spinner"></div><p>Loading README...</p></div>';
                modal.classList.add('active');
                try {
                    const resp = await fetch('https://raw.githubusercontent.com/prashantsubedii/SkillBazar/main/README.md');
                    if (!resp.ok) throw new Error('Failed to fetch README');
                    const md = await resp.text();
                    modalBody.innerHTML = `<div style="background:var(--bg-secondary);padding:1.5rem;border-radius:10px;max-height:60vh;overflow:auto;"><pre style="white-space:pre-wrap;word-break:break-word;">${md.replace(/</g,'&lt;')}</pre></div>`;
                } catch (err) {
                    modalBody.innerHTML = '<p style="color:red;">Unable to load README.</p>';
                }
            }
        });
    }
    // Back and close button functionality
    if (modalBack) {
        modalBack.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }
});
// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme') || 'light';

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
    
    // Load GitHub projects
    loadGitHubProjects();
    
    // Load Medium blogs
    loadMediumBlogs();
    
    // Initialize SkillBazar project button
    initSkillBazarButton();
    
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
        const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@prashantsubedii';
        
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
}

function animateSkillBar(progressBar, percentageElement, targetPercent) {
    let currentPercent = 0;
    const duration = 1000; // 1 second (faster animation)
    const increment = targetPercent / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
        currentPercent += increment;
        if (currentPercent >= targetPercent) {
            currentPercent = targetPercent;
            clearInterval(timer);
        }
        progressBar.style.width = currentPercent + '%';
        percentageElement.textContent = Math.round(currentPercent) + '%';
    }, 16);
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
        // Try Netlify endpoint first, fallback to Vercel
        let apiEndpoint = '/.netlify/functions/github-projects';
        let response;
        let result;
        
        // Helper function for fetch with timeout
        const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                // Manually display SkillBazar project card
                if (loadingIndicator) loadingIndicator.remove();
                projectsContainer.innerHTML = '';
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <div class="project-header">
                        <div class="project-icon">
                            <i class="fab fa-github"></i>
                        </div>
                    </div>
                    <h3 class="project-title">SkillBazar</h3>
                    <p class="project-description">A platform for skill sharing and discovery. (Demo project)</p>
                    <div class="project-buttons">
                        <a href="https://github.com/prashantsubedii/SkillBazar" target="_blank" rel="noopener noreferrer" class="btn btn-primary project-btn">
                            <i class="fas fa-code"></i>
                            <span>View Source Code</span>
                        </a>
                        <button class="btn btn-secondary project-btn view-readme-btn" id="skillbazar-readme-btn">
                            <i class="fas fa-book"></i>
                            <span>View Article</span>
                        </button>
                    </div>
                    <div class="project-readme-container" id="skillbazar-readme-container" style="display:none;"></div>
                `;
                projectsContainer.appendChild(card);
                // Add event for View Article
                const readmeBtn = document.getElementById('skillbazar-readme-btn');
                const readmeContainer = document.getElementById('skillbazar-readme-container');
                if (readmeBtn && readmeContainer) {
                    readmeBtn.addEventListener('click', async () => {
                        if (readmeContainer.style.display === 'block') {
                            readmeContainer.style.display = 'none';
                            readmeBtn.querySelector('span').textContent = 'View Article';
                            return;
                        }
                        readmeBtn.querySelector('span').textContent = 'Loading...';
                        // Fetch README from GitHub
                        try {
                            const resp = await fetch('https://raw.githubusercontent.com/prashantsubedii/SkillBazar/main/README.md');
                            if (!resp.ok) throw new Error('Failed to fetch README');
                            const md = await resp.text();
                            // Convert markdown to HTML (basic)
                            readmeContainer.innerHTML = `<div style="background:var(--bg-secondary);padding:1.5rem;border-radius:10px;"><pre style="white-space:pre-wrap;word-break:break-word;">${md.replace(/</g,'&lt;')}</pre></div>`;
                            readmeContainer.style.display = 'block';
                            readmeBtn.querySelector('span').textContent = 'Hide Article';
                        } catch (err) {
                            readmeContainer.innerHTML = '<p style="color:red;">Unable to load README.</p>';
                            readmeContainer.style.display = 'block';
                            readmeBtn.querySelector('span').textContent = 'Hide Article';
                        }
                    });
                }
                apiEndpoint = '/api/github-projects';
                response = await fetchWithTimeout(apiEndpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }, 10000);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                result = await response.json();
            } catch (secondError) {
                // Both endpoints failed
                throw new Error('Unable to connect to server. Please check your deployment or try again later.');
            }
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
                projectsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No public GitHub Projects (boards) found. Create some at github.com to see them here.</p>';
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
            
            modalBody.innerHTML = `
                <div class="readme-content">
                    ${htmlContent}
                </div>
            `;
        } else {
            throw new Error(result.error || 'Failed to fetch README');
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

// ===== Initialize SkillBazar Button =====
function initSkillBazarButton() {
    // Initialize all view-readme-btn buttons including SkillBazar
    const readmeButtons = document.querySelectorAll('.view-readme-btn');
    readmeButtons.forEach(btn => {
        // Remove any existing listeners to avoid duplicates
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            const repoName = newBtn.getAttribute('data-repo');
            const repoUrl = newBtn.getAttribute('data-url');
            if (repoName && repoUrl) {
                showReadme(repoName, repoUrl);
            }
        });
    });
}

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
                if (isBlogsPage) {
                    displayBlogs(blogs); // Show all blogs on blogs page
                } else {
                    displayBlogs(blogs.slice(0, 2)); // Show first 2 on home page
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
        const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@prashantsubedii';
        
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
        
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Parse and map the response
        if (result.status === 'ok' && result.items) {
            const blogs = result.items.map(item => ({
                title: item.title || 'Untitled',
                description: cleanHTML(item.description || item.content || ''),
                excerpt: cleanHTML(item.description || item.content || '').substring(0, 150) + '...',
                thumbnail: item.thumbnail || extractImageFromContent(item.content) || 'https://via.placeholder.com/600x400?text=Blog+Post',
                link: item.link || '',
                pubDate: item.pubDate || '',
                content: item.content || item.description || ''
            }));
            
            allBlogs = blogs;
            
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
                displayBlogs(blogs.slice(0, 2)); // Show first 2 on home page
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
        
        // Add "View All Blogs" button after the 2nd card on home page only
        if (index === 1 && !isBlogsPage && !showingAllBlogs) {
            const viewAllBtn = document.createElement('div');
            viewAllBtn.className = 'blog-view-all';
            viewAllBtn.style.textAlign = 'right';
            viewAllBtn.style.marginTop = '0.5rem';
            viewAllBtn.innerHTML = `
                <a href="blogs.html" class="btn btn-primary" style="font-size: 0.75rem; padding: 0.3rem 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;">
                    <span>View All Blogs</span>
                    <i class="fas fa-arrow-right" style="font-size: 0.7rem;"></i>
                </a>
            `;
            blogContainer.appendChild(viewAllBtn);
        }
    });
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
    card.className = 'blog-card';
    
    // Pick a random tag if available
    let tagHTML = '';
    if (blog.categories && blog.categories.length > 0) {
        const randomTag = blog.categories[Math.floor(Math.random() * blog.categories.length)];
        tagHTML = `<span class="blog-tag">${randomTag}</span>`;
    }
    card.innerHTML = `
        <img src="${blog.thumbnail}" alt="${blog.title}" class="blog-card-image" onerror="this.src='https://via.placeholder.com/600x400?text=Blog+Post'">
        <div class="blog-card-content">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                <h3 class="blog-card-title" style="margin-bottom: 0;">${blog.title}</h3>
                ${tagHTML}
            </div>
            <p class="blog-card-excerpt">${blog.excerpt}</p>
            ${blog.pubDate ? `<p style=\"font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;\">${formatDate(blog.pubDate)}</p>` : ''}
            <button class="blog-card-button" data-link="${blog.link}" data-title="${blog.title}" data-content="${escapeHTML(blog.content)}">
                View More
            </button>
        </div>
    `;
    
    // Add click event
    const viewMoreBtn = card.querySelector('.blog-card-button');
    const handleClick = () => {
        showBlogContent(blog.link, blog.title, blog.content || blog.description);
    };
    
    viewMoreBtn.addEventListener('click', (e) => {
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

async function showBlogContent(blogLink, blogTitle, blogContent) {
    const modal = document.getElementById('blogModal');
    const modalTitle = document.getElementById('blogModalTitle');
    const modalBody = document.getElementById('blogModalBody');
    const closeBtn = document.getElementById('blogModalClose');
    const backBtn = document.getElementById('blogModalBack');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = blogTitle;
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
        content = content.replace(/<img/gi, '<img style="max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0;"');
        
        // Make links open in new tab
        content = content.replace(/<a href=/gi, '<a target="_blank" rel="noopener noreferrer" href=');
        
        const blogHTML = `
            <div class="blog-content">
                ${content || '<p style="color: var(--text-secondary);">Content not available. Please visit the original post.</p>'}
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.7rem; padding: 1.2rem 2rem 1.2rem 2rem; background: var(--bg-secondary); border-radius: 10px; margin: 2rem 0 0.5rem 0;">
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <p style="color: var(--text-primary); margin: 0; font-style: italic; font-size: 1rem; margin-top: 0.18rem;">-Prashant Subedi
                                <a href="#about" id="authorProfileLink" style="display: inline-block; margin-left: 0.5rem; vertical-align: middle;">
                                    <img src="assets/images/profile.jpg" alt="Prashant Subedi" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color); box-shadow: 0 2px 8px var(--shadow); vertical-align: middle; margin-left: 0.3rem;">
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modalBody.innerHTML = blogHTML;

        // Add event to author photo: close modal and scroll to about
        const authorProfileLink = document.getElementById('authorProfileLink');
        if (authorProfileLink) {
            authorProfileLink.addEventListener('click', function(e) {
                e.preventDefault();
                modal.classList.remove('active');
                setTimeout(() => {
                    const aboutSection = document.getElementById('about');
                    if (aboutSection) {
                        aboutSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        window.location.href = 'index.html#about';
                    }
                }, 300);
            });
        }
        
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
