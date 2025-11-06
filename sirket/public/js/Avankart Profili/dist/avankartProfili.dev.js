"use strict";

$(document).ready(function () {
  var myData = [{
    name: "Ramin Orucov",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "12.02.2023",
    status: "Aktiv"
  }, {
    name: "Turan Əliyev",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "12.05.2023",
    status: "Aktiv"
  }, {
    name: "Ramin Orucov",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "22.08.2023",
    status: "Aktiv"
  }, {
    name: "Turan Əliyev",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "25.08.2023",
    status: "Aktiv"
  }, {
    name: "Ramin Orucov",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "10.04.2023",
    status: "Aktiv"
  }, {
    name: "Ramin Orucov",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "11.07.2023",
    status: "Aktiv"
  }, {
    name: "Turan Əliyev",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "16.02.2023",
    status: "Aktiv"
  }, {
    name: "Ramin Orucov",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "12.02.2023",
    status: "Aktiv"
  }, {
    name: "Turan Əliyev",
    id: "PA-XXXXXX",
    gender: "Kişi",
    position: "Mühasib",
    AuthorityGroup: "Sistem inzibatçısı",
    email: "ramin.orucvvv@gmail.com",
    phone: "+994 50 770 35 22",
    start: "12.02.2023",
    status: "Aktiv"
  }];
  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: myData,
    columns: [{
      orderable: false,
      data: function data(row, type, set, meta) {
        var idx = meta.row;
        return "\n                        <input type=\"checkbox\" id=\"cb-".concat(idx, "\" class=\"peer hidden\">\n                        <label for=\"cb-").concat(idx, "\" class=\"cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition\">\n                            <div class=\"icon stratis-check-01 scale-60\"></div>\n                        </label>\n                    ");
      }
    }, {
      data: function data(row) {
        return "\n                        <div class=\"flex items-center gap-3\">\n                            <div class=\"w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold\">\n                                ".concat(row.name.split(" ").map(function (w) {
          return w[0];
        }).join(""), "\n                            </div>\n                            <div class=\"flex flex-col\">\n                                <span class=\"text-messages text-[13px] font-medium dark:text-white\">").concat(row.name, "</span>\n                               \n                            </div>\n                        </div>\n                    ");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages font-normal dark:text-white\">".concat(row.gender, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages font-normal dark:text-white\">".concat(row.position, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages font-normal dark:text-white\">".concat(row.AuthorityGroup, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages font-normal dark:text-white\">".concat(row.email, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages  font-normal dark:text-white\">".concat(row.phone, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages font-normal dark:text-white\">".concat(row.start, "</span>");
      }
    }, {
      data: function data(row) {
        var color = "";

        switch (row.status) {
          case "Aktiv":
            color = "bg-[#4FC3F7]"; // mavi

            break;

          case "Qaralama":
            color = "bg-[#BDBDBD]"; // boz

            break;

          case "Tamamlandı":
            color = "bg-[#66BB6A]"; // yaşıl

            break;

          case "Gözləyir":
            color = "bg-[#FFCA28]"; // sarı

            break;

          case "Report edildi":
            color = "bg-[#EF5350]"; // qırmızı

            break;

          default:
            color = "bg-[#FF7043]";
          // narıncı (digər)
        }

        return "\n             <div class=\"flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis\">\n                <span class=\"w-[6px] h-[6px] rounded-full ".concat(color, " shrink-0 mr-2\"></span>\n                <span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-medium\">").concat(row.status, "</span>\n            </div>\n            ");
      }
    }, {
      orderable: false,
      data: function data(row, type, set, meta) {
        var idx = meta.row;
        return "\n                        <div class=\"text-base flex items-center cursor-pointer dropdown-trigger\" data-row=\"".concat(idx, "\">\n                            <div class=\"icon stratis-dot-vertical text-messages w-5 h-5 dark:text-white\"></div>\n                            <div class=\"dropdown-menu hidden absolute z-50\" id=\"dropdown-").concat(idx, "\">\n                                <div class=\"absolute top-[-11.5px] right-[0px] transform -translate-x-1/2 z-10\">\n                                    <img src=\"../../../public/images/avankart-partner-pages-images/Polygon 1.svg\"\n                                         alt=\"polygon\"\n                                         class=\"w-[14px] h-[12px]\">\n                                </div>\n                                <div class=\"relative w-[150px] h-[74px] border-[#0000001A] border-[0.5px]\n                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0\">\n                                    <div class=\"flex items-center my-1 py-[3.5px] pl-[9px] cursor-pointer h-[28px] hover:bg-item-hover\n                                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action\">\n                                        <div class=\"icon stratis-pencil-02 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark\"></div>\n                                        <span onclick=\"showEditModal()\" class=\"text-[13px]  font-medium text-messages disabled:text-on-surface-variant-dark\">Redakt\u0259 et</span>\n                                    </div>\n                                    <div class=\"h-[0.5px] bg-[#0000001A]\"></div>\n                                    <div class=\"flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition\n                                        ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action\">\n                                        <div class=\"icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark\"></div>\n                                        <span onclick=\"deleteSubmit()\" class=\"text-[13px] text-error font-medium disabled:text-on-surface-variant-dark\">Hovuzdan \xE7\u0131xart</span>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    ");
      }
    }],
    order: [],
    lengthChange: false,
    pageLength: 10,
    createdRow: function createdRow(row, data, dataIndex) {
      // Hover effect
      $(row).css("transition", "background-color 0.2s ease").on("mouseenter", function () {
        $(this).css("background-color", "#F5F5F5");
      }).on("mouseleave", function () {
        $(this).css("background-color", "");
      }); // Add border to all td elements

      $(row).find("td").addClass("border-b-[.5px] border-stroke");
      $(row).find("td:not(:first-child):not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px"
      });
      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle"
      });
      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0"
      });
      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center"
      }); // Style first cell (checkbox)

      $(row).find("td:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "48px",
        "text-align": "center"
      }); // Center checkbox label

      $(row).find("td:first-child label").css({
        margin: "0",
        display: "inline-flex",
        "justify-content": "center",
        "align-items": "center"
      }); // Style last cell (three dots)

      $(row).find("td:last-child").addClass("border-l-[.5px] border-stroke").css({
        "padding-right": "0",
        "text-align": "right",
        position: "relative" // Important for dropdown positioning

      });
    },
    initComplete: function initComplete() {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px"
      }); // Style table headers

      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle"
      });
      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0"
      });
      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center"
      }); // Add filtering icons to headers

      $("#myTable thead th.filtering").each(function () {
        $(this).html('<div class="custom-header flex gap-2.5 items-center"><div>' + $(this).text() + '</div><div class="icon p-2 stratis-sort-vertical-02 mt-1 text-messages"></div></div>');
      });
    },
    drawCallback: function drawCallback() {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination");

      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      } // Update page count display


      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty(); // Add spacer row

      $("#myTable tbody tr.spacer-row").remove();
      var colCount = $("#myTable thead th").length;
      var spacerRow = "<tr class=\"spacer-row\"><td colspan=\"".concat(colCount, "\" style=\"height:12px; padding:0; border:none;\"></td></tr>");
      $("#myTable tbody").prepend(spacerRow); // Style the last row

      var $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0"
      });
      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid #E0E0E0"
      }); // Create pagination

      $pagination.append("\n                <div class=\"flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ".concat(pageInfo.page === 0 ? "opacity-50 cursor-not-allowed" : "text-messages", "\"\n                    onclick=\"changePage(").concat(Math.max(0, pageInfo.page - 1), ")\">\n                    <div class=\"icon stratis-chevron-left !h-[12px] !w-[7px]\"></div>\n                </div>\n            "));
      var paginationButtons = '<div class="flex gap-2">';

      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += "\n                    <button class=\"cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages\n                            ".concat(i === pageInfo.page ? "bg-[#F6D9FF] text-messages" : "bg-transparent text-tertiary-text", "\"\n                            onclick=\"changePage(").concat(i, ")\">").concat(i + 1, "</button>\n                ");
      }

      paginationButtons += "</div>";
      $pagination.append(paginationButtons);
      $pagination.append("\n                <div class=\"flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ".concat(pageInfo.page === pageInfo.pages - 1 ? "opacity-50 cursor-not-allowed" : "text-tertiary-text", "\"\n                    onclick=\"changePage(").concat(Math.min(pageInfo.pages - 1, pageInfo.page + 1), ")\">\n                    <div class=\"icon stratis-chevron-right !h-[12px] !w-[7px]\"></div>\n                </div>\n            "));
    }
  }); // Handle main checkbox click

  $("#newCheckbox").on("change", function () {
    var isChecked = $(this).is(":checked");
    $('#myTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  }); // Handle search input

  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
  }); // Page change function

  window.changePage = function (page) {
    table.page(page).draw("page");
  }; // Handle dropdown menu clicks
  // Handle dropdown menu clicks


  $(document).on("click", ".dropdown-trigger", function (e) {
    e.stopPropagation();
    var rowId = $(this).data("row"); // Hide all other dropdowns first

    $(".dropdown-menu").addClass("hidden"); // Show this dropdown

    var $dropdown = $("#dropdown-".concat(rowId));
    $dropdown.removeClass("hidden"); // Position the dropdown menu correctly

    var $trigger = $(this); // Position the dropdown relative to its parent cell

    $dropdown.css({
      top: "30px",
      // Position it directly below the trigger
      right: "22px",
      // Align to right edge of the cell
      left: "auto" // Clear any left positioning

    }); // Make the parent cell position relative to contain the absolute dropdown

    $trigger.parent().css("position", "relative");
  }); // Close dropdown when clicking elsewhere

  $(document).on("click", function () {
    $(".dropdown-menu").addClass("hidden");
  }); // Handle "Aç" (Open) button click

  $(document).on("click", ".open-action", function (e) {
    e.stopPropagation();
    var rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1]; // Add your "open" action here

    console.log("Open action for row ".concat(rowId));
    $(".dropdown-menu").addClass("hidden");
  }); // Handle "Cihazı sil" (Delete device) button click

  $(document).on("click", ".delete-action", function (e) {
    e.stopPropagation();
    var rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1]; // Add your "delete" action here

    console.log("Delete action for row ".concat(rowId));
    $(".dropdown-menu").addClass("hidden");
  }); // Prevent dropdown from closing when clicking inside it

  $(document).on("click", ".dropdown-menu", function (e) {
    e.stopPropagation();
  });
});

