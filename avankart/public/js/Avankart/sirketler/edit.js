//! Edit Modal functions
function openMainEditPopup() {
  const overlay = document.getElementById("mainEditOverlay");
  if (overlay) overlay.style.display = "flex";
  document.body.style.overflow = "hidden"; // Disable scroll
}

function closeMainEditPopup() {
  const overlay = document.getElementById("mainEditOverlay");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = ""; // Enable scroll
}

document.addEventListener("DOMContentLoaded", () => {
  const tabItems = document.querySelectorAll(".tab-item");

  function activateTab(clickedTab) {
    tabItems.forEach((item) => {
      item.classList.remove(
        "bg-selected",
        "dark:bg-selected-color-dark",
        "opacity-100",
        "active"
      );
      item.classList.add("opacity-50");

      const arrow = item.querySelector(".tab-arrow");
      if (arrow) arrow.style.display = "none";
    });

    clickedTab.classList.add(
      "bg-selected",
      "dark:bg-selected-color-dark",
      "opacity-100",
      "active"
    );
    clickedTab.classList.remove("opacity-50");

    const activeArrow = clickedTab.querySelector(".tab-arrow");
    if (activeArrow) activeArrow.style.display = "inline-block";

    document.querySelectorAll(".tab-content").forEach((c) => {
      c.style.display = "none";
    });

    const targetId = clickedTab.getAttribute("data-tab");
    const targetContent = document.getElementById(targetId);
    if (targetContent) targetContent.style.display = "block";
  }

  const firstTab = document.querySelector(".tab-item");
  if (firstTab) activateTab(firstTab);

  tabItems.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  // Overlay kliklənəndə modal bağlansın
  const overlay = document.getElementById("mainEditOverlay");
  const modal = document.getElementById("mainEditModal");

  overlay.addEventListener("click", function (e) {
    if (!modal.contains(e.target)) {
      closeMainEditPopup();
    }
  });

  const closeBtn = document.getElementById("closeEditModalBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeMainEditPopup);

  // Unified create/edit form submit
  const form = document.getElementById("sirket-edit-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = form.elements["id"]?.value?.trim();
      const nameInput =
        document.getElementById("sirket_name") ||
        form.querySelector(
          'input[name="sirket_name"]:not([type="hidden"]):not([disabled])'
        ) ||
        document.querySelector(
          'input[name="sirket_name"]:not([type="hidden"]):not([disabled])'
        );
      const emailInput =
        document.getElementById("email") ||
        form.querySelector(
          'input[name="email"]:not([type="hidden"]):not([disabled])'
        ) ||
        document.querySelector(
          'input[name="email"]:not([type="hidden"]):not([disabled])'
        );
      const payload = {
        sirket_name: nameInput ? nameInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        commission_percentage: Number(
          form.elements["commission_percentage"]?.value || 0
        ),
        authorized_person_name:
          form.elements["authorized_person_name"]?.value?.trim(),
        address: form.elements["address"]?.value?.trim(),
        description: form.elements["description"]?.value?.trim(),
        cashback_percentage: Number(
          form.elements["cashback_percentage"]?.value || 0
        ),
      };
      const opts = {
        method: id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": window.CSRF_TOKEN,
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      };
      const url = id ? `/sirketler/${id}` : "/sirketler";
      try {
        const res = await fetch(url, opts);
        if (!res.ok) return;
        if (typeof window.reloadTable === "function") window.reloadTable();
        closeMainEditPopup();
      } catch (err) {
        console.error(err);
      }
    });
  }
});

document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("File input clicked");
  });
});

//! handleOtpConfirm
function handleOtpConfirm(event) {
  event.preventDefault(); // səhifənin reload olmasının qarşısını alır
  openMainEditPopup(); // main edit modal açılır
}

//!İlkin məlumatlar
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

