// Central Operations Navigation Module
// This module provides a single source of truth for navigation state and view switching

const OpsState = {
  module: null, // 'eqaime' | 'hesablasma'
  year: null,
  month: null,
  companyId: null,
};

// Initialize company ID from data attribute
function initializeOpsState() {
  const companyElement = document.querySelector("[data-company-id]");
  OpsState.companyId = companyElement?.dataset.companyId || null;
  console.log("OpsState initialized with companyId:", OpsState.companyId);
}

// Central view switcher - only one view visible at a time
function showOnly(visibleSelectors) {
  // Hide all sections with data-ops-section attribute
  document.querySelectorAll("[data-ops-section]").forEach((el) => {
    el.style.display = "none";
    el.classList.add("hidden");
  });

  // Show only the specified selectors
  visibleSelectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.display = "";
      el.classList.remove("hidden");
    } else {
      console.warn(`Element ${sel} not found`);
    }
  });

  console.log("Showing only:", visibleSelectors);
}

// Card click handlers
function openEqaime() {
  console.log("Opening E-qaimə");
  OpsState.module = "eqaime";
  OpsState.year = null;
  OpsState.month = null;
  renderEqaimeYears();
  showOnly(["#eqaime-years"]);
}

function openHesablasma() {
  console.log("Opening Hesablaşma");
  OpsState.module = "hesablasma";
  OpsState.year = null;
  OpsState.month = null;
  renderHesablasmaYears();
  showOnly(["#hesablasma-years"]);
}

// E-QAIME navigation functions
function renderEqaimeYears() {
  const currentYear = new Date().getFullYear();
  const yearsContainer = document.querySelector("#eqaime-years-list");
  if (!yearsContainer) {
    console.error("#eqaime-years-list not found");
    return;
  }

  yearsContainer.innerHTML = "";

  // Add years from current year + 1 down to 2020
  for (let year = currentYear + 1; year >= 2020; year--) {
    const yearRow = createEqaimeYearRow(
      year.toString(),
      () => selectEqaimeYear(year),
      year
    );
    yearsContainer.appendChild(yearRow);
  }

  // NEW: load year counts after rendering all year rows
  try {
    const root = document.querySelector("#eqaime-root");
    const companyId = root?.getAttribute("data-company-id");
    loadEQaimeYearCounts(companyId);
  } catch (e) {
    console.warn("Unable to load E-qaimə year counts:", e);
  }
}

function selectEqaimeYear(year) {
  console.log("Selected E-qaimə year:", year);
  OpsState.year = year;

  // Update eqaimeState if it exists
  if (window.eqaimeState) {
    window.eqaimeState.year = Number(year);
    window.eqaimeState.month = null;
    window.eqaimeState.page = 1;
  }

  renderEqaimeMonths(year);
  showOnly(["#eqaime-months"]);
}

function renderEqaimeMonths(year) {
  const monthsContainer = document.querySelector("#eqaime-months-list");
  if (!monthsContainer) {
    console.error("#eqaime-months-list not found");
    return;
  }

  monthsContainer.innerHTML = "";

  const months = [
    { value: 1, name: "Yanvar" },
    { value: 2, name: "Fevral" },
    { value: 3, name: "Mart" },
    { value: 4, name: "Aprel" },
    { value: 5, name: "May" },
    { value: 6, name: "İyun" },
    { value: 7, name: "İyul" },
    { value: 8, name: "Avqust" },
    { value: 9, name: "Sentyabr" },
    { value: 10, name: "Oktyabr" },
    { value: 11, name: "Noyabr" },
    { value: 12, name: "Dekabr" },
  ];

  months.forEach((month) => {
    const monthRow = createEqaimeMonthRow(
      month.name,
      () => selectEqaimeMonth(month.value),
      month.value
    );
    monthsContainer.appendChild(monthRow);
  });

  // Update current year display
  const currentYearEl = document.querySelector("#eqaime-current-year");
  if (currentYearEl) {
    currentYearEl.textContent = year;
  }

  // NEW: hydrate counts once the grid is present
  try {
    const root = document.querySelector("#eqaime-root");
    const companyId = root?.getAttribute("data-company-id");
    loadEQaimeMonthCounts(companyId, year);
  } catch (e) {
    console.warn("Unable to load E-qaimə month counts:", e);
  }
}

