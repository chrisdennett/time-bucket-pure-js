import { drawSlitScanToCanvas } from "./utils/drawSlitScanToCanvas.js";
import { drawVerticalSlitScanToCanvas } from "./utils/drawVerticalSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";

// elements
const artCanvas = document.querySelector("#artCanvas");
const artCanvas2 = document.querySelector("#artCanvas2");
const video = document.querySelector("#videoElement");
const isReflectedCheckbox = document.querySelector("#isReflectedCheckbox");
const isHorizontalCheckbox = document.querySelector("#isHorizontalCheckbox");
const sliceSizeSlider = document.querySelector("#sliceSizeSlider");
const msPerFrameSlider = document.querySelector("#msPerFrameSlider");
const scanStartPos = document.querySelector("#scanStartPos");
const scanStartPosValue = document.querySelector("#scanStartPosValue");
const isReflectedCheckboxValue = document.querySelector(
  "#isReflectedCheckboxValue"
);
const sliceSizeSliderValue = document.querySelector("#sliceSizeSliderValue");
const msPerFrameSliderValue = document.querySelector("#msPerFrameSliderValue");
const isHorizontalCheckboxValue = document.querySelector(
  "#isHorizontalCheckboxValue"
);

// global defaults
let sliceStartPos = 0.5;
let sliceSize = 1;
let msPerFrame = 1;
let isReflected = false;
let lastDrawTime = null;
let isHorizontal = true;

// set up controls, webcam etc
export function setup() {
  setupControls();
  setupWebcam();
}

function setupControls() {
  // show defaults on controls
  isReflectedCheckbox.checked = isReflected;
  sliceSizeSlider.value = sliceSize;
  msPerFrameSlider.value = msPerFrame;
  scanStartPos.value = sliceStartPos;
  isHorizontalCheckbox.checked = isHorizontal;

  scanStartPosValue.innerHTML = sliceStartPos;
  isReflectedCheckboxValue.innerHTML = isReflected;
  sliceSizeSliderValue.innerHTML = sliceSize;
  msPerFrameSliderValue.innerHTML = msPerFrame;
  isHorizontalCheckboxValue.innerHTML = isHorizontal
    ? "horizontal"
    : "vertical";

  // listeners
  isReflectedCheckbox.addEventListener("input", onIsReflectedCheckboxChange);
  isHorizontalCheckbox.addEventListener("input", isHorizontalCheckboxChange);
  sliceSizeSlider.addEventListener("input", onsliceSizeSliderChange);
  msPerFrameSlider.addEventListener("input", onMsPerFrameSliderChange);
  scanStartPos.addEventListener("input", onscanStartPos);

  // functions
  function onscanStartPos(e) {
    sliceStartPos = e.target.value;
    scanStartPosValue.innerHTML = sliceStartPos;
  }
  function onIsReflectedCheckboxChange(e) {
    isReflected = e.target.checked;
    isReflectedCheckboxValue.innerHTML = isReflected;
  }
  function isHorizontalCheckboxChange(e) {
    isHorizontal = e.target.checked;
    isHorizontalCheckboxValue.innerHTML = isHorizontal
      ? "horizontal"
      : "vertical";
  }
  function onsliceSizeSliderChange(e) {
    sliceSize = e.target.value;
    sliceSizeSliderValue.innerHTML = sliceSize;
  }
  function onMsPerFrameSliderChange(e) {
    msPerFrame = e.target.value;
    msPerFrameSliderValue.innerHTML = msPerFrame;
  }
}

function setupWebcam() {
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
}

// draw loop
export function draw() {
  const timeStamp = Date.now();

  let drawSlice = false;

  if (!lastDrawTime || timeStamp - lastDrawTime >= msPerFrame) {
    lastDrawTime = timeStamp;
    drawSlice = true;
  }

  const frameCanvas = getFlippedVideoCanvas(video);

  if (isHorizontal) {
    drawHorizontalSlitScan(frameCanvas, drawSlice);
    if (artCanvas2.style.display !== "none") {
      artCanvas2.style.display = "none";
    }
    if (artCanvas.style.display === "none") {
      artCanvas.style.display = "inherit";
    }
  } else {
    drawVerticalSlitScan(frameCanvas, drawSlice);
    if (artCanvas.style.display !== "none") {
      artCanvas.style.display = "none";
    }
    if (artCanvas2.style.display === "none") {
      artCanvas2.style.display = "inherit";
    }
  }

  window.requestAnimationFrame(draw);
}

function drawHorizontalSlitScan(frameCanvas, drawSlice) {
  const canvasWidth = document.body.clientWidth - 40;

  if (artCanvas.width !== canvasWidth) {
    artCanvas.height = 200;
    artCanvas.width = canvasWidth;
  }

  drawSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas,
    sliceSize,
    isReflected,
    drawSlice,
    sliceStartPos,
  });
}

function drawVerticalSlitScan(frameCanvas, drawSlice) {
  const canvasHeight = document.body.clientHeight - 40;

  if (artCanvas2.height !== canvasHeight) {
    artCanvas2.height = canvasHeight;
    artCanvas2.width = 600;
  }

  drawVerticalSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas2,
    sliceSize,
    isReflected,
    drawSlice,
    sliceStartPos,
  });
}