document.addEventListener("DOMContentLoaded", () => {
  const profileInput = document.getElementById("profileInput");
  const profilePreview = document.getElementById("profilePreview");
  const profileHoverOverlay = document.getElementById("profileHoverOverlay");
  const editBtn = document.getElementById("editProfileBtn");
  const deleteBtn = document.getElementById("deleteProfileBtn");
  const wrapper = document.getElementById("profileWrapper");

  if (!profileInput || !profilePreview || !profileHoverOverlay || !wrapper)
    return;

  // objectURL so we can revoke on delete to avoid memory leaks

  let currentObjectUrl = null;

  // Input change -> show preview
  profileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Yalnız şəkil faylı seçə bilərsən!");
      profileInput.value = "";
      return;
    }

    // Revoke previous URL
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }

    currentObjectUrl = URL.createObjectURL(file);
    profilePreview.src = currentObjectUrl;
    profilePreview.classList.remove("hidden");

    // show overlay (düymələr)
    profileHoverOverlay.classList.remove("hidden");
  });

  // Hover: yalnız preview varsa overlay göstər
  wrapper.addEventListener("mouseenter", () => {
    if (!profilePreview.classList.contains("hidden")) {
      profileHoverOverlay.classList.remove("hidden");
    }
  });

  wrapper.addEventListener("mouseleave", () => {
    // overlay'u gizlədək (amma seçilmiş şəkil qalır)
    profileHoverOverlay.classList.add("hidden");
  });

  // Edit button -> yenidən fayl seç
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // label klikini tetiklemesin
    // trigger file picker
    profileInput.click();
  });

  // Delete button -> sıfırla
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Revoke and clear preview
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    profilePreview.src = "";
    profilePreview.classList.add("hidden");

    // Clear input so same file can be selected again if lazım
    profileInput.value = "";

    // Gizlət overlay
    profileHoverOverlay.classList.add("hidden");
  });
});

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

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".service-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Toggle 'active' class and styling for the clicked button
      if (btn.classList.contains("active")) {
        // If already active, deactivate it
        btn.classList.remove("active", "text-white", "no-hover");
        btn.classList.add("bg-menu", "text-messages", "hover:bg-input-hover");
        btn.style.backgroundColor = ""; // Reset background color
      } else {
        // If not active, activate it
        btn.classList.add("active", "text-white", "no-hover");
        btn.classList.remove(
          "bg-menu",
          "text-messages",
          "hover:bg-input-hover"
        );
        btn.style.backgroundColor = "#9C78AE"; // Set the specific background color
      }
    });
  });
});

