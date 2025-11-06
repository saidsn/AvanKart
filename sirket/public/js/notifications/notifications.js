const supportModal = document.getElementById("supportModal");
const supportOverlay = document.getElementById("supportOverlay");
const faqModal = document.getElementById("faqModal");

function openSupportModal() {
  supportModal.classList.toggle("hidden");
  supportOverlay.classList.toggle("hidden");
}

function closeSupportModal() {
  supportModal.classList.toggle("hidden");
  supportOverlay.classList.toggle("hidden");
}

function updateNotificationCounts() {
  let total = 0;
  let read = 0;
  let unread = 0;

  Object.values(window.notifications).forEach((group) => {
    group.forEach((notif) => {
      total++;
      if (notif.status === "unread") unread++;
      else if (notif.status === "read") read++;
    });
  });

  document.querySelector("#total-count .count").textContent = total;
  document.querySelector("#read-count .count").textContent = read;
  document.querySelector("#unread-count .count").textContent = unread;
}

const notificationsOverlay = document.getElementById("notificationsOverlay");
const notificationsModal = document.getElementById("notificationsModal");
const allNotificationsModal = document.getElementById("allNotificationsModal");
const personalNotificationsModal = document.getElementById(
  "personalNotificationsModal"
);

// 📊 Notification sayları (global)
let notificationCounts = {
  corporate: { total: 0, read: 0, unread: 0 },
  personal: { total: 0, read: 0, unread: 0 },
};

window.notificationCounts = notificationCounts;

if (!window.notifications) {
  window.notifications = {
    corporate: [],
    personal: [],
  };
}

