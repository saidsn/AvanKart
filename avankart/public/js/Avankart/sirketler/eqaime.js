// E-Qaimə Tab Implementation
// This file handles all E-Qaimə functionality including AJAX requests, table rendering, search, filters, and navigation

$(document).ready(function () {
  // Global variables
  let currentFilters = {};
  let currentPage = 1;
  let pageSize = 10;
  let totalPages = 1;
  let isLoading = false;
  let searchTimeout = null;

  // Get company ID from the root element
  const companyId = $("#eqaime-root").data("company-id");

  // E-Qaimə state management
  const eqaimeState =
    window.eqaimeState ||
    (window.eqaimeState = {
      companyId:
        document.querySelector("[data-company-id]")?.dataset.companyId ||
        companyId ||
        null,
      year: null, // number, e.g. 2024
      month: null, // 1..12
      search: "",
      status: [],
      min: null,
      max: null,
      page: 1,
      limit: 10,
    });

  // Initialize the E-Qaimə functionality only if the tab is visible
  if ($("#eqaime-root").length > 0) {
    initializeEqaime();
  }

  function initializeEqaime() {
    // Set up event listeners
    setupEventListeners();

    // DO NOT auto-load data on page load
    // Data will be loaded only when user drills down to table level

    // Populate year dropdown
    populateYearDropdown();
  }

  function setupEventListeners() {
    // Search functionality with debounce
    $("#eqaime-search").on("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        eqaimeState.search = $(this).val().trim();
        eqaimeState.page = 1;
        currentPage = 1;
        loadEqaimeData();
      }, 300);
    });

    // Refresh button
    $("#eqaime-refresh").on("click", function () {
      eqaimeState.page = 1;
      currentPage = 1;
      loadEqaimeData();
    });

    // Filter modal open/close
    $("#ops-filter-open").on("click", function () {
      openEqaimeFilterModal();
    });

    // Filter apply button
    $("#eqaime-filter-apply").on("click", function () {
      applyFilters();
    });

    // Filter clear button
    $("#eqaime-filter-clear").on("click", function () {
      clearFilters();
    });

    // Year filter change
    $("#eqaime-year-filter").on("change", function () {
      // Auto-apply when year changes
      applyFilters();
    });

    // Month filter change
    $("#eqaime-month-filter").on("change", function () {
      // Auto-apply when month changes
      applyFilters();
    });

    // Status filter changes
    $('input[name="eqaime_status"]').on("change", function () {
      // Auto-apply when status changes
      applyFilters();
    });

    // Pagination handlers
    $(document).on("click", ".eqaime-pagination-btn", function () {
      const page = parseInt($(this).data("page"));
      if (page && page !== currentPage) {
        eqaimeState.page = page;
        currentPage = page;
        loadEqaimeData();
      }
    });

    // Page input handler
    $(".go-eQaimeMain-button").on("click", function (e) {
      e.preventDefault();
      const pageInput = $(".eQaimeMain-page-input");
      const pageNumber = parseInt(pageInput.val());

      if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
        eqaimeState.page = pageNumber;
        currentPage = pageNumber;
        loadEqaimeData();
        pageInput.val("");
      } else {
        alert("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
      }
    });

    // Table row click handler
    $(document).on("click", "#eqaime-table-content tbody tr", function () {
      const qaimeId = $(this).data("qaime-id");
      if (qaimeId) {
        // Navigate to details page
        window.location.href = `/emeliyyatlar/sirket/eqaime/${qaimeId}/view`;
      }
    });
  }

  function initializeAmountSlider() {
    if ($("#eqaime-amount-slider").hasClass("ui-slider")) {
      $("#eqaime-amount-slider").slider("destroy");
    }

    $("#eqaime-amount-slider").slider({
      range: true,
      min: 0,
      max: 100000,
      values: [0, 100000],
      step: 100,
      slide: function (event, ui) {
        $("#eqaime-min-amount-value").text(formatCurrency(ui.values[0]));
        $("#eqaime-max-amount-value").text(formatCurrency(ui.values[1]));
      },
    });

    $("#eqaime-min-amount-value").text(formatCurrency(0));
    $("#eqaime-max-amount-value").text(formatCurrency(100000));
  }

  function populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    const yearSelect = $("#eqaime-year-filter");

    // Add years from 2020 to current year + 1
    for (let year = 2020; year <= currentYear + 1; year++) {
      yearSelect.append(`<option value="${year}">${year}</option>`);
    }
  }

  function buildEqaimePayload(base = {}) {
    const payload = {
      ...base, // current fields (search/status/min/max/page/limit)
      sirket_id: eqaimeState.companyId || base.sirket_id,
    };
    if (eqaimeState.year) payload.year = Number(eqaimeState.year);
    if (eqaimeState.month) payload.month = Number(eqaimeState.month);
    return payload;
  }

  function clearEqaimeUI() {
    document
      .querySelector("#eqaime-table tbody, #eqaime-tbody")
      ?.replaceChildren();
    const sum = document.querySelector("#eqaime-summary-total, #eqaime-total");
    if (sum) sum.textContent = "0.00 ₼";
  }

  function loadEqaimeData() {
    if (isLoading) return;

    if (!eqaimeState.companyId) {
      console.error("Company ID not found");
      showErrorMessage("Şirkət məlumatları tapılmadı");
      return;
    }

    isLoading = true;
    showLoadingState();

    // Clear UI before loading new data
    clearEqaimeUI();

    const searchTerm = $("#eqaime-search").val().trim();

    const body = buildEqaimePayload({
      page: eqaimeState.page,
      limit: eqaimeState.limit,
      search: (eqaimeState.search || "").trim(),
      status: eqaimeState.status,
      min: eqaimeState.min,
      max: eqaimeState.max,
    });
    console.log("[EQAIME] payload", body); // leave for verification

    $.ajax({
      url: "/emeliyyatlar/sirket/eqaime",
      type: "POST",
      contentType: "application/json",
      headers: {
        "CSRF-Token": window.CSRF_TOKEN,
      },
      data: JSON.stringify(body),
      success: function (response) {
        console.log("E-Qaimə data loaded successfully:", response);
        renderEqaimeTable(response.data);
        updatePagination(response.page, response.pageSize, response.total);

        // Update summary total
        setEqaimeTotal(response?.summary?.total ?? 0);

        hideLoadingState();
        isLoading = false;
      },
      error: function (xhr, status, error) {
        console.error("Error loading E-Qaimə data:", error, xhr.responseText);
        showErrorMessage(
          "Məlumatları yükləmək mümkün olmadı. Xahiş edirik yenidən cəhd edin."
        );
        hideLoadingState();
        isLoading = false;
      },
    });
  }

  function renderEqaimeTable(data) {
    const tbody = $("#eqaime-table-content tbody");
    tbody.empty();

    if (!data || data.length === 0) {
      tbody.append(`
                <tr>
                    <td colspan="4" class="text-center py-8 text-messages dark:text-primary-text-color-dark" style="padding: 0.75rem 1rem; vertical-align: middle;">
                        Heç bir qaimə tapılmadı
                    </td>
                </tr>
            `);
      return;
    }

    data.forEach(function (item) {
      const row = createEqaimeRow(item);
      tbody.append(row);
    });

    // Add hover effects to table rows
    $("#eqaime-table-content tbody tr").each(function () {
      $(this)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          const isDark = $("html").hasClass("dark");
          $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });
    });
  }

  function createEqaimeRow(item) {
    const statusColor = getStatusColor(item.raw_status);
    const statusText = item.status;

    return `
            <tr class="eqaime-table-row cursor-pointer" data-qaime-id="${item.id}">
                <td class="border-b border-stroke dark:border-[#FFFFFF1A]" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${item.qaime_id}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A] text-right" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal" style="font-variant-numeric: tabular-nums;">${formatCurrency(item.amount)}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A]" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${item.period.label}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A]" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <div class="flex-shrink-0 flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full whitespace-nowrap overflow-hidden">
                        <span class="w-[6px] h-[6px] rounded-full ${statusColor} shrink-0 mr-2"></span>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${statusText}</span>
                    </div>
                </td>
            </tr>
        `;
  }

  function getStatusColor(status) {
    switch (status) {
      case "active":
        return "bg-[#4FC3F7]"; // Blue for completed
      case "passive":
        return "bg-[#FFCA28]"; // Yellow for waiting
      case "canceled":
        return "bg-[#EF5350]"; // Red for canceled
      default:
        return "bg-[#BDBDBD]"; // Gray for unknown
    }
  }

  function updatePagination(page, pageSize, total) {
    currentPage = page;
    totalPages = Math.ceil(total / pageSize);

    // Update page count display
    $("#eQaimeMainPageCount").text(`${page} / ${totalPages}`);

    // Update pagination buttons
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    const paginationContainer = $("#ops-pager");
    paginationContainer.empty();

    if (totalPages <= 1) return;

    // Previous button
    const prevDisabled =
      currentPage === 1
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF] cursor-pointer";
    paginationContainer.append(`
             <div class="flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ${prevDisabled}" 
                  onclick="changeEqaimePage(${Math.max(1, currentPage - 1)})">
                 <div class="icon stratis-chevron-left !h-[12px] !w-[7px]"></div>
             </div>
         `);

    // Page buttons
    let pageButtons = '<div class="flex gap-2">';
    for (let i = 1; i <= totalPages; i++) {
      const isActive =
        i === currentPage
          ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
          : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark";
      pageButtons += `
                 <button class="cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${isActive}" 
                         onclick="changeEqaimePage(${i})">${i}</button>
             `;
    }
    pageButtons += "</div>";
    paginationContainer.append(pageButtons);

    // Next button
    const nextDisabled =
      currentPage === totalPages
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF] cursor-pointer";
    paginationContainer.append(`
             <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${nextDisabled}" 
                  onclick="changeEqaimePage(${Math.min(totalPages, currentPage + 1)})">
                 <div class="icon stratis-chevron-right !h-[12px] !w-[7px]"></div>
             </div>
         `);
  }

  function applyFilters() {
    currentFilters = {};

    // Year filter
    const year = $("#eqaime-year-filter").val();
    if (year) {
      currentFilters.year = parseInt(year);
      eqaimeState.year = parseInt(year);
    }

    // Month filter
    const month = $("#eqaime-month-filter").val();
    if (month) {
      currentFilters.month = parseInt(month);
      eqaimeState.month = parseInt(month);
    }

    // Status filter
    const statuses = [];
    $('input[name="eqaime_status"]:checked').each(function () {
      statuses.push($(this).val());
    });
    if (statuses.length > 0) {
      currentFilters.status = statuses;
      eqaimeState.status = statuses;
    }

    // Amount range filter
    if ($("#eqaime-amount-slider").hasClass("ui-slider")) {
      const minAmount = $("#eqaime-amount-slider").slider("values", 0);
      const maxAmount = $("#eqaime-amount-slider").slider("values", 1);

      if (minAmount > 0) {
        currentFilters.min = minAmount;
        eqaimeState.min = minAmount;
      }
      if (maxAmount < 100000) {
        currentFilters.max = maxAmount;
        eqaimeState.max = maxAmount;
      }
    }

    // Reset to first page and reload data
    eqaimeState.page = 1;
    currentPage = 1;
    loadEqaimeData();

    // Close modal
    closeEqaimeFilterModal();
  }

  function clearFilters() {
    // Reset form
    $("#eqaime-filter-form")[0].reset();

    // Reset amount slider
    if ($("#eqaime-amount-slider").hasClass("ui-slider")) {
      $("#eqaime-amount-slider").slider("values", [0, 100000]);
      $("#eqaime-min-amount-value").text(formatCurrency(0));
      $("#eqaime-max-amount-value").text(formatCurrency(100000));
    }

    // Clear filters
    currentFilters = {};
    eqaimeState.year = null;
    eqaimeState.month = null;
    eqaimeState.status = [];
    eqaimeState.min = null;
    eqaimeState.max = null;

    // Reset to first page and reload data
    eqaimeState.page = 1;
    currentPage = 1;
    loadEqaimeData();

    // Close modal
    closeEqaimeFilterModal();
  }

  function showLoadingState() {
    const tbody = $("#eqaime-table-content tbody");
    tbody.html(`
            <tr>
                <td colspan="4" class="text-center py-8 text-messages dark:text-primary-text-color-dark" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <div class="flex items-center justify-center">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span class="ml-2">Yüklənir...</span>
                    </div>
                </td>
            </tr>
        `);
  }

  function hideLoadingState() {
    // Loading state will be replaced by actual data
  }

  function showErrorMessage(message) {
    const tbody = $("#eqaime-table-content tbody");
    tbody.html(`
            <tr>
                <td colspan="4" class="text-center py-8 text-red-500 dark:text-red-400" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    ${message}
                </td>
            </tr>
        `);
  }

  function formatCurrency(amount) {
    return (
      new Intl.NumberFormat("az-AZ", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + " ₼"
    );
  }

  function setEqaimeTotal(val) {
    console.log("Setting E-qaimə total to:", val);
    const el = document.querySelector("#eqaime-summary-total");
    if (el) {
      const formattedValue = formatCurrency(val);
      console.log("Formatted total:", formattedValue);
      el.textContent = formattedValue;
      el.dataset.value = String(Number(val) || 0);
      console.log("E-qaimə total element updated successfully");
    } else {
      console.warn("⚠️ #eqaime-summary-total not found");
    }
  }

  // Global functions for external access
  window.openEqaimeFilterModal = function () {
    $("#eqaime-filter-modal").removeClass("hidden");
    // Initialize slider when modal opens
    initializeAmountSlider();
  };

  window.closeEqaimeFilterModal = function () {
    $("#eqaime-filter-modal").addClass("hidden");
  };

  // Close modal when clicking outside
  $(document).on("click", "#eqaime-filter-modal", function (e) {
    if (e.target === this) {
      closeEqaimeFilterModal();
    }
  });

  window.changeEqaimePage = function (page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      eqaimeState.page = page;
      currentPage = page;
      loadEqaimeData();
    }
  };

  // Get month name helper
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

  // Make functions globally accessible for the navigation system
  window.loadEqaimeData = loadEqaimeData;
  window.currentFilters = currentFilters;
});

// Add delegated event listeners for year/month selection
document.addEventListener("click", (e) => {
  const y = e.target.closest("[data-year]");
  if (y) {
    eqaimeState.year = Number(y.dataset.year) || null;
    eqaimeState.month = null;
    eqaimeState.page = 1;
    // only UI switching, don't load table
    const years = document.getElementById("eqaime-years");
    const months = document.getElementById("eqaime-months");
    const area = document.getElementById("eqaime-table");
    years && years.classList.remove("hidden");
    months && months.classList.remove("hidden");
    area && area.classList.add("hidden");
    return;
  }
  const m0 = e.target.closest("[data-month-idx]");
  const m1 = e.target.closest("[data-month]");
  if (m0 || m1) {
    const month = m0
      ? (Number(m0.dataset.monthIdx) || 0) + 1
      : Number(m1.dataset.month);
    eqaimeState.month = month;
    eqaimeState.page = 1;
    // show table and LOAD
    document.getElementById("eqaime-years")?.classList.add("hidden");
    document.getElementById("eqaime-months")?.classList.add("hidden");
    document.getElementById("eqaime-table")?.classList.remove("hidden");
    if (typeof window.loadEqaimeData === "function") window.loadEqaimeData();
  }
});
