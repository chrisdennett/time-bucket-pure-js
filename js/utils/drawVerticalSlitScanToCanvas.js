export function drawVerticalSlitScanToCanvas({
  src,
  target,
  drawSlice,
  params,
  osc,
  soundObjects,
}) {
  const { webcamPosition, scanStartPos, isReflected, sliceSize } = params;
  const sliceSizeInt = parseInt(sliceSize.value);

  const ctx = target.getContext("2d");
  ctx.filter = "url(#turb)";

  const srcSectionH = scanStartPos.value * src.height;
  const scale = target.width / src.width;
  const liveWebcamSectionH = srcSectionH * scale;

  if (webcamPosition.value === "start") {
    drawLiveWebcamSectionAtStart({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionH,
      liveWebcamSectionH,
    });
  } else if (webcamPosition.value === "middle") {
    // ctx.fillRect(0, 0, target.width, target.height);
    drawLiveWebcamSectionInMiddle({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionH,
      liveWebcamSectionH,
    });
  } else {
    drawLiveWebcamSectionAtEnd({
      src,
      target,
      isReflected: isReflected.value,
      srcSectionH,
      liveWebcamSectionH,
    });
  }

  if (!drawSlice) return;

  if (webcamPosition.value === "start") {
    drawSliceMovingDown({
      ctx,
      target,
      liveWebcamSectionH,
      sliceSize: sliceSizeInt,
    });
  } else if (webcamPosition.value === "middle") {
    drawSliceMovingAwayFromMiddle({
      ctx,
      target,
      liveWebcamSectionH,
      sliceSize: sliceSizeInt,
    });
  } else {
    drawSliceMovingUp({
      ctx,
      target,
      liveWebcamSectionH,
      sliceSize: sliceSizeInt,
      osc,
      soundObjects,
    });
  }
}

//
// AT TOP MOVING DOWN
//
function drawLiveWebcamSectionAtStart({
  target,
  src,
  isReflected,
  srcSectionH,
  liveWebcamSectionH,
}) {
  const ctx = target.getContext("2d");

  console.log("soundStarted: ", soundStarted);

  // draw live webcam portion of screen
  const source = { x: 0, y: 0, w: src.width, h: srcSectionH };
  const dest = { x: 0, y: 0, w: target.width, h: liveWebcamSectionH };
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
function drawSliceMovingDown({ ctx, target, liveWebcamSectionH, sliceSize }) {
  const heightAfterWebcam = target.height - liveWebcamSectionH;
  const heightToShiftDown = heightAfterWebcam + sliceSize;

  const from = {
    x: 0,
    y: liveWebcamSectionH - sliceSize,
    w: target.width,
    h: heightToShiftDown,
  };
  const to = {
    x: 0,
    y: liveWebcamSectionH,
    w: target.width,
    h: heightToShiftDown,
  };

  ctx.drawImage(target, from.x, from.y, from.w, from.h, to.x, to.y, to.w, to.h);
}

//
// AT BOTTOM MOVING UP
//
function drawLiveWebcamSectionAtEnd({
  target,
  src,
  isReflected,
  srcSectionH,
  liveWebcamSectionH,
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
    y: target.height - liveWebcamSectionH,
    w: target.width,
    h: liveWebcamSectionH,
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
function drawSliceMovingUp({
  ctx,
  target,
  liveWebcamSectionH,
  sliceSize,
  osc,
  soundObjects,
}) {
  const liveWebCamTop = target.height - liveWebcamSectionH;
  const heightToShiftUp = liveWebCamTop + sliceSize;

  // var myImageData = ctx.getImageData(left, top, width, height);
  const canvasData = ctx.getImageData(0, liveWebCamTop + 1, target.width, 1);
  const pixelData = canvasData.data;
  let totals = { r: 0, g: 0, b: 0 };
  for (var i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    totals.r += r;
    totals.g += g;
    totals.b += b;
  }

  const avgR = totals.r / target.width;
  const avgG = totals.g / target.width;
  const avgB = totals.b / target.width;
  const avgColour = (avgR + avgG + avgB) / 3;

  if (soundObjects && soundObjects.length > 0) {
    // map avgColour to an index of soundObjects to get the right note
    const noteIndexDecimal = map(avgColour, 0, 255, 0, soundObjects.length);
    // console.log("noteIndexDecimal: ", noteIndexDecimal);
    const { synth, note } = soundObjects[Math.round(noteIndexDecimal)];
    synth.triggerAttackRelease(note, 1);
  }

  if (osc) {
    const freqMin = 130;
    const freqMax = 300;
    const freqRang = freqMax - freqMin;
    const avgColourFraction = avgColour / 255;
    const freq = freqMin + avgColourFraction * freqRang;

    osc.frequency.value = freq; //avgR * 2;
  }

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

function map(val, in_min, in_max, out_min, out_max) {
  return ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

//
// IN MIDDLE MOVING UP and DOWN
//
function drawLiveWebcamSectionInMiddle({
  target,
  src,
  isReflected,
  srcSectionH,
  liveWebcamSectionH,
}) {
  const ctx = target.getContext("2d");
  const targMiddle = target.height / 2;
  const halfSection = liveWebcamSectionH / 2;
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
    h: liveWebcamSectionH,
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
  liveWebcamSectionH,
  sliceSize,
}) {
  // moving up
  const middleY = target.height / 2;
  const halfSectionH = liveWebcamSectionH / 2;
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
