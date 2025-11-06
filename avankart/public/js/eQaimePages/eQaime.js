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
          "dark:bg-inverse-on-surface-dark",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
      });

      // Add styles to the clicked button
      this.classList.add(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
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
          "border-messages",
          "dark:border-primary-text-color-dark",
          "text-messages",
          "dark:text-primary-text-color-dark",
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

function toggleYearDropdown() {
  const dropdown = document.getElementById("yearDropdown");
  dropdown.classList.toggle("hidden");
}

// Dropdown xaricinə kliklədikdə bağlamaq
window.addEventListener("click", function (e) {
  const button = e.target.closest("button");
  if (
    !e.target.closest("#yearDropdown") &&
    (!button ||
      !button.onclick ||
      !button.onclick.toString().includes("toggleYearDropdown"))
  ) {
    document.getElementById("yearDropdown")?.classList.add("hidden");
  }
});

function toggleMonthDropdown() {
  const dropdown = document.getElementById("monthDropdown");
  dropdown.classList.toggle("hidden");
}

// Ay dropdownunu kənara klikləyərkən bağla
window.addEventListener("click", function (e) {
  const isMonthTrigger = e.target
    .closest("button")
    ?.onclick?.toString()
    ?.includes("toggleMonthDropdown");
  if (!e.target.closest("#monthDropdown") && !isMonthTrigger) {
    document.getElementById("monthDropdown")?.classList.add("hidden");
  }
});

document.addEventListener("DOMContentLoaded", function () {
    const resetBtn = document.querySelector('#filterPop button[type="reset"]');

    resetBtn.addEventListener("click", function (e) {
      e.preventDefault(); // Formun default reset davranışını istəmirsənsə

      // 1. Bütün checkbox-ları sıfırla
      document.querySelectorAll('#filterPop input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });

      // 2. Year və Month dropdown button-larını default "Seçim edin" vəziyyətinə qaytar
      const dropdownButtons = document.querySelectorAll('#filterPop button');

      dropdownButtons.forEach(button => {
        if (button.textContent.trim().startsWith("Seçim edin")) {
          button.innerHTML = `Seçim edin <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
        }
      });

      // 3. Açıq dropdown-ları bağla (əgər açıq qalıblarsa)
      const dropdowns = document.querySelectorAll('#filterPop .shadow');
      dropdowns.forEach(drop => {
        drop.classList.add("hidden");
      });
    });
  });