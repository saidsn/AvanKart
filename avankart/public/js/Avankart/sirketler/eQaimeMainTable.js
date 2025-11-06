// Global dəyişənlər eQaimeMain üçün
let eQaimeMainTable = null;
let currentEqaimeMainFilters = {};
let globalMinMainCompanyAmount = 0;
let globalMaxMainCompanyAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatMainCompanyCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initMainCompanyAmountSlider() {
    if ($("#eQaimeMain-mebleg-slider").hasClass("ui-slider")) {
      $("#eQaimeMain-mebleg-slider").slider("destroy");
    }
    $("#eQaimeMain-mebleg-slider").slider({
      range: true,
      min: globalMinMainCompanyAmount,
      max: globalMaxMainCompanyAmount,
      values: [globalMinMainCompanyAmount, globalMaxMainCompanyAmount],
      slide: function (event, ui) {
        $("#eQaimeMain-min-mebleg-value").text(
          formatMainCompanyCurrency(ui.values[0])
        );
        $("#eQaimeMain-max-mebleg-value").text(
          formatMainCompanyCurrency(ui.values[1])
        );
      },
    });

    $("#eQaimeMain-min-mebleg-value").text(
      formatMainCompanyCurrency(globalMinMainCompanyAmount)
    );
    $("#eQaimeMain-max-mebleg-value").text(
      formatMainCompanyCurrency(globalMaxMainCompanyAmount)
    );
  }

  function initializeEqaimeMainTable() {
    if ($.fn.DataTable.isDataTable("#eQaimeMainTable")) {
      eQaimeMainTable.destroy();
    }

    eQaimeMainTable = $("#eQaimeMainTable").DataTable({
      ajax: {
        url: "/api/avankart/sirketler/eQaimeMain-table.json",
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
            ...currentEqaimeMainFilters,
          });
        },
        dataSrc: function (json) {
          $("#main-company-counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinMainCompanyAmount = Math.min(...amounts);
          globalMaxMainCompanyAmount = Math.max(...amounts);
          initMainCompanyAmountSlider();
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
          data: "amount",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data + " ₼" || "—") +
              "</span>"
            );
          },
        },
        {
          data: "date",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: function (row) {
            let color = "";
            switch (row.status) {
              case "Aktiv":
                color = "bg-[#4FC3F7]";
                break;
              case "Qaralama":
                color = "bg-[#BDBDBD]";
                break;
              case "Təsdiqlənib":
                color = "bg-[#32B5AC]";
                break;
              case "Gözləyir":
                color = "bg-[#FFCA28]";
                break;
              case "Report edildi":
                color = "bg-[#EF5350]";
                break;
              default:
                color = "bg-[#FF7043]";
            }
            return `
              <div class="flex items-center justify-start text-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                  <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                  <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
              </div>
            `;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = eQaimeMainTable.page.info();
        const $pagination = $("#eQaimeMainPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#eQaimeMainPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeEqaimeMainPage(' +
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
            '" onclick="changeEqaimeMainPage(' +
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
            '" onclick="changeEqaimeMainPage(' +
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
        $("#eQaimeMainTable tbody").on("click", "tr", function () {
          // MainView gizlədilir
          $("#eQaimeMain").addClass("hidden");
          $("#eQaimeContainer").removeClass("hidden");
        });

        // Geri button
        $(document).on("click", "#backToeQaimeMain", function () {
          $("#eQaimeContainer").addClass("hidden");
          $("#eQaimeMain").removeClass("hidden");
        });
      },
    });
  }

  initializeEqaimeMainTable();
});

// Global functions eQaimeMain üçün
window.changeEqaimeMainPage = function (page) {
  if (eQaimeMainTable) {
    eQaimeMainTable.page(page).draw("page");
  }
};

window.openEqaimeMainFilterModal = function () {
  if ($("#eQaimeMainFilterPopup").hasClass("hidden")) {
    $("#eQaimeMainFilterPopup").removeClass("hidden");
  } else {
    $("#eQaimeMainFilterPopup").addClass("hidden");
  }
};

window.closeEqaimeMainFilterModal = function () {
  $("#eQaimeMainFilterPopup").addClass("hidden");
};

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

window.applyEqaimeMainFilters = function () {
  currentEqaimeMainFilters = {};

  const status = [];
  $('input[name="eQaimeMain_card_status"]:checked').each(function () {
    status.push($(this).val());
  });

  if (status.length > 0) currentEqaimeMainFilters.card_status = status;

  // Years al
  const years = [];
  $('#dropdown_years input[type="checkbox"]:checked').each(function () {
    const yearId = $(this).attr("id");
    years.push(yearId.replace("subyekt-", ""));
  });

  if (years.length > 0) {
    currentEqaimeMainFilters.years = years;
  }

  // Months al
  const months = [];
  $('#dropdown_months input[type="checkbox"]:checked').each(function () {
    const monthId = $(this).attr("id");
    months.push(monthId.replace("istifadeci-", ""));
  });

  if (months.length > 0) {
    currentEqaimeMainFilters.months = months;
  }

  if ($("#eQaimeMain-mebleg-slider").hasClass("ui-slider")) {
    const minAmount = $("#eQaimeMain-mebleg-slider").slider("values", 0);
    const maxAmount = $("#eQaimeMain-mebleg-slider").slider("values", 1);
    if (minAmount !== null && maxAmount !== null) {
      currentEqaimeMainFilters.min_amount = minAmount;
      currentEqaimeMainFilters.max_amount = maxAmount;
    }
  }

  console.log("New currentEmeliyyatlarFilters:", currentEqaimeMainFilters);

  if (eQaimeMainTable) {
    console.log("Reloading Emeliyyatlar DataTable...");
    eQaimeMainTable.ajax.reload(null, false);
  }

  $("#eQaimeMainFilterPopup").addClass("hidden");
};

window.clearEqaimeMainFilters = function () {
  $("#eQaimeMainFilterForm")[0].reset();
  $('input[type="checkbox"]').prop("checked", false);

  // implement olacaq bu
  if ($("#eQaimeMain-mebleg-slider").hasClass("ui-slider")) {
    $("#eQaimeMain-mebleg-slider").slider("values", [0, 10000]);
    $("#eQaimeMain-min-mebleg-value").text("0 ₼");
    $("#eQaimeMain-max-mebleg-value").text("10000 ₼");
  }

  currentEqaimeMainFilters = {};

  if (eQaimeMainTable) {
    console.log("Reloading Emeliyyatlar DataTable after clearing filters...");
    eQaimeMainTable.ajax.reload(null, true);
  }
};

function performEqaimeMainSearch() {
  const searchValue = $("#eQaimeMainSearch").val();
  if (eQaimeMainTable) {
    eQaimeMainTable.search(searchValue).draw();
  }
}

$("#eQaimeMainSearch").on("keyup", function () {
  performEqaimeMainSearch();
});

$(".go-eQaimeMain-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".eQaimeMain-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0 && eQaimeMainTable) {
    const pageInfo = eQaimeMainTable.page.info();
    let dataTablePage = pageNumber - 1;

    if (dataTablePage < pageInfo.pages) {
      eQaimeMainTable.page(dataTablePage).draw("page");
    } else {
      console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});
