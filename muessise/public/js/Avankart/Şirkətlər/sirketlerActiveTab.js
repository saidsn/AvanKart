document.addEventListener("DOMContentLoaded", function () {
  // Notification type buttons (e.g., İstifadəçilər / Səlahiyyət qrupları / Vəzifələr)
  const notificationButtons = document.querySelectorAll(".notification-type");

  notificationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Əgər artıq aktivdirsə, heç nə etmə
      if (this.classList.contains("active")) return;

      notificationButtons.forEach((btn) => {
        btn.classList.remove(
          "active",
          "bg-inverse-on-surface",
          "text-messages",
          "cursor-default"
        );
        btn.classList.add("text-tertiary-text", "cursor-pointer");
      });

      this.classList.add(
        "active",
        "bg-inverse-on-surface",
        "text-messages",
        "cursor-default"
      );
      this.classList.remove("text-tertiary-text", "cursor-pointer");
    });
  });
});
