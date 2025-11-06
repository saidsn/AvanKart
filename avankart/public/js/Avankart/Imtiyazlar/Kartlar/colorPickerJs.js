const colorArea = document.getElementById("color-area");
const hueBar = document.getElementById("hue-bar");
const alphaBar = document.getElementById("alpha-bar");
const ctxArea = colorArea.getContext("2d");
const ctxHue = hueBar.getContext("2d");
const ctxAlpha = alphaBar.getContext("2d");

const pickerIndicator = document.getElementById("picker-indicator");
const hueIndicator = document.getElementById("hue-indicator");
const alphaIndicator = document.getElementById("alpha-indicator");

const hexValue = document.getElementById("hex-value");
const alphaValue = document.getElementById("alpha-value");

const bgcontainer = document.getElementById("bgColorForCard");

const lastUsedColors = document.querySelectorAll("#last-used div");

window.colorPickerState = {
  hue: 0,
  sat: 1,
  val: 1,
  alpha: 1,
};

// Draw hue bar gradient
function drawHueBar() {
  const hueGradient = ctxHue.createLinearGradient(0, 0, 0, hueBar.height);
  for (let i = 0; i <= 360; i += 10) {
    hueGradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
  }
  ctxHue.fillStyle = hueGradient;
  ctxHue.fillRect(0, 0, hueBar.width, hueBar.height);
}

// Draw main color area
function drawColorArea(hue) {
  const satGrad = ctxArea.createLinearGradient(0, 0, colorArea.width, 0);
  satGrad.addColorStop(0, "white");
  satGrad.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
  ctxArea.fillStyle = satGrad;
  ctxArea.fillRect(0, 0, colorArea.width, colorArea.height);

  const valGrad = ctxArea.createLinearGradient(0, 0, 0, colorArea.height);
  valGrad.addColorStop(0, "rgba(0,0,0,0)");
  valGrad.addColorStop(1, "black");
  ctxArea.fillStyle = valGrad;
  ctxArea.fillRect(0, 0, colorArea.width, colorArea.height);
}

// Draw alpha bar
function drawAlphaBar(hue, sat, val) {
  const transparent = "rgba(0,0,0,0)";
  const color = `hsla(${hue}, ${sat * 100}%, ${val * 100}%, 1)`;
  const gradient = ctxAlpha.createLinearGradient(0, 0, 0, alphaBar.height);
  gradient.addColorStop(0, transparent);
  gradient.addColorStop(1, color);
  ctxAlpha.clearRect(0, 0, alphaBar.width, alphaBar.height);
  ctxAlpha.fillStyle = gradient;
  ctxAlpha.fillRect(0, 0, alphaBar.width, alphaBar.height);
}

// Helper functions
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    h,
    s,
    v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), s, v];
}

function hsvToRgb(h, s, v) {
  h /= 360;
  let r, g, b;
  let i = Math.floor(h * 6),
    f = h * 6 - i,
    p = v * (1 - s),
    q = v * (1 - f * s),
    t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Pick color
function pickColor(x, y) {
  x = Math.min(Math.max(0, x), colorArea.width);
  y = Math.min(Math.max(0, y), colorArea.height);

  window.colorPickerState.sat = x / colorArea.width;
  window.colorPickerState.val = 1 - y / colorArea.height;

  pickerIndicator.style.left = `${x}px`;
  pickerIndicator.style.top = `${y}px`;

  drawAlphaBar(
    window.colorPickerState.hue,
    window.colorPickerState.sat,
    window.colorPickerState.val
  );

  const [r, g, b] = hsvToRgb(
    window.colorPickerState.hue,
    window.colorPickerState.sat,
    window.colorPickerState.val
  );
  hexValue.value = rgbToHex(r, g, b);

  updateAlphaInput();
}

// Update alpha indicator
function updateAlphaInput() {
  alphaIndicator.style.top = `${(1 - window.colorPickerState.alpha) * alphaBar.height}px`;
  alphaValue.value = `${Math.round(window.colorPickerState.alpha * 100)} %`;
  const [r, g, b] = hsvToRgb(
    window.colorPickerState.hue,
    window.colorPickerState.sat,
    window.colorPickerState.val
  );
  bgcontainer.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${window.colorPickerState.alpha})`;
}

// Set color from hex
function setColorFromHex(hex) {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, v] = rgbToHsv(r, g, b);

  window.colorPickerState.hue = h;
  window.colorPickerState.sat = s;
  window.colorPickerState.val = v;
  window.colorPickerState.alpha = 1;

  drawColorArea(h);
  drawAlphaBar(h, s, v);

  const x = s * colorArea.width;
  const y = (1 - v) * colorArea.height;
  pickColor(x, y);

  hueIndicator.style.top = `${(h / 360) * hueBar.height}px`;
  updateAlphaInput();
}

// Initial draw
drawHueBar();
drawColorArea(window.colorPickerState.hue);
drawAlphaBar(
  window.colorPickerState.hue,
  window.colorPickerState.sat,
  window.colorPickerState.val
);

// Event listeners
colorArea.addEventListener("click", (e) => {
  const rect = colorArea.getBoundingClientRect();
  pickColor(e.clientX - rect.left, e.clientY - rect.top);
});

hueBar.addEventListener("click", (e) => {
  const rect = hueBar.getBoundingClientRect();
  const y = e.clientY - rect.top;
  window.colorPickerState.hue = Math.min(
    360,
    Math.max(0, (y / hueBar.height) * 360)
  );
  drawColorArea(window.colorPickerState.hue);
  drawAlphaBar(
    window.colorPickerState.hue,
    window.colorPickerState.sat,
    window.colorPickerState.val
  );
  hueIndicator.style.top = `${y}px`;
  pickColor(
    window.colorPickerState.sat * colorArea.width,
    (1 - window.colorPickerState.val) * colorArea.height
  );
});

alphaBar.addEventListener("click", (e) => {
  const rect = alphaBar.getBoundingClientRect();
  const y = e.clientY - rect.top;
  window.colorPickerState.alpha = Math.min(
    1,
    Math.max(0, 1 - y / alphaBar.height)
  );
  updateAlphaInput();
});

// Last used colors
lastUsedColors.forEach((div) => {
  div.addEventListener("click", () => {
    setColorFromHex(div.dataset.color);
  });
});
