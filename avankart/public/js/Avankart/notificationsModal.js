const data = [
  {
    id: 1,
    title: "Post Engineer LLC",
    text: '"AA-210" nömrəli invoys yaradıldı',
    time: "01.10.2024 - 09:45",
    status: "unread",
    isNew: true,
    type: "company",
  },
  {
    id: 2,
    title: "Hesablaşma sənədi yaradıldı",
    text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
    time: "01.10.2024 - 09:45",
    status: "unread",
    isNew: true,
    type: "default",
  },
  {
    id: 3,
    title: "Capital Finance LLC",
    text: '"Ramin Orucov" adlı istifadəçi sistemə əlavə olundu',
    time: "01.10.2024 - 09:45",
    status: "read",
    isNew: false,
    type: "company",
  },
  {
    id: 4,
    title: "Hesablaşma",
    text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
    time: "01.10.2024 - 09:45",
    status: "read",
    isNew: false,
    type: "default",
  },
  {
    id: 5,
    title: "Hesablaşma",
    text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
    time: "01.10.2024 - 09:45",
    status: "read",
    isNew: false,
    type: "default",
  },
  {
    id: 6,
    title: "Hesablaşma",
    text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
    time: "01.10.2024 - 09:45",
    status: "read",
    isNew: false,
    type: "default",
  },
  {
    id: 7,
    title: "Hesablaşma",
    text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
    time: "01.10.2024 - 09:45",
    status: "read",
    isNew: false,
    type: "default",
  },
  {
    id: 8,
    title: "Hesablaşma",
    text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
    time: "01.10.2024 - 09:45",
    status: "read",
    isNew: false,
    type: "default",
  },
];

const icons = {
  default: "/public/images/notifications/notificationLogo.svg",
  company: "/public/images/notifications/notificationLogo.svg",
};

function openNotificationsModal() {
  const modal = document.getElementById("notificationsModal");
  const overlay = document.getElementById("notificationsOverlay");
  modal.innerHTML = renderNotificationModal("all");
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeNotifications() {
  document.getElementById("notificationsModal").classList.add("hidden");
  document.getElementById("notificationsOverlay").classList.add("hidden");
}

function renderNotificationModal(tabType = "all") {
  const filtered =
    tabType === "all" ? data : data.filter((item) => item.status === tabType);

  const tabs = ["all", "read", "unread"];
  const labels = {
    all: "Hamısı",
    read: "Oxunmuşlar",
    unread: "Oxunmamışlar",
  };

  const tabHeader = tabs
    .map((t) => {
      const active =
        tabType === t
          ? "active text-messages border-messages dark:text-primary-text-color-dark dark:border-primary-text-color-dark"
          : "text-tertiary-text dark:text-tertiary-text-color-dark border-transparent hover:text-messages hover:border-messages dark:hover:text-primary-text-color-dark dark:hover:border-primary-text-color-dark";
      return `<li>
        <a href="#" data-tab="${t}" class="filterModal-button inline-flex items-center justify-center py-2 border-b-2 rounded-t-lg group ${active}">
          ${labels[t]} (${
        t === "all" ? data.length : data.filter((i) => i.status === t).length
      })
        </a>
      </li>`;
    })
    .join("");

  const itemsHTML = filtered
    .map(
      (item) => `
      <div class="flex items-center gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
        <div class="flex items-center gap-3">
          <img src="${icons[item.type]}" alt="notificationLogo">
          <div class="flex flex-col gap-[2px] pr-3">
            <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">${
              item.title
            }</div>
            <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">${
              item.text
            }</div>
          </div>
        </div>
        <div class="ml-auto text-right w-[94px]">
          ${
            item.isNew
              ? `<div class="flex items-center gap-2 justify-end">
              <div class="text-[10px] font-normal text-[#7086FD]">Yeni</div>
              <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
            </div>`
              : `<div class="text-[11px] font-normal text-gray-400 flex gap-1 justify-end">Oxundu <img src="/public/images/Avankart/NotificationsModal/readed.svg" alt=""></div>`
          }
          <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">${
            item.time
          }</p>
        </div>
      </div>
    `
    )
    .join("");

  return `
      <div class="w-[497px] bg-menu dark:bg-menu-dark border border-stroke dark:border-[#FFFFFF1A] rounded-[12px]">
        <div class="flex items-center justify-between py-2 px-3 text-messages dark:text-primary-text-color-dark text-[15px] font-medium border-b border-stroke dark:border-[#FFFFFF1A]">
          <span>Bildirişlər</span>
          <div onclick="closeNotifications()" class="icon stratis-x-02 text-sm cursor-pointer"></div>
        </div>
        <div class="px-3">
          <div class="inline-block border-b border-stroke dark:border-[#FFFFFF1A] w-full">
            <ul class="inline-flex gap-5 -mb-px text-[13px] font-medium">
              ${tabHeader}
            </ul>
          </div>
        </div>
       
        <div class="py-1 px-3 flex flex-col gap-2 max-h-[328px] overflow-y-auto custom-scroll">
          ${itemsHTML}
        </div>
        <div class="text-center pt-5 pb-3">
          <a href="#" class="text-[12px] font-medium text-messages dark:text-primary-text-color-dark hover:bg-[#F6D9FF] dark:hover:bg-[#5B396D4D] px-3 py-[2px] rounded-[50px]">Hamısına bax</a>
        </div>
      </div>`;
}

document.addEventListener("click", function (e) {
  if (e.target.closest(".filterModal-button")) {
    e.preventDefault();
    const btn = e.target.closest(".filterModal-button");
    const tabType = btn.dataset.tab;

    document.querySelectorAll(".filterModal-button").forEach((b) => {
      b.classList.remove(
        "active",
        "text-messages",
        "border-messages",
        "dark:text-primary-text-color-dark",
        "dark:border-primary-text-color-dark"
      );
      b.classList.add("border-transparent");
    });

    btn.classList.add(
      "active",
      "text-messages",
      "border-messages",
      "dark:text-primary-text-color-dark",
      "dark:border-primary-text-color-dark"
    );
    btn.classList.remove("border-transparent");

    document.getElementById("notificationsModal").innerHTML =
      renderNotificationModal(tabType);
  }
});
