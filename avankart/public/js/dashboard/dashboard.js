const dateModal = document.getElementById("dateModal");
const supportModal = document.getElementById("supportModal");
const supportOverlay = document.getElementById("supportOverlay");
const faqModal = document.getElementById("faqModal");

function openAccordionContent(element) {
  const accordionItem = element
    .closest(".bg-table-hover")
    .querySelector(".accordionItem");
  const icon = element.querySelector(".icon");

  // İconu döndür
  if (accordionItem.classList.contains("hidden")) {
    accordionItem.classList.remove("hidden");
    icon.classList.add("rotate-315"); // İconi döndür
  } else {
    accordionItem.classList.add("hidden");
    icon.classList.remove("rotate-315"); // İconi əvvəlki vəziyyətinə qaytar
  }
}

function openSupportModal() {
  supportModal.classList.toggle("hidden");
  supportOverlay.classList.toggle("hidden");
}

function closeSupportModal() {
  supportModal.classList.toggle("hidden");
  supportOverlay.classList.toggle("hidden");
}

document.addEventListener("DOMContentLoaded", function () {
  // Sidebar düymələri
  const sidebarLinks = document.querySelectorAll("ul li a");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Əgər düymə artıq aktivdirsə, "active" sinfini sil və text rəngini dəyiş
      if (this.classList.contains("active")) {
        this.classList.remove("active", "bg-sidebar-item", "text-messages");
      } else {
        // Digər düymələrdən "active" sinfini və rəngləri sil
        sidebarLinks.forEach((btn) => {
          btn.classList.remove("active", "bg-sidebar-item", "text-messages");
        });

        // Seçilən düyməyə "active" sinfini əlavə et və text-messages rəngini təyin et
        this.classList.add("active", "bg-sidebar-item", "text-messages");
      }
    });
  });
});

// function openFilterModal() {
//   console.log("🔍 ========== OPEN FILTER MODAL START ==========");

//   // Cards məlumatlarını global dəyişəndən götür
//   const cards = window.dashboardCards || [];

//   console.log("🔍 Dashboard Cards:");
//   console.log("- window.dashboardCards:", window.dashboardCards);
//   console.log("- Cards array:", cards);
//   console.log("- Cards count:", cards.length);

//   let modal = document.createElement("div");
//   modal.id = "filterModal";
//   modal.className =
//     "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";

//   // Card checkboxları yaradırıq
//   let cardCheckboxes = "";
//   cards.forEach((card, index) => {
//     console.log(`🔍 Processing Card ${index}:`, {
//       _id: card._id,
//       name: card.name,
//       card: card,
//     });

//     cardCheckboxes += `
//             <div class="flex items-center gap-2">
//                 <input type="checkbox" id="card_${card._id}" value="${card._id}" class="peer hidden">
//                 <label for="card_${card._id}" class="w-5 h-5 border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
//                     <div class="icon stratis-check-01 scale-60"></div>
//                 </label>
//                 <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal cursor-pointer">${card.name}</span>
//             </div>
//         `;
//   });

//   console.log("🔍 Generated Card Checkboxes HTML:", cardCheckboxes);

//   const csrfToken =
//     document
//       .querySelector('meta[name="csrf-token"]')
//       ?.getAttribute("content") || "";

