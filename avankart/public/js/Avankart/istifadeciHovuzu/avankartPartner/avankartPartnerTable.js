// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
let searchTimeout = null; // For debouncing search
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

// Global variables for current user action
let currentUserId = null;
let currentUserName = null;
let currentUserSurname = null;
let currentAction = null;

// Load filter options from backend
async function loadFilterOptions() {
  try {
    const response = await fetch("/hovuz/partner/filter-options", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Populate muessise dropdown in filter modal
      const companyDropdown = document.getElementById("dropdown_company");
      if (companyDropdown) {
        // Clear existing options except static ones
        companyDropdown.innerHTML = "";

        // Add muessise options
        if (data.muessises && Array.isArray(data.muessises)) {
          data.muessises.forEach((muessise) => {
            const label = document.createElement("label");
            label.setAttribute("for", `company-${muessise.value}`);
            label.className =
              "flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark";

            label.innerHTML = `
              <input type="checkbox" id="company-${muessise.value}" class="peer hidden" data-value="${muessise.value}">
              <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
              </div>
              <span class="dark:text-white">${muessise.label || "Unknown"}</span>
            `;

            companyDropdown.appendChild(label);
          });
        }
      }

      console.log("Filter options loaded:", data);
    } else {
      console.error("Failed to load filter options");
    }
  } catch (error) {
    console.error("Error loading filter options:", error);
  }
}

