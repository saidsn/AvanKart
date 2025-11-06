// Ortak elementler
const overlay = document.querySelector("#fakturaModalOverlay");
const aside = document.querySelector("aside");
const span4 = document.querySelector(".span4");
const span4_1 = document.querySelector(".span4-1");
const curveleft = document.querySelector("#curve-left-div");
const tenzimlemelerDiv = document.querySelector("#tenzimlemeler-div");
const destekDiv = document.querySelector(".destek-div");
const destekLogo = document.querySelector(".destek-logo");

const transparentElements = [
  aside,
  span4,
  span4_1,
  curveleft,
  tenzimlemelerDiv,
  destekDiv,
  destekLogo,
];

function setTransparentBackground() {
  transparentElements.forEach((el) => {
    if (el) el.style.background = "transparent";
  });
}

// Genel popup açma/kapama fonksiyonları
let activePopup = null;

function openPopup(id) {
  closePopup(); // önce varsa açık popup'ı kapat
  const popup = document.querySelector(id);
  if (!popup) return;

  popup.style.display = "block";
  overlay.style.display = "block";
  setTransparentBackground();
  activePopup = popup;
}

function closePopup() {
  if (activePopup) {
    activePopup.style.display = "none";
    overlay.style.display = "none";
    activePopup = null;
  }
}

// Overlay'e tıklayınca kapanma
overlay.addEventListener("click", closePopup);

// Kullanım örnekleri
// buton onclick="openPopup('#reportPopup')"
// buton onclick="openPopup('#OdenisPopUp')"
// buton onclick="openPopup('#fakturaDiv')"
// buton onclick="openPopup('#YeniInvoys')"
// buton onclick="openPopup('#UpdateInvoys')"
// buton onclick="openPopup('#iscisilDiv2')"
// buton onclick="openPopup('.emaildogrulama-div')"

// Invoice təsdiqləmə və silmə funksiyaları
function openAvankartaModal(invoice, _id) {
  const overlay = document.getElementById("avankartaModalOverlay");
  const modal = document.getElementById("avankartaModal");
  document.getElementById("avankartInvoice").innerText = invoice;
  document.getElementById("avankartInvoiceInput").value = _id;
  if (overlay && modal) {
    overlay.classList.remove("hidden");
    modal.classList.remove("hidden");
  }
}

function closeAvankartaModal() {
  const overlay = document.getElementById("avankartaModalOverlay");
  const modal = document.getElementById("avankartaModal");
  if (overlay && modal) {
    overlay.classList.add("hidden");
    modal.classList.add("hidden");
  }
}

function confirmAvankarta() {
  const selectedInvoiceNumber = document.getElementById("avankartInvoiceInput").value;

  console.log("Confirm zamani selectedInvoiceNumber", selectedInvoiceNumber);
  if (
    typeof selectedInvoiceNumber === "undefined" ||
    selectedInvoiceNumber === ""
  ) {
    alertModal("Invoice ID tapılmadı3", "error");
    return;
  }

  // CSRF token-i əldə et
  const csrfToken =
    document.querySelector('meta[name="_csrf"]')?.getAttribute("content") ||
    document.querySelector('input[name="_csrf"]')?.value;

  fetch("/hesablashmalar/send-to-avankart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      invoice: selectedInvoiceNumber,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alertModal(data.message || "Invoice uğurla təsdiqləndi");
        if (data.redirect) {
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 2000);
        }
      } else {
        alertModal(data.message || "Xəta baş verdi", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alertModal("Server xətası", "error");
    })
    .finally(() => {
      closeAvankartaModal();
    });
}

function openDeleteInvoiceModal() {
  if (typeof selectedInvoiceNumber === "undefined") {
    alertModal("Invoice ID tapılmadı 1", "error");
    return;
  }

  // CSRF token-i əldə et
  const csrfToken =
    document.querySelector('meta[name="_csrf"]')?.getAttribute("content") ||
    document.querySelector('input[name="_csrf"]')?.value;

  // Əvvəlcə OTP göndər
  fetch("/api/invoice/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      id: selectedInvoiceNumber,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.otpRequired) {
        // OTP modal aç
        const otp = prompt(data.message + "\n\nOTP kodunu daxil edin:");
        if (otp) {
          confirmDeleteInvoice(otp);
        }
      } else {
        alertModal(data.message || "Xəta baş verdi", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alertModal("Server xətası", "error");
    });
}

function confirmDeleteInvoice(otp) {
  if (typeof selectedInvoiceNumber === "undefined") {
    alertModal("Invoice ID tapılmadı2", "error");
    return;
  }

  // CSRF token-i əldə et
  const csrfToken =
    document.querySelector('meta[name="_csrf"]')?.getAttribute("content") ||
    document.querySelector('input[name="_csrf"]')?.value;

  fetch("/api/invoice/confirm-delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      id: selectedInvoiceNumber,
      otp: otp,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alertModal(data.message || "Invoice uğurla silindi");
        location.reload(); // Səhifəni yenilə
      } else {
        alertModal(data.message || "Xəta baş verdi", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alertModal("Server xətası", "error");
    });
}

// Modal overlay click olayları
document.addEventListener("DOMContentLoaded", function () {
  const avankartaOverlay = document.getElementById("avankartaModalOverlay");
  if (avankartaOverlay) {
    avankartaOverlay.addEventListener("click", closeAvankartaModal);
  }
});
