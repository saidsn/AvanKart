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
