// Global dəyişənlər
let emeliyyatlarTable = null;
let currentEmeliyyatlarFilters = {};
let globalMinMebleg = 0;
let globalMaxMebleg = 0;

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

  function initMeblegSlider() {
    if ($("#mebleg-slider").hasClass("ui-slider")) {
      $("#mebleg-slider").slider("destroy");
    }
    $("#mebleg-slider").slider({
      range: true,
      min: globalMinMebleg,
      max: globalMaxMebleg,
      values: [globalMinMebleg, globalMaxMebleg],
      slide: function (event, ui) {
        $("#min-mebleg-value").text(formatCurrency(ui.values[0]));
        $("#max-mebleg-value").text(formatCurrency(ui.values[1]));
      },
    });

    $("#min-mebleg-value").text(formatCurrency(globalMinMebleg));
    $("#max-mebleg-value").text(formatCurrency(globalMaxMebleg));
  }

  function initializeEmeliyyatlarTable() {
    if ($.fn.DataTable.isDataTable("#emeliyyatlarTable")) {
      emeliyyatlarTable.destroy();
    }

    emeliyyatlarTable = $("#emeliyyatlarTable").DataTable({
      ajax: {
        url: "/emeliyyatlar/muessise/hesablasma/json/",
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
            start_date: d.startDate,
            end_date: d.endDate,
            ...currentEmeliyyatlarFilters,
          });
        },
        dataSrc: function (json) {
          
          $("#emeliyyat-counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinMebleg = Math.min(...amounts);
          globalMaxMebleg = Math.max(...amounts);
          initMeblegSlider();
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
      pageLength: 5,
      columns: [
        {
          data: "invoice",
          render: function (data,row) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "transactionNumber",
          
          render: function (data) {
            
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data ) +
              "</span>"
            );
          },
        },
        {
          data: "amount",
          render: function (data,row) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "commission",
          render: function (data,row) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data) +
              "</span>"
            );
          },
        },
        {
          data: "finalAmount",
          render: function (data,row) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              ( data) +
              "</span>"
            );
          },
        },
        {
          data: "date",
          render: function (data,row) {           
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              ( data || "—") +
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
              case "Tamamlandı":
                color = "bg-[#66BB6A]";
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
        const pageInfo = emeliyyatlarTable.page.info();
        const $pagination = $("#emeliyyatlarPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#emeliyyatlarPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeEmeliyyatlarPage(' +
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
            '" onclick="changeEmeliyyatlarPage(' +
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
            '" onclick="changeEmeliyyatlarPage(' +
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
          $("#tableContainer").addClass("hidden");
          $("#companiesContainer").removeClass("hidden");
        });

        // Geri button
        $(document).on("click", "#backToTableContainer", function () {
          $("#companiesContainer").addClass("hidden");
          $("#tableContainer").removeClass("hidden");
        });
      },
    });
  }

  initializeEmeliyyatlarTable(); // "Təyinat" dropdown'u üçün event listener
});

// Global functions
window.changeEmeliyyatlarPage = function (page) {
  if (emeliyyatlarTable) {
    emeliyyatlarTable.page(page).draw("page");
  }
};

$("#reloadPage").on("click", function (){
    window.location.reload()
})


window.openEmeliyyatlarFilterModal = function () {
  if ($("#emeliyyatlarFilterPopup").hasClass("hidden")) {
    $("#emeliyyatlarFilterPopup").removeClass("hidden");
  } else {
    $("#emeliyyatlarFilterPopup").addClass("hidden");
  }
};

window.closeEmeliyyatlarFilterModal = function () {
  $("#emeliyyatlarFilterPopup").addClass("hidden");
};

// Apply filters function
window.applyEmeliyyatlarFilters = function () {
  console.log("=== Applying Emeliyyatlar Filters ===");

  currentEmeliyyatlarFilters = {};

  const startDate = $('input[name="emeliyyatlar_start_date"]').val();
  const endDate = $('input[name="emeliyyatlar_end_date"]').val();

  if (startDate) currentEmeliyyatlarFilters.start_date = startDate;
  if (endDate) currentEmeliyyatlarFilters.end_date = endDate;

  const kartStatuslari = [];
  $('input[name="emeliyyatlar_card_status"]:checked').each(function () {
    kartStatuslari.push($(this).val());
  });

  if (kartStatuslari.length > 0)
    currentEmeliyyatlarFilters.kart_statuslari = kartStatuslari;

  if ($("#mebleg-slider").hasClass("ui-slider")) {
    const minMebleg = $("#mebleg-slider").slider("values", 0);
    const maxMebleg = $("#mebleg-slider").slider("values", 1);
    if (minMebleg !== null && maxMebleg !== null) {
      currentEmeliyyatlarFilters.min_mebleg = minMebleg;
      currentEmeliyyatlarFilters.max_mebleg = maxMebleg;
    }
  }

  console.log("New currentEmeliyyatlarFilters:", currentEmeliyyatlarFilters);

  if (emeliyyatlarTable) {
    console.log("Reloading Emeliyyatlar DataTable...");
    emeliyyatlarTable.ajax.reload(null, false);
  }

  $("#emeliyyatlarFilterPopup").addClass("hidden");
};

// Clear filters function
window.clearEmeliyyatlarFilters = function () {
  console.log("=== Clearing Emeliyyatlar filters ===");
  $("#emeliyyatlarFilterForm").on("submit",function(e) {
    e.preventDefault();
    submit("emeliyyatlarFilter")
  })
  $("#emeliyyatlarFilterForm")[0].reset();
  $("#emeliyyatlar_start_date").val("");
  $("#emeliyyatlar_end_date").val("");
  $('input[type="checkbox"]').prop("checked", false);

  // implement olacaq bu
  if ($("#mebleg-slider").hasClass("ui-slider")) {
    $("#mebleg-slider").slider("values", [0, 10000]);
    $("#min-mebleg-value").text("0 AZN");
    $("#max-mebleg-value").text("10000 AZN");
  }

  currentEmeliyyatlarFilters = {};

  if (emeliyyatlarTable) {
    console.log("Reloading Emeliyyatlar DataTable after clearing filters...");
    emeliyyatlarTable.ajax.reload(null, true);
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performEmeliyyatlarSearch() {
  const searchValue = $("#emeliyyatlarSearch").val();
  if (emeliyyatlarTable) {
    emeliyyatlarTable.search(searchValue).draw();
  }
}

$("#emeliyyatlarSearch").on("keyup", function (e) {
  performEmeliyyatlarSearch();
});

$(".go-emeliyyatlar-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".emeliyyatlar-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0 && emeliyyatlarTable) {
    const pageInfo = emeliyyatlarTable.page.info();
    let dataTablePage = pageNumber - 1;

    if (dataTablePage < pageInfo.pages) {
      emeliyyatlarTable.page(dataTablePage).draw("page");
    } else {
      console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});
