// Silindi: əvvəl undefined dropdown/toggle istinadları olan blok (ReferenceError yaradırdı)

// Tab switching functionality
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Digər button-lardan aktiv background class-larını sil
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
      t.classList.add(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark"
      );
    });

    // Kliklənmiş elementə aktiv class-lar əlavə et
    this.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    this.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  });
});

// kartlar tab
document.querySelectorAll(".kartlarTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".kartlarTab").forEach((t) => {
      t.classList.remove(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
      t.classList.add(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark"
      );
    });

    // Kliklənmiş elementə aktiv class-lar əlavə et
    this.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    this.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  });
});

// odenis tab
document.querySelectorAll(".odenisTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".odenisTab").forEach((t) => {
      t.classList.remove(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
      t.classList.add(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark"
      );
    });

    // Kliklənmiş elementə aktiv class-lar əlavə et
    this.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    this.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  });
});

// isciler tab
document.querySelectorAll(".iscilerTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".iscilerTab").forEach((t) => {
      t.classList.remove(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
      t.classList.add(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark"
      );
    });

    // Kliklənmiş elementə aktiv class-lar əlavə et
    this.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    this.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Note: yearDropdownToggle is handled in chart.js to avoid conflicts
  // The chart.js file contains the proper implementation with data-year attributes
});

// date modal
function openDateModal() {
  const modal = document.querySelector("#dateModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeDateModal() {
  const modal = document.querySelector("#dateModal");
  if (modal) {
    modal.classList.add("hidden");
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

function closeFilterModal() {
  let modal = document.getElementById("filterModal");
  if (modal) {
    modal.remove();
  }
}

function clearFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
}

// imtiyaz qruplari
const privilegeModal = document.getElementById("privilegeModal");
const toggleButton = document.getElementById("privilegeModalToggle");

toggleButton.addEventListener("click", () => {
  privilegeModal.classList.remove("hidden");
  privilegeModal.classList.add("flex");
});

function closePrivilegeModal() {
  privilegeModal.classList.add("hidden");
  privilegeModal.classList.remove("flex");
}

document.getElementById("customSearch").addEventListener("input", function () {
  const filter = this.value.toLowerCase().trim();
  const labels = document.querySelectorAll("#privilegeModal ul label");

  labels.forEach((label) => {
    const text = label.textContent.toLowerCase();
    if (text.includes(filter)) {
      label.style.display = "";
    } else {
      label.style.display = "none";
    }
  });
});

function clearFilter() {
  const searchInput = document.getElementById("customSearch");
  searchInput.value = "";

  // Bütün radio-ları seçimsiz et
  document.querySelectorAll('input[name="rowSelectRadio"]').forEach((radio) => {
    radio.checked = false;
  });

  // Bütün label-ləri göstər
  const labels = document.querySelectorAll("#privilegeModal ul label");
  labels.forEach((label) => {
    label.style.display = "";
  });

  searchInput.focus();
}

const modal = document.getElementById("privilegeModal");

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closePrivilegeModal();
  }
});

// Konsolidə olunmuş il dropdown initializer (Toggle2/3/4 üçün)
document.addEventListener("DOMContentLoaded", function () {
  const ids = [2, 3, 4];
  ids.forEach((n) => {
    const toggle = document.getElementById(`yearDropdownToggle${n}`);
    const dropdown = document.getElementById(`yearDropdown${n}`);
    if (!toggle || !dropdown) return; // mövcud deyilsə keç

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    });
    dropdown.addEventListener("click", function (e) { e.stopPropagation(); });
    dropdown.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", function () {
        const span = toggle.querySelector("span");
        if (span) span.textContent = this.textContent;
        dropdown.classList.add("hidden");
      });
    });
    document.addEventListener("click", function () {
      if (!dropdown.classList.contains("hidden")) dropdown.classList.add("hidden");
    });
  });
});
