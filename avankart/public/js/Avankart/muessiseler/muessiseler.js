// Toggle all tabs
document.addEventListener("DOMContentLoaded", () => {
  const mainTabLinks = document.querySelectorAll(".main-tab-link");
  const mainTabContents = document.querySelectorAll(".main-tab-content");

  const toggleMainTabs = (activeLink) => {
    // Bütün ana tabların aktivliyini sil
    mainTabLinks.forEach((link) => {
      link.classList.remove("text-messages", "border-b-2", "border-messages");
    });
    // Bütün ana tab məzmunlarını gizlət
    mainTabContents.forEach((content) => {
      content.classList.add("hidden");
    });

    // Seçilmiş ana tabı aktivləşdir
    activeLink.classList.add("text-messages", "border-b-2", "border-messages");
    const targetId = activeLink.getAttribute("data-tab");
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.classList.remove("hidden");
    }
  };

  mainTabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMainTabs(link);
    });
  });

  // Səhifə yüklənəndə default ana tabı aktivləşdir
  const initialActiveMainTab = document.querySelector(
    ".main-tab-link.text-messages"
  );
  if (initialActiveMainTab) {
    toggleMainTabs(initialActiveMainTab);
  }
});

// Toggle istifadeciler tabs
document.addEventListener("DOMContentLoaded", function () {
  const subTabs = document.querySelectorAll(
    "#istifadeciler .notification-type"
  );
  const subTabContents = document.querySelectorAll(
    "#istifadeciler .sub-tab-content"
  );
  const searchContainers = {
    "tab-user-content": document.getElementById("userSearchContainer"),
    "tab-permissions-content": document.getElementById(
      "selahiyyetSearchContainer"
    ),
    "tab-roles-content": document.getElementById("jobSearchContainer"),
  };

  const toggleSubTabs = (activeTab) => {
    // Bütün alt tabların aktivliyini sil
    subTabs.forEach((tab) => {
      tab.classList.remove("active", "bg-inverse-on-surface", "text-messages");
      tab.classList.add("text-tertiary-text", "cursor-pointer");
    });

    // Seçilmiş alt tabı aktivləşdir
    activeTab.classList.add("active", "bg-inverse-on-surface", "text-messages");
    activeTab.classList.remove("text-tertiary-text", "cursor-pointer");

    // Bütün alt tab məzmunlarını gizlət
    subTabContents.forEach((content) => content.classList.add("hidden"));

    // Bütün axtarış sahələrini gizlət
    Object.values(searchContainers).forEach((container) => {
      if (container) {
        container.classList.add("hidden");
      }
    });

    const targetId = activeTab.getAttribute("data-tab");
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.classList.remove("hidden");
    }

    // Seçilmiş tabın axtarış sahəsini göstər
    const activeSearchContainer = searchContainers[targetId];
    if (activeSearchContainer) {
      activeSearchContainer.classList.remove("hidden");
    }
  };

  subTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      toggleSubTabs(tab);
    });
  });

  // Səhifə yüklənəndə default alt tabı aktivləşdir
  const initialActiveSubTab = document.querySelector(
    "#istifadeciler .notification-type.active"
  );
  if (initialActiveSubTab) {
    toggleSubTabs(initialActiveSubTab);
  }
});

// Toggle Functions
window.toggleRestaurantDetailPopup = function () {
  console.log("Restaurant Detail Popup Toggled");

  if ($("#restaurantDetailPopup").hasClass("hidden")) {
    $("#restaurantDetailPopup").removeClass("hidden");
  } else {
    $("#restaurantDetailPopup").addClass("hidden");
  }
};

window.toggleTesdiqModal = function () {
  if ($("#tesdiqModal").hasClass("hidden")) {
    $("#tesdiqModal").removeClass("hidden");
  } else {
    $("#tesdiqModal").addClass("hidden");
  }
};

window.toggleConfirmModal = function () {
  if ($("#confirmModal").hasClass("hidden")) {
    $("#confirmModal").removeClass("hidden");
    startCountdown();
  } else {
    $("#confirmModal").addClass("hidden");
  }
};

window.toggleMuessiseVersiyalariModal = function () {
  if ($("#muessiseVersiyalari").hasClass("hidden")) {
    $("#muessiseVersiyalari").removeClass("hidden");
    startCountdown();
  } else {
    $("#muessiseVersiyalari").addClass("hidden");
  }
};

window.toggleDeAktivModal = function () {
  if ($("#deAktivModal").hasClass("hidden")) {
    $("#deAktivModal").removeClass("hidden");
  } else {
    $("#deAktivModal").addClass("hidden");
  }
};