// 🎨 Notification template yaratmaq
function createNotificationHTML(notification) {
  const isNew = notification.status === "unread";
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " - " +
      date.toLocaleTimeString("az-AZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return `
    <div class="flex items-center gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3" onclick="openNotificationDetails('${
      notification.id
    }')">
      <div class="flex items-center gap-3">
        <img class="block dark:hidden" src="/images/notifications/notificationLogo.svg" alt="notificationLogo" />
        <img class="hidden dark:block" src="/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
        <div class="flex items-center">
          <div class="flex flex-col gap-[2px] pr-3">
            <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">${
              notification.title || "Bildiriş"
            }</div>
            <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">${
              notification.message
            }</div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-[94px]">
          ${
            isNew
              ? `
            <div class="flex items-center gap-2 justify-end">
              <div class="text-[10px] font-normal text-[#7086FD]">Yeni</div>
              <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
            </div>
          `
              : ""
          }
          <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">${formatDate(
            notification.createdAt || new Date()
          )}</p>
        </div>
        <div class="px-3">
          <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
        </div>
      </div>
    </div>
  `;
}

function openNotificationsModal() {
  notificationsModal.innerHTML = `
    <div class="w-[497px] bg-menu dark:bg-menu-dark border border-stroke dark:border-[#FFFFFF1A] rounded-[12px]">
      <div class="flex items-center justify-between py-2 px-3 text-messages dark:text-primary-text-color-dark text-[15px] font-medium border-b border-stroke dark:border-[#FFFFFF1A]">
        <span>Bildirişlər</span>
        <div onclick="closeNotifications()" class="icon stratis-x-02 text-sm cursor-pointer"></div>
      </div>
      <div class="p-3">
        <div class="w-full inline-flex gap-1 items-center border border-surface-variant dark:border-surface-variant-dark rounded-full p-1">
          <button onclick="openAllNotificationsModal()" class="active notificationModalType w-1/2 text-messages dark:text-primary-text-color-dark hover:text-messages dark:hover:text-primary-text-color-dark text-[12px] font-medium bg-inverse-on-surface dark:bg-inverse-on-surface-dark rounded-full py-[3px] px-3">
            Korporativ bildirişlər
          </button>
          <button onclick="openPersonalNotificationsModal()" class="notificationModalType w-1/2 text-tertiary-text dark:text-tertiary-text-color-dark hover:text-messages dark:hover:text-primary-text-color-dark text-[12px] font-medium rounded-full py-[3px] px-3 cursor-pointer">
            Fərdi bildirişlər
          </button>
        </div>
      </div>
      <div class="px-3">
        <div class="inline-block border-b border-stroke dark:border-[#FFFFFF1A] w-full">
          <ul class="inline-flex flex-wrap gap-5 -mb-px text-[13px] font-medium text-center text-tertiary-text dark:text-tertiary-text-color-dark">
            <li>
              <a onclick="toggleActiveTab(event, 'all')" href="#" class="active filterModal-button all inline-flex items-center justify-center py-2 text-messages dark:text-primary-text-color-dark border-b-2 border-messages dark:border-primary-text-color-dark rounded-t-lg group" aria-current="page">
                Hamısı (<span id="total-count">0</span>)
              </a>
            </li>
            <li>
              <a onclick="toggleActiveTab(event, 'read')" href="#" class="filterModal-button read inline-flex items-center justify-center py-2 border-b-2 border-transparent rounded-t-lg hover:text-messages dark:hover:text-primary-text-color-dark hover:border-messages dark:hover:border-primary-text-color-dark group">
                Oxunmuşlar (<span id="read-count">0</span>)
              </a>
            </li>
            <li>
              <a onclick="toggleActiveTab(event, 'unread')" href="#" class="filterModal-button unread inline-flex items-center justify-center py-2 border-b-2 border-transparent rounded-t-lg hover:text-messages dark:hover:text-primary-text-color-dark hover:border-messages dark:hover:border-primary-text-color-dark group">
                Oxunmamışlar (<span id="unread-count">0</span>)
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div id="allNotificationsModal" class="py-1 px-3">
        <div class="flex flex-col gap-2" id="corporate-notifications">
          <!-- Corporate notifications buraya əlavə ediləcək -->
        </div>
        <div class="text-center pt-5 pb-3">
          <a href="/notifications" class="cursor-pointer text-[12px] font-medium text-messages dark:text-primary-text-color-dark dark:hover:text-messages hover:bg-[#F6D9FF] px-3 py-[2px] rounded-[50px]">Hamısına bax</a>
        </div>
      </div>
      <div id="personalNotificationsModal" class="hidden py-1 px-3">
        <div class="flex flex-col gap-2" id="personal-notifications">
          <!-- Personal notifications buraya əlavə ediləcək -->
        </div>
        <div class="text-center pt-5 pb-3">
          <a href="/notifications" class="cursor-pointer text-[12px] font-medium text-messages dark:text-primary-text-color-dark dark:hover:text-messages hover:bg-[#F6D9FF] px-3 py-[2px] rounded-[50px]">Hamısına bax</a>
        </div>
      </div>
    </div>
  `;

  // Hazırkı sayları yenilə
  updateNotificationCounts();

  // Notifications göstər
  renderNotifications();

  notificationsModal.classList.remove("hidden");
  notificationsOverlay.classList.remove("hidden");
}

function closeNotifications() {
  notificationsModal.classList.add("hidden");
  notificationsOverlay.classList.add("hidden");
}

function openAllNotificationsModal() {
  document.getElementById("allNotificationsModal").classList.remove("hidden");
  document.getElementById("personalNotificationsModal").classList.add("hidden");

  const allNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(1)"
  );
  const personalNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(2)"
  );

  if (!allNotificationsButton.classList.contains("active")) {
    allNotificationsButton.classList.add(
      "active",
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    allNotificationsButton.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark",
      "cursor-pointer"
    );

    personalNotificationsButton.classList.remove(
      "active",
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    personalNotificationsButton.classList.add(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark",
      "cursor-pointer"
    );
  }

  updateNotificationCounts();
  renderNotifications();
}

function openPersonalNotificationsModal() {
  document.getElementById("allNotificationsModal").classList.add("hidden");
  document
    .getElementById("personalNotificationsModal")
    .classList.remove("hidden");

  const allNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(1)"
  );
  const personalNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(2)"
  );

  if (!personalNotificationsButton.classList.contains("active")) {
    personalNotificationsButton.classList.add(
      "active",
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    personalNotificationsButton.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark",
      "cursor-pointer"
    );

    allNotificationsButton.classList.remove(
      "active",
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    allNotificationsButton.classList.add(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark",
      "cursor-pointer"
    );
  }

  updateNotificationCounts();
  renderNotifications();
}

// 📊 Notification saylarını yeniləmək
function updateNotificationCounts() {
  // İlk olaraq sayları hesabla
  calculateNotificationCounts();

  // Sidebar unread count (həmişə total unread)
  const totalUnread =
    notificationCounts.corporate.unread + notificationCounts.personal.unread;
  updateSidebarNotificationCount(totalUnread);

  // Modal açıqdırsa, modal saylarını da yenilə
  const notificationsModal = document.getElementById("notificationsModal");
  if (notificationsModal && !notificationsModal.classList.contains("hidden")) {
    const allModal = document.getElementById("allNotificationsModal");
    const activeCategory =
      allModal && allModal.classList.contains("hidden")
        ? "personal"
        : "corporate";
    const counts = notificationCounts[activeCategory];

    // Modal tab sayları - yalnız element varsa yenilə
    const totalSpan = document.getElementById("total-count");
    const readSpan = document.getElementById("read-count");
    const unreadSpan = document.getElementById("unread-count");

    if (totalSpan) totalSpan.textContent = counts.total;
    if (readSpan) readSpan.textContent = counts.read;
    if (unreadSpan) unreadSpan.textContent = counts.unread;
  }
}

// 🔔 Sidebar notification count yeniləmək
function updateSidebarNotificationCount(count) {
  const sidebarNotificationElement = document.getElementById(
    "sidebar-notification-count"
  );
  if (sidebarNotificationElement) {
    if (count > 0) {
      sidebarNotificationElement.textContent = count;
      sidebarNotificationElement.style.display = "inline";
    } else {
      sidebarNotificationElement.style.display = "none";
    }
  }
}

// 📋 Notifications render etmək
function renderNotifications() {
  const corporateContainer = document.getElementById("corporate-notifications");
  const personalContainer = document.getElementById("personal-notifications");

  if (corporateContainer) {
    corporateContainer.innerHTML = notifications.corporate
      .map(createNotificationHTML)
      .join("");
  }

  if (personalContainer) {
    personalContainer.innerHTML = notifications.personal
      .map(createNotificationHTML)
      .join("");
  }
}

// 🔗 Notification details açmaq
function openNotificationDetails(notificationId) {
  // Notification üzərinə klik ediləndə notifications səhifəsinə yönləndir
  window.location.href = `/notifications#${notificationId}`;
}

