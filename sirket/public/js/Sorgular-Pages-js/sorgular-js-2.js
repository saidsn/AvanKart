// DOM elementləri
const dropZone = document.getElementById('drop-zone'); // Drop üçün doğru zona
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');
let selectedFiles = []; // Track selected files

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
    destekDiv.style.background = '#fff';
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
      aside,
      span4,
      span4_1,
      curveleft,
      tenzimlemelerDiv,
      destekLogo
    ].forEach(el => el?.style ? el.style.background = 'transparent' : null);

  } else {
    sorguDiv.style.display = 'none';
    overlay.style.display = 'none';

    // Reset form when closing modal
    const form = document.getElementById('addSorguForm');
    if (form && typeof resetFormCompletely === 'function') {
      resetFormCompletely(form);
    } else if (form) {
      // Fallback basic reset
      form.reset();
      selectedFiles = [];
      if (fileList) fileList.innerHTML = '';
      if (fileInput) fileInput.value = '';
    }
  }
}

// Make toggleSorgu globally available
window.toggleSorgu = toggleSorgu;

// Fayl input vasitəsilə seçildikdə
if (fileInput) {
  fileInput.addEventListener("change", function (event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Add files to selectedFiles array
    files.forEach(file => {
      if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
        addFileToVisualList(file);
      }
    });
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
      const files = Array.from(e.dataTransfer.files);

      // Add files to selectedFiles array
      files.forEach(file => {
        if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
          selectedFiles.push(file);
          addFileToVisualList(file);
        }
      });

      // Update the file input with all selected files
      updateFileInput();
    }
  });
}

