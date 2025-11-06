// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 10000;

// Global function to populate company dropdown
function populateCompanyDropdown(companies) {
  const dropdown = $("#dropdown_company");
  const button = $("#dropdownDefaultButton_company");

  // Clear all existing content
  dropdown.empty();

  if (companies && companies.length > 0) {
    // Add individual company options
    companies.forEach((company) => {
      const option = `
        <label for="company-${company.id}" class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
          <input type="checkbox" id="company-${company.id}" value="${company.id}" class="w-4 h-4" onchange="handleCompanySelection(this)">
          <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">${company.name}</span>
        </label>
      `;
      dropdown.append(option);
    });

    // Update button text
    button.find("span:first").text("Seçim edin");
  } else {
    // No companies found
    const noOption = `
      <label class="flex items-center px-4 py-1 text-[13px] text-gray-500 select-none gap-2">
        <span class="ml-2 text-sm">Müəssisə tapılmadı</span>
      </label>
    `;
    dropdown.append(noOption);
  }
}

// Global function to load filter options
function loadFilterOptions() {
  return new Promise((resolve) => {
    // Extract partner ID from URL
    const pathSegments = window.location.pathname
      .split("/")
      .filter((segment) => segment);
    const partnerId = pathSegments[2]; // /hovuz/partner/PA-837473 -> PA-837473

    // Load filter options from backend
    $.ajax({
      url: `/hovuz/partner/${partnerId}/workplace-filter-options`,
      method: "POST",
      headers: {
        "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
      },
      data: {
        partnerId: partnerId,
        workplaceId: null, // Will be set if needed
      },
      success: function (response) {
        if (response.success) {
          // Update global min/max values
          globalMinAmount = response.data.minAmount || 0;
          globalMaxAmount = response.data.maxAmount || 1000;

          // Populate company dropdown
          populateCompanyDropdown(response.data.companies || []);

          console.log("Filter options loaded:", {
            minAmount: globalMinAmount,
            maxAmount: globalMaxAmount,
            companies: response.data.companies,
          });
        }
        resolve();
      },
      error: function (xhr, status, error) {
        console.error("Error loading filter options:", error);
        // Set default values if loading fails
        globalMinAmount = 0;
        globalMaxAmount = 1000;
        resolve();
      },
    });
  });
}

// Global formatCurrency function for use in filters
function formatCurrency(value) {
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₼"
  );
}

// Global initSlider function
function initSlider() {
  console.log(
    "Initializing slider with min:",
    globalMinAmount,
    "max:",
    globalMaxAmount
  );

  // Check if slider element exists
  if ($("#slider-range").length === 0) {
    console.error("Slider element #slider-range not found");
    return;
  }

  // Ensure min and max are different and valid
  if (globalMaxAmount <= globalMinAmount) {
    globalMaxAmount = globalMinAmount + 1000;
  }

  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("destroy");
  }

  try {
    // Get current filter values for slider initialization
    const currentMin = currentFilters.min || globalMinAmount;
    const currentMax = currentFilters.max || globalMaxAmount;

    $("#slider-range").slider({
      range: true,
      min: globalMinAmount,
      max: globalMaxAmount,
      values: [currentMin, currentMax],
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      },
    });

    // Set current values
    $("#min-value").text(formatCurrency(currentMin));
    $("#max-value").text(formatCurrency(currentMax));

    console.log("Slider initialized successfully");
  } catch (error) {
    console.error("Error initializing slider:", error);
  }
}

// Function to restore filter values when reopening modal
function restoreFilterValues() {
  // Restore date filters
  if (currentFilters.start_date) {
    $('input[name="start_date"]').val(currentFilters.start_date);
  }

  if (currentFilters.end_date) {
    $('input[name="end_date"]').val(currentFilters.end_date);
  }

  // Restore company selections
  if (currentFilters.companys && currentFilters.companys.length > 0) {
    // First, uncheck all company checkboxes
    $('#dropdown_company input[type="checkbox"]').prop("checked", false);

    // Check the previously selected companies
    currentFilters.companys.forEach((companyId) => {
      $(`#company-${companyId}`).prop("checked", true);
    });

    // Update button text
    updateCompanyButtonText();
  }
}

