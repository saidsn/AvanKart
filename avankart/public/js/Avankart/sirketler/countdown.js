// !countdown
let countdownTimer;
let countdownDuration = 5 * 60; // 5 minutes in seconds

function startCountdown() {
  let timeLeft = countdownDuration - 1;

  // Clear any previous timer to avoid duplicates
  clearInterval(countdownTimer);

  // Update UI immediately
  updateCountdownDisplay(timeLeft);

  countdownTimer = setInterval(() => {
    timeLeft--;
    updateCountdownDisplay(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      $("#countdown").text("0:00");
    }
  }, 1000);
}

function updateCountdownDisplay(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  $("#countdown").text(`${minutes}:${secs < 10 ? "0" : ""}${secs}`);
}

// Reset countdown on "Yenidən göndər" click
$(document).on("click", "#confirmModal a", function (e) {
  e.preventDefault();
  startCountdown();
});

// OTP input avtomatik fokus keçidi
$(document).on("input", ".otp-input", function () {
  let $this = $(this);
  let value = $this.val();

  // Yalnız rəqəm qəbul et
  $this.val(value.replace(/[^0-9]/g, ""));

  // 1 rəqəm yazıldıqda növbəti input-a keç
  if (value.length === 1) {
    $this.next(".otp-input").focus();
  }
});

// Backspace-də əvvəlki input-a keç
$(document).on("keydown", ".otp-input", function (e) {
  if (e.key === "Backspace" && $(this).val() === "") {
    $(this).prev(".otp-input").focus();
  }
});

//! otpcountdown
let otpCountdownTimer;
let otpCountdownDuration = 5 * 60; // 5 dəqiqə (saniyə ilə)

function startOtpCountdown() {
  let timeLeft = otpCountdownDuration - 1;

  // Əvvəlki timer varsa, dayandır
  clearInterval(otpCountdownTimer);

  // UI-ni dərhal yenilə
  updateOtpCountdownDisplay(timeLeft);

  otpCountdownTimer = setInterval(() => {
    timeLeft--;
    updateOtpCountdownDisplay(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(otpCountdownTimer);
      $("#otpCountdown").text("0:00");
    }
  }, 1000);
}

function updateOtpCountdownDisplay(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  $("#otpCountdown").text(`${minutes}:${secs < 10 ? "0" : ""}${secs}`);
}

// Reset countdown on "Yenidən göndər" click
$(document).on("click", ".reset-countdown", function (e) {
  e.preventDefault();
  startOtpCountdown();
});

// OTP input avtomatik fokus keçidi
$(document).on("input", ".otp-input", function () {
  let $this = $(this);
  let value = $this.val();

  // Yalnız rəqəm qəbul et
  $this.val(value.replace(/[^0-9]/g, ""));

  // 1 rəqəm yazıldıqda növbəti input-a keç
  if (value.length === 1) {
    $this.next(".otp-input").focus();
  }
});

// Backspace-də əvvəlki input-a keç
$(document).on("keydown", ".otp-input", function (e) {
  if (e.key === "Backspace" && $(this).val() === "") {
    $(this).prev(".otp-input").focus();
  }
});