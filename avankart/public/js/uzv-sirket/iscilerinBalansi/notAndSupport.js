function openNotificationsModal() {
  notificationsModal.innerHTML = `
         <div class="w-[497px] bg-menu dark:bg-menu-dark border border-stroke dark:border-[#FFFFFF1A] rounded-[12px]">
            <div class="flex items-center justify-between py-2 px-3 text-messages dark:text-primary-text-color-dark text-[15px] font-medium border-b border-stroke dark:border-[#FFFFFF1A]">
                <span>Bildirişlər</span>
                <div onclick="closeNotifications()" class="icon stratis-x-02 text-sm cursor-pointer"></div>
            </div>
            <div class="p-3">
                <div class="w-full inline-flex gap-1 items-center border border-surface-variant dark:border-surface-variant-dark rounded-full p-1">
                    <button onclick="openAllNotificationsModal()" class="active notificationModalType w-1/2 text-messages dark:text-primary-text-color-dark hover:text-messages dark:hover:text-primary-text-color-dark text-[12px] font-medium bg-inverse-on-surface dark:bg-inverse-on-surface-dark rounded-full py-[3px] px-3">Korporativ bildirişlər</button>
                    <button onclick="openPersonalNotificationsModal()" class="notificationModalType w-1/2 text-tertiary-text dark:text-tertiary-text-color-dark hover:text-messages dark:hover:text-primary-text-color-dark text-[12px] font-medium rounded-full py-[3px] px-3 cursor-pointer">Fərdi bildirişlər</button>
                </div>
            </div>
            <div class="px-3">
                <div class="inline-block border-b border-stroke dark:border-[#FFFFFF1A] w-full">
                    <ul class="inline-flex flex-wrap gap-5 -mb-px text-[13px] font-medium text-center text-tertiary-text dark:text-tertiary-text-color-dark">
                        <li>
                            <a onclick="toggleActiveTab(event, 'all')" href="#" class="active filterModal-button all inline-flex items-center justify-center py-2 text-messages dark:text-primary-text-color-dark border-b-2 border-messages dark:border-primary-text-color-dark rounded-t-lg group" aria-current="page">
                                Hamısı (35)
                            </a>
                        </li>
                        <li>
                            <a onclick="toggleActiveTab(event, 'all')" href="#" class="filterModal-button read inline-flex items-center justify-center py-2 border-b-2 border-transparent rounded-t-lg hover:text-messages dark:hover:text-primary-text-color-dark hover:border-messages dark:hover:border-primary-text-color-dark group">
                                Oxunmuşlar (31)
                            </a>
                        </li>
                        <li>
                            <a onclick="toggleActiveTab(event, 'all')" href="#" class="filterModal-button unread inline-flex items-center justify-center py-2 border-b-2 border-transparent rounded-t-lg hover:text-messages dark:hover:text-primary-text-color-dark hover:border-messages dark:hover:border-primary-text-color-dark group">
                                Oxunmamışlar (4)
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div id="allNotificationsModal" class="py-1 px-3">
                <div class="flex flex-col gap-2">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
                            <div class="flex items-center gap-3">
                                <img class="block dark:hidden" src="/public/images/notifications/notificationLogo.svg" alt="notificationLogo" />
                                <img class="hidden dark:block" src="/public/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
                                <div class="flex items-center">
                                    <div class="flex flex-col gap-[2px] pr-3">
                                        <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">Hesablaşma</div>
                                        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-[94px]">
                                    <div class="flex items-center gap-2 justify-end">
                                        <div class="text-[10px] font-normal text-[#7086FD]">Yeni </div>
                                        <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
                                    </div>
                                    <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">01.10.2024 - 09:45</p>
                                </div>
                                <div class="px-3">
                                    <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
                            <div class="flex items-center gap-3">
                                <img class="block dark:hidden" src="/public/images/notifications/notificationLogo.svg" alt="notificationLogo" />
                                <img class="hidden dark:block" src="/public/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
                                <div class="flex items-center">
                                    <div class="flex flex-col gap-[2px] pr-3">
                                        <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">Hesablaşma</div>
                                        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-[94px]">
                                    <div class="flex items-center gap-2 justify-end">
                                        <div class="text-[10px] font-normal text-[#7086FD]">Yeni </div>
                                        <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
                                    </div>
                                    <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">01.10.2024 - 09:45</p>
                                </div>
                                <div class="px-3">
                                    <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
                            <div class="flex items-center gap-3">
                                <img class="block dark:hidden" src="/public/images/notifications/notificationLogo.svg" alt="notificationLogo" />
                                <img class="hidden dark:block" src="/public/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
                                <div class="flex items-center">
                                    <div class="flex flex-col gap-[2px] pr-3">
                                        <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">Hesablaşma</div>
                                        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-[94px]">
                                    <div class="flex items-center gap-2 justify-end">
                                        <div class="text-[10px] font-normal text-[#7086FD]">Yeni </div>
                                        <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
                                    </div>
                                    <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">01.10.2024 - 09:45</p>
                                </div>
                                <div class="px-3">
                                    <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
                            <div class="flex items-center gap-3">
                                <img class="block dark:hidden" src="/public/images/notifications/notificationLogo.svg" alt="notificationLogo" />
                                <img class="hidden dark:block" src="/public/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
                                <div class="flex items-center">
                                    <div class="flex flex-col gap-[2px] pr-3">
                                        <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">Hesablaşma</div>
                                        <div class="text-secondary dark:text-secondary-text-color-dark text-[11px] font-normal">Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-[94px]">
                                    <div class="flex items-center gap-2 justify-end">
                                        <div class="text-[10px] font-normal text-[#7086FD]">Yeni </div>
                                        <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
                                    </div>
                                    <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">01.10.2024 - 09:45</p>
                                </div>
                                <div class="px-3">
                                    <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
                            <div class="flex items-center gap-3">
                               <img class="block dark:hidden" src="/public/images/notifications/notificationLogo.svg" alt="notificationLogo" />
                                <img class="hidden dark:block" src="/public/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
                                <div class="flex items-center">
                                    <div class="flex flex-col gap-[2px] pr-3">
                                        <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">Hesablaşma</div>
                                        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-[94px]">
                                    <div class="flex items-center gap-2 justify-end">
                                        <div class="text-[10px] font-normal text-[#7086FD]">Yeni </div>
                                        <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
                                    </div>
                                    <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">01.10.2024 - 09:45</p>
                                </div>
                                <div class="px-3">
                                    <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-center pt-5 pb-3">
                    <a href="../notifications/notifications.html" class="cursor-pointer text-[12px] font-medium text-messages dark:text-primary-text-color-dark dark:hover:text-messages hover:bg-[#F6D9FF] px-3 py-[2px] rounded-[50px]">Hamısına bax</a>
                </div>
            </div>
            <div id="personalNotificationsModal" class="hidden py-1 px-3">
                <div class="flex flex-col gap-2">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
                            <div class="flex items-center gap-3">
                                <img class="block dark:hidden" src="/public/images/notifications/notificationLogo.svg" alt="notificationLogo" />
                                <img class="hidden dark:block" src="/public/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
                                <div class="flex items-center">
                                    <div class="flex flex-col gap-[2px] pr-3">
                                        <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">2 addımlı doğrulama aktivləşdirildi</div>
                                        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">E-poçt ilə doğrulamanı aktivləşdirdiniz</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-[94px]">
                                    <div class="flex items-center gap-2 justify-end">
                                        <div class="text-[10px] font-normal text-[#7086FD]">Yeni </div>
                                        <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
                                    </div>
                                    <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">01.10.2024 - 09:45</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between gap-2 hover:bg-item-hover dark:hover:bg-item-hover-dark cursor-pointer rounded-[8px] py-2 px-3">
                            <div class="flex items-center gap-3">
                                <img class="block dark:hidden" src="/public/images/notifications/notificationLogo.svg" alt="notificationLogo" />
                                <img class="hidden dark:block" src="/public/images/notifications/profileDarkMode.svg" alt="notificationLogo" />
                                
                                <div class="flex items-center">
                                    <div class="flex flex-col gap-[2px] pr-3">
                                        <div class="text-messages dark:text-primary-text-color-dark text-[13px] font-medium">2 addımlı doğrulama aktivləşdirildi</div>
                                        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[11px] font-normal">E-poçt ilə doğrulamanı aktivləşdirdiniz</div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-[94px]">
                                    <div class="flex items-center gap-2 justify-end">
                                        <div class="text-[10px] font-normal text-[#7086FD]">Yeni </div>
                                        <div class="w-[6px] h-[6px] bg-[#7086FD] rounded-full"></div>
                                    </div>
                                    <p class="text-[11px] font-normal text-messages dark:text-primary-text-color-dark">01.10.2024 - 09:45</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

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

  // You can also use the tab parameter if you need to trigger specific actions depending on the tab clicked
  // For example, showing/hiding content based on the selected tab
  console.log(tab); // 'all', 'read', 'unread'
}

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

function openFaqModal() {
  faqModal.innerHTML = `
     <!-- Qaralmış Overlay -->
    <div onclick="closeFaqModal()" class="fixed inset-0 bg-[rgb(0,0,0,.5)] z-90"></div>
    <div style="scrollbar-width: none;" class="border-3 border-stroke dark:border-[#FFFFFF1A] w-[577px] bg-sidebar-bg dark:bg-side-bar-bg-dark fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-100 shadow-xl rounded-[12px] max-h-[100vh] overflow-y-auto custom-scroll">
        <div class="p-5 relative">
            <div onclick="closeFaqModal()" class="w-[18px] h-[18px] absolute right-7 top-7 cursor-pointer">
                <div class="icon stratis-x-02"></div>
            </div>
            <div class="text-center mt-7">
                <h3 class="text-[18px] font-bold text-messages dark:text-primary-text-color-dark mt-3">Tez-tez verilən suallar</h3>
            </div>
            <div class="mt-6 space-y-3">
                <div class="bg-table-hover dark:bg-table-hover-dark rounded-xl">
                    <div class="divide-y divide-neutral-200">
                        <div>
                            <details class="group">
                                <summary class="py-3 px-5 flex cursor-pointer list-none items-center justify-between font-medium text-sm">
                                    <span> Lorem Ipsum Dolor Sit Amel?</span>
                                    <span class="flex items-center justify-center rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark w-10 h-10 transition group-open:rotate-[-45deg]">
                                        <div class="icon stratis-arrow-right duration-300 ease-in-out"></div>
                                    </span>
                                </summary>
                                <div class="w-full group-open:animate-fadeIn border-t-[.5px] border-stroke dark:border-[#FFFFFF1A]">
                                    <p class="py-3 px-5 text-start font-normal text-[12px] text-secondary-text dark:text-secondary-text-color-dark pt-3">
                                        Lorem ipsum dolor sit amet consectetur. Elit vulputate enim sollicitudin id. Neque aliquam sodales ut consequat porttitor dis volutpat. Purus amet sit felis lacus venenatis. Consectetur nunc morbi urna pulvinar proin orci egestas suscipit.
                                    </p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
                <div class="bg-table-hover dark:bg-table-hover-dark rounded-xl">
                    <div class="divide-y divide-neutral-200">
                        <div>
                            <details class="group">
                                <summary class="py-3 px-5 flex cursor-pointer list-none items-center justify-between font-medium text-sm">
                                    <span> Lorem Ipsum Dolor Sit Amel?</span>
                                    <span class="flex items-center justify-center rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark w-10 h-10 transition group-open:rotate-[-45deg]">
                                        <div class="icon stratis-arrow-right duration-300 ease-in-out"></div>
                                    </span>
                                </summary>
                                <div class="w-full group-open:animate-fadeIn border-t-[.5px] border-stroke dark:border-[#FFFFFF1A]">
                                    <p class="py-3 px-5 text-start font-normal text-[12px] text-secondary-text dark:text-secondary-text-color-dark pt-3">
                                        Lorem ipsum dolor sit amet consectetur. Elit vulputate enim sollicitudin id. Neque aliquam sodales ut consequat porttitor dis volutpat. Purus amet sit felis lacus venenatis. Consectetur nunc morbi urna pulvinar proin orci egestas suscipit.
                                    </p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
                <div class="bg-table-hover dark:bg-table-hover-dark rounded-xl">
                    <div class="divide-y divide-neutral-200">
                        <div>
                            <details class="group">
                                <summary class="py-3 px-5 flex cursor-pointer list-none items-center justify-between font-medium text-sm">
                                    <span> Lorem Ipsum Dolor Sit Amel?</span>
                                    <span class="flex items-center justify-center rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark w-10 h-10 transition group-open:rotate-[-45deg]">
                                        <div class="icon stratis-arrow-right duration-300 ease-in-out"></div>
                                    </span>
                                </summary>
                                <div class="w-full group-open:animate-fadeIn border-t-[.5px] border-stroke dark:border-[#FFFFFF1A]">
                                    <p class="py-3 px-5 text-start font-normal text-[12px] text-secondary-text dark:text-secondary-text-color-dark pt-3">
                                        Lorem ipsum dolor sit amet consectetur. Elit vulputate enim sollicitudin id. Neque aliquam sodales ut consequat porttitor dis volutpat. Purus amet sit felis lacus venenatis. Consectetur nunc morbi urna pulvinar proin orci egestas suscipit.
                                    </p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
                <div class="bg-table-hover dark:bg-table-hover-dark rounded-xl">
                    <div class="divide-y divide-neutral-200">
                        <div>
                            <details class="group">
                                <summary class="py-3 px-5 flex cursor-pointer list-none items-center justify-between font-medium text-sm">
                                    <span> Lorem Ipsum Dolor Sit Amel?</span>
                                    <span class="flex items-center justify-center rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark w-10 h-10 transition group-open:rotate-[-45deg]">
                                        <div class="icon stratis-arrow-right duration-300 ease-in-out"></div>
                                    </span>
                                </summary>
                                <div class="w-full group-open:animate-fadeIn border-t-[.5px] border-stroke dark:border-[#FFFFFF1A]">
                                    <p class="py-3 px-5 text-start font-normal text-[12px] text-secondary-text dark:text-secondary-text-color-dark pt-3">
                                        Lorem ipsum dolor sit amet consectetur. Elit vulputate enim sollicitudin id. Neque aliquam sodales ut consequat porttitor dis volutpat. Purus amet sit felis lacus venenatis. Consectetur nunc morbi urna pulvinar proin orci egestas suscipit.
                                    </p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
                <div class="bg-table-hover dark:bg-table-hover-dark rounded-xl">
                    <div class="divide-y divide-neutral-200">
                        <div>
                            <details class="group">
                                <summary class="py-3 px-5 flex cursor-pointer list-none items-center justify-between font-medium text-sm">
                                    <span> Lorem Ipsum Dolor Sit Amel?</span>
                                    <span class="flex items-center justify-center rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark w-10 h-10 transition group-open:rotate-[-45deg]">
                                        <div class="icon stratis-arrow-right duration-300 ease-in-out"></div>
                                    </span>
                                </summary>
                                <div class="w-full group-open:animate-fadeIn border-t-[.5px] border-stroke dark:border-[#FFFFFF1A]">
                                    <p class="py-3 px-5 text-start font-normal text-[12px] text-secondary-text dark:text-secondary-text-color-dark pt-3">
                                        Lorem ipsum dolor sit amet consectetur. Elit vulputate enim sollicitudin id. Neque aliquam sodales ut consequat porttitor dis volutpat. Purus amet sit felis lacus venenatis. Consectetur nunc morbi urna pulvinar proin orci egestas suscipit.
                                    </p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function closeFaqModal() {
  faqModal.innerHTML = "";
}
