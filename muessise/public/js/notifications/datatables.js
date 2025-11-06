// 🚀 Initialize counts on load (REAL DATA from server)
$(document).ready(function () {
  console.log("🔔 Enhanced Notifications DataTable başladı");

  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  let currentFilter = "all";
  let currentType = "corporate"; // ya 'personal'
  let startDate = $("#startDate").val() || "";
  let endDate = $("#endDate").val() || "";
  let filterStatus = [];

  // 📊 Count tracking variables
  let notificationCounts = {
    corporate: { total: 0, read: 0, unread: 0 },
    personal: { total: 0, read: 0, unread: 0 },
  };

  const table = $("#myTable").DataTable({
    info: false,
    dom: "t",
    processing: true,
    serverSide: true,
    ajax: {
      url: "/notifications/personal-table", // Use same endpoint for both
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: function (d) {
        d.start_date = $("#startDate").val() || "";
        d.end_date = $("#endDate").val() || "";
        d.type = currentType; // Send category to backend
        d.category = currentType; // Alternative field name
        // ✅ statusleri checkboxlardan al
        if ($("#newCheckbox1").is(":checked")) filterStatus.push("unread");
        if ($("#readCheckbox2").is(":checked")) filterStatus.push("read");

        // hiçbir şey seçilmediyse “all” gönder
        d.statuses = filterStatus.length ? filterStatus : [];
      },
      dataSrc: function (json) {
        // 📊 Count-ları server response-dan yenilə
        if (json.counts) {
          notificationCounts = json.counts;
          updateDisplayCounts();
        }
        return json.data || [];
      },
    },
    columns: [
      {
        data: function (row) {
          const statusColor =
            row.status === "Yeni"
              ? "text-[#7086FD]"
              : "text-tertiary-text dark:text-tertiary-text-color-dark";
          const statusIcon =
            row.status === "Yeni"
              ? `<div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>`
              : `<img src="/images/notifications/doubleCheck.svg" alt="icon">`;

          return `
            <div class="flex justify-between px-3 py-2 border-b-[.5px] border-stroke dark:border-[#FFFFFF1A] hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer"
                 onclick="openNotificationDetails('${row.id}')">
              <div class="flex gap-3 items-center">
                <div>
                  <img src="/images/notifications/notificationLogo.svg" class="block dark:hidden">
                  <img src="/images/notifications/profileDarkMode.svg" class="hidden dark:block">
                </div>
                <div class="flex flex-col gap-[2px]">
                  <div class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">${
                    row.title
                  }</div>
                  <div class="text-[11px] font-normal text-secondary-text dark:text-tertiary-text-color-dark">${
                    row.content || row.message
                  }</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div>
                  <div class="flex items-center gap-1 justify-end">
                    <div class="text-[10px] font-normal ${statusColor}">${
            row.status
          }</div>
                    ${statusIcon}
                  </div>
                  <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">${
                    row.date
                  }</p>
                </div>
                <div id="rewardCreateModal" class="relative inline-block text-left">
                  <div onclick="toggleDropdown(this); event.stopPropagation();" class="icon stratis-dot-vertical w-5 h-5 cursor-pointer"></div>
                  <div class="hidden absolute right-[-12px] w-[191px] z-50 dropdown-menu">
                    <div class="relative h-[8px]">
                      <div class="absolute top-1/2 right-4 w-3 h-3 bg-white dark:bg-menu-dark rotate-45 border-l border-t border-white dark:border-menu-dark"></div>
                    </div>
                    <div class="rounded-[8px] shadow-lg bg-white dark:bg-menu-dark overflow-hidden">
                      <div class="py-[3.5px] text-[13px]">
                        <div class="text-messages dark:text-primary-text-color-dark flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover dark:hover:bg-input-hover-dark"
                             onclick="markAsRead('${row.id}', '${
            row.status_data ?? "unread"
          }'); event.stopPropagation();">
                          <div class="icon stratis-check-02 text-[10px]"></div>
                          ${
                            row.status_data !== "unread" ? "Oxundu" : "Oxunmadı"
                          } olaraq işarələ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        },
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 10,
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

      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      // Səhifələmə düymələri
      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
          pageInfo.page === 0
            ? "text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-primary-text-color-dark"
        }" 
            onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
            <div class="icon stratis-chevron-left"></div>
        </div>
      `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
          <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
                  ${
                    i === pageInfo.page
                      ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                      : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
                  }"
                  onclick="changePage(${i})">${i + 1}</button>
        `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
          pageInfo.page === pageInfo.pages - 1
            ? "text-[#636B6F] cursor-not-allowed"
            : "text-tertiary-text dark:text-primary-text-color-dark"
        }" 
            onclick="changePage(${pageInfo.page + 1})">
            <div class="icon stratis-chevron-right"></div>
        </div>
      `);
    },
  });

  // 📊 Count-ları göstərmək (REAL DATA)
  function updateDisplayCounts() {
    const counts = notificationCounts[currentType];

    // Real sayıları daxil et - fake sayılar yox
    $("#total-count .count").text(counts.total);
    $("#read-count .count").text(counts.read);
    $("#unread-count .count").text(counts.unread);

    // Full text update for elements without .count span
    $("#total-count").html(
      `Hamısı (<span class="count">${counts.total ?? 0}</span>)`
    );
    $("#read-count").html(
      `Oxunmuşlar (<span class="count">${counts.read ?? 0}</span>)`
    );
    $("#unread-count").html(
      `Oxunmamışlar (<span class="count">${counts.unread ?? 0}</span>)`
    );

    // 🔔 Sidebar unread count (həmişə total unread from both categories)
    const totalUnread =
      notificationCounts.corporate.unread + notificationCounts.personal.unread;
    updateSidebarNotificationCount(totalUnread);

    console.log(`📊 REAL Counts updated - ${currentType}:`, counts);
    console.log(`📊 Total unread (sidebar): ${totalUnread}`);
  }

  // 🔔 Sidebar notification count yeniləmək (REAL DATA)
  function updateSidebarNotificationCount(count) {
    const sidebarElement = document.getElementById(
      "sidebar-notification-count"
    );
    if (sidebarElement) {
      if (count > 0) {
        sidebarElement.textContent = count;
        sidebarElement.style.display = "inline-flex";
        sidebarElement.classList.remove("hidden");
      } else {
        sidebarElement.style.display = "none";
        sidebarElement.classList.add("hidden");
      }
    }

    console.log(`🔔 Sidebar badge updated with REAL count: ${count}`);
  }

  // 🔗 Notification details
  window.openNotificationDetails = function (notificationId) {
    console.log("📋 Notification açılır:", notificationId);
    // Notification detail səhifəsinə yönləndir və ya modal aç
    // window.location.href = `/notifications/${notificationId}`;
  };

  // ✅ Mark as read
  window.markAsRead = function (notificationId, status) {
    console.log("✅ Marking as read:", notificationId);

    // Backend-ə mark as read request göndər
    $.ajax({
      url: "/notifications/setas",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: JSON.stringify({
        id: notificationId,
        type: currentType,
        status,
      }),
      contentType: "application/json",
      success: function (response) {
        // Table-ı yenilə
        table.ajax.reload(null, false); // false = pagination saxla
        // Dropdown-u bağla
        document
          .querySelectorAll(".dropdown-menu")
          .forEach((el) => el.classList.add("hidden"));
      },
      error: function (error) {
        console.error("❌ Mark as read failed:", error);
      },
    });
  };

  // Sayfa geçiş
  window.changePage = function (page) {
    table.page(page).draw("page");
  };

  // Arama inputu
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Filter butonları
  $("#filter-notifications").on("click", function (e) {
    e.preventDefault();

    // calculate startDate and endDate
    startDate = $("#startDate").val();
    endDate = $("#endDate").val();

    // calculate filterStatus
    filterStatus = [];
    if ($("#newCheckbox1").is(":checked")) filterStatus.push("read");
    if ($("#readCheckbox2").is(":checked")) filterStatus.push("unread");

    // if no status selected, add "all"
    if (filterStatus.length === 0) filterStatus = ["all"];

    // reload table
    table.ajax.reload();

    // close modal
    closeFilterModal();
  });

  // Bildiriş tipi (corporate/personal) geçiş
  $("#corporateNotifications").on("click", function () {
    if (currentType === "corporate") return;

    currentType = "corporate";

    // Update button styles
    $(this)
      .addClass(
        "active bg-inverse-on-surface dark:bg-surface-variant-dark text-messages dark:text-primary-text-color-dark"
      )
      .removeClass(
        "text-tertiary-text dark:text-tertiary-text-color-dark cursor-pointer"
      );

    $("#personalNotifications")
      .removeClass(
        "active bg-inverse-on-surface dark:bg-surface-variant-dark text-messages dark:text-primary-text-color-dark"
      )
      .addClass(
        "text-tertiary-text dark:text-tertiary-text-color-dark cursor-pointer"
      );

    // URL dəyişdirmə yox, data parameter göndər
    $("#pageCount").text("1 / 1");
    table.ajax.reload();
  });

  $("#personalNotifications").on("click", function () {
    if (currentType === "personal") return;

    currentType = "personal";

    // Update button styles
    $(this)
      .addClass(
        "active bg-inverse-on-surface dark:bg-surface-variant-dark text-messages dark:text-primary-text-color-dark"
      )
      .removeClass(
        "text-tertiary-text dark:text-tertiary-text-color-dark cursor-pointer"
      );

    $("#corporateNotifications")
      .removeClass(
        "active bg-inverse-on-surface dark:bg-surface-variant-dark text-messages dark:text-primary-text-color-dark"
      )
      .addClass(
        "text-tertiary-text dark:text-tertiary-text-color-dark cursor-pointer"
      );
    $("#pageCount").text("1 / 1");
    // URL dəyişdirmə yox, data parameter göndər
    table.ajax.reload();

    console.log("🔄 Switched to personal notifications");
  });

  // Filter tab switching (All/Read/Unread)
  $(".filter-button").on("click", function (e) {
    e.preventDefault();

    const newFilter = $(this).data("filter");
    if (newFilter === currentFilter) return;

    currentFilter = newFilter;

    // Update button styles
    $(".filter-button")
      .removeClass(
        "active text-messages dark:text-primary-text-color-dark border-b-2 border-messages dark:border-primary-text-color-dark"
      )
      .addClass("text-tertiary-text dark:text-tertiary-text-color-dark");

    $(this)
      .addClass(
        "active text-messages dark:text-primary-text-color-dark border-b-2 border-messages dark:border-primary-text-color-dark"
      )
      .removeClass("text-tertiary-text dark:text-tertiary-text-color-dark");

    // Update filter status and reload
    if (newFilter === "read") {
      filterStatus = ["read"];
    } else if (newFilter === "unread") {
      filterStatus = ["unread"];
    } else {
      filterStatus = [];
    }

    table.ajax.reload();
    console.log(`🔄 Filter dəyişdi: ${newFilter}`);
  });

  // Sayfa inputtan git
  $(".page-input").on("keypress", function (e) {
    if (e.which === 13) goToPage();
  });
  $(".go-button").on("click", function (e) {
    e.preventDefault();
    goToPage();
  });

  function goToPage() {
    const pageNum = parseInt($(".page-input").val(), 10);
    const totalPages = table.page.info().pages;
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      table.page(pageNum - 1).draw("page");
    } else {
      table.page(0).draw("page");
    }
    $(".page-input").val("");
  }

  // Dropdown toggle
  window.toggleDropdown = function (trigger) {
    const wrapper = trigger.closest("#rewardCreateModal");
    const dropdown = wrapper.querySelector(".dropdown-menu");
    document.querySelectorAll(".dropdown-menu").forEach((el) => {
      if (el !== dropdown) el.classList.add("hidden");
    });
    dropdown.classList.toggle("hidden");
  };

  // Sayfa dışı tıklamada dropdown kapat
  document.addEventListener("click", function (event) {
    const isDropdown = event.target.closest(".dropdown-menu");
    const isTrigger = event.target.closest(".stratis-dot-vertical");
    if (!isDropdown && !isTrigger) {
      document
        .querySelectorAll(".dropdown-menu")
        .forEach((el) => el.classList.add("hidden"));
    }
  });

  // Sayfayı yenile butonu
  $("#refreshPage").on("click", function (e) {
    e.preventDefault();
    table.ajax.reload();
    console.log("🔄 Səhifə yeniləndi");
  });
});

