// Mövcud vəziyyəti izləmək üçün dəyişənlər
let currentView = "companies"; // 'companies', 'years', 'months'
let selectedCompany = null;
let selectedYear = null;
let selectedMonth = null;
let allCompanies = [];
let csrfToken;

// Backend endpoint
const TREE_API = "/emeliyyatlar/sirket/hesablasma/tree";

// Xəritədən gələn tree-nin keşdə saxlanması
let treeCache = null;

// Ay adları
const monthNames = [
  "Yanvar","Fevral","Mart","Aprel","May","İyun",
  "İyul","Avqust","Sentyabr","Oktyabr","Noyabr","Dekabr"
];

// --- API helpers ---
function apiPostJSON(url, bodyObj = {}) {
  return $.ajax({
    url,
    type: "POST",
    data: JSON.stringify(bodyObj),
    dataType: "json",
    contentType: "application/json",
    processData: false,
    headers: { "X-CSRF-Token": csrfToken },
  });
}

// Görünüşləri idarə edən funksiya
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
    if (selectedCompany?.companyId) {
      loadYears(selectedCompany.companyId);
    }
  } else if (view === "months") {
    $("#monthsContainer").removeClass("hidden");
    $("#modalTitle").text(`Aylar`);
    $("#backArrow").removeClass("hidden");
    if (selectedCompany?.companyId && selectedYear) {
      loadMonths(selectedCompany.companyId, selectedYear);
    }
  }
}

// Modal aç/bağla
window.toggleInvoysModal = () => {
  const modal = document.getElementById("invoysModal");
  modal.classList.toggle("hidden");
  if (modal.classList.contains("hidden")) {
    setView("companies");
  }
}

// Seçilmişləri sıfırla
function resetSelectedValues() {
  selectedCompany = null;
  selectedYear = null;
  selectedMonth = null;

  $("#selectedValues").addClass("hidden");
  $("#invoysTitleContainer").removeClass("hidden");

  if (typeof window.clearFolderFilter === "function") {
    window.clearFolderFilter();
  } else if (window.currentFilters) {
    delete window.currentFilters.companyId;
    delete window.currentFilters.year;
    delete window.currentFilters.month;
    window.dispatchEvent(
      new CustomEvent("invoiceFolderSelected", { detail: {} })
    );
  }
}

// Seçilmişləri göstər
function showSelectedValues() {
  const container = $("#selectedValues");
  if (selectedCompany && selectedYear && selectedMonth !== null) {
    $("#invoysTitleContainer").addClass("hidden");
    container.removeClass("hidden");
    container.html(`
      <div class="px-2 flex gap-6 items-center">
        <div class="flex gap-1 items-center">
          <div class="icon stratis-calendar-07 text-xs"></div>
          ${selectedCompany.companyName} / ${selectedYear} - ${monthNames[selectedMonth]}
        </div>
        <div class="icon stratis-x-02 text-xs cursor-pointer" onclick="resetSelectedValues()"></div>
      </div>
    `);
  }
}

// Tree-ni bir dəfə yüklə
function loadTreeOnce() {
  const container = $("#companies");
  container.empty().html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');

  if (Array.isArray(treeCache)) {
    renderCompaniesFromTree(treeCache);
    return Promise.resolve(treeCache);
  }

  return apiPostJSON(TREE_API, {})
    .then((resp) => {
      if (!resp?.success || !Array.isArray(resp.data)) throw new Error("Invalid tree response");
      treeCache = resp.data;
      renderCompaniesFromTree(treeCache);
      return treeCache;
    })
    .catch(() => {
      container.html('<p class="text-red-500 text-center w-full">Şirkət məlumatları yüklənmədi.</p>');
      return [];
    });
}

// Şirkətləri yüklə
function loadCompanies() {
  $("#modalTitle").text(`Şirkətlər`);
  loadTreeOnce().then((tree) => {
    allCompanies = tree.map((c) => ({
      companyId: c.sirket_id,
      companyName: c.sirket_name,
      logo: c.logo || "",
    }));
    $("#modalTitle").text(`Şirkətlər (${allCompanies.length})`);
  });
}

// Şirkətləri render et
function renderCompaniesFromTree(tree) {
  const companies = (tree || []).map((c) => ({
    companyId: c.sirket_id,
    companyName: c.sirket_name,
    logo: c.logo || "",
  }));
  renderFilteredCompanies(companies);
}

// Şirkət kartlarını render
function renderFilteredCompanies(companiesToRender) {
  const container = $("#companies");
  container.empty();

  if (!companiesToRender || companiesToRender.length === 0) {
    container.html('<p class="text-gray-500 text-center w-full">Heç bir nəticə tapılmadı.</p>');
  } else {
    companiesToRender.forEach((company) => {
      container.append(renderCompanyCard(company));
    });
  }

  $(".company-card").on("click", function () {
    const raw = $(this).attr("data-company");
    try {
      selectedCompany = JSON.parse(raw.replaceAll("&quot;", '"'));
    } catch {
      selectedCompany = $(this).data("company");
    }
    setView("years");
  });
}

