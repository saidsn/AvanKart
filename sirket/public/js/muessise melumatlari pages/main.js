const selectedText = document.getElementById("selectedValue");
const selectedText2 = document.getElementById("selectedValue2");
const selectedText3 = document.getElementById("selectedValue3");
const selectedText4 = document.getElementById("selectedValue4");
const selectedText5 = document.getElementById("selectedValue5");
const selectedText6 = document.getElementById("selectedValue6");
const selectedText7 = document.getElementById("selectedValue7");
const selectedText8 = document.getElementById("selectedValue8");

const selectedText9 = document.getElementById("selectedValue9");

const realSelect = document.getElementById("realSelect");
const realSelect2 = document.getElementById("realSelect2");
const realSelect3 = document.getElementById("realSelect3");
const realSelect4 = document.getElementById("realSelect4");
const realSelect5 = document.getElementById("realSelect5");
const realSelect6 = document.getElementById("realSelect6");
const dropdown = document.getElementById("dropdown1");
const dropdown2 = document.getElementById("dropdown2");
const dropdown3 = document.getElementById("dropdown3");
const dropdown4 = document.getElementById("dropdown4");
const dropdown5 = document.getElementById("dropdown5");
const dropdown6 = document.getElementById("dropdown6");
const dropdown7 = document.getElementById("dropdown7");
const dropdown8 = document.getElementById("dropdown8");

const dropdown9 = document.getElementById("dropdown9");


document.querySelectorAll("#dropdown1 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText.textContent = value;

    for (let option of realSelect.options) {
      option.selected = option.value === value;
    }

    dropdown.classList.add("hidden");
  });
});

document.querySelectorAll("#dropdown2 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText2.textContent = value;

    for (let option of realSelect.options) {
      option.selected = option.value === value;
    }

    dropdown2.classList.add("hidden");
  });
});

document.querySelectorAll("#dropdown3 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText3.textContent = value;

    for (let option of realSelect.options) {
      option.selected = option.value === value;
    }

    dropdown3.classList.add("hidden");
  });
});

document.querySelectorAll("#dropdown4 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText4.textContent = value;

    for (let option of realSelect.options) {
      option.selected = option.value === value;
    }

    dropdown4.classList.add("hidden");
  });
});
document.querySelectorAll("#dropdown5 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText5.textContent = value;

    for (let option of realSelect.options) {
      option.selected = option.value === value;
    }

    dropdown5.classList.add("hidden");
  });
});
document.querySelectorAll("#dropdown6 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText6.textContent = value;

    for (let option of realSelect.options) {
      option.selected = option.value === value;
    }

    dropdown6.classList.add("hidden");
  });
});

document.querySelectorAll("#dropdown7 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText7.textContent = this.textContent;
    for (let option of realSelect.options) {
      option.selected = option.value === value;
    }
    dropdown7.classList.add("hidden");
  });
});
document.querySelectorAll("#dropdown8 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    const value = this.dataset.value;
    selectedText8.textContent = this.textContent;

    for (let option of realSelect.options) {
      option.selected = option.value === value;
    };
    dropdown8.classList.add("hidden")
  });
});

document.querySelectorAll("#dropdown9 a").forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const value = this.dataset.value;
    selectedText9.textContent = this.textContent;
    for (let option of realSelect.options) {
      option.selected = option.value === value;
    };

    dropdown9.classList.add("hidden")
  });
});



let HesabElaveEtPopUp = document.querySelector("#HesabElaveEtPopUp");
let HesabEditEtPopUp = document.querySelector("#HesabEditEtPopUp");
let RedakteEtPopUp = document.querySelector("#RedakteEtPopUp");
let deletePopUp = document.querySelector("#deletePopUp");
let overlay = document.querySelector("#overlay");
let toggleclick = false;
let toggleclick2 = false;
let toggleclick3 = false;

function openHesabElaveEt() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    HesabElaveEtPopUp.style.display = "block";
    overlay.style.display = "block";
  } else {
    HesabElaveEtPopUp.style.display = "none";
    overlay.style.display = "none";
  }
}

function openHesabEditEt() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    HesabEditEtPopUp.style.display = "block";
    overlay.style.display = "block";
  } else {
    HesabEditEtPopUp.style.display = "none";
    overlay.style.display = "none";
  }
}

