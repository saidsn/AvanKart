$(document).ready(function () {
  // Verilənlər


  const defaultData = [
  {
    categoryName: "Sosial aktivliklər",
    badgeCount: 8,
    createdBy: "Fərid İcrai",
    creationDate: "12.01.2023",
  },
  {
    categoryName: "Biznes",
    badgeCount: 32,
    createdBy: "Orxan İcrai",
    creationDate: "12.01.2023",
  },
  {
    categoryName: "İdman",
    badgeCount: 25,
    createdBy: "Ramin Orucov",
    creationDate: "12.01.2023",
  },
];

// Əvvəl localStorage-da varsa onu götür, yoxdursa default datanı yaz
let storedData = JSON.parse(localStorage.getItem("categoryData"));

if (!storedData || storedData.length === 0) {
  storedData = defaultData;
  localStorage.setItem("categoryData", JSON.stringify(defaultData));
}

const myData = storedData;


  var activeData = myData;

  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: activeData,
    columns: [
      {
        data: function (row) {
          return `<span class="text-[13px] flex flex-start text-messages dark:text-primary-text-color-dark font-normal">${row.categoryName}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] flex flex-start text-messages dark:text-primary-text-color-dark font-normal">${row.badgeCount}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] flex flex-start text-messages dark:text-primary-text-color-dark font-normal">${row.createdBy}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] flex flex-start text-messages dark:text-primary-text-color-dark font-normal">${row.creationDate}</span>`;
        },
      },
      {
        data: function () {
          return `
              <div id="rewardCreateModal" class="relative inline-block text-left">
                <!-- Trigger icon -->
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer z-100"></div>

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
    pageLength: 100,

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

      $("#myTable tbody").on("click", "td:not(:last-child)", function () {
        const row = $(this).closest("tr");
        const rowData = $("#myTable").DataTable().row(row).data();

        localStorage.setItem("selectedRozet", JSON.stringify(rowData));
        window.location.href = "../rozetler/rozetlerInfo.html";
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

  // Search
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

const categoryModal = document.getElementById("categoryModal");

function openCategory() {
  categoryModal.classList.remove("hidden");
}

function closeCategoryModal() {
  categoryModal.classList.add("hidden");
}

// Modalın arxa fonuna kliklənəndə bağlansın
categoryModal.addEventListener("click", function (e) {
  const modalContent = categoryModal.querySelector("div.rounded-xl");
  if (modalContent && !modalContent.contains(e.target)) {
    closeCategoryModal();
  }
});

function createCategory() {
  const categoryModal = document.getElementById("categoryModal");
  const input = categoryModal.querySelector('input[type="text"]');
  const createBtn = categoryModal.querySelector(".bg-primary");
  const cancelBtn = categoryModal.querySelector(".bg-surface-bright");

  categoryModal.classList.remove("hidden");

  // Mövcud event təkrar yazılmasın deyə əvvəlcə təmizlə
  createBtn.onclick = null;
  cancelBtn.onclick = null;

  createBtn.onclick = function () {
    const newCategoryName = input.value.trim();
    if (newCategoryName === "") {
      alert("Kateqoriya adı boş ola bilməz.");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("az-AZ");

    // Yeni əlavə etdiyimiz sətiri həm DataTable-a, həm də localStorage-a əlavə et
    const newRow = {
      categoryName: newCategoryName,
      badgeCount: 0,
      createdBy: "Ramin Orucov",
      creationDate: formattedDate,
    };

    // localStorage-a əlavə et
    const storedData = JSON.parse(localStorage.getItem("categoryData")) || [];
    storedData.push(newRow);
    localStorage.setItem("categoryData", JSON.stringify(storedData));

    // DataTable-a əlavə et
    const dataTable = $("#myTable").DataTable();
    dataTable.row.add(newRow).draw(false);
    dataTable.page("last").draw("page");

    input.value = "";
    categoryModal.classList.add("hidden");
  };

  cancelBtn.onclick = function () {
    input.value = "";
    categoryModal.classList.add("hidden");
  };

  categoryModal.addEventListener("click", function modalOutsideClose(e) {
    const modalContent = categoryModal.querySelector(".rounded-xl");
    if (!modalContent.contains(e.target)) {
      input.value = "";
      categoryModal.classList.add("hidden");
      categoryModal.removeEventListener("click", modalOutsideClose); // birdəfəlik
    }
  });
}

// Edit modalı açmaq üçün funksiyanı yazırıq
function editItem(element) {
  const row = element.closest("tr");
  const rowData = $("#myTable").DataTable().row(row).data();

  const editModal = document.getElementById("editCategoryModal");
  const input = editModal.querySelector('input[type="text"]');
  const saveBtn = editModal.querySelector(".bg-primary");
  const cancelBtn = editModal.querySelector(".bg-surface-bright");

  // Input sahəsinə mövcud kateqoriya adını yaz
  input.value = rowData.categoryName;

  // Modalı aç
  editModal.classList.remove("hidden");

  // Düymələrin eventini sıfırla
  saveBtn.onclick = null;
  cancelBtn.onclick = null;

  // Yadda saxla (update et)
  saveBtn.onclick = function () {
    const updatedName = input.value.trim();
    if (updatedName === "") {
      alert("Kateqoriya adı boş ola bilməz.");
      return;
    }

    // DataTable daxilindəki row-u yenilə
    rowData.categoryName = updatedName;
    $("#myTable").DataTable().row(row).data(rowData).draw(false);

    editModal.classList.add("hidden");
  };

  cancelBtn.onclick = function () {
    editModal.classList.add("hidden");
  };

  // Modal çölünə klik etdikdə bağlansın
  editModal.addEventListener("click", function modalOutsideClose(e) {
    const modalContent = editModal.querySelector(".rounded-xl");
    if (!modalContent.contains(e.target)) {
      editModal.classList.add("hidden");
      editModal.removeEventListener("click", modalOutsideClose);
    }
  });
}

// Global dəyişən silinəcək sətri yadda saxlamaq üçün
let rowToDelete = null;

function deleteItem(element) {
  rowToDelete = $(element).closest("tr");

  const popup = document.createElement("div");
  popup.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[9999]";
  popup.innerHTML = `
      <div class="bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative">
        <div class="w-[306px] flex flex-col gap-3">
          <div class="w-10 h-10 rounded-full bg-error-hover flex items-center justify-center">
            <div class="icon stratis-trash-01 w-5 h-5 text-error"></div>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-[#1D222B] font-medium text-[15px]">Kateqoriyanı sil</div>
            <div class="text-secondary-text text-[13px] font-normal">
              Kateqoriyanı silmək istədiyinizə əminsiniz?
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
          <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
          <button class="cursor-pointer px-3 py-1 rounded-full text-on-primary bg-error transition" id="confirmDeleteBtn">Bəli, sil</button>
        </div>
      </div>
    `;

  document.body.appendChild(popup);

  document.getElementById("confirmDeleteBtn").onclick = function () {
    if (rowToDelete) {
      const rowData = $("#myTable").DataTable().row(rowToDelete).data();

      // ✅ DÜZGÜN açarı istifadə edərək localStorage-dan sil
      let storedData = JSON.parse(localStorage.getItem("categoryData")) || [];
      storedData = storedData.filter(
        (item) => item.categoryName !== rowData.categoryName
      );
      localStorage.setItem("categoryData", JSON.stringify(storedData));

      // ✅ Cədvəldən sil
      $("#myTable").DataTable().row(rowToDelete).remove().draw();
      rowToDelete = null;
    }
    popup.remove();
  };
}

