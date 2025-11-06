function openMainEditPopup() {
  const overlay = document.getElementById("mainEditOverlay");
  if (overlay) overlay.style.display = "flex";
}

function closeMainEditPopup() {
  const overlay = document.getElementById("mainEditOverlay");
  if (overlay) overlay.style.display = "none";
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

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("dropdownToggle");
  const dropdown = document.getElementById("dropdownList");
  const selected = document.getElementById("dropdownSelected");

  // Aç/bağla menyu
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  // Seçim edəndə dəyəri göstər və menyunu bağla
  dropdown.querySelectorAll("li[data-value]").forEach((item) => {
    item.addEventListener("click", () => {
      selected.textContent = item.getAttribute("data-value");
      dropdown.classList.add("hidden");
    });
  });

  // Çöldə kliklənəndə menyunu bağla
  document.addEventListener("click", () => {
    dropdown.classList.add("hidden");
  });
});

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

// Days
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

document.addEventListener("DOMContentLoaded", () => {
  const openPopupBtn = document.getElementById("openPopupBtn");
  const popupOverlay = document.getElementById("popupOverlay");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const cancelPopupBtn = document.getElementById("cancelPopupBtn"); // ✅ Ləğv et düyməsi

  // Popup aç
  function showPopup() {
    popupOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  // Popup bağla
  function hidePopup() {
    popupOverlay.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // Aç düyməsinə kliklə
  openPopupBtn?.addEventListener("click", showPopup);

  // X düyməsinə kliklə
  closePopupBtn?.addEventListener("click", hidePopup);

  // ✅ Ləğv et düyməsinə kliklə
  cancelPopupBtn?.addEventListener("click", hidePopup);

  // Popup fonuna kliklə (yalnız overlay-ə)
  popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
      hidePopup();
    }
  });

  // Escape ilə bağla
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !popupOverlay.classList.contains("hidden")) {
      hidePopup();
    }
  });
});

