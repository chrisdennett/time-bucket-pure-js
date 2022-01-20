import { drawHorizontalSlitScanToCanvas } from "./utils/drawHorizontalSlitScanToCanvas.js";
import { drawVerticalSlitScanToCanvas } from "./utils/drawVerticalSlitScanToCanvas.js";
import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { globalState, initControls } from "./controls.js";

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
let masterVolume = -9; // in decibel.
let scale;
let mixer;
let reverb;
let soundObjects = [];

// function onKeyDown(e) {
//   const noteIndex = parseInt(e.key);
//   console.log("noteIndex: ", noteIndex);

//   const { synth, note } = soundObjects[noteIndex];
//   synth.triggerAttackRelease(note, 1);
// }

// set up controls, webcam etc
export function setup() {
  // hide controls by default and if app is right clicked
  appElement.addEventListener("contextmenu", onAppRightClick);
  // controls.style.display = "none";

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
  const { isHorizontal, msPerFrame, soundOn } = params;

  // initialise sound if not done so already
  if (!globalState.soundStarted && soundOn.value) {
    globalState.soundStarted = true;
    initializeAudio();
  }

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
    drawVerticalSlitScan(frameCanvas, drawSlice, params, soundObjects);
    if (artCanvas.style.display !== "none") {
      artCanvas.style.display = "none";
    }
    if (artCanvas2.style.display === "none") {
      artCanvas2.style.display = "inherit";
    }
  }

  window.requestAnimationFrame(draw);
}

// function clearAudio() {
//   masterVolume = -9; // in decibel.
//   mixer;
//   soundObjects = [];
// }

function initializeAudio() {
  // Tone.Master.volume.value = masterVolume;

  mixer = new Tone.Gain();

  reverb = new Tone.Reverb({
    wet: 0.5, // half dry, half wet mix
    decay: 10, // decay time in seconds
  });

  // setup the audio chain:
  // mixer -> reverb -> Tone.Master
  // note that the synth object inside each pendulum get
  // connected to the mixer, so our final chain will look like:
  // synth(s) -> mixer -> reverb -> Tone.Master
  mixer.connect(reverb);
  reverb.toDestination();

  // quick way to get more notes: just glue 3 scales together
  // other 'flavours' to try:
  // major
  // minor
  // major pentatonic
  // the modes (eg: dorian, phrygian, etc..)
  // look at Tonal.ScaleType.names() to see a list of all supported
  // names

  // let flavour = "egyptian";
  let flavour = "minor pentatonic";
  // let flavour = "major pentatonic";
  scale = Tonal.Scale.get("C3 " + flavour).notes;
  scale = scale.concat(Tonal.Scale.get("C4 " + flavour).notes);
  // scale = scale.concat(Tonal.Scale.get("C5 " + flavour).notes);

  // optional but fun: shuffle the scale array to mixup the notes
  // Tonal.Collection.shuffle(scale);

  // create as many pendulums as we have notes in the scale[] array
  for (let i = 0; i < scale.length; i++) {
    let synth = new Tone.Synth();
    synth.connect(mixer);

    soundObjects.push({
      synth,
      note: scale[i],
      prevTriggerValue: 0,
      delayRetrigger: 0,
    });
  }
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

function drawVerticalSlitScan(frameCanvas, drawSlice, params, soundObjects) {
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
    soundObjects,
  });
}