// Add file to visual list
function addFileToVisualList(file) {
  if (!fileList) return;

  const fileItem = document.createElement("div");
  fileItem.className = "file-item flex items-center justify-between p-2 border rounded mb-2";
  fileItem.dataset.fileName = file.name;

  fileItem.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-sm text-messages dark:text-primary-text-color-dark">${file.name}</span>
      <span class="text-xs opacity-50">(${(file.size / (1024 * 1024)).toFixed(2)}MB)</span>
    </div>
    <button type="button" onclick="removeFile('${file.name}')" class="text-red-500 hover:text-red-700">
      <span class="icon stratis-trash-01"></span>
    </button>
  `;

  fileList.appendChild(fileItem);
}

// Remove file function
function removeFile(fileName) {
  selectedFiles = selectedFiles.filter(file => file.name !== fileName);
  const fileItem = document.querySelector(`[data-file-name="${fileName}"]`);
  if (fileItem) {
    fileItem.remove();
  }
  updateFileInput();
}

// Update file input with selected files
function updateFileInput() {
  if (!fileInput) return;

  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(file => {
    dataTransfer.items.add(file);
  });
  fileInput.files = dataTransfer.files;
}

// Make removeFile globally available
window.removeFile = removeFile;


document.addEventListener("DOMContentLoaded", function () {
  const dropdownButtons = document.querySelectorAll("button[data-dropdown-toggle]");
  console.log(`Found ${dropdownButtons.length} dropdown buttons`);

  dropdownButtons.forEach((button, index) => {
    const dropdownId = button.getAttribute("data-dropdown-toggle");
    const dropdown = document.getElementById(dropdownId);

    if (!dropdown) {
      console.warn(`Dropdown with ID ${dropdownId} not found`);
      return;
    }

    console.log(`Initializing dropdown: ${dropdownId}`);

    const items = dropdown.querySelectorAll("li");
    const select = button.closest("div").querySelector("select");
    console.log(`Dropdown ${dropdownId} has ${items.length} items`);

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!button.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });

    // Açıb-bağlamaq üçün
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close all other dropdowns
      document.querySelectorAll('[id^="dropdown"]').forEach(dd => {
        if (dd.id !== dropdownId) {
          dd.classList.add("hidden");
        }
      });

      dropdown.classList.toggle("hidden");
      console.log(`Dropdown ${dropdownId} toggled`);
    });

    // Seçim ediləndə
    items.forEach((item, itemIndex) => {
      const value = item.getAttribute("data-value");
      const anchor = item.querySelector('a');
      const anchorValue = anchor?.getAttribute("data-value");
      const finalValue = value || anchorValue;

      console.log(`Item ${itemIndex} in ${dropdownId}: li value="${value}", anchor value="${anchorValue}", final="${finalValue}"`);

      if (!finalValue) return;

      const clickHandler = function (e) {
        e.preventDefault();
        e.stopPropagation();

        const displayText = anchor?.textContent.trim() || item.textContent.trim() || finalValue;
        console.log(`Selected: ${finalValue} - ${displayText} in dropdown ${dropdownId}`);

        // Update button text
        button.innerHTML = `
          <span class="text-[13px]">${displayText}</span>
          <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round"
                  stroke-linejoin="round" stroke-width="2"
                  d="m1 1 4 4 4-4" />
          </svg>
        `;

        // Update select value
        if (select) {
          select.value = finalValue;
          console.log(`Updated ${select.name || select.id} to: ${finalValue}`);
        }

        // Handle subcategory filtering for dropdown1 (category)
        if (dropdownId === 'dropdown1') {
          filterSubcategories(finalValue);
        }

        // Close dropdown
        dropdown.classList.add("hidden");
      };

      // Add click listener to item
      item.addEventListener("click", clickHandler);
    });
  });

  // Subcategory filtering function
  function filterSubcategories(selectedCategory) {
    console.log(`Filtering subcategories for category: ${selectedCategory}`);

    const subcategoriesItems = document.querySelectorAll(".subcategoriesli");
    let visibleCount = 0;

    subcategoriesItems.forEach(item => {
      const itemCategory = item.getAttribute("data-category");
      if (itemCategory === selectedCategory) {
        item.classList.remove("hidden");
        visibleCount++;
      } else {
        item.classList.add("hidden");
      }
    });

    console.log(`Made ${visibleCount} subcategory items visible`);

    // Reset dropdown2 and dropdown3
    resetDropdown("dropdown2", "Səbəb seçin");
    resetDropdown("dropdown3", "Mövzu seçin");

    // Clear select values
    const purposeSelect = document.getElementById('realSelect2');
    const subjectSelect = document.getElementById('realSelect3');
    if (purposeSelect) purposeSelect.value = '';
    if (subjectSelect) subjectSelect.value = '';
  }

  function resetDropdown(dropdownId, placeholder) {
    const button = document.querySelector(`[data-dropdown-toggle="${dropdownId}"]`);
    if (button) {
      button.innerHTML = `
        <span class="text-[13px] text-slate-500">${placeholder}</span>
        <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2"
                d="m1 1 4 4 4-4" />
        </svg>
      `;
    }
  }
});


// Submit form function
function submitForm(formName) {
  console.log(`Submitting form: ${formName}`);

  if (formName === 'addSorgu') {
    submitSorguForm();
  } else {
    console.warn(`Unknown form: ${formName}`);
  }
}

async function submitSorguForm() {
  const form = document.getElementById('addSorguForm');
  if (!form) {
    console.error('Form not found');
    return;
  }

  console.log('Starting form submission...');

  // Validate required fields
  const category = document.getElementById('realSelect')?.value;
  const purpose = document.getElementById('realSelect2')?.value;
  const subject = document.getElementById('realSelect3')?.value;
  const title = form.querySelector('input[name="title"]')?.value;
  const content = form.querySelector('textarea[name="content"]')?.value;

  console.log('Form values:', { category, purpose, subject, title, content });

  if (!category) {
    showMessage('Zəhmət olmasa kateqoriya seçin', 'error');
    return;
  }

  if (!title || title.trim() === '') {
    showMessage('Zəhmət olmasa başlıq yazın', 'error');
    return;
  }

  if (!content || content.trim() === '') {
    showMessage('Zəhmət olmasa məzmun yazın', 'error');
    return;
  }

  const submitButton = form.querySelector('a[onclick*="submitForm"]');

  // Disable submit button and show loading
  if (submitButton) {
    submitButton.style.opacity = '0.5';
    submitButton.style.pointerEvents = 'none';
    submitButton.innerHTML = '<span class="icon stratis-loader-01 animate-spin mr-2"></span>Yaradılır...';
  }

  try {
    const formData = new FormData(form);

    // Debug: log all form data
    console.log('Form data contents:');
    for (let [key, value] of formData.entries()) {
      if (key === 'files') {
        console.log(`${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Add files if any are selected
    if (selectedFiles && selectedFiles.length > 0) {
      // Clear existing files in formData
      formData.delete('files');
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      console.log(`Added ${selectedFiles.length} files to form`);
    }

    console.log('Sending request to:', form.action);

    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);

      // Try to parse as JSON for better error handling
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `HTTP error! status: ${response.status}`);
      } catch (parseError) {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('Submit result:', result);

    if (result.success) {
      // Show success message
      showMessage(result.message || 'Sorğu uğurla yaradıldı!', 'success');

      // Reset form completely
      console.log('Resetting form...');
      resetFormCompletely(form);

      // Close modal immediately
      console.log('Closing modal...');
      toggleSorgu();

      // Reload the DataTable to show the new query
      console.log('Attempting to reload table...');
      setTimeout(() => {
        // Check multiple ways to detect and reload the table
        if (typeof $ !== 'undefined') {
          console.log('jQuery is available');

          if ($('#myTable').length > 0) {
            console.log('Table element found');

            if ($.fn.DataTable && $.fn.DataTable.isDataTable('#myTable')) {
              console.log('DataTable instance found, reloading...');
              $('#myTable').DataTable().ajax.reload(function (json) {
                console.log('Table reloaded successfully');
                console.log('New record count:', json.recordsFiltered);

                // Update count display
                if (json.recordsFiltered !== undefined) {
                  $('#sorgularCount').text(json.recordsFiltered);
                }
              }, false);
            } else {
              console.log('DataTable instance not found, trying to reinitialize...');
              // Try to trigger table reload via custom event or function
              if (typeof window.reloadSorgularTable === 'function') {
                window.reloadSorgularTable();
              } else {
                console.log('No table reload function found, falling back to page reload');
                window.location.reload();
              }
            }
          } else {
            console.log('Table element not found');
            window.location.reload();
          }
        } else {
          console.log('jQuery not available, falling back to page reload');
          window.location.reload();
        }
      }, 1000);
    } else {
      showMessage(result.message || 'Xəta baş verdi', 'error');
    }

  } catch (error) {
    console.error('Submit error:', error);
    showMessage('Şəbəkə xətası: ' + error.message, 'error');
  } finally {
    // Re-enable submit button
    if (submitButton) {
      submitButton.style.opacity = '1';
      submitButton.style.pointerEvents = 'auto';
      submitButton.innerHTML = 'Yarat';
    }
  }
}

