function toggleActiveTab(event, tab) {
  const tabs = document.querySelectorAll(".filterModal-button");
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
  const clickedTab = event.currentTarget;
  clickedTab.classList.add(
    "active",
    "text-messages",
    "dark:text-primary-text-color-dark",
    "border-messages",
    "dark:border-primary-text-color-dark"
  );
  clickedTab.classList.remove("border-transparent");
}

document.addEventListener("DOMContentLoaded", function () {
  const notificationButtons = document.querySelectorAll(".notification-type");
  notificationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      notificationButtons.forEach((btn) => {
        btn.classList.remove(
          "bg-inverse-on-surface",
          "dark:bg-inverse-on-surface-dark",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
      });
      this.classList.add(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
    });
  });
  const filterButtons = document.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      filterButtons.forEach((btn) => {
        btn.classList.remove(
          "border-messages",
          "dark:border-primary-text-color-dark",
          "text-messages",
          "dark:text-primary-text-color-dark",
          "border-b-2"
        );
      });
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
        this.classList.remove(
          "active",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
        this.classList.add(
          "text-tertiary-text",
          "dark:text-tertiary-text-color-dark"
        );
      } else {
        notificationButtons.forEach((btn) => {
          btn.classList.remove(
            "active",
            "text-messages",
            "dark:text-primary-text-color-dark"
          );
          btn.classList.add(
            "text-tertiary-text",
            "dark:text-tertiary-text-color-dark"
          );
        });
        this.classList.add(
          "active",
          "text-messages",
          "dark:text-primary-text-color-dark"
        );
        this.classList.remove(
          "text-tertiary-text",
          "dark:text-tertiary-text-color-dark"
        );
      }
    });
  });
});

function toggleYearDropdown() {
  const dropdown = document.getElementById("yearDropdown");
  dropdown.classList.toggle("hidden");
}

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
      e.preventDefault();
      document.querySelectorAll('#filterPop input[type="checkbox"]').forEach(cb => { cb.checked = false; });
      const dropdownButtons = document.querySelectorAll('#filterPop button');
      dropdownButtons.forEach(button => {
        if (button.textContent.trim().startsWith("Seçim edin")) {
          button.innerHTML = `Seçim edin <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
        }
      });
      const dropdowns = document.querySelectorAll('#filterPop .shadow');
      dropdowns.forEach(drop => { drop.classList.add("hidden"); });
    });
  });

  const yearContainer = document.getElementById('yearDropdown');
  const yearButton = document.querySelector('#filterPop button[onclick="toggleYearDropdown()"]');
  if (yearContainer && yearButton) {
    yearContainer.addEventListener('change', () => {
      const checked = [...yearContainer.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
      if (checked.length === 0) {
        yearButton.innerHTML = `Seçim edin <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
      } else if (checked.length === 1) {
        yearButton.innerHTML = `${checked[0]} <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
      } else {
        yearButton.innerHTML = `${checked[0]} +${checked.length - 1} <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
      }
    });
    yearContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const evt = new Event('change');
        yearContainer.dispatchEvent(evt);
      });
    });
  }

  const monthContainer = document.getElementById('monthDropdown');
  const monthButton = document.querySelector('#filterPop button[onclick="toggleMonthDropdown()"]');
  if (monthContainer && monthButton) {
    monthContainer.addEventListener('change', () => {
      const mapNames = {
        '01': 'Yanvar','02': 'Fevral','03': 'Mart','04': 'Aprel','05': 'May','06': 'İyun','07': 'İyul','08': 'Avqust','09': 'Sentyabr','10': 'Oktyabr','11': 'Noyabr','12': 'Dekabr'
      };
      const checked = [...monthContainer.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
      if (checked.length === 0) {
        monthButton.innerHTML = `Seçim edin <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
      } else if (checked.length === 1) {
        monthButton.innerHTML = `${mapNames[checked[0]] || checked[0]} <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
      } else {
        monthButton.innerHTML = `${mapNames[checked[0]] || checked[0]} +${checked.length - 1} <img src="/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">`;
      }
    });
    monthContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const evt = new Event('change');
        monthContainer.dispatchEvent(evt);
      });
    });
  }