let reportPopup = document.querySelector("#reportPopup");
let aside = document.querySelector("aside");
let span4 = document.querySelector(".span4");
let span4_1 = document.querySelector(".span4-1");
let curveleft = document.querySelector("#curve-left-div");
let tenzimlemelerDiv = document.querySelector("#tenzimlemeler-div");
let avankartDiv = document.querySelector("#avankart-div");
let destekDiv = document.querySelector(".destek-div");
let destekLogo = document.querySelector(".destek-logo");
// let toggleclick = false;

function reportclick() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    reportPopup.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    reportPopup.style.display = "none";
    overlay.style.display = "none";
  }
}

let toggleclick2 = false;

function odenishclick() {
  if (toggleclick2) {
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    overlay.style.display = "none";
  }
}

let OdenisPopUp = document.querySelector("#OdenisPopUp");

let toggleclick3 = false;

function odenishclick() {
  toggleclick3 = !toggleclick3;
  if (toggleclick3) {
    OdenisPopUp.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    OdenisPopUp.style.display = "none";
    overlay.style.display = "none";
  }
}

let fakturaDiv = document.querySelector(".faktura-div");

let toggleclick4 = false;

function fakturaclick() {
  toggleclick4 = !toggleclick4;
  if (toggleclick4) {

    fakturaDiv.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    fakturaDiv.style.display = "none";
    overlay.style.display = "none";
  }
}




const minPrice = document.querySelector("#min-price");
const maxPrice = document.querySelector("#max-price");
const minpricerange = document.querySelector("#minpricerange");
const maxpricerange = document.querySelector("#maxpricerange");
const MAX_VALUE = 300000;
function yekunminprice() {
  minPrice.innerHTML =
    minpricerange.value +
    `<img src="/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`;
}
function yekunmaxprice() {
  const reverseValue = MAX_VALUE - maxpricerange.value;
  maxPrice.innerHTML =
    maxpricerange.value +
    `<img src="/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`;
}

const filterPop = document.querySelector("#filterPop");
let filterclick = false;

function openFilterModal() {
  filterclick = !filterclick;
  if (filterclick) {
    filterPop.style.display = "block";
    overlay.style.display = "block";
    // span4.style.background = "transparent";
  } else {
    filterPop.style.display = "none";
    overlay.style.display = "none";
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


// DOM elementləri
const dropZone = document.getElementById('drop-zone'); // Drop üçün doğru zona
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');

// Filter toggle
let toggleclick = false;
let filterDiv = document.querySelector('.filter-div');
let sorguDiv = document.querySelector('.sorgu-div');
let sorgusidebar = document.querySelector('#sorgusidebar');
let overlay = document.querySelector('#fakturaModalOverlay');

// Filter aç/bağla funksiyası
function toggleFilter() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    filterDiv.style.display = 'block';
    overlay.style.display = 'block';
  } else {
    filterDiv.style.display = 'none';
    overlay.style.display = 'none';
    destekDiv.style.background = '#fff';
  }
}

// Fayl input vasitəsilə seçildikdə
if (fileInput) {
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;
    handleFileUpload(file);
  });
}

// Drag & drop funksionallığı
if (dropZone) {
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
}

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

  // Sadə loading simulyasiyası
  setTimeout(() => {
    progressBar.style.width = "100%";
    loadingText.innerHTML = "<div id='dark'>Yüklənir... 100% | 0 saniyə qalıb</div>";

    setTimeout(() => {
      fileItem.innerHTML = `
        <span class="text-sm text-messages dark:text-primary-text-color-dark">${file.name}</span>
        <button class="text-red-500 text-xs ml-2 cursor-pointer" onclick="this.parentElement.remove()">Sil</button>
      `;
    }, 1000);
  }, 2000);
}

// FORMAT CURRENCY FUNCTION (shared by all filters)
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + " ₼";
}

// FILTER 1 - First Filter (Works perfectly - keeping as is)
$(function() {
    if ($("#slider-range").length) {
        $("#slider-range").slider({
            range: true,
            min: 0,
            max: 300000,
            values: [12345, 245000],
            slide: function(event, ui) {
                $("#min-value").text(formatCurrency(ui.values[0]));
                $("#max-value").text(formatCurrency(ui.values[1]));
            }
        });

        // Set initial values for Filter 1
        $("#min-value").text(formatCurrency($("#slider-range").slider("values", 0)));
        $("#max-value").text(formatCurrency($("#slider-range").slider("values", 1)));
    }
});

