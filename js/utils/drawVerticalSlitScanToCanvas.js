export function drawVerticalSlitScanToCanvas({
  src,
  target,
  drawSlice,
  params,
}) {
  const { webcamAtStart, scanStartPos, isReflected, sliceSize } = params;

  const ctx = target.getContext("2d");
  ctx.filter = "url(#turb)";

  const srcSectionH = scanStartPos.value * src.height;
  const scale = target.width / src.width;
  const targSectionH = srcSectionH * scale;

  webcamAtStart.value
    ? drawLiveWebcamSection({
        src,
        target,
        isReflected: isReflected.value,
        srcSectionH,
        targSectionH,
      })
    : drawLiveWebcamSectionAtEnd({
        src,
        target,
        isReflected: isReflected.value,
        srcSectionH,
        targSectionH,
      });

  if (!drawSlice) return;

  webcamAtStart.value
    ? drawSliceMovingDown({
        ctx,
        target,
        targSectionH,
        sliceSize: sliceSize.value,
      })
    : drawSliceMovingUp({
        ctx,
        target,
        targSectionH,
        sliceSize: sliceSize.value,
      });
}

function drawSliceMovingDown({ ctx, target, targSectionH, sliceSize }) {
  //   const heightToShiftDown = target.height - (sliceSize + targSectionH);
  const heightToShiftDown = target.height + sliceSize - targSectionH;

  const from = {
    x: 0,
    y: targSectionH - sliceSize,
    w: target.width,
    h: heightToShiftDown,
  };
  const to = {
    x: 0,
    y: targSectionH,
    w: target.width,
    h: heightToShiftDown,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
}

function drawSliceMovingUp({ ctx, target, targSectionH, sliceSize }) {
  // TODO: Figure out why this works
  const heightToShiftUp = target.height + (sliceSize - targSectionH);

  const from = {
    x: 0,
    y: 0,
    w: target.width,
    h: heightToShiftUp,
  };
  const to = {
    x: 0,
    y: -sliceSize,
    w: target.width,
    h: heightToShiftUp,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
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
  //   ctx.save();
  //   ctx.globalCompositeOperation = "multiply";
  //   ctx.globalAlpha = 0.7;
  //   ctx.drawImage(
  //     src,
  //     source.x,
  //     source.y,
  //     source.w,
  //     source.h,
  //     dest.x,
  //     dest.y,
  //     dest.w,
  //     dest.h
  //   );
  //   ctx.restore();

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

function drawLiveWebcamSectionAtEnd({
  target,
  src,
  isReflected,
  srcSectionH,
  targSectionH,
}) {
  const ctx = target.getContext("2d");

  // draw live webcam portion of screen
  const source = {
    x: 0,
    y: src.height - srcSectionH,
    w: src.width,
    h: srcSectionH,
  };
  const dest = {
    x: 0,
    y: target.height - targSectionH,
    w: target.width,
    h: targSectionH,
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
  //   ctx.save();
  //   ctx.globalCompositeOperation = "multiply";
  //   ctx.globalAlpha = 0.7;
  //   ctx.drawImage(
  //     src,
  //     source.x,
  //     source.y,
  //     source.w,
  //     source.h,
  //     dest.x,
  //     dest.y,
  //     dest.w,
  //     dest.h
  //   );
  //   ctx.restore();

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
