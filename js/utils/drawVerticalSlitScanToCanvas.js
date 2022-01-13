export function drawVerticalSlitScanToCanvas({
  src,
  target,
  drawSlice,
  params,
}) {
  const { webcamPosition, scanStartPos, isReflected, sliceSize } = params;
  const slideSizeInt = parseInt(sliceSize.value);

  const ctx = target.getContext("2d");
  ctx.filter = "url(#turb)";

  const srcSectionH = scanStartPos.value * src.height;
  const scale = target.width / src.width;
  const targSectionH = srcSectionH * scale;

  if (webcamPosition.value === "start") {
    drawLiveWebcamSection({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionH,
      targSectionH,
    });
  } else if (webcamPosition.value === "middle") {
    // ctx.fillRect(0, 0, target.width, target.height);
    drawLiveWebcamSectionInMiddle({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionH,
      targSectionH,
    });
  } else {
    drawLiveWebcamSectionAtEnd({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionH,
      targSectionH,
    });
  }

  if (!drawSlice) return;

  if (webcamPosition.value === "start") {
    drawSliceMovingDown({
      ctx,
      target,
      targSectionH,
      sliceSize: slideSizeInt,
    });
  } else if (webcamPosition.value === "middle") {
    drawSliceMovingAwayFromMiddle({
      ctx,
      target,
      targSectionH,
      sliceSize: slideSizeInt,
    });
  } else {
    drawSliceMovingUp({
      ctx,
      target,
      targSectionH,
      sliceSize: slideSizeInt,
    });
  }
}

function drawSliceMovingDown({ ctx, target, targSectionH, sliceSize }) {
  const heightToShiftDown = target.height - targSectionH + sliceSize;

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

function drawLiveWebcamSectionInMiddle({
  target,
  src,
  isReflected,
  srcSectionH,
  targSectionH,
}) {
  const ctx = target.getContext("2d");
  const targMiddle = target.height / 2;
  const halfSection = targSectionH / 2;
  const targY = targMiddle - halfSection;

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
  const dest = {
    x: 0,
    y: targY,
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

function drawSliceMovingAwayFromMiddle({
  ctx,
  target,
  targSectionH,
  sliceSize,
}) {
  const middleY = target.height / 2;
  const halfSectionH = targSectionH / 2;
  const topOfSection = middleY - halfSectionH;
  const heightToShiftUp = topOfSection + sliceSize;

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

  // moving down
  const bottomOfSection = middleY + halfSectionH;
  const heightToShiftDown = target.height - bottomOfSection + sliceSize;
  const from2 = {
    x: 0,
    y: bottomOfSection - sliceSize,
    w: target.width,
    h: heightToShiftDown,
  };
  const to2 = {
    x: 0,
    y: bottomOfSection,
    w: target.width,
    h: heightToShiftDown,
  };

  ctx.drawImage(
    target,
    from2.x,
    from2.y,
    from2.w,
    from2.h,
    to2.x,
    to2.y,
    to2.w,
    to2.h
  );
}
