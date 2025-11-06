// Global variables
let selahiyyetDetailTable = null;
let currentselahiyyetDetailFilters = {};
let globalMinLimit = 0; // 'Amount' sözü 'Limit' ilə əvəz olundu
let globalMaxLimit = 0; // 'Amount' sözü 'Limit' ilə əvəz olundu

$(document).ready(function () {
  // You should define csrfToken in your HTML meta tag or retrieve it another way
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") || "mock-csrf-token";

  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initializeselahiyyetDetailDataTable() {
    // Check if the table is already a DataTable instance and destroy it
    if ($.fn.DataTable.isDataTable("#selahiyyetDetailTable")) {
      selahiyyetDetailTable.destroy();
    }

    // Initialize the DataTable with the provided settings
    selahiyyetDetailTable = $("#selahiyyetDetailTable").DataTable({
      ajax: {
        url: "/api/avankart/muessiseler/selahiyyetDetail-table.json",
        type: "GET",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          return JSON.stringify({
            selahiyyetDetail_id: $("#selahiyyetDetailId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            ...currentselahiyyetDetailFilters,
          });
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t", // Show only the table body
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 3,
      columns: [
        {
          data: "name",
          render: function (data, type, row) {
            return `
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                        ${row.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-messages text-[13px] font-medium dark:text-white text-left">${
                          row.name
                        }</span>
                        <span class="text-secondary-text text-[11px] font-normal dark:text-white text-left">ID: ${
                          row.id
                        }</span>
                    </div>
                </div>
            `;
          },
        },
        {
          data: "gender",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.gender}</span>`;
          },
        },
        {
          data: "position",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.position}</span>`;
          },
        },
        {
          data: "email",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.email}</span>`;
          },
        },
        {
          data: "phone",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.phone}</span>`;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = selahiyyetDetailTable.page.info();
        const $pagination = $("#selahiyyetDetailPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#selahiyyetDetailTablePageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeselahiyyetDetailPage(' +
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
            '" onclick="changeselahiyyetDetailPage(' +
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
            '" onclick="changeselahiyyetDetailPage(' +
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
          "padding-left": "10px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        // Row klikləmə funksiyası
        $("#selahiyyetDetailTable tbody").on("click", "tr", function () {
          // MainView gizlədilir
          $("#istifadecilerContent").addClass("hidden");
          $("#selahiyyetDetailDetail").removeClass("hidden");
        });

        // Geri button
        $(document).on("click", "#backToIStifadecilerContent", function () {
          $("#selahiyyetDetailDetail").addClass("hidden");
          $("#istifadecilerContent").removeClass("hidden");
        });
      },
    });
  }

  // Initialize DataTable when the document is ready
  initializeselahiyyetDetailDataTable();

  // Attach event listener for the "GO" button
  $(".selahiyyetDetail-go-button").on("click", function (e) {
    e.preventDefault();

    const pageInput = $(this).siblings(".selahiyyetDetail-page-input");
    let pageNumber = parseInt(pageInput.val());
    pageInput.val(""); // Clear the input field

    if (!isNaN(pageNumber) && pageNumber > 0) {
      if (selahiyyetDetailTable) {
        const pageInfo = selahiyyetDetailTable.page.info();
        let targetPage = pageNumber - 1;

        if (targetPage < pageInfo.pages) {
          selahiyyetDetailTable.page(targetPage).draw("page");
        } else {
          console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
        }
      }
    } else {
      console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
    }
  });
});

// Global function to change page
window.changeselahiyyetDetailPage = function (page) {
  if (selahiyyetDetailTable) {
    selahiyyetDetailTable.page(page).draw("page");
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

// Dropdown functions
window.toggleDropdown_position = function () {
  const dropdown = document.getElementById("dropdown_position");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

window.toggleDropdown_users = function () {
  const dropdown = document.getElementById("dropdown_users");
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

// Apply filters function
window.applyFilters = function () {
  console.log("=== Applying filters ===");

  // Filterləri sıfırla
  currentselahiyyetDetailFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  if (startDate) {
    currentselahiyyetDetailFilters.start_date = startDate;
  }

  if (endDate) {
    currentselahiyyetDetailFilters.end_date = endDate;
  }

  // Positions al
  const positions = [];
  $('#dropdown_position input[type="checkbox"]:checked').each(function () {
    const positionId = $(this).attr("id");
    positions.push(positionId.replace("subyekt-", ""));
  });

  if (positions.length > 0) {
    currentselahiyyetDetailFilters.positions = positions;
  }

  // Subyektləri al
  const companys = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    companys.push(companyId.replace("subyekt-", ""));
  });

  if (companys.length > 0) {
    currentselahiyyetDetailFilters.companys = companys;
  }

  // İstifadəçiləri al
  const users = [];
  $('#dropdown_users input[type="checkbox"]:checked').each(function () {
    const userId = $(this).attr("id");
    users.push(userId.replace("istifadeci-", ""));
  });

  if (users.length > 0) {
    currentselahiyyetDetailFilters.users = users;
  }

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentselahiyyetDetailFilters.card_category = cardCategories;
  }

  // Təyinatı al
  const cardDestinations = [];
  $('input[name="card_destination"]:checked').each(function () {
    cardDestinations.push($(this).val());
  });

  if (cardDestinations.length > 0) {
    currentselahiyyetDetailFilters.cardDestinations = cardDestinations;
  }

  // Genderları al
  const cardGender = [];
  $('input[name="card_gender"]:checked').each(function () {
    cardGender.push($(this).val());
  });

  //   if (cardGender.length > 0) {
  //     currentselahiyyetDetailFilters.card_gender =
  //       cardGender.length === 1 ? cardGender[0] : cardGender;
  //   }

  if (cardGender.length > 0) {
    currentselahiyyetDetailFilters.cardGender = cardGender;
  }

  // Məbləğ aralığını al (slider)
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      currentselahiyyetDetailFilters.min = minValue;
      currentselahiyyetDetailFilters.max = maxValue;
    }
  }

  console.log(
    "New currentselahiyyetDetailFilters:",
    currentselahiyyetDetailFilters
  );
  console.log(
    "currentselahiyyetDetailFilters keys:",
    Object.keys(currentselahiyyetDetailFilters)
  );

  // Məlumat cədvəlini yenilə
  if (selahiyyetDetailTable) {
    console.log("Reloading selahiyyetDetailTable...");
    selahiyyetDetailTable.ajax.reload(function (json) {
      console.log("selahiyyetDetailTable reload completed");
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
  currentselahiyyetDetailFilters = {};

  // Reload selahiyyetDetailTable
  if (selahiyyetDetailTable) {
    console.log("Reloading selahiyyetDetailTable after clearing filters...");
    selahiyyetDetailTable.ajax.reload(function (json) {
      console.log("selahiyyetDetailTable clear and reload completed");
    }, true);
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performselahiyyetDetailSearch() {
  const searchValue = $("#selahiyyetDetailSearch").val();
  if (selahiyyetDetailTable) {
    selahiyyetDetailTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#selahiyyetDetailSearch").on("keyup", function (e) {
  performselahiyyetDetailSearch();
});
