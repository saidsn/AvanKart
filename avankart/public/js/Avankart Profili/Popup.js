function Otp(email, tempDeleteId, options = {}) {
  console.log("=== Open OTP modal for email:", email, "and tempDeleteId:", tempDeleteId, "===");
  console.log("Options:", options);

  // Default options
  const defaultOptions = {
    url: '/rbac/rbacPermission/acceptDelete',
    title: 'OTP Təsdiqləməsi',
    formType: 'deleteUser',
    submitText: 'Təsdiqlə',
    cancelText: 'Ləğv et'
  };

  // Merge options with defaults
  const config = { ...defaultOptions, ...options };

  console.log("Final config:", config);

  // Try to get CSRF token from different sources
  let csrfToken = '';
  const csrfInput = document.querySelector('input[name="_csrf"]');
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');

  if (csrfInput) {
    csrfToken = csrfInput.value;
    console.log("CSRF from input:", csrfToken);
  } else if (csrfMeta) {
    csrfToken = csrfMeta.getAttribute('content');
    console.log("CSRF from meta:", csrfToken);
  } else {
    console.error('CSRF token not found!');
  }

  // Also check if there's a csrf cookie
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith('_csrf='));
  if (csrfCookie) {
    console.log("CSRF cookie found:", csrfCookie);
  }


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


        <form id="deleteUserForm" onsubmit="return false;"
        data-url="${config.url}"
        data-form-type="${config.formType}"
        >
            <input type="hidden" name="_csrf" value="${csrfToken}" />
            <input type="hidden" name="tempDeleteId" value="${tempDeleteId || ''}" />

            <div class=" text-center space-y-4 max-w-[400px] w-[100%] m-auto">

                <div id="countdown" class="text-messages bg-inverse-on-surface  rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium  leading--[160%] font-poppins">
                  4:59
                </div>

                <div class="grid grid-cols-6 gap-2 mt-[8px]">
                    <input type="text" maxlength="1" name="otp1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" name="otp2" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" name="otp3" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" name="otp4" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" name="otp5" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" name="otp6" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                </div>
                <input type="hidden" id="combined-otp" name="otp" value="" />
              </div>
              <div class="text-center  flex justify-center max-w-[400px] w-[100%] m-auto">
                <p class="font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
                <a href="#" class="text-[12px] font-medium font-poppins text-messages  px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none  ">Yenidən göndər</a>
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

  // OTP input-ları üçün event listener
  const otpInputs = container.querySelectorAll('.otp-input');
  const combinedOtpInput = container.querySelector('#combined-otp');

  if (otpInputs.length > 0 && combinedOtpInput) {
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', function () {
        // OTP-ni birləşdir
        let otp = '';
        otpInputs.forEach(inp => otp += inp.value);
        combinedOtpInput.value = otp;

        // Növbəti input-a get
        if (this.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', function (e) {
        // Backspace ilə əvvəlki input-a get
        if (e.key === 'Backspace' && !this.value && index > 0) {
          otpInputs[index - 1].focus();
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

// OTP kodunu birləşdirmək üçün funksiya
function collectOtpCode() {
  const otp1 = document.querySelector('input[name="otp1"]')?.value || '';
  const otp2 = document.querySelector('input[name="otp2"]')?.value || '';
  const otp3 = document.querySelector('input[name="otp3"]')?.value || '';
  const otp4 = document.querySelector('input[name="otp4"]')?.value || '';
  const otp5 = document.querySelector('input[name="otp5"]')?.value || '';
  const otp6 = document.querySelector('input[name="otp6"]')?.value || '';

  return otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
}

// submitForm funksiyasını yenilə - dinamik olaraq bütün form tipləri üçün
window.submitFormm = function (formType) {
  console.log('submitFormm called with formType:', formType);

  const form = document.getElementById('deleteUserForm');
  if (!form) {
    console.error('Form tapılmadı');
    alert('Form tapılmadı');
    return;
  }

  // OTP kodunu topla və əlavə et
  const otpCode = collectOtpCode();
  const tempDeleteId = form.querySelector('input[name="tempDeleteId"]').value;
  const csrfToken = form.querySelector('input[name="_csrf"]').value;
  const url = form.getAttribute('data-url');

  console.log('=== OTP Form Debug ===');
  console.log('Form Type:', formType);
  console.log('OTP Code collected:', otpCode);
  console.log('OTP Code length:', otpCode.length);
  console.log('TempDeleteId:', tempDeleteId);
  console.log('CSRF Token:', csrfToken);
  console.log('URL:', url);

  // Validate data before sending
  if (!otpCode || otpCode.length !== 6) {
    alert('OTP kodu 6 rəqəm olmalıdır');
    return;
  }

  if (!tempDeleteId) {
    alert('TempDeleteId tapılmadı');
    return;
  }

  if (!csrfToken) {
    alert('CSRF token tapılmadı');
    return;
  }

  if (!url) {
    alert('URL tapılmadı');
    return;
  }

  // Regular POST data instead of FormData
  const postData = new URLSearchParams();
  postData.append('otp', otpCode);
  postData.append('tempDeleteId', tempDeleteId);
  postData.append('_csrf', csrfToken);

  console.log('Post data to send:', postData.toString());

  // AJAX request göndər
  console.log('Sending request to:', url);

  fetch(url, {
    method: 'POST',
    body: postData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      console.log('Response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Response data:', data);
      if (data.success) {
        // Dinamik mesaj form tipinə görə
        let successMessage = 'Əməliyyat uğurla tamamlandı';
        if (formType === 'deletePermission') {
          successMessage = 'Səlahiyyət qrupu uğurla silindi';
        } else if (formType === 'deleteDuty') {
          successMessage = 'Vəzifə uğurla silindi';
        } else if (formType === 'deleteUser') {
          successMessage = 'İstifadəçi uğurla silindi';
        }

        alert(data.message || successMessage);
        // OTP modal-ını bağla
        const otpModal = document.getElementById('otp-modal');
        if (otpModal) {
          otpModal.remove();
        }
        location.reload();
      } else {
        alert(data.message || 'Xəta baş verdi');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Server xətası baş verdi');
    });
};

// OTP modal-ını bağlamaq üçün funksiya
window.closeOtpModal = function () {
  const otpModal = document.getElementById('otp-modal');
  if (otpModal) {
    otpModal.remove();
  }
};
const otpInputs = document.querySelectorAll('.otp-input');
otpInputs.forEach((input, index) => {
  input.classList.add(
    "w-full", "h-[34px]", "text-center", "border-2", "border-purple-300",
    "rounded-md", "focus:outline-none", "focus:border-purple-500", "text-xl"
  );
  input.setAttribute("type", "text");
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("pattern", "[0-9]*");
  input.setAttribute("autocomplete", "one-time-code");
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    if (e.target.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pastedText.replace(/\D/g, '').split("");
    if (digits.length > 0) {
      otpInputs.forEach((input, i) => {
        input.value = digits[i] || "";
      });
      otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
    }
  });
});