// Function to update company dropdown button text
function updateCompanyButtonText() {
  const button = $("#dropdownDefaultButton_company");
  const selectedCompanies = $(
    '#dropdown_company input[type="checkbox"]:checked'
  );

  if (selectedCompanies.length === 0) {
    button.find("span:first").text("Seçim edin");
  } else if (selectedCompanies.length === 1) {
    const selectedName = selectedCompanies
      .closest("label")
      .find("span:last")
      .text();
    button.find("span:first").text(selectedName);
  } else {
    button
      .find("span:first")
      .text(`${selectedCompanies.length} müəssisə seçildi`);
  }
}

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function updateSliderRange(data) {
    if (!data || data.length === 0) return;

    // Extract amounts from the data (remove currency symbol and convert to number)
    const amounts = data
      .map((item) => {
        const amountStr = item.amount || "0 ₼";
        return parseFloat(amountStr.replace(" ₼", "").replace(",", "")) || 0;
      })
      .filter((amount) => amount > 0);

    if (amounts.length > 0) {
      globalMinAmount = Math.min(...amounts);
      globalMaxAmount = Math.max(...amounts);

      // Add some padding to make the range more user-friendly
      const padding = (globalMaxAmount - globalMinAmount) * 0.1;
      globalMinAmount = Math.max(0, Math.floor(globalMinAmount - padding));
      globalMaxAmount = Math.ceil(globalMaxAmount + padding);

      // Reinitialize slider with new range
      initSlider();
    }
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    // Extract partner ID from URL - it's the third segment after /hovuz/partner/
    const pathSegments = window.location.pathname
      .split("/")
      .filter((segment) => segment);
    const partnerId = pathSegments[2]; // /hovuz/partner/PA-837473 -> PA-837473

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: `/hovuz/partner/${partnerId}/working-history`,
        type: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          return {
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search,
            ...currentFilters, // filtre varsa buradan gelmeli
          };
        },
        dataSrc: function (json) {
          // Update slider range based on data
          if (json.data && json.data.length > 0) {
            updateSliderRange(json.data);
          }
          return json.data;
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 3,
      columns: [
        {
          data: "muessise_name",
          render: function (data, type, row) {
            console.log("ROW: ", row);

            return `
              <div class="flex justify-center items-center gap-2.5">
                  <div class="flex justify-center items-center">
                      <div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">
                          <img src="${row.profile_image_path || "/images/default-company-logo.svg"}" class="object-cover" alt="Logo">
                      </div>
                  </div>
                  <div class="w-full">
                      <div class="text-[13px] font-medium">${data || "N/A"}</div>
                      <div class="text-[11px] text-messages opacity-65 font-normal">
                        ${row.is_current ? '<span class="text-success font-medium">Hazırda işləyir</span>' : "Əvvəlki iş yeri"}
                      </div>
                  </div>
              </div>
            `;
          },
        },
        {
          data: "qr_count",
          render: function (data) {
            console.log(data, "datata");
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "0") +
              "</span>"
            );
          },
        },
        {
          data: "amount",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "0.00 ₼") +
              "</span>"
            );
          },
        },
        {
          data: "start_date",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "end_date",
          render: function (data, type, row) {
            let className =
              "text-[13px] text-messages dark:text-on-primary-dark font-normal";
            if (row.is_current && data === "Davam edir") {
              className =
                "text-[13px] text-success dark:text-success font-normal";
            }
            return (
              '<span class="' + className + '">' + (data || "—") + "</span>"
            );
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
          (pageInfo.page === 0
            ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
          '" onclick="changePage(' +
          Math.max(0, pageInfo.page - 1) +
          ')">' +
          '<div class="icon stratis-chevron-left text-xs"></div>' +
          "</div>"
        );

        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
          paginationButtons +=
            '<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ' +
            (i === pageInfo.page
              ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
              : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark") +
            '" onclick="changePage(' +
            i +
            ')">' +
            (i + 1) +
            "</button>";
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
          (pageInfo.page === pageInfo.pages - 1
            ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
          '" onclick="changePage(' +
          Math.min(pageInfo.page + 1, pageInfo.pages - 1) +
          ')">' +
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
          .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

        $(row).find("td:not(:last-child)").css({
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        // We'll add row click handlers outside of this function to avoid multiple registrations
        // The row styling will remain here

        // We'll add back button handler outside of this function to avoid multiple registrations
      },
    });

    // Make DataTable globally accessible
    window.qrTable = dataTable;
  }

  // Initialize DataTable
  initializeDataTable();

  // QR History Refresh Button Handler
  $(document)
    .off("click.qrRefresh", ".straits-arrow-refresh-84")
    .on("click.qrRefresh", ".straits-arrow-refresh-84", function () {
      if (window.qrTable?.ajax) window.qrTable.ajax.reload(null, false);
      if (typeof loadPartnerCounts === "function") loadPartnerCounts();
    });

  // Load filter options and populate dropdowns on page load
  loadFilterOptions().then(() => {
    filterOptionsLoaded = true;
  });

  // Initialize slider with default values, will be updated after data loads
  initSlider();

  // Add a single event handler for row clicks to prevent duplicate handlers
  $("#myTable tbody")
    .off("click", "tr")
    .on("click", "tr", function () {
      const rowData = dataTable.row(this).data();
      if (rowData && rowData.muessise_id) {
        // Store selected workplace info for the detail view
        window.selectedWorkplace = rowData;

        // Set the selected workplace ID for use in other functions
        selectedWorkplaceId = rowData.muessise_id;

        // Update the detail view header with workplace info
        updateDetailViewHeader(rowData);

        // First fetch workplace data, then initialize the transactions table
        // This way we only make one API call for stats data
        fetchWorkplaceData(rowData.muessise_id).then(() => {
          // Only initialize transactions table after stats data is loaded
          initializeTransactionsTable(rowData.muessise_id);
        });

        // MainView gizlədilir
        $("#mainView").addClass("hidden");
        $("#mainView").removeClass("inline-block");
        $("#detailView").removeClass("hidden");
      }
    });

  // Add a single event handler for back button to prevent duplicate handlers
  $(document)
    .off("click", "#backToMain")
    .on("click", "#backToMain", function () {
      window.location.reload();
      // bu hisse oldugu sehifeni yenilemek ucun deyisdirilib
      // $("#detailView").addClass("hidden");
      // $("#mainView").addClass("inline-block");
      // $("#mainView").removeClass("hidden");
    });
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};

// Filter modal functions
// Handle company selection in dropdown
window.handleCompanySelection = function (checkbox) {
  const companyCheckboxes = $('input[id^="company-"]');

  // Update button text after any selection change
  updateCompanyButtonText();
};

// Flag to track if filter options have been loaded
let filterOptionsLoaded = false;

window.openFilterModal = async function () {
  if ($("#filterPop").hasClass("hidden")) {
    $("#filterPop").removeClass("hidden");

    // Only load filter options if they haven't been loaded yet
    if (!filterOptionsLoaded) {
      await loadFilterOptions();
      filterOptionsLoaded = true;
    }

    // Restore previous filter values
    restoreFilterValues();

    // Small delay to ensure elements are rendered before slider init
    setTimeout(() => {
      initSlider();
    }, 100);
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

// Bu funksiyalar dropdown menyuları xaricində hər hansı bir yerə basıldıqda bağlamaq üçündür
document.addEventListener("click", function (event) {
  const companyDropdown = document.getElementById("dropdown_company");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_company"
  );

  // Check if elements exist before using .contains()
  if (
    companyButton &&
    companyDropdown &&
    !companyButton.contains(event.target) &&
    !companyDropdown.contains(event.target)
  ) {
    companyDropdown.classList.add("hidden");
    companyDropdown.classList.remove("visible");
  }
});

// Apply filters function
window.applyFilters = function () {
  // Filterləri sıfırla
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  console.log("Date filters:", { startDate, endDate });

  if (startDate) {
    currentFilters.start_date = startDate;
  }

  if (endDate) {
    currentFilters.end_date = endDate;
  }

  // Müəssisələri al
  const companys = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    console.log("Checked company checkbox:", companyId);
    if (companyId && companyId.startsWith("company-")) {
      companys.push(companyId.replace("company-", ""));
    }
  });

  console.log("Selected companies:", companys);

  if (companys.length > 0) {
    currentFilters.companys = companys;
  }

  // Məbləğ aralığını al (slider)
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
  }

  console.log("New currentFilters:", currentFilters);
  console.log("currentFilters keys:", Object.keys(currentFilters));

  // Məlumat cədvəlini yenilə
  if (dataTable) {
    console.log("Reloading DataTable...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#filterPop").addClass("hidden");
};

