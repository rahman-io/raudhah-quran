export type WritingStroke = {
  id: number;
  points: { x: number; y: number }[];
  width: number;
};

export type WritingAssessment = {
  score: number;
  coverage: number;
  precision: number;
  marksCoverage: number | null;
  isCorrect: boolean;
};

export const WRITING_WIDTH = 640;
export const WRITING_HEIGHT = 320;

export function drawWritingPattern(context: CanvasRenderingContext2D, arabic: string, size: number) {
  context.font = `${size}px Amiri, "Scheherazade New", serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.direction = 'rtl';
  context.fillText(arabic, WRITING_WIDTH / 2, WRITING_HEIGHT / 2);
}

function inkBounds(pixels: Uint8ClampedArray, width: number, height: number) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] <= 64) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  return right < left ? null : { left, top, right, bottom };
}

function nearby(mask: Uint8Array, width: number, height: number, radius: number) {
  const result = new Uint8Array(mask.length);
  const offsets: { x: number; y: number }[] = [];
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius) offsets.push({ x, y });
    }
  }
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const cx = i % width;
    const cy = Math.floor(i / width);
    for (const { x, y } of offsets) {
      const px = cx + x;
      const py = cy + y;
      if (px >= 0 && py >= 0 && px < width && py < height) result[py * width + px] = 1;
    }
  }
  return result;
}

export function assessWriting(arabic: string, size: number, strokes: WritingStroke[], alignHandwriting = false): WritingAssessment {
  const width = WRITING_WIDTH / 2;
  const height = WRITING_HEIGHT / 2;
  const reference = document.createElement('canvas');
  const handwriting = document.createElement('canvas');
  reference.width = handwriting.width = width;
  reference.height = handwriting.height = height;
  const referenceContext = reference.getContext('2d');
  const inkContext = handwriting.getContext('2d');
  if (!referenceContext || !inkContext) return { score: 0, coverage: 0, precision: 0, marksCoverage: null, isCorrect: false };

  referenceContext.scale(0.5, 0.5);
  drawWritingPattern(referenceContext, arabic, size);
  inkContext.scale(0.5, 0.5);
  inkContext.strokeStyle = '#000';
  inkContext.fillStyle = '#000';
  inkContext.lineCap = 'round';
  inkContext.lineJoin = 'round';
  for (const stroke of strokes) {
    if (!stroke.points.length) continue;
    inkContext.lineWidth = stroke.width;
    inkContext.beginPath();
    inkContext.moveTo(stroke.points[0].x, stroke.points[0].y);
    if (stroke.points.length === 1) {
      inkContext.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
      inkContext.fill();
    } else {
      for (const point of stroke.points.slice(1)) inkContext.lineTo(point.x, point.y);
      inkContext.stroke();
    }
  }

  const referencePixels = referenceContext.getImageData(0, 0, width, height).data;
  let inkPixels = inkContext.getImageData(0, 0, width, height).data;
  if (alignHandwriting) {
    const target = inkBounds(referencePixels, width, height);
    const drawn = inkBounds(inkPixels, width, height);
    if (target && drawn) {
      const targetWidth = target.right - target.left + 1;
      const targetHeight = target.bottom - target.top + 1;
      const drawnWidth = drawn.right - drawn.left + 1;
      const drawnHeight = drawn.bottom - drawn.top + 1;
      const scale = Math.max(0.5, Math.min(2, targetWidth / drawnWidth, targetHeight / drawnHeight));
      const x = (target.left + target.right) / 2 - (drawn.left + drawn.right) * scale / 2;
      const y = (target.top + target.bottom) / 2 - (drawn.top + drawn.bottom) * scale / 2;
      const aligned = document.createElement('canvas');
      aligned.width = width;
      aligned.height = height;
      const alignedContext = aligned.getContext('2d');
      if (alignedContext) {
        alignedContext.drawImage(handwriting, x, y, width * scale, height * scale);
        inkPixels = alignedContext.getImageData(0, 0, width, height).data;
      }
    }
  }
  const patternMask = new Uint8Array(width * height);
  const inkMask = new Uint8Array(width * height);
  for (let i = 0; i < patternMask.length; i++) {
    patternMask[i] = referencePixels[i * 4 + 3] > 64 ? 1 : 0;
    inkMask[i] = inkPixels[i * 4 + 3] > 64 ? 1 : 0;
  }
  // Seven half-resolution pixels allow for natural variation in a finger or pen stroke.
  const nearPattern = nearby(patternMask, width, height, 7);
  const nearInk = nearby(inkMask, width, height, 7);
  let patternCount = 0;
  let inkCount = 0;
  let covered = 0;
  let accurate = 0;
  for (let i = 0; i < patternMask.length; i++) {
    if (patternMask[i]) {
      patternCount++;
      if (nearInk[i]) covered++;
    }
    if (inkMask[i]) {
      inkCount++;
      if (nearPattern[i]) accurate++;
    }
  }
  const coverage = patternCount ? covered / patternCount : 0;
  const precision = inkCount ? accurate / inkCount : 0;
  let marksCoverage: number | null = null;
  const plainLetters = arabic.replace(/[\u064B-\u065F\u0670]/g, '');
  if (plainLetters !== arabic) {
    const plainCanvas = document.createElement('canvas');
    plainCanvas.width = width;
    plainCanvas.height = height;
    const plainContext = plainCanvas.getContext('2d');
    if (plainContext) {
      plainContext.scale(0.5, 0.5);
      drawWritingPattern(plainContext, plainLetters, size);
      const plainPixels = plainContext.getImageData(0, 0, width, height).data;
      const plainMask = new Uint8Array(width * height);
      for (let i = 0; i < plainMask.length; i++) plainMask[i] = plainPixels[i * 4 + 3] > 64 ? 1 : 0;
      const nearPlain = nearby(plainMask, width, height, 2);
      const nearMarkInk = nearby(inkMask, width, height, 3);
      let marks = 0;
      let tracedMarks = 0;
      for (let i = 0; i < patternMask.length; i++) {
        if (!patternMask[i] || nearPlain[i]) continue;
        marks++;
        if (nearMarkInk[i]) tracedMarks++;
      }
      if (marks) marksCoverage = tracedMarks / marks;
    }
  }
  const score = Math.round(100 * (marksCoverage === null
    ? (coverage + precision) / 2
    : coverage * 0.4 + precision * 0.35 + marksCoverage * 0.25));
  return {
    score,
    coverage,
    precision,
    marksCoverage,
    isCorrect: coverage >= 0.72 && precision >= 0.65 && (marksCoverage === null || marksCoverage >= 0.55) && score >= 72
  };
}