// openRestaurantDetailPopup
function openRestaurantDetailPopup() {
  const popup = document.getElementById("restaurantDetailPopup");
  popup.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

$(document).on("click", ".show-history-btn", function () {
  const selectedRadio = $("input[name='rowHistorySelectRadio']:checked");
  const historyId = selectedRadio.val();
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  if (!historyId) {
    return alertModal("Zəhmət olmasa bir versiyanı seçin.", "error");
  }

  $.ajax({
    type: "POST",
    url: "/muessise-info/history-details",
    headers: {
      "CSRF-Token": csrfToken,
    },
    data: { history_id: historyId },
    success: function (res) {
      if (!res.success || !res.data) {
        $(".show-history-btn").addClass("hidden");
        alertModal("Məlumat tapılmadı", "error");
        return;
      }

      $(".show-history-btn").removeClass("hidden");
      fillRestaurantPopup(res.data);
    },
    error: function (err) {
      console.error("Xəta baş verdi:", err);
      alertModal("Serverlə əlaqə alınmadı", "error");
    },
  });
});

function fillRestaurantPopup(data) {
  const popup = $("#restaurantDetailPopup");

  popup
    .find(".text-[15px].font-medium")
    .text(data.muessise_name || "Ad yoxdur");
  popup.find(".restaurant-name").text(data.muessise_name || "Ad yoxdur");
  popup
    .find(".restaurant-description")
    .text(data.description || "Təsvir yoxdur");
  popup.find(".restaurant-address").text(data.address || "Ünvan yoxdur");


  const phoneList = data.phone || [];
  const uniquePhones = Array.from(new Set(
    phoneList.map(p => `${p.prefix} ${p.number}`)
  ));
  const phoneContainer = popup.find(".phone-wrapper");
  phoneContainer.empty();
  if (uniquePhones.length === 0) {
    phoneContainer.append(`
    <div class="flex gap-[11px] items-center text-messages">
      <span class="icon iconex-calling-1 !w-[16px] !h-[16px] dark:text-[#FFFFFF]"></span>
      <span class="opacity-65 text-[13px] font-normal dark:text-[#FFFFFF]">Telefon yoxdur</span>
    </div>
  `);
  } else {
    uniquePhones.forEach((phone, index) => {
      const mtClass = index === 0 ? "" : "mt-3";
      phoneContainer.append(`
      <div class="flex gap-[11px] items-center text-messages ${mtClass}">
        <span class="icon iconex-calling-1 !w-[16px] !h-[16px] dark:text-[#FFFFFF]"></span>
        <span class="opacity-65 text-[13px] font-normal dark:text-[#FFFFFF] restaurant-phones">${phone}</span>
      </div>
    `);
    });
  }

  const schedule = data.schedule || {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const imgBasePath = "/images/muessise melumatlari images/Frame 427321302";

  const scheduleContainer = popup.find(".restaurant-schedule-wrapper");
  scheduleContainer.empty();

  days.forEach((day, index) => {
    const imgSrc = `${imgBasePath}${index === 0 ? '' : ` (${index})`}.svg`;
    const workHours = schedule[day] || "İş günü yoxdur";

    // Əgər bu sunday-dirsə (yəni index === 6)
    if (index === 6) {
      scheduleContainer.append(`
      <div class="flex items-center gap-2">
        <img class="w-[34px] h-[34px]" src="${imgSrc}" alt="${day}" />
        <span class="text-xs text-[#000] opacity-70">${workHours} PM</span>
      </div>
    `);
    } else {
      scheduleContainer.append(`
      <div class="relative group">
        <img class="w-[34px] h-[34px]" src="${imgSrc}" alt="${day}" />
        <div
          class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs text-on-primary bg-messages rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
          ${workHours}
          <div
            class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-[8px] border-t-messages border-transparent z-15">
          </div>
        </div>
      </div>
    `);
    }
  });


  const cardsContainer = popup.find(".resturant-cards");
  cardsContainer.empty();
  data.cards.forEach(card => {
    const cardHtml = `
  <div style="background-color: ${card.background_color}" class="w-[84px] h-[27px] flex gap-1 items-center justify-center rounded-full resturant-cards">
    <img class="w-[16px] h-[16px]" src="${card.icon}" alt="${card.name}" />
    <span class="font-normal text-[12px] text-messages">${card.name}</span>
  </div>
`;
    cardsContainer.append(cardHtml);


  });


  const emailList = data.email || [];
  const uniqueEmails = Array.from(new Set(emailList));
  const emailContainer = popup.find(".restaurant-email-wrapper");
  emailContainer.empty();

  if (uniqueEmails.length === 0) {
    emailContainer.append(`
    <div class="flex gap-[11px] items-center text-messages">
      <span class="icon iconex-case-1 !w-[17px] !h-[16px] dark:text-[#FFFFFF]"></span>
      <span class="opacity-65 text-[13px] font-normal dark:text-[#FFFFFF]">Email yoxdur</span>
    </div>
  `);
  } else {
    uniqueEmails.forEach((email, index) => {
      const mtClass = index === 0 ? "" : "mt-3";
      emailContainer.append(`
      <div class="flex gap-[11px] items-center text-messages ${mtClass}">
        <span class="icon iconex-case-1 !w-[17px] !h-[16px] dark:text-[#FFFFFF]"></span>
        <span class="opacity-65 text-[13px] font-normal dark:text-[#FFFFFF] restaurant-emails">${email}</span>
      </div>
    `);
    });
  }


  const category = data.muessise_category || "Kateqoriya yoxdur";
  popup.find(".restaurant-category").text(category);


  const createdAt = data.createdAt;
  const userName = data.user_id ? `${data.user_id.name} ${data.user_id.surname}`.trim() : "Ad yoxdur";
  let formattedDate = "Tarix yoxdur";
  if (createdAt) {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    formattedDate = `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
  }
  const result = `${userName} / ${formattedDate}`;
  popup.find(".date-and-name").text(result);


  const servicesContainer = popup.find(".restaurant-services");
  servicesContainer.empty();
  (data.services || []).forEach((service) => {
    servicesContainer.append(
      `<div class="w-fit h-[27px] bg-focus text-[12px] text-on-primary flex items-center justify-center rounded-full px-3">${service}</div>`
    );
  });

  const socialContainer = popup.find(".restaurant-social");
  socialContainer.empty();
  Object.entries(data.social || {}).forEach(([platform, url]) => {
    const iconPath = getSocialIconPath(platform);
    socialContainer.append(`
      <div class="flex item-center justify-between p-3 border-b border-[#0000001A] dark:border-[#FFFFFF1A] hover:bg-table-hover dark:hover:bg-[#242C30] cursor-pointer">
        <div class="flex gap-2 items-center">
          <img src="${iconPath}" alt="${platform}" />
          <span class="text-[13px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">${capitalize(
      platform
    )}</span>
        </div>
        <a href="${url}" target="_blank">
          <div class="icon stratis-link-external w-4 h-4 text-xs mt-1 text-messages dark:text-primary-text-color-dark"></div>
        </a>
      </div>
    `);
  });

  const websitesContainer = popup.find(".restaurant-websites");
  websitesContainer.empty();
  (data.website || []).forEach((site) => {
    websitesContainer.append(`
      <div class="p-3 flex gap-2 items-center hover:bg-table-hover dark:hover:bg-[#242C30] cursor-pointer">
        <div class="icon iconex-link-1 w-[9px] h-[17px] dark:text-[#FFFFFF]"></div>
        <a href="${site}" target="_blank" class="text-[13px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">${site}</a>
      </div>
    `);
  });

  popup.removeClass("hidden");
  document.body.style.overflow = "hidden";
}

function getSocialIconPath(platform) {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return "/images/muessise melumatlari images/devicon_linkedin.svg";
    case "instagram":
      return "/images/muessise melumatlari images/skill-icons_instagram.svg";
    case "facebook":
      return "/images/muessise melumatlari images/devicon_facebook.svg";
    default:
      return "/images/muessise melumatlari images/devicon_linkedin.svg";
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeRestaurantDetailPopup() {
  const popup = document.getElementById("restaurantDetailPopup");
  popup.classList.add("hidden");
  document.body.style.overflow = ""; // scroll açılır
}

document
  .getElementById("restaurantDetailPopup")
  .addEventListener("click", function (e) {
    // Əgər klik fon hissəsinədirsə (yəni içəridəki content-ə deyil)
    if (e.target === this) {
      closeRestaurantDetailPopup();
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("addBtn");
  const inputGroup = document.getElementById("inputGroup");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const linkInput = document.getElementById("linkInput");
  const linkDisplay = document.getElementById("linkDisplay");
  const linkHref = document.getElementById("linkHref");
  const removeBtn = document.getElementById("removeBtn");

  // Hesab linkini əlavə et → input açılır
  addBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    addBtn.classList.add("hidden");
    inputGroup.classList.remove("hidden");
    inputGroup.classList.add("flex");
  });

  // Əlavə et → link göstərilir
  submitBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const value = linkInput.value.trim();
    if (value) {
      inputGroup.classList.add("hidden");
      linkDisplay.classList.remove("hidden");
      linkDisplay.classList.add("flex");
      linkHref.href = "https://" + value;
      linkHref.textContent = "https://" + value;
    }
  });

  // X (iptal) → geri qayıt
  cancelBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    linkInput.value = "";
    inputGroup.classList.add("hidden");
    addBtn.classList.remove("hidden");
  });

  // X (sil) → geri qayıt
  removeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    linkInput.value = "";
    linkDisplay.classList.add("hidden");
    addBtn.classList.remove("hidden");
  });

  // Popup bağlanmasın
  const popup = document.getElementById("popup");
  if (popup) {
    popup.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
});

const threadsAddBtn = document.getElementById("threadsAddBtn");
const threadsInputGroup = document.getElementById("threadsInputGroup");
const threadsSubmitBtn = document.getElementById("threadsSubmitBtn");
const threadsCancelBtn = document.getElementById("threadsCancelBtn");
const threadsLinkInput = document.getElementById("threadsLinkInput");
const threadsLinkDisplay = document.getElementById("threadsLinkDisplay");
const threadsLinkHref = document.getElementById("threadsLinkHref");
const threadsRemoveBtn = document.getElementById("threadsRemoveBtn");

// Aç: Hesab linkini əlavə et → input görünür
threadsAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  threadsAddBtn.classList.add("hidden");
  threadsInputGroup.classList.remove("hidden");
  threadsInputGroup.classList.add("flex");
});

// Əlavə et: linki göstər
threadsSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = threadsLinkInput.value.trim();
  if (value) {
    threadsInputGroup.classList.add("hidden");
    threadsLinkDisplay.classList.remove("hidden");
    threadsLinkDisplay.classList.add("flex");
    threadsLinkHref.href = "https://" + value;
    threadsLinkHref.textContent = "https://" + value;
  }
});

// İptal et: geri qayıt
threadsCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  threadsLinkInput.value = "";
  threadsInputGroup.classList.add("hidden");
  threadsAddBtn.classList.remove("hidden");
});

// Sil: geri qayıt
threadsRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  threadsLinkInput.value = "";
  threadsLinkDisplay.classList.add("hidden");
  threadsAddBtn.classList.remove("hidden");
});

const facebookAddBtn = document.getElementById("facebookAddBtn");
const facebookInputGroup = document.getElementById("facebookInputGroup");
const facebookSubmitBtn = document.getElementById("facebookSubmitBtn");
const facebookCancelBtn = document.getElementById("facebookCancelBtn");
const facebookLinkInput = document.getElementById("facebookLinkInput");
const facebookLinkDisplay = document.getElementById("facebookLinkDisplay");
const facebookLinkHref = document.getElementById("facebookLinkHref");
const facebookRemoveBtn = document.getElementById("facebookRemoveBtn");

// Açılsın
facebookAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  facebookAddBtn.classList.add("hidden");
  facebookInputGroup.classList.remove("hidden");
  facebookInputGroup.classList.add("flex");
});

// Əlavə et
facebookSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = facebookLinkInput.value.trim();
  if (value) {
    facebookInputGroup.classList.add("hidden");
    facebookLinkDisplay.classList.remove("hidden");
    facebookLinkDisplay.classList.add("flex");
    facebookLinkHref.href = "https://" + value;
    facebookLinkHref.textContent = "https://" + value;
  }
});

// İmtina et
facebookCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  facebookLinkInput.value = "";
  facebookInputGroup.classList.add("hidden");
  facebookAddBtn.classList.remove("hidden");
});

// Sil
facebookRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  facebookLinkInput.value = "";
  facebookLinkDisplay.classList.add("hidden");
  facebookAddBtn.classList.remove("hidden");
});

const linkedinAddBtn = document.getElementById("linkedinAddBtn");
const linkedinInputGroup = document.getElementById("linkedinInputGroup");
const linkedinSubmitBtn = document.getElementById("linkedinSubmitBtn");
const linkedinCancelBtn = document.getElementById("linkedinCancelBtn");
const linkedinLinkInput = document.getElementById("linkedinLinkInput");
const linkedinLinkDisplay = document.getElementById("linkedinLinkDisplay");
const linkedinLinkHref = document.getElementById("linkedinLinkHref");
const linkedinRemoveBtn = document.getElementById("linkedinRemoveBtn");

// Aç
linkedinAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  linkedinAddBtn.classList.add("hidden");
  linkedinInputGroup.classList.remove("hidden");
  linkedinInputGroup.classList.add("flex");
});

// Əlavə et
linkedinSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = linkedinLinkInput.value.trim();
  if (value) {
    linkedinInputGroup.classList.add("hidden");
    linkedinLinkDisplay.classList.remove("hidden");
    linkedinLinkDisplay.classList.add("flex");
    linkedinLinkHref.href = "https://" + value;
    linkedinLinkHref.textContent = "https://" + value;
  }
});

// İptal
linkedinCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  linkedinLinkInput.value = "";
  linkedinInputGroup.classList.add("hidden");
  linkedinAddBtn.classList.remove("hidden");
});

// Sil
linkedinRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  linkedinLinkInput.value = "";
  linkedinLinkDisplay.classList.add("hidden");
  linkedinAddBtn.classList.remove("hidden");
});

const xAddBtn = document.getElementById("xAddBtn");
const xInputGroup = document.getElementById("xInputGroup");
const xSubmitBtn = document.getElementById("xSubmitBtn");
const xCancelBtn = document.getElementById("xCancelBtn");
const xLinkInput = document.getElementById("xLinkInput");
const xLinkDisplay = document.getElementById("xLinkDisplay");
const xLinkHref = document.getElementById("xLinkHref");
const xRemoveBtn = document.getElementById("xRemoveBtn");

// Aç
xAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  xAddBtn.classList.add("hidden");
  xInputGroup.classList.remove("hidden");
  xInputGroup.classList.add("flex");
});

// Əlavə et
xSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = xLinkInput.value.trim();
  if (value) {
    xInputGroup.classList.add("hidden");
    xLinkDisplay.classList.remove("hidden");
    xLinkDisplay.classList.add("flex");
    xLinkHref.href = "https://" + value;
    xLinkHref.textContent = "https://" + value;
  }
});

// İmtina
xCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  xLinkInput.value = "";
  xInputGroup.classList.add("hidden");
  xAddBtn.classList.remove("hidden");
});

// Sil
xRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  xLinkInput.value = "";
  xLinkDisplay.classList.add("hidden");
  xAddBtn.classList.remove("hidden");
});

const youtubeAddBtn = document.getElementById("youtubeAddBtn");
const youtubeInputGroup = document.getElementById("youtubeInputGroup");
const youtubeSubmitBtn = document.getElementById("youtubeSubmitBtn");
const youtubeCancelBtn = document.getElementById("youtubeCancelBtn");
const youtubeLinkInput = document.getElementById("youtubeLinkInput");
const youtubeLinkDisplay = document.getElementById("youtubeLinkDisplay");
const youtubeLinkHref = document.getElementById("youtubeLinkHref");
const youtubeRemoveBtn = document.getElementById("youtubeRemoveBtn");

// Aç
youtubeAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  youtubeAddBtn.classList.add("hidden");
  youtubeInputGroup.classList.remove("hidden");
  youtubeInputGroup.classList.add("flex");
});

// Əlavə et
youtubeSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = youtubeLinkInput.value.trim();
  if (value) {
    youtubeInputGroup.classList.add("hidden");
    youtubeLinkDisplay.classList.remove("hidden");
    youtubeLinkDisplay.classList.add("flex");
    youtubeLinkHref.href = "https://" + value;
    youtubeLinkHref.textContent = "https://" + value;
  }
});

// İmtina
youtubeCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  youtubeLinkInput.value = "";
  youtubeInputGroup.classList.add("hidden");
  youtubeAddBtn.classList.remove("hidden");
});

// Sil
youtubeRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  youtubeLinkInput.value = "";
  youtubeLinkDisplay.classList.add("hidden");
  youtubeAddBtn.classList.remove("hidden");
});

const tiktokAddBtn = document.getElementById("tiktokAddBtn");
const tiktokInputGroup = document.getElementById("tiktokInputGroup");
const tiktokSubmitBtn = document.getElementById("tiktokSubmitBtn");
const tiktokCancelBtn = document.getElementById("tiktokCancelBtn");
const tiktokLinkInput = document.getElementById("tiktokLinkInput");
const tiktokLinkDisplay = document.getElementById("tiktokLinkDisplay");
const tiktokLinkHref = document.getElementById("tiktokLinkHref");
const tiktokRemoveBtn = document.getElementById("tiktokRemoveBtn");

// Aç
tiktokAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  tiktokAddBtn.classList.add("hidden");
  tiktokInputGroup.classList.remove("hidden");
  tiktokInputGroup.classList.add("flex");
});

// Əlavə et
tiktokSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = tiktokLinkInput.value.trim();
  if (value) {
    tiktokInputGroup.classList.add("hidden");
    tiktokLinkDisplay.classList.remove("hidden");
    tiktokLinkDisplay.classList.add("flex");
    tiktokLinkHref.href = "https://" + value;
    tiktokLinkHref.textContent = "https://" + value;
  }
});

// İmtina
tiktokCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  tiktokLinkInput.value = "";
  tiktokInputGroup.classList.add("hidden");
  tiktokAddBtn.classList.remove("hidden");
});

// Sil
tiktokRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  tiktokLinkInput.value = "";
  tiktokLinkDisplay.classList.add("hidden");
  tiktokAddBtn.classList.remove("hidden");
});

const whatsappAddBtn = document.getElementById("whatsappAddBtn");
const whatsappInputGroup = document.getElementById("whatsappInputGroup");
const whatsappSubmitBtn = document.getElementById("whatsappSubmitBtn");
const whatsappCancelBtn = document.getElementById("whatsappCancelBtn");
const whatsappLinkInput = document.getElementById("whatsappLinkInput");
const whatsappLinkDisplay = document.getElementById("whatsappLinkDisplay");
const whatsappLinkHref = document.getElementById("whatsappLinkHref");
const whatsappRemoveBtn = document.getElementById("whatsappRemoveBtn");

// Aç
whatsappAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  whatsappAddBtn.classList.add("hidden");
  whatsappInputGroup.classList.remove("hidden");
  whatsappInputGroup.classList.add("flex");
});

// Əlavə et
whatsappSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = whatsappLinkInput.value.trim();
  if (value) {
    whatsappInputGroup.classList.add("hidden");
    whatsappLinkDisplay.classList.remove("hidden");
    whatsappLinkDisplay.classList.add("flex");
    whatsappLinkHref.href = "https://" + value;
    whatsappLinkHref.textContent = "https://" + value;
  }
});

// İmtina
whatsappCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  whatsappLinkInput.value = "";
  whatsappInputGroup.classList.add("hidden");
  whatsappAddBtn.classList.remove("hidden");
});

// Sil
whatsappRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  whatsappLinkInput.value = "";
  whatsappLinkDisplay.classList.add("hidden");
  whatsappAddBtn.classList.remove("hidden");
});

const telegramAddBtn = document.getElementById("telegramAddBtn");
const telegramInputGroup = document.getElementById("telegramInputGroup");
const telegramSubmitBtn = document.getElementById("telegramSubmitBtn");
const telegramCancelBtn = document.getElementById("telegramCancelBtn");
const telegramLinkInput = document.getElementById("telegramLinkInput");
const telegramLinkDisplay = document.getElementById("telegramLinkDisplay");
const telegramLinkHref = document.getElementById("telegramLinkHref");
const telegramRemoveBtn = document.getElementById("telegramRemoveBtn");

// Aç
telegramAddBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  telegramAddBtn.classList.add("hidden");
  telegramInputGroup.classList.remove("hidden");
  telegramInputGroup.classList.add("flex");
});

// Əlavə et
telegramSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  const value = telegramLinkInput.value.trim();
  if (value) {
    telegramInputGroup.classList.add("hidden");
    telegramLinkDisplay.classList.remove("hidden");
    telegramLinkDisplay.classList.add("flex");
    telegramLinkHref.href = "https://" + value;
    telegramLinkHref.textContent = "https://" + value;
  }
});

// İmtina
telegramCancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  telegramLinkInput.value = "";
  telegramInputGroup.classList.add("hidden");
  telegramAddBtn.classList.remove("hidden");
});

// Sil
telegramRemoveBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  telegramLinkInput.value = "";
  telegramLinkDisplay.classList.add("hidden");
  telegramAddBtn.classList.remove("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".day-toggle");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const dayKey = this.dataset.day;
      const label = document.querySelector(`[data-day-label="${dayKey}"]`);

      // Find the corresponding time inputs
      const startInput = document.querySelector(`input[name="${dayKey}_start"]`);
      const endInput = document.querySelector(`input[name="${dayKey}_end"]`);

      if (this.checked) {
        // Enable the day
        label.classList.remove("opacity-50");
        label.classList.add("opacity-100");
        if (startInput) startInput.disabled = false;
        if (endInput) endInput.disabled = false;
      } else {
        // Disable the day
        label.classList.remove("opacity-100");
        label.classList.add("opacity-50");
        if (startInput) {
          startInput.disabled = true;
          startInput.value = '';
        }
        if (endInput) {
          endInput.disabled = true;
          endInput.value = '';
        }
      }
    });
  });
});
