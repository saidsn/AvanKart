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
        data: function (row) {
          const isActive = row.status === "Aktiv";
          const actionFn = isActive
            ? "openDeactivate(this)"
            : "openActivate(this)";
          const actionLabel = isActive ? "Deaktiv et" : "Aktiv et";
          const iconClass = isActive
            ? "stratis-minus-circle-contained text-error"
            : "stratis-file-check-01 text-[#1D222B]";
          const textClass = isActive ? "text-error" : "text-[#1D222B]";
          const hoverClass = isActive
            ? "hover:bg-error-hover"
            : "hover:bg-input-hover";

          return `
            <div id="rewardCreateModal" class="relative inline-block text-left">
              <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"></div>

              <div class="hidden absolute right-[-12px] mt-2 w-40 z-50 dropdown-menu">
                <div class="relative h-[8px]">
                  <div class="absolute top-1/2 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-white z-50"></div>
                </div>

                <div class="rounded-xl shadow-lg bg-white overflow-hidden relative z-50">
                  <div class="py-[3.5px] text-sm">
                    <div onclick="openDetails(this)" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                      <span class="icon stratis-cursor-06 text-[13px]"></span>
                      <span class="font-medium text-[#1D222B] text-[13px]">Aç</span>
                    </div>
                    <div class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer" onclick="openEditModal()">
                      <span class="icon stratis-edit-03 text-[13px]"></span>
                      <span class="font-medium text-[#1D222B] text-[13px]">Redaktə et</span>
                    </div>
                    <div class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer ${hoverClass}" onclick="${actionFn}">
                      <span class="icon ${iconClass} text-[13px]"></span>
                      <span class="font-medium ${textClass} text-[13px]">${actionLabel}</span>
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

      $("#myTable tbody").on("click", "td", function () {
        const columnIndex = $(this).index(); // Hansı sütuna klikləndiyini götür
        const table = $("#myTable").DataTable();

        // Əgər 1-ci (checkbox) və ya sonuncu (əlaqə) sütuna klik edilibsə, heç nə etmə
        if (
          columnIndex === 0 ||
          columnIndex === table.columns().header().length - 1
        )
          return;

        const row = $(this).closest("tr");
        const rowData = table.row(row).data();

        // Trigger elementi olaraq current <td> ötürülür
        openDetails(this);
      });
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
                    <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                      pageInfo.page === 0
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

  // Əgər bu dropdown artıq açıqdırsa, bağla
  const wasHidden = dropdown.classList.contains("hidden");
  dropdown.classList.toggle("hidden");

  // Əgər indi açılıbsa, çöl klikini izləməyə başla
  if (wasHidden) {
    const closeOnOutsideClick = (event) => {
      // Əgər klik dropdown və ya trigger içində deyilsə, bağla
      if (!wrapper.contains(event.target)) {
        dropdown.classList.add("hidden");
        document.removeEventListener("click", closeOnOutsideClick);
      }
    };

    // Asinxron əlavə et ki, bu klik özü ilə trigger olmasın
    setTimeout(() => {
      document.addEventListener("click", closeOnOutsideClick);
    }, 0);
  }
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

function openActivate() {
  $(".custom-popup").remove();

  const popupOverlay = document.createElement("div");
  popupOverlay.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[999]";

  const popup = document.createElement("div");
  popup.className =
    "bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative";

  popup.innerHTML = `
          <div class="w-[306px] flex flex-col gap-3">
            <div class="w-10 h-10 rounded-full bg-inverse-on-surface flex items-center justify-center">
              <div class="icon stratis-file-check-01 w-5 h-5 text-[#000000]"></div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="text-[#1D222B] font-medium text-[15px]">Aktiv et</div>
              <div class="text-secondary-text text-[13px] font-normal">Müəssisəni aktivləşdirmək istədiyinizə əminsiniz?</div>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
            <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
            <button onclick="openTesdiqModal()" class="cursor-pointer px-3 py-1 rounded-full text-on-primary bg-success transition">Bəli, təsdiqlə</button>
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

function openDetails(triggerElement) {
  // Əvvəlki panel və overlay varsa, sil
  document.getElementById("notificationDetailsOverlay")?.remove();

  // Satır məlumatını götür
  const row = $(triggerElement).closest("tr");
  const rowData = $("#myTable").DataTable().row(row).data();

  // Overlay yarat
  const overlay = document.createElement("div");
  overlay.id = "notificationDetailsOverlay";
  overlay.className =
    "fixed inset-0 z-[998] bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex justify-end";

  // Panel divi yarat
  const panel = document.createElement("div");
  panel.id = "notificationDetailsPanel";
  panel.className =
    "custom-scroll h-full w-[480px] bg-white dark:bg-[#1e1e2d] shadow-lg overflow-y-auto transition-transform duration-300 border-l border-[#E0E0E0] dark:border-[#FFFFFF1A]";

  // Panel məzmunu
  panel.innerHTML = `
    <div class="space-y-4 font-sans text-sm py-5">
      <div class="flex justify-between items-center pb-5 border-b-[0.5px] border-stroke px-3">
        <h2 class="text-[15px] font-medium text-messages">Bildiriş məlumatları</h2>
        <div class="flex items-center space-x-2">
          <div class="cursor-pointer flex items-center gap-1">
            <div class="icon stratis-edit-03 w-5 h-5 cursor-pointer"></div>
            <button class="text-[#1D222B] text-[13px] font-medium cursor-pointer">Redaktə et</button>
          </div>
          <div onclick="openDeactivate()" class="hover:bg-error-hover py-1 px-3 rounded-md cursor-pointer flex items-center gap-1 text-error">
            <div class="icon stratis-minus-circle-contained w-5 h-5 cursor-pointer"></div>
            <button class="text-[13px] font-medium cursor-pointer">Deaktiv et</button>
          </div>
          <div onclick="openPopup()" class="hover:bg-error-hover py-1 px-3 rounded-md cursor-pointer flex items-center gap-1 text-error">
            <div class="icon stratis-trash-01 w-5 h-5 cursor-pointer"></div>
            <button class="text-[13px] font-medium cursor-pointer">Sil</button>
          </div>
          <img src="/public/images/Avankart/avankartPartner/Close.svg"
             alt="Close"
             class="cursor-pointer"
             onclick="document.getElementById('notificationDetailsOverlay').remove()" />
        </div>
      </div>

      <div class="border-b-[.5px] border-stroke mx-3 pb-3">
        <label class="text-tertiary-text text-xs font-normal">Bildiriş başlığı</label>
        <div class="mt-3 font-medium text-messages text-[13px]">${rowData.title}</div>
      </div>

      <div class="border-b-[.5px] border-stroke mx-3 pb-3">
        <label class="text-tertiary-text text-xs font-normal">Mesaj məzmunu</label>
        <p class="mt-1 text-messages text-[13px]">${rowData.message}</p>
      </div>

      <div class="border-b-[.5px] border-stroke mx-3 pb-3">
        <label class="text-tertiary-text text-xs font-normal">Bildirişi kimlər alacaq?</label>
        <div class="mt-3 flex flex-wrap gap-2">
          ${rowData.receivers
            .map(
              (r) =>
                `<span class="bg-sidebar-item border-[.5px] border-stroke text-messages px-3 py-1 rounded-full">${r}</span>`
            )
            .join("")}
        </div>
      </div>

      <div class="flex items-center justify-between text-sm border-b-[.5px] border-stroke mx-3 pb-3">
        <span class="text-tertiary-text text-xs font-normal">E-poçt bildirşi</span>
        <div class="icon stratis-check-broken w-5 h-5 text-success"></div>
      </div>

      <div class="flex items-center justify-between text-sm border-b-[.5px] border-stroke mx-3 pb-3">
        <span class="text-tertiary-text text-xs font-normal">SMS bildirşi</span>
        <div class="icon stratis-check-broken w-5 h-5 text-success"></div>
      </div>

      <div class="flex items-center justify-between text-sm border-b-[.5px] border-stroke mx-3 pb-3">
        <span class="text-tertiary-text text-xs font-normal">Status</span>
        <span class="flex items-center gap-2">
          <span class="w-[6px] h-[6px] rounded-full ${
            rowData.status === "Aktiv" ? "bg-[#00A3FF]" : "bg-[#BFC8CC]"
          }"></span>
          <span class="text-messages dark:text-primary-text-color-dark">${rowData.status}</span>
        </span>
      </div>

      <div class="flex items-center justify-between border-b-[.5px] border-stroke mx-3 pb-3">
        <span class="text-tertiary-text text-xs font-normal">Təkrarlanma müddəti</span>
        <span class="text-messages dark:text-primary-text-color-dark">Aylıq</span>
      </div>

      <div class="overflow-hidden px-3">
        <div class="rounded-lg grid grid-cols-3 text-left bg-table-hover text-secondary-text font-normal py-2 px-3">
          <div class="text-left">Şərt Adı</div>
          <div class="text-center">Operator</div>
          <div class="text-right">Dəyər</div>
        </div>
        <div class="mt-3 grid grid-cols-3 text-left border-b-[.5px] py-2 px-3 border-stroke dark:border-[#FFFFFF1A] text-[13px] font-normal">
          <div>Balans yoxlanışı</div>
          <div class="text-center">==</div>
          <div class="text-right">15.00 AZN</div>
        </div>
        <div class="grid grid-cols-3 text-left border-b-[.5px] py-2 px-3 border-stroke dark:border-[#FFFFFF1A] text-[13px] font-normal">
          <div>Son ödəniş tarixi</div>
          <div class="text-center">=&gt;</div>
          <div class="text-right">12.01.2024</div>
        </div>
      </div>
    </div>
  `;

  // Overlayə kliklə bağlama
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

