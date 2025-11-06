$(document).ready(function () {
  // Verilənlər

  const myData = [
    {
      icon: "/public/images/Avankart/mukafatlar/SilverMedal.svg",
      title: "20 dəfə ye, 5 AZN qazan",
      usagePlace: "Restoran • CoffeShop • Kinoteatr",
      target: "Yemək sayı",
      serviceCount: 20,
      type: "Məbləğ",
      reward: "5 AZN",
      userCount: 45,
      date: "12.01.2023",
    },
    {
      icon: "/public/images/Avankart/mukafatlar/goldMedal.svg",
      title: "50 dəfə xərclə, növbəti dəfə üçün 10% bonus qazan",
      usagePlace:
        "CoffeShop • Restoran • Kinoteatr • Yanacaq doldurma məntəqəsi",
      target: "Xərcləmə məbləği",
      serviceCount: 50,
      type: "Bonus",
      reward: "10%",
      userCount: 12,
      date: "12.01.2023",
    },
    {
      icon: "/public/images/Avankart/mukafatlar/BronzeMedal.svg",
      title: "10 dəfə xərclə, sevdiyin filmə 20% endirim qazan",
      usagePlace:
        "CoffeShop • Restoran • Kinoteatr • Yanacaq doldurma məntəqəsi",
      target: "Xərcləmə məbləği",
      serviceCount: 10,
      type: "Bonus",
      reward: "20%",
      userCount: 80,
      date: "12.01.2023",
    },
    {
      icon: "/public/images/Avankart/mukafatlar/SilverMedal.svg",
      title: "20 dəfə ye, 5 AZN qazan",
      usagePlace: "Restoran • CoffeShop • Kinoteatr",
      target: "Yemək sayı",
      serviceCount: 20,
      type: "Məbləğ",
      reward: "5 AZN",
      userCount: 45,
      date: "12.01.2023",
    },
    {
      icon: "/public/images/Avankart/mukafatlar/goldMedal.svg",
      title: "50 dəfə xərclə, növbəti dəfə üçün 10% bonus qazan",
      usagePlace:
        "CoffeShop • Restoran • Kinoteatr • Yanacaq doldurma məntəqəsi",
      target: "Xərcləmə məbləği",
      serviceCount: 50,
      type: "Bonus",
      reward: "10%",
      userCount: 12,
      date: "12.01.2023",
    },
    {
      icon: "/public/images/Avankart/mukafatlar/BronzeMedal.svg",
      title: "10 dəfə xərclə, sevdiyin filmə 20% endirim qazan",
      usagePlace:
        "CoffeShop • Restoran • Kinoteatr • Yanacaq doldurma məntəqəsi",
      target: "Xərcləmə məbləği",
      serviceCount: 10,
      type: "Bonus",
      reward: "20%",
      userCount: 80,
      date: "12.01.2023",
    },
  ];

  var activeData = myData;

  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: activeData,
    columns: [
      {
        data: function (row) {
          return `
        <div class="flex items-center gap-3">
            <img src="${row.icon}" alt="badge" class="w-[75px] h-[59px] object-contain"/>
        </div>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-medium">${row.title}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.usagePlace}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.target}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="flex flex-start text-[13px] text-messages font-normal">${row.serviceCount}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.type}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-medium">${row.reward}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="flex flex-start text-[13px] text-messages font-normal">${row.userCount}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.date}</span>`;
        },
      },
      {
        data: function () {
          return `
            <div id="rewardCreateModal" class="relative inline-block text-left">
              <!-- Trigger icon -->
              <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"></div>

              <!-- Dropdown wrapper -->
              <div class="hidden absolute right-[-12px] mt-2 w-40 z-50 dropdown-menu">

                <!-- Caret wrapper -->
                <div class="relative h-[8px]">
                  <!-- Caret -->
                  <div class="absolute top-1/2 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-white z-50"></div>
                </div>

                <!-- Dropdown box -->
                <div class="rounded-xl shadow-lg bg-white overflow-hidden relative z-50">
                  <div class="py-[3.5px] text-sm">
                    <div class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer" onclick="editItem(this)">
                      <span class="icon stratis-edit-03 text-[13px]"></span>
                      <span class="font-medium text-[#1D222B] text-[13px]">Redaktə et</span>
                    </div>
                    <div class="h-px bg-stroke my-1"></div>
                    <div class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover" onclick="deleteItem(this)">
                      <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                      <span class="font-medium text-error text-[13px]">Sil</span>
                    </div>
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
    pageLength: myData.length,

    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function (row, data, dataIndex) {
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          $(this).css("background-color", "#F5F5F5");
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      $(row)
        .find("td")
        .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .not(":last-child")
        .css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });
    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
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

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      // Səhifələmə düymələri
      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                  pageInfo.page === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "text-messages"
                }" 
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left"></div>
                </div>
            `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
                    <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages 
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
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                  pageInfo.page === pageInfo.pages - 1
                    ? "opacity-50 cursor-not-allowed"
                    : "text-tertiary-text"
                }" 
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right"></div>
                </div>
            `);
    },
  });

  // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
  $("#newCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");

    $('#myTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  // Axtarış
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
    updateCounts(activeData);
  });

  // Sayları yeniləmək üçün funksiya
  function updateCounts(data) {
    const totalCount = data.length;
    const readCount = data.filter((row) => row.status === "Oxundu").length;
    const unreadCount = data.filter((row) => row.status === "Yeni").length;

    $("#total-count").text(`Hamısı (${totalCount})`);
    $("#read-count").text(`Oxunmuşlar (${readCount})`);
    $("#unread-count").text(`Oxunmamışlar (${unreadCount})`);
  }

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    table.page(page).draw("page");
  };
  localStorage.setItem("myData", JSON.stringify(myData));
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#rewardCreateModal");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");
}

document.addEventListener("click", function (e) {
  const allDropdowns = document.querySelectorAll(".dropdown-menu");

  allDropdowns.forEach((dropdown) => {
    if (!dropdown.closest("#rewardCreateModal").contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
});

function deleteItem(element) {
  // Əvvəlcə hansı row və ya td silinəcək onu tap
  const targetRow = element.closest("tr") || element.closest("td");

  if (targetRow) {
    targetRow.remove(); // DOM-dan sil
  }
}

function editItem(element) {
  const newRewardModal = document.getElementById('newRewardModal');

  newRewardModal.classList.remove('hidden');
}

// ==== GLOBAL ELEMENTS ====
const newRewardModal = document.getElementById("newRewardModal");
const newRewardOptions = document.getElementById("newRewardOptions");
const newRewardDropdown = document.getElementById("newRewardTypeDropdown");
const newSelectedRewardText = document.getElementById("newSelectedRewardText");
const newAdditionalInputWrapper = document.getElementById("newAdditionalInputWrapper");
const newRewardValueInput = document.getElementById("newRewardValueInput");
const newManatIcon = document.getElementById("newManatIcon");
const newRewardNameInput = document.getElementById("newRewardNameInput");
const newTargetCountInput = document.getElementById("newTargetCountInput");
const newSelectedSpending = document.getElementById("newSelectedSpending");
const newUploadedImage = document.getElementById("newUploadedImage");
const newImageInput = document.getElementById("newImageInput");
const newPlusIcon = document.getElementById("newPlusIcon");
const newRocketIcon = document.getElementById("newRocketIcon");
let lastSelectedNewSpending = [];
let editingRow = null;

// ==== MODAL OPEN / CLOSE ====
function openNewRewardModal() {
  resetNewRewardModal();
  newRewardModal.classList.remove("hidden");
  editingRow = null;
}

function closeNewRewardModal() {
  newRewardModal.classList.add("hidden");
  resetNewSpendingModal();
  editingRow = null;
}

newRewardModal.addEventListener("click", function (event) {
  if (event.target === newRewardModal) {
    closeNewRewardModal();
  }
});

// ==== RESET MODAL ====
function resetNewRewardModal() {
  newRewardNameInput.value = "";
  newSelectedSpending.textContent = "Seçim edin";
  newSelectedRewardText.textContent = "Seçim edin";
  newRewardOptions.classList.add("hidden");

  document.querySelectorAll(".newSpendingOption").forEach(cb => cb.checked = false);

  document.querySelectorAll("#newRewardModal .newTarget-button").forEach(btn => {
    btn.classList.remove("bg-focus", "text-on-primary", "selected", "cursor-default");
    btn.classList.add("bg-white", "text-secondary-text", "hover:bg-input-hover", "cursor-pointer");
  });

  newTargetCountInput.value = "";
  newRewardValueInput.value = "";
  newManatIcon.classList.add("hidden");

  newUploadedImage.src = "";
  newUploadedImage.classList.add("hidden");
  newPlusIcon.classList.remove("hidden");
  newRocketIcon.classList.remove("hidden");
  newImageInput.value = "";

  const defaultRadio = document.getElementById("newWeek");
  if (defaultRadio) {
    defaultRadio.checked = true;
    document.querySelectorAll("#newRewardModal .inner-circle").forEach(el => el.classList.add("hidden"));
    const circle = defaultRadio.nextElementSibling?.querySelector(".inner-circle");
    circle?.classList.remove("hidden");
  }
}

// ==== IMAGE UPLOAD ====
function handleNewImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    newUploadedImage.src = e.target.result;
    newUploadedImage.classList.remove("hidden");
    newPlusIcon.classList.add("hidden");
    newRocketIcon.classList.add("hidden");
  };
  reader.readAsDataURL(file);
}

if (newImageInput) {
  newImageInput.addEventListener("change", handleNewImageUpload);
}

function triggerNewImageUpload() {
  newImageInput.click();
}

// ==== SUBMIT (EDIT MODE) ====
document.querySelector("#newRewardModal button.bg-primary").addEventListener("click", () => {
  if (!editingRow) return;
  const cells = editingRow.querySelectorAll("td");

  cells[0].innerHTML = `<div class="flex items-center gap-3">
    <img src="${newUploadedImage.src}" alt="badge" class="w-[75px] h-[59px] object-contain"/>
  </div>`;
  cells[1].innerHTML = `<span class="text-[13px] text-messages font-medium">${newRewardNameInput.value}</span>`;
  cells[2].innerHTML = `<span class="text-[13px] text-messages font-normal">${newSelectedSpending.textContent}</span>`;
  cells[3].innerHTML = `<span class="text-[13px] text-messages font-normal">${document.querySelector("#newRewardModal .newTarget-button.selected").textContent.trim()}</span>`;
  cells[4].innerHTML = `<span class="flex flex-start text-[13px] text-messages font-normal">${newTargetCountInput.value}</span>`;
  cells[5].innerHTML = `<span class="text-[13px] text-messages font-normal">${newSelectedRewardText.textContent}</span>`;
  cells[6].innerHTML = `<span class="text-[13px] text-messages font-medium">${newRewardValueInput.value}</span>`;

  closeNewRewardModal();
});

// ==== EDIT FUNCTION ====
function editItem(element) {
  const row = element.closest("tr");
  editingRow = row;
  const cells = row.querySelectorAll("td");

  const iconSrc = cells[0].querySelector("img").src;
  const title = cells[1].innerText.trim();
  const usagePlace = cells[2].innerText.trim();
  const target = cells[3].innerText.trim();
  const serviceCount = cells[4].innerText.trim();
  const type = cells[5].innerText.trim();
  const reward = cells[6].innerText.trim();

  resetNewRewardModal();

  newRewardModal.classList.remove("hidden");
  newRewardNameInput.value = title;
  newSelectedSpending.textContent = usagePlace;
  lastSelectedNewSpending = usagePlace.split(" • ");

  const targetBtn = target === "Xərcləmə məbləği"
    ? document.querySelector('[data-target="newAmount"]')
    : document.querySelector('[data-target="newCount"]');
  selectNewTargetType(targetBtn);

  newTargetCountInput.value = serviceCount;
  newSelectedRewardText.textContent = type;
  newAdditionalInputWrapper.classList.remove("hidden");

  if (type === "Məbləğ") {
    newRewardValueInput.placeholder = "Mükafat məbləği";
    newManatIcon.classList.remove("hidden");
  } else if (type === "Endirim") {
    newRewardValueInput.placeholder = "Endirim faizi";
    newManatIcon.classList.add("hidden");
  } else if (type === "Bonus") {
    newRewardValueInput.placeholder = "Bonus faizi";
    newManatIcon.classList.add("hidden");
  } else {
    newRewardValueInput.placeholder = "";
    newManatIcon.classList.add("hidden");
  }

  newRewardValueInput.value = reward;

  if (newUploadedImage && iconSrc) {
    newUploadedImage.src = iconSrc;
    newUploadedImage.classList.remove("hidden");
    newPlusIcon.classList.add("hidden");
    newRocketIcon.classList.add("hidden");
  }
}

// ==== TARGET TYPE ====
function selectNewTargetType(button) {
  document.querySelectorAll("#newRewardModal .newTarget-button").forEach(btn => {
    btn.classList.remove("bg-focus", "text-on-primary", "selected", "cursor-default");
    btn.classList.add("bg-white", "text-secondary-text", "hover:bg-input-hover", "cursor-pointer");
  });
  button.classList.remove("bg-white", "text-secondary-text", "hover:bg-input-hover", "cursor-pointer");
  button.classList.add("bg-focus", "text-on-primary", "selected", "cursor-default");
}

// ==== SPENDING MODAL OPEN ====
function openNewSpendingModal() {
  const checkboxes = document.querySelectorAll(".newSpendingOption");
  if (lastSelectedNewSpending.length > 0) {
    checkboxes.forEach(cb => {
      cb.checked = lastSelectedNewSpending.includes(cb.value);
    });
  } else {
    checkboxes.forEach(cb => cb.checked = false);
  }
  resetNewSpendingFilter();
  document.getElementById("newSpendingModal").classList.remove("hidden");
}

function closeNewSpendingModal() {
  document.getElementById("newSpendingModal").classList.add("hidden");
  if (lastSelectedNewSpending.length === 0) {
    resetNewSpendingModal();
  }
}

document.getElementById("newSpendingModal").addEventListener("click", function (e) {
  const modalContent = document.getElementById("newSpendingModalContent");
  if (!modalContent.contains(e.target)) {
    closeNewSpendingModal();
  }
});

function submitNewSpendingSelection() {
  const selected = [];
  document.querySelectorAll(".newSpendingOption").forEach(cb => {
    if (cb.checked) selected.push(cb.value);
  });

  lastSelectedNewSpending = [...selected];
  const formatted = selected.length > 0 ? selected.join(" • ") : "Seçim edin";
  newSelectedSpending.textContent = formatted;

  document.getElementById("newSpendingModal").classList.add("hidden");
  resetNewSpendingModal();
}

function resetNewSpendingModal() {
  document.getElementById("newSpendingSearch").value = "";
  document.querySelectorAll(".newSpendingOption").forEach(cb => {
    cb.closest("label").classList.remove("hidden");
    cb.checked = false;
  });
}

function resetNewSpendingFilter() {
  const searchInput = document.getElementById("newSpendingSearch");
  searchInput.value = "";
  searchInput.addEventListener("input", function () {
    const term = this.value.toLowerCase();
    document.querySelectorAll(".newSpendingOption").forEach(cb => {
      const label = cb.closest("label");
      const text = label.innerText.toLowerCase();
      if (text.includes(term)) {
        label.classList.remove("hidden");
      } else {
        label.classList.add("hidden");
      }
    });
  });
}


// ==== DROPDOWN ==== 
newRewardDropdown.addEventListener("click", function (e) {
  e.stopPropagation();
  newRewardOptions.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  newRewardOptions.classList.add("hidden");
});

newRewardOptions.addEventListener("click", function (event) {
  if (event.target.tagName.toLowerCase() === "li") {
    const selectedValue = event.target.innerText.trim();
    newSelectedRewardText.textContent = selectedValue;
    newRewardOptions.classList.add("hidden");
    newAdditionalInputWrapper.classList.remove("hidden");

    if (selectedValue === "Məbləğ") {
      newRewardValueInput.placeholder = "Mükafat məbləği";
      newManatIcon.classList.remove("hidden");
    } else if (selectedValue === "Endirim") {
      newRewardValueInput.placeholder = "Endirim faizi";
      newManatIcon.classList.add("hidden");
    } else if (selectedValue === "Bonus") {
      newRewardValueInput.placeholder = "Bonus faizi";
      newManatIcon.classList.add("hidden");
    } else {
      newRewardValueInput.placeholder = "";
      newManatIcon.classList.add("hidden");
    }

    newRewardValueInput.value = "";
  }
});