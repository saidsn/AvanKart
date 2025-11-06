$(document).ready(function () {
  // Keep track of the currently active table
  let activeTableId = "myTable3";
  let table3, tableLeft;
  // If URL contains start/end date params (startDate or start_date), populate the filter inputs
  try {
    const params = new URLSearchParams(window.location.search);
    const urlStart = params.get("startDate") || params.get("start_date");
    const urlEnd = params.get("endDate") || params.get("end_date");
    if (urlStart) {
      const startInput = document.getElementById("startDate");
      if (startInput) startInput.value = urlStart;
    }
    if (urlEnd) {
      const endInput = document.getElementById("endDate");
      if (endInput) endInput.value = urlEnd;
    }
  } catch (e) {
    // ignore malformed URL
  }
  // --- TABLE INITIALIZATION ---
  if ($.fn.DataTable.isDataTable("#myTable3")) {
    $("#myTable3").DataTable().ajax.reload();
  } else {
    table3 = $("#myTable3").DataTable({
      paging: true,
      info: false,
      dom: "t",
      ajax: {
        url: "/partner/avankart-partner",
        type: "POST",
        data: function (d) {
          const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

          const formData = $("#filterPopForm").serializeArray();

          const genderValues = [];
          formData.forEach((item) => {
            if (item.name === "gender") {
              genderValues.push(item.value);
            } else {
              d[item.name] = item.value;
            }
          });

          // Map frontend date field names to backend keys the controller expects
          // some pages may use startDate/endDate (camelCase) while server expects start_date/end_date
          if (d.startDate) {
            d.start_date = d.startDate;
          }
          if (d.endDate) {
            d.end_date = d.endDate;
          }

          if (genderValues.length > 0) {
            d.gender = genderValues;
          }

          d.category = "current";
          d.sadiq = "current";
          d._csrf = csrfToken;
        },
      },
      columns: [
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
              <input type="checkbox" id="cb-active-${idx}" class="peer hidden">
              <label for="cb-active-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:text-on-primary dark:peer-checked:text-primary-text-color-dark peer-checked:border-primary dark:peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            `;
          },
        },
        {
          data: function (row) {
            return `
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                  ${row.fullname
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div class="flex flex-col">
                  <span class="text-messages text-[13px] font-medium dark:text-white">${
                    row.fullname
                  }</span>
                  <span class="text-secondary-text text-[11px] font-normal dark:text-white">ID: ${
                    row.partner_id
                  }</span>
                </div>
              </div>
            `;
          },
        },
        {
          data: "gender",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          data: "email",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          data: function (row) {
            return `
              <div class="flex items-center gap-1 cursor-pointer text-messages dark:text-white">
                <span class="text-[13px] font-normal">${row.qrCodeCount}</span>
                <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
              </div>
            `;
          },
        },
        {
          data: "phoneNumber",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          data: null,
          render: function (data, type, row) {
            if (row.status) {
              let color = "";
              switch (row.status) {
                case "active":
                  color = "bg-[#4FC3F7]";
                  break;
                case "qaralama":
                  color = "bg-[#BDBDBD]";
                  break;
                case "complated":
                case "completed":
                case "tamamlandi":
                  color = "bg-[#66BB6A]";
                  break;
                case "pending":
                case "waiting":
                  color = "bg-[#FFCA28]";
                  break;
                case "reported":
                case "rejected":
                  color = "bg-[#EF5350]";
                  break;
                default:
                  color = "bg-[#FF7043]";
              }
              return `
              <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
              </div>
            `;
            }
            return `<div class=flex><span class="text-[13px] text-messages font-base px-2 py-1 rounded-full max-w-full flex items-center dark:text-white justify-center ${row.isInvite ? "bg-container-2 dark:bg-table-hover-dark dark:text-white" : ""}">
            <span class="w-[6px] h-[6px] rounded-full shrink-0 mr-2 ${row.isInvite ? "" : "hidden"}" style="${row.isInvite ? (row.inviteRawStatus === "rejected" ? "background-color: #EF5350;" : row.inviteRawStatus === "accepted" ? "background-color: #4CAF50;" : "background-color: #FFCA28;") : ""}"></span> 
            ${
              row.isInvite
                ? row.inviteStatus
                : row.hireDate
                  ? row.hireDate
                  : "-"
            }</span></div>`;
          },
        },
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
              <div class="text-base flex items-center  cursor-pointer dropdown-trigger-active" data-row="${idx}">
                <div class="icon stratis-dot-vertical text-messages  w-5 h-5 dark:text-white"></div>
                <div class="dropdown-menu-active dropdown-triangle hidden absolute z-50" id="dropdown-active-${idx}">
                  <div class="relative w-[103px] dark:bg-[#161E22] h-[74px] border-[#0000001A] border-[0.5px] dark:border-[#FFFFFF1A] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
                    <a href="/user/${row.partner_id}" class=" flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] dark:hover:bg-gray-400 hover:bg-item-hover transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                      <div class="icon stratis-cursor-06 dark:text-[#fff] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                      <span class="text-[13px] font-medium text-messages dark:text-[#fff]  disabled:text-on-surface-variant-dark">Aç</span>
                    </a>
                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                    <div data-value="${row.id ?? row.partner_id}" class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                      <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                      <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Cihazı sil</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          },
        },
      ],
      order: [],
      lengthChange: false,
      pageLength: 5,
      createdRow: function (row, data, dataIndex) {
        applyRowStyling(row, data);
      },
      initComplete: function () {
        applyTableInit("myTable3");
      },
      drawCallback: function () {
        var total = this.api().page.info().recordsTotal;
        $("#aktivSay").text(total);

        if (activeTableId === "myTable3") {
          applyDrawCallback(this.api(), "myTable3");
        }
      },
    });
  }

  if ($.fn.DataTable.isDataTable("#myTableLeft")) {
    $("#myTableLeft").DataTable().ajax.reload(); // varsa reload
  } else {
    tableLeft = $("#myTableLeft").DataTable({
      paging: true,
      info: false,
      dom: "t",
      ajax: {
        url: "/partner/avankart-partner",
        type: "POST",
        data: function (d) {
          const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

          const formData = $("#filterPopForm").serializeArray();

          const genderValues = [];
          formData.forEach((item) => {
            if (item.name === "gender") {
              genderValues.push(item.value);
            } else {
              d[item.name] = item.value;
            }
          });

          if (genderValues.length > 0) {
            d.gender = genderValues;
          }

          d.category = "old";
          d._csrf = csrfToken;
        },
      },

      columns: [
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
              <input type="checkbox" id="cb-left-${idx}" class="peer hidden">
              <label for="cb-left-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:text-on-primary dark:peer-checked:text-primary-text-color-dark peer-checked:border-primary dark:peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            `;
          },
        },
        {
          data: function (row) {
            return `
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                  ${row.fullname
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div class="flex flex-col">
                  <span class="text-messages text-[13px] font-medium dark:text-white">${
                    row.name
                  }</span>
                  <span class="text-secondary-text text-[11px] font-normal dark:text-white">ID: ${
                    row.id
                  }</span>
                </div>
              </div>
            `;
          },
        },
        {
          data: "gender",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          data: "email",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          data: function (row) {
            return `
              <div class="flex items-center gap-1 cursor-pointer text-messages dark:text-white">
                <span class="text-[13px] font-normal">${row.qr}</span>
                <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
              </div>
            `;
          },
        },
        {
          data: "phone",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          data: "start",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          data: "end",
          render: (data) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${data}</span>`,
        },
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
              <div class="text-base flex items-center cursor-pointer dropdown-trigger-left" data-row="${idx}">
                <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-white"></div>
                <div class="dropdown-menu-left dropdown-triangle hidden absolute z-50" id="dropdown-left-${idx}">
                  <div class="relative w-[103px] h-[74px] border-[#0000001A] dark:bg-[#161E22] border-[0.5px] dark:border-[#FFFFFF1A] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
                    <a href="/user/${row.partner_id}" class="flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] dark:hover:bg-gray-500 hover:bg-item-hover transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                      <div class="icon stratis-cursor-06 dark:text-[#FFFFFF] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                      <span class="text-[13px] font-medium dark:text-[#FFFFFF] text-messages disabled:text-on-surface-variant-dark">Aç</span>
                    </a>
                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                    <div onclick="geriqaytarClick()" class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] dark:hover:bg-gray-500 transition ease-out duration-300 hover:bg-item-hover active:bg-[#DD38381A] disabled:bg-body-bg restore-action">
                      <div class="icon stratis-arrow-rotate-left-01 dark:text-[#FFFFFFA6] opacity-65 !w-[13px] !h-[13px] mr-[9px] disabled:text-on-surface-variant-dark"></div>
                      <span class="text-[13px] font-medium dark:text-[#fff] disabled:text-on-surface-variant-dark">Geri qaytar</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          },
        },
      ],
      order: [],
      lengthChange: false,
      pageLength: 5,
      createdRow: function (row, data, dataIndex) {
        applyRowStyling(row, data);
      },
      initComplete: function () {
        applyTableInit("myTableLeft");
      },
      drawCallback: function () {
        var total = this.api().page.info().recordsTotal;
        $("#ayrilanSay").text(total);

        if (activeTableId === "myTableLeft") {
          applyDrawCallback(this.api(), "myTableLeft");
        }
      },
    });
  }
  // --- HELPER FUNCTIONS (REVISED) ---

  function applyDrawCallback(api, tableId) {
    const paginationId = "#customPaginationTable1";
    const pageInfo = api.page.info();
    const $pagination = $(paginationId);

    $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

    if (pageInfo.pages <= 1) {
      $pagination.hide();
      return;
    }
    $pagination.show().empty();

    const colCount = $(`#${tableId} thead th`).length;
    $(`#${tableId} tbody tr.spacer-row`).remove();
    $(`#${tableId} tbody`).prepend(
      `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`
    );

    $pagination.append(
      `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
        pageInfo.page === 0
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF]"
      }" onclick="changePage(${Math.max(
        0,
        pageInfo.page - 1
      )}, '${tableId}')"><div class="icon stratis-chevron-left text-xs"></div></div>`
    );
    let paginationButtons = '<div class="flex gap-2">';
    for (let i = 0; i < pageInfo.pages; i++) {
      paginationButtons += `<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${
        i === pageInfo.page
          ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
          : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
      }" onclick="changePage(${i}, '${tableId}')">${i + 1}</button>`;
    }
    paginationButtons += "</div>";
    $pagination.append(paginationButtons);
    $pagination.append(
      `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
        pageInfo.page === pageInfo.pages - 1
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF]"
      }" ${
        pageInfo.page < pageInfo.pages - 1
          ? `onclick="changePage(${pageInfo.page + 1}, '${tableId}')"`
          : ""
      }><div class="icon stratis-chevron-right text-xs"></div></div>`
    );
  }

  function applyRowStyling(row, data) {
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
      .not(":first-child, :last-child")
      .on("click", function () {
        window.location.href = `/user/${data.partner_id}`;
      });
    $(row)
      .find("td")
      .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");
    $(row).find("td:not(:first-child, :last-child)").css({
      "padding-left": "20px",
      "padding-top": "14.5px",
      "padding-bottom": "14.5px",
    });
    $(row).find("td:first-child").css({
      "padding-left": "0",
      "padding-right": "0",
      width: "48px",
      "text-align": "center",
    });
    $(row).find("td:first-child label").css({
      margin: "0",
      display: "inline-flex",
      "justify-content": "center",
      "align-items": "center",
    });
    $(row)
      .find("td:last-child")
      .addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]")
      .css({
        "padding-right": "0",
        "text-align": "right",
        position: "relative",
      });
    $(row)
      .find("td:first-child")
      .addClass("border-r-[.5px] border-stroke dark:border-[#FFFFFF1A]");
  }

  function applyTableInit(tableId) {
    $(`#${tableId} thead th`).css({
      "padding-left": "20px",
      "padding-top": "10.5px",
      "padding-bottom": "10.5px",
    });
    $(`#${tableId} thead th:first-child`).css({
      "padding-left": "0",
      "padding-right": "0",
      width: "58px",
      "text-align": "center",
      "vertical-align": "middle",
    });
    $(`#${tableId} thead th:first-child label`).css({
      margin: "0 auto",
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
    });
    $(`#${tableId} thead th.filtering`).each(function () {
      $(this).html(
        '<div class="custom-header flex gap-2.5 items-center"><div>' +
          $(this).text() +
          '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
      );
    });
  }

  // --- EVENT HANDLERS (REVISED WITH PROPER EVENT DELEGATION) ---

  // Search handler (works for both tables)
  $("#customSearch").on("keyup", function () {
    const searchValue = this.value;
    table3.search(searchValue).draw();
    tableLeft.search(searchValue).draw();
  });

  //reload page button
  $("#reload_btn").on("click", function (e) {
    e.preventDefault();

    if (
      activeTableId === "myTable3" &&
      $.fn.DataTable.isDataTable("#myTable3")
    ) {
      $("#myTable3").DataTable().ajax.reload(null, false);
    } else if (
      activeTableId === "myTableLeft" &&
      $.fn.DataTable.isDataTable("#myTableLeft")
    ) {
      $("#myTableLeft").DataTable().ajax.reload(null, false);
    }
  });

  // "Go to Page" handler
  $(".go-button").on("click", function (e) {
    e.preventDefault();
    const pageNum = parseInt($(".page-input").val(), 10);
    if (isNaN(pageNum) || pageNum < 1) return;

    const targetTable = activeTableId === "myTable3" ? table3 : tableLeft;
    const pageInfo = targetTable.page.info();

    let targetPage = pageNum - 1;
    if (targetPage >= pageInfo.pages) {
      targetPage = pageInfo.pages - 1;
    }
    targetTable.page(targetPage).draw("page");
  });

  // Checkbox handlers
  $("#newCheckbox").on("change", function () {
    $('#myTable3 tbody input[type="checkbox"]')
      .prop("checked", $(this).is(":checked"))
      .trigger("change");
  });

  $("#newCheckboxLeft").on("change", function () {
    $('#myTableLeft tbody input[type="checkbox"]')
      .prop("checked", $(this).is(":checked"))
      .trigger("change");
  });

  // --- DROPDOWN EVENT HANDLERS (USING EVENT DELEGATION) ---

  // Handle dropdown trigger clicks
  $(document).on(
    "click",
    ".dropdown-trigger-active, .dropdown-trigger-left",
    function (e) {
      e.stopPropagation();
      const rowId = $(this).data("row");
      const dropdownId = `#${
        $(this).hasClass("dropdown-trigger-active")
          ? "dropdown-active"
          : "dropdown-left"
      }-${rowId}`;

      // Hide all other dropdowns
      $(".dropdown-menu-active, .dropdown-menu-left")
        .not(dropdownId)
        .addClass("hidden");

      // Show this dropdown
      $(dropdownId)
        .removeClass("hidden")
        .css({ top: "30px", right: "22px", left: "auto" });
      $(this).parent().css("position", "relative");
    }
  );

  $(document).on("click", ".delete-action", function (e) {
    e.stopPropagation();
    const userId = $(this).data("value");
    deletePopUp(userId);
    $(".dropdown-menu-active, .dropdown-menu-left").addClass("hidden");
  });

  $(document).on("click", ".restore-action", function (e) {
    e.stopPropagation();
    $(".dropdown-menu-active, .dropdown-menu-left").addClass("hidden");
  });

  // Close dropdowns when clicking elsewhere
  $(document).on("click", function () {
    $(".dropdown-menu-active, .dropdown-menu-left").addClass("hidden");
  });

  // Prevent dropdown from closing when clicking inside it
  $(document).on(
    "click",
    ".dropdown-menu-active, .dropdown-menu-left",
    function (e) {
      e.stopPropagation();
    }
  );

  // --- TAB & PAGE MANAGEMENT (REVISED) ---

  function setActiveTab(targetTableId) {
    activeTableId = targetTableId;

    if (activeTableId === "myTable3") {
      $("#aktivWrapper").removeClass("hidden");
      $("#ayrilanWrapper").addClass("hidden");

      // Update tab styling - set aktiv as active
      $("#aktivButton")
        .addClass("bg-inverse-on-surface dark:bg-[#2E3135]")
        .removeClass("bg-transparent");
      $("#ayrilanlarSpan")
        .removeClass("bg-inverse-on-surface dark:bg-[#2E3135]")
        .addClass("bg-transparent");

      if (table3) {
        table3.draw("page");
      }
    } else {
      $("#aktivWrapper").addClass("hidden");
      $("#ayrilanWrapper").removeClass("hidden");

      // Update tab styling - set ayrılanlar as active
      $("#ayrilanlarSpan")
        .addClass("bg-inverse-on-surface dark:bg-[#2E3135]")
        .removeClass("bg-transparent");
      $("#aktivButton")
        .removeClass("bg-inverse-on-surface dark:bg-[#2E3135]")
        .addClass("bg-transparent");

      if (tableLeft) {
        tableLeft.draw("page");
      }
    }
    $(".page-input").val("");
  }

  // Tab switching event listeners
  $("#aktivButton").on("click", () => setActiveTab("myTable3"));
  $("#ayrilanlarSpan").on("click", () => setActiveTab("myTableLeft"));

  // --- GLOBAL FUNCTIONS ---

  window.changePage = function (page, tableId) {
    const targetTable = tableId === "myTable3" ? table3 : tableLeft;
    targetTable.page(page).draw("page");
  };

  // --- POPUP FUNCTIONS (FROM YOUR OLD CODE) ---

  window.deletePopUp = function (userId) {
    const isciniSil2 = document.querySelector("#iscisilDiv2");
    const isciniSilIdsinsert = document.getElementById("isciniSilIdsinsert");

    if (userId) {
      isciniSil2.classList.remove("hidden");
      isciniSil2.style.display = "block";
      isciniSil2.style.position = "fixed";
      isciniSil2.style.top = "50%";
      isciniSil2.style.left = "50%";
      isciniSil2.style.transform = "translate(-50%, -50%)";
      isciniSil2.style.zIndex = "9999";
      isciniSilIdsinsert.value = userId;
    } else {
      isciniSil2.classList.add("hidden");
      isciniSil2.style.display = "none";
    }
  };

  window.toggleEmail = function () {
    csrfToken = $('meta[name="csrf-token"]').attr("content");
    userId = $("#isciniSilIdsinsert").val();

    $.ajax({
      url: "/muessise-info/delete-user",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: { id: userId },
      success: function (response) {
        $("#deletePopUp").addClass("hidden");
        $("#overlay").addClass("hidden");
        document.getElementById("iscisilDiv2").style.display = "none";
        document.getElementById("iscisilDiv2").classList.add("hidden");

        if (response.success && response.otpRequired) {
          if (
            typeof Otp === "function" &&
            response.email &&
            response.tempDeleteId
          ) {
            Otp(response.email, response.tempDeleteId, {
              url: "/muessise-info/accept-delete-user",
              title: "İstifadəçi Silmə",
              formType: "deleteUser",
              submitText: "Təsdiqlə",
              cancelText: "Ləğv et",
            });
          } else if (
            typeof Otp === "function" &&
            userEmail &&
            response.tempDeleteId
          ) {
            Otp(userEmail, response.tempDeleteId, {
              url: "/muessise-info/accept-delete-user",
              title: "İstifadəçi Silmə",
              formType: "deleteUser",
              submitText: "Təsdiqlə",
              cancelText: "Ləğv et",
            });
          } else {
            alert("OTP popup açıla bilmədi");
          }
        } else if (response.success) {
          alert("İstifadəçi uğurla silindi");
          location.reload();
        } else {
          alert(response.message || "Xəta baş verdi");
        }
      },
      error: function (xhr, status, error) {
        alert(xhr.responseJSON?.message || "Server xətası baş verdi");
      },
      complete: function () {
        window.currentDeleteType = null;
        window.currentDeleteId = null;
        window.currentDeleteEmail = null;
      },
    });
  };

  window.submitEmail = function () {
    toggleEmail();
  };

  // --- INITIALIZE ---
  setActiveTab("myTable3");
});
