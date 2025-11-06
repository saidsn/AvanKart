const supportModal = document.getElementById('supportModal');
const supportOverlay = document.getElementById('supportOverlay');
const faqModal = document.getElementById('faqModal')

function openSupportModal() {
    supportModal.classList.toggle('hidden');
    supportOverlay.classList.toggle('hidden');
}

function closeSupportModal() {
    supportModal.classList.toggle('hidden')
    supportOverlay.classList.toggle('hidden');
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
    faqModal.innerHTML = ''
}

const notificationsOverlay = document.getElementById('notificationsOverlay')
const notificationsModal = document.getElementById('notificationsModal')
const allNotificationsModal = document.getElementById('allNotificationsModal')
const personalNotificationsModal = document.getElementById('personalNotificationsModal')

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
            <div class="px-3">7
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
    `

    notificationsModal.classList.remove('hidden');
    notificationsOverlay.classList.remove('hidden');
}

function closeNotifications() {
    notificationsModal.classList.add('hidden');
    notificationsOverlay.classList.add('hidden');
}

function openAllNotificationsModal() {
    // Show the "all notifications" section and hide the "personal notifications" section
    document.getElementById('allNotificationsModal').classList.remove('hidden');
    document.getElementById('personalNotificationsModal').classList.add('hidden');
    
    // Get the buttons
    const allNotificationsButton = document.querySelector('.notificationModalType:nth-child(1)');
    const personalNotificationsButton = document.querySelector('.notificationModalType:nth-child(2)');

    // Check if the "All Notifications" button is not active and add the "active" class
    if (!allNotificationsButton.classList.contains('active')) {
        allNotificationsButton.classList.add('active');
        allNotificationsButton.classList.add('bg-inverse-on-surface', "dark:bg-inverse-on-surface-dark");
        allNotificationsButton.classList.add('text-messages', "dark:text-primary-text-color-dark");
        allNotificationsButton.classList.remove('text-tertiary-text', "dark:text-tertiary-text-color-dark");
        
        // Remove "active" and change styles of the "Personal Notifications" button
        personalNotificationsButton.classList.remove('active');
        personalNotificationsButton.classList.remove('bg-inverse-on-surface', "dark:bg-inverse-on-surface-dark");
        personalNotificationsButton.classList.remove('text-messages', "dark:text-primary-text-color-dark");
        personalNotificationsButton.classList.add('text-tertiary-text', "dark:text-tertiary-text-color-dark");
    }
}

function openPersonalNotificationsModal() {
    // Show the "personal notifications" section and hide the "all notifications" section
    document.getElementById('allNotificationsModal').classList.add('hidden');
    document.getElementById('personalNotificationsModal').classList.remove('hidden');
    
    // Get the buttons
    const allNotificationsButton = document.querySelector('.notificationModalType:nth-child(1)');
    const personalNotificationsButton = document.querySelector('.notificationModalType:nth-child(2)');

    // Check if the "Personal Notifications" button is not active and add the "active" class
    if (!personalNotificationsButton.classList.contains('active')) {
        personalNotificationsButton.classList.add('active');
        personalNotificationsButton.classList.add('bg-inverse-on-surface', "dark:bg-inverse-on-surface-dark");
        personalNotificationsButton.classList.add('text-messages', "dark:text-primary-text-color-dark");
        personalNotificationsButton.classList.remove('text-tertiary-text', "dark:text-tertiary-text-color-dark");
        
        // Remove "active" and change styles of the "All Notifications" button
        allNotificationsButton.classList.remove('active');
        allNotificationsButton.classList.remove('bg-inverse-on-surface', "dark:bg-inverse-on-surface-dark");
        allNotificationsButton.classList.remove('text-messages', "dark:text-primary-text-color-dark");
        allNotificationsButton.classList.add('text-tertiary-text', "dark:text-tertiary-text-color-dark");
    }
}

function toggleActiveTab(event, tab) {
    // Get all the tabs
    const tabs = document.querySelectorAll('.filterModal-button');

    // Loop through each tab and remove the 'active' class
    tabs.forEach(tabElement => {
        tabElement.classList.remove('active', 'text-messages', "dark:text-primary-text-color-dark", 'border-messages', "dark:border-primary-text-color-dark");
        tabElement.classList.add('border-transparent');
    });

    // Get the clicked tab
    const clickedTab = event.currentTarget;

    // Add 'active' class and styles to the clicked tab
    clickedTab.classList.add('active', 'text-messages', "dark:text-primary-text-color-dark", 'border-messages', "dark:border-primary-text-color-dark");
    clickedTab.classList.remove('border-transparent');
    
    // You can also use the tab parameter if you need to trigger specific actions depending on the tab clicked
    // For example, showing/hiding content based on the selected tab
    console.log(tab); // 'all', 'read', 'unread'
}

document.addEventListener("DOMContentLoaded", function () {
    // Notification type buttons (Korporativ və Fərdi bildirişlər)
    const notificationButtons = document.querySelectorAll(".notification-type");

    notificationButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Remove styles from all buttons
            notificationButtons.forEach(btn => {
                btn.classList.remove("bg-inverse-on-surface", "dark:bg-surface-variant-dark", "text-messages", "dark:text-primary-text-color-dark");
            });

            // Add styles to the clicked button
            this.classList.add("bg-inverse-on-surface", "dark:bg-surface-variant-dark", "text-messages", "dark:text-primary-text-color-dark");
        });
    });

    // Filter buttons (Hamısı, Oxunmuşlar, Oxunmamışlar)
    const filterButtons = document.querySelectorAll(".filter-button");

    filterButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            // Remove underline and text color from all filter buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'text-messages', "dark:text-primary-text-color-dark", 'border-messages', "dark:border-primary-text-color-dark", "border-b-2");
            });

            // Add underline and text color to clicked filter
            this.classList.add("border-messages", "dark:border-primary-text-color-dark", "text-messages", "dark:text-primary-text-color-dark", "border-b-2");
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Korporativ və fərdi bildiriş düymələri
    const notificationButtons = document.querySelectorAll(".notification-type");

    notificationButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Əgər düymə artıq aktivdirsə, "active" sinfini sil və text rəngini dəyiş
            if (this.classList.contains("active")) {
                this.classList.remove("active", "text-messages", "dark:text-primary-text-color-dark");
                this.classList.add("text-tertiary-text", "dark:text-tertiary-text-color-dark"); // Rəngi dəyiş
            } else {
                // Digər düymələrdən "active" sinfini və rəngləri sil
                notificationButtons.forEach(btn => {
                    btn.classList.remove("active", "text-messages", "dark:text-primary-text-color-dark");
                    btn.classList.add("text-tertiary-text", "dark:text-tertiary-text-color-dark"); // Digər düymələrə text-tertiary-text əlavə et
                });

                // Seçilən düyməyə "active" sinfini əlavə et və text-messages rəngini təyin et
                this.classList.add("active", "text-messages", "dark:text-primary-text-color-dark");
                this.classList.remove("text-tertiary-text", "dark:text-tertiary-text-color-dark"); // Digər rəngi sil
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Sidebar düymələri
    const sidebarLinks = document.querySelectorAll("ul li a");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function () {
            // Əgər düymə artıq aktivdirsə, "active" sinfini sil və text rəngini dəyiş
            if (this.classList.contains("active")) {
                this.classList.remove("active", "bg-sidebar-item", "dark:bg-side-bar-item-dark", "text-messages", "dark:text-primary-text-color-dark");
            } else {
                // Digər düymələrdən "active" sinfini və rəngləri sil
                sidebarLinks.forEach(btn => {
                    btn.classList.remove("active", "bg-sidebar-item", "dark:bg-side-bar-item-dark", "text-messages", "dark:text-primary-text-color-dark");
                });

                // Seçilən düyməyə "active" sinfini əlavə et və text-messages rəngini təyin et
                this.classList.add("active","bg-sidebar-item", "dark:bg-side-bar-item-dark", "text-messages", "dark:text-primary-text-color-dark");
            }
        });
    });
});

function openFilterModal() {
    let modal = document.createElement('div');
    modal.id = 'filterModal';
    modal.className = 'fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200';

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
                        <input id="startDate" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('startDate')" id="startCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Başlanğıc tarixini qeyd edin</span>
                    </div>
                </label>
                <label class="flex flex-col gap-[6px]">
                    <div class="relative w-full">
                        <input id="endDate" class="custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('endDate')" id="endCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Son tarixi qeyd edin</span>
                    </div>
                </label>
                <label class="flex flex-col gap-[6px]">
                    <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Status</span> 
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="newCheckbox" class="peer hidden">
                            <label for="newCheckbox" class="w-5 h-5 border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                <div class="icon stratis-check-01 scale-60"></div>
                            </label>
                            <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Yeni</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="readCheckbox" class="peer hidden">
                            <label for="readCheckbox" class="w-5 h-5 border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                <div class="icon stratis-check-01 scale-60"></div>
                            </label>
                            <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Oxundu</span>
                        </div>
                    </div>
                </label>
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağlat</button>
                    <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
                    <button type="submit" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
                </div>
            </form>
        </div>
    `;

    // **Modalın fonuna klik edildikdə bağlanma**
    modal.addEventListener('click', function (event) {
        if (event.target === modal) { // Sadəcə arxa fonda klik edilərsə
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
    let modal = document.getElementById('filterModal');
    if (modal) {
        modal.remove();
    }
}

function clearFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('newCheckbox').checked = false;
    document.getElementById('readCheckbox').checked = false;
}