// Load partner counts for toggle buttons
async function loadPartnerCounts() {
  try {
    const response = await fetch("/hovuz/partner/counts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Update the toggle button texts with dynamic counts
      const allButton = document.getElementById("allButton");
      const activeButton = document.getElementById("activeButton");
      const deactiveButton = document.getElementById("deactiveButton");
      const deletedButton = document.getElementById("deletedButton");
      const pendingButton = document.getElementById("pendingButton");

      if (allButton) {
        allButton.textContent = `Hamısı (${data.total || 0})`;
      }
      if (activeButton) {
        activeButton.textContent = `Aktiv (${data.active || 0})`;
      }
      if (deactiveButton) {
        deactiveButton.textContent = `Deaktiv (${data.deactive || 0})`;
      }
      if (deletedButton) {
        deletedButton.textContent = `Silinmişlər (${data.deleted || 0})`;
      }
      if (pendingButton) {
        pendingButton.textContent = `Silinmə gözləyir (${data.pending || 0})`;
      }

      console.log("Partner counts loaded:", data);
    } else {
      console.error("Failed to load partner counts");
    }
  } catch (error) {
    console.error("Error loading partner counts:", error);
  }
}

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
        url: "/hovuz/partner/data",
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          return JSON.stringify({
            csrfToken: csrfToken,
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search,
            ...currentFilters, // filtre varsa buradan gelmeli
          });
        },
        dataSrc: function (json) {
          $("#tr_counts").html(json.recordsFiltered ?? 0);

          // Update pagination info
          const totalPages = Math.ceil(
            json.recordsFiltered / dataTable.page.len()
          );
          const currentPage = Math.floor(json.start / dataTable.page.len()) + 1;
          $("#pageCount").text(`${currentPage} / ${totalPages || 1}`);

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
          data: "fullName",
          render: function (data, type, row) {
            return `
               <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                        ${row.fullName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-messages text-[13px] font-medium dark:text-white text-left">${
                          row.fullName
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
          data: "jobTitle",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "muessise",
          render: function (data) {
            console.log("data:", data);

            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
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
          data: "phone",
          render: function (data) {
            console.log("data:", data);

            return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">
              ${data || "994"}
              </span>`;
          },
        },
        {
          data: function (row) {
            const color = row.statusColor || "bg-[#9E9E9E]";
            return `
              <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
              </div>
            `;
          },
        },
        {
          data: function (row) {
            let dropdownContent = "";

            // Statusa görə dropdown menyunun içindəki elementləri dəyişdir
            if (row.status === "Aktiv") {
              dropdownContent = `
                <div onclick="window.location.href='/hovuz/partner/${row.id}'" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Aç</span>
                </div>
                <div onclick="openConfirmModal()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-password-01 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Şifrəni sıfırla</span>
                </div>
                <div onclick="openMailadressiPopup()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-mail-01 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Mail adresini dəyiş</span>
                </div>
                <div class="js-toggle-status flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer" data-id="${row.id}" data-status="1">
                  <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
                  <span class="font-medium text-error text-[13px] whitespace-nowrap">Deaktiv et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                ${
                  row.hasDeleteRequest
                    ? `<div onclick="confirmDeleteRequest('${row._id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                    <span class="icon stratis-check text-error text-[13px]"></span>
                    <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinməni təsdiqlə</span>
                  </div>`
                    : `<div onclick="openSilinmeMuracietPopUp('${row._id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                    <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                    <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
                  </div>`
                }
              `;
            } else if (row.status === "Deaktiv") {
              dropdownContent = `
                <div onclick="window.location.href='/hovuz/partner/${row.id}'" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Aç</span>
                </div>
                 <div class="flex items-center gap-2 px-4 py-[3.5px]">
                  <span class="icon stratis-password-01 text-tertiary-text text-[13px] mt-1"></span>
                  <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Şifrəni sıfırla</span>
                </div>
                 <div class="flex items-center gap-2 px-4 py-[3.5px]">
                  <span class="icon stratis-mail-01 text-tertiary-text text-[13px] mt-1"></span>
                  <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Mail adresini dəyiş</span>
                </div>
                <div class="js-toggle-status flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover" data-id="${row.id}" data-status="0">
                  <span class="icon stratis-shield-check text-messages text-[13px]"></span>
                  <span class="font-medium text-messages text-[13px] whitespace-nowrap">Aktiv et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                ${
                  row.hasDeleteRequest
                    ? `<div onclick="confirmDeleteRequest('${row._id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                    <span class="icon stratis-check text-error text-[13px]"></span>
                    <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinməni təsdiqlə</span>
                  </div>`
                    : `<div onclick="openSilinmeMuracietPopUp('${row._id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                    <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                    <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
                  </div>`
                }
              `;
            } else if (row.status === "Silinmə gözləyir") {
              dropdownContent = `
                <div onclick="window.location.href='/hovuz/partner/${row.id}'" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Aç</span>
                </div>
                <div onclick="openSilinmeTesdiqPopUp()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-file-check-02 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Silinməni təsdiqlə</span>
                </div>
                <div onclick="openConfirmModal()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-file-minus-02 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Rədd et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                <div class="flex items-center gap-2 px-4 py-[3.5px]">
                  <span class="icon stratis-trash-01 text-tertiary-text text-[13px]"></span>
                  <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
                </div>
              `;
            } else if (row.status === "Deaktivasiya gözləyir") {
              dropdownContent = `
                <div onclick="window.location.href='/hovuz/partner/${row.id}'" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Aç</span>
                </div>
                <div onclick="openDeAktivizasiyaniTesdiqleModal()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-file-check-02 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Deaktivasiyanı təsdiqlə</span>
                </div>
                <div onclick="openConfirmModal()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-file-minus-02 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Rədd et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                <div class="flex items-center gap-2 px-4 py-[3.5px]">
                  <span class="icon stratis-trash-01 text-tertiary-text text-[13px]"></span>
                  <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
                </div>
              `;
            } else {
              dropdownContent = `
                <div onclick="window.location.href='/hovuz/partner/${row.id}'" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-cursor-06 text-[13px]"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Aç</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                <div class="flex items-center gap-2 px-4 py-[3.5px]">
                  <span class="icon stratis-trash-01 text-tertiary-text text-[13px]"></span>
                  <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Hesabı sil</span>
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
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        // 🔹 Növbəti səhifəyə keçid
        $(row).on("click", function (e) {
          // Sıra daxilindəki bütün hüceyrələri götür
          const lastTd = $(this).find("td").last()[0];

          // Əgər klik olunan element sonuncu td-dirsə — yönləndirmə etmə
          if (e.target === lastTd || $(e.target).closest("td")[0] === lastTd) {
            return; // Heç nə etmə
          }

          // Get the row data to access the user ID
          const rowData = dataTable.row(this).data();
          if (rowData && rowData.id) {
            // Əks halda yönləndir
            location.href = `/hovuz/partner/${rowData.id}`;
          }
        });
      },
    });
  }

  // Initialize DataTable
  initializeDataTable();

  // Load filter options after DataTable initialization
  loadFilterOptions();

  // Load partner counts for toggle buttons
  loadPartnerCounts();

  // Initialize column visibility based on checkbox states
  function initializeColumnVisibility() {
    // Set initial visibility based on checkbox states
    dataTable.column(1).visible($("#checkbox-cinsi").is(":checked"));
    dataTable.column(2).visible($("#checkbox-dogum").is(":checked"));
    dataTable.column(3).visible($("#checkbox-vezife").is(":checked"));
    dataTable.column(4).visible($("#checkbox-muessise").is(":checked"));
    dataTable.column(5).visible($("#checkbox-email").is(":checked"));
    dataTable.column(6).visible($("#checkbox-telefon").is(":checked"));
    dataTable.column(7).visible($("#checkbox-status").is(":checked"));
  }

  // Call initialization after a short delay to ensure DataTable is fully ready
  setTimeout(initializeColumnVisibility, 100);

  // Column visibility handlers
  // Note: Column 0 (Ad və soyad) is always visible as it's the main identifier
  // Column 8 (Actions) is always visible as it contains the action buttons

  $("#checkbox-cinsi").change(function () {
    dataTable.column(1).visible(this.checked);
  });

  $("#checkbox-dogum").change(function () {
    dataTable.column(2).visible(this.checked);
  });

  $("#checkbox-vezife").change(function () {
    dataTable.column(3).visible(this.checked);
  });

  $("#checkbox-muessise").change(function () {
    dataTable.column(4).visible(this.checked);
  });

  $("#checkbox-email").change(function () {
    dataTable.column(5).visible(this.checked);
  });

  $("#checkbox-telefon").change(function () {
    dataTable.column(6).visible(this.checked);
  });

  $("#checkbox-status").change(function () {
    dataTable.column(7).visible(this.checked);
  });

  // Handle checkboxes that don't have corresponding columns yet
  // These could be implemented in the future if needed
  $("#checkbox-uzvluq").change(function () {
    console.log("Üzvlük column visibility not implemented yet");
  });

  $("#checkbox-qeydiyyat").change(function () {
    console.log("Qeydiyyat tarixi column visibility not implemented yet");
  });

  $("#checkbox-dogrulama").change(function () {
    console.log("Doğrulama column visibility not implemented yet");
  });
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};
$("#reload_btn").on("click", function (){
   // Reload the DataTable with current filters
  if (dataTable) {
    dataTable.ajax.reload(function (json) {
      console.log("DataTable refreshed successfully");
    }, false); // false means don't reset pagination
  }
})

// Refresh data function - maintains current filters and tab state
window.refreshData = function () {
  console.log("Refreshing data with current filters:", currentFilters);

  // Reload the DataTable with current filters
  if (dataTable) {
    dataTable.ajax.reload(function (json) {
      console.log("DataTable refreshed successfully");
    }, false); // false means don't reset pagination
  }

  // Refresh the partner counts for toggle buttons
  loadPartnerCounts();

  // Optional: Show a brief success message
  // You can uncomment this if you want visual feedback
  // console.log('Data refreshed successfully');
};

function toggleActiveStatus(element) {
  // Remove the active class from all buttons and add the inactive class
  const allButtons = document.querySelectorAll(
    "#toggleContainer button, #toggleContainer span"
  );
  allButtons.forEach((btn) => {
    btn.classList.remove(
      "bg-inverse-on-surface",
      "font-medium",
      "text-messages"
    );
    btn.classList.add("text-tertiary-text");
  });

  // Add the active class to the clicked button
  element.classList.add(
    "bg-inverse-on-surface",
    "font-medium",
    "text-messages"
  );
  element.classList.remove("text-tertiary-text");

  // Get the status from the button text
  const statusText = element.textContent.trim().split(" ")[0];

  // Update the global currentFilters object
  if (statusText === "Hamısı") {
    delete currentFilters.status; // Remove the status filter to show all users
  } else {
    currentFilters.status = statusText; // Set the status filter
  }

  // Reload the DataTable with the new filters
  if (dataTable) {
    dataTable.ajax.reload();
  }
}

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

window.toggleDropdown_company = function () {
  const dropdown = document.getElementById("dropdown_company");
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
  const companyDropdown = document.getElementById("dropdown_company");
  const usersDropdown = document.getElementById("dropdown_users");
  const positionButton = document.getElementById(
    "dropdownDefaultButton_position"
  );
  const usersButton = document.getElementById("dropdownDefaultButton_users");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_company"
  );

  if (
    !positionButton.contains(event.target) &&
    !positionDropdown.contains(event.target)
  ) {
    positionDropdown.classList.add("hidden");
    positionDropdown.classList.remove("visible");
  }

  if (
    !companyButton.contains(event.target) &&
    !companyDropdown.contains(event.target)
  ) {
    companyDropdown.classList.add("hidden");
    companyDropdown.classList.remove("visible");
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

  // Positions al
  const positions = [];
  $('#dropdown_position input[type="checkbox"]:checked').each(function () {
    const positionId = $(this).attr("id");
    positions.push(positionId.replace("subyekt-", ""));
  });

  if (positions.length > 0) {
    currentFilters.positions = positions;
  }

  // Müəssisələri al (updated for new backend)
  const muessises = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const muessiseValue =
      $(this).attr("data-value") || $(this).attr("id").replace("company-", "");
    muessises.push(muessiseValue);
  });

  if (muessises.length > 0) {
    currentFilters.muessise_filter = muessises; // Array for backend
  }

  // İstifadəçiləri al
  const users = [];
  $('#dropdown_users input[type="checkbox"]:checked').each(function () {
    const userId = $(this).attr("id");
    users.push(userId.replace("istifadeci-", ""));
  });

  if (users.length > 0) {
    currentFilters.users = users;
  }

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentFilters.card_category = cardCategories;
  }

  // Təyinatı al
  const cardDestinations = [];
  $('input[name="card_destination"]:checked').each(function () {
    cardDestinations.push($(this).val());
  });

  if (cardDestinations.length > 0) {
    currentFilters.cardDestinations = cardDestinations;
  }

  // Genderları al (updated for new backend)
  const selectedGenders = [];
  $('input[name="card_gender"]:checked').each(function () {
    selectedGenders.push($(this).val());
  });

  if (selectedGenders.length > 0) {
    // For backend: single gender or first selected if multiple
    currentFilters.gender_filter = selectedGenders[0];
    // Keep original for other uses
    currentFilters.cardGender = selectedGenders;
  }

  // Məbləğ aralığını al (slider)
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
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

  // implement olacaq bu
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [0, 10000]);
    $("#min-value").text("0 AZN");
    $("#max-value").text("10000 AZN");
  }

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

function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) {
    dataTable.search(searchValue).draw();
  }
}

// Debounced search function
function debouncedSearch() {
  // Clear the previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Set a new timeout
  searchTimeout = setTimeout(function () {
    performSearch();
  }, 300); // 300ms debounce
}

// Search inputuna event listener əlavə etmək
$("#customSearch").on("keyup", function (e) {
  debouncedSearch();
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

// Sutunlar modal functions
window.openSutunlarPopup = function () {
  if ($("#sutunlarPopup").hasClass("hidden")) {
    $("#sutunlarPopup").removeClass("hidden");

    // Add click outside listener to close popup
    setTimeout(() => {
      document.addEventListener(
        "click",
        function closeSutunlarOnOutsideClick(e) {
          const popup = document.getElementById("sutunlarPopup");
          const button = e.target.closest('[onclick="openSutunlarPopup()"]');

          if (popup && !popup.contains(e.target) && !button) {
            $("#sutunlarPopup").addClass("hidden");
            document.removeEventListener("click", closeSutunlarOnOutsideClick);
          }
        }
      );
    }, 10);
  } else {
    $("#sutunlarPopup").addClass("hidden");
  }
};

window.closeSutunlarPopup = function () {
  $("#sutunlarPopup").addClass("hidden");
};

// Aktiv modal functions
window.openAktivModal = function (userId, name, surname) {
  console.log("openAktivModal called with:", { userId, name, surname });
  currentUserId = userId;
  currentUserName = name;
  currentUserSurname = surname;
  currentAction = "activate";

  // Update modal content with user info
  $("#aktivModal .user-info").text(
    `${name} ${surname} istifadəçisini aktiv etmək istədiyinizdən əminsiniz?`
  );

  if ($("#aktivModal").hasClass("hidden")) {
    $("#aktivModal").removeClass("hidden");
  } else {
    $("#aktivModal").addClass("hidden");
  }
};

window.closeAktivModal = function () {
  $("#aktivModal").addClass("hidden");
  // Only reset if we're canceling, not proceeding to OTP
  currentUserId = null;
  currentUserName = null;
  currentUserSurname = null;
  currentAction = null;
};

// Tesdiq modal functions
window.openDeAktivModal = function (userId, name, surname) {
  currentUserId = userId;
  currentUserName = name;
  currentUserSurname = surname;
  currentAction = "deactivate";

  // Update modal content with user info
  $("#deAktivModal .user-info").text(
    `${name} ${surname} istifadəçisini deaktiv etmək istədiyinizdən əminsiniz?`
  );

  if ($("#deAktivModal").hasClass("hidden")) {
    $("#deAktivModal").removeClass("hidden");
  } else {
    $("#deAktivModal").addClass("hidden");
  }
};

window.closeDeAktivModal = function () {
  $("#deAktivModal").addClass("hidden");
  // Only reset if we're canceling, not proceeding to OTP
  currentUserId = null;
  currentUserName = null;
  currentUserSurname = null;
  currentAction = null;
};

// Silinmə Müraciət Popup funksiyaları
window.openSilinmeMuracietPopUp = function (userId) {
  console.log("openSilinmeMuracietPopUp called with userId:", userId);

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: `/hovuz/partner/${userId}/delete/request`,
    method: "POST",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      // Show success toast
      if (response.success) {
        // Show success message
        if (typeof toastr !== "undefined") {
          toastr.success(response.message || "Silinmə müraciəti göndərildi");
        } else {
          alert(response.message || "Silinmə müraciəti göndərildi");
        }

        // Reload all known DataTables (if initialized on the page)
        if (window.dataTable?.ajax) window.dataTable.ajax.reload(null, false);
        if (window.qrTable?.ajax) window.qrTable.ajax.reload(null, false);
        if (window.transactionsTable?.ajax)
          window.transactionsTable.ajax.reload(null, false);

        // Refresh partner counts
        if (typeof loadPartnerCounts === "function") {
          loadPartnerCounts();
        }
      } else {
        if (typeof toastr !== "undefined") {
          toastr.error(response.error || "Naməlum xəta");
        } else {
          alert("Xəta: " + (response.error || "Naməlum xəta"));
        }
      }
    },
    error: function (xhr, status, error) {
      console.error("Error sending delete request:", error);
      if (typeof toastr !== "undefined") {
        toastr.error("Xəta baş verdi: " + error);
      } else {
        alert("Xəta baş verdi: " + error);
      }
    },
  });
};

// Function to populate delete modals with user data from DataTable
function populateDeleteModal(userData, adminName) {
  console.log("User Data", userData);
  // Use current user variables if available, otherwise fall back to userData
  const userName =
    currentUserName && currentUserSurname
      ? `${currentUserName} ${currentUserSurname}`.trim()
      : userData.fullName ||
        `${userData.name || ""} ${userData.surname || ""}`.trim() ||
        "Ad məlum deyil";

  // Data mapping for both modals
  const modalData = {
    fullName: userName,
    gender: userData.gender || "—",
    birthDate: userData.date || "—",
    email: userData.email || "—",
    phone: userData.phone || "—",
    jobTitle: userData.jobTitle || "—",
    muessise: userData.muessise || "—",
    deleter: adminName,
  };

  // Update silinmeMuracietPopUp modal
  updateModalData("#silinmeMuracietPopUp", modalData);

  // Also update silinmeTesdiqPopUp modal for consistency
  updateModalData("#silinmeTesdiqPopUp", modalData);
}

// Helper function to update modal data
function updateModalData(modalSelector, data) {
  console.log("Modal data", data);

  const modal = $(modalSelector);

  console.log("Updating modal:", modalSelector, "with data:", data);

  modal.find(".space-y-3 .flex").each(function (index) {
    const $row = $(this);
    const labelSpan = $row.find("span").first();
    const valueSpan = $row.find("span").last();
    const labelText = labelSpan.text().toLowerCase().trim();

    // Check for user field - handle Turkish characters and colon
    if (
      labelText.includes("istifadəçi") ||
      labelText.includes("stifadəçi") ||
      labelSpan.text().includes("İstifadəçi")
    ) {
      valueSpan.text(data.fullName);
    } else if (labelText.includes("cinsi")) {
      valueSpan.text(data.gender);
    } else if (labelText.includes("doğum")) {
      valueSpan.text(data.birthDate);
    } else if (labelText.includes("mail")) {
      valueSpan.text(data.email);
    } else if (labelText.includes("telefon")) {
      valueSpan.text(data.phone);
    } else if (labelText.includes("vəzifə")) {
      valueSpan.text(data.jobTitle);
    } else if (labelText.includes("müəssisə")) {
      valueSpan.text(data.muessise);
    } else if (labelText.includes("silən")) {
      valueSpan.text(data.deleter);
    }
  });
}

window.closeSilinmeMuracietPopUp = function () {
  $("#silinmeMuracietPopUp").addClass("hidden");
  // Don't reset variables here since we need them for OTP verification
};

// Confirm Moda functions
window.openConfirmModal = function () {
  if ($("#confirmModal").hasClass("hidden")) {
    $("#confirmModal").removeClass("hidden");
    startCountdown();
  } else {
    $("#confirmModal").addClass("hidden");
  }
};

window.closeConfirmModal = function () {
  $("#confirmModal").addClass("hidden");
};

// Mail adresi popup funksiyaları
window.openMailadressiPopup = function () {
  if ($("#mailadressiPopup").hasClass("hidden")) {
    $("#mailadressiPopup").removeClass("hidden");
  } else {
    $("#mailadressiPopup").addClass("hidden");
  }
};

window.closeMailadressiPopup = function () {
  $("#mailadressiPopup").addClass("hidden");
};

// Two-step verification popup funksiyaları
window.openTwoStepVerificationPop = function () {
  if ($("#twoStepVerificationPop").hasClass("hidden")) {
    $("#twoStepVerificationPop").removeClass("hidden");
  } else {
    $("#twoStepVerificationPop").addClass("hidden");
  }
};

window.closeTwoStepVerificationPop = function () {
  $("#twoStepVerificationPop").addClass("hidden");
};

// Silinmə Təsdiqi Popup funksiyaları
window.openSilinmeTesdiqPopUp = function () {
  if ($("#silinmeTesdiqPopUp").hasClass("hidden")) {
    $("#silinmeTesdiqPopUp").removeClass("hidden");
  } else {
    $("#silinmeTesdiqPopUp").addClass("hidden");
  }
};

window.closeSilinmeTesdiqPopUp = function () {
  $("#silinmeTesdiqPopUp").addClass("hidden");
};

// De Aktivizasiya Modal funksiyaları
window.openDeAktivizasiyaniTesdiqleModal = function () {
  if ($("#deAktivizasiyaModal").hasClass("hidden")) {
    $("#deAktivizasiyaModal").removeClass("hidden");
  } else {
    $("#deAktivizasiyaModal").addClass("hidden");
  }
};

window.closeDeAktivizasiyaniTesdiqleModal = function () {
  $("#deAktivizasiyaModal").addClass("hidden");
};

// Helper function to get current user's email
function getCurrentUserEmail(callback) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: "/hovuz/partner/current-user-email",
    type: "GET",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      if (response.success && response.email) {
        if (callback) callback(response.email);
      } else {
        console.error("Failed to get current user email:", response.error);
        // Fallback to a default or keep existing
        if (callback) callback(null);
      }
    },
    error: function (xhr) {
      console.error("Error fetching current user email:", xhr);
      // Fallback to keep existing email
      if (callback) callback(null);
    },
  });
}

// OTP Modal functions
window.openOTPModal = function () {
  // Clear previous OTP input
  $(".otp-input").val("");
  $("#otpError").hide();

  // Update modal title based on action
  let actionText = "";
  switch (currentAction) {
    case "activate":
      actionText = "aktivləşdirmə";
      break;
    case "deactivate":
      actionText = "deaktivləşdirmə";
      break;
  }

  // Update modal content
  $("#confirmModal h2").first().text(`${actionText} təsdiqi`);

  // Get current user's email and update the modal
  getCurrentUserEmail(function (userEmail) {
    if (userEmail) {
      // Update the email address in the OTP modal
      $("#confirmModal .flex.flex-wrap span.font-medium").text(userEmail);
    }
  });

  // Start countdown timer
  startCountdown();

  $("#confirmModal").removeClass("hidden");

  // Focus first OTP input
  $(".otp-input").first().focus();
};

window.closeOTPModal = function () {
  $("#confirmModal").addClass("hidden");
  $(".otp-input").val("");
  $("#otpError").hide();

  // Clear countdown timer if it exists
  if (window.countdownTimer) {
    clearInterval(window.countdownTimer);
  }
};

// Countdown timer function
function startCountdown() {
  let timeLeft = 300; // 5 minutes in seconds

  function updateCountdown() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    $("#countdown").text(display);

    if (timeLeft <= 0) {
      clearInterval(window.countdownTimer);
      $("#countdown").text("0:00");
      // Optional: disable the form or show expiry message
    }

    timeLeft--;
  }

  // Clear any existing timer
  if (window.countdownTimer) {
    clearInterval(window.countdownTimer);
  }

  // Start new timer
  updateCountdown(); // Show initial time
  window.countdownTimer = setInterval(updateCountdown, 1000);
}

window.submitOTP = function () {
  console.log("submitOTP called with:", {
    currentUserId,
    currentUserName,
    currentUserSurname,
    currentAction,
  });

  // Collect OTP from all 6 input fields
  let otpCode = "";
  $(".otp-input").each(function () {
    otpCode += $(this).val();
  });

  if (!otpCode) {
    alert("OTP kodu daxil edin");
    return;
  }

  if (otpCode.length !== 6) {
    alert("OTP kodu 6 rəqəmdən ibarət olmalıdır");
    return;
  }

  if (!currentUserId || !currentAction) {
    alert("İstifadəçi məlumatları tapılmadı");
    return;
  }

  // Verify OTP based on action
  switch (currentAction) {
    case "activate":
      verifyActivateOTP(otpCode, currentUserId, function (response) {
        closeOTPModal();
        // Reset current action variables
        currentUserId = null;
        currentUserName = null;
        currentUserSurname = null;
        currentAction = null;
      });
      break;
    case "deactivate":
      verifyDeactivateOTP(otpCode, currentUserId, function (response) {
        closeOTPModal();
        // Reset current action variables
        currentUserId = null;
        currentUserName = null;
        currentUserSurname = null;
        currentAction = null;
      });
      break;
    default:
      alert("Naməlum əməliyyat: " + currentAction);
      return;
  }
};

// Handle Enter key in OTP input and auto-advance
$(document).on("keypress", ".otp-input", function (e) {
  if (e.which === 13) {
    // Enter key
    submitOTP();
    return;
  }
});

$(document).on("input", ".otp-input", function (e) {
  const $this = $(this);
  const value = $this.val();

  // Only allow numbers
  if (!/^\d*$/.test(value)) {
    $this.val(value.replace(/\D/g, ""));
    return;
  }

  // Auto-advance to next input
  if (value.length === 1) {
    const $next = $this
      .closest(".grid")
      .find(".otp-input")
      .eq($this.closest(".grid").find(".otp-input").index($this) + 1);
    if ($next.length) {
      $next.focus();
    }
  }
});

// Handle backspace to go to previous input
$(document).on("keydown", ".otp-input", function (e) {
  if (e.keyCode === 8 && $(this).val() === "") {
    // Backspace on empty input
    const $prev = $(this)
      .closest(".grid")
      .find(".otp-input")
      .eq($(this).closest(".grid").find(".otp-input").index($(this)) - 1);
    if ($prev.length) {
      $prev.focus();
    }
  }
});

// OTP helper functions for activation
function sendActivateOTP(userId, callback) {
  console.log("sendActivateOTP called with userId:", userId);
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  console.log("CSRF Token:", csrfToken);

  $.ajax({
    url: "/hovuz/partner/send-activate-otp",
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      userId: userId,
      csrfToken: csrfToken,
    }),
    success: function (response) {
      console.log("sendActivateOTP success response:", response);
      if (response.success) {
        if (callback) callback(response);
      } else {
        alert(
          "OTP göndərilməsi zamanı xəta: " + (response.error || "Naməlum xəta")
        );
      }
    },
    error: function (xhr) {
      console.log("sendActivateOTP error:", xhr);
      let errorMessage = "Server xətası";
      try {
        const response = JSON.parse(xhr.responseText);
        errorMessage = response.error || errorMessage;
      } catch (e) {
        errorMessage = "Əlaqə xətası";
      }
      alert("OTP göndərilməsi zamanı xəta: " + errorMessage);
    },
  });
}

function verifyActivateOTP(otpCode, userId, callback) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: "/hovuz/partner/verify-activate-otp",
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      otpCode: otpCode,
      userId: userId,
      csrfToken: csrfToken,
    }),
    success: function (response) {
      if (response.success) {
        alert(response.message);
        if (callback) callback(response);
        // Reload table and refresh counts
        if (dataTable) {
          dataTable.ajax.reload();
        }
        loadPartnerCounts(); // Refresh the toggle button counts
      } else {
        alert("OTP doğrulama xətası: " + (response.error || "Naməlum xəta"));
      }
    },
    error: function (xhr) {
      let errorMessage = "Server xətası";
      try {
        const response = JSON.parse(xhr.responseText);
        errorMessage = response.error || errorMessage;
      } catch (e) {
        errorMessage = "Əlaqə xətası";
      }
      alert("OTP doğrulama xətası: " + errorMessage);
    },
  });
}

// OTP helper functions for deactivation
function sendDeactivateOTP(userId, callback) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: "/hovuz/partner/send-deactivate-otp",
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      userId: userId,
      csrfToken: csrfToken,
    }),
    success: function (response) {
      if (response.success) {
        if (callback) callback(response);
      } else {
        alert(
          "OTP göndərilməsi zamanı xəta: " + (response.error || "Naməlum xəta")
        );
      }
    },
    error: function (xhr) {
      let errorMessage = "Server xətası";
      try {
        const response = JSON.parse(xhr.responseText);
        errorMessage = response.error || errorMessage;
      } catch (e) {
        errorMessage = "Əlaqə xətası";
      }
      alert("OTP göndərilməsi zamanı xəta: " + errorMessage);
    },
  });
}

function verifyDeactivateOTP(otpCode, userId, callback) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: "/hovuz/partner/verify-deactivate-otp",
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      otpCode: otpCode,
      userId: userId,
      csrfToken: csrfToken,
    }),
    success: function (response) {
      if (response.success) {
        alert(response.message);
        if (callback) callback(response);
        // Reload table and refresh counts
        if (dataTable) {
          dataTable.ajax.reload();
        }
        loadPartnerCounts(); // Refresh the toggle button counts
      } else {
        alert("OTP doğrulama xətası: " + (response.error || "Naməlum xəta"));
      }
    },
    error: function (xhr) {
      let errorMessage = "Server xətası";
      try {
        const response = JSON.parse(xhr.responseText);
        errorMessage = response.error || errorMessage;
      } catch (e) {
        errorMessage = "Əlaqə xətası";
      }
      alert("OTP doğrulama xətası: " + errorMessage);
    },
  });
}

// OTP helper functions for deletion
function sendDeleteOTP(userId, callback) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: "/hovuz/partner/send-delete-otp",
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      userId: userId,
      csrfToken: csrfToken,
    }),
    success: function (response) {
      if (response.success) {
        if (callback) callback(response);
      } else {
        alert(
          "OTP göndərilməsi zamanı xəta: " + (response.error || "Naməlum xəta")
        );
      }
    },
    error: function (xhr) {
      let errorMessage = "Server xətası";
      try {
        const response = JSON.parse(xhr.responseText);
        errorMessage = response.error || errorMessage;
      } catch (e) {
        errorMessage = "Əlaqə xətası";
      }
      alert("OTP göndərilməsi zamanı xəta: " + errorMessage);
    },
  });
}

function verifyDeleteOTP(otpCode, userId, callback) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: "/hovuz/partner/verify-delete-otp",
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      otpCode: otpCode,
      userId: userId,
      csrfToken: csrfToken,
    }),
    success: function (response) {
      if (response.success) {
        alert(response.message);
        if (callback) callback(response);
        // Reload table and refresh counts
        if (dataTable) {
          dataTable.ajax.reload();
        }
        loadPartnerCounts(); // Refresh the toggle button counts
      } else {
        alert("OTP doğrulama xətası: " + (response.error || "Naməlum xəta"));
      }
    },
    error: function (xhr) {
      let errorMessage = "Server xətası";
      try {
        const response = JSON.parse(xhr.responseText);
        errorMessage = response.error || errorMessage;
      } catch (e) {
        errorMessage = "Əlaqə xətası";
      }
      alert("OTP doğrulama xətası: " + errorMessage);
    },
  });
}

// Updated modal functions with OTP integration
window.confirmAktivAction = function () {
  console.log("confirmAktivAction called with:", {
    currentUserId,
    currentAction,
  });
  if (!currentUserId || !currentAction) {
    alert("İstifadəçi məlumatları tapılmadı");
    return;
  }

  // Send OTP for activation
  sendActivateOTP(currentUserId, function (response) {
    console.log("OTP sent for development:", response.otpCode); // Remove in production

    // Hide current modal and open OTP modal (don't reset variables)
    $("#aktivModal").addClass("hidden");
    openOTPModal();
  });
};

window.confirmDeAktivAction = function () {
  if (!currentUserId || !currentAction) {
    alert("İstifadəçi məlumatları tapılmadı");
    return;
  }

  // Send OTP for deactivation
  sendDeactivateOTP(currentUserId, function (response) {
    console.log("OTP sent for development:", response.otpCode); // Remove in production

    // Hide current modal and open OTP modal (don't reset variables)
    $("#deAktivModal").addClass("hidden");
    openOTPModal();
  });
};

window.confirmDeleteAction = function () {
  if (!currentUserId || !currentAction) {
    alert("İstifadəçi məlumatları tapılmadı");
    return;
  }

  // Directly call the delete request function (no OTP)
  openSilinmeMuracietPopUp(currentUserId);

  // Hide the modal
  $("#silinmeMuracietPopUp").addClass("hidden");

  // Reset variables
  currentUserId = null;
  currentUserName = null;
  currentUserSurname = null;
  currentAction = null;
};

// Function to confirm delete request
window.confirmDeleteRequest = function (userId) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: `/hovuz/partner/${userId}/delete/confirm`,
    method: "POST",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      // Show success toast
      if (response.success) {
        // Show success message
        if (typeof toastr !== "undefined") {
          toastr.success(response.message || "Silinmə müraciəti təsdiqləndi");
        } else {
          alert(response.message || "Silinmə müraciəti təsdiqləndi");
        }

        // Reload all known DataTables (if initialized on the page)
        if (window.dataTable?.ajax) window.dataTable.ajax.reload(null, false);
        if (window.qrTable?.ajax) window.qrTable.ajax.reload(null, false);
        if (window.transactionsTable?.ajax)
          window.transactionsTable.ajax.reload(null, false);

        // Refresh partner counts
        if (typeof loadPartnerCounts === "function") {
          loadPartnerCounts();
        }
      } else {
        if (typeof toastr !== "undefined") {
          toastr.error(response.error || "Naməlum xəta");
        } else {
          alert("Xəta: " + (response.error || "Naməlum xəta"));
        }
      }
    },
    error: function (xhr, status, error) {
      console.error("Error confirming delete request:", error);
      if (typeof toastr !== "undefined") {
        toastr.error("Xəta baş verdi: " + error);
      } else {
        alert("Xəta baş verdi: " + error);
      }
    },
  });
};

// Status toggle functionality
function getCsrf() {
  return $('meta[name="csrf-token"]').attr("content");
}

$(document)
  .off("click", ".js-toggle-status")
  .on("click", ".js-toggle-status", function (e) {
    e.preventDefault();
    const $element = $(this);
    const pid = $element.data("id");
    const currentStatus = $element.data("status");
    const csrfToken = getCsrf();

    // Show loading state
    const originalText = $element.find("span:last").text();
    $element.find("span:last").text("Yüklənir...");
    $element.addClass("opacity-50 pointer-events-none");

    fetch(`/hovuz/partner/${pid}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "same-origin",
      body: JSON.stringify({ csrfToken }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res && res.success) {
          // Show success message
          if (typeof toastr !== "undefined") {
            toastr.success("Status yeniləndi");
          } else {
            alert("Status yeniləndi");
          }

          // Reload all known DataTables (if initialized on the page)
          if (window.dataTable?.ajax) window.dataTable.ajax.reload(null, false);
          if (window.qrTable?.ajax) window.qrTable.ajax.reload(null, false);
          if (window.transactionsTable?.ajax)
            window.transactionsTable.ajax.reload(null, false);

          // Refresh partner counts
          if (typeof loadPartnerCounts === "function") {
            loadPartnerCounts();
          }

          // 🔄 Hard reload to ensure ALL status badges/text are in sync
          setTimeout(() => {
            // Use small delay so toasts can display and async DT reloads can settle
            location.reload();
          }, 500);
        } else {
          if (typeof toastr !== "undefined") {
            toastr.error(res?.error || "Xəta baş verdi");
          } else {
            alert(res?.error || "Xəta baş verdi");
          }
        }
      })
      .catch(() => {
        if (typeof toastr !== "undefined") {
          toastr.error("Server xətası");
        } else {
          alert("Server xətası");
        }
      })
      .finally(() => {
        // Restore original state
        $element.find("span:last").text(originalText);
        $element.removeClass("opacity-50 pointer-events-none");
      });
  });