function deleteSubmit() {
  // Əgər modal artıq varsa, təkrar əlavə etməmək üçün sil
  var existingModal = document.getElementById("delete-modal");

  if (existingModal) {
    existingModal.remove();
  }

  var modalHTML = "\n    <div class=\"fixed inset-0  bg-opacity-30 flex items-center justify-center z-50\" id=\"delete-modal\">\n        <div class=\"relative inline-block m-7\">\n\n        <div class=\"relative w-[306px] h-[187px] border-[#0000001A] border-[0.5px]\n            shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-menu z-0\">\n\n            <div class=\"flex items-center justify-center mt-[12px] ml-[12px]  w-[40px] h-[40px] cursor-pointer bg-error-hover rounded-[50%]\">\n                <div class=\"icon iconex-trash-can-1 w-[14px] h-[17px]  text-error \"></div>\n            </div>\n\n            <div class=\"flex flex-wrap mt-[12px] ml-[12px] gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100\">\n                <span class=\"text-[15px] font-medium\">\u0130\u015F\xE7ini silm\u0259k ist\u0259diyiniz\u0259 \u0259minsiniz?</span>\n                <span class=\"font-medium opacity-65\">Silin\u0259n i\u015F\xE7il\u0259r \"</span>\n                <span>\u0130\u015Fd\u0259 ayr\u0131lan</span>\n                <span class=\"font-medium opacity-65\">\u201D s\u0259hif\u0259sind\u0259</span>\n\n                <span class=\"font-medium opacity-65\">saxlan\u0131lacaq</span>\n              </div>\n\n              <div class=\"absolute bottom-[12px] right-[12px] flex gap-[12px]\">\n                <button onclick=\"closeDeleteModal()\" href=\"#\" class=\" text-[12px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[51px] !h-[25px]\">Xeyr</button>\n                <button onclick=\"confirmDelete()\" href=\"#\" class=\" text-[12px] text-on-primary font-medium bg-error rounded-[50px] !w-[64px] !h-[25px]\">B\u0259li,sil</button>\n              </div>\n        </div>\n    </div>\n    </div>\n  ";
  var container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
} // Modalı bağlamaq üçün


