import { drawSlitScanToCanvas } from "./utils/drawSlitScanToCanvas.js";
import { drawVerticalSlitScanToCanvas } from "./utils/drawVerticalSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";

// elements
const artCanvas = document.querySelector("#artCanvas");
const artCanvas2 = document.querySelector("#artCanvas2");
const video = document.querySelector("#videoElement");
const isReflectedCheckbox = document.querySelector("#isReflectedCheckbox");
const isHorizontalCheckbox = document.querySelector("#isHorizontalCheckbox");
const sliceWidthSlider = document.querySelector("#sliceWidthSlider");
const msPerFrameSlider = document.querySelector("#msPerFrameSlider");
const scanStartXSlider = document.querySelector("#scanStartXSlider");
const scanStartXSliderValue = document.querySelector("#scanStartXSliderValue");
const isReflectedCheckboxValue = document.querySelector(
  "#isReflectedCheckboxValue"
);
const sliceWidthSliderValue = document.querySelector("#sliceWidthSliderValue");
const msPerFrameSliderValue = document.querySelector("#msPerFrameSliderValue");
const isHorizontalCheckboxValue = document.querySelector(
  "#isHorizontalCheckboxValue"
);

// global defaults
let scanStartX = 0.5;
let sliceWidth = 1;
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
  sliceWidthSlider.value = sliceWidth;
  msPerFrameSlider.value = msPerFrame;
  scanStartXSlider.value = scanStartX;
  isHorizontalCheckbox.checked = isHorizontal;

  scanStartXSliderValue.innerHTML = scanStartX;
  isReflectedCheckboxValue.innerHTML = isReflected;
  sliceWidthSliderValue.innerHTML = sliceWidth;
  msPerFrameSliderValue.innerHTML = msPerFrame;
  isHorizontalCheckboxValue.innerHTML = isHorizontal
    ? "horizontal"
    : "vertical";

  // listeners
  isReflectedCheckbox.addEventListener("input", onIsReflectedCheckboxChange);
  isHorizontalCheckbox.addEventListener("input", isHorizontalCheckboxChange);
  sliceWidthSlider.addEventListener("input", onSliceWidthSliderChange);
  msPerFrameSlider.addEventListener("input", onMsPerFrameSliderChange);
  scanStartXSlider.addEventListener("input", onScanStartXSlider);

  // functions
  function onScanStartXSlider(e) {
    scanStartX = e.target.value;
    scanStartXSliderValue.innerHTML = scanStartX;
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
  function onSliceWidthSliderChange(e) {
    sliceWidth = e.target.value;
    sliceWidthSliderValue.innerHTML = sliceWidth;
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
    artCanvas.height = 600;
    artCanvas.width = canvasWidth;
  }

  drawSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas,
    sliceWidth,
    isReflected,
    drawSlice,
    scanStartX,
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
    sliceWidth,
    isReflected,
    drawSlice,
    scanStartX,
  });
}
