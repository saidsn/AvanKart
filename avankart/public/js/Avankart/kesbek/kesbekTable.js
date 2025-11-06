// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

window.formatCurrency = function (value) {
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₼"
  );
};

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");



  function initSlider() {
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

    // İlk değerleri yaz
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: "/cashback/cashback",
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          return JSON.stringify({
            user_id: $("#userId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: $("#customSearch").val() || "",
            ...currentFilters,
          });
        },
        dataSrc: function (json) {
          console.log("AJAX response:", json);
          $("#tr_counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinAmount = Math.min(...amounts);
          globalMaxAmount = Math.max(...amounts);
          initSlider();
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
      pageLength: 10,
      columns: [
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
          data: "customers",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "transactions",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
        {
          data: "amount",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
        {
          data: "date",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
        {
          data: "status",
          render: function (data, type, row) {
            let colorDot = "";

            const statusLower = (data || "").toLowerCase();

            if (statusLower === "davam edir") {
              colorDot = "bg-[#BFC8CC]";
            } else if (statusLower === "tamamlanıb") {
              colorDot = "bg-[#32B5AC]";
            }

            return `
            <div class="bg-container-2 inline-block px-3 py-[5px] rounded-full">
                <div class="flex items-center gap-2">
                    <span class="w-[6px] h-[6px] rounded-full ${colorDot} shrink-0"></span>
                    <span class="text-[13px] font-medium text-ellipsis">${data}</span>
                </div>
            </div>
            `;
          },
        },
      ],
      drawCallback: function (settings) {
        const json = settings.json;

        // Total Amountlar
        if (json?.totalAmount) {
          $("#totalOngoing").text(`${json.totalAmount.ongoing.toLocaleString("az", { minimumFractionDigits: 2 })} AZN`);
          $("#totalCompleted").text(`${json.totalAmount.complated.toLocaleString("az", { minimumFractionDigits: 2 })} AZN`);
          const total = (json.totalAmount.ongoing + json.totalAmount.complated).toLocaleString("az", { minimumFractionDigits: 2 });
          $("#totalAmount").text(`${total} AZN`);
        }

        // Cashback sayı
        const totalRecords = json?.recordsFiltered ?? json?.recordsTotal ?? 0;
        $("#cashbackCount").text(`Kəşbek (${totalRecords})`);

        // Pagination
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();

        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        if (pageInfo.pages <= 1) return;

        // Prev düyməsi
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 leading-tight ${pageInfo.page === 0 ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed" : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
      <div class="icon stratis-chevron-left text-xs"></div>
    </div>`
        );

        // Nömrəli səhifələr
        const paginationButtons = Array.from({ length: pageInfo.pages }, (_, i) => {
          return `<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${i === pageInfo.page ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark" : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
            }" onclick="changePage(${i})">${i + 1}</button>`;
        }).join("");

        $pagination.append(`<div class="flex gap-2">${paginationButtons}</div>`);

        // Next düyməsi
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed" : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changePage(${Math.min(pageInfo.page + 1, pageInfo.pages - 1)})">
      <div class="icon stratis-chevron-right text-xs"></div>
    </div>`
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

        $(row).find("td").addClass("border-b-[.5px] border-stroke");

        $(row).find("td:not(:last-child)").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        /* //  🔹 Bütün sətri kliklənən et
        $(row).on("click", function () {
          const recordId = data.id; // Backenddən gələn hər sətrin unikal id-si (məsələn)
          if (recordId) {
            location.href = `kesbekDetails.html?id=${recordId}`;
          } else {
            location.href = "kesbekDetails.html";
          }
        }); */

        // 🔹 Növbəti səhifəyə keçid
        $(row).on("click", function () {
          const folderId = data.invoice; // ya data.folder_id, backend-dən gələn dəyərə uyğun
          if (folderId) {
            location.href = `/emeliyyatlar/avankart/cashback/${folderId}`;
          }
        });
      },
    });
  }

  // Initialize DataTable
  initializeDataTable();
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};

// Filter modal functions
window.openFilterModal = function () {
  if ($("#filterPop").hasClass("hidden")) {
    $("#filterPop").removeClass("hidden");
  } else {
    $("#filterPop").addClass("hidden");
  }
};

window.closeFilterModal = function () {
  $("#filterPop").addClass("hidden");
};

$(document).ready(function () {
  // İlləri doldur
  const $dropdownYears = $("#dropdown_years");
  const currentYear = new Date().getFullYear();
  const yearsToShow = 7;

  $dropdownYears.empty(); // mövcud elementləri sil
  for (let i = 0; i < yearsToShow; i++) {
    const year = currentYear - i;
    const label = `
            <label for="year${year}" class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
                <input value="${year}" type="checkbox" id="year${year}" class="peer hidden">
                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <span class="dark:text-white">${year}</span>
            </label>
        `;
    $dropdownYears.append(label);
  }

  // Ayları doldur
  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
  const $dropdownMonths = $("#dropdown_months");
  $dropdownMonths.empty();

  months.forEach((month, index) => {
    const monthIndex = String(index + 1).padStart(2, "0");
    const label = `
            <label for="month${monthIndex}" class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
                <input type="checkbox" id="month${monthIndex}" value="month${monthIndex}" class="peer hidden">
                <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <span class="dark:text-white">${month}</span>
            </label>
        `;
    $dropdownMonths.append(label);
  });
});


// Dropdown functions
window.toggleDropdown_years = function () {
  const dropdown = document.getElementById("dropdown_years");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

window.toggleDropdown_months = function () {
  const dropdown = document.getElementById("dropdown_months");
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
  const yearDropdown = document.getElementById("dropdown_years");
  const monthsDropdown = document.getElementById("dropdown_months");
  const yearButton = document.getElementById("dropdownDefaultButton_years");
  const monthsButton = document.getElementById("dropdownDefaultButton_months");

  if (
    !yearButton.contains(event.target) &&
    !yearDropdown.contains(event.target)
  ) {
    yearDropdown.classList.add("hidden");
    yearDropdown.classList.remove("visible");
  }

  if (
    !monthsButton.contains(event.target) &&
    !monthsDropdown.contains(event.target)
  ) {
    monthsDropdown.classList.add("hidden");
    monthsDropdown.classList.remove("visible");
  }
});

// Apply filters function - düzəldilmiş versiya
// Debug üçün applyFilters funksiyasında əlavə kodlar
window.applyFilters = function () {
  console.log("=== Applying filters ===");

  // Filterləri sıfırla
  currentFilters = {};

  // İlləri al
  const years = [];
  $('#dropdown_years input[type="checkbox"]:checked').each(function () {
    const value = $(this).val();
    if (value) {
      years.push(value);
    }
  });
  if (years.length > 0) {
    currentFilters.years = years;
    console.log("Years selected:", years);
  }

  // Ayləri al
  const months = [];
  $('#dropdown_months input[type="checkbox"]:checked').each(function () {
    const value = $(this).val();
    if (value) {
      months.push(value);
    }
  });
  if (months.length > 0) {
    currentFilters.months = months;
    console.log("Months selected:", months);
  }

  // STATUS DEBUG - ətraflı yoxlama
  console.log("=== STATUS FILTER DEBUG ===");
  console.log("All status checkboxes:", $('input[name="card_status"]').length);
  console.log("Checked status checkboxes:", $('input[name="card_status"]:checked').length);

  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    const value = $(this).val();
    const id = $(this).attr('id');
    console.log(`Status checkbox found - ID: ${id}, Value: ${value}`);
    cardStatus.push(value);
  });

  console.log("Final cardStatus array:", cardStatus);

  if (cardStatus.length > 0) {
    currentFilters.card_status = cardStatus;
    console.log("Status filter set:", currentFilters.card_status);
  } else {
    console.log("No status selected!");
  }

  // Məbləğ aralığını al
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);

    if (minValue !== globalMinAmount || maxValue !== globalMaxAmount) {
      currentFilters.minAmount = minValue;
      currentFilters.maxAmount = maxValue;
      console.log("Amount range:", minValue, "to", maxValue);
    }
  }

  console.log("=== FINAL CURRENT FILTERS ===", currentFilters);

  // DataTable-ı reload et
  if (dataTable) {
    console.log("Reloading DataTable...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable reload completed", json);
    }, false);
  }

  // Filter modalını bağla
  $("#filterPop").addClass("hidden");
};

// Status checkbox-larını test etmək üçün
$(document).ready(function () {
  // Status checkbox-larına click event əlavə et
  $('input[name="card_status"]').on('change', function () {
    const value = $(this).val();
    const checked = $(this).is(':checked');
    console.log(`Status checkbox changed - Value: ${value}, Checked: ${checked}`);
  });

  // İlk yükləmədə status checkbox-larını yoxla
  console.log("=== INITIAL STATUS CHECKBOXES CHECK ===");
  $('input[name="card_status"]').each(function () {
    const value = $(this).val();
    const id = $(this).attr('id');
    const name = $(this).attr('name');
    console.log(`Found status checkbox - ID: ${id}, Name: ${name}, Value: ${value}`);
  });
});


// Clear filters function - düzəldilmiş versiya
window.clearFilters = function () {
  console.log("=== Clearing filters ===");

  // Form elementlərini sıfırla
  $("#filterForm")[0].reset();
  $('input[type="checkbox"]').prop("checked", false);

  // Slider-ı sıfırla
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [globalMinAmount, globalMaxAmount]);
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  // Filter obyektini təmizlə
  currentFilters = {};

  // DataTable-ı reload et
  if (dataTable) {
    console.log("Reloading DataTable after clearing filters...");
    dataTable.ajax.reload(null, true); // ikinci param true = səhifəni sıfırlayır
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

// Search
function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) {
    dataTable.ajax.reload(null, false);
  }
}

// Search inputuna event listener əlavə etmək
$("#customSearch").on("keyup", function () {
  performSearch();
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

$("#refreshButton").on("click", function (e) {
  e.preventDefault();
  if (dataTable) {
    dataTable.ajax.reload(null, false);
  }
});