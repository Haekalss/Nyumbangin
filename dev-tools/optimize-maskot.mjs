/**
 * Generate aset maskot yang teroptimasi + blur placeholder.
 * Jalankan: node dev-tools/optimize-maskot.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'public', 'maskot.png');
const OUT = path.join(process.cwd(), 'public', 'maskot.png');
const BLUR_OUT = path.join(process.cwd(), 'src', 'components', 'landing', 'blur.js');

// Maskot dirender maksimal 192px -> sumber 384px (2x retina)
const TARGET = 384;

const original = fs.statSync(SRC).size;
const meta = await sharp(SRC).metadata();
console.log(`Sumber   : ${meta.width}x${meta.height} PNG, ${(original / 1024).toFixed(1)} KB`);

// 1) Resize + kompres PNG (palette true -> alpha aman, palette 8-bit)
const optimized = await sharp(SRC)
  .resize(TARGET, TARGET, { fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
  .toBuffer();

fs.writeFileSync(OUT, optimized);
console.log(`Output   : public/maskot.png, ${(optimized.length / 1024).toFixed(1)} KB`);

// 2) Placeholder blur: 16px + blur, base64 inline
const blurBuffer = await sharp(SRC)
  .resize(16, 16, { fit: 'inside' })
  .blur(1.2)
  .png({ compressionLevel: 9 })
  .toBuffer();
const blurDataUrl = `data:image/png;base64,${blurBuffer.toString('base64')}`;

const blurFile = `/**
 * Placeholder blur untuk gambar maskot.
 * Auto-generated oleh dev-tools/optimize-maskot.mjs
 * (16px PNG + blur, inline base64 -> tanpa request tambahan).
 */
export const MASKOT_BLUR =
  '${blurDataUrl}';
`;

fs.writeFileSync(BLUR_OUT, blurFile);
console.log(`Blur     : src/components/landing/blur.js (${blurDataUrl.length} chars)`);
console.log(`Hemat    : ${(original / 1024).toFixed(1)} KB -> ${(optimized.length / 1024).toFixed(1)} KB`);
