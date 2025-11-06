function openCard(kartId) {
  window.location.href = `/imtiyazlar/kartlar/${kartId}`;
}
// Bu değişkeni, jQuery'nin scope'u dışında da kullanıldığından emin olmak için var/const/let kullanmak yerine
// doğrudan document.ready içindeki yerel scope'ta tanımlayabilirsiniz, ancak let kullanmanız doğru.
const csrfToken = $('meta[name="csrf-token"]').attr("content");
let dataTable = null;

function confirmCardActivation(cardId) {
  const existingModal = document.getElementById("activeCardModal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "activeCardModal";
  modal.className =
    "fixed inset-0 bg-[#0000002A] flex items-center justify-center z-100";

  modal.innerHTML = `
    <div class="bg-white p-6 rounded-lg w-[300px] flex flex-col gap-4">
      <div class="w-full flex">
        <div class="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-gray-100 ">
          <i class="text-md icon stratis-file-check-01 w-[18px] h-[18px] font-extrabold delete-condition"></i>
        </div>
      </div>
      <div class="w-full flex flex-col gap-1">
        <h2 class="text-lg">Aktiv et</h2>
        <p class=" max-w-[80%] text-sm text-gray-400">Müəssisəni aktivləşdirmək istədiyinizə əminsiniz?</p>
      </div>
      <div class="w-full flex justify-end">
        <button id="cancelDelete" class="text-black px-4 py-1 ">Xeyr</button>
        <button id="confirmDelete" class="bg-green-500 text-white px-4 py-1 rounded-3xl">Bəli, təsdiqlə</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Accept butonu
  document.getElementById("confirmDelete").onclick = function () {
    updateCardStatus(cardId, "active");
    modal.remove();
  };

  // Cancel butonu
  document.getElementById("cancelDelete").onclick = function () {
    modal.remove();
  };
}

function updateCardStatus(id, status) {
  $.ajax({
    url: `/imtiyazlar/kartlar/${id}/status`,
    type: "PUT",
    contentType: "application/json",
    dataType: "json",
    headers: {
      "CSRF-Token": csrfToken,
    },
    data: JSON.stringify({ status }),
    success: function (response) {
      if (response.success) {
        dataTable.ajax.reload(null, false);
        closeDeactivateModal();
      } else {
        console.error("Error: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error updating card status: " + error);
    },
  });
}

let editCardId = null;

function openCardPopupForUpdate(cardId) {
  submitUpdateBtn.setAttribute("data-card-id", cardId);

  $.ajax({
    url: `/imtiyazlar/kartlar/card-data/${cardId}`,
    type: "GET",
    dataType: "json",
    success: function (result) {
      if (!result.success) {
        console.error("Card fetch error:", result.message);
        return;
      }

      const card = result.data;

      // Update popup title and buttons
      $("#cardCreateUpdateTitle").text("Redaktə et");
      $(submitUpdateBtn).removeClass("hidden");
      $(submitCreateBtn).addClass("hidden");

      // Fill form inputs
      $("#newCardName").val(card.name);
      $("#newCardDescription").val(card.description);
      $("#bgColorForCard").css("background-color", card.background_color);
      $("#iconImgForCard").attr("src", `/icons/${card.icon}.svg`);
      selectedIcon = card.icon;
      editCardId = cardId;

      // Additional UI updates
      toggleSorgu();
    },
    error: function (xhr, status, error) {
      console.error("AJAX error fetching card:", error);
    },
  });
}

$(document).ready(function () {
  $("#refreshTableBtn, #refreshTableIcon").on("click", function (e) {
    e.preventDefault();
    if (dataTable) {
      dataTable.ajax.reload(function () {}, true);
    }
    return false;
  });

  function initializeDataTable() {
    // Hata almamızın sebebi olan manuel yok etme bloğunu kaldırıyoruz
    // çünkü 'destroy: true' DataTables'ın yeni bir tablo oluşturmadan önce
    // mevcut tabloyu otomatik olarak yok etmesini sağlar.

    // if ($.fn.DataTable.isDataTable("#myTable")) {
    //   dataTable.destroy();
    // }

    dataTable = $("#myTable").DataTable({
      // Hata çözümü için anahtar: Yeniden başlatmaya izin verir
      destroy: true,

      ajax: {
        url: "/imtiyazlar/kartlar/formatted-data",
        type: "GET",
        dataType: "json",
        headers: {
          "CSRF-Token": csrfToken,
        },
        data: function (d) {
          return {
            search: d.search?.value || "",
            filters: window.activeFilters || {},
          };
        },
        dataSrc: function (json) {
          if (json?.success && Array.isArray(json?.data)) {
            $("#kartlar_count").text(json.totalCards);
            return json.data;
          } else {
            return []; // boş array dön
          }
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 10,
      columns: [
        {
          data: function (row) {
            return `
                        <div class="flex items-center gap-2.5">
                            <div class="w-12 h-12 rounded-[500px] flex items-center justify-center" style="background-color: ${row.background}">
                                <img src="https://api.avankart.com/v1/icon/${row.kartLogo}" alt="Image">
                            </div>
                            <div class="text-[13px] font-medium text-messages">${row.kartType}</div>
                        </div>
                    `;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] flex items-left text-messages font-normal">${row.activeUsers}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] flex items-left text-messages font-normal dark:text-white">${row.deactiveUsers}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] flex items-left text-messages font-normal dark:text-white">${row.rejected}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] flex items-left text-messages font-normal dark:text-white">${row.appeals}</span>`;
          },
        },
        {
          data: function (row) {
            let color = "";
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
                color = "bg-[#FF7043]"; // narıncı (digər)
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

            // Define different dropdown content based on status
            let dropdownContent = "";

            switch (row.status) {
              case "Aktiv":
                dropdownContent = `
                                <div class="relative w-[117px] border-[#0000001A] border-[0.5px] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-white z-0">
                                  <div onclick="openCard('${row.kartId}')" class="flex items-center  my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                                    <div class="icon stratis-cursor-06 mt-[6px] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                    <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Aç</span>
                                  </div>
                                  <div onclick="openCardPopupForUpdate('${row.kartId}')" class="flex items-center  my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                                    <div class="icon stratis-edit-03 mt-[6px] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                    <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Redaktə et</span>
                                  </div>
                                  <div class="h-[0.5px] bg-[#0000001A]"></div>
                                  <div onclick="openDeactivateModal(JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(row))}')))" class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg">
                                    <div class="icon stratis-minus-circle-contained  w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                                    <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Deaktiv et</span>
                                  </div>
                                </div>
                            `;
                break;
              case "Deaktiv":
                dropdownContent = `
                                <div class="relative w-[117px] border-[#0000001A] border-[0.5px]
                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-white z-0">
                        <div onclick="openCard('${row.kartId}')" class="flex items-center  my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                                        <div class="icon stratis-cursor-06 mt-[6px] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                        <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Aç</span>
                                    </div>
                                    <div onclick="openCardPopupForUpdate('${row.kartId}')" class="flex items-center  my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                                        <div class="icon stratis-edit-03 mt-[6px] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                        <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Redaktə et</span>
                                    </div>
                                    <div class="h-[0.5px] bg-[#0000001A]"></div>

                                <div  onclick="confirmCardActivation('${row.kartId}')"  class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                                    transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                                <div class="icon stratis-shield-check  w-[13px] h-[13px] mr-[9px] disabled:text-on-surface-variant-dark"></div>
                                <span class="text-[13px] font-medium disabled:text-on-surface-variant-dark">Aktiv et</span>
                            </div>
                                </div>
                            `;
                break;
              default:
                dropdownContent = `
                                <div class="relative w-[117px] border-[#0000001A] border-[0.5px]
                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-white z-0">
                                <div onclick="openCard('${row.kartId}')" class="flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                                    transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                                    <div class="icon stratis-cursor-06 mt-[6px] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                    <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Aç</span>
                                </div>
                                <div class="h-[0.5px] bg-[#0000001A]"></div>
                                <div class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                                    ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                                    <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                                    <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Sil</span>
                                </div>
                                </div>
                            `;
            }

            return `
                        <div class="text-base flex items-center cursor-pointer dropdown-trigger relative" data-row="${idx}" data-status="${row.status}">
                            <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-white"></div>
                            <div class="dropdown-menu hidden absolute z-50 top-full " id="dropdown-${idx}">
                                <div class="absolute top-[-10.5px] right-[0px] transform -translate-x-1/2 z-10">
                                    <img src="/images/avankart-partner-pages-images/Polygon 1.svg"
                                         alt="polygon"
                                         class="w-[14px] h-[12px]">
                                </div>
                                <div class="relative w-[117 px]
                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-transparent z-0">
                                    ${dropdownContent}
                                </div>
                            </div>
                        </div>
                    `;
          },
        },
      ],

      createdRow: function (row, data, dataIndex) {
        $(row).on("click", function (e) {
          // Dropdown'a tıklanmadıysa
          if (
            !$(e.target).closest(".dropdown-trigger, .dropdown-menu").length
          ) {
            openCard(data.kartId);
          }
        });
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
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $("#myTable thead th:first-child").css({
          "padding-left": "20px",
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
          "padding-left": "20px",
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
          "padding-left": "20px",
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
                <div class="flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ${pageInfo.page === 0 ? "opacity-50 cursor-not-allowed" : "text-messages"}"
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left !h-[12px] !w-[7px]"></div>
                </div>
            `);

        var paginationButtons = '<div class="flex gap-2">';
        for (var i = 0; i < pageInfo.pages; i++) {
          paginationButtons += `
                    <button class="cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages
                            ${i === pageInfo.page ? "bg-[#F6D9FF] text-messages" : "bg-transparent text-tertiary-text"}"
                            onclick="changePage(${i})">${i + 1}</button>
                `;
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        $pagination.append(`
                <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "opacity-50 cursor-not-allowed" : "text-tertiary-text"}"
                    onclick="changePage(${Math.min(pageInfo.pages - 1, pageInfo.page + 1)})">
                    <div class="icon stratis-chevron-right !h-[12px] !w-[7px]"></div>
                </div>
            `);
      },
    });
    // Page change function
    window.changePage = function (page) {
      dataTable.page(page).draw("page");
    };
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
    // Arama yapıldığında tabloyu yeniden çiz (draw)
    dataTable.search(this.value).draw();
  });

  // Handle dropdown menu clicks
  $(document).on("click", ".dropdown-trigger", function (e) {
    e.stopPropagation();
    const rowId = $(this).data("row");
    const $dropdown = $(`#dropdown-${rowId}`);

    // Hide all other dropdowns first
    if (!$dropdown.hasClass("hidden")) {
      $dropdown.addClass("hidden");
      return;
    }

    // Önce tüm dropdownları kapat
    $(".dropdown-menu").addClass("hidden");

    // Bu dropdownu aç
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

  // Tabloyu başlat
  initializeDataTable();
});

