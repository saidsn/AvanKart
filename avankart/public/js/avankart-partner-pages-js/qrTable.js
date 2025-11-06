// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + " ₼";
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
      }
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
        url: "/partner/avankart-partner/transactions-table",
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
            search: d.search.value,
            ...currentFilters, // filtre varsa buradan gelmeli
          });
        },
        dataSrc: function (json) {
          $("#qr_code_counts").html(json.data.length ?? 0);
          const amounts = json.data.map(tr => tr.amount);
          globalMinAmount = Math.min(...amounts);
          globalMaxAmount = Math.max(...amounts);
          initSlider();
          return json.data;
        }
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: false,
      pageLength: 10,
      columns: [
        {
          data: "transaction_id",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              data +
              "</span>"
            );
          },
        },
        {
          data: "cardCategory",
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
          render: function (amount) {
            return (
              '<div class="flex items-center gap-1 text-messages dark:text-on-primary-dark">' +
              '<span class="text-[13px] font-normal">' +
              parseFloat(amount).toFixed(2) +
              "</span>" +
              '<div class="icon stratis-currency-coin-manat w-5 h-5"></div>' +
              "</div>"
            );
          },
        },
        {
          data: "createdAt",
          render: function (date) {
            const formatted = new Date(date).toLocaleString("az-AZ");
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              formatted +
              "</span>"
            );
          },
        },
        {
          data: "status",
          render: function (status) {
            const isSuccess = status === "success";
            return (
              '<div class="flex items-center gap-2">' +
              '<span class="w-[6px] h-[6px] rounded-full ' +
              (isSuccess ? "bg-success" : "bg-error") +
              '"></span>' +
              '<div class="flex items-center gap-7.5 justify-between">' +
              '<span class="text-[13px] font-medium ' +
              (isSuccess ? "text-success" : "text-error") +
              '">' +
              (isSuccess ? "Uğurlu" : "Uğursuz") +
              "</span>" +
              (isSuccess
                ? ""
                : '<div class="iconex iconex-info-circle-1 text-error w-5 h-5"></div>') +
              "</div>" +
              "</div>"
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
              : "text-messages dark:text-[#FFFFFF]") +
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
              : "text-messages dark:text-[#FFFFFF]") +
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
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "right",
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

  // Reset filters
  currentFilters = {};

  // Get date range
  const startDate = $("#startDate").val();
  const endDate = $("#endDate").val();

  if (startDate) {
    currentFilters.start_date = startDate;
  }

  if (endDate) {
    currentFilters.end_date = endDate;
  }

  // Get card categories
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentFilters.card_category = cardCategories;
  }

  // Get status
  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    cardStatus.push($(this).val());
  });

  if (cardStatus.length > 0) {
    currentFilters.card_status =
      cardStatus.length === 1 ? cardStatus[0] : cardStatus;
  }

  // Get range slider values
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

  if (dataTable) {
    console.log("Reloading DataTable...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable reload completed");
    }, false);
  }

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

function isciniSil() {
  if ($("#iscisilDiv").hasClass("hidden")) {
    $("#overlay").removeClass("hidden");
    $("#iscisilDiv").removeClass("hidden");
  } else {
    $("#overlay").addClass("hidden");
    $("#iscisilDiv").addClass("hidden");
  }
}

function siltesdiq() {
  const email = document.getElementById("userEmail").textContent;

  console.log("=== Confirm delete user with email:", email, "===");
  const id = document.getElementById("userId").value;
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  console.log("=== Confirm delete user with ID:", id, "===");
  console.log("=== Confirm delete user CSRF Token:", csrfToken, "===");
  $.ajax({
    url: "/muessise-info/delete-user",
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({ id: id }),
    success: function (response) {
      console.log("=== User deletion response:", response, "===");
      if (response.success && response.otpRequired) {
        Otp(email);
      } else {
        console.error("=== Error deleting user:", response.message, "===");
      }
    },
    error: function (xhr, status, error) {
      console.error("=== AJAX error:", status, error, "===");
    },
  });
  $("#overlay").addClass("hidden");
  $("#iscisilDiv").addClass("hidden");
}
