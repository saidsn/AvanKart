// Global active table tracking
let activeTableId = "users-table";

document.addEventListener("DOMContentLoaded", () => {
  // FORCE HIDE the selection controls immediately
  const selectionControls = document.getElementById("selection-controls");
  if (selectionControls) {
    selectionControls.style.display = "none";
    selectionControls.style.visibility = "hidden";
    selectionControls.style.opacity = "0";
  }

  // Select the ORIGINAL controls container by its new ID
  const originalControlsContainer = document.getElementById(
    "original-controls-container"
  );

  // Select the table containers
  const usersTable = document.getElementById("users-table");
  const permissionsTable = document.getElementById("permissions-table");
  const rolesTable = document.getElementById("roles-table");

  // Select the selection control elements
  const selectedCountSpan = document.getElementById("selected-count");
  const selectAllBtn = document.getElementById("select-all-btn");
  const clearSelectionBtn = document.getElementById("clear-selection-btn");
  const deleteSelectedBtn = document.getElementById("delete-selected-btn");

  // Select the header checkboxes for each table
  const usersHeaderCheckbox = document.getElementById("usersCheckbox");
  const permissionsHeaderCheckbox = document.getElementById(
    "permissionsCheckbox"
  );
  const rolesHeaderCheckbox = document.getElementById("rolesCheckbox");

  // Function to update the selected count and toggle control visibility
  function updateSelectedCount() {
    let currentTable;
    let currentHeaderCheckbox;

    // Determine the currently active table and its header checkbox
    if (activeTableId === "users-table") {
      currentTable = usersTable;
      currentHeaderCheckbox = usersHeaderCheckbox;
    } else if (activeTableId === "permissions-table") {
      currentTable = permissionsTable;
      currentHeaderCheckbox = permissionsHeaderCheckbox;
    } else if (activeTableId === "roles-table") {
      currentTable = rolesTable;
      currentHeaderCheckbox = rolesHeaderCheckbox;
    }

    if (currentTable) {
      // Select all individual row checkboxes in the active table body
      const rowCheckboxes = currentTable.querySelectorAll(
        'tbody tr input[type="checkbox"]'
      );
      const checkedRowCheckboxes = Array.from(rowCheckboxes).filter(
        (checkbox) => checkbox.checked
      );
      selectedCountSpan.textContent = checkedRowCheckboxes.length;

      // FORCE TOGGLE with multiple CSS properties
      if (checkedRowCheckboxes.length > 0) {
        // Hide original controls
        if (originalControlsContainer) {
          originalControlsContainer.style.display = "none";
          originalControlsContainer.style.visibility = "hidden";
        }

        // Show selection controls
        if (selectionControls) {
          selectionControls.style.display = "flex";
          selectionControls.style.visibility = "visible";
          selectionControls.style.opacity = "1";
        }
      } else {
        // Show original controls
        if (originalControlsContainer) {
          originalControlsContainer.style.display = "flex";
          originalControlsContainer.style.visibility = "visible";
        }

        // Hide selection controls
        if (selectionControls) {
          selectionControls.style.display = "none";
          selectionControls.style.visibility = "hidden";
          selectionControls.style.opacity = "0";
        }
      }

      // Update the state of the header checkbox based on row checkboxes
      if (currentHeaderCheckbox) {
        if (
          rowCheckboxes.length > 0 &&
          checkedRowCheckboxes.length === rowCheckboxes.length
        ) {
          currentHeaderCheckbox.checked = true;
        } else {
          currentHeaderCheckbox.checked = false;
        }
      }
    }
  }

  // Function to check/uncheck all row checkboxes in the active table
  function toggleAllCheckboxes(tableId, isChecked) {
    const table = document.getElementById(tableId);
    if (table) {
      const rowCheckboxes = table.querySelectorAll(
        'tbody tr input[type="checkbox"]'
      );
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      updateSelectedCount();
    }
  }

  // Event listeners for tab switching
  document.getElementById("tab-users")?.addEventListener("click", () => {
    activeTableId = "users-table";
    updateSelectedCount();
  });

  document.getElementById("tab-permissions")?.addEventListener("click", () => {
    activeTableId = "permissions-table";
    updateSelectedCount();
  });

  document.getElementById("tab-roles")?.addEventListener("click", () => {
    activeTableId = "roles-table";
    updateSelectedCount();
  });

  // Event listeners for individual row checkboxes within tables
  if (usersTable) {
    usersTable.addEventListener("change", (event) => {
      if (
        event.target.type === "checkbox" &&
        event.target.closest("tbody tr")
      ) {
        updateSelectedCount();
      }
    });
  }

  if (permissionsTable) {
    permissionsTable.addEventListener("change", (event) => {
      if (
        event.target.type === "checkbox" &&
        event.target.closest("tbody tr")
      ) {
        updateSelectedCount();
      }
    });
  }

  if (rolesTable) {
    rolesTable.addEventListener("change", (event) => {
      if (
        event.target.type === "checkbox" &&
        event.target.closest("tbody tr")
      ) {
        updateSelectedCount();
      }
    });
  }

  // Event listeners for header checkboxes
  if (usersHeaderCheckbox) {
    usersHeaderCheckbox.addEventListener("change", (event) => {
      if (activeTableId === "users-table") {
        toggleAllCheckboxes("users-table", event.target.checked);
      }
    });
  }

  if (permissionsHeaderCheckbox) {
    permissionsHeaderCheckbox.addEventListener("change", (event) => {
      if (activeTableId === "permissions-table") {
        toggleAllCheckboxes("permissions-table", event.target.checked);
      }
    });
  }

  if (rolesHeaderCheckbox) {
    rolesHeaderCheckbox.addEventListener("change", (event) => {
      if (activeTableId === "roles-table") {
        toggleAllCheckboxes("roles-table", event.target.checked);
      }
    });
  }

  // Event listener for "Hamısını seç" (Select All) button
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      toggleAllCheckboxes(activeTableId, true);
      let currentHeaderCheckbox;
      if (activeTableId === "users-table")
        currentHeaderCheckbox = usersHeaderCheckbox;
      else if (activeTableId === "permissions-table")
        currentHeaderCheckbox = permissionsHeaderCheckbox;
      else if (activeTableId === "roles-table")
        currentHeaderCheckbox = rolesHeaderCheckbox;

      if (currentHeaderCheckbox) {
        currentHeaderCheckbox.checked = true;
      }
    });
  }

  // Event listener for "Seçimləri təmizlə" (Clear Selections) button
  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener("click", () => {
      toggleAllCheckboxes(activeTableId, false);
      let currentHeaderCheckbox;
      if (activeTableId === "users-table")
        currentHeaderCheckbox = usersHeaderCheckbox;
      else if (activeTableId === "permissions-table")
        currentHeaderCheckbox = permissionsHeaderCheckbox;
      else if (activeTableId === "roles-table")
        currentHeaderCheckbox = rolesHeaderCheckbox;

      if (currentHeaderCheckbox) {
        currentHeaderCheckbox.checked = false;
      }
    });
  }

  // Event listener for "Seçilənləri sil" (Delete Selected) button
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", () => {
      handleMultipleDelete();
    });
  }

  // FINAL FORCE INITIALIZATION
  setTimeout(() => {
    if (originalControlsContainer) {
      originalControlsContainer.style.display = "flex";
      originalControlsContainer.style.visibility = "visible";
    }
    if (selectionControls) {
      selectionControls.style.display = "none";
      selectionControls.style.visibility = "hidden";
      selectionControls.style.opacity = "0";
    }
    updateSelectedCount();
  }, 100);
});