window.toggleSilinmeMuracietPopUp = function () {
  if ($("#silinmeMuracietPopUp").hasClass("hidden")) {
    $("#silinmeMuracietPopUp").removeClass("hidden");
  } else {
    $("#silinmeMuracietPopUp").addClass("hidden");
  }
};




let editRekvizitId = "";
let formMode = "add";
window.toggleNewRekvizit = function (text, _id) {

  if (text === "add") {
    formMode = "add";
    $("#yeniRekvizitForm").trigger("reset");
    $("#rekvizitTitle").text("Yeni rekvizit");
    editRekvizitId = "";
  }
  if (text === "edit") {
    formMode = "edit";
    $("#rekvizitTitle").text("Redaktə rekvizit");
    editRekvizitId = _id;
    editRekvizit(_id);
  }

  if (text === "clear") {
    $("#yeniRekvizitForm").trigger("reset");
    editRekvizitId = "";
  }
  if ($("#yeniRekvizitForm").hasClass("hidden")) {
    $("#yeniRekvizitForm").removeClass("hidden");
  } else {
    $("#yeniRekvizitForm").addClass("hidden");
  }
};
async function deleteRekvizit(rekvizitId) {
  try {
    const csrfToken = $("#rekvizitCsrf").val();
    console.log(csrfToken, "csrf");
    const res = await fetch(`/muessiseler/rekvizitler/${rekvizitId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken
      }
    });


    const data = await res.json();
    console.log("Silindi:", data);

    if (data.success) {
      $(`#rekvizit-${rekvizitId}`).remove();
      alertModal(data.success, "Rekvizit silindi", 2000);
    }
    if (data.redirect) {
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 1500);
    } else {
      alertModal(data.message || "Xəta baş verdi", "error", 2000);
    }



  } catch (error) {
    console.error("Xəta baş verdi:", error);
    alertModal("Serverde xəta baş verdi", "error", 2000);
  }
}



async function editRekvizit(rekvizitId) {
  try {
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    let res = await fetch(`/muessiseler/rekvizitler/${rekvizitId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      }
    });
    const data = await res.json();
    $("#rekvizitPopUp input[name='sirket_name']").val(data.data.sirket_name);
    $("#rekvizitPopUp input[name='bank_name']").val(data.data.bank_info.bank_name);
    $("#rekvizitPopUp input[name='swift']").val(data.data.bank_info.swift);
    $("#rekvizitPopUp input[name='hesablasma']").val(data.data.bank_info.settlement_account);
    $("#rekvizitPopUp input[name='huquqi_unvan']").val(data.data.huquqi_unvan);
    $("#rekvizitPopUp input[name='bank_kodu']").val(data.data.bank_info.bank_code);
    $("#rekvizitPopUp input[name='muxbir_hesabi']").val(data.data.bank_info.muxbir_hesabi);
    $("#rekvizitPopUp input[name='voen']").val(data.data.voen);
    $("#rekvizitPopUp input[name='rekvizit_id']").val(data.data._id);

  } catch (error) {
    console.error("Xəta baş verdi:", error);
  }
}


$("#yeniRekvizitForm").on("submit", async function (e) {
  e.preventDefault();
  $(this).trigger("reset");
  $("#yeniRekvizitForm").addClass("hidden");
});

window.toggleDeleteModal = function (rekvizitId) {
  deleteRekvizit(rekvizitId);
  if ($("#deleteModal").hasClass("hidden")) {
    $("#deleteModal").removeClass("hidden");
  } else {
    $("#deleteModal").addClass("hidden");
  }


};



function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");

  // Xaricə kliklənəndə bağla
  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// grid2 - grid4 contracts
function openContractsTableGrid4() {
  // Görünüş dəyişiklikləri
  document.getElementById("contractsGrid4").classList.remove("hidden");
  document.getElementById("contractsGrid2").classList.add("hidden");

  // Aktiv stil əlavə et
  const gridBtn = document.querySelector(
    'button[onclick="openContractsTableGrid4()"]'
  );
  const tableBtn = document.querySelector(
    'button[onclick="openContractsTableGrid2()"]'
  );

  gridBtn.classList.add(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
  tableBtn.classList.remove(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
}

function openContractsTableGrid2() {
  // Görünüş dəyişiklikləri
  document.getElementById("contractsGrid4").classList.add("hidden");
  document.getElementById("contractsGrid2").classList.remove("hidden");

  // Aktiv stil əlavə et
  const gridBtn = document.querySelector(
    'button[onclick="openContractsTableGrid4()"]'
  );
  const tableBtn = document.querySelector(
    'button[onclick="openContractsTableGrid2()"]'
  );

  tableBtn.classList.add(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
  gridBtn.classList.remove(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
}


// File upload
window.toggleFileUploadModal = function () {
  if ($("#fileUploadModal").hasClass("hidden")) {
    $("#fileUploadModal").removeClass("hidden");
  } else {
    $("#fileUploadModal").addClass("hidden");
  }
};



// Fayl yükləmə prosesini simulyasiya edən funksiya
function simulateUpload(file) {
  const fileList = document.getElementById("file-list");
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
                    <span class="text-[11px] text-primary progress-percentage">0%</span>
                    <span class="text-[11px] text-tertiary-text remaining-time">-- saniyə qalıb</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <div class="cursor-pointer pause-btn">
                    <img src="/images/Avankart/muessiseler/pauseCircle.svg" alt="pause-circle" />
                </div>
                <div class="cursor-pointer text-error remove-btn">
                    <img src="/images/Avankart/muessiseler/red-x-mark.svg" alt="x-mark" />
                </div>
            </div>
        </div>
        <div class="w-full h-1 mt-2 bg-surface-variant rounded-full">
            <div class="h-full bg-primary rounded-full progress-bar" style="width: 0%;"></div>
        </div>
        </div>
    `;
  fileList.appendChild(fileItem);

  const progressBar = fileItem.querySelector(".progress-bar");
  const progressPercentage = fileItem.querySelector(".progress-percentage");
  const remainingTime = fileItem.querySelector(".remaining-time");
  const removeButton = fileItem.querySelector(".remove-btn");
  const pauseButton = fileItem.querySelector(".pause-btn");

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

  $("#fileUploadForm").on("submit", async function (e) {
    e.preventDefault();
    if ($("#fileUploadModal").hasClass("hidden")) {
      $("#fileUploadModal").removeClass("hidden");
    } else {
      $("#fileUploadModal").addClass("hidden");

      // pop up baglanir ve icerisindeki file silinir
      clearInterval(uploadInterval);
      fileItem.remove();
      if (fileList.childElementCount === 0) {
        fileList.classList.add("hidden");
      }
    };
  });

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
      pauseIcon.src = "/images/Avankart/muessiseler/pauseCircle.svg";
    } else {
      pauseIcon.src = "/images/Avankart/muessiseler/pauseCircle.svg";
    }
  });
}

