"use strict";

function openFilterModal() {
  var modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className = "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";
  modal.innerHTML = "\n        <div class=\"w-[460px] p-6 bg-white rounded-2xl shadow-xl relative\">\n  <!-- Header -->\n  <div class=\"relative pb-3\">\n    <h2 class=\"text-lg font-semibold text-gray-900\">Filter</h2>\n    <span onclick=\"closeFilterModal()\" class=\"absolute top-0 right-0 text-2xl text-gray-400 hover:text-gray-600 cursor-pointer\">&times;</span>\n  </div>\n\n  <form class=\"flex flex-col gap-4 text-sm\">\n    <!-- Date Range -->\n    <div>\n      <label class=\"block text-gray-600 mb-1\">Tarix aral\u0131\u011F\u0131</label>\n      <div class=\"flex gap-2\">\n        <div class=\"relative w-full\">\n          <input id=\"startDate\" type=\"date\" class=\"w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary\" />\n            <span class=\"absolute top-2.5 right-3 text-[#9CA3AF]\">\n              <i class=\"fas fa-calendar-alt\"></i>\n            </span>\n        </div>\n        <div class=\"relative w-full\">\n          <input id=\"endDate\" type=\"date\" class=\"w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary\" />\n            <span class=\"absolute top-2.5 right-3 text-[#9CA3AF]\">\n              <i class=\"fas fa-calendar-alt\"></i>\n            </span>\n        </div>\n      </div>\n      <p class=\"text-xs text-gray-400 mt-1 flex gap-2 items-center\">\n        <span>\u2139\uFE0F</span>\n        <span>Ba\u015Flan\u011F\u0131c v\u0259 son tarixi qeyd edin</span>\n      </p>\n    </div>\n\n    <!-- Company Select -->\n    <div>\n      <label class=\"block text-gray-600 mb-1\">\u015Eirk\u0259t</label>\n      <select  onclick=\"clearFilters()\" class=\"w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary\">\n        <option selected disabled >Se\xE7im edin</option>\n        <option>\u015Eirk\u0259t A</option>\n        <option>\u015Eirk\u0259t B</option>\n      </select>\n    </div>\n\n    <!-- Status -->\n    <div>\n      <label class=\"block text-gray-600 mb-1\">Status</label>\n      <div class=\"flex gap-6\">\n        <label class=\"flex items-center gap-2\">\n          <input id=\"newCheckbox\" type=\"checkbox\" class=\"w-4 h-4 rounded border-gray-300 text-primary focus:ring-0 focus:outline-none\">\n          <span class=\"text-gray-700\">G\xF6zl\u0259yir</span>\n        </label>\n        <label class=\"flex items-center gap-2\">\n          <input id=\"readCheckbox\" type=\"checkbox\" class=\"w-4 h-4 rounded border-gray-300 text-primary focus:ring-0 focus:outline-none\">\n          <span class=\"text-gray-700\">Tamamland\u0131</span>\n        </label>\n      </div>\n    </div>\n\n    <!-- Range Slider -->\n    <div>\n      <div class=\"flex justify-between text-sm text-gray-800 mb-1\">\n        <span>12.345.00 \u20BC</span>\n        <span>245.500.00 \u20BC</span>\n      </div>\n      \n      <input type=\"range\" min=\"12345\" max=\"245500\" class=\"w-full range-slider\" />\n      <div class=\"flex justify-between text-xs text-gray-500 mt-1\">\n        <span>Min</span>\n        <span>Max</span>\n      </div>\n    </div>\n\n    <!-- Buttons -->\n    <div class=\"flex justify-end gap-2 pt-2\">\n      <button type=\"button\" onclick=\"closeFilterModal()\" class=\"px-4 py-2 cursor-pointer text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200\">Ba\u011Fla</button>\n      <button type=\"button\" onclick=\"clearFilters()\" class=\"px-4 py-2 cursor-pointer text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200\">Filterl\u0259ri t\u0259mizl\u0259</button>\n      <button type=\"submit\" class=\"px-4 py-2 cursor-pointer text-sm rounded-full bg-primary-dark text-white hover:bg-primary\">Filterl\u0259</button>\n    </div>\n  </form>\n\n  <!-- Slider WebKit Style -->\n  \n</div>\n\n    ";
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeFilterModal();
    }
  });
  document.body.appendChild(modal);
}

var slider = document.getElementById("rangeSlider");
var rangeTrack = document.getElementById("rangeTrack");

function updateRange() {
  var value = slider.value / slider.max * 100;
  rangeTrack.style.width = value + "%";
}

slider.addEventListener("input", updateRange);
updateRange();