document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".notification-type");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // bütün tablardan "active" və style class-ları sil
      tabs.forEach((t) =>
        t.classList.remove(
          "active",
          "bg-inverse-on-surface",
          "dark:bg-surface-variant-dark",
          "text-messages",
          "dark:text-primary-text-color-dark"
        )
      );

      // kliklənən taba əlavə et
      this.classList.add(
        "active",
        "bg-inverse-on-surface",
        "dark:bg-surface-variant-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );

      // bütün content-ləri gizlət
      contents.forEach((c) => c.classList.add("hidden"));

      // uyğun content-i göstər
      if (this.id === "corporateNotifications") {
        document.getElementById("corporateContent").classList.remove("hidden");
      } else if (this.id === "personalNotifications") {
        document.getElementById("personalContent").classList.remove("hidden");
      }
    });
  });
});
