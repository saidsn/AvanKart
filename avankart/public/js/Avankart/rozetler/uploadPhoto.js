function previewImage(input, previewId) {
  const file = input.files[0];
  const preview = document.getElementById(previewId);

  if (file && preview) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("hidden");

      // Add hover effect to the container
      const container = preview.closest(".group");
      if (container) {
        // Remove the onclick attribute to prevent file picker from opening
        container.removeAttribute("onclick");
        container.style.pointerEvents = "auto";

        container.addEventListener("mouseenter", showHoverEffect);
        container.addEventListener("mouseleave", hideHoverEffect);
      }
    };
    reader.readAsDataURL(file);
  }
}

function showHoverEffect(e) {
  const container = e.currentTarget;
  const preview = container.querySelector('img[id$="Preview"]');

  if (preview && !preview.classList.contains("hidden")) {
    const overlayId = preview.id.replace("Preview", "HoverOverlay");
    const overlay = document.getElementById(overlayId);

    if (overlay) {
      overlay.classList.remove("hidden");
      // Small delay to ensure the element is rendered before applying opacity
      setTimeout(() => {
        overlay.classList.remove("opacity-0");
        overlay.classList.add("opacity-100");

        // Animate buttons and text
        const buttons = overlay.querySelector(".flex.gap-3, .flex.gap-2");
        const text = overlay.querySelector(".text-center");

        if (buttons) {
          buttons.classList.remove("translate-y-4", "translate-y-2");
          buttons.classList.add("translate-y-0");
        }

        if (text) {
          text.classList.remove("translate-y-4");
          text.classList.add("translate-y-0");
        }
      }, 10);
    }
  }
}

function hideHoverEffect(e) {
  const container = e.currentTarget;
  const preview = container.querySelector('img[id$="Preview"]');

  if (preview && !preview.classList.contains("hidden")) {
    const overlayId = preview.id.replace("Preview", "HoverOverlay");
    const overlay = document.getElementById(overlayId);

    if (overlay) {
      overlay.classList.remove("opacity-100");
      overlay.classList.add("opacity-0");

      // Reset button and text positions
      const buttons = overlay.querySelector(".flex.gap-3, .flex.gap-2");
      const text = overlay.querySelector(".text-center");

      if (buttons) {
        buttons.classList.remove("translate-y-0");
        buttons.classList.add(
          buttons.closest("#profileHoverOverlay")
            ? "translate-y-2"
            : "translate-y-4"
        );
      }

      if (text) {
        text.classList.remove("translate-y-0");
        text.classList.add("translate-y-4");
      }

      // Hide overlay after transition
      setTimeout(() => {
        overlay.classList.add("hidden");
      }, 500);
    }
  }
}

function editImage(event, inputId) {
  event.stopPropagation();
  document.getElementById(inputId).click();
}

function deleteImage(event, previewId, overlayId) {
  event.stopPropagation();

  const preview = document.getElementById(previewId);
  const overlay = document.getElementById(overlayId);
  const container = preview.closest(".group");

  // Hide and reset preview
  preview.classList.add("hidden");
  preview.src = "";

  // Hide overlay
  overlay.classList.add("hidden");
  overlay.classList.remove("opacity-100");
  overlay.classList.add("opacity-0");

  // Reset button and text positions
  const buttons = overlay.querySelector(".flex.gap-3, .flex.gap-2");
  const text = overlay.querySelector(".text-center");

  if (buttons) {
    buttons.classList.remove("translate-y-0");
    buttons.classList.add(
      buttons.closest("#profileHoverOverlay")
        ? "translate-y-2"
        : "translate-y-4"
    );
  }

  if (text) {
    text.classList.remove("translate-y-0");
    text.classList.add("translate-y-4");
  }

  // Remove hover event listeners
  if (container) {
    container.removeEventListener("mouseenter", showHoverEffect);
    container.removeEventListener("mouseleave", hideHoverEffect);

    // Restore the original onclick functionality
    const inputId = overlayId
      .replace("HoverOverlay", "Input")
      .replace("Hover", "");
    container.setAttribute(
      "onclick",
      `document.getElementById('${inputId}').click()`
    );
  }

  // Reset the file input
  const inputId = overlayId
    .replace("HoverOverlay", "Input")
    .replace("Hover", "");
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
  }
}