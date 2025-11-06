"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// const filterModal = () => {
//   return `
//     <div class="fixed inset-0  bg-opacity-30 flex items-center  z-50" id="filter-modal">
//       <div class="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
//         <div class="flex justify-between items-center mb-4">
//           <h2 class=" font-semibold text-tertiary-text">Filter</h2>
//           <button onclick="closeFilterModal()" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
//         </div>
//         <div class="mb-4">
//           <label class="block mb-1 text-tertiary-text">Müəssisə</label>
//           <select class="w-full p-2 border border-gray-300 rounded-md">
//             <option>Seçim edin</option>
//           </select>
//         </div>
//         <div class="mb-4">
//           <label class="block mb-1 text-tertiary-text">Tarix aralığı</label>
//           <div class="flex gap-2">
//             <input type="date" class="w-1/2 p-2 border border-gray-300 rounded-md" />
//             <input type="date" class="w-1/2 p-2 border border-gray-300 rounded-md" />
//           </div>
//         </div>
//         <div class="mb-6">
//           <label class="block mb-2 text-tertiary-text">Məbləğ aralığı</label>
//           <div class="flex justify-between text-sm text-tertiary-text mb-1">
//             <span>12.345.00 ₼</span>
//             <span>245.500.00 ₼</span>
//           </div>
//           <input type="range" min="12345" max="245500" class="w-full accent-primary" />
//         </div>
//         <div class="flex justify-between gap-2">
//           <button onclick="closeFilterModal()" class="w-full py-2 rounded-lg bg-gray-100 text-tertiary-text">Bağla</button>
//           <button class="w-full py-2 rounded-lg bg-gray-100 text-tertiary-text">Filterləri təmizlə</button>
//           <button class="w-full py-2 rounded-lg bg-primary text-white">Filterlə</button>
//         </div>
//       </div>
//     </div>
//   `;
// };
// function showFilterModal() {
//   document.getElementById("modal-container").innerHTML = filterModal();
// }
// function closeFilterModal() {
//   document.getElementById("modal-container").innerHTML = "";
// }
var accountActionModal = function accountActionModal() {
  return "\n  <div style=\"width:250px; \"\n       class=\"absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-2 text-sm overflow-y-auto\">\n    <ul class=\"text-tertiary-text space-y-1\">\n    \n      <li class=\"flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-messages\">\n        <div class=\"icon stratis-password-01 w-[14px] h-[14px]\"></div>\n        <span>\u015Eifr\u0259ni s\u0131f\u0131rla</span>\n      </li>\n\n      <li onclick=\"openEmailChangeModal()\" class=\"flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-messages\">\n        <div class=\"icon stratis-mail-01 w-[14px] h-[14px]\"></div>\n        <span>Mail adresini d\u0259yi\u015F</span>\n      </li>\n\n      <li onclick=\"openDeactivateModal()\" class=\"flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500\">\n        <div class=\"icon stratis-minus-circle-contained w-[14px] h-[14px]\"></div>\n        <span  >Deaktiv et</span>\n      </li>\n\n      <li onclick=\"openDeleteRequestModal()\" class=\"flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer border-t pt-2 text-red-500 \">\n        <div class=\"icon stratis-trash-01 w-[14px] h-[14px]\"></div>\n        <span>Silinm\u0259 \xFC\xE7\xFCn m\xFCraci\u0259t et</span>\n      </li>\n\n    </ul>\n  </div>\n";
};

function toggleAccountMenu() {
  var container = document.getElementById("account-menu-container");

  if (container.innerHTML.trim() === "") {
    container.innerHTML = accountActionModal();
  } else {
    container.innerHTML = "";
  }
}

var deactivateModal = function deactivateModal() {
  return "\n    <div id=\"deactivateModalOverlay\" class=\"fixed inset-0  bg-opacity-30 flex items-center justify-center z-50\">\n      <div class=\"bg-white rounded-2xl shadow-lg w-[380px] p-6 space-y-4\">\n        <div class=\"flex items-center gap-3\">\n          <div class=\"w-10 h-10 bg-error-hover rounded-full flex items-center justify-center\">\n            <div class=\"icon stratis-minus-circle-contained text-error w-[20px] h-[20px]\"></div>\n          </div>\n          <h2 class=\"text-lg font-semibold text-tertiary-text\">Deaktiv et</h2>\n        </div>\n        <p class=\"text-sm text-gray-600\">\n          \u0130stifad\u0259\xE7ini deaktiv etm\u0259k ist\u0259diyiniz\u0259 \u0259minsiniz?\n        </p>\n        <div onclick=\"closeDeactivateModal()\" class=\"flex justify-end gap-3 pt-2\">\n          <button  class=\"px-4 py-1.5 bg-gray-100 text-sm rounded-lg text-tertiary-text hover:bg-gray-200\">\n            Xeyr\n          </button>\n          <button onclick=\"Otp()\" class=\"px-4 py-1.5 bg-error text-white text-sm rounded-lg \">\n            B\u0259li, sil\n          </button>\n        </div>\n      </div>\n    </div>\n  ";
};

