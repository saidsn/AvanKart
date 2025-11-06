// Global dəyişənlər
let enterpriseRequestsTable = null;
let enterpriseRequestsFilters = {};
let globalMinAmountEnterprise = 0;
let globalMaxAmountEnterprise = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function initSliderEnterprise() {
    if ($("#slider-range-enterprise").hasClass("ui-slider")) {
      $("#slider-range-enterprise").slider("destroy");
    }
    $("#slider-range-enterprise").slider({
      range: true,
      min: globalMinAmountEnterprise,
      max: globalMaxAmountEnterprise,
      values: [globalMinAmountEnterprise, globalMaxAmountEnterprise],
      slide: function (event, ui) {
        $("#min-value-enterprise").text(ui.values[0]);
        $("#max-value-enterprise").text(ui.values[1]);
      },
    });

    // İlk göstəriş üçün birbaşa slider-in hazır qiymətlərini al
    const initialValues = $("#slider-range-enterprise").slider("values");
    $("#min-value-enterprise").text(initialValues[0]);
    $("#max-value-enterprise").text(initialValues[1]);
  }

  function initializeEnterpriseRequestsTable() {
    if ($.fn.DataTable.isDataTable("#enterpriseRequestsTable")) {
      enterpriseRequestsTable.destroy();
    }

    enterpriseRequestsTable = $("#enterpriseRequestsTable").DataTable({
      ajax: {
        url: "/avankartaz/muessise-muracietler",
        type: "GET",
        headers: { "X-CSRF-Token": csrfToken },
        data: function (d) {
          const params = {
            page: Math.floor(d.start / d.length) + 1,
            limit: d.length,
            search: d.search.value,
            ...enterpriseRequestsFilters,
          };
          return params;
        },
        dataSrc: function (json) {
          if (json.success && json.data) {
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
              <input type="checkbox" id="cb-enterprise-${idx}" class="peer hidden">
              <label for="cb-enterprise-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                <div class="icon stratis-check-01 scale-60 hidden peer-checked:block"></div>
              </label>
            `;
          },
        },
        {
          data: "institutionName",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "category",
          render: function (data) {
            let categoryName = "—";
            if (data && typeof data === 'object' && data.title) {
              categoryName = data.title.az || data.title.en || data.title.tr || data.title.ru || "—";
            } else if (typeof data === 'string') {
              categoryName = data;
            }
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              categoryName +
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
        const pageInfo = enterpriseRequestsTable.page.info();
        const $pagination = $("#enterpriseRequestsPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#enterpriseRequestsPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        // Left arrow
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeEnterpriseRequestsPage(${Math.max(
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
            }" onclick="changeEnterpriseRequestsPage(${i})">
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
          }" onclick="changeEnterpriseRequestsPage(${Math.min(
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
        $("#enterpriseRequestsTable thead tr").each(function () {
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

  initializeEnterpriseRequestsTable();
});

// Pagination
window.changeEnterpriseRequestsPage = function (page) {
  if (enterpriseRequestsTable) {
    enterpriseRequestsTable.page(page).draw("page");
  }
};

// Filter modal functions
window.toggleEnterpriseRequestsFilterModal = function () {
  if ($("#enterpriseRequestsFilterPop").hasClass("hidden")) {
    $("#enterpriseRequestsFilterPop").removeClass("hidden");
  } else {
    $("#enterpriseRequestsFilterPop").addClass("hidden");
  }
};

// Apply filters function for Enterprise Requests
window.applyEnterpriseRequestsFilters = function () {
  console.log("=== Applying Enterprise Requests filters ===");

  // Filterləri sıfırla
  enterpriseRequestsFilters = {};

  // Tarix aralığını al
  const startDate = $("#enterpriseRequestsStartDate").val();
  const endDate = $("#enterpriseRequestsEndDate").val();

  if (startDate) {
    enterpriseRequestsFilters.startDate = startDate;
  }

  if (endDate) {
    enterpriseRequestsFilters.endDate = endDate;
  }

  // Kart kateqoriyalarını al - category ID-ləri
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    enterpriseRequestsFilters.category = cardCategories.join(',');
  }

  console.log("New enterpriseRequestsFilters:", enterpriseRequestsFilters);

  // enterprise Requests cədvəlini yenilə
  if (enterpriseRequestsTable) {
    console.log("Reloading enterprise Requests DataTable...");
    enterpriseRequestsTable.ajax.reload(function (json) {
      console.log("Enterprise Requests DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#enterpriseRequestsFilterPop").addClass("hidden");
};

// Clear filters function for Enterprise Requests
window.clearEnterpriseRequestsFilters = function () {
  console.log("=== Clearing Enterprise Requests filters ===");

  // Reset form
  $("#enterpriseRequestsFilterForm")[0].reset();
  $("#enterpriseRequestsStartDate").val("");
  $("#enterpriseRequestsEndDate").val("");
  $('#enterpriseRequestsFilterForm input[type="checkbox"]').prop(
    "checked",
    false
  );

  // Clear filters
  enterpriseRequestsFilters = {};

  // Enterprise Requests cədvəlini yenilə
  if (enterpriseRequestsTable) {
    console.log(
      "Reloading Enterprise Requests DataTable after clearing filters..."
    );
    enterpriseRequestsTable.ajax.reload(function (json) {
      console.log("Enterprise Requests DataTable clear and reload completed");
    }, true);
  }
};

// Search
function performEnterpriseRequestsSearch() {
  const searchValue = $("#enterpriseRequestsSearch").val();
  if (enterpriseRequestsTable) {
    enterpriseRequestsTable.search(searchValue).draw();
  }
}

$("#enterpriseRequestsSearch").on("keyup", performEnterpriseRequestsSearch);

// GO button
$(".enterprise-requests-go-button").on("click", function (e) {
  e.preventDefault();
  const pageInput = $(this).siblings(".enterprise-requests-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");
  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (enterpriseRequestsTable) {
      const pageInfo = enterpriseRequestsTable.page.info();
      let dataTablePage = pageNumber - 1;
      if (dataTablePage < pageInfo.pages) {
        enterpriseRequestsTable.page(dataTablePage).draw("page");
      } else {
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});
