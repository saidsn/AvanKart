document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".inline-flex button");
  const tabContents = document.querySelectorAll(".tab-content");
  const sideContents = document.querySelectorAll(".side-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");

      // Tab düymələri
      tabButtons.forEach((b) => {
        b.classList.remove(
          "active",
          "text-messages",
          "bg-inverse-on-surface",
          "dark:bg-surface-variant-dark"
        );
        b.classList.add(
          "text-tertiary-text",
          "dark:text-tertiary-text-color-dark",
          "cursor-pointer"
        );
      });

      btn.classList.add(
        "active",
        "text-messages",
        "bg-inverse-on-surface",
        "dark:bg-surface-variant-dark"
      );
      btn.classList.remove(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark",
        "cursor-pointer"
      );

      // Sol content
      tabContents.forEach((content) => {
        content.classList.toggle("block", content.id === target);
        content.classList.toggle("hidden", content.id !== target);
      });

      // Sağ content
      sideContents.forEach((side) => {
        side.classList.toggle("block", side.id === `${target}-side`);
        side.classList.toggle("hidden", side.id !== `${target}-side`);
      });
    });
  });
});