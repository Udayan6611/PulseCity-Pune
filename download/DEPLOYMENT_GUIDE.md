# 🚀 Deployment Guide — Sheher to GitHub + Vercel

This guide walks you through pushing Sheher to GitHub and deploying it live on Vercel.

---

## Part 1: Push to GitHub

### Step 1 — Create a new GitHub repository

1. Go to **https://github.com/new**
2. Repository name: `sheher`
3. Description: `AI-powered smart city exploration platform — PromptWars Hackathon`
4. Set to **Public** (so judges can view)
5. **Do NOT** initialize with README/license/gitignore (we already have these)
6. Click **Create repository**

GitHub will show you a URL like `https://github.com/<your-username>/sheher.git` — copy it.

### Step 2 — Initialize local git and push

Run these commands in your project root (`/home/z/my-project/`):

```bash
# Make sure .gitignore is good
cat > .gitignore << 'EOF'
node_modules/
.next/
.env
.env.local
*.log
db/*.db
db/*.db-journal
.DS_Store
.vercel
.idea/
.vscode/
EOF

# Init (if not already initialized)
git init

# Add remote (REPLACE <your-username>)
git remote remove origin 2>/dev/null
git remote add origin https://github.com/<your-username>/sheher.git

# Stage everything
git add .

# First commit
git commit -m "🏙️ Sheher — Smart City Exploration Platform

AI-powered smart city OS built for PromptWars Hackathon.

Features:
- Interactive Leaflet maps with safety-aware markers
- Explore, Heritage, Safety, Compare, AI Insights tabs
- AI assistant (z-ai-web-dev-sdk) with voice input
- Citizen reports with AI clustering & trend analysis
- Real-time-style weather, traffic, AQI insights
- 5 Indian cities: Mumbai, Delhi, Bengaluru, Jaipur, Kolkata
- Dark mode, responsive, Framer Motion animations

Tech: Next.js 16, TypeScript, Tailwind 4, shadcn/ui, Prisma, Leaflet, Recharts."

# Push
git branch -M main
git push -u origin main
```

### Step 3 — Verify

- Visit your repo: `https://github.com/<your-username>/sheher`
- README should render with the project title, features, and badges
- All source files should be visible

---

## Part 2: Deploy to Vercel

### Step 1 — Prerequisites

- A Vercel account (https://vercel.com/signup — free with GitHub login)

### Step 2 — Import the repo

1. Go to **https://vercel.com/new**
2. You should see your `sheher` repo listed under "Import Git Repository"
3. Click **Import** next to it

### Step 3 — Configure environment

Vercel auto-detects Next.js — most settings are correct. You only need to:

1. **Framework Preset**: Next.js (auto-detected)
2. **Build Command**: `next build` (auto-detected — do NOT use `bun run build` because Vercel uses npm)
3. **Output Directory**: `.next` (auto-detected)
4. **Install Command**: `npm install` (or `bun install` if your Vercel project is set to use Bun)

### Step 4 — Set Environment Variables

⚠️ **Critical**: The default `DATABASE_URL` uses a file path that won't work on Vercel's serverless environment. You have 3 options:

#### Option A — Easiest: Use Vercel Postgres (free tier)

1. In Vercel project settings, click **Storage** → **Create Database** → **Postgres** (free)
2. Vercel auto-creates a `POSTGRES_PRISMA_URL` env var
3. In your `prisma/schema.prisma`, change the datasource to use it:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

4. Push the schema:

```bash
# Locally or via Vercel CLI
npx prisma db push
```

5. Re-deploy

#### Option B — Use Turso (libSQL — works on edge/serverless)

1. Create a free account at https://turso.tech
2. Create a database, get the URL and token
3. Add env vars in Vercel: `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
4. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "libsql"
  url      = env("TURSO_DATABASE_URL")
  directUrl = env("TURSO_DATABASE_URL")
}
```

#### Option C — Quick demo: Use in-memory storage

For a hackathon demo, you can skip persistence by using a mock data layer.

Modify `/home/z/my-project/src/lib/db.ts` to fall back to in-memory mock data when DATABASE_URL is missing. This is acceptable for a hackathon demo if the AI features are the highlight.

### Step 5 — Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for the build
3. Vercel gives you a live URL: `https://sheher-<random>.vercel.app`
4. Click **Visit** to confirm it works

### Step 6 — (Optional) Custom domain

If you own a domain like `sheher.app`:
- Vercel project settings → Domains → Add → follow DNS instructions

---

## Part 3: Update LinkedIn Post

After deployment, edit `/home/z/my-project/download/LINKEDIN_POST.md`:

1. Replace `[Vercel live link]` with your live URL (e.g., `https://sheher.vercel.app`)
2. Replace `[GitHub link]` with your repo URL (e.g., `https://github.com/<your-username>/sheher`)
3. Copy the final content into LinkedIn
4. Attach the screenshot(s) from `/home/z/my-project/download/`

---

## Part 4: Quick Verification Checklist

Before submitting to hackathon:

- [ ] GitHub repo is public and README renders correctly
- [ ] Vercel live URL works (opens without 500 error)
- [ ] Map loads with markers
- [ ] AI assistant responds to questions
- [ ] City switcher works (Mumbai → Delhi → Bengaluru → Jaipur → Kolkata)
- [ ] All 5 tabs render
- [ ] Citizen report submission works
- [ ] Mobile responsive (test on phone)
- [ ] LinkedIn post is published with screenshots
- [ ] Submission form on hackathon site includes both URLs

---

## 🆘 Troubleshooting

### "Module not found: Can't resolve 'leaflet'"
Run `bun install` again locally, then push updated `package.json` and `bun.lock` to GitHub.

### Vercel build fails with Prisma error
Make sure you've set up Postgres or Turso (Option A or B above) and pushed the schema.

### Map doesn't load on Vercel
Open browser console. If you see "Leaflet CSS missing", verify the `<link>` to leaflet.css in `layout.tsx` is present (we use CDN, so should be fine).

### AI assistant returns "Service unavailable"
The z-ai-web-dev-sdk requires the deployment environment to have proper API access. Check Vercel function logs.

---

Good luck with the hackathon submission! 🏆
