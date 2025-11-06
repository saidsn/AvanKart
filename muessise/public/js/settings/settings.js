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


window.clickOperator = function (element) {
  // ekranda görünen texti güncelle
  document.getElementById("operatorText").textContent = element.textContent.trim();

  // gerçek select'i güncelle
  const select = document.getElementById("realSelect");
  // burada data-value '+01' gibi → option value'ları ise 01
  const cleanValue = element.dataset.value.replace("+", ""); 
  select.value = cleanValue;

  // change event tetiklemek istersen:
  select.dispatchEvent(new Event("change"));
}

const notificationsOverlay = document.getElementById("notificationsOverlay");
const notificationsModal = document.getElementById("notificationsModal");
const allNotificationsModal = document.getElementById("allNotificationsModal");
const personalNotificationsModal = document.getElementById(
  "personalNotificationsModal"
);

function openNotificationsModal() {
  notificationsModal.innerHTML = `<div class="w-[497px] bg-menu dark:bg-menu-dark border border-stroke dark:border-[#FFFFFF1A] rounded-[12px]">
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
                                Hamısı ()
                            </a>
                        </li>
                        <li>
                            <a onclick="toggleActiveTab(event, 'all')" href="#" class="filterModal-button read inline-flex items-center justify-center py-2 border-b-2 border-transparent rounded-t-lg hover:text-messages dark:hover:text-primary-text-color-dark hover:border-messages dark:hover:border-primary-text-color-dark group">
                                Oxunmuşlar ()
                            </a>
                        </li>
                        <li>
                            <a onclick="toggleActiveTab(event, 'all')" href="#" class="filterModal-button unread inline-flex items-center justify-center py-2 border-b-2 border-transparent rounded-t-lg hover:text-messages dark:hover:text-primary-text-color-dark hover:border-messages dark:hover:border-primary-text-color-dark group">
                                Oxunmamışlar ()
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div id="allNotificationsModal" class="py-1 px-3">
               
                <div class="text-center pt-5 pb-3">
                    <a href="/notifications" class="cursor-pointer text-[12px] font-medium text-messages dark:text-primary-text-color-dark dark:hover:text-messages hover:bg-[#F6D9FF] px-3 py-[2px] rounded-[50px]">Hamısına bax</a>
                </div>
            </div>
            <div id="personalNotificationsModal" class="hidden py-1 px-3">
            </div>
        </div>`

  notificationsModal.classList.remove("hidden");
  notificationsOverlay.classList.remove("hidden");
}

function closeNotifications() {
  notificationsModal.classList.add("hidden");
  notificationsOverlay.classList.add("hidden");
}