// FILTER 1 Reset Handler (Already working - keeping as is)
document.addEventListener('DOMContentLoaded', function() {
    // Handle FIRST filter form specifically
    const filterForm1 = document.getElementById("filterForm");
    if (filterForm1 && filterForm1.querySelector('#slider-range')) {
        filterForm1.addEventListener("reset", function () {
            const defaultMin = 12345;
            const defaultMax = 245000;

            if ($("#slider-range").length) {
                $("#slider-range").slider("values", [defaultMin, defaultMax]);
                $("#min-value").text(formatCurrency(defaultMin));
                $("#max-value").text(formatCurrency(defaultMax));
            }

            // Reset checkboxes for Filter 1
            const checkboxes = filterForm1.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        });
    }
});

// FILTER 2 - Second Filter (Avankart Filter)
$(function() {
    if ($("#slider-range-2").length) {
        $("#slider-range-2").slider({
            range: true,
            min: 0,
            max: 300000,
            values: [12345, 245500],
            slide: function(event, ui) {
                $("#min-value-2").text(formatCurrency(ui.values[0]));
                $("#max-value-2").text(formatCurrency(ui.values[1]));
            }
        });

        // Set initial values for Filter 2
        $("#min-value-2").text(formatCurrency($("#slider-range-2").slider("values", 0)));
        $("#max-value-2").text(formatCurrency($("#slider-range-2").slider("values", 1)));
    }
});

// FILTER 2 Reset Handler
document.addEventListener('DOMContentLoaded', function() {
    // Find the second filter form (you may need to add an ID to it)
    const filter2Forms = document.querySelectorAll('form');
    filter2Forms.forEach(form => {
        if (form.querySelector('#slider-range-2')) {
            form.addEventListener("reset", function () {
                const defaultMin = 12345;
                const defaultMax = 245500;

                // Reset slider for Filter 2
                if ($("#slider-range-2").length) {
                    $("#slider-range-2").slider("values", [defaultMin, defaultMax]);
                    $("#min-value-2").text(formatCurrency(defaultMin));
                    $("#max-value-2").text(formatCurrency(defaultMax));
                }

                // Reset checkboxes for Filter 2
                const checkboxes = form.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            });
        }
    });
});

// FILTER 3 - Third Filter (Employee Filter) - FIXED VERSION
$(function() {
    if ($("#slider-range-3").length) {
        $("#slider-range-3").slider({
            range: true,
            min: 0,
            max: 300000,
            values: [12345, 245000],
            slide: function(event, ui) {
                $("#min-value-3").text(formatCurrency(ui.values[0]));
                $("#max-value-3").text(formatCurrency(ui.values[1]));
            }
        });

        // Set initial values for Filter 3
        $("#min-value-3").text(formatCurrency($("#slider-range-3").slider("values", 0)));
        $("#max-value-3").text(formatCurrency($("#slider-range-3").slider("values", 1)));
    }
});

// FILTER 3 Reset Handler - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure all elements are loaded
    setTimeout(() => {
        // Find all forms and handle the third filter specifically
        const allForms = document.querySelectorAll('form');

        allForms.forEach(form => {
            // Check if this form contains the third filter elements (slider-range-3)
            if (form.querySelector('#slider-range-3')) {
                // Remove any existing event listeners to avoid duplicates
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);
                
                // Add reset event listener to the new form
                newForm.addEventListener("reset", function (e) {
                    // Prevent the default reset to handle it manually
                    e.preventDefault();

                    console.log("Filter 3 reset triggered"); // Debug log

                    const defaultMin = 12345;
                    const defaultMax = 245000;

                    // Reset slider for Filter 3
                    setTimeout(() => {
                        if ($("#slider-range-3").length) {
                            $("#slider-range-3").slider("values", [defaultMin, defaultMax]);
                            $("#min-value-3").text(formatCurrency(defaultMin));
                            $("#max-value-3").text(formatCurrency(defaultMax));
                            console.log("Slider 3 reset"); // Debug log
                        }
                    }, 50);

                    // Reset ALL checkboxes by ID - this is the most reliable method
                    const allCheckboxIds = [
                        // Vəzifə checkboxes
                        'vezife-ux-designer',
                        'vezife-project-manager', 
                        'vezife-cto',
                        'vezife-product-owner',
                        'vezife-developer',
                        // Vəzifə qrupu checkboxes
                        'grupa-layihe-rehberleri',
                        'grupa-muhasibler',
                        'grupa-idare-heyyeti'
                    ];

                    allCheckboxIds.forEach(id => {
                        const checkbox = document.getElementById(id);
                        if (checkbox) {
                            checkbox.checked = false;
                            console.log("Unchecked:", id); // Debug log
                        }
                    });

                    // Also find any checkboxes within the form structure
                    const formCheckboxes = newForm.querySelectorAll('input[type="checkbox"]');
                    formCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });

                    // Reset other form fields
                    const textInputs = newForm.querySelectorAll('input[type="text"]');
                    textInputs.forEach(input => {
                        input.value = '';
                    });
                });
            }
        });
    }, 100);
});