function clickRedakteEt() {
  toggleclick2 = !toggleclick2;
  if (toggleclick2) {
    RedakteEtPopUp.style.display = "block";
    overlay.style.display = "block";
  } else {
    RedakteEtPopUp.style.display = "none";
    overlay.style.display = "none";
  }
}

function deleteUser() {
  toggleclick3 = !toggleclick3;
  ('Toggle click3:', toggleclick3);

  if (toggleclick3) {
    deletePopUp.style.display = "block";
    overlay.style.display = "block";
  } else {
    deletePopUp.style.display = "none";
    overlay.style.display = "none";
  }
}

window.openHesabElaveEt = function () {
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("HesabElaveEtPopUp").classList.remove("hidden");
};

window.closeHesabElaveEt = function () {
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("HesabElaveEtPopUp").classList.add("hidden");
};

window.openHesabEditEt = function () {
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("HesabEditEtPopUp").classList.remove("hidden");
};

window.closeHesabEditeEt = function () {
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("HesabEditEtPopUp").classList.add("hidden");
};

window.openYeniQrupPopup = function () {
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("YeniQrupPop").classList.remove("hidden");
};

window.closeYeniQrupPopup = function () {
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("YeniQrupPop").classList.add("hidden");
};

window.openYeniVezifePopup = function () {
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("YeniVezifePop").classList.remove("hidden");
};

window.closeYeniVezifePopup = function () {
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("YeniVezifePop").classList.add("hidden");
};

const muessiseMelumatlari = document.querySelector("#muessiseMelumatlari");
let click123 = false;

function muessiseMelumatlariElave() {
  click123 = !click123;
  if (click123) {
    muessiseMelumatlari.style.height = "280px";
  } else {
    muessiseMelumatlari.style.height = "0";
  }
}

const BasMuhasiblerPop = document.querySelector("#BasMuhasibler");
let clickMuhasibler = false;

const ButunIstifadecilerPop = document.querySelector("#ButunIstifadecilerPop");
let clickButunIstifadeciler = false;

function clickIstifadeciElaveEt() {
  try {
    if (typeof window.openUsersPopup === "function") {
      window.openUsersPopup();
      return;
    }

    if (typeof openUsersPopup === "function") {
      openUsersPopup();
      return;
    } else {
      clickButunIstifadeciler = !clickButunIstifadeciler;

      if (clickButunIstifadeciler) {
        if (ButunIstifadecilerPop) {
          ButunIstifadecilerPop.style.display = "block";
        }

        if (BasMuhasiblerPop) {
          BasMuhasiblerPop.style.display = "none";
        }
      } else {
        if (ButunIstifadecilerPop) ButunIstifadecilerPop.style.display = "none";
        if (TetbiqHesabi) TetbiqHesabi.style.display = "none";
        if (overlay) overlay.style.display = "none";
      }
    }
  } catch (error) {
    console.error("clickIstifadeciElaveEt xətası:", error);
  }
}

window.clickIstifadeciElaveEt = clickIstifadeciElaveEt;

const SaveBasMuhasibler = document.querySelector("#SaveBasMuhasibler");
let click12345 = false;

function clickSaveBasMuhasibler() {
  click12345 = !click12345;
  if (click12345) {
    SaveBasMuhasibler.style.display = "block";
    ButunIstifadecilerPop.style.display = "none";
    BasMuhasiblerPop.style.display = "none";
  } else {
    SaveBasMuhasibler.style.display = "none";
    ButunIstifadecilerPop.style.display = "block";
  }
}

const TetbiqHesabi = document.querySelector("#TetbiqHesabi");
let clickTetbiq = false;