//! Əlaqə məlumatları
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("phonePrefixButton");
  const dropdown = document.getElementById("phonePrefixDropdown");
  const selected = document.getElementById("phonePrefixSelected");
  const input = document.getElementById("phonePrefixInput");

  // Aç / bağla menyunu
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  // Seçim edildikdə dəyəri dəyiş
  dropdown.querySelectorAll("[data-value]").forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.getAttribute("data-value");
      selected.textContent = value; // Ekranda göstər
      input.value = value; // Form üçün value
      dropdown.classList.add("hidden");
    });
  });

  // Çöldə kliklənəndə menyunu bağla
  document.addEventListener("click", () => {
    dropdown.classList.add("hidden");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const addButtons = document.querySelectorAll(".add-button");

  // Function to update the visibility of remove buttons for a specific group of items
  function updateRemoveButtonsForCategory(categoryType) {
    let allItems = [];
    let container;
    let initialItem;

    // Identify the container and the initial item for the given category
    if (categoryType === "phone") {
      container = document.getElementById("phoneContainer");
      initialItem = document.querySelector(
        "#tab-contact > div > .removable-item:has(input[placeholder='Telefon nömrənizi daxil edin'])"
      );
    } else if (categoryType === "email") {
      container = document.getElementById("emailContainer");
      initialItem = document.querySelector(
        "#tab-contact > div > .removable-item:has(input[placeholder='Mail adresini daxil edin'])"
      );
    } else if (categoryType === "web") {
      container = document.getElementById("webContainer");
      initialItem = document.querySelector(
        "#tab-contact > div > .removable-item:has(input[placeholder='Linki əlavə edin'])"
      );
    }

    // Collect all items for this category
    if (initialItem) {
      allItems.push(initialItem);
    }
    allItems = allItems.concat(
      Array.from(container.querySelectorAll(".removable-item"))
    );

    const showRemoveButtons = allItems.length > 1; // Show if there's more than one item

    allItems.forEach((item) => {
      const removeBtn = item.querySelector(".remove-btn");
      if (removeBtn) {
        removeBtn.classList.toggle("hidden", !showRemoveButtons);
      }
    });
  }

  // Helper function to attach remove listener (for both initial and dynamically added items)
  function attachRemoveListener(itemElement, categoryType) {
    const removeBtn = itemElement.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        itemElement.remove();
        updateRemoveButtonsForCategory(categoryType); // Update only the relevant category
      });
    }
  }

  // Attach event listeners to the initial static HTML elements on page load
  const initialPhoneItem = document.querySelector(
    "#tab-contact > div > .removable-item:has(input[placeholder='Telefon nömrənizi daxil edin'])"
  );
  if (initialPhoneItem) {
    attachRemoveListener(initialPhoneItem, "phone");
  }

  const initialEmailItem = document.querySelector(
    "#tab-contact > div > .removable-item:has(input[placeholder='Mail adresini daxil edin'])"
  );
  if (initialEmailItem) {
    attachRemoveListener(initialEmailItem, "email");
  }

  const initialWebItem = document.querySelector(
    "#tab-contact > div > .removable-item:has(input[placeholder='Linki əlavə edin'])"
  );
  if (initialWebItem) {
    attachRemoveListener(initialWebItem, "web");
  }

  // Initial update for all categories on page load
  updateRemoveButtonsForCategory("phone");
  updateRemoveButtonsForCategory("email");
  updateRemoveButtonsForCategory("web");

  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");

      if (type === "phone") {
        const phoneContainer = document.getElementById("phoneContainer");
        const uniqueId = Date.now();

        const newPhone = document.createElement("div");
        newPhone.className = "removable-item flex items-center gap-2 mb-2";

        newPhone.innerHTML = `
					<div class="relative inline-block w-20">
						<button id="phonePrefixButton-${uniqueId}" type="button"
							class="w-full border border-stroke dark:border-[#FFFFFF1A] text-xs dark:text-primary-text-color-dark rounded-full px-3 py-[7.5px] text-left flex justify-between items-center">
							<span id="phonePrefixSelected-${uniqueId}">+994</span>
							<svg class="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						<input class="dark:text-primary-text-color-dark" type="hidden" id="phonePrefixInput-${uniqueId}" name="phonePrefix[]" value="+994" />

						<div id="phonePrefixDropdown-${uniqueId}" class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-20 max-h-[168px] overflow-y-scroll dark:border-[#FFFFFF1A] bg-menu dark:bg-menu-dark rounded-[8px] shadow-lg custom-scroll touch-auto hidden z-10">
							<div class="py-2 text-start space-y-2 text-[13px] text-messages dark:text-primary-text-color-dark font-medium ml-1 mr-2">
								<div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+01">+01</div>
								<div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+010">+010</div>
								<div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+099">+099</div>
								<div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+994">+994</div>
								<div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+600">+600</div>
								<div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+100">+100</div>
								<div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+899">+899</div>
							</div>
						</div>
					</div>

					<input type="text" placeholder="Telefon nömrənizi daxil edin"
						class="focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0
										active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
										transition-all ease-out duration-300 flex-1 dark:bg-menu-dark border border-stroke dark:border-[#FFFFFF1A] placeholder:text-[#BFC8CC] dark:placeholder:text-[#636B6F] text-messages dark:text-primary-text-color-dark font-normal rounded-full px-3 py-[7.5px] text-xs" />

					<button type="button" class="remove-btn hidden">
						<div class="icon stratis-trash-01 w-[14px] h-[14px] text-red-500"></div>
					</button>
				`;

        phoneContainer.appendChild(newPhone);
        attachRemoveListener(newPhone, "phone"); // Attach listener for the new item
        updateRemoveButtonsForCategory("phone"); // Update the phone category

        // Prefix dropdown for the newly added item
        const phonePrefixButton = document.getElementById(
          `phonePrefixButton-${uniqueId}`
        );
        const phonePrefixDropdown = document.getElementById(
          `phonePrefixDropdown-${uniqueId}`
        );
        const phonePrefixSelected = document.getElementById(
          `phonePrefixSelected-${uniqueId}`
        );
        const phonePrefixInput = document.getElementById(
          `phonePrefixInput-${uniqueId}`
        );

        phonePrefixButton.addEventListener("click", (e) => {
          e.stopPropagation();
          phonePrefixDropdown.classList.toggle("hidden");
        });

        phonePrefixDropdown.querySelectorAll("[data-value]").forEach((item) => {
          item.addEventListener("click", () => {
            const value = item.getAttribute("data-value");
            phonePrefixSelected.textContent = value;
            phonePrefixInput.value = value;
            phonePrefixDropdown.classList.add("hidden");
          });
        });

        document.addEventListener("click", (e) => {
          if (
            phonePrefixButton.contains(e.target) ||
            phonePrefixDropdown.contains(e.target)
          ) {
            return;
          }
          phonePrefixDropdown.classList.add("hidden");
        });
      }

      if (type === "email") {
        const emailContainer = document.getElementById("emailContainer");

        const wrapper = document.createElement("div");
        wrapper.className = "removable-item flex items-center gap-2 mb-2";

        const newEmail = document.createElement("input");
        newEmail.type = "email";
        newEmail.placeholder = "Mail adresini daxil edin";
        newEmail.className = `focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0
									active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
									transition-all ease-out duration-300
									w-full border border-stroke dark:border-[#FFFFFF1A] dark:bg-menu-dark placeholder:text-[#BFC8CC] dark:placeholder:text-[#636B6F] text-messages dark:text-primary-text-color-dark font-normal rounded-full px-3 py-[7.5px] text-xs`;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-btn hidden";
        removeBtn.innerHTML = `<div class="icon stratis-trash-01 w-[14px] h-[14px] text-red-500"></div>`;
        wrapper.appendChild(newEmail);
        wrapper.appendChild(removeBtn);

        emailContainer.appendChild(wrapper);
        attachRemoveListener(wrapper, "email"); // Attach listener for the new item
        updateRemoveButtonsForCategory("email"); // Update the email category
      }

      if (type === "web") {
        const webContainer = document.getElementById("webContainer");

        const wrapper = document.createElement("div");
        wrapper.className = "removable-item flex items-center gap-2 mb-2";

        const newWeb = document.createElement("div");
        newWeb.className =
          "focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus-within:ring-0 transition-all ease-out duration-300 flex items-center flex-1 border border-stroke dark:border-[#FFFFFF1A] rounded-full overflow-hidden";
        newWeb.innerHTML = `
					<div class="flex items-center pl-4 pr-3 bg-white dark:bg-menu-dark border-r-[.5px] border-stroke dark:border-[#FFFFFF1A]">
						<span class="text-gray-700 dark:text-primary-text-color-dark text-sm">https://</span>
					</div>
					<input type="text" placeholder="Linki əlavə edin"
						class="dark:bg-menu-dark flex-1 py-[9px] pr-4 text-xs font-normal dark:bg-menu-dark placeholder:text-secondary-text dark:placeholder:text-[#636B6F] text-messages dark:text-primary-text-color-dark border-none outline-none focus:ring-0" />
				`;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-btn hidden";
        removeBtn.innerHTML = `<div class="icon stratis-trash-01 w-[14px] h-[14px] text-red-500"></div>`;
        wrapper.appendChild(newWeb);
        wrapper.appendChild(removeBtn);

        webContainer.appendChild(wrapper);
        attachRemoveListener(wrapper, "web"); // Attach listener for the new item
        updateRemoveButtonsForCategory("web"); // Update the web category
      }
    });
  });
});

