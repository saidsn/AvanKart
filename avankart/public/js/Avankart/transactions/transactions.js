function formatCurrency(value) {
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₼"
  );
}

let isDraggingSlider = false;

function openFilterModal() {
  let modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";

  modal.innerHTML = `
          <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
            <div class="relative flex flex-col gap-1 pb-3">
              <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
              <img src="/public/images/Avankart/prize/close.svg" alt="Close Modal" 
                    onclick="closeFilterModal()" class="absolute top-0 right-0 cursor-pointer text-sm">
            </div>
            <form class="flex flex-col gap-3">
             <div class="mt-[5px] relative">
                  <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Subyekt</span>
                                        <button id="dropdownDefaultButton78" class=" cursor-pointer font-normal font-poppins rounded-2xl text-[12px] px-5 py-2.5 text-center flex items-center justify-between border border-[#0000001A] w-full h-[34px] hover:bg-container-2 dark:bg-[#161E22] dark:text-white dark:border-[#FFFFFF1A] dark:hover:bg-[#1F282C]" type="button" onclick="toggleDropdown78()">
                                            Seçim edin
                                            <div>
                                                <img src="/public/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">
                                            </div>
                                        </button>
                                       <div id="dropdown78" class="absolute mt-2 w-[402px] max-h-[200px] overflow-y-auto overflow-x-hidden custom-scroll bg-white border-[.5px] border-stroke rounded-lg shadow z-50 dark:bg-[#161E22] dark:border-[#FFFFFF1A] visible">


                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
                                        <input type="checkbox" id="grupa-layihe-rehberleri" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Özsüt Restoran</span>
                                            </label>


                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                            <input type="checkbox" id="grupa-muhasibler" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Veysəloğlu MMC</span>
                                            </label>


                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                             <input type="checkbox" id="grupa-idare-heyyeti" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Boranı Restoran</span>
                                            </label>

                                                     <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                            <input type="checkbox" id="grupa-idare-heyyeti" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Tbilisi Restoran</span>
                                            </label>

                                                     <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                           <input type="checkbox" id="grupa-idare-heyyeti" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">E-Manat</span>
                                            </label>


                                        </div>
                                    </div>

                <!-- İstifadəçilər -->
                         <div class="mt-[2px] relative">
                         <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">İstifadəçilər</span>
                                        <button id="dropdownDefaultButton6" class="cursor-pointer font-normal font-poppins rounded-2xl text-[12px] px-5 py-2.5 text-center flex items-center justify-between border border-[#0000001A] w-full h-[34px] mt-1 hover:bg-container-2 dark:bg-[#161E22] dark:text-white dark:border-[#FFFFFF1A] dark:hover:bg-[#1F282C]" type="button" onclick="toggleDropdown6()">
                                            Seçim edin
                                            <div>
                                                <img src="/public/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">
                                            </div>
                                        </button>
                                     <div id="dropdown6" class="hidden absolute mt-2 w-[402px] max-h-[200px] overflow-y-auto overflow-x-hidden custom-scroll bg-white border-[.5px] border-stroke rounded-lg shadow z-50 dark:bg-[#161E22] dark:border-[#FFFFFF1A] visible">
                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
                                                <input type="checkbox" id="vezife-ux-designer" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Ramin Orucov Yaşar</span>
                                            </label>


                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                            <input type="checkbox" id="vezife-project-manager" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Tofiq Əliyev</span>
                                            </label>

                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                            <input type="checkbox" id="vezife-cto" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">İsa Sadıqlı</span>
                                            </label>


                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                            <input type="checkbox" id="vezife-product-owner" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Əli İsmayılov</span>
                                            </label>

                                            <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
                                            <input type="checkbox" id="vezife-developer" class="peer hidden">
                                                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                                    </div>
                                                </div>
                                                <span class="dark:text-white">Ramin Orucov Yaşar</span>
                                            </label>


                                        </div>
                                    </div>
             <!-- Tarix Aralığı -->
              <div class="flex flex-col gap-[6px]">
                  <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
                  <div class="flex gap-3">
                      
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
              <div class="my-4">
                <span class="text-[12px] font-medium opacity-65">Kart kateqoriyası</span>
                <div class="mt-[6px]">
                    <div class="flex items-center flex-wrap gap-4">
                        <label for="newCheckbox1" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox1" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Yemək kartı</div>
                        </label>
                        <label for="newCheckbox2" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox2" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Yanacaq kartı</div>
                        </label>
                        <label for="newCheckbox3" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox3" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Hədiyyə kartı</div>
                        </label>
                        <label for="newCheckbox4" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox4" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Market kartı</div>
                        </label>
                        <label for="newCheckbox5" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox5" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Biznes kartı</div>
                        </label>
                        <label for="newCheckbox6" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox6" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Premium kartı</div>
                        </label>
                        <label for="newCheckbox7" class="w-[30%] flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                            <input type="checkbox" id="newCheckbox7" class="peer hidden">
                            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                                        peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                            </div>
                            <div>Avto Yuma kartı</div>
                        </label>
                    </div>
                </div>
            </div>
              <!-- Təyinatı -->
            <div class="flex flex-col gap-[6px]">
                <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Status</span>
                <div class="flex flex-wrap gap-x-4 gap-y-2">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="success" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Uğurlu</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="unsuccess" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Uğursuz</span>
                    </label>
                </div>
            </div>
            <div class="flex flex-col gap-[6px]">
                <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Təyinatı</span>
                <div class="flex flex-wrap gap-x-4 gap-y-2">
                    <label for="inflow" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="inflow" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Mədaxil</span>
                    </label>
                    <label for="outflow" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="outflow" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Məxaric</span>
                    </label>
                </div>
            </div>
              <!-- Məbləğ Aralığı -->
              <div class="flex flex-col gap-1">
                <div class="slider-container">
                    <div class="value-container">
                      <span id="min-value" class="value-label text-[15px] text-messages font-medium"></span>
                      <span id="max-value" class="value-label text-[15px] text-messages font-medium"></span>
                    </div>
                    <div id="slider-range"></div>
                  </div>
                <div class="flex items-center justify-between text-[11px] opacity-50 font-medium">
                    <span>Min</span>
                    <span>Max</span>
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

  modal.addEventListener("click", function (event) {
    if (event.target === modal && !isDraggingSlider) {
      closeFilterModal();
    }
  });

  document.body.appendChild(modal);

  setTimeout(() => {
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 300000,
      values: [12345, 245500],
      start: function () {
        isDraggingSlider = true;
      },
      stop: function () {
        setTimeout(() => {
          isDraggingSlider = false;
        }, 50);
      },
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      },
    });

    $("#min-value").text(
      formatCurrency($("#slider-range").slider("values", 0))
    );
    $("#max-value").text(
      formatCurrency($("#slider-range").slider("values", 1))
    );
  }, 0);
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
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
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";

  const checkboxes = document.querySelectorAll(
    '#filterModal input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change"));
  });

  $("#slider-range").slider("values", [12345, 245500]);
  $("#min-value").text(formatCurrency(12345));
  $("#max-value").text(formatCurrency(245500));
}


window.showErrorTooltip = function (element) {
  // Əvvəlki tooltipləri sil
  $('.custom-tooltip').remove();

  const message = element.getAttribute('data-error');

  // Tooltip elementi
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip absolute px-4 py-2 text-sm text-white bg-[#1D222B] rounded-lg shadow-md z-50';
  tooltip.style.whiteSpace = 'nowrap';

  // Üçbucaq – sağda yerləşir
  const triangle = document.createElement('div');
  triangle.className = 'absolute top-[-6px] right-[12px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#1D222B]';
  tooltip.appendChild(triangle);

  // Tooltip mətni
  const text = document.createElement('div');
  text.innerText = message;
  tooltip.appendChild(text);

  // Tooltip-i parent div-ə əlavə et
  const parent = element.closest('.relative');
  if (parent) {
    parent.appendChild(tooltip);

    // Yuxarı məsafə və sağa hizalanma
    tooltip.style.top = 'calc(100% + 8px)';
    tooltip.style.right = '-8px';

    // Tooltip silinsin mouse çıxanda (həm element, həm tooltipdən)
    const hideTooltip = (e) => {
      if (!element.contains(e.relatedTarget) && !tooltip.contains(e.relatedTarget)) {
        tooltip.remove();
        element.removeEventListener('mouseleave', hideTooltip);
        tooltip.removeEventListener('mouseleave', hideTooltip);
      }
    };

    element.addEventListener('mouseleave', hideTooltip);
    tooltip.addEventListener('mouseleave', hideTooltip);
  }
};



function toggleDropdown6() {
  const dropdown = document.getElementById('dropdown6');
  dropdown.classList.toggle('hidden');
}


document.addEventListener('click', function (event) {
  const btn = document.getElementById('dropdownDefaultButton6');
  const dropdown = document.getElementById('dropdown6');
  if (btn && dropdown) {
    if (!btn.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.add('hidden');
    }
  }
});// Dropdown xaricinə kliklənəndə bağlansın


function toggleDropdown78() {
  const dropdown = document.getElementById('dropdown78');
  dropdown.classList.toggle('hidden');
}

// Dropdown xaricinə kliklənəndə bağlansın
document.addEventListener('click', function (event) {
  const btn = document.getElementById('dropdownDefaultButton78');
  const dropdown = document.getElementById('dropdown78');
  if (!btn.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.add('hidden');
  }
});
