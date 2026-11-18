const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../public/logo.jpg');

async function generate() {
  if (!fs.existsSync(srcPath)) {
    console.log('Source logo not found at public/logo.jpg, skipping icon generation.');
    return;
  }

  const size = 512;
  const radius = 105; // standard ~20.5% app icon squircle radius
  const bgColor = { r: 1, g: 59, b: 61, alpha: 1 }; // #013b3d

  // 1. Resize original logo with safe margin padding (~51px all around)
  const logoContent = await sharp(srcPath)
    .resize(416, 406, { fit: 'contain', background: bgColor })
    .toBuffer();

  // 2. Base 512x512 canvas with bgColor
  const baseSquare = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bgColor,
    },
  })
    .composite([{ input: logoContent, gravity: 'center' }])
    .png()
    .toBuffer();

  // Full-bleed for Android maskable and iOS apple-touch-icon
  fs.writeFileSync(path.join(__dirname, '../public/icon-maskable-512.png'), baseSquare);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), await sharp(baseSquare).resize(180, 180).png().toBuffer());
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), await sharp(baseSquare).resize(180, 180).png().toBuffer());

  // 3. Rounded corners with subtle border
  const maskSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );

  const borderSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${radius}" ry="${radius}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4"/></svg>`
  );

  const roundedAppIcon = await sharp(baseSquare)
    .composite([
      { input: maskSvg, blend: 'dest-in' },
      { input: borderSvg, blend: 'over' },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(__dirname, '../public/logo.png'), roundedAppIcon);
  fs.writeFileSync(path.join(__dirname, '../public/logo-rounded.png'), roundedAppIcon);
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), roundedAppIcon);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), roundedAppIcon);
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), roundedAppIcon);
  fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), await sharp(roundedAppIcon).resize(192, 192).png().toBuffer());
  fs.writeFileSync(path.join(__dirname, '../public/favicon-32x32.png'), await sharp(roundedAppIcon).resize(32, 32).png().toBuffer());
  fs.writeFileSync(path.join(__dirname, '../public/favicon-16x16.png'), await sharp(roundedAppIcon).resize(16, 16).png().toBuffer());

  // 4. Generate multi-resolution ICO (16, 32, 48, 64)
  const icoSizes = [16, 32, 48, 64];
  const pngBuffers = [];
  for (const s of icoSizes) {
    const buf = await sharp(roundedAppIcon).resize(s, s).png().toBuffer();
    pngBuffers.push({ size: s, buffer: buf });
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = 6 + (16 * pngBuffers.length);
  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size, 0);
    entry.writeUInt8(item.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += item.buffer.length;
    dirEntries.push(entry);
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);

  console.log('Successfully generated all app icons & favicon.ico!');
}

generate().catch(console.error);
