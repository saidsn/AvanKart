document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("chartToggle");
  const chartsContainer = document.getElementById("chartsContainer");

  toggleButton.addEventListener("click", function () {
    // Ok ikonunu fırladır (aşağıdan yuxarı)
    this.classList.toggle("rotate-45");

    // chartsContainer-ın maksimum hündürlüyünü və şəffaflığını dəyişdirərək animasiya yaradır
    if (chartsContainer.classList.contains("active")) {
      chartsContainer.classList.remove("active", "opacity-100");
      chartsContainer.classList.add("hidden", "opacity-0");
    } else {
      chartsContainer.classList.remove("hidden", "opacity-0");
      chartsContainer.classList.add("active", "opacity-100");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("chartToggle2");
  const chartsContainer = document.getElementById("chartsContainer2");

  toggleButton.addEventListener("click", function () {
    // Ok ikonunu fırladır (aşağıdan yuxarı)
    this.classList.toggle("rotate-45");

    // chartsContainer-ın maksimum hündürlüyünü və şəffaflığını dəyişdirərək animasiya yaradır
    if (chartsContainer.classList.contains("active")) {
      chartsContainer.classList.remove("active", "opacity-100");
      chartsContainer.classList.add("hidden", "opacity-0");
    } else {
      chartsContainer.classList.remove("hidden", "opacity-0");
      chartsContainer.classList.add("active", "opacity-100");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("chartToggle3");
  const chartsContainer = document.getElementById("chartsContainer3");

  toggleButton.addEventListener("click", function () {
    // Ok ikonunu fırladır (aşağıdan yuxarı)
    this.classList.toggle("rotate-45");

    // chartsContainer-ın maksimum hündürlüyünü və şəffaflığını dəyişdirərək animasiya yaradır
    if (chartsContainer.classList.contains("active")) {
      chartsContainer.classList.remove("active", "opacity-100");
      chartsContainer.classList.add("hidden", "opacity-0");
    } else {
      chartsContainer.classList.remove("hidden", "opacity-0");
      chartsContainer.classList.add("active", "opacity-100");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("chartToggle4");
  const chartsContainer = document.getElementById("chartsContainer4");

  toggleButton.addEventListener("click", function () {
    // Ok ikonunu fırladır (aşağıdan yuxarı)
    this.classList.toggle("rotate-45");

    // chartsContainer-ın maksimum hündürlüyünü və şəffaflığını dəyişdirərək animasiya yaradır
    if (chartsContainer.classList.contains("active")) {
      chartsContainer.classList.remove("active", "opacity-100");
      chartsContainer.classList.add("hidden", "opacity-0");
    } else {
      chartsContainer.classList.remove("hidden", "opacity-0");
      chartsContainer.classList.add("active", "opacity-100");
    }
  });
});

//fill years modal
document.addEventListener("DOMContentLoaded", function () {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 7;
  const yearsList = document.getElementById("yearsList");
  yearsList.innerHTML = "";

  for (let y = currentYear; y >= startYear; y--) {
    const id = `checkbox-${y}`;
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.className = "block py-2 flex items-center gap-2 cursor-pointer";

    label.innerHTML = `
      <input id="${id}" type="checkbox" value="${y}"
        class="rounded-[2px] w-[18px] h-[18px] border-[1px] border-surface-variant text-primary 
               focus:outline-none focus:ring-0 focus:shadow-none hover:bg-surface-container-low 
               disabled:bg-switch dark:bg-[var(--color-table-hover-dark)] dark:border-[#40484C]" />
      <div class="text-[13px] text-[#1D222B] pb-[4px] dark:text-[#FFFFFF]">${y}</div>
    `;
    yearsList.appendChild(label);
  }
});

let currentTarget = null; // hansı table üçün modal açılıb

function openYearsModal(element) {
  currentTarget = element.getAttribute("data-target");
  const modal = document.getElementById("yearsModal");

  // checkbox-ları sıfırla
  document
    .querySelectorAll("#yearsModal input[type=checkbox]")
    .forEach((cb) => (cb.checked = false));

  let selectedYears;
  switch (currentTarget) {
    case "balansHereketi":
      selectedYears = balanceMovementSelectedYears;
      break;
    case "sirketSayi":
      selectedYears = sirketSayiYears;
      break;
    case "sirketlerdenAlınanMebleğ":
      selectedYears = receivedAmountSelectedYears;
      break;
    case "istifadeçiQeydiyyatiSayi":
      selectedYears = registeredUserSelectedYears;
      break;
    case "tranzaksiyaSayi":
      selectedYears = transactionSelectedYears;
      break;
    case "kartlarUzreMedaxil":
      selectedYears = medaxilKartSelectedYears;
      break;
    case "kartlarUzrəMexaric":
      selectedYears = mexaricKartSelectedYears;
      break;
    case "muessiseSayi":
      selectedYears = muessiseSayiYears;
      break;
    case "hesablasma":
      selectedYears = hesapSelectedYears;
      break;
    case "alınanKomissiyalar":
      selectedYears = commissionSelectedYears;
      break;

    default:
      selectedYears = undefined;
      break;
  }

  if (!selectedYears) {
    return null;
  }

  selectedYears.forEach((year) => {
    const cb = document.querySelector(`#yearsModal input[value="${year}"]`);
    if (cb) cb.checked = true;
  });

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeYearsModal() {
  document.getElementById("yearsModal").classList.add("hidden");
  currentTarget = null;
}

function applyYearsFilter() {
  const selectedYears = Array.from(
    document.querySelectorAll("#yearsModal input[type=checkbox]:checked")
  ).map((cb) => cb.value);

  if (currentTarget === "hesablasma") {
    window.applyHesablasmaFilter(selectedYears);
  } else if (currentTarget === "komissiya") {
    window.applyKomissiyaFilter(selectedYears);
  } else if (currentTarget === "muessise") {
    window.applyMuessiseFilter(selectedYears);
  }

  closeYearsModal();
}
window.openYearsModal = openYearsModal;
window.closeYearsModal = closeYearsModal;
window.applyYearsFilter = applyYearsFilter;

// Modal arxa fonuna kliklə bağlama
document.getElementById("yearsModal").addEventListener("click", function () {
  closeYearsModal();
});

// Modalın içindəki əsas konteyner kliklərində eventin yayılmasını dayandırırıq
document
  .querySelector("#yearsModal > div")
  .addEventListener("click", function (event) {
    event.stopPropagation();
  });

// Search input üçün event listener
document.getElementById("customSearch").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  const listItems = document.querySelectorAll(
    "#yearsModal ul li, #yearsModal ul label"
  );

  // Checkboxların olduğu label elementlərinə baxırıq
  document.querySelectorAll("#yearsModal ul label").forEach((label) => {
    const text = label.textContent.toLowerCase();
    if (text.includes(filter)) {
      label.style.display = "flex"; // Göstər
    } else {
      label.style.display = "none"; // Gizlət
    }
  });
});

// ClearFilter funksiyası: bütün checkboxları sıfırla və axtarışı təmizlə
function clearFilter() {
  // Bütün checkboxları tap və unchecked et
  document
    .querySelectorAll('#yearsModal input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  // Axtarış inputunu təmizlə
  const searchInput = document.getElementById("customSearch");
  searchInput.value = "";

  // Bütün label-ları göstər
  document.querySelectorAll("#yearsModal ul label").forEach((label) => {
    label.style.display = "flex";
  });
}

// Modalın içində "Filterlə" düyməsi üçün
function applyYearFilter() {
  const selectedYears = Array.from(
    document.querySelectorAll('#yearsModal input[type="checkbox"]:checked')
  ).map((el) => el.value);
  if (currentTarget === "hesablasma") {
    filterHesablasmaTable(selectedYears);
  } else if (currentTarget === "komissiya") {
    filterKomissiyaTable(selectedYears);
  } else if (currentTarget === "muessise") {
    filterMuessiseTable(selectedYears);
  }

  closeYearsModal();
}

function openSirketlerModal() {
  const modal = document.getElementById("sirketlerModal");
  modal.classList.remove("hidden");
}

function closeSirketlerModal() {
  const modal = document.getElementById("sirketlerModal");
  modal.classList.add("hidden");
}

// Modal arxa fonuna kliklə bağlama
document
  .getElementById("sirketlerModal")
  .addEventListener("click", function () {
    closeSirketlerModal();
  });

// Modalın içindəki əsas konteyner kliklərində eventin yayılmasını dayandırırıq
document
  .querySelector("#sirketlerModal > div")
  .addEventListener("click", function (event) {
    event.stopPropagation();
  });

// Search üçün
document
  .getElementById("sirketSearchInput")
  .addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const items = document.querySelectorAll("#sirketlerModal .divide-y > div");

    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      if (text.includes(filter)) {
        item.style.display = "flex"; // göstər
        item.style.alignItems = "center"; // ikon və yazı düz hizalansın
        item.style.gap = "8px"; // boşluq əlavə et
        item.style.padding = "8px 0"; // üst-alt boşluq
      } else {
        item.style.display = "none"; // gizlət
      }
    });
  });

// Modalı açmaq üçün
function openMuessiselerModal() {
  const modal = document.getElementById("muessiselerModal");
  modal.classList.remove("hidden");
}

// Modalı bağlamaq üçün
function closeMuessiselerModal() {
  const modal = document.getElementById("muessiselerModal");
  modal.classList.add("hidden");
}

// Modal arxa fonda kliklə bağlansın
document
  .getElementById("muessiselerModal")
  .addEventListener("click", function () {
    closeMuessiselerModal();
  });

// Modal kontenti kliklənəndə bağlanmasın
document
  .querySelector("#muessiselerModal > div")
  .addEventListener("click", function (event) {
    event.stopPropagation();
  });

// Axtarış funksiyası
document
  .getElementById("muessiseSearchInput")
  .addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const items = document.querySelectorAll(
      "#muessiselerModal .divide-y > div"
    );

    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      if (text.includes(filter)) {
        item.style.display = "flex"; // göstərin
      } else {
        item.style.display = "none"; // gizlədin
      }
    });
  });