document.getElementById("fileInput").addEventListener("change", (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    simulateUpload(files[0]); // İlk faylı yükləməyə başlayır
  }
});

// Fayl üçün ikona yolunu müəyyənləşdirən funksiya
function getFileIconPath(fileName) {
  const fileExtension = fileName.split(".").pop().toLowerCase();
  switch (fileExtension) {
    case "pdf":
      return "/images/Avankart/muessiseler/pdfLogo.svg";
    case "jpg":
    case "jpeg":
      return "/images/Avankart/muessiseler/pdfLogo.svg";
    case "png":
      return "/images/Avankart/muessiseler/pdfLogo.svg";
    default:
      return "/images/Avankart/muessiseler/pdfLogo.svg"; // Ümumi fayl ikonu
  }
}

// Yükləmə tamamlandıqdan sonra faylın görünüşünü dəyişdirən funksiya
function updateFileElementOnComplete(fileItem, file) {
  const iconPath = getFileIconPath(file.name);
  fileItem.innerHTML = `
        <div  class="border border-stroke rounded-2xl px-4 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="${iconPath}" alt="${file.name
    } icon" class="w-10 h-10" />
                <div class="flex flex-col">
                    <span class="text-[13px] font-medium">${file.name}</span>
                    <span class="text-[11px] text-tertiary-text">${(
      file.size /
      1024 /
      1024
    ).toFixed(2)} MB</span>
                </div>
            </div>
            <div class="cursor-pointer text-error remove-btn">
                <img src="/images/Avankart/muessiseler/x-mark.svg" alt="x-mark" />
            </div>
        </div>
        </div>
    `;

  // Yeni elementə ləğv etmə funksiyasını yenidən əlavə edirik
  fileItem.querySelector(".remove-btn").addEventListener("click", () => {
    fileItem.remove();
    const fileList = document.getElementById("file-list");
    if (fileList.childElementCount === 0) {
      fileList.classList.add("hidden");
    }
  });
}

// drag and drop
document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("uploadArea");

  if (dropArea) {
    // Fayl sürüklənərkən
    dropArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropArea.classList.add("bg-[#88649A1A]", "border-[#88649A1A]"); // CSS sinifləri ilə vizual əlaqə
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
          simulateUpload(files[i]);
        }
      }
    });
  }
});