//   modal.innerHTML = `
//         <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
//             <div class="relative flex flex-col gap-1 pb-3">
//                 <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
//                 <p class="text-sm text-tertiary-text dark:text-tertiary-text-color-dark font-normal">Tarix aralığı və kart tipləri qeyd edərək filterlə</p>
//                 <span onclick="closeFilterModal()" class="absolute top-0 right-0 icon stratis-x-02 cursor-pointer text-sm dark:text-primary-text-color-dark"></span>
//             </div>
//             <form
//                 class="flex flex-col gap-3"
//                 id="filterTransactionsTableForm"
//                 onsubmit="return false;"
//                 method="POST"
//                 data-url="/charts/transactions-table"
//             >
//                 <input type="hidden" name="_csrf" value="${csrfToken}" />
//                 <label class="flex flex-col gap-[6px]">
//                     <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
//                     <div class="relative w-full">
//                         <input id="startDate" name="start_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
//                         <div onclick="openDatePicker('startDate')" id="startCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
//                     </div>
//                     <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
//                         <div class="icon stratis-information-circle-contained"></div>
//                         <span>Başlanğıc tarixini qeyd edin</span>
//                     </div>
//                 </label>
//                 <label class="flex flex-col gap-[6px]">
//                     <div class="relative w-full">
//                         <input id="endDate" name="end_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
//                         <div onclick="openDatePicker('endDate')" id="endCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
//                     </div>
//                     <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
//                         <div class="icon stratis-information-circle-contained"></div>
//                         <span>Son tarixi qeyd edin</span>
//                     </div>
//                 </label>
//                 <label class="flex flex-col gap-[6px]">
//                     <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Kart tipləri</span>
//                     <div class="flex items-center flex-wrap gap-4">
//                         ${cardCheckboxes}
//                     </div>
//                 </label>
//                 <div class="flex justify-end gap-2 mt-4">
//                     <button
//                         type="button"
//                         class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer"
//                         onclick="closeFilterModal()"
//                     >
//                         Bağla
//                       </button>
//                     <button
//                         onclick="clearFilters()"
//                         type="button"
//                         class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer"
//                     >
//                         Filterləri təmizlə
//                     </button>
//                     <button
//                         onclick="submitForm('filterTransactionsTable')"
//                         type="button"
//                         class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer"
//                     >
//                        Filterlə
//                     </button>
//                 </div>
//             </form>
//         </div>
//     `;

//   // **Modalın fonuna klik edildikdə bağlanma**
//   modal.addEventListener("click", function (event) {
//     if (event.target === modal) {
//       // Sadəcə arxa fonda klik edilərsə
//       closeFilterModal();
//     }
//   });

//   document.body.appendChild(modal);
// }

