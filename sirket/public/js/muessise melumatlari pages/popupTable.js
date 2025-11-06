
function opena() {
  let modal = document.createElement("div");
  modal.id = "filterModal";
   const csrfToken = $('meta[name="csrf-token"]').attr('content');
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-[1100]";

  modal.innerHTML = `
        <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
            <div class="relative flex flex-col gap-1 pb-3">
                <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
                <p class="text-sm text-tertiary-text dark:text-tertiary-text-color-dark font-normal">Tarix aralığı qeyd edərək aktiv cihazları görə bilərsiniz</p>
                <span onclick="closeFilterModal()" class="absolute top-0 right-0 icon stratis-x-02 cursor-pointer text-sm dark:text-primary-text-color-dark"></span>
            </div>
            <form id="filterMuqavileForm"  method="POST" data-url="/muessise-info/filter-muessise-muqavile" onsubmit="return false;" class="flex flex-col gap-3" >
                <input type="hidden" name="_csrf" value="${csrfToken}">
            <label class="flex flex-col gap-[6px]">
                    <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
                    <div class="relative w-full">
                       <input id="startDate" name="start_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none
                        focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                        active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                        transition-all ease-out duration-300" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('startDate')" id="startCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Başlanğıc tarixini qeyd edin</span>
                    </div>
                </label>
                <label class="flex flex-col gap-[6px]">
                    <div class="relative w-full">
                      <input id="endDate" name="end_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none
                        focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                        active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                        transition-all ease-out duration-300" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('endDate')" id="endCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Son tarixi qeyd edin</span>
                    </div>
                </label>
               
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağla</button>
                    <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
                    <button id="filterButton" type="submit" onclick=submitForm("filterMuqavile") class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
                </div>
            </form>
        </div>
    `;

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeFilterModal();
    }
  });
  $("#filterMuqavileForm").on("submit", async function (e){
  e.preventDefault();
  closeFilterModal()
  clearFilters()
});

  const handleEscapeKey = function (event) {
    if (event.key === "Escape") {
      closeFilterModal();
      document.removeEventListener("keydown", handleEscapeKey);
    }
  };
  document.addEventListener("keydown", handleEscapeKey);

  document.body.appendChild(modal);
}

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); 
  }
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}


function clearFilters() {
  const startDateEl = document.getElementById("startDate");
  const endDateEl = document.getElementById("endDate");
  const newCheckbox1El = document.getElementById("newCheckbox1");
  const readCheckbox2El = document.getElementById("readCheckbox2");
  const csrf = $("input [name='_csrf']")

  if (startDateEl) startDateEl.value = "";
  if (endDateEl) endDateEl.value = "";
  if (newCheckbox1El) newCheckbox1El.checked = false;
  if (readCheckbox2El) readCheckbox2El.checked = false;
  if(csrf) csrf.val('') 

  $('#myTablePop tbody input[type="checkbox"]').each(function () {
    $(this).prop("checked", false).trigger("change");
  });

  $("#newCheckbox").prop("checked", false);

  const customSearchEl = document.getElementById("customSearch");
  if (customSearchEl) customSearchEl.value = "";
}


