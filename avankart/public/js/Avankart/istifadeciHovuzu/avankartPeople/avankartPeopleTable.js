// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;
let columnVisibilityMap = {
  "checkbox-cinsi": 1,
  "checkbox-dogum": 2,
  "checkbox-vezife": 3,
  "checkbox-email": 4,
  "checkbox-telefon": 5,
  "checkbox-status": 6,
  "checkbox-uzvluq": null,
  "checkbox-qeydiyyat": null,
  "checkbox-dogrulama": null,
};

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Status tab count-larını yüklə
  function loadStatusCounts() {
    $.ajax({
      url: "/api/people/table",
      type: "POST",
      contentType: "application/json",
      headers: { "X-CSRF-Token": csrfToken },
      data: JSON.stringify({ countsOnly: true }),
      success: function (resp) {
        const c = resp && resp.data ? resp.data : {};
        // Elementləri tap və mətnləri yenilə (mövcuddursa)
        const map = [
          ["#allButton", `Hamısı (${c.total ?? 0})`],
          ["#activeButton", `Aktiv (${c.aktiv ?? 0})`],
          ["#deactiveButton", `Deaktiv (${c.deaktiv ?? 0})`],
          ["#deletedButton", `Silinmişlər (${c.silinmis ?? 0})`],
          [
            "#deactivationPendingButton",
            `Deaktivasiya gözləyir (${c.deactivationPending ?? 0})`,
          ],
          ["#pendingButton", `Silinmə gözləyir (${c.pendingDelete ?? 0})`],
        ];
        map.forEach(([sel, text]) => {
          const el = $(sel);
          if (el.length) el.text(text);
        });
      },
      error: function (err) {
        console.warn("[StatusCounts] yüklənmə xətası", err);
      },
    });
  }

  loadStatusCounts();

  // Şirkət filteri üçün siyahını yüklə
  function loadCompanies() {
    const dropdown = $("#dropdown_company");
    if (!dropdown.length) return;
    $.ajax({
      url: "/api/people/companies",
      method: "GET",
      headers: { "X-CSRF-Token": csrfToken },
      success: function (resp) {
        const list = resp.data || [];
        // Loading yazısını sil
        dropdown.find("#company_loading").remove();
        dropdown.children("label").remove();
        if (!list.length) {
          dropdown.append(
            '<div class="px-4 py-2 text-[12px] opacity-60">Şirkət tapılmadı</div>'
          );
          return;
        }
        list.forEach((c) => {
          const id = `company-${c.id}`;
          dropdown.append(`
            <label for="${id}" class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
              <input type="checkbox" id="${id}" class="peer hidden" value="${c.id}" />
              <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
              </div>
              <span class="dark:text-white">${c.name}</span>
            </label>
          `);
        });
      },
      error: function (err) {
        dropdown.find("#company_loading").text("Yüklənmə xətası");
        console.warn("Şirkət siyahısı yüklənmədi", err);
      },
    });
  }

  loadCompanies();

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

    // DataTables errorları üçün konsol log
    $.fn.dataTable.ext.errMode = "none";

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: "/api/people/table",
        type: "POST",
        contentType: "application/json",
        headers: { "X-CSRF-Token": csrfToken },
        data: function (d) {
          const payload = {
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            status: currentFilters.status,
            genders: currentFilters.cardGender || currentFilters.genders,
            companies: currentFilters.companys || currentFilters.companies,
          };
          return JSON.stringify({
            ...payload,
          });
        },
        dataSrc: function (json) {
          if (!json || !Array.isArray(json.data)) {
            console.warn("[DataTable] Unexpected response structure:", json);
          }
          // Hər data yüklənəndə status count-ları yenilə (performans uyğunsuz olsa debounce edilə bilər)
          loadStatusCounts();
          return json.data;
        },
        error: function (xhr, status, err) {
          console.warn(
            "[DataTable AJAX error]",
            status,
            err,
            "statusCode:",
            xhr.status,
            "response:",
            xhr.responseText
          );
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
          render: (d) => '<span class="text-[13px]">' + (d || "—") + "</span>",
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
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "company",
          render: (d) => '<span class="text-[13px]">' + (d || "—") + "</span>",
        },
        {
          data: "createdAt",
          render: (d) => '<span class="text-[13px]">' + (d || "—") + "</span>",
        },
        // dogrulama hissesi acilacaq
        {
          data: "verified",
          visible: false,
          render: (d) =>
            '<span class="text-[13px] ">' + (d || "FALSE") + "</span>",
        },
        {
          data: function (row) {
            // Yeni field-lər: row.activationStatus, row.pendingDelete
            const activation = row.activationStatus || row.status;
            const pendingDelete = !!row.pendingDelete;

            function badge(label, type) {
              let colorClass = "bg-[#FF7043]"; // default
              if (label === "Aktiv") colorClass = "bg-[#4FC3F7]";
              else if (label === "Deaktiv") colorClass = "bg-[#BDBDBD]";
              else if (label === "Silinib") colorClass = "bg-[#EF5350]";
              else if (label === "Silinmə gözləyir")
                colorClass = "bg-[#FFCA28]";
              return (
                `<div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[220px] whitespace-nowrap text-ellipsis gap-2">` +
                `<span class=\"w-[6px] h-[6px] rounded-full ${colorClass} shrink-0\"></span>` +
                `<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-medium\">${label}</span>` +
                `</div>`
              );
            }

            // Əgər pendingDelete varsa iki badge yanaşı göstər
            if (pendingDelete && activation !== "Silinib") {
              return `<div class="flex items-center gap-2">${badge(activation, "activation")}${badge("Silinmə gözləyir", "pending")}</div>`;
            }
            // Yoxdursa sadəcə activationStatus (və ya legacy status)
            return badge(activation, "activation");
          },
        },
        {
          data: function (row) {
            let dropdownContent = "";

            // Statusa görə dropdown menyunun içindəki elementləri dəyişdir
            if (row.status === "Aktiv") {
              dropdownContent = `
        <div onclick="openUserInside('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
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
        <div onclick="deactivateUser('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                  <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
                  <span class="font-medium text-error text-[13px] whitespace-nowrap">Deaktiv et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
        <div onclick="requestDeleteUser('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                  <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                  <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
                </div>
              `;
            } else if (row.status === "Deaktiv") {
              dropdownContent = `
        <div onclick="openUserInside('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
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
                <div onclick="activateUser('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover">
                  <span class="icon stratis-shield-check text-messages text-[13px]"></span>
                  <span class="font-medium text-messages text-[13px] whitespace-nowrap">Aktiv et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                <div onclick="requestDeleteUser('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                  <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                  <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
                </div>
              `;
            } else if (row.status === "Silinmə gözləyir") {
              dropdownContent = `
                <div onclick="openUserInside('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
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
                <div onclick="openUserInside('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
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
                <div onclick="openUserInside('${row.id}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
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
            location.href = `/hovuz/people/${rowData.id}`;
          }
        });

        $('#sutunlarPopup input[type="checkbox"]')
          .off("change.columnvis")
          .on("change.columnvis", function () {
            const idx = columnVisibilityMap[this.id];
            if (idx === null || idx === undefined || !dataTable) return;
            dataTable.column(idx).visible(this.checked);
            dataTable.columns.adjust();
          });
      },
    });
  }

  function applyColumnVisibilityFromChecks() {
    if (!dataTable) return;
    Object.entries(columnVisibilityMap).forEach(([id, idx]) => {
      if (idx === null || idx === undefined) return;
      const isChecked = $("#" + id).is(":checked");
      dataTable.column(idx).visible(isChecked, false);
    });
    dataTable.columns.adjust().draw(false);
  }

  initializeDataTable();
  applyColumnVisibilityFromChecks();
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
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

  // Tam yazını götür (məs: "Silinmə gözləyir (1)") və mötərizə hissəsini sil
  const raw = element.textContent.trim();
  const cleaned = raw.replace(/\(.*?\)/, "").trim();
  // cleaned indi: Hamısı | Aktiv | Deaktiv | Silinmişlər | Silinmə gözləyir | Deaktivasiya gözləyir
  if (cleaned === "Hamısı") {
    delete currentFilters.status;
  } else {
    currentFilters.status = cleaned;
  }

  // Reload the DataTable with the new filters
  if (dataTable) {
    dataTable.ajax.reload(function (json) {}, false);
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

// Refresh data function - maintains current filters and tab state

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

  // Subyektləri al
  const companys = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).val() || $(this).attr("id");
    // id prefixi company- ola bilər, ehtiyat üçün həm value həm id istifadə edilir
    companys.push(companyId.replace(/^company-/, "").replace(/^subyekt-/, ""));
  });

  if (companys.length > 0) {
    currentFilters.companys = companys;
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

  // Modal içində artıq aktivlik radio-ları yoxdur; status yalnız yuxarıdakı tab-lardan idarə olunur.

  // Genderları al
  const cardGender = [];
  $('input[name="card_gender"]:checked').each(function () {
    cardGender.push($(this).val());
  });

  //   if (cardGender.length > 0) {
  //     currentFilters.card_gender =
  //       cardGender.length === 1 ? cardGender[0] : cardGender;
  //   }

  if (cardGender.length > 0) {
    currentFilters.cardGender = cardGender;
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

  // Məlumat cədvəlini yenilə
  if (dataTable) {
    dataTable.ajax.reload(function (json) {}, false);
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
window.openAktivModal = function () {
  if ($("#aktivModal").hasClass("hidden")) {
    $("#aktivModal").removeClass("hidden");
  } else {
    $("#aktivModal").addClass("hidden");
  }
};

window.closeAktivModal = function () {
  $("#aktivModal").addClass("hidden");
};

// Tesdiq modal functions
window.openDeAktivModal = function () {
  if ($("#deAktivModal").hasClass("hidden")) {
    $("#deAktivModal").removeClass("hidden");
  } else {
    $("#deAktivModal").addClass("hidden");
  }
};

window.closeDeAktivModal = function () {
  $("#deAktivModal").addClass("hidden");
};

// Silinmə Müraciət Popup funksiyaları
window.openSilinmeMuracietPopUp = function () {
  if ($("#silinmeMuracietPopUp").hasClass("hidden")) {
    $("#silinmeMuracietPopUp").removeClass("hidden");
  } else {
    $("#silinmeMuracietPopUp").addClass("hidden");
  }
};

window.closeSilinmeMuracietPopUp = function () {
  $("#silinmeMuracietPopUp").addClass("hidden");
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

// ===== Yeni Action funksiyaları =====
window.deactivateUser = function (peopleId) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  $.ajax({
    url: `/api/people/${peopleId}/deactivate`,
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
    success: function (resp) {
      dataTable && dataTable.ajax.reload(null, false);
    },
    error: function (err) {
      console.warn("Deaktiv xətası", err);
    },
  });
};

window.activateUser = function (peopleId) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  $.ajax({
    url: `/api/people/${peopleId}/activate`,
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
    success: function (resp) {
      dataTable && dataTable.ajax.reload(null, false);
    },
    error: function (err) {
      console.warn("Aktiv xətası", err);
    },
  });
};

window.requestDeleteUser = function (peopleId) {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  $.ajax({
    url: `/api/people/${peopleId}/delete-request`,
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
    success: function (resp) {
      dataTable && dataTable.ajax.reload(null, false);
    },
    error: function (err) {
      console.warn("Silinmə müraciəti xətası", err);
    },
  });
};

window.openUserInside = function (peopleId) {
  window.location.href = `/istifadeci-hovuzu/people/${peopleId}`;
};