//! İş qrafiki
document.addEventListener("DOMContentLoaded", function () {
  const timeInputs = document.querySelectorAll(".time-input");
  const dayToggles = document.querySelectorAll(".day-toggle");
  const toggleSwitches = document.querySelectorAll(".toggle-switch");

  // Toggle switch click handler
  toggleSwitches.forEach((switchElement) => {
    switchElement.addEventListener("click", function (e) {
      const day = this.getAttribute("data-day");
      const toggle = document.querySelector(`.day-toggle[data-day="${day}"]`);
      if (toggle) {
        toggle.checked = !toggle.checked;
        toggle.dispatchEvent(new Event("change", { bubbles: true }));
      }
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Time input formatting
  timeInputs.forEach((input) => {
    input.addEventListener("input", function (e) {
      let value = e.target.value;
      value = value.replace(/\D/g, "");

      if (value.length >= 3) {
        value = value.slice(0, 2) + ":" + value.slice(2, 4);
      }

      if (value.length > 5) {
        value = value.slice(0, 5);
      }

      if (value.length >= 2) {
        const hour = parseInt(value.slice(0, 2));
        if (hour > 23) {
          value = "23" + value.slice(2);
        }
      }

      if (value.length === 5) {
        const minute = parseInt(value.slice(3, 5));
        if (minute > 59) {
          value = value.slice(0, 3) + "59";
        }
      }

      e.target.value = value;
    });

    input.addEventListener("keydown", function (e) {
      if (
        e.key === "Backspace" &&
        e.target.value.length === 3 &&
        e.target.value.endsWith(":")
      ) {
        e.target.value = e.target.value.slice(0, 2);
        e.preventDefault();
      }
    });
  });

  // Day toggle functionality
  function updateDayState(toggle) {
    const day = toggle.getAttribute("data-day");
    const dayInputs = document.querySelectorAll(
      `.time-input[data-day="${day}"]`
    );
    const dayLabel = document.querySelector(`[data-day-label="${day}"]`);
    const isEnabled = toggle.checked;

    dayInputs.forEach((input) => {
      input.disabled = !isEnabled;

      if (!isEnabled) {
        input.value = "";
      }
    });

    if (dayLabel) {
      dayLabel.style.opacity = isEnabled ? "0.5" : "0.3";
    }
  }

  // Initialize all toggles
  dayToggles.forEach((toggle) => {
    updateDayState(toggle);

    toggle.addEventListener("change", function () {
      updateDayState(this);
    });
  });

  // Form validation
  const scheduleForm = document.querySelector("form");
  if (scheduleForm) {
    scheduleForm.addEventListener("submit", function (e) {
      const dayToggles = document.querySelectorAll(".day-toggle");
      let hasValidSchedule = false;
      let validationError = null;

      dayToggles.forEach((toggle) => {
        if (toggle.checked) {
          const day = toggle.getAttribute("data-day");
          const startInput = document.querySelector(
            `input[name="${day}_start"]`
          );
          const endInput = document.querySelector(`input[name="${day}_end"]`);

          if (!startInput.value || !endInput.value) {
            validationError = `Xəta: ${day} üçün hər iki saat sahəsi doldurulmalıdır.`;
            return;
          }

          if (startInput.value >= endInput.value) {
            validationError = `Xəta: ${day} üçün bağlanış saatı açılış saatından sonra olmalıdır.`;
            return;
          }

          hasValidSchedule = true;
        }
      });

      if (validationError) {
        e.preventDefault();
        alert(validationError);
      } else if (!hasValidSchedule) {
        e.preventDefault();
        alert("Xəta: Ən azı bir gün üçün iş qrafiki təyin edilməlidir.");
      }
    });
  }
});

//! Muqavile tab
document.addEventListener("DOMContentLoaded", () => {
  const tab = document.querySelector("#tab-muqavile");
  if (!tab || tab.dataset.listenerAttached) return;
  tab.dataset.listenerAttached = "true";
  const dropArea = document.querySelector("#tab-muqavile .bg-container");
  if (!dropArea) return;

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  // Event delegation için düzeltilmiş kontrol
  document
    .querySelector("#tab-muqavile")
    .addEventListener("click", function (e) {
      // Sil butonuna tıklandığında
      if (
        e.target.classList.contains("delete-muqavile") ||
        e.target.closest(".delete-muqavile")
      ) {
        e.preventDefault();
        e.stopPropagation();
        const fileElement = e.target.closest(".uploaded-file");
        if (fileElement) {
          fileElement.remove();
        }
      }

      // Drop area veya içindeki elementlere tıklandığında (sil butonu hariç)
      if (
        e.target.closest(".bg-container") &&
        !e.target.closest(".delete-muqavile")
      ) {
        fileInput.click();
      }
    });

  // File change
  fileInput.addEventListener("change", (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      showUploadedFile(file.name);
    }
  });

  // Drag and drop
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "#88649A";
    dropArea.style.backgroundColor = "rgba(136, 100, 154, 0.1)";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "";
    dropArea.style.backgroundColor = "";
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "";
    dropArea.style.backgroundColor = "";

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      showUploadedFile(file.name);
    }
  });

  function showUploadedFile(fileName) {
    // Eski dosyayı temizle
    const oldFile = document.querySelector("#tab-muqavile .uploaded-file");
    if (oldFile) oldFile.remove();

    // Yeni dosyayı göster
    const fileHTML = `
      <div class="p-3 uploaded-file">
        <div class="flex items-center justify-between gap-4">
          <span class="text-xs font-medium">${fileName}</span>
          <button type="button" class="icon stratis-trash-01 w-4 h-4 text-error delete-muqavile"></button>
        </div>
      </div>
    `;

    dropArea.insertAdjacentHTML("afterend", fileHTML);
  }
});

