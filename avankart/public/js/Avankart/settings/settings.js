document.addEventListener("DOMContentLoaded", () => {
  // Cookie və ya localStorage-da varsa, onu istifadə et
  const savedLang = localStorage.getItem("selectedLanguage");

  // Əgər daha öncə seçim yoxdursa, default olaraq 'az' seç
  const defaultLang = savedLang || "az";
  const radio = document.querySelector(
    `input[name="language"][value="${defaultLang}"]`
  );
  const circle = radio?.nextElementSibling?.querySelector(".inner-circle");

  if (radio) {
    radio.checked = true;
    circle?.classList.remove("hidden");
  }

  // Dinləyici əlavə et ki, istifadəçi seçimi dəyişəndə yadda saxlasın
  document.querySelectorAll('input[name="language"]').forEach((input) => {
    input.addEventListener("change", (e) => {
      const newLanguage = e.target.value;
      console.log('Language changing to:', newLanguage);
      localStorage.setItem("selectedLanguage", newLanguage);
      console.log('Saved to localStorage:', localStorage.getItem("selectedLanguage"));

      // Bütün inner-circle-ları gizlət
      document
        .querySelectorAll(".inner-circle")
        .forEach((el) => el.classList.add("hidden"));

      // Aktiv seçilmiş olanın iç dairəsini göstər
      const activeCircle =
        e.target.nextElementSibling.querySelector(".inner-circle");
      activeCircle?.classList.remove("hidden");

      // Trigger custom event for same-tab language changes
      console.log('Dispatching languageChanged event');
      window.dispatchEvent(new Event('languageChanged'));
    });
  });
});

window.showSessionTooltip = function (element) {
  $('.custom-tooltip').remove();

  const message = element.getAttribute('data-tooltip');

  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip absolute w-[107px] h-[36px] px-4 py-1 text-[13px] font-medium text-[#1D222B] bg-white rounded-lg shadow-md z-50 cursor-pointer transition  hover:bg-container-2 flex items-center justify-center';
  tooltip.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';  // #0000001A = rgba(0,0,0,0.1)
  tooltip.style.whiteSpace = 'nowrap';

  const triangle = document.createElement('div');
  triangle.className = 'absolute top-[-6px] right-[12px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white';
  tooltip.appendChild(triangle);

  const text = document.createElement('div');
  text.innerText = message;
  tooltip.appendChild(text);

  const parent = element.closest('.relative');
  if (parent) {
      parent.appendChild(tooltip);

      tooltip.style.top = 'calc(100% + 8px)';
      tooltip.style.right = '6px';
  }

  // tooltip klik hadisəsi düzgün əlavə edildi
  tooltip.addEventListener('click', function() {
    openPopup(element); // element ötürülür
    tooltip.remove();
  });

  setTimeout(() => {
      tooltip.remove();
  }, 3000);
};

function openPopup(clickedElement) {
  $('.custom-popup').remove();

  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[9999]';

  const popup = document.createElement('div');
  popup.className = 'bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative';

  popup.innerHTML = `
    <div class="w-[306px] flex flex-col gap-3">
      <div class="w-10 h-10 rounded-full bg-inverse-on-surface flex items-center justify-center">
        <div class="iconex iconex-music-plate-1 w-5 h-5"></div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-[#1D222B] font-medium text-[15px]">Sessiya</div>
        <div class="text-secondary-text text-[13px] font-normal">Seçilən bütün sessiyaları bitirmək istədiyinizə əminsiniz?</div>
      </div>
    </div>
    
    <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
      <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
      <button class="cursor-pointer px-3 py-1 rounded-full text-on-primary bg-error transition" id="confirmDeleteBtn">Bəli, bitir</button>
    </div>
  `;

  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);

  // Overlay klikləndikdə bağla
  popupOverlay.addEventListener('click', function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });

  // "Bəli, bitir" düyməsinə klikləndikdə DataTable sətrini sil
  document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    const row = clickedElement.closest('tr');
    if (row) {
      $('#myTable').DataTable().row(row).remove().draw();
    }
    popupOverlay.remove();
  });
}


