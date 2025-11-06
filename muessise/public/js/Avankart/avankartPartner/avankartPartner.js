const menu = document.getElementById("menuTabs");
const links = menu.querySelectorAll("a.filter-button");

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault(); // linkin standart davranışını bloklayır (səhifə yenilənməsin)

    // əvvəlki active sinfini sil
    links.forEach((l) =>
      l.classList.remove(
        "active",
        "border-b-2",
        "border-messages",
        "dark:border-primary-text-color-dark"
      )
    );

    // klik olunan linkə active sinfi və border əlavə et
    this.classList.add(
      "active",
      "border-b-2",
      "border-messages",
      "dark:border-primary-text-color-dark"
    );
  });
});

const showModal = () => {
  // Əgər artıq varsa, təkrar yaratma
  if (document.getElementById("customModal")) return;

  // Overlay (modaldan kənara klik bağlamaq üçün)
  const overlay = document.createElement("div");
  overlay.id = "modalOverlay";
  overlay.className = "fixed inset-0 z-40";
  overlay.addEventListener("click", () => {
    document.getElementById("customModal")?.remove();
    overlay.remove();
  });

  // Modal
  const modal = document.createElement("div");
  modal.id = "customModal";
  modal.className =
    "fixed top-6 left-6 bg-white border border-gray-200 rounded-xl shadow-lg w-72 text-sm z-50";

  modal.innerHTML = `
          <div class="p-3 space-y-2">
            <div class="flex items-center gap-2 text-gray-700 hover:bg-gray-100 p-2 rounded cursor-pointer">
              <span class="text-lg">⌨️</span>
              <span>Şifrəni sıfırla</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700 hover:bg-gray-100 p-2 rounded cursor-pointer">
              <span class="text-lg">📧</span>
              <span>Mail adresini dəyiş</span>
            </div>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="flex items-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded cursor-pointer">
              <span class="text-lg">⛔</span>
              <span>Deaktiv et</span>
            </div>
            <div class="flex items-center gap-2 text-red-600 font-semibold hover:bg-red-100 p-2 rounded cursor-pointer">
              <span class="text-lg">🗑️</span>
              <span>Silinmə üçün müraciət et</span>
            </div>
          </div>
        `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
};
const filterPop = document.querySelector("#filterPop");
const overlay = document.querySelector("#overlay");
let click = false;

function openFilterModal() {
  click = !click;
  if (click) {
    filterPop.style.display = "block";
    overlay.style.display = "block";
  } else {
    filterPop.style.display = "none";
    overlay.style.display = "none";
  }
}
