document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");

  sidebar.addEventListener("click", (e) => {
    const target = e.target.closest("a, button");
    if (!target || !sidebar.contains(target)) return;

    // Əgər bu elementin submenu-su varsa
    const submenu = target.parentElement.querySelector("ul");
    const hasSubmenu = submenu && submenu.classList.contains("flex");

    if (hasSubmenu) {
      e.preventDefault(); // Əgər <a href="#"> varsa
      submenu.classList.toggle("hidden");

      // Icon rotate
      const icon = target.querySelector(".icon");
      if (icon) icon.classList.toggle("rotate-90");

      return; // Alt menyu varsa, leaf seçimi etmə
    }

    // Əgər submenu yoxdursa, leaf node-dursa — Stil əlavə et
    const allActive = sidebar.querySelectorAll(".active");
    allActive.forEach((el) => {
      el.classList.remove(
        "active",
        "bg-sidebar-item",
        "dark:bg-side-bar-item-dark",
        "text-messages",
        "dark:text-primary-text-color-dark",
        "border-[.5px]",
        "border-stroke",
        "dark:border-[#FFFFFF1A]"
      );
    });

    target.classList.add(
      "active",
      "bg-sidebar-item",
      "dark:bg-side-bar-item-dark",
      "text-messages",
      "dark:text-primary-text-color-dark",
      "border-[.5px]",
      "border-stroke",
      "dark:border-[#FFFFFF1A]"
    );
  });
});