function openFilterModal() {  
  const modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className = "fixed inset-0 z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.5)]";

  modal.innerHTML = `
    <div id="modalContent" class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
      <div class="relative flex flex-col gap-1 pb-3">
        <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Şəxsi məlumatlar</h2>
        <img src="/images/Avankart/prize/close.svg" alt="Close Modal" onclick="closeFilterModal()" class="absolute top-0 right-0 cursor-pointer text-sm">
      </div>

      <form class="flex flex-col gap-3" onsubmit="return false; closeFilterModal();">
        <div class="flex flex-col gap-[6px]">
          <label class="text-[12px] font-medium text-secondary-text">Ad və Soyad</label>
          <input type="text" value="Ramin Orucov"
                 class="w-full h-[36px] px-3 rounded-full border border-[#E5E7EB] bg-white dark:bg-side-bar-item-dark text-sm text-[#1D222B] dark:text-white font-normal focus:outline-none focus:border-focus focus:ring-0 focus:shadow focus:shadow-[#7450864D]">
        </div>

        <div class="flex flex-col gap-[6px]">
          <label class="text-[12px] font-medium text-secondary-text">Email</label>
          <input type="email" placeholder="Email adresinizi daxil edin"
                 class="w-full h-[36px] px-3 rounded-full placeholder:text-[#BFC8CC] border border-[#E5E7EB] bg-white text-xs text-[#1D222B] font-normal focus:outline-none focus:border-focus focus:ring-0 focus:shadow focus:shadow-[#7450864D]">
        </div>

        <div class="flex flex-col gap-[6px]">
          <label class="text-[12px] font-medium text-secondary-text">Telefon nömrəniz</label>
          <div class="flex gap-3">
            <select class="w-[90px] h-[36px] px-3 pr-8 rounded-full font-normal border border-[#E5E7EB] bg-white text-xs text-[#1D222B] appearance-none focus:outline-none focus:border-focus focus:ring-0 focus:shadow focus:shadow-[#7450864D]">
              <option value="+01">+01</option>
              <option value="+010">+010</option>
              <option value="+099">+099</option>
              <option value="+994" selected>+994</option>
              <option value="+600">+600</option>
              <option value="+100">+100</option>
            </select>

            <input type="tel" placeholder="Telefon nömrənizi daxil edin"
                   class="w-full h-[36px] px-3 rounded-full placeholder:text-[#BFC8CC] border border-[#E5E7EB] bg-white text-xs text-[#1D222B] font-normal focus:outline-none focus:border-focus focus:ring-0 focus:shadow focus:shadow-[#7450864D]">
          </div>
        </div>

        <div class="flex flex-col gap-[6px]">
          <label class="text-[12px] font-medium text-secondary-text">Şirkətin adı</label>
          <input type="text" value="Avankart MMC" disabled
                 class="w-full h-[36px] px-3 rounded-full border border-[#E5E7EB] bg-[#EBEBEB] text-xs text-[#9CA3AF] font-normal cursor-not-allowed">
        </div>

        <div class="flex flex-col gap-[6px]">
          <label class="text-[12px] font-medium text-secondary-text">Vəzifəniz</label>
          <input type="text" value="UX Designer" disabled
                 class="w-full h-[36px] px-3 rounded-full border border-[#E5E7EB] bg-[#EBEBEB] text-xs text-[#9CA3AF] font-normal cursor-not-allowed">
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button type="button"
                  class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer"
                  onclick="closeFilterModal()">Ləğv et</button>
          <button type="submit"
                  class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Yadda saxla</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Modal içi klikdən çıxmasın, yalnız overlay klikdə bağlansın
  modal.addEventListener("mousedown", (e) => {
    const content = document.getElementById("modalContent");
    modal.dataset.wasInside = content.contains(e.target);
  });

  modal.addEventListener("mouseup", (e) => {
    const content = document.getElementById("modalContent");
    const wasInside = modal.dataset.wasInside === "true";
    if (!content.contains(e.target) && !wasInside) {
      closeFilterModal();
    }
  });

  // ESC ilə bağlama
  const escHandler = function (e) {
    if (e.key === "Escape") {
      closeFilterModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

function closeFilterModal() {
  const modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}

