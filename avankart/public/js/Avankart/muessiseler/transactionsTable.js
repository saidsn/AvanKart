// Global dəyişənlər
let transactionsTable = null;
let currentTransactionsFilters = {};
let globalMinTransactionAmount = 0;
let globalMaxTransactionAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatTransactionCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initTransactionAmountSlider() {
    if ($("#transaction-amount-slider").hasClass("ui-slider")) {
      $("#transaction-amount-slider").slider("destroy");
    }
    $("#transaction-amount-slider").slider({
      range: true,
      min: globalMinTransactionAmount,
      max: globalMaxTransactionAmount,
      values: [globalMinTransactionAmount, globalMaxTransactionAmount],
      slide: function (event, ui) {
        $("#min-transaction-amount-value").text(
          formatTransactionCurrency(ui.values[0])
        );
        $("#max-transaction-amount-value").text(
          formatTransactionCurrency(ui.values[1])
        );
      },
    });

    $("#min-transaction-amount-value").text(
      formatTransactionCurrency(globalMinTransactionAmount)
    );
    $("#max-transaction-amount-value").text(
      formatTransactionCurrency(globalMaxTransactionAmount)
    );
  }

  function initializeTransactionsTable() {
    if ($.fn.DataTable.isDataTable("#transactionsTable")) {
      transactionsTable.destroy();
    }

    transactionsTable = $("#transactionsTable").DataTable({
      ajax: {
        url: "/muessiseler/transactions-table",
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
            ...currentTransactionsFilters,
          });
        },
        dataSrc: function (json) {
          $("#transaction-counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinTransactionAmount = Math.min(...amounts);
          globalMaxTransactionAmount = Math.max(...amounts);
          initTransactionAmountSlider();
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
      pageLength: 2,
      columns: [
        {
          data: function (row) {
            return `
            <div class="flex items-center gap-3 relative">
              <div class="flex flex-col gap-0.5">
                <span class="font-medium text-[#1D222B] text-[13px]">${row.name}</span>
                <span class="text-[11px] text-[#1D222B] opacity-70 font-normal">ID: ${row.id}</span>
              </div>
            </div>
          `;
          },
        },
        {
          data: "trasactionID",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.trasactionID}</span>`;
          },
        },
        {
          data: "cardCategory",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.cardCategory}</span>`;
          },
        },
        {
          data: "amount",
          render: function (data, type, row) {
            const amount = parseFloat(row.amount); // convert to number
            const colorClass = amount < 0 ? "text-error" : "text-messages";
            return `<span class="flex text-[13px] font-normal ${colorClass}">${row.amount}</span>`;
          },
        },
        {
          data: "location",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.location}</span>`;
          },
        },
        {
          data: "date",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = transactionsTable.page.info();
        const $pagination = $("#transactionsPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#transactionsPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeTransactionsPage(' +
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
            '" onclick="changeTransactionsPage(' +
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
            '" onclick="changeTransactionsPage(' +
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

        //! 🔹 Növbəti səhifəyə keçid (kecid deyisecek)
        $(row).on("click", function () {
          location.href = "../avankart-people/avankart-people.html";
        });
      },
    });
  }

  initializeTransactionsTable();
});

// Global functions
window.changeTransactionsPage = function (page) {
  if (transactionsTable) {
    transactionsTable.page(page).draw("page");
  }
};

window.openTransactionsFilterModal = function () {
  if ($("#transactionsFilterPopup").hasClass("hidden")) {
    $("#transactionsFilterPopup").removeClass("hidden");
  } else {
    $("#transactionsFilterPopup").addClass("hidden");
  }
};

window.closeTransactionsFilterModal = function () {
  $("#transactionsFilterPopup").addClass("hidden");
};

// Dropdown toggle functions
window.toggleDropdown_transactionUsers = function () {
  const dropdown = document.getElementById("dropdown_transactionUsers");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

window.toggleDropdown_transactionLocations = function () {
  const dropdown = document.getElementById("dropdown_transactionLocations");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

// Close dropdowns when clicking outside
document.addEventListener("click", function (event) {
  const usersDropdown = document.getElementById("dropdown_transactionUsers");
  const locationsDropdown = document.getElementById(
    "dropdown_transactionLocations"
  );
  const usersButton = document.getElementById(
    "dropdownDefaultButton_transactionUsers"
  );
  const locationsButton = document.getElementById(
    "dropdownDefaultButton_transactionLocations"
  );

  if (
    !usersButton.contains(event.target) &&
    !usersDropdown.contains(event.target)
  ) {
    usersDropdown.classList.add("hidden");
    usersDropdown.classList.remove("visible");
  }

  if (
    !locationsButton.contains(event.target) &&
    !locationsDropdown.contains(event.target)
  ) {
    locationsDropdown.classList.add("hidden");
    locationsDropdown.classList.remove("visible");
  }
});

// Apply Transactions Filters
window.applyTransactionsFilters = function () {
  console.log("=== Applying Transactions Filters ===");

  currentTransactionsFilters = {};

  // Tarix aralığını al
  const startDate = $("#startDate").val();
  const endDate = $("#endDate").val();
  console.log(startDate,"start ")

  if (startDate) currentTransactionsFilters.start_date = startDate;
  if (endDate) currentTransactionsFilters.end_date = endDate;

  // İstifadəçiləri al
  const users = [];
  $("#dropdown_transactionUsers input[type='checkbox']:checked").each(
    function () {
      const userId = $(this).attr("id");
      users.push(userId.replace("user-", ""));
    }
  );
  if (users.length > 0) currentTransactionsFilters.users = users;

  // Məkanları al
  const locations = [];
  $("#dropdown_transactionLocations input[type='checkbox']:checked").each(
    function () {
      const locationId = $(this).attr("id");
      locations.push(locationId.replace("location-", ""));
    }
  );
  if (locations.length > 0) currentTransactionsFilters.locations = locations;

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentTransactionsFilters.card_category = cardCategories;
  }

  // Məbləğ aralığını al (slider)
  if ($("#transactions-amount-slider").hasClass("ui-slider")) {
    const minAmount = $("#transactions-amount-slider").slider("values", 0);
    const maxAmount = $("#transactions-amount-slider").slider("values", 1);
    if (minAmount !== null && maxAmount !== null) {
      currentTransactionsFilters.min_amount = minAmount;
      currentTransactionsFilters.max_amount = maxAmount;
    }
  }

  console.log("New currentTransactionsFilters:", currentTransactionsFilters);

  // DataTable reload
  if (transactionsTable) {
    console.log("Reloading Transactions DataTable...");
    transactionsTable.ajax.reload(null, false);
  }

  // Popup bağla
  $("#transactionsFilterPopup").addClass("hidden");
};

// Clear Transactions Filters
window.clearTransactionsFilters = function () {
  console.log("=== Clearing Transactions Filters ===");

  $("#transactionsFilterForm")[0].reset();
  $('input[type="checkbox"]').prop("checked", false);

  // Slider reset
  if ($("#transactions-amount-slider").hasClass("ui-slider")) {
    $("#transactions-amount-slider").slider("values", [0, 10000]);
    $("#min-transactions-amount-value").text("0 AZN");
    $("#max-transactions-amount-value").text("10000 AZN");
  }

  currentTransactionsFilters = {};

  // DataTable reload
  if (transactionsTable) {
    console.log("Reloading Transactions DataTable after clearing filters...");
    transactionsTable.ajax.reload(null, true);
  }
};

window.openTransactionDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performTransactionsSearch() {
  const searchValue = $("#transactionsSearch").val();
  if (transactionsTable) {
    transactionsTable.search(searchValue).draw();
  }
}

$("#transactionsSearch").on("keyup", function () {
  performTransactionsSearch();
});

$(".go-transactions-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".transactions-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0 && transactionsTable) {
    const pageInfo = transactionsTable.page.info();
    let dataTablePage = pageNumber - 1;

    if (dataTablePage < pageInfo.pages) {
      transactionsTable.page(dataTablePage).draw("page");
    } else {
      console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});
