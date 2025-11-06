$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  let table;
  if ($.fn.DataTable.isDataTable("#myTable")) {
    $("#myTable").DataTable().ajax.reload(); // varsa reload
  } else {
    const table = $("#myTable").DataTable({
      paging: true,
      info: false,
      dom: "t",
      ajax: {
        url: "/partner/avankart-partner/transactions-table",
        type: "POST",
        headers: {
          "CSRF-Token": csrfToken,
        },
        data: function (d) {
          d.user_id = $("#userIdHidden").val();
          d.search = $("#customSearch").val();
          d.start_date = $("#startDate").val() || "";
          d.end_date = $("#endDate").val() || "";
          d.gender =
            $("input[name='gender']:checked")
              .map(function () {
                return this.value;
              })
              .get() || [];
          d.category = $("#categorySelect").val() || "";
          d.users = $("#usersFilter").val() || [];
        },
        dataSrc: function (json) {
          $("#aktivCount").text(json.recordsFiltered);
          return json.data;
        },
      },

      processing: true,
      serverSide: true,
      headers: {
        "CSRF-Token": csrfToken,
      },
      xhrFields: {
        withCredentials: true,
        rejectUnauthorized: false,
      },
      columns: [
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row._id;
            return `
                    <input type="checkbox" id="perm-cb-${idx}" class="peer hidden">
                        <label for="perm-cb-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
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
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${
              row.gender ?? "male"
            }</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.email}</span>`;
          },
        },
        {
          data: function (row) {
            return `
                        <div class="flex items-center gap-1 cursor-pointer text-messages dark:text-white">
                            <span class="text-[13px] font-normal">${
                              row.qrCodeCount ?? 0
                            }</span>
                            <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
                        </div>
                        `;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.phoneNumber}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.hireDate}</span>`;
          },
        },
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
                            <div class="text-base flex items-center cursor-pointer dropdown-trigger" data-row="${idx}">
                                <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-white"></div>
                                <div class="dropdown-menu hidden absolute z-50" id="dropdown-${idx}">
                                    <div class="absolute top-[-11.5px] right-[0px] transform -translate-x-1/2 z-10">
                                        <img src="/images/avankart-partner-pages-images/Polygon 1.svg"
                                            alt="polygon"
                                            class="w-[14px] h-[12px]">
                                    </div>
                                    <div class="relative w-[103px] h-[74px] border-[#0000001A] border-[0.5px]
                                        shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
                                        <a href="/partner/user/${row.partner_id}" class="flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                                            transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                                            <div class="icon stratis-cursor-06 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                            <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Aç</span>
                                        </a>
                                        <div class="h-[0.5px] bg-[#0000001A]"></div>
                                        <div onclick="deleteRow()" class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                                            ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                                            <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                                            <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark" data-userid="${row.id}">Cihazı sil</span>
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
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        // Hover effekti
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            const isDark = $("html").hasClass("dark"); // Dark mod yoxlanılır
            if (!isDark) {
              $(this).css("background-color", "#FAFAFA"); // Yalnız light modda hover effekti
            }
          })
          .on("mouseleave", function () {
            $(this).css("background-color", ""); // Hover effekti silinir
          });

        // Bütün td-lərə border alt
        $(row).find("td").addClass("border-b-[.5px] border-stroke");

        /// Bütün td-lərə border alt
        $(row).find("td").addClass("border-b-[.5px] border-stroke");

        $(row).find("td:not(:first-child)").css({
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
        });

        $("#myTable thead th:first-child label").css({
          margin: "0 auto",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        });

        // Sol td (checkbox): padding və genişliyi sıfırla, border ver
        $(row).find("td:first-child").css({
          "padding-left": "0",
          "padding-right": "0",
          width: "48px", // checkbox sütunu üçün daha dar genişlik (uyğunlaşdıra bilərsən)
          "text-align": "center",
        });

        // Label içində margin varsa sıfırla
        $(row).find("td:first-child label").css({
          margin: "0",
          display: "inline-flex",
          "justify-content": "center",
          "align-items": "center",
        });
      },

      initComplete: function () {
        $("#myTable thead th").css({
          "padding-left": "20px",
          "padding-top": "10.5px",
          "padding-bottom": "10.5px",
        });

        // Table başlıqlarına stil burada verilməlidir
        $("#myTable thead th:first-child").css({
          "padding-left": "0",
          "padding-right": "0",
          width: "58px",
          "text-align": "center",
          "vertical-align": "middle",
        });

        $("#myTable thead th:first-child label").css({
          margin: "0 auto",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        });

        // Filtrləmə ikonları üçün mövcud kodun saxlanması
        $("#myTable thead th.filtering").each(function () {
          $(this).html(
            '<div class="custom-header flex gap-2.5 items-center"><div>' +
              $(this).text() +
              '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-white"></div></div>'
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

        // Update page count display
        $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
        $pagination.empty();

        // Add spacer row
        $("#myTable tbody tr.spacer-row").remove();
        const colCount = $("#myTable thead th").length;
        const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
        $("#myTable tbody").prepend(spacerRow);

        // Style the last row
        const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
        $lastRow.find("td").css({
          "border-bottom": "0.5px solid #E0E0E0",
        });
        $lastRow.find("td:last-child").css({
          "border-left": "0.5px solid #E0E0E0",
        });

        // Create pagination
        $pagination.append(`
                    <div class="flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ${
                      pageInfo.page === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "text-messages"
                    }"
                        onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                        <div class="icon stratis-chevron-left !h-[12px] !w-[7px]"></div>
                    </div>
                `);

        var paginationButtons = '<div class="flex gap-2">';
        for (var i = 0; i < pageInfo.pages; i++) {
          paginationButtons += `
                        <button class="cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages
                                ${
                                  i === pageInfo.page
                                    ? "bg-[#F6D9FF] text-messages"
                                    : "bg-transparent text-tertiary-text"
                                }"
                                onclick="changePage(${i})">${i + 1}</button>
                    `;
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        $pagination.append(`
                    <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${
                      pageInfo.page === pageInfo.pages - 1
                        ? "opacity-50 cursor-not-allowed"
                        : "text-tertiary-text"
                    }"
                        onclick="changePage(${Math.min(
                          pageInfo.pages - 1,
                          pageInfo.page + 1
                        )})">
                        <div class="icon stratis-chevron-right !h-[12px] !w-[7px]"></div>
                    </div>
                `);
      },
    });
  }
  // Handle main checkbox click
  $("#newCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $('#myTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  // Handle search input
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Page change function
  window.changePage = function (page) {
    table.page(page).draw("page");
  };

  // Handle dropdown menu clicks
  // Handle dropdown menu clicks
  $(document).on("click", ".dropdown-trigger", function (e) {
    e.stopPropagation();
    const rowId = $(this).data("row");

    // Hide all other dropdowns first
    $(".dropdown-menu").addClass("hidden");

    // Show this dropdown
    const $dropdown = $(`#dropdown-${rowId}`);
    $dropdown.removeClass("hidden");

    // Position the dropdown menu correctly
    const $trigger = $(this);

    // Position the dropdown relative to its parent cell
    $dropdown.css({
      top: "30px", // Position it directly below the trigger
      right: "22px", // Align to right edge of the cell
      left: "auto", // Clear any left positioning
    });

    // Make the parent cell position relative to contain the absolute dropdown
    $trigger.parent().css("position", "relative");
  });

  // Close dropdown when clicking elsewhere
  $(document).on("click", function () {
    $(".dropdown-menu").addClass("hidden");
  });

  // Handle "Aç" (Open) button click
  $(document).on("click", ".open-action", function (e) {
    e.stopPropagation();
    const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
    // Add your "open" action here
    console.log(`Open action for row ${rowId}`);
    $(".dropdown-menu").addClass("hidden");
  });

  // Handle "Cihazı sil" (Delete device) button click
  $(document).on("click", ".delete-action", function (e) {
    e.stopPropagation();
    const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
    // Add your "delete" action here
    console.log(`Delete action for row ${rowId}`);
    $(".dropdown-menu").addClass("hidden");
  });

  // Prevent dropdown from closing when clicking inside it
  $(document).on("click", ".dropdown-menu", function (e) {
    e.stopPropagation();
  });
});