function renderCompanyCard(data) {
  const safeData = JSON.stringify(data).replace(/"/g, "&quot;");
  return `
    <div class="flex flex-col items-center p-4 max-w-[157px] w-full hover:bg-input-hover cursor-pointer company-card"
         data-company="${safeData}">
      <div class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
        <img src="${data.logo || ""}" alt="${data.companyName || ""}" class="w-8 h-8 object-contain">
      </div>
      <div class="mt-2 text-[15px] font-medium">${data.companyName || ""}</div>
      <div class="text-[11px] text-tertiary-text">${data.companyId || ""}</div>
    </div>
  `;
}

// İllər
function loadYears(companyId) {
  const container = $("#years");
  container.empty().html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');

  if (!Array.isArray(treeCache)) {
    loadTreeOnce().then(() => renderYearsFromTree(companyId));
  } else {
    renderYearsFromTree(companyId);
  }
}
function renderYearsFromTree(companyId) {
  const container = $("#years");
  container.empty();

  const comp = (treeCache || []).find((c) => c.sirket_id === companyId);
  const yearsObj = comp?.years || {};

  const yearsArr = Object.entries(yearsObj).sort((a, b) => b[0] - a[0]).map(([year, months]) => {
    const total = Object.values(months).reduce((sum, v) => sum + v, 0);
    return { year, count: total, months };
  });

  if (yearsArr.length === 0) {
    container.html('<p class="text-gray-500 text-center w-full">İl məlumatı tapılmadı.</p>');
    return;
  }

  yearsArr.forEach((y) => container.append(renderYearCard(y)));

  $(".year-card").on("click", function () {
    selectedYear = $(this).data("year");
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

// Aylar
function loadMonths(companyId, year) {
  const container = $("#months");
  container.empty().html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');

  if (!Array.isArray(treeCache)) {
    loadTreeOnce().then(() => renderMonthsFromTree(companyId, year));
  } else {
    renderMonthsFromTree(companyId, year);
  }
}

// Ayları render etmək üçün də buna uyğun dəyişmək lazımdır
function renderMonthsFromTree(companyId, year) {
  const container = $("#months");
  container.empty();

  const comp = (treeCache || []).find((c) => c.sirket_id === companyId);
  const monthsObj = comp?.years?.[year] || {};

  const monthsArr = Object.entries(monthsObj).map(([month, count]) => ({
    month,
    count,
  }));

  if (monthsArr.length === 0) {
    container.html('<p class="text-gray-500 text-center w-full">Ay məlumatı tapılmadı.</p>');
    return;
  }

  monthsArr.forEach((m) => container.append(renderMonthCard(m)));

  $(".month-card").on("click", function () {
    selectedMonth = $(this).data("month");
    showSelectedValues();
    toggleInvoysModal();

    if (typeof window.setFolderFilter === "function") {
      window.setFolderFilter(selectedCompany?.sirket_id || "", Number(selectedYear), Number(selectedMonth));
    } else {
      window.dispatchEvent(
        new CustomEvent("invoiceFolderSelected", {
          detail: {
            companyId: selectedCompany?.sirket_id || "",
            year: Number(selectedYear),
            month: Number(selectedMonth),
          },
        })
      );
    }
  });
}

function renderMonthCard(data) {
  const month = data?.month ?? 0;
  const count = data?.count ?? 0;
  return `
    <div class="month-card px-8 py-6 w-full max-w-[224px] border-b-[.5px] border-stroke hover:bg-input-hover cursor-pointer" data-month='${month}'>
      <p class="text-[15px] font-medium text-messages">${monthNames[month]}</p>
      <p class="text-[11px] text-tertiary-text mt-1">${count} invoys</p>
    </div>
  `;
}

// DOM hazır olduqda
$(document).ready(function () {
  csrfToken = $('meta[name="csrf-token"]').attr("content");

  $("#backButton").on("click", function () {
    if (currentView === "years") {
      setView("companies");
    } else if (currentView === "months") {
      setView("years");
    }
  });

  $("#customSearchCompanies").on("input", function () {
    const query = ($(this).val() || "").toLowerCase();
    const filtered = (allCompanies || []).filter(
      (c) =>
        (c.companyName || "").toLowerCase().includes(query) ||
        (c.companyId || "").toLowerCase().includes(query)
    );
    renderFilteredCompanies(filtered);
    $("#modalTitle").text(`Şirkətlər (${filtered.length})`);
  });

  setView("companies");
});
