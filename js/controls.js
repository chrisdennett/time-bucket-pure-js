const params = {
  sliceSize: {
    type: "slider",
    min: 1,
    max: 80,
    step: 1,
    value: 1,
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
    value: 320,
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
    step: 0.01,
    value: 0.3,
  },
  webcamAtStart: {
    type: "checkbox",
    value: true,
  },
  isHorizontal: {
    type: "checkbox",
    value: false,
  },
  isReflected: {
    type: "checkbox",
    value: false,
  },
};

export function initControls(controlsElement) {
  for (let key of Object.keys(params)) {
    const c = params[key];

    let holdingDiv = document.createElement("div");
    holdingDiv.classList = ["control"];

    let labelElement = document.createElement("label");
    labelElement.innerHTML = key + ":";

    let inputElement = document.createElement("input");

    if (c.type === "slider") {
      inputElement.type = "range";
      inputElement.min = c.min;
      inputElement.max = c.max;
      inputElement.step = c.step;
      inputElement.value = c.value;

      inputElement.addEventListener("input", (e) => {
        c.value = e.target.value;
        valueElement.innerHTML = c.value;
      });
    } else if (c.type === "checkbox") {
      inputElement.type = "checkbox";
      inputElement.checked = c.value;
      inputElement.addEventListener("input", (e) => {
        c.value = e.target.checked;
        valueElement.innerHTML = c.value;
      });
    }

    let valueElement = document.createElement("span");
    valueElement.innerHTML = c.value;

    holdingDiv.appendChild(labelElement);
    holdingDiv.appendChild(inputElement);
    holdingDiv.appendChild(valueElement);

    controlsElement.appendChild(holdingDiv);
  }

  return params;
}
