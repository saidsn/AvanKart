 const myData = [
    {
      img: "/public/images/Avankart/rozetler/bestEater.svg",
      title: "Ən Çox Yemək Yeyən",
      description: "10 dəfə yemək ye",
      category: "Yemək",
      targetType: "Xidmət sayı",
      targetName: "Hədəf sayı",
      targetValue: 10,
      userCount: 10,
      date: "12.01.2023",
    },
    {
      img: "/public/images/Avankart/rozetler/tidy.svg",
      title: "Təmizkar",
      description: "50 dəfə maşını yuduzdur",
      category: "Yuma",
      targetType: "Xidmət sayı",
      targetName: "Hədəf sayı",
      targetValue: 50,
      userCount: 50,
      date: "12.01.2023",
    },
    {
      img: "/public/images/Avankart/rozetler/selfless.svg",
      title: "Fədakar adam",
      description: "Hədiyyə kartı ilə 5 əməliyyat yerinə yetir",
      category: "Ümumi",
      targetType: "Xidmət sayı",
      targetName: "Hədəf sayı",
      targetValue: 5,
      userCount: 5,
      date: "12.01.2023",
    },
    {
      img: "/public/images/Avankart/rozetler/increaseBalance.svg",
      title: "Balansı artır",
      description: "Balansı 100 AZN artır",
      category: "Hədiyyə",
      targetType: "Məbləğ",
      targetName: "Mədaxil",
      targetValue: "100 AZN",
      userCount: 100,
      date: "12.01.2023",
    },
    {
      img: "/public/images/Avankart/rozetler/bestEaterGold.svg",
      title: "Ən Çox Yemək Yeyən",
      description: "10 dəfə yemək ye",
      category: "Yemək",
      targetType: "Xidmət sayı",
      targetName: "Hədəf sayı",
      targetValue: 10,
      userCount: 45,
      date: "12.01.2023",
    },
    {
      img: "/public/images/Avankart/rozetler/bestEaterSuper.svg",
      title: "Ən Çox Yemək Yeyən",
      description: "10 dəfə yemək ye",
      category: "Yemək",
      targetType: "Xidmət sayı",
      targetName: "Hədəf sayı",
      targetValue: 10,
      userCount: 52,
      date: "12.01.2023",
    },
    {
      img: "/public/images/Avankart/rozetler/bestEaterUltra.svg",
      title: "Ən Çox Yemək Yeyən",
      description: "10 dəfə yemək ye",
      category: "Yemək",
      targetType: "Xidmət sayı",
      targetName: "Hədəf sayı",
      targetValue: 10,
      userCount: 38,
      date: "12.01.2023",
    },
    {
      img: "/public/images/Avankart/rozetler/bestEaterUltraSuper.svg",
      title: "Ən Çox Yemək Yeyən",
      description: "10 dəfə yemək ye",
      category: "Yemək",
      targetType: "Xidmət sayı",
      targetName: "Hədəf sayı",
      targetValue: 10,
      userCount: 24,
      date: "12.01.2023",
    },
  ];
