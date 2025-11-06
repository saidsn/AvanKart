let menuText = "İstifadə qaydaları";
const csrfToken = $('meta[name="csrf-token"]').attr("content");
$(document).ready(function () {
  document.addEventListener("click", function (e) {
    if (e.target.closest(".toggle-description")) {
      const btn = e.target.closest(".toggle-description");
      const id = btn.getAttribute("data-id");
      const descDiv = document.getElementById(`desc-${id}`);
      const icon = btn.querySelector("i");

      if (descDiv.classList.contains("hidden")) {
        descDiv.classList.remove("hidden");
        icon.classList.add("rotate-315");
      } else {
        descDiv.classList.add("hidden");
        icon.classList.remove("rotate-315");
      }
    }
  });

  // Card conditions menu click event handler
  $("#cardConditionsMenu span").click(function () {
    // Remove active class from all menu items
    $("#cardConditionsMenu span").removeClass(
      "border-b-2 border-black ![border-bottom-color:black] font-bold text-black"
    );
    $("#cardConditionsMenu span").addClass("text-gray-400");

    // Add active class to clicked menu item
    $(this).addClass(
      "border-b-2 border-black ![border-bottom-color:black] font-bold text-black"
    );
    $(this).removeClass("text-gray-400 hover:text-black");

    // Get the menu item text to determine which content to load
    menuText = $(this).text().trim();
    loadCardConditions(menuText);
  });

  $("#addConditions").click(showAddNewConditionPopup);

  // Initial load (Aktivasiya şərtləri)
  loadCardConditions("İstifadə qaydaları");
});

