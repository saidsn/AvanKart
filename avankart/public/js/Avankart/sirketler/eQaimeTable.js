// Global dəyişənlər
let eQaimeTable = null;
let currentEqaimeFilters = {};
let globalMinCompanyAmount = 0;
let globalMaxCompanyAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatCompanyCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initCompanyAmountSlider() {
    if ($("#eQaime-amount-slider").hasClass("ui-slider")) {
      $("#eQaime-amount-slider").slider("destroy");
    }
    $("#eQaime-amount-slider").slider({
      range: true,
      min: globalMinCompanyAmount,
      max: globalMaxCompanyAmount,
      values: [globalMinCompanyAmount, globalMaxCompanyAmount],
      slide: function (event, ui) {
        $("#min-eQaime-amount-value").text(
          formatCompanyCurrency(ui.values[0])
        );
        $("#max-eQaime-amount-value").text(
          formatCompanyCurrency(ui.values[1])
        );
      },
    });

    $("#min-eQaime-amount-value").text(
      formatCompanyCurrency(globalMinCompanyAmount)
    );
    $("#max-eQaime-amount-value").text(
      formatCompanyCurrency(globalMaxCompanyAmount)
    );
  }

  function initializeEqaimeTable() {
    if ($.fn.DataTable.isDataTable("#eQaimeTable")) {
      eQaimeTable.destroy();
    }

    eQaimeTable = $("#eQaimeTable").DataTable({
      ajax: {
        url: "/api/avankart/sirketler/eQaime-table.json",
        type: "GET",
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
            ...currentEqaimeFilters,
          });
        },
        dataSrc: function (json) {
          $("#company-counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinCompanyAmount = Math.min(...amounts);
          globalMaxCompanyAmount = Math.max(...amounts);
          initCompanyAmountSlider();
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
          data: "cardName",
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
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data + " ₼" || "—") +
              "</span>"
            );
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = eQaimeTable.page.info();
        const $pagination = $("#eQaimePagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#eQaimePageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeEqaimePage(' +
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
            '" onclick="changeEqaimePage(' +
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
            '" onclick="changeEqaimePage(' +
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

        // Row klikləmə funksiyası
        $("#emeliyyatlarTable tbody").on("click", "tr", function () {
          // MainView gizlədilir
          $("#eQaimeMain").addClass("hidden");
          $("#companiesContainer").removeClass("hidden");
        });

        // Geri button
        $(document).on("click", "#backToTableContainer", function () {
          $("#eQaimeContainer").addClass("hidden");
          $("#tableContainer").removeClass("hidden");
        });
      },
    });
  }

  initializeEqaimeTable();
});

// Global functions
window.changeEqaimePage = function (page) {
  if (eQaimeTable) {
    eQaimeTable.page(page).draw("page");
  }
};

window.openEqaimeFilterModal = function () {
  if ($("#eQaimeFilterPopup").hasClass("hidden")) {
    $("#eQaimeFilterPopup").removeClass("hidden");
  } else {
    $("#eQaimeFilterPopup").addClass("hidden");
  }
};

window.closeEqaimeFilterModal = function () {
  $("#eQaimeFilterPopup").addClass("hidden");
};

window.applyEqaimeFilters = function () {
  console.log("=== Applying Eqaime Filters ===");

  currentEqaimeFilters = {};

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentEqaimeFilters.card_category = cardCategories;
  }

  if ($("#eQaime-amount-slider").hasClass("ui-slider")) {
    const minAmount = $("#eQaime-amount-slider").slider("values", 0);
    const maxAmount = $("#eQaime-amount-slider").slider("values", 1);
    if (minAmount !== null && maxAmount !== null) {
      currentEqaimeFilters.min_amount = minAmount;
      currentEqaimeFilters.max_amount = maxAmount;
    }
  }

  console.log("New currentEqaimeFilters:", currentEqaimeFilters);

  if (eQaimeTable) {
    console.log("Reloading Eqaime DataTable...");
    eQaimeTable.ajax.reload(null, false);
  }

  $("#eQaimeFilterPopup").addClass("hidden");
};

window.clearEqaimeFilters = function () {
  console.log("=== Clearing Eqaime filters ===");

  $("#eQaimeFilterForm")[0].reset();
  $('input[type="checkbox"]').prop("checked", false);

  if ($("#eQaime-amount-slider").hasClass("ui-slider")) {
    $("#eQaime-amount-slider").slider("values", [0, 10000]);
    $("#min-eQaime-amount-value").text("0 AZN");
    $("#max-eQaime-amount-value").text("10000 AZN");
  }

  currentEqaimeFilters = {};

  if (eQaimeTable) {
    console.log("Reloading Eqaime DataTable after clearing filters...");
    eQaimeTable.ajax.reload(null, true);
  }
};

window.openCompanyDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performEqaimeSearch() {
  const searchValue = $("#eQaimeSearch").val();
  if (eQaimeTable) {
    eQaimeTable.search(searchValue).draw();
  }
}

$("#eQaimeSearch").on("keyup", function (e) {
  performEqaimeSearch();
});

$(".go-eQaime-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".eQaime-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0 && eQaimeTable) {
    const pageInfo = eQaimeTable.page.info();
    let dataTablePage = pageNumber - 1;

    if (dataTablePage < pageInfo.pages) {
      eQaimeTable.page(dataTablePage).draw("page");
    } else {
      console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});
