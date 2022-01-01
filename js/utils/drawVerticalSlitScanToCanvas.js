export function drawVerticalSlitScanToCanvas({
  src,
  target,
  sliceWidth,
  isReflected,
  drawSlice,
  scanStartX,
}) {
  const ctx = target.getContext("2d");

  const heightBeforeScan = src.height * scanStartX;

  drawLiveWebcamSection({
    src,
    target,
    hFrac: scanStartX,
    isReflected,
  });

  if (!drawSlice) return;

  // draw the target image to itself
  const xToShiftRightFrom = heightBeforeScan - sliceWidth;
  const widthToShiftRight = target.width - xToShiftRightFrom;
  const shiftToX = heightBeforeScan;

  ctx.drawImage(
    target,
    xToShiftRightFrom,
    0,
    widthToShiftRight,
    target.height,
    shiftToX,
    0,
    widthToShiftRight,
    target.height
  );
}

function drawLiveWebcamSection({ target, src, hFrac, isReflected }) {
  const ctx = target.getContext("2d");
  const srcSectionH = hFrac * src.height;
  const scale = target.width / src.width;
  const targSectionH = srcSectionH * scale;

  // draw live webcam portion of screen
  const source = { x: 0, y: 0, w: src.width, h: srcSectionH };
  const dest = { x: 0, y: 0, w: target.width, h: targSectionH };
  ctx.drawImage(
    src,
    source.x,
    source.y,
    source.w,
    source.h,
    dest.x,
    dest.y,
    dest.w,
    dest.h
  );

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.7;
  ctx.drawImage(
    src,
    source.x,
    source.y,
    source.w,
    source.h,
    dest.x,
    dest.y,
    dest.w,
    dest.h
  );
  ctx.restore();

  if (isReflected) {
    const halfW = dest.w / 2;

    ctx.save();
    ctx.translate(halfW * 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      target,
      dest.x,
      dest.y,
      dest.w / 2,
      dest.h,
      dest.x,
      dest.y,
      halfW,
      dest.h
    );
    ctx.restore();
  }
}
