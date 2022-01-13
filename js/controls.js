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
    value: 0.6,
  },
  mountSize: {
    type: "slider",
    min: 0,
    max: 0.5,
    step: 0.01,
    value: 0.3,
  },
  webcamPosition: {
    type: "radio",
    options: ["start", "middle", "end"],
    value: "middle",
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

  return params;
}
