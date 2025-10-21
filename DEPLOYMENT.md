# Deployment Guide for Storylines

This guide covers deploying Storylines to GitHub Pages.

## Quick Deploy to GitHub Pages

### Automated Deployment (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages.

**Steps:**

1. **Merge to Main Branch**
   ```bash
   # First, create and push a main branch from your current branch
   git checkout -b main
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub: `https://github.com/haigpapa/storylines`
   - Navigate to **Settings** > **Pages**
   - Under **Source**, select **GitHub Actions**
   - Click **Save**

3. **Trigger Deployment**
   - The workflow will automatically run on every push to `main`
   - Or manually trigger it from **Actions** tab > **Deploy to GitHub Pages** > **Run workflow**

4. **Access Your Site**
   - After deployment completes (2-3 minutes), your site will be live at:
   - `https://haigpapa.github.io/storylines/`

### Manual Deployment

If you prefer manual deployment:

```bash
# 1. Build the project
npm run build

# 2. The built files are in the dist/ folder
# 3. You can deploy the dist/ folder to any static hosting service:
#    - Netlify: Drag and drop dist/ folder at netlify.com
#    - Vercel: vercel --prod
#    - GitHub Pages: Use the automated method above
```

## Deployment Configuration

### Vite Configuration

The project is already configured for GitHub Pages deployment in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/storylines/',  // Repository name as base path
})
```

### Environment Variables (Optional)

For AI features, you can add environment variables in your hosting platform:

**GitHub Pages:**
- Environment variables are not directly supported
- Users can enter API keys in the app UI

**Vercel/Netlify:**
- Add these in your dashboard under Environment Variables:
  ```
  VITE_GEMINI_API_KEY=your_key
  VITE_GOOGLE_BOOKS_API_KEY=your_key
  ```

## Alternative Hosting Platforms

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Your site will be at: `https://storylines-username.vercel.app`

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

Or use the Netlify dashboard:
1. Go to netlify.com
2. Drag and drop the `dist/` folder

### Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### 404 on Refresh

This is normal for GitHub Pages with client-side routing. The app handles all routes internally.

### API Keys Not Working

- Make sure you're using `VITE_` prefix for environment variables
- For GitHub Pages, enter API keys directly in the app UI (top-right button)

## Post-Deployment Checklist

- [ ] Site loads at the correct URL
- [ ] Search functionality works
- [ ] Graph visualization renders correctly
- [ ] Can expand nodes and see connections
- [ ] Dev journal logs actions
- [ ] Export/import functionality works
- [ ] Reading lists and bookmarks persist

## GitHub Pages URL

Once deployed, your live application will be available at:

**https://haigpapa.github.io/storylines/**

## Update the Main README

After successful deployment, update the main README.md to include:

```markdown
## Live Demo

🌐 **[View Live Demo](https://haigpapa.github.io/storylines/)**
```

---

**Need help?** Open an issue at: https://github.com/haigpapa/storylines/issues
