// IMMEDIATE ALERT TO CONFIRM FILE LOADING
alert("🚨 FILE UPLOAD JS LOADED! 🚨");
console.log("🚨 FILE UPLOAD JS LOADED! 🚨");

console.log("🚀 File Upload JavaScript starting to load...");

// File Upload Variables
let selectedFiles = [];

console.log("📂 Variables initialized");

// Immediately define functions on window object to prevent "not defined" errors
window.uploadFiles = window.uploadFiles || function () {
  console.log("⚠️ uploadFiles called before full initialization");
};

window.toggleSorgu = window.toggleSorgu || function () {
  console.log("⚠️ toggleSorgu called before full initialization");
};

window.removeFile = window.removeFile || function (fileName) {
  console.log("⚠️ removeFile called before full initialization:", fileName);
};

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing file upload...");
  initFileUpload();

  // Wait a bit for modal content to be available, then attach event listeners
  setTimeout(attachEventListeners, 100);
});

function attachEventListeners() {
  console.log("🔗 Attaching event listeners...");

  // Try to find buttons multiple times since modal might be hidden initially
  let attempts = 0;
  const maxAttempts = 10;

  function tryAttachListeners() {
    attempts++;
    console.log(`🔍 Attempt ${attempts} to find buttons...`);

    // Look for upload button
    const uploadBtn = document.getElementById("uploadBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    console.log("Upload button found:", !!uploadBtn);
    console.log("Cancel button found:", !!cancelBtn);

    if (uploadBtn) {
      // Remove any existing listeners
      uploadBtn.removeEventListener("click", handleUploadClick);
      uploadBtn.addEventListener("click", handleUploadClick);
      console.log("✅ Upload button event listener attached");

      // Also add a backup onclick handler
      uploadBtn.onclick = function (e) {
        console.log("🔄 Backup onclick handler triggered!");
        handleUploadClick(e);
      };
    } else {
      console.error("❌ Upload button not found!");
    }

    if (cancelBtn) {
      cancelBtn.removeEventListener("click", handleCancelClick);
      cancelBtn.addEventListener("click", handleCancelClick);
      console.log("✅ Cancel button event listener attached");
    } else {
      console.error("❌ Cancel button not found!");
    }

    // If buttons not found and we haven't exceeded max attempts, try again
    if ((!uploadBtn || !cancelBtn) && attempts < maxAttempts) {
      console.log(`⏳ Buttons not found, retrying in 500ms... (attempt ${attempts}/${maxAttempts})`);
      setTimeout(tryAttachListeners, 500);
    } else if (uploadBtn && cancelBtn) {
      console.log("🎉 All buttons found and listeners attached successfully!");
    } else {
      console.error("❌ Failed to find buttons after", maxAttempts, "attempts");
    }
  }

  // Start trying to attach listeners
  tryAttachListeners();

  // Attach toggle event listener to the add file button
  const addFileBtn = document.querySelector('[onclick="toggleSorgu()"]');
  if (addFileBtn) {
    addFileBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🎯 Toggle button clicked via event listener!");
      toggleSorgu();

      // After opening modal, try to attach button listeners again
      setTimeout(tryAttachListeners, 100);
    });
    addFileBtn.removeAttribute("onclick"); // Remove inline onclick
    console.log("✅ Toggle button event listener attached");
  }

  // Attach toggle event listener to close button
  const closeBtn = document.querySelector('.sorgu-div .icon.stratis-x-02');
  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🎯 Close button clicked via event listener!");
      toggleSorgu();
    });
    closeBtn.removeAttribute("onclick"); // Remove inline onclick
    console.log("✅ Close button event listener attached");
  }
}

function handleUploadClick(e) {
  e.preventDefault();
  console.log("🎯 Upload button clicked via event listener!");
  console.log("Selected files:", selectedFiles.length);
  console.log("Event:", e);
  console.log("Button:", e.target);

  // Force call uploadFiles even if there are no files for testing
  uploadFiles();
}