//! Selahiyyetli şəxs tab
document.addEventListener("DOMContentLoaded", () => {
  const dropdownContainer = document.querySelector(
    ".phone-code-dropdown-container"
  );
  const dropdownButton = dropdownContainer.querySelector(".phone-code-button");
  const selectedValueSpan = dropdownButton.querySelector(
    ".phone-code-selected-value"
  );
  const dropdownMenu = dropdownContainer.querySelector(".phone-code-menu");
  const dropdownValues = dropdownMenu.querySelectorAll(".phone-code-item");

  // Düyməyə basanda dropdown-u aç və ya bağla
  dropdownButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  // Dropdown elementlərini dinlə
  dropdownValues.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedValue = item.getAttribute("data-value");
      selectedValueSpan.textContent = selectedValue;
      dropdownMenu.classList.add("hidden"); // Seçim edildikdən sonra dropdown-u bağla
    });
  });

  // Hər hansı bir yerə klikləyəndə, əgər dropdown və ya düyməyə kliklənməyibsə, onu bağla
  document.addEventListener("click", (event) => {
    if (!dropdownContainer.contains(event.target)) {
      dropdownMenu.classList.add("hidden");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const positiondropdownBtn = document.getElementById(
    "activityButtonPositionDropdown"
  );
  const positionDropdownText = document.getElementById(
    "activityButtonTextPositionDropdown"
  );
  const positionDropdownList = document.getElementById(
    "activityListPositionDropdown"
  );
  const positionOptions = positionDropdownList.querySelectorAll(
    ".position-dropdown-option"
  );

  // Toggle dropdown open/close
  positiondropdownBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    positionDropdownList.classList.toggle("hidden");
  });

  // Close dropdown if clicking outside
  document.addEventListener("click", function () {
    positionDropdownList.classList.add("hidden");
  });

  // Handle option selection
  positionOptions.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.stopPropagation();
      positionDropdownText.textContent = option.textContent;
      positionDropdownList.classList.add("hidden");
      console.log("Selected value:", option.getAttribute("data-value"));
    });
  });
});

