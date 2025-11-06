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

document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("File input clicked");
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
  const toggleBtn = document.getElementById("dropdownToggle");
  const dropdown = document.getElementById("dropdownList");
  const selected = document.getElementById("dropdownSelected");
  const hiddenInput = document.getElementById("categoryInput");

  // Aç/bağla menyu
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  // Seçim edəndə dəyəri göstər və menyunu bağla
  dropdown.querySelectorAll("li[data-value]").forEach((item) => {
    item.addEventListener("click", () => {
      const value = item.getAttribute("data-value");
      selected.textContent = value;
      hiddenInput.value = value;
      dropdown.classList.add("hidden");
    });
  });

  // Çöldə kliklənəndə menyunu bağla
  document.addEventListener("click", () => {
    dropdown.classList.add("hidden");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const serviceLabels = document.querySelectorAll(".service-btn");

  serviceLabels.forEach((label) => {
    label.addEventListener("click", () => {
      const checkbox = label.querySelector(".service-checkbox");

      if (checkbox) {
        // Toggle the checkbox
        checkbox.checked = !checkbox.checked;

        // Update visual styling based on checkbox state
        if (checkbox.checked) {
          // Service is selected - apply selected styling
          label.classList.add("active");
          label.style.backgroundColor = "#9C78AE";
          label.style.color = "white";
          label.style.borderColor = "#9C78AE";
          console.log("Service selected:", checkbox.value);
        } else {
          // Service is deselected - reset to default styling
          label.classList.remove("active");
          label.style.backgroundColor = "";
          label.style.color = "";
          label.style.borderColor = "";
          console.log("Service deselected:", checkbox.value);
        }
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

  timeInputs.forEach((input) => {
    input.addEventListener("input", function (e) {
      let value = e.target.value;

      // Remove any non-digit characters
      value = value.replace(/\D/g, "");

      // Format as HH:MM
      if (value.length >= 3) {
        value = value.slice(0, 2) + ":" + value.slice(2, 4);
      }

      // Limit to 5 characters (HH:MM)
      if (value.length > 5) {
        value = value.slice(0, 5);
      }

      // Validate hour (00-23)
      if (value.length >= 2) {
        const hour = parseInt(value.slice(0, 2));
        if (hour > 23) {
          value = "23" + value.slice(2);
        }
      }

      // Validate minute (00-59)
      if (value.length === 5) {
        const minute = parseInt(value.slice(3, 5));
        if (minute > 59) {
          value = value.slice(0, 3) + "59";
        }
      }

      e.target.value = value;
    });

    // Handle backspace for colon
    input.addEventListener("keydown", function (e) {
      if (
        e.key === "Backspace" &&
        e.target.value.length === 3 &&
        e.target.value.endsWith(":")
      ) {
        e.target.value = e.target.value.slice(0, -1);
      }
    });
  });
});

//! Muqavile tab
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.querySelector("#tab-muqavile .bg-container-2");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.style.display = "none";
  dropArea.appendChild(fileInput);

  // Original rənglər
  const originalBgColor = "#ffffff";
  const originalBorderColor = "#e5e7eb";

  // Fayl seçmə sahəsinə klik
  dropArea.addEventListener("click", () => {
    fileInput.click();
  });

  // Fayl seçildikdə
  fileInput.addEventListener("change", (event) => {
    handleFiles(event.target.files);
  });

  // Drag & Drop
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.style.backgroundColor = "rgba(136, 100, 154, 0.1)";
    dropArea.style.borderColor = "#88649A";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.style.backgroundColor = originalBgColor;
    dropArea.style.borderColor = originalBorderColor;
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.style.backgroundColor = originalBgColor;
    dropArea.style.borderColor = originalBorderColor;
    handleFiles(event.dataTransfer.files);
  });

  // Faylların işlənməsi funksiyası
  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      const fileName = file.name;

      // Seçilən faylı səhifədə göstər
      const uploadedFileContainer = document.createElement("div");
      uploadedFileContainer.classList.add("p-3");
      uploadedFileContainer.innerHTML = `
        <div class="flex items-center justify-between gap-4">
          <span class="text-xs font-medium">${fileName}</span>
          <button type="button" class="icon stratis-trash-01 w-4 h-4 text-error"></button>
        </div>
      `;

      const parentContainer = document.querySelector("#tab-muqavile");
      parentContainer.appendChild(uploadedFileContainer);

      // Silmə düyməsi
      const deleteButton = uploadedFileContainer.querySelector("button");
      deleteButton.addEventListener("click", (e) => {
        e.preventDefault(); // səhifə refresh olmasın
        e.stopPropagation(); // modal bağlanmasın
        uploadedFileContainer.remove();
      });
    }
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

      // Update hidden input for form submission
      const hiddenInput = dropdownContainer.querySelector(
        ".phone-code-hidden-input"
      );
      if (hiddenInput) {
        hiddenInput.value = selectedValue;
        console.log("Phone prefix updated to:", selectedValue);
      }

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

  // Get platform name from data-platform attribute
  const platformName = platformEl.getAttribute("data-platform");

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

      const fullUrl = value.startsWith("http") ? value : "https://" + value;
      linkHref.href = fullUrl;
      linkHref.textContent = fullUrl;

      // Create hidden input for form submission
      let hiddenInput = platformEl.querySelector(
        `input[name="social_media[${platformName}]"]`
      );
      if (!hiddenInput) {
        hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = `social_media[${platformName}]`;
        platformEl.appendChild(hiddenInput);
      }
      hiddenInput.value = fullUrl;

      console.log(`Added social media link for ${platformName}:`, fullUrl);
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

    // Remove hidden input when link is removed
    const hiddenInput = platformEl.querySelector(
      `input[name="social_media[${platformName}]"]`
    );
    if (hiddenInput) {
      hiddenInput.remove();
      console.log(`Removed social media link for ${platformName}`);
    }
  });
});

