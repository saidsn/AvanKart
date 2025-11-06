function openUserPage(peopleId) {
  window.location.href = `/hovuz/people/${peopleId}`;
}

let dataTable;
let urlForRequest = null;
let methodForRequest = null;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Card details menu click event handler
  $("#cardDetailsMenu button").click(function () {
    // Reset all menu items
    $("#cardDetailsMenu button").each(function () {
      $(this).find(".badge-count").remove();
      $(this).removeClass("bg-gray-200 text-gray-900");
      $(this).addClass("text-gray-500 hover:text-gray-800");
    });

    // Set active state for clicked menu item
    $(this)
      .addClass("bg-gray-200 text-gray-900")
      .removeClass("text-gray-500 hover:text-gray-800")
      .append(
        `<span id="tableRowCount" class="badge-count flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">0</span>`
      );

    // Get menu text
    const menuText = getMenuText($(this));

    // Update table
    updateTableHeaders(menuText);
    initializeDataTable(menuText);
  });

  // Search functionality
  $("#customSearch").on("input", function () {
    if (dataTable) {
      dataTable.search(this.value).draw();
    }
  });

  // Refresh button functionality
  $("#refreshTableBtn, #refreshTableIcon").click(function (e) {
    e.preventDefault();
    const activeMenu = getActiveMenuText();
    if (dataTable) {
      dataTable.ajax.reload();
    }
  });

  $("#openCardPopupForUpdate").click(function () {
    const cardId = getCurrentKartId();
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
  });

  // Initial load
  initializeDataTable("Müraciətlər");
});

function initializeDataTable(menuType) {
  const kartId = getCurrentKartId();
  const config = getMenuConfig(menuType);

  // Destroy existing DataTable
  if ($.fn.DataTable.isDataTable("#cardDetailsTable")) {
    dataTable.destroy();
    $("#cardDetailsTable").empty(); // Tabloyu tamamen temizle
  }

  // Tablo yapısını yeniden oluştur
  const tableHTML = `
    <table id="cardDetailsTable" class="display w-full">
      <thead class="bg-container-2 border-none text-xs text-tertiary-text font-base !h-[40px] dark:bg-table-hover-dark dark:text-white">
        <tr>
          ${config.headers
            .map((header, index) => {
              let className = "filtering";
              if (index === 0) className = "rounded-l-lg filtering";
              if (index === config.headers.length - 1)
                className = "rounded-r-lg";
              return `<th class="${className}">${header}</th>`;
            })
            .join("")}
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  $("#cardDetailsTable").replaceWith(tableHTML);

  dataTable = $("#cardDetailsTable").DataTable({
    ajax: {
      url: `/imtiyazlar/kartlar/${kartId}/users`,
      type: "GET",
      dataType: "json",
      data: function (d) {
        return {
          status: config.status,
          search: d.search.value,
          filters: window.activeFilters || {},
          page: Math.ceil(d.start / d.length) + 1,
          limit: d.length,
        };
      },
      dataSrc: function (json) {
        if (json?.success && json?.data) {
          $("#tableRowCount").html(json.data.length);
          return json.data;
        } else {
          return [];
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
    columns: getColumns(menuType),
    createdRow: function (row, data, dataIndex) {
      $(row).on("click", function (e) {
        // Dropdown'a tıklanmadıysa
        if (!$(e.target).closest(".dropdown-trigger, .dropdown-menu").length) {
          openUserPage(data.peopleId);
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

      // Style last cell
      $(row)
        .find("td:last-child")
        .addClass("border-l-[.5px] border-stroke")
        .css({
          "text-align": "center",
          position: "relative",
        });
    },
    initComplete: function () {
      // Style table headers
      $("#cardDetailsTable thead th").css({
        "padding-left": "10px",
        "padding-top": "8px",
        "padding-bottom": "8px",
        "padding-right": "8px",
      });

      // Add filtering icons to headers
      $("#cardDetailsTable thead th").each(function () {
        if (!$(this).hasClass("dataTables_empty")) {
          $(this).html(
            '<div class="custom-header flex gap-2.5 items-center"><div>' +
              $(this).text() +
              '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
          );
        }
      });
    },
    drawCallback: function () {
      // Add spacer row
      $("#cardDetailsTable tbody tr.spacer-row").remove();
      const colCount = $("#cardDetailsTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#cardDetailsTable tbody").prepend(spacerRow);
    },
  });
}

function updateTableHeaders(menuType) {
  const config = getMenuConfig(menuType);
  const headerTitles = config.headers;

  // Clear and rebuild headers
  $("#cardDetailsTable thead tr").empty();
  headerTitles.forEach((title, index) => {
    let className = "filtering";
    if (index === 0) className = "rounded-l-lg filtering";
    if (index == headerTitles.length - 1) className = "rounded-r-lg";

    $("#cardDetailsTable thead tr").append(
      `<th class="${className}">${title}</th>`
    );
  });
}

function getColumns(menuType) {
  const baseColumns = [
    {
      data: "fullName",
      render: function (data, type, row) {
        const initials = row.fullName
          ? row.fullName
              .split(" ")
              .map((w) => w[0] || "")
              .join("")
          : "—";
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
              ${initials}
            </div>
            <div class="flex flex-col">
              <span class="text-messages text-[13px] font-medium dark:text-white text-left">${row.fullName || "—"}</span>
              <span class="text-secondary-text text-[11px] font-normal dark:text-white text-left">ID: ${row.peopleId || "—"}</span>
            </div>
          </div>
        `;
      },
    },
    {
      data: "email",
      render: function (data) {
        return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${data || "—"}</span>`;
      },
    },
    {
      data: "phone",
      render: function (data) {
        return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${data || "—"}</span>`;
      },
    },
    {
      data: "company",
      render: (data) => `<span class="text-[13px]">${data || "—"}</span>`,
    },
    {
      data: "requestDate",
      render: (data) => `<span class="text-[13px]">${data || "—"}</span>`,
    },
  ];

  // Add dynamic columns based on menu type
  const dynamicColumns = getDynamicColumns(menuType);

  // Add action column
  const actionColumn = {
    orderable: false,
    render: function (data, type, row) {
      return getActionButtons(row, menuType);
    },
    className: "rounded-r-lg",
  };

  return [...baseColumns, ...dynamicColumns, actionColumn];
}

