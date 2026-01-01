// Vercel Serverless Function for Medium RSS Feed

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
        const { username } = req.query;
        const mediumUsername = username || 'prashantsubedii';
        
        // Medium RSS feed URL
        const rssUrl = `https://medium.com/feed/@${mediumUsername}`;

        // Fetch RSS feed
        const response = await fetch(rssUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rssData = await response.text();
        
        // Parse RSS and extract blog posts
        const blogs = parseMediumRSS(rssData);

        return res.status(200).json({
            success: true,
            blogs: blogs
        });

    } catch (error) {
        console.error('Error fetching Medium blog:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch blogs'
        });
    }
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

