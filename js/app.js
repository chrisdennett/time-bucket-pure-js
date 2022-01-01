import { drawSlitScanToCanvas } from "./utils/drawSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";

// elements
const artCanvas = document.querySelector("#artCanvas");
const video = document.querySelector("#videoElement");
const isReflectedCheckbox = document.querySelector("#isReflectedCheckbox");
const sliceWidthSlider = document.querySelector("#sliceWidthSlider");
const msPerFrameSlider = document.querySelector("#msPerFrameSlider");
const scanStartXSlider = document.querySelector("#scanStartXSlider");

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

  // listeners
  isReflectedCheckbox.addEventListener("input", onIsReflectedCheckboxChange);
  sliceWidthSlider.addEventListener("input", onSliceWidthSliderChange);
  msPerFrameSlider.addEventListener("input", onMsPerFrameSliderChange);
  scanStartXSlider.addEventListener("input", onScanStartXSlider);

  // functions
  function onScanStartXSlider(e) {
    scanStartX = e.target.value;
  }
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