function selectEqaimeMonth(month) {
  console.log("Selected E-qaimə month:", month);
  OpsState.month = month;

  // Update eqaimeState if it exists
  if (window.eqaimeState) {
    window.eqaimeState.month = Number(month);
    window.eqaimeState.page = 1;
  }

  // Update breadcrumb display
  const yearEl = document.querySelector("#eqaime-table-year");
  const monthEl = document.querySelector("#eqaime-table-month");
  if (yearEl) yearEl.textContent = OpsState.year;
  if (monthEl) monthEl.textContent = getMonthName(month);

  // Fetch and render table data
  fetchAndRenderEqaimeTable();
  showOnly(["#eqaime-table"]);
}

function fetchAndRenderEqaimeTable() {
  // Use the existing E-qaimə data loading logic
  if (window.loadEqaimeData) {
    // The eqaimeState should already be updated by selectEqaimeMonth
    // Just call the load function
    window.loadEqaimeData();
  } else {
    console.error("loadEqaimeData function not found");
  }
}

// HESABLASMA navigation functions
function renderHesablasmaYears() {
  const currentYear = new Date().getFullYear();
  const yearsContainer = document.querySelector("#hesablasma-years-list");
  if (!yearsContainer) {
    console.error("#hesablasma-years-list not found");
    return;
  }

  yearsContainer.innerHTML = "";

  // Add years from current year + 1 down to 2020
  for (let year = currentYear + 1; year >= 2020; year--) {
    const yearRow = createHesablasmaYearRow(
      year.toString(),
      () => selectHesablasmaYear(year),
      year
    );
    yearsContainer.appendChild(yearRow);
  }

  // NEW: load year counts after rendering all year rows
  try {
    const root = document.querySelector("#hesablasma-root");
    const companyId = root?.getAttribute("data-company-id");
    loadHesablasmaYearCounts(companyId);
  } catch (e) {
    console.warn("Unable to load Hesablaşma year counts:", e);
  }
}

function selectHesablasmaYear(year) {
  console.log("Selected Hesablaşma year:", year);
  OpsState.year = year;
  renderHesablasmaMonths(year);
  showOnly(["#hesablasma-months"]);
}

function renderHesablasmaMonths(year) {
  const monthsContainer = document.querySelector("#hesablasma-months-list");
  if (!monthsContainer) {
    console.error("#hesablasma-months-list not found");
    return;
  }

  monthsContainer.innerHTML = "";

  const months = [
    { value: 1, name: "Yanvar" },
    { value: 2, name: "Fevral" },
    { value: 3, name: "Mart" },
    { value: 4, name: "Aprel" },
    { value: 5, name: "May" },
    { value: 6, name: "İyun" },
    { value: 7, name: "İyul" },
    { value: 8, name: "Avqust" },
    { value: 9, name: "Sentyabr" },
    { value: 10, name: "Oktyabr" },
    { value: 11, name: "Noyabr" },
    { value: 12, name: "Dekabr" },
  ];

  months.forEach((month) => {
    const monthRow = createHesablasmaMonthRow(
      month.name,
      () => selectHesablasmaMonth(month.value),
      month.value
    );
    monthsContainer.appendChild(monthRow);
  });

  // Update current year display
  const currentYearEl = document.querySelector("#hesablasma-current-year");
  if (currentYearEl) {
    currentYearEl.textContent = year;
  }

  // NEW: kick off count load once DOM is ready
  try {
    const root = document.querySelector("#hesablasma-root");
    const companyId = root?.getAttribute("data-company-id");
    loadHesablasmaMonthCounts(companyId, year);
  } catch (e) {
    console.warn("Unable to load Hesablaşma month counts:", e);
  }
}

function selectHesablasmaMonth(month) {
  console.log("Selected Hesablaşma month:", month);
  OpsState.month = month;

  // Update breadcrumb display
  const yearEl = document.querySelector("#hesablasma-table-year");
  const monthEl = document.querySelector("#hesablasma-table-month");
  if (yearEl) yearEl.textContent = OpsState.year;
  if (monthEl) monthEl.textContent = getMonthName(month);

  // Fetch and render table data
  fetchAndRenderHesablasmaTable();
  showOnly(["#hesablasma-table"]);
}

function fetchAndRenderHesablasmaTable() {
  // Use the existing Hesablaşma data loading logic
  if (window.loadHesablasmaData) {
    // Update HS state with the selected year and month from navigation
    if (window.HS) {
      window.HS.year = parseInt(OpsState.year);
      window.HS.month = parseInt(OpsState.month);
      window.HS.page = 1;
    }
    window.loadHesablasmaData();
  } else {
    console.error("loadHesablasmaData function not found");
  }
}