// Alternative approach - Add a global reset function for Filter 3
function resetFilter3() {
    console.log("Manual reset Filter 3 called");

    const defaultMin = 12345;
    const defaultMax = 245000;

    // Reset slider
    if ($("#slider-range-3").length) {
        $("#slider-range-3").slider("values", [defaultMin, defaultMax]);
        $("#min-value-3").text(formatCurrency(defaultMin));
        $("#max-value-3").text(formatCurrency(defaultMax));
    }

    // Reset all checkboxes
    const allCheckboxIds = [
        'vezife-ux-designer',
        'vezife-project-manager',
        'vezife-cto',
        'vezife-product-owner',
        'vezife-developer',
        'grupa-layihe-rehberleri',
        'grupa-muhasibler',
        'grupa-idare-heyyeti'
    ];

    allCheckboxIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
}

const YeniInvoys = document.querySelector('#YeniInvoys')
const UpdateInvoys = document.querySelector('#UpdateInvoys')
let invoysclick = false
let invoysclick2 = false


function openInvoysPopup() {
  invoysclick = !invoysclick
  if(invoysclick) {
    YeniInvoys.style.display = 'block'
    overlay.style.display = 'block';
  }
  else{
    YeniInvoys.style.display = 'none'
    overlay.style.display = 'none';
  }
}



function updateInvoys() {
  invoysclick2 = !invoysclick2
  if(invoysclick2) {
    UpdateInvoys.style.display = 'block'
    overlay.style.display = 'block';
  }
  else{
    UpdateInvoys.style.display = 'none'
    overlay.style.display = 'none';
  }
}

function openInvoysPopup() {
    document.getElementById("invoysPopupOverlay").classList.remove("hidden");
    document.getElementById("invoysPopup").classList.remove("hidden");
}

function closeInvoysPopup() {
    document.getElementById("invoysPopupOverlay").classList.add("hidden");
    document.getElementById("invoysPopup").classList.add("hidden");
}



function openMonthsPopup(year) {
        document.getElementById("monthsPopupOverlay").classList.remove("hidden");
        document.getElementById("monthsPopup").classList.remove("hidden");

        const monthsDiv = document.getElementById('yearsPopupMonths');
        monthsDiv.innerHTML = ""; // önce temizle

        const yearTitle = document.querySelector("#monthsPopup h3");
        yearTitle.textContent = year;

        const months = qovluq.find(item => item.year === year)?.months;
        if (!months) return;

        Object.entries(months).forEach(([monthName, value], index) => {
            const html = `
                <div class="text-left cursor-pointer" onclick="openMonthTable('${year}', '${mName[monthName]}', '${monthName}')">
                    <h3 class="text-[15px] font-medium text-messages dark:text-primary-text-color-dark">
                        ${mName[monthName]}
                    </h3>
                    <p class="text-[11px] text-[#1D222B80] dark:text-secondary-text-color-dark mt-2">
                        ${value} invoys
                    </p>
                </div>
            `;
            monthsDiv.insertAdjacentHTML("beforeend", html);
        });
    }

// Küçük yardımcı: ay adını baş harfi büyük yapmak için
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function closeMonthsPopup() {
    // Aylar popup-ını bağla
    document.getElementById("monthsPopupOverlay").classList.add("hidden");
    document.getElementById("monthsPopup").classList.add("hidden");
}

