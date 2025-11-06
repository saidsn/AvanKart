function Otp(email, tempDeleteId, options = {}) {
  console.log(
    "=== Open OTP modal for email:",
    email,
    "and tempDeleteId:",
    tempDeleteId,
    "==="
  );
  console.log("Options:", options);

  // Default options
  const defaultOptions = {
    url: "/rbac/rbacPermission/acceptDelete",
    title: "OTP Təsdiqləməsi",
    formType: "deleteUser",
    submitText: "Təsdiqlə",
    cancelText: "Ləğv et",
    expiresIn: 300,
    resendUrl: null,
    resendPayload: {},

    // [ADDED] — Resend uğurlu olanda popup bağlanmasın (task: modal açıq qalsın)
    closeOnResendSuccess: false,
  };

  // Merge options with defaults
  const config = { ...defaultOptions, ...options };

  // Store config globally so submitFormm can access it
  window.otpConfig = config;

  console.log("Final config:", config);

  // Try to get CSRF token from different sources
  let csrfToken = "";
  const csrfInput = document.querySelector('input[name="_csrf"]');
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');

  if (csrfInput) {
    csrfToken = csrfInput.value;
    console.log("CSRF from input:", csrfToken);
  } else if (csrfMeta) {
    csrfToken = csrfMeta.getAttribute("content");
    console.log("CSRF from meta:", csrfToken);
  } else {
    console.error("CSRF token not found!");
  }

  // Also check if there's a csrf cookie
  const cookies = document.cookie.split(";");
  const csrfCookie = cookies.find((c) => c.trim().startsWith("_csrf="));
  if (csrfCookie) {
    console.log("CSRF cookie found:", csrfCookie);
  }

  // Eyni anda açıq modal varsa sil (təkrarlı açılışların qarşısı)
  try {
    const prev = document.getElementById("otp-modal");
    if (prev && prev.parentNode) prev.parentNode.remove();
  } catch (_) {}

  const modalHTML = `
  <div class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-101" id="otp-modal">
    <div class="relative w-[450px] h-[440px] border-[#0000001A] border-[2px]
      shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

      <h2 class="text-[15px] font-medium text-messages ml-[24px] mt-[26px]">${config.title}</h2>

      <div class="flex flex-col  mb-[24px]  pt-[20px] max-w-[400px] w-[100%] m-auto">
        <h2 class=" pb-[4px] text-[17px] font-poppins font-semibold  leading-[160%]  text-messages ">OTP</h2>
        <div class="flex flex-wrap gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
          <span class="font-medium">${email ?? ""}</span>
          <span class="opacity-65 font-normal">email adresinə göndərilən 6 </span>
          <span class=" opacity-65 font-normal">rəqəmli şifrəni daxil edin</span>
        </div>
      </div>

      <!-- Error/Success message area -->
      <div id="otp-message-area" class="hidden mx-[24px] mb-[16px]">
        <div id="otp-error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm"></div>
        <div id="otp-success-message" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm"></div>
      </div>

      <form id="deleteUserForm" onsubmit="return false;"
        data-url="${config.url}"
        data-form-type="${config.formType}">
        <input type="hidden" name="_csrf" value="${csrfToken}" />
        <input type="hidden" name="tempDeleteId" value="${tempDeleteId || ""}" />

        <div class=" text-center space-y-4 max-w-[400px] w-[100%] m-auto">

          <!-- Countdown: JS ilə dinamik yenilənəcək -->
          <div id="countdown" class="text-messages bg-inverse-on-surface  rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium  leading--[160%] font-poppins">
            05:00
          </div>

          <div class="grid grid-cols-6 gap-2 mt-[8px]">
            <input type="text" maxlength="1" inputmode="numeric" name="otp1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
            hover:bg-input-hover
            focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300" />
            <input type="text" maxlength="1" inputmode="numeric" name="otp2" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
            hover:bg-input-hover
            focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300" />
            <input type="text" maxlength="1" inputmode="numeric" name="otp3" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
            hover:bg-input-hover
            focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300" />
            <input type="text" maxlength="1" inputmode="numeric" name="otp4" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
            hover:bg-input-hover
            focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300" />
            <input type="text" maxlength="1" inputmode="numeric" name="otp5" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
            hover:bg-input-hover
            focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300" />
            <input type="text" maxlength="1" inputmode="numeric" name="otp6" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
            hover:bg-input-hover
            focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300" />
          </div>
          <input type="hidden" id="combined-otp" name="otp" value="" />
        </div>

        <div class="text-center  flex justify-center max-w-[400px] w-[100%] m-auto">
          <p class="font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
          <a id="otpResendBtn" href="#" class="text-[12px] font-medium font-poppins text-messages  px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none">Yenidən göndər</a>
        </div>

        <div class="absolute bottom-[24px] right-[12px] flex gap-[12px]">
          <button type="button" class=" text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[83px] !h-[34px]" onclick="closeOtpModal()">${config.cancelText}</button>
          <button type="button"
            onclick="submitFormm('${config.formType}')"
            class=" text-[13px] text-on-primary font-medium bg-primary rounded-[50px] !w-[91px] !h-[34px]">${config.submitText}</button>
        </div>
      </form>
    </div>
  </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);

  // OTP inputs
  const otpInputs = container.querySelectorAll(".otp-input");
  const combinedOtpInput = container.querySelector("#combined-otp");
  const countdownEl = container.querySelector("#countdown");

  // Resend button: resendUrl yoxdursa gizlədilir
  const resendBtn = container.querySelector("#otpResendBtn");
  if (!config.resendUrl) {
    resendBtn.style.display = "none";
  }

  // COUNTDOWN start
  let _otpCountdownTimer = null;
  startOtpCountdown(countdownEl, Number(config.expiresIn) || 300, () => {
    // Vaxt bitəndə:
    closeOtpModal(); // popup bağla
    if (typeof window.alertModal === "function") {
      window.alertModal("Vaxt bitdi");
    } else {
      alert("Vaxt bitdi");
    }
  });

  // OTP input davranışı (rəqəm, auto-focus, ox tuşları, paste)
  if (otpInputs.length > 0 && combinedOtpInput) {
    otpInputs.forEach((input, index) => {
      input.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
        let otp = "";
        otpInputs.forEach(
          (inp) => (otp += (inp.value || "").replace(/\D/g, ""))
        );
        combinedOtpInput.value = otp;
        hideOtpMessages();
        if (this.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !this.value && index > 0) {
          otpInputs[index - 1].focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
          otpInputs[index - 1].focus();
        }
        if (e.key === "ArrowRight" && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      // PASTE: tək input-a 6 rəqəm yapışdırıldıqda bütün inputlara paylanır
      input.addEventListener("paste", function (e) {
        e.preventDefault();
        const text =
          (e.clipboardData || window.clipboardData).getData("text") || "";
        const digits = text.replace(/\D/g, "").split("");
        if (!digits.length) return;

        otpInputs.forEach((el, i) => {
          el.value = digits[i] || "";
        });

        let otp = "";
        otpInputs.forEach(
          (inp) => (otp += (inp.value || "").replace(/\D/g, ""))
        );
        combinedOtpInput.value = otp;

        const lastFilled = Math.min(digits.length, otpInputs.length) - 1;
        if (lastFilled >= 0) otpInputs[lastFilled].focus();
      });
    });

    otpInputs[0].focus();
  }

  // RESEND handler — uğurda modal BAĞLANMIR, countdown yenilənir
  resendBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    if (!config.resendUrl) return;

    try {
      const body = {
        email: email || undefined,
        tempDeleteId: tempDeleteId || undefined,
        formType: config.formType || undefined,
        ...config.resendPayload,
      };

      // button loading state (duplik kliklərə qarşı)
      const oldText = resendBtn.textContent;
      resendBtn.textContent = "Göndərilir...";
      resendBtn.classList.add("opacity-60", "pointer-events-none");

      const res = await fetch(config.resendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // [CHANGED] layihəndə digər requestlər "CSRF-Token" ilə gedirdi
          "CSRF-Token": csrfToken,
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      console.log("[OTP] Resend response ←", data);

      // loading state bərpa
      resendBtn.textContent = oldText;
      resendBtn.classList.remove("opacity-60", "pointer-events-none");

      if (data?.success) {
        // [CHANGED] — Artıq bağlamırıq. Mesaj göstərəcək, inputları təmizləyəcək,
        // və COUNTDOWN-u yenidən başladacağıq (backend-dən expiresIn gələrsə onu əsas götür).
        showOtpSuccess(data?.message || "Yeni OTP göndərildi");

        // inputları təmizlə (istəsən saxla — amma adətən resend-dən sonra təzə kod daxil edilir)
        otpInputs.forEach((i) => (i.value = ""));
        combinedOtpInput.value = "";
        if (otpInputs.length) otpInputs[0].focus();

        // Mövcud timeri dayandır və yenisini başlat
        try {
          if (_otpCountdownTimer) {
            clearInterval(_otpCountdownTimer);
            _otpCountdownTimer = null;
          }
        } catch (_) {}

        const freshExpires =
          Number(data?.expiresIn) || Number(config.expiresIn) || 300;

        startOtpCountdown(countdownEl, freshExpires, () => {
          closeOtpModal();
          if (typeof window.alertModal === "function") {
            window.alertModal("Vaxt bitdi");
          } else {
            alert("Vaxt bitdi");
          }
        });

        return;
      }

      showOtpError(data?.message || "Yenidən göndərmə uğursuz oldu");
    } catch (err) {
      console.error("[OTP] Resend error", err);
      // loading state bərpa
      resendBtn.classList.remove("opacity-60", "pointer-events-none");
      resendBtn.textContent = "Yenidən göndər";
      showOtpError("Xəta baş verdi");
    }
  });

  // ===== Helper-lər =====

  function startOtpCountdown(el, totalSeconds, onExpire) {
    const clamp = (n) => Math.max(0, parseInt(n, 10) || 0);
    let left = clamp(totalSeconds);

    render();

    _otpCountdownTimer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(_otpCountdownTimer);
        _otpCountdownTimer = null;
        render(0);
        try {
          onExpire && onExpire();
        } catch (_) {}
        return;
      }
      render();
    }, 1000);

    function render(override = null) {
      const val = override != null ? override : left;
      const mm = String(Math.floor(val / 60)).padStart(2, "0");
      const ss = String(val % 60).padStart(2, "0");
      if (el) el.textContent = `${mm}:${ss}`;
    }
  }

  function hideOtpMessages() {
    const area = document.getElementById("otp-message-area");
    const err = document.getElementById("otp-error-message");
    const ok = document.getElementById("otp-success-message");
    if (area) area.classList.add("hidden");
    if (err) {
      err.classList.add("hidden");
      err.textContent = "";
    }
    if (ok) {
      ok.classList.add("hidden");
      ok.textContent = "";
    }
  }

  function showOtpError(msg) {
    const area = document.getElementById("otp-message-area");
    const err = document.getElementById("otp-error-message");
    if (area) area.classList.remove("hidden");
    if (err) {
      err.classList.remove("hidden");
      err.textContent = msg || "";
    }
    const ok = document.getElementById("otp-success-message");
    if (ok) ok.classList.add("hidden");
  }

  function showOtpSuccess(msg) {
    const area = document.getElementById("otp-message-area");
    const ok = document.getElementById("otp-success-message");
    if (area) area.classList.remove("hidden");
    if (ok) {
      ok.classList.remove("hidden");
      ok.textContent = msg || "";
    }
    const err = document.getElementById("otp-error-message");
    if (err) err.classList.add("hidden");
  }

  // Modal bağlama + timer təmizləmə
  window.closeOtpModal = function () {
    try {
      if (typeof _otpCountdownTimer !== "undefined" && _otpCountdownTimer) {
        clearInterval(_otpCountdownTimer);
      }
    } catch (_) {}
    try {
      const modal = document.getElementById("otp-modal");
      if (modal && modal.parentNode) {
        modal.parentNode.remove();
      }
    } catch (_) {}
  };
}

function Otp2() {
  const modalHTML = `
  <div class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-100" id="otp-modal">
  <div class="relative w-[450px] h-[399px] border-[#0000001A] border-[2px]
    shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

     <h2 class="text-[15px] font-medium text-messages ml-[24px] mt-[26px]">Hesab təsdiqi</h2>

          <div class="flex flex-col  mb-[24px]  pt-[20px] max-w-[400px] w-[100%] m-auto">
            <h2 class=" pb-[4px] text-[17px] font-poppins font-semibold  leading-[160%]  text-messages ">OTP</h2>
            <div class="flex flex-wrap gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
                <span class="font-medium">ramin.orucovvv@gmail.com</span>
                <span class="opacity-65 font-normal">email adresinə göndərilən 6 </span>
                <span class=" opacity-65 font-normal">rəqəmli şifrəni daxil edin</span>
              </div>

                      </div>


        <form>

            <div class=" text-center space-y-4 max-w-[400px] w-[100%] m-auto">

                <div id="countdown" class="text-messages bg-inverse-on-surface  rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium  leading--[160%] font-poppins">
                  4:59
                </div>

                <div class="grid grid-cols-6 gap-2 mt-[8px]">
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" name="otp1" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" name="otp2" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" name="otp3" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" name="otp4" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" name="otp5" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" name="otp6" />
                </div>
              </div>
              <div class="text-center  flex justify-center max-w-[400px] w-[100%] m-auto">
                <p class="font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
                <a href="#" class="text-[12px] font-medium font-poppins text-messages  px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none  ">Yenidən göndər</a>
            </div>
            <div class="absolute bottom-[24px] right-[12px] flex gap-[12px]">
                <button href="#" class=" text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[83px] !h-[34px]">Ləvğ et</button>
                <button href="#" class=" text-[13px] text-on-primary font-medium bg-primary rounded-[50px] !w-[91px] !h-[34px]">Təsdiqlə</button>
              </div>


        </form>
</div>
  </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
}