// Helper function to create folder cards
function createFolderCard(title, onClick, dataAttributes = {}) {
  const card = document.createElement("div");
  card.className =
    "flex flex-col items-center justify-center px-6 py-8 gap-2 w-[200px] rounded-lg bg-container-2 dark:bg-container-2-dark cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
  card.innerHTML = `
    <div class="iconex iconex-folder w-8 h-8 text-primary dark:text-primary-dark"></div>
    <div class="text-[15px] text-messages dark:text-primary-text-color-dark font-medium text-center">${title}</div>
  `;

  // Add data attributes
  Object.entries(dataAttributes).forEach(([key, value]) => {
    card.setAttribute(`data-${key}`, value);
  });

  card.addEventListener("click", onClick);
  return card;
}

// Helper function to create Hesablaşma year list rows
function createHesablasmaYearRow(title, onClick, year, count = 0) {
  const row = document.createElement("div");
  row.className =
    "flex items-center justify-between py-3 px-4 border-b border-stroke dark:border-[#FFFFFF1A] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
  row.setAttribute("data-year", year);
  row.innerHTML = `
    <div class="text-[15px] text-messages dark:text-primary-text-color-dark font-bold">${title}</div>
    <div class="year-count text-[14px] text-messages dark:text-primary-text-color-dark opacity-60">${count} invoys</div>
  `;

  row.addEventListener("click", onClick);
  return row;
}

// Helper function to create E-qaimə year list rows
function createEqaimeYearRow(title, onClick, year, count = 0) {
  const row = document.createElement("div");
  row.className =
    "flex items-center justify-between py-3 px-4 border-b border-stroke dark:border-[#FFFFFF1A] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
  row.setAttribute("data-year", year);
  row.innerHTML = `
    <div class="text-[15px] text-messages dark:text-primary-text-color-dark font-bold">${title}</div>
    <div class="year-count text-[14px] text-messages dark:text-primary-text-color-dark opacity-60">${count} invoys</div>
  `;

  row.addEventListener("click", onClick);
  return row;
}

// Helper function to create Hesablaşma month list rows
function createHesablasmaMonthRow(title, onClick, monthNumber, count = 0) {
  const row = document.createElement("div");
  row.className =
    "hesablasma-month-card flex items-center justify-between py-3 px-4 border-b border-stroke dark:border-[#FFFFFF1A] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
  row.setAttribute("data-month", monthNumber);
  row.innerHTML = `
    <div class="text-[15px] text-messages dark:text-primary-text-color-dark">${title}</div>
    <div class="month-count text-[14px] text-messages dark:text-primary-text-color-dark opacity-60">${count} invoys</div>
  `;

  row.addEventListener("click", onClick);
  return row;
}

// Helper function to create E-qaimə month list rows (matching Hesablaşma design)
function createEqaimeMonthRow(title, onClick, monthNumber, count = 0) {
  const row = document.createElement("div");
  row.className =
    "eqaime-month-card flex items-center justify-between py-3 px-4 border-b border-stroke dark:border-[#FFFFFF1A] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
  row.setAttribute("data-month", monthNumber);
  row.innerHTML = `
    <div class="text-[15px] text-messages dark:text-primary-text-color-dark">${title}</div>
    <div class="month-count text-[14px] text-messages dark:text-primary-text-color-dark opacity-60">${count} invoys</div>
  `;

  row.addEventListener("click", onClick);
  return row;
}

// Helper function to get month name
function getMonthName(monthNumber) {
  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "İyun",
    "İyul",
    "Avqust",
    "Sentyabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
  ];
  return months[monthNumber - 1] || monthNumber;
}

