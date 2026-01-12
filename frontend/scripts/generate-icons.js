import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];
const iconDir = join(__dirname, '../public/icons');

// Create a beautiful Tranki icon
async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0A0A0A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1F2937;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
      <g transform="translate(${size * 0.2}, ${size * 0.25}) scale(${size / 100})">
        <!-- Lines representing transactions/data -->
        <path d="M0 15H50M0 30H40M0 45H30" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
        <!-- Checkmark circle - financial health indicator -->
        <circle cx="50" cy="45" r="12" fill="#10B981"/>
        <path d="M44 45L48 49L56 40" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(iconDir, `icon-${size}.png`));

  console.log(`Generated icon-${size}.png`);
}

// Generate apple touch icon (180x180)
async function generateAppleTouchIcon() {
  const size = 180;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0A0A0A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1F2937;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
      <g transform="translate(${size * 0.2}, ${size * 0.25}) scale(${size / 100})">
        <path d="M0 15H50M0 30H40M0 45H30" stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
        <circle cx="50" cy="45" r="12" fill="#10B981"/>
        <path d="M44 45L48 49L56 40" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png()
    .toFile(join(iconDir, 'apple-touch-icon.png'));

  console.log('Generated apple-touch-icon.png');
}

async function main() {
  await mkdir(iconDir, { recursive: true });

  for (const size of sizes) {
    await generateIcon(size);
  }

  await generateAppleTouchIcon();

  console.log('All icons generated successfully!');
}

main().catch(console.error);
