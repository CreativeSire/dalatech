# Netlify Automatic Deployment

Your DALA website now deploys automatically with **zero manual server setup**!

## ✅ What's Already Configured

- **Frontend**: Static HTML/CSS (deploys automatically)
- **Backend API**: Netlify Functions (serverless, auto-deploys)
- **Auth**: JWT-based login/signup
- **Database**: In-memory (demo) → easily upgrade to Supabase

## 🚀 Deploy (Just Push to GitHub!)

Since your site is already on Netlify, just push this repo:

```bash
git push origin main
```

That's it! Netlify will:
1. Auto-deploy the frontend
2. Auto-deploy the API functions
3. Give you a live URL instantly

## 🔗 API Endpoints (Live After Deploy)

Your API will be at: `https://your-site.netlify.app/api/auth`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Sign in |
| `/api/auth/health` | GET | Check status |

## 💻 Local Development

```bash
# Install Netlify CLI globally (one time)
npm install -g netlify-cli

# Start local dev server
netlify dev
```

Site runs at: `http://localhost:8888`
API runs at: `http://localhost:8888/api/auth`

## 🔐 Environment Variables (Optional)

In Netlify Dashboard → Site Settings → Environment Variables:
- `JWT_SECRET` = (generate a random string)

## 🗄️ Add Persistent Database (When Ready)

Current: Users stored in memory (resets on deploy)

For production, add **Supabase** (free, 5 min setup):
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Add `SUPABASE_URL` and `SUPABASE_KEY` to Netlify env vars
4. Update the function to use Supabase client

Or use **PlanetScale** (free MySQL), **Neon** (free Postgres), etc.

## 📁 Files That Handle Deployment

- `netlify.toml` - Tells Netlify how to build and deploy
- `netlify/functions/auth.js` - API endpoints (serverless)
- `package.json` - Dependencies for functions

## 🎯 That's It!

No Render. No manual server setup. Just push to GitHub and Netlify handles everything automatically!