function closeDeleteModal() {
  var modal = document.getElementById("delete-modal");
  if (modal) modal.remove();
} // Silməni təsdiqlə funksiyası (hazırda sadəcə bağlayır)


function confirmDelete() {
  // Əvvəlki modal varsa sil
  var existing = document.getElementById("customModal");
  if (existing) existing.remove(); // Modalı yarat

  var modal = document.createElement("div");
  modal.id = "customModal";
  modal.style.opacity = "0";
  modal.className = "\n    fixed top-[20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 \n    bg-gray-100 rounded-full px-4 py-2 shadow-lg flex items-center justify-between \n    w-fit z-50 transition-opacity duration-300 ease-out\n  "; // SVG progress dairəsi + saniyə sayı

  modal.innerHTML = "\n    <div class=\"relative w-10 h-10\">\n      <svg class=\"absolute top-0 left-0 w-10 h-10 transform -rotate-90\" viewBox=\"0 0 36 36\">\n        <path\n          id=\"progressCircle\"\n          d=\"M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32\"\n          fill=\"none\"\n          stroke=\"#22c55e\"\n          stroke-width=\"4\"\n          stroke-linecap=\"round\"\n          stroke-dasharray=\"100\"\n          stroke-dashoffset=\"0\"\n        />\n      </svg>\n      <div id=\"countdownText\" class=\"absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800\">\n        10\n      </div>\n    </div>\n    <span class=\"ml-3 text-gray-600 text-sm\">\u0130stifad\u0259\xE7i hovuzdan \xE7\u0131xar\u0131ld\u0131</span>\n    <button onclick=\"restoreUser()\" class=\"flex items-center ml-4 text-sm text-gray-700 hover:text-black transition\">\n      <svg class=\"w-4 h-4 mr-1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\">\n        <path d=\"M3 10h11M3 6h11M3 14h7M21 10l-6-6m0 0l6 6m-6-6v12\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n      </svg>\n      Geri qaytar\n    </button>\n  "; // Body-yə əlavə et

  document.body.appendChild(modal); // Görünüşə gətir

  requestAnimationFrame(function () {
    modal.style.opacity = "1";
  }); // Sayğac və proqress

  var seconds = 10;
  var textEl = document.getElementById("countdownText");
  var progressEl = document.getElementById("progressCircle"); // Progress üçün toplam dash uzunluğu

  var totalLength = 100;
  var countdownInterval = setInterval(function () {
    seconds--;
    if (textEl) textEl.textContent = seconds; // Proqress azaldılır (0 → 100)

    if (progressEl) {
      var offset = seconds / 10 * totalLength;
      progressEl.setAttribute("stroke-dashoffset", "".concat(100 - offset));
    }

    if (seconds <= 0) {
      clearInterval(countdownInterval);
      modal.remove();
    }
  }, 1000); // Başlanğıcda 0 offset ilə tərsinə animasiya

  if (progressEl) {
    progressEl.setAttribute("stroke-dasharray", "".concat(totalLength));
    progressEl.setAttribute("stroke-dashoffset", "0");
  } // Scroll effekti (vizual)


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function restoreUser() {
  var modal = document.getElementById("customModal");
  if (modal) modal.remove();
  alert("İstifadəçi geri qaytarıldı!");
}

function OpenFilter() {
  // Əgər modal artıq varsa, təkrar əlavə etməmək üçün sil
  var existingModal = document.getElementById("filter-modal");

  if (existingModal) {
    existingModal.remove();
  }

  var modalHTML = "\n     <div id=\"filter-modal\" class=\"fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50\">\n      <div class=\"bg-white rounded-2xl shadow-lg mx-auto p-6 overflow-y-auto max-h-[90vh]\" style=\"width: 494px;\">\n        <div class=\"flex justify-between items-center mb-4\">\n          <h2 class=\"text-lg font-semibold\">Filter</h2>\n          <button onclick=\"closeFilter()\" class=\"text-gray-500 hover:text-black text-xl\">&times;</button>\n        </div>\n\n        <div class=\"space-y-4\">\n          <div>\n            <label class=\"block text-sm font-medium mb-1\">\u0130stifad\u0259\xE7il\u0259r</label>\n           <select class=\"w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative\">\n                <option value=\"\">Se\xE7im edin</option>\n                          <option  value=\"Ramin Orucov Ya\u015Far\">Ramin Orucov Ya\u015Far</option>\n                          <option value=\"Tofiq \u018Fliyev\">Tofiq \u018Fliyev</option>\n                          <option value=\"\u0130sa Sadiqli\">\u0130sa Sadiqli</option>\n                          <option value=\"\u018Fli \u0130smayilov\">\u018Fli \u0130smayilov</option>\n                          <option value=\"Ramin Orucov Ya\u015Far\">Ramin Orucov Ya\u015Far</option>\n            </select>\n          </div>\n\n          <div>\n            <label class=\"block text-sm font-medium mb-1\">V\u0259zif\u0259</label>\n                <select\n                  class=\"w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative\">\n                  <option>Sistem inzibat\xE7\u0131s\u0131</option>\n                  <option>Super Admin</option>\n                  <option>Admin</option>\n                  <option>M\xFChasibl\u0259r</option>\n               </select>\n\n          </div>\n\n          <div>\n            <label class=\"block text-sm font-medium mb-1\">S\u0259lahiyy\u0259t qrupu</label>\n               <select\n                  class=\"w-full rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-8 text-gray-800 text-base font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 appearance-none relative\">\n                  <option>Sistem inzibat\xE7\u0131s\u0131</option>\n                  <option>Super Admin</option>\n                  <option>Admin</option>\n                  <option>M\xFChasibl\u0259r</option>\n               </select>\n\n          </div>\n\n          <div>\n            <label class=\"block text-sm font-medium mb-1\">Cinsi</label>\n            <div class=\"flex gap-4\">\n              <label class=\"inline-flex items-center\">\n                <input type=\"checkbox\" class=\"form-checkbox text-primary\" />\n                <span class=\"ml-2\">Ki\u015Fi</span>\n              </label>\n              <label class=\"inline-flex items-center\">\n                <input type=\"checkbox\" class=\"form-checkbox text-primary\" />\n                <span class=\"ml-2\">Qad\u0131n</span>\n              </label>\n            </div>\n          </div>\n\n          <div>\n            <label class=\"block text-sm font-medium mb-1\">Status</label>\n            <div class=\"flex gap-4\">\n              <label class=\"inline-flex items-center\">\n                <input type=\"checkbox\" class=\"form-checkbox text-primary\" />\n                <span class=\"ml-2\">Aktiv</span>\n              </label>\n              <label class=\"inline-flex items-center\">\n                <input type=\"checkbox\" class=\"form-checkbox text-primary\" />\n                <span class=\"ml-2\">\u0130\u015Fd\u0259n ayr\u0131l\u0131b</span>\n              </label>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"mt-6 flex justify-end gap-2\">\n          <button onclick=\"closeFilter()\" class=\"px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200\">Ba\u011Fla</button>\n          <button class=\"px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200\">Filterl\u0259ri t\u0259mizl\u0259</button>\n          <button class=\"px-4 py-2 rounded-lg bg-primary text-white \">Filterl\u0259</button>\n        </div>\n      </div>\n    </div>\n  ";
  var container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
} // Modalı bağlamaq üçün


function closeFilter() {
  var modal = document.getElementById("filter-modal");
  if (modal) modal.remove();
}