window.clickRedakteEtQruplar = function clickRedakteEtQruplar() {
  ("clickRedakteEtQruplar funksiyası çağırıldı");

  if (!$("#TetbiqHesabi").hasClass("hidden")) {
    ("Popup artıq açıqdır, bağlayıram");
    $("#TetbiqHesabi").addClass("hidden").css({
      display: "none",
      visibility: "hidden",
      opacity: "0",
    });
    $("#overlay").addClass("hidden").hide();
    return;
  }

  const permissionId = window.currentPermissionId;
  const permissionName = window.currentPermissionName;

  ("clickRedakteEtQruplar çağırıldı:", {
    permissionId,
    permissionName,
  });

  $("#permissions-popup").hide();
  if (typeof currentPopup !== "undefined") {
    currentPopup = null;
  }

  ("openEditUsersPopup funksiyasını çağırmağa hazırlaşıram");
  (
    "openEditUsersPopup mövcuddur?",
    typeof openEditUsersPopup === "function"
  );
  (
    "window.openEditUsersPopup mövcuddur?",
    typeof window.openEditUsersPopup === "function"
  );

  if (typeof window.openEditUsersPopup === "function") {
    ("window.openEditUsersPopup çağırılır");
    window.openEditUsersPopup(permissionId, permissionName);
  } else if (typeof openEditUsersPopup === "function") {
    ("openEditUsersPopup çağırılır");
    openEditUsersPopup(permissionId, permissionName);
  } else {
    console.error("openEditUsersPopup funksiyası tapılmadı");
    (
      "window obyektindəki funksiyalar:",
      Object.keys(window).filter((key) => key.includes("openEdit"))
    );
  }
};

$(document).on("click", "#edit-users-btn", function (e) {
  e.preventDefault();
  e.stopPropagation();
  ("Edit users button clicked via event listener");
  ("Element data attributes:", $(this).data());
  ("Current permission data:", {
    permissionId: window.currentPermissionId,
    permissionName: window.currentPermissionName,
  });
  window.clickRedakteEtQruplar();
});

let clickButunIstifadeciler2 = false;

function clickIstifadeciElaveEt2() {
  if (typeof window.openUsersPopup === "function") {
    window.openUsersPopup();
    return;
  }

  if (typeof openUsersPopup === "function") {
    openUsersPopup();
    return;
  } else {
    clickButunIstifadeciler2 = !clickButunIstifadeciler2;

    if (clickButunIstifadeciler2) {
      if (TetbiqHesabi) TetbiqHesabi.style.display = "none";
      if (ButunIstifadecilerPop) {
        ButunIstifadecilerPop.style.display = "block";
      }
    } else {
      if (ButunIstifadecilerPop) ButunIstifadecilerPop.style.display = "none";
      if (overlay) overlay.style.display = "none";
    }
  }
}

window.clickIstifadeciElaveEt2 = clickIstifadeciElaveEt2;

let RedakteEtPopUpVezife = document.querySelector("#RedakteEtPopUpVezife");
let click4545 = false;

function redakteVezife() {
  click4545 = !click4545;
  if (click4545) {
    overlay.style.display = "block";
    RedakteEtPopUpVezife.style.display = "block";
  } else {
    overlay.style.display = "none";
    RedakteEtPopUpVezife.style.display = "none";
  }
}

function toggleRBACPermissionDropdown(permissionType) {
  const dropdown = document.getElementById(permissionType + 'Dropdown');
  const allDropdowns = document.querySelectorAll('[id$="Dropdown"]');

  allDropdowns.forEach(dd => {
    if (dd.id !== permissionType + 'Dropdown') {
      dd.classList.add('hidden');
    }
  });

  dropdown.classList.toggle('hidden');
}

function selectRBACPermission(permissionType, value, displayText) {
  const selectElement = document.getElementById(permissionType + 'Select');
  if (selectElement) {
    selectElement.value = value;
  } else {
    console.error('Select element not found!');
  }

  const textElement = document.getElementById(permissionType + 'Text');
  if (textElement) {
    textElement.textContent = displayText;
  } else {
    console.error('Text element not found!');
  }

  const dropdown = document.getElementById(permissionType + 'Dropdown');
  ('Dropdown element for closing:', dropdown);
  ('Looking for ID:', permissionType + 'Dropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
    ('Dropdown closed');
  } else {
    console.error('Dropdown element not found!');
  }
}

function handlePermissionCheckbox(permissionType, checkbox) {
  const textElement = document.getElementById(permissionType + 'Text');
  const selectElement = document.getElementById(permissionType + 'Select');

  if (checkbox.checked) {
    if (textElement) {
      textElement.textContent = 'İcazə';
    }
    if (selectElement) {
      selectElement.value = 'none';
    }
  } else {
    if (textElement) {
      textElement.textContent = 'İcazə';
    }
    if (selectElement) {
      selectElement.value = 'none';
    }
  }
}