function toggleActiveTab(event, tab) {
  // Get all the tabs
  const tabs = document.querySelectorAll(".filterModal-button");

  // Loop through each tab and remove the 'active' class
  tabs.forEach((tabElement) => {
    tabElement.classList.remove(
      "active",
      "text-messages",
      "dark:text-primary-text-color-dark",
      "border-messages",
      "dark:border-primary-text-color-dark"
    );
    tabElement.classList.add("border-transparent");
  });

  // Get the clicked tab
  const clickedTab = event.currentTarget;

  // Add 'active' class and styles to the clicked tab
  clickedTab.classList.add(
    "active",
    "text-messages",
    "dark:text-primary-text-color-dark",
    "border-messages",
    "dark:border-primary-text-color-dark"
  );
  clickedTab.classList.remove("border-transparent");

  console.log("Active tab:", tab); // 'all', 'read', 'unread'
}

// 📊 Notification saylarını hesablamaq
function calculateNotificationCounts() {
  // Corporate notifications
  notificationCounts.corporate = {
    total: notifications.corporate.length || 0,
    read:
      notifications.corporate.filter((n) => n.status === "read").length || 0,
    unread:
      notifications.corporate.filter((n) => n.status === "unread").length || 0,
  };

  // Personal notifications
  notificationCounts.personal = {
    total: notifications.personal.length || 0,
    read: notifications.personal.filter((n) => n.status === "read").length || 0,
    unread:
      notifications.personal.filter((n) => n.status === "unread").length || 0,
  };
}

