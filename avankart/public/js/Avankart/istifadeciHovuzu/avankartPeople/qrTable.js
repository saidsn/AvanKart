// Global dəyişənlər
let qrTable = null;
let qrFilters = {};
let qrMinAmount = 0;
let qrMaxAmount = 0;

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

  function initSlider() {
    if ($("#qrTableSliderRange").hasClass("ui-slider")) {
      $("#qrTableSliderRange").slider("destroy");
    }
    $("#qrTableSliderRange").slider({
      range: true,
      min: qrMinAmount,
      max: qrMaxAmount,
      values: [qrMinAmount, qrMaxAmount],
      slide: function (event, ui) {
        $("#qrTableMinValue").text(formatCurrency(ui.values[0]));
        $("#qrTableMaxValue").text(formatCurrency(ui.values[1]));
      },
    });

    $("#qrTableMinValue").text(formatCurrency(qrMinAmount));
    $("#qrTableMaxValue").text(formatCurrency(qrMaxAmount));
  }

  function initializeQrTable() {
    if ($.fn.DataTable.isDataTable("#qrTable")) {
      qrTable.destroy();
      $("#qrTable").empty();
    }

    qrTable = $("#qrTable").DataTable({
      ajax: {
        url: "/api/avankart/istifadeciHovuzu/avankartPartner/avankartPartner-qr-details.json",
        type: "GET",
        contentType: "application/json",
        headers: { "X-CSRF-Token": csrfToken },
        data: function (d) {
          return JSON.stringify({
            user_id: $("#userId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            ...qrFilters,
          });
        },
        dataSrc: function (json) {
          $("#1r_counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          qrMinAmount = Math.min(...amounts);
          qrMaxAmount = Math.max(...amounts);
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
      pageLength: 3,
      columns: [
        {
          data: "transactionId",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal">${
              data || "—"
            }</span>`,
        },
        {
          data: "cardCategory",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal">${
              data || "—"
            }</span>`,
        },
        {
          data: "amount",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal">${
              data || "—"
            }</span>`,
        },
        {
          data: "date",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal">${
              data || "—"
            }</span>`,
        },
        {
          data: "status",
          render: function (data) {
            let colorDot = "",
              textColor = "",
              infoIconHTML = "";
            if (data === "Uğurlu" || data === "Davam edir") {
              colorDot = "bg-[#5BBE2D]";
              textColor = "text-[#5BBE2D]";
            } else if (data === "Uğursuz") {
              colorDot = "bg-[#DD3838]";
              textColor = "text-[#DD3838]";
              infoIconHTML = `<div class="tooltip w-[20px] h-[20px] rounded-full flex items-center justify-center cursor-pointer relative"><div onmouseover="showErrorTooltip(this)" data-error="Sistemlə əlaqə saxlanıla bilmədi!" class="iconex iconex-info-circle-1 w-5 h-5 text-[#D93E35] font-semibold relative"></div></div>`;
            } else {
              colorDot = "bg-[#BFC8CC]";
              textColor = "text-messages";
            }
            return `<div class="flex justify-between items-center px-3 py-[5px] rounded-full w-full max-w-[240px] whitespace-nowrap text-ellipsis">
                    <div class="flex items-center gap-2 flex-1 overflow-hidden">
                        <span class="w-[6px] h-[6px] rounded-full ${colorDot} shrink-0"></span>
                        <span class="text-[13px] ${textColor} font-medium overflow-hidden text-ellipsis">${data}</span>
                    </div>
                    ${infoIconHTML}
                  </div>`;
          },
        },
      ],
      drawCallback: function () {
        const pageDetails = qrTable.page.info();
        const $pagination = $("#qrUniqueTablePagination");
        $pagination.empty();

        if (pageDetails.pages <= 1) return;

        $("#qrUniqueTablePageCount").text(
          `${pageDetails.page + 1} / ${pageDetails.pages || 1}`
        );

        // Previous button
        $pagination.append(`
    <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
      pageDetails.page === 0
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF] cursor-pointer"
    }" onclick="changeQrTablePage(${Math.max(0, pageDetails.page - 1)})">
      <div class="icon stratis-chevron-left text-xs"></div>
    </div>
  `);

        // Page buttons
        let paginationBtns = '<div class="flex gap-2">';
        for (let i = 0; i < pageDetails.pages; i++) {
          paginationBtns += `
      <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${
        i === pageDetails.page
          ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
          : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
      }" onclick="changeQrTablePage(${i})">${i + 1}</button>
    `;
        }
        paginationBtns += "</div>";
        $pagination.append(paginationBtns);

        // Next button
        $pagination.append(`
    <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
      pageDetails.page === pageDetails.pages - 1
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF] cursor-pointer"
    }" onclick="changeQrTablePage(${Math.min(
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
  }

  initializeQrTable();
});

window.changeQrTablePage = function (page) {
  if (qrTable) {
    qrTable.page(page).draw("page");
  }
};

// Filter modal functions
window.openQrFilterModal = function () {
  if ($("#qrFilterPop").hasClass("hidden")) {
    $("#qrFilterPop").removeClass("hidden");
  } else {
    $("#qrFilterPop").addClass("hidden");
  }
};

window.closeQrFilterModal = function () {
  $("#qrFilterPop").addClass("hidden");
};

// Apply filters function
window.applyQrFilters = function () {
  console.log("=== Applying filters ===");

  // Filterləri sıfırla
  qrFilters = {};

  // Tarix aralığını al
  const qrStartDate = $("#qrStartDate").val();
  const qrEndDate = $("#qrEndDate").val();

  if (qrStartDate) {
    qrFilters.qrStartDate = qrStartDate;
  }

  if (qrEndDate) {
    qrFilters.qrEndDate = qrEndDate;
  }

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    qrFilters.card_category = cardCategories;
  }

  // Statusları al
  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    cardStatus.push($(this).val());
  });

  if (cardStatus.length > 0) {
    qrFilters.cardStatus = cardStatus;
  }

  // Məbləğ aralığını al (slider)
  if ($("#qrTableSliderRange").hasClass("ui-slider")) {
    const minValue = $("#qrTableSliderRange").slider("values", 0);
    const maxValue = $("#qrTableSliderRange").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      qrFilters.min = minValue;
      qrFilters.max = maxValue;
    }
  }

  console.log("New qrFilters:", qrFilters);
  console.log("qrFilters keys:", Object.keys(qrFilters));

  // Məlumat cədvəlini yenilə
  if (qrTable) {
    console.log("Reloading DataTable...");
    qrTable.ajax.reload(function (json) {
      console.log("DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#qrFilterPop").addClass("hidden");
};

// Clear filters function
window.clearQrFilters = function () {
  console.log("=== Clearing filters ===");

  // Reset form
  $("#qrFilterForm")[0].reset();
  $("#qrStartDate").val("");
  $("#qrEndDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  // Slider-i sıfırla
  if ($("#qrTableSliderRange").hasClass("ui-slider")) {
    $("#qrTableSliderRange").slider("values", [0, 10000]);
    $("#qrTableMinValue").text("0 AZN");
    $("#qrTableMaxValue").text("10000 AZN");
  }

  // Clear filters
  qrFilters = {};

  // Reload DataTable
  if (qrTable) {
    console.log("Reloading DataTable after clearing filters...");
    qrTable.ajax.reload(function (json) {
      console.log("DataTable clear and reload completed");
    }, true);
  }
};

// Tarix picker açmaq funksiyası
window.openQrDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

// **QR Table Search - unikallaşdırılmış**
$("#qrTableSearch").on("keyup", function () {
  const val = $(this).val();
  if (qrTable) qrTable.search(val).draw();
});

// **QR Table Pagination düymələri**
$(document).on("click", ".qrTablePageBtn", function () {
  const page = parseInt($(this).data("page"));
  if (!isNaN(page) && qrTable) qrTable.page(page).draw("page");
});

// **QR Table GO button**
$(".qrUniqueTableGoButton").on("click", function (e) {
  e.preventDefault();
  const pageInput = $(this).siblings(".qrUniqueTablePageInput");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (qrTable) {
      const pageInfo = qrTable.page.info();
      let qrTablePage = pageNumber - 1;
      if (qrTablePage < pageInfo.pages) qrTable.page(qrTablePage).draw("page");
      else console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
    }
  } else console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
});

// Əvvəlcə, tooltipi göstərmək üçün olan funksiyanızı yeniləyək
window.showErrorTooltip = function (element) {
  // Əgər tooltip artıq mövcuddursa, onu silir
  if ($("#error-tooltip").length) {
    $("#error-tooltip").remove();
  }

  // Elementin data-error atributundan səhv mesajını alır
  const errorMessage = $(element).data("error");
  if (!errorMessage) return;

  // Yeni bir tooltip elementi yaradır
  const tooltip = $(
    `<div id="error-tooltip" class="absolute z-50 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg -bottom-10 right-0 whitespace-nowrap">
      ${errorMessage}
      <div class="tooltip-arrow absolute w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-gray-800 -top-[33%] right-2"></div>
    </div>`
  );

  // Tooltipi elementin yanına əlavə edir
  $(element).parent().append(tooltip);
};

// Mouse elementin üzərindən çəkiləndə tooltipi silmək üçün funksiya
$(document).on("mouseleave", ".tooltip", function () {
  $("#error-tooltip").remove();
});