function filterForm() {
  startDate = $("#startDate").val() || "";
  endDate = $("#endDate").val() || "";
  $("#myTable").DataTable().ajax.reload();
}

function openFilterModal() {
  let modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";

  modal.innerHTML = `
    <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
      <div class="relative flex flex-col gap-1 pb-3">
        <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
        <p class="text-sm text-tertiary-text dark:text-tertiary-text-color-dark font-normal">Tarix aralığı qeyd edərək aktiv cihazları görə bilərsiniz</p>
        <span onclick="closeFilterModal()" class="absolute top-0 right-0 icon stratis-x-02 cursor-pointer text-sm dark:text-primary-text-color-dark"></span>
      </div>
      <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-[6px]">
          <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
          <div class="relative w-full">
            <input id="startDate" name="startDate" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300" type="date" placeholder="dd/mm/yyyy">
            <div onclick="openDatePicker('startDate')" id="startCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
          </div>
          <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
            <div class="icon stratis-information-circle-contained"></div>
            <span>Başlanğıc tarixini qeyd edin</span>
          </div>
        </label>
        <label class="flex flex-col gap-[6px]">
          <div class="relative w-full">
            <input name="endDate" id="endDate" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark border border-stroke dark:border-[#FFFFFF1A] rounded-full px-3 py-[6.5px] w-full appearance-none focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300" type="date" placeholder="dd/mm/yyyy">
            <div onclick="openDatePicker('endDate')" id="endCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
          </div>
          <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
            <div class="icon stratis-information-circle-contained"></div>
            <span>Son tarixi qeyd edin</span>
          </div>
        </label>
        <div class="flex flex-col gap-[6px]">
          <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Status</span> 
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" name="statusNew"  id="newCheckbox1"  class="peer hidden">
              <label for="newCheckbox1" class="w-5 h-5 border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
              <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal cursor-pointer">Yeni</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" id="readCheckbox2" name="status" class="peer hidden">
              <label for="readCheckbox2" class="w-5 h-5 border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
              <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal cursor-pointer">Oxundu</span>
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağlat</button>
          <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
          <button type="submit" onclick="filterForm()" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer filter-button" id="filter-notifications">Filterlə</button>
        </div>
      </div>
    </div>
  `;

  // **Modalın fonuna klik edildikdə bağlanma**
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      // Sadəcə arxa fonda klik edilərsə
      closeFilterModal();
    }
  });

  document.body.appendChild(modal);
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); // Alternativ həll
  }
}
