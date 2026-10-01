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

function buildDormitorioMask() {
  const bmp = readBmp('/tmp/dormitorio_raw.bmp');
  const width = bmp.width;
  const height = bmp.height;
  const mask = new Float32Array(width * height);

  // Perspective ceiling line:
  // Starts around (108, 22) and ends at (736, 168)
  function getCeilingY(x: number): number {
    return 22 + ((x - 108) / (736 - 108)) * (168 - 22);
  }

  // Scan bed headboard & pillows contour from x=338 to 650:
  const rawBedY = new Int32Array(width);
  for (let x = 338; x <= 650; x++) {
    let top = 528;
    for (let y = 490; y <= 550; y++) {
      const p = bmp.getPixel(x, y);
      const lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
      if (lum > 185 || (p[0] < 125 && p[1] < 105)) {
        top = y;
        break;
      }
    }
    rawBedY[x] = top;
  }

  // Smooth bed curve
  const smoothBedY = new Int32Array(width);
  for (let x = 338; x <= 650; x++) {
    const vals = [];
    for (let dx = -4; dx <= 4; dx++) {
      const nx = Math.max(338, Math.min(650, x + dx));
      vals.push(rawBedY[nx]);
    }
    vals.sort((a, b) => a - b);
    smoothBedY[x] = vals[4];
  }

  for (let x = 108; x <= 736; x++) {
    const topY = Math.round(getCeilingY(x));
    let bottomY = 680; // baseboard baseline

    // Nightstand + lamp area: x in [180..338]
    if (x >= 180 && x <= 338) {
      bottomY = 644; // nightstand top
      // Lamp on nightstand: x in [204..268], lampshade starts at y=550
      if (x >= 204 && x <= 268) {
        bottomY = 550;
      }
    } else if (x >= 338 && x <= 650) {
      bottomY = smoothBedY[x];
    } else if (x > 650) {
      bottomY = 545; // Dresser on right
      // Vase with dried branches at x in [656..682] rising to y=462
      if (x >= 656 && x <= 682) {
        bottomY = 462;
      }
    }

    for (let y = topY; y < bottomY; y++) {
      // Exclude Left Pendant Lamp:
      // Hanging cord: x in [271..273], from topY down to 400
      if (Math.abs(x - 272) <= 1 && y <= 400) continue;
      // Wicker shade: x in [250..294], y in [400..472]
      if (x >= 250 && x <= 294 && y >= 400 && y <= 472) continue;

      // Exclude Right Pendant Lamp:
      // Hanging cord: x in [707..709], from topY down to 424
      if (Math.abs(x - 708) <= 1 && y <= 424) continue;
      // Wicker shade: x in [686..730], y in [424..476]
      if (x >= 686 && x <= 730 && y >= 424 && y <= 476) continue;

      // Exclude wall light switch: x in [675..688], y in [532..555]
      if (x >= 675 && x <= 688 && y >= 532 && y <= 555) continue;

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

  fs.writeFileSync('public/masks/mask-dormitorio.png', png);
  console.log('Regenerated smooth public/masks/mask-dormitorio.png');
}

buildDormitorioMask();
