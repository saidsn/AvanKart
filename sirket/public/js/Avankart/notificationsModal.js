// const data = [
//   {
//     id: 1,
//     title: "Post Engineer LLC",
//     text: '"AA-210" nömrəli invoys yaradıldı',
//     time: "01.10.2024 - 09:45",
//     status: "unread",
//     isNew: true,
//     type: "company",
//   },
//   {
//     id: 2,
//     title: "Hesablaşma sənədi yaradıldı",
//     text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
//     time: "01.10.2024 - 09:45",
//     status: "unread",
//     isNew: true,
//     type: "default",
//   },
//   {
//     id: 3,
//     title: "Capital Finance LLC",
//     text: '"Ramin Orucov" adlı istifadəçi sistemə əlavə olundu',
//     time: "01.10.2024 - 09:45",
//     status: "read",
//     isNew: false,
//     type: "company",
//   },
//   {
//     id: 4,
//     title: "Hesablaşma",
//     text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
//     time: "01.10.2024 - 09:45",
//     status: "read",
//     isNew: false,
//     type: "default",
//   },
//   {
//     id: 5,
//     title: "Hesablaşma",
//     text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
//     time: "01.10.2024 - 09:45",
//     status: "read",
//     isNew: false,
//     type: "default",
//   },
//   {
//     id: 6,
//     title: "Hesablaşma",
//     text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
//     time: "01.10.2024 - 09:45",
//     status: "read",
//     isNew: false,
//     type: "default",
//   },
//   {
//     id: 7,
//     title: "Hesablaşma",
//     text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
//     time: "01.10.2024 - 09:45",
//     status: "read",
//     isNew: false,
//     type: "default",
//   },
//   {
//     id: 8,
//     title: "Hesablaşma",
//     text: "Avankart tərəfindən 15 günlük hesablaşma sənədi göndərildi",
//     time: "01.10.2024 - 09:45",
//     status: "read",
//     isNew: false,
//     type: "default",
//   },
// ];

const icons = {
  default: "/public/images/notifications/notificationLogo.svg",
  company: "/public/images/notifications/notificationLogo.svg",
};

document.addEventListener("click", function (e) {
  if (e.target.closest(".filterModal-button")) {
    e.preventDefault();
    const btn = e.target.closest(".filterModal-button");
    const tabType = btn.dataset.tab;

    document.querySelectorAll(".filterModal-button").forEach((b) => {
      b.classList.remove(
        "active",
        "text-messages",
        "border-messages",
        "dark:text-primary-text-color-dark",
        "dark:border-primary-text-color-dark"
      );
      b.classList.add("border-transparent");
    });

    btn.classList.add(
      "active",
      "text-messages",
      "border-messages",
      "dark:text-primary-text-color-dark",
      "dark:border-primary-text-color-dark"
    );
    btn.classList.remove("border-transparent");

    document.getElementById("notificationsModal").innerHTML =
      renderNotificationModal(tabType);
  }
});