function openKartlarModal() {
  const modal = document.getElementById("kartlarModal");
  modal.classList.remove("hidden");
}

function closeKartlarModal() {
  const modal = document.getElementById("kartlarModal");
  modal.classList.add("hidden");
}

// Kənara kliklədikdə modalı bağla
document.addEventListener("click", function (event) {
  const modal = document.getElementById("kartlarModal");
  const modalContent = modal.querySelector("div[class*='rounded-xl']"); // Modal içindəki əsas content

  // Modal açıqdırsa və klik modalContent-in içində deyilsə və klik modalın özündədirsə
  if (
    !modal.classList.contains("hidden") &&
    !modalContent.contains(event.target) &&
    modal.contains(event.target)
  ) {
    closeKartlarModal();
  }
});

// ESC düyməsi ilə bağlamaq üçün (əlavə)
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeKartlarModal();
  }
});

// Axtarış inputu
const searchInput = document.getElementById("customSearch4");

// Checkbox-label-ları tut
const labels = document.querySelectorAll("#kartlarModal ul label");

// Axtarış funksiyası
searchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase().trim();

  labels = document.querySelectorAll("#kartlarModal ul label");

  labels.forEach((label) => {
    const text = label.textContent.toLowerCase();
    if (text.includes(query)) {
      label.style.display = "flex";
    } else {
      label.style.display = "none";
    }
  });
});

// "Filterləri təmizlə" düyməsi
function clearKartlarFilter() {
  searchInput.value = "";
  labels.forEach((label) => {
    label.style.display = "flex";
  });
  document
    .querySelectorAll("#kartlarModal input[type='checkbox']")
    .forEach((cb) => (cb.checked = false));
}

// Modalı bağlama funksiyası
function closeKartlarModal() {
  document.getElementById("kartlarModal").classList.add("hidden");
}