function initializePermissionCheckboxes() {
  const permissionTypes = [
    'dashboard', 'accounting', 'avankartPartner',
    'companyInformation', 'profile', 'editUsers',
    'roleGroups', 'requisites', 'contracts'
  ];

  permissionTypes.forEach(permissionType => {
    const checkbox = document.querySelector(`[name="${permissionType}_checkbox"]`);
    if (checkbox) {
      checkbox.addEventListener('change', function () {
        handlePermissionCheckbox(permissionType, this);
      });
    }
  });
}

function setPermissionGroupName() {
  const hiddenInput = document.getElementById('hiddenPermissionNameInput');

  if (hiddenInput) {
    const timestamp = new Date().getTime();
    const groupName = `Yeni_Qrup_${timestamp}`;
    hiddenInput.value = groupName;
  }
}

function sanitizeAndUpdateGroupName() {
  const nameInput = document.querySelector('input[placeholder="Qrup adını daxil edin"]');
  const hiddenInput = document.getElementById('hiddenPermissionNameInput');

  if (nameInput && hiddenInput) {
    const value = nameInput.value.trim();

    function sanitizeInput(input) {
      const element = document.createElement('div');
      element.innerText = input;
      return element.innerHTML;
    }

    const sanitizedValue = sanitizeInput(value);
    hiddenInput.value = sanitizedValue || `Yeni_Qrup_${new Date().getTime()}`;
  }
}

function clickBasMuhasiblerPop() {
  const nameInput = document.querySelector('input[placeholder="Qrup adını daxil edin"]');

  if (!nameInput || !nameInput.value.trim()) {
    alertModal("Qrup adını daxil edin!", "error", 2500);
    return;
  }

  function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
  }

  const sanitizedName = sanitizeInput(nameInput.value.trim());

  const hiddenInput = document.getElementById('hiddenPermissionNameInput');
  if (hiddenInput) {
    hiddenInput.value = sanitizedName;
  }
  const divEl = document.querySelector(".new-permission-name");
  if (divEl) divEl.textContent = sanitizedName;
  clickMuhasibler = !clickMuhasibler;

  if (clickMuhasibler) {
    closeYeniQrupPopup();

    const overlay = document.getElementById('overlay');
    const permissionPopup = document.getElementById('BasMuhasibler');

    if (overlay && permissionPopup) {
      overlay.style.display = 'block';
      permissionPopup.style.display = 'block';
    }

    if (BasMuhasiblerPop) {
      BasMuhasiblerPop.style.display = "block";
    }
  } else {
    const overlay = document.getElementById('overlay');
    const permissionPopup = document.getElementById('BasMuhasibler');

    if (overlay) overlay.style.display = 'none';
    if (permissionPopup) permissionPopup.style.display = 'none';
    if (BasMuhasiblerPop) BasMuhasiblerPop.style.display = "none";
  }
}

