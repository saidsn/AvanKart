/**
 * Leave Membership Functionality
 * Handles OTP-based membership termination
 */

// Global variables
let leaveMembershipData = {};

/**
 * Initialize leave membership modal
 */
function initLeaveMembershipModal() {
  const modal = document.getElementById("leaveMembershipModal");
  const confirmModal = document.getElementById("confirmLeaveMembershipModal");

  if (!modal || !confirmModal) {
    console.error("Leave membership modals not found");
    return;
  }

  // Bind event listeners
  bindLeaveMembershipEvents();
}

/**
 * Bind all event listeners for leave membership
 */
function bindLeaveMembershipEvents() {
  // Leave membership button
  document.addEventListener("click", function (e) {
    if (
      e.target.matches("#leaveMembershipBtn") ||
      e.target.closest("#leaveMembershipBtn")
    ) {
      e.preventDefault();
      const sirketId =
        e.target.dataset.sirketId ||
        e.target.closest("#leaveMembershipBtn").dataset.sirketId;
      openLeaveMembershipModal(sirketId);
    }
  });

  // Confirm leave membership
  document.addEventListener("click", function (e) {
    if (
      e.target.matches("#confirmLeaveMembershipBtn") ||
      e.target.closest("#confirmLeaveMembershipBtn")
    ) {
      e.preventDefault();
      const sirketId = leaveMembershipData.sirket_id;
      if (sirketId) {
        requestLeaveMembership(sirketId);
      }
    }
  });

  // Submit OTP
  document.addEventListener("click", function (e) {
    if (
      e.target.matches("#submitOtpBtn") ||
      e.target.closest("#submitOtpBtn")
    ) {
      e.preventDefault();
      submitLeaveMembershipOTP();
    }
  });

  // Close modals
  document.addEventListener("click", function (e) {
    if (e.target.matches(".close-modal") || e.target.closest(".close-modal")) {
      closeAllLeaveMembershipModals();
    }
  });

  // OTP input formatting
  document.addEventListener("input", function (e) {
    if (e.target.matches("#otpInput")) {
      formatOTPInput(e.target);
    }
  });
}

/**
 * Open initial leave membership confirmation modal
 */
function openLeaveMembershipModal(sirketId) {
  if (!sirketId) {
    showAlert("error", "Şirkət ID tapılmadı");
    return;
  }

  leaveMembershipData.sirket_id = sirketId;

  const modal = document.getElementById("leaveMembershipModal");
  const backdrop = document.getElementById("leaveMembershipBackdrop");

  if (modal && backdrop) {
    modal.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    modal.classList.add("flex");
    backdrop.classList.add("flex");
  }
}

/**
 * Request leave membership - generate and send OTP
 */
async function requestLeaveMembership(sirketId) {
  try {
    // Show loading state
    const confirmBtn = document.getElementById("confirmLeaveMembershipBtn");
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = "Göndərilir...";
    confirmBtn.disabled = true;

    // Get CSRF token
    const csrfToken = await getCSRFToken();

    const response = await fetch("/api/people/leave-membership", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "csrf-token": csrfToken,
      },
      body: JSON.stringify({
        sirket_id: sirketId,
      }),
    });

    const result = await response.json();

    // Reset button
    confirmBtn.textContent = originalText;
    confirmBtn.disabled = false;

    if (response.ok && result.status === "success") {
      // Close initial modal and open OTP modal
      document.getElementById("leaveMembershipModal").classList.add("hidden");
      openOTPModal(result.data);

      showAlert("success", result.message);
    } else {
      showAlert("error", result.message || "Xəta baş verdi");
    }
  } catch (error) {
    console.error("Leave membership request error:", error);
    showAlert("error", "Şəbəkə xətası baş verdi");

    // Reset button
    const confirmBtn = document.getElementById("confirmLeaveMembershipBtn");
    confirmBtn.textContent = "Təsdiq et";
    confirmBtn.disabled = false;
  }
}

/**
 * Open OTP confirmation modal
 */
