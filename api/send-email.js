// Vercel Serverless Function for EmailJS Integration
const https = require('https');

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        // Parse request body
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }

        // EmailJS credentials
        const serviceId = 'service_r1tx3ki';
        const templateId = 'template_1ni1njd';
        const publicKey = 'Z_NWorNPoIIW9c3eh';

        // Prepare EmailJS API request
        const emailData = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
                to_email: email // Auto-reply to the sender
            }
        };

        // Send email via EmailJS API
        const response = await sendEmailViaEmailJS(emailData);

        if (response.status === 200) {
            return res.status(200).json({ success: true });
        } else {
            throw new Error(`EmailJS API returned status ${response.status}`);
        }

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to send email' 
        });
    }
}

// Helper function to send email via EmailJS API
function sendEmailViaEmailJS(emailData) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(emailData);

        const options = {
            hostname: 'api.emailjs.com',
            port: 443,
            path: '/api/v1.0/email/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

