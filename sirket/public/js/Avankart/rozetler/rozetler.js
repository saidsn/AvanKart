document.addEventListener("DOMContentLoaded", function () {
  const data = JSON.parse(localStorage.getItem("selectedRozet"));
  const nameEl = document.getElementById("rozetName");

  if (data && nameEl) {
    nameEl.textContent = data.categoryName || "Kategoriya tapılmadı";
  }
});

function openRozet() {
  const modal = document.getElementById("rozetModal");
  modal.classList.remove("hidden");

  // Kənara kliklə bağlanmanı aktivləşdir
  setTimeout(() => {
    document.addEventListener("click", handleOutsideRozetClick);
  }, 0);
}

function closeRozet() {
  const modal = document.getElementById("rozetModal");
  modal.classList.add("hidden");

  // Modal içindəki bütün input sahələrini və seçimləri sıfırla
  document
    .querySelectorAll("#rozetModal input[type='text']")
    .forEach((input) => (input.value = ""));
  document
    .querySelectorAll("#rozetModal textarea")
    .forEach((textarea) => (textarea.value = ""));

  // Kateqoriya seçimini sıfırla
  document.getElementById("selectedCategoryText").innerText = "Seçim edin";

  // Şəkil önizləməsini gizlət və ikonları geri gətir
  const uploadedImage = document.getElementById("uploadedImage");
  const rocketIcon = document.getElementById("rocketIcon");
  const plusIcon = document.getElementById("plusIcon");
  const imageInput = document.getElementById("imageInput");

  uploadedImage.src = "";
  uploadedImage.classList.add("hidden");
  rocketIcon.classList.remove("hidden");
  plusIcon.classList.remove("hidden");
  imageInput.value = "";

  // Kənara kliklə bağlanmanı deaktiv et
  document.removeEventListener("click", handleOutsideRozetClick);
}

function handleOutsideRozetClick(e) {
  const modalContent = document.querySelector("#rozetModal > div");
  const modalWrapper = document.getElementById("rozetModal");

  if (modalWrapper && !modalContent.contains(e.target)) {
    closeRozet();
  }
}

function toggleCategoryDropdown() {
  document.getElementById("categoryDropdownList").classList.toggle("hidden");
}

function selectCategory(element) {
  const selectedText = element.innerText;
  document.getElementById("selectedCategoryText").innerText = selectedText;
  document.getElementById("categoryDropdownList").classList.add("hidden");
}

// Kənara kliklə dropdown bağlansın
document.addEventListener("click", function (e) {
  const dropdownBtn = document.getElementById("categoryDropdownButton");
  const dropdownList = document.getElementById("categoryDropdownList");

  if (!dropdownBtn.contains(e.target) && !dropdownList.contains(e.target)) {
    dropdownList.classList.add("hidden");
  }
});

// Şəkil inputunu trigger edən funksiya
function triggerImageUpload() {
  document.getElementById("imageInput").click();
}

// Şəkil yükləndikdə preview göstərən funksiya
function handleImageUpload(event) {
  const file = event.target.files[0];
  const uploadedImage = document.getElementById("uploadedImage");
  const rocketIcon = document.getElementById("rocketIcon");
  const plusIcon = document.getElementById("plusIcon");

  if (!file) return;

  // Fayl tipi və ölçü yoxlanışı
  const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    alert("Yalnız JPG, PNG və SVG faylları dəstəklənir.");
    return;
  }

  if (file.size > maxSize) {
    alert("Fayl ölçüsü maksimum 2MB olmalıdır.");
    return;
  }

  // Faylı oxu və göstər
  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedImage.src = e.target.result;
    uploadedImage.classList.remove("hidden");
    rocketIcon.classList.add("hidden");
    plusIcon.classList.add("hidden");
  };
  reader.readAsDataURL(file);
}

function selectCategory(element) {
  const selectedText = element.innerText;
  document.getElementById("selectedCategoryText").innerText = selectedText;
  document.getElementById("categoryDropdownList").classList.add("hidden");

  const targetSection = document.getElementById("targetTypeSection");
  const customRewardSection = document.getElementById("customRewardSection");

  if (selectedText === "Ümumi") {
    targetSection.classList.remove("hidden");
    customRewardSection.classList.add("hidden");
  } else {
    targetSection.classList.add("hidden");
    customRewardSection.classList.remove("hidden");
  }
}

// Xərcləmə yeri
let lastSelectedSpending = []; // Yadda qalacaq seçimlər

// Modalı açarkən ya əvvəlki seçimi göstər, ya da sıfırla
function openSpendingModal() {
  const checkboxes = document.querySelectorAll(".spendingOption");

  if (lastSelectedSpending.length > 0) {
    // Əvvəlki seçimi göstər
    checkboxes.forEach((cb) => {
      cb.checked = lastSelectedSpending.includes(cb.value);
    });
  } else {
    // Heç nə seçilməmişsə – sıfırla
    checkboxes.forEach((cb) => (cb.checked = false));
  }

  // Axtarış və görünməni sıfırla

  // Modalı göstər
  document.getElementById("spendingModal").classList.remove("hidden");
}

// Modalı bağlayarkən – yadda qalan seçimləri sıfırlama
function closeSpendingModal() {
  document.getElementById("spendingModal").classList.add("hidden");
  resetSpendingModal();
}

// Axtarış və görünmə reseti
function resetSpendingModal() {
  document.getElementById("spendingSearch").value = "";
  document.querySelectorAll(".spendingOption").forEach((cb) => {
    cb.closest("label").classList.remove("hidden");
  });

  // Reset checkbox selections
  document.querySelectorAll(".spendingOption").forEach((cb) => {
    cb.checked = false;
  });

  // Show all options again
  document.querySelectorAll(".spendingOption").forEach((cb) => {
    cb.closest("label").classList.remove("hidden");
  });
}

