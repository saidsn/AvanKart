"use strict";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + " ₼";
}

var isDraggingSlider = false;

function openFilterModal() {
  var modal = document.createElement("div");
  modal.id = "filterModal";
  modal.className = "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";
  modal.innerHTML = "\n          <div class=\"bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative\">\n            <div class=\"relative flex flex-col gap-1 pb-3\">\n              <h2 class=\"text-base font-medium text-messages dark:text-primary-text-color-dark\">Filter</h2>\n              <img src=\"/public/images/Avankart/prize/close.svg\" alt=\"Close Modal\" \n                    onclick=\"closeFilterModal()\" class=\"absolute top-0 right-0 cursor-pointer text-sm\">\n            </div>\n            <form class=\"flex flex-col gap-3\">\n                  <form action=\"#\" method=\"post\">\n                       <div class=\"relative\">\n                         <button\n                          id=\"dropdownDefaultButton3\"\n                          data-dropdown-toggle=\"dropdown3\"\n                          class=\"cursor-pointer font-normal font-poppins rounded-2xl text-[12px] px-5 py-2.5 text-center flex items-center justify-between border border-[#0000001A] w-full h-[34px] hover:bg-container-2\"\n                          type=\"button\"\n                        >\n                          Se\xE7im edin\n                          <div>\n                            <img\n                              src=\"/public/images/Avankart/Sirket/chevron-down.svg\"\n                              alt=\"\"\n                              class=\"w-[15px] h-[13px]\"\n                            />\n                          </div>\n                        </button>\n\n                        <div\n                          id=\"dropdown3\" class=\"absolute z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-[402px] dark:bg-gray-700 mt-1\"\n                        >\n                          <ul\n                            class=\"text-sm w-full h-full font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white\"\n                          >\n                            <li\n                              class=\"w-full cursor-pointer\"\n                              data-value=\"Avankart MMC\"\n                            >\n                              <div\n                                class=\"flex items-center pl-[16px] pt-[7.5px] pb-[1.5px]\"\n                              >\n                                <input\n                                  id=\"vue-checkbox\"\n                                  type=\"checkbox\"\n                                  value=\"\"\n                                  class=\"rounded-[2px] w-[14px] h-[14px] border-[1px] border-surface-variant text-primary focus:outline-none focus:ring-0 focus:shadow-none hover:bg-surface-container-low disabled:bg-switch\"\n                                />\n                                <label\n                                  for=\"vue-checkbox\"\n                                  class=\"w-full ml-[6px] !pb-[2px] text-[13px] font-medium text-messages dark:text-gray-300\"\n                                  >Avankart MMC</label\n                                >\n                              </div>\n                            </li>\n                            <li\n                              class=\"w-full cursor-pointer\"\n                              data-value=\"Avankart MMC\"\n                            >\n                              <div\n                                class=\"flex items-center pl-[16px] pt-[7.5px] pb-[1.5px]\"\n                              >\n                                <input\n                                  id=\"vue-checkbox\"\n                                  type=\"checkbox\"\n                                  value=\"\"\n                                  class=\"rounded-[2px] w-[14px] h-[14px] border-[1px] border-surface-variant text-primary focus:outline-none focus:ring-0 focus:shadow-none hover:bg-surface-container-low disabled:bg-switch\"\n                                />\n                                <label\n                                  for=\"vue-checkbox\"\n                                  class=\"w-full ml-[6px] !pb-[2px] text-[13px] font-medium text-messages dark:text-gray-300\"\n                                  >Avankart MMC</label\n                                >\n                              </div>\n                            </li>\n                            <li\n                              class=\"w-full cursor-pointer\"\n                              data-value=\"Avankart MMC\"\n                            >\n                              <div\n                                class=\"flex items-center pl-[16px] pt-[7.5px] pb-[1.5px]\"\n                              >\n                                <input\n                                  id=\"vue-checkbox\"\n                                  type=\"checkbox\"\n                                  value=\"\"\n                                  class=\"rounded-[2px] w-[14px] h-[14px] border-[1px] border-surface-variant text-primary focus:outline-none focus:ring-0 focus:shadow-none hover:bg-surface-container-low disabled:bg-switch\"\n                                />\n                                <label\n                                  for=\"vue-checkbox\"\n                                  class=\"w-full ml-[6px] !pb-[2px] text-[13px] font-medium text-messages dark:text-gray-300\"\n                                  >Avankart MMC</label\n                                >\n                              </div>\n                            </li>\n                            <li\n                              class=\"w-full cursor-pointer\"\n                              data-value=\"Avankart MMC\"\n                            >\n                              <div\n                                class=\"flex items-center pl-[16px] pt-[7.5px] pb-[1.5px]\"\n                              >\n                                <input\n                                  id=\"vue-checkbox\"\n                                  type=\"checkbox\"\n                                  value=\"\"\n                                  class=\"rounded-[2px] w-[14px] h-[14px] border-[1px] border-surface-variant text-primary focus:outline-none focus:ring-0 focus:shadow-none hover:bg-surface-container-low disabled:bg-switch\"\n                                />\n                                <label\n                                  for=\"vue-checkbox\"\n                                  class=\"w-full ml-[6px] !pb-[2px] text-[13px] font-medium text-messages dark:text-gray-300\"\n                                  >Avankart MMC</label\n                                >\n                              </div>\n                            </li>\n                            <li\n                              class=\"w-full cursor-pointer\"\n                              data-value=\"Avankart MMC\"\n                            >\n                              <div\n                                class=\"flex items-center pl-[16px] pt-[7.5px] pb-[1.5px]\"\n                              >\n                                <input\n                                  id=\"vue-checkbox\"\n                                  type=\"checkbox\"\n                                  value=\"\"\n                                  class=\"rounded-[2px] w-[14px] h-[14px] border-[1px] border-surface-variant text-primary focus:outline-none focus:ring-0 focus:shadow-none hover:bg-surface-container-low disabled:bg-switch\"\n                                />\n                                <label\n                                  for=\"vue-checkbox\"\n                                  class=\"w-full ml-[6px] !pb-[2px] text-[13px] font-medium text-messages dark:text-gray-300\"\n                                  >Avankart MMC</label\n                                >\n                              </div>\n                            </li>\n                          </ul>\n\n                          <select name=\"user\" id=\"realSelect\" class=\"hidden\">\n                            <option value=\"\">Se\xE7im edin</option>\n                            <option value=\"Avankart MMC\">Avankart MMC</option>\n                            <option value=\"Avankart MMC\">Avankart MMC</option>\n                            <option value=\"Avankart MMC\">Avankart MMC</option>\n                            <option value=\"Avankart MMC\">Avankart MMC</option>\n                            <option value=\"Avankart MMC\">Avankart MMC</option>\n                          </select>\n                        </div>\n                       </div>\n                      </form>\n             <!-- Tarix Aral\u0131\u011F\u0131 -->\n              <div class=\"flex flex-col gap-[6px]\">\n                  <p class=\"text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-medium\">Tarix aral\u0131\u011F\u0131</p>\n                  <div class=\"flex gap-3\">\n                      \n                      <!-- Ba\u015Flan\u011F\u0131c Tarixi -->\n                      <div class=\"flex-1 flex flex-col gap-[6px]\">\n                      <div class=\"relative w-full\">\n                          <input id=\"startDate\"\n                          class=\"custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none\"\n                          type=\"date\" placeholder=\"dd/mm/yyyy\">\n                          <div onclick=\"openDatePicker('startDate')\"\n                          class=\"cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark\"></div>\n                      </div>\n                      <div class=\"text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1\">\n                          <div class=\"icon stratis-information-circle-contained\"></div>\n                          <span>Ba\u015Flan\u011F\u0131c tarixini qeyd edin</span>\n                      </div>\n                      </div>\n  \n                      <!-- Son Tarix -->\n                      <div class=\"flex-1 flex flex-col gap-[6px]\">\n                      <div class=\"relative w-full\">\n                          <input id=\"endDate\"\n                          class=\"custom-date cursor-pointer text-[13px] font-normal placeholder-[#BFC8CC] dark:placeholder-[#636B6F] bg-menu dark:bg-menu-dark hover:bg-input-hover dark:hover:bg-input-hover-dark focus:border-focus dark:focus:border-focus-color-dark focus:ring-0 focus:shadow focus:shadow-[#7450864D] w-full rounded-full border border-stroke dark:border-[#FFFFFF1A] px-3 py-[6.5px] group appearance-none\"\n                          type=\"date\" placeholder=\"dd/mm/yyyy\">\n                          <div onclick=\"openDatePicker('endDate')\"\n                          class=\"cursor-pointer text-messages dark:text-primary-text-color-dark icon stratis-calendar-02 absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus:text-focus dark:group-focus:text-focus-color-dark\"></div>\n                      </div>\n                      <div class=\"text-[11px] text-tertiary-text dark:text-tertiary-text-color-dark font-normal flex items-center gap-1\">\n                          <div class=\"icon stratis-information-circle-contained\"></div>\n                          <span>Son tarixi qeyd edin</span>\n                      </div>\n                      </div>\n  \n                  </div>\n              </div>\n            \n              <!-- M\u0259bl\u0259\u011F Aral\u0131\u011F\u0131 -->\n              <div class=\"flex flex-col gap-1\">\n                <div class=\"slider-container\">\n                    <div class=\"value-container\">\n                      <span id=\"min-value\" class=\"value-label text-[15px] text-messages font-medium\"></span>\n                      <span id=\"max-value\" class=\"value-label text-[15px] text-messages font-medium\"></span>\n                    </div>\n                    <div id=\"slider-range\"></div>\n                  </div>\n                <div class=\"flex items-center justify-between text-[11px] opacity-50 font-medium\">\n                    <span>Min</span>\n                    <span>Max</span>\n                </div>\n              </div>\n              <div class=\"flex justify-end gap-2 mt-4\">\n                <button type=\"button\" class=\"text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer\" onclick=\"closeFilterModal()\">Ba\u011Fla</button>\n                <button onclick=\"clearFilters()\" type=\"button\" class=\"text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer\">Filterl\u0259ri t\u0259mizl\u0259</button>\n                <button type=\"submit\" class=\"text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer\">Filterl\u0259</button>\n              </div>\n            </form>\n          </div>\n        ";
  modal.addEventListener("click", function (event) {
    if (event.target === modal && !isDraggingSlider) {
      closeFilterModal();
    }
  });
  document.body.appendChild(modal);
  setTimeout(function () {
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 300000,
      values: [12345, 245500],
      start: function start() {
        isDraggingSlider = true;
      },
      stop: function stop() {
        setTimeout(function () {
          isDraggingSlider = false;
        }, 50);
      },
      slide: function slide(event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      }
    });
    $("#min-value").text(formatCurrency($("#slider-range").slider("values", 0)));
    $("#max-value").text(formatCurrency($("#slider-range").slider("values", 1)));
  }, 0);
}

function closeFilterModal() {
  var modal = document.getElementById("filterModal");

  if (modal) {
    modal.remove();
  }
}

function openDatePicker(id) {
  var input = document.getElementById(id);

  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus();
  }
}

function clearFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  var checkboxes = document.querySelectorAll('#filterModal input[type="checkbox"]');
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change"));
  });
  $("#slider-range").slider("values", [12345, 245500]);
  $("#min-value").text(formatCurrency(12345));
  $("#max-value").text(formatCurrency(245500));
}

document.addEventListener("click", function (event) {
  var button = document.getElementById("dropdownDefaultButton3");
  var dropdown = document.getElementById("dropdown3");

  if (button && dropdown) {
    if (button.contains(event.target)) {
      dropdown.classList.toggle("hidden");
    } else if (!dropdown.contains(event.target)) {
      dropdown.classList.add("hidden");
    }
  }
});