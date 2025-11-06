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
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: "/imtiyazlar/rozetler/",
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
            search: $("#customSearch").val().trim(),
            ...currentFilters, // filtre varsa buradan gelmeli
          });
        },
        dataSrc: function (json) {
          $("#tr_counts").html(json.data.length ?? 0);
          $("#category-count").html(`Kateqoriyalar (${json.data.length ?? 0})`);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinAmount = Math.min(...amounts);
          globalMaxAmount = Math.max(...amounts);
          initSlider();
          console.log("Server-dən gələn data:", json.data);
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
      pageLength: 1,
      columns: [
        {
          data: "name",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "rozet_count",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "creator",
          render: function (data) {
            if (!data) return "—";
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data.name || "") + " " + (data.surname || "") +
              "</span>"
            );
          },
        },
        {
          data: "createdAt",
          render: function (data) {
            if (!data) return "—";
            const date = new Date(data);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();

            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              `${month}.${day}.${year}` +
              "</span>"
            );
          },
        },
        {
          data: function (data) {
            return `
              <div id="wrapper" class="relative inline-block text-left">
                <!-- Trigger icon -->
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer z-100"></div>

                <!-- Dropdown wrapper -->
                <div class="hidden absolute right-[-12px] w-30 z-50 dropdown-menu">

                  <!-- Caret wrapper -->
                  <div class="relative h-[8px]">
                    <!-- Caret -->
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-white rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>

                  <!-- Dropdown box -->
                  <div class="rounded-xl shadow-lg bg-white overflow-hidden relative z-50 border-[.5px] border-stroke" data-id="${data._id}">
                    <div class="py-[3.5px] text-sm">
                      <div onclick="openCategoryModalFromRow(this)" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                        <span class="icon stratis-edit-03 text-[13px]"></span>
                        <span class="font-medium text-[#1D222B] text-[13px]">Redaktə et</span>
                      </div>
                      <div class="h-[.5px] bg-stroke my-1"></div>
                      <div onclick="toggleDeleteModal(this)" class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-error-hover">
                        <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                        <span class="font-medium text-error text-[13px]">Sil</span>
                      </div>
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

        $(row).find("td").addClass("border-b-[.5px] border-stroke");

        $(row).find("td:not(:last-child)").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        // 🔹 Növbəti səhifəyə keçid
        $(row).on("click", function (e) {
          const lastTd = $(this).find("td").last()[0];
          if (e.target === lastTd || $(e.target).closest("td")[0] === lastTd) {
            return;
          }
          const categoryId = $(this).find(".dropdown-menu [data-id]").data("id");
          location.href = `/imtiyazlar/rozetler/rozet/${categoryId}`;
        });

      },
    });
  }
  $('#refreshTableBtn').on('click', function () {
    dataTable.ajax.reload(null, false);
  });

  // Initialize DataTable
  initializeDataTable();
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
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

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Başqa açıq dropdown varsa, bağla (özündən başqa)
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");
}

// Kənara klik ediləndə dropdown bağlansın
document.addEventListener("click", function (event) {
  const isClickInside = event.target.closest("#wrapper");

  if (!isClickInside) {
    document.querySelectorAll(".dropdown-menu").forEach((el) => {
      el.classList.add("hidden");
    });
  }
});



let modalMode = "create"; // "create" və ya "edit"
let editingRowId = null; // edit olunan sətrin id-si (lazım olsa)

// Modal açmaq (mode-a görə)
function openCategoryModal(mode, data = null) {
  modalMode = mode;
  const $modal = $("#categoryModal");

  if (mode === "create") {
    $("#modalTitle").text("Yeni kateqoriya");
    $("#modalConfirmText").text("Yarat");
    $("#categoryInput").val(""); // boş qoy
    editingRowId = null;
  } else if (mode === "edit" && data) {
    $("#modalTitle").text("Redaktə et");
    $("#modalConfirmText").text("Dəyişikliyi təsdiqlə");
    $("#categoryInput").val(data.categoryName || "");
    editingRowId = data._id; // məsələn backend-də lazım olacaq
  }

  $modal.removeClass("hidden");
}

function openCategoryModalFromRow(triggerElement) {
  const row = $(triggerElement).closest("tr");
  const rowData = dataTable.row(row).data();
  console.log("Redaktə üçün data:", rowData);
  if (rowData) {
    openCategoryModal("edit", rowData);
    $("#categoryInput").val(rowData.name || "");
  }
}

function closeCategoryModal() {
  $("#categoryModal").addClass("hidden");
}

// Təsdiqlə düyməsi
$("#modalConfirmBtn").on("click", function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  const categoryName = $("#categoryInput").val().trim();

  if (!categoryName) {
    alertModal("Kateqoriya adı boş ola bilməz!");
    return;
  }

  if (modalMode === "create") {
    console.log("Yeni kateqoriya yaradılır:", categoryName);
    $.ajax({
      url: "/imtiyazlar/rozetler/create-category",
      type: "POST",
      contentType: "application/json",
      headers: {
        "CSRF-Token": csrfToken
      },
      data: JSON.stringify({
        categoryName: categoryName
      }),
      success: function (response) {
        $("#myModal").addClass("hidden");
        $("#myTable").DataTable().ajax.reload();
        alertModal("Yeni kateqoriya yaradıldı", "");
      },
      error: function (xhr) {
        console.error("Xəta baş verdi:", xhr.responseText);
        alertModal("Xəta", "Xəta baş verdi");

      }
    });
  } else if (modalMode === "edit") {
    console.log("Kateqoriya redaktə olunur:", editingRowId, categoryName);
    $.ajax({
      url: `/imtiyazlar/rozetler/${editingRowId}`,
      type: "PATCH",
      contentType: "application/json",
      headers: {
        "CSRF-Token": csrfToken
      },
      data: JSON.stringify({
        categoryName: categoryName
      }),
      success: function (response) {
        $("#myModal").addClass("hidden");
        $("#myTable").DataTable().ajax.reload();
        alertModal("Kateqoriya Redaktə olundu", "");
      },
      error: function (xhr) {
        console.error("Xəta baş verdi:", xhr.responseText);
        alertModal("Xəta", "Xəta baş verdi");

      }
    });
  }

  closeCategoryModal();
});

window.toggleDeleteModal = function (element = null) {
  const modal = $("#deleteModal");

  if (modal.hasClass("hidden")) {
    // Açılırsa, id-ni tapırıq
    if (element) {
      const categoryId = $(element).closest(".dropdown-menu").find("[data-id]").data("id");
      console.log("Silinəcək kateqoriya ID-si:", categoryId);
      modal.data("category-id", categoryId);
    }
    modal.removeClass("hidden");
  } else {
    // Bağlanırsa, data təmizlənir
    modal.removeData("category-id");
    modal.addClass("hidden");
  }
};
// Təsdiqlə düyməsi silmə üçün
window.confirmDeleteCategory = function () {
  const modal = $("#deleteModal");
  const categoryId = modal.data("category-id");
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  console.log("Silinən kateqoriya ID-si:", categoryId);

  if (!categoryId) {
    alert("Kateqoriya ID-si tapılmadı.");
    return;
  }

  $.ajax({
    url: `/imtiyazlar/rozetler/delete-category/${categoryId}`,
    type: "DELETE",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      if (response.success) {
        alert(response.message);
        modal.addClass("hidden");
        modal.removeData("category-id");

        if (dataTable) {
          dataTable.ajax.reload(null, false);
        }
      } else {
        alert("Xəta: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      alert("Xəta: " + error);
    },
  });
};
