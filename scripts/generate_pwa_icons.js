import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

function createIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });

  const cx = size / 2;
  const cy = size / 2;
  const rBg = size * 0.46;

  // Key coordinates
  const bowlRimY = cy - size * 0.08;
  const bowlRx = size * 0.225;
  const bowlRy = size * 0.05;
  const bowlMaxDepth = size * 0.24;

  const checkCx = cx + size * 0.14;
  const checkCy = cy - size * 0.15;
  const checkR = size * 0.08;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background - Navy `#0f172a`
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Dark card rounding for non-maskable
      if (!isMaskable && dist > rBg) {
        a = 0; // Transparent outside card
      } else {
        // Gradient fill `#1e293b` to `#0f172a`
        const gradT = (x + y) / (size * 2);
        r = Math.round(30 * (1 - gradT) + 15 * gradT);
        g = Math.round(41 * (1 - gradT) + 23 * gradT);
        b = Math.round(59 * (1 - gradT) + 42 * gradT);
      }

      // 1. Subtle Outer Tech Blue Ring
      const rRing = size * 0.33;
      if (Math.abs(dist - rRing) < size * 0.012 && a > 0) {
        r = 56;
        g = 189;
        b = 248; // #38bdf8
      }

      // 2. Food Bowl Body & Rim (Crisp White + Soft Blue-gray)
      // Check if inside bowl body (tapered semi-ellipse below rim)
      const dyBowl = y - bowlRimY;
      if (dyBowl >= 0 && dyBowl <= bowlMaxDepth) {
        const factor = 1 - Math.pow(dyBowl / bowlMaxDepth, 1.8);
        const currentRx = bowlRx * Math.max(0, factor);
        if (Math.abs(x - cx) <= currentRx) {
          r = 245;
          g = 247;
          b = 250; // White #f5f7fa
        }
      }

      // Bowl Rim (Top Ellipse stroke)
      const rimEq = Math.pow((x - cx) / bowlRx, 2) + Math.pow((y - bowlRimY) / bowlRy, 2);
      if (rimEq <= 1.2 && rimEq >= 0.7 && y <= bowlRimY + size * 0.02) {
        r = 255;
        g = 255;
        b = 255; // Crisp White Rim
      }

      // 3. Subtle Rupee Symbol (₹) inside bowl
      const rupX = x - cx;
      const rupY = y - (cy + size * 0.035);
      const strokeW = size * 0.018;

      // Top bar
      const isTopBar = Math.abs(rupY + size * 0.045) < strokeW && Math.abs(rupX) < size * 0.06;
      // Mid bar
      const isMidBar = Math.abs(rupY + size * 0.015) < strokeW && Math.abs(rupX) < size * 0.055;
      // Stem curve
      const isStem = Math.abs(rupX + size * 0.02) < strokeW && rupY >= -size * 0.045 && rupY <= size * 0.03;
      // Loop arc
      const isArc = Math.abs(Math.sqrt((rupX - size * 0.005) ** 2 + (rupY + size * 0.01) ** 2) - size * 0.03) < strokeW && rupX >= -size * 0.02;
      // Leg
      const legX = rupX - (rupY - size * 0.01) * 0.7;
      const isLeg = Math.abs(legX + size * 0.02) < strokeW && rupY >= size * 0.01 && rupY <= size * 0.07;

      if ((isTopBar || isMidBar || isStem || isArc || isLeg) && dyBowl >= 0 && dyBowl <= bowlMaxDepth) {
        r = 2;
        g = 132;
        b = 199; // Tech Blue #0284c7
      }

      // 4. Vibrant Green Checkmark Badge
      const dCheck = Math.sqrt((x - checkCx) ** 2 + (y - checkCy) ** 2);
      if (dCheck <= checkR) {
        r = 16;
        g = 185;
        b = 129; // Green #10b981

        // White Checkmark stroke
        const relX = x - checkCx;
        const relY = y - checkCy;
        const ckStroke = size * 0.016;

        // Checkmark arm 1: (-checkR*0.4, 0) to (0, checkR*0.3)
        const inArm1 = relX >= -checkR * 0.45 && relX <= 0 && Math.abs(relY - (relX * 0.7 + checkR * 0.2)) < ckStroke;
        // Checkmark arm 2: (0, checkR*0.3) to (checkR*0.45, -checkR*0.3)
        const inArm2 = relX >= 0 && relX <= checkR * 0.45 && Math.abs(relY - (-relX * 1.3 + checkR * 0.2)) < ckStroke;

        if (inArm1 || inArm2) {
          r = 255;
          g = 255;
          b = 255;
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

console.log('Generating new PWA PNG icons...');

const icon192 = createIcon(192, false);
icon192.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-192.png')));

const icon512 = createIcon(512, false);
icon512.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-512.png')));

const mask192 = createIcon(192, true);
mask192.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-maskable-192.png')));

const mask512 = createIcon(512, true);
mask512.pack().pipe(fs.createWriteStream(path.join(publicDir, 'pwa-maskable-512.png')));

console.log('Successfully generated new PWA PNG icons!');
