// Vercel Serverless Function for GitHub Projects API

// Set CORS headers helper
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        setCorsHeaders(res);
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    setCorsHeaders(res);

    try {
        // Get GitHub credentials from environment variables
        const githubToken = process.env.GITHUB_TOKEN;
        const githubUsername = process.env.GITHUB_USERNAME || 'prashantsubedii';

        if (!githubToken) {
            console.error('Missing GitHub token');
            return res.status(500).json({ 
                success: false, 
                error: 'Server configuration error: GitHub token not set' 
            });
        }

        // GraphQL query to fetch user GitHub Projects (classic boards, not repos)
        const query = `
            query {
                user(login: "${githubUsername}") {
                    projects(first: 6, orderBy: {field: UPDATED_AT, direction: DESC}) {
                        nodes {
                            name
                            body
                            url
                            state
                            createdAt
                            updatedAt
                        }
                    }
                }
            }
        `;

        // Fetch from GitHub GraphQL API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response;
        try {
            response = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v4+json',
                },
                body: JSON.stringify({ query }),
                signal: controller.signal
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw fetchError;
        }
        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 403) {
            const remaining = response.headers.get('x-ratelimit-remaining');
            const resetTime = response.headers.get('x-ratelimit-reset');
            return res.status(500).json({ 
                success: false, 
                error: `GitHub API rate limit exceeded. Reset at: ${new Date(resetTime * 1000).toISOString()}` 
            });
        }

        // Handle other HTTP errors
        if (!response.ok) {
            throw new Error(`GitHub API returned status ${response.status}`);
        }

        const data = await response.json();

        // Handle GraphQL errors
        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            const errorMessage = data.errors[0]?.message || 'Failed to fetch repositories';
            
            // Return empty array for certain errors (e.g., user not found) instead of failing
            if (errorMessage.includes('Could not resolve') || errorMessage.includes('not found')) {
                return res.status(200).json({ 
                    success: true, 
                    repositories: [] 
                });
            }
            
            return res.status(500).json({ 
                success: false, 
                error: errorMessage
            });
        }

        // Handle successful response for projects
        if (data.data && data.data.user && data.data.user.projects) {
            const projects = data.data.user.projects.nodes || [];
            return res.status(200).json({
                success: true,
                projects: projects
            });
        } else {
            // No user data found, return empty array
            return res.status(200).json({
                success: true,
                projects: []
            });
        }

    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to fetch repositories' 
        });
    }
}