function openDeactivateModal() {
  var container = document.getElementById("modal-container");
  container.innerHTML = deactivateModal();
}

function closeDeactivateModal() {
  var container = document.getElementById("modal-container");
  container.innerHTML = "";
}

var emailChangeModal = function emailChangeModal() {
  return "\n    <div id=\"email-change-modal\" class=\"fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30\">\n      <div class=\"bg-white rounded-lg p-6 w-[450px] shadow-lg relative\">\n        <button onclick=\"closeEmailChangeModal()\" class=\"absolute top-4 right-4 text-gray-500 hover:text-gray-700\">&times;</button>\n        <h2 class=\"text-base font-semibold mb-4\">Mail adresini d\u0259yi\u015F</h2>\n        <label class=\"block text-sm text-gray-600 mb-1\" for=\"email\">Email</label>\n        <input id=\"new-email\" type=\"email\" placeholder=\"Yeni email adresini daxil edin\"\n               class=\"w-full border border-gray-300 rounded-full px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:text-primary\" />\n        <div class=\"flex justify-end gap-2\">\n          <button onclick=\"closeEmailChangeModal()\" class=\"px-4 py-2 rounded-full text-sm bg-gray-100 hover:bg-gray-200\">L\u0259\u011Fv et</button>\n          <button onclick=\"Otp()\" class=\"px-4 py-2 rounded-full text-sm bg-primary text-white hover:bg-primary-dark\">D\u0259yi\u015Fikliyi t\u0259sdiql\u0259</button>\n        </div>\n      </div>\n    </div>\n  ";
};

function openEmailChangeModal() {
  var modal = document.createElement("div");
  modal.innerHTML = emailChangeModal();
  document.body.appendChild(modal);
}

function closeEmailChangeModal() {
  var modal = document.getElementById("email-change-modal");

  if (modal) {
    modal.remove();
  }
}

function confirmEmailChange() {
  var email = document.getElementById("new-email").value;
  console.log("Yeni email:", email); // Burada email dəyişdirmə loqikasını əlavə edə bilərsiniz (API call və s.)

  closeEmailChangeModal();
}

var deleteRequestModal = function deleteRequestModal() {
  return "\n    <div id=\"delete-request-modal\" class=\"fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30\">\n      <div class=\"bg-white rounded-xl p-6 w-[450px] shadow-lg relative\">\n        <button onclick=\"closeDeleteRequestModal()\" class=\"absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg\">&times;</button>\n        \n        <h2 class=\"text-lg font-semibold text-center mb-2\">Silinm\u0259 m\xFCraci\u0259ti</h2>\n        <p class=\"text-sm text-gray-600 text-center mb-4\">\u0130stifad\u0259\xE7i m\u0259lumatlar\u0131n\u0131 a\u015Fa\u011F\u0131dan kontrol ed\u0259r\u0259k, silinm\u0259si \xFC\xE7\xFCn m\xFCraci\u0259t ed\u0259 bil\u0259rsiniz</p>\n\n        <div class=\"space-y-2   text-sm text-gray-700\">\n          <div class=\"flex pt-[12px] border-b-[.5px] border-stroke py-[9.5px] px-4 justify-between\"><span>\u0130stifad\u0259\xE7i:</span><span class=\"font-medium\">Ramin Orucov</span></div>\n          <div class=\"flex pt-[12px] border-b-[.5px] border-stroke py-[9.5px] px-4 justify-between\"><span>Cinsi:</span><span class=\"font-medium\">Ki\u015Fi</span></div>\n          <div class=\"flex pt-[12px] border-b-[.5px] border-stroke py-[9.5px] px-4 justify-between\"><span>Do\u011Fum tarixi:</span><span class=\"font-medium\">16.12.1997</span></div>\n          <div class=\"flex pt-[12px] border-b-[.5px] border-stroke py-[9.5px] px-4 justify-between\"><span>Mail:</span><span class=\"font-medium\">ramin.orucov@gmail.com</span></div>\n          <div class=\"flex pt-[12px] border-b-[.5px] border-stroke py-[9.5px] px-4 justify-between\"><span>Telefon:</span><span class=\"font-medium\">+994 50 770 35 22</span></div>\n          <div class=\"flex pt-[12px] border-b-[.5px] border-stroke py-[9.5px] px-4 justify-between\"><span>M\xFC\u0259ssis\u0259 ad\u0131:</span><span class=\"font-medium\">\xD6zs\xFCt Restoran</span></div>\n          <div class=\"flex pt-[12px] border-b-[.5px] border-stroke py-[9.5px] px-4 justify-between\"><span>Silen \u015F\u0259xs:</span><span class=\"font-medium\">Ramin Orucov</span></div>\n        </div>\n\n        <div class=\"py-[9.5px] px-4\">\n          <label for=\"delete-reason\" class=\"block text-sm font-medium mb-1 border-stroke text-messages-dark\">Silinm\u0259 s\u0259b\u0259bi</label>\n          <textarea id=\"delete-reason\" rows=\"3\" maxlength=\"150\"\n            placeholder=\"Silinm\u0259 s\u0259b\u0259bini daxil edin\"\n            class=\"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:text-error resize-none\"></textarea>\n          <div class=\"text-right text-xs text-gray-400 mt-1\">max: 150</div>\n        </div>\n\n        <button   onclick=\"Otp()\" class=\"px-4 py-2 flex mt-[8px] mb-[8px] justify-center items-center rounded-full w-full text-sm bg-error text-white hover:bg-error-dark\">Silinm\u0259 \xFC\xE7\xFCn g\xF6nd\u0259r</button>\n        \n          <button  onclick=\"closeDeleteRequestModal()\" class=\" px-4 py-2 flex w-full justify-center items-center rounded-full text-sm bg-gray-100 hover:bg-gray-200\">L\u0259\u011Fv et</button>\n        \n      </div>\n    </div>\n  ";
};