function getDynamicColumns(menuType) {
  if (menuType == "Müraciətlər") {
    return [
      {
        data: "actionMessage",
        render: (data) =>
          `<span class="text-[13px] ${data && data == "Kartın aktivləşdirilməsi" ? "text-green-500" : "text-red-500"}">${data || "—"}</span>`,
      },
    ];
  } else {
    return [];
  }
}

function getActionButtons(row, menuType) {
  let dropdownContent = "";

  if (menuType == "Rədd edilənlər") {
    return ``;
  }

  switch (menuType) {
    case "Müraciətlər":
      dropdownContent = `
        <div onclick="openAcceptionModal('${row.id}','requests')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
          <span class="icon stratis-file-check-02 text-[#999999] text-[13px]"></span>
          <span class="font-medium text-[#999999] text-[13px] whitespace-nowrap">Təsdiqlə</span>
        </div>
        <div onclick="openRejectionReasonsModal('${row.id}','requests')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
          <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
          <span class="font-medium text-error text-[13px] whitespace-nowrap">Rədd et</span>
        </div>
      `;
      break;

    case "Aktivlər":
      dropdownContent = `
        <div class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
          <span class="icon stratis-file-check-02 text-[#999999] text-[13px]"></span>
          <span class="font-medium text-[#999999] text-[13px] whitespace-nowrap">Təsdiqlə</span>
        </div>
        <div onclick="openRejectionReasonsModal('${row.id}','actives')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
          <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
          <span class="font-medium text-error text-[13px] whitespace-nowrap">Kartı deaktiv et</span>
        </div>
      `;
      break;
    case "Deaktivlər":
      dropdownContent = `
        <div onclick="openAcceptionModal('${row.id}','inactives')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
          <span class="icon stratis-file-check-02 text-[#999999] text-[13px]"></span>
          <span class="font-medium text-[#999999] text-[13px] whitespace-nowrap">Kartı aktivləşdir</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
          <span class="icon stratis-minus-circle-contained text-[#999999] text-[13px]"></span>
          <span class="font-medium text-[#999999] text-[13px] whitespace-nowrap">Kartı deaktiv et</span>
        </div>
      `;
      break;
    default:
      dropdownContent = "";
  }

  return `
    <div class="relative inline-block text-left action-dropdown">
      <div onclick="toggleDropdown(event,this)" class="icon stratis-dot-vertical text-messages text-base cursor-pointer z-100"></div>
      <div class="hidden absolute right-[-12px] max-w-[244px] z-50 dropdown-menu">
        <div class="relative h-[8px]">
          <div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
        </div>
        <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
          <div class="py-[3.5px] text-sm">
            ${dropdownContent}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Utility functions
function getMenuConfig(menuType) {
  const config = {
    Müraciətlər: {
      status: "waiting",
      headers: [
        "Ad və soyad",
        "E-poçt",
        "Telefon nömrəsi",
        "Şirkət adı",
        "Müraciət növü",
        "Müraciət tarixi",
        "",
      ],
    },
    Aktivlər: {
      status: "active",
      headers: [
        "Ad və soyad",
        "E-poçt",
        "Telefon nömrəsi",
        "Şirkət adı",
        "Aktivləşdirmə tarixi",
        "",
      ],
    },
    Deaktivlər: {
      status: "inactive",
      headers: [
        "Ad və soyad",
        "E-poçt",
        "Telefon nömrəsi",
        "Şirkət adı",
        "Deaktiv edilmə tarixi",
        "",
      ],
    },
    "Rədd edilənlər": {
      status: "rejected",
      headers: [
        "Ad və soyad",
        "E-poçt",
        "Telefon nömrəsi",
        "Şirkət adı",
        "Rədd edilmə tarixi",
      ],
    },
  };
  return config[menuType] || config["Müraciətlər"];
}

function getMenuText($element) {
  return (
    $element.find(".menu-text").text().trim() ||
    $element.clone().children().remove().end().text().trim()
  );
}

function getActiveMenuText() {
  const $activeMenu = $("#cardDetailsMenu button.bg-gray-200");
  return getMenuText($activeMenu);
}

function getCurrentKartId() {
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 1];
}

function toggleDropdown(e, triggerElement) {
  e.stopPropagation();
  const wrapper = triggerElement.closest(".action-dropdown");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Close other open dropdowns
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Toggle current dropdown
  dropdown.classList.toggle("hidden");

  // Close on outside click
  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// Action functions (placeholder implementations)
function openUserInside(userId) {
  console.log("Open user:", userId);
}

function requestDeleteUser(userId) {
  console.log("Request delete user:", userId);
}

function approveApplication(userId) {
  console.log("Approve application:", userId);
}

function rejectApplication(userId) {
  console.log("Reject application:", userId);
}

function restoreUser(userId) {
  console.log("Restore user:", userId);
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

function closeRejectionModal() {
  $("#rejectRequestAndDeactiveCard").fadeOut(200);
  // Checkboxları sıfırla
  $("#reasonsRejectionCondition input[type=checkbox]").prop("checked", false);
  $("#rejectionBtn").prop("disabled", true);
  urlForRequest = null;
  methodForRequest = null;
}

function submitRejectionReasons() {
  const selectedReasons = $(".rejection-condition-checkbox:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  if (selectedReasons.length === 0) return;

  respondToRequestCard("reject");
}

function openRejectionReasonsModal(requestId, tab) {
  if (tab == "requests") {
    urlForRequest = `/imtiyazlar/kartlar/${requestId}/respond-request`;
    methodForRequest = "POST";
  } else if (tab == "actives") {
    urlForRequest = `/imtiyazlar/kartlar/${requestId}/update-status`;
    methodForRequest = "PUT";
  }
  const $modal = $("#rejectRequestAndDeactiveCard");
  $modal.fadeIn(200);
  const kartId = getCurrentKartId();

  // Backend'den səbəbləri yüklə
  loadCardConditionsForRejectionAction(kartId, "deactivate_reason");
}

// --- 2.  data load from Backend ---
function loadCardConditionsForRejectionAction(kartId, conditionType) {
  $.ajax({
    url: `/imtiyazlar/kartlar/${kartId}/conditions?category=${conditionType}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      const $container = $("#reasonsRejectionCondition");
      $container.empty();

      if (response.success && Array.isArray(response.data)) {
        response.data.forEach((reason) => {
          const item = `
            <label class="w-full flex gap-2 items-center justify-start">
              <input type="checkbox" class="peer hidden rejection-condition-checkbox" value="${reason.id}" />
              <div class="w-4 h-4 border border-surface-variant rounded-[2px] flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60 h-3 w-3 text-white"></div>
              </div>
              <span class="text-[13px]">${reason.description}</span>
            </label>
          `;
          $container.append(item);
        });

        // Checkbox değişimini dinle
        $(".rejection-condition-checkbox").on("change", function () {
          const anyChecked =
            $(".rejection-condition-checkbox:checked").length > 0;
          $("#rejectionBtn").prop("disabled", !anyChecked);
        });
      } else {
        $container.html(
          '<div class="text-center text-red-500 py-2">Səbəblər yüklənmədi.</div>'
        );
      }
    },
    error: function (xhr, status, error) {
      $("#reasonsRejectionCondition").html(
        '<div class="text-center text-red-500 py-2">Xəta baş verdi: ' +
          error +
          "</div>"
      );
    },
  });
}

