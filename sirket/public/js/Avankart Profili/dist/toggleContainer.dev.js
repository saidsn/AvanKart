"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var toggleContainer = document.getElementById("toggleContainer");
  var tabs = [{
    id: "avankart",
    label: "Avankart istifadəçiləri",
    href: "./AvankartProfili.html"
  }, {
    id: "vezifeler",
    label: "Vəzifələr",
    href: "./Vezifeler.html"
  }, {
    id: "selahiyyet",
    label: "Səlahiyyət qrupları",
    href: "./SelahiyyətQrupları.html"
  }, {
    id: "rekvizitler",
    label: "Avankart rekvizitləri",
    href: "./AvankartRekvizitleri.html"
  }, {
    id: "audit",
    label: "Audit",
    href: "./Audit.html"
  }];

  function renderTabs(activeId) {
    toggleContainer.innerHTML = "";
    tabs.forEach(function (tab) {
      var isActive = tab.id === activeId;
      toggleContainer.innerHTML += "\n        <a href=\"".concat(tab.href, "\" id=\"").concat(tab.id, "\"\n          class=\"px-2 py-[3px] rounded-full text-[12px] font-medium whitespace-nowrap ").concat(isActive ? "bg-inverse-on-surface text-messages opacity-100" : "text-messages opacity-50", "\">\n          ").concat(tab.label, "\n        </a>");
    });
  }

  function getActiveTabIdFromURL() {
    // Fayl adını əldə edirik (məsələn "SəlahiyyətQrupları.html")
    var currentFile = window.location.pathname.split("/").pop().toLowerCase(); // tabs massivindən uyğun href-i tapırıq

    var matchingTab = tabs.find(function (tab) {
      var tabFile = tab.href.replace("./", "").toLowerCase();
      return tabFile === currentFile;
    });
    return matchingTab ? matchingTab.id : "avankart"; // default fallback
  }

  var activeTabId = getActiveTabIdFromURL();
  renderTabs(activeTabId);
});