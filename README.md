# Blue Mind Freediving - Next.js Migration

This is the Next.js (App Router) version of the Blue Mind Freediving website.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy your images from the old project:
```bash
# Copy all images from client/src/assets to public/images
mkdir -p public/images/gallery
cp ../client/src/assets/*.webp public/images/
cp ../client/src/assets/*.png public/images/
cp ../client/src/assets/gallery/*.webp public/images/gallery/
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with MUI ThemeRegistry
│   ├── page.tsx            # Home page (/, with Hero, About preview, etc.)
│   ├── about/
│   │   └── page.tsx        # About page (/about)
│   ├── training/
│   │   └── page.tsx        # Training schedule page (/training)
│   ├── gallery/
│   │   └── page.tsx        # Full gallery page (/gallery)
│   └── not-found.tsx       # 404 page
├── components/             # Reusable UI components
│   ├── Navbar.tsx          # Navigation with next/link
│   ├── Footer.tsx          # Site footer
│   ├── BackToTop.tsx       # Scroll to top button
│   ├── SkipLinks.tsx       # Accessibility skip links
│   ├── OptimizedImage.tsx  # Image components
│   └── ThemeRegistry.tsx   # MUI AppRouterCacheProvider setup
├── sections/               # Page sections (Client Components)
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Team.tsx
│   ├── Membership.tsx
│   ├── Gallery.tsx
│   ├── Calendar.tsx
│   └── Contact.tsx
├── data/                   # Static data
│   └── index.ts
├── hooks/                  # Custom React hooks
│   └── useScrollPosition.ts
└── lib/                    # Utilities and configuration
    └── theme.ts            # MUI theme (exact copy from original)
```

## Key Features

### SSR with MUI
The `ThemeRegistry` component uses `@mui/material-nextjs/v14-appRouter` with `AppRouterCacheProvider` to ensure proper server-side rendering of MUI styles without any flash of unstyled content (FOUC).

### SEO Optimization
Each page exports a `metadata` object with:
- Title and description optimized for "Freediving Club Amsterdam"
- Open Graph tags for social sharing
- Twitter Card metadata
- JSON-LD structured data for rich snippets
- Canonical URLs

### Navigation
The Navbar uses `next/link` for client-side navigation while maintaining the exact same MUI styling as the original.

### Page Routes
- `/` - Home page with Hero, About preview, Team, Membership, Gallery preview, Calendar, Contact
- `/about` - Full About section with Team
- `/training` - Calendar and Membership details
- `/gallery` - Full image gallery

## Building for Production

```bash
npm run build
```

For static export (GitHub Pages):
```bash
npm run export
```

## Image Setup

You need to copy your images to `public/images/`. The expected structure is:

```
public/images/
├── bluemind-logo.webp
├── bluemind-light.png
├── banner-img.webp
├── BMF-founders.webp
├── hakim.webp
├── dewi.webp
├── contact.webp
└── gallery/
    ├── 1.webp
    ├── 2.webp
    └── ... (all gallery images)
```
