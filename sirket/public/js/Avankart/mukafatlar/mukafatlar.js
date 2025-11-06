// Mukafatlardan infoya gelen kart adi
document.addEventListener("DOMContentLoaded", function () {
  const data = JSON.parse(localStorage.getItem("selectedPrize"));

  if (data) {
    document.getElementById("prize-name").textContent = data.name;
  }
});

// Reward modal acilma / baglanma
const rewardModal = document.getElementById("rewardModal");

function openRewardModal() {
  resetRewardModal(); // <-- sıfırlama
  rewardModal.classList.remove("hidden");
}

function closeRewardModal() {
  rewardModal.classList.add("hidden");

  // BU SƏTRİ ƏLAVƏ ET:
  lastSelectedSpending = [];

  resetSpendingModal();
}


// Modali Sifirlama
function resetRewardModal() {
  // Mükafat adı input sahəsi
  const nameInput = rewardModal.querySelector('input[type="text"]');
  if (nameInput) nameInput.value = "";

  // Seçim yazısı sıfırlansın
  document.getElementById("selectedSpending").textContent = "Seçim edin";
  selectedRewardText.textContent = "Seçim edin";

  // Reward tipi dropdown bağlansın
  rewardOptions.classList.add("hidden");

  // Seçilmiş checkbox-lar sıfırlansın
  rewardModal.querySelectorAll(".spendingOption").forEach((el) => {
    el.checked = false;
  });

  // Target Type düymələri default hala qaytarılsın
  document.querySelectorAll("#rewardModal .target-button").forEach((btn) => {
    btn.classList.remove(
      "bg-focus",
      "text-on-primary",
      "selected",
      "cursor-default"
    );
    btn.classList.add(
      "bg-white",
      "text-secondary-text",
      "hover:bg-input-hover",
      "cursor-pointer"
    );
  });

  // Hədəf sayı sıfırlansın
  const targetCountInput = rewardModal.querySelector(
    'input[placeholder="0.00"]'
  );
  if (targetCountInput) targetCountInput.value = "";

  // Mükafat dəyəri input sahəsi təmizlənsin və manat ikonu gizlənsin
  const rewardValueInput = document.getElementById("rewardValueInput");
  if (rewardValueInput) rewardValueInput.value = "";
  const manatIcon = document.getElementById("manatIcon");
  if (manatIcon) manatIcon.classList.add("hidden");

  // Şəkil sahəsini sıfırla
  const uploadedImage = document.getElementById("uploadedImage");
  if (uploadedImage) {
    uploadedImage.src = "";
    uploadedImage.classList.add("hidden");
  }

  const plusIcon = document.getElementById("plusIcon");
  if (plusIcon) plusIcon.classList.remove("hidden");

  const rocketIcon = document.getElementById("rocketIcon");
  if (rocketIcon) rocketIcon.classList.remove("hidden");

  const imageInput = document.getElementById("imageInput");
  if (imageInput) imageInput.value = "";

  // Təkrarlanma radio button-u default olaraq 'week'
  const defaultRadio = document.querySelector(
    'input[name="date"][value="week"]'
  );
  const circle =
    defaultRadio?.nextElementSibling?.querySelector(".inner-circle");
  if (defaultRadio) {
    defaultRadio.checked = true;
    document
      .querySelectorAll(".inner-circle")
      .forEach((el) => el.classList.add("hidden"));
    circle?.classList.remove("hidden");
  }
}

rewardModal.addEventListener("click", function (event) {
  if (event.target === rewardModal) {
    closeRewardModal();
  }
});

// xerceleme yeri ve yemek sayi
function selectTargetType(button) {
  document.querySelectorAll("#rewardModal .target-button").forEach((btn) => {
    btn.classList.remove(
      "bg-focus",
      "text-on-primary",
      "selected",
      "cursor-default"
    );
    btn.classList.add(
      "bg-white",
      "text-secondary-text",
      "hover:bg-input-hover",
      "cursor-pointer"
    );
  });

  button.classList.remove(
    "bg-white",
    "text-secondary-text",
    "hover:bg-input-hover",
    "cursor-pointer"
  );
  button.classList.add(
    "bg-focus",
    "text-on-primary",
    "selected",
    "cursor-default"
  );
}

