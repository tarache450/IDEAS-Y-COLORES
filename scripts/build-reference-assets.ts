import fs from 'fs';
import zlib from 'zlib';

function createPng(
  width: number,
  height: number,
  getPixel: (x: number, y: number) => [number, number, number, number]
): Buffer {
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });

  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function readBmp(path: string) {
  const buf = fs.readFileSync(path);
  const width = buf.readInt32LE(18);
  const heightRaw = buf.readInt32LE(22);
  const height = Math.abs(heightRaw);
  const bpp = buf.readUInt16LE(28);
  const offset = buf.readUInt32LE(10);
  const rowSize = Math.floor((bpp * width + 31) / 32) * 4;

  return {
    width,
    height,
    getPixel(x: number, y: number): [number, number, number] {
      if (x < 0 || x >= width || y < 0 || y >= height) return [0, 0, 0];
      const row = heightRaw > 0 ? height - 1 - y : y;
      const idx = offset + row * rowSize + x * (bpp / 8);
      return [buf[idx + 2], buf[idx + 1], buf[idx]];
    },
  };
}

function buildPristineReferenceAssets() {
  const bmp = readBmp('/tmp/ref_sala.bmp');
  const width = bmp.width;
  const height = bmp.height;

  // 1. Build the precise, continuous mathematical contour of the sofa top
  // sofaY(x) returns the y-coordinate where the sofa/pillow meets the wall
  const sofaY = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    if (x < 165) {
      sofaY[x] = 0;
    } else if (x <= 185) {
      // Smooth curve from left corner down to pillow ridge
      const t = (x - 165) / 20;
      sofaY[x] = 484 - t * 11; // 484 -> 473
    } else if (x <= 295) {
      // Light gray cushion top ridge (subtle natural arch)
      const t = (x - 185) / 110;
      sofaY[x] = 473 + Math.sin(t * Math.PI) * 4; // 473 -> 477 -> 473
    } else if (x <= 313) {
      // Smooth descent between cushion and sofa backrest
      const t = (x - 295) / 18;
      // Hermite smoothstep interpolation
      const s = t * t * (3 - 2 * t);
      sofaY[x] = 473 + s * (511 - 473); // 473 -> 511
    } else if (x <= 395) {
      // Sofa backrest top horizontal seam
      sofaY[x] = 511;
    } else if (x <= 406) {
      // Sofa backrest curves down towards floor
      const t = (x - 395) / 11;
      const s = t * t * (3 - 2 * t);
      sofaY[x] = 511 + s * (585 - 511); // 511 -> 585
    } else {
      sofaY[x] = 585;
    }
  }

  // 2. Initial binary mask grid
  const rawMask = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Wall outer boundary checks:
      // Left pillar corner: x = 165
      // Right window frame: x = 989
      // Top ceiling beam: y = 74
      // Floor: y = 585
      if (x < 165 || x > 989 || y < 74 || y > 585) {
        rawMask[y * width + x] = 0;
        continue;
      }

      // Sofa area:
      if (x <= 406 && y >= sofaY[x]) {
        rawMask[y * width + x] = 0;
        continue;
      }

      // Coffee table top & items:
      // Table top surface is at y >= 575 for x in [565..850]
      if (x >= 565 && x <= 850 && y >= 575) {
        rawMask[y * width + x] = 0;
        continue;
      }

      // Ceramic vase: x in [615..668], y in [480..575]
      if (x >= 615 && x <= 668 && y >= 480 && y <= 575) {
        const p = bmp.getPixel(x, y);
        const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
        // Vase body or shadow:
        if (lum < 155 || lum > 218 || Math.abs(p[0] - p[2]) > 20) {
          rawMask[y * width + x] = 0;
          continue;
        }
      }

      // Dried branches and stems: x in [580..720], y in [445..510]
      if (x >= 580 && x <= 720 && y >= 445 && y <= 510) {
        const p = bmp.getPixel(x, y);
        const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
        // Only dark stems or distinct brown/green leaves:
        if (lum < 150 || (p[0] < 150 && lum < 160)) {
          rawMask[y * width + x] = 0;
          continue;
        }
      }

      // Books on table: x in [700..775], y in [545..575]
      if (x >= 700 && x <= 775 && y >= 545 && y <= 575) {
        const p = bmp.getPixel(x, y);
        const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
        if (lum > 214 || lum < 140) {
          rawMask[y * width + x] = 0;
          continue;
        }
      }

      rawMask[y * width + x] = 1.0;
    }
  }

  // 3. Sub-pixel Gaussian Anti-Aliasing (Smoothing edges for photorealistic blending)
  // 5x5 binomial separable filter: [1, 4, 6, 4, 1] / 16
  const kernel = [1 / 16, 4 / 16, 6 / 16, 4 / 16, 1 / 16];
  const temp = new Float32Array(width * height);
  const smoothMask = new Float32Array(width * height);

  // Horizontal blur pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -2; k <= 2; k++) {
        const nx = Math.max(0, Math.min(width - 1, x + k));
        sum += rawMask[rowOffset + nx] * kernel[k + 2];
      }
      temp[rowOffset + x] = sum;
    }
  }

  // Vertical blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -2; k <= 2; k++) {
        const ny = Math.max(0, Math.min(height - 1, y + k));
        sum += temp[ny * width + x] * kernel[k + 2];
      }
      smoothMask[y * width + x] = sum;
    }
  }

  // 4. GENERATE WALL MASK (Layer 2)
  const maskPng = createPng(width, height, (x, y) => {
    const alpha = smoothMask[y * width + x];
    const a = Math.max(0, Math.min(255, Math.round(alpha * 255)));
    return [255, 255, 255, a];
  });
  fs.writeFileSync('public/masks/mask-sala-principal.png', maskPng);
  console.log('Saved public/masks/mask-sala-principal.png');

  // 5. GENERATE FOREGROUND LAYER (Layer 3)
  // Perfectly conservative: fgAlpha = 255 - maskAlpha
  const fgPng = createPng(width, height, (x, y) => {
    const alpha = smoothMask[y * width + x];
    const fgAlpha = Math.max(0, Math.min(255, 255 - Math.round(alpha * 255)));
    if (fgAlpha === 0) {
      return [0, 0, 0, 0];
    }
    const p = bmp.getPixel(x, y);
    return [p[0], p[1], p[2], fgAlpha];
  });
  fs.writeFileSync('public/studio/sala-principal-fg.png', fgPng);
  console.log('Saved public/studio/sala-principal-fg.png');
}

buildPristineReferenceAssets();
