function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

document.getElementById("sidebarToggle").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  const header = document.getElementById("mainHeader");
  const main = document.getElementById("mainContent");
  const logoContainer = document.getElementById("logoContainer");
  const sidebarIcon = document.getElementById("sidebarIcon");
  const versionText = document.getElementById("versionText");
  const logoExpanded = document.getElementById("logoExpanded");
  const logoCollapsed = document.getElementById("logoCollapsed");
  const versionLabel = document.getElementById("versionLabel");

  const menuTexts = sidebar.querySelectorAll(".menu-text");
  const rightArrows = sidebar.querySelectorAll(
    ".icon.stratis-chevron-right, .icon.stratis-chevron-right-up, .icon.stratis-chevron-right-down, span[id$='Icon']"
  );
  const arrows = document.querySelectorAll(".sidebar-arrow");
  const notfCount = document.querySelector(".notfCount");
  const submenus = sidebar.querySelectorAll("ul ul");

  const isExpanded = sidebar.classList.contains("w-[242px]");

  if (isExpanded) {
    // COLLAPSE
    sidebar.classList.remove("w-[242px]");
    sidebar.classList.add("w-[74px]");
    header.classList.replace("left-[242px]", "left-[74px]");
    main.classList.replace("ml-[242px]", "ml-[74px]");

    logoExpanded.classList.add("hidden");
    logoCollapsed.classList.remove("hidden");
    logoContainer.classList.add("scale-90");

    sidebarIcon.classList.remove("stratis-arrow-curve-left-up");
    sidebarIcon.classList.add("stratis-arrow-curve-right-up");

    menuTexts.forEach((text) => text.classList.add("hidden"));
    rightArrows.forEach((arrow) => arrow.classList.add("hidden"));
    arrows.forEach((arrow) => arrow.classList.add("hidden"));
    versionLabel.classList.add("hidden");
    notfCount?.classList.add("hidden");
    submenus.forEach((submenu) => submenu.classList.add("hidden"));

    setCookie("sidebarState", "collapsed", 7);
  } else {
    // EXPAND
    sidebar.classList.remove("w-[74px]");
    sidebar.classList.add("w-[242px]");
    header.classList.replace("left-[74px]", "left-[242px]");
    main.classList.replace("ml-[74px]", "ml-[242px]");

    logoExpanded.classList.remove("hidden");
    logoCollapsed.classList.add("hidden");
    logoContainer.classList.remove("scale-90");

    sidebarIcon.classList.remove("stratis-arrow-curve-right-up");
    sidebarIcon.classList.add("stratis-arrow-curve-left-up");

    menuTexts.forEach((text) => text.classList.remove("hidden"));
    rightArrows.forEach((arrow) => arrow.classList.remove("hidden"));
    arrows.forEach((arrow) => arrow.classList.remove("hidden"));
    versionLabel.classList.remove("hidden");
    notfCount?.classList.remove("hidden");

    setCookie("sidebarState", "expanded", 7);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const state = getCookie("sidebarState");
  if (state === "collapsed") {
    document.getElementById("sidebarToggle").click();
  }
});

const submenuToggles = document.querySelectorAll("#sidebar button, #sidebar a");

submenuToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    const sidebar = document.getElementById("sidebar");
    const isCollapsed = sidebar.classList.contains("w-[74px]");
    const hasSubmenu =
      toggle.nextElementSibling && toggle.nextElementSibling.tagName === "UL";

    if (isCollapsed && hasSubmenu) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
});