// radio button
document.addEventListener("DOMContentLoaded", () => {
  // Default olaraq 'week' radio button-u seçilir
  const defaultRadio = document.querySelector(
    'input[name="date"][value="week"]'
  );
  const circle =
    defaultRadio?.nextElementSibling?.querySelector(".inner-circle");

  if (defaultRadio) {
    defaultRadio.checked = true;
    circle?.classList.remove("hidden");
  }

  // Dəyişiklik zamanı inner-circle-ların görünməsi yenilənir
  document.querySelectorAll('input[name="date"]').forEach((input) => {
    input.addEventListener("change", (e) => {
      // Bütün inner-circle-ları gizlət
      document
        .querySelectorAll(".inner-circle")
        .forEach((el) => el.classList.add("hidden"));

      // Seçilmiş radio-nun inner-circle-ını göstər
      const activeCircle =
        e.target.nextElementSibling.querySelector(".inner-circle");
      activeCircle?.classList.remove("hidden");
    });
  });
});

const rewardOptions = document.getElementById("rewardOptions");
const rewardDropdown = document.getElementById("rewardTypeDropdown");
const selectedRewardText = document.getElementById("selectedRewardText");

// Aç / Bağla toggle funksiyası
function toggleRewardDropdown(e) {
  e.stopPropagation(); // document click-ə getməsin
  rewardOptions.classList.toggle("hidden");
}

// Dropdown-a klikləyəndə toggle
rewardDropdown.addEventListener("click", toggleRewardDropdown);

// Siyahıdan seçim ediləndə mətn dəyişsin və bağlansın
rewardOptions.addEventListener("click", function (event) {
  if (event.target.tagName.toLowerCase() === "li") {
    selectedRewardText.innerText = event.target.innerText;
    rewardOptions.classList.add("hidden");
  }
});

// Kənara klik ediləndə dropdown bağlansın
document.addEventListener("click", function () {
  rewardOptions.classList.add("hidden");
});

const rewardTypeDropdown = document.getElementById("rewardTypeDropdown");
const additionalInputWrapper = document.getElementById(
  "additionalInputWrapper"
);
const rewardValueInput = document.getElementById("rewardValueInput");
const manatIcon = document.getElementById("manatIcon");

// Seçim kliklənəndə
rewardOptions.addEventListener("click", function (event) {
  const selectedValue = event.target.innerText.trim();

  // Seçim mətnini yaz
  selectedRewardText.textContent = selectedValue;

  // Dropdown bağlansın
  rewardOptions.classList.add("hidden");

  // Aşağıdakı input sahəsini göstər
  additionalInputWrapper.classList.remove("hidden");

  // Placeholder və manat simvolu
  if (selectedValue === "Məbləğ") {
    rewardValueInput.placeholder = "Mükafat məbləği";
    manatIcon.classList.remove("hidden");
  } else if (selectedValue === "Endirim") {
    rewardValueInput.placeholder = "Endirim faizi";
    manatIcon.classList.add("hidden");
  } else if (selectedValue === "Bonus") {
    rewardValueInput.placeholder = "Bonus faizi";
    manatIcon.classList.add("hidden");
  } else {
    rewardValueInput.placeholder = "";
    manatIcon.classList.add("hidden");
  }

  // Input dəyərini sıfırla
  rewardValueInput.value = "";
});

// Sekil elave etmek
function triggerImageUpload() {
  document.getElementById("imageInput").click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const image = document.getElementById("uploadedImage");
    image.src = e.target.result;
    image.classList.remove("hidden");

    // İkonları gizlət
    document.getElementById("plusIcon").classList.add("hidden");
    document.getElementById("rocketIcon").classList.add("hidden");
  };
  reader.readAsDataURL(file);
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