// Clear filters function
window.clearFilters = function () {
  console.log("=== Clearing filters ===");

  // Reset form inputs
  $('input[name="start_date"]').val("");
  $('input[name="end_date"]').val("");
  $('#dropdown_company input[type="checkbox"]').prop("checked", false);

  // Reset company dropdown button text
  $("#dropdownDefaultButton_company").find("span:first").text("Seçim edin");

  // Reset slider
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [globalMinAmount, globalMaxAmount]);
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  // Clear filters
  currentFilters = {};

  // Reload DataTable
  if (dataTable) {
    console.log("Reloading DataTable after clearing filters...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable clear and reload completed");
    }, true);
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

// Debounce timer for search
let searchDebounceTimer = null;

function performSearch() {
  const searchValue = $("#customSearch").val();
  console.log("Performing search for:", searchValue);
  if (window.qrTable) {
    // Clear search if empty, otherwise set the search value
    if (searchValue.trim() === "") {
      window.qrTable.search("").draw();
    } else {
      window.qrTable.search(searchValue.trim()).draw();
    }
  } else {
    console.error("QR DataTable not initialized for search");
  }
}

// Debounced search function
function debouncedSearch() {
  // Clear the previous timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  // Set a new timer
  searchDebounceTimer = setTimeout(() => {
    performSearch();
  }, 350); // 350ms debounce
}

