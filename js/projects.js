document.addEventListener('DOMContentLoaded', function() {
    const projectsContainer = document.getElementById('projectsContainer');
    
    // Configuration - Add your preferred repo names here when you want to showcase specific projects
    const preferredRepos = [
        // Add your preferred repo names here when you have notable projects
        // Example: 'ai-image-classifier', 'ecommerce-backend', 'data-analysis-tool'
    ];

    // Thumbnail mapping based on language
    const thumbnailMap = {
        'python': 'assets/images/project2.jpg',
        'javascript': 'assets/images/project3.jpg',
        'default': 'assets/images/project1.jpg'
    };

    // Function to create project card
    function createProjectCard(repo) {
        const language = repo.language ? repo.language.toLowerCase() : 'default';
        const imageUrl = thumbnailMap[language] || thumbnailMap.default;
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${imageUrl}" alt="${repo.name}">
            </div>
            <div class="project-content">
                <h3 class="project-title">${formatRepoName(repo.name)}</h3>
                <p class="project-description">${repo.description || 'No description available'}</p>
                <div class="project-tech">
                    ${repo.language ? `<span class="tech-tag">${repo.language}</span>` : ''}
                </div>
                <div class="project-links">
                    <a href="${repo.html_url}" class="btn btn-secondary" target="_blank">
                        <i class="fab fa-github"></i> View Code
                    </a>
                </div>
            </div>
        `;
        
        return projectCard;
    }

    // Format repo name for display
    function formatRepoName(name) {
        return name.replace(/-/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase());
    }

    // Fetch GitHub repositories
    fetch('https://api.github.com/users/prashantsubedii/repos')
        .then(response => response.json())
        .then(repos => {
            let projectsToShow = [];

            if (preferredRepos.length > 0) {
                // Show preferred repos if specified
                projectsToShow = repos.filter(repo => 
                    preferredRepos.includes(repo.name) && !repo.fork
                );
                
                // If not enough preferred repos, fill with most recent
                if (projectsToShow.length < 3) {
                    const remaining = 3 - projectsToShow.length;
                    const recentRepos = repos
                        .filter(repo => !repo.fork && !preferredRepos.includes(repo.name))
                        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                        .slice(0, remaining);
                    projectsToShow = [...projectsToShow, ...recentRepos];
                }
            } else {
                // Default: show 3 most recently updated non-fork repos
                projectsToShow = repos
                    .filter(repo => !repo.fork)
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    .slice(0, 3);
            }

            // Display projects
            if (projectsToShow.length > 0) {
                projectsToShow.forEach(repo => {
                    projectsContainer.appendChild(createProjectCard(repo));
                });
            } else {
                showErrorMessage();
            }
        })
        .catch(error => {
            console.error('Error fetching GitHub repos:', error);
            showErrorMessage();
        });

    function showErrorMessage() {
        projectsContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to load projects at this time. Please check my <a href="https://github.com/prashantsubedii" target="_blank">GitHub profile</a> directly.</p>
            </div>
        `;
    }
});