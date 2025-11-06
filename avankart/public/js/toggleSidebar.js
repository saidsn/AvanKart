// 🍪 COOKIE FUNKSİYALARI
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
  }
  
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }
  
  // 📦 DOM tam yükləndikdən sonra işə salırıq
  window.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const header = document.getElementById("mainHeader");
    const main = document.getElementById("mainContent");
    const spans = document.querySelectorAll(".menu-text");
    const counters = document.querySelectorAll(".menu-count");
    const chevrons = document.querySelectorAll(".menu-chevron");
    const icon = document.getElementById("sidebarIcon");
    const logoLight = document.getElementById("logoLight");
    const logoDark = document.getElementById("logoDark");

    const versionText = document.getElementById("versionText");
  
    // FUNKSİYALAR
    const collapseSidebar = () => {
      sidebar.classList.replace("w-[242px]", "w-[74px]");
      header.classList.replace("left-[242px]", "left-[74px]");
      main.classList.replace("ml-[242px]", "ml-[74px]");
      
      spans.forEach(span => span.classList.add("hidden"));
      counters.forEach(counter => counter.classList.add("hidden"));
      chevrons.forEach(chevron => chevron.classList.add("hidden"));
  
      icon.classList.replace("stratis-arrow-curve-left-up", "stratis-arrow-curve-right-up");
  
      logoLight.src = "/images/error/logoLight.svg";
      logoDark.src = "/images/error/logoLight.svg";
      $('#emeliyyatlarSubmenu').addClass('hidden');
      $('#emeliyyatlarIconContainer').addClass('hidden');
      
      versionText.innerText = "1.0.0";
  
      setCookie("sidebar", "close", 7);
    }
  
    const expandSidebar = () => {
      sidebar.classList.replace("w-[74px]", "w-[242px]");
      header.classList.replace("left-[74px]", "left-[242px]");
      main.classList.replace("ml-[74px]", "ml-[242px]");
  
      spans.forEach(span => span.classList.remove("hidden"));
      counters.forEach(counter => counter.classList.remove("hidden"));
      chevrons.forEach(chevron => chevron.classList.remove("hidden"));
  
      icon.classList.replace("stratis-arrow-curve-right-up", "stratis-arrow-curve-left-up");
  
      logoLight.src = "/images/error/avankartLogo.svg";
      logoDark.src = "/images/error/avankartLogoDarkMode.svg";
      $('#emeliyyatlarIconContainer').removeClass('hidden');
      
      versionText.innerText = "Version 1.0.0";
  
      setCookie("sidebar", "open", 7);
    }
    // expose to other files
    window.collapseSidebar = collapseSidebar;   // <-- dışarı aç
    window.expandSidebar = expandSidebar;       // <-- dışarı aç
    // init
    const saved = getCookie("sidebar");
    saved === "close" ? collapseSidebar() : expandSidebar();

    sidebarToggle.addEventListener("click", () => {
      const current = getCookie("sidebar");
      current === "open" || current === null ? collapseSidebar() : expandSidebar();
    });
  });
  