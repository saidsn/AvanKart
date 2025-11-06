const dateModal = document.getElementById("dateModal");
const supportModal = document.getElementById("supportModal");
const supportOverlay = document.getElementById("supportOverlay");
const faqModal = document.getElementById("faqModal");
const notificationsOverlay = document.getElementById("notificationsOverlay");
const notificationsModal = document.getElementById("notificationsModal");
const allNotificationsModal = document.getElementById("allNotificationsModal");
const personalNotificationsModal = document.getElementById(
  "personalNotificationsModal"
);

function openAccordionContent(element) {
  const accordionItem = element
    .closest(".bg-table-hover")
    .querySelector(".accordionItem");
  const icon = element.querySelector(".icon");

  // İconu döndür
  if (accordionItem.classList.contains("hidden")) {
    accordionItem.classList.remove("hidden");
    icon.classList.add("rotate-315"); // İconi döndür
  } else {
    accordionItem.classList.add("hidden");
    icon.classList.remove("rotate-315"); // İconi əvvəlki vəziyyətinə qaytar
  }
}

function openSupportModal() {
  supportModal.classList.toggle("hidden");
  supportOverlay.classList.toggle("hidden");
}

function closeSupportModal() {
  supportModal.classList.toggle("hidden");
  supportOverlay.classList.toggle("hidden");
}
window.sendOtp = async function (destination) {
  try {
    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    if (!csrfTokenMeta) {
      console.error("❌ CSRF meta tapılmadı");
      return;
    }
    const csrfToken = csrfTokenMeta.getAttribute("content");

    console.log("📡 Serverə OTP göndərilir...", destination);
    const res = await fetch("/auth/send-other-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ destination }),
    });

    const data = await res.json();
    console.log("📦 Server cavabı:", data);

    if (data.success) {
      console.log("✅ OTP göndərildi, page reload olacaq");
      window.location.reload(); // reload
    } else {
      console.warn("⚠️ Xəta:", data.message);
      alert("Xəta: " + data.message);
    }
  } catch (err) {
    console.error("💥 Server error:", err);
  }
};


