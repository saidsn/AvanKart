document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".lang-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        // Hamısından aktivlik sil
        b.classList.remove(
          "active",
          "text-messages",
          "bg-inverse-on-surface",
          "cursor-default"
        );
        // Passivləri geri qaytar
        if (!b.classList.contains("text-tertiary-text")) {
          b.classList.add("text-tertiary-text");
        }
        // Bütün passivlərdə pointer olsun
        b.classList.add("cursor-pointer");
      });

      // Seçilənə tətbiq et
      btn.classList.add(
        "active",
        "text-messages",
        "bg-inverse-on-surface",
        "cursor-default"
      );
      btn.classList.remove("text-tertiary-text", "cursor-pointer"); // aktivdən pointer və tertiary sil
    });
  });
});

//! Text formatlama funksiyası
function formatText(command) {
  document.execCommand(command, false, null);
}