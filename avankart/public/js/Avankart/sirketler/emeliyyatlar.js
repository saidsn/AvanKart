// Global dəyişənlər
let currentEmeliyyatlarView = "main"; // 'main', 'years', 'months', 'table'
let selectedEmeliyyatlarYear = null;
let selectedEmeliyyatlarMonth = null;
let csrfToken;

// Görünüşləri idarə edən funksiya
function setEmeliyyatlarView(view) {
  currentEmeliyyatlarView = view;

  // hamısını gizlət
  $("#hesablasma-card").addClass("hidden");
  $("#cards-menu").addClass("hidden");
  $("#yearsContainer").addClass("hidden");
  $("#monthsContainer").addClass("hidden");
  $("#tableContainer").addClass("hidden");
  $("#eQaimeMain").addClass("hidden");
  $("#backButton").addClass("hidden");

  if (view === "main") {
    $("#hesablasma-card").removeClass("hidden");
    $("#cards-menu").removeClass("hidden");
    $("#modalTitle").text("");
  } else if (view === "years") {
    $("#yearsContainer").removeClass("hidden");
    $("#modalTitle").text(
      currentCardType === "eqaime" ? "e-Qaimə" : "Hesablaşma"
    );
    $("#backButton").removeClass("hidden");
    $("#backArrow").removeClass("hidden");
    loadYears();
  } else if (view === "months") {
    $("#monthsContainer").removeClass("hidden");
    $("#modalTitle").text(`${selectedEmeliyyatlarYear}`);
    $("#backButton").removeClass("hidden");
    $("#backArrow").removeClass("hidden");
    loadMonths(selectedEmeliyyatlarYear);
  } else if (view === "table") {
    if (currentCardType === "eqaime") {
      $("#eQaimeMain").removeClass("hidden");
    } else {
      $("#tableContainer").removeClass("hidden");
    }
    $("#modalTitle").text(
      `${selectedEmeliyyatlarYear} - ${selectedEmeliyyatlarMonth}`
    );
    showSelectedValues();
    showSelectedValuesEqaime();
  }
}

// Seçilmiş dəyərləri sıfırlayan funksiya
function resetSelectedValues() {
  selectedEmeliyyatlarYear = null;
  selectedEmeliyyatlarMonth = null;
  $("#selectedValues").addClass("hidden");
  setEmeliyyatlarView("years");
}

// Seçilmiş dəyərləri göstərən funksiya
function showSelectedValues() {
  const container = $("#selectedValues");
  if (selectedEmeliyyatlarYear && selectedEmeliyyatlarMonth) {
    container.removeClass("hidden");
    container.html(`
            <div class="px-2 flex gap-6 items-center">
                <div class="flex gap-1 items-center">
                    <div class="icon stratis-calendar-07 text-xs"></div>
                    ${selectedEmeliyyatlarYear} - ${selectedEmeliyyatlarMonth}
                </div>
                <div class="icon stratis-x-02 text-xs cursor-pointer" onclick="resetSelectedValues()"></div>
            </div>
        `);
  }
}

// Seçilmiş dəyərləri göstərən funksiya eQaimeMain üçün
function showSelectedValuesEqaime() {
  const container = $("#selectedValuesEqaime");
  if (selectedEmeliyyatlarYear && selectedEmeliyyatlarMonth) {
    container.removeClass("hidden");
    container.html(`
      <div class="px-2 flex gap-6 items-center">
        <div class="flex gap-1 items-center">
          <div class="icon stratis-calendar-07 text-xs"></div>
          ${selectedEmeliyyatlarYear} - ${selectedEmeliyyatlarMonth}
        </div>
        <div class="icon stratis-x-02 text-xs cursor-pointer" onclick="resetSelectedValuesEqaime()"></div>
      </div>
    `);
  } else {
    container.addClass("hidden");
  }
}

// Seçilmiş dəyərləri sıfırlayan funksiya eQaimeMain üçün
function resetSelectedValuesEqaime() {
  selectedEmeliyyatlarYear = null;
  selectedEmeliyyatlarMonth = null;
  $("#selectedValuesEqaime").addClass("hidden");
  setEmeliyyatlarView("years");
}

// İlləri yükləyən funksiya
function loadYears() {
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
    selectedEmeliyyatlarYear = $(this).data("year");
    console.log("Seçilmiş il:", selectedEmeliyyatlarYear);
    setEmeliyyatlarView("months");
  });
}

// İl kartının HTML-i
function renderYearCard(data) {
  return `
        <div class="year-card py-6 pl-6 min-w-[237px] border-b-[.5px] border-stroke hover:bg-input-hover cursor-pointer" data-year='${data.year}'>
            <p class="text-[15px] font-medium text-messages">${data.year}</p>
            <p class="text-[11px] text-tertiary-text mt-1">${data.count} invoys</p>
        </div>
    `;
}

