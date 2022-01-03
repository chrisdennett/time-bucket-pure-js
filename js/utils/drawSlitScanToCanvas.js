export function drawSlitScanToCanvas({
  src,
  target,
  sliceSize,
  isReflected,
  drawSlice,
  allControls,
}) {
  const { webcamAtStart, scanStartPos } = allControls;

  const ctx = target.getContext("2d");

  const srcSectionW = scanStartPos.value * src.width;
  const scale = target.height / src.height;
  const targSectionW = srcSectionW * scale;

  webcamAtStart
    ? drawLiveWebcamSection({
        src,
        target,
        isReflected,
        srcSectionW,
        targSectionW,
      })
    : drawLiveWebcamSectionAtEnd({
        src,
        target,
        isReflected,
        srcSectionW,
        targSectionW,
      });

  if (!drawSlice) return;

  webcamAtStart
    ? drawSliceMovingRight({ ctx, target, targSectionW, sliceSize })
    : drawSliceMovingLeft({ ctx, target, targSectionW, sliceSize });
}

function drawSliceMovingRight({ ctx, target, targSectionW, sliceSize }) {
  const widthToShiftRight = target.width + targSectionW - sliceSize;

  const from = {
    x: targSectionW - sliceSize,
    y: 0,
    w: widthToShiftRight,
    h: target.height,
  };
  const to = {
    x: targSectionW,
    y: 0,
    w: widthToShiftRight,
    h: target.height,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
}

function drawSliceMovingLeft({ ctx, target, targSectionW, sliceSize }) {
  // TODO: Figure out why this works
  const widthToShiftLeft = target.width + (sliceSize - targSectionW);

  const from = {
    x: 0,
    y: 0,
    w: widthToShiftLeft,
    h: target.height,
  };
  const to = {
    x: -sliceSize,
    y: 0,
    w: widthToShiftLeft,
    h: target.height,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
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

function drawLiveWebcamSectionAtEnd({
  target,
  src,
  isReflected,
  srcSectionW,
  targSectionW,
}) {
  const ctx = target.getContext("2d");
  //   const h = src.height;

  // draw live webcam portion of screen
  const source = {
    x: src.width - srcSectionW,
    y: 0,
    w: srcSectionW,
    h: src.height,
  };
  const dest = {
    x: target.width - targSectionW,
    y: 0,
    w: targSectionW,
    h: target.height,
  };
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
