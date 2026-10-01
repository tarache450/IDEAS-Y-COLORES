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

function buildComedorMask() {
  const bmp = readBmp('/tmp/comedor_raw.bmp');
  const width = bmp.width;
  const height = bmp.height;
  const mask = new Float32Array(width * height);

  // Trace ceiling line across right wall (x: 885..1264):
  // At x=885, y ≈ 246; at x=1264, y ≈ 182
  function getCeilingY(x: number): number {
    return 246 + ((x - 885) / (1264 - 885)) * (182 - 246);
  }

  // Trace chairs / table top edge for each x in [885..1264]:
  // Scan down from y=400 to find top of chairs/table
  const obstaclesY = new Int32Array(width);
  for (let x = 885; x < width; x++) {
    let topObs = 680; // default baseboard floor
    for (let y = 430; y <= 680; y++) {
      const p = bmp.getPixel(x, y);
      // Wall is textured grey: r: 155-195, g: 145-185, b: 125-165
      // Chairs are wood/beige fabric, table is wood:
      // Chair wood frame / upholstery has high contrast or specific hue:
      const isWall = p[0] >= 145 && p[0] <= 200 && p[1] >= 135 && p[1] <= 190 && p[2] >= 115 && p[2] <= 170 && Math.abs(p[0] - p[1]) < 22;
      if (!isWall && y > 450) {
        topObs = y;
        break;
      }
    }
    obstaclesY[x] = topObs;
  }

  // Smooth the chair boundary to eliminate noise
  const smoothObstaclesY = new Int32Array(width);
  for (let x = 885; x < width; x++) {
    const vals = [];
    for (let dx = -4; dx <= 4; dx++) {
      const nx = Math.max(885, Math.min(width - 1, x + dx));
      vals.push(obstaclesY[nx]);
    }
    vals.sort((a, b) => a - b);
    smoothObstaclesY[x] = vals[4];
  }

  // Fill right feature wall:
  for (let x = 890; x < width; x++) {
    const topY = Math.round(getCeilingY(x));
    const bottomY = smoothObstaclesY[x];

    for (let y = topY; y < bottomY; y++) {
      // Exclude Picture 1: x in [995..1068], y in [315..415]
      if (x >= 995 && x <= 1068 && y >= 315 && y <= 415) continue;

      // Exclude Picture 2: x in [1100..1175], y in [305..408]
      if (x >= 1100 && x <= 1175 && y >= 305 && y <= 408) continue;

      // Exclude Hanging Pendant Lamp:
      // Cord: x around 944..946, y from topY to 320
      if (Math.abs(x - 945) <= 1 && y <= 325) continue;
      // Shade: x in [918..972], y in [320..352]
      if (x >= 918 && x <= 972 && y >= 320 && y <= 352) continue;

      // Exclude Track light on ceiling: y <= topY + 4
      if (y <= topY + 4) continue;

      // Exclude curtain edge on left: x in [890..898] if darker
      const p = bmp.getPixel(x, y);
      if (x < 905 && p[0] < 140) continue;

      mask[y * width + x] = 1.0;
    }
  }

  // Generate PNG with smooth anti-aliased edges
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

  fs.writeFileSync('public/masks/mask-comedor.png', png);
  console.log('Built public/masks/mask-comedor.png with exact perspective and cutouts');
}

buildComedorMask();
