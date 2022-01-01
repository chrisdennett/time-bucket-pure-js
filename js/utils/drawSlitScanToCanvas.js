export function drawSlitScanToCanvas({
  src,
  target,
  sliceSize,
  isReflected,
  drawSlice,
  sliceStartPos,
}) {
  const ctx = target.getContext("2d");

  const srcSectionW = sliceStartPos * src.width;
  const scale = target.height / src.height;
  const targSectionW = srcSectionW * scale;

  drawLiveWebcamSection({
    src,
    target,
    isReflected,
    srcSectionW,
    targSectionW,
  });

  if (!drawSlice) return;

  // draw the target image to itself
  const widthBeforeScan = targSectionW;
  const xToShiftRightFrom = widthBeforeScan - sliceSize;
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

function drawLiveWebcamSection({
  target,
  src,
  isReflected,
  srcSectionW,
  targSectionW,
}) {
  const ctx = target.getContext("2d");
  //   const h = src.height;

  // draw live webcam portion of screen
  const source = { x: 0, y: 0, w: srcSectionW, h: src.height };
  const dest = { x: 0, y: 0, w: targSectionW, h: target.height };
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

  // draw the top to the bottom, but flipped
  if (isReflected) {
    const halfH = dest.h / 2;

    ctx.save();
    ctx.translate(0, halfH * 2);
    ctx.scale(1, -1);
    ctx.drawImage(
      target,
      dest.x,
      dest.y,
      dest.w,
      dest.h / 2,
      dest.x,
      dest.y,
      dest.w,
      halfH
    );
    ctx.restore();
  }
}
