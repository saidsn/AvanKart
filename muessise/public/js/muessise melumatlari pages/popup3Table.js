$(document).ready(function () {
  // Permission ID yoxlayış funksiyası
  function getPermissionId() {
    const globalPermissionId = window.currentPermissionId;
    const inputPermissionId = $("#currentPermId").val();
    const permissionId = globalPermissionId || inputPermissionId;

    console.log("getPermissionId çağırıldı:", {
      globalPermissionId,
      inputPermissionId,
      finalPermissionId: permissionId,
      inputExists: $("#currentPermId").length > 0,
      inputVisible: $("#currentPermId").is(":visible"),
    });

    return permissionId;
  }

  // Datatable yaratma funksiyası
  function initializeDataTable() {
    const permissionId = getPermissionId();
    console.log("initializeDataTable çağırıldı, permissionId:", permissionId);

    if (!permissionId) {
      console.log("Permission ID boşdur, datatable yaradılmır");
      return;
    }

    if ($.fn.DataTable.isDataTable("#myTablePop2")) {
      console.log("DataTable artıq mövcuddur, destroy edilir");
      $("#myTablePop2").DataTable().destroy();
    }

    const table = $("#myTablePop2").DataTable({
      paging: true,
      info: false,
      dom: "t",
      processing: true,
      serverSide: false,
      ajax: {
        url: "/rbac/showPermUsers",
        type: "POST",
        headers: {
          "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
        },
        data: function () {
          const payload = {
            permissionId: permissionId,
            _csrf: $('meta[name="csrf-token"]').attr("content"),
          };
          console.log("AJAX request body (/rbac/showPermUsers):", payload);
          return payload;
        },
        dataSrc: function (json) {
          console.log("Backend cavabı:", json);
          if (json && Array.isArray(json.data)) {
            console.log("Gələn user sayı:", json.data.length);
            console.table(
              json.data.map((u, i) => ({
                idx: i,
                fullName: u.fullName,
                displayName: u.displayName,
                name: u.name,
                firstName: u.firstName,
                surname: u.surname,
              }))
            );
          }
          if (json.success) return json.data || [];
          console.error("Server xətası:", json.message);
          return [];
        },
        error: function (xhr, error) {
          console.error("AJAX xətası:", error);
          console.error("Response:", xhr.responseText);
        },
      },
      columns: [
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            return `
              <input type="checkbox" id="cb-${idx}" class="peer hidden">
              <label for="cb-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition dark:border-surface-variant-dark dark:text-side-bar-item-dark dark:peer-checked:bg-primary-dark dark:peer-checked:text-on-primary-dark dark:peer-checked:border-primary-dark dark:bg-[#161E22]">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            `;
          },
        },
        {
          // ✨ Ad + Soyad sütunu — fullName/displayName/name prioritizəsi
          data: function (row, type, set, meta) {
            const fromFull =
              typeof row.fullName === "string" ? row.fullName : "";
            const fromDisp =
              typeof row.displayName === "string" ? row.displayName : "";
            const fromName = typeof row.name === "string" ? row.name : "";

            let fullName =
              (fromFull && fromFull.trim().length ? fromFull : "") ||
              (fromDisp && fromDisp.trim().length ? fromDisp : "") ||
              (fromName && fromName.trim().length ? fromName : "") ||
              "";

            if (!fullName) {
              const first = (row.firstName ?? row.name ?? "") + "";
              const last = (row.surname ?? "") + "";
              fullName = first && last ? `${first} ${last}` : first;
            }

            const initials =
              (fullName || "??")
                .split(/\s+/)
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join("") || "??";

            console.log("Row name fields (idx=" + meta.row + "):", {
              fullName_raw: row.fullName,
              displayName_raw: row.displayName,
              name_raw: row.name,
              firstName_raw: row.firstName,
              surname_raw: row.surname,
              chosenFullName: fullName,
              initials,
            });

            return `
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                  ${initials}
                </div>
                <div class="flex flex-col">
                  <span class="text-messages text-[13px] font-medium dark:text-primary-text-color-dark">
                    ${fullName}
                  </span>
                </div>
              </div>
            `;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-primary-text-color-dark">${
              row.gender || ""
            }</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-primary-text-color-dark">${
              row.speciality || ""
            }</span>`;
          },
        },
        {
          // EJS-də “Email” başlığı varsa bura email də yaza bilərsən
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-primary-text-color-dark">${
              row.email || ""
            }</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages font-normal dark:text-primary-text-color-dark">${
              row.phone || ""
            }</span>`;
          },
        },
        {
          orderable: false,
          data: function () {
            return ``;
          },
        },
      ],

      order: [],
      lengthChange: false,
      pageLength: 10,

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
          .css({ "border-bottom": `0.5px solid ${borderColor}` });

        $(row).find("td:not(:first-child):not(:last-child)").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $("#myTablePop2 thead th:first-child").css({
          "padding-left": "0",
          "padding-right": "0",
          width: "58px",
          "text-align": "center",
          "vertical-align": "middle",
        });

        $("#myTablePop2 thead th:last-child").css({
          "border-left": "0.5px solid #E0E0E0",
        });

        $("#myTablePop2 thead th:first-child label").css({
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
          .css({
            "border-left": `0.5px solid ${borderColor}`,
            "padding-right": "0",
            "text-align": "right",
            position: "relative",
          });
      },

      initComplete: function () {
        const isDarkMode = document.documentElement.classList.contains("dark");
        const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

        $("#TetbiqHesabi")
          .removeClass("bg-body-bg")
          .addClass("bg-sidebar-item dark:bg-side-bar-item-dark");

        $("#myTablePop2 thead th").css({
          "padding-left": "20px",
          "padding-top": "10.5px",
          "padding-bottom": "10.5px",
        });

        $("#myTablePop2 thead th:first-child").css({
          "padding-left": "0",
          "padding-right": "0",
          width: "58px",
          "text-align": "center",
          "vertical-align": "middle",
        });

        $("#myTablePop2 thead th:last-child").css({
          "border-left": `0.5px solid ${borderColor}`,
        });

        $("#myTablePop2 thead th:first-child label").css({
          margin: "0 auto",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        });

        $("#myTablePop2 thead th.filtering").each(function () {
          $(this).html(
            '<div class="custom-header flex gap-2.5 items-center"><div>' +
              $(this).text() +
              '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
          );
        });

        console.log("initComplete: cədvəl hazırdır.");
      },

      drawCallback: function () {
        var api = this.api();
        var pageInfo = api.page.info();
        var $pagination = $("#customPagination");

        console.log("drawCallback: cari səhifə info:", pageInfo);

        if (pageInfo.pages === 0) {
          $pagination.empty();
          return;
        }

        $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
        $pagination.empty();

        $("#myTablePop2 tbody tr.spacer-row").remove();
        const colCount = $("#myTablePop2 thead th").length;
        const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
        $("#myTablePop2 tbody").prepend(spacerRow);

        const $lastRow = $("#myTablePop2 tbody tr:not(.spacer-row):last");
        $lastRow.find("td").css({ "border-bottom": "0.5px solid #E0E0E0" });
        $lastRow
          .find("td:last-child")
          .css({ "border-left": "0.5px solid #E0E0E0" });

        $pagination.append(`
          <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === 0
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
              ${
                i === pageInfo.page
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
            ${
              pageInfo.page === pageInfo.pages - 1
                ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
                : "text-messages dark:text-[#FFFFFF]"
            }" 
            ${
              pageInfo.page < pageInfo.pages - 1
                ? `onclick="changePage(${pageInfo.page + 1})"`
                : ""
            }>
            <div class="icon stratis-chevron-right"></div>
          </div>
        `);
      },
    });

    table.on("xhr.dt", function (e, settings, json) {
      console.log("xhr.dt event: DataTables xam json:", json);
    });

    $("#newCheckbox").on("change", function () {
      const isChecked = $(this).is(":checked");
      console.log("Main checkbox change:", isChecked);
      $('#myTablePop2 tbody input[type="checkbox"]').each(function () {
        $(this).prop("checked", isChecked).trigger("change");
      });
    });

    $("#customSearch").on("keyup", function () {
      console.log("customSearch input:", this.value);
      table.search(this.value).draw();
    });

    window.changePage = function (page) {
      console.log("changePage çağırıldı:", page);
      table.page(page).draw("page");
    };

    return table;
  }

  // Global table variable
  window.userPermissionTable = null;

  // Table-ı yenilə funksiyası
  window.refreshUserPermissionTable = function () {
    console.log("refreshUserPermissionTable çağırıldı");
    console.log("Mövcud table:", window.userPermissionTable);

    if ($.fn.DataTable.isDataTable("#myTablePop2")) {
      console.log("DataTable mövcuddur, reload edilir");
      $("#myTablePop2").DataTable().ajax.reload();
    } else {
      console.log("DataTable mövcud deyil, yeni yaradılır");
      window.userPermissionTable = initializeDataTable();
    }
  };

  // Səhifə yükləndikdə table-ı yaratma (söndürülür)
  // if (getPermissionId()) {
  //   window.userPermissionTable = initializeDataTable();
  // }

  // Dropdownlar
  $(document).on("click", ".dropdown-trigger", function (e) {
    e.stopPropagation();
    const rowId = $(this).data("row");
    $(".dropdown-menu").addClass("hidden");
    const $dropdown = $(`#dropdown-${rowId}`);
    $dropdown.removeClass("hidden");
    const $trigger = $(this);
    $dropdown.css({ top: "30px", right: "22px", left: "auto" });
    $trigger.parent().css("position", "relative");
    console.log("dropdown-trigger click, rowId:", rowId);
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
});

