// Tab switching
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", function() {
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

// Kartlar tab
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

// Ödənilmiş tab
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

// İşçilər tab
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
  const toggle = document.getElementById("yearDropdownToggle");
  const dropdown = document.getElementById("yearDropdown");

  toggle.addEventListener("click", function (e) {
    e.stopPropagation(); // Digər click-ləri blokla
    dropdown.classList.toggle("hidden");
  });

  // Dropdown-a klik etdikdə də bağlanmasın
  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Çöldə klik etdikdə dropdown bağlansın
  document.addEventListener("click", function () {
    dropdown.classList.add("hidden");
  });

  // İli seçdikdə yazını dəyiş və dropdown-u bağla
  dropdown.querySelectorAll("div").forEach((item) => {
    item.addEventListener("click", function () {
      toggle.querySelector("span").textContent = this.textContent;
      dropdown.classList.add("hidden");
    });
  });
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

// Silinmiş: yearDropdownToggle2/3 duplikat handlerlər

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("yearDropdownToggle4");
  const dropdown = document.getElementById("yearDropdown4");

  toggle.addEventListener("click", function (e) {
    e.stopPropagation(); // Digər click-ləri blokla
    dropdown.classList.toggle("hidden");
  });

  // Dropdown-a klik etdikdə də bağlanmasın
  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Çöldə klik etdikdə dropdown bağlansın
  document.addEventListener("click", function () {
    dropdown.classList.add("hidden");
  });

  // İli seçdikdə yazını dəyiş və dropdown-u bağla
  dropdown.querySelectorAll("div").forEach((item) => {
    item.addEventListener("click", function () {
      toggle.querySelector("span").textContent = this.textContent;
      dropdown.classList.add("hidden");
    });
  });
});
