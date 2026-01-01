// Netlify Serverless Function for Medium RSS Feed
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
        const { username } = event.queryStringParameters || {};
        const mediumUsername = username || 'prashantsubedii';
        
        // Medium RSS feed URL
        const rssUrl = `https://medium.com/feed/@${mediumUsername}`;

        // Fetch RSS feed
        const rssData = await fetchRSS(rssUrl);
        
        // Parse RSS and extract blog posts
        const blogs = parseMediumRSS(rssData);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                blogs: blogs
            })
        };

    } catch (error) {
        console.error('Error fetching Medium blog:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to fetch blogs'
            })
        };
    }
};

// Helper function to fetch RSS feed
function fetchRSS(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            if (res.statusCode !== 200) {
                reject(new Error(`HTTP error! status: ${res.statusCode}`));
                return;
            }

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Parse Medium RSS XML
function parseMediumRSS(xmlData) {
    const blogs = [];
    
    try {
        // Extract item tags (blog posts)
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        
        while ((match = itemRegex.exec(xmlData)) !== null && blogs.length < 10) {
            const itemContent = match[1];
            
            // Extract title
            const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
            const title = titleMatch ? titleMatch[1] : itemContent.match(/<title>(.*?)<\/title>/)?.[1] || 'Untitled';
            
            // Extract link
            const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
            const link = linkMatch ? linkMatch[1] : '';
            
            // Extract description/excerpt
            const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
            let description = descMatch ? descMatch[1] : '';
            
            // Clean HTML from description
            description = description.replace(/<[^>]*>/g, '').trim();
            // Limit excerpt length
            const excerpt = description.length > 150 ? description.substring(0, 150) + '...' : description;
            
            // Extract cover image from content or description
            const imageMatch = itemContent.match(/<img[^>]+src="([^"]+)"/) || 
                             description.match(/<img[^>]+src="([^"]+)"/);
            let image = imageMatch ? imageMatch[1] : '';
            
            // If no image found, try content:encoded
            if (!image) {
                const contentMatch = itemContent.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
                if (contentMatch) {
                    const imgMatch = contentMatch[1].match(/<img[^>]+src="([^"]+)"/);
                    image = imgMatch ? imgMatch[1] : '';
                }
            }
            
            // Default placeholder image if none found
            if (!image) {
                image = 'https://via.placeholder.com/600x400?text=Blog+Post';
            }
            
            blogs.push({
                title: title,
                link: link,
                excerpt: excerpt,
                image: image,
                description: description
            });
        }
    } catch (error) {
        console.error('Error parsing RSS:', error);
    }
    
    return blogs;
}