// Secilenleri sil

function showDeleteItemPopup() {
  const deleteOverlay = document.getElementById("deleteItemOverlay");
  if (deleteOverlay) {
    deleteOverlay.style.display = "flex"; // Use 'flex' for overlay to center the popup
  }
}

function cancelDeleteItem() {
  document.getElementById("deleteItemOverlay").style.display = "none";
  // Add any other logic to clear selection, etc.
}

// OTP doğrulama modalını göstərir.
function showOtpVerificationModal() {
  const otpModal = document.getElementById("otpVerificationModal");
  if (otpModal) {
    otpModal.style.display = "block"; // Və ya 'flex', CSS tənzimləmənizə görə
  }
}

// OTP doğrulama modalını gizlədir.
function hideOtpVerificationModal() {
  const otpModal = document.getElementById("otpVerificationModal");
  if (otpModal) {
    otpModal.style.display = "none";
  }
}

let countdownInterval;
let timeLeft = 299; // 4 minutes and 59 seconds in seconds

// Function to update the countdown display
function updateCountdown() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("countdown").innerText = `${minutes}:${seconds < 10 ? "0" : ""
    }${seconds}`;

  if (timeLeft <= 0) {
    clearInterval(countdownInterval);
    // Optionally, disable OTP input fields here if the time runs out
    document.querySelectorAll('.otp-input').forEach(input => input.disabled = true);
    // You might also want to show a message like "Time expired, please resend"
  } else {
    timeLeft--;
  }
}

