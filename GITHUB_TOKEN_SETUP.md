# GitHub Token Setup Instructions

This document provides step-by-step instructions for setting up your GitHub Personal Access Token securely for the portfolio project section. The projects section displays your recent public repositories from GitHub.

## 🔒 Security Note

**NEVER commit your GitHub token to Git or expose it in frontend code.** The token is stored securely as an environment variable in your deployment platform and is only used in serverless functions (server-side).

---

## Prerequisites

- A GitHub account
- Access to your deployment platform (Netlify or Vercel)

---

## Step 1: Create a GitHub Personal Access Token

1. **Go to GitHub Settings:**
   - Log into your GitHub account
   - Click your profile picture (top right) → **Settings**
   - Navigate to **Developer settings** (left sidebar)
   - Click **Personal access tokens** → **Tokens (classic)**

2. **Generate a New Token:**
   - Click **Generate new token** → **Generate new token (classic)**
   - Give it a descriptive name (e.g., "Portfolio Projects API")
   - Set expiration: Choose an appropriate duration (90 days, 1 year, or no expiration)

3. **Select Scopes (Permissions):**
   The token needs minimal permissions:
   - ✅ **`public_repo`** - Access public repositories (required)
   - ✅ **`read:user`** - Read user profile information (required for GraphQL)

4. **Generate and Copy Token:**
   - Click **Generate token** at the bottom
   - **⚠️ IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - Store it securely (password manager recommended)

---

## Step 2: Set Environment Variables

### Option A: Netlify Deployment

1. **Navigate to Netlify Dashboard:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Select your site

2. **Add Environment Variables:**
   - Go to **Site settings** → **Environment variables**
   - Click **Add a variable** and add:
   
     **Variable 1:**
     - Key: `GITHUB_TOKEN`
     - Value: `your_github_token_here` (paste the token you copied)
     - Scopes: Production, Preview, and Development (check all)

     **Variable 2 (Optional):**
     - Key: `GITHUB_USERNAME`
     - Value: `your_github_username` (e.g., `prashantsubedii`)
     - Scopes: Production, Preview, and Development (check all)
     - **Note:** If not set, defaults to `prashantsubedii`

3. **Save and Redeploy:**
   - Click **Save**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**

---

### Option B: Vercel Deployment

1. **Navigate to Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Add Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Click **Add New** and add:

     **Variable 1:**
     - Key: `GITHUB_TOKEN`
     - Value: `your_github_token_here` (paste the token you copied)
     - Environments: Production, Preview, and Development (check all)

     **Variable 2 (Optional):**
     - Key: `GITHUB_USERNAME`
     - Value: `your_github_username` (e.g., `prashantsubedii`)
     - Environments: Production, Preview, and Development (check all)
     - **Note:** If not set, defaults to `prashantsubedii`

3. **Save and Redeploy:**
   - Click **Save**
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**

---

## Step 3: Verify the Setup

1. **Visit Your Deployed Site:**
   - Navigate to the Projects section
   - You should see your recent repositories loading

2. **Check Browser Console (Optional):**
   - Open DevTools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to verify API calls are successful

3. **Test README Loading:**
   - Click "View Article" on any project
   - The README should load inline below the project card

---

## Troubleshooting

### Issue: "Server configuration error: GitHub token not set"
- **Solution:** Verify that `GITHUB_TOKEN` is set correctly in your deployment platform's environment variables
- Make sure you've redeployed after adding the environment variable

### Issue: "Failed to fetch repositories" or GraphQL errors
- **Solution:** 
  - Verify your token has the correct scopes (`public_repo` and `read:user`)
  - Check if your token has expired
  - Verify your GitHub username is correct (if using `GITHUB_USERNAME`)

### Issue: Rate limit errors
- **Solution:**
  - Authenticated requests have higher rate limits (5,000 per hour)
  - Make sure your token is properly set and being used
  - The serverless function automatically uses the token for authenticated requests

### Issue: No repositories showing
- **Solution:**
  - Make sure you have at least one public repository on your GitHub profile
  - The projects section shows your 6 most recently updated public repositories
  - If you have private repositories, they won't be displayed (only public repos are shown)

### Issue: CORS errors
- **Solution:** The serverless functions already include CORS headers. This should not occur. If it does, check your deployment platform's settings.

---

## Security Best Practices

✅ **DO:**
- Keep your token in environment variables only
- Use different tokens for different projects if needed
- Regularly rotate your tokens (update every 90 days or as needed)
- Use tokens with minimal required permissions
- Store tokens securely (password manager)

❌ **DON'T:**
- Commit tokens to Git repositories
- Hardcode tokens in frontend JavaScript code
- Share tokens publicly
- Use tokens with excessive permissions
- Use the same token for everything

---

## Token Permissions Explanation

- **`public_repo`**: Required to access public repository information (name, description, topics, etc.)
- **`read:user`**: Required for GraphQL queries to fetch user profile data (repositories)

These are the minimum permissions needed. The token cannot:
- Modify repositories
- Access private repositories (unless you also grant `repo` scope)
- Perform any write operations

---

## Additional Notes

- The token is **never exposed** to the frontend/client-side code
- All API calls are made server-side through serverless functions
- The frontend only receives the final project data (no tokens)
- Works with 0, 1, or multiple repositories
- Automatically updates when you pin/unpin repositories on GitHub

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check your deployment platform's function logs
3. Verify the token is correctly set in environment variables
4. Ensure the token hasn't expired
5. Verify you have public repositories on GitHub

For more information:
- [GitHub Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub GraphQL API Documentation](https://docs.github.com/en/graphql)
