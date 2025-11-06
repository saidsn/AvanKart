// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
let globalMinAmount = 0;
let globalMaxAmount = 0;

// Detail page variables
let hesablasmaDetailData = null;
let originalServiceCompanies = [];

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Check if we are on detail page
  const isDetailPage = document.getElementById("expensesChart") !== null;

  if (isDetailPage) {
    initDetailPage();
  } else {
    initMainPage();
  }

  // Common functions
  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initSlider() {
    try {
      // jQuery UI yüklendiğini yoxla
      if (typeof $.ui === "undefined" || typeof $.ui.slider === "undefined") {
        console.warn(
          "jQuery UI slider not loaded, skipping slider initialization"
        );
        return;
      }

      if ($("#slider-range").length === 0) {
        console.warn("Slider element not found");
        return;
      }

      if ($("#slider-range").hasClass("ui-slider")) {
        $("#slider-range").slider("destroy");
      }
      $("#slider-range").slider({
        range: true,
        min: globalMinAmount,
        max: globalMaxAmount,
        values: [globalMinAmount, globalMaxAmount],
        slide: function (event, ui) {
          $("#min-value").text(formatCurrency(ui.values[0]));
          $("#max-value").text(formatCurrency(ui.values[1]));
        },
      });

      $("#min-value").text(formatCurrency(globalMinAmount));
      $("#max-value").text(formatCurrency(globalMaxAmount));
    } catch (error) {}
  }

  // Main page initialization
  function initMainPage() {
    initializeDataTable();
  }

  // Detail page initialization
  function initDetailPage() {
    loadDetailData();
    initChart();
    initServiceCompaniesFilters();
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: "/emeliyyatlar/muessise/hesablasma/json",
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          const requestData = {
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            ...currentFilters,
          };

          return JSON.stringify(requestData);
        },
        dataSrc: function (response) {
          if (!response) {
            return [];
          }

          if (response.error) {
            return [];
          }

          const data = response.data || [];
          // Update transaction count with filtered total
          const totalCount = response.recordsFiltered || response.recordsTotal || data.length || 0;
          $("#tr_counts").html(totalCount);

          if (data && data.length > 0) {
            const amounts = data.map((tr) => {
              const amountStr = tr.finalAmount
                ? tr.finalAmount.replace(" AZN", "")
                : "0";
              return parseFloat(amountStr) || 0;
            });

            if (amounts.length > 0) {
              globalMinAmount = Math.min(...amounts);
              globalMaxAmount = Math.max(...amounts);

              // jQuery UI yüklənənə qədər gözlə
              $(document).on("jqueryUILoaded", function () {
                initSlider();
              });

              // Əgər artıq yüklənibsə, birbaşa çağır
              if (
                typeof $.ui !== "undefined" &&
                typeof $.ui.slider !== "undefined"
              ) {
                initSlider();
              }
            }
          }

          return data;
        },
        error: function (xhr, status, error) {
          console.error("DataTable AJAX Error:", {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
            error: error,
          });
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 5,
      columns: [
        {
          data: "logo",
          render: function (data, type, row) {
            return `
              <div class="flex justify-center items-center gap-2.5">
                  <div class="flex justify-center items-center">
                      <div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">
                          <img src="${row.logo}" class="object-cover" alt="Logo">
                      </div>
                  </div>
                  <div class="w-full">
                      <div class="text-[13px] font-medium">${row.companyName}</div>
                      <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${row.companyId}</span></div>
                  </div>
              </div>
            `;
          },
        },
        {
          data: "invoice",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "transactionNumber",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "amount",
          render: function (data) {
            // "AZN" və digər mətn hissələrini təmizlə və rəqəmi format et
            let amount = data;
            if (typeof data === "string") {
              amount = data.replace(" AZN", "").replace("AZN", "").trim();
            }
            const numericValue = parseFloat(amount) || 0;
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              numericValue.toFixed(2) +
              " AZN" +
              "</span>"
            );
          },
        },
        {
          data: "commission",
          render: function (data) {
            // "AZN" və digər mətn hissələrini təmizlə və rəqəmi format et
            let commission = data;
            if (typeof data === "string") {
              commission = data.replace(" AZN", "").replace("AZN", "").trim();
            }
            const numericValue = parseFloat(commission) || 0;
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              numericValue.toFixed(2) +
              " AZN" +
              "</span>"
            );
          },
        },
        {
          data: "finalAmount",
          render: function (data) {
            // "AZN" və digər mətn hissələrini təmizlə və rəqəmi format et
            let finalAmount = data;
            if (typeof data === "string") {
              finalAmount = data.replace(" AZN", "").replace("AZN", "").trim();
            }
            const numericValue = parseFloat(finalAmount) || 0;
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              numericValue.toFixed(2) +
              " AZN" +
              "</span>"
            );
          },
        },
        {
          data: "date",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: function (row) {
            let color = "";
            switch (row.status) {
              case "Aktiv":
                color = "bg-[#4FC3F7]";
                break;
              case "Qaralama":
                color = "bg-[#BDBDBD]";
                break;
              case "Tamamlandı":
                color = "bg-[#66BB6A]";
                break;
              case "Gözləyir":
                color = "bg-[#FFCA28]";
                break;
              case "Report edildi":
                color = "bg-[#EF5350]";
                break;
              default:
                color = "bg-[#FF7043]";
            }
            return `
              <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
              </div>
            `;
          },
        },
        {
          data: function (row) {
            let dropdownContent = "";
            const status = row.originalStatus || row.status;

            if (status === "waiting_aktiv" || status === "waiting_tamamlandi") {
              dropdownContent = `
                <div onclick="window.location.href='/emeliyyatlar/muessise/hesablasma/details/${row.id}'" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px]">Aç</span>
                </div>
                <div class="h-[.5px ] bg-stroke my-1"></div>
                <div onclick="openTesdiqModal('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover">
                  <span class="icon stratis-file-check-02 text-messages text-[13px]"></span>
                  <span class="font-medium text-messages text-[13px]">Hesablaşmanı təsdiqlə</span>
                </div>
              `;
            } else if (status === "reported" || status.includes("reported")) {
              dropdownContent = `
                <div onclick="window.location.href='/emeliyyatlar/muessise/hesablasma/details/${row.id}'" class="flex items-center gap-2 pl-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px]">Aç</span>
                </div>
                <div class="h-[.5px ] bg-stroke my-1"></div>
                <div onclick="openAnalizModal('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover">
                  <span class="icon stratis-folder-search-02 text-messages text-[13px]"></span>
                  <span class="font-medium text-messages text-[13px]">Problemi analiz et</span>
                </div>
              `;
            } else if (status === "aktiv") {
              dropdownContent = `
                <div onclick="window.location.href='/emeliyyatlar/muessise/hesablasma/details/${row.id}'" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px]">Aç</span>
                </div>
                <div class="h-[.5px ] bg-stroke my-1"></div>
                <div onclick="openTesdiqModal('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover">
                  <span class="icon stratis-file-check-02 text-messages text-[13px]"></span>
                  <span class="font-medium text-messages text-[13px]">Hesablaşmanı təsdiqlə</span>
                </div>
              `;
            }

            return `
              <div id="wrapper" class="relative inline-block text-left">
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages w-5 h-5 cursor-pointer z-100"></div>
                <div class="hidden absolute right-[-12px] w-[208px] z-50 dropdown-menu">
                  <div class="relative h-[8px]">
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>
                  <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
                    <div class="py-[3.5px] text-sm">
                      ${dropdownContent}
                    </div>
                  </div>
                </div>
              </div>
            `;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();

        // Always update page count display
        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        // Always show pagination controls (arrows will be disabled if only 1 page)
        const hasMultiplePages = pageInfo.pages > 1;
        const isFirstPage = pageInfo.page === 0;
        const isLastPage = pageInfo.page === pageInfo.pages - 1;

        // Previous button - always visible but disabled on first page or single page
        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (isFirstPage || !hasMultiplePages
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="' +
            (isFirstPage || !hasMultiplePages ? 'return false;' : 'changePage(' + (pageInfo.page - 1) + ')') +
            '">' +
            '<div class="icon stratis-chevron-left text-xs"></div>' +
            "</div>"
        );

        // Page number buttons - show if multiple pages exist
        if (hasMultiplePages) {
          let paginationButtons = '<div class="flex gap-2">';
          
          const currentPage = pageInfo.page;
          const totalPages = pageInfo.pages;
          const maxVisibleButtons = 7; // Show max 7 page buttons at once
          
          let startPage = 0;
          let endPage = totalPages - 1;
          
          // If more than maxVisibleButtons pages, show smart pagination
          if (totalPages > maxVisibleButtons) {
            // Always show first page
            if (currentPage > 3) {
              paginationButtons += 
                '<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark" onclick="changePage(0)">1</button>';
              
              // Show ellipsis if current page is far from start
              if (currentPage > 4) {
                paginationButtons += '<span class="flex items-center px-2 text-tertiary-text dark:text-tertiary-text-color-dark">...</span>';
              }
            }
            
            // Calculate visible range around current page
            startPage = Math.max(0, currentPage - 2);
            endPage = Math.min(totalPages - 1, currentPage + 2);
            
            // Adjust if near start or end
            if (currentPage <= 3) {
              startPage = 0;
              endPage = Math.min(5, totalPages - 1);
            }
            if (currentPage >= totalPages - 4) {
              startPage = Math.max(0, totalPages - 6);
              endPage = totalPages - 1;
            }
          }
          
          // Show page buttons in range
          for (let i = startPage; i <= endPage; i++) {
            paginationButtons +=
              '<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ' +
              (i === currentPage
                ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark") +
              '" onclick="changePage(' +
              i +
              ')">' +
              (i + 1) +
              "</button>";
          }
          
          // Show last page if needed
          if (totalPages > maxVisibleButtons && currentPage < totalPages - 4) {
            // Show ellipsis if current page is far from end
            if (currentPage < totalPages - 5) {
              paginationButtons += '<span class="flex items-center px-2 text-tertiary-text dark:text-tertiary-text-color-dark">...</span>';
            }
            
            paginationButtons += 
              '<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark" onclick="changePage(' + (totalPages - 1) + ')">' + totalPages + '</button>';
          }
          
          paginationButtons += "</div>";
          $pagination.append(paginationButtons);
        }

        // Next button - always visible but disabled on last page or single page
        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (isLastPage || !hasMultiplePages
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="' +
            (isLastPage || !hasMultiplePages ? 'return false;' : 'changePage(' + (pageInfo.page + 1) + ')') +
            '">' +
            '<div class="icon stratis-chevron-right text-xs"></div>' +
            "</div>"
        );
      },
      createdRow: function (row, data, dataIndex) {
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          })
          .on("mouseleave", function () {
            $(this).css("background-color", "");
          });

        $(row)
          .find("td")
          .addClass(
            "border-b-[.5px] border-stroke dark:border-[#FFFFFF1A] cursor-pointer"
          );

        $(row).find("td:not(:last-child)").css({
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        // Növbəti səhifəyə keçid
        $(row).on("click", function (e) {
          const lastTd = $(this).find("td").last()[0];
          if (e.target === lastTd || $(e.target).closest("td")[0] === lastTd) {
            return;
          }
          // Detail səhifəyə yönləndirmə
          location.href = `/emeliyyatlar/muessise/hesablasma/details/${data.id}`;
        });
      },
    });

    try {
    } catch (error) {}
  }

  // Detail page functions
  function loadDetailData() {
    const hiddenData = document.getElementById("hiddenData");
    if (hiddenData) {
      hesablasmaDetailData = {
        id: hiddenData
          .querySelector("[data-hesablasma-id]")
          .getAttribute("data-hesablasma-id"),
        pdfLink: hiddenData
          .querySelector("[data-pdf-link]")
          .getAttribute("data-pdf-link"),
        cardExpenses: JSON.parse(
          hiddenData
            .querySelector("[data-card-expenses]")
            .getAttribute("data-card-expenses") || "[]"
        ),
        serviceCompanies: JSON.parse(
          hiddenData
            .querySelector("[data-service-companies]")
            .getAttribute("data-service-companies") || "[]"
        ),
      };
      originalServiceCompanies = [...hesablasmaDetailData.serviceCompanies];
    }
  }

  function initChart() {
    const chartCanvas = document.getElementById("expensesChart");
    if (
      chartCanvas &&
      hesablasmaDetailData &&
      hesablasmaDetailData.cardExpenses.length > 0
    ) {
      const ctx = chartCanvas.getContext("2d");
      const chartData = hesablasmaDetailData.cardExpenses;

      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: chartData.map((item) => item.category),
          datasets: [
            {
              data: chartData.map((item) => item.amount),
              backgroundColor: chartData.map((item) => item.color),
              borderWidth: 0,
              cutout: "70%",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }

  // Search functionality
  function performSearch() {
    const searchValue = $("#customSearch").val();
    if (dataTable) {
      dataTable.search(searchValue).draw();
    }
  }

  $("#customSearch").on("keyup", function (e) {
    performSearch();
  });

  // Pagination GO button
  $(".go-button").on("click", function (e) {
    e.preventDefault();
    const pageInput = $(this).siblings(".page-input");
    let pageNumber = parseInt(pageInput.val());
    pageInput.val("");

    if (!isNaN(pageNumber) && pageNumber > 0) {
      if (dataTable) {
        const pageInfo = dataTable.page.info();
        let dataTablePage = pageNumber - 1;
        if (dataTablePage < pageInfo.pages) {
          dataTable.page(dataTablePage).draw("page");
        } else {
          alert("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
        }
      }
    } else {
      alert("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
    }
  });

  // Support Enter key on page input
  $(".page-input").on("keypress", function (e) {
    if (e.which === 13) { // Enter key
      e.preventDefault();
      $(this).siblings(".go-button").click();
    }
  });
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};

// Invoys modal functions
window.toggleInvoysModal = function () {
  const modal = $("#invoysModal");
  if (modal.hasClass("hidden")) {
    modal.removeClass("hidden");
  } else {
    modal.addClass("hidden");
  }
};

// Refresh page function
window.refreshPage = function () {
  location.reload();
};

// Filter modal functions
window.openFilterModal = function () {
  if ($("#filterPop").hasClass("hidden")) {
    $("#filterPop").removeClass("hidden");

    // Slider-i popup açıldığında initialize et
    setTimeout(() => {
      initSlider();
    }, 100); // DOM elements tam yüklənsin deyə bir az gecikdirək
  } else {
    $("#filterPop").addClass("hidden");
  }
};

window.closeFilterModal = function () {
  $("#filterPop").addClass("hidden");
};

// Dropdown functions
window.toggleDropdown_company = function () {
  const dropdown = document.getElementById("dropdown_company");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

document.addEventListener("click", function (event) {
  const companyDropdown = document.getElementById("dropdown_company");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_company"
  );

  if (companyButton && companyDropdown) {
    if (
      !companyButton.contains(event.target) &&
      !companyDropdown.contains(event.target)
    ) {
      companyDropdown.classList.add("hidden");
      companyDropdown.classList.remove("visible");
    }
  }
});

// Apply filters function
window.applyFilters = function () {
  currentFilters = {};

  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  if (startDate) {
    currentFilters.start_date = startDate;
  }
  if (endDate) {
    currentFilters.end_date = endDate;
  }

  const companies = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    companies.push(companyId.replace("subyekt-", ""));
  });

  if (companies.length > 0) {
    currentFilters.muessise = companies;
  }

  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    cardStatus.push($(this).val());
  });

  if (cardStatus.length > 0) {
    currentFilters.status = cardStatus;
  }

  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      currentFilters.min_amount = minValue;
      currentFilters.max_amount = maxValue;
    }
  }

  if (dataTable) {
    dataTable.ajax.reload(function (json) {}, false);
  }

  $("#filterPop").addClass("hidden");
};

