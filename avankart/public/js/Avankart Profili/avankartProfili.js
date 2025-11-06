$(document).ready(function () {
  const table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: [],
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
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.position}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.AuthorityGroup}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.email}</span>`;
        },
      },

      {
        data: function (row) {
          return `<span class="text-[13px] text-messages  font-normal dark:text-white">${row.phone}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.start}</span>`;
        },
      },
      {
        data: function (row) {
          let color = "";
          switch (row.status) {
            case "Aktiv":
              color = "bg-[#4FC3F7]";
              break;
            case "Qaralama":
              color = "bg-[#BDBDBD]";
              break;
            case "Tamamlandı":
              color = "bg-[#66BB6A]";
              break;
            case "Gözləyir":
              color = "bg-[#FFCA28]";
              break;
            case "Report edildi":
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
                                <div class="relative w-[150px] h-[74px] border-[#0000001A] border-[0.5px]
                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
                                    <div class="flex items-center my-1 py-[3.5px] pl-[9px] cursor-pointer h-[28px] hover:bg-item-hover
                                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                                        <div class="icon stratis-pencil-02 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                        <span onclick="showEditModal()" class="text-[13px]  font-medium text-messages disabled:text-on-surface-variant-dark">Redaktə et</span>
                                    </div>
                                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                                    <div class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                                        ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                                        <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                                        <span onclick="deleteSubmit()" class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Hovuzdan çıxart</span>
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

      $(row).find("td").addClass("border-b-[.5px] border-stroke");

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
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
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

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      $("#myTable tbody tr.spacer-row").remove();
      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });
      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });

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

  $("#newCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");
    $('#myTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  window.changePage = function (page) {
    table.page(page).draw("page");
  };

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
    $(".dropdown-menu").addClass("hidden");
  });

  $(document).on("click", ".delete-action", function (e) {
    e.stopPropagation();
    const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
    $(".dropdown-menu").addClass("hidden");
  });

  $(document).on("click", ".dropdown-menu", function (e) {
    e.stopPropagation();
  });
});

function deleteSubmit() {
  const existingModal = document.getElementById("delete-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
    <div class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50" id="delete-modal">
        <div class="relative inline-block m-7">

        <div class="relative w-[306px] h-[187px] border-[#0000001A] border-[0.5px]
            shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-menu z-0">

            <div class="flex items-center justify-center mt-[12px] ml-[12px]  w-[40px] h-[40px] cursor-pointer bg-error-hover rounded-[50%]">
                <div class="icon iconex-trash-can-1 w-[14px] h-[17px]  text-error "></div>
            </div>

            <div class="flex flex-wrap mt-[12px] ml-[12px] gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
                <span class="text-[15px] font-medium">İşçini silmək istədiyinizə əminsiniz?</span>
                <span class="font-medium opacity-65">Silinən işçilər "</span>
                <span>İşdə ayrılan</span>
                <span class="font-medium opacity-65">” səhifəsində</span>

                <span class="font-medium opacity-65">saxlanılacaq</span>
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

function closeDeleteModal() {
  const modal = document.getElementById("delete-modal");
  if (modal) modal.remove();
}

function confirmDelete() {
  const existing = document.getElementById("customModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "customModal";
  modal.style.opacity = "0";

  modal.className = `
    fixed top-[20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
    bg-gray-100 rounded-full px-4 py-2 shadow-lg flex items-center justify-between 
    w-fit z-50 transition-opacity duration-300 ease-out
  `;

  modal.innerHTML = `
    <div class="relative w-10 h-10">
      <svg class="absolute top-0 left-0 w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
        <path
          id="progressCircle"
          d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32"
          fill="none"
          stroke="#22c55e"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="100"
          stroke-dashoffset="0"
        />
      </svg>
      <div id="countdownText" class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800">
        10
      </div>
    </div>
    <span class="ml-3 text-gray-600 text-sm">İstifadəçi hovuzdan çıxarıldı</span>
    <button onclick="restoreUser()" class="flex items-center ml-4 text-sm text-gray-700 hover:text-black transition">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 10h11M3 6h11M3 14h7M21 10l-6-6m0 0l6 6m-6-6v12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Geri qaytar
    </button>
  `;

  document.body.appendChild(modal);

  requestAnimationFrame(() => {
    modal.style.opacity = "1";
  });

  let seconds = 10;
  const textEl = document.getElementById("countdownText");
  const progressEl = document.getElementById("progressCircle");

  const totalLength = 100;

  const countdownInterval = setInterval(() => {
    seconds--;

    if (textEl) textEl.textContent = seconds;

    if (progressEl) {
      const offset = (seconds / 10) * totalLength;
      progressEl.setAttribute("stroke-dashoffset", `${100 - offset}`);
    }

    if (seconds <= 0) {
      clearInterval(countdownInterval);
      modal.remove();
    }
  }, 1000);

  if (progressEl) {
    progressEl.setAttribute("stroke-dasharray", `${totalLength}`);
    progressEl.setAttribute("stroke-dashoffset", "0");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function restoreUser() {
  const modal = document.getElementById("customModal");
  if (modal) modal.remove();
  alert("İstifadəçi geri qaytarıldı!");
}

function OpenFilter() {
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

function closeFilter() {
  const modal = document.getElementById("filter-modal");
  if (modal) modal.remove();
}