// Function to start the countdown
function startCountdown() {
  clearInterval(countdownInterval); // Clear any existing interval
  timeLeft = 299; // Reset time to 4 minutes and 59 seconds
  updateCountdown(); // Call once immediately to display the initial time (4:59)
  countdownInterval = setInterval(updateCountdown, 1000); // Start the countdown
}

// Function to show the OTP modal and its overlay
function showOtpVerificationModal() {
  const otpOverlay = document.getElementById("otpOverlay");
  const otpModal = document.getElementById("otpVerificationModal"); // Keep this if you want to explicitly manage modal's hidden class for other reasons
  if (otpOverlay) {
    otpOverlay.classList.remove("hidden"); // Make the overlay visible
    // otpModal.classList.remove("hidden"); // Only if you are also managing modal's hidden class directly
    startCountdown(); // Start the countdown whenever the modal is shown
  }
}

// Function to hide the OTP modal and its overlay
function hideOtpVerificationModal() {
  const otpOverlay = document.getElementById("otpOverlay");
  const otpModal = document.getElementById("otpVerificationModal"); // Keep this if you want to explicitly manage modal's hidden class for other reasons
  if (otpOverlay) {
    otpOverlay.classList.add("hidden"); // Hide the overlay
    // otpModal.classList.add("hidden"); // Only if you are also managing modal's hidden class directly
    clearInterval(countdownInterval); // Stop countdown when modal is hidden
  }
}

// Function to submit OTP code (your existing function)
function submitOtpCode() {
  // Add your logic to submit the OTP code here
  console.log("OTP submitted!");
  // Example: If submission is successful, hide the modal
  hideOtpVerificationModal();
}

// Event listener for the "Yenidən göndər" (Resend) link
document.addEventListener("DOMContentLoaded", () => {
  const resendLink = document.querySelector(".resend-button");
  if (resendLink) {
    resendLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default link behavior
      startCountdown(); // Restart the countdown
      // Optionally, re-enable OTP input fields if they were disabled
      document.querySelectorAll('.otp-input').forEach(input => input.disabled = false);
    });
  }

  // Event listener for clicking the overlay to close the modal
  const otpOverlay = document.getElementById("otpOverlay");
  const otpModal = document.getElementById("otpVerificationModal");

  if (otpOverlay) {
    otpOverlay.addEventListener("click", (event) => {
      // Only close if the click was directly on the overlay, not on the modal itself
      if (event.target === otpOverlay) {
        hideOtpVerificationModal();
      }
    });
  }
});

// ===== MULTIPLE DELETE FUNCTIONALITY =====

// Delete URLs for different tabs
let deleteUrls = {
  "users-table": "/muessise-info/delete-user", // Bu URL-i sonra sizə bildirəcəyəm
  "permissions-table": "/rbac/rbacPermission/delete", // Bu URL-i sonra sizə bildirəcəyəm  
  "roles-table": "/rbac/rbacDeletes/delete" // Test üçün duty-delete
};

// Function to get selected IDs from the active table
function getSelectedIds() {
  let currentTable;
  let tableApi;

  if (activeTableId === "users-table") {
    currentTable = document.getElementById("users-table");
    tableApi = $("#myTable").DataTable(); // Users table
  } else if (activeTableId === "permissions-table") {
    currentTable = document.getElementById("permissions-table");
    tableApi = $("#permissionsTable").DataTable(); // Permissions table
  } else if (activeTableId === "roles-table") {
    currentTable = document.getElementById("roles-table");
    tableApi = $("#rolesTable").DataTable(); // Roles table
  }

  if (!currentTable || !tableApi) {
    console.error("Active table or API not found");
    return [];
  }

  const selectedIds = [];
  const checkedCheckboxes = currentTable.querySelectorAll('tbody tr input[type="checkbox"]:checked');

  checkedCheckboxes.forEach(checkbox => {
    const row = checkbox.closest('tr');
    if (row) {
      // Get row data from DataTables API
      const rowData = tableApi.row(row).data();
      if (rowData) {
        // Try different ID fields
        const id = rowData.id || rowData._id || rowData.userId || rowData.permissionId || rowData.roleId;
        if (id) {
          selectedIds.push(id);
        }
      } else {
        // Fallback: try to get from data attributes or dots-menu
        const dotsMenu = row.querySelector('.dots-menu[data-id]');
        if (dotsMenu) {
          const dataId = dotsMenu.getAttribute('data-id');
          if (dataId && dataId !== 'null') {
            selectedIds.push(dataId);
          }
        }
      }
    }
  });

  console.log("Selected IDs:", selectedIds);
  return selectedIds;
}

