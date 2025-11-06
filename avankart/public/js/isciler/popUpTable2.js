$(document).ready(function () {
  const myData = [
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "Kişi",
      speciality: "Mühasib",
      specialitygroup: "Mühasiblər",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "İsa Sadiqli",
      email: "Kişi",
      speciality: "Mühasib",
      specialitygroup: "Mühasiblər",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Tofiq Əliyev",
      email: "Kişi",
      speciality: "Mühasib",
      specialitygroup: "Mühasiblər",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "Kişi",
      speciality: "Mühasib",
      specialitygroup: "Mühasiblər",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "İsa Sadiqli",
      email: "Kişi",
      speciality: "Mühasib",
      specialitygroup: "Mühasiblər",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Tofiq Əliyev",
      email: "Kişi",
      speciality: "Mühasib",
      specialitygroup: "Mühasiblər",
      phone: "+994 50 770 35 22",
    },
  ];

  const table = $("#myTableIshciPop").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: myData,
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
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white text-left">${row.id}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.email}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.speciality}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.specialitygroup}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.phone}</span>`;
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
          $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6"); // Dark üçün ağ, Light üçün qara şəffaf fon
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
          position: "relative", // Important for dropdown positioning
        });
    },

    initComplete: function () {
      $("#myTablePopPop thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Style table headers
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
       var api = this.api();

  // İlk 3 sətrin checkboxlarını check elə
  api.rows({ page: 'current' }).every(function (rowIdx, tableLoop, rowLoop) {
    if (rowIdx < 3) {
      $(this.node())
        .find('input[type="checkbox"]')
        .prop('checked', true)
        .trigger('change');
    }
  });

      // Update page count display
      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      // Add spacer row
      $("#myTablePop tbody tr.spacer-row").remove();
      const colCount = $("#myTablePop thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTablePop tbody").prepend(spacerRow);

      // Style the last row
      const $lastRow = $("#myTablePop tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });
      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });

      // Create pagination
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

  // Handle main checkbox click
  $("#newCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $('#myTablePop tbody input[type="checkbox"]').each(function () {
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
  // $(document).on("click", ".dropdown-trigger", function (e) {
  //   e.stopPropagation();
  //   const rowId = $(this).data("row");

  //   // Hide all other dropdowns first
  //   $(".dropdown-menu").addClass("hidden");

  //   // Show this dropdown
  //   const $dropdown = $(`#dropdown-${rowId}`);
  //   $dropdown.removeClass("hidden");

  //   // Position the dropdown menu correctly
  //   const $trigger = $(this);

  //   // Position the dropdown relative to its parent cell
  //   $dropdown.css({
  //     top: "30px", // Position it directly below the trigger
  //     right: "22px", // Align to right edge of the cell
  //     left: "auto", // Clear any left positioning
  //   });

  //   // Make the parent cell position relative to contain the absolute dropdown
  //   $trigger.parent().css("position", "relative");
  // });

  // Close dropdown when clicking elsewhere
  // $(document).on("click", function () {
  //   $(".dropdown-menu").addClass("hidden");
  // });

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

function openFilterModal() {
  let modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";

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
                    <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağlat</button>
                    <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
                    <button type="submit" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
                </div>
            </form>
        </div>
    `;

  // **Modalın fonuna klik edildikdə bağlanma**
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      // Sadəcə arxa fonda klik edilərsə
      closeFilterModal();
    }
  });

  document.body.appendChild(modal);
}

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); // Alternativ həll
  }
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}

function clearFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("newCheckbox1").checked = false;
  document.getElementById("readCheckbox2").checked = false;
}
