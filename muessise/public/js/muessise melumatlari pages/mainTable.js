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
    serverSide: true,
    dom: "t",
    ajax: {
      url: "/muessise-info/users",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: function (d) {
        d.query = $("#customSearch").val();
      },
      dataSrc: function (json) {
        if (!Array.isArray(json?.data)) return [];
        // Frontend-də displayName hazırlayırıq (surname boş olsa da tam ad çıxsın)
        const data = json.data.map((u, i) => {
          const full = (u.fullName ?? "").toString().trim();
          const first = (u.name ?? "").toString().trim();
          const last = (u.surname ?? "").toString().trim();
          const displayName =
            full || (first && last ? `${first} ${last}` : first || last) || "";
          return { ...u, displayName };
        });
    
        return data;
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
        // Ad + Soyad: yalnız displayName göstər (full → name+surname → name/surname)
        data: function (row, type, set, meta) {
          const displayName = (row.displayName ?? "").toString().trim();
          const initials =
            (displayName || "??")
              .split(/\s+/)
              .filter(Boolean)
              .map((w) => w[0])
              .slice(0, 2)
              .join("") || "??";

          return `
                        <div class="flex items-center gap-3 ">
                          <div class="min-w-12 min-h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold ">
                              ${initials}
                          </div>
                          <span class="text-messages text-[13px] font-medium dark:text-[#FFFFFF]">${displayName}</span>
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
          const displayName = (row.displayName ?? "").toString().trim();
          const phoneSuffixStr = String(row.phone_suffix || "");
          const phoneSuffix = phoneSuffixStr.startsWith("+")
            ? phoneSuffixStr
            : "+" + phoneSuffixStr.replace(/^\+/, "");
          return `
                        <div class="text-base flex items-center cursor-pointer dots-menu relative" data-table="users" 
                        data-id="${row.id ?? row._id ?? null}" 
                        data-name="${displayName}"
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
          $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
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
    const name = ((String(data.name || "")).trim()).trim();
    const surname = (data.surname || "").trim();
    const gender = data.gender || "";
    const email = data.email || "";
    const phone = data.phone || "";
    const phone_suffix = data.phone_suffix || "";
    const duty_name = data.duty_name || "";
    const permission_name = data.permission_name || "";

    let cleanName = (name || "").trim();
    let cleanSurname = (surname || "").trim();

    if (cleanName.toLowerCase() === 'n/a') cleanName = '';
    if (cleanSurname.toLowerCase() === 'n/a') cleanSurname = '';

    const fullName = (cleanName + " " + cleanSurname).trim();

    window.currentEditUserData = {
      id: id,
      name: name,
      surname: surname,
      fullName: fullName,
      gender: gender,
      email: email,
      phone: phone,
      phoneSuffix: phone_suffix,
      dutyName: duty_name,
      permissionName: permission_name
    };
    console.log("🌹Kliklənən user/permission məlumatları:", window.currentEditUserData);


    $('.dots-menu').removeClass('currently-selected');
    $(this).addClass('currently-selected');

    $("#editUserId").val(id);
    $("input[name='fullName']").val(fullName);
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
        <div class="text-base flex items-center cursor-pointer dots-menu relative" data-table="roles" data-id="${row.id ?? row._id ?? null
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
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0
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
                            ${i === pageInfo.page
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
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1
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
    $("#HesabElaveEtPopUp").addClass("hidden");
  }

  function closeYeniQrupPopup() {
    $("#overlay").addClass("hidden");
    $("#YeniQrupPop").addClass("hidden");
  }

  // Yeni Vəzifə aç/bağla
  function openYeniVezifePop() {
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("YeniVezifePop").classList.remove("hidden");
    document.getElementById("HesabElaveEtPopUp").classList.add("hidden");
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
      roles: openYeniVezifePop,
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
    const isDefault = $(this).data("default"); // Yeni: default status

    // Popup seçimi - permissions üçün xüsusi məntiq
    let popup;
    if (tableType === "permissions") {
      if (isDefault === true) {
        popup = $("#permissions-popup"); // Default true üçün adi popup
      } else {
        popup = $("#permissions-not-default-popup"); // Default false üçün xüsusi popup
      }
    } else {
      popup = $(`#${tableType}-popup`); // Digər table-lar üçün adi məntiq
    }

    const dotMenuElement = $(this);

    // Permission ID və name-ni global saxla
    if (tableType === "permissions") {
      window.currentPermissionId = tableId;
      window.currentPermissionName = tableName;
      console.log("Permission ID və name saxlandı:", {
        permissionId: tableId,
        permissionName: tableName,
        isDefault: isDefault,
      });
    }

    // Roles üçün ID və name saxla
    if (tableType === "roles") {
      window.currentRoleId = tableId;
      window.currentRoleName = tableName;
      console.log("Role ID və name saxlandı:", {
        roleId: tableId,
        roleName: tableName,
      });
    }

    // Əgər permissions table-ındayıqsa və default=true-dursa
    if (tableType === "permissions" && isDefault === true) {
      // Default permission üçün xüsusi popup göstər
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
    console.log("updatePermissionsPopupForDefault çağırıldı:", {
      permissionId,
      permissionName,
    });

    // Default permission-lar üçün "İstifadəçiləri redaktə et" və "Qrupu sil" var
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

    // "Qrupu sil" üçün onclick="deleteCurrentPermission()" artıq HTML-də var
    // Əlavə handler lazım deyil
  }

  // Normal permission üçün popup update
  function updatePermissionsPopupForNormal(
    popup,
    permissionId,
    permissionName
  ) {
    console.log("updatePermissionsPopupForNormal çağırıldı:", {
      permissionId,
      permissionName,
    });

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

  // Default permission edit popup açma (sadə edit - yalnız ad)
  function openEditPermissionDefaultPopup(permissionId, permissionName) {
    // 3-cü şəkildəki popup - sadə edit
    $("#overlay").removeClass("hidden");
    $("#EditPermissionDefaultPopup").removeClass("hidden");
    $("#edit-permission-default-name").val(permissionName);
    $("#edit-permission-default-id").val(permissionId);
  }

  // Permission adı dəyişdirmə popup açma (default false permission-lar üçün)
  function openEditPermissionNamePopup(permissionId, permissionName) {
    console.log("openEditPermissionNamePopup çağırıldı:", {
      permissionId: permissionId,
      permissionName: permissionName,
    });

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
          // console.log("", response.data);

          populatePermissionSelectors(response.data);
        }
      },
      error: function (xhr, status, error) {
        console.error("Permission details yüklənərkən xəta:", error);
      },
    });
  }

  let currentPermissionData = null;
  function deletePermissionUser(permissionId, userId) {
    if (!permissionId || !userId) return;
    const csrfToken = $('meta[name="csrf-token"]').attr('content');


    $.ajax({
      url: `/muessise-info/permission/${permissionId}/user/${userId}`,
      type: 'DELETE',
      headers: {
        'CSRF-Token': csrfToken
      },
      success: function (res) {
        if (res.success) {
          // Yalnız currentPermissionData-nın users hissəsini yenilə
          currentPermissionData.users = res.users;

          // Yalnız user list-i yenilə, permission seçimlərini toxunma
          updateUsersList(res.users);

          if (typeof alertModal === 'function') {
            alertModal('Uğurlu', 'İstifadəçi silindi');
          }
        } else {
          alertModal('Xəta', 'Istifadəçi silinə bilmədi');
        }
      },
      error: function (err) {
        console.error(err);
        alert("Server xətası baş verdi.");
      }
    });
  }

  function updateUsersList(users) {
    const usersList = $('#permission-users-list');
    usersList.empty();

    if (Array.isArray(users) && users.length) {
      users.forEach(user => {
        const userDiv = $(`
          <div class="flex items-center justify-between pb-2" data-user-id="${user._id}">
             <span class="text-gray-800 dark:text-gray-100 font-medium">
                 ${user.fullname}
             </span>
             <button class="delete-btn flex items-center text-red-500 dark:text-red-400 font-medium">
                 <div class="icon stratis-trash-01 !w-[17px] !h-[17px] mr-2 opacity-65"></div>
             </button>
           </div>
      `);

        // Sil button üçün click event
        userDiv.find('.delete-btn').on('click', () => {
          console.log('Sil clicked:', user._id);
          deletePermissionUser(currentPermissionData.id, user._id);
        });

        usersList.append(userDiv);
      });
    } else {
      usersList.append('<div class="text-gray-500 text-sm">Bu permission üçün istifadəçi yoxdur.</div>');
    }
  }
  // Permission checkboxlarını doldurmaq
  function populatePermissionSelectors(permissionData) {
    if (!permissionData) return;

    const permissions = [
      "dashboard",
      "accounting",
      "avankart_partner",
      "company_information",
      "profile",
      "edit_users",
      "role_groups",
      "requisites",
      "contracts",
    ];

    const azPermissionText = {
      none: "İcazə yoxdur",
      read: "Baxış",
      full: "Tam İdarə"
    };

    permissions.forEach(key => {
      const selector = $(`.permission-level-selector[data-permission="${key}"]`);
      if (!selector.length) return;

      const checkbox = selector.siblings('label').find('input[type="checkbox"]');
      const labelDiv = selector.find('.permission-level-btn div');
      const dropdownItems = selector.find('.dropdown-item');

      const val = permissionData[key] || 'none';

      // *** ƏN VACIB - CHECKBOX VALUE VƏ STATUS DÜZGÜN SET ET ***
      checkbox.prop('checked', val !== 'none');
      checkbox.val(val); // Bu çox vacibdir - checkbox value-ni set et

      // Label update
      labelDiv.text(azPermissionText[val] || "İcazə");

      // Dropdown-da seçilmiş item vizual olaraq işarələnsin
      dropdownItems.removeClass('bg-gray-700');
      dropdownItems.filter(`[data-value="${val}"]`).addClass('bg-gray-700');

      // Seçilmiş value data atributuna əlavə et
      selector.attr('data-selected-value', val);

      // Checkbox seçili deyilsə, sətir boz olsun və select disabled olsun
      if (!checkbox.prop('checked')) {
        selector.addClass('opacity-50 cursor-not-allowed')
          .find('input, button').prop('disabled', true);
      } else {
        selector.removeClass('opacity-50 cursor-not-allowed')
          .find('input, button').prop('disabled', false);
      }

      // Checkbox change event əlavə et ki, realtime işləsin
      checkbox.off('change').on('change', function () {
        if ($(this).prop('checked')) {
          selector.removeClass('opacity-50 cursor-not-allowed')
            .find('input, button').prop('disabled', false);
        } else {
          // Checkbox unchecked olunanda value-ni 'none' et və vizualı da yenilə
          $(this).val('none');
          selector.attr('data-selected-value', 'none');
          selector.find('.permission-level-btn div').text('İcazə yoxdur');
          selector.find('.dropdown-item').removeClass('bg-gray-700');
          selector.find('.dropdown-item[data-value="none"]').addClass('bg-gray-700');

          selector.addClass('opacity-50 cursor-not-allowed')
            .find('input, button').prop('disabled', true);
        }
      });

      console.log(`Loaded ${key}: value=${val}, checked=${checkbox.prop('checked')}`);
    });
    // Permission name update
    if (permissionData.name) {
      $("#edit-permission-full-name").val(permissionData.name);
    }
    // Default permissions hamısı disabled
    if (permissionData.default) {
      $("#EditPermissionFullPopup .permission-level-selector")
        .addClass("opacity-50 cursor-not-allowed")
        .find("input,button")
        .prop("disabled", true);
    }

    currentPermissionData = permissionData;

    updateUsersList(permissionData.users || []);

  }
  document
    .querySelectorAll(".permission-level-selector")
    .forEach((selector) => {
      const btn = selector.querySelector(".permission-level-btn");
      const dropdown = selector.querySelector(".permission-dropdown");
      const label = btn.querySelector("div");
      const permissionKey = selector.getAttribute("data-permission");

      const checkbox = document.querySelector(
        `input[name="permissions[${permissionKey}]"]`
      );

      // Aç-bağla
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        document
          .querySelectorAll(".permission-dropdown")
          .forEach((d) => {
            if (d !== dropdown) d.classList.add("hidden");
          });

        dropdown.classList.toggle("hidden");
      });

      dropdown.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const value = item.dataset.value;
          label.textContent = item.textContent;

          // *** CHECKBOX VALUE VƏ STATUS SET***
          if (checkbox) {
            checkbox.value = value;

            if (value === "none") {
              checkbox.checked = false;
            } else {
              checkbox.checked = true;
            }

            $(checkbox).trigger("change");

            console.log(
              `Permission ${permissionKey}: value=${value}, checked=${checkbox.checked}`
            );
          }

          // Seçilmiş item-ı vizual olaraq qeyd et
          dropdown.querySelectorAll(".dropdown-item").forEach((i) =>
            i.classList.remove("bg-gray-700")
          );
          item.classList.add("bg-gray-700");

          selector.setAttribute("data-selected-value", value);

          dropdown.classList.add("hidden");
        });
      });

      // Çöldə kliklənəndə bağlansın
      document.addEventListener("click", (e) => {
        if (!selector.contains(e.target)) {
          dropdown.classList.add("hidden");
        }
      });
    });

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

  // Preserve any previously-defined submitForm to avoid breaking other forms
  const __prevSubmitFormMain = window.submitForm;
  window.submitForm = function (type) {
    if (type === "editPermissionDefault") {
      const id = $("#edit-permission-default-id").val();
      const name = ($("#edit-permission-default-name").val() || "").trim();
      if (!name) {
        alertModal("Xəta", "Ad boş ola bilməz");
        return;
      }
      $.ajax({
        url: $("#editPermissionDefaultForm").data("url"),
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        data: { id, name },
        success: (r) => {
          if (r.success) {
            alertModal("Uğurlu", "İcazə uğurla yeniləndi", () => {
              closeEditPermissionDefaultPopup();
              if (window.permissionsTable) {
                try {
                  permissionsTable.ajax.reload(null, false);
                } catch (e) {
                  location.reload();
                }
              } else location.reload();
            });
          } else {
            alertModal("Xəta", r.message || "Xəta");
          }
        },
        error: (xhr) =>
          alertModal("Xəta", xhr.responseJSON?.message || "Server xətası"),
      });
    }
    if (type === "editPermissionFull") {
      const id = $("#edit-permission-full-id").val();
      const name = ($("#edit-permission-full-name").val() || "").trim();

      if (!name) {
        alertModal("Xəta", "Ad boş ola bilməz");
        return;
      }

      // Hər permission üçün dropdown-dan seçilən dəyəri götür
      const getPermissionValue = (permissionName) => {
        const selector = document.querySelector(
          `.permission-level-selector[data-permission="${permissionName}"]`
        );
        if (!selector) {
          console.warn(`Selector tapılmadı: ${permissionName}`);
          return "none";
        }

        // Data atributundan seçilən dəyəri götür
        return selector.getAttribute("data-selected-value") || "none";
      };

      const permissions = {
        dashboard: getPermissionValue("dashboard"),
        accounting: getPermissionValue("accounting"),
        avankart_partner: getPermissionValue("avankart_partner"),
        company_information: getPermissionValue("company_information"),
        profile: getPermissionValue("profile"),
        edit_users: getPermissionValue("edit_users"),
        role_groups: getPermissionValue("role_groups"),
        requisites: getPermissionValue("requisites"),
        contracts: getPermissionValue("contracts"),
      };

      const payload = { id, name, permissions };

      $.ajax({
        url: $("#editPermissionFullForm").data("url"),
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify(payload),
        success: (r) => {
          if (r.success) {
            alertModal("Uğurlu", "İcazə uğurla yeniləndi", () => {
              closeEditPermissionFullPopup();
              if (window.permissionsTable) {
                try {
                  permissionsTable.ajax.reload(null, false);
                } catch (e) {
                  location.reload();
                }
              } else location.reload();
            });
          } else {
            alertModal("Xəta", r.message || "Xəta");
          }
        },
        error: (xhr) =>
          alertModal("Xəta", xhr.responseJSON?.message || "Server xətası"),
      });
      closeEditPermissionFullPopup();
    }
    // For all other types, delegate to previously defined or generic submitForm
    try {
      if (typeof __prevSubmitFormMain === "function") {
        return __prevSubmitFormMain(type);
      }
      if (typeof window.__genericSubmitForm === "function") {
        return window.__genericSubmitForm(type);
      }
      console.warn("submitForm: unknown type and no delegate found:", type);
    } catch (e) {
      console.error("submitForm delegate error:", e);
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
    tableId = "AllUsersPop",
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

  // Fix missing function reference
  window.cancelOtpPermissionDelete = function () {
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

    // CSRF token al
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    if (!csrfToken) {
      console.error("CSRF token tapılmadı");
      alert("CSRF token tapılmadı. Səhifəni yeniləyin.");
      return;
    }

    // Permission silmə sorğusu göndər
    $.ajax({
      url: "/rbac/rbacPermission/delete",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: {
        id: permissionId,
        _csrf: csrfToken,
      },
      success: function (response) {
        if (response.success) {
          if (response.otpRequired) {
            // OTP popup açılmalı
            console.log(
              "OTP tələb olunur, tempDeleteId:",
              response.tempDeleteId
            );

            // OTP məlumatlarını saxla
            window.currentTempDeleteId = response.tempDeleteId;

            // Delete popup-ını bağla
            $("#deletePermissionPopUp").addClass("hidden");

            // Mövcud otp-modal sistemini istifadə et
            // Popup.js-dən Otp funksiyasını çağır
            if (typeof Otp === "function") {
              Otp(response.userEmail || "", response.tempDeleteId, {
                url: "/rbac/rbacPermission/acceptDelete",
                title: "Səlahiyyət Qrupu Silmə",
                formType: "deletePermission",
                submitText: "Təsdiqlə",
                cancelText: "Ləğv et",
              });
            } else {
              console.error("Otp funksiyası tapılmadı");
              alert("OTP sistemi mövcud deyil");
            }
          } else {
            // Uğurla silindi
            alert("Səlahiyyət qrupu uğurla silindi!");

            // Popup-ı bağla
            cancelDeletePermission();

            // Table-ı yenilə (əgər mövcuddursa)
            if (typeof refreshTable === "function") {
              refreshTable();
            } else if (window.location.reload) {
              window.location.reload();
            }
          }
        } else {
          console.error("Permission silmə xətası:", response.message);
          alert("Xəta: " + (response.message || "Permission silinə bilmədi"));
        }
      },
      error: function (xhr, status, error) {
        console.error("Permission silmə AJAX xətası:", {
          xhr: xhr,
          status: status,
          error: error,
          responseText: xhr.responseText,
        });

        let errorMessage = "Server xətası baş verdi.";

        if (xhr.status === 401) {
          errorMessage =
            "Giriş icazəniz yoxdur. Zəhmət olmasa yenidən giriş edin.";
        } else if (xhr.status === 403) {
          errorMessage = "Bu əməliyyat üçün səlahiyyətiniz yoxdur.";
        } else if (xhr.status === 404) {
          errorMessage = "İstənilən xidmət tapılmadı.";
        } else if (xhr.status === 500) {
          errorMessage = "Server xətası baş verdi.";
        }

        alert(errorMessage);
      },
    });
  };

  // Global olaraq deletePermission funksiyasını təyin et
  window.deletePermission = deletePermission;

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
    tableId = "AllUsersPopEdit",
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


  // ============ Add Users Permission===============
  let currentPermissionUsers = [];
  let userTable = null;
  let lastPopup = null;
  function openAddPermUsersPopup(fromPopup) {
    console.log("clicked openAddPermUsersPopup");
    lastPopup = fromPopup;

    $("#overlay").removeClass("hidden");
    $("#ButunIstifadecilerPopup").removeClass("hidden");

    if (fromPopup) {
      $(`#${fromPopup}`).addClass("hidden");
    }
    refreshUserTable();
  };
  window.openAddPermUsersPopup = openAddPermUsersPopup;
  function closeAddPermUsersPopup() {
    console.log("clicked closeAddPermUsersPopup");
    $("#overlay").addClass("hidden");
    $("#ButunIstifadecilerPopup").addClass("hidden");
    if (lastPopup) {
      $(`#${lastPopup}`).removeClass("hidden");
    }
  };
  window.closeAddPermUsersPopup = closeAddPermUsersPopup;

  window.collectSelectedUsersForPermissionEdit = function (tableId = "AllUsersPop", divId = "userHiddenInputsForPermissionEdit") {
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
  window.clickIstifadeciElaveEtEdit = function () {
    window.collectSelectedUsersForPermissionEdit();
  };


  //fill rows
  $(document).ready(function () {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");


    function initializeTable() {
      if (userTable) {
        userTable.destroy();
        $("#AllUsersPop").empty();
      }

      userTable = $("#AllUsersPop").DataTable({
        paging: true,
        info: false,
        dom: "t",
        ajax: {
          url: "/muessise-info/users",
          type: "POST",
          headers: {
            "CSRF-Token": csrfToken,
          }, dataSrc: function (json) {
            console.log("Received data from server All users add uiser popup:", json);
            return json.data || json;
          },
          error: function (xhr, error, code) {
            return { data: [] };
          },
        },
        columns: [
          {
            orderable: false,
            data: function (row, type, set, meta) {
              const idx = meta.row;
              const isChecked = row.isChecked ? "checked" : "";
              return `
  <input type="checkbox" id="cb-${idx}" class="peer hidden" data-user-id="${row.id || row._id}" ${isChecked}>
        <label for="cb-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition dark:border-surface-variant-dark dark:text-side-bar-item-dark dark:peer-checked:bg-primary-dark dark:peer-checked:text-on-primary-dark dark:peer-checked:border-primary-dark dark:bg-[#161E22]">
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
                                ${row.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-messages text-[13px] font-medium dark:text-white">${row.name
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
              return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.duty_name || row.speciality
                }</span>`;
            },
          },
          {
            data: function (row) {
              return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.phone}</span>`;
            },
          },
          {
            data: function (row) {
              return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.permission_name || row.group
                }</span>`;
            },
          },
          {
            orderable: false,
            data: function (row, type, set, meta) {
              const idx = meta.row;
              return ``;
            },
          },
        ],

        order: [],
        lengthChange: false,
        pageLength: 10,
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

          $(row).find("td").addClass("border-b-[.5px] border-stroke");

          $(row).find("td:not(:first-child):not(:last-child)").css({
            "padding-left": "20px",
            "padding-top": "14.5px",
            "padding-bottom": "14.5px",
          });

          $("#AllUsersPopPop thead th:first-child").css({
            "padding-left": "0",
            "padding-right": "0",
            width: "58px",
            "text-align": "center",
            "vertical-align": "middle",
          });

          $("#AllUsersPopPop thead th:last-child").css({
            "border-left": "0.5px solid #E0E0E0",
          });

          $("#AllUsersPopPop thead th:first-child label").css({
            margin: "0 auto",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
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
            .addClass("border-l-[.5px] border-stroke")
            .css({
              "padding-right": "0",
              "text-align": "right",
              position: "relative",
            });
        },

        initComplete: function () {
          $("#AllUsersPopPop thead th").css({
            "padding-left": "20px",
            "padding-top": "10.5px",
            "padding-bottom": "10.5px",
          });

          $("#AllUsersPopPop thead th:first-child").css({
            "padding-left": "0",
            "padding-right": "0",
            width: "58px",
            "text-align": "center",
            "vertical-align": "middle",
          });

          $("#AllUsersPopPop thead th:last-child").css({
            "border-left": "0.5px solid #E0E0E0",
          });

          $("#AllUsersPopPop thead th:first-child label").css({
            margin: "0 auto",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          });

          $("#AllUsersPopPop thead th.filtering").each(function () {
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

          $("#AllUsersPop tbody tr.spacer-row").remove();
          const colCount = $("#AllUsersPop thead th").length;
          const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
          $("#AllUsersPop tbody").prepend(spacerRow);

          const $lastRow = $("#AllUsersPop tbody tr:not(.spacer-row):last");
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

    window.changePage = function (page) {
      if (table && table.page) {
        table.page(page).draw("page");
      }
    };

    $(document).on("keyup", "#customSearch", function () {
      if (table && table.search) {
        table.search(this.value).draw();
      }
      if (usersTable) {
        usersTable.ajax.reload();
      }
    });
    $(document).on("change", '#AllUsersPop tbody input[type="checkbox"]', function () {
      const total = $('#AllUsersPop tbody input[type="checkbox"]').length;
      const checked = $('#AllUsersPop tbody input[type="checkbox"]:checked').length;

      if (total > 0 && total === checked) {
        $("#newCheckbox").prop("checked", true);
      } else {
        $("#newCheckbox").prop("checked", false);
      }
    });


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

    $(document).on("click", function () {
      $(".dropdown-menu").addClass("hidden");
    });

    $(document).on("click", ".open-action", function (e) {
      e.stopPropagation();
      const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
      console.log(`Open action for row ${rowId}`);
      $(".dropdown-menu").addClass("hidden");
    });

    $(document).on("click", ".delete-action", function (e) {
      e.stopPropagation();
      const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
      console.log(`Delete action for row ${rowId}`);
      $(".dropdown-menu").addClass("hidden");
    });

    $(document).on("click", ".dropdown-menu", function (e) {
      e.stopPropagation();
    });

    window.addToGroup = function () {
      const targetDiv = document.getElementById("userHiddenInputsForPermission");

      if (!targetDiv) {
        const selectedUsers = [];
        $('#AllUsersPop tbody input[type="checkbox"]:checked').each(function () {
          const row = $(this).closest("tr");
          const table = $("#AllUsersPop").DataTable();
          const rowData = table.row(row).data();

          if (rowData) {
            selectedUsers.push({
              id: rowData.id || rowData._id,
              name: rowData.name,
              email: rowData.email,
            });
          }
        });

        if (selectedUsers.length === 0) {
          alert("Heç bir istifadəçi seçilməyib!");
          return;
        }

        const userNames = selectedUsers.map((u) => u.name).join("\n• ");
        alert(
          `✅ ${selectedUsers.length} istifadəçi seçildi:\n\n• ${userNames}\n\n💡 Permission yaratma səhifəsində olsanız, bu istifadəçilər avtomatik əlavə olunacaq.`
        );

        closeUsersPopup();
        return;
      }

      if (typeof window.collectSelectedUsersForPermission === "function") {
        const success = window.collectSelectedUsersForPermission(
          "AllUsersPop",
          "userHiddenInputsForPermission"
        );

        if (success) {
          const selectedCount = $(
            '#AllUsersPop tbody input[type="checkbox"]:checked'
          ).length;
          if (selectedCount > 0) {
            showSuccessToast(`${selectedCount} istifadəçi qrupa əlavə edildi`);
          }
        }

        closeUsersPopup();
        refreshUserTable();

      }
    };

    function showSuccessToast(message) {
      let toastContainer = document.getElementById("toast-container");
      if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.className = "fixed top-4 right-4 z-[1200]";
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement("div");
      toast.className =
        "bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 mb-2 transform translate-x-full transition-transform duration-300";
      toast.innerHTML = `
      <div class="icon stratis-check-circle text-white"></div>
      <span>${message}</span>
    `;

      toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove("translate-x-full");
      }, 100);

      setTimeout(() => {
        toast.classList.add("translate-x-full");
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }

    window.selectedUserIds = [];
    window.allUsers = [];

    window.CreatePermopenUsersPopup = function () {
  // Köhnə popup varsa sil
  const oldPopup = document.getElementById("usersPopupModal");
  if (oldPopup) oldPopup.remove();

  const popup = document.createElement("div");
  popup.id = "usersPopupModal";
  popup.className = "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-[1000]";

  popup.innerHTML = `
    <div
      id="ButunIstifadecilerPopupCreatePerm"
      class="w-[995px] z-101 bg-body-bg text-messages border-[3px] border-[#0000001A]
      !shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-2xl fixed left-[50%] top-[50%]
      transform -translate-1/2 dark:bg-[#161E22] dark:border-[#FFFFFF1A]"
    >
      <div class="flex items-center justify-between px-6 py-[18px] border-b-[0.5px] border-[#0000001A]">
        <div class="text-[15px] font-medium dark:text-white">Bütün istifadəçilər</div>
        <img onclick="closeCreateAddPermUsersPopup()" src="/images/Sorgular Pages Images/Close.svg" alt="Close"
             class="cursor-pointer block dark:hidden" />
        <img onclick="closeCreateAddPermUsersPopup()" src="/images/avankart-partner-pages-images/Close-dark.svg" alt="Close"
             class="cursor-pointer hidden dark:block" />
      </div>

      <div class="px-6">
        <div class="my-4">
          <div class="relative w-full">
            <input id="customSearch" placeholder="Ad, soyad, email, vəzifə"
              class="cursor-pointer w-full h-[34px] font-poppins font-normal text-[12px]
              border-[1px] border-surface-variant rounded-full pl-[12px]
              placeholder-on-surface-variant-dark hover:bg-input-hover
              focus:border-focus focus:ring-0 focus:outline-none
              transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-on-surface-variant"
              autocomplete="off" />
            <span class="icon stratis-search-02 !absolute top-[8px] cursor-pointer text-messages
              opacity-[30%] right-[12px] !w-[15px] !h-[15px] dark:!text-white">
            </span>
          </div>
        </div>

        <div>
          <div class="w-full rounded-[8px] mt-3 flex flex-col gap-3 relative">
            <table id="AllUsersPopupCreatePerm">
              <thead>
                <tr class="text-xs text-tertiary-text font-base !h-[40px] dark:bg-table-hover-dark dark:text-white">
                 <th class="w-[58px] border-r-[.5px] border-r-stroke px-4 py-2">
  <input type="checkbox" id="newCheckbox" class="peer hidden" />
  <label for="newCheckbox" 
         class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
    <div class="icon stratis-check-01 scale-60"></div>
  </label>
</th>

                  <th class="px-4 filtering">Ad və soyad</th>
                  <th class="px-4 py-2 filtering">Cinsi</th>
                  <th class="px-4 py-2 filtering">Vəzifəsi</th>
                  <th class="px-4 py-2 filtering">Telefon nömrəsi</th>
                  <th class="px-4 py-2 filtering">Qrup</th>
                </tr>
              </thead>
            <tbody class="font-base text-xs text-black dark:text-white"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-[30px] px-6 py-5 flex items-center justify-end gap-3 border-t-[0.5px] border-[#0000001A]">
        <button type="reset"
          class="bg-surface rounded-[50px] text-on-surface-variant text-[13px] font-medium px-[18px] py-[6.5px]
          cursor-pointer hover:text-messages dark:bg-surface-bright-dark dark:text-on-surface-variant-dark">
          Filterləri təmizlə
        </button>
        <button onclick="addUsersToCreatePerm()" type="button"
          class="bg-primary flex items-center gap-2 rounded-[50px] text-white text-[13px] font-medium
          px-[18px] py-[6.5px] cursor-pointer hover:bg-hover-button">
          <div class="icon stratis-plus-02"></div>
          <div class="text-[13px] font-medium">Qrupa əlavə et</div>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // Popup arxa hissəyə kliklə bağlansın
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closeCreateAddPermUsersPopup();
  });

  // Userləri yükləyirik
 $.ajax({
  url: "/muessise-info/users",
  type: "POST",
  headers: { "Content-Type": "application/json", "CSRF-Token": csrfToken },
  success: function (res) {
    const tbody = popup.querySelector("#AllUsersPopupCreatePerm tbody");
    tbody.innerHTML = "";

    window.allUsers = (res.data || []).map(u => ({
      ...u,
      id: u.id || u._id,
      fullname: `${u.name || ""} ${u.surname || ""}`,
    }));

    if (window.allUsers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-tertiary-text">Heç bir istifadəçi tapılmadı</td></tr>';
      return;
    }

    window.allUsers.forEach(user => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-[#00000010] hover:bg-[#f9f9f9] dark:hover:bg-[#1d252a]";
      tr.innerHTML = `
        <td class="px-4 py-2 text-center">
  <input type="checkbox" id="user-cb-${user.id}" class="userCheckbox peer hidden" value="${user.id}">
  <label for="user-cb-${user.id}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
    <div class="icon stratis-check-01 scale-60"></div>
  </label>
</td>

        <td class="px-4 ">
         <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
  ${
    [user.name, user.surname]
      .filter(Boolean) 
      .map(word => word[0].toUpperCase()) 
      .join("")
  }
</div>

        ${user.name || "-"} ${user.surname || ""}</td>

                            </div>
        <td class="px-4 py-2">${user.gender || "-"}</td>
        <td class="px-4 py-2">${user.duty_name || "-"}</td>
        <td class="px-4 py-2">${user.phone_suffix || "-"} ${user.phone || ""}</td>
        <td class="px-4 py-2">${user.permission_name || "-"}</td>
      `;
      tbody.appendChild(tr);

      // 🔹 Əgər user artıq seçilibsə checkbox-u checked et
      const checkbox = tr.querySelector(".userCheckbox");
      if (window.selectedUserIds.includes(user.id)) {
        checkbox.checked = true;
      }

      // 🔹 Checkbox dəyişiklik listener
      checkbox.addEventListener("change", () => {
        window.selectedUserIds = Array.from(
          popup.querySelectorAll(".userCheckbox:checked")
        ).map(x => x.value);
      });
    });
  },
});

};


  window.addUsersToCreatePerm = function () {
  const container = document.querySelector(".users-list");
  if (!container) return;

  // Əgər seçilmiş istifadəçilər varsa
  if (window.selectedUserIds.length > 0) {
    let list = container.querySelector("#permission-users-list");

    // Əgər bu ilk dəfədirsə, skeleton qur
    if (!list) {
      container.innerHTML = `
        <div class="w-[242px] h-[544px]">
          <div class="py-[14px] flex items-start px-4 border-b-[0.5px] border-[#0000001A] dark:border-[#FFFFFF1A]">
            <div class="text-[13px] font-medium text-messages pt-[5px] dark:text-white">
              İstifadəçilər
            </div>
            <button
              onclick="CreatePermopenUsersPopup()"
              class="flex items-center justify-center duration-150 gap-2.5 cursor-pointer rounded-full w-[97px] h-[34px] hover:bg-[#F6D9FF] dark:hover:bg-[#5B396D4D] dark:text-white"
            >
              <div class="icon stratis-plus-02 !w-3 !h-3"></div>
              <div class="text-[12px] font-medium text-messages dark:text-white">
                Əlavə et
              </div>
            </button>
          </div>
          <div id="permission-users-list" class="my-3 px-4 flex flex-col gap-[23px]"></div>
        </div>
      `;
      list = container.querySelector("#permission-users-list");
    }

    const addedUsers = [];

    // Əvvəlcədən göstərilmiş user ID-ləri tapırıq
    const existingIds = Array.from(list.querySelectorAll("[data-user-id]")).map(el => el.dataset.userId);

    window.selectedUserIds.forEach((userId) => {
      const user = window.allUsers.find((u) => u.id === userId);
      if (!user) return;

      // Əgər bu user artıq siyahıda varsa, keç
      if (existingIds.includes(user.id)) return;

      addedUsers.push({ id: user.id, name: user.name, surname: user.surname });

      const userDiv = document.createElement("div");
      userDiv.className = "flex items-center justify-between pb-2";
      userDiv.dataset.userId = user.id;
      userDiv.innerHTML = `
        <span class="text-gray-800 dark:text-gray-100 font-medium">
          ${user.name} ${user.surname}
        </span>
        <button class="delete-btn flex items-center text-red-500 dark:text-red-400 font-medium">
          <div class="icon stratis-trash-01 !w-[17px] !h-[17px] mr-2 opacity-65"></div>
        </button>
      `;

      // Silmə funksiyası
      userDiv.querySelector(".delete-btn").addEventListener("click", () => {
        window.selectedUserIds = window.selectedUserIds.filter((id) => id !== user.id);
        userDiv.remove();

        if (list.children.length === 0) {
          showEmptyUsersState();
        }
      });

      list.appendChild(userDiv);
    });

    // Popup bağlanır
    const modalWrapper = document.getElementById("usersPopupModal");
    if (modalWrapper) modalWrapper.remove();

    console.log("Əlavə edilən istifadəçilər:", addedUsers);
  } else {
    showEmptyUsersState();
  }
};


    // 🔹 Boş vəziyyətdə default görünüşü geri qaytaran funksiya
    function showEmptyUsersState() {
      const container = document.querySelector(".users-list");
      if (!container) return;

      container.className =
        "px-3 flex items-center w-[242px] border-r-[0.5px] border-[#0000001A] users-list";

      container.innerHTML = `
    <div class="flex items-center justify-center my-[230px] m-auto">
      <div class="flex items-center justify-center flex-col">
        <img
          src="/images/muessise melumatlari images/Group.svg"
          alt="IstifadeciElaveEt"
        />
        <button
          onclick="CreatePermopenUsersPopup()"
          class="flex items-center justify-center duration-150 gap-2.5 mt-[32px] cursor-pointer rounded-full w-[176px] h-[34px] hover:bg-[#F6D9FF] dark:hover:bg-[#5B396D4D] dark:text-white"
        >
          <div class="icon stratis-plus-02"></div>
          <div class="text-[13px] font-medium text-messages dark:text-white">
            İstifadəçi əlavə et
          </div>
        </button>
      </div>
    </div>
  `;
    }

window.closeCreateAddPermUsersPopup = function () {
  const popupWrapper = document.getElementById("usersPopupModal");
  if (popupWrapper) popupWrapper.remove();

  // Seçimlər təmizlənir
  window.selectedUserIds = [];

  console.log("Popup bağlandı və təmizləndi ✅");
};










    window.closeUsersPopup = function () {
      let popup = document.getElementById("usersPopupModal");
      if (popup) {
        popup.remove();
      }
    };
  });
  window.sendSelectedUsersToBackend = function () {
    if (!currentPermissionId) {
      alert("Permission ID tapılmadı!");
      return;
    }

    const selectedUserIds = [];
    $('#AllUsersPop tbody input[type="checkbox"]:checked').each(function () {
      const row = $(this).closest("tr");
      const table = $("#AllUsersPop").DataTable();
      const rowData = table.row(row).data();

      if (rowData) selectedUserIds.push(rowData.id || rowData._id);
    });

    if (selectedUserIds.length === 0) {
      alertModal('Xəta', 'Heç bir istifadəçi seçilməyib!');

      return;
    }

    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    $.ajax({
      url: '/muessise-info/permissions/add-users',
      type: 'POST',
      contentType: 'application/json',
      headers: { 'CSRF-Token': csrfToken },
      data: JSON.stringify({
        permissionId: currentPermissionId,
        userIds: selectedUserIds
      }),
      success: function (res) {
        console.log('Backend cavabı:', res);
        alertModal(`istifadəçi uğurla əlavə edildi!`, 'Xəta');

        loadPermissionDetails(currentPermissionId);
        window.refreshPermissionUsersTable();
        closeAddPermUsersPopup();
      },
      error: function (err) {
        console.error('Xəta baş verdi:', err);
        alertModal(`'İstifadəçiləri əlavə etmək mümkün olmadı!'`, 'Xəta');

      }
    });
  };

  // ======= "Qrupa əlavə et" düyməsi =======
  window.addToGroup = function () {
    window.sendSelectedUsersToBackend();
    $("#overlay").addClass("hidden");

  };
  function refreshUserTable() {
    if (userTable) {
      userTable.ajax.reload(null, false);
      // null,false → səhifəni dəyişmədən sadəcə datanı yeniləyir
    } else {
      console.warn("userTable hələ initialize olunmayıb");
    }
  }

  //Reload Tables
  const tableMap = {
    users: usersTable,
    duties: rolesTable,
    perms: permissionsTable
  };

  $('#reloadBtn').on('click', function () {
    ["users", "duties", "perms"].forEach(key => {
      const table = tableMap[key];
      if (table && table.ajax && typeof table.ajax.reload === "function") {
        table.ajax.reload();
      } else {
        console.warn(`${key} yenilene bilmedi.`);
      }
    });
  });


});