//! Sosial media tab
document.querySelectorAll(".platform").forEach((platformEl) => {
  const addBtn = platformEl.querySelector('[data-role="addBtn"]');
  const inputGroup = platformEl.querySelector('[data-role="inputGroup"]');
  const submitBtn = platformEl.querySelector('[data-role="submitBtn"]');
  const cancelBtn = platformEl.querySelector('[data-role="cancelBtn"]');
  const linkInput = platformEl.querySelector('[data-role="linkInput"]');
  const linkDisplay = platformEl.querySelector('[data-role="linkDisplay"]');
  const linkHref = platformEl.querySelector('[data-role="linkHref"]');
  const removeBtn = platformEl.querySelector('[data-role="removeBtn"]');

  // Aç
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addBtn.classList.add("hidden");
    inputGroup.classList.remove("hidden");
    inputGroup.classList.add("flex");
  });

  // Əlavə et
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const value = linkInput.value.trim();
    if (value) {
      inputGroup.classList.add("hidden");
      linkDisplay.classList.remove("hidden");
      linkDisplay.classList.add("flex");
      linkHref.href = value.startsWith("http") ? value : "https://" + value;
      linkHref.textContent = linkHref.href;
    }
  });

  // İmtina
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    linkInput.value = "";
    inputGroup.classList.add("hidden");
    addBtn.classList.remove("hidden");
  });

  // Sil
  removeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    linkInput.value = "";
    linkDisplay.classList.add("hidden");
    addBtn.classList.remove("hidden");
  });
});

