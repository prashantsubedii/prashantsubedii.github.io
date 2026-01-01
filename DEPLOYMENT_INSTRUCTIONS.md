# EmailJS Integration - Deployment Instructions

This document provides step-by-step instructions for deploying the EmailJS integration with secure environment variables on Netlify and Vercel.

**🔒 Security Note:** Never commit your actual EmailJS credentials to Git. Always use environment variables in your deployment platform. This file uses placeholders - replace them with your actual credentials only in your deployment platform's environment variable settings.

## Prerequisites

- EmailJS Account with your credentials:
  - Service ID: `your_service_id` (get from EmailJS dashboard)
  - Template ID: `your_template_id` (get from EmailJS dashboard)
  - Public Key: `your_public_key` (get from EmailJS dashboard)

## Environment Variables

You'll need to set the following environment variables in your deployment platform:

- `EMAILJS_SERVICE_ID` = `your_service_id`
- `EMAILJS_TEMPLATE_ID` = `your_template_id`
- `EMAILJS_PUBLIC_KEY` = `your_public_key`

**⚠️ Important:** Replace the placeholder values above with your actual EmailJS credentials from your EmailJS account dashboard.

---

## Netlify Deployment

### Step 1: Prepare Your Repository

1. Ensure your project structure includes:
   ```
   Portfolio Draft/
   ├── netlify/
   │   └── functions/
   │       └── send-email.js
   ├── index.html
   ├── css/
   ├── js/
   └── ...
   ```

### Step 2: Deploy to Netlify

1. **Via Netlify Dashboard:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Set build settings:
     - Build command: (leave empty or use `npm install` if you have a package.json)
     - Publish directory: `/` (root directory)

2. **Via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

### Step 3: Set Environment Variables

1. In Netlify Dashboard, go to your site
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable** and add each variable:
   - Key: `EMAILJS_SERVICE_ID`, Value: `your_service_id`
   - Key: `EMAILJS_TEMPLATE_ID`, Value: `your_template_id`
   - Key: `EMAILJS_PUBLIC_KEY`, Value: `your_public_key`
   
   **Replace the placeholder values with your actual EmailJS credentials.**
4. Click **Save**

### Step 4: Redeploy (if needed)

- If you added environment variables after deployment, trigger a new deployment:
  - Go to **Deploys** tab
  - Click **Trigger deploy** → **Clear cache and deploy site**

### Step 5: Verify Function Endpoint

Your serverless function will be available at:
```
https://your-site.netlify.app/.netlify/functions/send-email
```

The frontend code automatically uses this endpoint.

---

## Vercel Deployment

### Step 1: Prepare Your Repository

1. Ensure your project structure includes:
   ```
   Portfolio Draft/
   ├── api/
   │   └── send-email.js
   ├── index.html
   ├── css/
   ├── js/
   └── ...
   ```

### Step 2: Deploy to Vercel

1. **Via Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Configure project:
     - Framework Preset: **Other**
     - Root Directory: `/` (or your project root)
     - Build Command: (leave empty)
     - Output Directory: `/` (or your project root)

2. **Via Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   vercel --prod
   ```

### Step 3: Set Environment Variables

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development**:
   - Key: `EMAILJS_SERVICE_ID`, Value: `your_service_id`
   - Key: `EMAILJS_TEMPLATE_ID`, Value: `your_template_id`
   - Key: `EMAILJS_PUBLIC_KEY`, Value: `your_public_key`
   
   **Replace the placeholder values with your actual EmailJS credentials.**
4. Click **Save**

### Step 4: Redeploy (if needed)

- If you added environment variables after deployment:
  - Go to **Deployments** tab
  - Click the **⋯** menu on the latest deployment
  - Select **Redeploy**

### Step 5: Verify Function Endpoint

Your serverless function will be available at:
```
https://your-site.vercel.app/api/send-email
```

**Note:** The frontend code currently defaults to Netlify's endpoint. To use Vercel, update the `apiEndpoint` variable in `js/main.js`:

```javascript
let apiEndpoint = '/api/send-email'; // For Vercel
```

---

## ⚠️ Important: Localhost Testing

**The contact form will NOT work on localhost** (when opening the HTML file directly or using a simple local server).

### Why?
- Serverless functions (Netlify Functions/Vercel Functions) only run on their respective platforms
- The endpoints `/.netlify/functions/send-email` and `/api/send-email` don't exist on localhost
- You'll see an error message: "Serverless functions are not available on localhost"

### Solution
**Deploy to Netlify or Vercel first** - the form will work perfectly after deployment!

### Optional: Local Testing (Advanced)
If you want to test locally before deploying:

**For Netlify:**
```bash
npm install -g netlify-cli
netlify dev
```

**For Vercel:**
```bash
npm install -g vercel
vercel dev
```

These commands start a local development server that simulates the serverless functions.

---

## Testing the Integration

1. **Test the Form (After Deployment):**
   - Navigate to the contact section on your deployed site
   - Fill out the form with test data
   - Submit the form
   - You should see:
     - Sending animation on the button
     - Success animation after submission
     - Custom popup with success message

2. **Check EmailJS Dashboard:**
   - Log into your EmailJS account
   - Go to **Email Logs** to verify emails are being sent

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to verify the API call is successful

---

## Troubleshooting

### Issue: "Server configuration error"
- **Solution:** Verify all three environment variables are set correctly in your deployment platform

### Issue: "Failed to send email"
- **Solution:** 
  - Check EmailJS service status
  - Verify your EmailJS template is configured correctly
  - Ensure the template variables match: `from_name`, `from_email`, `subject`, `message`, `to_email`

### Issue: Function not found (404)
- **Solution:**
  - For Netlify: Ensure `netlify/functions/send-email.js` exists
  - For Vercel: Ensure `api/send-email.js` exists
  - Verify the file structure matches the deployment platform requirements

### Issue: CORS errors
- **Solution:** The serverless functions already include CORS headers. If issues persist, check your deployment platform's CORS settings.

---

## Security Notes

✅ **DO:**
- Keep environment variables in your deployment platform's environment variable settings
- Never commit credentials to Git
- Use different credentials for development and production if needed

❌ **DON'T:**
- Hardcode credentials in frontend code
- Commit `.env` files to Git
- Share credentials publicly

---

## EmailJS Template Configuration

Ensure your EmailJS template includes these variables:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{subject}}` - Email subject
- `{{message}}` - Email message
- `{{to_email}}` - Recipient email (for auto-reply)

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check your deployment platform's function logs
3. Verify EmailJS service is active
4. Ensure all environment variables are set correctly

---

## Additional Notes

- The frontend automatically detects the deployment platform by trying Netlify's endpoint first
- Both serverless functions are included for flexibility
- The custom popup matches your site's UI theme (light/dark mode)
- All animations are smooth and responsive

