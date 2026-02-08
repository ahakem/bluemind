# Blue Mind Freediving - Next.js Website

## Firebase Deployment Setup

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project created: `bluemind-landing`
3. GitHub repository access

### Firebase Service Account Setup

1. **Create Firebase Service Account:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `bluemind-landing`
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire contents of the downloaded JSON file
   - Click "Add secret"

### Manual Deployment

```bash
# Login to Firebase
firebase login

# Deploy to production
npm run build
firebase deploy --only hosting

# Deploy to preview channel
npm run build
firebase hosting:channel:deploy preview
```

### Automatic Deployment

The GitHub Action (`.github/workflows/firebase-deploy.yml`) will automatically:
- Deploy preview on Pull Requests
- Deploy to production on push to `main`/`master` branch

### Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build locally
npx serve out
```

### Project Structure

- **`/out`** - Static export output (deployed to Firebase)
- **`/src/app`** - Next.js App Router pages
- **`/src/components`** - Reusable React components
- **`/src/sections`** - Page sections
- **`/public/images`** - Static assets

### SEO Features

- ✅ Per-page metadata
- ✅ Open Graph tags
- ✅ JSON-LD structured data
- ✅ Auto-generated sitemap.xml
- ✅ robots.txt
- ✅ Optimized images with Next.js Image

### Performance

- ✅ Static export for optimal performance
- ✅ Image optimization with lazy loading
- ✅ Proper caching headers
- ✅ Security headers (X-Frame-Options, CSP, etc.)
