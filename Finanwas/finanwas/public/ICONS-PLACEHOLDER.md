# Placeholder Icons Generated

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
