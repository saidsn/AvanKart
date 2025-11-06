$(document).ready(function () {
  let table;

  function initializeTable() {
    table = $("#myTablePop2").DataTable({
      paging: true,
      info: false,
      dom: "t",
      data: [],
      columns: [
        // {
        //   orderable: false,
        //   data: function (row, type, set, meta) {
        //     const idx = meta.row;
        //     return `
        //       <input type="checkbox" id="cb-${idx}" class="peer hidden">
        //       <label for="cb-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
        //           <div class="icon stratis-check-01 scale-60"></div>
        //       </label>
        //     `;
        //   },
        // },
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
                      <span class="text-messages text-[13px] font-medium dark:text-white">${row.fullname
              }</span>
                  </div>
              </div>
            `;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.gender}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.duty}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.email}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.phone}</span>`;
          },
        },
        {
          data: function (row) {
            return `<div class="icon stratis-trash-01 text-error cursor-pointer" 
                 data-permission-id="${window.currentEditUserData?.id}" 
                 data-user-id="${row._id || ''}"></div>`

          },
        },
      ],

      order: [],
      lengthChange: false,
      pageLength: 10,
      language: {
        emptyTable: "Heç bir istifadəçi tapılmadı"
      },
      createdRow: function (row, data, dataIndex) {
        // Hover effect
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          })
          .on("mouseleave", function () {
            $(this).css("background-color", "");
          });

        // Add border to all td elements
        $(row).find("td").addClass("border-b-[.5px] border-stroke");

        $(row).find("td:not(:first-child):not(:last-child)").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $("#myTablePopPop thead th:first-child").css({
          "padding-left": "0",
          "padding-right": "0",
          width: "58px",
          "text-align": "center",
          "vertical-align": "middle",
        });

        $("#myTablePopPop thead th:last-child").css({
          "border-left": "0.5px solid #E0E0E0",
        });

        $("#myTablePopPop thead th:first-child label").css({
          margin: "0 auto",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        });

        // Style first cell (checkbox)
        $(row).find("td:first-child").css({
          "padding-left": "0",
          "padding-right": "0",
          width: "48px",
          "text-align": "center",
        });

        // Center checkbox label
        $(row).find("td:first-child label").css({
          margin: "0",
          display: "inline-flex",
          "justify-content": "center",
          "align-items": "center",
        });

        // Style last cell (three dots)
        $(row)
          .find("td:last-child")
          .addClass("border-l-[.5px] border-stroke")
          .css({
            "padding-right": "0",
            "text-align": "right",
            position: "relative",
          });
      },

      initComplete: function () {
        $("#myTablePopPop thead th").css({
          "padding-left": "20px",
          "padding-top": "10.5px",
          "padding-bottom": "10.5px",
        });

        $("#myTablePopPop thead th:first-child").css({
          "padding-left": "0",
          "padding-right": "0",
          width: "58px",
          "text-align": "center",
          "vertical-align": "middle",
        });

        $("#myTablePopPop thead th:last-child").css({
          "border-left": "0.5px solid #E0E0E0",
        });

        $("#myTablePopPop thead th:first-child label").css({
          margin: "0 auto",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        });

        // Add filtering icons to headers
        $("#myTablePopPop thead th.filtering").each(function () {
          $(this).html(
            '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
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

        $("#myTablePop tbody tr.spacer-row").remove();
        const colCount = $("#myTablePop thead th").length;
        const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
        $("#myTablePop tbody").prepend(spacerRow);

        const $lastRow = $("#myTablePop tbody tr:not(.spacer-row):last");
        $lastRow.find("td").css({
          "border-bottom": "0.5px solid #E0E0E0",
        });
        $lastRow.find("td:last-child").css({
          "border-left": "0.5px solid #E0E0E0",
        });

        $pagination.append(`
          <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0
            ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-[#FFFFFF]"
          }" 
              onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
              <div class="icon stratis-chevron-left"></div>
          </div>
        `);

        var paginationButtons = '<div class="flex gap-2">';
        for (var i = 0; i < pageInfo.pages; i++) {
          paginationButtons += `
              <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
                  ${i === pageInfo.page
              ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
              : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
            }"
                  onclick="changePage(${i})">${i + 1}</button>
          `;
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        $pagination.append(`
          <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight 
              ${pageInfo.page === pageInfo.pages - 1
            ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-[#FFFFFF]"
          }" 
              ${pageInfo.page < pageInfo.pages - 1
            ? `onclick="changePage(${pageInfo.page + 1})"`
            : ""
          }>
              <div class="icon stratis-chevron-right"></div>
          </div>
        `);
      },
    });
  }

  initializeTable();

  // Handle main checkbox click
  $("#newCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $('#myTablePop2 tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  // Handle search input
  $(document).ready(function () {
    const table = $("#myTable").DataTable();

    $("#customSearch").on("keyup", function () {
      const searchValue = $(this).val();

      table.columns([0, 1]).search(searchValue).draw();
    });
  });

  // Page change function
  window.changePage = function (page) {
    table.page(page).draw("page");
  };

  // Handle dropdown menu clicks
  $(document).on("click", ".dropdown-trigger", function (e) {
    e.stopPropagation();
    const rowId = $(this).data("row");

    $(".dropdown-menu").addClass("hidden");

    const $dropdown = $(`#dropdown-${rowId}`);
    $dropdown.removeClass("hidden");

    const $trigger = $(this);

    $dropdown.css({
      top: "30px",
      right: "22px",
      left: "auto",
    });

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
    console.log(`Open action for row ${rowId}`);
    $(".dropdown-menu").addClass("hidden");
  });

  // Handle "Cihazı sil" (Delete device) button click
  $(document).on("click", ".delete-action", function (e) {
    e.stopPropagation();
    const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
    console.log(`Delete action for row ${rowId}`);
    $(".dropdown-menu").addClass("hidden");
  });

  //Delete User - YENİLƏNDİ
  $('#myTablePop2').on('click', '.stratis-trash-01', function () {
    const permissionId = $(this).data('permission-id');
    const userId = $(this).data('user-id');

    console.log(permissionId, userId)
    if (!permissionId || !userId) {
      return alert("Permission ID və ya User ID tapılmadı!");
    }

    $.ajax({
      url: `/muessise-info/permission/${permissionId}/user/${userId}`,
      method: 'DELETE',
      headers: {
        "CSRF-Token": $('meta[name="csrf-token"]').attr('content')
      },
      success: function (res) {
        if (res.success) {
          alertModal('Ugurlu', 'Istifadəçi silindi');
          // Bu sətr əlavə edildi - table yenilənir
          window.refreshPermissionUsersTable();
        } else {
          alertModal('Xəta', 'Istifadəçi silinə bilmədi');
        }
      },
      error: function (err) {
        console.error(err);
        alert("Server xətası baş verdi!");
      }
    });
  });

  // Prevent dropdown from closing when clicking inside it
  $(document).on("click", ".dropdown-menu", function (e) {
    e.stopPropagation();
  });

  // AJAX funksiyası - table-a data yükləyir
  window.loadTableData = function (data) {
    if (table) {
      // Mövcud datanı təmizləyir
      table.clear();

      // Yeni datanı əlavə edir
      table.rows.add(data);

      // Table-i yenidən render edir
      table.draw();

      console.log("Table data yükləndi:", data);
    }
  };

  window.refreshPermissionUsersTable = function () {
    console.log("Table yenilənir...");

    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    const permissionId = window.currentEditUserData?.id;
    const permissionName = window.currentEditUserData.name;
    if (!permissionId) {
      console.error("Permission ID tapılmadı!");
      return Promise.reject("Permission ID tapılmadı!");
    }
    const $headerDiv = $('.defaultPermName');
    $headerDiv.html(`
  <div>
    <div class="text-[15px] font-medium dark:text-white">
      ${permissionName}
    </div>
    <span class="text-[12px] opacity-65 dark:text-white">
      ${permissionName} qrupunda olan istifadəçiləri görə bilərsiniz
    </span>
  </div>
`);
    return $.ajax({
      url: "/rbac/defaultPermUsers",
      type: "POST",
      contentType: "application/json",
      headers: { "CSRF-Token": csrfToken },
      data: JSON.stringify({ permissionId: permissionId }),
      success: function (response) {
        console.log("Table refresh - gələn data:", response);

        if (response && response.success && response.data && Array.isArray(response.data)) {
          window.loadTableData(response.data);
          console.log("Table uğurla yeniləndi");
        } else {
          console.warn("Gələn data düzgün formatda deyil:", response);
          window.loadTableData([]);
        }
      },
      error: function (xhr) {
        console.error("Table refresh xətası:", xhr.responseText);
        throw new Error("Table yenilənə bilmədi");
      }
    });
  };

});

window.openDefaultPermUsers2 = function () {
  console.log("clicked 'İstifadəçiləri redaktə et'");
  $("#TetbiqHesabi").removeClass("hidden");

  window.refreshPermissionUsersTable()
    .then(() => {
      console.log("Modal açıldı və table yeniləndi");
    })
    .catch((error) => {
      console.error("Modal açılarkən xəta:", error);
    });
}

window.closeDefeaultPermPopup = function () {
  console.log("clicked 'closeDefeaultPermPopup'");
  $("#TetbiqHesabi").addClass("hidden");
}