function respondToRequestCard(decision="approve") {
  if (!urlForRequest || !methodForRequest) return;
  $.ajax({
    url: urlForRequest,
    type: methodForRequest,
    contentType: "application/json",
    dataType: "json",
    headers: {
      "CSRF-Token": csrfToken,
    },
    data: JSON.stringify({ decision }),
    success: function (response) {
      if (response.success) {
        location.reload();
      } else {
        console.error("Error: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error updating card status: " + error);
    },
  });
}

function openAcceptionModal(requestId, tab) {
  if (tab == "requests") {
    urlForRequest = `/imtiyazlar/kartlar/${requestId}/respond-request`;
    methodForRequest = "POST";
  } else if (tab == "inactives") {
    urlForRequest = `/imtiyazlar/kartlar/${requestId}/update-status`;
    methodForRequest = "PUT";
  }
  const $modal = $("#acceptRequestAndActiveCard");
  $modal.fadeIn(200);
  const kartId = getCurrentKartId();

  // Backend'den səbəbləri yüklə
  loadUserInformation(requestId, tab);
}

function closeAcceptionModal() {
  $("#acceptRequestAndActiveCard").fadeOut(200);
}

function loadUserInformation(id, tab) {
  $.ajax({
    url: `/imtiyazlar/kartlar/${id}/acception-popup?for=${tab}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      const $personalInfoContainer = $("#personalInfoForAcception");
      const $otherInfoContainer = $("#otherInfoForAcception");
      const $activeCardsContainer = $("#activeCardsForAcception");
      $personalInfoContainer.empty();
      $otherInfoContainer.empty();
      $activeCardsContainer.empty();

      if (response.success && response.data) {
        const userData = response.data;

        const getGenderText = (gender) => {
          const genders = {
            male: "Kişi",
            female: "Qadın",
            other: "Digər",
          };
          return genders[gender] || gender;
        };

        // Boş değer kontrolü
        const getValue = (value) => {
          return value || "Bilinmir";
        };

        const userInfoHTML = `        
            <!-- Ad Soyad -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Ad və soyadı:</span>
              <span class="text-sm text-gray-800">${getValue(userData.fullName)}</span>
            </div>
                        
            <!-- Cinsiyet -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Cinsi:</span>
              <span class="text-sm text-gray-800">${getGenderText(userData.gender)}</span>
            </div>

            <!-- Doğum Tarixi -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Doğum tarixi:</span>
              <span class="text-sm text-gray-800">${getValue(userData.birthDate)}</span>
            </div>

            <!-- Vəzifə -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Vəzifəsi:</span>
              <span class="text-sm text-gray-800">${getValue(userData.duty)}</span>
            </div>

            <!-- Email -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Email:</span>
              <span class="text-sm text-gray-800">${getValue(userData.email)}</span>
            </div>

            <!-- Şirkət -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Şirkət adı:</span>
              <span class="text-sm text-gray-800">${getValue(userData.company)}</span>
            </div>
            
            <!-- Telefon -->
            <div class="flex justify-between items-center py-2 px-4">
              <span class="text-sm font-medium text-gray-400">Telefon nömrəsi:</span>
              <span class="text-sm text-gray-800">${getValue(userData.phone)}</span>
            </div>
        `;
        const otherInfoHTML = `        
            <!-- Müraciət tarixi: -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Müraciət tarixi:</span>
              <span class="text-sm text-gray-800">${getValue(userData.fullName)}</span>
            </div>
                        
            <!-- Müraciət növü: -->
            <div class="flex justify-between items-center py-2 px-4 border-b">
              <span class="text-sm font-medium text-gray-400">Müraciət növü:</span>
              <span class="text-sm text-gray-800">${getGenderText(userData.gender)}</span>
            </div>
        `;

        function renderCards(cards) {
          let html = "";

          cards.forEach((card) => {
            html += `
                <div class="rounded-lg bg-gray-100 p-2 flex items-center gap-3">
                  <div style="background-color: ${card.bgColor}" class=" w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                    <img src="https://api.avankart.com/v1/icon/${card.icon}" alt="<%= card.name %>" class="w-4 h-4"/>
                  </div>
                  <div>
                    <h3 class=" text-gray-800 truncate max-w-[70px]">${card.name}</h3>
                  </div>
                </div>
              `;
          });

          return html;
        }

        $personalInfoContainer.html(userInfoHTML);
        $otherInfoContainer.html(otherInfoHTML);
        $activeCardsContainer.html(renderCards(userData.activeCards));

        renderPreviousRequestsTable(userData.previousRequests);
      } else {
        $personalInfoContainer.html(
          '<div class="text-center text-red-500 py-4 bg-red-50 rounded border border-red-200">Məlumatlar yüklənmədi.</div>'
        );
      }
    },
    error: function (xhr, status, error) {
      console.log(error);
      $("#personalInfoContainer").html(
        '<div class="text-center text-red-500 py-4 bg-red-50 rounded border border-red-200">Xəta baş verdi: ' +
          error +
          "</div>"
      );
    },
  });
}

function renderPreviousRequestsTable(previousRequests) {
  if (!previousRequests || !previousRequests.length) {
    $("#pastRequestTable").html(
      '<tr><td colspan="3" class="text-center py-4">Müraciət mövcud deyil</td></tr>'
    );
    return;
  }
  $("#pastRequestTable").DataTable({
    destroy: true,
    data: previousRequests,
    columns: [
      {
        data: "requestDate",
        render: function (data) {
          return (
            `<span class="text-[13px] dark:text-on-primary-dark font-normal">${data}</span>` ||
            "—"
          );
        },
        title: "Müraciət tarixi",
      },
      {
        data: "requestType",
        render: function (data) {
          if (data == "Kartın deaktiv edilməsi") {
            return (
              `<span class="text-red-600 text-[13px] dark:text-on-primary-dark font-normal">${data}</span>` ||
              "—"
            );
          } else {
            return (
              `<span class="text-green-600 text-[13px] dark:text-on-primary-dark font-normal">${data}</span>` ||
              "—"
            );
          }
        },
        title: "Müraciət növü",
      },
      {
        data: "status",
        render: function (data) {
          let color = "";
          let text = "";

          switch (data) {
            case "rejected":
              return `
                <span class="flex items-center gap-2 text-[13px] font-normal">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                  <span class="text-[13px] dark:text-on-primary-dark font-normal">Rədd edilib</span>
                </span>
              `;
            case "approved":
              return `
                <span class="flex items-center gap-2 text-[13px] font-normal">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                  <span class="text-[13px] dark:text-on-primary-dark font-normal">Təsdiqlənib</span>
                </span>
              `;
            default:
              return `
                <span class="flex items-center gap-2 text-[13px] font-normal">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>
                  <span class="text-[13px] dark:text-on-primary-dark font-normal">${data || "—"}</span>
                </span>
              `;
          }
        },
        title: "Status",
      },
    ],
    serverSide: false,
    paging: true,
    dom: "t",
    pageLength: 10,
    ordering: true,
    info: false,
    autoWidth: false,
    createdRow: function (row, data) {
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          $(this).css("background-color", "#F5F5F5");
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      $(row).find("td").addClass("border-b-[.5px] border-stroke");
      $(row)
        .find("td:last-child")
        .addClass("border-l-[.5px] border-stroke")
        .css({ "text-align": "center", position: "relative" });
    },
  });
}

function submitAcceptionReasons() {
  respondToRequestCard("approve");
}
