// Global dəyişənlər
let dataTable = null;
let currentFilters = {};

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

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
        url: "/avankartaz/abunelikler/list",
        type: "GET",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          console.log("Subscription: AJAX data function çağrıldı, params:", d);
          const page = Math.floor(d.start / d.length) + 1;
          const params = {
            page: page,
            limit: d.length,
            search: d.search.value,
            ...currentFilters,
          };
          console.log("Subscription: Backend-ə göndəriləcək params:", params);
          return params;
        },
        dataSrc: function (json) {
          console.log("Subscription: Backend cavabı:", json);
          if (json.success && json.data) {
            $("#category-count").html("Abunəliklər (" + (json.pagination?.total ?? 0) + ")");
            json.recordsTotal = json.pagination?.total ?? 0;
            json.recordsFiltered = json.pagination?.total ?? 0;
            console.log("Subscription: Data qaytarılır, count:", json.data.length);
            return json.data;
          }
          console.log("Subscription: Boş data qaytarılır");
          return [];
        },
        error: function(xhr, error, thrown) {
          console.error("Subscription: AJAX error:", error, thrown);
          console.error("Subscription: XHR:", xhr);
        }
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
          orderable: false, // ✅ 1-ci sütun (checkbox) filter off
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
                <input type="checkbox" id="cb-${idx}" class="peer hidden">
                <label for="cb-${idx}" 
                    class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark 
                        peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                    <div class="icon stratis-check-01 scale-60 hidden peer-checked:block"></div>
                </label>

            `;
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
          data: "createdAt",
          render: function (data) {
            if (!data) return '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">—</span>';

            const date = new Date(data);
            const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const formattedDate = `${day} ${month} ${year}`;

            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              formattedDate +
              "</span>"
            );
          },
        },
        {
          orderable: false,
          data: function (row) {
            return `
              <button onclick='prepareDeleteSubscription("${row._id}")' class="cursor-pointer flex items-center gap-1.5 text-error hover:bg-error-hover py-1 px-2 rounded-[4px]">
                <div class="icon stratis-trash-01 text-xs"></div>
                <span class="text-[13px] font-medium">Sil</span>
              </button>
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

        // Sonuncu sütun (button)
        $(row).find("td:last-child").css({
          "border-left": ".5px solid #E5E5E5",
        });

        // Button içindəki flex element üçün (əgər varsa)
        $(row).find("td:last-child > button").css({
          margin: "0 auto",
        });

        // Th-lər üçün yalnız birinci və sonuncu sütunlara border əlavə et
        $("#myTable thead tr").each(function () {
          // Birinci sütun → sağ border
          $(this).find("th:first-child").css({
            "border-right": ".5px solid #E5E5E5",
          });

          // Sonuncu sütun → sol border
          $(this).find("th:last-child").css({
            "border-left": ".5px solid #E5E5E5",
          });
        });

        // 1-ci th (checkbox) üçün
        $("#myTable thead tr").each(function () {
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

          // Sonuncu sütun → sol border
          $(this).find("th:last-child").css({
            "border-left": ".5px solid #E5E5E5",
          });
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

window.toggleDeleteModal = function () {
  if ($("#deleteModal").hasClass("hidden")) {
    $("#deleteModal").removeClass("hidden");
  } else {
    $("#deleteModal").addClass("hidden");
  }
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
  $("#startDate").val("");
  $("#endDate").val("");
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

// Delete subscription
let deletingSubscriptionId = null;

window.prepareDeleteSubscription = function(subscriptionId) {
  deletingSubscriptionId = subscriptionId;
  toggleDeleteModal();
};

window.confirmDeleteSubscription = function() {
  if (!deletingSubscriptionId) {
    console.error('No subscription ID to delete');
    return;
  }

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: `/avankartaz/abunelikler/${deletingSubscriptionId}`,
    type: 'DELETE',
    headers: {
      'X-CSRF-Token': csrfToken
    },
    success: function(response) {
      console.log('Subscription deleted successfully:', response);

      // Close modal
      toggleDeleteModal();
      deletingSubscriptionId = null;

      // Reload table
      if (dataTable) {
        dataTable.ajax.reload();
      }

      // Show success message
      alertModal(response.message || 'Abunəlik uğurla silindi', 'success');
    },
    error: function(xhr, status, error) {
      console.error('Error deleting subscription:', error);
      const errorMessage = xhr.responseJSON?.message || 'Abunəlik silinərkən xəta baş verdi';
      alertModal(errorMessage, 'error');
    }
  });
};