function handleCancelClick(e) {
  e.preventDefault();
  console.log("🎯 Cancel button clicked via event listener!");
  toggleSorgu();
}

function initFileUpload() {
  console.log("File upload initialized");
  console.log("Ticket ID:", window.TICKET_ID);

  // File input change handler
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      console.log("File input changed");
      handleFiles(e.target.files);
    });
    console.log("✅ File input listener added");
  } else {
    console.error("❌ File input not found!");
  }

  // Drag and drop handlers
  const dropZone = document.getElementById("upload-drop-zone");
  if (dropZone) {
    console.log("✅ Drop zone found");

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });

    dropZone.addEventListener("dragover", function (e) {
      console.log("Drag over");
      dropZone.classList.add("border-blue-500", "bg-blue-50");
    });

    dropZone.addEventListener("dragleave", function (e) {
      console.log("Drag leave");
      dropZone.classList.remove("border-blue-500", "bg-blue-50");
    });

    dropZone.addEventListener("drop", function (e) {
      console.log("Files dropped");
      dropZone.classList.remove("border-blue-500", "bg-blue-50");
      const files = e.dataTransfer.files;
      handleFiles(files);
    });
  } else {
    console.error("❌ Drop zone not found!");
  }
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function getFileIcon(fileName, mimeType) {
  const extension = fileName.split(".").pop().toLowerCase();

  if (mimeType && mimeType.includes("pdf")) {
    return "/images/Sorgular Pages Images/upload.svg"; // Use upload.svg for PDF
  } else if (mimeType && mimeType.includes("image")) {
    return "/images/Sorgular Pages Images/upload.svg"; // Use upload.svg for images
  } else if (
    extension === "xlsx" ||
    extension === "xls" ||
    (mimeType &&
      (mimeType.includes("excel") || mimeType.includes("spreadsheet")))
  ) {
    return "/images/Sorgular Pages Images/excel-image.svg";
  } else if (
    extension === "docx" ||
    extension === "doc" ||
    (mimeType && mimeType.includes("word"))
  ) {
    return "/images/Sorgular Pages Images/upload.svg"; // Use upload.svg for Word
  } else {
    return "/images/Sorgular Pages Images/upload.svg"; // Use upload.svg as default
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Handle selected files
function handleFiles(files) {
  console.log("Handling files:", files.length);

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  Array.from(files).forEach((file) => {
    console.log("Processing file:", file.name, file.type, file.size);

    if (!allowedTypes.includes(file.type)) {
      showMessage(
        `${file.name}: Yalnız PDF, JPG, PNG faylları dəstəklənir`,
        "error"
      );
      return;
    }

    if (file.size > maxSize) {
      showMessage(
        `${file.name}: Fayl ölçüsü 10MB-dan böyük ola bilməz`,
        "error"
      );
      return;
    }

    if (
      selectedFiles.find((f) => f.name === file.name && f.size === file.size)
    ) {
      showMessage(`${file.name}: Bu fayl artıq seçilmişdir`, "warning");
      return;
    }

    selectedFiles.push(file);
    addFileToList(file);
    console.log("File added:", file.name);
  });
}

// Add file to display list
function addFileToList(file) {
  const fileList = document.getElementById("file-list");
  if (!fileList) {
    console.error("File list not found");
    return;
  }

  const fileDiv = document.createElement("div");
  fileDiv.className =
    "file-item py-3 px-4 border border-[#0000001A] dark:border-[#FFFFFF1A] rounded-lg mb-2";
  fileDiv.dataset.fileName = file.name;

  const fileIcon = getFileIcon(file.name, file.type);
  const fileSize = formatFileSize(file.size);

  fileDiv.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="${fileIcon}" alt="File icon" class="w-10 h-10" onerror="this.src='/images/Sorgular Pages Images/file-image.svg'">
        <div class="flex flex-col">
          <span class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
            ${file.name}
          </span>
          <span class="text-[11px] font-normal opacity-50">
            ${fileSize}
          </span>
        </div>
      </div>
      <button type="button" data-file-name="${file.name}" class="remove-file-btn icon stratis-trash-01 w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer">
      </button>
    </div>
  `;

  fileList.appendChild(fileDiv);

  // Attach event listener to the remove button
  const removeBtn = fileDiv.querySelector('.remove-file-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', function () {
      const fileName = this.getAttribute('data-file-name');
      console.log("🗑️ Remove button clicked for:", fileName);
      removeFile(fileName);
    });
  }
}

// Remove file from selection
function removeFile(fileName) {
  console.log("Removing file:", fileName);
  selectedFiles = selectedFiles.filter((file) => file.name !== fileName);
  const fileDiv = document.querySelector(`[data-file-name="${fileName}"]`);
  if (fileDiv) {
    fileDiv.remove();
  }
}

// Immediately assign to window
window.removeFile = removeFile;
console.log("✅ removeFile assigned to window");

// Upload files function
async function uploadFiles() {
  console.log("🚨 UPLOAD FILES FUNCTION CALLED! 🚨");
  console.log("🎯 uploadFiles function called!");
  console.log("Upload button clicked, files:", selectedFiles.length);
  console.log("Stack trace:", new Error().stack);

  // Try to get files from selectedFiles array first, then from file input
  let filesToUpload = [];

  if (selectedFiles && selectedFiles.length > 0) {
    filesToUpload = selectedFiles;
    console.log("Using selectedFiles array:", filesToUpload.length);
  } else {
    // Fallback to file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      filesToUpload = Array.from(fileInput.files);
      console.log("Using file input files:", filesToUpload.length);
    }
  }

  if (filesToUpload.length === 0) {
    showMessage("Heç bir fayl seçilməyib", "error");
    return;
  }

  if (!window.TICKET_ID) {
    showMessage("Ticket ID tapılmadı", "error");
    return;
  }

  const formData = new FormData();
  filesToUpload.forEach((file) => {
    formData.append("files", file);
    console.log("Added file to FormData:", file.name);
  });

  showLoading(true);

  const ticketId = window.TICKET_ID;
  console.log("Uploading to ticket:", ticketId);

  try {
    const uploadUrl = `/sorgular/${ticketId}/upload`;
    console.log("Upload URL:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Upload result:", result);

    if (result.success) {
      const fileCount = result.files
        ? result.files.length
        : selectedFiles.length;
      showMessage(`${fileCount} fayl uğurla yükləndi!`, "success");

      if (result.files && result.files.length > 0) {
        addUploadedFilesToPage(result.files);
      }

      selectedFiles = [];
      document.getElementById("file-list").innerHTML = "";
      document.getElementById("fileInput").value = "";

      setTimeout(() => {
        toggleSorgu();
        window.location.reload();
      }, 2000);
    } else {
      showMessage(result.message || "Yükləmə xətası", "error");
    }
  } catch (error) {
    console.error("Upload error:", error);
    showMessage("Şəbəkə xətası baş verdi: " + error.message, "error");
  } finally {
    showLoading(false);
  }
}

// Immediately assign to window
window.uploadFiles = uploadFiles;
console.log("✅ uploadFiles assigned to window");

function addUploadedFilesToPage(files) {
  let fileSection =
    document.getElementById("existing-files-section") ||
    document.getElementById("files-section-placeholder");

  if (!fileSection) {
    const leftSection = document.querySelector(".w-\\[61\\%\\]");
    if (leftSection) {
      const newFileSection = document.createElement("div");
      newFileSection.className = "my-3";
      newFileSection.id = "existing-files-section";
      newFileSection.innerHTML =
        '<h3 class="text-[13px] font-normal opacity-65">Əlaqəli fayllar</h3>';

      const addButton = leftSection.querySelector(
        ".flex.items-center.gap-2.justify-center"
      );
      if (addButton) {
        leftSection.insertBefore(newFileSection, addButton);
        fileSection = newFileSection;
      }
    }
  }

  if (fileSection && fileSection.style.display === "none") {
    fileSection.style.display = "block";
  }

  if (fileSection) {
    files.forEach((file) => {
      const fileDiv = document.createElement("div");
      fileDiv.className =
        "my-3 py-[19.75px] px-4 border-[1px] rounded-lg border-[#0000001A] dark:border-[#FFFFFF1A]";

      const fileIcon = getFileIcon(
        file.filename || file.originalName,
        file.mimetype
      );
      const displayName = file.originalName || file.filename;
      const fileSize = file.size ? formatFileSize(file.size) : "0MB";

      fileDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="${fileIcon}" alt="File icon" class="w-10 h-10" onerror="this.src='/images/Sorgular Pages Images/upload.svg'">
            <div class="flex items-center gap-0.5 flex-col">
              <span class="text-[13px] font-medium">${displayName}</span>
              <span class="text-[11px] font-normal opacity-50">${fileSize}</span>
            </div>
          </div>
          <a href="${file.route}" download>
            <img src="/images/Sorgular Pages Images/cloud_download.svg" alt="Cloud-download" 
                 class="w-6 h-6 cursor-pointer" onerror="this.style.display='none'">
          </a>
        </div>
      `;

      fileSection.appendChild(fileDiv);
    });
  }
}