function performSearch() {
  const searchValue = ($("#customSearchForCard").val() || "").trim();
  if (dataTable) {
    // **axtarışda da 1-ci səhifəyə dön və tam redraw et**
    dataTable.search(searchValue).page(0).draw();
  }
}

$("#customSearchForCard").on("keyup input", function () {
  performSearch();
});

async function loadCategories() {
  try {
    const res = await fetch("/imtiyazlar/kartlar/card-categories");
    const json = await res.json();
    const activeFilter = window.activeFilters || {};

    if (json.success && Array.isArray(json.data)) {
      const container = document.querySelector("#categoryContainer");
      container.innerHTML = "";

      json.data.forEach((cat) => {
        // checked situation
        const isChecked = activeFilter.card_category?.includes(cat.id)
          ? "checked"
          : "";

        const item = `
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" class="peer hidden" name="card_category[]" value="${cat.id}" ${isChecked} />
            <div class="w-4 h-4 border border-surface-variant rounded-[2px] flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition">
              <div class="icon stratis-check-01 scale-60 h-3 w-3 text-white"></div>
            </div>
            <span class="text-[13px]">${cat.name}</span>
          </label>
        `;
        container.insertAdjacentHTML("beforeend", item);
      });
    }
  } catch (e) {
    console.error("Kategori yüklenemedi:", e);
  }
}

