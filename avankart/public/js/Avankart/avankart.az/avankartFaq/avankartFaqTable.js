// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

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
      },
    });

    // İlk değerleri yaz
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  function initializeDataTable() {
    // Yalnız #myTable elementı varsa initialize et
    if ($("#myTable").length === 0) {
      return;
    }

    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: "/avankartaz/faq/list",
        type: "GET",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          const page = Math.floor(d.start / d.length) + 1;
          return {
            page: page,
            limit: d.length,
            search: d.search.value,
            lang: "az", // Default language
            ...currentFilters, // filtre varsa buradan gelmeli
          };
        },
        dataSrc: function (json) {
          if (json.success && json.data) {
            $("#category-count").html("FAQ (" + (json.pagination?.total ?? 0) + ")");
            json.recordsTotal = json.pagination?.total ?? 0;
            json.recordsFiltered = json.pagination?.total ?? 0;
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
          data: "question",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "answer",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "faqCategory",
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
        {
          data: function (row) {
            let dropdownContent = "";
            dropdownContent = `
                <div onclick='toggleEditModal(${JSON.stringify(
                  row
                )})' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-edit-03 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Redaktə et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                 <div onclick='toggleDeleteModal("${row._id}")' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                  <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                  <span class="font-medium text-error text-[13px] whitespace-nowrap">Sil</span>
                </div>
              `;

            return `
              <div id="wrapper" class="relative inline-block text-left">
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages text-base cursor-pointer z-100"></div>

                <div class="hidden absolute right-[-12px] max-w-[244px] z-50 dropdown-menu">

                  <div class="relative h-[8px]">
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>

                  <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
                    <div class="py-[3.5px] text-sm">
                      ${dropdownContent}
                    </div>
                  </div>
                </div>
              </div>
            `;
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
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
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
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
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
          "padding-left": "10px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
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

  // Filterləri sıfırla
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  if (startDate) {
    currentFilters.start_date = startDate;
  }

  if (endDate) {
    currentFilters.end_date = endDate;
  }

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentFilters.card_category = cardCategories;
  }

  console.log("New currentFilters:", currentFilters);
  console.log("currentFilters keys:", Object.keys(currentFilters));

  // Məlumat cədvəlini yenilə
  if (dataTable) {
    console.log("Reloading DataTable...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable reload completed");
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
  $('input[type="checkbox"]').prop("checked", false);

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

// Search
function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) {
    dataTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#customSearch").on("keyup", function (e) {
  performSearch();
});

// Sehifeler arasi kecid GO button ile
$(".go-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".page-input");
  let pageNumber = parseInt(pageInput.val());

  // Input sahəsini hər halda təmizləyirik
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (dataTable) {
      const pageInfo = dataTable.page.info();
      let dataTablePage = pageNumber - 1;

      if (dataTablePage < pageInfo.pages) {
        // Səhifə mövcuddursa, keçid edir
        dataTable.page(dataTablePage).draw("page");
      } else {
        // Səhifə mövcud deyilsə, xəta yazır
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    // Etibarsız girişdə xəta yazır
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");

  // Xaricə kliklənəndə bağla
  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// Global variable for delete
let currentDeletingFaqId = null;

window.toggleDeleteModal = function (faqId = null) {
  const modal = $("#deleteModal");

  if (modal.hasClass("hidden")) {
    currentDeletingFaqId = faqId;
    modal.removeClass("hidden");
  } else {
    currentDeletingFaqId = null;
    modal.addClass("hidden");
  }
};

window.toggleEditModal = function (rowData = null) {
  const modal = $("#editModal");

  if (modal.hasClass("hidden")) {
    // Modalı aç
    modal.removeClass("hidden");

    const questionInput = modal.find('input[type="text"]'); // Sual input
    const answerDiv = modal.find("#editChoiceContent"); // Cavab contenteditable
    const langButtons = modal.find(".lang-btn"); // Dil düymələri
    const checkboxes = modal.find('input[type="checkbox"]'); // Kateqoriya checkbox

    if (rowData && rowData.question) {
      // DataTable-dən gələn redaktə
      questionInput.val(rowData.question);
    } else {
      // Yeni sual əlavə
      questionInput.val("");

      // Dil düymələrini default vəziyyətə qaytar: Azərbaycan seçili
      langButtons
        .removeClass(
          "active text-messages bg-inverse-on-surface cursor-default"
        )
        .addClass("text-tertiary-text cursor-pointer");

      modal
        .find(".lang-btn")
        .first() // İlk düymə = Azərbaycan
        .addClass("active text-messages bg-inverse-on-surface cursor-default")
        .removeClass("text-tertiary-text cursor-pointer");
    }

    // Cavab həmişə boş olsun
    answerDiv.html("");

    // Kateqoriya checkboxlarını sıfırla
    checkboxes.prop("checked", false);
  } else {
    // Modalı bağla
    modal.addClass("hidden");
  }
};

// Delete FAQ function
$(document).ready(function() {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Delete confirmation button
  $("#deleteModal").find("button").last().on("click", function() {
    if (!currentDeletingFaqId) {
      console.error("No FAQ ID to delete");
      return;
    }

    $.ajax({
      url: `/avankartaz/faq/${currentDeletingFaqId}`,
      type: "DELETE",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      success: function(response) {
        if (response.success) {
          // Close modal
          $("#deleteModal").addClass("hidden");
          currentDeletingFaqId = null;

          // Reload table
          if (dataTable) {
            dataTable.ajax.reload(null, false);
          }
        }
      },
      error: function(error) {
        console.error("Error deleting FAQ:", error);
        alertModal("FAQ silinərkən xəta baş verdi", "error");
      }
    });
  });
});
