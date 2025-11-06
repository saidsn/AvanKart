$(document).ready(function () {
  // Verilənlər
  const myData = [
    {
      title: "Hesablaşma sənədi yaradıldı",
      message:
        "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.",
      receivers: ["Üzv müəssisələr", "Üzv şirkətlər"],
      author: "Ramin Orucov",
      date: "15.11.2024 - 13:29",
      status: "Aktiv",
    },
    {
      title: "Test Bildiriş",
      message:
        "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.",
      receivers: ["Üzv müəssisələr", "Üzv şirkətlər"],
      author: "Ramin Orucov",
      date: "15.11.2024 - 13:29",
      status: "Deaktiv",
    },
    {
      title: "Hesablaşma sənədi yaradıldı",
      message:
        "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.",
      receivers: ["Üzv müəssisələr", "Üzv şirkətlər"],
      author: "Ramin Orucov",
      date: "15.11.2024 - 13:29",
      status: "Aktiv",
    },
    {
      title: "Test Bildiriş",
      message:
        "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested.",
      receivers: ["Üzv müəssisələr", "Üzv şirkətlər"],
      author: "Ramin Orucov",
      date: "15.11.2024 - 13:29",
      status: "Deaktiv",
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
        orderable: false, // ✅ 1-ci sütun (checkbox) filter off
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
                <input type="checkbox" id="cb-${idx}" class="peer hidden">
                <label for="cb-${idx}" 
                    class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark 
                        peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                    <div class="icon stratis-check-01 scale-60 hidden peer-checked:block"></div>
                </label>

            `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.title}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.message}</span>`;
        },
      },
      {
        data: function (row) {
          return `
            <div class="flex flex-wrap gap-2">
              ${row.receivers
              .map(
                (r) => `
                    <div class="px-2 py-[3px] rounded-[14px] bg-container-2 dark:bg-container-2-dark text-[13px] text-messages dark:text-primary-text-color-dark font-medium w-fit max-w-[180px] truncate">
                      ${r}
                    </div>
                  `
              )
              .join("")}
            </div>
          `;
        },
      },

      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.author}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
        },
      },
      {
        data: function (row) {
          let color = row.status === "Aktiv" ? "bg-[#00A3FF]" : "bg-[#BFC8CC]";
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
                          <div class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                            <span class="icon stratis-cursor-06 text-[13px]"></span>
                            <span class="font-medium text-[#1D222B] text-[13px]">Aç</span>
                          </div>
                          <div class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                            <span class="icon stratis-edit-03 text-[13px]"></span>
                            <span class="font-medium text-[#1D222B] text-[13px]">Redaktə et</span>
                          </div>
                          <div class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-error-hover" onclick="openDeactivate(this)">
                            <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
                            <span class="font-medium text-error text-[13px]">Deaktiv et</span>
                          </div>
                          <div class="h-px bg-stroke my-1"></div>
                          <div class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-error-hover" onclick="openPopup(this)">
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
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (document.documentElement.classList.contains("dark")) {
            $(this).css("background-color", "#161E22"); // dark gray for dark mode
          } else {
            $(this).css("background-color", "#FAFAFA"); // light gray for light mode
          }
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      const isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      /// Bütün td-lərə border alt
      $(row)
        .find("td")
        .css({
          "border-bottom": `0.5px solid ${borderColor}`,
        });

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
        "border-right": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sol td (checkbox): padding və genişliyi sıfırla, border ver
      $(row)
        .find("td:first-child")
        .addClass("border-r-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .css({
          "padding-left": "0",
          "padding-right": "0",
          width: "48px", // checkbox sütunu üçün daha dar genişlik (uyğunlaşdıra bilərsən)
          "text-align": "center",
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      // Label içində margin varsa sıfırla
      $(row).find("td:first-child label").css({
        margin: "0",
        display: "inline-flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sağ td (üç nöqtə): border ver
      $(row)
        .find("td:last-child")
        .addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]");

    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      const isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
          $(this).text() +
          '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
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

      // Spacer-row əlavə olunur
      $("#myTable tbody tr.spacer-row").remove();

      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      const isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";
      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");

      $lastRow.find("td:first-child").css({
        "border-right": `0.5px solid ${borderColor}`,
      });

      $lastRow.find("td:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      // Səhifələmə düymələri
      $pagination.append(`
                    <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0
          ? "opacity-50 cursor-not-allowed"
          : "text-messages dark:text-primary-text-color-dark"
        }" 
                        onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                        <div class="icon stratis-chevron-left"></div>
                    </div>
                `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
                        <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages 
                                ${i === pageInfo.page
            ? "bg-[#F6D9FF] text-messages"
            : "bg-transparent text-tertiary-text"
          }"
                                onclick="changePage(${i})">${i + 1}</button>
                    `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
                    <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1
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
  $("#tableCheckbox").on("change", function () {
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

function openPopup() {
  $(".custom-popup").remove();

  const popupOverlay = document.createElement("div");
  popupOverlay.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[999]";

  const popup = document.createElement("div");
  popup.className =
    "bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative";

  popup.innerHTML = `
          <div class="w-[306px] flex flex-col gap-3">
            <div class="w-10 h-10 rounded-full bg-error-hover flex items-center justify-center">
              <div class="icon stratis-trash-01 w-5 h-5 text-error"></div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="text-[#1D222B] font-medium text-[15px]">Silmək</div>
              <div class="text-secondary-text text-[13px] font-normal">Bildirişi silmək istədiyinizə əminsiniz?</div>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
            <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
            <button onclick="openTesdiqModal()" class="cursor-pointer px-3 py-1 rounded-full text-on-primary bg-error transition">Bəli, bitir</button>
          </div>
        `;

  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);

  // Popup çölünə kliklə bağla
  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
}

function openTesdiqModal() {
  // Əgər artıq varsa, təkrar əlavə etmə
  if (document.getElementById("hesabtesdiqipop")) return;

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "hesabtesdiqipop";
  modalOverlay.className =
    "fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[1000]";

  modalOverlay.innerHTML = `
    <div class="relative w-[450px] h-[399px] border-[#0000001A] border-[2px]
        shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

      <div class="flex items-center justify-between p-6">
        <h2 class="text-[15px] font-medium text-messages">Hesab təsdiqi</h2>
        <img src="/public/images/Avankart/avankartPartner/Close.svg"
             alt="Close"
             class="cursor-pointer"
             onclick="closeTesdiqModal()">
      </div>

      <div class="flex flex-col mb-[24px] max-w-[400px] w-[100%] m-auto">
        <h2 class="pb-[4px] text-[17px] font-poppins font-semibold leading-[160%] text-messages">OTP</h2>
        <div class="flex flex-wrap gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
          <span class="font-medium">ramin.orucovvv@gmail.com</span>
          <span class="opacity-65 font-normal">email adresinə göndərilən 6 </span>
          <span class="opacity-65 font-normal">rəqəmli şifrəni daxil edin</span>
        </div>
      </div>

      <form>
        <div class="text-center space-y-4 max-w-[400px] w-[100%] m-auto">
          <div id="countdown"
               class="text-messages bg-inverse-on-surface rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium font-poppins">
            4:59
          </div>

          <div class="grid grid-cols-6 gap-2 mt-[8px]">
            ${[...Array(6)]
      .map(
        () => `
              <input type="text" maxlength="1"
                     class="otp-input text-center border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px]
                            placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus
                            focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                            transition-all ease-out duration-300"
              />`
      )
      .join("")}
          </div>
        </div>

        <div class="text-center flex justify-center max-w-[400px] w-[100%] m-auto">
          <p class="font-normal font-poppins leading-[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
          <a href="#" id="resendCode" class="text-[12px] font-medium font-poppins text-messages px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF]">Yenidən göndər</a>
        </div>

        <div class="absolute bottom-[24px] right-[12px] flex gap-[12px]">
          <button type="button"
                  class="text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] w-[83px] py-[6.5px] px-[18px] h-[34px] cursor-pointer"
                  onclick="closeTesdiqModal()">Ləğv et</button>
          <button type="submit"
                  class="text-[13px] text-on-primary font-medium bg-primary rounded-[50px] w-[91px] h-[34px] cursor-pointer">
            Təsdiqlə
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  document.body.classList.add("overflow-hidden");

  // Taymeri başlat (4 dəqiqə 59 saniyə = 299 saniyə)
  startCountdown(299);

  // Modal çölünə kliklənəndə bağla
  window.addEventListener("click", function outsideClick(e) {
    if (e.target === modalOverlay) {
      closeTesdiqModal();
      window.removeEventListener("click", outsideClick);
    }
  });
}

function closeTesdiqModal() {
  const modal = document.getElementById("hesabtesdiqipop");
  if (modal) modal.remove();
  document.body.classList.remove("overflow-hidden");
}

let countdownInterval; // Qlobal dəyişən – sonra dayandırmaq üçün

function startCountdown(durationInSeconds) {
  const countdownEl = document.getElementById("countdown");
  let remaining = durationInSeconds;

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  function updateCountdown() {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    countdownEl.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    if (remaining <= 0) {
      clearInterval(countdownInterval);
    } else {
      remaining--;
    }
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "resendCode") {
    e.preventDefault(); // Linkin default davranışını blokla
    startCountdown(299); // 4 dəq 59 san yenidən başla
  }
});

function openEditModal() {
  // Əgər modal artıq mövcuddursa, təkrar əlavə etmə
  if (document.getElementById("editCategoryModalOverlay")) return;

  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.5)] bg-opacity-50";
  overlay.id = "editCategoryModalOverlay";

  overlay.innerHTML = `
    <div class="bg-white w-[450px] border-3 border-stroke rounded-[16px] p-6">
      <div class="flex justify-between items-center mb-5 relative">
        <h2 class="text-[15px] font-medium text-[#1D222B]">Redaktə et</h2>
        <button class="text-[#1D222B]" onclick="closeEditModal()">
          <img src="/public/images/Avankart/prize/close.svg" alt="Close Modal" class="absolute top-0 right-0 cursor-pointer text-sm" />
        </button>
      </div>

      <form id="editCategoryForm" class="flex flex-col gap-4">
        <div>
          <label for="categoryName" class="block text-xs font-medium mb-[6px] text-secondary-text">
            Kateqoriya adı
          </label>
          <input type="text" id="categoryName" placeholder="Kateqoriya adını daxil edin"
                 class="w-full rounded-full border border-[#E0E0E0] px-3 py-[7.5px] text-xs font-normal placeholder-[#BFC8CC]" required />
        </div>

        <div class="relative">
          <label for="categoryDescription" class="block text-xs font-medium mb-[6px] text-secondary-text">
            Təsviri
          </label>
          <div class="relative">
            <textarea id="categoryDescription" placeholder="Daxil edin" maxlength="150"
                      class="w-full rounded-[12px] border border-[#E0E0E0] px-3 py-[7.5px] text-xs font-normal h-[75px] placeholder-[#BFC8CC] resize-none pr-12"></textarea>
            <span class="absolute bottom-2 right-[10px] text-[10px] text-tertiary-text pointer-events-none">max: 150</span>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-2">
          <button type="button" onclick="closeEditModal()"
                  class="cursor-pointer px-5 py-2 rounded-full bg-[#F8F8F8] dark:bg-[#1F1F1F] text-[#5E6470] text-sm">Ləğv et</button>
          <button type="submit"
                  class="cursor-pointer px-6 py-2 rounded-full bg-primary text-on-primary dark:hover:bg-focus-color-dark text-sm">Yarat</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("overflow-hidden");

  // Overlay-ə klikləsə, bağla
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeEditModal();
    }
  });
}

function closeEditModal() {
  const modal = document.getElementById("editCategoryModalOverlay");
  if (modal) modal.remove();
  document.body.classList.remove("overflow-hidden");
}

function openDeactivate() {
  $(".custom-popup").remove();

  const popupOverlay = document.createElement("div");
  popupOverlay.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[999]";

  const popup = document.createElement("div");
  popup.className =
    "bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative";

  popup.innerHTML = `
          <div class="w-[306px] flex flex-col gap-3">
            <div class="w-10 h-10 rounded-full bg-error-hover flex items-center justify-center">
              <div class="icon stratis-minus-circle-contained w-5 h-5 text-error"></div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="text-[#1D222B] font-medium text-[15px]">Deaktiv et</div>
              <div class="text-secondary-text text-[13px] font-normal">Bildirişi deaktiv etmək istədiyinizə əminsiniz?</div>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
            <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
            <button onclick="openTesdiqModal()" class="cursor-pointer px-3 py-1 rounded-full text-on-primary bg-error transition">Bəli, bitir</button>
          </div>
        `;

  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);

  // Popup çölünə kliklə bağla
  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
}



// Popup aç
function openNewNotificationModal() {
  const modal = document.getElementById('newNotificationModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
  }
}

// Popup bağla
function closeNewNotificationModal() {
  const modal = document.getElementById('newNotificationModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  }
}

// ...existing code...
['step-ilkin', 'step-sertler', 'step-planlama'].forEach(id => {
  document.getElementById(id).addEventListener('click', function () {
    // Step rəngləri
    ['step-ilkin', 'step-sertler', 'step-planlama'].forEach(otherId => {
      const el = document.getElementById(otherId);
      el.classList.remove('step-active');
      el.classList.add('step-inactive');
      el.querySelector('span').style.color = '#BFC8CC';
      el.querySelector('.icon').style.color = '#BFC8CC';
    });
    this.classList.remove('step-inactive');
    this.classList.add('step-active');
    this.querySelector('span').style.color = '#1D222B';
    this.querySelector('.icon').style.color = '#1D222B';

    // Content dəyişimi
    const form = document.querySelector('#newNotificationModal form');
    const sertler = document.getElementById('sertlerStepContent');
    const planlama = document.getElementById('planlamaStepContent');
    if (this.id === 'step-ilkin') {
      form.style.display = 'flex';
      sertler.style.display = 'none';
      if (planlama) planlama.style.display = 'none'; 
    } else if (this.id === 'step-sertler') {
      form.style.display = 'none';
      sertler.style.display = 'flex';
      if (planlama) planlama.style.display = 'none'; 
    } else {
      form.style.display = 'none';
      sertler.style.display = 'none';
      if (planlama) planlama.style.display = 'block'; 
    }
  });
});
// ...existing code...

document.querySelectorAll('#newNotificationModal .group').forEach(label => {
  label.addEventListener('click', function () {
    document.querySelectorAll('#newNotificationModal .group').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');
    // Dairəni sağa gətir
    label.querySelector('.radio-dot').style.background = '#7C3AED';
    document.querySelectorAll('#newNotificationModal .group:not(.selected) .radio-dot').forEach(dot => {
      dot.style.background = 'transparent';
    });
  });
});

// Modal çölünə klikləsə bağla
document.addEventListener('mousedown', function (e) {
  const modal = document.getElementById('newNotificationModal');
  if (modal && modal.classList.contains('flex')) {
    if (e.target === modal) {
      closeNewNotificationModal();
    }
  }
});


document.getElementById('conditionSelectBtn').onclick = function () {
  document.getElementById('conditionPopup').classList.remove('hidden');
};
// Bağla popup
function closeConditionPopup() {
  document.getElementById('conditionPopup').classList.add('hidden');
}
// Search filter (sadə)
document.getElementById('conditionSearchInput').addEventListener('input', function (e) {
  const val = e.target.value.toLowerCase();
  document.querySelectorAll('#conditionPopup .font-semibold').forEach(function (item) {
    item.style.display = item.textContent.toLowerCase().includes(val) ? '' : 'none';
  });
});



document.getElementById('conditionSelectBtn').onclick = function () {
  document.getElementById('conditionPopup').classList.remove('hidden');
};

// Popup bağlanması
function closeConditionPopup() {
  document.getElementById('conditionPopup').classList.add('hidden');
}

// Şərt seçimi və düyməyə yazdırılması
document.querySelectorAll('#conditionPopup .font-semibold').forEach(function (item) {
  item.onclick = function () {
    document.getElementById('conditionSelectBtn').childNodes[0].textContent = this.textContent;
    closeConditionPopup();
  };
});

// Search filter
document.getElementById('conditionSearchInput').addEventListener('input', function (e) {
  const val = e.target.value.toLowerCase();
  document.querySelectorAll('#conditionPopup .font-semibold').forEach(function (item) {
    item.style.display = item.textContent.toLowerCase().includes(val) ? '' : 'none';
  });
});




const operatorBtn = document.getElementById('operatorSelectBtn');
const operatorPopup = document.getElementById('operatorPopup');
const operatorChevron = document.getElementById('operatorChevron');
const operatorSearchIcon = document.getElementById('operatorSearchIcon');
const operatorSelectedText = document.getElementById('operatorSelectedText');

operatorBtn.onclick = function (e) {
  e.stopPropagation();
  operatorPopup.classList.toggle('hidden');
  operatorBtn.classList.toggle('border-focus');
  operatorBtn.classList.toggle('shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]');
  // Icon dəyişimi
  if (!operatorPopup.classList.contains('hidden')) {
    operatorChevron.style.display = 'none';
    operatorSearchIcon.style.display = 'inline-block';
  } else {
    operatorChevron.style.display = 'inline-block';
    operatorSearchIcon.style.display = 'none';
  }
};

document.querySelectorAll('.operator-item').forEach(function (item) {
  item.onclick = function () {
    operatorSelectedText.textContent = this.textContent;
    operatorPopup.classList.add('hidden');
    operatorBtn.classList.remove('border-focus');
    operatorBtn.classList.remove('shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]');
    operatorChevron.style.display = 'inline-block';
    operatorSearchIcon.style.display = 'none';
  };
});

window.addEventListener('click', function (e) {
  if (!operatorBtn.contains(e.target) && !operatorPopup.contains(e.target)) {
    operatorPopup.classList.add('hidden');
    operatorBtn.classList.remove('border-focus');
    operatorBtn.classList.remove('shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]');
    operatorChevron.style.display = 'inline-block';
    operatorSearchIcon.style.display = 'none';
  }
});


document.querySelectorAll('.and-or-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.and-or-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});


// ...existing code...
document.getElementById('addConditionBtn').addEventListener('click', function (e) {
  e.stopPropagation();
  const popup = document.getElementById('addConditionPopup');
  popup.classList.toggle('hidden');
});

// Popup-u bağlamaq üçün:
document.addEventListener('click', function (e) {
  const popup = document.getElementById('addConditionPopup');
  if (!popup.classList.contains('hidden')) {
    popup.classList.add('hidden');
  }
});
// ...existing code...



// ...existing code...

document.addEventListener('DOMContentLoaded', function () {
  const addConditionBtn = document.getElementById('addConditionBtn');
  const addConditionPopup = document.getElementById('addConditionPopup');
  const conditionPopup = document.getElementById('conditionPopup');

  // Popup açılma
  if (addConditionBtn && addConditionPopup) {
    addConditionBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      addConditionPopup.style.display = 'flex';
    });

    // Qrup əlavə et və Şərt əlavə et düymələri üçün
    const popupButtons = addConditionPopup.querySelectorAll('button');
    popupButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        addConditionPopup.style.display = 'none';
        conditionPopup.style.display = 'flex';
      });
    });

    // Səhifəyə klik edəndə popup-u bağla
    document.addEventListener('click', function (e) {
      if (!addConditionPopup.contains(e.target) && e.target !== addConditionBtn) {
        addConditionPopup.style.display = 'none';
      }
    });
  }
});


function closeConditionPopup() {
  const conditionPopup = document.getElementById('conditionPopup');
  if (conditionPopup) conditionPopup.style.display = 'none';
}




document.addEventListener("DOMContentLoaded", function () {
  const planlamaStepContent = `
  <div class="flex gap-4 items-start">
    <div class="flex flex-col w-[220px]">
      <label class="block text-[13px] font-medium mb-1 text-[#1D222B] ">Göndərilmə Tarixi və Vaxtı</label>
      <div class="text-[11px] text-[#1D222B] opacity-50 mb-2">Bildirişi göndərilmə tarixini və saatını seçə bilərsiniz</div>
    </div>
    <div class="flex gap-4 ml-4 mt-4">
      <div onclick="openDatePicker('startDate')" class="relative w-[159px] group h-[34px]">
        <input id="startDate" type="date" class="date-input py-[6.5px] text-[12px] font-medium text-messages placeholder-outline border border-stroke rounded-full px-3 w-full appearance-none hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 cursor-pointer" placeholder="dd/mm/yyyy" name="start_date">
        <div class="icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-messages group-focus-within:text-focus cursor-pointer"></div>
      </div>
      <div class="relative w-[159px] h-[50px] group mt-1">
        <input id="timer" type="timer" class="timer-input py-[6.5px] text-[12px] font-medium text-messages placeholder-outline border border-stroke rounded-full px-3 w-full appearance-none hover:bg-input-hover  focus:ring-0 focus:outline-none  cursor-pointer" placeholder="Vaxtı təyin edin" name="start_timer">
        <div class="icon stratis-stopwatch-04 absolute right-3 top-1/3 transform -translate-y-1/2 w-4 h-4 text-messages  cursor-pointer"></div>
      </div>
    </div>
  </div>
  <div class="mt-4">
    <label class="block text-[13px] font-medium mb-1 text-[#1D222B]">Təkrarlama müddəti</label>
    <div class="flex items-center justify-between w-full border-b border-[#E0E0E0] relative">
      <span class="text-[#1D222B80] text-[11px]">Təkrarlama müddətini seçə bilərsiniz</span>
      <button type="button" id="planlamaRepeatBtn" class="flex items-center gap-2 px-3 py-2 rounded-full border border-surface-variant text-[12px] text-[#1D222BA6] hover:bg-input-hover transition cursor-pointer">
        <span id="repeatSelected">Təkrarlama müddəti</span>
        <img src="/public/images/Avankart/NotificationsModal/chevron-down.svg" alt="" class="w-[18px] h-[18px]">
      </button>
      <div id="repeatDropdown" class="hidden absolute right-0 top-[110%] bg-white rounded-xl shadow-lg py-2 w-[140px] z-50">
        <div class="px-4 py-2 cursor-pointer hover:bg-input-hover text-[#1D222B] text-[13px]" data-value="Aylıq">Aylıq</div>
        <div class="px-4 py-2 cursor-pointer hover:bg-input-hover text-[#1D222B] text-[13px]" data-value="Həftəlik">Həftəlik</div>
      </div>
    </div>
  </div>
  <div class="flex justify-end gap-2 mt-[450px]">
    <button type="button" onclick="closeNewNotificationModal()" class="px-4 py-2 rounded-full bg-[#F8F9FF] cursor-pointer text-[#40484C] hover:text-[#1D222B] text-[13px] font-medium">Ləğv et</button>
    <button type="submit" class="px-4 py-2 rounded-full bg-[#745086] hover:bg-[#88649A] text-white text-xs font-medium cursor-pointer">Yarat</button>
  </div>
`;

  // Açılan dropdown funksionallığı
  document.addEventListener("click", function (e) {
    const btn = document.getElementById("planlamaRepeatBtn");
    const dropdown = document.getElementById("repeatDropdown");
    if (btn && btn.contains(e.target)) {
      dropdown.classList.toggle("hidden");
    } else if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
    // Seçim kliklənəndə düyməyə yazılsın
    if (dropdown && dropdown.contains(e.target) && e.target.dataset.value) {
      document.getElementById("repeatSelected").textContent = e.target.dataset.value;
      dropdown.classList.add("hidden");
    }
  });




  // ...existing code...

  function createTimePicker(targetInput) {
    // Əgər artıq varsa, sil
    const oldPicker = document.getElementById("customTimePicker");
    if (oldPicker) oldPicker.remove();

    // Inputun koordinatlarını al
    const rect = targetInput.getBoundingClientRect();

    // Picker div
    const picker = document.createElement("div");
    picker.id = "customTimePicker";
    picker.className = `
    absolute bg-white rounded-xl shadow-lg px-4 pt-4 pb-4 flex flex-col items-center z-[999]
    w-[254px]
  `;
    picker.style.left = (rect.left - 30) + "px";
    picker.style.top = rect.bottom + window.scrollY + 8 + "px";

    picker.innerHTML = `
    <div class="absolute -top-4 left-8 w-0 h-0">
      <div class="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[16px] border-b-white"></div>
    </div>
    <div class="flex gap-8">
      <div class="flex flex-col items-center">
        <button id="hourUp" class="bg-none border-none text-[24px] cursor-pointer">
         <img src="/public/images/Avankart/NotificationsModal/Arrow.svg" alt="up" class="w-[24px] h-[24px]" />
        </button>
        <span id="hourVal" class="text-[18px]  text-[#1D222B]">12</span>
        <button id="hourDown" class="bg-none border-none text-[24px] cursor-pointer">
          <img src="/public/images/Avankart/NotificationsModal/downArrow.svg" alt="down" class="w-[24px] h-[24px]" />
        </button>
      </div>
      <span class="text-[18px] font-medium mt-[23px] text-[#1D222BA6]">:</span>
      <div class="flex flex-col items-center">
        <button id="minuteUp" class="bg-none border-none text-[24px] cursor-pointer">
          <img src="/public/images/Avankart/NotificationsModal/Arrow.svg" alt="up" class="w-[24px] h-[24px]" />
        </button>
        <span id="minuteVal" class="text-[18px]  text-[#1D222B]">00</span>
        <button id="minuteDown" class="bg-none border-none text-[24px] cursor-pointer">
          <img src="/public/images/Avankart/NotificationsModal/downArrow.svg" alt="down" class="w-[24px] h-[24px]" />
        </button>
      </div>
      <div class="flex flex-col items-center">
        <button id="ampmUp" class="bg-none border-none text-[24px] cursor-pointer">
          <img src="/public/images/Avankart/NotificationsModal/Arrow.svg" alt="up" class="w-[24px] h-[24px]" />
        </button>
        <span id="ampmVal" class="text-[18px]  text-[#1D222B]">AM</span>
        <button id="ampmDown" class="bg-none border-none text-[24px] cursor-pointer">
          <img src="/public/images/Avankart/NotificationsModal/downArrow.svg" alt="down" class="w-[24px] h-[24px]" />
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(picker);

    // Saat və dəqiqə dəyişimi
    let hour = 12, minute = 0, ampm = "AM";
    function updateDisplay() {
      picker.querySelector("#hourVal").textContent = hour.toString().padStart(2, "0");
      picker.querySelector("#minuteVal").textContent = minute.toString().padStart(2, "0");
      picker.querySelector("#ampmVal").textContent = ampm;
    }
    updateDisplay();

    picker.querySelector("#hourUp").onclick = function () {
      hour = hour === 12 ? 1 : hour + 1;
      updateDisplay();
    };
    picker.querySelector("#hourDown").onclick = function () {
      hour = hour === 1 ? 12 : hour - 1;
      updateDisplay();
    };
    picker.querySelector("#minuteUp").onclick = function () {
      minute = minute === 59 ? 0 : minute + 1;
      updateDisplay();
    };
    picker.querySelector("#minuteDown").onclick = function () {
      minute = minute === 0 ? 59 : minute - 1;
      updateDisplay();
    };
    picker.querySelector("#ampmUp").onclick = function () {
      ampm = ampm === "AM" ? "PM" : "AM";
      updateDisplay();
    };
    picker.querySelector("#ampmDown").onclick = function () {
      ampm = ampm === "AM" ? "PM" : "AM";
      updateDisplay();
    };

    // Çölə klikləsə bağla və inputa yaz
    setTimeout(() => {
      document.addEventListener("mousedown", function handler(e) {
        if (!picker.contains(e.target) && e.target !== targetInput) {
          // Tesdiqlə funksiyası: input-a yaz və bağla
          targetInput.value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
          picker.remove();
          document.removeEventListener("mousedown", handler);
        }
      });
    }, 100);
  }

  // ...existing code...
  // "Vaxtı təyin edin" inputuna və ya ikonuna kliklədikdə aç
  document.addEventListener("click", function (e) {
    const timerInput = document.getElementById("timer");
    if (timerInput && (e.target === timerInput || e.target.classList.contains("stratis-stopwatch-04"))) {
      createTimePicker(timerInput);
      timerInput.setAttribute("readonly", "readonly");
    }
  });
  // ...existing code...

  // "Vaxtı təyin edin" inputuna kliklədikdə aç
  document.addEventListener("click", function (e) {
    const timerInput = document.getElementById("timer");
    if (timerInput && (e.target === timerInput || e.target.classList.contains("stratis-stopwatch-04"))) {
      createTimePicker(timerInput);
      timerInput.setAttribute("readonly", "readonly");
    }
  });
  // ...existing code...
  function closeTimePicker() {
    const picker = document.getElementById("customTimePicker");
    if (picker) picker.remove();
    document.body.classList.remove("overflow-hidden");
  }

  // "Vaxtı təyin edin" inputuna kliklədikdə aç
  document.addEventListener("DOMContentLoaded", function () {
    const timerInput = document.getElementById("timer");
    if (timerInput) {
      timerInput.addEventListener("focus", openTimePicker);
      timerInput.addEventListener("click", openTimePicker);
      timerInput.setAttribute("readonly", "readonly"); // Manual yazmanı blokla
    }
  });
  // ...existing code...


  // ...existing code...

  const stepPlanlama = document.getElementById("step-planlama");
  if (stepPlanlama) {
    stepPlanlama.addEventListener("click", function () {
      // Step aktivliklərini dəyiş
      document.getElementById("step-ilkin").classList.remove("step-active");
      document.getElementById("step-ilkin").classList.add("step-inactive");
      document.getElementById("step-sertler").classList.remove("step-active");
      document.getElementById("step-sertler").classList.add("step-inactive");
      document.getElementById("step-planlama").classList.remove("step-inactive");
      document.getElementById("step-planlama").classList.add("step-active");

      // Digər step contentləri gizlət
      document.querySelector("form.flex-1").style.display = "none";
      document.getElementById("sertlerStepContent").style.display = "none";

      // Planlama contentini göstər
      const planlamaDiv = document.getElementById("planlamaStepContent");
      if (planlamaDiv) {
        planlamaDiv.innerHTML = planlamaStepContent;
        planlamaDiv.style.display = "block";

        // === BURADA TIMER INPUT üçün event-ləri əlavə et ===
        const timerInput = document.getElementById("timer");
        if (timerInput) {
          timerInput.addEventListener("focus", openTimePicker);
          timerInput.addEventListener("click", openTimePicker);
          timerInput.setAttribute("readonly", "readonly");
        }
      }
    });
  }
  // ...existing code...
});
