import { drawSlitScanToCanvas } from "./utils/drawSlitScanToCanvas.js";
import { drawVerticalSlitScanToCanvas } from "./utils/drawVerticalSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";

const allControls = [
  {
    name: "mountSize",
    type: "Slider",
    min: 0,
    max: 0.33,
    step: 0.01,
    value: 0.1,
  },
];

// app elements
const appElement = document.querySelector("#app");
const controls = document.querySelector("#controls");

for (let c of allControls) {
  let holdingDiv = document.createElement("div");
  holdingDiv.classList = ["control"];

  let labelElement = document.createElement("label");
  labelElement.innerHTML = c.name + ":";

  let inputElement = document.createElement("input");
  inputElement.type = "range";
  inputElement.min = c.min;
  inputElement.max = c.max;
  inputElement.step = c.step;
  inputElement.value = c.defaultValue;

  let valueElement = document.createElement("span");
  valueElement.innerHTML = c.value;

  inputElement.addEventListener("input", (e) => {
    c.value = e.target.value;
    valueElement.innerHTML = e.target.value;
  });

  holdingDiv.appendChild(labelElement);
  holdingDiv.appendChild(inputElement);
  holdingDiv.appendChild(valueElement);

  controls.appendChild(holdingDiv);
}

// draw elements
const artCanvas = document.querySelector("#artCanvas");
const artCanvas2 = document.querySelector("#artCanvas2");
const video = document.querySelector("#videoElement");
// control elements
const isReflectedCheckbox = document.querySelector("#isReflectedCheckbox");
const isHorizontalCheckbox = document.querySelector("#isHorizontalCheckbox");
const webcamAtStartCheckbox = document.querySelector("#webcamAtStartCheckbox");
const sliceSizeSlider = document.querySelector("#sliceSizeSlider");
const canvasSizeSlider = document.querySelector("#canvasSizeSlider");
const msPerFrameSlider = document.querySelector("#msPerFrameSlider");
const scanStartPosSlider = document.querySelector("#scanStartPosSlider");
// control value display elements
const scanStartPosValue = document.querySelector("#scanStartPosValue");
const isReflectedCheckboxValue = document.querySelector(
  "#isReflectedCheckboxValue"
);
const sliceSizeSliderValue = document.querySelector("#sliceSizeSliderValue");
const msPerFrameSliderValue = document.querySelector("#msPerFrameSliderValue");
const isHorizontalCheckboxValue = document.querySelector(
  "#isHorizontalCheckboxValue"
);
const webcamAtStartCheckboxValue = document.querySelector(
  "#webcamAtStartCheckboxValue"
);
const canvasSizeSliderValue = document.querySelector("#canvasSizeSliderValue");

// global defaults
let scanStartPos = 1;
let sliceSize = 1;
let msPerFrame = 1;
let lastDrawTime = null;
let canvasSize = 320;
let isReflected = false;
let isHorizontal = false;
let webcamAtStart = true;

// set up controls, webcam etc
export function setup() {
  setupControls();
  setupWebcam();
}

function setupControls() {
  // set controls to show defaults
  isReflectedCheckbox.checked = isReflected;
  webcamAtStartCheckbox.checked = webcamAtStart;
  isHorizontalCheckbox.checked = isHorizontal;
  sliceSizeSlider.value = sliceSize;
  msPerFrameSlider.value = msPerFrame;
  scanStartPosSlider.value = scanStartPos;
  canvasSizeSlider.value = canvasSize;
  controls.style.display = "none";

  // update value elements to show default values
  scanStartPosValue.innerHTML = scanStartPos;
  isReflectedCheckboxValue.innerHTML = isReflected;
  sliceSizeSliderValue.innerHTML = sliceSize;
  msPerFrameSliderValue.innerHTML = msPerFrame;
  canvasSizeSliderValue.innerHTML = canvasSize;
  isHorizontalCheckboxValue.innerHTML = isHorizontal
    ? "(is horizontal)"
    : "(is vertical)";
  webcamAtStartCheckboxValue.innerHTML = webcamAtStart
    ? "(is at start)"
    : "(is at end)";

  // control listeners
  isReflectedCheckbox.addEventListener("input", onIsReflectedCheckboxChange);
  isHorizontalCheckbox.addEventListener("input", isHorizontalCheckboxChange);
  webcamAtStartCheckbox.addEventListener("input", webcamAtStartCheckboxChange);
  sliceSizeSlider.addEventListener("input", onsliceSizeSliderChange);
  msPerFrameSlider.addEventListener("input", onMsPerFrameSliderChange);
  scanStartPosSlider.addEventListener("input", onscanStartPos);
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
  function onscanStartPos(e) {
    scanStartPos = e.target.value;
    scanStartPosValue.innerHTML = scanStartPos;
  }
  function onIsReflectedCheckboxChange(e) {
    isReflected = e.target.checked;
    isReflectedCheckboxValue.innerHTML = isReflected;
  }
  function isHorizontalCheckboxChange(e) {
    isHorizontal = e.target.checked;
    isHorizontalCheckboxValue.innerHTML = isHorizontal
      ? "(is horizontal)"
      : "(is vertical)";
  }
  function webcamAtStartCheckboxChange(e) {
    webcamAtStart = e.target.checked;
    webcamAtStartCheckboxValue.innerHTML = webcamAtStart
      ? "(is at start)"
      : "(is at end)";
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

  if (isHorizontal) {
    drawHorizontalSlitScan(frameCanvas, drawSlice, webcamAtStart, allControls);
    if (artCanvas2.style.display !== "none") {
      artCanvas2.style.display = "none";
    }
    if (artCanvas.style.display === "none") {
      artCanvas.style.display = "inherit";
    }
  } else {
    drawVerticalSlitScan(frameCanvas, drawSlice, webcamAtStart, allControls);
    if (artCanvas.style.display !== "none") {
      artCanvas.style.display = "none";
    }
    if (artCanvas2.style.display === "none") {
      artCanvas2.style.display = "inherit";
    }
  }

  window.requestAnimationFrame(draw);
}

function drawHorizontalSlitScan(
  frameCanvas,
  drawSlice,
  webcamAtStart,
  allControls
) {
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
    scanStartPos,
    webcamAtStart,
  });
}

function drawVerticalSlitScan(
  frameCanvas,
  drawSlice,
  webcamAtStart,
  allControls
) {
  const fullHeight = document.body.clientHeight;
  let mountSize = allControls[0].value * fullHeight;

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
    scanStartPos,
    webcamAtStart,
  });
}