// Search inputuna event listener əlavə etmək
$(document).ready(function () {
  $("#customSearch").on("keyup input", function (e) {
    const searchValue = $(this).val();

    // If search is cleared, immediately clear results
    if (searchValue.trim() === "") {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      performSearch();
    } else {
      debouncedSearch();
    }
  });

  // Also handle paste events
  $("#customSearch").on("paste", function (e) {
    setTimeout(() => {
      debouncedSearch();
    }, 10); // Small delay to let paste complete
  });
});

// Sehifeler arasi kecid GO button ile
$(".go-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".page-input");
  let pageNumber = parseInt(pageInput.val());

  // Input sahəsini hər halda təmizləyirik
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (dataTable) {
      const pageInfo = dataTable.page.info();
      let dataTablePage = pageNumber - 1;

      if (dataTablePage < pageInfo.pages) {
        // Səhifə mövcuddursa, keçid edir
        dataTable.page(dataTablePage).draw("page");
      } else {
        // Səhifə mövcud deyilsə, xəta yazır
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    // Etibarsız girişdə xəta yazır
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  if (!wrapper) {
    console.warn("Wrapper element not found");
    return;
  }

  const dropdown = wrapper.querySelector(".dropdown-menu");
  if (!dropdown) {
    console.warn("Dropdown menu not found");
    return;
  }

  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");

  // Xaricə kliklənəndə bağla
  document.addEventListener("click", function outsideClick(e) {
    if (wrapper && !wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// Tesdiq modal functions
window.openDeAktivModal = function () {
  if ($("#deAktivModal").hasClass("hidden")) {
    $("#deAktivModal").removeClass("hidden");
  } else {
    $("#deAktivModal").addClass("hidden");
  }
};

window.closeDeAktivModal = function () {
  $("#deAktivModal").addClass("hidden");
};

// Silinmə Müraciət Popup funksiyaları
window.openSilinmeMuracietPopUp = function () {
  if ($("#silinmeMuracietPopUp").hasClass("hidden")) {
    $("#silinmeMuracietPopUp").removeClass("hidden");
  } else {
    $("#silinmeMuracietPopUp").addClass("hidden");
  }
};

window.closeSilinmeMuracietPopUp = function () {
  $("#silinmeMuracietPopUp").addClass("hidden");
};

// Direct delete request from inside page (no OTP)
window.submitDeleteRequest = function () {
  try {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    const userId = window.selectedPartnerId; // set in inside.ejs
    if (!userId) {
      console.error("submitDeleteRequest: selectedPartnerId is missing");
      alert("Xəta: istifadəçi ID tapılmadı.");
      return;
    }

    // optional: read reason from the textarea inside the popup
    const reason = $("#silinmeMuracietPopUp textarea").val()?.trim() || "";

    $.ajax({
      url: `/hovuz/partner/${userId}/delete/request`,
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      contentType: "application/json",
      data: JSON.stringify({ reason }),
      success: function (res) {
        if (res && res.success) {
          if (typeof toastr !== "undefined") {
            toastr.success(res.message || "Silinmə müraciəti göndərildi");
          } else {
            alert(res.message || "Silinmə müraciəti göndərildi");
          }

          // close current modal
          window.closeSilinmeMuracietPopUp?.();

          // reload all known DataTables without pagination reset
          if (window.dataTable?.ajax) window.dataTable.ajax.reload(null, false);
          if (window.qrTable?.ajax) window.qrTable.ajax.reload(null, false);
          if (window.transactionsTable?.ajax)
            window.transactionsTable.ajax.reload(null, false);

          // refresh counts if available
          if (typeof window.loadPartnerCounts === "function") {
            window.loadPartnerCounts();
          }
        } else {
          const msg = (res && (res.error || res.message)) || "Naməlum xəta";
          if (typeof toastr !== "undefined") toastr.error(msg);
          else alert("Xəta: " + msg);
        }
      },
      error: function (xhr, status, error) {
        const msg = xhr?.responseJSON?.error || error || "Server xətası";
        if (typeof toastr !== "undefined")
          toastr.error("Xəta baş verdi: " + msg);
        else alert("Xəta baş verdi: " + msg);
      },
    });
  } catch (e) {
    console.error("submitDeleteRequest failed:", e);
    if (typeof toastr !== "undefined") toastr.error("Gözlənilməz xəta");
    else alert("Gözlənilməz xəta");
  }
};

// Mail adresi popup funksiyaları
window.openMailadressiPopup = function () {
  if ($("#mailadressiPopup").hasClass("hidden")) {
    $("#mailadressiPopup").removeClass("hidden");
  } else {
    $("#mailadressiPopup").addClass("hidden");
  }
};

window.closeMailadressiPopup = function () {
  $("#mailadressiPopup").addClass("hidden");
};

// QR filter modal functions
window.openQrFilterModal = function () {
  if ($("#qrFilterPop").hasClass("hidden")) {
    $("#qrFilterPop").removeClass("hidden");

    // Just initialize the slider with existing data when opening the modal
    // No need to fetch data again since it's already loaded by fetchWorkplaceData
    console.log("Opening QR filter modal with existing data");
    setTimeout(() => {
      if (typeof initQrSlider === "function") {
        // Check if we have valid min/max values before initializing
        if (
          typeof qrGlobalMinAmount !== "undefined" &&
          typeof qrGlobalMaxAmount !== "undefined"
        ) {
          initQrSlider(); // This will use the already-set min/max values
          console.log(
            "QR filter slider initialized on modal open with existing data"
          );
        } else {
          console.warn("QR slider values not set yet, using defaults");
          // We'll use default values from initQrSlider function
          initQrSlider();
        }
      } else {
        console.error("initQrSlider function not found");
      }
    }, 100); // Small delay to ensure the modal is rendered
  } else {
    $("#qrFilterPop").addClass("hidden");
  }
};

window.closeQrFilterModal = function () {
  $("#qrFilterPop").addClass("hidden");
};

// QR filter functions
let qrCurrentFilters = {};

window.applyQrFilters = function () {
  // Reset filters
  qrCurrentFilters = {};

  // Get date range
  const startDate = $("#qrStartDate").val();
  const endDate = $("#qrEndDate").val();

  if (startDate) {
    qrCurrentFilters.start_date = startDate;
  }

  if (endDate) {
    qrCurrentFilters.end_date = endDate;
  }

  // Get card categories
  const categories = [];
  $('input[name="card_category"]:checked').each(function () {
    const categoryValue = $(this).val();
    if (categoryValue) {
      categories.push(categoryValue);
    }
  });

  if (categories.length > 0) {
    qrCurrentFilters.categories = categories;
  }

  // Get status
  const statuses = [];
  $('input[name="card_status"]:checked').each(function () {
    const statusValue = $(this).val();
    if (statusValue) {
      statuses.push(statusValue);
    }
  });

  if (statuses.length > 0) {
    qrCurrentFilters.statuses = statuses;
  }

  // Get amount range from slider
  if (
    typeof qrCurrentMinAmount !== "undefined" &&
    typeof qrCurrentMaxAmount !== "undefined"
  ) {
    qrCurrentFilters.min_amount = qrCurrentMinAmount;
    qrCurrentFilters.max_amount = qrCurrentMaxAmount;
  }

  console.log("QR filters applied:", qrCurrentFilters);

  // Reload transactions table with new filters
  if (transactionsTable) {
    transactionsTable.ajax.reload();
  }

  // Close filter modal
  $("#qrFilterPop").addClass("hidden");
};

window.clearQrFilters = function () {
  console.log("Clearing QR filters");

  // Reset form inputs
  $("#qrStartDate").val("");
  $("#qrEndDate").val("");
  $('input[name="card_category"]').prop("checked", false);
  $('input[name="card_status"]').prop("checked", false);

  // Reset slider to initial values if it exists
  if (
    typeof qrGlobalMinAmount !== "undefined" &&
    typeof qrGlobalMaxAmount !== "undefined"
  ) {
    qrCurrentMinAmount = qrGlobalMinAmount;
    qrCurrentMaxAmount = qrGlobalMaxAmount;

    if (
      $("#qrTableSliderRange").length > 0 &&
      $("#qrTableSliderRange").hasClass("ui-slider")
    ) {
      $("#qrTableSliderRange").slider("values", [
        qrGlobalMinAmount,
        qrGlobalMaxAmount,
      ]);
      updateQrSliderLabels(qrGlobalMinAmount, qrGlobalMaxAmount);
    }
  }

  // Clear filters
  qrCurrentFilters = {};

  // Reload transactions table
  if (transactionsTable) {
    transactionsTable.ajax.reload();
  }
};

// Function to update detail view header with workplace info
function updateDetailViewHeader(workplaceData) {
  // Update the company name and other details in the detail view
  const detailHeader = document.querySelector("#detailView .bg-sidebar-bg");
  if (detailHeader) {
    // Use a more specific approach to find and update elements
    // Look for elements with both text-[13px] and font-medium classes
    const mediumTextElements = detailHeader.querySelectorAll(
      '[class*="text-"][class*="font-medium"]'
    );

    // Update company name (first medium text element)
    if (mediumTextElements[0]) {
      mediumTextElements[0].textContent = workplaceData.muessise_name;
    }

    // Update QR count (second medium text element)
    if (mediumTextElements[1]) {
      mediumTextElements[1].textContent = workplaceData.qr_count || "0";
    }

    // Update amount (third medium text element)
    if (mediumTextElements[2]) {
      mediumTextElements[2].textContent = workplaceData.amount || "0.00 ₼";
    }

    // Update start date (fourth medium text element)
    if (mediumTextElements[3]) {
      mediumTextElements[3].textContent = workplaceData.start_date || "N/A";
    }

    // Update end date (fifth medium text element)
    if (mediumTextElements[4]) {
      mediumTextElements[4].textContent = workplaceData.end_date || "N/A";
    }
  }
}

// Function to initialize transactions table for selected workplace
let transactionsTable = null;

function initializeTransactionsTable(muessiseId) {
  if ($.fn.DataTable.isDataTable("#qrTable")) {
    $("#qrTable").DataTable().destroy();
    // Only clear the tbody, not the entire table (preserve thead)
    $("#qrTable tbody").empty();
  }

  // Extract partner ID from URL
  const pathSegments = window.location.pathname
    .split("/")
    .filter((segment) => segment);
  const partnerId = pathSegments[2];

  transactionsTable = $("#qrTable").DataTable({
    ajax: {
      url: `/hovuz/partner/${partnerId}/workplace-transactions/${muessiseId}`,
      type: "POST",
      headers: { "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content") },
      data: function (d) {
        return {
          draw: d.draw,
          start: d.start,
          length: d.length,
          search: d.search,
          ...qrCurrentFilters, // Add the QR filters to the request
        };
      },
    },
    serverSide: true,
    processing: true,
    paging: true,
    dom: "t",
    info: false,
    order: [],
    lengthChange: true,
    pageLength: 10,
    columns: [
      {
        data: "transactionId",
        render: (data) =>
          `<span class="text-[13px] text-messages font-normal">${data || "—"}</span>`,
      },
      {
        data: "cardName",
        render: (data) =>
          `<span class="text-[13px] text-messages font-normal">${data || "—"}</span>`,
      },
      {
        data: "amount",
        render: (data) =>
          `<span class="text-[13px] text-messages font-normal">${data || "—"}</span>`,
      },
      {
        data: "date",
        render: (data) =>
          `<span class="text-[13px] text-messages font-normal">${data || "—"}</span>`,
      },
      {
        data: "status",
        render: function (data) {
          let colorDot = "",
            textColor = "";
          if (data === "Uğurlu") {
            colorDot = "bg-[#5BBE2D]";
            textColor = "text-[#5BBE2D]";
          } else {
            colorDot = "bg-[#DD3838]";
            textColor = "text-[#DD3838]";
          }
          return `<div class="flex items-center gap-2">
                    <span class="w-[6px] h-[6px] rounded-full ${colorDot}"></span>
                    <span class="text-[13px] ${textColor} font-medium">${data}</span>
                  </div>`;
        },
      },
    ],
    drawCallback: function () {
      const pageDetails = transactionsTable.page.info();
      const $pagination = $("#qrUniqueTablePagination");
      $pagination.empty();

      if (pageDetails.pages <= 1) return;

      $("#qrUniqueTablePageCount").text(
        `${pageDetails.page + 1} / ${pageDetails.pages || 1}`
      );

      // Previous button
      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageDetails.page === 0
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF] cursor-pointer"
        }" onclick="changeTransactionsTablePage(${Math.max(0, pageDetails.page - 1)})">
          <div class="icon stratis-chevron-left text-xs"></div>
        </div>
      `);

      // Page buttons
      let paginationBtns = '<div class="flex gap-2">';
      for (let i = 0; i < pageDetails.pages; i++) {
        paginationBtns += `
          <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${i === pageDetails.page
            ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
            : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
          }" onclick="changeTransactionsTablePage(${i})">${i + 1}</button>
        `;
      }
      paginationBtns += "</div>";
      $pagination.append(paginationBtns);

      // Next button
      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageDetails.page === pageDetails.pages - 1
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF] cursor-pointer"
        }" onclick="changeTransactionsTablePage(${Math.min(
          pageDetails.page + 1,
          pageDetails.pages - 1
        )})">
          <div class="icon stratis-chevron-right text-xs"></div>
        </div>
      `);
    },
    createdRow: function (row) {
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          const isDark = $("html").hasClass("dark");
          $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });
    },
  });

  // Make transactions table globally accessible
  window.transactionsTable = transactionsTable;
  $("#tx-refresh").on("click", function () {
    // Reload the DataTable with current filters
    if (dataTable) {
      dataTable.ajax.reload(function (json) {
        console.log("DataTable refreshed successfully");
      }, false); // false means don't reset pagination
    }
  });

  // TX Refresh Button Handler
  $(document)
    .off("click.txRefresh", "#tx-refresh")
    .on("click.txRefresh", "#tx-refresh", function () {
      window.transactionsTable?.ajax?.reload(null, false);
    });

  // TX Debounced Search
  let txTimer;
  $(document)
    .off("keyup.txSearch", "#txSearch")
    .on("keyup.txSearch", "#txSearch", function () {
      clearTimeout(txTimer);
      txTimer = setTimeout(() => {
        const q = ($("#txSearch").val() || "").trim();
        window.transactionsTable.search(q).draw();
      }, 350);
    });
}

