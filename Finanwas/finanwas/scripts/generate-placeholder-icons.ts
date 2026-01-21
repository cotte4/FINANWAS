/**
 * Generate placeholder PWA icons for Finanwas
 *
 * This script creates simple SVG-based placeholder icons that can be easily
 * replaced with actual brand assets later.
 *
 * Run: npx tsx scripts/generate-placeholder-icons.ts
 */

import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Brand colors
const PRIMARY_COLOR = '#000000';
const BG_COLOR = '#ffffff';
const ACCENT_COLOR = '#10b981'; // emerald-500

/**
 * Generate SVG icon with text
 */
function generateSVGIcon(size: number, text: string): string {
  const fontSize = Math.floor(size * 0.4);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${PRIMARY_COLOR}" rx="${size * 0.1}"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="${BG_COLOR}"
  >${text}</text>
  <circle cx="${size * 0.85}" cy="${size * 0.15}" r="${size * 0.08}" fill="${ACCENT_COLOR}"/>
</svg>`;
}

/**
 * Convert SVG to PNG using canvas (Node.js doesn't have canvas by default)
 * This is a placeholder - in production, use sharp or similar library
 */
function savePlaceholderIcon(filename: string, svg: string): void {
  const filepath = path.join(PUBLIC_DIR, filename);
  fs.writeFileSync(filepath, svg, 'utf-8');
  console.log(`✅ Generated: ${filename}`);
}

/**
 * Generate Open Graph image
 */
function generateOGImage(): string {
  const width = 1200;
  const height = 630;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PRIMARY_COLOR};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)"/>

  <!-- Title -->
  <text
    x="50%"
    y="45%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="120"
    font-weight="700"
    fill="${BG_COLOR}"
  >Finanwas</text>

  <!-- Subtitle -->
  <text
    x="50%"
    y="58%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="48"
    font-weight="400"
    fill="${ACCENT_COLOR}"
  >Tu camino hacia la libertad financiera</text>

  <!-- Decorative elements -->
  <circle cx="120" cy="120" r="60" fill="${ACCENT_COLOR}" opacity="0.3"/>
  <circle cx="${width - 120}" cy="${height - 120}" r="80" fill="${ACCENT_COLOR}" opacity="0.2"/>
</svg>`;
}

/**
 * Main function to generate all icons
 */
function generateIcons(): void {
  console.log('🎨 Generating placeholder PWA icons for Finanwas...\n');

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Generate app icons
  const icons = [
    { filename: 'icon-192.svg', size: 192, text: 'F' },
    { filename: 'icon-512.svg', size: 512, text: 'F' },
    { filename: 'apple-icon.svg', size: 180, text: 'F' },
  ];

  icons.forEach(({ filename, size, text }) => {
    const svg = generateSVGIcon(size, text);
    savePlaceholderIcon(filename, svg);
  });

  // Generate Open Graph image
  const ogSVG = generateOGImage();
  savePlaceholderIcon('og-image.svg', ogSVG);

  // Create instructions file
  const instructions = `# Placeholder Icons Generated

This directory now contains placeholder SVG icons that can be used for development.

## Files Generated:
- icon-192.svg (192x192) - PWA icon for Android
- icon-512.svg (512x512) - Large PWA icon for Android
- apple-icon.svg (180x180) - iOS home screen icon
- og-image.svg (1200x630) - Social media sharing image

## Next Steps:

### For Production:
1. Replace these placeholder SVGs with actual brand assets
2. Convert SVGs to PNG using a tool like:
   - https://cloudconvert.com/svg-to-png
   - ImageMagick: convert icon-192.svg icon.png
   - Sharp (npm package for Node.js)

3. Generate favicon.ico using:
   - https://realfavicongenerator.net/
   - https://favicon.io/

4. Update manifest.json to reference the new icon files

### Using These Placeholders:
These SVG icons can be used directly in modern browsers, but for best compatibility:
- Convert to PNG for PWA icons (Android, iOS)
- Create multi-size .ico for favicon
- Optimize PNGs with tools like TinyPNG or ImageOptim

## Icon Specifications:
- App icon: Simple "F" letter on black background with green accent dot
- OG image: "Finanwas" wordmark with subtitle and gradient background
- Colors: #000000 (primary), #10b981 (accent), #ffffff (text)
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'ICONS-PLACEHOLDER.md'), instructions, 'utf-8');
  console.log('✅ Generated: ICONS-PLACEHOLDER.md');

  console.log('\n✨ All placeholder icons generated successfully!');
  console.log('📝 See ICONS-PLACEHOLDER.md for next steps.');
  console.log('\n⚠️  Remember: These are placeholders. Replace with actual brand assets for production.\n');
}

// Run the script
generateIcons();
