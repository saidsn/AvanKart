const accountActionModal = () => {
  return `
  <div style="width:250px; "
       class="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-2 text-sm overflow-y-auto">
    <ul class="text-tertiary-text space-y-1">
    
      <li onclick="Otp()" class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-messages">
        <div class="icon stratis-password-01 w-[14px] h-[14px]"></div>
        <span>Şifrəni sıfırla</span>
      </li>

      <li onclick="openEmailChangeModal()" class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-messages">
        <div class="icon stratis-mail-01 w-[14px] h-[14px]"></div>
        <span>Mail adresini dəyiş</span>
      </li>

      <li onclick="openDeactivateModal()" class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
        <div class="icon stratis-minus-circle-contained w-[14px] h-[14px]"></div>
        <span  >Deaktiv et</span>
      </li>

      <li onclick="openDeleteRequestModal()" class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer border-t pt-2 text-red-500 ">
        <div class="icon stratis-trash-01 w-[14px] h-[14px]"></div>
        <span>Silinmə üçün müraciət et</span>
      </li>

    </ul>
  </div>
`;
};

function toggleAccountMenu() {
  const container = document.getElementById("account-menu-container");
  if (container.innerHTML.trim() === "") {
    container.innerHTML = accountActionModal();
  } else {
    container.innerHTML = "";
  }
}

const deactivateModal = () => {
  return `
    <div id="deactivateModalOverlay" class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
         <div class="relative w-[306px] h-[187px] border-[#0000001A] border-[0.5px]
                shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

                <div class="flex items-center justify-center mt-[12px] ml-[12px]  w-[40px] h-[40px] cursor-pointer bg-[#DD38381A] rounded-[50%]">
                    <div class="icon stratis-minus-circle-contained  !w-[15px] !h-[15px]  text-error "></div>
                </div>

                <h2 class="ml-3 mt-3 text-messages font-medium text-[15px]">Deaktiv et</h2>

                <div class="flex flex-wrap mt-[4px] ml-[12px] gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
                    <span class="font-medium opacity-65">İstifadəçini deaktiv etmək istədiyinizə əminsiniz?</span>

                  </div>

                  <div class="absolute bottom-[12px] right-[12px] flex gap-[12px]">
                    <button href="#" onclick="closeDeactivateModal()" class=" text-[12px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[51px] !h-[25px]">Xeyr</button>
                    <button href="#" onclick="Otp()" class=" text-[12px] text-on-primary font-medium bg-error rounded-[50px] !w-[64px] !h-[25px]">Bəli,sil</button>
                  </div>
            </div>
    </div>
  `;
};

function openDeactivateModal() {
  const modal = document.createElement("div");
  modal.innerHTML = deactivateModal();
  document.body.appendChild(modal);
}

function closeDeactivateModal() {
  const container = document.getElementById("modal-container");
  container.innerHTML = "";
}

const emailChangeModal = () => {
  return `
    <div id="email-change-modal" class="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30">
      <div class="bg-white rounded-lg p-6 w-[450px] shadow-lg relative">
        <button onclick="closeEmailChangeModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">&times;</button>
        <h2 class="text-base font-semibold mb-4">Mail adresini dəyiş</h2>
        <label class="block text-sm text-gray-600 mb-1" for="email">Email</label>
        <input id="new-email" type="email" placeholder="Yeni email adresini daxil edin"
               class="w-full border border-gray-300 rounded-full px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:text-primary" />
        <div class="flex justify-end gap-2">
          <button onclick="closeEmailChangeModal()" class="px-4 py-2 rounded-full text-sm bg-gray-100 hover:bg-gray-200">Ləğv et</button>
          <button onclick="Otp()" class="px-4 py-2 rounded-full text-sm bg-primary text-white hover:bg-primary-dark">Dəyişikliyi təsdiqlə</button>
        </div>
      </div>
    </div>
  `;
};

function openEmailChangeModal() {
  const modal = document.createElement("div");
  modal.innerHTML = emailChangeModal();
  document.body.appendChild(modal);
}

function closeEmailChangeModal() {
  const modal = document.getElementById("email-change-modal");
  if (modal) {
    modal.remove();
  }
}

function confirmEmailChange() {
  const email = document.getElementById("new-email").value;
  console.log("Yeni email:", email);
  // Burada email dəyişdirmə loqikasını əlavə edə bilərsiniz (API call və s.)
  closeEmailChangeModal();
}

