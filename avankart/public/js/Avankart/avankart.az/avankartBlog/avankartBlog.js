function switchTab(tab) {
  const blogsTab = document.getElementById("blogsTab");
  const categoriesTab = document.getElementById("categoriesTab");

  // Sağ hissələr
  document.getElementById("blogsRight")?.classList.add("hidden");
  document.getElementById("categoriesRight")?.classList.add("hidden");

  // Content hissələri
  document.getElementById("blogsContent")?.classList.add("hidden");
  document.getElementById("categoriesContent")?.classList.add("hidden");

  // Reset (hər ikisini passiv et)
  [blogsTab, categoriesTab].forEach((btn) => {
    btn.classList.remove(
      "active",
      "bg-inverse-on-surface",
      "text-messages",
      "dark:bg-surface-variant-dark"
    );
    btn.classList.add(
      "text-tertiary-text",
      "cursor-pointer",
      "hover:text-messages"
    );
  });

  // Aktiv olanı işarələ və content göstər
  if (tab === "blogs") {
    blogsTab.classList.add(
      "active",
      "bg-inverse-on-surface",
      "text-messages",
      "dark:bg-surface-variant-dark"
    );
    blogsTab.classList.remove(
      "cursor-pointer",
      "hover:text-messages",
      "text-tertiary-text"
    );

    document.getElementById("blogsRight")?.classList.remove("hidden");
    document.getElementById("blogsContent")?.classList.remove("hidden");
  } else {
    categoriesTab.classList.add(
      "active",
      "bg-inverse-on-surface",
      "text-messages",
      "dark:bg-surface-variant-dark"
    );
    categoriesTab.classList.remove(
      "cursor-pointer",
      "hover:text-messages",
      "text-tertiary-text"
    );

    document.getElementById("categoriesRight")?.classList.remove("hidden");
    document.getElementById("categoriesContent")?.classList.remove("hidden");
  }
}

//! Text formatlama funksiyası
function formatText(command) {
  document.execCommand(command, false, null);
}

// Dropdown functions
window.toggleDropdown_language = function () {
  const dropdown = document.getElementById("dropdown_language");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

window.toggleDropdown_blogCategory = function () {
  const dropdown = document.getElementById("dropdown_blogCategory");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

// Bu funksiyalar dropdown menyuları xaricində hər hansı bir yerə basıldıqda bağlamaq üçündür
document.addEventListener("click", function (event) {
  const languageDropdown = document.getElementById("dropdown_language");
  const blogCategoryDropdown = document.getElementById("dropdown_blogCategory");
  const languageButton = document.getElementById(
    "dropdownDefaultButton_language"
  );
  const blogCategoryButton = document.getElementById(
    "dropdownDefaultButton_blogCategory"
  );

  if (
    !languageButton.contains(event.target) &&
    !languageDropdown.contains(event.target)
  ) {
    languageDropdown.classList.add("hidden");
    languageDropdown.classList.remove("visible");
  }

  if (
    !blogCategoryButton.contains(event.target) &&
    !blogCategoryDropdown.contains(event.target)
  ) {
    blogCategoryDropdown.classList.add("hidden");
    blogCategoryDropdown.classList.remove("visible");
  }
});

function selectLanguage(value) {
  document.getElementById("selected_language").innerText = value;
  document.getElementById("languageInput").value = value;
  document.getElementById("dropdown_language").classList.add("hidden");
}

function selectBlogCategory(title, id) {
  // If only one argument is passed (for backward compatibility)
  if (id === undefined) {
    id = title;
  }
  document.getElementById("selected_blogCategory").innerText = title;
  document.getElementById("blogCategoryInput").value = id;
  document.getElementById("dropdown_blogCategory").classList.add("hidden");
}

// Make it globally accessible
window.selectBlogCategory = selectBlogCategory;

// Contenteditable → textarea sync
document.querySelector("form").addEventListener("submit", function () {
  document.getElementById("blogContent").value =
    document.getElementById("editChoiceContent").innerHTML;
});
