export function drawVerticalSlitScanToCanvas({
  src,
  target,
  sliceSize,
  isReflected,
  drawSlice,
  sliceStartPos,
}) {
  const ctx = target.getContext("2d");

  const srcSectionH = sliceStartPos * src.height;
  const scale = target.width / src.width;
  const targSectionH = srcSectionH * scale;

  drawLiveWebcamSection({
    src,
    target,
    isReflected,
    srcSectionH,
    targSectionH,
  });

  if (!drawSlice) return;

  // draw the target image to itself
  const heightBeforeScan = targSectionH;
  const yToShiftDownFrom = heightBeforeScan - sliceSize;
  const heightToShiftDown = target.height - yToShiftDownFrom;
  const shiftToY = heightBeforeScan;

  ctx.drawImage(
    target,
    0,
    yToShiftDownFrom,
    target.width,
    heightToShiftDown,
    0,
    shiftToY,
    target.width,
    heightToShiftDown
  );
}

function drawLiveWebcamSection({
  target,
  src,
  isReflected,
  srcSectionH,
  targSectionH,
}) {
  const ctx = target.getContext("2d");

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

  // improve the colours by redrawing it
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

  // draw the left to the right, but flipped
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
