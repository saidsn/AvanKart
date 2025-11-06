// Səhifə dəyişdirmə

const totalPages = 49;
let currentPage = 1;

const paginationContainer = document.getElementById("customPagination");
const pageCountText = document.getElementById("pageCount");
const pageInput = document.getElementById("pageInput");
const goButton = document.getElementById("goButton");

function updatePageDisplay() {
  pageCountText.textContent = `${currentPage} / ${totalPages}`;
  renderPagination();
}

function renderPagination() {
  paginationContainer.innerHTML = "";

  const createPageButton = (
    text,
    page,
    isActive = false,
    isDisabled = false
  ) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `px-3 py-1 rounded-md text-sm ${
      isActive
        ? "bg-primary text-white"
        : "bg-menu text-on-surface-variant-dark hover:bg-input-hover"
    } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`;
    if (!isDisabled) {
      btn.addEventListener("click", () => {
        currentPage = page;
        updatePageDisplay();
      });
    }
    return btn;
  };

  paginationContainer.appendChild(
    createPageButton("←", currentPage - 1, false, currentPage === 1)
  );

  const pageButtons = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    pageButtons.push(createPageButton(1, 1));
    if (startPage > 2)
      pageButtons.push(createPageButton("...", null, false, true));
  }

  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(createPageButton(i, i, i === currentPage));
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1)
      pageButtons.push(createPageButton("...", null, false, true));
    pageButtons.push(createPageButton(totalPages, totalPages));
  }

  pageButtons.forEach((btn) => paginationContainer.appendChild(btn));

  paginationContainer.appendChild(
    createPageButton("→", currentPage + 1, false, currentPage === totalPages)
  );
}

goButton.addEventListener("click", (e) => {
  e.preventDefault();
  const inputVal = parseInt(pageInput.value);
  if (!isNaN(inputVal) && inputVal >= 1 && inputVal <= totalPages) {
    currentPage = inputVal;
    updatePageDisplay();
  } else {
    alert("Zəhmət olmasa düzgün səhifə nömrəsi daxil edin.");
  }
});

updatePageDisplay();

//Search
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const companyNameDiv = row.querySelector(
      "td span .flex .flex-col div:first-child"
    );
    if (companyNameDiv) {
      const companyName = companyNameDiv.textContent.toLowerCase();
      if (companyName.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  });
});

//dropdown

const operationsToggle = document.getElementById("operationsToggle");
const operationsMenu = document.getElementById("operationsMenu");
const operationsArrow = document.getElementById("operationsArrow");

const companyToggle = document.getElementById("companyToggle");
const companyMenu = document.getElementById("companyMenu");
const companyArrow = document.getElementById("companyArrow");
const isActive = document.getElementById("isActive");

operationsToggle.addEventListener("click", () => {
  operationsMenu.classList.toggle("hidden");
  operationsArrow.classList.toggle("rotate-90");
});

companyToggle.addEventListener("click", () => {
  companyMenu.classList.toggle("hidden");
  companyArrow.classList.toggle("rotate-90");
});
