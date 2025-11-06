// Mövcud vəziyyəti izləmək üçün dəyişənlər
let currentView = "companies"; // 'companies', 'years', 'months'
let selectedCompany = null;
let selectedYear = null;
let selectedMonth = null;
let allCompanies = [];
let csrfToken;

// Görünüşləri idarə edən funksiya (qlobal sahəyə çıxarıldı)
function setView(view) {
  currentView = view;
  $("#companiesContainer").addClass("hidden");
  $("#yearsContainer").addClass("hidden");
  $("#monthsContainer").addClass("hidden");
  $("#backArrow").addClass("hidden");

  if (view === "companies") {
    $("#companiesContainer").removeClass("hidden");
    $("#modalTitle").text(`Şirkətlər`);
    loadCompanies();
  } else if (view === "years") {
    $("#yearsContainer").removeClass("hidden");
    $("#modalTitle").text(`İllər`);
    $("#backArrow").removeClass("hidden");
    loadYears(selectedCompany.companyId);
  } else if (view === "months") {
    $("#monthsContainer").removeClass("hidden");
    $("#modalTitle").text(`Aylar`);
    $("#backArrow").removeClass("hidden");
    loadMonths(selectedCompany.companyId, selectedYear);
  }
}

// Modal pəncərəni açan/bağlayan funksiya (qlobal sahədə qalır)
function toggleInvoysModal() {
  const modal = document.getElementById("invoysModal");
  modal.classList.toggle("hidden");
  // Modal bağlandıqda, başlanğıc vəziyyətinə qayıtmaq üçün
  if (modal.classList.contains("hidden")) {
    setView("companies");
  }
}

// Seçilmiş dəyərləri sıfırlayan funksiya
function resetSelectedValues() {
  selectedCompany = null;
  selectedYear = null;
  selectedMonth = null;
  // Dəyərləri sıfırlayandan sonra, main view-u yenidən başlanğıc vəziyyətinə gətiririk
  $("#selectedValues").addClass("hidden");
  $("#invoysTitleContainer").removeClass("hidden");
}

// Seçilmiş dəyərləri göstərən funksiya (qlobal sahəyə çıxarıldı)
function showSelectedValues() {
  const container = $("#selectedValues");
  if (selectedCompany && selectedYear && selectedMonth) {
    // Hesablaşma (89) başlığını gizlət
    $("#invoysTitleContainer").addClass("hidden");
    container.removeClass("hidden");
    container.html(`
        <div class="px-2 flex gap-6 items-center">
            <div class="flex gap-1 items-center">
                <!-- Icon for calendar, using a placeholder for now -->
                <div class="icon stratis-calendar-07 text-xs"></div>
                ${selectedCompany.companyName} / ${selectedYear} - ${selectedMonth}
            </div>
            <div class="icon stratis-x-02 text-xs cursor-pointer" onclick="resetSelectedValues()"></div>
        </div>
    `);
  }
}

// Şirkətləri API-dən yükləyən funksiya (qlobal sahəyə çıxarıldı)
function loadCompanies() {
  const container = $("#companies");
  container
    .empty()
    .html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');
  $("#modalTitle").text(`Şirkətlər`);

  $.ajax({
    url: "/api/avankart/sirket/hesablasma/invoys-companies.json",
    type: "GET",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      allCompanies = [];
      response.data.forEach((row) => {
        row.forEach((company) => {
          allCompanies.push(company);
        });
      });
      $("#modalTitle").text(`Şirkətlər (${allCompanies.length})`);
      renderFilteredCompanies(allCompanies);
    },
    error: function () {
      container.html(
        '<p class="text-red-500 text-center w-full">Şirkət məlumatları yüklənmədi.</p>'
      );
    },
  });
}

// Şirkət kartlarını filtrasiya edib render edən funksiya (qlobal sahəyə çıxarıldı)
function renderFilteredCompanies(companiesToRender) {
  const container = $("#companies");
  container.empty();
  if (companiesToRender.length === 0) {
    container.html(
      '<p class="text-gray-500 text-center w-full">Heç bir nəticə tapılmadı.</p>'
    );
  } else {
    companiesToRender.forEach((company) => {
      container.append(renderCompanyCard(company));
    });
  }
  $(".company-card").on("click", function () {
    selectedCompany = $(this).data("company");
    console.log("Seçilmiş şirkət:", selectedCompany);
    setView("years");
  });
}

