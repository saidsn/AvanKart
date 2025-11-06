let emailConfirmed = false;
let countdownInterval;

function toggleEmail() {
  const existing = document.getElementById("emailModal");
  if (existing) {
    existing.remove();

    const checkbox = document.getElementById("email2faCheckbox");
    if (!emailConfirmed && checkbox) {
      checkbox.checked = false;
    }

    emailConfirmed = false;
    clearInterval(countdownInterval);
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "emailModal";
  overlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[999] flex items-center justify-center";

  overlay.innerHTML = `
    <div class="emaildogrulama-div w-[450px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-lg rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div class="flex items-center justify-between py-0.5 mb-5">
        <span class="text-[15px] font-medium dark:text-white">2 addımlı doğrulama</span>
        <img onclick="toggleEmail()" src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden">
        <img onclick="toggleEmail()" src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block">
      </div>
      <div class="mt-5">
        <div>
          <h1 class="text-[22px] font-semibold pb-1 dark:text-white">OTP</h1>
          <div class="text-[13px] font-medium dark:text-white">
            ramin.orucovvv@gmail.com <span class="font-normal opacity-65">email adresinə göndərilən 6 rəqəmli şifrəni daxil edin</span>
          </div>
        </div>
        <form onsubmit="event.preventDefault(); submitEmail();">
          <div class="w-full text-center space-y-4">
            <div id="countdown" class="text-messages my-6 dark:bg-inverse-surface dark:text-white bg-inverse-on-surface rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium leading-[160%] font-poppins">5:00</div>
            <div class="grid grid-cols-6 gap-2">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
            </div>
            <div class="mt-6 flex items-center justify-center gap-4">
              <a href="#" class="text-[12px] font-normal opacity-65 dark:text-white">Email adresinə mesaj gəlmədi?</a>
              <a href="#" class="text-[12px] font-medium dark:text-white" onclick="restartOTP()">Yenidən göndər</a>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-[30px]">
            <button type="button" class="text-[13px] font-medium bg-surface text-on-surface-variant py-[6.5px] px-[18px] rounded-full dark:text-on-surface-variant-dark dark:bg-surface-bright-dark" onclick="toggleEmail()">Ləğv et</button>
            <button type="submit" class="text-[13px] font-medium bg-primary text-white py-[6.5px] px-[18px] rounded-full hover:bg-hover-button">Təsdiqlə</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("mousedown", (e) => {
    overlay.dataset.wasInside = e.target.closest(".emaildogrulama-div")
      ? "true"
      : "false";
  });

  overlay.addEventListener("mouseup", (e) => {
    const wasInside = overlay.dataset.wasInside === "true";
    if (!wasInside) {
      toggleEmail();
    }
  });

  document.addEventListener("keydown", function escClose(e) {
    if (e.key === "Escape") {
      toggleEmail();
      document.removeEventListener("keydown", escClose);
    }
  });

  startCountdown(300); // 5 dəqiqə
}

function submitEmail() {
  const inputs = document.querySelectorAll(".otp-input");
  const checkbox = document.getElementById("email2faCheckbox");
  let allFilled = true;

  inputs.forEach((input) => {
    if (input.value.trim() === "") {
      allFilled = false;
    }
  });

  if (allFilled) {
    emailConfirmed = true;
    if (checkbox) checkbox.checked = true;
    clearInterval(countdownInterval);
    document.getElementById("emailModal")?.remove();
    showSuccessModal(); // ✅ Yeni modal göstərilir
  } else {
    alert("Zəhmət olmasa bütün sahələri doldurun.");
    if (checkbox) checkbox.checked = false;
  }
}

function startCountdown(durationInSeconds) {
  const countdownEl = document.getElementById("countdown");
  let remaining = durationInSeconds;

  // ⏱️ İlk dəyəri dərhal göstər
  const minutes = Math.floor(remaining / 60).toString();
  const seconds = (remaining % 60).toString().padStart(2, "0");
  countdownEl.textContent = `${minutes}:${seconds}`;

  // 🔁 Geri sayımı başlat
  countdownInterval = setInterval(() => {
    remaining--;
    if (remaining < 0) {
      clearInterval(countdownInterval);
      if (!emailConfirmed) {
        document.getElementById("emailModal")?.remove();
        showTimeoutModal();
      }
      return;
    }

    const minutes = Math.floor(remaining / 60).toString();
    const seconds = (remaining % 60).toString().padStart(2, "0");
    countdownEl.textContent = `${minutes}:${seconds}`;
  }, 1000);
}


function showTimeoutModal() {
  const timeoutOverlay = document.createElement("div");
  timeoutOverlay.id = "timeoutModal";
  timeoutOverlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[1000] flex items-center justify-center";

  timeoutOverlay.innerHTML = `
    <div class="timeout-content w-[450px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-lg rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div class="flex items-center justify-end">
            <img src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden" onclick="CloseAll()">
            <img src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" onclick="CloseAll()">
        </div>
        <div class="mt-5 flex items-center justify-center flex-col">
            <img src="/public/images/settings/Alarm clock.svg" alt="Alarm Clock" class="pb-6 block dark:hidden">
            <img src="/public/images/settings/Alarm clock.svg" alt="Alarm Clock" class="pb-6 hidden dark:block">
            <div class="mt-6 flex items-center justify-center flex-col">
                <span class="text-[22px] font-semibold dark:text-white">Vaxtı bitdi!</span>
                <span class="text-[13px] font-normal opacity-65 dark:text-white">Təqdim edilən pin kodun vaxtı bitdi.</span>
            </div>
            <div class="w-full mt-[30px]">
                <div class="w-full h-[34px] flex items-center justify-center flex-col rounded-[100px] bg-primary text-body-bg text-[13px] font-medium cursor-pointer" onclick="restartModal()">Yenidən yoxla</div>
                <div class="mt-3 mb-6 w-full h-[34px] flex items-center justify-center flex-col rounded-[100px] bg-surface text-on-surface-variant text-[13px] font-medium cursor-pointer dark:bg-surface-bright-dark dark:text-on-surface-variant-dark" onclick="CloseAll()">Ləğv et</div>
            </div>
        </div>
    </div>
  `;

  document.body.appendChild(timeoutOverlay);

  // Overlay kliklə bağlama (yalnız content-dən kənara basılanda)
  timeoutOverlay.addEventListener("mousedown", (e) => {
    timeoutOverlay.dataset.wasInside = e.target.closest(".timeout-content")
      ? "true"
      : "false";
  });

  timeoutOverlay.addEventListener("mouseup", (e) => {
    const wasInside = timeoutOverlay.dataset.wasInside === "true";
    if (!wasInside) {
      CloseAll();
    }
  });
}

function restartOTP() {
  clearInterval(countdownInterval);
  startCountdown(300);
  const inputs = document.querySelectorAll(".otp-input");
  inputs.forEach((input) => (input.value = ""));
}

function CloseAll() {
  const checkbox = document.getElementById("email2faCheckbox");
  if (checkbox) checkbox.checked = false;

  const timeoutModal = document.getElementById("timeoutModal");
  if (timeoutModal) timeoutModal.remove();
}

function restartModal() {
  const timeoutModal = document.getElementById("timeoutModal");
  if (timeoutModal) timeoutModal.remove(); // əvvəlki timeout modalını sil

  toggleEmail(); // email doğrulama modalını yenidən aç
}

function showSuccessModal() {
  const overlay = document.createElement("div");
  overlay.id = "emailSuccessModal";
  overlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[1001] flex items-center justify-center";

  overlay.innerHTML = `
    <div class="email-ugurlu w-[450px] h-[306px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div class="flex items-center justify-end">
          <img src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden" onclick="closeSuccessModal()">
          <img src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" onclick="closeSuccessModal()">
      </div>
      <div class="mt-5 flex items-center justify-center flex-col">
          <img src="/public/images/settings/Shield.svg" alt="Shield">
          <span class="text-[22px] font-semibold mt-[32px] dark:text-white">Uğurlu</span>
          <span class="mt-1 opacity-65 text-[13px] font-normal dark:text-white">Email ilə 2 addımlı doğrulama təsdiqləndi</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Overlay kliklə bağlama
  overlay.addEventListener("mousedown", (e) => {
    overlay.dataset.wasInside = e.target.closest(".email-ugurlu")
      ? "true"
      : "false";
  });

  overlay.addEventListener("mouseup", (e) => {
    const wasInside = overlay.dataset.wasInside === "true";
    if (!wasInside) {
      closeSuccessModal();
    }
  });
}

function closeSuccessModal() {
  const modal = document.getElementById("emailSuccessModal");
  if (modal) modal.remove();
}

// Nomre dogrulama
let numberConfirmed = false;
let numberCountdownInterval;

function toggleNumber() {
  const existing = document.getElementById("numberModal");
  if (existing) {
    existing.remove();

    const checkbox = document.getElementById("number2faCheckbox");
    if (!numberConfirmed && checkbox) {
      checkbox.checked = false;
    }

    numberConfirmed = false;
    clearInterval(numberCountdownInterval);
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "numberModal";
  overlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[999] flex items-center justify-center";

  overlay.innerHTML = `
    <div class="numberdogrulama-div w-[450px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-lg rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div class="flex items-center justify-between py-0.5 mb-5">
        <span class="text-[15px] font-medium dark:text-white">2 addımlı doğrulama</span>
        <img onclick="toggleNumber()" src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden">
        <img onclick="toggleNumber()" src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block">
      </div>
      <div class="mt-5">
        <div>
          <h1 class="text-[22px] font-semibold pb-1 dark:text-white">OTP</h1>
          <div class="text-[13px] font-medium dark:text-white">
            +994 50 123 45 67 <span class="font-normal opacity-65">nömrəsinə göndərilən 6 rəqəmli şifrəni daxil edin</span>
          </div>
        </div>
        <form onsubmit="event.preventDefault(); submitNumber();">
          <div class="w-full text-center space-y-4">
            <div id="numberCountdown" class="text-messages my-6 dark:bg-inverse-surface dark:text-white bg-inverse-on-surface rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium leading-[160%] font-poppins">5:00</div>
            <div class="grid grid-cols-6 gap-2">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
            </div>
            <div class="mt-6 flex items-center justify-center gap-4">
              <a href="#" class="text-[12px] font-normal opacity-65 dark:text-white">Mesaj gəlmədi?</a>
              <a href="#" class="text-[12px] font-medium dark:text-white" onclick="restartNumberOTP()">Yenidən göndər</a>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-[30px]">
            <button type="button" class="text-[13px] font-medium bg-surface text-on-surface-variant py-[6.5px] px-[18px] rounded-full dark:text-on-surface-variant-dark dark:bg-surface-bright-dark" onclick="toggleNumber()">Ləğv et</button>
            <button type="submit" class="text-[13px] font-medium bg-primary text-white py-[6.5px] px-[18px] rounded-full hover:bg-hover-button">Təsdiqlə</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("mousedown", (e) => {
    overlay.dataset.wasInside = e.target.closest(".numberdogrulama-div")
      ? "true"
      : "false";
  });

  overlay.addEventListener("mouseup", (e) => {
    const wasInside = overlay.dataset.wasInside === "true";
    if (!wasInside) {
      toggleNumber();
    }
  });

  document.addEventListener("keydown", function escClose(e) {
    if (e.key === "Escape") {
      toggleNumber();
      document.removeEventListener("keydown", escClose);
    }
  });

  startNumberCountdown(300);
}

function submitNumber() {
  const inputs = document.querySelectorAll("#numberModal .otp-input");
  const checkbox = document.getElementById("number2faCheckbox");
  let allFilled = true;

  inputs.forEach((input) => {
    if (input.value.trim() === "") {
      allFilled = false;
    }
  });

  if (allFilled) {
    numberConfirmed = true;
    if (checkbox) checkbox.checked = true;
    clearInterval(numberCountdownInterval);
    document.getElementById("numberModal")?.remove();
    showNumberSuccessModal(); // ✅ Yeni modal göstərilir
  } else {
    alert("Zəhmət olmasa bütün sahələri doldurun.");
    if (checkbox) checkbox.checked = false;
  }
}

function startNumberCountdown(durationInSeconds) {
  const countdownEl = document.getElementById("numberCountdown");
  let remaining = durationInSeconds;

  // ⏱️ İlk dəyəri dərhal göstər
  const minutes = Math.floor(remaining / 60).toString();
  const seconds = (remaining % 60).toString().padStart(2, "0");
  countdownEl.textContent = `${minutes}:${seconds}`;

  // 🔁 Geri sayımı başlat
  countdownInterval = setInterval(() => {
    remaining--;
    if (remaining < 0) {
      clearInterval(countdownInterval);
      if (!emailConfirmed) {
        document.getElementById("numberModal")?.remove();
        showNumberTimeoutModal();
      }
      return;
    }

    const minutes = Math.floor(remaining / 60).toString();
    const seconds = (remaining % 60).toString().padStart(2, "0");
    countdownEl.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function showNumberTimeoutModal() {
  const timeoutOverlay = document.createElement("div");
  timeoutOverlay.id = "numberTimeoutModal";
  timeoutOverlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[1000] flex items-center justify-center";

  timeoutOverlay.innerHTML = `
    <div class="timeout-content w-[450px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-lg rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div class="flex items-center justify-end">
        <img src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden" onclick="closeNumberAll()">
        <img src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" onclick="closeNumberAll()">
      </div>
      <div class="mt-5 flex items-center justify-center flex-col">
        <img src="/public/images/settings/Alarm clock.svg" alt="Alarm Clock" class="pb-6 block dark:hidden">
        <img src="/public/images/settings/Alarm clock.svg" alt="Alarm Clock" class="pb-6 hidden dark:block">
        <div class="mt-6 flex items-center justify-center flex-col">
          <span class="text-[22px] font-semibold dark:text-white">Vaxtı bitdi!</span>
          <span class="text-[13px] font-normal opacity-65 dark:text-white">Təqdim edilən pin kodun vaxtı bitdi.</span>
        </div>
        <div class="w-full mt-[30px]">
          <div class="w-full h-[34px] flex items-center justify-center flex-col rounded-[100px] bg-primary text-body-bg text-[13px] font-medium cursor-pointer" onclick="restartNumberModal()">Yenidən yoxla</div>
          <div class="mt-3 mb-6 w-full h-[34px] flex items-center justify-center flex-col rounded-[100px] bg-surface text-on-surface-variant text-[13px] font-medium cursor-pointer dark:bg-surface-bright-dark dark:text-on-surface-variant-dark" onclick="closeNumberAll()">Ləğv et</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(timeoutOverlay);

  timeoutOverlay.addEventListener("mousedown", (e) => {
    timeoutOverlay.dataset.wasInside = e.target.closest(".timeout-content")
      ? "true"
      : "false";
  });

  timeoutOverlay.addEventListener("mouseup", (e) => {
    const wasInside = timeoutOverlay.dataset.wasInside === "true";
    if (!wasInside) {
      closeNumberAll();
    }
  });
}

function restartNumberOTP() {
  clearInterval(numberCountdownInterval);
  startNumberCountdown(300);
  const inputs = document.querySelectorAll("#numberModal .otp-input");
  inputs.forEach((input) => (input.value = ""));
}

function closeNumberAll() {
  const checkbox = document.getElementById("number2faCheckbox");
  if (checkbox) checkbox.checked = false;

  const timeoutModal = document.getElementById("numberTimeoutModal");
  if (timeoutModal) timeoutModal.remove();
}

function restartNumberModal() {
  const timeoutModal = document.getElementById("numberTimeoutModal");
  if (timeoutModal) timeoutModal.remove();
  toggleNumber();
}

function showNumberSuccessModal() {
  const overlay = document.createElement("div");
  overlay.id = "numberSuccessModal";
  overlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[1001] flex items-center justify-center";

  overlay.innerHTML = `
      <div class="number-ugurlu w-[450px] h-[306px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div class="flex items-center justify-end">
            <img src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden" onclick="closeNumberSuccessModal()">
            <img src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" onclick="closeNumberSuccessModal()">
        </div>
        <div class="mt-5 flex items-center justify-center flex-col">
            <img src="/public/images/settings/Shield.svg" alt="Shield">
            <span class="text-[22px] font-semibold mt-[32px] dark:text-white">Uğurlu</span>
            <span class="mt-1 opacity-65 text-[13px] font-normal dark:text-white">Nömrə ilə 2 addımlı doğrulama təsdiqləndi</span>
        </div>
      </div>
    `;

  document.body.appendChild(overlay);

  overlay.addEventListener("mousedown", (e) => {
    overlay.dataset.wasInside = e.target.closest(".number-ugurlu")
      ? "true"
      : "false";
  });

  overlay.addEventListener("mouseup", (e) => {
    const wasInside = overlay.dataset.wasInside === "true";
    if (!wasInside) {
      closeNumberSuccessModal();
    }
  });
}

function closeNumberSuccessModal() {
  const modal = document.getElementById("numberSuccessModal");
  if (modal) modal.remove();
}

// authenticator input

let authConfirmed = false;
let authCountdownInterval;

function toggleAuthenticator() {
  const existing = document.getElementById("authModal");
  if (existing) {
    existing.remove();

    const checkbox = document.getElementById("auth2faCheckbox");
    if (!authConfirmed && checkbox) {
      checkbox.checked = false;
    }

    authConfirmed = false;
    clearInterval(authCountdownInterval);
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "authModal";
  overlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[999] flex items-center justify-center";

  overlay.innerHTML = `
    <div class="authdogrulama-div w-[450px] h-[544px] dark:bg-table-hover-dark bg-body-bg hidden border-[3px] border-[#0000001A] !shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[18px] p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50" style="display: block;">
      <div class="flex items-center justify-end py-0.5 mb-5">
          <img onclick="toggleAuthenticator()" src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden">
          <img onclick="toggleAuthenticator()" src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block">
        </div>
        <div class="mt-5 m-auto text-center">
          <div>
              <h1 class="text-[22px] font-semibold pb-1 dark:text-white">Google Authenticator</h1>
              <div class="text-[13px] font-normal opacity-65 dark:text-white">
                  QR kod və ya Auth Key ilə 2 addımlı doğrulamanı aktivləşdirin 
              </div>
          </div>
          <form action="#">
              <div class="w-full text-center space-y-4">
                  <div id="qrBox" class="my-6 dark:!bg-table-hover-dark bg-container-2 w-[180px] h-[180px] p-[15px] m-auto rounded-[8px] qr-animate">
                      <div class="scan-bar"></div>
                      <img src="/public/images/settings/healthicons_qr-code.svg" alt="healthicons_qr-code" class="h-full w-full object-contain block dark:hidden">
                      <img src="/public/images/settings/healthicons_qr-code-dark.svg" alt="healthicons_qr-code" class="h-full w-full object-contain hidden dark:block">
                  </div>
                  <div class="dark:bg-transparent bg-container-2 flex items-center justify-center gap-[18.5px] w-[317px] h-[50px] m-auto rounded-[500px]">
                      <div class="text-[17px] font-semibold dark:text-white">2343 - AJHN - AK2H - 1297</div>
                      <div class="icon iconex-copy-1 cursor-pointer dark:text-white"></div>
                  </div>
              </div>
                <div class="flex items-center justify-center flex-col w-full gap-3 mt-[30px] mb-6">
                  <a href="#" class="text-[13px] font-medium w-full bg-primary text-body-bg py-[6.5px] px-[18px] rounded-[50px] hover:bg-hover-button" onclick="ireliAuthenticator()">İrəli</a>
                  <a href="#" class="text-[13px] font-medium w-full bg-surface text-on-surface-variant py-[6.5px] px-[18px] rounded-[50px] dark:bg-surface-bright-dark dark:text-on-surface-variant-dark" onclick="toggleAuthenticator()">Ləğv et</a>
                </div>
          </form>
        </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("mousedown", (e) => {
    overlay.dataset.wasInside = e.target.closest(".authdogrulama-div")
      ? "true"
      : "false";
  });

  overlay.addEventListener("mouseup", (e) => {
    const wasInside = overlay.dataset.wasInside === "true";
    if (!wasInside) {
      toggleAuthenticator();
    }
  });

  document.addEventListener("keydown", function escClose(e) {
    if (e.key === "Escape") {
      toggleAuthenticator();
      document.removeEventListener("keydown", escClose);
    }
  });
}

function ireliAuthenticator() {
  const authModal = document.getElementById("authModal");
  if (authModal) {
    authModal.remove(); // Remove the current QR modal
  }

  const tesdiqDiv = document.createElement("div");
  tesdiqDiv.className =
    "authenticator-tesdiq w-[450px] h-[396px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[9998]";

  tesdiqDiv.innerHTML = `
     <div class="flex items-center justify-end py-0.5 mb-5">
        <img onclick="closeTesdiqModal()" src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden">
        <img onclick="closeTesdiqModal()" src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block">
      </div>
      <div id="otpContainer" class="mt-5 m-auto text-center">
        <div>
          <h1 class="text-[22px] font-semibold pb-1 dark:text-white">Google Authenticator</h1>
          <div class="text-[13px] font-normal opacity-65 dark:text-white">
            Authentication mobil tətbiqndə sizə təqdim edilmiş 6 rəqəmli pin kodu daxil edin
          </div>
        </div>
        <form class="pt-6" onsubmit="event.preventDefault(); submitTesdiq();">
          <div class="w-full text-center space-y-4">
            <div class="grid grid-cols-6 gap-2">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
                <input type="text" maxlength="1" class="otp-input w-[60px] h-[34px] border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-[#ffffff1A] dark:text-white w-full text-center border-2 border-purple-300 rounded-md focus:border-purple-500 text-xl" required="" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code">
            </div>
          </div>
          <div id="countdown2" class="text-messages my-6 dark:bg-inverse-surface dark:text-white bg-inverse-on-surface rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] font-medium font-poppins">00:29</div>
          <div class="flex items-center justify-center flex-col w-full gap-3">
            <button onclick="submitTesdiq()" type="submit" class="text-[13px] font-medium w-full bg-primary text-body-bg py-[6.5px] px-[18px] rounded-[50px] cursor-pointer hover:bg-hover-button">Təsdiqlə</button>
            <button onclick="closeTesdiqModal()" type="button" class="text-[13px] font-medium w-full bg-surface text-on-surface-variant py-[6.5px] px-[18px] rounded-[50px] cursor-pointer dark:bg-surface-bright-dark dark:text-on-surface-variant-dark">Ləğv et</button>
          </div>
        </form>
      </div>
  `;

  document.body.appendChild(tesdiqDiv);
  startOtpCountdown();
}

function closeTesdiqModal() {
  const tesdiq = document.querySelector(".authenticator-tesdiq");
  if (tesdiq) tesdiq.remove();
  clearInterval(authCountdownInterval);
}

function startOtpCountdown() {
  let seconds = 29;
  const countdownEl = document.getElementById("countdown2");
  authCountdownInterval = setInterval(() => {
    if (seconds <= 0) {
      clearInterval(authCountdownInterval);
      countdownEl.textContent = "00:00";
    } else {
      countdownEl.textContent = `00:${seconds.toString().padStart(2, "0")}`;
      seconds--;
    }
  }, 1000);
}

function submitTesdiq() {
  const inputs = document.querySelectorAll(".authenticator-tesdiq .otp-input");
  const allFilled = Array.from(inputs).every((input) => input.value.trim() !== "");

  if (!allFilled) {
    alert("Zəhmət olmasa bütün xanaları doldurun.");
    return;
  }

  clearInterval(authCountdownInterval);
  toggleAuthenticator();
  showAuthenticatorSuccessModal();
}

function showAuthenticatorSuccessModal() {
  const overlay = document.createElement("div");
  overlay.id = "authenticatorSuccessModal";
  overlay.className = "fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[1001] flex items-center justify-center";

  overlay.innerHTML = `
    <div class="number-ugurlu w-[450px] h-[306px] dark:bg-table-hover-dark bg-body-bg border-[3px] border-[#0000001A] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div class="flex items-center justify-end">
        <img src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden" onclick="closeNumberSuccessModal()">
        <img src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" onclick="closeNumberSuccessModal()">
      </div>
      <div class="mt-5 flex items-center justify-center flex-col">
        <img src="/public/images/settings/Shield.svg" alt="Shield">
        <span class="text-[22px] font-semibold mt-[32px] dark:text-white">Uğurlu</span>
        <span class="mt-1 opacity-65 text-[13px] font-normal dark:text-white">Nömrə ilə 2 addımlı doğrulama təsdiqləndi</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Modal xaricinə kliklə bağla
  overlay.addEventListener("mousedown", (e) => {
    overlay.dataset.wasInside = e.target.closest(".number-ugurlu") ? "true" : "false";
  });

  overlay.addEventListener("mouseup", (e) => {
    if (overlay.dataset.wasInside !== "true") {
      closeNumberSuccessModal();
    }
  });

  document.addEventListener("keydown", function escClose(e) {
    if (e.key === "Escape") {
      closeNumberSuccessModal();
      document.removeEventListener("keydown", escClose);
    }
  });
}

function closeNumberSuccessModal() {
  const modal = document.getElementById("authenticatorSuccessModal");
  if (modal) modal.remove();
}



