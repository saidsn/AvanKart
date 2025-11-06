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
        url: "/api/avankart/mukafatlar/mukafatlar-details-table.json",
        type: "GET",
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
            ...currentFilters, // filtre varsa buradan gelmeli
          });
        },
        dataSrc: function (json) {
          $("#tr_counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinAmount = Math.min(...amounts);
          globalMaxAmount = Math.max(...amounts);
          initSlider();
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
          data: "icon",
          render: function (data) {
            return `
            <div class="flex items-center gap-3">
                <img src="${data}" alt="badge" class="w-[75px] h-[59px] object-contain"/>
            </div>`;
          },
        },
        {
          data: "title",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "usagePlace",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "target",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "serviceCount",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "type",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "reward",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "userCount",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
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
          data: function () {
            return `
              <div id="rewardCreateModal" class="relative inline-block text-left">
                <!-- Trigger icon -->
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer z-100"></div>

                <!-- Dropdown wrapper -->
                <div class="hidden absolute right-[-12px] w-40 z-50 dropdown-menu">

                  <!-- Caret wrapper -->
                  <div class="relative h-[8px]">
                    <!-- Caret -->
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-white rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>

                  <!-- Dropdown box -->
                  <div class="rounded-xl shadow-lg bg-white overflow-hidden relative z-50 border-[.5px] border-stroke">
                    <div class="py-[3.5px] text-sm">
                      <div class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer" onclick="openRewardModal()">
                        <span class="icon stratis-edit-03 text-[13px]"></span>
                        <span class="font-medium text-[#1D222B] text-[13px]">Redaktə et</span>
                      </div>
                      <div class="h-[.5px ] bg-stroke my-1"></div>
                      <div class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-error-hover" onclick="deleteItem(this)">
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

// Reward modal functions
window.openRewardModal = function () {
  if ($("#rewardModal").hasClass("hidden")) {
    $("#rewardModal").removeClass("hidden");
  } else {
    $("#rewardModal").addClass("hidden");
  }
};

window.closeRewardModal = function () {
  $("#rewardModal").addClass("hidden");
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
  const wrapper = triggerElement.closest("#rewardCreateModal");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");
}

// Global dəyişən silinəcək sətri yadda saxlamaq üçün
let rowToDelete = null;

function deleteItem(element) {
  rowToDelete = $(element).closest("tr");

  const popup = document.createElement("div");
  popup.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[9999]";
  popup.innerHTML = `
      <div class="bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative">
        <div class="w-[306px] flex flex-col gap-3">
          <div class="w-10 h-10 rounded-full bg-error-hover flex items-center justify-center">
            <div class="icon stratis-trash-01 w-5 h-5 text-error"></div>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-[#1D222B] font-medium text-[15px]">Kateqoriyanı sil</div>
            <div class="text-secondary-text text-[13px] font-normal">
              Kateqoriyanı silmək istədiyinizə əminsiniz?
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
          <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
          <button class="cursor-pointer px-3 py-1 rounded-full text-on-primary bg-error transition" id="confirmDeleteBtn">Bəli, sil</button>
        </div>
      </div>
    `;

  document.body.appendChild(popup);

  document.getElementById("confirmDeleteBtn").onclick = function () {
    if (rowToDelete) {
      const rowData = $("#myTable").DataTable().row(rowToDelete).data();

      // ✅ DÜZGÜN açarı istifadə edərək localStorage-dan sil
      let storedData = JSON.parse(localStorage.getItem("categoryData")) || [];
      storedData = storedData.filter(
        (item) => item.categoryName !== rowData.categoryName
      );
      localStorage.setItem("categoryData", JSON.stringify(storedData));

      // ✅ Cədvəldən sil
      $("#myTable").DataTable().row(rowToDelete).remove().draw();
      rowToDelete = null;
    }
    popup.remove();
  };
}
