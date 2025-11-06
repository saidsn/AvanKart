console.log('=== fileUpload.js LOADED ===');

// File size limits (must match backend)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 5; // Maximum 5 files
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total

// Store files to be uploaded
let filesToUpload = [];

// Get ticket and partner info
const getTicketInfo = () => {
  const ticketId = document.getElementById('currentTicketId')?.value;
  const partnerId = document.getElementById('currentPartnerId')?.value;
  return { ticketId, partnerId };
};

// Get CSRF token
const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

// File upload modal toggle - MUST be defined immediately for inline onclick handlers
window.toggleFileUploadModal = function () {
  const modal = document.getElementById("fileUploadModal");
  if (!modal) {
    console.warn('fileUploadModal element not found');
    return;
  }

  if (modal.classList.contains("hidden")) {
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
    // Clear file list when closing
    const fileList = document.getElementById("file-list");
    if (fileList) {
      fileList.innerHTML = '';
      fileList.classList.add("hidden");
    }
    // Reset file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.value = '';
    }
    // Clear files array
    filesToUpload = [];
  }
};

// Verify function is defined
console.log('toggleFileUploadModal defined:', typeof window.toggleFileUploadModal);

// Real file upload function
async function uploadFiles() {
  if (filesToUpload.length === 0) {
    alertModal('Yükləmək üçün fayl seçin', 'error');
    return;
  }

  const { ticketId, partnerId } = getTicketInfo();
  if (!ticketId || !partnerId) {
    alertModal('Ticket məlumatları tapılmadı', 'error');
    return;
  }

  const csrfToken = getCsrfToken();
  const formData = new FormData();

  // Add all files to FormData
  filesToUpload.forEach(file => {
    formData.append('files', file);
  });

  try {
    // Show loading state on upload button
    const uploadBtn = document.querySelector('#fileUploadModal button[class*="bg-primary"]');
    const originalText = uploadBtn?.textContent;
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Yüklənir...';
    }

    const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}/upload`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alertModal(data.message || 'Fayllar uğurla yükləndi', 'success');

      // Close modal and reset
      toggleFileUploadModal();
      filesToUpload = [];

      // Reload page to show new files
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      alertModal(data.error || 'Fayllar yüklənərkən xəta baş verdi', 'error');
    }

    // Reset button
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = originalText;
    }

  } catch (error) {
    console.error('Upload error:', error);
    alertModal('Fayllar yüklənərkən xəta baş verdi', 'error');

    // Reset button
    const uploadBtn = document.querySelector('#fileUploadModal button[class*="bg-primary"]');
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Yüklə';
    }
  }
}

// Simulate upload with progress bar (for main upload modal)
function simulateUpload(file) {
  console.log('simulateUpload called for:', file.name);
  const fileList = document.getElementById("file-list");
  console.log('fileList element:', fileList);

  if (!fileList) {
    console.error('file-list element not found!');
    return;
  }

  console.log('Removing hidden class from file-list');
  fileList.classList.remove("hidden");
  console.log('file-list classes after removing hidden:', fileList.className);

  // Add to files array
  filesToUpload.push(file);
  console.log('Files array now has:', filesToUpload.length, 'files');
  console.log('About to create file item element');

  // Create file item with progress
  const fileItem = document.createElement("div");
  fileItem.className = "w-full";
  console.log('Created fileItem div element');
  fileItem.innerHTML = `
    <div class="border border-stroke rounded-2xl px-4 py-5">
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-[13px] font-semibold">Yüklənir...</span>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-primary progress-percentage">0%</span>
            <span class="text-[11px] text-tertiary-text remaining-time">-- saniyə qalıb</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="cursor-pointer pause-btn">
            <img src="/public/images/Avankart/muessiseler/pauseCircle.svg" alt="pause-circle" />
          </div>
          <div class="cursor-pointer text-error remove-btn">
            <img src="/public/images/Avankart/muessiseler/red-x-mark.svg" alt="x-mark" />
          </div>
        </div>
      </div>
      <div class="w-full h-1 mt-2 bg-surface-variant rounded-full">
        <div class="h-full bg-primary rounded-full progress-bar" style="width: 0%;"></div>
      </div>
    </div>
  `;
  console.log('Set innerHTML for fileItem');
  fileList.appendChild(fileItem);
  console.log('Appended fileItem to file-list, children count:', fileList.children.length);

  const progressBar = fileItem.querySelector(".progress-bar");
  const progressPercentage = fileItem.querySelector(".progress-percentage");
  const remainingTime = fileItem.querySelector(".remaining-time");
  const removeButton = fileItem.querySelector(".remove-btn");
  const pauseButton = fileItem.querySelector(".pause-btn");

  let progress = 0;
  const totalTime = 3; // 3 seconds
  let elapsedTime = 0;
  let isPaused = false;

  const uploadInterval = setInterval(() => {
    if (!isPaused) {
      progress += 10;
      elapsedTime += 0.3;

      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        // Show completed state
        updateMainFileElementOnComplete(fileItem, file);
      } else {
        const remaining = totalTime - elapsedTime;
        progressPercentage.textContent = `${progress}%`;
        remainingTime.textContent = `${Math.round(remaining)} saniyə qalıb`;
      }
      progressBar.style.width = `${progress}%`;
    }
  }, 300);

  // Remove button functionality
  removeButton.addEventListener("click", () => {
    clearInterval(uploadInterval);
    // Remove from files array
    const index = filesToUpload.findIndex(f => f.name === file.name);
    if (index > -1) {
      filesToUpload.splice(index, 1);
    }
    fileItem.remove();
    if (fileList.childElementCount === 0) {
      fileList.classList.add("hidden");
    }
  });

  // Pause button functionality
  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
  });
}

// Update file element after simulation completes
function updateMainFileElementOnComplete(fileItem, file) {
  const iconPath = getFileIconPath(file.name);
  fileItem.innerHTML = `
    <div class="border border-stroke rounded-2xl px-4 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="${iconPath}" alt="${file.name} icon" class="w-10 h-10" />
          <div class="flex flex-col">
            <span class="text-[13px] font-medium">${file.name}</span>
            <span class="text-[11px] text-tertiary-text">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
        <div class="cursor-pointer text-error remove-btn">
          <img src="/public/images/Avankart/muessiseler/x-mark.svg" alt="x-mark" />
        </div>
      </div>
    </div>
  `;

  // Re-attach remove button functionality
  fileItem.querySelector(".remove-btn").addEventListener("click", () => {
    // Remove from files array
    const index = filesToUpload.findIndex(f => f.name === file.name);
    if (index > -1) {
      filesToUpload.splice(index, 1);
    }
    fileItem.remove();
    const fileList = document.getElementById("file-list");
    if (fileList.childElementCount === 0) {
      fileList.classList.add("hidden");
    }
  });
}

// Initialize file input event listener when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  console.log('DOMContentLoaded - fileInput:', fileInput);

  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      console.log('File input change event triggered');
      const files = Array.from(event.target.files);
      console.log('Files selected:', files.length, files);

      if (files.length > 0) {
        // Check if adding these files would exceed the file count limit
        if (filesToUpload.length + files.length > MAX_FILES) {
          alertModal(`Maksimum ${MAX_FILES} fayl yükləyə bilərsiniz`, 'error');
          event.target.value = '';
          return;
        }

        // Check total size
        const currentTotalSize = filesToUpload.reduce((sum, f) => sum + f.size, 0);
        const newFilesSize = files.reduce((sum, f) => sum + f.size, 0);
        const totalSize = currentTotalSize + newFilesSize;

        if (totalSize > MAX_TOTAL_SIZE) {
          const maxSizeMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0);
          alertModal(`Faylların ümumi ölçüsü maksimum ${maxSizeMB}MB ola bilər`, 'error');
          event.target.value = '';
          return;
        }

        // Check individual file sizes
        for (const file of files) {
          if (file.size > MAX_FILE_SIZE) {
            const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            alertModal(`Fayl "${file.name}" (${fileSizeMB}MB) maksimum ölçüdən (${maxSizeMB}MB) böyükdür`, 'error');
            event.target.value = '';
            return;
          }
        }

        files.forEach(file => {
          console.log('Processing file:', file.name);
          // Check if file already exists
          if (!filesToUpload.find(f => f.name === file.name)) {
            console.log('Starting simulation for:', file.name);
            simulateUpload(file);
          } else {
            console.log('File already exists:', file.name);
          }
        });
      }
      // Reset input so same file can be selected again
      event.target.value = '';
    });
    console.log('File input event listener attached');
  } else {
    console.error('fileInput element not found!');
  }
});

// Fayl üçün ikona yolunu müəyyənləşdirən funksiya
function getFileIconPath(fileName) {
  const fileExtension = fileName.split(".").pop().toLowerCase();
  switch (fileExtension) {
    case "pdf":
      return "/public/images/Avankart/muessiseler/pdfLogo.svg";
    case "jpg":
    case "jpeg":
      return "/public/images/Avankart/muessiseler/pdfLogo.svg";
    case "png":
      return "/public/images/Avankart/muessiseler/pdfLogo.svg";
    default:
      return "/public/images/Avankart/muessiseler/pdfLogo.svg"; // Ümumi fayl ikonu
  }
}

// drag and drop
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("uploadArea");

  if (dropArea) {
    // Fayl sürüklənərkən
    dropArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.add("bg-[#88649A1A]", "border-[#88649A1A]");
    });

    // Sürükləmə bitərkən
    dropArea.addEventListener("dragleave", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.remove("bg-[#88649A1A]", "border-[#88649A1A]");
    });

    // Fayl buraxılarkən
    dropArea.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.remove("bg-[#88649A1A]", "border-[#88649A1A]");

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        // Check if adding these files would exceed the file count limit
        if (filesToUpload.length + files.length > MAX_FILES) {
          alertModal(`Maksimum ${MAX_FILES} fayl yükləyə bilərsiniz`, 'error');
          return;
        }

        // Check total size
        const currentTotalSize = filesToUpload.reduce((sum, f) => sum + f.size, 0);
        const newFilesSize = files.reduce((sum, f) => sum + f.size, 0);
        const totalSize = currentTotalSize + newFilesSize;

        if (totalSize > MAX_TOTAL_SIZE) {
          const maxSizeMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0);
          alertModal(`Faylların ümumi ölçüsü maksimum ${maxSizeMB}MB ola bilər`, 'error');
          return;
        }

        // Check individual file sizes
        for (const file of files) {
          if (file.size > MAX_FILE_SIZE) {
            const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            alertModal(`Fayl "${file.name}" (${fileSizeMB}MB) maksimum ölçüdən (${maxSizeMB}MB) böyükdür`, 'error');
            return;
          }
        }

        files.forEach(file => {
          if (!filesToUpload.find(f => f.name === file.name)) {
            simulateUpload(file);
          }
        });
      }
    });
  }

  // Attach upload functionality to the "Yüklə" button
  const uploadButton = document.querySelector('#fileUploadModal button[class*="bg-primary"]');
  if (uploadButton) {
    console.log('Upload button found and listener attached');
    uploadButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Upload button clicked, filesToUpload:', filesToUpload);
      uploadFiles();
    });
  } else {
    console.error('Upload button not found!');
  }

  // Debug: Test file-list visibility
  const fileList = document.getElementById('file-list');
  console.log('file-list element check:', fileList, 'Current classes:', fileList?.className);
});

// Fayl yükləmə prosesini simulyasiya edən funksiya
function sorguSimulateUpload(file) {
  const fileList = document.getElementById("sorgu-file-list");
  fileList.classList.remove("hidden");

  // Yeni fayl elementi üçün ilkin HTML
  const fileItem = document.createElement("div");
  fileItem.className = "w-full";
  fileItem.innerHTML = `
        <div class="border border-stroke rounded-2xl px-4 py-5">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
                <span class="text-[13px] font-semibold">Yüklənir...</span>
                <div class="flex items-center gap-2">
                    <span class="text-[11px] text-primary sorgu-progress-percentage">0%</span>
                    <span class="text-[11px] text-tertiary-text sorgu-remaining-time">-- saniyə qalıb</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <div class="cursor-pointer sorgu-pause-btn">
                    <img src="/public/images/Avankart/muessiseler/pauseCircle.svg" alt="pause-circle" />
                </div>
                <div class="cursor-pointer text-error sorgu-remove-btn">
                    <img src="/public/images/Avankart/muessiseler/red-x-mark.svg" alt="x-mark" />
                </div>
            </div>
        </div>
        <div class="w-full h-1 mt-2 bg-surface-variant rounded-full">
            <div class="h-full bg-primary rounded-full sorgu-progress-bar" style="width: 0%;"></div>
        </div>
        </div>
    `;
  fileList.appendChild(fileItem);

  const progressBar = fileItem.querySelector(".sorgu-progress-bar");
  const progressPercentage = fileItem.querySelector(
    ".sorgu-progress-percentage"
  );
  const remainingTime = fileItem.querySelector(".sorgu-remaining-time");
  const removeButton = fileItem.querySelector(".sorgu-remove-btn");
  const pauseButton = fileItem.querySelector(".sorgu-pause-btn");

  let progress = 0;
  const totalTime = 5;
  let elapsedTime = 0;
  let isPaused = false;

  const uploadInterval = setInterval(() => {
    if (!isPaused) {
      progress += 10;
      elapsedTime += 0.5;

      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        // Yükləmə bitdikdən sonra görünüşü dəyişdiririk
        updateFileElementOnComplete(fileItem, file);
      } else {
        const remaining = totalTime - elapsedTime;
        progressPercentage.textContent = `${progress}%`;
        remainingTime.textContent = `${Math.round(remaining)} saniyə qalıb`;
      }
      progressBar.style.width = `${progress}%`;
    }
  }, 500);

  // Ləğv etmə funksionallığı
  removeButton.addEventListener("click", () => {
    clearInterval(uploadInterval);
    fileItem.remove();
    if (fileList.childElementCount === 0) {
      fileList.classList.add("hidden");
    }
  });

  // Pauza funksionallığı
  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    const pauseIcon = pauseButton.querySelector("img");
    if (isPaused) {
      pauseIcon.src = "/public/images/Avankart/muessiseler/pauseCircle.svg";
    } else {
      pauseIcon.src = "/public/images/Avankart/muessiseler/pauseCircle.svg";
    }
  });
}

// Initialize sorgu file input event listener when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const sorguFileInput = document.getElementById("sorguFileInput");
  if (sorguFileInput) {
    sorguFileInput.addEventListener("change", (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        sorguSimulateUpload(files[0]); // İlk faylı yükləməyə başlayır
      }
    });
  }
});

// Fayl üçün ikona yolunu müəyyənləşdirən funksiya
function sorguGetFileIconPath(fileName) {
  const fileExtension = fileName.split(".").pop().toLowerCase();
  switch (fileExtension) {
    case "pdf":
      return "/public/images/Avankart/muessiseler/pdfLogo.svg";
    case "jpg":
    case "jpeg":
      return "/public/images/Avankart/muessiseler/pdfLogo.svg";
    case "png":
      return "/public/images/Avankart/muessiseler/pdfLogo.svg";
    default:
      return "/public/images/Avankart/muessiseler/pdfLogo.svg"; // Ümumi fayl ikonu
  }
}

// Yükləmə tamamlandıqdan sonra faylın görünüşünü dəyişdirən funksiya
function updateFileElementOnComplete(fileItem, file) {
  const iconPath = getFileIconPath(file.name);
  fileItem.innerHTML = `
        <div  class="border border-stroke rounded-2xl px-4 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="${iconPath}" alt="${file.name} icon" class="w-10 h-10" />
                <div class="flex flex-col">
                    <span class="text-[13px] font-medium">${file.name}</span>
                    <span class="text-[11px] text-tertiary-text">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
            </div>
            <div class="cursor-pointer text-error sorgu-remove-btn">
                <img src="/public/images/Avankart/muessiseler/x-mark.svg" alt="x-mark" />
            </div>
        </div>
        </div>
    `;

  // Yeni elementə ləğv etmə funksiyasını yenidən əlavə edirik
  fileItem.querySelector(".sorgu-remove-btn").addEventListener("click", () => {
    fileItem.remove();
    const fileList = document.getElementById("sorgu-file-list");
    if (fileList.childElementCount === 0) {
      fileList.classList.add("hidden");
    }
  });
}

// drag and drop for sorgu popup
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("sorguUploadArea");

  if (dropArea) {
    // Fayl sürüklənərkən
    dropArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.add("bg-[#88649A1A]", "border-[#88649A1A]");
    });

    // Sürükləmə bitərkən
    dropArea.addEventListener("dragleave", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.remove("bg-[#88649A1A]", "border-[#88649A1A]");
    });

    // Fayl buraxılarkən
    dropArea.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.remove("bg-[#88649A1A]", "border-[#88649A1A]");

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        // Buraxılan fayllar üzərində dövr edirik
        for (let i = 0; i < files.length; i++) {
          sorguSimulateUpload(files[i]);
        }
      }
    });
  }
});
