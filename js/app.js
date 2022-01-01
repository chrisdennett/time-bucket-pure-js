import { drawSlitScanToCanvas } from "./utils/drawSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";

// elements
const artCanvas = document.querySelector("#artCanvas");
const video = document.querySelector("#videoElement");
const isReflectedCheckbox = document.querySelector("#isReflectedCheckbox");
const sliceWidthSlider = document.querySelector("#sliceWidthSlider");
const msPerFrameSlider = document.querySelector("#msPerFrameSlider");
const scanStartXSlider = document.querySelector("#scanStartXSlider");
const scanStartXSliderValue = document.querySelector("#scanStartXSliderValue");
const isReflectedCheckboxValue = document.querySelector(
  "#isReflectedCheckboxValue"
);
const sliceWidthSliderValue = document.querySelector("#sliceWidthSliderValue");
const msPerFrameSliderValue = document.querySelector("#msPerFrameSliderValue");

// global defaults
let scanStartX = 0.5;
let sliceWidth = 1;
let msPerFrame = 1;
let isReflected = false;
let lastDrawTime = null;

// set up controls, webcam etc
export function setup() {
  // show defaults on controls
  isReflectedCheckbox.checked = isReflected;
  sliceWidthSlider.value = sliceWidth;
  msPerFrameSlider.value = msPerFrame;
  scanStartXSlider.value = scanStartX;
  scanStartXSliderValue.innerHTML = scanStartX;
  isReflectedCheckboxValue.innerHTML = isReflected;
  sliceWidthSliderValue.innerHTML = sliceWidth;
  msPerFrameSliderValue.innerHTML = msPerFrame;

  // listeners
  isReflectedCheckbox.addEventListener("input", onIsReflectedCheckboxChange);
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
  function onSliceWidthSliderChange(e) {
    sliceWidth = e.target.value;
    sliceWidthSliderValue.innerHTML = sliceWidth;
  }
  function onMsPerFrameSliderChange(e) {
    msPerFrame = e.target.value;
    msPerFrameSliderValue.innerHTML = msPerFrame;
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
    scanStartX,
  });

  window.requestAnimationFrame(draw);
}