// === NEW: fetch & paint month counts ===
async function loadHesablasmaMonthCounts(companyId, year) {
  try {
    if (!companyId || !year) return;

    const url = `/emeliyyatlar/sirket/hesablasma/api/hesablasma/month-counts/${companyId}/${year}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`Month counts request failed: ${res.status}`);
    const json = await res.json();
    if (!json?.ok || !Array.isArray(json.months)) return;

    const map = {};
    json.months.forEach((m) => {
      map[m.month] = m.count;
    });

    document
      .querySelectorAll("#hesablasma-months .hesablasma-month-card")
      .forEach((card) => {
        const m = Number(card.getAttribute("data-month"));
        const count = map[m] || 0;
        const el = card.querySelector(".month-count");
        if (el) el.textContent = `${count} invoys`;
      });
  } catch (e) {
    console.warn("loadHesablasmaMonthCounts failed:", e);
  }
}

// === NEW: fetch & paint month counts for E-qaimə ===
async function loadEQaimeMonthCounts(companyId, year) {
  try {
    if (!companyId || !year) return;

    const url = `/emeliyyatlar/sirket/eqaime/api/eqaime/month-counts/${companyId}/${year}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`E-qaimə month counts failed: ${res.status}`);

    const json = await res.json();
    if (!json?.ok || !Array.isArray(json.months)) return;

    const map = {};
    json.months.forEach((m) => {
      map[m.month] = m.count;
    });

    document
      .querySelectorAll("#eqaime-months-list .eqaime-month-card")
      .forEach((card) => {
        const m = Number(card.getAttribute("data-month"));
        const count = map[m] || 0;
        const el = card.querySelector(".month-count");
        if (el) el.textContent = `${count} invoys`;
      });
  } catch (e) {
    console.warn("loadEQaimeMonthCounts failed:", e);
  }
}

// === NEW: fetch & paint year counts for Hesablaşma ===
async function loadHesablasmaYearCounts(companyId) {
  try {
    if (!companyId) return;
    const resp = await fetch(
      `/emeliyyatlar/sirket/hesablasma/api/hesablasma/year-counts/${companyId}`,
      {
        credentials: "include",
      }
    );
    const json = await resp.json();
    if (!json?.ok || !Array.isArray(json.items)) return;

    const byYear = new Map(
      json.items.map((i) => [String(i.year), Number(i.count || 0)])
    );

    // Update each year row
    document
      .querySelectorAll("#hesablasma-years-list [data-year]")
      .forEach((node) => {
        const yr = node.getAttribute("data-year");
        const cnt = byYear.get(yr) || 0;

        // find the right target inside the row
        const counter = node.querySelector(".year-count");
        if (counter) counter.textContent = `${cnt} invoys`;
      });
  } catch (e) {
    console.warn("loadHesablasmaYearCounts failed:", e);
  }
}

// === NEW: fetch & paint year counts for E-qaimə ===
async function loadEQaimeYearCounts(companyId) {
  try {
    if (!companyId) return;
    const resp = await fetch(
      `/emeliyyatlar/sirket/eqaime/api/eqaime/year-counts/${companyId}`,
      {
        credentials: "include",
      }
    );
    const json = await resp.json();
    if (!json?.ok || !Array.isArray(json.items)) return;

    const byYear = new Map(
      json.items.map((i) => [String(i.year), Number(i.count || 0)])
    );

    // Update each year row
    document
      .querySelectorAll("#eqaime-years-list [data-year]")
      .forEach((node) => {
        const yr = node.getAttribute("data-year");
        const cnt = byYear.get(yr) || 0;

        // find the right target inside the row
        const counter = node.querySelector(".year-count");
        if (counter) counter.textContent = `${cnt} invoys`;
      });
  } catch (e) {
    console.warn("loadEQaimeYearCounts failed:", e);
  }
}

// Back button handlers
function setupBackButtons() {
  // E-QAIME back buttons
  $("#eqaime-back-from-months").on("click", () => {
    OpsState.month = null;
    showOnly(["#eqaime-years"]);
  });

  $("#eqaime-back-from-table").on("click", () => {
    showOnly(["#eqaime-months"]);
  });

  $("#eqaime-back-from-years").on("click", () => {
    showOnly(["#ops-cards"]);
  });

  // HESABLASMA back buttons
  $("#hesablasma-back-from-months").on("click", () => {
    OpsState.month = null;
    showOnly(["#hesablasma-years"]);
  });

  $("#hesablasma-back-from-table").on("click", () => {
    showOnly(["#hesablasma-months"]);
  });

  $("#hesablasma-back-from-years").on("click", () => {
    showOnly(["#ops-cards"]);
  });
}

// Initialize the navigation system
document.addEventListener("DOMContentLoaded", () => {
  initializeOpsState();
  setupBackButtons();

  // Show only the cards on initial load
  showOnly(["#ops-cards"]);

  // Make functions globally available
  window.openEqaime = openEqaime;
  window.openHesablasma = openHesablasma;
  window.OpsState = OpsState;
  window.showOnly = showOnly;

  console.log("Ops navigation system initialized");
});
