// DOM elementləri
const dropZone = document.getElementById('drop-zone'); // Drop üçün doğru zona
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');

// Filter toggle
let toggleclick = false;
let filterDiv = document.querySelector('.filter-div');
let sorguDiv = document.querySelector('.sorgu-div');
let sorgusidebar = document.querySelector('#sorgusidebar');
let overlay = document.querySelector('#overlay');

// Filter aç/bağla funksiyası
function toggleFilter() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    filterDiv.style.display = 'block';
    overlay.style.display = 'block';
  } else {
    filterDiv.style.display = 'none';
    overlay.style.display = 'none';
  }
}

// Sorgu aç/bağla funksiyası
function toggleSorgu() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    sorguDiv.style.display = 'block';
    overlay.style.display = 'block';

    [
      // destekDiv,
      sorgusidebar,
    ].forEach(el => el.style.background = 'transparent');

  } else {
    sorguDiv.style.display = 'none';
    overlay.style.display = 'none';
  }
}

// Fayl input vasitəsilə seçildikdə
fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;
  handleFileUpload(file);
});

// Drag & drop funksionallığı
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add("bg-[#88649A1A]"); // vizual effekt
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove("bg-[#88649A1A]");
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove("bg-[#88649A1A]");

  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    handleFileUpload(file); // fayl yüklə
  }
});

// Faylı yükləmə funksiyası (vizual hissə)
function handleFileUpload(file) {
  const fileItem = document.createElement("div");
  fileItem.className = "file-item";
  fileItem.innerHTML = `
    <div class="loading-text dark:text-primary-text-color-dark">Yüklənir... 4% | 30 saniyə qalıb</div>
    <div class="progress-container">
      <div class="progress-bar dark:bg-[#343C40] h-1 bg-primary" style="width: 0%"></div>
    </div>
  `;
  fileList.appendChild(fileItem);

  const progressBar = fileItem.querySelector(".progress-bar");
  const loadingText = fileItem.querySelector(".loading-text");

   let progress = 0;
  const totalDuration = 8000; 
  const stepTime = 100; 
  const stepIncrement = 100 / (totalDuration / stepTime);

  const interval = setInterval(() => {
    progress += stepIncrement;

    if (progress > 100) progress = 100;

    progressBar.style.width = progress + "%";
    loadingText.innerText = `Yüklənir... ${Math.floor(progress)}% | ${Math.ceil((100 - progress) * (totalDuration / 1000 / 100))} saniyə qalıb`;

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        fileItem.innerHTML = "";//`<span class="text-sm text-messages dark:text-primary-text-color-dark">${file.name}</span>`;
      }, 500);
    }
  }, stepTime);
}


    document.addEventListener("DOMContentLoaded", function () {
        const dropdownButtons = document.querySelectorAll("button[data-dropdown-toggle]");

        dropdownButtons.forEach((button, index) => {
            const dropdownId = button.getAttribute("data-dropdown-toggle");
            const dropdown = document.getElementById(dropdownId);
            const items = dropdown.querySelectorAll("li[data-value]");
            const select = button.closest("form").querySelector("select");

            // Açıb-bağlamaq üçün
            button.addEventListener("click", () => {
                dropdown.classList.toggle("hidden");
            });

            // Seçim ediləndə
            items.forEach(item => {
                item.addEventListener("click", function (e) {
                    e.preventDefault();
                    const value = this.getAttribute("data-value");

                    // Düymə yazısını dəyiş
                    button.innerHTML = `
                        ${value}
                        <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="2"
                                d="m1 1 4 4 4-4" />
                        </svg>
                    `;

                    // <select> dəyərini dəyiş
                    select.value = value;

                    // Dropdown bağlansın
                    dropdown.classList.add("hidden");
                });
            });
        });
    });


function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); // Alternativ həll
  }
}

