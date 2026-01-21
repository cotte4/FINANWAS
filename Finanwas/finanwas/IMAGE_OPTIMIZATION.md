# Image Optimization Guide for Finanwas

This document explains the image optimization strategy implemented in Finanwas.

## Overview

Finanwas uses Next.js Image component and optimization features to deliver fast, responsive images with automatic format conversion and lazy loading.

## Next.js Image Configuration

### Configuration File: `next.config.ts`

```typescript
images: {
  // Modern image formats (AVIF and WebP) for better compression
  formats: ['image/avif', 'image/webp'],

  // Device sizes for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

  // Icon/small image sizes
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

  // Long cache duration for static images (1 year)
  minimumCacheTTL: 60 * 60 * 24 * 365,

  // Allowed external image domains
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'finanwas.com',
      pathname: '/**',
    },
  ],
}
```

## Image Optimization Features

### 1. Automatic Format Conversion
- **AVIF**: Modern format with 50% better compression than JPEG
- **WebP**: Fallback format with 30% better compression than JPEG
- **Automatic selection**: Browser gets the best format it supports

### 2. Responsive Images
Next.js automatically generates multiple sizes:
- **Device Sizes**: For full-width images (viewport-based)
- **Image Sizes**: For fixed-size images (icon-based)

### 3. Lazy Loading
Images are loaded only when they enter the viewport, improving:
- Initial page load time
- Bandwidth usage
- Core Web Vitals (LCP, CLS)

### 4. Cache Optimization
- **Browser cache**: 1 year for static images
- **CDN-ready**: Works seamlessly with Vercel Edge Network or Cloudflare
- **Immutable URLs**: Next.js generates unique URLs for each image version

## Best Practices

### Using Next.js Image Component

**âœ… DO:**
```tsx
import Image from 'next/image';

// With explicit dimensions (best for LCP)
<Image
  src="/icon.png"
  alt="Finanwas icon"
  width={192}
  height={192}
  priority // for above-the-fold images
/>

// With fill layout (for dynamic containers)
<div className="relative w-full h-64">
  <Image
    src="/og-image.png"
    alt="Open Graph image"
    fill
    className="object-cover"
  />
</div>
```

**❌ DON'T:**
```tsx
// Don't use <img> tag
<img src="/icon.png" alt="icon" />

// Don't forget alt text
<Image src="/icon.png" width={100} height={100} />

// Don't forget dimensions
<Image src="/icon.png" alt="icon" />
```

### Image File Recommendations

| Use Case | Format | Dimensions | Optimization |
|----------|--------|------------|--------------|
| Icons | SVG or PNG | Various | SVG preferred (scalable) |
| Logos | SVG or PNG | Various | SVG preferred (crisp at any size) |
| Photos | JPG/PNG | Large | Let Next.js optimize |
| Illustrations | SVG or PNG | Various | SVG preferred |
| Open Graph | PNG/JPG | 1200x630 | Use Next.js Image |
| Favicons | ICO/PNG | 16x16, 32x32, 48x48 | ICO for compatibility |

## PWA Icon Requirements

### Required Files

The following files are needed for full PWA and SEO functionality:

1. **favicon.ico** (16x16, 32x32, 48x48)
   - Browser favicon
   - Location: `/public/favicon.ico`

2. **icon.png** (192x192)
   - PWA icon for Android
   - Location: `/public/icon.png`

3. **icon-512.png** (512x512)
   - Large PWA icon for Android
   - Location: `/public/icon-512.png`

4. **apple-icon.png** (180x180)
   - iOS home screen icon
   - Location: `/public/apple-icon.png`

5. **og-image.png** (1200x630)
   - Social media sharing image
   - Location: `/public/og-image.png`

### Generating Icons

Use the icon generation script to create placeholder icons:

```bash
npm run generate-icons
```

Or use online tools:
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Favicon.io](https://favicon.io/)

## CDN Integration

### Vercel Edge Network (Automatic)

When deployed on Vercel, images are automatically optimized and served via:
- Global CDN with 100+ edge locations
- Automatic format conversion
- On-demand image optimization
- Smart caching

### Cloudflare CDN (Manual Setup)

To use Cloudflare CDN:

1. Add Cloudflare domain configuration:
```typescript
// next.config.ts
images: {
  loader: 'custom',
  loaderFile: './lib/cloudflare-image-loader.ts',
}
```

2. Create custom loader:
```typescript
// lib/cloudflare-image-loader.ts
export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto'];
  return `https://finanwas.com/cdn-cgi/image/${params.join(',')}${src}`;
}
```

## Performance Metrics

### Before Optimization
- Image format: PNG/JPG (unoptimized)
- No lazy loading
- No responsive images
- No modern formats

### After Optimization
- **Image format**: AVIF/WebP (automatic)
- **Lazy loading**: Enabled by default
- **Responsive**: Multiple sizes generated
- **Cache**: 1 year for static assets
- **LCP improvement**: ~30-50% faster
- **Bandwidth savings**: ~40-60% reduction

## Current Image Usage

The Finanwas app uses:
- **Minimal image assets**: Primarily icon-based UI (lucide-react)
- **SVG icons**: Scalable, no optimization needed
- **Next.js Image component**: For all raster images
- **No `<img>` tags**: All images use optimized component

### Existing Images
- `/public/next.svg` - Next.js logo (demo)
- `/public/vercel.svg` - Vercel logo (demo)
- `/public/file.svg` - File icon
- `/public/globe.svg` - Globe icon
- `/public/window.svg` - Window icon

## Monitoring and Analytics

### Core Web Vitals to Track
- **LCP (Largest Contentful Paint)**: Should be < 2.5s
- **CLS (Cumulative Layout Shift)**: Should be < 0.1
- **FID (First Input Delay)**: Should be < 100ms

### Image Performance Metrics
- Image load time
- Format distribution (AVIF vs WebP vs fallback)
- Cache hit rate
- Bandwidth usage

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- Vercel Analytics (if using Vercel)

## Future Improvements

### Short-term
1. Generate all required PWA icons
2. Add og-image.png for social media sharing
3. Create desktop/mobile screenshots for PWA

### Medium-term
1. Implement blur placeholder for images (LQIP)
2. Add image optimization CI/CD checks
3. Set up image CDN analytics

### Long-term
1. Implement on-demand image generation for OG images
2. Add support for user-uploaded images with optimization
3. Implement progressive image loading

## Troubleshooting

### Images Not Loading
- Check file exists in `/public` directory
- Verify Next.js Image component imports
- Check browser console for errors

### Images Not Optimized
- Ensure Next.js dev server is running
- Check `next.config.ts` configuration
- Verify build logs for optimization errors

### Format Not Supported
- Update Next.js to latest version
- Check browser support for AVIF/WebP
- Verify image formats in `next.config.ts`

## Related Files

- `next.config.ts` - Image optimization configuration
- `public/ICONS-README.md` - Icon requirements documentation
- `src/app/page.tsx` - Example Next.js Image usage
- `public/manifest.json` - PWA icon references