function goBackToYears() {
    // Aylar popup-ını bağla və illər popup-ını aç
    closeMonthsPopup();
    document.getElementById("invoysPopupOverlay").classList.remove("hidden");
    document.getElementById("invoysPopup").classList.remove("hidden");
}

document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.getElementById('dropdownDefaultButton6');
    const dropdownMenu = document.getElementById('dropdown6');

    if (dropdownButton && dropdownMenu) {
        dropdownButton.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
            dropdownMenu.classList.toggle('visible');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add('hidden');
                dropdownMenu.classList.remove('visible');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton78 = document.getElementById('dropdownDefaultButton78');
    const dropdownMenu78 = document.getElementById('dropdown78');

    if (dropdownButton78 && dropdownMenu78) {
        dropdownButton78.addEventListener('click', () => {
            dropdownMenu78.classList.toggle('hidden');
            dropdownMenu78.classList.toggle('visible');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!dropdownButton78.contains(event.target) && !dropdownMenu78.contains(event.target)) {
                dropdownMenu78.classList.add('hidden');
                dropdownMenu78.classList.remove('visible');
            }
        });
    }
});

function openAvankartaModal() {
    document.getElementById('avankartaModalOverlay').classList.remove('hidden');
    document.getElementById('avankartaModal').classList.remove('hidden');
}

function closeAvankartaModal() {
    document.getElementById('avankartaModalOverlay').classList.add('hidden');
    document.getElementById('avankartaModal').classList.add('hidden');
}

function confirmAvankarta() {
    closeAvankartaModal();
}



function openDeleteInvoiceModal() {
    document.getElementById('deleteInvoiceModalOverlay').classList.remove('hidden');
    document.getElementById('deleteInvoiceModal').classList.remove('hidden');
}

function closeDeleteInvoiceModal() {
    document.getElementById('deleteInvoiceModalOverlay').classList.add('hidden');
    document.getElementById('deleteInvoiceModal').classList.add('hidden');
}

function toggleDropdownIcon() {
    const dropdownIcon = document.getElementById('dropdownIcon');
    if (dropdownIcon) {
        const isChevronDown = dropdownIcon.src.includes('chevron-down.svg');

        if (isChevronDown) {
            dropdownIcon.src = '/images/uzv-sirket/iscilerinBalansi-images/search-02.svg';
            dropdownIcon.classList.remove('chevron-down-class');
            dropdownIcon.classList.add('search-icon-class');
        } else {
            dropdownIcon.src = '/images/Avankart/Sirket/chevron-down.svg';
            dropdownIcon.classList.remove('search-icon-class');
            dropdownIcon.classList.add('chevron-down-class');
        }
    }
}

const operator = document.querySelector('.operator')

function clickOperator(element){
    document.getElementById("operatorText").textContent = element.textContent.trim();
}


let timeLeft = 4 * 60 + 59; // 4:59 in seconds
const countdownEl = document.getElementById('countdown');
const resendBtn = document.getElementById('resendBtn');
const otpInputs = document.querySelectorAll('.otp-input');
const updateTimer = () => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  // countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    resendBtn.disabled = false;
    resendBtn.classList.remove("text-gray-600");
    resendBtn.classList.add("text-purple-600", "cursor-pointer");
  }
  timeLeft--;
};
const timer = setInterval(updateTimer, 1000);
updateTimer();
otpInputs.forEach((input, index) => {
  input.classList.add(
    "w-full", "h-[34px]", "text-center", "border-2", "border-purple-300",
    "rounded-md", "focus:outline-none", "focus:border-purple-500", "text-xl"
  );
  input.setAttribute("type", "text");
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("pattern", "[0-9]*");
  input.setAttribute("autocomplete", "one-time-code");
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    if (e.target.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pastedText.replace(/\D/g, '').split("");
    if (digits.length > 0) {
      otpInputs.forEach((input, i) => {
        input.value = digits[i] || "";
      });
      otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
    }
  });
});


const emaildogrulamaDiv = document.querySelector('.emaildogrulama-div')
let dogrulama = false

function tesdiqlePop(){
  dogrulama = !dogrulama
  if(dogrulama) {
    emaildogrulamaDiv.style.display = 'block'
    overlay.style.display = 'block'
  }
  else{
    emaildogrulamaDiv.style.display = 'none'
    overlay.style.display = 'none'
  }
}