// Function to handle multiple delete
function handleMultipleDelete() {
  console.log("=== Multiple Delete Started ===");
  console.log("Active table:", activeTableId);

  const selectedIds = getSelectedIds();

  if (selectedIds.length === 0) {
    alert("Heç bir element seçilməyib");
    return;
  }

  // Show confirmation popup before proceeding with delete
  showMultipleDeleteConfirmation(selectedIds);
}

// Function to show confirmation popup for multiple delete
function showMultipleDeleteConfirmation(selectedIds) {
  // Store selected IDs globally so we can access them in confirm handler
  window.currentSelectedIds = selectedIds;

  // Show the delete confirmation popup
  const deletePopUp = document.getElementById("multipleDeletePopUp");
  if (deletePopUp) {
    // Update the text for multiple items
    const messageElement = deletePopUp.querySelector(".delete-message");
    if (messageElement) {
      if (selectedIds.length === 1) {
        messageElement.textContent = "Seçilən elementi silmək istədiyinizə əminsiniz?";
      } else {
        messageElement.textContent = `Seçilən ${selectedIds.length} elementi silmək istədiyinizə əminsiniz?`;
      }
    }

    deletePopUp.classList.remove("hidden");
    deletePopUp.style.display = "block";
  } else {
    console.error("Multiple delete popup not found");
    // Fallback to browser confirm
    if (confirm(`Seçilən ${selectedIds.length} elementi silmək istədiyinizə əminsiniz?`)) {
      performMultipleDelete(selectedIds);
    }
  }
}

// Function to actually perform the multiple delete after confirmation
function performMultipleDelete(selectedIds) {
  console.log("Performing delete for IDs:", selectedIds);

  // Get CSRF token
  const csrfToken = document.querySelector('input[name="_csrf"]')?.value ||
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (!csrfToken) {
    console.error("CSRF token not found");
    alert("CSRF token tapılmadı");
    return;
  }

  // Get delete URL for active tab
  const deleteUrl = deleteUrls[activeTableId];
  if (!deleteUrl) {
    console.error("Delete URL not found for table:", activeTableId);
    alert("Silmə URL-i tapılmadı");
    return;
  }

  console.log("Sending delete request to:", deleteUrl);
  console.log("Selected IDs:", selectedIds);

  // Prepare form data
  const formData = new URLSearchParams();
  // Send as JSON array for backend processing
  if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    selectedIds.forEach(id => {
      formData.append("ids[]", id);
    });
  }
  formData.append('_csrf', csrfToken);

  console.log("Form data being sent:", {
    ids: JSON.stringify(selectedIds),
    _csrf: csrfToken
  });

  // Send delete request
  fetch(deleteUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      console.log("Response status:", response.status);
      return response.json();
    })
    .then(data => {
      console.log("Response data:", data);

      if (data.success) {
        if (data.otpRequired) {
          // Show OTP modal
          console.log("OTP required, showing OTP modal");
          console.log("Email:", data.email, "TempDeleteId:", data.tempDeleteId);

          // Call OTP function from Popup.js
          if (data.otpRequired && data.tempDeleteId) {
            const options = {};
            if (data.email) {
              if (data.acceptUrl) options.url = data.acceptUrl;
              Otp(data.email, data.tempDeleteId, options);
            } else if (data.user_email) {
              if (data.url) options.url = data.url;
              if (data.resendUrl) options.data = data.resendUrl;
              Otp(data.user_email, data.tempDeleteId, options);
            }
          } else {
            console.error("Otp function not found");
            alert("OTP funksiyası tapılmadı");
          }
        } else {
          // Direct success
          alert(data.message || "Elementlər uğurla silindi");
          location.reload();
        }
      } else {
        alert(data.message || "Xəta baş verdi");
      }
    })
    .catch(error => {
      console.error("Delete request error:", error);
      alert("Server xətası baş verdi");
    });
}

// Function to cancel multiple delete
function cancelMultipleDelete() {
  const deletePopUp = document.getElementById("multipleDeletePopUp");
  if (deletePopUp) {
    deletePopUp.classList.add("hidden");
    deletePopUp.style.display = "none";
  }

  // Clear stored IDs
  window.currentSelectedIds = null;
}

// Function to confirm multiple delete
function confirmMultipleDelete() {
  const selectedIds = window.currentSelectedIds;
  if (selectedIds && selectedIds.length > 0) {
    // Hide the confirmation popup
    cancelMultipleDelete();

    // Perform the actual delete
    performMultipleDelete(selectedIds);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const otpInputs = document.querySelectorAll('.otp-input');

  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (event) => {
      // If a digit is entered and it's not the last input, move focus to the next
      if (event.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (event) => {
      // If backspace is pressed and the current input is empty, move focus to the previous
      if (event.key === 'Backspace' && event.target.value.length === 0 && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
});