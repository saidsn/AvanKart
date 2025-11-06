// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  const pathParts = window.location.pathname.split('/');
  const folderId = pathParts[pathParts.length - 1]; // sonuncu hissə AINV-000002 olacaq
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
        url: `/cashback/cashback/${folderId}`, // burada dinamik folderId
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          return JSON.stringify({
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            search: $("#customSearch").val(),
            ...currentFilters,
          });
        },
        dataSrc: function (json) {
          $("#tr_counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinAmount = Math.min(...amounts);
          globalMaxAmount = Math.max(...amounts);
          initSlider();
          console.log("DataTable AJAX data source:", json);

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
          data: "user",
          render: function (row) {
            return `
             <div class="flex flex-col items-start gap-[2px]">
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.user}</span>
                <span class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-normal">ID: ${row.userId}</span>
            </div>
            `;
          },
        },
        {
          data: "transactionId",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "cardCategory",
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
          data: "settlementDate",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
      ],
      drawCallback: function (settings) {

        const json = settings.json;

        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();


        // Cashback sayı
        const totalRecords = json?.recordsFiltered ?? json?.recordsTotal ?? 0;
        $("#header-data-count").text(`Kəşbek (${totalRecords})`);


        // Səhifə sayı textini yenilə
        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        if (pageInfo.pages <= 1) return;

        // Prev düyməsi
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 leading-tight ${pageInfo.page === 0
            ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
      <div class="icon stratis-chevron-left text-xs"></div>
    </div>`
        );

        // Nömrəli səhifə düymələri
        const paginationButtons = Array.from({ length: pageInfo.pages }, (_, i) => {
          return `<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${i === pageInfo.page
              ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
              : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
            }" onclick="changePage(${i})">${i + 1}</button>`;
        }).join("");

        $pagination.append(`<div class="flex gap-2">${paginationButtons}</div>`);

        // Next düyməsi
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 leading-tight ${pageInfo.page === pageInfo.pages - 1
            ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-[#FFFFFF] cursor-pointer"
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

// Apply filters function
window.applyFilters = function () {
  console.log("=== Applying filters ===");

  // Filterləri sıfırla
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  if (startDate) {
    currentFilters.start_date = startDate;
  }

  if (endDate) {
    currentFilters.end_date = endDate;
  }

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentFilters.card_category = cardCategories;
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

// Search
function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) {
    dataTable.ajax.reload(null, false);
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

$("#refreshButton").on("click", function (e) {
  e.preventDefault();
  if (dataTable) {
    dataTable.ajax.reload(null, false);
  }
});

/* // 1. URL-dən id götürən funksiya
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const recordId = getQueryParam("id");

// 2. Backenddən datanı götürüb DOM-a yerləşdirən funksiya
function displayDetails(data) {
  document.getElementById("detail-invoice").textContent = data.invoice || "—";
  document.getElementById("detail-customers").textContent =
    data.customers || "—";
  document.getElementById("detail-transactions").textContent =
    data.transactions || "—";
  document.getElementById("detail-amount").textContent = data.amount || "—";
  document.getElementById("detail-date").textContent =
    data.settlementDate || "—";

  // Status üçün həm mətn, həm də rəngli nöqtə əlavə edə bilərsən:
  const statusContainer = document.getElementById("detail-status");
  const status = data.status || "";

  let colorDot = "";
  const statusLower = status.toLowerCase();
  if (statusLower === "davam edir") {
    colorDot = "#BFC8CC";
  } else if (statusLower === "tamamlanıb") {
    colorDot = "#32B5AC";
  } else {
    colorDot = "#BFC8CC"; // default rəng
  }

  statusContainer.innerHTML = `
    <div class="flex items-center gap-2">
      <span style="width:6px; height:6px; border-radius:50%; background-color: ${colorDot}; flex-shrink:0;"></span>
      <span class="text-[13px] font-medium text-ellipsis">${status}</span>
    </div>
  `;
}

// 3. API sorğusu və datanın doldurulması
if (recordId) {
  fetch(`/api/avankart/kesbek/details?id=${encodeURIComponent(recordId)}`, {
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content"),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Server error");
      return res.json();
    })
    .then((data) => {
      // Backenddən gəldiyi kimi obyekt formatındadır
      displayDetails(data);
    })
    .catch((err) => {
      console.error("Data fetch error:", err);
      // Burada istifadəçiyə xəta mesajı göstərə bilərsən
    });
} else {
  console.warn("ID URL-də tapılmadı.");
} */