function resetAllDropdowns() {
  resetDropdown("dropdown1", "Seçim edin");
  resetDropdown("dropdown2", "Səbəb seçin");
  resetDropdown("dropdown3", "Mövzu seçin");

  // Clear all select values
  const selects = ['realSelect', 'realSelect2', 'realSelect3'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (select) select.value = '';
  });

  // Hide subcategories
  document.querySelectorAll('.subcategoriesli').forEach(item => {
    item.classList.add('hidden');
  });
}

function resetFormCompletely(form) {
  console.log('Starting complete form reset...');

  // Reset all form fields using native form reset
  form.reset();

  // Reset dropdowns
  resetAllDropdowns();

  // Clear selected files
  clearSelectedFiles();

  // Clear all text inputs specifically
  const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]');
  textInputs.forEach(input => {
    input.value = '';
  });

  // Clear all textareas
  const textareas = form.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.value = '';
  });

  // Clear all hidden inputs (except CSRF tokens)
  const hiddenInputs = form.querySelectorAll('input[type="hidden"]:not([name="_token"])');
  hiddenInputs.forEach(input => {
    input.value = '';
  });

  // Reset all checkboxes and radio buttons
  const checkboxes = form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
  checkboxes.forEach(input => {
    input.checked = false;
  });

  // Reset any date inputs
  const dateInputs = form.querySelectorAll('input[type="date"], input[type="datetime-local"]');
  dateInputs.forEach(input => {
    input.value = '';
  });

  // Clear any error states or validation messages
  const errorElements = form.querySelectorAll('.error, .text-red-500, .border-red-500');
  errorElements.forEach(el => {
    el.classList.remove('error', 'text-red-500', 'border-red-500');
  });

  // Clear any success states
  const successElements = form.querySelectorAll('.success, .text-green-500, .border-green-500');
  successElements.forEach(el => {
    el.classList.remove('success', 'text-green-500', 'border-green-500');
  });

  console.log('Form reset completed successfully');
}

function clearSelectedFiles() {
  selectedFiles = [];
  const fileList = document.getElementById('file-list');
  if (fileList) fileList.innerHTML = '';

  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.value = '';
}

function showMessage(message, type = 'info') {
  console.log(`Message: ${message} (${type})`);

  // Try to use existing message system or create a simple alert
  const messagesDiv = document.getElementById('upload-messages');
  if (messagesDiv) {
    const messageDiv = document.createElement('div');
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300'
    };

    messageDiv.className = `p-2 rounded-lg text-sm border ${colors[type] || colors.info} mb-2`;
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  } else {
    // Fallback to alert if no message container
    alert(message);
  }
}

// Make functions globally available
window.submitForm = submitForm;

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus(); // Alternativ həll
  }
}

