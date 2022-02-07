import { drawRoundSlitScanToCanvas } from "./utils/drawRoundSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { initControls } from "./controls.js";

// app elements
const appElement = document.querySelector("#app");
const controls = document.querySelector("#controls");
const artCanvas = document.querySelector("#artCanvas");
const video = document.querySelector("#videoElement");

// set up controls
const params = initControls(controls);

// global defaults
let lastDrawTime = null;
let count = 0;

// set up controls, webcam etc
export function setup() {
  // hide controls by default and if app is right clicked
  appElement.addEventListener("contextmenu", onAppRightClick);
  controls.style.display = "none";

  // keyboard controls
  // document.addEventListener("keydown", onKeyDown);

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
  const { msPerFrame } = params;

  const timeStamp = Date.now();

  let drawSlice = false;

  if (!lastDrawTime || timeStamp - lastDrawTime >= msPerFrame.value) {
    lastDrawTime = timeStamp;
    drawSlice = true;
  }

  const frameCanvas = getFlippedVideoCanvas(video, count);
  count += 0.25;

  drawRoundSlitScan(frameCanvas, drawSlice, params);

  window.requestAnimationFrame(draw);
}

function drawRoundSlitScan(frameCanvas, drawSlice, params) {
  const { canvasSize, mountSize } = params;
  const topAdjust = 0;
  const fullHeight = document.body.clientHeight - topAdjust;
  let padding = parseFloat(mountSize.value) * fullHeight;

  if (!padding) padding = 0;
  const canvasHeight = fullHeight - (padding + padding);

  if (
    artCanvas.height !== parseInt(canvasHeight) ||
    artCanvas.width !== parseInt(canvasSize.value)
  ) {
    const container = document.getElementById("container");
    container.style.position = "absolute";
    container.style.top = topAdjust + "px";

    artCanvas.height = canvasHeight;
    artCanvas.width = canvasSize.value;
  }

  drawRoundSlitScanToCanvas({
    src: frameCanvas,
    target: artCanvas,
    drawSlice,
    params,
  });
}