// Ayları API-dən yükləyən funksiya
function loadMonths(year) {
  const container = $("#months");
  container
    .empty()
    .html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');

  $.ajax({
    url: `/api/avankart/sirket/hesablasma/invoys-months.json`,
    type: "GET",
    data: { year: year },
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
        selectedEmeliyyatlarMonth = month;
        console.log("Seçilmiş ay:", selectedEmeliyyatlarMonth);
        setEmeliyyatlarView("table");
      });
    },
    error: function () {
      container.html(
        '<p class="text-red-500 text-center w-full">Aylar məlumatı yüklənmədi.</p>'
      );
    },
  });
}

// Ay kartının HTML-i
function renderMonthCard(data) {
  return `
        <div class="month-card pl-6 py-6 max-w-[237px] w-full border-b-[.5px] border-stroke hover:bg-input-hover cursor-pointer" data-month='${data.month}'>
            <p class="text-[15px] font-medium text-messages">${data.month}</p>
            <p class="text-[11px] text-tertiary-text mt-1">${data.count} invoys</p>
        </div>
    `;
}

// DOM yükləndikdən sonra işləyən jQuery kodu
$(document).ready(function () {
  csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Geri düyməsinə klik funksiyası
  $("#backButton").on("click", function () {
    if (currentEmeliyyatlarView === "years") {
      setEmeliyyatlarView("main");
    } else if (currentEmeliyyatlarView === "months") {
      setEmeliyyatlarView("years");
    } else if (currentEmeliyyatlarView === "table") {
      setEmeliyyatlarView("months");
    }
  });

  // Hesablaşma üçün klik
  $("#hesablasma-card").on("click", function () {
    currentCardType = "hesablasma";
    setEmeliyyatlarView("years");
  });

  // e-Qaimə üçün klik
  $("#eQaime-card").on("click", function () {
    currentCardType = "eqaime";
    setEmeliyyatlarView("table");
  });

  // Başlanğıcda yalnız "eQaime-card" göstərilir
  setEmeliyyatlarView("main");
});

// Operations functionality for Hesablaşma and İşçilərin balansı
const OPS_ENDPOINTS = {
  eqaime: "/emeliyyatlar/sirket/eqaime",
  hesab: "/emeliyyatlar/sirket/hesablasma",
  isciler: "/emeliyyatlar/sirket/iscilerin-balansi",
};

let opsState = {
  kind: "eqaime", // 'eqaime' | 'hesab' | 'isciler'
  search: "",
  year: null,
  month: null,
  status: [], // array
  min: null,
  max: null,
  page: 1,
  limit: 10,
};

// Get company ID from the root container
const companyId = document.getElementById("ops-root")?.dataset.companyId;

