# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Senderos de Chiapas is a tourism website that has been migrated from a static HTML template to Next.js 14 with App Router. The project maintains the original template's design and JavaScript functionality while using React components and Next.js routing.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint
```

### Working with Git
Do not add any co-author line (e.g. Co-Authored-By) to commit messages. Commits should list only the human author.

## Architecture

### Migration Strategy
This codebase is a **partial migration** from HTML to Next.js. The original HTML template is preserved in `HTML Template/` for reference. Key architectural decisions:

1. **Script Loading Pattern**: The template relies heavily on jQuery and legacy JavaScript. Scripts are loaded sequentially in `components/Scripts.tsx` using a client-side `useEffect` hook to ensure proper dependency order. This pattern must be maintained when adding new pages.

2. **Client vs Server Components**: Most components are client components (`'use client'`) because they interact with jQuery-based plugins (Slick Slider, Magnific Popup, WOW.js animations). Header and Footer require client-side state for navigation interactions.

3. **Asset Management**: All static assets (CSS, JS, images, fonts) are located in `public/assets/` and referenced directly in the HTML `<head>` via `app/layout.tsx`. These are NOT imported as ES modules.

### Key Files and Patterns

**Layout System** (`app/layout.tsx`):
- Loads all CSS stylesheets directly in `<head>` (Bootstrap, Slick, Magnific Popup, etc.)
- Includes custom fonts (Google Fonts, Flaticon)
- Wraps all pages and includes the `Scripts` component

**Scripts Component** (`components/Scripts.tsx`):
- Loads jQuery and all vendor scripts sequentially
- Must be included at the end of `<body>` in layout
- Scripts load order is critical: jQuery → Popper → Bootstrap → plugins → theme.js

**Page Structure**:
- All pages follow the pattern: `<Header /> → content → <Footer />`
- Pages use Next.js `Link` for internal navigation
- External template features (sliders, popups, animations) are triggered via CSS classes, not React state

**Component Pattern**:
```tsx
'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PageName() {
  return (
    <>
      <Header />
      {/* Page content with template classes */}
      <Footer />
    </>
  )
}
```

### Path Aliases
The project uses `@/*` to reference root-level files:
```typescript
import Header from '@/components/Header'
import Scripts from '@/components/Scripts'
```

### Routing
Next.js App Router structure:
- `/` → `app/page.tsx`
- `/about` → `app/about/page.tsx`
- `/contact` → `app/contact/page.tsx`

Pages not yet migrated: tour, tour-details, destination, destination-details, blog-list, blog-details, gallery, events, shop, product-details

## Migration Guidelines

When creating new pages:

1. **Always use the client directive** (`'use client'`) for pages that use jQuery features
2. **Copy HTML structure** from corresponding files in `HTML Template/` directory
3. **Convert HTML elements**:
   - `<a href="/page">` → `<Link href="/page">`
   - Keep template CSS classes unchanged (e.g., `hero-section`, `main-btn primary-btn`)
4. **Preserve data attributes**: Many animations depend on `data-animation`, `data-delay`, etc.
5. **Include Header and Footer** components on every page
6. **Do not modify** the Scripts component load order unless absolutely necessary

### Image Handling
Currently, images use standard `<img>` tags with paths like `/assets/images/...`. The `next.config.js` has `unoptimized: true` set for images. When optimizing images:
- Import `next/image`
- Update image paths
- Add appropriate width/height attributes
- Test slider and gallery functionality after changes

## TypeScript Configuration

The project uses TypeScript with strict mode enabled. Key settings:
- Path alias: `@/*` maps to project root
- Target: ES5 for broad browser compatibility
- JSX: preserve (Next.js handles transformation)

## Styling

**Do not import CSS files in components.** All styles are loaded globally via `app/layout.tsx`:
- Bootstrap 5 framework
- Vendor stylesheets (slick, magnific-popup, jquery-ui, nice-select, animate.css)
- Custom styles: `default.css` and `style.css`
- Custom icon fonts: Flaticon and Font Awesome

Modifications to styles should be made directly in CSS files in `public/assets/css/`.

## Legacy Dependencies

This project intentionally uses legacy libraries to maintain the original template functionality:
- **jQuery 3.7.1**: Required by multiple plugins
- **Bootstrap 5**: Via vendor files, not npm package
- **Slick Slider**: For carousels
- **Magnific Popup**: For image galleries/lightboxes
- **WOW.js**: For scroll animations
- **jQuery UI**: For datepickers and UI elements
- **Nice Select**: For custom select dropdowns

**Do not attempt to replace these with React alternatives** without explicit approval, as this would require rewriting the entire template.

## Browser Compatibility

The template targets broad browser support (ES5 compilation). Test interactive features (sliders, popups, animations) after making changes to ensure jQuery plugins still function correctly.

## Future Migration Tasks

Reference `README.md` for the list of pages still needing migration. When planning large-scale refactoring (e.g., replacing jQuery with React hooks), discuss the approach first as it impacts the entire template.
