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

const resetButton = document.querySelector('button[type="reset"]');
if (resetButton) {
  resetButton.addEventListener("click", function () {
    // 🔹 Bütün checkbox-ları uncheck et
    document
      .querySelectorAll('#filterPop input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    // 🔹 Tarix inputlarını təmizlə
    document
      .querySelectorAll('#filterPop input[type="date"]')
      .forEach((input) => {
        input.value = "";
      });

    // 🔹 Dropdown seçimini sıfırla (vizual və real select)
    const dropdownBtn = document.getElementById("dropdownDefaultButton");
    if (dropdownBtn) {
      dropdownBtn.innerHTML = `
        Seçim edin
        <div>
            <img src="/images/avankart-partner-pages-images/chevron-down.svg" alt="" class="w-[15px] h-[13px] block dark:hidden">
            <img src="/images/avankart-partner-pages-images/chevron-down-dark.svg" alt="" class="w-[15px] h-[13px] hidden dark:block">
        </div>
    `;
    }

    const realSelect = document.getElementById("realSelect");
    if (realSelect) {
      realSelect.selectedIndex = 0; // default seçimə qaytarır
    }
  });
}

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus();
  }
}