function openAllNotificationsModal() {
  // Show the "all notifications" section and hide the "personal notifications" section
  document.getElementById("allNotificationsModal").classList.remove("hidden");
  document.getElementById("personalNotificationsModal").classList.add("hidden");

  // Get the buttons
  const allNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(1)"
  );
  const personalNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(2)"
  );

  // Check if the "All Notifications" button is not active and add the "active" class
  if (!allNotificationsButton.classList.contains("active")) {
    allNotificationsButton.classList.add("active");
    allNotificationsButton.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    allNotificationsButton.classList.add(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    allNotificationsButton.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );

    // Remove "active" and change styles of the "Personal Notifications" button
    personalNotificationsButton.classList.remove("active");
    personalNotificationsButton.classList.remove(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    personalNotificationsButton.classList.remove(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    personalNotificationsButton.classList.add(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  }
}

function openPersonalNotificationsModal() {
  // Show the "personal notifications" section and hide the "all notifications" section
  document.getElementById("allNotificationsModal").classList.add("hidden");
  document
    .getElementById("personalNotificationsModal")
    .classList.remove("hidden");

  // Get the buttons
  const allNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(1)"
  );
  const personalNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(2)"
  );

  // Check if the "Personal Notifications" button is not active and add the "active" class
  if (!personalNotificationsButton.classList.contains("active")) {
    personalNotificationsButton.classList.add("active");
    personalNotificationsButton.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    personalNotificationsButton.classList.add(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    personalNotificationsButton.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );

    // Remove "active" and change styles of the "All Notifications" button
    allNotificationsButton.classList.remove("active");
    allNotificationsButton.classList.remove(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    allNotificationsButton.classList.remove(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    allNotificationsButton.classList.add(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
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

document.addEventListener("DOMContentLoaded", function () {
  // Korporativ və fərdi bildiriş düymələri
  const notificationButtons = document.querySelectorAll(".notification-type");

  notificationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Əgər düymə artıq aktivdirsə, "active" sinfini sil və text rəngini dəyiş
      if (this.classList.contains("active")) {
        this.classList.remove(
          "active",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
        this.classList.add(
          "text-tertiary-text",
          "dark:text-tertiary-text-color-dark"
        ); // Rəngi dəyiş
      } else {
        // Digər düymələrdən "active" sinfini və rəngləri sil
        notificationButtons.forEach((btn) => {
          btn.classList.remove(
            "active",
            "text-messages",
            "dark:text-primary-text-color-dark"
          );
          btn.classList.add(
            "text-tertiary-text",
            "dark:text-tertiary-text-color-dark"
          ); // Digər düymələrə text-tertiary-text əlavə et
        });

        // Seçilən düyməyə "active" sinfini əlavə et və text-messages rəngini təyin et
        this.classList.add(
          "active",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
        this.classList.remove(
          "text-tertiary-text",
          "dark:text-tertiary-text-color-dark"
        ); // Digər rəngi sil
      }
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
            <form id="sessionsFilterForm" class="flex flex-col gap-3" onsubmit="return false;">
                <label class="flex flex-col gap-[6px]">
                    <p class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium">Tarix aralığı</p>
                    <div class="relative w-full">
                        <input id="startDate" name="start_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder:text-[#BFC8CC] dark:placeholder:text-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
                        <div onclick="openDatePicker('startDate')" id="startCalendar" class="cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark"></div>
                    </div>
                    <div class="text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1">
                        <div class="icon stratis-information-circle-contained"></div>
                        <span>Başlanğıc tarixini qeyd edin</span>
                    </div>
                </label>
                <label class="flex flex-col gap-[6px]">
                    <div class="relative w-full">
                        <input id="endDate" name="end_date" class="custom-date cursor-pointer text-[13px] font-normal placeholder:text-[#BFC8CC] dark:placeholder:text-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none" type="date" placeholder="dd/mm/yyyy">
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
                            <input type="checkbox" id="newCheckbox" name="status[]" value="Yeni" class="peer hidden">
                            <label for="newCheckbox" class="w-5 h-5 border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                                <div class="icon stratis-check-01 scale-60"></div>
                            </label>
                            <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Yeni</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="readCheckbox" name="status[]" value="Oxundu" class="peer hidden">
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
                    <button type="button" id="applyFilterBtn" data-form="sessionsFilterForm" data-table="myTable" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
                </div>
            </form>
        </div>
    `;

  modal.addEventListener("click", function (e) {
    
        console.log(e,"ye baxiriq ")
    if (e.target && e.target.id === "applyFilterBtn") {
  
      
      if (typeof filterForm === "function") {
        filterForm();
      }
      closeFilterModal();
    }
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
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
  document.getElementById("newCheckbox").checked = false;
  document.getElementById("readCheckbox").checked = false;
}

// Bütün radio input-ları seç
const radioButtons = document.querySelectorAll(".radio-input");

radioButtons.forEach((radio) => {
  radio.addEventListener("change", () => {
    // Bütün iç dairələri və border-ləri default vəziyyətə qaytar
    document.querySelectorAll(".inner-circle").forEach((circle) => {
      circle.classList.add("hidden");
    });
    document.querySelectorAll(".radio-container").forEach((container) => {
      container.classList.remove("border-hover-button");
      container.classList.add("border-surface-variant");
    });

    // Seçilmiş radio-nun border rəngini dəyiş və iç dairəsini göstər
    if (radio.checked) {
      let parentContainer = radio.nextElementSibling;
      parentContainer.classList.add("border-hover-button");
      parentContainer.classList.remove("border-surface-variant");
      parentContainer.querySelector(".inner-circle").classList.remove("hidden");
    }
  });
});

// Redakte div

let redakteDiv = document.querySelector(".redakte-div");
let overlay = document.querySelector("#overlay");
let aside = document.querySelector("aside");
let span4 = document.querySelector(".span4");
let span4_1 = document.querySelector(".span4-1");
let curveleft = document.querySelector(".curve-left-div");
let tenzimlemelerDiv = document.querySelector("#tenzimlemeler-div");
let destekDiv = document.querySelector(".destek-div");
let destekLogo = document.querySelector(".destek-logo");
let toggleclick = false;

function toggleRedakte() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    redakteDiv.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    destekLogo.style.background = "transparent";
    span4_1.style.background = "transparent";
    destekDiv.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
  } else {
    redakteDiv.style.display = "none";
    overlay.style.display = "none";
  }
}

// Sifreni Yenile Div

let passwordDiv = document.querySelector(".password-div");

function togglePassword() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    passwordDiv.style.display = "block";
    overlay.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    destekLogo.style.background = "transparent";
    span4_1.style.background = "transparent";
    destekDiv.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
  } else {
    passwordDiv.style.display = "none";
    overlay.style.display = "none";
  }
}

// Email Dogrulama

let emaildogrulamaDiv = document.querySelector(".emaildogrulama-div");

function toggleEmail(formName) {
  toggleclick = !toggleclick;
  if (toggleclick) {
    submitForm(formName);
    emaildogrulamaDiv.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    destekLogo.style.background = "transparent";
    span4_1.style.background = "transparent";
    destekDiv.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
  } else {
    emaildogrulamaDiv.style.display = "none";
    overlay.style.display = "none";
  }
}

let emailUgurlu = document.querySelector(".email-ugurlu");

function submitEmail() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    emailUgurlu.style.display = "none";
  } else {
    emaildogrulamaDiv.style.display = "none";
    emailUgurlu.style.display = "block";
    overlay.style.display = "none";
  }
}

let nomredogrulamaDiv = document.querySelector(".nomredogrulama-div");

function toggleNomre(formName) {
  toggleclick = !toggleclick;
  if (toggleclick) {
    submitForm(formName);
    nomredogrulamaDiv.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    destekLogo.style.background = "transparent";
    span4_1.style.background = "transparent";
    destekDiv.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
  } else {
    nomredogrulamaDiv.style.display = "none";
    overlay.style.display = "none";
  }
}

let nomreUgurlu = document.querySelector(".nomre-ugurlu");

function submitNomre() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    nomreUgurlu.style.display = "none";
  } else {
    nomredogrulamaDiv.style.display = "none";
    nomreUgurlu.style.display = "block";
    overlay.style.display = "none";
  }
}

let authenticatorDiv = document.querySelector(".authenticator-div");
function toggleAuthenticator(formName) {
  toggleclick = !toggleclick;

  const qrBox = document.getElementById("qrBox");
  const scanBar = qrBox.querySelector(".scan-bar");

  if (toggleclick) {
    submitForm(formName);
    authenticatorDiv.style.display = "block";
    overlay.style.display = "block";

    // Animasiya class-larını sıfırlayıb təzədən əlavə edirik
    qrBox.classList.remove("qr-animate");
    void qrBox.offsetWidth; // Reflow — animasiyanı resetləmək üçün
    qrBox.classList.add("qr-animate");

    // Bar animasiyasını təzələmək üçün də eyni şeyi edirik
    scanBar.classList.remove("scan-bar");
    void scanBar.offsetWidth;
    scanBar.classList.add("scan-bar");

    // Qalan fonda dəyişikliklər
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    destekLogo.style.background = "transparent";
    span4_1.style.background = "transparent";
    destekDiv.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
  } else {
    authenticatorDiv.style.display = "none";
    overlay.style.display = "none";
  }

  setTimeout(clearDiv, 4000);

  function clearDiv() {
    let authenticatorTesdiq = document.querySelector(".authenticator-tesdiq");

    authenticatorDiv.style.display = "none";
    authenticatorTesdiq.style.display = "block";
  }
}

let authenticatorTesdiq = document.querySelector(".authenticator-tesdiq");

function ireliAuthenticator() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    authenticatorDiv.style.display = "none";
    authenticatorTesdiq.style.display = "none";
    overlay.style.display = "none";
  } else {
    authenticatorDiv.style.display = "none";
    authenticatorTesdiq.style.display = "block";
    overlay.style.display = "block";
  }
}

let authenticatorUgurlu = document.querySelector(".authenticator-ugurlu");

function submitTesdiq() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    authenticatorUgurlu.style.display = "block";
    authenticatorTesdiq.style.display = "none";
    overlay.style.display = "block";
  } else {
    authenticatorDiv.style.display = "none";
    authenticatorTesdiq.style.display = "none";
    authenticatorUgurlu.style.display = "none";
    overlay.style.display = "none";
  }
}

function yenidenYoxla() {
  toggleclick = !toggleclick;
  let timeoutModal = document.querySelector("#timeoutModal");
  if (toggleclick) {
    timeoutModal.style.display = "none";
  } else {
    timeoutModal.style.display = "block";
  }
}



window.showSessionTooltip = function (element) {
  $(".custom-tooltip").remove();

  const message = element.getAttribute("data-tooltip");

  const tooltip = document.createElement("div");
  tooltip.className =
    "custom-tooltip absolute w-[107px] h-[36px] px-4 py-1 text-[13px] font-medium text-[#1D222B] bg-white rounded-lg shadow-md z-50 cursor-pointer transition  hover:bg-container-2 flex items-center justify-center";
  tooltip.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)"; // #0000001A = rgba(0,0,0,0.1)
  tooltip.style.whiteSpace = "nowrap";

  const triangle = document.createElement("div");
  triangle.className =
    "absolute top-[-6px] right-[12px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white";
  tooltip.appendChild(triangle);

  const text = document.createElement("div");
  text.innerText = message;
  tooltip.appendChild(text);

  const parent = element.closest(".relative");
  if (parent) {
    parent.appendChild(tooltip);

    tooltip.style.top = "calc(100% + 8px)";
    tooltip.style.right = "6px";
  }

  // tooltip klik hadisəsi düzgün əlavə edildi
  tooltip.addEventListener("click", function () {
    openPopup(element); // element ötürülür
    tooltip.remove();
  });

  setTimeout(() => {
    tooltip.remove();
  }, 3000);
};

function openPopup(clickedElement) {
  $(".custom-popup").remove();

  const popupOverlay = document.createElement("div");
  popupOverlay.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[9999]";

  const popup = document.createElement("div");
  popup.className =
    "bg-white w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative";
  console.log(clickedElement);
  popup.innerHTML = `
    <div class="w-[306px] flex flex-col gap-3">
      <div class="w-10 h-10 rounded-full bg-inverse-on-surface flex items-center justify-center">
        <div class="iconex iconex-music-plate-1 w-5 h-5"></div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-[#1D222B] font-medium text-[15px]">Sessiya</div>
        <div class="text-secondary-text text-[13px] font-normal">Seçilən bütün sessiyaları bitirmək istədiyinizə əminsiniz?</div>
      </div>
    </div>
    
    <form class="flex justify-end gap-2 w-full mt-2 text-xs font-medium" data-url="/settings/end-session" onsubmit="return false;" id="endSessionForm">
      <input type="hidden" name="sessionId" value="${clickedElement.getAttribute(
        "data-session-id"
      )}">
      <input type="hidden" name="_csrf" value="${document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content")}">
      <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant bg-surface-bright hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
      <button class="cursor-pointer px-3 py-1 rounded-full text-on-primary bg-error transition" id="confirmDeleteBtn" onclick="submitForm('endSession'); this.closest('.custom-popup').remove();">Bəli, bitir</button>
    </form>
  `;

  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);

  // Overlay klikləndikdə bağla
  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
}
// Bu kodu settings.js faylının SONUNA əlavə edin - mövcud kodları toxunmayın:

// OTP və 2FA callback sistemi
document.addEventListener("DOMContentLoaded", function () {
  // Əgər submitForm əvvəllər wrap edilməyibsə
  if (typeof window.originalSubmitForm === "undefined" && typeof submitForm === "function") {
    window.originalSubmitForm = submitForm;

    // submitForm-u yenidən təyin edirik
    window.submitForm = function (formId) {
      const form = document.getElementById(formId + "Form") || document.getElementById(formId);
      if (!form) return;

      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value; // bütün input dəyərləri burada yığılır
      }

      const url = form.getAttribute("data-url");
      if (url) {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((responseData) => {
            console.log("Serverdən gələn data:", responseData);

            // QR kodu göstərmək
            if (responseData.qr) {
              const qrImg = document.getElementById("qrImageCont");
              if (qrImg) {
                qrImg.src = responseData.qr;
                qrImg.classList.remove("hidden");
              }
            }

            // Secret-i formatlayıb göstərmək
            if (responseData.manualCode) {
              const formattedSecret = responseData.manualCode.match(/.{1,4}/g).join(" - ");
              const secretDiv = document.getElementById("authKeyCont");
              if (secretDiv) secretDiv.textContent = formattedSecret;
            }

            // Əgər xüsusi handle callback varsa
            if (typeof handleFormResponse === "function") {
              handleFormResponse(formId, null, responseData);
            }

            // Server error varsa konsolda göstər
            if (responseData.error) {
              console.error("Server error:", responseData.error);
            }
          })
          .catch((error) => console.error("Fetch error:", error));
      }

      // Orijinal submitForm-u da çağırmaq istəyirsənsə
      if (window.originalSubmitForm && typeof window.originalSubmitForm === "function") {
        return window.originalSubmitForm(formId);
      }
    };
  }
});


// handleFormResponse funksiyasını da əlavə edirik
function handleFormResponse(formId, response, data) {
  // OTP request-lər üçün popup açma
  if (formId === "toggleEmailForm" && data.showPopup && data.type === "email") {
    if (emaildogrulamaDiv) emaildogrulamaDiv.style.display = "block";
    if (overlay) overlay.style.display = "block";
    return;
  }

  if (formId === "toggleNomreForm" && data.showPopup && data.type === "sms") {
    if (nomredogrulamaDiv) nomredogrulamaDiv.style.display = "block";
    if (overlay) overlay.style.display = "block";
    return;
  }

  if (
    formId === "toggleAuthenticatorForm" &&
    data.showPopup &&
    data.type === "authenticator"
  ) {
    if (authenticatorDiv) authenticatorDiv.style.display = "block";
    if (overlay) overlay.style.display = "block";
    return;
  }

  // OTP təsdiqlər üçün success popup açma
  if (formId === "toggleEmailOtpForm" && data.success) {
    showSuccessPopup("email", data.message);
    return;
  }

  if (formId === "toggleNomreOtpForm" && data.success) {
    showSuccessPopup("sms", data.message);
    return;
  }

  if (formId === "toggleAuthenticatorOtpForm" && data.success) {
    showSuccessPopup("authenticator", data.message);
    return;
  }
}

// Success popup funksiyası
function showSuccessPopup(type, message) {
  let successPopup, otpPopup;

  switch (type) {
    case "email":
      otpPopup = emaildogrulamaDiv;
      successPopup = emailUgurlu;
      if (successPopup && successPopup.querySelector("span:last-child")) {
        successPopup.querySelector("span:last-child").textContent = message;
      }
      break;
    case "sms":
      otpPopup = nomredogrulamaDiv;
      successPopup = nomreUgurlu;
      if (successPopup && successPopup.querySelector("span:last-child")) {
        successPopup.querySelector("span:last-child").textContent = message;
      }
      break;
    case "authenticator":
      otpPopup = authenticatorTesdiq;
      successPopup = authenticatorUgurlu;
      if (successPopup && successPopup.querySelector("span:last-child")) {
        successPopup.querySelector("span:last-child").textContent = message;
      }
      break;
  }

  if (otpPopup && successPopup) {
    // OTP popup-ı bağla
    otpPopup.style.display = "none";

    // Success popup-ı göstər
    successPopup.style.display = "block";
    if (overlay) overlay.style.display = "block";

    // 3 saniyə sonra bağla
    setTimeout(() => {
      successPopup.style.display = "none";
      if (overlay) overlay.style.display = "none";
    }, 3000);
  }
}
