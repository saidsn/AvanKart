function toggleCategoryDropdown() {
  document.getElementById("categoryDropdownList").classList.toggle("hidden");
}

// Kənara kliklə dropdown bağlansın
document.addEventListener("click", function (e) {
  const dropdownBtn = document.getElementById("categoryDropdownButton");
  const dropdownList = document.getElementById("categoryDropdownList");

  if (!dropdownBtn.contains(e.target) && !dropdownList.contains(e.target)) {
    dropdownList.classList.add("hidden");
  }
});

// function selectCategory(element) {
//   const selectedText = element.innerText.trim();
//   const selectedId = element.getAttribute("data-id");

//   const selectedCategory = document.getElementById("selectedCategoryText");
//   selectedCategory.innerText = selectedText;
//   selectedCategory.setAttribute("data-id", selectedId);

//   document.getElementById("categoryDropdownList").classList.add("hidden");

//   const targetSection = document.getElementById("targetTypeSection");
//   const customRewardSection = document.getElementById("customRewardSection");

//   // Ümumi seçilibsə
//   if (selectedText === "Ümumi") {
//     targetSection.classList.remove("hidden");
//     customRewardSection.classList.add("hidden");
//     selectedCategory.setAttribute("data-id", ""); // ID boş olur
//   } else {
//     targetSection.classList.add("hidden");
//     customRewardSection.classList.remove("hidden");
//   }

//   // 🔁 Reset hədəflər
//   ["service", "duration", "amount", "membership", "card"].forEach((type) => {
//     const section = document.getElementById("target-" + type);
//     const btn = document.getElementById("btn-" + type);
//     if (section) section.classList.add("hidden");
//     if (btn) btn.classList.remove("bg-primary", "text-white", "text-on-primary");
//   });

//   const wrapper2 = document.getElementById("targetInputWrapper2");
//   if (wrapper2) [...wrapper2.children].forEach((el) => (el.style.display = "none"));

//   document.querySelectorAll(".grid-cols-4 button").forEach((btn) => {
//     btn.classList.remove("bg-primary", "text-on-primary");
//   });

//   lastSelectedSpending = [];
//   document.getElementById("selectedSpending").textContent = "Seçim edin";
// }




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
document
  .getElementById("spendingSearch")
  .addEventListener("keyup", function () {
    const query = this.value.toLowerCase().trim(); // inputdakı text
    const options = document.querySelectorAll("#spendingModal .spendingOption");

    options.forEach((checkbox) => {
      const label = checkbox.closest("label"); // həmin checkbox-un label-ı
      const text = label.textContent.toLowerCase();

      if (text.includes(query)) {
        label.classList.remove("hidden");
      } else {
        label.classList.add("hidden");
      }
    });
  });
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