function loadCategoriesAndOpenFilter() {
  loadCategories();
  openFilterModal();
}

function applyFilters() {
  const formData = $("#filterForm").serializeArray();
  const filters = {};

  formData.forEach((item) => {
    if (item.name.endsWith("[]")) {
      const key = item.name.replace("[]", "");
      if (!filters[key]) filters[key] = [];
      filters[key].push(item.value);
    } else {
      if (!filters[item.name]) filters[item.name] = [];
      filters[item.name] = item.value;
    }
  });

  window.activeFilters = filters;

  dataTable.ajax.reload();

  openFilterModal();
}

function clearFilters() {
  $("#filterForm")[0].reset();
  window.activeFilters = {};
  dataTable.ajax.reload();
}

window.addEventListener("reloadCardTable", () => {
  if (dataTable) {
    dataTable.ajax.reload(null, false);
  }
});

function openDeactivateModal(card) {
  if (!card) {
    return null;
  }
  $("#card-background-deactivation-modal").css({
    "background-color": card.background,
  });
  $("#card-logo-deactivation-modal").attr(
    "src",
    `https://api.avankart.com/v1/icon/${card.kartLogo}`
  );
  $("#card-name-deactivation-modal").text(card.kartType);
  const $modal = $("#DeactivateModal");
  $modal.fadeIn(200);
  $("#deactivateBtn").attr("data-target", card.kartId);

  loadCardConditionsForDeleteAction(card.kartId, "deactivate_reason");
}

