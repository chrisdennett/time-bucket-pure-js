import { drawSlitScanToCanvas } from "./utils/drawSlitScanToCanvas.js";
import { drawVerticalSlitScanToCanvas } from "./utils/drawVerticalSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { initControls } from "./controls.js";

// app elements
const appElement = document.querySelector("#app");
const controls = document.querySelector("#controls");
// draw elements
const artCanvas = document.querySelector("#artCanvas");
const artCanvas2 = document.querySelector("#artCanvas2");
const video = document.querySelector("#videoElement");

const allControls = initControls(controls);

// control elements
const isReflectedCheckbox = document.querySelector("#isReflectedCheckbox");
const sliceSizeSlider = document.querySelector("#sliceSizeSlider");
const canvasSizeSlider = document.querySelector("#canvasSizeSlider");
const msPerFrameSlider = document.querySelector("#msPerFrameSlider");
const isReflectedCheckboxValue = document.querySelector(
  "#isReflectedCheckboxValue"
);
const sliceSizeSliderValue = document.querySelector("#sliceSizeSliderValue");
const msPerFrameSliderValue = document.querySelector("#msPerFrameSliderValue");
const canvasSizeSliderValue = document.querySelector("#canvasSizeSliderValue");

// global defaults
let sliceSize = 1;
let msPerFrame = 1;
let lastDrawTime = null;
let canvasSize = 320;
let isReflected = false;

// set up controls, webcam etc
export function setup() {
  setupControls();
  setupWebcam();
}

function setupControls() {
  // set controls to show defaults
  isReflectedCheckbox.checked = isReflected;
  sliceSizeSlider.value = sliceSize;
  msPerFrameSlider.value = msPerFrame;
  canvasSizeSlider.value = canvasSize;
  // controls.style.display = "none";

  // update value elements to show default values
  isReflectedCheckboxValue.innerHTML = isReflected;
  sliceSizeSliderValue.innerHTML = sliceSize;
  msPerFrameSliderValue.innerHTML = msPerFrame;
  canvasSizeSliderValue.innerHTML = canvasSize;

  // control listeners
  isReflectedCheckbox.addEventListener("input", onIsReflectedCheckboxChange);
  sliceSizeSlider.addEventListener("input", onsliceSizeSliderChange);
  msPerFrameSlider.addEventListener("input", onMsPerFrameSliderChange);
  canvasSizeSlider.addEventListener("input", onCanvasSizeSliderChange);

  // hide controls if app is clicked
  appElement.addEventListener("contextmenu", onAppRightClick);

  function onAppRightClick(e) {
    e.preventDefault();
    if (controls.style.display === "none") {
      controls.style.display = "inherit";
    } else {
      controls.style.display = "none";
    }
  }

  // functions
  function onCanvasSizeSliderChange(e) {
    canvasSize = e.target.value;
    canvasSizeSliderValue.innerHTML = canvasSize;
  }
  function onIsReflectedCheckboxChange(e) {
    isReflected = e.target.checked;
    isReflectedCheckboxValue.innerHTML = isReflected;
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
        video: { width: 320, height: 240 },
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

  if (allControls.isHorizontal.value) {
    drawHorizontalSlitScan(frameCanvas, drawSlice, allControls);
    if (artCanvas2.style.display !== "none") {
      artCanvas2.style.display = "none";
    }
    if (artCanvas.style.display === "none") {
      artCanvas.style.display = "inherit";
    }
  } else {
    drawVerticalSlitScan(frameCanvas, drawSlice, allControls);
    if (artCanvas.style.display !== "none") {
      artCanvas.style.display = "none";
    }
    if (artCanvas2.style.display === "none") {
      artCanvas2.style.display = "inherit";
    }
  }

  window.requestAnimationFrame(draw);
}

function drawHorizontalSlitScan(frameCanvas, drawSlice, allControls) {
  const canvasWidth = document.body.clientWidth - 40;

  if (
    artCanvas.width !== canvasWidth ||
    artCanvas.height !== parseInt(canvasSize)
  ) {
    artCanvas.height = canvasSize;
    artCanvas.width = canvasWidth;
  }

  drawSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas,
    sliceSize,
    isReflected,
    drawSlice,
    allControls,
  });
}

function drawVerticalSlitScan(frameCanvas, drawSlice, allControls) {
  const fullHeight = document.body.clientHeight;
  let mountSize = allControls.mountSize * fullHeight;

  if (!mountSize) mountSize = 0;
  const canvasHeight = document.body.clientHeight - mountSize;

  if (
    artCanvas2.height !== parseInt(canvasHeight) ||
    artCanvas2.width !== parseInt(canvasSize)
  ) {
    artCanvas2.height = canvasHeight;
    artCanvas2.width = canvasSize;
  }

  drawVerticalSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas2,
    sliceSize,
    isReflected,
    drawSlice,
    allControls,
  });
}
