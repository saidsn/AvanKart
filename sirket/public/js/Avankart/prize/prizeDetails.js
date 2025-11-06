document.addEventListener("DOMContentLoaded", function () {
  const data = JSON.parse(localStorage.getItem("selectedPrize"));

  if (data) {
    document.getElementById("detail-invoice").textContent = data.invoice;
    document.getElementById("detail-customers").textContent = `${data.customers}`;
    document.getElementById("detail-transactions").textContent = `${data.transactions}`;
    document.getElementById("detail-amount").textContent = `${data.amount.toFixed(2)} ₼`;
    document.getElementById("detail-date").textContent = data.date;

    const statusColor = data.status === "Davam edir" ? "#BFC8CC" : "#32B5AC";
    document.getElementById("detail-status").innerHTML = `
      <span class="w-[6px] h-[6px] rounded-full mr-2 shrink-0" style="background-color: ${statusColor}; display:inline-block;"></span>
      <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${data.status}</span>
    `;
  }
});

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
  modal.className = "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";

  modal.innerHTML = `
        <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
          <div class="relative flex flex-col gap-1 pb-3">
            <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
            <img src="/public/images/Avankart/prize/close.svg" alt="Close Modal" 
                  onclick="closeFilterModal()" class="absolute top-0 right-0 cursor-pointer text-sm">
          </div>
          <form class="flex flex-col gap-3">
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
           <div class="flex flex-col gap-[6px]">
                <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Kart kateqoriyası</span>
                <div class="grid grid-cols-3 gap-y-4 gap-x-2">
                    <label for="k1" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="k1" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Yemək kartı</span>
                    </label>
                    <label for="k2" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="k2" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Yanacaq kartı</span>
                    </label>
                    <label for="k3" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="k3" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Hədiyyə kartı</span>
                    </label>
                    <label for="k4" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="k4" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Market kartı</span>
                    </label>
                    <label for="k5" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="k5" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Biznes kartı</span>
                    </label>
                    <label for="k6" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="k6" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Premium kartı</span>
                    </label>
                    <label for="k7" class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="k7" class="peer hidden" />
                        <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                                    text-on-primary dark:text-side-bar-item-dark 
                                    peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                                    peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                                    peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </div>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Avto Yuma kartı</span>
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

    $("#min-value").text(formatCurrency($("#slider-range").slider("values", 0)));
    $("#max-value").text(formatCurrency($("#slider-range").slider("values", 1)));
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
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';

  const checkboxes = document.querySelectorAll('#filterModal input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
  });

  $("#slider-range").slider("values", [12345, 245500]);
  $("#min-value").text(formatCurrency(12345));
  $("#max-value").text(formatCurrency(245500));
}


