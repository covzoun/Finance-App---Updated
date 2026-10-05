import fs from 'fs';
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#2563eb" />
  <path d="M256 120v272M200 180h112M200 332h112M170 236c0-30 20-56 50-56h72c30 0 50 26 50 56s-20 56-50 56h-72c-30 0-50 26-50 56s20 56 50 56h72c30 0 50-26 50-56" stroke="#fff" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`;

const svgBuffer = Buffer.from(svg);

async function run() {
  if (!fs.existsSync('./public')) fs.mkdirSync('./public');
  
  await sharp(svgBuffer).resize(192, 192).png().toFile('./public/pwa-192x192.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile('./public/pwa-512x512.png');
  
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#2563eb" />
    <g transform="scale(0.7) translate(109, 109)">
      <path d="M256 120v272M200 180h112M200 332h112M170 236c0-30 20-56 50-56h72c30 0 50 26 50 56s-20 56-50 56h-72c-30 0-50 26-50 56s20 56 50 56h72c30 0 50-26 50-56" stroke="#fff" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </g>
  </svg>`;
  await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile('./public/pwa-maskable-512x512.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile('./public/apple-touch-icon.png');
  fs.writeFileSync('./public/icon.svg', svg);
}
run();
