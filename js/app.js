import { drawHorizontalSlitScanToCanvas } from "./utils/drawHorizontalSlitScanToCanvas.js";
import { drawVerticalSlitScanToCanvas } from "./utils/drawVerticalSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { initControls } from "./controls.js";

// app elements
const appElement = document.querySelector("#app");
const controls = document.querySelector("#controls");
const artCanvas = document.querySelector("#artCanvas");
const artCanvas2 = document.querySelector("#artCanvas2");
const video = document.querySelector("#videoElement");

// set up controls
const params = initControls(controls);

// global defaults
let lastDrawTime = null;

// set up controls, webcam etc
export function setup() {
  // hide controls by default and if app is right clicked
  appElement.addEventListener("contextmenu", onAppRightClick);
  controls.style.display = "none";

  function onAppRightClick(e) {
    e.preventDefault();
    if (controls.style.display === "none") {
      controls.style.display = "inherit";
    } else {
      controls.style.display = "none";
    }
  }

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
  const { isHorizontal, msPerFrame } = params;

  const timeStamp = Date.now();

  let drawSlice = false;

  if (!lastDrawTime || timeStamp - lastDrawTime >= msPerFrame.value) {
    lastDrawTime = timeStamp;
    drawSlice = true;
  }

  const frameCanvas = getFlippedVideoCanvas(video);

  if (isHorizontal.value) {
    drawHorizontalSlitScan(frameCanvas, drawSlice, params);
    if (artCanvas2.style.display !== "none") {
      artCanvas2.style.display = "none";
    }
    if (artCanvas.style.display === "none") {
      artCanvas.style.display = "inherit";
    }
  } else {
    drawVerticalSlitScan(frameCanvas, drawSlice, params);
    if (artCanvas.style.display !== "none") {
      artCanvas.style.display = "none";
    }
    if (artCanvas2.style.display === "none") {
      artCanvas2.style.display = "inherit";
    }
  }

  window.requestAnimationFrame(draw);
}

function drawHorizontalSlitScan(frameCanvas, drawSlice, params) {
  const { canvasSize } = params;
  const canvasWidth = document.body.clientWidth - 40;

  if (
    artCanvas.width !== canvasWidth ||
    artCanvas.height !== parseInt(canvasSize.value)
  ) {
    artCanvas.height = canvasSize.value;
    artCanvas.width = canvasWidth;
  }

  drawHorizontalSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas,
    drawSlice,
    params,
  });
}

function drawVerticalSlitScan(frameCanvas, drawSlice, params) {
  const { canvasSize, mountSize } = params;
  const fullHeight = document.body.clientHeight;
  let padding = mountSize.value * fullHeight;

  if (!padding) padding = 0;
  const canvasHeight = document.body.clientHeight - padding;

  if (
    artCanvas2.height !== parseInt(canvasHeight) ||
    artCanvas2.width !== parseInt(canvasSize.value)
  ) {
    artCanvas2.height = canvasHeight;
    artCanvas2.width = canvasSize.value;
  }

  drawVerticalSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas2,
    drawSlice,
    params,
  });
}