function createNewPermission(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    alertModal("Form tapılmadı!", "error", 2500);
    return;
  }

  let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (!csrfToken) {
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('_csrf='));
    if (csrfCookie) {
      csrfToken = csrfCookie.split('=')[1];
    }
  }

  if (!csrfToken) {
    alertModal("CSRF token tapılmadı!", "error", 2500);
    return;
  }

  const formData = new FormData();

  const hiddenNameInput = document.getElementById('hiddenPermissionNameInput');
  if (hiddenNameInput && hiddenNameInput.value.trim()) {
    formData.append('name', hiddenNameInput.value.trim());
  } else {
    alertModal("Qrup adı tapılmadı!", "error", 2500);
    return;
  }

  const permissionMappings = {
    'dashboard_checkbox': 'dashboard',
    'accounting_checkbox': 'accounting',
    'avankart_partner_checkbox': 'avankart_partner',
    'company_information_checkbox': 'company_information',
    'profile_checkbox': 'profile',
    'edit_users_checkbox': 'edit_users',
    'role_groups_checkbox': 'role_groups',
    'requisites_checkbox': 'requisites',
    'contracts_checkbox': 'contracts'
  };

  Object.entries(permissionMappings).forEach(([checkboxName, selectName]) => {
    const checkbox = form.querySelector(`input[name="${checkboxName}"]`);
    const select = form.querySelector(`select[name="permissions[${selectName}]"]`) ||
      document.getElementById(`${selectName}Select`);

    (`Checkbox: ${checkboxName}, checked: ${checkbox ? checkbox.checked : 'not found'}`);
    (`Select: ${selectName}, value: ${select ? select.value : 'not found'}`);

    if (checkbox && checkbox.checked && select) {
      let value = select.value || 'none';
      if (value === 'write') value = 'full';
      formData.append(`permissions[${selectName}]`, value);
      (`Added permission: ${selectName} = ${value}`);
    } else if (checkbox && !checkbox.checked) {
      formData.append(`permissions[${selectName}]`, 'none');
      (`Added none permission: ${selectName} = none`);
    }
  });

  // 🔹 Seçilmiş user-ları əlavə et
  if (window.selectedUserIds && window.selectedUserIds.length > 0) {
    window.selectedUserIds.forEach((userId) => {
      formData.append("users[]", userId);
    });
  }


  const button = document.getElementById('BasMuhasiblerButton');
  const originalHtml = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="icon stratis-loader-01 animate-spin mr-1"></span> Yadda saxla';

  // 🔹 Konsolda data
  console.log("FormData göndərilir:");
  for (const pair of formData.entries()) console.log(pair[0], pair[1]);

  fetch('/rbac/createPermGroup', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(formData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alertModal(data.message || "Qrup uğurla yaradıldı!", "success", 3000);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alertModal(data.error || data.message || "Xəta baş verdi!", "error", 2500);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alertModal("Bilinməyən xəta baş verdi!", "error", 2500);
    })
    .finally(() => {
      button.disabled = false;
      button.innerHTML = originalHtml;
    });
}

window.createNewPermission = createNewPermission;

document.addEventListener('DOMContentLoaded', function () {
  setPermissionGroupName();

  const nameInput = document.querySelector('input[placeholder="Qrup adını daxil edin"]');
  if (nameInput) {
    nameInput.addEventListener('input', sanitizeAndUpdateGroupName);
    nameInput.addEventListener('blur', sanitizeAndUpdateGroupName);
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.relative')) {
      const allDropdowns = document.querySelectorAll('[id$="Dropdown"]');
      allDropdowns.forEach(dd => dd.classList.add('hidden'));
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const dropdownTriggers = document.querySelectorAll('[onclick*="toggleRBACPermissionDropdown"]');
  dropdownTriggers.forEach(trigger => {
    const onclickAttr = trigger.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes('toggleRBACPermissionDropdown')) {
      const match = onclickAttr.match(/toggleRBACPermissionDropdown\('([^']+)'\)/);
      if (match) {
        const permissionType = match[1];
        trigger.removeAttribute('onclick');
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          ('Trigger clicked for:', permissionType);
          toggleRBACPermissionDropdown(permissionType);
        });
      }
    }
  });

  const permissionOptions = document.querySelectorAll('[onclick*="selectRBACPermission"]');
  ('Found permission options:', permissionOptions.length);

  permissionOptions.forEach(option => {
    const onclickAttr = option.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes('selectRBACPermission')) {
      const match = onclickAttr.match(/selectRBACPermission\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);
      if (match) {
        const permissionType = match[1];
        const value = match[2];
        const displayText = match[3];
        ('Setting up option for:', permissionType, value, displayText);
        option.removeAttribute('onclick');
        option.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          ('Option clicked:', permissionType, value, displayText);
          selectRBACPermission(permissionType, value, displayText);
        });
      }
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('[id$="Dropdown"]') && !e.target.closest('[onclick*="toggleRBACPermissionDropdown"]')) {
      const dropdowns = document.querySelectorAll('[id$="Dropdown"]');
      dropdowns.forEach(dropdown => {
        dropdown.classList.add('hidden');
      });
    }
  });
});

window.toggleRBACPermissionDropdown = toggleRBACPermissionDropdown;
window.selectRBACPermission = selectRBACPermission;
window.handlePermissionCheckbox = handlePermissionCheckbox;

document.addEventListener('DOMContentLoaded', function () {
  initializePermissionCheckboxes();
});
window.sanitizeAndUpdateGroupName = sanitizeAndUpdateGroupName;
window.clickBasMuhasiblerPop = clickBasMuhasiblerPop;
window.setPermissionGroupName = setPermissionGroupName;

