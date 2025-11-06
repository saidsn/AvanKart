$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function escapeHtml(unsafe) {
    if (unsafe == null || unsafe === "") return "";
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    processing: true,
    serverSide: true,
    ajax: {
      url: "/settings/active-sessions",
      type: "POST",
      headers: {
        "csrf-token": csrfToken,
      },
      dataSrc: function (json) {
        console.log("Server response:", json);
        if ($("#sessionsCount").length) {
          $("#sessionsCount").text(
            json.recordsFiltered || (json.data ? json.data.length : 0)
          );
        }
        return json.data || [];
      },
      data: function (d) {
        const form = $("#sessionsFilterForm");
        const statuses = form
          .find("input[name='status[]']:checked")
          .map(function () {
            return $(this).val();
          })
          .get();

        d.start_date = form.find("input[name='start_date']").val();
        d.end_date = form.find("input[name='end_date']").val();
        d.customSearch = $("#customSearch").val();
        d.status = statuses;

        console.log("Sending search params:", {
          customSearch: d.customSearch,
          start_date: d.start_date,
          end_date: d.end_date,
          status: d.status,
        });

        return d;
      },
    },
    columns: [
      {
        orderable: false,
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
        data: function (row) {
          const safeName = escapeHtml(row.name);
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${safeName}</span>`;
        },
      },
      {
        data: function (row) {
          const safeDate = escapeHtml(row.date);
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${safeDate}</span>`;
        },
      },
      {
        data: function (row) {
          const safeLocation = escapeHtml(row.location);
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${safeLocation}</span>`;
        },
      },
      {
        orderable: false,
        data: function (row) {
          const safeSessionId = escapeHtml(row.id);
          return `
            <div class="text-base flex items-center cursor-pointer relative hidden">
              <div onclick="terminateSessionConfirm('${safeSessionId}')" data-tooltip="Sessiyanı bitir"
                   class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
            </div>
            <div class="flex">
              <div id="rewardCreateModal" class="relative inline-block text-left">
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"></div>
                <div class="hidden absolute right-[-12px] w-[115px] z-50 dropdown-menu">
                  <div class="relative h-[8px]">
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-white dark:bg-menu-dark rotate-45 border-l border-t border-white dark:border-menu-dark z-50"
                         style="box-shadow: -2px 0px 3px rgba(0,0,0,0.05), 2px 0px 3px rgba(0,0,0,0.05);"></div>
                  </div>
                  <div onclick="openPopup('${safeSessionId}')" style="box-shadow: 0px 0px 0px rgba(0,0,0,0.1), 0px 2px 2px rgba(0,0,0,0.1);" class="w-[115px] rounded-[8px] shadow-lg bg-white dark:bg-menu-dark overflow-hidden relative z-50">
                    <div class="py-[3.5px] text-[13px]">
                      <div class="text-messages dark:text-primary-text-color-dark flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        Sessiyanı bitir
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        },
      },
    ],
    order: [],
    lengthChange: false,

    createdRow: function (row) {
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (document.documentElement.classList.contains("dark")) {
            $(this).css("background-color", "#161E22");
          } else {
            $(this).css("background-color", "#FAFAFA");
          }
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      const isDarkMode = document.documentElement.classList.contains("dark");
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      $(row)
        .find("td")
        .css({
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      $(row).find("td:not(:first-child):not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      $(row)
        .find("td:first-child")
        .addClass("border-r-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .css({
          "padding-left": "0",
          "padding-right": "0",
          width: "48px",
          "text-align": "center",
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      $(row)
        .find("td:last-child")
        .addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .css({
          "padding-right": "0",
          "text-align": "right",
        });
    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      const isDarkMode = document.documentElement.classList.contains("dark");
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
        );
      });
    },

    drawCallback: function () {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination");

      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      }

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      $("#myTable tbody tr.spacer-row").remove();

      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      const isDarkMode = document.documentElement.classList.contains("dark");
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow
        .find("td:first-child")
        .css({ "border-right": `0.5px solid ${borderColor}` });
      $lastRow
        .find("td:last-child")
        .css({ "border-left": `0.5px solid ${borderColor}` });

      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
          pageInfo.page === 0
            ? "opacity-50 cursor-not-allowed"
            : "text-messages dark:text-primary-text-color-dark"
        }" onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
          <div class="icon stratis-chevron-left"></div>
        </div>
      `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
          <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages ${
            i === pageInfo.page
              ? "bg-[#F6D9FF] text-messages"
              : "bg-transparent text-tertiary-text"
          }" onclick="changePage(${i})">${i + 1}</button>
        `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
          pageInfo.page === pageInfo.pages - 1
            ? "opacity-50 cursor-not-allowed"
            : "text-tertiary-text"
        }" onclick="changePage(${pageInfo.page + 1})">
          <div class="icon stratis-chevron-right"></div>
        </div>
      `);
    },
  });

  $("#tableCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $('#myTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  let searchTimer = null;
  $("#customSearch").on("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      table.ajax.reload(null, false);
    }, 300);
  });

  window.filterForm = function () {
    table.ajax.reload();
  };

  window.clearFilters = function () {
    const form = $("#sessionsFilterForm");
    form.find("input[name='start_date']").val("");
    form.find("input[name='end_date']").val("");
    form.find("input[name='status[]']").prop("checked", false);
    table.ajax.reload();
  };

  window.changePage = function (page) {
    table.page(page).draw("page");
  };

  $(document).on("click", "a[href='#']", function (e) {
    e.preventDefault();
    const container = $(this).closest("div");
    if (container.find(".stratis-arrow-refresh-04").length > 0) {
      table.ajax.reload(null, false);
    }
  });

  window.terminateSession = function (sessionId) {
    $.ajax({
      url: "/settings/end-session",
      method: "POST",
      headers: { "csrf-token": csrfToken },
      data: { sessionId },
      success: function () {
        table.ajax.reload(null, false);
        if (typeof alertModal === "function") {
          alertModal("Session uğurla bitirildi", "success");
        }
      },
      error: function (xhr) {
        console.error("Session terminate error:", xhr);
        if (typeof alertModal === "function") {
          alertModal("Xəta baş verdi", "error");
        }
      },
    });
  };
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#rewardCreateModal");
  const dropdown = wrapper.querySelector(".dropdown-menu");
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });
  dropdown.classList.toggle("hidden");
}

document.addEventListener("click", function (event) {
  const isDropdown = event.target.closest(".dropdown-menu");
  const isTrigger = event.target.closest(".stratis-dot-vertical");
  if (!isDropdown && !isTrigger) {
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((el) => el.classList.add("hidden"));
  }
});

function openPopup(idS) {
  $(".custom-popup").remove();

  const popupOverlay = document.createElement("div");
  popupOverlay.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[9999]";

  const popup = document.createElement("div");
  popup.className =
    "bg-white dark:bg-menu-dark w[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative";

  popup.innerHTML = `
    <div class="w-[306px] flex flex-col gap-3">
      <div class="w-10 h-10 rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark flex items-center justify-center">
        <div class="iconex iconex-music-plate-1 w-5 h-5 text-messages dark:text-on-primary-dark"></div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-[#1D222B] dark:text-on-primary-dark font-medium text-[15px]">Sessiya</div>
        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[13px] font-normal">Seçilən bütün sessiyaları bitirmək istədiyinizə əminsiniz?</div>
      </div>
    </div>
    <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
      <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant dark:text-on-surface-variant-dark bg-surface-bright dark:bg-surface-bright-dark hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
      <button onclick="terminateSession('${idS}');$('.custom-popup').remove();" class="cursor-pointer px-3 py-1 rounded-full text-on-primary dark:text-on-primary-dark bg-error dark:bg-error-dark transition">Bəli, bitir</button>
    </div>
  `;

  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);

  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
}
