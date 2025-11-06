// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;
let currentRowId = null; // Seçilmiş row-un ID-si

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
        url: "/avankartaz/mobiltetbiq/list",
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
            ...currentFilters,
          };
        },
        dataSrc: function (json) {
          if (json.success && json.data) {
            $("#category-count").html("Mobil tətbiq linkləri (" + (json.total ?? 0) + ")");
            json.recordsTotal = json.total ?? 0;
            json.recordsFiltered = json.total ?? 0;
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
      pageLength: 1,
      columns: [
        {
          data: "name",
          render: function (data, type, row) {
            // row.icon varsa istifadə et
            const icon = row.icon || "default-icon.png"; // default icon təyin et
            return `
              <div class="flex items-center gap-3">
                <div class="bg-container-2 w-12 h-12 rounded-full flex items-center justify-center">
                  <img src="${icon}" class="w-6 h-6" />
                </div>
                <span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">
                  ${data || "—"}
                </span>
              </div>
            `;
          },
        },
        {
          data: "link",
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
              case "active":
                color = "bg-[#4FC3F7]"; // mavi
                break;
              case "inactive":
                color = "bg-[#DD3838]"; // qirmizi
                break;
              default:
                color = "bg-[#FF7043]"; // narıncı (digər)
            }

            return `
                <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status === 'active' ? 'Aktiv' : 'Deaktiv'}</span>
                </div>
            `;
          },
        },
        {
          data: function (row) {
            let dropdownContent = "";

            // Statusa görə dropdown menyunun içindəki elementləri dəyişdir
            if (row.status === "active") {
              dropdownContent = `
                <div onclick='toggleEditModal(${JSON.stringify(
                  row
                )})' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-edit-03 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Redaktə et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                 <div onclick='toggleDeAktivModal("${row._id}")' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                  <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
                  <span class="font-medium text-error text-[13px] whitespace-nowrap">Deaktiv et</span>
                </div>
              `;
            } else if (row.status === "inactive") {
              dropdownContent = `
                <div onclick='toggleEditModal(${JSON.stringify(
                  row
                )})' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-edit-03 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Redaktə et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                <div onclick='toggleAktivModal("${row._id}")' class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover">
                  <span class="icon stratis-file-check-02 text-messages text-[13px]"></span>
                  <span class="font-medium text-messages text-[13px] whitespace-nowrap">Aktiv et</span>
                </div>
              `;
            } else {
              dropdownContent = `
                <div onclick='toggleEditModal(${JSON.stringify(
                  row
                )})' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-edit-03 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Redaktə et</span>
                </div>
              `;
            }

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

  // Deaktiv etmə funksiyası
  window.confirmDeactivate = function () {
    if (!currentRowId) return;

    $.ajax({
      url: `/avankartaz/mobiltetbiq/${currentRowId}`,
      type: "PUT",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      data: {
        status: "inactive",
      },
      success: function (response) {
        if (response.success) {
          toggleDeAktivModal(); // Modalı bağla
          dataTable.ajax.reload(); // Cədvəli yenilə
        }
      },
      error: function (xhr) {
        console.error("Xəta:", xhr.responseJSON?.message || "Deaktiv edilərkən xəta baş verdi");
      },
    });
  };

  // Aktiv etmə funksiyası
  window.confirmActivate = function () {
    if (!currentRowId) return;

    $.ajax({
      url: `/avankartaz/mobiltetbiq/${currentRowId}`,
      type: "PUT",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      data: {
        status: "active",
      },
      success: function (response) {
        if (response.success) {
          toggleAktivModal(); // Modalı bağla
          dataTable.ajax.reload(); // Cədvəli yenilə
        }
      },
      error: function (xhr) {
        console.error("Xəta:", xhr.responseJSON?.message || "Aktiv edilərkən xəta baş verdi");
      },
    });
  };

  // Redaktə funksiyası
  window.saveEdit = function () {
    if (!currentRowId) return;

    const newLink = $("#editModal").find(".modal-link-input").val();

    if (!newLink || newLink.trim() === "") {
      console.error("Link boş ola bilməz");
      return;
    }

    $.ajax({
      url: `/avankartaz/mobiltetbiq/${currentRowId}`,
      type: "PUT",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      data: {
        link: newLink,
      },
      success: function (response) {
        if (response.success) {
          toggleEditModal({}); // Modalı bağla
          dataTable.ajax.reload(); // Cədvəli yenilə
        }
      },
      error: function (xhr) {
        console.error("Xəta:", xhr.responseJSON?.message || "Redaktə edilərkən xəta baş verdi");
      },
    });
  };
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

window.toggleDeAktivModal = function (id) {
  currentRowId = id; // ID-ni saxla
  if ($("#deaktivModal").hasClass("hidden")) {
    $("#deaktivModal").removeClass("hidden");
  } else {
    $("#deaktivModal").addClass("hidden");
  }
};

window.toggleAktivModal = function (id) {
  currentRowId = id; // ID-ni saxla
  if ($("#aktivModal").hasClass("hidden")) {
    $("#aktivModal").removeClass("hidden");
  } else {
    $("#aktivModal").addClass("hidden");
  }
};

window.toggleEditModal = function (rowData) {
  const modal = $("#editModal");

  if (modal.hasClass("hidden")) {
    // Modalı aç
    modal.removeClass("hidden");

    // Modal içindəki elementləri doldur
    const row = rowData; // rowData DataTable render funksiyasından gələcək
    currentRowId = row._id; // ID-ni saxla

    // Icon
    modal.find(".modal-icon img").attr("src", row.icon);

    // Name
    modal.find(".modal-name").text(row.name || "—");

    // Link
    modal.find(".modal-link-input").val(row.link || "");
  } else {
    // Modalı bağla
    modal.addClass("hidden");
  }
};