// Event listeners və digər funksiyalar...
document.addEventListener("DOMContentLoaded", function () {
  // Notification type buttons (Korporativ və Fərdi bildirişlər)
  const notificationButtons = document.querySelectorAll(".notification-type");

  notificationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove styles from all buttons
      notificationButtons.forEach((btn) => {
        btn.classList.remove(
          "bg-inverse-on-surface",
          "dark:bg-surface-variant-dark",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
      });

      // Add styles to the clicked button
      this.classList.add(
        "bg-inverse-on-surface",
        "dark:bg-surface-variant-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
    });
  });

  // Filter buttons (Hamısı, Oxunmuşlar, Oxunmamışlar)
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      // Remove underline and text color from all filter buttons
      filterButtons.forEach((btn) => {
        btn.classList.remove(
          "active",
          "text-messages",
          "dark:text-primary-text-color-dark",
          "border-messages",
          "dark:border-primary-text-color-dark",
          "border-b-2"
        );
      });

      // Add underline and text color to clicked filter
      this.classList.add(
        "border-messages",
        "dark:border-primary-text-color-dark",
        "text-messages",
        "dark:text-primary-text-color-dark",
        "border-b-2"
      );
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const notificationButtons = document.querySelectorAll(".notification-type");

  notificationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.classList.contains("active")) {
        // Əgər artıq aktivdirsə, heç nə etmirik
        return;
      }

      // Bütün düymələrdən aktiv və rəng siniflərini sil
      notificationButtons.forEach((btn) => {
        btn.classList.remove(
          "active",
          "text-messages",
          "dark:text-primary-text-color-dark",
          "bg-inverse-on-surface",
          "dark:bg-inverse-on-surface-dark"
        );
        btn.classList.add(
          "text-tertiary-text",
          "dark:text-tertiary-text-color-dark",
          "cursor-pointer"
        );
      });

      // Seçilən düyməyə aktiv və rəng siniflərini əlavə et, cursor-pointer sinfini sil
      this.classList.add(
        "active",
        "text-messages",
        "dark:text-primary-text-color-dark",
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark"
      );
      this.classList.remove(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark",
        "cursor-pointer"
      );
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Sidebar düymələri
  const sidebarLinks = document.querySelectorAll("ul li a");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Əgər düymə artıq aktivdirsə, "active" sinfini sil və text rəngini dəyiş
      if (this.classList.contains("active")) {
        this.classList.remove(
          "active",
          "bg-sidebar-item",
          "dark:bg-side-bar-item-dark",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
      } else {
        // Digər düymələrdən "active" sinfini və rəngləri sil
        sidebarLinks.forEach((btn) => {
          btn.classList.remove(
            "active",
            "bg-sidebar-item",
            "dark:bg-side-bar-item-dark",
            "text-messages",
            "dark:text-primary-text-color-dark"
          );
        });

        // Seçilən düyməyə "active" sinfini əlavə et və text-messages rəngini təyin et
        this.classList.add(
          "active",
          "bg-sidebar-item",
          "dark:bg-side-bar-item-dark",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
      }
    });
  });
});

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
      <form class="flex flex-col gap-3">
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
              <input type="checkbox" id="readCheckbox2" name="statusRead" class="peer hidden">
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
          <button type="submit" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer filter-button" id="filter-notifications">Filterlə</button>
        </div>
      </form>
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

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); // Alternativ həll
  }
}

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}

function clearFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("newCheckbox1").checked = false;
  document.getElementById("readCheckbox2").checked = false;

  $("#myTable").DataTable().ajax.reload();
}
document.addEventListener("DOMContentLoaded", () => {
  window.openFilterModal = openFilterModal;
  window.closeFilterModal = closeFilterModal;
});
