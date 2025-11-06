$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Data for different tabs - HAL-HAZIRDA BOŞ ARRAYS
  var usersData = [];
  var permissionsData = [];
  var rolesData = [];

  var activeData = usersData;
  var currentTable = "users";
  var currentMainTab = "users-content";

  // Initialize tables
  var usersTable, permissionsTable, rolesTable;

  // Users Table
  usersTable = $("#myTable").DataTable({
    responsive: true,
    paging: true,
    info: false,
    dom: "t",
    ajax: {
      url: "/muessise-info/users",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
    },
    columns: [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
    <input type="checkbox" id="user-cb-${idx}" class="peer hidden">
            <label for="user-cb-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                <div class="icon stratis-check-01 scale-60"></div>
            </label>
  `;
        },
      },
      {
        data: function (row) {
          return `
                        <div class="flex items-center gap-3 ">
                          <div class="min-w-12 min-h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold ">
                              ${(row.name + row.surname)
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                          </div>
                          <span class="text-messages text-[13px] font-medium dark:text-[#FFFFFF]">${
                            row.name
                          } ${row.surname}</span>
                      </div>
                    `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.gender}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.duty_name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.email}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">+${String(
            row.phone_suffix || ""
          ).replace(/^\+/, "")}${String(row.phone || "").replace(
            /^0/,
            ""
          )}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.permission_name}</span>`;
        },
      },
      {
        orderable: false,
        data: function (row) {
          const phoneSuffix = row.phone_suffix.toString().startsWith("+")
            ? "+" + row.phone_suffix.toString().slice(1)
            : "+" + row.phone_suffix;
          return `
                        <div class="text-base flex items-center cursor-pointer dots-menu relative" data-table="users" 
                        data-id="${row.id ?? row._id ?? null}" 
                        data-name="${
                          (row.name?.trim() || "") +
                          (row.surname?.trim() ? " " + row.surname.trim() : "")
                        }"
                        data-gender="${row.gender || ""}"
                        data-email="${row.email || ""}"
                        data-role="${row.role || ""}"
                        data-phone="${row.phone || ""}"
                        data-phoneSuffix="${phoneSuffix || ""}"
                        data-permissionName="${row.permission_name || ""}"
                        data-dutyName="${row.duty_name || ""}"

                         
                        >
                        <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-[#FFFFFF]"></div>
                        </div>
                    `;
        },
      },
    ],

    order: [],
    lengthChange: false,
    pageLength: 6,

    createdRow: function (row, data, dataIndex) {
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          const isDark = $("html").hasClass("dark");
          $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6"); // Dark üçün ağ, Light üçün qara şəffaf fon
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      $(row).find("td").addClass("border-b-[.5px] border-stroke");

      $(row).find("td:not(:first-child):not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "10px",
        "padding-bottom": "10px",
      });

      $(row)
        .find("td:first-child")
        .addClass("border-r-[.5px] border-stroke")
        .css({
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
        .addClass("border-l-[.5px] border-stroke")
        .css({
          "padding-right": "0",
          "text-align": "right",
        });
    },

    initComplete: function () {
      applyTableStyling();
    },

    drawCallback: function () {
      handleDrawCallback(this);
    },
  });
  $(document).on("click", ".dots-menu", function () {
    const data = $(this).data();
    const id = data.id || "";
    const name = (data.name || "").trim();
    const surname = (data.surname || "").trim();
    const gender = data.gender || "";
    const email = data.email || "";
    const phone = data.phone || "";
    const phone_suffix = data.phone_suffix || "";
    const duty_name = data.duty_name || "";
    const permission_name = data.permission_name || "";

    $("#editUserId").val(id);
    $("input[name='fullName']").val(name + " " + surname);
    $("input[name='email']").val(email);
    $("input[name='phoneNumber']").val(phone);

    $("input[name='gender'][value='" + gender + "']").prop("checked", true);

    $("#realSelect5").val(duty_name);
    $("#selectedValue4").text($("#realSelect5 option:selected").text());

    $("#selectedValue6").text($("#realSelect6 option:selected").text());
    $("#selectedValue9").val(phone_suffix);
    $("#selectedValue7").val(duty_name);
    $("#selectedValue8").val(permission_name);
  });

  // Permissions Table
  permissionsTable = $("#permissionsTable").DataTable({
    responsive: true,
    paging: false,
    info: false,
    dom: "t",
    ajax: {
      url: "/muessise-info/show-permissions",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
    },
    columns: [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
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
          return `<span class="text-[13px] text-messages font-medium dark:text-[#FFFFFF]">${row.groupName}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.permissions}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF] w-full block text-center">${row.memberCount}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.createdDate}</span>`;
        },
      },
      {
        orderable: false,
        data: function (row) {
          return `
      <div class="text-base flex items-center cursor-pointer dots-menu relative" 
           data-table="permissions" 
           data-id="${row.id ?? row._id ?? null}"
           data-default="${row.default || false}"
           data-name="${row.groupName || ""}">
          <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-[#FFFFFF]"></div>
      </div>
    `;
        },
      },
    ],

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
      applyRowStyling(row);
      $(row).find("td").eq(3).css("text-align", "center");
    },

    initComplete: function () {
      applyTableStyling("#permissionsTable");
    },
  });
  // Roles Table
  rolesTable = $("#rolesTable").DataTable({
    responsive: true,
    paging: false,
    info: false,
    dom: "t",
    ajax: {
      url: "/rbac/show-duties",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
    },
    columns: [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
        <input type="checkbox" id="role-cb-${idx}" class="peer hidden">
            <label for="role-cb-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                <div class="icon stratis-check-01 scale-60"></div>
            </label>
      `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-medium dark:text-[#FFFFFF]">${row.roleName}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF] w-full block text-center">${row.membersInRole}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.createdBy}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-[#FFFFFF]">${row.createdDate}</span>`;
        },
      },
      {
        orderable: false,
        data: function (row) {
          return `
        <div class="text-base flex items-center cursor-pointer dots-menu relative" data-table="roles" data-id="${
          row.id ?? row._id ?? null
        }"  data-name="${row.roleName ?? null}">
            <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-[#FFFFFF]"></div>
        </div>
      `;
        },
      },
    ],

    createdRow: function (row, data, dataIndex) {
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          const isDark = $("html").hasClass("dark");
          $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6"); // Dark üçün ağ, Light üçün qara şəffaf fon
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      applyRowStyling(row);
      $(row).find("td").eq(2).css("text-align", "center");
    },

    initComplete: function () {
      applyTableStyling("#rolesTable");
    },
  });

  function applyTableStyling(tableId = "#myTable") {
    $(`${tableId} thead th`).css({
      "padding-left": "20px",
      "padding-top": "10.5px",
      "padding-bottom": "10.5px",
    });

    $(`${tableId} thead th:first-child`).css({
      "padding-left": "8px",
      "padding-right": "8px",
      width: "58px",
      "text-align": "center",
      "vertical-align": "middle",
      "border-right": "0.5px solid #E0E0E0",
    });

    $(`${tableId} thead th:last-child`).css({
      "border-left": "0.5px solid #E0E0E0",
    });

    $(`${tableId} thead th:first-child label`).css({
      margin: "0 auto",
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
    });

    $(`${tableId} thead th.filtering`).each(function () {
      $(this).html(
        '<div class="custom-header flex gap-2.5 items-center"><div>' +
          $(this).text() +
          '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-[#FFFFFF]"></div></div>'
      );
    });
  }

  function applyRowStyling(row) {
    $(row)
      .css("transition", "background-color 0.2s ease")
      .on("mouseenter", function () {
        const isDark = $("html").hasClass("dark");
        $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6"); // Same as users table
      })
      .on("mouseleave", function () {
        $(this).css("background-color", "");
      });

    $(row).find("td").addClass("border-b-[.5px] border-stroke");

    $(row).find("td:not(:first-child):not(:last-child)").css({
      "padding-left": "20px",
      "padding-top": "10px",
      "padding-bottom": "10px",
    });

    $(row)
      .find("td:first-child")
      .addClass("border-r-[.5px] border-stroke")
      .css({
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

    $(row).find("td:last-child").addClass("border-l-[.5px] border-stroke").css({
      "padding-right": "0",
      "text-align": "right",
    });
  }

  function handleDrawCallback(tableApi) {
    var api = tableApi.api();
    var pageInfo = api.page.info();

    if (currentTable === "users") {
      var $pageCount = $("#pageCount");
      var $customPagination = $("#customPagination");
      var $pageInput = $("#users-content").find(".page-input");

      if (pageInfo.pages === 0) {
        $pageCount.text("0 / 0");
        $customPagination.empty();
        $pageInput.val("");
        return;
      }

      $pageCount.text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $customPagination.empty();

      $customPagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                  pageInfo.page === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "text-messages"
                }"
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left dark:text-[#636B6F]"></div>
                </div>
            `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
                    <button class="cursor-pointer dark:bg-[#5B396D4D] dark:text-[#FFFFFF] w-10 h-10 rounded-[8px] hover:text-messages
                            ${
                              i === pageInfo.page
                                ? "bg-[#F6D9FF] text-messages"
                                : "bg-transparent text-tertiary-text"
                            }"
                            onclick="changePage(${i})">${i + 1}</button>
                `;
      }
      paginationButtons += "</div>";
      $customPagination.append(paginationButtons);

      // Next Button
      $customPagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                  pageInfo.page === pageInfo.pages - 1
                    ? "opacity-50 cursor-not-allowed"
                    : "text-tertiary-text"
                }"
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right dark:text-[#636B6F]"></div>
                </div>
            `);
    }
  }

  $(".main-tab-button").on("click", function (e) {
    e.preventDefault();
    const targetContentId = $(this).data("content");

    // Remove active classes from all main tabs and set inactive dark mode color
    $(".main-tab-button")
      .removeClass(
        "text-messages border-b-2 border-messages active-main-tab dark:text-[#FFFFFF] dark:border-b-[#FFFFFF]"
      )
      .addClass(
        "text-tertiary-text dark:text-[#FFFFFF80] hover:text-messages dark:hover:text-[#FFFFFF]"
      );

    // Add active classes to clicked tab and set active dark mode color
    $(this)
      .removeClass(
        "text-tertiary-text dark:text-[#FFFFFF80] hover:text-messages dark:hover:text-[#FFFFFF]"
      )
      .addClass(
        "text-messages border-b-2 border-messages active-main-tab dark:text-[#FFFFFF] dark:border-b-[#FFFFFF]"
      );

    $(".main-content-block").hide();

    $(`#${targetContentId}`).show();
    currentMainTab = targetContentId;

    if (currentMainTab === "users-content") {
      $(".users-controls-and-tables").show();
      $(".pagination-container").show();
      if (currentTable === "users") {
        usersTable.draw();
      } else if (currentTable === "permissions") {
        permissionsTable.draw();
      } else if (currentTable === "roles") {
        rolesTable.draw();
      }
    } else {
      $(".users-controls-and-tables").hide();
      $(".pagination-container").hide();
    }

    if (currentMainTab === "users-content") {
      switchTab(currentTable, $(`#tab-${currentTable}`));
    }
  });

  $("#tab-users").on("click", function () {
    currentTable = "users";
    switchTab("users", $(this));
    $(".pagination-container").show();
  });

  $("#tab-permissions").on("click", function () {
    currentTable = "permissions";
    switchTab("permissions", $(this));
    $(".pagination-container").hide();
  });

  $("#tab-roles").on("click", function () {
    currentTable = "roles";
    switchTab("roles", $(this));
    $(".pagination-container").hide();
  });

  // === Açma/Bağlama funksiyaları ===
  function openHesabElaveEt() {
    $("#overlay").removeClass("hidden");
    $("#HesabElaveEtPopUp").removeClass("hidden");
  }

  function closeHesabElaveEt() {
    $("#overlay").addClass("hidden");
    $("#HesabElaveEtPopUp").addClass("hidden");
  }

  function openHesabEditEt() {
    $("#overlay").removeClass("hidden");
    $("#HesabEditEtPopUp").removeClass("hidden");
  }

  function closeHesabEditEt() {
    $("#overlay").addClass("hidden");
    $("#HesabEditEtPopUp").addClass("hidden");
  }

  function openYeniQrupPopup() {
    $("#overlay").removeClass("hidden");
    $("#YeniQrupPop").removeClass("hidden");
  }

  function closeYeniQrupPopup() {
    $("#overlay").addClass("hidden");
    $("#YeniQrupPop").addClass("hidden");
  }

  // Yeni Vəzifə aç/bağla
  function openYeniVezifePopup() {
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("YeniVezifePop").classList.remove("hidden");
  }

  function closeYeniVezifePopup() {
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("YeniVezifePop").classList.add("hidden");
  }

  // === Tab dəyişən zaman düymənin text və onclick funksiyasını dəyiş ===
  function switchTab(tabName, clickedButton) {
    if (currentMainTab !== "users-content") return;

    $(".notification-type")
      .removeClass(
        "bg-inverse-on-surface text-messages active dark:bg-[#2E3135] dark:text-[#FFFFFF]"
      )
      .addClass("text-tertiary-text dark:text-[#FFFFFF80]");

    clickedButton
      .removeClass("text-tertiary-text dark:text-[#FFFFFF80]")
      .addClass(
        "bg-inverse-on-surface text-messages active dark:bg-[#2E3135] dark:text-[#FFFFFF]"
      );

    $(".table-container").hide();
    $(`#${tabName}-table`).show();

    const buttonTexts = {
      users: "Hesab əlavə et",
      permissions: "Yeni qrup",
      roles: "Yeni vəzifə",
    };

    const buttonHandlers = {
      users: openHesabElaveEt,
      permissions: openYeniQrupPopup,
      roles: openYeniVezifePopup,
    };

    $(".add-button-text").text(buttonTexts[tabName]);

    const button = $("#add-button");
    button.off("click");
    button.on("click", buttonHandlers[tabName]);
  }

  // === Overlay kliklə bağlama ===
  $("#overlay").on("click", function () {
    closeHesabElaveEt();
    closeYeniQrupPopup();
    cancelDeletePermission();
    cancelOtpPermissionDelete();
    // Əgər başqa popup-lar varsa, burada da əlavə et
  });

  let currentPopup = null;

  $(document).on("click", ".dots-menu", function (e) {
    e.stopPropagation();

    const tableType = $(this).data("table");
    const tableId = $(this).data("id");
    const tableName = $(this).data("name");
    const isDefault = $(this).data("default");

    let popup;
    if (tableType === "permissions") {
      if (isDefault === true) {
        popup = $("#permissions-popup");
      } else {
        popup = $("#permissions-not-default-popup");
      }
    } else {
      popup = $(`#${tableType}-popup`);
    }

    const dotMenuElement = $(this);

    // Permission ID və name-ni global saxla
    if (tableType === "permissions") {
      window.currentPermissionId = tableId;
      window.currentPermissionName = tableName;
    }

    // Roles üçün ID və name saxla
    if (tableType === "roles") {
      window.currentRoleId = tableId;
      window.currentRoleName = tableName;
    }

    // Əgər permissions table-ındayıqsa və default=true-dursa
    if (tableType === "permissions" && isDefault === true) {
      updatePermissionsPopupForDefault(popup, tableId, tableName);
    } else if (tableType === "permissions") {
      // Normal permission üçün adi popup göstər
      updatePermissionsPopupForNormal(popup, tableId, tableName);
    } else {
      // Digər table-lar üçün (users, roles) köhnə məntiq
      $(`#vezife-adi-popup-name`).val(tableName);
      $(`#vezife-adi-popup-id`).val(tableId);
    }

    if (currentPopup && currentPopup.get(0) !== popup.get(0)) {
      currentPopup.hide();
      $(`#main-content-area`).append(currentPopup);
    }

    if (popup.is(":visible")) {
      popup.hide();
      currentPopup = null;
      $(`#main-content-area`).append(popup);
      return;
    }

    $(".popup-menu").hide();
    dotMenuElement.append(popup);

    popup.css({
      position: "absolute",
      top: "100%",
      right: "0",
      "z-index": 50,
      display: "block",
    });

    currentPopup = popup;
  });

  $(document).on("click", function (e) {
    if (
      currentPopup &&
      !$(e.target).closest(".popup-menu, .dots-menu").length
    ) {
      currentPopup.hide();

      $(`#main-content-area`).append(currentPopup);
      currentPopup = null;
    }
  });

  $("#newCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $(
      `#${currentTable}Table tbody input[type="checkbox"], #myTable tbody input[type="checkbox"]`
    ).each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  $("#permissionsCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $('#permissionsTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  $("#rolesCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $('#rolesTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  $("#customSearch").on("keyup", function () {
    const searchValue = this.value;

    if (currentTable === "users") {
      usersTable.search(searchValue).draw();
    } else if (currentTable === "permissions") {
      permissionsTable.search(searchValue).draw();
    } else if (currentTable === "roles") {
      rolesTable.search(searchValue).draw();
    }
  });

  window.changePage = function (page) {
    if (currentTable === "users") {
      usersTable.page(page).draw("page");
    }
  };

  $(document).on("click", "#users-content .go-button", function (e) {
    e.preventDefault();
    const pageInput = $(this).siblings(".page-input");
    const pageNum = parseInt(pageInput.val());
    const pageInfo = usersTable.page.info();

    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= pageInfo.pages) {
      usersTable.page(pageNum - 1).draw("page");
    } else {
    }
    pageInput.val("");
  });

  $("#main-tab-users").click();
  function updatePermissionsPopupForDefault(
    popup,
    permissionId,
    permissionName
  ) {
    // "İstifadəçiləri redaktə et" click handler-ı
    popup
      .find('[data-action="edit-users"]')
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        if (typeof window.openEditUsersPopup === "function") {
          window.openEditUsersPopup(permissionId, permissionName);
        }
        popup.hide();
        currentPopup = null;
      });
  }

  // Normal permission üçün popup update
  function updatePermissionsPopupForNormal(
    popup,
    permissionId,
    permissionName
  ) {
    // "Qrup adını dəyiş" click handler-ı
    popup
      .find('[data-action="edit-group-name"]')
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        // Bu hissə implement ediləcək - ad dəyişmə popup-ı açılacaq
        openEditPermissionNamePopup(permissionId, permissionName);
        popup.hide();
        currentPopup = null;
      });

    // "İcazələri redaktə et" click handler-ı
    popup
      .find('[data-action="edit-permissions"]')
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        openEditPermissionFullPopup(permissionId, permissionName);
        popup.hide();
        currentPopup = null;
      });

    // "Qrupu sil" click handler-ı - onclick="deleteCurrentPermission()" istifadə edir
    // popup.find('[onclick*="deleteCurrentPermission"]') və ya direct function
  }

  function openEditPermissionDefaultPopup(permissionId, permissionName) {
    $("#overlay").removeClass("hidden");
    $("#EditPermissionDefaultPopup").removeClass("hidden");
    $("#edit-permission-default-name").val(permissionName);
    $("#edit-permission-default-id").val(permissionId);
  }

  // Permission adı dəyişdirmə popup açma (default false permission-lar üçün)
  function openEditPermissionNamePopup(permissionId, permissionName) {
    // Eyni popup-ı açır (sadə ad dəyişdirmə)
    $("#overlay").removeClass("hidden");
    $("#EditPermissionDefaultPopup").removeClass("hidden");
    $("#edit-permission-default-name").val(permissionName);
    $("#edit-permission-default-id").val(permissionId);
  }

  // Normal permission edit popup açma (tam edit - ad + permissions)
  function openEditPermissionFullPopup(permissionId, permissionName) {
    $("#overlay").removeClass("hidden");
    $("#EditPermissionFullPopup").removeClass("hidden");
    $("#edit-permission-full-name").val(permissionName);
    $("#edit-permission-full-id").val(permissionId);

    // Permission details yüklə
    loadPermissionDetails(permissionId);
  }

  // Permission details yükləmə funksiyası
  function loadPermissionDetails(permissionId) {
    $.ajax({
      url: "/muessise-info/get-permission-details",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: { permissionId: permissionId },
      success: function (response) {
        if (response.success) {
          // Permission checkboxlarını doldur
          populatePermissionCheckboxes(response.data);
        }
      },
      error: function (xhr, status, error) {
        console.error("Permission details yüklənərkən xəta:", error);
      },
    });
  }

  // Permission checkboxlarını doldurmaq
  function populatePermissionCheckboxes(permissionData) {
    if (!permissionData) return;
    const map = {
      dashboard: "#edit-dashboard-checkbox",
      emeliyyatlar: "#edit-emeliyyatlar-checkbox",
      hesablasma: "#edit-hesablasma-checkbox",
      iscilerin_balansi: "#edit-iscilerin-balansi-checkbox",
      e_qaime: "#edit-e-qaime-checkbox",
      isciler: "#edit-isciler-checkbox",
      avankart_partner: "#edit-avankart-checkbox",
      sirket_melumatlari: "#edit-sirket-melumatlari-checkbox",
      profil: "#edit-profil-checkbox",
      istifadeciler: "#edit-istifadeciler-checkbox",
      salahiyyet_qruplari: "#edit-salahiyyet-qruplari-checkbox",
      rekvizitler: "#edit-rekvizitler-checkbox",
      muqavileler: "#edit-muqavileler-checkbox",
    };
    Object.entries(map).forEach(([key, selector]) => {
      const $el = $(selector);
      if (!$el.length) return;
      const val = permissionData[key];
      $el.prop("checked", val === "full");
      $el.data("perm-value", val);
    });
    if (permissionData.name)
      $("#edit-permission-full-name").val(permissionData.name);
    if (permissionData.default) {
      $('#EditPermissionFullPopup input[type="checkbox"]')
        .prop("disabled", true)
        .addClass("opacity-50 cursor-not-allowed");
    } else {
      $('#EditPermissionFullPopup input[type="checkbox"]')
        .prop("disabled", false)
        .removeClass("opacity-50 cursor-not-allowed");
    }
  }

  // Close funksiyaları
  function closeEditPermissionDefaultPopup() {
    $("#overlay").addClass("hidden");
    $("#EditPermissionDefaultPopup").addClass("hidden");
  }

  function closeEditPermissionFullPopup() {
    $("#overlay").addClass("hidden");
    $("#EditPermissionFullPopup").addClass("hidden");
  }

  window.closeEditPermissionDefaultPopup = closeEditPermissionDefaultPopup;
  window.closeEditPermissionFullPopup = closeEditPermissionFullPopup;

  window.submitForm = function (type) {
    if (type === "editPermissionDefault") {
      const id = $("#edit-permission-default-id").val();
      const name = ($("#edit-permission-default-name").val() || "").trim();
      if (!name) {
        alert("Ad boş ola bilməz");
        return;
      }
      $.ajax({
        url: $("#editPermissionDefaultForm").data("url"),
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        data: { id, name },
        success: (r) => {
          if (r.success) {
            closeEditPermissionDefaultPopup();
            if (window.permissionsTable) {
              try {
                permissionsTable.ajax.reload(null, false);
              } catch (e) {
                location.reload();
              }
            } else location.reload();
          } else alert(r.message || "Xəta");
        },
        error: (xhr) => alert(xhr.responseJSON?.message || "Server xətası"),
      });
    }
    if (type === "editPermissionFull") {
      const id = $("#edit-permission-full-id").val();
      const name = ($("#edit-permission-full-name").val() || "").trim();
      if (!name) {
        alert("Ad boş ola bilməz");
        return;
      }
      const cb = (sel) => ($(sel).is(":checked") ? "full" : "none");
      const permissions = {
        dashboard: cb("#edit-dashboard-checkbox"),
        emeliyyatlar: cb("#edit-emeliyyatlar-checkbox"),
        hesablasma: cb("#edit-hesablasma-checkbox"),
        iscilerin_balansi: cb("#edit-iscilerin-balansi-checkbox"),
        e_qaime: cb("#edit-e-qaime-checkbox"),
        isciler: cb("#edit-isciler-checkbox"),
        avankart_partner: cb("#edit-avankart-checkbox"),
        sirket_melumatlari: cb("#edit-sirket-melumatlari-checkbox"),
        profil: cb("#edit-profil-checkbox"),
        istifadeciler: cb("#edit-istifadeciler-checkbox"),
        salahiyyet_qruplari: cb("#edit-salahiyyet-qruplari-checkbox"),
        rekvizitler: cb("#edit-rekvizitler-checkbox"),
        muqavileler: cb("#edit-muqavileler-checkbox"),
      };
      $.ajax({
        url: $("#editPermissionFullForm").data("url"),
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify({ id, name, permissions }),
        success: (r) => {
          if (r.success) {
            closeEditPermissionFullPopup();
            if (window.permissionsTable) {
              try {
                permissionsTable.ajax.reload(null, false);
              } catch (e) {
                location.reload();
              }
            } else location.reload();
          } else alert(r.message || "Xəta");
        },
        error: (xhr) => alert(xhr.responseJSON?.message || "Server xətası"),
      });
    }
  };

  // ===== ROLES DELETE FUNCTIONALITY =====

  // Global variables for role deletion
  window.currentDeleteType = null;
  window.currentDeleteId = null;

  // Role silmə funksiyası
  window.deleteRole = function () {
    if (!window.currentRoleId) {
      console.error("Role ID tapılmadı!");
      return;
    }

    // Global variables set et
    window.currentDeleteType = "role";
    window.currentDeleteId = window.currentRoleId;

    // Popup mətnini roles üçün uyğunlaşdır
    $("#deletePopUp .text-[13px].font-normal.opacity-65").text(
      "Vəzifəni silmək istədiyinizə əminsiniz?"
    );

    // Delete popup-unu göstər
    $("#deletePopUp").removeClass("hidden");
    $("#overlay").removeClass("hidden");

    // Dots menu-nu bağla
    $(".popup-menu").hide();
    if (currentPopup) {
      currentPopup.hide();
      currentPopup = null;
    }
  };

  // Confirm delete button click handler
  $(document).on("click", "#confirmDeleteBtn", function () {
    if (window.currentDeleteType === "role" && window.currentDeleteId) {
      performRoleDelete(window.currentDeleteId);
    } else {
      // Digər delete növləri üçün (users, etc.)
    }
  });

  // Cancel delete function
  window.cancelDelete = function () {
    $("#deletePopUp").addClass("hidden");
    $("#overlay").addClass("hidden");

    // Global variables-ları təmizlə
    window.currentDeleteType = null;
    window.currentDeleteId = null;
  };

  // Role silmə API çağırışı
  function performRoleDelete(roleId) {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    $.ajax({
      url: "/rbac/rbacDeletes/delete",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: {
        id: roleId,
      },
      success: function (response) {
        if (response.success && response.otpRequired) {
          // Delete popup-unu bağla
          $("#deletePopUp").addClass("hidden");
          $("#overlay").addClass("hidden");

          // OTP popup-unu göstər
          if (
            typeof Otp === "function" &&
            response.email &&
            response.tempDeleteId
          ) {
            Otp(response.email, response.tempDeleteId, {
              url: "/rbac/rbacAccept/delete",
              title: "Vəzifə Silmə",
              formType: "deleteDuty",
              submitText: "Təsdiqlə",
              cancelText: "Ləğv et",
            });
          } else {
            console.error(
              "Otp funksiyası tapılmadı, email və ya tempDeleteId məlumatı yoxdur"
            );
            alert("OTP popup açıla bilmədi");
          }
        } else if (response.success) {
          alert("Vəzifə uğurla silindi");
          // Səhifəni yenilə və ya tabeli yenilə
          location.reload();
        } else {
          // Xəta mesajını göstər
          alert(response.message || "Xəta baş verdi");
        }
      },
      error: function (xhr, status, error) {
        console.error("Role silmə xətası:", error);
        const errorMessage =
          xhr.responseJSON?.message || "Server xətası baş verdi";
        alert(errorMessage);
      },
      complete: function () {
        // Global variables-ları təmizlə
        window.currentDeleteType = null;
        window.currentDeleteId = null;
      },
    });
  }

  window.currentDeleteType = null;
  window.currentDeleteId = null;
  window.currentDeleteEmail = null;

  window.deleteUser = function () {
    const selectedRow = $("#myTable")
      .find("tr.selected, tr:has(td .dots-menu)")
      .first();
    const userId = selectedRow.find(".dots-menu").data("id");
    const userEmail = selectedRow.find(".dots-menu").data("email");

    if (!userId) {
      alert("İstifadəçi seçilməyib");
      return;
    }

    window.currentDeleteType = "user";
    window.currentDeleteId = userId;
    window.currentDeleteEmail = userEmail;

    $("#deletePopUp .text-[13px].font-normal.opacity-65").text(
      "İstifadəçini silmək istədiyinizə əminsiniz?"
    );
    $("#deletePopUp").removeClass("hidden");
    $("#overlay").removeClass("hidden");
  };

  $(document).on("click", "#confirmDeleteBtn", function () {
    if (window.currentDeleteType === "user" && window.currentDeleteId) {
      performUserDelete(window.currentDeleteId, window.currentDeleteEmail);
    }
  });

  function performUserDelete(userId, userEmail) {
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

        if (response.success && response.otpRequired) {
          if (
            typeof Otp === "function" &&
            response.email &&
            response.tempDeleteId
          ) {
            Otp(response.email, response.tempDeleteId, {
              url: "/rbac/rbacAccept/deleteUser",
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
              url: "/rbac/rbacAccept/deleteUser",
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
      error: function (xhr) {
        alert(xhr.responseJSON?.message || "Server xətası baş verdi");
      },
      complete: function () {
        window.currentDeleteType = null;
        window.currentDeleteId = null;
        window.currentDeleteEmail = null;
      },
    });
  }

  window.cancelDelete = function () {
    $("#deletePopUp").addClass("hidden");
    $("#overlay").addClass("hidden");
    window.currentDeleteType = null;
    window.currentDeleteId = null;
    window.currentDeleteEmail = null;
  };

  window.collectSelectedUsersForPermission = function (
    tableId = "myTablePop",
    divId = "userHiddenInputsForPermission"
  ) {
    const $table = $("#" + tableId);
    const $container = $("#" + divId);

    if ($table.length === 0) {
      return false;
    }
    if ($container.length === 0) {
      return false;
    }

    let dt;
    try {
      dt = $table.DataTable();
    } catch (e) {
      console.error("DataTable instance tapılmadı:", e);
      return false;
    }

    const existingIds = new Set();
    $container.find('input[type="hidden"][name="users[]"]').each(function () {
      const v = (($(this).val() || "") + "").trim();
      if (!v) $(this).remove();
      else existingIds.add(v);
    });

    let $list = $container.find("#permAddedUser");
    if ($list.length === 0) {
      $list = $(
        '<div id="permAddedUser" class="flex flex-col gap-2 mt-3"></div>'
      );
      $container.append($list);
    }

    $(dt.rows({ page: "all" }).nodes()).each(function () {
      const $tr = $(this);
      const $cb = $tr.find('input[type="checkbox"]');
      if (!$cb.is(":checked")) return;

      const rowData = dt.row($tr).data() || {};
      const _id = (
        rowData._id ||
        rowData.id ||
        $tr.find(".dots-menu").data("id") ||
        ""
      )
        .toString()
        .trim();
      if (!_id) return;

      if (existingIds.has(_id)) return;

      $container.append(`<input type="hidden" name="users[]" value="${_id}">`);
      existingIds.add(_id);

      const name = (rowData.name || "").toString().trim();
      const surname = (rowData.surname || "").toString().trim();
      const fullName =
        (name + (surname ? " " + surname : "")).trim() ||
        (($tr.find(".dots-menu").data("name") || "") + "").trim() ||
        "—";

      const $item = $(`
        <div class="flex items-center justify-between" data-user-id="${_id}">
          <div class="text-[13px] text-messages dark:text-white">${fullName}</div>
          <div class="hover:bg-error/10 py-1.5 px-3 rounded-[4px] transition" onclick="silPermSelectedUser('${_id}')">
            <div class="icon stratis-trash-01 text-error cursor-pointer"></div>
          </div>
        </div>
      `);
      $list.append($item);
    });

    const seen = new Set();
    $list.children("[data-user-id]").each(function () {
      const id = (($(this).data("userId") || "") + "").trim();
      if (!id) return $(this).remove();
      if (seen.has(id)) $(this).remove();
      else seen.add(id);
    });

    return true;
  };

  window.silPermSelectedUser = function (
    id,
    divId = "userHiddenInputsForPermission"
  ) {
    const $container = $("#" + divId);
    if ($container.length === 0) return;

    $container
      .find(`input[type="hidden"][name="users[]"][value="${id}"]`)
      .remove();
    $container.find(`#permAddedUser [data-user-id="${id}"]`).remove();
  };
  window.clickIstifadeciElaveEt = function () {
    collectSelectedUsersForPermission();
  };

  // ===== PERMISSION DELETE FUNCTIONALITY =====

  // Global dəyişənlər permission silmə üçün
  window.currentDeletePermissionId = null;

  // Permission silmə funksiyası - popup açır
  function deletePermission(permissionId) {
    // Global dəyişəndə permission ID-ni saxla
    window.currentDeletePermissionId = permissionId;

    // Overlay və popup göstər
    $("#overlay").removeClass("hidden").show();
    $("#deletePermissionPopUp").removeClass("hidden").show();
  }

  // Permission silmə popup-ını bağlama
  window.cancelDeletePermission = function () {
    $("#overlay").addClass("hidden");
    $("#deletePermissionPopUp").addClass("hidden");
    window.currentDeletePermissionId = null;
  };

  // Permission silməni təsdiqləmə
  window.confirmDeletePermission = function () {
    const permissionId = window.currentDeletePermissionId;

    if (!permissionId) {
      console.error("Permission ID tapılmadı");
      return;
    }

    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    if (!csrfToken) {
      alert("CSRF token tapılmadı");
      return;
    }

    $.ajax({
      url: "/muessise-info/delete-permission",
      type: "POST",
      headers: { "CSRF-Token": csrfToken },
      data: { permissionId },
      success: function (response) {
        if (response?.success) {
          cancelDeletePermission();
          if (window.permissionsTable) {
            try {
              permissionsTable.ajax.reload(null, false);
            } catch (e) {
              location.reload();
            }
          } else {
            location.reload();
          }
        } else {
          // Təsdiq popup-ını bağlamazdan əvvəl ID-ni saxla
          const failedId = permissionId;
          cancelDeletePermission();
          showPermissionDeleteError(
            response?.message || "Silinmə alınmadı",
            failedId
          );
        }
      },
      error: function (xhr) {
        const msg = xhr.responseJSON?.message || "Server xətası";
        const failedId = permissionId;
        cancelDeletePermission();
        showPermissionDeleteError(msg, failedId);
      },
    });
  };

  // Global olaraq deletePermission funksiyasını təyin et
  window.deletePermission = deletePermission;

  // 400 cavabı üçün xüsusi popup göstərən helper
  function showPermissionDeleteError(message, permissionId) {
    // İstifadəçi sayı mesajdan çıxarılır (regex ilə ilk rəqəm)
    const match = message.match(/\b(\d+)\b/);
    const userCount = match ? parseInt(match[1], 10) : 0;
    // Əgər artıq xüsusi container varsa yenilə
    let $popup = $("#permissionDeleteErrorPopup");
    if (!$popup.length) {
      $popup = $(
        '<div id="permissionDeleteErrorPopup" class="fixed inset-0 z-[120] flex items-center justify-center"></div>'
      ).addClass("hidden");
      const inner = `
        <div class="absolute inset-0" data-close-err style="background:rgba(0,0,0,0.85);backdrop-filter:blur(2px);"></div>
        <div class="relative border border-white/10 rounded-xl w-[440px] max-w-[95%] p-6 flex flex-col gap-4 text-sm shadow-2xl" style="background:#0F0F11;">
          <h3 class="text-base font-semibold text-white">Qrup silinə bilmədi</h3>
          <p class="text-white text-[13px] leading-relaxed" id="permDelErrMsg"></p>
          <div class="flex flex-col gap-2">
            <button id="openUsersWithPermissionBtn" class="h-10 rounded-md bg-violet-600 hover:bg-violet-500 transition text-white text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 focus:ring-offset-[#0F0F11]"></button>
            <button class="h-10 rounded-md bg-zinc-700 hover:bg-zinc-600 transition text-white text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-[#0F0F11]" data-close-err>Bağla</button>
          </div>
        </div>`;
      $popup.html(inner);
      $(document.body).append($popup);
      $popup.on("click", "[data-close-err]", () => $popup.addClass("hidden"));
      $popup.on("click", "#openUsersWithPermissionBtn", function () {
        const id = $("#permissionDeleteErrorPopup").data("permissionId");
        if (id) {
          window.location.href =
            "/people/avankart-people?permission=" + encodeURIComponent(id);
        } else {
          $("#permissionDeleteErrorPopup").addClass("hidden");
        }
      });
    }
    $("#permDelErrMsg").text(message);
    const btnText =
      userCount > 0 ? `İstifadəçiləri aç (${userCount})` : "Bağla";
    $("#openUsersWithPermissionBtn")
      .toggleClass("hidden", userCount === 0)
      .text(btnText);
    if (permissionId)
      $("#permissionDeleteErrorPopup").data("permissionId", permissionId);
    $popup.removeClass("hidden");
  }

  // deleteCurrentPermission funksiyası - popup-dan çağırılır
  window.deleteCurrentPermission = function () {
    const permissionId = window.currentPermissionId;

    if (!permissionId) {
      console.error("Current Permission ID tapılmadı");
      alert("Silinəcək permission seçilməyib");
      return;
    }

    deletePermission(permissionId);
  };

  window.collectSelectedUsersForPermissionEdit = function (
    tableId = "myTablePopEdit",
    divId = "userHiddenInputsForPermissionEdit"
  ) {
    const $table = $("#" + tableId);
    const $container = $("#" + divId);

    if ($table.length === 0) {
      console.error("Table tapılmadı:", tableId);
      return;
    }
    if ($container.length === 0) {
      console.error("Hədəf div tapılmadı:", divId);
      return;
    }

    let dt;
    try {
      dt = $table.DataTable();
    } catch (e) {
      console.error("DataTable instance tapılmadı:", e);
      return;
    }

    const existingIds = new Set();
    $container.find('input[type="hidden"][name="users[]"]').each(function () {
      const v = (($(this).val() || "") + "").trim();
      if (!v) $(this).remove();
      else existingIds.add(v);
    });

    let $list = $container.find("#permAddedUserEdit");
    if ($list.length === 0) {
      $list = $(
        '<div id="permAddedUserEdit" class="flex flex-col gap-2 mt-3"></div>'
      );
      $container.append($list);
    }

    $(dt.rows({ page: "all" }).nodes()).each(function () {
      const $tr = $(this);
      const $cb = $tr.find('input[type="checkbox"]');
      if (!$cb.is(":checked")) return;

      const rowData = dt.row($tr).data() || {};
      const _id = (
        rowData._id ||
        rowData.id ||
        $tr.find(".dots-menu").data("id") ||
        ""
      )
        .toString()
        .trim();
      if (!_id) return;
      if (existingIds.has(_id)) return;

      $container.append(`<input type="hidden" name="users[]" value="${_id}">`);
      existingIds.add(_id);

      const name = (rowData.name || "").toString().trim();
      const surname = (rowData.surname || "").toString().trim();
      const fullName =
        (name + (surname ? " " + surname : "")).trim() ||
        (($tr.find(".dots-menu").data("name") || "") + "").trim() ||
        "—";

      const $item = $(`
      <div class="flex items-center justify-between" data-user-id="${_id}">
        <div class="text-[13px] text-messages dark:text-white">${fullName}</div>
        <div class="hover:bg-error/10 py-1.5 px-3 rounded-[4px] transition" onclick="silPermSelectedUserEdit('${_id}')">
          <div class="icon stratis-trash-01 text-error cursor-pointer"></div>
        </div>
      </div>
    `);
      $list.append($item);
    });

    // delete repeated items
    const seen = new Set();
    $list.children("[data-user-id]").each(function () {
      const id = (($(this).data("userId") || "") + "").trim();
      if (!id) return $(this).remove();
      if (seen.has(id)) $(this).remove();
      else seen.add(id);
    });
  };

  window.silPermSelectedUserEdit = function (
    id,
    divId = "userHiddenInputsForPermissionEdit"
  ) {
    const $container = $("#" + divId);
    if ($container.length === 0) return;
    $container
      .find(`input[type="hidden"][name="users[]"][value="${id}"]`)
      .remove();
    $container.find(`#permAddedUserEdit [data-user-id="${id}"]`).remove();
  };

  // click handler for edit
  window.clickIstifadeciElaveEtEdit = function () {
    window.collectSelectedUsersForPermissionEdit();
  };
});