// Clear filters function
window.clearFilters = function () {
  $("#filterForm")[0].reset();
  $("#startDate").val("");
  $("#endDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  if (
    $("#slider-range").hasClass("ui-slider") &&
    globalMinAmount !== undefined &&
    globalMaxAmount !== undefined
  ) {
    $("#slider-range").slider("values", [globalMinAmount, globalMaxAmount]);
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  currentFilters = {};

  if (dataTable) {
    dataTable.ajax.reload(function (json) {}, true);
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  dropdown.classList.toggle("hidden");

  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// Modal functions
window.openTesdiqModal = function (hesablasmaId) {
  window.currentHesablasmaId = hesablasmaId;
  if ($("#tesdiqModal").hasClass("hidden")) {
    $("#tesdiqModal").removeClass("hidden");
  }
};

window.closeTesdiqModal = function () {
  $("#tesdiqModal").addClass("hidden");
};

// Confirm hesablasma without OTP
window.confirmHesablasma = async function() {
  const hesablasmaId = window.currentHesablasmaId;
  if (!hesablasmaId) {
    alert('Hesablaşma seçilməyib');
    return;
  }

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  try {
    const response = await fetch(`/emeliyyatlar/muessise/hesablasma/${hesablasmaId}/approve`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      closeTesdiqModal();
      alert('Hesablaşma uğurla təsdiqləndi');
      // Reload the DataTable
      if (dataTable) {
        dataTable.ajax.reload(null, false); // false = stay on current page
      }
    } else {
      alert(data.message || 'Xəta baş verdi');
    }
  } catch (error) {
    console.error('Error confirming hesablasma:', error);
    alert('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
  }
};

window.openConfirmModal = function () {
  $("#tesdiqModal").addClass("hidden");
  $("#confirmModal").removeClass("hidden");
};

window.closeConfirmModal = function () {
  $("#confirmModal").addClass("hidden");
};

// openAnalizModal funksiyası analizTable.js-də təyin edilib

window.closeAnalizModal = function () {
  const panel = $("#analizSlidePanel");
  panel.addClass("translate-x-full");

  // Hide modal after animation
  setTimeout(() => {
    $("#analizModal").addClass("hidden");
    // Reset data
    analizTransactionData = [];
    analizCurrentPage = 1;
    analizFilteredData = [];
    analizChanges = {};
  }, 300);
};

function loadAnalizData(hesablasmaId) {
  // Show loading state
  $("#analizCompanyName").text("Yüklənir...");
  $("#analizTransactionTableBody").html(
    '<tr><td colspan="5" class="text-center py-4">Yüklənir...</td></tr>'
  );

  // Fetch data from server
  fetch(`/emeliyyatlar/muessise/hesablasma/${hesablasmaId}/analiz-data`, {
    method: "GET",
    headers: {
      "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        populateAnalizModal(data.data);
      } else {
        console.error("Error loading analiz data:", data.message);
        // Show mock data if API fails
        populateAnalizModalWithMockData();
      }
    })
    .catch((error) => {
      console.error("Error fetching analiz data:", error);
      // Show mock data if fetch fails
      populateAnalizModalWithMockData();
    });
}

function populateAnalizModal(data) {
  // Populate company information
  $("#analizCompanyLogo").attr(
    "src",
    data.company.logo || "/images/default-company.png"
  );
  $("#analizCompanyName").text(data.company.name || "N/A");
  $("#analizCompanyId").text(`ID: ${data.company.id || "N/A"}`);

  // Populate problem details
  $("#analizProblemDesc").text(
    data.problem.description || "Problem məlumatı mövcud deyil"
  );
  $("#analizInvoiceNumber").text(data.invoice || "N/A");
  $("#analizTransactionCount").text(data.transactionCount || "0");
  $("#analizAmount").text(`${data.amount || "0.00"} AZN`);
  $("#analizDate").text(data.date || "N/A");

  // Store transaction data
  analizTransactionData = data.transactions || [];
  analizFilteredData = [...analizTransactionData];

  // Initialize table
  renderAnalizTable();
  updateAnalizPagination();
}

function populateAnalizModalWithMockData() {
  // Mock data for development/testing
  const mockData = {
    company: {
      name: "Test Müəssisəsi",
      id: "CM-12345",
      logo: "/images/Avankart/muessise/demo-company-logo.svg",
    },
    problem: {
      description: "Tranzaksiya məbləğində uyğunsuzluq aşkar edilmişdir",
    },
    invoice: "MINV-123456789",
    transactionCount: 15,
    amount: "2500.00",
    date: "01.12.2023",
    transactions: [
      {
        id: "TRX-001",
        date: "01.12.2023 10:30",
        cardName: "Yemək Kartı",
        amount: 150.0,
      },
      {
        id: "TRX-002",
        date: "01.12.2023 12:15",
        cardName: "Yanacaq Kartı",
        amount: 200.0,
      },
      {
        id: "TRX-003",
        date: "01.12.2023 14:20",
        cardName: "Hadiyyə Kartı",
        amount: 75.5,
      },
    ],
  };

  populateAnalizModal(mockData);
}

function renderAnalizTable() {
  const tbody = $("#analizTransactionTableBody");
  tbody.empty();

  const startIndex = (analizCurrentPage - 1) * analizItemsPerPage;
  const endIndex = startIndex + analizItemsPerPage;
  const pageData = analizFilteredData.slice(startIndex, endIndex);

  if (pageData.length === 0) {
    tbody.append(
      '<tr><td colspan="5" class="text-center py-4 text-tertiary-text">Məlumat tapılmadı</td></tr>'
    );
    return;
  }

  pageData.forEach((transaction, index) => {
    const globalIndex = startIndex + index;
    const row = `
      <tr class="border-b border-stroke dark:border-[#FFFFFF1A] hover:bg-table-hover">
        <td class="p-3 text-[13px] text-messages dark:text-primary-text-color-dark">${transaction.id}</td>
        <td class="p-3 text-[13px] text-messages dark:text-primary-text-color-dark">${transaction.date}</td>
        <td class="p-3">
          <input 
            type="text" 
            value="${transaction.cardName}" 
            data-field="cardName" 
            data-index="${globalIndex}"
            class="w-full px-2 py-1 text-[13px] text-messages dark:text-primary-text-color-dark bg-transparent border border-stroke dark:border-[#FFFFFF1A] rounded focus:border-focus focus:ring-0 focus:outline-none editable-field"
          >
        </td>
        <td class="p-3">
          <input 
            type="number" 
            step="0.01"
            value="${transaction.amount}" 
            data-field="amount" 
            data-index="${globalIndex}"
            class="w-full px-2 py-1 text-[13px] text-messages dark:text-primary-text-color-dark bg-transparent border border-stroke dark:border-[#FFFFFF1A] rounded focus:border-focus focus:ring-0 focus:outline-none editable-field"
          >
        </td>
        <td class="p-3">
          <button onclick="resetAnalizField(${globalIndex})" class="text-[12px] text-primary hover:text-hover-button">
            <div class="icon stratis-arrow-refresh-04"></div>
          </button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });

  // Add event listeners for editable fields
  $(".editable-field").on("input", function () {
    const field = $(this).data("field");
    const index = $(this).data("index");
    const value = $(this).val();

    if (!analizChanges[index]) {
      analizChanges[index] = {};
    }
    analizChanges[index][field] = value;

    // Update the original data
    if (field === "amount") {
      analizFilteredData[index][field] = parseFloat(value) || 0;
    } else {
      analizFilteredData[index][field] = value;
    }
  });
}

function updateAnalizPagination() {
  const totalPages = Math.ceil(analizFilteredData.length / analizItemsPerPage);
  $("#analizCurrentPage").text(analizCurrentPage);
  $("#analizTotalPages").text(totalPages);

  $("#analizPrevPage").prop("disabled", analizCurrentPage === 1);
  $("#analizNextPage").prop(
    "disabled",
    analizCurrentPage === totalPages || totalPages === 0
  );
}

window.changeAnalizPage = function (direction) {
  const totalPages = Math.ceil(analizFilteredData.length / analizItemsPerPage);
  const newPage = analizCurrentPage + direction;

  if (newPage >= 1 && newPage <= totalPages) {
    analizCurrentPage = newPage;
    renderAnalizTable();
    updateAnalizPagination();
  }
};

window.resetAnalizField = function (index) {
  const originalData = analizTransactionData[index];
  analizFilteredData[index] = { ...originalData };

  // Remove from changes
  delete analizChanges[index];

  // Re-render table
  renderAnalizTable();
};

window.saveAnalizChanges = function () {
  if (Object.keys(analizChanges).length === 0) {
    alert("Dəyişiklik tapılmadı");
    return;
  }

  const payload = {
    hesablasmaId: window.currentHesablasmaId,
    changes: analizChanges,
  };

  // Show loading state
  $('button[onclick="saveAnalizChanges()"]')
    .text("Saxlanılır...")
    .prop("disabled", true);

  fetch(
    `/emeliyyatlar/muessise/hesablasma/${window.currentHesablasmaId}/save-analiz-changes`,
    {
      method: "POST",
      headers: {
        "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Dəyişikliklər uğurla saxlanıldı");
        analizChanges = {};
        closeAnalizModal();

        // Refresh main table
        if (dataTable) {
          dataTable.ajax.reload();
        }
      } else {
        alert(data.message || "Xəta baş verdi");
      }
    })
    .catch((error) => {
      console.error("Error saving changes:", error);
      alert("Xəta baş verdi");
    })
    .finally(() => {
      $('button[onclick="saveAnalizChanges()"]')
        .text("Dəyişiklikləri Saxla")
        .prop("disabled", false);
    });
};

// Search functionality for analiz table
$("#analizTableSearch").on("input", function () {
  const searchTerm = $(this).val().toLowerCase();

  if (searchTerm === "") {
    analizFilteredData = [...analizTransactionData];
  } else {
    analizFilteredData = analizTransactionData.filter(
      (transaction) =>
        transaction.id.toLowerCase().includes(searchTerm) ||
        transaction.cardName.toLowerCase().includes(searchTerm) ||
        transaction.date.toLowerCase().includes(searchTerm)
    );
  }

  analizCurrentPage = 1;
  renderAnalizTable();
  updateAnalizPagination();
});

// Close modal when clicking outside
$("#analizModal").on("click", function (e) {
  if (e.target === this) {
    closeAnalizModal();
  }
});

// OTP confirmation and approval
window.approveHesablasma = function () {
  const otpInputs = document.querySelectorAll(".otp-input");
  let otpCode = "";

  otpInputs.forEach((input) => {
    otpCode += input.value;
  });

  if (otpCode.length !== 6) {
    alert("6 rəqəmli OTP kodunu daxil edin");
    return;
  }

  const hesablasmaId = window.currentHesablasmaId;

  if (!hesablasmaId) {
    alert("Hesablaşma ID tapılmadı");
    return;
  }

  fetch(`/emeliyyatlar/muessise/hesablasma/${hesablasmaId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    body: JSON.stringify({ otp_code: otpCode }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Hesablaşma uğurla təsdiqləndi");
        closeConfirmModal();
        closeTesdiqModal();
        if (dataTable) {
          dataTable.ajax.reload();
        }
      } else {
        alert(data.message || "Xəta baş verdi");
      }
    })
    .catch((error) => {
      alert("Xəta baş verdi");
    });
};

// OTP form submission
$("#confirmForm").on("submit", function (e) {
  e.preventDefault();
  approveHesablasma();
});

// Detail page functions
window.viewPDF = function () {
  if (hesablasmaDetailData && hesablasmaDetailData.pdfLink) {
    window.open(hesablasmaDetailData.pdfLink, "_blank");
  } else {
    alert("PDF faylı tapılmadı");
  }
};

window.downloadPDF = function () {
  if (hesablasmaDetailData && hesablasmaDetailData.pdfLink) {
    const link = document.createElement("a");
    link.href = hesablasmaDetailData.pdfLink;
    link.download = `hesablasma-${hesablasmaDetailData.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert("PDF faylı tapılmadı");
  }
};

// Filter functions for detail page
window.filterByDateRange = function (days) {
  if (!days || !originalServiceCompanies) {
    renderServiceCompaniesTable(originalServiceCompanies);
    return;
  }

  const filtered = originalServiceCompanies.filter((company, index) => {
    return days === "7" ? index < 1 : days === "30" ? index < 2 : company;
  });
  renderServiceCompaniesTable(filtered);
};

window.filterByAmount = function (maxAmount) {
  if (!originalServiceCompanies) return;

  const filtered = originalServiceCompanies.filter(
    (company) => company.amount <= maxAmount
  );
  renderServiceCompaniesTable(filtered);
};

window.filterByTransactionCount = function (maxCount) {
  if (!originalServiceCompanies) return;

  const filtered = originalServiceCompanies.filter(
    (company) => company.transactionCount <= maxCount
  );
  renderServiceCompaniesTable(filtered);
};

function renderServiceCompaniesTable(companies) {
  const tbody = document.querySelector("#serviceCompaniesTable tbody");
  if (!tbody || !companies) return;

  tbody.innerHTML = "";

  companies.forEach((company) => {
    const row = tbody.insertRow();
    row.className =
      "border-b-[.5px] border-stroke dark:border-[#FFFFFF1A] hover:bg-table-hover cursor-pointer";

    row.innerHTML = `
      <td class="py-[14.5px]">
        <div class="flex justify-center items-center gap-2.5">
          <div class="flex justify-center items-center">
            <div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">
              <img src="${company.logo}" class="object-cover" alt="Logo">
            </div>
          </div>
          <div class="w-full">
            <div class="text-[13px] font-medium">${company.name}</div>
          </div>
        </div>
      </td>
      <td class="py-[14.5px]">
        <span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${company.id}</span>
      </td>
      <td class="py-[14.5px]">
        <span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${company.transactionCount}</span>
      </td>
      <td class="py-[14.5px]">
        <span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${company.amount.toFixed(2)} AZN</span>
      </td>
    `;
  });
}