const deleteRequestModal = () => {
  return `
    <div id="delete-request-modal" class="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30">
        <div class="relative w-[450px] h-[690px] border-[#0000001A] border-[2px]
            shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">
<div onclick="closeDeleteRequestModal()" class="icon stratis-x-01 absolute right-[29px] top-[29px]"></div>
            <div class=" mt-[60px] gap-[3px] font-normal ml-[24px] mr-[26px] text-center text-[12px] leading-[160%]  font-poppins text-messages opacity-100">
                <div class="text-[17px] font-semibold mb-[5px]">Silinmə müraciəti</div>
                <div class="font-normal  opacity-65 text-[12px]">İstifadəçi məlumatlarını aşadığan kontrol edərək, silinməsi üçün müraciət edə bilərsiniz</div>

              </div>

              <div class="space-y-3 text-[12px] text-messages  ml-[24px] mr-[26px] pt-[24px]" >
                <div class="flex justify-between border-b pb-3">
                  <span class="font-normal opacity-50 ">İstifadəçi:</span>
                  <span class=" font-medium">Ramin Orucov</span>
                </div>
                <div class="flex justify-between border-b pb-3">
                  <span class="font-normal opacity-50">Cinsi:</span>
                  <span class=" font-medium">Kişi</span>
                </div>
                <div class="flex justify-between border-b pb-3">
                  <span class="font-normal opacity-50">Doğum tarixi:</span>
                  <span class=" font-medium">16.12.1997</span>
                </div>
                <div class="flex justify-between border-b pb-3">
                  <span class="font-normal opacity-50">Mail</span>
                  <span class=" font-medium whitespace-nowrap">ramin.orucov@gmail.com</span>
                </div>
                <div class="flex justify-between border-b pb-3">
                    <span class="font-normal opacity-50">Telefon</span>
                    <span class=" font-medium whitespace-nowrap">+994 50 770 35 22</span>
                  </div>
                  <div class="flex justify-between border-b pb-3">
                    <span class="font-normal opacity-50">Müəssisə adı:</span>
                    <span class=" font-medium whitespace-nowrap">Özsüt Restoran</span>
                  </div>
                  <div class="flex justify-between border-b pb-3">
                    <span class="font-normal opacity-50">Silən şəxs:</span>
                    <span class=" font-medium whitespace-nowrap">Ramin Orucov</span>
                  </div>

              </div>

              <div class="space-y-[6px] ml-[24px] mr-[26px]">
                <label class="block text-messages opacity-65 text-[12px] mt-[12px] font-medium">Silinmə səbəbi</label>

                <div class="relative">
                  <textarea
                    class="w-full h-[73px]  border pt-[3px] pl-[12px] text-gray-700  resize-none focus:outline-none  focus:ring-gray-300 border-stroke border-opacity-[10%] rounded-[8px] text-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300"
                    placeholder="Silinmə səbəbini daxil edin"
                    maxlength="150 !text-[10px] !text-messages !opacity-50"
                  ></textarea>

                  <span class="absolute bottom-2 right-4 text-sm text-gray-400">max: 150</span>
                </div>
              </div>




    <button type="submit" onclick="Otp()" class="cursor-pointer text-[13px] mt-[33px] flex items-center justify-center ml-[24px] mr-[26px] w-[400px] font-poppins leading-[160%] font-medium h-[34px] bg-error rounded-full text-on-primary  hover:bg-hover-button focus:bg-primary  focus:shadow-[0px_0px_16px_0px_rgba(0,0,0,0.2)]
    disabled:bg-primary disabled:opacity-[30%] transition-all ease-out duration-300 focus:outline-none ">
    Silinmə üçün göndər
    </button>

    <button type="submit" onclick="closeDeleteRequestModal()" class="cursor-pointer mt-[12px] text-[13px] flex items-center justify-center ml-[24px] mr-[26px] w-[400px]  font-poppins leading-[160%] font-medium h-[34px] bg-surface-bright rounded-full text-  disabled:bg-[#7450864D]  ">
    Ləğv et
    </button>

    </div>
    </div>
  `;
};

function openDeleteRequestModal() {
  const modal = document.createElement("div");
  modal.innerHTML = deleteRequestModal();
  document.body.appendChild(modal);
}

function closeDeleteRequestModal() {
  const modal = document.getElementById("delete-request-modal");
  if (modal) {
    modal.remove();
  }
}

