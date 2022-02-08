export function drawRoundSlitScanToCanvas({ src, target, drawSlice, params }) {
  const { scanStartPos, isReflected, sliceSize } = params;
  const sliceSizeInt = parseInt(sliceSize.value);

  const srcSectionH = scanStartPos.value * src.height;
  const scale = target.width / src.width;
  const liveWebcamSectionH = srcSectionH * scale;

  drawLiveWebcamSectionInMiddle({
    src,
    target,
    isReflected: isReflected.value,
    srcSectionH,
    liveWebcamSectionH,
    sliceSize: sliceSizeInt,
    drawSlice,
  });
}

function drawLiveWebcamSectionInMiddle({
  target,
  src,
  srcSectionH,
  sliceSize,
  drawSlice,
}) {
  const ctx = target.getContext("2d");

  // remove from top and bottom when cropping source
  const srcMiddle = src.height / 2;
  const halfSrcSection = srcSectionH / 2;
  const srcY = srcMiddle - halfSrcSection;

  // draw live webcam portion of screen
  const source = {
    x: 0,
    y: srcY,
    w: src.width,
    h: srcSectionH,
  };

  if (drawSlice) {
    // draw the dest to itself 2 pixel wider and higher offset by one pixel each way
    ctx.drawImage(
      target,
      0,
      0,
      target.width,
      target.height,
      -sliceSize,
      -sliceSize,
      target.width + sliceSize + sliceSize,
      target.height + sliceSize + sliceSize
    );
  }

  const centerX = target.width / 2;
  const centerY = target.height / 2;

  const outputRadius = 100;
  const hToWRatio = src.width / src.height;
  const outputHeight = outputRadius * 2;
  const outputWidth = outputHeight * hToWRatio;

  ctx.save();
  ctx.beginPath();
  ctx.translate(centerX, centerY);
  const rot = (2 * Math.PI) / 16;
  ctx.rotate(rot);
  regPolyPath(outputRadius, 8, ctx);
  ctx.rotate(-rot);
  ctx.clip();

  ctx.drawImage(
    src,
    source.x,
    source.y,
    source.w,
    source.h,
    -outputWidth / 2,
    -outputHeight / 2,
    outputWidth,
    outputHeight
  );
  ctx.restore();
}

// https://stackoverflow.com/questions/4839993/how-to-draw-polygons-on-an-html5-canvas
function regPolyPath(r, p, ctx) {
  //Radius, #points, context
  //Azurethi was here!
  const rot = (2 * Math.PI) / p;

  ctx.moveTo(r, 0);
  for (let i = 0; i < p + 1; i++) {
    ctx.rotate(rot);
    ctx.lineTo(r, 0);
  }
  ctx.rotate((-2 * Math.PI) / p);
}
