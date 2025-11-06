// Hesablaşma Tab Implementation
// This file handles all Hesablaşma functionality including AJAX requests, table rendering, search, filters, and navigation

// Robust helper to resolve the company id
function resolveCompanyId() {
  // 1) Try Hesablaşma root
  const root = document.getElementById("hesablasma-root");
  if (root?.dataset?.companyId) return root.dataset.companyId.trim();

  // 2) Try E-qaime root (sometimes shared page)
  const eqRoot = document.getElementById("eqaime-root");
  if (eqRoot?.dataset?.companyId) return eqRoot.dataset.companyId.trim();

  // 3) Try meta tag
  const meta = document.querySelector('meta[name="company-id"]');
  if (meta?.content) return meta.content.trim();

  // 4) Optional global (if you already set it somewhere)
  if (window.__COMPANY_ID__) return String(window.__COMPANY_ID__).trim();

  return "";
}

$(document).ready(function () {
  // Global variables
  let currentFilters = {};
  let currentPage = 1;
  let pageSize = 10;
  let totalPages = 1;
  let isLoading = false;
  let searchTimeout = null;
  let _lastSummaryTotal = 0; // Store last known total for tab show logic

  // Initialize state with company ID - renamed to HS for consistency with requirements
  const HS = {
    companyId: resolveCompanyId(),
    page: 1,
    limit: 10,
    search: "",
    year: null,
    month: null,
    status: [],
    min: null,
    max: null,
  };

  // Initialize the Hesablaşma functionality only if the tab is visible
  if ($("#hesablasma-root").length > 0) {
    initializeHesablasma();
  }

  function initializeHesablasma() {
    // Verify required elements exist
    verifyRequiredElements();

    // Set up event listeners
    setupEventListeners();

    // DO NOT auto-load data on page load
    // Data will be loaded only when user drills down to table level

    // Populate year dropdown
    populateYearDropdown();

    // Set up MutationObserver for tab visibility
    setupMutationObserver();
  }

  function verifyRequiredElements() {
    const totalEl = document.querySelector("#hesablasma-total");
    const pageEl = document.querySelector("#hesablasma-page");
    const rootEl = document.querySelector("#hesablasma-root");

    console.log("Element verification:");
    console.log("- #hesablasma-total found:", !!totalEl);
    console.log("- #hesablasma-page found:", !!pageEl);
    console.log("- #hesablasma-root found:", !!rootEl);

    if (!totalEl) {
      console.error("❌ #hesablasma-total element not found in DOM");
    }
    if (!pageEl) {
      console.error("❌ #hesablasma-page element not found in DOM");
    }
    if (!rootEl) {
      console.error("❌ #hesablasma-root element not found in DOM");
    }
  }

  function setupEventListeners() {
    // Search functionality with debounce
    $("#hesablasma-search").on("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        HS.page = 1;
        currentPage = 1;
        loadHesablasmaData();
      }, 300);
    });

    // Refresh button
    $("#hesablasma-refresh").on("click", function () {
      HS.page = 1;
      currentPage = 1;
      loadHesablasmaData();
    });

    // Filter modal open/close
    $("#hesablasma-filter-open").on("click", function () {
      openHesablasmaFilterModal();
    });

    // Filter apply button
    $("#hesablasma-filter-apply").on("click", function () {
      applyFilters();
    });

    // Filter clear button
    $("#hesablasma-filter-clear").on("click", function () {
      clearFilters();
    });

    // Year filter change
    $("#hesablasma-year-filter").on("change", function () {
      // Auto-apply when year changes
      applyFilters();
    });

    // Month filter change
    $("#hesablasma-month-filter").on("change", function () {
      // Auto-apply when month changes
      applyFilters();
    });

    // Status filter changes
    $('input[name="status"]').on("change", function () {
      // Auto-apply when status changes
      applyFilters();
    });

    // Pagination handlers
    $(document).on("click", ".hesablasma-pagination-btn", function () {
      const page = parseInt($(this).data("page"));
      if (page && page !== currentPage) {
        HS.page = page;
        currentPage = page;
        loadHesablasmaData();
      }
    });

    // Page input handler
    $(".go-hesablasma-button").on("click", function (e) {
      e.preventDefault();
      const pageInput = $(".hesablasma-page-input");
      const pageNumber = parseInt(pageInput.val());

      if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
        HS.page = pageNumber;
        currentPage = pageNumber;
        loadHesablasmaData();
        pageInput.val("");
      } else {
        alert("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
      }
    });

    // Table row click handler
    $(document).on("click", "#hesablasma-table-content tbody tr", function () {
      const hesablasmaId = $(this).data("hesablasma-id");
      if (hesablasmaId) {
        // Navigate to details page if needed
        console.log("Navigate to hesablasma details:", hesablasmaId);
      }
    });

    // Year button click handlers (for navigation system)
    $(document).on("click", ".hs-year", function () {
      const year = parseInt($(this).data("year"));
      if (year) {
        HS.year = year;
        HS.month = null; // Reset month when year changes
        HS.page = 1;
        console.log("Selected year:", year);
        // Only show months UI, don't load data yet
      }
    });

    // Month button click handlers (for navigation system)
    $(document).on("click", ".hs-month", function () {
      const month = parseInt($(this).data("month"));
      if (month && HS.year) {
        HS.month = month;
        HS.page = 1;
        console.log("Selected month:", month, "for year:", HS.year);
        loadHesablasmaData();
      }
    });
  }

  function populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    const yearSelect = $("#hesablasma-year-filter");

    // Add years from 2020 to current year + 1
    for (let year = 2020; year <= currentYear + 1; year++) {
      yearSelect.append(`<option value="${year}">${year}</option>`);
    }
  }

  function ensureCompanyIdOrToast() {
    if (!HS.companyId) {
      console.error("Company ID not found");
      // optionally show UI toast if you have one
      return false;
    }
    return true;
  }

  function loadHesablasmaData() {
    if (isLoading) return;

    if (!ensureCompanyIdOrToast()) {
      showErrorMessage("Şirkət məlumatları tapılmadı");
      return;
    }

    isLoading = true;
    showLoadingState();

    const searchTerm = $("#hesablasma-search").val().trim();
    HS.search = searchTerm;

    const payload = {
      sirket_id: HS.companyId,
      page: HS.page,
      limit: HS.limit,
      search: HS.search || "",
      status: HS.status || [],
      min: HS.min ?? null,
      max: HS.max ?? null,
      year: Number.isFinite(HS.year) ? HS.year : null,
      month: Number.isFinite(HS.month) ? HS.month : null,
    };

    // Debug logging as requested
    console.log("[HESABLASMA PAYLOAD]", payload);

    $.ajax({
      url: "/emeliyyatlar/sirket/hesablasma",
      type: "POST",
      contentType: "application/json",
      headers: {
        "CSRF-Token": window.CSRF_TOKEN,
      },
      data: JSON.stringify(payload),
      success: function (response) {
        console.log("Hesablaşma data loaded successfully:", response);
        console.log("Summary received:", response.summary);
        console.log("summary.total =", response?.summary?.total);

        renderHesablasmaTable(response.data);
        updatePagination(response.page, response.pageSize, response.total);

        // Update summary and page info using new helpers
        setHesablasmaTotal(response?.summary?.total ?? 0);
        setHesablasmaPageInfo(
          response?.page ?? 1,
          Math.max(
            1,
            Math.ceil((response?.total ?? 0) / (response?.pageSize ?? 10))
          )
        );

        hideLoadingState();
        isLoading = false;
      },
      error: function (xhr, status, error) {
        console.error(
          "Error loading Hesablaşma data:",
          error,
          xhr.responseText
        );
        showErrorMessage(
          "Məlumatları yükləmək mümkün olmadı. Xahiş edirik yenidən cəhd edin."
        );
        hideLoadingState();
        isLoading = false;
      },
    });
  }

  function renderHesablasmaTable(data) {
    const tbody = $("#hesablasma-table-content tbody");
    tbody.empty();

    if (!data || data.length === 0) {
      tbody.append(`
                <tr>
                    <td colspan="6" class="text-center py-8 text-messages dark:text-primary-text-color-dark" style="padding: 0.75rem 1rem; vertical-align: middle;">
                        Heç bir əməliyyat tapılmadı
                    </td>
                </tr>
            `);
      return;
    }

    data.forEach(function (item) {
      const row = createHesablasmaRow(item);
      tbody.append(row);
    });

    // Add hover effects to table rows
    $("#hesablasma-table-content tbody tr").each(function () {
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

  function createHesablasmaRow(item) {
    const statusInfo = mapStatusLabel(item.raw_status);
    const createdDate = formatDate(item.created_at);

    return `
            <tr class="hesablasma-table-row cursor-pointer" data-hesablasma-id="${item.id}">
                <td class="border-b border-stroke dark:border-[#FFFFFF1A]" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${item.doc_no || "-"}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A] text-right" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal" style="font-variant-numeric: tabular-nums;">${formatCurrency(item.amount)}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A] text-right" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal" style="font-variant-numeric: tabular-nums;">${formatCurrency(item.commission)}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A] text-right" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal" style="font-variant-numeric: tabular-nums;">${formatCurrency(item.total)}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A]" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal whitespace-nowrap">${createdDate}</span>
                </td>
                <td class="border-b border-stroke dark:border-[#FFFFFF1A]" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    <div class="flex-shrink-0 flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full whitespace-nowrap overflow-hidden">
                        <span class="w-[6px] h-[6px] rounded-full ${statusInfo.cls} shrink-0 mr-2"></span>
                        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${statusInfo.text}</span>
                    </div>
                </td>
            </tr>
        `;
  }

  function mapStatusLabel(raw) {
    if (raw === "active") return { text: "Təsdiqlənib", cls: "badge--blue" };
    if (raw === "baxildi") return { text: "Baxılıb", cls: "badge--gray" };
    if (raw === "canceled") return { text: "Ləğv edilib", cls: "badge--red" };
    return { text: raw || "-", cls: "badge--gray" };
  }

  function updatePagination(page, pageSize, total) {
    currentPage = page;
    totalPages = Math.ceil(total / pageSize);

    // Update pagination buttons
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    const paginationContainer = $("#hesablasma-pagination");
    paginationContainer.empty();

    if (totalPages <= 1) return;

    // Previous button
    const prevDisabled =
      currentPage === 1
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF] cursor-pointer";
    paginationContainer.append(`
             <div class="flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ${prevDisabled}" 
                  onclick="changeHesablasmaPage(${Math.max(1, currentPage - 1)})">
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
                         onclick="changeHesablasmaPage(${i})">${i}</button>
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
                  onclick="changeHesablasmaPage(${Math.min(totalPages, currentPage + 1)})">
                 <div class="icon stratis-chevron-right !h-[12px] !w-[7px]"></div>
             </div>
         `);
  }

  function applyFilters() {
    currentFilters = {};

    // Year filter
    const year = $("#hesablasma-year-filter").val();
    if (year) {
      currentFilters.year = parseInt(year);
      HS.year = parseInt(year);
    }

    // Month filter
    const month = $("#hesablasma-month-filter").val();
    if (month) {
      currentFilters.month = parseInt(month);
      HS.month = parseInt(month);
    }

    // Status filter
    const statuses = [];
    $('input[name="status"]:checked').each(function () {
      statuses.push($(this).val());
    });
    if (statuses.length > 0) {
      currentFilters.status = statuses;
      HS.status = statuses;
    }

    // Amount range filter
    const minAmount = $('input[name="min"]').val();
    const maxAmount = $('input[name="max"]').val();

    if (minAmount) {
      currentFilters.min = parseFloat(minAmount);
      HS.min = parseFloat(minAmount);
    }
    if (maxAmount) {
      currentFilters.max = parseFloat(maxAmount);
      HS.max = parseFloat(maxAmount);
    }

    // Reset to first page and reload data
    HS.page = 1;
    currentPage = 1;
    loadHesablasmaData();

    // Close modal
    closeHesablasmaFilterModal();
  }

  function clearFilters() {
    // Reset form
    $("#hesablasma-filter-form")[0].reset();

    // Clear filters
    currentFilters = {};
    HS.year = null;
    HS.month = null;
    HS.status = [];
    HS.min = null;
    HS.max = null;

    // Reset to first page and reload data
    HS.page = 1;
    currentPage = 1;
    loadHesablasmaData();

    // Keep modal open (match e-qaime behaviour)
  }

  function showLoadingState() {
    const tbody = $("#hesablasma-table-content tbody");
    tbody.html(`
            <tr>
                <td colspan="6" class="text-center py-8 text-messages dark:text-primary-text-color-dark" style="padding: 0.75rem 1rem; vertical-align: middle;">
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
    const tbody = $("#hesablasma-table-content tbody");
    tbody.html(`
            <tr>
                <td colspan="6" class="text-center py-8 text-red-500 dark:text-red-400" style="padding: 0.75rem 1rem; vertical-align: middle;">
                    ${message}
                </td>
            </tr>
        `);
  }

  // New helper functions as specified
  function formatCurrency(n) {
    return new Intl.NumberFormat("az-Latn-AZ", {
      style: "currency",
      currency: "AZN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(Number(n) || 0)
      .replace("AZN", "₼")
      .trim();
  }

  function setHesablasmaTotal(val) {
    console.log("Setting Hesablaşma total to:", val);
    const el =
      document.querySelector("#hesablasma-total") ||
      document.querySelector("#hesablasma-summary-total");
    if (el) {
      const formattedValue = formatCurrency(val);
      console.log("Formatted total:", formattedValue);
      el.textContent = formattedValue;
      el.dataset.value = String(Number(val) || 0);
      _lastSummaryTotal = val; // Store for tab show logic
      console.log("Total element updated successfully");
    } else {
      console.warn(
        "⚠️ Neither #hesablasma-total nor #hesablasma-summary-total found"
      );
    }
  }

  function setHesablasmaPageInfo(currentPage, totalPages) {
    console.log("Setting page info:", currentPage, "/", totalPages);
    const pageEl = document.querySelector("#hesablasma-page");
    if (!pageEl) {
      console.warn("⚠️ #hesablasma-page not found");
      return;
    }
    pageEl.textContent = `${currentPage} / ${totalPages}`;
    console.log("Page info updated successfully");
  }

  function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  // MutationObserver for tab visibility
  function setupMutationObserver() {
    const targetNode = document.querySelector("#hesablasma-root");
    if (!targetNode) {
      console.warn("⚠️ #hesablasma-root not found for MutationObserver");
      return;
    }

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isHidden = targetNode.classList.contains("hidden");
          console.log("Hesablaşma tab visibility changed, hidden:", isHidden);

          if (!isHidden && _lastSummaryTotal !== undefined) {
            // Tab became visible, re-apply the last known total
            console.log(
              "Tab became visible, re-applying total:",
              _lastSummaryTotal
            );
            setTimeout(() => setHesablasmaTotal(_lastSummaryTotal), 0);
          }
        }
      });
    });

    observer.observe(targetNode, {
      attributes: true,
      attributeFilter: ["class"],
    });

    console.log("MutationObserver set up for #hesablasma-root");
  }

  // Global functions for external access
  window.openHesablasmaFilterModal = function () {
    $("#hesablasma-filter-modal").removeClass("hidden");
  };

  window.closeHesablasmaFilterModal = function () {
    $("#hesablasma-filter-modal").addClass("hidden");
  };

  // Close modal when clicking outside
  $(document).on("click", "#hesablasma-filter-modal", function (e) {
    if (e.target === this) {
      closeHesablasmaFilterModal();
    }
  });

  window.changeHesablasmaPage = function (page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      HS.page = page;
      currentPage = page;
      loadHesablasmaData();
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

  // Month selection handler for navigation
  function onHesablasmaMonthSelect(y, m) {
    HS.year = Number(y) || null;
    HS.month = Number(m) || null;
    HS.page = 1;
    console.log("Selected Hesablaşma:", HS.year, HS.month);
    loadHesablasmaData();
  }

  // Make functions and state globally accessible for the navigation system
  window.loadHesablasmaData = loadHesablasmaData;
  window.currentFilters = currentFilters;
  window.onHesablasmaMonthSelect = onHesablasmaMonthSelect;
  window.HS = HS; // Make HS state globally accessible
});
