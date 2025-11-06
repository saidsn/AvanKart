$(document).ready(function () {
  const myData = [
    {
      qrupName: "Sistem inzibatçısı",
      permissions: "Tam idarə",
      numberOfPersons: "12",
      start: "22.08.2023",
    },
    {
      qrupName: "Super admin",
      permissions: "Tam idarə",
      numberOfPersons: "12",
      start: "22.08.2023",
    },
    {
      qrupName: "Admin",
      permissions: "Tam idarə",
      numberOfPersons: "12",
      start: "22.08.2023",
    },
  ];

  const table = $("#myTable").DataTable({
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
                        <label for="cb-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </label>
                    `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.qrupName}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.permissions}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px]  text-messages font-normal dark:text-white">${row.numberOfPersons}</span>`;
        },
      },

      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.start}</span>`;
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
                                    <img src="../../../public/images/avankart-partner-pages-images/Polygon 1.svg"
                                         alt="polygon"
                                         class="w-[14px] h-[12px]">
                                </div>
                                <div class="relative w-[170px] h-[120px] border-[#0000001A] border-[0.5px]
                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
                                    <div class="flex items-center my-1 py-[3.5px] pl-[9px] cursor-pointer h-[28px] hover:bg-item-hover
                                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                                        <div class="icon stratis-pencil-02 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                        <span onclick="SearchId()" class="text-[13px]  font-medium text-messages disabled:text-on-surface-variant-dark">Qrup adını dəyiş</span>
                                    </div>
                                    <div class="flex items-center my-1 py-[3.5px] pl-[9px] cursor-pointer h-[28px] hover:bg-item-hover
                                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                                        <div class="icon stratis-file-edit-02 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                        <span onclick="SearchId()" class="text-[13px]  font-medium text-messages disabled:text-on-surface-variant-dark">İcazələri redaktə et</span>
                                    </div>
                                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                                    <div class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                                        ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                                        <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                                        <span onclick="deleteSubmit()" class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Qrupu sil</span>
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
      // Hover effect
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          $(this).css("background-color", "#F5F5F5");
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      // Add border to all td elements
      $(row).find("td").addClass("border-b-[.5px] border-stroke");

      $(row).find("td:not(:first-child):not(:last-child)").css({
        "padding-left": "20px",
        "text-align": "left",
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

      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });

      $("#myTable thead th:first-child label").css({
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
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Style table headers
      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });

      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Add filtering icons to headers
      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon p-2 stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
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

function deleteSubmit() {
  // Əgər modal artıq varsa, təkrar əlavə etməmək üçün sil
  const existingModal = document.getElementById("delete-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
    <div class="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50" id="delete-modal">
         <div class="relative inline-block m-7">

    <div class="relative w-[306px] h-[166px] border-[#0000001A] border-[0.5px]
        shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-menu z-0">

        <div class="flex items-center justify-center mt-[12px] ml-[12px]  w-[40px] h-[40px] cursor-pointer bg-error-hover rounded-[50%]">
            <div class="icon stratis-trash-01 !w-[14px] !h-[16px]  text-error "></div>
        </div>

        <div class=" mt-[12px] ml-[12px]  font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
            <div class="text-[15px] font-medium mb-1">Silmək </div>
            <div class="font-medium opacity-65">Qrup silmək isədiyinizə əminsiniz?</div>

          </div>

          <div class="absolute bottom-[12px] right-[12px] flex gap-[12px]">
            <button onclick="closeDeleteModal()" href="#" class=" text-[12px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[51px] !h-[25px]">Xeyr</button>
            <button onclick="confirmDelete()" href="#" class=" text-[12px] text-on-primary font-medium bg-error rounded-[50px] !w-[64px] !h-[25px]">Bəli,sil</button>
          </div>
    </div>
</div>

    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
}

// Modalı bağlamaq üçün
function closeDeleteModal() {
  const modal = document.getElementById("delete-modal");
  if (modal) modal.remove();
}

// Silməni təsdiqlə funksiyası (hazırda sadəcə bağlayır)
function confirmDelete() {
  alert("İşçi silindi."); // burada AJAX və ya API çağırışı edə bilərsən
  closeDeleteModal();
}

function OpenFilter() {
  // Əgər modal artıq varsa, təkrar əlavə etməmək üçün sil
  const existingModal = document.getElementById("filter-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
     <div id="filter-modal" class="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50">
      <div class="bg-white rounded-2xl shadow-lg mx-auto p-6 overflow-y-auto max-h-[90vh]" style="width: 494px;">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Filter</h2>
          <button onclick="closeFilter()" class="text-gray-500 hover:text-black text-xl">&times;</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">İstifadəçilər</label>
           <select class="w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative">
                <option value="">Seçim edin</option>
                          <option  value="Ramin Orucov Yaşar">Ramin Orucov Yaşar</option>
                          <option value="Tofiq Əliyev">Tofiq Əliyev</option>
                          <option value="İsa Sadiqli">İsa Sadiqli</option>
                          <option value="Əli İsmayilov">Əli İsmayilov</option>
                          <option value="Ramin Orucov Yaşar">Ramin Orucov Yaşar</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Vəzifə</label>
                <select
                  class="w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative">
                  <option>Sistem inzibatçısı</option>
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Mühasiblər</option>
               </select>

          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Səlahiyyət qrupu</label>
               <select
                  class="w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative">
                  <option>Sistem inzibatçısı</option>
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Mühasiblər</option>
               </select>

          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Cinsi</label>
            <div class="flex gap-4">
              <label class="inline-flex items-center">
                <input type="checkbox" class="form-checkbox text-primary" />
                <span class="ml-2">Kişi</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" class="form-checkbox text-primary" />
                <span class="ml-2">Qadın</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Status</label>
            <div class="flex gap-4">
              <label class="inline-flex items-center">
                <input type="checkbox" class="form-checkbox text-primary" />
                <span class="ml-2">Aktiv</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" class="form-checkbox text-primary" />
                <span class="ml-2">İşdən ayrılıb</span>
              </label>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button onclick="closeFilter()" class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Bağla</button>
          <button class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Filterləri təmizlə</button>
          <button class="px-4 py-2 rounded-lg bg-primary text-white ">Filterlə</button>
        </div>
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
}

// Modalı bağlamaq üçün
function closeFilter() {
  const modal = document.getElementById("filter-modal");
  if (modal) modal.remove();
}

const qrupElaveEt = () => {
  return `
  <div id="modal" class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-lg mx-auto p-6 overflow-y-auto max-h-[90vh]" style="width: 494px;">
      <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold mb-4">Yeni qrup</h2>
      <button onclick="modalBagla()" class="text-gray-500 hover:text-black text-xl">&times;</button>
      </div>
      
      <label class="block text-sm font-medium text-gray-700 mb-1">Qrup adı</label>
      <input type="text" placeholder="Qrup adını daxil edin"
        class="w-full mb-4 px-4 py-2 rounded-full border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary" />

      <label class="block text-sm font-medium text-gray-700 mb-1">Təsviri</label>
      <textarea placeholder="Daxil edin"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-24 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
      <div class="text-right text-xs text-gray-400 mt-1">max: 150</div>

      <div class="flex justify-end gap-2 mt-6">
        <button onclick="modalBagla()" class="px-5 py-2 rounded-full text-gray-700 font-medium hover:bg-gray-200">Ləğv et</button>
        <button class="px-5 py-2 rounded-full bg-primary text-white font-medium ">İrəli</button>
      </div>

      <button onclick="modalBagla()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">×</button>
    </div>
  </div>
  `;
};

const modalBagla = () => {
  const modal = document.getElementById("modal");
  if (modal) modal.remove();
};

const modalGoster = () => {
  document.body.insertAdjacentHTML("beforeend", qrupElaveEt());
};
