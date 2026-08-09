import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

function createIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });

  const cx = size / 2;
  const cy = size / 2;
  const rBg = size * 0.46;
  const rPlate = size * 0.32;
  const rInner = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark background #090d16
      let r = 9;
      let g = 13;
      let b = 22;
      let a = 255;

      if (isMaskable) {
        // Full bleed background for maskable
        r = 15;
        g = 23;
        b = 42;
      } else if (dist <= rBg) {
        // Rounded card effect
        r = 15;
        g = 23;
        b = 42;
      }

      // Outer ring gradient (Emerald)
      if (Math.abs(dist - rPlate) < size * 0.025) {
        r = 16;
        g = 185;
        b = 129;
      } else if (dist < rPlate && dist > rInner) {
        // Inner plate dish
        r = 15;
        g = 23;
        b = 42;
      } else if (Math.abs(dist - rInner) < size * 0.01) {
        // Inner dashed ring
        r = 5;
        g = 150;
        b = 105;
      }

      // Checkmark circle badge in bottom right of plate
      const cCheckX = cx;
      const cCheckY = cy + size * 0.1;
      const dCheck = Math.sqrt((x - cCheckX) ** 2 + (y - cCheckY) ** 2);
      const rCheck = size * 0.08;

      if (dCheck <= rCheck) {
        // Checkmark badge green
        r = 16;
        g = 185;
        b = 129;

        // Draw checkmark stroke in dark
        const relX = x - cCheckX;
        const relY = y - cCheckY;
        // Checkmark geometry roughly
        if (
          (relX >= -rCheck * 0.4 && relX <= -rCheck * 0.1 && Math.abs(relY - relX * 0.8 - rCheck * 0.1) < size * 0.015) ||
          (relX >= -rCheck * 0.1 && relX <= rCheck * 0.5 && Math.abs(relY + relX * 0.8) < size * 0.015)
        ) {
          r = 2;
          g = 6;
          b = 23;
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return png;
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA PNG icons...');

const icon192 = createIcon(192, false);
icon192.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-192.png')));

const icon512 = createIcon(512, false);
icon512.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-512.png')));

const mask192 = createIcon(192, true);
mask192.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-maskable-192.png')));

const mask512 = createIcon(512, true);
mask512.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-maskable-512.png')));

console.log('Successfully generated PWA PNG icons!');
