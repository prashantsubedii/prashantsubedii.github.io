// Netlify Serverless Function for GitHub Projects API
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
        // Get GitHub credentials from environment variables
        const githubToken = process.env.GITHUB_TOKEN;
        const githubUsername = process.env.GITHUB_USERNAME || 'prashantsubedii';

        if (!githubToken) {
            console.error('Missing GitHub token');
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Server configuration error: GitHub token not set' 
                })
            };
        }

        // GraphQL query to fetch user repositories - shows recent public repos
        const query = `
            query {
                user(login: "${githubUsername}") {
                    repositories(first: 6, orderBy: {field: UPDATED_AT, direction: DESC}, privacy: PUBLIC) {
                        nodes {
                            name
                            description
                            url
                            homepageUrl
                            repositoryTopics(first: 5) {
                                nodes {
                                    topic {
                                        name
                                    }
                                }
                            }
                            primaryLanguage {
                                name
                                color
                            }
                        }
                    }
                }
            }
        `;

        // Fetch from GitHub GraphQL API using https module
        const data = await fetchGitHubGraphQL(query, githubToken);

        // Handle GraphQL errors
        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            const errorMessage = data.errors[0]?.message || 'Failed to fetch repositories';
            
            // Return empty array for certain errors (e.g., user not found) instead of failing
            if (errorMessage.includes('Could not resolve') || errorMessage.includes('not found')) {
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        success: true, 
                        repositories: [] 
                    })
                };
            }
            
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: false, 
                    error: errorMessage
                })
            };
        }

        // Handle successful response - works with empty array (0 repos), single repo (1), or multiple
        if (data.data && data.data.user && data.data.user.repositories) {
            const repositories = data.data.user.repositories.nodes || [];
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: true, 
                    repositories: repositories 
                })
            };
        } else {
            // No user data found, return empty array
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: true, 
                    repositories: [] 
                })
            };
        }

    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Failed to fetch repositories' 
            })
        };
    }
};

// Helper function to fetch from GitHub GraphQL API with better error handling
function fetchGitHubGraphQL(query, token) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ query });

        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: '/graphql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v4+json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Netlify-Serverless-Function'
            },
            timeout: 10000 // 10 second timeout
        };

        const req = https.request(options, (res) => {
            let data = '';

            // Handle rate limiting
            if (res.statusCode === 403) {
                const remaining = res.headers['x-ratelimit-remaining'];
                const resetTime = res.headers['x-ratelimit-reset'];
                reject(new Error(`GitHub API rate limit exceeded. Reset at: ${new Date(resetTime * 1000).toISOString()}`));
                return;
            }

            // Handle other HTTP errors
            if (res.statusCode < 200 || res.statusCode >= 300) {
                res.on('data', () => {}); // Consume response
                res.on('end', () => {
                    reject(new Error(`GitHub API returned status ${res.statusCode}`));
                });
                return;
            }

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error('Failed to parse GitHub API response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Network error: ${error.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

