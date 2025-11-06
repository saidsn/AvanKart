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

      const lastUsedColors = document.querySelectorAll("#last-used div");

      let hue = 0;
      let sat = 1;
      let val = 1;
      let alpha = 1;

      // Draw hue bar gradient
      function drawHueBar() {
        const hueGradient = ctxHue.createLinearGradient(0, 0, 0, hueBar.height);
        for (let i = 0; i <= 360; i += 10) {
          hueGradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
        }
        ctxHue.fillStyle = hueGradient;
        ctxHue.fillRect(0, 0, hueBar.width, hueBar.height);
      }

      // Draw main color area with saturation and value
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

      // Draw alpha bar gradient from transparent to fully opaque color
      function drawAlphaBar(hue, sat, val) {
        const transparent = "rgba(0,0,0,0)";
        // Use hsl for color, val in lightness is in percentage: val * 100
        const color = `hsla(${hue}, ${sat * 100}%, ${val * 100}%, 1)`;

        const gradient = ctxAlpha.createLinearGradient(
          0,
          0,
          0,
          alphaBar.height
        );
        gradient.addColorStop(0, transparent);
        gradient.addColorStop(1, color);

        ctxAlpha.clearRect(0, 0, alphaBar.width, alphaBar.height);
        ctxAlpha.fillStyle = gradient;
        ctxAlpha.fillRect(0, 0, alphaBar.width, alphaBar.height);
      }

      // Convert rgb to hex string
      function rgbToHex(r, g, b) {
        return (
          "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
        );
      }

      // Convert hex to rgb array
      function hexToRgb(hex) {
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
      }

      // Convert rgb to hsv [h, s, v]
      function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        let max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        let h,
          s,
          v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
          h = 0;
        } else {
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

      // Convert hsv to rgb
      function hsvToRgb(h, s, v) {
        h /= 360;
        let r, g, b;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
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

      // Update hex input & indicator position on color pick
      function pickColor(x, y) {
        x = Math.min(Math.max(0, x), colorArea.width);
        y = Math.min(Math.max(0, y), colorArea.height);

        sat = x / colorArea.width;
        val = 1 - y / colorArea.height;

        // Update picker indicator position
        pickerIndicator.style.left = `${x}px`;
        pickerIndicator.style.top = `${y}px`;

        // Update alpha bar gradient with new sat and val
        drawAlphaBar(hue, sat, val);

        // Get current color in rgb (without alpha)
        const [r, g, b] = hsvToRgb(hue, sat, val);
        const hex = rgbToHex(r, g, b);

        hexValue.value = hex;
        updateAlphaInput();
      }

      // Update alpha input text and indicator position
      function updateAlphaInput() {
        alphaValue.value = `${Math.round(alpha * 100)} %`;
        alphaIndicator.style.top = `${(1 - alpha) * alphaBar.height}px`;
      }

      // Set color from hex (called when clicking last used colors)
      function setColorFromHex(hex) {
        const [r, g, b] = hexToRgb(hex);
        const hsv = rgbToHsv(r, g, b);
        hue = hsv[0];
        sat = hsv[1];
        val = hsv[2];
        alpha = 1;

        drawColorArea(hue);
        drawAlphaBar(hue, sat, val);

        // Update indicators
        const x = sat * colorArea.width;
        const y = (1 - val) * colorArea.height;
        pickColor(x, y);

        hueIndicator.style.top = `${(hue / 360) * hueBar.height}px`;
        alphaIndicator.style.top = `${(1 - alpha) * alphaBar.height}px`;

        updateAlphaInput();
      }

      // Initial drawing
      drawHueBar();
      drawColorArea(hue);
      drawAlphaBar(hue, sat, val);

      // Event listeners for color area click
      colorArea.addEventListener("click", (e) => {
        const rect = colorArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        pickColor(x, y);
      });

      // Event listeners for hue bar click
      hueBar.addEventListener("click", (e) => {
        const rect = hueBar.getBoundingClientRect();
        const y = e.clientY - rect.top;
        hue = Math.min(360, Math.max(0, (y / hueBar.height) * 360));
        drawColorArea(hue);
        drawAlphaBar(hue, sat, val);
        hueIndicator.style.top = `${y}px`;

        // After hue change, update picked color rgb/hex value
        pickColor(sat * colorArea.width, (1 - val) * colorArea.height);
      });

      // Event listener for alpha bar click
      alphaBar.addEventListener("click", (e) => {
        const rect = alphaBar.getBoundingClientRect();
        const y = e.clientY - rect.top;

        alpha = 1 - y / alphaBar.height;
        alpha = Math.min(1, Math.max(0, alpha));

        alphaIndicator.style.top = `${y}px`;
        updateAlphaInput();

        // Update hexValue to include alpha in rgba or hsla if you want
        // Here just show hex without alpha (standard)
      });

      // Last used colors click event
      lastUsedColors.forEach((div) => {
        div.addEventListener("click", () => {
          const hex = div.dataset.color;
          setColorFromHex(hex);
        });
      });