function openDateModal(
  chartName,
  text = "Tarix aralığı qeyd edərək QR kod sayını görə bilərsiniz"
) {
  // Get CSRF token from meta tag
  const csrfToken =
    document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content") || "";

  dateModal.innerHTML = `
    <div onclick="closeDateModal()" class="fixed inset-0 z-90"></div>
    <div class="border-3 border-stroke dark:border-[#FFFFFF1A] w-[450px] bg-sidebar-item dark:bg-side-bar-item-dark fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-100 shadow-xl rounded-[12px] max-h-[100vh]">
        <div class="p-6">
            <div class="relative mb-3">
                <div class="flex flex-col gap-1">
                    <h3 class="text-[15px] font-medium text-messages dark:text-primary-text-color-dark">Tarix əlavə et</h3>
                    <p class="text-[13px] font-normal text-secondary-text dark:text-secondary-text-color-dark">${text}</p>
                </div>
                <div onclick="closeDateModal()" class="w-[18px] h-[18px] absolute right-0 top-0 cursor-pointer">
                    <div class="icon stratis-x-01 text-[12px] text-primary-text-color-dark"></div>
                </div>
            </div>
            <div>
            <form
                id="${
                  chartName === "qrChart"
                    ? "qrCodeDateModalForm"
                    : "hesablasmalarDateModalForm"
                }"
                method="POST"
                onsubmit="return false;"
                data-url="${
                  chartName === "qrChart"
                    ? "/charts/qr-code-counts"
                    : "/charts/hesablasmalar"
                }"
            >
                <input type="hidden" name="_csrf" value="${csrfToken}" />
                <input type="hidden" name="range" value="custom" >
                <label class="flex flex-col gap-[6px] mb-3">
                    <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
                     <div class="relative w-full">
                        <input id="startDate" name="start_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder:text-[#636B6F] dark:placeholder:text-[#BFC8CC] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('startDate')" id="startCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Başlanğıc tarixini qeyd edin</span>
                    </div>
                </label>
                <label class="flex flex-col gap-[6px] mb-3">
                    <div class="relative w-full">
                        <input id="endDate" name="end_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder:text-[#636B6F] dark:placeholder:text-[#BFC8CC] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('endDate')" id="endCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Son tarixi qeyd edinn</span>
                    </div>
                </label>
                <div class="flex justify-end gap-2 mt-4">
                    <button 
                        type="button"
                        class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" 
                        onclick="closeDateModal()"
                     >
                        Ləğv et
                    </button>
                    <button
                        type="submit"
                        data-form="${
                          chartName === "qrChart"
                            ? "qrCodeDateModal"
                            : "hesablasmalarDateModal"
                        }
                        data-table="${chartName}"
                        class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer"
                        onclick="submitFormForQrAndHesablashma('${
                          chartName === "qrChart"
                            ? "qrCodeDateModal"
                            : "hesablasmalarDateModal"
                        }')"
                    >
                        Əlavə et
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;
}

function closeDateModal() {
  dateModal.innerHTML = "";
}

// Function to handle date modal form submission and chart reloading
function submitFormForQrAndHesablashma(formType) {
  console.log("🚀 Submit form called for:", formType);

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (!startDateInput || !endDateInput) {
    console.error("❌ Date inputs not found");
    return;
  }

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    alert("Zəhmət olmasa həm başlanğıc həm də son tarixi seçin");
    return;
  }

  // Validate date range
  if (new Date(startDate) > new Date(endDate)) {
    alert("Başlanğıc tarixi son tarixdən böyük ola bilməz");
    return;
  }

  console.log("📅 Selected dates:", { startDate, endDate });

  // Close the modal
  closeDateModal();

  // Show loading feedback to user
  if (formType === "qrCodeDateModal") {
    console.log("🔄 Reloading QR Chart with custom dates");
    // QR Chart expects MM/DD/YYYY format based on the backend controller
    const formattedStartDate = formatDateForQrChart(startDate);
    const formattedEndDate = formatDateForQrChart(endDate);

    // You could add a loading indicator here
    console.log(`📊 Updating QR chart for period: ${startDate} to ${endDate}`);

    loadQrChart("custom", formattedStartDate, formattedEndDate);
  } else if (formType === "hesablasmalarDateModal") {
    console.log("🔄 Reloading Hesablashma Chart with custom dates");

    // You could add a loading indicator here
    console.log(
      `📊 Updating Hesablashma chart for period: ${startDate} to ${endDate}`
    );

    // Hesablashma Chart expects YYYY-MM-DD format
    loadHesablasmaChart("custom", startDate, endDate);
  } else if (formType === "filterTransactionsTable") {
    console.log("🔄 Filtering Transactions Table with custom dates and cards");

    // Get selected cards from the filter modal
    const selectedCards = [];
    const cardCheckboxes = document.querySelectorAll(
      'input[type="checkbox"][id^="card_"]:checked'
    );
    cardCheckboxes.forEach((checkbox) => {
      selectedCards.push(checkbox.value);
    });

    console.log(`📊 Filtering Transactions Table:`, {
      startDate,
      endDate,
      selectedCards: selectedCards,
      cardCount: selectedCards.length,
    });

    // Set global filter state for the transactions table
    window.currentFilters = {
      startDate: startDate,
      endDate: endDate,
      cards: selectedCards,
    };

    console.log(
      "🔍 Global Filters Set for Transactions:",
      window.currentFilters
    );

    // Close the filter modal
    closeFilterModal();

    // Apply filters to refresh the transactions table
    if (window.applyFilters) {
      console.log("✅ Calling applyFilters function");
      window.applyFilters();
    } else if (window.refreshTransactionsTable) {
      console.log("✅ Calling refreshTransactionsTable function");
      window.refreshTransactionsTable();
    } else {
      console.warn("⚠️ No table refresh function found");
    }

    // Provide user feedback
    const cardText =
      selectedCards.length > 0 ? ` və ${selectedCards.length} kart` : "";
    console.log(
      `📈 Transactions table filtered for period: ${startDate} to ${endDate}${cardText}`
    );
  }
}

// Helper function to format date for QR Chart (convert YYYY-MM-DD to MM/DD/YYYY)
function formatDateForQrChart(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); // Alternativ həll
  }
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}

// function applyFilters() {
//   console.log("🔍 ========== APPLY FILTERS START ==========");

//   // Input elementlərini tap
//   const startDateInput = document.getElementById("startDate");
//   const endDateInput = document.getElementById("endDate");

//   console.log("🔍 Input Elements:");
//   console.log("- Start Date Input Element:", startDateInput);
//   console.log("- End Date Input Element:", endDateInput);

//   const startDate = startDateInput ? startDateInput.value : "";
//   const endDate = endDateInput ? endDateInput.value : "";

//   console.log("🔍 Date Values:");
//   console.log("- Start Date Value:", startDate);
//   console.log("- End Date Value:", endDate);

//   // Seçilmiş kartları tap
//   const selectedCards = [];
//   const cardCheckboxes = document.querySelectorAll(
//     'input[type="checkbox"][id^="card_"]'
//   );

//   console.log("🔍 Card Checkboxes:");
//   console.log("- Found Card Checkboxes Count:", cardCheckboxes.length);
//   console.log("- Card Checkboxes:", cardCheckboxes);

//   cardCheckboxes.forEach((checkbox, index) => {
//     console.log(`- Checkbox ${index}:`, {
//       id: checkbox.id,
//       value: checkbox.value,
//       checked: checkbox.checked,
//     });

//     if (checkbox.checked) {
//       selectedCards.push(checkbox.value);
//     }
//   });

//   console.log("🔍 Selected Cards Final:", selectedCards);

//   // Global filter dəyərlərini saxla
//   window.currentFilters = {
//     startDate: startDate,
//     endDate: endDate,
//     cards: selectedCards,
//   };

//   console.log("🔍 Global Filters Set:", window.currentFilters);

//   // DataTable-ı yenidən yüklə
//   if (window.dataTable) {
//     window.dataTable.ajax.reload();
//   }

//   closeFilterModal();
// }

function clearFilters() {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (startDateInput) startDateInput.value = "";
  if (endDateInput) endDateInput.value = "";

  // Bütün card checkboxları təmizlə
  const cardCheckboxes = document.querySelectorAll(
    'input[type="checkbox"][id^="card_"]'
  );
  cardCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  console.log("Filters cleared");

  // Global filter dəyərlərini təmizlə
  window.currentFilters = {
    startDate: "",
    endDate: "",
    cards: [],
  };

  // DataTable-ı yenidən yüklə
  if (window.dataTable) {
    window.dataTable.ajax.reload();
  }

  // Modalı bağla
  closeFilterModal();
}

// Apply filters function for transactions table
function applyFilters() {
  console.log("🔍 ========== APPLY FILTERS START ==========");

  // Input elementlərini tap
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  console.log("🔍 Input Elements:");
  console.log("- Start Date Input Element:", startDateInput);
  console.log("- End Date Input Element:", endDateInput);

  const startDate = startDateInput ? startDateInput.value : "";
  const endDate = endDateInput ? endDateInput.value : "";

  console.log("🔍 Date Values:");
  console.log("- Start Date Value:", startDate);
  console.log("- End Date Value:", endDate);

  // Seçilmiş kartları tap
  const selectedCards = [];
  const cardCheckboxes = document.querySelectorAll(
    'input[type="checkbox"][id^="card_"]'
  );

  console.log("🔍 Card Checkboxes:");
  console.log("- Found Card Checkboxes Count:", cardCheckboxes.length);
  console.log("- Card Checkboxes:", cardCheckboxes);

  cardCheckboxes.forEach((checkbox, index) => {
    console.log(`- Checkbox ${index}:`, {
      id: checkbox.id,
      value: checkbox.value,
      checked: checkbox.checked,
    });

    if (checkbox.checked) {
      selectedCards.push(checkbox.value);
    }
  });

  console.log("🔍 Selected Cards Final:", selectedCards);

  // Global filter dəyərlərini saxla
  window.currentFilters = {
    startDate: startDate,
    endDate: endDate,
    cards: selectedCards,
  };

  console.log("🔍 Global Filters Set:", window.currentFilters);

  // DataTable-ı yenidən yüklə
  if (window.dataTable) {
    window.dataTable.ajax.reload();
  }

  closeFilterModal();
}

// Modalı bağlayan funksiya
function closeFilterModal() {
  const dateModal = document.getElementById("dateModal");
  if (dateModal) {
    dateModal.innerHTML = "";
  }
}

// Modal açan funksiya
function openFilterModal() {
  const dateModal = document.getElementById("dateModal");
  if (!dateModal) return;

  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  // Create a dedicated transaction filter modal
  dateModal.innerHTML = `
    <div onclick="closeFilterModal()" class="fixed inset-0 z-90"></div>
    <div class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="w-[515px] max-h-[600px] rounded-[16px] border-[3px] border-[#0000001A] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] bg-white dark:bg-[#161E22] dark:border-[#FFFFFF1A] overflow-y-auto">
            <div class="flex justify-between px-3 py-[18px] border-b-[0.5px] border-[#0000001A]">
                <div class="text-[15px] font-medium mt-1.5 pl-4 text-[#1D222B] dark:text-[#FFFFFF]">
                    Əməliyyat Filterləri
                </div>
                <div onclick="closeFilterModal()" class="cursor-pointer text-xl font-bold text-gray-500 hover:text-gray-700 dark:text-[#FFFFFF]">
                    ×
                </div>
            </div>
            <form id="filterTransactionsForm" method="POST" onsubmit="return false;" data-url="/charts/transactions-table">
            <input type="hidden" name="_csrf" value="${csrfToken}" />
            <!-- Date Range Section -->
            <div class="px-6 py-4 border-b-[0.5px] border-[#0000001A]">
                <h3 class="text-[14px] font-medium text-[#1D222B] dark:text-[#FFFFFF] mb-3">Tarix Aralığı</h3>
                <div class="flex gap-3">
                    <div class="flex-1">
                        <label class="text-[12px] text-gray-600 dark:text-gray-400">Başlanğıc tarixi</label>
                        <input type="date" id="startDate" name="startDate" class="w-full mt-1 border-[1px]  border-surface-variant rounded-lg px-3 py-2 text-[13px] focus:border-focus focus:outline-none dark:bg-[#282c34]  dark:border-[#40484C] ">
                    </div>
                    <div class="flex-1">
                        <label class="text-[12px] text-gray-600 dark:text-gray-400">Bitmə tarixi</label>
                        <input type="date" id="endDate" name="endDate" class="w-full mt-1 border-[1px] border-surface-variant rounded-lg px-3 py-2 text-[13px] focus:border-focus focus:outline-none dark:bg-[#282c34] dark:border-[#40484C] ">
                    </div>
                </div>
            </div>

            <!-- Cards Section -->
            <div class="px-6 py-4">
                <h3 class="text-[14px] font-medium text-[#1D222B] dark:text-[#FFFFFF] mb-3">Kartlar</h3>
                <div class="max-h-[200px] overflow-y-auto">
                    ${
                      window.cardsArray && window.cardsArray.length > 0
                        ? window.cardsArray
                            .map(
                              (card) => `
                            <label class="flex items-center gap-2 py-2 border-b-[0.5px] border-[#0000001A] last:border-b-0">
                                <input type="checkbox" id="card_${card._id}" value="${card._id}" name="cards[]" class="w-[18px] h-[18px] rounded-[2px] border-[1px] border-surface-variant text-primary focus:outline-none focus:ring-0 dark:bg-[#282c34] dark:border-[#40484C]">
                                <div class="text-[13px] text-[#1D222B] dark:text-[#FFFFFF]">${card.name}</div>
                            </label>
                        `
                            )
                            .join("")
                        : '<div class="text-[13px] text-gray-500 dark:text-gray-400 py-4 text-center">Kart tapılmadı</div>'
                    }
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 px-6 py-4 border-t-[0.5px] border-[#0000001A]">
                <button onclick="closeFilterModal()" class="px-4 py-2 rounded-[50px] bg-surface-bright text-[13px] text-on-surface-variant font-medium hover:text-messages dark:bg-[#36393E] dark:text-[#FFFFFF]">
                    Bağla
                </button>
                <button onclick="clearFilters()" class="px-4 py-2 rounded-[50px] bg-surface-bright text-[13px] font-medium text-on-surface-variant hover:text-messages dark:bg-[#36393E] dark:text-[#FFFFFF]">
                    Təmizlə
                </button>
                <button onclick="submitFormForTransactionsTable()" class="px-4 py-2 rounded-[100px] bg-[#745086] text-white text-[13px] hover:bg-[#88649A] focus:shadow-[0px_0px_16px_0px_rgba(0,0,0,0.2)]">
                    Filterlə
                </button>
            </div>
            </form>
        </div>
    </div>
  `;
}

const submitFormForTransactionsTable = () => {
  submitForm("filterTransactions");
  window.dataTable.ajax.reload();
  closeFilterModal();
};

const years = Array.from({ length: 7 }, (_, i) => 2025 - i);

// Dropdown funksiyası
function setupYearDropdown(containerId, spanId, dropdownId, inputId) {
  const container = document.getElementById(containerId);
  const selectedSpan = document.getElementById(spanId);
  const dropdown = document.getElementById(dropdownId);
  const yearInput = document.getElementById(inputId);
  const yearList = dropdown.querySelector("ul");

  // İlləri siyahıya əlavə et
  years.forEach((year) => {
    const li = document.createElement("li");
    li.textContent = year;
    li.className =
      "cursor-pointer text-[13px] font-medium text-messages dark:text-primary-text-color-dark px-3 py-[3.5px] rounded hover:bg-item-hover dark:hover:bg-item-hover-dark";
    li.onclick = () => {
      selectedSpan.textContent = year;
      loadMeblegChart(year);
      alertModal("Chart updated");
      dropdown.classList.add("hidden");
    };
    yearList.appendChild(li);
  });

  // Toggle dropdown
  selectedSpan.parentElement.onclick = function (e) {
    e.stopPropagation(); // event bubble qarşısını alır
    dropdown.classList.toggle("hidden");
  };

  // Menyudan kənara klik edildikdə dropdown-u bağla
  document.addEventListener("click", function (e) {
    if (!container.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

// Hər iki dropdown üçün çağırış
setupYearDropdown("customScroll", "selectedYear", "yearDropdown", "yearInput");
// setupYearDropdown("kartlarCustomScroll", "kartlarSelectedYear", "kartlarYearDropdown", );

function openIllerModal() {
  document.getElementById("illerPopupOverlay").classList.remove("hidden");
  document.body.style.overflowY = "hidden"; // Prevent background scrolling
}

function closeIllerModal() {
  document.getElementById("illerPopupOverlay").classList.add("hidden");
  document.body.style.overflowY = "auto"; // Restore scrolling
}

function clearIllerFilters() {
  const checkboxes = document.querySelectorAll(
    '#illerPopupOverlay input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  document.getElementById("illerSearch").value = "";
}

function applyIllerFilters() {
  const checkboxes = document.querySelectorAll(
    '#illerPopupOverlay input[type="checkbox"]:checked'
  );
  const selectedYears = Array.from(checkboxes).map((cb) => cb.value);
  console.log("Selected years:", selectedYears);

  // Here you can implement your filter logic
  // For example, update charts or data based on selected years

  closeIllerModal();
}

// Kartlar Modal Functions
function openKartlarModal() {
  document.getElementById("kartlarPopupOverlay").classList.remove("hidden");
  document.body.style.overflowY = "hidden"; // Prevent background scrolling
}

function closeKartlarModal() {
  document.getElementById("kartlarPopupOverlay").classList.add("hidden");
  document.body.style.overflowY = "auto"; // Restore scrolling
}

function clearKartlarFilters() {
  const checkboxes = document.querySelectorAll(
    '#kartlarPopupOverlay input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  document.getElementById("kartlarSearch").value = "";
}

function applyKartlarFilters() {
  const checkboxes = document.querySelectorAll(
    '#kartlarPopupOverlay input[type="checkbox"]:checked'
  );
  const selectedCards = Array.from(checkboxes).map((cb) => cb.value);
  console.log("Selected cards:", selectedCards);

  // Here you can implement your filter logic
  // For example, update charts or data based on selected cards

  closeKartlarModal();
}

// Search functionality for İllər
document.getElementById("illerSearch").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const checkboxItems = document.querySelectorAll(
    "#illerPopupOverlay .flex.pl-3"
  );

  checkboxItems.forEach((item) => {
    const text = item.querySelector("div").textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
});

// Search functionality for Kartlar
document
  .getElementById("kartlarSearch")
  .addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const checkboxItems = document.querySelectorAll(
      "#kartlarPopupOverlay .flex.pl-3"
    );

    checkboxItems.forEach((item) => {
      const text = item.querySelector("div").textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });

// Kartlar Modal Search Functionality
document
  .getElementById("kartlarSearch")
  .addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const checkboxItems = document.querySelectorAll(
      "#kartlarPopupOverlay .flex.pl-3"
    );

    checkboxItems.forEach((item) => {
      const text = item.querySelector("div").textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });

// Closing modals when clicking outside the modal overlay
document
  .getElementById("illerPopupOverlay")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closeIllerModal();
    }
  });

document
  .getElementById("kartlarPopupOverlay")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closeKartlarModal();
    }
  });

// Optional: Prevent closing when clicking inside the modal
document.querySelectorAll(".modal-content").forEach(function (modalContent) {
  modalContent.addEventListener("click", function (e) {
    e.stopPropagation();
  });
});
