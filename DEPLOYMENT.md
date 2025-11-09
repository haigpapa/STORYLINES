# Deployment Guide

This guide covers deploying the Literary Explorer application to various platforms.

## 🚀 Quick Start

The application consists of:
- **Frontend**: React + Vite static site (served from `/dist`)
- **Backend**: Express.js API server (serves from `/server`)
- **Requirements**: Node.js 18+, environment variables

## 📋 Pre-Deployment Checklist

- [ ] Set `GEMINI_API_KEY` in environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CLIENT_URL` for CORS (production domain)
- [ ] Test production build locally (`npm run build`)
- [ ] Review and update rate limiting settings if needed
- [ ] Set up monitoring/logging
- [ ] Configure custom domain (optional)

---

## 🌐 Platform-Specific Guides

### Option 1: Vercel (Recommended)

**Pros**: Easy setup, serverless, automatic deployments, free tier
**Cons**: Serverless function limitations

#### Steps:

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**

   In Vercel Dashboard → Settings → Environment Variables:
   ```
   GEMINI_API_KEY=your_actual_key
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   VITE_API_URL=https://your-app.vercel.app
   ```

3. **Deploy**
   ```bash
   # Using Vercel CLI
   vercel

   # Or connect your GitHub repo in Vercel dashboard
   # It will auto-deploy on push
   ```

4. **Configure vercel.json** (already included)
   - Routes API calls to `/server/index.js`
   - Serves static files from `/dist`

#### Notes:
- Uses `@vercel/node` for the backend
- Serverless functions have 10-second timeout (can upgrade)
- Automatic HTTPS and CDN

---

### Option 2: Railway

**Pros**: Simple deployment, persistent storage, good for monoliths
**Cons**: Paid service (free trial available)

#### Steps:

1. **Create `railway.toml`** (already in repo)

2. **Deploy via Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

3. **Or connect GitHub repo**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Add environment variables in dashboard

4. **Environment Variables** (in Railway dashboard)
   ```
   GEMINI_API_KEY=your_actual_key
   NODE_ENV=production
   PORT=3001
   ```

---

### Option 3: Docker / Docker Compose

**Pros**: Portable, works anywhere, full control
**Cons**: Requires container hosting

#### Local Testing:

```bash
# 1. Build the image
docker build -t literary-explorer .

# 2. Run with docker-compose
docker-compose up

# 3. Access at http://localhost:3001
```

#### Production Deploy:

**AWS ECS / Fargate:**
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag literary-explorer:latest <account>.dkr.ecr.us-east-1.amazonaws.com/literary-explorer:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/literary-explorer:latest

# Deploy via ECS task definition
```

**DigitalOcean App Platform:**
1. Push Docker image to Docker Hub or DigitalOcean Container Registry
2. Create new app from container image
3. Set environment variables
4. Deploy

---

### Option 4: Render

**Pros**: Free tier, easy setup, auto-deploy from Git
**Cons**: Cold starts on free tier

#### Steps:

1. **Create `render.yaml`** (already in repo)

2. **Deploy via Dashboard**
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repo
   - Render will detect `render.yaml`

3. **Or Manual Setup**
   - New Web Service
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables

4. **Environment Variables**
   ```
   GEMINI_API_KEY=your_actual_key
   NODE_ENV=production
   CLIENT_URL=https://your-app.onrender.com
   ```

---

### Option 5: Netlify

**Pros**: Great for static sites, edge functions
**Cons**: Need to configure serverless functions

#### Steps:

1. **Create `netlify.toml`** (already in repo)

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login and deploy
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Configure Functions**
   - Backend code goes in `/netlify/functions`
   - Need to adapt `/server/index.js` to Netlify Functions format

---

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key | `AIza...` |
| `NODE_ENV` | ✅ Yes | Environment | `production` |
| `PORT` | ⚠️ Optional | Server port | `3001` (default) |
| `CLIENT_URL` | ⚠️ Optional | Frontend URL for CORS | `https://myapp.com` |
| `VITE_API_URL` | ⚠️ Optional | Backend API URL | `https://myapp.com` |

---

## 🧪 Testing Production Build Locally

```bash
# 1. Build the frontend
npm run build

# 2. Start production server
NODE_ENV=production npm start

# 3. Test at http://localhost:3001
# Frontend is served from /dist
# API is available at /api/*

# 4. Test with Docker
docker-compose up
```

---

## 📊 Monitoring & Logging

### Recommended Services:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and debugging
- **New Relic**: Application performance monitoring
- **Datadog**: Infrastructure and application monitoring

### Setup Example (Sentry):

```bash
npm install @sentry/react @sentry/vite-plugin
```

```javascript
// Add to main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## 🔒 Security Best Practices

### Pre-Deployment:

1. ✅ **Never commit `.env` files** (already gitignored)
2. ✅ **Use platform secret management**
   - Vercel: Environment Variables dashboard
   - Railway: Settings → Variables
   - Docker: Secrets or env files
3. ✅ **Enable HTTPS** (automatic on most platforms)
4. ✅ **Configure CORS properly**
   - Set `CLIENT_URL` to your production domain
5. ✅ **Review rate limits**
   - Default: 15 AI requests/min per IP
   - Adjust in `server/index.js` if needed

### Post-Deployment:

1. 🔍 **Monitor API usage** in Google AI Studio
2. 🚨 **Set up billing alerts**
3. 📊 **Monitor server logs** for errors
4. 🔐 **Regular security audits** (`npm audit`)

---

## 🎯 Performance Optimization

### Build Optimization:

```bash
# Analyze bundle size
npm run build -- --report

# Consider code splitting for large chunks
# Edit vite.config.ts:
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'three': ['three', '@react-three/fiber', '@react-three/drei'],
        'vendor': ['react', 'react-dom', 'zustand'],
      }
    }
  }
}
```

### CDN Configuration:

- **Static Assets**: Use CDN for `/dist` files
- **Images**: Consider image optimization service
- **Fonts**: Host locally or use CDN

---

## 🐛 Troubleshooting

### Common Issues:

**1. Build fails with "out of memory"**
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**2. API calls fail with CORS error**
```bash
# Check CLIENT_URL is set correctly
# Verify VITE_API_URL points to backend
```

**3. Serverless timeout (Vercel)**
```bash
# Reduce AI model complexity
# Or upgrade to Pro plan for longer timeouts
```

**4. Cold starts are slow**
```bash
# Use paid tier with always-on instances
# Or implement keep-alive ping
```

---

## 📱 Custom Domain

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Railway/Render:
1. Settings → Custom Domain
2. Add CNAME record pointing to provided URL

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm test
      - run: npm run type-check
      - run: npm run build

      # Deploy to Vercel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

---

## 📞 Support

- **Issues**: Open a GitHub issue
- **Documentation**: See [README.md](README.md)
- **Security**: See [SECURITY.md](SECURITY.md)

---

**Ready to deploy? Choose a platform above and follow the steps!** 🚀
