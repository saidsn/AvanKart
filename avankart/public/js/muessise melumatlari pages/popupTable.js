$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  let table = null;

  function initializeTable() {
    if (table) {
      table.destroy();
      $("#myTablePop").empty();
    }

    table = $("#myTablePop").DataTable({
      paging: true,
      info: false,
      dom: "t",
      ajax: {
        url: "/muessise-info/users",
        type: "POST",
        headers: {
          "CSRF-Token": csrfToken,
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
            return `
                        <input type="checkbox" id="cb-${idx}" class="peer hidden" data-user-id="${
              row.id || row._id
            }">
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
                                <span class="text-messages text-[13px] font-medium dark:text-white">${
                                  row.name
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
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${
              row.duty_name || row.speciality
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
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${
              row.permission_name || row.group
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
  });

  $(document).on("change", "#newCheckbox", function () {
    const isChecked = $(this).is(":checked");
    $('#myTablePop tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
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
      $('#myTablePop tbody input[type="checkbox"]:checked').each(function () {
        const row = $(this).closest("tr");
        const table = $("#myTablePop").DataTable();
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
        "myTablePop",
        "userHiddenInputsForPermission"
      );

      if (success) {
        const selectedCount = $(
          '#myTablePop tbody input[type="checkbox"]:checked'
        ).length;
        if (selectedCount > 0) {
          showSuccessToast(`${selectedCount} istifadəçi qrupa əlavə edildi`);
        }
      }

      closeUsersPopup();
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

  window.openUsersPopup = function () {
    let popup = document.createElement("div");
    popup.id = "usersPopupModal";
    popup.className =
      "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-[1000]";

    popup.innerHTML = `
      <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[90%] max-w-[1000px] max-h-[90vh] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative overflow-hidden">
        <div class="relative flex flex-col gap-1 pb-3">
          <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">İstifadəçi seç</h2>
          <p class="text-sm text-tertiary-text dark:text-tertiary-text-color-dark font-normal">Qrupa əlavə etmək istədiyiniz istifadəçiləri seçin</p>
          <span onclick="closeUsersPopup()" class="absolute top-0 right-0 icon stratis-x-02 cursor-pointer text-sm dark:text-primary-text-color-dark"></span>
        </div>
        
        <div class="flex flex-col gap-4">
          <!-- Search və controls -->
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <input id="customSearch" type="text" placeholder="Axtar..." class="w-full px-3 py-2 border border-stroke dark:border-[#FFFFFF1A] rounded-lg bg-menu dark:bg-menu-dark text-messages dark:text-white">
            </div>
            <button onclick="clearFilters()" class="text-[13px] font-medium py-2 px-4 bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-lg cursor-pointer">
              Filteri təmizlə
            </button>
          </div>
          
          <!-- Table container -->
          <div class="overflow-auto max-h-[400px]">
            <table id="myTablePop" class="w-full">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" id="newCheckbox" class="peer hidden">
                    <label for="newCheckbox" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition dark:border-surface-variant-dark dark:text-side-bar-item-dark dark:peer-checked:bg-primary-dark dark:peer-checked:text-on-primary-dark dark:peer-checked:border-primary-dark dark:bg-[#161E22]">
                      <div class="icon stratis-check-01 scale-60"></div>
                    </label>
                  </th>
                  <th class="filtering">Ad</th>
                  <th class="filtering">Cins</th>
                  <th class="filtering">Vəzifə</th>
                  <th class="filtering">Telefon</th>
                  <th class="filtering">Qrup</th>
                  <th></th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="flex items-center justify-between">
            <div id="pageCount" class="text-sm text-tertiary-text dark:text-tertiary-text-color-dark">1 / 1</div>
            <div id="customPagination" class="flex items-center gap-2"></div>
          </div>
          
          <!-- Action buttons -->
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeUsersPopup()">Bağla</button>
            <button onclick="addToGroup()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Qrupa əlavə et</button>
          </div>
        </div>
      </div>
    `;

    popup.addEventListener("click", function (event) {
      if (event.target === popup) {
        closeUsersPopup();
      }
    });

    document.body.appendChild(popup);

    setTimeout(() => {
      initializeTable();
    }, 100);
  };

  window.closeUsersPopup = function () {
    let popup = document.getElementById("usersPopupModal");
    if (popup) {
      popup.remove();
    }
  };
});

function openFilterModal() {
  let modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-[1100]";

  modal.innerHTML = `
        <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
            <div class="relative flex flex-col gap-1 pb-3">
                <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
                <p class="text-sm text-tertiary-text dark:text-tertiary-text-color-dark font-normal">Tarix aralığı qeyd edərək aktiv cihazları görə bilərsiniz</p>
                <span onclick="closeFilterModal()" class="absolute top-0 right-0 icon stratis-x-02 cursor-pointer text-sm dark:text-primary-text-color-dark"></span>
            </div>
            <form class="flex flex-col gap-3">
                <label class="flex flex-col gap-[6px]">
                    <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
                    <div class="relative w-full">
                       <input id="startDate" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none
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
                      <input id="endDate" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none
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
                    <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağla</button>
                    <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
                    <button type="submit" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
                </div>
            </form>
        </div>
    `;

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeFilterModal();
    }
  });

  const handleEscapeKey = function (event) {
    if (event.key === "Escape") {
      closeFilterModal();
      document.removeEventListener("keydown", handleEscapeKey);
    }
  };
  document.addEventListener("keydown", handleEscapeKey);

  document.body.appendChild(modal);
}

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); 
  }
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}

function clearFilters() {
  const startDateEl = document.getElementById("startDate");
  const endDateEl = document.getElementById("endDate");
  const newCheckbox1El = document.getElementById("newCheckbox1");
  const readCheckbox2El = document.getElementById("readCheckbox2");

  if (startDateEl) startDateEl.value = "";
  if (endDateEl) endDateEl.value = "";
  if (newCheckbox1El) newCheckbox1El.checked = false;
  if (readCheckbox2El) readCheckbox2El.checked = false;

  $('#myTablePop tbody input[type="checkbox"]').each(function () {
    $(this).prop("checked", false).trigger("change");
  });

  $("#newCheckbox").prop("checked", false);

  const customSearchEl = document.getElementById("customSearch");
  if (customSearchEl) customSearchEl.value = "";
}
