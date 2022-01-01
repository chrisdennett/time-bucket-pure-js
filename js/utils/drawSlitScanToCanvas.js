export function drawSlitScanToCanvas({
  src,
  target,
  sliceWidth,
  isReflected,
  drawSlice,
  scanStartX,
}) {
  const ctx = target.getContext("2d");

  const widthBeforeScan = src.width * scanStartX;

  drawLiveWebcamSection({
    src,
    target,
    w: widthBeforeScan,
    isReflected,
  });

  if (!drawSlice) return;

  // draw the target image to itself
  const xToShiftRightFrom = widthBeforeScan - sliceWidth;
  const widthToShiftRight = target.width - xToShiftRightFrom;
  const shiftToX = widthBeforeScan;

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

function drawLiveWebcamSection({ target, src, w, isReflected }) {
  const ctx = target.getContext("2d");
  const h = src.height;

  // draw live webcam portion of screen
  ctx.drawImage(src, 0, 0, w, h, 0, 0, w, h);

  // improve the colours by redrawing it
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.7;
  ctx.drawImage(src, 0, 0, w, h, 0, 0, w, h);
  ctx.restore();

  // draw the top to the bottom, but flipped
  if (isReflected) {
    const halfH = h / 2;

    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(target, 0, 0, w, halfH, 0, halfH * -2, w, halfH);
    ctx.restore();
  }
}