// Şirkət kartının HTML-i (qlobal sahəyə çıxarıldı)
function renderCompanyCard(data) {
  return `
    <div class="flex flex-col items-center p-4 max-w-[157px] w-full hover:bg-input-hover cursor-pointer company-card"
            data-company='${JSON.stringify(data)}'>
        <div class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
            <img src="${data.logo}" alt="${
    data.companyName
  }" class="w-8 h-8 object-contain">
        </div>
        <div class="mt-2 text-[15px] font-medium">${data.companyName}</div>
        <div class="text-[11px] text-tertiary-text">${data.companyId}</div>
    </div>
  `;
}

// İlləri yükləyən funksiya (qlobal sahəyə çıxarıldı)
function loadYears(companyId) {
  const container = $("#years");
  container
    .empty()
    .html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');

  container.empty();
  for (let year = 2024; year >= 1999; year--) {
    const yearData = { year: year, count: Math.floor(Math.random() * 12) + 1 };
    container.append(renderYearCard(yearData));
  }

  $(".year-card").on("click", function () {
    selectedYear = $(this).data("year");
    console.log("Seçilmiş il:", selectedYear);
    setView("months");
  });
}

// İl kartının HTML-i (qlobal sahəyə çıxarıldı)
function renderYearCard(data) {
  return `
      <div class="year-card pl-6 py-6 w-full max-w-[224px] border-b-[.5px] border-stroke hover:bg-input-hover cursor-pointer" data-year='${data.year}'>
          <p class="text-[15px] font-medium text-messages">${data.year}</p>
          <p class="text-[11px] text-tertiary-text mt-1">${data.count} invoys</p>
      </div>
  `;
}

// Ayları API-dən yükləyən funksiya (qlobal sahəyə çıxarıldı)
function loadMonths(companyId, year) {
  const container = $("#months");
  container
    .empty()
    .html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');

  $.ajax({
    url: `/api/avankart/sirket/hesablasma/invoys-months.json`,
    type: "GET",
    data: { companyId: companyId, year: year },
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      container.empty();
      response.data.forEach((month) => {
        container.append(renderMonthCard(month));
      });
      $(".month-card").on("click", function () {
        const month = $(this).data("month");
        selectedMonth = month;
        console.log("Seçilmiş ay:", selectedMonth);
        // Seçim tamalandıqdan sonra dəyərləri göstərir və sonra modalı bağlayır.
        showSelectedValues();
        toggleInvoysModal();
      });
    },
    error: function () {
      container.html(
        '<p class="text-red-500 text-center w-full">Aylar məlumatı yüklənmədi.</p>'
      );
    },
  });
}

// Ay kartının HTML-i (qlobal sahəyə çıxarıldı)
function renderMonthCard(data) {
  return `
      <div class="month-card px-8 py-6 w-full max-w-[224px] border-b-[.5px] border-stroke hover:bg-input-hover cursor-pointer" data-month='${data.month}'>
          <p class="text-[15px] font-medium text-messages">${data.month}</p>
          <p class="text-[11px] text-tertiary-text mt-1">${data.count} invoys</p>
      </div>
  `;
}

// DOM yükləndikdən sonra işləyən jQuery kodu
$(document).ready(function () {
  // CSRF tokenini HTML-dən oxu
  csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Geri düyməsinə klik funksiyası
  $("#backButton").on("click", function () {
    if (currentView === "years") {
      setView("companies");
    } else if (currentView === "months") {
      setView("years");
    }
  });

  // Axtarış inputu üçün hadisə dinləyicisi
  $("#customSearchCompanies").on("input", function () {
    const query = $(this).val().toLowerCase();
    const filteredCompanies = allCompanies.filter(
      (company) =>
        company.companyName.toLowerCase().includes(query) ||
        company.companyId.toLowerCase().includes(query)
    );
    renderFilteredCompanies(filteredCompanies);
    $("#modalTitle").text(`Şirkətlər (${filteredCompanies.length})`);
  });

  // Başlanğıcda şirkətləri yüklə
  setView("companies");
});
