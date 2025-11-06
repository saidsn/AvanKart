// Global dəyişənlər
let companyRequestsTable = null;
let companyRequestsFilters = {};
let globalMinAmountCompany = 0;
let globalMaxAmountCompany = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function initSliderCompany() {
    if ($("#slider-range-company").hasClass("ui-slider")) {
      $("#slider-range-company").slider("destroy");
    }
    $("#slider-range-company").slider({
      range: true,
      min: globalMinAmountCompany,
      max: globalMaxAmountCompany,
      values: [globalMinAmountCompany, globalMaxAmountCompany],
      slide: function (event, ui) {
        $("#min-value-company").text(ui.values[0]);
        $("#max-value-company").text(ui.values[1]);
      },
    });

    // İlk göstəriş üçün birbaşa slider-in hazır qiymətlərini al
    const initialValues = $("#slider-range-company").slider("values");
    $("#min-value-company").text(initialValues[0]);
    $("#max-value-company").text(initialValues[1]);
  }

  function initializeCompanyRequestsTable() {
    if ($.fn.DataTable.isDataTable("#companyRequestsTable")) {
      companyRequestsTable.destroy();
    }

    companyRequestsTable = $("#companyRequestsTable").DataTable({
      ajax: {
        url: "/avankartaz/sirket-muracietler",
        type: "GET",
        headers: { "X-CSRF-Token": csrfToken },
        data: function (d) {
          const params = {
            page: Math.floor(d.start / d.length) + 1,
            limit: d.length,
            search: d.search.value,
            ...companyRequestsFilters,
          };
          return params;
        },
        dataSrc: function (json) {
          if (json.success && json.data) {
            const counts = json.data.map((tr) => tr.employeeCount ?? 0);
            globalMinAmountCompany = json.filters?.minEmployeeCount ?? 0;
            globalMaxAmountCompany = json.filters?.maxEmployeeCount ?? 10000;
            initSliderCompany();
            return json.data;
          }
          return [];
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
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
              <input type="checkbox" id="cb-company-${idx}" class="peer hidden">
              <label for="cb-company-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                <div class="icon stratis-check-01 scale-60 hidden peer-checked:block"></div>
              </label>
            `;
          },
        },
        {
          data: "companyName",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "employeeCount",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "email",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "message",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "phone",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "createdAt",
          render: function (data) {
            if (!data) return '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">—</span>';
            const date = new Date(data);
            const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const formatted = `${day} ${month} ${year}`;
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              formatted +
              "</span>"
            );
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = companyRequestsTable.page.info();
        const $pagination = $("#companyRequestsPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#companyRequestsPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        // Left arrow
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeCompanyRequestsPage(${Math.max(
            0,
            pageInfo.page - 1
          )})">
              <div class="icon stratis-chevron-left text-xs"></div>
           </div>`
        );

        // Page buttons
        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
          paginationButtons += `
            <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${
              i === pageInfo.page
                ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
            }" onclick="changeCompanyRequestsPage(${i})">
              ${i + 1}
            </button>
          `;
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        // Right arrow
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === pageInfo.pages - 1
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeCompanyRequestsPage(${Math.min(
            pageInfo.page + 1,
            pageInfo.pages - 1
          )})">
              <div class="icon stratis-chevron-right text-xs"></div>
           </div>`
        );
      },
      createdRow: function (row, data, dataIndex) {
        const isDark = $("html").hasClass("dark");

        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            if (!$(this).hasClass("row-selected")) {
              $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
            }
          })
          .on("mouseleave", function () {
            if (!$(this).hasClass("row-selected")) {
              $(this).css("background-color", "");
            }
          });

        // Bütün td-lər üçün alt border və padding
        $(row).find("td").css({
          "border-bottom": ".5px solid #E5E5E5",
          "padding-left": "10px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        // Birinci sütun (checkbox)
        $(row).find("td:first-child").css({
          "border-right": ".5px solid #E5E5E5",
        });

        // Checkbox içindəki label üçün
        $(row).find("td:first-child label").css({
          margin: "0 auto", // horizontal ortala
        });

        // 1-ci th (checkbox) üçün
        $("#companyRequestsTable thead tr").each(function () {
          const firstTh = $(this).find("th:first-child");

          // Sağ border əlavə et
          firstTh.css({
            "border-right": ".5px solid #E5E5E5",
            "text-align": "center", // x-oxu üzrə ortala
          });

          // Checkbox label üçün horizontal ortalama
          firstTh.find("label").css({
            margin: "0 auto",
            display: "inline-block",
          });
        });
      },
    });
  }

  initializeCompanyRequestsTable();
});

// Pagination
window.changeCompanyRequestsPage = function (page) {
  if (companyRequestsTable) {
    companyRequestsTable.page(page).draw("page");
  }
};

// Filter modal functions
window.toggleCompanyRequestsFilterModal = function () {
  if ($("#companyRequestsFilterPop").hasClass("hidden")) {
    $("#companyRequestsFilterPop").removeClass("hidden");
  } else {
    $("#companyRequestsFilterPop").addClass("hidden");
  }
};

// Apply filters function for Company Requests
window.applyCompanyRequestsFilters = function () {
  console.log("=== Applying Company Requests filters ===");

  // Filterləri sıfırla
  companyRequestsFilters = {};

  // Tarix aralığını al
  const startDate = $("#companyRequestsStartDate").val();
  const endDate = $("#companyRequestsEndDate").val();

  if (startDate) {
    companyRequestsFilters.startDate = startDate;
  }

  if (endDate) {
    companyRequestsFilters.endDate = endDate;
  }

  // İşçi sayı aralığını al (slider)
  if ($("#slider-range-company").hasClass("ui-slider")) {
    const minValue = $("#slider-range-company").slider("values", 0);
    const maxValue = $("#slider-range-company").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      companyRequestsFilters.minEmployeeCount = minValue;
      companyRequestsFilters.maxEmployeeCount = maxValue;
    }
  }

  console.log("New companyRequestsFilters:", companyRequestsFilters);

  // Company Requests cədvəlini yenilə
  if (companyRequestsTable) {
    console.log("Reloading Company Requests DataTable...");
    companyRequestsTable.ajax.reload(function (json) {
      console.log("Company Requests DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#companyRequestsFilterPop").addClass("hidden");
};

// Clear filters function for Company Requests
window.clearCompanyRequestsFilters = function () {
  console.log("=== Clearing Company Requests filters ===");

  // Reset form
  $("#companyRequestsFilterForm")[0].reset();
  $("#companyRequestsStartDate").val("");
  $("#companyRequestsEndDate").val("");
  $('#companyRequestsFilterForm input[type="checkbox"]').prop("checked", false);

  // Reset slider
  if ($("#slider-range-company").hasClass("ui-slider")) {
    $("#slider-range-company").slider("values", [globalMinAmountCompany, globalMaxAmountCompany]);
    $("#min-value-company").text(globalMinAmountCompany);
    $("#max-value-company").text(globalMaxAmountCompany);
  }

  // Clear filters
  companyRequestsFilters = {};

  // Company Requests cədvəlini yenilə
  if (companyRequestsTable) {
    console.log(
      "Reloading Company Requests DataTable after clearing filters..."
    );
    companyRequestsTable.ajax.reload(function (json) {
      console.log("Company Requests DataTable clear and reload completed");
    }, true);
  }
};

// Search
function performCompanyRequestsSearch() {
  const searchValue = $("#companyRequestsSearch").val();
  if (companyRequestsTable) {
    companyRequestsTable.search(searchValue).draw();
  }
}

$("#companyRequestsSearch").on("keyup", performCompanyRequestsSearch);

// GO button
$(".company-requests-go-button").on("click", function (e) {
  e.preventDefault();
  const pageInput = $(this).siblings(".company-requests-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");
  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (companyRequestsTable) {
      const pageInfo = companyRequestsTable.page.info();
      let dataTablePage = pageNumber - 1;
      if (dataTablePage < pageInfo.pages) {
        companyRequestsTable.page(dataTablePage).draw("page");
      } else {
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});
