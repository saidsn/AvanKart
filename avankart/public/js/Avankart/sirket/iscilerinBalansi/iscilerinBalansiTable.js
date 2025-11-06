// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  // "inactive",
  // "active",
  // "passive",
  // "canceled",
  // "waiting",
  // "reported",
  // "completed",
  function mapStatusLabel(raw) {
    // Küçük harf status → Text ve renk map'i
    const statusMap = {
      inactive:  { text: "Inactive", color: "#BDBDBD" }, // gri
      active:    { text: "Active", color: "#4FC3F7" },   // mavi
      passive:   { text: "Passive", color: "#BDBDBD" },  // gri
      canceled:  { text: "Canceled", color: "#EF5350" }, // kırmızı
      waiting:   { text: "Waiting", color: "#FFCA28" },  // sarı
      reported:  { text: "Reported", color: "#EF5350" }, // kırmızı
      completed: { text: "Completed", color: "#66BB6A" } // yeşil
    };

    return statusMap[raw] || { text: raw || "-", color: "#FF7043" }; // default narıncı
  }
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
      url: "/emeliyyatlar/sirket/isciler/data",
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
          search: $("#customSearch").val(),
          ...currentFilters, // filtre varsa buradan gelmeli
        });
      },
      dataSrc: function (json) {
        $("#tr_counts").html(json.recordsFiltered ?? 0);
        globalMinAmount = Math.min(0);
        globalMaxAmount = json.globalMaxAmount ?? 10000;
        initSlider()
        return json.data;
      },
    },
    serverSide: true,
    processing: true,
    dom: "t",
    pageLength: 10,
    columns: [
      {
        data: function (data, type, row) {
          return `
             <div class="flex justify-center items-center gap-2.5">
                  <div class="flex justify-center items-center">
                      <div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">
                          <img src="https://company.avankart.com/${data.company_logo}" class="object-cover" alt="Logo">
                      </div>
                  </div>
                  <div class="w-full">
                      <div class="text-[13px] font-medium">${data.company_name}</div>
                      <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${data.company_id}</span></div>
                  </div>
              </div>
          `;
        },
      },
      {
        data: function(data) {
          return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${data.invoice_number || "—"}</span>`;
        }
      },
      {
        data: function(data) {
          return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${data.card_count || "0"}</span>`;
        }
      },
      {
        data: function (data) {
          return `<span class="text-[13px]  text-messages dark:text-primary-text-color-dark font-normal">${data.formatted_amount} ₼</span>`;
        },
      },
      {
        data: function(data) {
          if (!data?.date) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">-</span>`;
          }

          const d = new Date(data.date);
          if (isNaN(d)) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">-</span>`;
          }

          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, "0");
          const minutes = String(d.getMinutes()).padStart(2, "0");

          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${day}.${month}.${year} ${hours}:${minutes}</span>`;
        }
      },
      {
        data: function (row) {
          let color = "";
          let status = mapStatusLabel(row.status)

          return `
                 <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    <span class="w-[6px] h-[6px] rounded-full bg-[${status?.color ?? '-'}] shrink-0 mr-2"></span>
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${status?.text ?? '-'}</span>
                </div>
                `;
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
    createdRow: function (row, data) {
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

      // 🔹 bütün satıra click redirect
      $(row).on("click", function (e) {
          // invoice_number varsa onu kullan, yoksa _id
          const invoice = data.invoice_number || data._id;
          location.href = "/emeliyyatlar/sirket/isciler/" + encodeURIComponent(invoice);
      });
    },
  });
}

// initialize
initializeDataTable();
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};
window.refreshPage =  function (e) {
  if (dataTable) {
    dataTable.ajax.reload(function () {}, true); 
  }
  return false;
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

  if ( companyButton &&
    !companyButton.contains(event.target) &&
    !companyDropdown.contains(event.target)
  ) {
    companyDropdown.classList.add("hidden");
    companyDropdown.classList.remove("visible");
  }
});

// Apply filters function
window.applyFilters = function () {
  console.log("=== Applying filters ===");

  // Filterləri sıfırla
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  if (startDate) {
    currentFilters.startDate = startDate;
  }

  if (endDate) {
    currentFilters.endDate = endDate;
  }

  // Subyektləri al
  const companies = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    companies.push(companyId.replace("subyekt-", ""));
  });

  if (companies.length > 0) {
    currentFilters.companies = companies;
  }

  // Statusları al
  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    cardStatus.push($(this).val());
  });

  //   if (cardStatus.length > 0) {
  //     currentFilters.card_status =
  //       cardStatus.length === 1 ? cardStatus[0] : cardStatus;
  //   }

  if (cardStatus.length > 0) {
    currentFilters.cards = cardStatus;
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

  // Reset form
  $("#filterForm")[0].reset();
  $("#startDate").val("");
  $("#endDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  // implement olacaq bu
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [0, 10000]);
    $("#min-value").text("0 AZN");
    $("#max-value").text("10000 AZN");
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

function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) {
    dataTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#customSearch").on("keyup", function (e) {
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
