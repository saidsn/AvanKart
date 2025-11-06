function openCreateCategoryModal() {
  // Overlay-i və modalı göstər
  document.querySelector(".modal").classList.remove("hidden");
  document.getElementById("createCategoryModal").classList.remove("hidden");

  // Body scroll bağla (istəyə görə)
  document.body.classList.add("overflow-hidden");
}

function closeCreateCategoryModal() {
  // Overlay-i və modalı gizlət
  document.querySelector(".modal").classList.add("hidden");
  document.getElementById("createCategoryModal").classList.add("hidden");

  // Body scroll bərpa et
  document.body.classList.remove("overflow-hidden");
}

function openFilterModal() {
  // Əgər artıq mövcuddursa, təkrar əlavə etmə
  if (document.getElementById("filterModalOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "filterModalOverlay";
  overlay.className =
    "fixed inset-0 z-[1000] flex items-center justify-center bg-black/30";

  overlay.innerHTML = `
    <div class="bg-white w-[450px] border border-[#E0E0E0] rounded-[16px] p-6">
      <div class="flex justify-between items-center mb-4 relative">
        <h2 class="text-[15px] font-medium text-[#1D222B]">Filter</h2>
        <button onclick="closeFilterModal()">
          <img src="/public/images/Avankart/prize/close.svg" alt="Close" class="absolute top-0 right-0 cursor-pointer text-sm" />
        </button>
      </div>

      <form id="filterForm" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-medium mb-1 text-secondary-text">Yaradan şəxs</label>
            <select class="cursor-pointer hover:bg-container-2 w-full h-[36px] px-3 rounded-full border border-[#E5E7EB] bg-white text-xs font-normal text-[#1D222B] focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] appearance-none">
                <option value="">Seçim edin</option>
                <!-- Options -->
            </select>
        </div>

        <div class="flex flex-col gap-[6px]">
            <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
            <div class="flex flex-col gap-3">
                
                <!-- Başlanğıc Tarixi -->
                <div class="flex-1 flex flex-col gap-[6px]">
                <div class="relative w-full">
                    <input id="startDate"
                    class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none"
                    type="date" placeholder="dd/mm/yyyy">
                    <div onclick="openDatePicker('startDate')"
                    class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                </div>
                <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                    <div class="icon stratis-information-circle-contained"></div>
                    <span>Başlanğıc tarixini qeyd edin</span>
                </div>
                </div>

                <!-- Son Tarix -->
                <div class="flex-1 flex flex-col gap-[6px]">
                <div class="relative w-full">
                    <input id="endDate"
                    class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none"
                    type="date" placeholder="dd/mm/yyyy">
                    <div onclick="openDatePicker('endDate')"
                    class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                </div>
                <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                    <div class="icon stratis-information-circle-contained"></div>
                    <span>Son tarixi qeyd edin</span>
                </div>
                </div>

            </div>
        </div>
         <div class="flex justify-end gap-2 mt-4">
            <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağla</button>
            <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
            <button type="submit" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("overflow-hidden");

  // Overlay kliklənəndə bağla
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeFilterModal();
    }
  });
}

function closeFilterModal() {
  const modal = document.getElementById("filterModalOverlay");
  if (modal) modal.remove();
  document.body.classList.remove("overflow-hidden");
}

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus();
  }
}

function clearFilters() {
  const form = document.getElementById("filterForm");
  if (!form) return;

  // Select və input sahələrini təmizlə
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    if (input.type === "select-one" || input.tagName === "SELECT") {
      input.selectedIndex = 0;
    } else if (input.type === "date" || input.type === "text" || input.type === "textarea") {
      input.value = "";
    } else if (input.type === "checkbox" || input.type === "radio") {
      input.checked = false;
    }
  });
}


function openFilterModalforNotifications() {
  // Əgər artıq mövcuddursa, təkrar əlavə etmə
  if (document.getElementById("filterModalOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "filterModalOverlay";
  overlay.className =
    "fixed inset-0 z-[1000] flex items-center justify-center bg-black/30";

  overlay.innerHTML = `
    <div class="bg-white w-[450px] border border-[#E0E0E0] rounded-[16px] p-6">
      <div class="flex justify-between items-center mb-4 relative">
        <h2 class="text-[15px] font-medium text-[#1D222B]">Filter</h2>
        <button onclick="closeFilterModal()">
          <img src="/public/images/Avankart/prize/close.svg" alt="Close" class="absolute top-0 right-0 cursor-pointer text-sm" />
        </button>
      </div>

      <form id="filterForm" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-medium mb-1 text-secondary-text">Yaradan şəxs</label>
            <select class="cursor-pointer hover:bg-container-2 w-full h-[36px] px-3 rounded-full border border-[#E5E7EB] bg-white text-xs font-normal text-[#1D222B] focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] appearance-none">
                <option value="">Seçim edin</option>
                <!-- Options -->
            </select>
        </div>

        <div class="flex flex-col gap-[6px]">
            <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
            <div class="flex flex-col gap-3">
                
                <!-- Başlanğıc Tarixi -->
                <div class="flex-1 flex flex-col gap-[6px]">
                <div class="relative w-full">
                    <input id="startDate"
                    class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none"
                    type="date" placeholder="dd/mm/yyyy">
                    <div onclick="openDatePicker('startDate')"
                    class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                </div>
                <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                    <div class="icon stratis-information-circle-contained"></div>
                    <span>Başlanğıc tarixini qeyd edin</span>
                </div>
                </div>

                <!-- Son Tarix -->
                <div class="flex-1 flex flex-col gap-[6px]">
                <div class="relative w-full">
                    <input id="endDate"
                    class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none"
                    type="date" placeholder="dd/mm/yyyy">
                    <div onclick="openDatePicker('endDate')"
                    class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                </div>
                <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                    <div class="icon stratis-information-circle-contained"></div>
                    <span>Son tarixi qeyd edin</span>
                </div>
                </div>

            </div>
        </div>
        <div>
                <span class="text-[12px] font-medium opacity-65">Bildirişi alanlar</span>
                <div class="mt-[6px]">
                    <div class="flex items-center flex-wrap gap-4">
                        <label for="newCheckbox1" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox1" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Üzv müəssisələr</div>
                        </label>
                        <label for="newCheckbox2" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox2" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Üzv şirkətlər</div>
                        </label>
                        <label for="newCheckbox3" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox3" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Avankart partner</div>
                        </label>
                        <label for="newCheckbox4" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox4" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Avankart people</div>
                        </label>
                    </div>
                </div>
            </div>
         <div class="flex justify-end gap-2 mt-4">
            <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağla</button>
            <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
            <button class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("overflow-hidden");

  // Overlay kliklənəndə bağla
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeFilterModal();
    }
  });
}