function Otp() {
  const modalHTML = `
    <div class="fixed inset-0 bg-opacity-30 flex items-center justify-center z-100" id="otp-modal">
      <div class="relative w-[450px] h-[399px] border-[#0000001A] border-[2px]
        shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

        <h2 class="text-[15px] font-medium text-messages ml-[24px] mt-[26px]"> Hesab təsdiqi</h2>

        <div class="flex flex-col mb-[24px] pt-[20px] max-w-[400px] w-[100%] m-auto">
          <h2 class="pb-[4px] text-[17px] font-poppins font-semibold leading-[160%] text-messages">OTP</h2>
          <div class="flex flex-wrap gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
            <span class="font-medium">ramin.orucovvv@gmail.com</span>
            <span class="opacity-65 font-normal">email adresinə göndərilən 6 </span>
            <span class="opacity-65 font-normal">rəqəmli şifrəni daxil edin</span>
          </div>
        </div>

        <form>
          <div class="text-center space-y-4 max-w-[400px] w-[100%] m-auto">
            <div id="countdown" class="text-messages bg-inverse-on-surface rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium leading--[160%] font-poppins">
              4:59
            </div>

            <div class="grid grid-cols-6 gap-2 mt-[8px]">
              ${[...Array(6)]
                .map(
                  () => `
                <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px]
                placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus
                focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                transition-all ease-out duration-300" />
              `
                )
                .join("")}
            </div>
          </div>

          <div class="text-center flex justify-center max-w-[400px] w-[100%] m-auto">
            <p class="font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
            <a href="#" class="text-[12px] font-medium font-poppins text-messages px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none">Yenidən göndər</a>
          </div>

          <div class="absolute bottom-[24px] right-[12px] flex gap-[12px]">
            <button type="button" onclick="showCancelConfirmationModal()" class="text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[83px] !h-[34px]">Ləğv et</button>
      <button type="button" onclick="handleConfirm()" class="text-[13px] text-on-primary font-medium bg-primary rounded-[50px] !w-[91px] !h-[34px]">
  Təsdiqlə
</button>


          </div>
        </form>
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);

  // Success banner HTML

  startOtpTimer(); // 🕒 Timer işə salınır
}
function showDeactivationModal() {
  const modal = document.createElement("div");
  modal.id = "deactivation-modal";
  modal.innerHTML = `
    <div class="fixed top-6 left-1/2 transform -translate-x-1/2 transition-all duration-500 ease-out
       text-success-messages-bg-dark px-6 py-3 rounded-full flex items-center gap-2 z-[9999] shadow-lg opacity-0 scale-95">
      
      <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>

      <span class="text-sm font-semibold text-success">İstifadəçi deaktiv edildi</span>

      <button onclick="closeDeactivationModal()" class="ml-2 text-success hover:text-success-color-dark focus:outline-none">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 8.586l-3.293-3.293a1 1 0 00-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 001.414 1.414L10 11.414l3.293 3.293a1 1 0 001.414-1.414L11.414 10l3.293-3.293a1 1 0 00-1.414-1.414L10 8.586z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  // animate
  setTimeout(() => {
    modal.firstElementChild.classList.remove("opacity-0", "scale-95");
    modal.firstElementChild.classList.add("opacity-100", "scale-100");
  }, 100);
}

function closeDeactivationModal() {
  const modal = document.getElementById("deactivation-modal");
  if (modal) {
    modal.firstElementChild.classList.remove("opacity-100", "scale-100");
    modal.firstElementChild.classList.add("opacity-0", "scale-95");
    setTimeout(() => modal.remove(), 300);
  }
}

function startOtpTimer() {
  let time = 4 * 60 + 59; // 4 dəqiqə 59 saniyə

  const countdownElement = document.getElementById("countdown");
  const timer = setInterval(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    countdownElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (time <= 0) {
      clearInterval(timer);
      countdownElement.textContent = "0:00";
    }

    time--;
  }, 1000);
}
function handleConfirm() {
  showDeactivationModal(); // Deaktiv modalını göstər

  // 1.5 saniyə sonra səhifəni yenilə
  setTimeout(() => {
    location.reload();
  }, 1500);
}

function showCancelConfirmationModal() {
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = `
  <div class="fixed inset-0  bg-opacity-40 flex items-center justify-center z-100" id="cancel-confirm-modal">
     <div class="relative w-[306px] h-[187px] border-[#0000001A] border-[0.5px]
                shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

                <div class="flex items-center justify-center mt-[12px] ml-[12px]  w-[40px] h-[40px] cursor-pointer bg-sidebar-bg rounded-[50%]">
                    <div class="icon stratis-lock-02  !w-[12px] !h-[17px]  text-messages "></div>
                </div>

                <h2 class="ml-3 mt-3 text-messages font-medium text-[15px]">2 addımlı doğrulamanı ləğv et</h2>

                <div class="flex flex-wrap mt-[4px] ml-[12px] gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
                    <span class="font-medium opacity-65">2 addımlı doğrulamanı ləğv etmək istədiyinizə əminsiniz?</span>

                  </div>

                  <div class="absolute bottom-[12px] right-[12px] flex gap-[12px]">
                    <button href="#" id="cancel-no" class=" text-[12px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[51px] !h-[25px]">Xeyr</button>
                    <button href="#" id="cancel-yes" class=" text-[12px] text-on-primary font-medium bg-primary rounded-[50px] !w-[93px] !h-[25px]">Bəli,ləvğ et</button>
                  </div>
            </div>
</div>



  `;
  document.body.appendChild(modalContainer);

  // "Xeyr" düyməsi - sadəcə bu modal bağlansın
  document.getElementById("cancel-no").addEventListener("click", () => {
    document.getElementById("cancel-confirm-modal")?.remove();
  });

  document.getElementById("cancel-yes").addEventListener("click", () => {
    location.reload();
  });
}