// Əlavə et kliklənəndə – seçimləri yadda saxla
function submitSpendingSelection() {
  const selected = [];
  document.querySelectorAll(".spendingOption").forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });

  // Yadda saxla
  lastSelectedSpending = [...selected];

  // Yazıya əlavə et
  const formatted = selected.length > 0 ? selected.join(" • ") : "Seçim edin";
  document.getElementById("selectedSpending").textContent = formatted;

  // Modalı bağla
  document.getElementById("spendingModal").classList.add("hidden");
  resetSpendingModal();
}

// Modalın arxa fonuna klik ediləndə bağlansın
document
  .getElementById("spendingModal")
  .addEventListener("click", function (e) {
    const modalContent = document.getElementById("spendingModalContent");

    if (!modalContent.contains(e.target)) {
      closeSpendingModal();
    }
  });

function showTargetInput(type) {
  // Bütün input hissələrini gizlət
  const sections = ["service", "duration", "amount", "membership", "card"];
  sections.forEach((id) => {
    document.getElementById("target-" + id).classList.add("hidden");
    document
      .getElementById("btn-" + id)
      .classList.remove("bg-primary", "text-white");
  });

  // Aktiv olanı göstər
  document.getElementById("target-" + type).classList.remove("hidden");
  document.getElementById("targetInputWrapper").classList.remove("hidden");
  document
    .getElementById("btn-" + type)
    .classList.add("bg-primary", "text-white");
}

document.addEventListener("DOMContentLoaded", () => {
  // Radio düymələrinin görünməsini idarə edən funksiya
  function initCustomRadioButtons(radioGroupName) {
    const radios = document.querySelectorAll(`input[name="${radioGroupName}"]`);
    radios.forEach((radio) => {
      const circle = radio.nextElementSibling.querySelector(".inner-circle");
      if (radio.checked) {
        circle.classList.remove("hidden");
      } else {
        circle.classList.add("hidden");
      }

      radio.addEventListener("change", () => {
        radios.forEach((r) =>
          r.nextElementSibling
            .querySelector(".inner-circle")
            .classList.add("hidden")
        );
        circle.classList.remove("hidden");
      });
    });
  }

  // Burada radio düymələrinin qruplarını qeyd edin
  initCustomRadioButtons("transaction");
  initCustomRadioButtons("transactionType");
  initCustomRadioButtons("subject");
});

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("#buttons button");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      buttons.forEach((btn) =>
        btn.classList.remove("bg-white", "bg-primary", "text-on-primary")
      );
      this.classList.add("bg-primary", "text-on-primary");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".grid-cols-4 button");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      buttons.forEach((btn) =>
        btn.classList.remove("bg-white", "bg-primary", "text-on-primary")
      );
      this.classList.add("bg-primary", "text-on-primary");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".grid-cols-4 button");
  const inputWrapper = document.getElementById("targetInputWrapper2");

  const sections = {
    "Xidmət sayı": 0,
    Müddət: 1,
    Məbləğ: 2,
    Kart: null,
  };

  // Başlanğıcda bütün input hissələrini gizlət
  [...inputWrapper.children].forEach((el) => (el.style.display = "none"));

  // Hər düyməyə klik hadisəsi bağla
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // Aktivlik class-larını sıfırla və klik edilənə əlavə et
      buttons.forEach((btn) =>
        btn.classList.remove("bg-primary", "text-on-primary")
      );
      this.classList.add("bg-primary", "text-on-primary");

      // Bütün input sahələrini gizlət
      [...inputWrapper.children].forEach((el) => (el.style.display = "none"));

      // Hansı sahənin göstəriləcəyini seç
      const selectedText = this.innerText.trim();
      const index = sections[selectedText];

      if (index !== null && inputWrapper.children[index]) {
        inputWrapper.children[index].style.display = "flex";
      }
    });
  });
});

function selectCategory(element) {
  const selectedText = element.innerText;
  document.getElementById("selectedCategoryText").innerText = selectedText;
  document.getElementById("categoryDropdownList").classList.add("hidden");

  const targetSection = document.getElementById("targetTypeSection");
  const customRewardSection = document.getElementById("customRewardSection");

  // Kateqoriya dəyişəndə uyğun hissəni göstər
  if (selectedText === "Ümumi") {
    targetSection.classList.remove("hidden");
    customRewardSection.classList.add("hidden");
  } else {
    targetSection.classList.add("hidden");
    customRewardSection.classList.remove("hidden");
  }

  // 🔁 BURADAN ETİBARƏN RESETLƏMƏLƏR

  // Hədəf input wrapperini gizlət və içindəki bütün bölmələri gizlət
  document.getElementById("targetInputWrapper").classList.add("hidden");
  ["service", "duration", "amount", "membership", "card"].forEach((type) => {
    const section = document.getElementById("target-" + type);
    const btn = document.getElementById("btn-" + type);
    if (section) section.classList.add("hidden");
    if (btn) btn.classList.remove("bg-primary", "text-white", "text-on-primary");
  });

  // targetInputWrapper2-dəki input sahələrini gizlət (əgər varsa)
  const wrapper2 = document.getElementById("targetInputWrapper2");
  if (wrapper2) {
    [...wrapper2.children].forEach((el) => (el.style.display = "none"));
  }

  // Hədəf düymələrinin class-larını sıfırla (grid-cols-4)
  document.querySelectorAll(".grid-cols-4 button").forEach((btn) => {
    btn.classList.remove("bg-primary", "text-on-primary");
  });

  // spending seçimlərini sıfırla
  lastSelectedSpending = [];
  document.getElementById("selectedSpending").textContent = "Seçim edin";
}