// Global function for transactions table pagination
window.changeTransactionsTablePage = function (page) {
  if (transactionsTable) {
    transactionsTable.page(page).draw("page");
  }
};

// **QR Table Search - unikallaşdırılmış**
$("#qrTableSearch").on("keyup", function () {
  const val = $(this).val();
  if (qrTable) qrTable.search(val).draw();
});

// === Status toggle (inside page) ===
window.togglePartnerStatus = function (partnerId) {
  try {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    const id = partnerId || window.selectedPartnerId;

    // Guard: if pending deletion (status 2), do nothing
    const $menu = $("#js-toggle-status-menu");
    const currentStatus = Number($menu.attr("data-status")); // 0/1
    if (currentStatus === 2) return;

    fetch(`/hovuz/partner/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "same-origin",
      body: JSON.stringify({ csrfToken }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (!res || !res.success) {
          const msg = (res && (res.error || res.message)) || "Xəta baş verdi";
          if (typeof toastr !== "undefined") toastr.error(msg);
          else alert(msg);
          return;
        }
        const newStatus = Number(res.status);

        const $menu = $("#js-toggle-status-menu");
        const $icon = $("#js-toggle-status-icon");
        const $text = $("#js-toggle-status-text");

        // reset classes
        $icon.removeClass(
          "stratis-minus-circle-contained text-error stratis-check-circle-contained text-success"
        );
        $text.removeClass("text-error text-success");
        $menu.removeClass("hover:bg-error-hover hover:bg-success-hover");

        if (newStatus === 1) {
          // now active -> show Deaktiv et
          $icon.addClass("stratis-minus-circle-contained text-error");
          $text.addClass("text-error").text("Deaktiv et");
          $menu.addClass("hover:bg-error-hover").attr("data-status", "1");
        } else if (newStatus === 0) {
          // now inactive -> show Aktiv et
          $icon.addClass("stratis-check-circle-contained text-success");
          $text.addClass("text-success").text("Aktiv et");
          $menu.addClass("hover:bg-success-hover").attr("data-status", "0");
        } else {
          // status 2 -> hide entry (in case it flips during session)
          $menu.closest("#js-toggle-status-menu").remove();
        }

        // Update global status
        window.selectedPartnerStatus = newStatus;

        // Toast
        if (typeof toastr !== "undefined") {
          toastr.success("Status yeniləndi");
        } else {
          alert("Status yeniləndi");
        }

        // Reload DTs without pagination reset (if present)
        if (window.qrTable?.ajax) window.qrTable.ajax.reload(null, false);
        if (window.transactionsTable?.ajax)
          window.transactionsTable.ajax.reload(null, false);

        // Refresh counters if available
        if (typeof window.loadPartnerCounts === "function") {
          window.loadPartnerCounts();
        }

        // Можно оставить авто-reload, но сначала проверь без него:
        // setTimeout(() => { location.reload(); }, 500);
      })
      .catch((err) => {
        console.error("togglePartnerStatus error:", err);
        if (typeof toastr !== "undefined") toastr.error("Server xətası");
        else alert("Server xətası");
      });
  } catch (e) {
    console.error("togglePartnerStatus runtime error:", e);
  }
};

// Central function to fetch workplace data and distribute to various components
// Returns a promise that resolves when the data is loaded and distributed
function fetchWorkplaceData(muessiseId) {
  // Extract partner ID from URL
  const pathSegments = window.location.pathname
    .split("/")
    .filter((segment) => segment);
  const partnerId = pathSegments[2];

  console.log(`Fetching all workplace data for workplace ID: ${muessiseId}`);
  console.log("Call stack:", new Error().stack);

  // Make a single API call to get all workplace statistics
  // Return the promise so we can chain operations
  return fetch(`/hovuz/partner/${partnerId}/workplace-stats/${muessiseId}`, {
    method: "POST",
    headers: {
      "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Distribute data to all components that need it

        // 1. Update chart display
        updateChartDisplay(data.data);

        // 2. Update amount slider range if that function is available
        if (
          typeof updateQrSliderRange === "function" &&
          data.data.minAmount !== undefined &&
          data.data.maxAmount !== undefined
        ) {
          console.log(
            "Updating QR slider with range:",
            data.data.minAmount,
            data.data.maxAmount
          );

          // Add padding for better UX
          const minAmount = Math.max(0, data.data.minAmount - 10);
          const maxAmount = data.data.maxAmount + 100;

          // Ensure reasonable range
          const finalMax = Math.max(maxAmount, minAmount + 1000);

          // Update the slider
          updateQrSliderRange(minAmount, finalMax);
        }

        // Return the data in case we need it elsewhere
        return data.data;
      } else {
        console.error("Failed to load workplace stats:", data.error);
        throw new Error(data.error || "Failed to load workplace stats");
      }
    })
    .catch((error) => {
      console.error("Error loading workplace stats:", error);
      throw error; // Re-throw so promise chain knows there was an error
    });
}

// Function to update the chart display with real data
function updateChartDisplay(statsData) {
  const { categories, totalAmount, formattedTotalAmount } = statsData;

  // Define category colors mapping
  const categoryColors = {
    "Yemək kartı": "#FCD099",
    Hədiyyə: "#99DEB4",
    Yanacaq: "#879AFC",
    Market: "#88649A",
    Biznes: "#00A3FF",
    Premium: "#32B5AC",
    "Avto Yuma": "#0076B2",
  };

  // Get the chart container
  const chartContainer = document.getElementById("workplaceChart");

  if (chartContainer) {
    // Clear existing category bars (keep only the total section)
    const existingBars = chartContainer.querySelectorAll(
      ".flex-col:not(.ml-1)"
    );
    existingBars.forEach((bar) => bar.remove());

    // Add new category bars
    categories.forEach((category, index) => {
      const color = categoryColors[category.category] || "#CCCCCC";
      const isFirst = index === 0;
      const isLast = index === categories.length - 1;

      let roundedClass = "";
      if (categories.length === 1) {
        roundedClass = "rounded-full";
      } else if (isFirst) {
        roundedClass = "rounded-l-full";
      } else if (isLast) {
        roundedClass = "rounded-r-full";
      }

      const textColorClass = [
        "#879AFC",
        "#88649A",
        "#00A3FF",
        "#32B5AC",
        "#0076B2",
      ].includes(color)
        ? "text-on-primary"
        : "text-messages";

      const barHTML = `
        <div class="flex flex-col whitespace-nowrap flex-1">
          <div class="text-[11px] font-normal text-messages opacity-50 mb-[6px]">
            ${category.category}
          </div>
          <div class="flex justify-between items-center ${roundedClass} h-[30px] w-full" style="background-color: ${color}">
            <div class="${textColorClass} text-[12px] font-medium pl-1">
              ${category.formattedAmount}
            </div>
            <div class="${textColorClass} text-[11px] font-normal opacity-65 pr-1">
              ${category.formattedPercentage}
            </div>
          </div>
        </div>
      `;

      // Insert before the total section
      const totalSection = chartContainer.querySelector(".ml-1");
      totalSection.parentNode.insertBefore($(barHTML)[0], totalSection);
    });

    // Update total amount
    const totalAmountElement = document.getElementById("totalAmount");
    if (totalAmountElement) {
      totalAmountElement.textContent = formattedTotalAmount;
    }
  }
}