function openDeleteRequestModal() {
  var modal = document.createElement("div");
  modal.innerHTML = deleteRequestModal();
  document.body.appendChild(modal);
}

function closeDeleteRequestModal() {
  var modal = document.getElementById("delete-request-modal");

  if (modal) {
    modal.remove();
  }
}

function Otp() {
  var modalHTML = "\n    <div class=\"fixed inset-0 bg-opacity-30 flex items-center justify-center z-100\" id=\"otp-modal\">\n      <div class=\"relative w-[450px] h-[399px] border-[#0000001A] border-[2px]\n        shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0\">\n\n        <h2 class=\"text-[15px] font-medium text-messages ml-[24px] mt-[26px]\">Yeni hesab</h2>\n\n        <div class=\"flex flex-col mb-[24px] pt-[20px] max-w-[400px] w-[100%] m-auto\">\n          <h2 class=\"pb-[4px] text-[17px] font-poppins font-semibold leading-[160%] text-messages\">OTP</h2>\n          <div class=\"flex flex-wrap gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100\">\n            <span class=\"font-medium\">ramin.orucovvv@gmail.com</span>\n            <span class=\"opacity-65 font-normal\">email adresin\u0259 g\xF6nd\u0259ril\u0259n 6 </span>\n            <span class=\"opacity-65 font-normal\">r\u0259q\u0259mli \u015Fifr\u0259ni daxil edin</span>\n          </div>\n        </div>\n\n        <form>\n          <div class=\"text-center space-y-4 max-w-[400px] w-[100%] m-auto\">\n            <div id=\"countdown\" class=\"text-messages bg-inverse-on-surface rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium leading--[160%] font-poppins\">\n              4:59\n            </div>\n\n            <div class=\"grid grid-cols-6 gap-2 mt-[8px]\">\n              ".concat(_toConsumableArray(Array(6)).map(function () {
    return "\n                <input type=\"text\" maxlength=\"1\" class=\"otp-input border-[1px] rounded-[8px] border-stroke border-opacity-[10%] pl-[12px]\n                placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus\n                focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none\n                active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]\n                transition-all ease-out duration-300\" />\n              ";
  }).join(""), "\n            </div>\n          </div>\n\n          <div class=\"text-center flex justify-center max-w-[400px] w-[100%] m-auto\">\n            <p class=\"font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]\">Email adresin\u0259 mesaj g\u0259lm\u0259di?</p>\n            <a href=\"#\" class=\"text-[12px] font-medium font-poppins text-messages px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none\">Yenid\u0259n g\xF6nd\u0259r</a>\n          </div>\n\n          <div class=\"absolute bottom-[24px] right-[12px] flex gap-[12px]\">\n            <button type=\"button\" class=\"text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[83px] !h-[34px]\">L\u0259\u011Fv et</button>\n            <button type=\"submit\" class=\"text-[13px] text-on-primary font-medium bg-primary rounded-[50px] !w-[91px] !h-[34px]\">T\u0259sdiql\u0259</button>\n          </div>\n        </form>\n      </div>\n    </div>\n  ");
  var container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
  startOtpTimer(); // 🕒 Timer işə salınır
}

function startOtpTimer() {
  var time = 4 * 60 + 59; // 4 dəqiqə 59 saniyə

  var countdownElement = document.getElementById("countdown");
  var timer = setInterval(function () {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;
    countdownElement.textContent = "".concat(minutes, ":").concat(seconds.toString().padStart(2, "0"));

    if (time <= 0) {
      clearInterval(timer);
      countdownElement.textContent = "0:00";
    }

    time--;
  }, 1000);
}