// Function to load card conditions content
function loadCardConditions(conditionType) {
  // Show loading state
  $("#cardConditions").html('<div class="text-center py-4">Yüklənir...</div>');

  // Determine endpoint category based on condition type
  let category = "";

  switch (conditionType) {
    case "Aktivasiya şərtləri":
      category = "activate";
      break;
    case "İstifadə qaydaları":
      category = "usage";
      break;
    case "Deaktivasiya şərtləri":
      category = "deactivate";
      break;
    case "Deaktiv etmə səbəbləri":
      category = "deactivate_reason";
      break;
    default:
      category = "usage";
  }

  // Get kartId from current URL or global variable
  const kartId = getCurrentKartId(); // Bu fonksiyonu sizin yapınıza göre implement edin

  // AJAX request to load content
  $.ajax({
    url: `/imtiyazlar/kartlar/${kartId}/conditions?category=${category}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        renderCardConditions(response.data, conditionType);
      } else {
        $("#cardConditions").html(
          '<div class="text-center text-red-500 py-4">Xəta baş verdi: ' +
            response.message +
            "</div>"
        );
      }
    },
    error: function (xhr, status, error) {
      $("#cardConditions").html(
        '<div class="text-center text-red-500 py-4">Xəta baş verdi: ' +
          error +
          "</div>"
      );
    },
  });
}

// Helper function to get current kartId (örnek implementasyon)
function getCurrentKartId() {
  // URL'den kartId'yi al (örnek: /imtiyazlar/kartlar/12345)
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 1];

  // Veya global değişkenden al
  // return window.currentKartId;
}

// Function to render card conditions content
function renderCardConditions(data, conditionType) {
  let html = "";

  if (data && data.length > 0) {
    // If we have conditions data
    html +=
      '<span class="text-gray-600 mt-1 w-full text-center text-xs">' +
      getConditionDescription(conditionType) +
      "</span>";

    data.forEach(function (condition, index) {
      html += `<div class="flex flex-col justify-center items-center w-full rounded-md overflow-hidden">
                <div class="flex justify-center items-center w-full bg-gray-100 gap-2 p-3 text-xs">
                  <span class="flex-1 max-w-[70%] truncate">${index + 1}. ${condition.title}</span>
                  <button class="cursor-pointer text-sm icon stratis-edit-03 w-[18px] h-[18px] edit-condition" data-id="${condition.id}"></button>
                  <button class="cursor-pointer text-sm icon stratis-trash-01 w-[18px] h-[18px] text-red-500 delete-condition" data-id="${condition.id}"></button>
                  <button class="cursor-pointer w-[24px] h-[24px] flex items-center justify-center rounded-full bg-gray-300 toggle-description" data-id="${condition.id}">
                      <i class="text-xs icon stratis-arrow-right"></i>
                  </button>
                </div>
                <div class="hidden w-full border-t bg-gray-50 text-gray-700 text-xs p-3 description" id="desc-${condition.id}">
                  ${condition.description || "Açıqlama mövcud deyil"}
                </div>
              </div>`;
    });
  } else {
    // No conditions found
    html = `
        <div class="text-center py-8">
            <span class="text-gray-600 text-xs">${getEmptyMessage(conditionType)}</span>
        </div>
        `;
  }
  if (
    conditionType == "Aktivasiya şərtləri" ||
    conditionType == "Deaktivasiya şərtləri"
  ) {
    $("#addConditionsText").text("Yeni şərt əlavə et");
  } else if (conditionType == "İstifadə qaydaları") {
    $("#addConditionsText").text("Yeni qayda əlavə et");
  } else if (conditionType == "Deaktiv etmə səbəbləri") {
    $("#addConditionsText").text("Yeni səbəb əlavə et");
  }

  $("#cardConditions").html(html);

  // Add event listeners for the new buttons
  bindConditionEvents();
}

// Helper function to get description based on condition type
function getConditionDescription(conditionType) {
  const descriptions = {
    "Aktivasiya şərtləri":
      "Yemək kartının aktivasiya şərtlərini idarə edə bilərsiniz",
    "İstifadə qaydaları":
      "Yemək kartının istifadə qaydalarını idarə edə bilərsiniz",
    "Deaktivasiya şərtləri":
      "Yemək kartının deaktivasiya şərtlərini idarə edə bilərsiniz",
    "Deaktiv etmə səbəbləri":
      "Yemək kartının deaktiv etmə səbəblərini idarə edə bilərsiniz",
  };

  return descriptions[conditionType] || "Kart şərtlərini idarə edə bilərsiniz";
}

// Helper function to get empty message based on condition type
function getEmptyMessage(conditionType) {
  const messages = {
    "Aktivasiya şərtləri": "Hələlik heç bir aktivasiya şərti əlavə edilməyib",
    "İstifadə qaydaları": "Hələlik heç bir istifadə qaydası əlavə edilməyib",
    "Deaktivasiya şərtləri":
      "Hələlik heç bir deaktivasiya şərti əlavə edilməyib",
    "Deaktiv etmə səbəbləri":
      "Hələlik heç bir deaktiv etmə səbəbi əlavə edilməyib",
  };

  return messages[conditionType] || "Hələlik heç bir şərt əlavə edilməyib";
}

function getConditionPopupTitleMessage(conditionType) {
  const messages = {
    "Aktivasiya şərtləri": "Yeni şərt",
    "İstifadə qaydaları": "Yeni qayda",
    "Deaktivasiya şərtləri": "Yeni şərt",
    "Deaktiv etmə səbəbləri": "Yeni səbəb",
  };

  return messages[conditionType] || "Hələlik heç bir şərt əlavə edilməyib";
}
// Function to bind events for condition buttons
function bindConditionEvents() {
  // Edit condition
  $(".edit-condition").click(function () {
    const conditionId = $(this).data("id");
    const title = $(this)
      .closest(".flex")
      .find("span.flex-1")
      .text()
      .split(". ")
      .slice(1)
      .join(". ");
    const description = $(this)
      .closest(".flex-col")
      .find(".description")
      .text();
    showUpdateConditionPopup(title, description, conditionId);
  });

  // Delete condition
  $(".delete-condition").click(function () {
    const conditionId = $(this).data("id");
    deleteCondition(conditionId);
  });

  // Add new condition
  $(".add-condition").click(function () {
    addNewCondition();
  });
}

function deleteCondition(conditionId) {
  // Modal oluştur
  const existingModal = document.getElementById("deleteConditionModal");
  if (existingModal) existingModal.remove();

  const popupTitle = {
    "Aktivasiya şərtləri": "Şərti sil",
    "İstifadə qaydaları": "Qaydanı sil",
    "Deaktivasiya şərtləri": "Şərti sil",
    "Deaktiv etmə səbəbləri": "Səbəbi Sil",
  };
  const popupQuery = {
    "Aktivasiya şərtləri": "Seçilən şərti silmək istədiyinizə əminsiniz?",
    "İstifadə qaydaları": "Seçilən qaydanı silmək istədiyinizə əminsiniz?",
    "Deaktivasiya şərtləri": "Seçilən şərti silmək istədiyinizə əminsiniz?",
    "Deaktiv etmə səbəbləri": "Seçilən səbəbi silmək istədiyinizə əminsiniz?",
  };

  const modal = document.createElement("div");
  modal.id = "deleteConditionModal";
  modal.className =
    "fixed inset-0 bg-[#0000002A] flex items-center justify-center z-100";

  modal.innerHTML = `
    <div class="bg-white p-6 rounded-lg w-[300px] flex flex-col gap-4">
      <div class="w-full flex">
        <div class="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-error-hover ">
          <i class="text-md icon stratis-trash-01 w-[18px] h-[18px] text-red-500 delete-condition"></i>
        </div>
      </div>
      <div class="w-full flex flex-col gap-1">
        <h2 class="text-lg">${popupTitle[menuText]}</h2>
        <p class=" max-w-[80%] text-sm text-gray-400">${popupQuery[menuText]}</p>
      </div>
      <div class="w-full flex justify-end">
        <button id="cancelDelete" class="text-black px-4 py-1 ">Xeyr</button>
        <button id="confirmDelete" class="bg-red-500 text-white px-4 py-1 rounded-3xl">Bəli, sil</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Accept butonu
  document.getElementById("confirmDelete").onclick = function () {
    performDelete(conditionId);
    modal.remove();
  };

  // Cancel butonu
  document.getElementById("cancelDelete").onclick = function () {
    modal.remove();
  };
}

function performDelete(conditionId) {
  $.ajax({
    url: "/imtiyazlar/kartlar/card-conditions/" + conditionId,
    type: "DELETE",
    headers: { "CSRF-Token": csrfToken },
    success: function (response) {
      if (response.success) {
        loadCardConditions(menuText);
      } else {
        $("#cardConditions").html(
          '<div class="text-center text-red-500 py-4">Error: ' +
            response.message +
            "</div>"
        );
      }
    },
    error: function (xhr, status, error) {
      $("#cardConditions").html(
        '<div class="text-center text-red-500 py-4">Error: ' + error + "</div>"
      );
    },
  });
}

// Function to handle add new condition
function showAddNewConditionPopup() {
  const modal = document.getElementById("newConditionModal");
  modal.classList.remove("hidden"); // aç
  $("#submitCondition")
    .text("Əlavə et")
    .off("click")
    .on("click", function () {
      addNewCondition();
    });
  $("#conditionPopupTitle").text(getConditionPopupTitleMessage(menuText));
}
// Function to handle add new condition
function showUpdateConditionPopup(title, description, conditionId) {
  document.getElementById("conditionTitle").value = title;
  document.getElementById("conditionDescription").value = description;
  const modal = document.getElementById("newConditionModal");
  modal.classList.remove("hidden"); // aç

  $("#submitCondition")
    .text("Dəyişiklikləri təsdiqlə")
    .off("click")
    .on("click", function () {
      updateCondition(conditionId);
    });
  $("#conditionPopupTitle").text("Redaktə et");
}

function closeConditionModal() {
  document.getElementById("conditionTitle").value = "";
  document.getElementById("conditionDescription").value = "";
  const modal = document.getElementById("newConditionModal");
  modal.classList.add("hidden");
}

// POST isteği bağlama
const addNewCondition = async () => {
  const title = document.getElementById("conditionTitle").value;
  const description = document.getElementById("conditionDescription").value;
  const kartId = getCurrentKartId();

  let category = "";

  switch (menuText) {
    case "Aktivasiya şərtləri":
      category = "activate";
      break;
    case "İstifadə qaydaları":
      category = "usage";
      break;
    case "Deaktivasiya şərtləri":
      category = "deactivate";
      break;
    case "Deaktiv etmə səbəbləri":
      category = "deactivate_reason";
      break;
    default:
      category = "usage";
  }

  $.ajax({
    url: `/imtiyazlar/kartlar/${kartId}/conditions`,
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    headers: {
      "CSRF-Token": csrfToken, // <--- burası önemli
    },
    data: JSON.stringify({
      title: title,
      description: description,
      category: category,
    }),
    success: function (response) {
      if (response.success) {
        document.getElementById("conditionTitle").value = "";
        document.getElementById("conditionDescription").value = "";
        closeConditionModal();
        loadCardConditions(menuText);
      } else {
        $("#cardConditions").html(
          '<div class="text-center text-red-500 py-4">Xəta baş verdi: ' +
            response.message +
            "</div>"
        );
      }
    },
    error: function (xhr, status, error) {
      $("#cardConditions").html(
        '<div class="text-center text-red-500 py-4">Xəta baş verdi: ' +
          error +
          "</div>"
      );
    },
  });
};

const updateCondition = async (conditionId) => {
  const title = document.getElementById("conditionTitle").value;
  const description = document.getElementById("conditionDescription").value;

  $.ajax({
    url: `/imtiyazlar/kartlar/card-conditions/${conditionId}`,
    type: "PUT",
    contentType: "application/json",
    dataType: "json",
    headers: {
      "CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      title: title,
      description: description,
    }),
    success: function (response) {
      if (response.success) {
        document.getElementById("conditionTitle").value = "";
        document.getElementById("conditionDescription").value = "";
        closeConditionModal();
        loadCardConditions(menuText);
      } else {
        $("#cardConditions").html(
          '<div class="text-center text-red-500 py-4">Error: ' +
            response.message +
            "</div>"
        );
      }
    },
    error: function (xhr, status, error) {
      $("#cardConditions").html(
        '<div class="text-center text-red-500 py-4">Error: ' + error + "</div>"
      );
    },
  });
};

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

function openDeleteConditionModal() {
  const $modal = $("#confirmDeleteCondition");
  $modal.fadeIn(200);
  const kartId = getCurrentKartId();

  // Backend'den səbəbləri yüklə
  loadCardConditionsForDeleteAction(kartId, "deactivate_reason");
}

function closeDeleteConditionModal() {
  $("#confirmDeleteCondition").fadeOut(200);
  // Checkboxları sıfırla
  $("#reasonsDeleteCondition input[type=checkbox]").prop("checked", false);
  $("#deactivateBtn").prop("disabled", true);
}

// --- 2.  data load from Backend ---
function loadCardConditionsForDeleteAction(kartId, conditionType) {
  $.ajax({
    url: `/imtiyazlar/kartlar/${kartId}/conditions?category=${conditionType}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      const $container = $("#reasonsDeleteCondition");
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
      $("#reasonsDeleteCondition").html(
        '<div class="text-center text-red-500 py-2">Xəta baş verdi: ' +
          error +
          "</div>"
      );
    },
  });
}

// --- 3. Submit ---
function submitDeactivateReasons() {
  const kartId = getCurrentKartId();
  const selectedReasons = $(".condition-checkbox:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  if (selectedReasons.length === 0) return;

  updateCardStatus(kartId, "inactive");
}
