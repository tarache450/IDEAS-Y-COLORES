import fs from 'fs';
import zlib from 'zlib';

function createPng(width: number, height: number, getPixel: (x: number, y: number) => [number, number, number, number]): Buffer {
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
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function readBmp(path: string) {
  const buf = fs.readFileSync(path);
  const width = buf.readInt32LE(18);
  const height = buf.readInt32LE(22);
  const bpp = buf.readUInt16LE(28);
  const offset = buf.readUInt32LE(10);
  const rowSize = Math.floor((bpp * width + 31) / 32) * 4;

  return {
    width: Math.abs(width),
    height: Math.abs(height),
    getPixel(x: number, y: number): [number, number, number] {
      if (x < 0 || x >= Math.abs(width) || y < 0 || y >= Math.abs(height)) return [0, 0, 0];
      const row = height > 0 ? (height - 1 - y) : y;
      const idx = offset + row * rowSize + x * (bpp / 8);
      return [buf[idx + 2], buf[idx + 1], buf[idx]];
    }
  };
}

function buildPristineReferenceAssets() {
  const bmp = readBmp('/tmp/ref_sala.bmp');
  const width = bmp.width;
  const height = bmp.height;

  // 1. Precalculate sofa boundary contour for x in [160..425]:
  const sofaTopY = new Int32Array(width);
  for (let x = 160; x <= 425; x++) {
    let top = 582;
    for (let y = 460; y <= 585; y++) {
      const p = bmp.getPixel(x, y);
      const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
      const isPillow = (x >= 230 && x <= 320 && p[0] < 160) || (x < 240 && p[0] - p[2] > 28);
      const isSofaBack = (x > 320 && (p[0] < 168 || y >= 510 + ((x - 320) / (420 - 320)) * 75));
      if (isPillow || isSofaBack) {
        top = y;
        break;
      }
    }
    sofaTopY[x] = top;
  }

  // Smooth the sofa curve with median filter radius 3
  const smoothSofaY = new Int32Array(width);
  for (let x = 160; x <= 425; x++) {
    const vals = [];
    for (let dx = -3; dx <= 3; dx++) {
      const nx = Math.max(160, Math.min(425, x + dx));
      vals.push(sofaTopY[nx]);
    }
    vals.sort((a, b) => a - b);
    smoothSofaY[x] = vals[3];
  }

  // Function: is pixel (x, y) on the wall?
  function isWallPixel(x: number, y: number): boolean {
    // Wall bounds:
    // Left edge: x = 164
    // Right edge: x = 988
    // Top edge: y = 72
    // Bottom edge: y = 582
    if (x < 164 || x > 988 || y < 72 || y > 582) return false;

    // Sofa area on bottom-left:
    if (x <= 425) {
      if (y >= smoothSofaY[x]) return false;
    }

    // Vase & branches on coffee table: x in [560..735], y in [455..582]
    if (x >= 560 && x <= 735 && y >= 455 && y <= 582) {
      const p = bmp.getPixel(x, y);
      const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
      // Leaves and stems:
      if (lum < 162 || (p[1] > p[0] + 2)) return false;
      // Ceramic vase:
      if (x >= 620 && x <= 700 && y >= 530) {
        if (lum < 165 || p[0] > 190) return false;
      }
    }

    return true;
  }

  // 1. GENERATE WALL MASK (Layer 2)
  const maskPng = createPng(width, height, (x, y) => {
    if (isWallPixel(x, y)) {
      return [255, 255, 255, 255];
    } else {
      return [0, 0, 0, 0];
    }
  });
  fs.writeFileSync('public/masks/mask-sala-principal.png', maskPng);
  console.log('Saved public/masks/mask-sala-principal.png');

  // 2. GENERATE FOREGROUND LAYER (Layer 3)
  const fgPng = createPng(width, height, (x, y) => {
    if (!isWallPixel(x, y)) {
      const p = bmp.getPixel(x, y);
      return [p[0], p[1], p[2], 255];
    } else {
      return [0, 0, 0, 0];
    }
  });
  fs.writeFileSync('public/studio/sala-principal-fg.png', fgPng);
  console.log('Saved public/studio/sala-principal-fg.png');
}

buildPristineReferenceAssets();