function openFilterModal() {
  let modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";
 const csrfToken = $('meta[name="csrf-token"]').attr('content');

  modal.innerHTML = `
        <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
            <div class="relative flex flex-col gap-1 pb-3">
                <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
                <p class="text-sm text-tertiary-text dark:text-tertiary-text-color-dark font-normal">Tarix aralığı qeyd edərək aktiv cihazları görə bilərsiniz</p>
                <span onclick="closeFilterModal()" class="absolute top-0 right-0 icon stratis-x-02 cursor-pointer text-sm dark:text-primary-text-color-dark"></span>
            </div>
            <form id="filterMuqavileForm" method="POST" class="flex flex-col gap-3" data-url="/muessise-info/filter-muessise-muqavile" onsubmit="return false;">
               <input type="hidden" name="_csrf" value="${csrfToken}">
            <label class="flex flex-col gap-[6px]">
                    <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
                    <div class="relative w-full">
                       <input id="startDate" name="start_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none
                        focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                        active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                        transition-all ease-out duration-300" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('startDate')" id="startCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Başlanğıc tarixini qeyd edin</span>
                    </div>
                </label>
                <label class="flex flex-col gap-[6px]">
                    <div class="relative w-full">
                      <input id="endDate" ="end_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none
                        focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                        active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                        transition-all ease-out duration-300" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('endDate')" id="endCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Son tarixi qeyd edin</span>
                    </div>
                </label>
               
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağlat</button>
                    <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
                    <button id="filterButton" type="submit" onclick=submitForm("filterMuqavile") class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
                </div>
            </form>
        </div>
    `;

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeFilterModal();
    // Sadəcə arxa fonda klik edilərsə
    closeFilterModal();
  });

  document.body.appendChild(modal);
}
$("#filterMuqavileForm").on("submit", async function (e){
  e.preventDefault();
  closeFilterModal()
  clearFilters()
});

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) input.showPicker();
  else input.focus();
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) modal.remove();
}

function clearFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("newCheckbox1").checked = false;
  document.getElementById("readCheckbox2").checked = false;
}