function closeDeactivateModal() {
  $("#DeactivateModal").fadeOut(200);
  $("#reasonsDeactivateModal input[type=checkbox]").prop("checked", false);
  $("#deactivateBtn").prop("disabled", true);
}

// --- 2.  data load from Backend ---
function loadCardConditionsForDeleteAction(kartId, conditionType) {
  $.ajax({
    url: `/imtiyazlar/kartlar/${kartId}/conditions?category=${conditionType}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      const $container = $("#reasonsDeactivateModal");
      $container.empty();

      if (response.success && Array.isArray(response.data)) {
        response.data.forEach((reason) => {
          const item = `
            <label class="w-full flex gap-2 items-center justify-start">
              <input type="checkbox" class="peer hidden condition-checkbox" value="${reason.id}" />
              <div class="w-4 h-4 border border-surface-variant rounded-[2px] flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60 h-3 w-3 text-white"></div>
              </div>
              <span class="text-[13px]">${reason.description}</span>
            </label>
          `;
          $container.append(item);
        });

        // Checkbox değişimini dinle
        $(".condition-checkbox").on("change", function () {
          const anyChecked = $(".condition-checkbox:checked").length > 0;
          $("#deactivateBtn").prop("disabled", !anyChecked);
        });
      } else {
        $container.html(
          '<div class="text-center text-red-500 py-2">Səbəblər yüklənmədi.</div>'
        );
      }
    },
    error: function (xhr, status, error) {
      $("#reasonsDeactivateModal").html(
        '<div class="text-center text-red-500 py-2">Xəta baş verdi: ' +
          error +
          "</div>"
      );
    },
  });
}

// --- 3. Submit ---
function submitDeactivateReasons() {
  const kartId = $("#deactivateBtn").attr("data-target");
  const selectedReasons = $(".condition-checkbox:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  if (selectedReasons.length === 0) return;

  updateCardStatus(kartId, "inactive");
}