function openOTPModal(data) {
  leaveMembershipData = { ...leaveMembershipData, ...data };

  const modal = document.getElementById("confirmLeaveMembershipModal");
  const backdrop = document.getElementById("confirmLeaveMembershipBackdrop");
  const otpInput = document.getElementById("otpInput");

  if (modal && backdrop) {
    modal.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    modal.classList.add("flex");
    backdrop.classList.add("flex");

    // Focus on OTP input
    if (otpInput) {
      otpInput.value = "";
      otpInput.focus();
    }

    // Start countdown timer
    startOTPCountdown(data.expires_in || 300);
  }
}

/**
 * Submit leave membership OTP
 */
async function submitLeaveMembershipOTP() {
  try {
    const otpInput = document.getElementById("otpInput");
    const otp = otpInput.value.trim();

    if (!otp || otp.length !== 6) {
      showAlert("error", "6 rəqəmli OTP kodu daxil edin");
      return;
    }

    // Show loading state
    const submitBtn = document.getElementById("submitOtpBtn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Təsdiq edilir...";
    submitBtn.disabled = true;

    // Get CSRF token
    const csrfToken = await getCSRFToken();

    const response = await fetch("/api/people/accept-leave-membership", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "csrf-token": csrfToken,
      },
      body: JSON.stringify({
        sirket_id: leaveMembershipData.sirket_id,
        otp: otp,
      }),
    });

    const result = await response.json();

    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    if (response.ok && result.status === "success") {
      closeAllLeaveMembershipModals();
      showAlert("success", result.message);

      // Refresh page after successful leave
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      showAlert("error", result.message || "OTP təsdiqi uğursuz oldu");

      // Clear OTP input for retry
      otpInput.value = "";
      otpInput.focus();
    }
  } catch (error) {
    console.error("OTP submission error:", error);
    showAlert("error", "Şəbəkə xətası baş verdi");

    // Reset button
    const submitBtn = document.getElementById("submitOtpBtn");
    submitBtn.textContent = "Təsdiq et";
    submitBtn.disabled = false;
  }
}

/**
 * Start OTP countdown timer
 */
function startOTPCountdown(seconds) {
  const timerElement = document.getElementById("otpTimer");
  if (!timerElement) return;

  let timeLeft = seconds;

  const updateTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const remainingSeconds = timeLeft % 60;
    timerElement.textContent = `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;

    if (timeLeft <= 0) {
      timerElement.textContent = "Vaxt bitdi";
      timerElement.classList.add("text-red-500");

      // Disable OTP input and submit button
      const otpInput = document.getElementById("otpInput");
      const submitBtn = document.getElementById("submitOtpBtn");

      if (otpInput) otpInput.disabled = true;
      if (submitBtn) submitBtn.disabled = true;

      clearInterval(countdownInterval);
      return;
    }

    timeLeft--;
  };

  updateTimer(); // Initial call
  const countdownInterval = setInterval(updateTimer, 1000);
}

/**
 * Format OTP input (digits only, max 6)
 */
function formatOTPInput(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 6) {
    value = value.slice(0, 6);
  }
  input.value = value;
}

/**
 * Close all leave membership modals
 */
function closeAllLeaveMembershipModals() {
  const modals = ["leaveMembershipModal", "confirmLeaveMembershipModal"];

  const backdrops = [
    "leaveMembershipBackdrop",
    "confirmLeaveMembershipBackdrop",
  ];

  modals.forEach((modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  backdrops.forEach((backdropId) => {
    const backdrop = document.getElementById(backdropId);
    if (backdrop) {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }
  });

  // Reset data
  leaveMembershipData = {};
}

/**
 * Get CSRF token for API requests
 */
async function getCSRFToken() {
  try {
    const response = await fetch("/csrf-token");
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("CSRF token fetch error:", error);
    return "";
  }
}

/**
 * Show alert message
 */
function showAlert(type, message) {
  // Try to use existing alert system if available
  if (typeof window.showToast === "function") {
    window.showToast(message, type);
    return;
  }

  if (typeof window.showAlert === "function") {
    window.showAlert(message, type);
    return;
  }

  // Fallback to console and basic alert
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(message);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initLeaveMembershipModal();
});

// Export functions for global access
window.leaveMembershipFunctions = {
  openLeaveMembershipModal,
  requestLeaveMembership,
  submitLeaveMembershipOTP,
  closeAllLeaveMembershipModals,
};