async function fetchOps() {
  const url = OPS_ENDPOINTS[opsState.kind];
  const body = {
    sirket_id: companyId,
    year: opsState.year || undefined,
    month: opsState.month || undefined,
    status: opsState.status.length ? opsState.status : undefined,
    min: opsState.min ?? undefined,
    max: opsState.max ?? undefined,
    search: opsState.search || undefined,
    page: opsState.page,
    limit: opsState.limit,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": window.CSRF_TOKEN,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}

function getStatusLabel(rawStatus) {
  switch (rawStatus) {
    case "active":
    case "success":
      return "Tamamlandı";
    case "passive":
    case "pending":
      return "Gözləyir";
    case "canceled":
    case "failed":
      return "Ləğv edilib";
    case "baxildi":
      return "Baxılıb";
    default:
      return rawStatus || "—";
  }
}

function getStatusColor(rawStatus) {
  switch (rawStatus) {
    case "active":
    case "success":
      return "bg-green-500";
    case "passive":
    case "pending":
      return "bg-yellow-500";
    case "canceled":
    case "failed":
      return "bg-red-500";
    case "baxildi":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}

function formatCurrency(amount) {
  if (typeof amount !== "number") return "—";
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " ₼"
  );
}

function renderOpsTable(payload) {
  const tbody = $("#ops-table tbody");
  tbody.empty();

  if (!payload.data || payload.data.length === 0) {
    tbody.append(`
      <tr>
        <td colspan="4" class="text-center py-8 text-gray-500">
          Heç bir əməliyyat tapılmadı
        </td>
      </tr>
    `);
    return;
  }

  payload.data.forEach((row) => {
    const statusLabel = getStatusLabel(row.raw_status || row.status);
    const statusColor = getStatusColor(row.raw_status || row.status);
    const amount = formatCurrency(row.amount);
    const period = row.period?.label || "—";
    const docNo = row.doc_no || row.qaime_id || row.operation_no || "—";

    const tr = $(`
      <tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
        <td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <span class="text-sm text-gray-900 dark:text-white">${docNo}</span>
        </td>
        <td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <span class="text-sm text-gray-900 dark:text-white">${amount}</span>
        </td>
        <td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <span class="text-sm text-gray-900 dark:text-white">${period}</span>
        </td>
        <td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <span class="w-2 h-2 rounded-full ${statusColor} mr-2"></span>
            <span class="text-sm text-gray-900 dark:text-white">${statusLabel}</span>
          </div>
        </td>
      </tr>
    `);

    tbody.append(tr);
  });
}

function renderPager(payload) {
  const pagerContainer = $("#ops-pager");
  const pageCountContainer = $("#eQaimeMainPageCount");

  if (!pagerContainer.length || !pageCountContainer.length) {
    return;
  }

  const totalPages = Math.ceil(payload.total / payload.pageSize);
  const currentPage = payload.page;

  // Update page count
  pageCountContainer.text(`${currentPage} / ${totalPages || 1}`);

  // Clear existing pagination
  pagerContainer.empty();

  if (totalPages <= 1) {
    return;
  }

  // Previous button
  const prevButton = $(`
    <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
      currentPage === 1
        ? "text-gray-400 cursor-not-allowed"
        : "text-gray-700 cursor-pointer"
    }" onclick="changeOpsPage(${Math.max(1, currentPage - 1)})">
      <div class="icon stratis-chevron-left text-xs"></div>
    </div>
  `);
  pagerContainer.append(prevButton);

  // Page numbers
  const pageNumbers = $('<div class="flex gap-2"></div>');
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = $(`
      <button class="cursor-pointer w-10 h-10 rounded-[8px] text-sm ${
        i === currentPage
          ? "bg-purple-100 text-purple-700"
          : "bg-transparent text-gray-600 hover:text-gray-900"
      }" onclick="changeOpsPage(${i})">
        ${i}
      </button>
    `);
    pageNumbers.append(pageButton);
  }
  pagerContainer.append(pageNumbers);

  // Next button
  const nextButton = $(`
    <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
      currentPage === totalPages
        ? "text-gray-400 cursor-not-allowed"
        : "text-gray-700 cursor-pointer"
    }" onclick="changeOpsPage(${Math.min(totalPages, currentPage + 1)})">
      <div class="icon stratis-chevron-right text-xs"></div>
    </div>
  `);
  pagerContainer.append(nextButton);
}

async function reloadOps() {
  try {
    // Show loading state
    const tbody = $("#ops-table tbody");
    tbody.empty();
    tbody.append(`
      <tr>
        <td colspan="4" class="text-center py-8">
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span class="ml-2 text-gray-500">Yüklənir...</span>
          </div>
        </td>
      </tr>
    `);

    const payload = await fetchOps();
    renderOpsTable(payload);
    renderPager(payload);
  } catch (e) {
    console.error("Error loading operations:", e);
    const tbody = $("#ops-table tbody");
    tbody.empty();
    tbody.append(`
      <tr>
        <td colspan="4" class="text-center py-8 text-red-500">
          Xəta baş verdi. Yenidən cəhd edin.
        </td>
      </tr>
    `);
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Global function for pagination
window.changeOpsPage = function (page) {
  opsState.page = page;
  reloadOps();
};

// Wire UI events
$(document).ready(function () {
  // Card clicks
  $("#ops-card-hesablasma").on("click", function () {
    opsState.kind = "hesab";
    opsState.page = 1;
    // Hide cards menu and show table
    $("#cards-menu").addClass("hidden");
    $("#eQaimeMain").removeClass("hidden");
    reloadOps();
  });

  $("#ops-card-isciler").on("click", function () {
    opsState.kind = "isciler";
    opsState.page = 1;
    // Hide cards menu and show table
    $("#cards-menu").addClass("hidden");
    $("#eQaimeMain").removeClass("hidden");
    reloadOps();
  });

  // Search with debounce
  $("#ops-search").on(
    "input",
    debounce(function (e) {
      opsState.search = e.target.value.trim();
      opsState.page = 1;
      reloadOps();
    }, 350)
  );

  // Refresh button
  $("#ops-refresh").on("click", function () {
    reloadOps();
  });

  // Filter apply button
  $("#ops-filter-apply").on("click", function () {
    // Read values from filter modal
    const selectedYears = [];
    $('#ops-filter-modal input[name="year"]:checked').each(function () {
      selectedYears.push($(this).val());
    });
    opsState.year = selectedYears.length > 0 ? selectedYears[0] : null;

    const selectedMonths = [];
    $('#ops-filter-modal input[name="month"]:checked').each(function () {
      selectedMonths.push($(this).val());
    });
    opsState.month = selectedMonths.length > 0 ? selectedMonths[0] : null;

    opsState.status = [];
    $('#ops-filter-modal input[name="status"]:checked').each(function () {
      opsState.status.push($(this).val());
    });

    // Get amount range from slider
    if ($("#eQaimeMain-mebleg-slider").hasClass("ui-slider")) {
      const sliderValues = $("#eQaimeMain-mebleg-slider").slider("values");
      opsState.min = sliderValues[0];
      opsState.max = sliderValues[1];
    }

    opsState.page = 1;
    reloadOps();
    $("#ops-filter-modal").addClass("hidden");
  });

  // Filter clear button
  $("#ops-filter-clear").on("click", function () {
    opsState.year = null;
    opsState.month = null;
    opsState.status = [];
    opsState.min = null;
    opsState.max = null;
    opsState.page = 1;

    // Clear form
    $('#ops-filter-modal input[type="checkbox"]').prop("checked", false);
    if ($("#eQaimeMain-mebleg-slider").hasClass("ui-slider")) {
      $("#eQaimeMain-mebleg-slider").slider("values", [0, 10000]);
    }

    reloadOps();
    $("#ops-filter-modal").addClass("hidden");
  });
});
