// Global dəyişənlər
let companiesTable = null;
let currentCompaniesFilters = {};
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
    if ($("#company-amount-slider").hasClass("ui-slider")) {
      $("#company-amount-slider").slider("destroy");
    }
    $("#company-amount-slider").slider({
      range: true,
      min: globalMinCompanyAmount,
      max: globalMaxCompanyAmount,
      values: [globalMinCompanyAmount, globalMaxCompanyAmount],
      slide: function (event, ui) {
        $("#min-company-amount-value").text(
          formatCompanyCurrency(ui.values[0])
        );
        $("#max-company-amount-value").text(
          formatCompanyCurrency(ui.values[1])
        );
      },
    });

    $("#min-company-amount-value").text(
      formatCompanyCurrency(globalMinCompanyAmount)
    );
    $("#max-company-amount-value").text(
      formatCompanyCurrency(globalMaxCompanyAmount)
    );
  }

  function initializeCompaniesTable() {
    if ($.fn.DataTable.isDataTable("#companiesTable")) {
      companiesTable.destroy();
    }

    companiesTable = $("#companiesTable").DataTable({
      ajax: {
        url: "/emeliyyatlar/muessise/hesablasma/json",
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
            ...currentCompaniesFilters,
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
      pageLength: 10,
      columns: [
        {
          data: function (row,data) {
            return `
            <div class="flex items-center gap-3 relative">
              <div class="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-table-hover text-[#7F57F1] font-semibold text-lg  overflow-hidden">
                <!-- Burada istəyə görə loqonun ilk hərfləri və ya şəkil ola bilər -->
                <img src="/images/${row.logo}" /> 
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="font-medium text-[#1D222B] text-[13px]">${row.companyName || "-"}</span>
                <span class="text-[11px] text-[#1D222B] opacity-70 font-normal">ID: ${row?.companyId || "-"}</span>
              </div>
            </div>
          `;
          },
        },
        {
          data: "transactionCount",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data || "-"}</span>`;
          },
        },
        {
          data: "amount",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data || "-"}</span>`;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = companiesTable.page.info();
        const $pagination = $("#companiesPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#companiesPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeCompaniesPage(' +
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
            '" onclick="changeCompaniesPage(' +
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
            '" onclick="changeCompaniesPage(' +
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
        $("#companiesTable tbody").on("click", "tr", function () {
          // MainView gizlədilir
          $("#companiesContainer").addClass("hidden");
          $("#transactionContainer").removeClass("hidden");
        });

        // Geri button
        $(document).on("click", "#backToCompaniesContainer", function () {
          $("#transactionContainer").addClass("hidden");
          $("#companiesContainer").removeClass("hidden");
        });
      },
    });
  }

  initializeCompaniesTable();
   $("#reloadPage").on("click", function (){
      if(companiesTable){ 
      companiesTable.ajax.reload(null,false)
      }
    })
});

// Global functions
window.changeCompaniesPage = function (page) {
  if (companiesTable) {
    companiesTable.page(page).draw("page");
  }
};

window.openCompaniesFilterModal = function () {
  if ($("#companiesFilterPopup").hasClass("hidden")) {
    $("#companiesFilterPopup").removeClass("hidden");
  } else {
    $("#companiesFilterPopup").addClass("hidden");
  }
};

window.closeCompaniesFilterModal = function () {
  $("#companiesFilterPopup").addClass("hidden");
};

window.toggleDropdown_companies = function () {
  const dropdown = document.getElementById("dropdown_companies");
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
  const positionDropdown = document.getElementById("dropdown_position");
  const usersDropdown = document.getElementById("dropdown_users");
  const positionButton = document.getElementById(
    "dropdownDefaultButton_position"
  );
  const usersButton = document.getElementById("dropdownDefaultButton_users");

  if (
    !positionButton.contains(event.target) &&
    !positionDropdown.contains(event.target)
  ) {
    positionDropdown.classList.add("hidden");
    positionDropdown.classList.remove("visible");
  }

  if (
    !usersButton.contains(event.target) &&
    !usersDropdown.contains(event.target)
  ) {
    usersDropdown.classList.add("hidden");
    usersDropdown.classList.remove("visible");
  }
});

window.applyCompaniesFilters = function () {
  console.log("=== Applying Companies Filters ===");

  currentCompaniesFilters = {};

  // Company-leri al
  const companies = [];
  $('#dropdown_companies input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    companies.push(companyId.replace("company-", ""));
  });

  if (companies.length > 0) {
    currentCompaniesFilters.companies = companies;
  }

  if ($("#company-amount-slider").hasClass("ui-slider")) {
    const minAmount = $("#company-amount-slider").slider("values", 0);
    const maxAmount = $("#company-amount-slider").slider("values", 1);
    if (minAmount !== null && maxAmount !== null) {
      currentCompaniesFilters.min_amount = minAmount;
      currentCompaniesFilters.max_amount = maxAmount;
    }
  }

  console.log("New currentCompaniesFilters:", currentCompaniesFilters);

  if (companiesTable) {
    console.log("Reloading Companies DataTable...");
    companiesTable.ajax.reload(null, false);
  }

  $("#companiesFilterPopup").addClass("hidden");
};

window.clearCompaniesFilters = function () {
  console.log("=== Clearing Companies filters ===");

  $("#companiesFilterForm")[0].reset();
  $('input[type="checkbox"]').prop("checked", false);

  if ($("#company-amount-slider").hasClass("ui-slider")) {
    $("#company-amount-slider").slider("values", [0, 10000]);
    $("#min-company-amount-value").text("0 AZN");
    $("#max-company-amount-value").text("10000 AZN");
  }

  currentCompaniesFilters = {};

  if (companiesTable) {
    console.log("Reloading Companies DataTable after clearing filters...");
    companiesTable.ajax.reload(null, true);
  }
};

window.openCompanyDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performCompaniesSearch() {
  const searchValue = $("#companiesSearch").val();
  if (companiesTable) {
    companiesTable.search(searchValue).draw();
  }
}

$("#companiesSearch").on("keyup", function (e) {
  performCompaniesSearch();
});

$(".go-companies-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".companies-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0 && companiesTable) {
    const pageInfo = companiesTable.page.info();
    let dataTablePage = pageNumber - 1;

    if (dataTablePage < pageInfo.pages) {
      companiesTable.page(dataTablePage).draw("page");
    } else {
      console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});