// Card selection functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get all card checkboxes
  const cardCheckboxes = document.querySelectorAll('input[name="cards[]"]');

  cardCheckboxes.forEach((checkbox, index) => {
    // Find the toggle switch div (the visual element)
    const label = checkbox.closest("label");
    const toggleSwitch = label?.querySelector('div[class*="w-11 h-6"]');
    // Find the specific card container
    const cardContainer = checkbox.closest(
      'div[class*="border-b"][class*="flex"][class*="justify-between"]'
    );

    if (toggleSwitch) {
      // Style the toggle switch to show it's clickable
      toggleSwitch.style.cursor = "pointer";

      // Add click handler to the toggle switch div itself
      toggleSwitch.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Toggle the hidden checkbox
        checkbox.checked = !checkbox.checked;

        // Trigger change event manually
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    // Add change handler for visual feedback
    checkbox.addEventListener("change", function () {
      if (cardContainer) {
        if (this.checked) {
          // Add visual feedback for selected state
          cardContainer.style.backgroundColor = "rgba(0, 123, 255, 0.1)";
          cardContainer.style.borderColor = "#007bff";
          cardContainer.style.borderWidth = "2px";
          cardContainer.style.borderStyle = "solid";
          cardContainer.style.borderRadius = "8px";
        } else {
          // Remove visual feedback for unselected state
          cardContainer.style.backgroundColor = "";
          cardContainer.style.borderColor = "";
          cardContainer.style.borderWidth = "";
          cardContainer.style.borderStyle = "";
          cardContainer.style.borderRadius = "";
        }
      } else {
        console.warn("Card container not found for checkbox:", this.value);
      }

      // Log selected cards for debugging
      const selectedCards = Array.from(cardCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);
    });
  });

  // Add a global function to test card selection
  window.testCardSelection = function () {
    const cardCheckboxes = document.querySelectorAll('input[name="cards[]"]');

    const selectedCards = Array.from(cardCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    return selectedCards;
  };

  // Add a global function to debug CSRF and form
  window.debugForm = function () {
    const form = document.getElementById("saveMuessiseForm");

    if (form) {
      const csrfInput = form.querySelector('input[name="_csrf"]');

      // Check all form inputs
      const formData = new FormData(form);
    }
  };
});
