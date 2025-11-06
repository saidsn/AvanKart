// invoices.js - E-qaimə functionality for company inside page
$(document).ready(function () {
  // Get company ID from the root container
  const companyId = document.querySelector("#eqaime-root").dataset.companyId;

  // State object to track current filters and pagination
  const state = {
    companyId: companyId,
    year: null,
    month: null,
    status: [],
    amountMin: null,
    amountMax: null,
    term: "",
    page: 1,
    limit: 10,
  };

  // Wait for the existing eQaimeMainTable to be initialized
  setTimeout(() => {
    initInvoices();
  }, 1000);

  function initInvoices() {
    // Set up event listeners
    setupEventListeners();

    // Override the existing DataTable with our custom implementation
    overrideExistingTable();
  }

  function overrideExistingTable() {
    // Destroy existing DataTable if it exists
    if ($.fn.DataTable.isDataTable("#eQaimeMainTable")) {
      $("#eQaimeMainTable").DataTable().destroy();
    }

    // Initialize our custom table
    loadTable();
  }

  function setupEventListeners() {
    // Search functionality with debounce
    let searchTimeout;
    $("#eqaime-search").on("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.term = $(this).val();
        state.page = 1; // Reset to first page
        loadTable();
      }, 350);
    });

    // Refresh button
    $("#eqaime-refresh").on("click", function () {
      loadTable();
    });

    // Filter modal open
    $("#eqaime-filter-open").on("click", function () {
      openFilterModal();
    });

    // Filter apply button
    $("#eqaime-filter-apply").on("click", function () {
      applyFilters();
    });

    // Filter clear button
    $("#eqaime-filter-clear").on("click", function () {
      clearFilters();
    });

    // Year/month tiles (if they exist)
    $("[data-inv-year]").on("click", function () {
      const year = $(this).data("inv-year");
      state.year = year;
      state.month = null; // Clear month when year is selected
      state.page = 1;
      loadTable();
    });

    $("[data-inv-month]").on("click", function () {
      const month = $(this).data("inv-month");
      state.month = month;
      state.page = 1;
      loadTable();
    });
  }

  function loadTable() {
    // Show loading state
    showLoadingState();

    const requestBody = {
      sirket_id: state.companyId,
      status: state.status,
      year: state.year,
      month: state.month,
      min: state.amountMin,
      max: state.amountMax,
      search: state.term,
      page: state.page,
      limit: state.limit,
    };

    console.log("Loading invoices with request:", requestBody);

    // Remove null/undefined values
    Object.keys(requestBody).forEach((key) => {
      if (
        requestBody[key] === null ||
        requestBody[key] === undefined ||
        (Array.isArray(requestBody[key]) && requestBody[key].length === 0)
      ) {
        delete requestBody[key];
      }
    });

    fetch("/emeliyyatlar/sirket/eqaime", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": window.CSRF_TOKEN,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received response:", data);
        if (data.error) {
          console.error("Error loading invoices:", data.error);
          alertModal("Xəta baş verdi: " + data.error, 'error');
          return;
        }
        renderTable(data);
        renderPagination(data);
      })
      .catch((error) => {
        console.error("Error loading invoices:", error);
        alertModal("Xəta baş verdi. Yenidən cəhd edin.", 'error');
      })
      .finally(() => {
        hideLoadingState();
      });
  }

  function renderTable(data) {
    const tbody = $("#eQaimeMainTable tbody");
    tbody.empty();

    if (!data.data || data.data.length === 0) {
      tbody.append(`
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                        Heç bir qaimə tapılmadı
                    </td>
                </tr>
            `);
      return;
    }

    data.data.forEach((row) => {
      const statusLabel = getStatusLabel(row.raw_status || row.status);
      const statusColor = getStatusColor(row.raw_status || row.status);
      const amount = formatCurrency(row.amount);
      const period =
        row.period?.label ||
        formatDateRange(row.period?.start_date, row.period?.end_date);

      const tr = $(`
                <tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" data-qaime-id="${row.qaime_id}">
                    <td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span class="text-sm text-gray-900 dark:text-white">${row.qaime_id || "—"}</span>
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

      // Add click handler for row
      tr.on("click", function () {
        const qaimeId = $(this).data("qaime-id");
        if (qaimeId) {
          window.open(`/emeliyyatlar/sirket/eqaime/${qaimeId}/view`, "_blank");
        }
      });

      tbody.append(tr);
    });
  }

  function renderPagination(data) {
    const paginationContainer = $("#eQaimeMainPagination");
    const pageCountContainer = $("#eQaimeMainPageCount");

    if (!paginationContainer.length || !pageCountContainer.length) {
      return; // Pagination elements not found
    }

    const totalPages = Math.ceil(data.total / data.pageSize);
    const currentPage = data.page;

    // Update page count
    pageCountContainer.text(`${currentPage} / ${totalPages}`);

    // Clear existing pagination
    paginationContainer.empty();

    if (totalPages <= 1) {
      return;
    }

    // Previous button
    const prevButton = $(`
            <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 cursor-pointer"
            }" onclick="changeInvoicesPage(${Math.max(1, currentPage - 1)})">
                <div class="icon stratis-chevron-left text-xs"></div>
            </div>
        `);
    paginationContainer.append(prevButton);

    // Page numbers
    const pageNumbers = $('<div class="flex gap-2"></div>');
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = $(`
                <button class="cursor-pointer w-10 h-10 rounded-[8px] text-sm ${
                  i === currentPage
                    ? "bg-purple-100 text-purple-700"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }" onclick="changeInvoicesPage(${i})">
                    ${i}
                </button>
            `);
      pageNumbers.append(pageButton);
    }
    paginationContainer.append(pageNumbers);

    // Next button
    const nextButton = $(`
            <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 cursor-pointer"
            }" onclick="changeInvoicesPage(${Math.min(totalPages, currentPage + 1)})">
                <div class="icon stratis-chevron-right text-xs"></div>
            </div>
        `);
    paginationContainer.append(nextButton);
  }

  function applyFilters() {
    // Get year selection
    const selectedYears = [];
    $('#eqaime-filter-modal input[name="year"]:checked').each(function () {
      selectedYears.push($(this).val());
    });
    state.year = selectedYears.length > 0 ? selectedYears[0] : null; // Take first selected year

    // Get month selection
    const selectedMonths = [];
    $('#eqaime-filter-modal input[name="month"]:checked').each(function () {
      selectedMonths.push($(this).val());
    });
    state.month = selectedMonths.length > 0 ? selectedMonths[0] : null; // Take first selected month

    // Get status selection
    state.status = [];
    $('#eqaime-filter-modal input[name="status"]:checked').each(function () {
      state.status.push($(this).val());
    });

    // Get amount range from slider
    if ($("#eQaimeMain-mebleg-slider").hasClass("ui-slider")) {
      const sliderValues = $("#eQaimeMain-mebleg-slider").slider("values");
      state.amountMin = sliderValues[0];
      state.amountMax = sliderValues[1];

      // Update hidden inputs
      $("#eqaime-min-amount").val(state.amountMin);
      $("#eqaime-max-amount").val(state.amountMax);
    }

    // Reset to first page and reload
    state.page = 1;
    loadTable();

    // Close modal
    $("#eqaime-filter-modal").addClass("hidden");
  }

  function clearFilters() {
    // Reset state
    state.year = null;
    state.month = null;
    state.status = [];
    state.amountMin = null;
    state.amountMax = null;
    state.page = 1;

    // Clear form
    $("#eqaime-filter-modal form")[0].reset();
    $('#eqaime-filter-modal input[type="checkbox"]').prop("checked", false);

    // Reset slider if it exists
    if ($("#eQaimeMain-mebleg-slider").hasClass("ui-slider")) {
      $("#eQaimeMain-mebleg-slider").slider("values", [0, 10000]);
      $("#eQaimeMain-min-mebleg-value").text("0 ₼");
      $("#eQaimeMain-max-mebleg-value").text("10000 ₼");
    }

    // Clear hidden inputs
    $("#eqaime-min-amount").val("");
    $("#eqaime-max-amount").val("");

    // Reload table
    loadTable();
  }

  function openFilterModal() {
    $("#eqaime-filter-modal").removeClass("hidden");
  }

  function getStatusLabel(status) {
    switch (status) {
      case "active":
        return "Tamamlandı";
      case "passive":
        return "Gözləyir";
      case "canceled":
        return "Ləğv edilib";
      default:
        return status || "—";
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "passive":
        return "bg-yellow-500";
      case "canceled":
        return "bg-red-500";
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

  function formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) return "—";
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString("az-AZ")} - ${end.toLocaleDateString("az-AZ")}`;
  }

  function showError(message) {
    // Simple error display - you can enhance this with a proper notification system
    console.error(message);
    alert(message);
  }

  function showLoadingState() {
    const tbody = $("#eQaimeMainTable tbody");
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
  }

  function hideLoadingState() {
    // Loading state is automatically replaced when renderTable is called
  }

  // Global function for pagination
  window.changeInvoicesPage = function (page) {
    state.page = page;
    loadTable();
  };

  // Override existing global functions
  window.changeEqaimeMainPage = function (page) {
    state.page = page;
    loadTable();
  };

  // Global function for filter modal
  window.openEqaimeMainFilterModal = function () {
    openFilterModal();
  };

  // Global function for applying filters
  window.applyEqaimeMainFilters = function () {
    applyFilters();
  };

  // Global function for clearing filters
  window.clearEqaimeMainFilters = function () {
    clearFilters();
  };

  // Global function to show E-qaimə table
  window.showEqaimeTable = function () {
    // Hide the cards menu and show the E-qaimə table
    $("#cards-menu").addClass("hidden");
    $("#eQaimeMain").removeClass("hidden");

    // Load the table data
    loadTable();
  };

  // Global function to go back to cards menu
  window.backToEqaimeCards = function () {
    // Show the cards menu and hide the E-qaimə table
    $("#eQaimeMain").addClass("hidden");
    $("#cards-menu").removeClass("hidden");
  };
});
