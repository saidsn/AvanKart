function closeModal() {
  const timeoutModal = document.getElementById("timeoutModal");
  if (timeoutModal) {
    timeoutModal.classList.add("hidden");
  }
}

let overlay = document.querySelector("#overlay");
let aside = document.querySelector("aside");
let span4 = document.querySelector(".span4");
let span4_1 = document.querySelector(".span4-1");
let curveleft = document.querySelector(".curve-left-div");
let tenzimlemelerDiv = document.querySelector("#tenzimlemeler-div");
let destekDiv = document.querySelector(".destek-div");
let destekLogo = document.querySelector(".destek-logo");
let nomredogrulamaDiv = document.querySelector("form.nomredogrulama-div");
let emaildogrulamaDiv = document.querySelector(".emaildogrulama-div");


let toggleclick = false;


// Email 2FA toggle function
function toggleEmail(formName) {
  const checkbox = document.querySelector(
    '#toggleEmailForm input[type="checkbox"]'
  );

  toggleclick = !toggleclick;
  if (toggleclick) {
    // Send OTP request to server
    submitForm(formName);
    emaildogrulamaDiv.style.display = "block";
    overlay.style.display = "block";
    // Background effects
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    destekLogo.style.background = "transparent";
    span4_1.style.background = "transparent";
    destekDiv.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
  } else {
    // Close popup and revert checkbox state
    emaildogrulamaDiv.style.display = "none";
    overlay.style.display = "none";

    // Revert checkbox state for cancel
    if (checkbox) checkbox.checked = !checkbox.checked;
  }
}

// SMS 2FA toggle function
function toggleNomre(formName) {
  if (!nomredogrulamaDiv || !overlay) return;
  submitForm(formName);
  if (nomredogrulamaDiv.style.display === "block") {
    nomredogrulamaDiv.style.display = "none";
    overlay.style.display = "none";
  } else {
    nomredogrulamaDiv.style.display = "block";
    overlay.style.display = "block";
  }
}
// Authenticator 2FA toggle function
// Authenticator 2FA toggle function
function toggleAuthenticator(formName) {
  const checkbox = document.querySelector(
    '#toggleAuthenticatorForm input[type="checkbox"]'
  );
  const popup = document.querySelector(".authenticator-div");

  toggleclick = !toggleclick;
  if (toggleclick) {
    // Send OTP request to server
    submitForm(formName);

    // Background effects (null-safe)
    if (aside) aside.style.background = "transparent";
    if (span4) span4.style.background = "transparent";
    if (destekLogo) destekLogo.style.background = "transparent";
    if (span4_1) span4_1.style.background = "transparent";
    if (destekDiv) destekDiv.style.background = "transparent";
    if (curveleft) curveleft.style.background = "transparent";
    if (tenzimlemelerDiv) tenzimlemelerDiv.style.background = "transparent";

    // Show popup
    if (popup) popup.classList.remove("hidden");
    if (overlay) overlay.style.display = "block";
  } else {
    // Close popup and revert checkbox state
    if (popup) popup.classList.add("hidden");
    if (overlay) overlay.style.display = "none";

    // Revert checkbox state for cancel
    if (checkbox) checkbox.checked = !checkbox.checked;
  }
}


// OTP submission functions
function submitEmail() {
  submitForm("toggleEmailOtp");
}

function submitNomre() {
  submitForm("toggleNomreOtp");
}

function submitTesdiq() {
  submitForm("toggleAuthenticatorOtp");
}

// Authenticator next button
function ireliAuthenticator() {
  const popup1 = document.querySelector(".authenticator-div");
  const popup2 = document.querySelector(".authenticator-tesdiq");

  if (popup1) popup1.classList.add("hidden");
  if (popup2) popup2.classList.remove("hidden");
}

// Show success popup after OTP verification
function showSuccessPopup(type, message) {
  const overlay = document.getElementById("overlay");
  let successPopup, otpPopup;

  switch (type) {
    case "email":
      otpPopup = document.querySelector(".emaildogrulama-div");
      successPopup = document.querySelector(".email-ugurlu");
      if (successPopup && successPopup.querySelector("span:last-child")) {
        successPopup.querySelector("span:last-child").textContent = message;
      }
      break;
    case "sms":
      otpPopup = document.querySelector(".nomredogrulama-div");
      successPopup = document.querySelector(".nomre-ugurlu");
      if (successPopup && successPopup.querySelector("span:last-child")) {
        successPopup.querySelector("span:last-child").textContent = message;
      }
      break;
    case "authenticator":
      otpPopup = document.querySelector(".authenticator-tesdiq");
      successPopup = document.querySelector(".authenticator-ugurlu");
      if (successPopup && successPopup.querySelector("span:last-child")) {
        successPopup.querySelector("span:last-child").textContent = message;
      }
      break;
  }

  if (otpPopup && successPopup) {
    // Close OTP popup
    if (otpPopup.style) otpPopup.style.display = "none";
    else otpPopup.classList.add("hidden");

    // Show success popup
    if (successPopup.style) successPopup.style.display = "block";
    else successPopup.classList.remove("hidden");

    overlay.style.display = "block";

    // Auto-close after 3 seconds
    setTimeout(() => {
      if (successPopup.style) successPopup.style.display = "none";
      else successPopup.classList.add("hidden");
      overlay.style.display = "none";
    }, 3000);
  }
}

// Close timeout modal
function closeVaxtBitdi() {
  const timeoutModal = document.getElementById("timeoutModal");
  if (timeoutModal) {
    timeoutModal.classList.add("hidden");
  }
}

// Handle server responses for form submissions
function handleFormResponse(formId, response, data) {
  console.log("Form response:", formId, data);

  // Open OTP popup after requesting OTP
  if (formId === "toggleEmailForm" && data.showPopup && data.type === "email") {
    emaildogrulamaDiv.style.display = "block";
    overlay.style.display = "block";
    return;
  }

  if (formId === "toggleNomreForm" && data.showPopup && data.type === "sms") {
    nomredogrulamaDiv.style.display = "block";
    overlay.style.display = "block";
    return;
  }

  if (
    formId === "toggleAuthenticatorForm" &&
    data.showPopup &&
    data.type === "authenticator"
  ) {
    const popup = document.querySelector(".authenticator-div");
    if (popup) popup.classList.remove("hidden");
    overlay.style.display = "block";
    return;
  }

  // Show success popup after OTP verification
  if (formId === "toggleEmailOtpForm" && data.success) {
    showSuccessPopup("email", data.message);
    return;
  }

  if (formId === "toggleNomreOtpForm" && data.success) {
    showSuccessPopup("sms", data.message);
    return;
  }

  if (formId === "toggleAuthenticatorOtpForm" && data.success) {
    showSuccessPopup("authenticator", data.message);
    return;
  }
}
