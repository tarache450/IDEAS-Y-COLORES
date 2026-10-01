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

function buildSalaMask() {
  const bmp = readBmp('/tmp/sala_raw.bmp');
  const width = bmp.width;
  const height = bmp.height;
  const mask = new Float32Array(width * height);

  // 1. Detect raw sofa boundary for each x in [0..394]
  const rawSofa = new Int32Array(395);
  for (let x = 0; x <= 394; x++) {
    let bottomY = 668; // baseboard baseline
    if (x >= 76) {
      for (let y = 460; y <= 668; y++) {
        const p = bmp.getPixel(x, y);
        const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
        if (lum < 152 || (p[0] < 160 && p[1] < 155)) {
          bottomY = y;
          break;
        }
      }
    }
    rawSofa[x] = bottomY;
  }

  // Median / smoothing filter on sofa boundary (radius 3)
  const smoothSofa = new Int32Array(395);
  for (let x = 0; x <= 394; x++) {
    const vals = [];
    for (let dx = -3; dx <= 3; dx++) {
      const nx = Math.max(0, Math.min(394, x + dx));
      vals.push(rawSofa[nx]);
    }
    vals.sort((a, b) => a - b);
    smoothSofa[x] = vals[3];
  }

  // Beam line top
  function getBeamY(x: number): number {
    if (x < 200) {
      return 136 + (x / 200) * 4;
    } else {
      return 140 + ((x - 200) / 194) * 32;
    }
  }

  // Fill left feature wall:
  for (let x = 0; x <= 394; x++) {
    const topY = Math.round(getBeamY(x));
    const bottomY = smoothSofa[x];
    for (let y = topY; y < bottomY; y++) {
      // Exclude wall sconce at x: 350..372, y: 490..530
      if (x >= 350 && x <= 372 && y >= 490 && y <= 530) {
        const p = bmp.getPixel(x, y);
        if (p[0] < 135 || p[1] < 135) continue;
      }
      mask[y * width + x] = 1.0;
    }
  }

  // Fill center column cleanly (x: 774..894):
  // Top: beam line at y=238
  // Bottom: baseboard at y=598
  // Exclude framed painting: x in [774..814], y in [380..580]
  for (let x = 774; x <= 894; x++) {
    for (let y = 238; y <= 598; y++) {
      if (x <= 814 && y >= 380 && y <= 580) continue;
      // Exclude right door edge and reflections
      if (x >= 865 && y >= 480) continue;

      mask[y * width + x] = 1.0;
    }
  }

  // Soft anti-aliasing filter
  const png = createPng(width, height, (x, y) => {
    let sum = 0;
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          sum += mask[ny * width + nx];
          count++;
        }
      }
    }
    const alpha = Math.round((sum / count) * 255);
    return [255, 255, 255, alpha];
  });

  fs.writeFileSync('public/masks/mask-sala.png', png);
  console.log('Cleaned public/masks/mask-sala.png');
}

buildSalaMask();
