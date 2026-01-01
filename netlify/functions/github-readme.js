// Netlify Serverless Function for GitHub README API
const https = require('https');

// CORS headers for all responses
const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event, context) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: 'Method not allowed' })
        };
    }

    try {
        // Get query parameters
        const { owner, repo } = event.queryStringParameters || {};

        if (!owner || !repo) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Owner and repo parameters are required' 
                })
            };
        }

        // Get GitHub token from environment variables (optional, but recommended for rate limits)
        const githubToken = process.env.GITHUB_TOKEN;

        // Fetch README from GitHub API
        const data = await fetchGitHubReadme(owner, repo, githubToken);
        
        if (!data) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'README not found' 
                })
            };
        }

        const readmeContent = Buffer.from(data.content, 'base64').toString('utf-8');

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: true, 
                content: readmeContent 
            })
        };

    } catch (error) {
        console.error('Error fetching README:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Failed to fetch README' 
            })
        };
    }
};

// Helper function to fetch README from GitHub API
function fetchGitHubReadme(owner, repo, token) {
    return new Promise((resolve, reject) => {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Netlify-Serverless-Function'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: `/repos/${owner}/${repo}/readme`,
            method: 'GET',
            headers: headers
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 404) {
                    resolve(null);
                    return;
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`GitHub API returned status ${res.statusCode}`));
                    return;
                }

                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(new Error('Failed to parse response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