// Card selection functionality
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing card selection functionality...");

  // Get all card checkboxes
  const cardCheckboxes = document.querySelectorAll('input[name="cards[]"]');
  console.log("Found", cardCheckboxes.length, "card checkboxes");

  cardCheckboxes.forEach((checkbox, index) => {
    console.log(`Card ${index + 1}:`, {
      id: checkbox.value,
      checked: checkbox.checked,
    });

    // Find the toggle switch div (the visual element)
    const label = checkbox.closest("label");
    const toggleSwitch = label?.querySelector('div[class*="w-11 h-6"]');
    // Find the specific card container
    const cardContainer = checkbox.closest(
      'div[class*="border-b"][class*="flex"][class*="justify-between"]'
    );

    console.log(`Card ${index + 1} elements:`, {
      hasLabel: !!label,
      hasToggleSwitch: !!toggleSwitch,
      hasCardContainer: !!cardContainer,
    });

    if (toggleSwitch) {
      // Style the toggle switch to show it's clickable
      toggleSwitch.style.cursor = "pointer";

      // Add click handler to the toggle switch div itself
      toggleSwitch.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("Toggle switch clicked for card:", checkbox.value);

        // Toggle the hidden checkbox
        checkbox.checked = !checkbox.checked;

        // Trigger change event manually
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    // Add change handler for visual feedback
    checkbox.addEventListener("change", function () {
      console.log(
        "Card checkbox changed:",
        this.value,
        "checked:",
        this.checked
      );

      if (cardContainer) {
        if (this.checked) {
          // Add visual feedback for selected state
          cardContainer.style.backgroundColor = "rgba(0, 123, 255, 0.1)";
          cardContainer.style.borderColor = "#007bff";
          cardContainer.style.borderWidth = "2px";
          cardContainer.style.borderStyle = "solid";
          cardContainer.style.borderRadius = "8px";
          console.log("Applied selected styling to card:", this.value);
        } else {
          // Remove visual feedback for unselected state
          cardContainer.style.backgroundColor = "";
          cardContainer.style.borderColor = "";
          cardContainer.style.borderWidth = "";
          cardContainer.style.borderStyle = "";
          cardContainer.style.borderRadius = "";
          console.log("Removed selected styling from card:", this.value);
        }
      } else {
        console.warn("Card container not found for checkbox:", this.value);
      }

      // Log selected cards for debugging
      const selectedCards = Array.from(cardCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

      console.log("Currently selected cards:", selectedCards);
    });
  });

  // Add a global function to test card selection
  window.testCardSelection = function () {
    const cardCheckboxes = document.querySelectorAll('input[name="cards[]"]');
    console.log("=== Card Selection Test ===");
    console.log("Total card checkboxes found:", cardCheckboxes.length);

    cardCheckboxes.forEach((checkbox, index) => {
      console.log(`Card ${index + 1}:`, {
        value: checkbox.value,
        checked: checkbox.checked,
        visible: !checkbox.classList.contains("sr-only"),
      });
    });

    const selectedCards = Array.from(cardCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    console.log("Currently selected cards:", selectedCards);
    console.log("========================");
    return selectedCards;
  };

  console.log(
    "Card selection functionality initialized. Use testCardSelection() to debug."
  );

  // Add a global function to debug CSRF and form
  window.debugForm = function () {
    console.log("=== Form Debug Info ===");

    const form = document.getElementById("saveMuessiseForm");
    console.log("Form element found:", !!form);

    if (form) {
      console.log("Form action:", form.getAttribute("action"));
      console.log("Form data-url:", form.getAttribute("data-url"));
      console.log("Form method:", form.getAttribute("method"));

      const csrfInput = form.querySelector('input[name="_csrf"]');
      console.log("CSRF input found:", !!csrfInput);
      if (csrfInput) {
        console.log("CSRF token value:", csrfInput.value);
        console.log("CSRF token length:", csrfInput.value?.length);
      }

      // Check all form inputs
      const formData = new FormData(form);
      console.log("Current form data:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
    }

    // Check cookies for CSRF
    console.log("Document cookies:", document.cookie);

    console.log("======================");
  };

  console.log("Use debugForm() to check CSRF token and form structure.");
});

