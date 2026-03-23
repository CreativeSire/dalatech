# Automatic Deployment Guide

This project is configured for **automatic deployment** - every time you push to GitHub, your website will automatically update.

## 🚀 Quick Deploy (One-Time Setup)

### Option 1: Deploy to Render.com (Recommended - Free)

1. **Push this repo to GitHub** (already done)

2. **Go to [Render.com](https://render.com)** and sign up with your GitHub account

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `CreativeSire/dalatech`
   - Select the `main` branch

4. **Configure Service**:
   ```
   Name: dala-api
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (generate a random string at https://jwtsecret.com)

6. **Add Disk (for database)**:
   - Name: `database`
   - Mount Path: `/data`
   - Size: 1 GB (free tier)

7. **Click "Create Web Service"**

8. **Update API URL** (one time):
   Once deployed, Render will give you a URL like `https://dala-api.onrender.com`. Update this in:
   - `pages/login.html` (line ~10)
   - `pages/signup.html` (line ~10)

### Option 2: Deploy Frontend to Netlify + Backend to Render

**Frontend (Netlify - Free)**:
1. Go to [Netlify](https://netlify.com)
2. "Add new site" → "Import from GitHub"
3. Select repo, keep default settings
4. Deploy!

**Backend (Render - Free)**:
Follow steps above for the API server.

## 📋 What's Already Configured

### Files for Deployment:
- ✅ `render.yaml` - Render deployment config
- ✅ `server/render.yaml` - Backend service config
- ✅ `server/database.js` - Uses persistent disk on Render
- ✅ API URLs in login/signup pages detect localhost vs production

### Automatic Features:
- ✅ Push to GitHub → Auto deploy
- ✅ Database persists between deploys
- ✅ Free SSL certificate
- ✅ Custom domain support

## 🔗 After Deployment

Your sites will be at:
- **Website**: `https://dala-website.onrender.com` (or your custom domain)
- **API**: `https://dala-api.onrender.com`

## 💰 Cost

- **Render**: Free tier includes 1 web service + 1 static site
- **Netlify**: Free tier unlimited for static sites
- **Total**: $0/month

## 🔄 Updating Your Site

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically redeploy in ~1-2 minutes!
