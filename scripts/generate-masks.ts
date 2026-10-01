import fs from 'fs';
import zlib from 'zlib';

function createPng(width: number, height: number, getPixel: (x: number, y: number) => [number, number, number, number]): Buffer {
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // Filter: None
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
  ihdr[9] = 6; // RGBA
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

// Utility: smooth distance to polygon / rectangle for soft anti-aliasing
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// 1. MASK SALA (1376 x 768)
// Feature Left Wall + Center Column
function generateSalaMask() {
  const width = 1376;
  const height = 768;
  const png = createPng(width, height, (x, y) => {
    let alpha = 0;

    // A. Main Left Wall: x in [0..396]
    // Top bounded by wooden beams: below beam at y=190
    // Right bounded by black window frame: x=396
    // Bottom bounded by sofa:
    // Left of sofa (x < 88): down to baseboard y=668
    // Sofa backrest (x: 88..476): top curve from y=612 to y=620
    if (x >= 0 && x <= 396 && y >= 190 && y <= 668) {
      let wallBottom = 668;
      if (x >= 88) {
        // Sofa back cushion curve
        const sofaT = (x - 88) / (396 - 88);
        wallBottom = 612 + sofaT * 8; // gently rises/falls
      }

      if (y < wallBottom) {
        // Smooth edges
        const edgeX = Math.min(x, 396 - x);
        const edgeTop = y - 190;
        const edgeBottom = wallBottom - y;
        const dist = Math.min(edgeX, edgeTop, edgeBottom);
        alpha = clamp(dist / 2.0, 0, 1) * 255;
      }
    }

    // B. Center Column Wall (between window and balcony door)
    // x in [772..898], y in [238..605]
    if (x >= 772 && x <= 898 && y >= 238 && y <= 605) {
      // Exclude hanging artwork: x in [780..814], y in [385..445]
      const inArtwork = x >= 780 && x <= 814 && y >= 385 && y <= 445;
      if (!inArtwork) {
        const edgeX = Math.min(x - 772, 898 - x);
        const edgeY = Math.min(y - 238, 605 - y);
        const dist = Math.min(edgeX, edgeY);
        alpha = Math.max(alpha, clamp(dist / 2.0, 0, 1) * 255);
      }
    }

    // C. Wall strip right of balcony door
    // x in [1030..1092], y in [238..610]
    if (x >= 1030 && x <= 1092 && y >= 238 && y <= 610) {
      const edgeX = Math.min(x - 1030, 1092 - x);
      const edgeY = Math.min(y - 238, 610 - y);
      const dist = Math.min(edgeX, edgeY);
      alpha = Math.max(alpha, clamp(dist / 2.0, 0, 1) * 255);
    }

    const a = Math.round(alpha);
    return [255, 255, 255, a];
  });

  fs.writeFileSync('public/masks/mask-sala.png', png);
  console.log('Generated public/masks/mask-sala.png');
}

// 2. MASK DORMITORIO (1200 x 896)
// Accent Wall behind master bed
function generateDormitorioMask() {
  const width = 1200;
  const height = 896;
  const png = createPng(width, height, (x, y) => {
    let alpha = 0;

    // Main Headboard Wall: x in [108..736], y from ceiling [156] down to bed/nightstand
    if (x >= 108 && x <= 736 && y >= 156 && y <= 685) {
      let obstacle = false;

      // Pendant Lamp 1 (left): wire x=271..273, shade x=252..292, y=400..472
      if (x >= 252 && x <= 292 && y >= 400 && y <= 472) obstacle = true;
      if (Math.abs(x - 272) <= 1 && y >= 156 && y <= 400) obstacle = true;

      // Pendant Lamp 2 (right): wire x=707..709, shade x=688..728, y=424..476
      if (x >= 688 && x <= 728 && y >= 424 && y <= 476) obstacle = true;
      if (Math.abs(x - 708) <= 1 && y >= 156 && y <= 424) obstacle = true;

      // Nightstand + Table lamp (left): x in [180..338], y in [550..685]
      if (x >= 180 && x <= 338 && y >= 550) obstacle = true;

      // Bed Headboard + Pillows: x in [338..650], top around y=528
      if (x >= 338 && x <= 650 && y >= 528) obstacle = true;

      // Right wall baseboard / dresser: x in [650..736], y >= 640
      if (x >= 650 && x <= 736 && y >= 640) obstacle = true;

      if (!obstacle) {
        const edgeX = Math.min(x - 108, 736 - x);
        const edgeTop = y - 156;
        const dist = Math.min(edgeX, edgeTop);
        alpha = clamp(dist / 2.0, 0, 1) * 255;
      }
    }

    const a = Math.round(alpha);
    return [255, 255, 255, a];
  });

  fs.writeFileSync('public/masks/mask-dormitorio.png', png);
  console.log('Generated public/masks/mask-dormitorio.png');
}

// 3. MASK COMEDOR (1264 x 848)
// Dining Area Feature Wall
function generateComedorMask() {
  const width = 1264;
  const height = 848;
  const png = createPng(width, height, (x, y) => {
    let alpha = 0;

    // Feature wall behind dining table: x in [885..1264]
    // Top is ceiling line from (885, 242) to (1264, 180)
    if (x >= 885 && x <= 1264) {
      const topY = 242 + ((x - 885) / (1264 - 885)) * (180 - 242);
      const bottomY = 680;

      if (y >= topY && y <= bottomY) {
        let obstacle = false;

        // Picture 1: x in [980..1060], y in [370..480]
        if (x >= 980 && x <= 1060 && y >= 370 && y <= 480) obstacle = true;

        // Picture 2: x in [1085..1180], y in [355..480]
        if (x >= 1085 && x <= 1180 && y >= 355 && y <= 480) obstacle = true;

        // Dining chairs & table in foreground: x in [885..1264], y >= 550
        if (y >= 550) obstacle = true;

        // Pendant light shade: x in [885..915], y in [340..410]
        if (x >= 885 && x <= 915 && y >= 340 && y <= 410) obstacle = true;

        if (!obstacle) {
          const edgeX = Math.min(x - 885, 1264 - x);
          const edgeTop = y - topY;
          const edgeBottom = 550 - y;
          const dist = Math.min(edgeX, edgeTop, edgeBottom);
          alpha = clamp(dist / 2.0, 0, 1) * 255;
        }
      }
    }

    // Left wall section: x in [0..180], y in [200..570]
    if (x >= 0 && x <= 180 && y >= 200 && y <= 570) {
      const edgeX = Math.min(x, 180 - x);
      const edgeTop = y - 200;
      const edgeBottom = 570 - y;
      const dist = Math.min(edgeX, edgeTop, edgeBottom);
      alpha = Math.max(alpha, clamp(dist / 2.0, 0, 1) * 255);
    }

    const a = Math.round(alpha);
    return [255, 255, 255, a];
  });

  fs.writeFileSync('public/masks/mask-comedor.png', png);
  console.log('Generated public/masks/mask-comedor.png');
}

// 4. MASK OFICINA (1200 x 896)
function generateOficinaMask() {
  const width = 1200;
  const height = 896;
  const png = createPng(width, height, (x, y) => {
    let alpha = 0;

    // Focal Wall: x in [415..1080], y in [140..780]
    if (x >= 415 && x <= 1080 && y >= 140 && y <= 780) {
      let obstacle = false;

      // Picture frame: x in [815..995], y in [325..560]
      if (x >= 815 && x <= 995 && y >= 325 && y <= 560) obstacle = true;

      // Desk & lamp: x in [415..600], y >= 500
      if (x >= 415 && x <= 600 && y >= 500) obstacle = true;

      // Chair back: x in [500..750], y >= 650
      if (x >= 500 && x <= 750 && y >= 650) obstacle = true;

      // Shelving on right: x >= 1060
      if (x >= 1060) obstacle = true;

      if (!obstacle) {
        const edgeX = Math.min(x - 415, 1080 - x);
        const edgeTop = y - 140;
        const dist = Math.min(edgeX, edgeTop);
        alpha = clamp(dist / 2.0, 0, 1) * 255;
      }
    }

    const a = Math.round(alpha);
    return [255, 255, 255, a];
  });

  fs.writeFileSync('public/masks/mask-oficina.png', png);
  console.log('Generated public/masks/mask-oficina.png');
}

generateSalaMask();
generateDormitorioMask();
generateComedorMask();
generateOficinaMask();
console.log('All masks generated successfully!');