$(document).ready(function () {
  // Verilənlər

 

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
            <img src="${row.img}" alt="badge" class="w-[75px] h-[59px] object-contain"/>
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
          return `<span class="text-[13px] text-messages font-normal">${row.description}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.category}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="flex flex-start text-[13px] text-messages font-normal">${row.targetType}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.targetName}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-medium">${row.targetValue}</span>`;
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
    pageLength: 50,

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

// Global dəyişən silinəcək sətri yadda saxlamaq üçün
let rowToDelete = null;

function deleteItem(element) {
  rowToDelete = $(element).closest("tr");

  const popup = document.createElement("div");
  popup.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[9999]";
  popup.innerHTML = `
    <div class="popup-content bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative">
      <div class="w-[306px] flex flex-col gap-3">
        <div class="w-10 h-10 rounded-full bg-error-hover flex items-center justify-center">
          <div class="icon stratis-trash-01 w-5 h-5 text-error"></div>
        </div>
        <div class="flex flex-col gap-1">
          <div class="text-[#1D222B] font-medium text-[15px]">Rozeti sil</div>
          <div class="text-secondary-text text-[13px] font-normal">
            Rozeti silmək istədiyinizə əminsiniz?
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
        <button class="cancelDelete cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition">Xeyr</button>
        <button class="confirmDelete cursor-pointer px-3 py-1 rounded-full text-on-primary bg-error transition">Bəli, sil</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // ✅ 1 dəfəlik click dinləyicisi — yalnız modal üçün
  setTimeout(() => {
    document.addEventListener("click", outsideClickListener);
  }, 0);

  // ✅ Modal daxilindəki düymələr üçün
  popup.querySelector(".cancelDelete").addEventListener("click", closePopup);
  popup.querySelector(".confirmDelete").addEventListener("click", function () {
    if (rowToDelete) {
      $("#myTable").DataTable().row(rowToDelete).remove().draw();
      rowToDelete = null;
    }
    closePopup();
  });
}

function outsideClickListener(e) {
  const popupContent = document.querySelector(".popup-content");
  if (popupContent && !popupContent.contains(e.target)) {
    closePopup();
  }
}

function closePopup() {
  const popup = document.querySelector(".custom-popup");
  if (popup) popup.remove();
  document.removeEventListener("click", outsideClickListener);
}

document.getElementById("createRozetBtn").addEventListener("click", function () {
  const title = document.querySelector('input[placeholder="Daxil edin"]').value.trim();
  const description = document.querySelector('textarea[placeholder="Rozet təsvirini daxil edin..."]').value.trim();
  const category = document.getElementById("selectedCategoryText").innerText.trim();
  const img = document.getElementById("uploadedImage").src;

  let targetType = "", targetValue = "", targetName = "";

  // Validation
  if (!title || !description || category === "Seçim edin" || !img || img.includes("Uploaded")) {
    alert("Zəhmət olmasa bütün xanaları doldurun və şəkil seçin.");
    return;
  }

  if (category === "Ümumi") {
    const activeButton = document.querySelector("#buttons .bg-primary");
    if (!activeButton) return alert("Hədəf növünü seçin");

    targetType = activeButton.innerText.trim();
    targetName = targetType === "Məbləğ" ? "Mədaxil" : "Hədəf sayı";

    const suffix = activeButton.id.split("-")[1];
    const inputEl = document.querySelector(`#target-${suffix} input`);
    if (!inputEl || !inputEl.value.trim()) return alert("Hədəf dəyərini daxil edin");

    targetValue = inputEl.value.trim();
  } else {
    const activeButton = document.querySelector(".grid-cols-4 .bg-primary");
    if (!activeButton) return alert("Hədəf növünü seçin");

    targetType = activeButton.innerText.trim();
    targetName = targetType === "Məbləğ" ? "Mədaxil" : "Hədəf";

    const indexMap = { "Xidmət sayı": 0, "Müddət": 1, "Məbləğ": 2 };
    const index = indexMap[targetType];
    const inputEl = document.querySelector(`#targetInputWrapper2 > *:nth-child(${index + 1}) input`);
    if (!inputEl || !inputEl.value.trim()) return alert("Hədəf dəyərini daxil edin");

    targetValue = inputEl.value.trim();
  }

  const newItem = {
  img: img,
  title: title,
  description: description,
  category: category,
  targetType: targetType,
  targetName: targetName,
  targetValue: targetValue,
  userCount: 0,
  date: new Date().toLocaleDateString("az-AZ"),
};

// Əvvəlcə mövcud məlumat listinə əlavə et
myData.push(newItem);          // <-- BURA VACİBDİR
localStorage.setItem("myData", JSON.stringify(myData)); // (əgər localStorage istifadə olunursa)

const table = $("#myTable").DataTable();
table.row.add(newItem).draw(false); // draw(false) ilə mövcud səhifədə qal

// Sonuncu səhifəyə keç (istəyə bağlı)
const lastPage = table.page.info().pages - 1;
table.page(lastPage).draw("page");

closeRozet();

});