// Show loading state
function showLoading(show) {
  const loader = document.getElementById("uploadLoader");
  const uploadBtn = document.getElementById("uploadBtn");

  if (show) {
    loader?.classList.remove("hidden");
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.textContent = "Yüklənir...";
    }
  } else {
    loader?.classList.add("hidden");
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Yüklə";
    }
  }
}

// Show message function
function showMessage(message, type) {
  console.log("Showing message:", message, type);

  const messagesDiv = document.getElementById("upload-messages");
  if (!messagesDiv) {
    console.error("Messages div not found");
    alert(message);
    return;
  }

  const messageDiv = document.createElement("div");

  const colors = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  messageDiv.className = `p-2 rounded-lg text-sm border ${colors[type] || colors.warning
    } mb-2`;
  messageDiv.textContent = message;

  messagesDiv.appendChild(messageDiv);

  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

// Toggle modal function
function toggleSorgu() {
  console.log("Toggle modal");

  const modal = document.querySelector(".sorgu-div");
  const overlay = document.getElementById("overlay");

  modal?.classList.toggle("hidden");
  overlay?.classList.toggle("hidden");

  if (modal?.classList.contains("hidden")) {
    selectedFiles = [];
    const fileList = document.getElementById("file-list");
    const messages = document.getElementById("upload-messages");
    const fileInput = document.getElementById("fileInput");

    if (fileList) fileList.innerHTML = "";
    if (messages) messages.innerHTML = "";
    if (fileInput) fileInput.value = "";

    console.log("Modal closed and form reset");
  } else {
    console.log("Modal opened");
  }
}

// Immediately assign to window
window.toggleSorgu = toggleSorgu;
console.log("✅ toggleSorgu assigned to window");

// Debug logging
console.log("📄 fileUpload.js finished loading");
console.log("📄 Final function check:", {
  uploadFiles: typeof window.uploadFiles,
  toggleSorgu: typeof window.toggleSorgu,
  removeFile: typeof window.removeFile
});

// Add debug function for testing
window.debugFileUpload = function () {
  console.log("🔍 Debug Info:");
  console.log("- Selected files:", selectedFiles.length);
  console.log("- Ticket ID:", window.TICKET_ID);
  console.log("- Upload button:", document.getElementById("uploadBtn"));
  console.log("- File input:", document.getElementById("fileInput"));
  console.log("- Drop zone:", document.getElementById("upload-drop-zone"));
  console.log("- Functions available:", {
    uploadFiles: typeof window.uploadFiles,
    toggleSorgu: typeof window.toggleSorgu,
    removeFile: typeof window.removeFile
  });
};

// Manual upload function for testing
window.testUpload = function () {
  console.log("🧪 Testing upload function...");
  uploadFiles();
};
