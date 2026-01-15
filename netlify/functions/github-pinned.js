// Netlify Function to fetch GitHub pinned repositories via GraphQL API
// This keeps your Personal Access Token (PAT) secure on the server side

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Get the PAT from environment variable
    const GITHUB_TOKEN = process.env.GITHUB_PAT;
    
    if (!GITHUB_TOKEN) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'GitHub PAT not configured. Please set GITHUB_PAT environment variable.'
            })
        };
    }

    const username = 'prashantsubedii';

    // GraphQL query for pinned repositories
    const query = `
        query {
            user(login: "${username}") {
                pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                        ... on Repository {
                            name
                            description
                            url
                            openGraphImageUrl
                            stargazerCount
                            forkCount
                            defaultBranchRef {
                                name
                            }
                            primaryLanguage {
                                name
                                color
                            }
                            repositoryTopics(first: 5) {
                                nodes {
                                    topic {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        const pinnedRepos = data.data.user.pinnedItems.nodes.map(repo => ({
            name: repo.name,
            description: repo.description || 'No description available.',
            url: repo.url,
            openGraphImage: repo.openGraphImageUrl || null,
            defaultBranch: repo.defaultBranchRef?.name || 'main',
            stars: repo.stargazerCount,
            forks: repo.forkCount,
            language: repo.primaryLanguage?.name || null,
            languageColor: repo.primaryLanguage?.color || null,
            topics: repo.repositoryTopics?.nodes?.map(t => t.topic.name) || []
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                pinnedRepos
            })
        };

    } catch (error) {
        console.error('Error fetching pinned repos:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
