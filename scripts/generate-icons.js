// Minimal PNG generator without dependencies
import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // create rounded icon with circle background and checkmark hint
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const radius = width * 0.45;

      if (dist < radius) {
        // gradient from indigo (#4f46e5) to slate (#0f172a)
        const t = y / height;
        rawData[pixelOffset] = Math.round(15 * (1 - t) + 79 * t); // R
        rawData[pixelOffset + 1] = Math.round(23 * (1 - t) + 70 * t); // G
        rawData[pixelOffset + 2] = Math.round(42 * (1 - t) + 229 * t); // B
        rawData[pixelOffset + 3] = 255; // A

        // Draw an emerald checkmark
        const nx = x / width;
        const ny = y / height;
        // checkmark segment 1: from (0.35, 0.50) to (0.45, 0.60)
        // checkmark segment 2: from (0.45, 0.60) to (0.68, 0.38)
        const inSeg1 = Math.abs((ny - 0.50) - (nx - 0.35)) < 0.04 && nx >= 0.32 && nx <= 0.47;
        const inSeg2 = Math.abs((ny - 0.60) + (nx - 0.45)) < 0.04 && nx >= 0.43 && nx <= 0.70;
        if (inSeg1 || inSeg2) {
          rawData[pixelOffset] = 16; // 16
          rawData[pixelOffset + 1] = 185; // 185
          rawData[pixelOffset + 2] = 129; // 129
          rawData[pixelOffset + 3] = 255;
        }
      } else {
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate files
const sizes = [
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/pwa-maskable-512x512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/favicon.ico', size: 32 },
];

for (const { file, size } of sizes) {
  const png = createPNG(size, size);
  fs.writeFileSync(file, png);
  console.log(`Generated ${file} (${size}x${size})`);
}
