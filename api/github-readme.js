// Vercel Serverless Function for GitHub README API

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
        // Get query parameters
        const { owner, repo } = req.query;

        if (!owner || !repo) {
            return res.status(400).json({ 
                success: false, 
                error: 'Owner and repo parameters are required' 
            });
        }

        // Get GitHub token from environment variables (optional, but recommended for rate limits)
        const githubToken = process.env.GITHUB_TOKEN;
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
        };

        if (githubToken) {
            headers['Authorization'] = `Bearer ${githubToken}`;
        }

        // Fetch README from GitHub API
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
            headers: headers
        });

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'README not found' 
                });
            }
            throw new Error(`GitHub API returned status ${response.status}`);
        }

        const data = await response.json();
        const readmeContent = atob(data.content); // Decode base64

        return res.status(200).json({ 
            success: true, 
            content: readmeContent 
        });

    } catch (error) {
        console.error('Error fetching README:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to fetch README' 
        });
    }
}

