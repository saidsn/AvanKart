document.addEventListener("DOMContentLoaded", function () {
  const toggleContainer = document.getElementById("toggleContainer");

  const tabs = [
    {
      id: "avankart",
      label: "Avankart istifadəçiləri",
      href: "./AvankartProfili.html",
    },
    { id: "vezifeler", label: "Vəzifələr", href: "./Vezifeler.html" },
    {
      id: "selahiyyet",
      label: "Səlahiyyət qrupları",
      href: "./SelahiyyətQrupları.html",
    },
    {
      id: "rekvizitler",
      label: "Avankart rekvizitləri",
      href: "./AvankartRekvizitleri.html",
    },
    { id: "audit", label: "Audit", href: "./Audit.html" },
  ];

  function renderTabs(activeId) {
    toggleContainer.innerHTML = "";
    tabs.forEach((tab) => {
      const isActive = tab.id === activeId;
      toggleContainer.innerHTML += `
        <a href="${tab.href}" id="${tab.id}"
          class="px-2 py-[3px] rounded-full text-[12px] font-medium whitespace-nowrap ${
            isActive
              ? "bg-inverse-on-surface text-messages opacity-100"
              : "text-messages opacity-50"
          }">
          ${tab.label}
        </a>`;
    });
  }

  function getActiveTabIdFromURL() {
    // Fayl adını əldə edirik (məsələn "SəlahiyyətQrupları.html")
    const currentFile = window.location.pathname.split("/").pop().toLowerCase();

    // tabs massivindən uyğun href-i tapırıq
    const matchingTab = tabs.find((tab) => {
      const tabFile = tab.href.replace("./", "").toLowerCase();
      return tabFile === currentFile;
    });

    return matchingTab ? matchingTab.id : "avankart"; // default fallback
  }

  const activeTabId = getActiveTabIdFromURL();
  renderTabs(activeTabId);
});