const showEditModal = () => {
  const existing = document.getElementById("editModal");
  if (existing) existing.remove();

  const modalHTML = `
    <div id="editModal" class="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50">
      <div class="bg-white rounded-2xl shadow-lg mx-auto p-6 overflow-y-auto max-h-[90vh]" style="width: 494px;">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Redaktə et</h2>
          <button onclick="document.getElementById('editModal').remove()" class="text-gray-500 hover:text-black text-xl">&times;</button>
        </div>
        <form class="space-y-4 text-sm">
          <div>
            <label class="block mb-1 text-gray-700 font-medium"><span class="text-error">*</span> Ad və Soyad</label>
            <input type="text" value="Ramin Orucov" class="w-full rounded-full border border-gray-300 px-4 py-2 bg-gray-100 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-gray-700 font-medium"><span class="text-error">*</span> Cinsiyyət</label>
            <div class="flex gap-6">
              <label class="inline-flex items-center gap-1">
                <input type="radio" name="gender" class=" w-4 h-4  text-on-surface-variant-dark" checked />
                <span>Kişi</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" name="gender" class=" w-4 h-4 text-on-surface-variant-dark" />
                <span>Qadın</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block mb-1 text-gray-700 font-medium"><span class="text-error">*</span> Email</label>
            <input type="email" value="ramin.orucovvv@gmail.com" class="w-full rounded-full border border-gray-300 px-4 py-2 bg-gray-100 focus:outline-none" />
          </div>
          <div>
            <label class="block mb-1 text-gray-700 font-medium"><span class="text-error">*</span> Telefon nömrəniz</label>
            <div class="flex gap-2">
              <select class="appearance-none pl-4 pr-8 py-2 rounded-full border border-gray-300 bg-white text-gray-700">
                <option>+994</option>
              </select>
              <input type="text" value="050 770 35 22" class="flex-1 rounded-full border border-gray-300 px-4 py-2 bg-gray-100 focus:outline-none" />
            </div>
          </div>
          <div>
            <label class="block mb-1 text-gray-700 font-medium"><span class="text-error">*</span> Vəzifə</label>
              <select
                  class="w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative">
                  <option>Sistem inzibatçısı</option>
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Mühasiblər</option>
               </select>


          </div>
          <div>
            <label class="block mb-1 text-gray-700 font-medium"><span class="text-error">*</span> Səlahiyyət qrupu</label>
                <select
                  class="w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative">
                  <option >Sistem inzibatçısı</option>
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Mühasiblər</option>
               </select>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button"  class="px-4 py-2 rounded-full border text-gray-600">Ləğv et</button>
            <button onclick="Otp()" type="submit" class="px-4 py-2 rounded-full bg-primary text-white">Dəyişikliyi təsdiqlə</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
};

// OTP kodunu birləşdirmək üçün funksiya
function collectOtpCode() {
  const otp1 = document.querySelector('input[name="otp1"]')?.value || "";
  const otp2 = document.querySelector('input[name="otp2"]')?.value || "";
  const otp3 = document.querySelector('input[name="otp3"]')?.value || "";
  const otp4 = document.querySelector('input[name="otp4"]')?.value || "";
  const otp5 = document.querySelector('input[name="otp5"]')?.value || "";
  const otp6 = document.querySelector('input[name="otp6"]')?.value || "";

  return otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
}

// submitForm funksiyasını yenilə - dinamik olaraq bütün form tipləri üçün
window.submitFormm = function (formType) {
  console.log("submitFormm called with formType:", formType);

  const form = document.getElementById("deleteUserForm");
  if (!form) {
    console.error("Form tapılmadı");
    if (typeof alertModal === "function") {
      alertModal("Form tapılmadı", "error", 4000);
    } else {
      showOtpError("Form tapılmadı");
    }
    return;
  }

  // OTP kodunu rəqəm bə rəqəm topla
  const otp1 = document.querySelector('input[name="otp1"]')?.value || "";
  const otp2 = document.querySelector('input[name="otp2"]')?.value || "";
  const otp3 = document.querySelector('input[name="otp3"]')?.value || "";
  const otp4 = document.querySelector('input[name="otp4"]')?.value || "";
  const otp5 = document.querySelector('input[name="otp5"]')?.value || "";
  const otp6 = document.querySelector('input[name="otp6"]')?.value || "";

  const tempDeleteId = form.querySelector('input[name="tempDeleteId"]').value;
  const csrfToken = form.querySelector('input[name="_csrf"]').value;
  const url = form.getAttribute("data-url");

  console.log("=== OTP Form Debug ===");
  console.log("Form Type:", formType);
  console.log("Individual OTP digits:", { otp1, otp2, otp3, otp4, otp5, otp6 });
  console.log("TempDeleteId:", tempDeleteId);
  console.log("CSRF Token:", csrfToken);
  console.log("URL:", url);

  // Validate individual OTP digits
  if (!otp1 || !otp2 || !otp3 || !otp4 || !otp5 || !otp6) {
    console.log(
      "OTP validation failed - checking alertModal availability:",
      typeof alertModal === "function"
    );
    if (typeof alertModal === "function") {
      alertModal("Bütün OTP rəqəmləri doldurulmalıdır", "error", 4000);
    } else {
      showOtpError("Bütün OTP rəqəmləri doldurulmalıdır");
    }
    return;
  }

  if (!tempDeleteId) {
    if (typeof alertModal === "function") {
      alertModal("TempDeleteId tapılmadı", "error", 4000);
    } else {
      showOtpError("TempDeleteId tapılmadı");
    }
    return;
  }

  if (!csrfToken) {
    if (typeof alertModal === "function") {
      alertModal("CSRF token tapılmadı", "error", 4000);
    } else {
      showOtpError("CSRF token tapılmadı");
    }
    return;
  }

  if (!url) {
    if (typeof alertModal === "function") {
      alertModal("URL tapılmadı", "error", 4000);
    } else {
      showOtpError("URL tapılmadı");
    }
    return;
  }

  // Backend expects individual digits: { otp1: "4", otp2: "2", otp3: "5", otp4: "4", otp5: "1", otp6: "4" }
  const postData = new URLSearchParams();
  postData.append("otp1", otp1);
  postData.append("otp2", otp2);
  postData.append("otp3", otp3);
  postData.append("otp4", otp4);
  postData.append("otp5", otp5);
  postData.append("otp6", otp6);
  postData.append("tempDeleteId", tempDeleteId);
  postData.append("_csrf", csrfToken);

  console.log("Post data to send:", postData.toString());

  // Disable submit button to prevent double submission
  const submitButton = document.querySelector(`button[onclick*="${formType}"]`);
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Yoxlanır...";
  }

  // AJAX request göndər
  console.log("Sending request to:", url);

  fetch(url, {
    method: "POST",
    body: postData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => {
      console.log("Response status:", response.status);
      return response.json().catch(() => {
        throw new Error("Server-dən gələn cavab JSON formatında deyil");
      });
    })
    .then((data) => {
      console.log("Response data:", data);

      if (data.success) {
        // Dinamik mesaj form tipinə görə
        let successMessage = "Əməliyyat uğurla tamamlandı";
        if (formType === "deletePermission") {
          successMessage = "Səlahiyyət qrupu uğurla silindi";
        } else if (formType === "deleteDuty") {
          successMessage = "Vəzifə uğurla silindi";
        } else if (formType === "deleteUser") {
          successMessage = "İstifadəçi uğurla silindi";
        }else{
          successMessage = data.message;
        }

        // Try to get callback from window context (əgər varsa)
        const config = window.otpConfig || {};

        // Callback funksiyasını çağır (əgər varsa)
        if (typeof config.onSuccess === "function") {
          config.onSuccess(data);
          closeOtpModal();
        } else {
          if (typeof alertModal === "function") {
            alertModal(data.message || successMessage, "success", 3000);
          } else {
            showOtpSuccess(data.message || successMessage);
          }
          setTimeout(() => {
            // closeOtpModal();
            document.getElementById("otp-modal").classList.add("hidden");
            location.reload();
          }, 1500);
        }
      } else {
        // Backend-dən gələn error mesajını göstər
        const errorMessage = data.message || "Naməlum xəta baş verdi";

        // Try to get callback from window context (əgər varsa)
        const config = window.otpConfig || {};

        // Callback funksiyasını çağır (əgər varsa)
        if (typeof config.onError === "function") {
          config.onError(data);
        } else {
          alertModal(errorMessage, "error");
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);

      let errorMessage = "Server xətası baş verdi";
      if (error.message) {
        errorMessage = error.message;
      }

      // Try to get callback from window context (əgər varsa)
      const config = window.otpConfig || {};

      // Callback funksiyasını çağır (əgər varsa)
      if (typeof config.onError === "function") {
        config.onError({ message: errorMessage, error: error });
      } else {
        alertModal(errorMessage, "error");
      }
    })
    .finally(() => {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          formType === "deleteUser" ? "Təsdiqlə" : "Təsdiqlə";
      }
    });
};

// OTP modal-ını bağlamaq üçün funksiya
window.closeOtpModal = function () {
  const otpModal = document.getElementById("otp-modal");
  if (otpModal) {
    otpModal.remove();
  }
  // Clear global config when modal is closed
  window.otpConfig = null;
};

// Error mesajını göstərmək üçün funksiya
window.showOtpError = function (message) {
  console.log("showOtpError called with message:", message);

  // Əvvəlcə alertModal istifadə etməyə çalış
  if (typeof alertModal === "function") {
    console.log("Using alertModal for error message");
    alertModal(message, "error", 5000);
    return;
  }

  console.log("alertModal not available, using popup internal display");

  // Əgər alertModal yoxdursa, popup içində göstər
  const messageArea = document.getElementById("otp-message-area");
  const errorDiv = document.getElementById("otp-error-message");
  const successDiv = document.getElementById("otp-success-message");

  if (messageArea && errorDiv) {
    // Hide success message and show error
    successDiv.classList.add("hidden");
    errorDiv.classList.remove("hidden");
    messageArea.classList.remove("hidden");

    errorDiv.textContent = message;

    // Auto hide after 5 seconds
    setTimeout(() => {
      hideOtpMessages();
    }, 5000);
  }
};

// Success mesajını göstərmək üçün funksiya
window.showOtpSuccess = function (message) {
  console.log("showOtpSuccess called with message:", message);

  // Əvvəlcə alertModal istifadə etməyə çalış
  if (typeof alertModal === "function") {
    console.log("Using alertModal for success message");
    alertModal(message, "success", 3000);
    return;
  }

  console.log("alertModal not available, using popup internal display");

  // Əgər alertModal yoxdursa, popup içində göstər
  const messageArea = document.getElementById("otp-message-area");
  const errorDiv = document.getElementById("otp-error-message");
  const successDiv = document.getElementById("otp-success-message");

  if (messageArea && successDiv) {
    // Hide error message and show success
    errorDiv.classList.add("hidden");
    successDiv.classList.remove("hidden");
    messageArea.classList.remove("hidden");

    successDiv.textContent = message;
  }
};

// Mesajları gizlətmək üçün funksiya
window.hideOtpMessages = function () {
  const messageArea = document.getElementById("otp-message-area");
  const errorDiv = document.getElementById("otp-error-message");
  const successDiv = document.getElementById("otp-success-message");

  if (messageArea && errorDiv && successDiv) {
    errorDiv.classList.add("hidden");
    successDiv.classList.add("hidden");
    messageArea.classList.add("hidden");
  }
};
