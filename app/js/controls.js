// global
export const globalState = { soundStarted: false };

const defaultParams = {
  sliceSize: {
    type: "slider",
    min: 1,
    max: 80,
    step: 1,
    value: 2,
  },
  msPerFrame: {
    type: "slider",
    min: 1,
    max: 80,
    step: 1,
    value: 1,
  },
  canvasSize: {
    type: "slider",
    min: 50,
    max: 800,
    step: 1,
    value: 800,
  },
  scanStartPos: {
    type: "slider",
    min: 0.01,
    max: 1,
    step: 0.01,
    value: 1,
  },
  mountSize: {
    type: "slider",
    min: 0,
    max: 0.5,
    step: 0.001,
    value: 0,
  },
  isReflected: {
    type: "checkbox",
    value: false,
  },
};
const params = JSON.parse(JSON.stringify(defaultParams));

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

function addPhysicalControls(params) {
  // var socket = io();
  // socket.on(
  //   "sliceSizeChange",
  //   debounce((e) => {
  //     const { min, max, value: currValue } = params.sliceSize;
  //     const increment = e.value === "R" ? 1 : -1;
  //     let newValue = currValue + increment;
  //     if (newValue < min) newValue = min;
  //     if (newValue > max) newValue = max;
  //     params.sliceSize.value = newValue;
  //   }, 50)
  // );
  // socket.on(
  //   "webcamPositionChange",
  //   debounce((e) => {
  //     const { options, value: currValue } = params.webcamPosition;
  //     const increment = e.value === "R" ? 1 : -1;
  //     const currIndex = options.findIndex(opt => opt === currValue);
  //     let newIndex = currIndex + increment;
  //     if (newIndex < 0) newIndex = options.length-1;
  //     if (newIndex > options.length-1) newIndex = 0;
  //     params.webcamPosition.value = options[newIndex];
  //   }, 50)
  // );
  // socket.on(
  //   "isReflected",
  //   debounce((e) => {
  //     params.isReflected.value = !params.isReflected.value
  //   }, 100)
  // );
  // socket.on(
  //   "doReset",
  //   debounce((e) => {
  //     resetAllParams();
  //   }, 100)
  // );
}

function resetAllParams() {
  const keys = Object.keys(params);

  for (let key of keys) {
    params[key].value = defaultParams[key].value;
  }
}

export function initControls(controlsElement) {
  for (let key of Object.keys(params)) {
    const c = params[key];

    let holdingDiv = document.createElement("div");
    holdingDiv.classList = ["control"];

    let labelElement = document.createElement("label");
    labelElement.innerHTML = key + ":";
    labelElement.classList = ["controlLabel"];

    // arr so can extra elements - e.g. for radio butt options
    let inputElements = [];
    let displayCurrentValue = true;
    let valueElement = document.createElement("span");

    if (c.type === "slider") {
      let inputElement = document.createElement("input");
      inputElement.type = "range";
      inputElement.min = c.min;
      inputElement.max = c.max;
      inputElement.step = c.step;
      inputElement.value = c.value;

      inputElement.addEventListener("input", (e) => {
        c.value = e.target.value;
        valueElement.innerHTML = c.value;
      });
      inputElements.push(inputElement);
      //
    } else if (c.type === "checkbox") {
      let inputElement = document.createElement("input");
      inputElement.type = "checkbox";
      inputElement.checked = c.value;
      inputElement.addEventListener("input", (e) => {
        c.value = e.target.checked;
        valueElement.innerHTML = c.value;
      });
      inputElements.push(inputElement);
      //
    } else if (c.type === "radio") {
      displayCurrentValue = false;
      for (let i = 0; i < c.options.length; i++) {
        let inputElement = document.createElement("input");
        inputElement.type = "radio";
        inputElement.id = c.options[i];
        inputElement.value = c.options[i];
        inputElement.name = key;
        inputElement.checked = c.value === c.options[i];
        inputElement.setAttribute("data-index", i);
        inputElements.push(inputElement);
        let label = document.createElement("label");
        label.setAttribute("for", c.options[i]);
        label.innerHTML = c.options[i];
        inputElements.push(label);

        inputElement.addEventListener("input", (e) => {
          c.value = e.target.value;
        });
      }
    }

    if (inputElements.length === 0) {
      return;
    }

    holdingDiv.appendChild(labelElement);
    for (let el of inputElements) {
      holdingDiv.appendChild(el);
    }

    if (displayCurrentValue) {
      valueElement.innerHTML = c.value;
      holdingDiv.appendChild(valueElement);
    }

    controlsElement.appendChild(holdingDiv);
  }

  addPhysicalControls(params);

  return params;
}
