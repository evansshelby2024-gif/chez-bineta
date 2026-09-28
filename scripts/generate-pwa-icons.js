import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImg = path.resolve('public/images/chez_bineta_modern_logo.jpg');
const publicDir = path.resolve('public');

async function generateIcons() {
  console.log('Generating PWA icons from:', sourceImg);

  // 1. 192x192 PNG
  await sharp(sourceImg)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Created pwa-192x192.png');

  // 2. 512x512 PNG
  await sharp(sourceImg)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ Created pwa-512x512.png');

  // 3. 512x512 Maskable PNG with 15% safe padding
  // Maskable icons on Android need safe-zone padding so the outer circle/squircle doesn't cut the content
  const innerSize = Math.round(512 * 0.76); // ~390px
  const padding = Math.round((512 - innerSize) / 2); // ~61px
  const resizedInner = await sharp(sourceImg)
    .resize(innerSize, innerSize, { fit: 'cover' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 249, g: 115, b: 22, alpha: 1 }, // Orange brand theme (#f97316)
    },
  })
    .composite([{ input: resizedInner, top: padding, left: padding }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ Created pwa-maskable-512x512.png (with safe-zone padding)');

  // 4. Apple Touch Icon 180x180 PNG
  await sharp(sourceImg)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // 5. SVG Icon for desktop browser tabs
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#grad)"/>
  <circle cx="256" cy="256" r="190" fill="#ffffff" opacity="0.15"/>
  <text x="50%" y="45%" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="140" fill="#ffffff" dy=".3em">CB</text>
  <text x="50%" y="74%" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="44" fill="#ffffff" letter-spacing="4">CHEZ BINETA</text>
  <text x="50%" y="86%" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="28" fill="#fef08a" letter-spacing="2">SAINT-LOUIS</text>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('✓ Created icon.svg');

  // 6. Favicon 64x64 PNG as favicon.ico
  await sharp(sourceImg)
    .resize(64, 64, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created favicon.ico');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
