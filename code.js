document.addEventListener("DOMContentLoaded", function () {
  // elements to use
  const video = document.querySelector("#videoElement");
  const artCanvas = document.querySelector("#artCanvas");
  const isReflectedCheckbox = document.querySelector("#isReflectedCheckbox");
  const sliceWidthSlider = document.querySelector("#sliceWidthSlider");
  const msPerFrameSlider = document.querySelector("#msPerFrameSlider");

  // global vars
  let sliceWidth = 1;
  let msPerFrame = 1;
  let isReflected = false;
  let lastDrawTime = null;

  // show defaults on controls
  isReflectedCheckbox.checked = isReflected;
  sliceWidthSlider.value = sliceWidth;
  msPerFrameSlider.value = msPerFrame;

  // listeners
  isReflectedCheckbox.addEventListener("input", onIsReflectedCheckboxChange);
  sliceWidthSlider.addEventListener("input", onSliceWidthSliderChange);
  msPerFrameSlider.addEventListener("input", onMsPerFrameSliderChange);

  // functions
  function onIsReflectedCheckboxChange(e) {
    isReflected = e.target.checked;
  }
  function onSliceWidthSliderChange(e) {
    sliceWidth = e.target.value;
  }
  function onMsPerFrameSliderChange(e) {
    msPerFrame = e.target.value;
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1280, height: 720 },
      })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log("video error: ", error);
      });
  }

  // draw loop
  const draw = function () {
    const timeStamp = Date.now();

    let drawSlice = false;

    if (!lastDrawTime || timeStamp - lastDrawTime >= msPerFrame) {
      lastDrawTime = timeStamp;
      drawSlice = true;
    }

    const frameCanvas = getFlippedVideoCanvas(video);

    if (artCanvas.width < frameCanvas.width) {
      artCanvas.height = frameCanvas.height;
      artCanvas.width = frameCanvas.width;
    }

    drawSlitScanToCanvas({
      src: frameCanvas,
      target: artCanvas,
      sliceWidth,
      isReflected,
      drawSlice,
    });

    window.requestAnimationFrame(draw);
  };

  draw();
});

const getFlippedVideoCanvas = (video) => {
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = 1280;
  frameCanvas.height = 720;
  const frameCtx = frameCanvas.getContext("2d");
  frameCtx.translate(frameCanvas.width, 0);
  frameCtx.scale(-1, 1);
  frameCtx.drawImage(video, 0, 0);
  return frameCanvas;
};

const drawSlitScanToCanvas = ({
  src,
  target,
  sliceWidth,
  isReflected,
  drawSlice,
}) => {
  const ctx = target.getContext("2d");

  const sliceXFrac = 0.5;
  const widthBeforeScan = src.width * sliceXFrac;

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
};

const drawLiveWebcamSection = ({ target, src, w, isReflected }) => {
  const ctx = target.getContext("2d");
  const h = src.height;

  // draw live webcam portion of screen
  ctx.drawImage(src, 0, 0, w, h, 0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.7;
  ctx.drawImage(src, 0, 0, w, h, 0, 0, w, h);
  ctx.restore();

  if (isReflected) {
    const halfH = h / 2;

    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(target, 0, 0, w, halfH, 0, halfH * -2, w, halfH);
    ctx.restore();
  }
};
