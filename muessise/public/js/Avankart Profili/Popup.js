function Otp(email, tempDeleteId, options = {}) {
  const defaultOptions = {
    url: "/muessise-info/accept-delete-user",
    title: "OTP Təsdiqləməsi",
    formType: "deleteUser",
    submitText: "Təsdiqlə",
    cancelText: "Ləğv et",
  };

  const config = { ...defaultOptions, ...options };

  let csrfToken = "";
  const csrfInput = document.querySelector('input[name="_csrf"]');
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');

  if (csrfInput) {
    csrfToken = csrfInput.value;
  } else if (csrfMeta) {
    csrfToken = csrfMeta.getAttribute("content");
  }

  const cookies = document.cookie.split(";");
  const csrfCookie = cookies.find((c) => c.trim().startsWith("_csrf="));

  const modalHTML = `
  <div class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-100" id="otp-modal">
  <div class="relative w-[450px] h-[399px] border-[#0000001A] border-[2px]
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


        <form id="otpForm" onsubmit="return false;"
        data-url="${config.url}"
        data-form-type="${config.formType}"
        >
            <input type="hidden" name="_csrf" value="${csrfToken}" />
            <input type="hidden" name="tempDeleteId" value="${tempDeleteId || ""}" />

            <div class=" text-center space-y-4 max-w-[400px] w-[100%] m-auto">

                <div id="countdown" class="text-messages bg-inverse-on-surface  rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium  leading--[160%] font-poppins">
                  4:59
                </div>

                <div class="grid grid-cols-6 gap-2 mt-[8px]">
                    <input type="text" maxlength="1" name="otp1" class="otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] text-center placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300 h-[48px] w-full text-lg font-medium" />
                    <input type="text" maxlength="1" name="otp2" class="otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] text-center placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300 h-[48px] w-full text-lg font-medium" />
                    <input type="text" maxlength="1" name="otp3" class="otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] text-center placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300 h-[48px] w-full text-lg font-medium" />
                    <input type="text" maxlength="1" name="otp4" class="otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] text-center placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300 h-[48px] w-full text-lg font-medium" />
                    <input type="text" maxlength="1" name="otp5" class="otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] text-center placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300 h-[48px] w-full text-lg font-medium" />
                    <input type="text" maxlength="1" name="otp6" class="otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] text-center placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300 h-[48px] w-full text-lg font-medium" />
                </div>
                <input type="hidden" id="combined-otp" name="otp" value="" />
              </div>
              <div class="text-center  flex justify-center max-w-[400px] w-[100%] m-auto">
                <p class="font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
                <a href="#" onclick="resendOtp('${tempDeleteId || ""}')" class="text-[12px] font-medium font-poppins text-messages  px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none  ">Yenidən göndər</a>
            </div>
            <div class="absolute bottom-[24px] right-[12px] flex gap-[12px]">
                <button href="#" class=" text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[83px] !h-[34px]" onclick="closeOtpModal()">${config.cancelText}</button>
                <button 
                onclick="submitFormm('${config.formType}')"
                href="#" class=" text-[13px] text-on-primary font-medium bg-primary rounded-[50px] !w-[91px] !h-[34px]">${config.submitText}</button>
              </div>


        </form>
</div>
  </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);

  // Start countdown function for this modal
  const startCountdown = (selector) => {
    const countdownEl = container.querySelector(selector);
    if (!countdownEl) return;

    let timeLeft = 5 * 60; // 5 minutes

    const updateTimer = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        countdownEl.textContent = "0:00";
        countdownEl.classList.remove("bg-inverse-on-surface");
        countdownEl.classList.add("bg-[#F6D9FF]");
      }

      timeLeft--;
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();
  };

  startCountdown("#countdown");
  const otpInputs = container.querySelectorAll(".otp-input");
  const combinedOtpInput = container.querySelector("#combined-otp");

  if (otpInputs.length > 0 && combinedOtpInput) {
    otpInputs.forEach((input, index) => {
      input.addEventListener("input", function () {
        let otp = "";
        otpInputs.forEach((inp) => (otp += inp.value));
        combinedOtpInput.value = otp;

        if (this.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !this.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });

      input.addEventListener("paste", function (e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");

        if (/^\d{6}$/.test(pastedData)) {
          const digits = pastedData.split("");
          otpInputs.forEach((inp, idx) => {
            if (digits[idx]) {
              inp.value = digits[idx];
            }
          });

          combinedOtpInput.value = pastedData;

          otpInputs[5].focus();
        }
      });
    });
  }
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

function collectOtpCode() {
  const otp1 = document.querySelector('input[name="otp1"]')?.value || "";
  const otp2 = document.querySelector('input[name="otp2"]')?.value || "";
  const otp3 = document.querySelector('input[name="otp3"]')?.value || "";
  const otp4 = document.querySelector('input[name="otp4"]')?.value || "";
  const otp5 = document.querySelector('input[name="otp5"]')?.value || "";
  const otp6 = document.querySelector('input[name="otp6"]')?.value || "";

  return otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
}

window.submitFormm = function (formType) {
  console.log("submitFormm çağırıldı, formType:", formType);

  // Prevent multiple submissions
  if (window.isSubmittingOtp) {
    console.log("Already submitting, preventing duplicate");
    return;
  }
  window.isSubmittingOtp = true;

  const form = document.getElementById("otpForm");
  if (!form) {
    alert("Form tapılmadı");
    window.isSubmittingOtp = false;
    return;
  }

  const otpCode = collectOtpCode();
  console.log("Collected OTP code:", otpCode, "Length:", otpCode.length);

  // Debug: Log all OTP inputs
  for (let i = 1; i <= 6; i++) {
    const input = document.querySelector(`input[name="otp${i}"]`);
    console.log(`OTP input ${i}:`, input ? input.value : "not found");
  }

  const tempDeleteId = form.querySelector('input[name="tempDeleteId"]').value;
  const csrfToken = form.querySelector('input[name="_csrf"]').value;
  const url = form.getAttribute("data-url");

  console.log("Form data:", { otpCode, tempDeleteId, url, formType });

  if (!otpCode || otpCode.length !== 6) {
    console.error(
      "OTP validation failed. Code:",
      otpCode,
      "Length:",
      otpCode.length
    );
    alert("OTP kodu 6 rəqəm olmalıdır");
    window.isSubmittingOtp = false;
    return;
  }

  if (!tempDeleteId) {
    alert("TempDeleteId tapılmadı");
    window.isSubmittingOtp = false;
    return;
  }

  if (!csrfToken) {
    alert("CSRF token tapılmadı");
    window.isSubmittingOtp = false;
    return;
  }

  if (!url) {
    alert("URL tapılmadı");
    window.isSubmittingOtp = false;
    return;
  }

  const postData = new URLSearchParams();

  if (otpCode.length === 6) {
    postData.append("otp1", otpCode[0]);
    postData.append("otp2", otpCode[1]);
    postData.append("otp3", otpCode[2]);
    postData.append("otp4", otpCode[3]);
    postData.append("otp5", otpCode[4]);
    postData.append("otp6", otpCode[5]);
  }

  postData.append("tempDeleteId", tempDeleteId);
  postData.append("_csrf", csrfToken);

  fetch(url, {
    method: "POST",
    credentials: "include",
    body: postData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("accept-delete-user failed:", response.status, text);
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      window.isSubmittingOtp = false;
      if (data.success) {
        let successMessage = "Əməliyyat uğurla tamamlandı";
        if (formType === "deletePermission") {
          successMessage = "Səlahiyyət qrupu uğurla silindi";
        } else if (formType === "deleteDuty") {
          successMessage = "Vəzifə uğurla silindi";
        } else if (formType === "deleteUser") {
          successMessage = "İstifadəçi uğurla silindi";
        } else if (formType === "addUser") {
          successMessage = "İstifadəçi uğurla əlavə edildi";
        } else if (formType === "editUser") {
          successMessage = "İstifadəçi məlumatları uğurla yeniləndi";
        }

        alert(data.message || successMessage);
        const otpModal = document.getElementById("otp-modal");
        if (otpModal) {
          otpModal.remove();
        }
        location.reload();
      } else {
        alert(data.message || "Xəta baş verdi");
      }
    })
    .catch((error) => {
      window.isSubmittingOtp = false;
      console.error("submitFormm error:", error);
      alert("Server xətası baş verdi");
    });
};

window.closeOtpModal = function () {
  const otpModal = document.getElementById("otp-modal");
  if (otpModal) {
    otpModal.remove();
  }
};

window.resendOtp = function (tempDeleteId) {
  if (!tempDeleteId) {
    alertModal("OTP göndərilmədi", "TempDeleteId tapılmadı");
    return;
  }

  let csrfToken = "";
  const csrfInput = document.querySelector('input[name="_csrf"]');
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');

  if (csrfInput) {
    csrfToken = csrfInput.value;
  } else if (csrfMeta) {
    csrfToken = csrfMeta.getAttribute("content");
  } else {
    alertModal("OTP göndərilmədi", "CSRF token tapılmadı");
    return;
  }

  fetch("/resend-otp", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      "CSRF-Token": csrfToken,
    },
    body: new URLSearchParams({
      tempDeleteId: tempDeleteId,
      _csrf: csrfToken,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("resend-otp failed:", response.status, text);
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Serverdən gələn message-i istifadə edirik
      if (data.success) {
        alertModal("OTP yenidən göndərildi", data.message || "OTP göndərildi");
        // Reset countdown in the current modal
        const countdownEl = document.querySelector("#otp-modal #countdown");
        if (countdownEl) {
          let timeLeft = 5 * 60; // 5 minutes

          const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

            if (timeLeft <= 0) {
              clearInterval(timer);
              countdownEl.textContent = "0:00";
              countdownEl.classList.remove("bg-inverse-on-surface");
              countdownEl.classList.add("bg-[#F6D9FF]");
            }

            timeLeft--;
          };

          const timer = setInterval(updateTimer, 1000);
          updateTimer();
        }
      } else {
        alertModal(
          "OTP göndərilmədi",
          data.message || "Server xətası baş verdi"
        );
      }
    })
    .catch((error) => {
      alertModal("OTP göndərilmədi", "Server xətası baş verdi");
    });
};
