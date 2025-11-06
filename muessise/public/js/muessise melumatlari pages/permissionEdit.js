// permissionEdit.js - Permission edit funksiyaları

// Global dəyişənlər
let currentPermissionId = null;
let currentPermissionDefault = false;
let currentPermissionName = "";

// Permission edit popup açma funksiyası (istifadəçilər üçün)
window.openEditUsersPopup = function openEditUsersPopup(
  permissionId,
  permissionName
) {
  console.log("openEditUsersPopup çağırıldı:", {
    permissionId: permissionId,
    permissionName: permissionName,
  });

  // DOM elementlərini yoxla
  const currentPermIdElement = $("#currentPermId");
  const overlayElement = $("#overlay");
  const tetbiqHesabiElement = $("#TetbiqHesabi");

  console.log("DOM elementləri:", {
    currentPermIdElement: currentPermIdElement.length,
    overlayElement: overlayElement.length,
    tetbiqHesabiElement: tetbiqHesabiElement.length,
  });

  // Permission ID-ni gizli inputa yaz
  $("#currentPermId").val(permissionId);
  console.log("currentPermId input-a yazıldı:", $("#currentPermId").val());

  // Permission ID-ni global saxla
  window.currentPermissionId = permissionId;
  console.log(
    "Global currentPermissionId saxlandı:",
    window.currentPermissionId
  );

  // Popup açıq olduğunu yoxla və açıq deyilsə aç
  const isHidden = $("#TetbiqHesabi").hasClass("hidden");
  console.log("TetbiqHesabi popup gizlimi?", isHidden);

  if (isHidden) {
    console.log("Popup açılır...");
    // Əvvəlcə overlay-i göstər
    $("#overlay").removeClass("hidden").show();
    // Sonra modal-ı göstər və hidden class-ını götür
    $("#TetbiqHesabi").removeClass("hidden").css({
      display: "block",
      visibility: "visible",
      opacity: "1",
    });

    // Modal-ın düzgün background və text rənglərini təmin et
    const modalElement = $("#TetbiqHesabi");

    // Modal root container-ını düzəlt
    modalElement
      .removeClass("bg-body-bg text-messages bg-white text-black")
      .addClass(
        "bg-sidebar-item dark:bg-side-bar-item-dark text-messages dark:text-primary-text-color-dark"
      );

    // Modal header-ındakı elementləri düzəlt
    modalElement
      .find(".text-[15px].font-medium, .text-[12px].opacity-65")
      .removeClass("text-black")
      .addClass("text-messages dark:text-primary-text-color-dark");

    // Table container və DataTable wrapper-ını düzəlt
    modalElement
      .find("#myTablePop2, #myTablePop2_wrapper, table")
      .removeClass("bg-white")
      .addClass("bg-sidebar-item dark:bg-side-bar-item-dark");

    // Search input-u düzəlt
    modalElement
      .find("input[type='email'], input#customSearch")
      .removeClass("bg-white")
      .addClass(
        "bg-menu dark:bg-menu-dark text-messages dark:text-primary-text-color-dark"
      );

    // Button-ları düzəlt
    modalElement
      .find("button")
      .addClass("text-messages dark:text-primary-text-color-dark");

    // Modal title və description-ı update et
    $("#TetbiqHesabi")
      .find(".text-[15px].font-medium")
      .text(permissionName || "Tətbiq hesabı");
    $("#TetbiqHesabi")
      .find(".text-[12px].opacity-65")
      .text(
        `${
          permissionName || "Tətbiq hesabı"
        } qrupunda olan istifadəçiləri görə bilərsiniz`
      );

    console.log("Popup açıldı. Overlay və TetbiqHesabi görünür olmalıdır");
  } else {
    console.log("Popup artıq açıqdır");
  }

  // Datatable-ı yenilə və ya yarat
  console.log(
    "refreshUserPermissionTable funksiyası mövcuddur?",
    typeof window.refreshUserPermissionTable === "function"
  );
  if (typeof window.refreshUserPermissionTable === "function") {
    console.log("refreshUserPermissionTable çağırılır");
    window.refreshUserPermissionTable();
  } else {
    console.error("refreshUserPermissionTable funksiyası tapılmadı");
  }
};

// Permission details yükləmə funksiyası
function loadPermissionDetails(permissionId) {
  console.log("loadPermissionDetails çağırıldı, permissionId:", permissionId);

  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  console.log("CSRF Token:", csrfToken);

  $.ajax({
    url: "/muessise-info/get-permission-details",
    type: "POST",
    headers: {
      "CSRF-Token": csrfToken,
    },
    data: { permissionId: permissionId },
    success: function (response) {
      console.log("Permission details response:", response);
      if (response.success) {
        populatePermissionCheckboxes(response.data);
      } else {
        console.error("Permission details yüklənərkən xəta:", response.message);
        alert("Permission məlumatları yüklənərkən xəta baş verdi.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Permission details AJAX xətası:", {
        xhr: xhr,
        status: status,
        error: error,
        responseText: xhr.responseText,
      });
      alert("Server xətası baş verdi.");
    },
  });
}

// Permission checkboxlarını doldurmaq
function populatePermissionCheckboxes(permissionData) {
  console.log("populatePermissionCheckboxes çağırıldı, data:", permissionData);

  // Qrup adını doldur
  $("#edit-permission-full-name").val(permissionData.name);
  console.log("Permission adı set edildi:", permissionData.name);

  // Hər bir permission üçün checkbox-ları set et
  const permissions = [
    { key: "dashboard", id: "edit-dashboard-checkbox" },
    { key: "accounting", id: "edit-accounting-checkbox" },
    { key: "avankart_partner", id: "edit-avankart-checkbox" },
    { key: "company_information", id: "edit-company-checkbox" },
    { key: "profile", id: "edit-profile-checkbox" },
    { key: "users", id: "edit-users-checkbox" },
    { key: "role_groups", id: "edit-role-groups-checkbox" },
    { key: "requisites", id: "edit-requisites-checkbox" },
    { key: "contracts", id: "edit-contracts-checkbox" },
  ];

  permissions.forEach((permission) => {
    const checkbox = $(`#${permission.id}`);
    const value = permissionData[permission.key];
    const isChecked = value === "full" || value === "read";

    console.log(`Permission ${permission.key}:`, {
      value: value,
      isChecked: isChecked,
      elementFound: checkbox.length > 0,
    });

    checkbox.prop("checked", isChecked);

    if (isChecked) {
      checkbox.val(value);
    }
  });

  // Müəssisə məlumatları alt bölmələrini aç/bağla
  const companyInfoCheckbox = $("#edit-company-checkbox");
  if (companyInfoCheckbox.is(":checked")) {
    $("#company-info-subsections").removeClass("h-0").addClass("h-auto");
    console.log("Company info subsections açıldı");
  }
}

// Default permission edit popup açma (sadə edit - yalnız ad)
function openEditPermissionDefaultPopup(permissionId, permissionName) {
  console.log("openEditPermissionDefaultPopup çağırıldı:", {
    permissionId: permissionId,
    permissionName: permissionName,
  });

  $("#overlay").removeClass("hidden");
  $("#EditPermissionDefaultPopup").removeClass("hidden");
  $("#edit-permission-default-name").val(permissionName);
  $("#edit-permission-default-id").val(permissionId);
}

// Normal permission edit popup açma (tam edit - ad + permissions)
function openEditPermissionFullPopup(permissionId, permissionName) {
  console.log("openEditPermissionFullPopup çağırıldı:", {
    permissionId: permissionId,
    permissionName: permissionName,
  });

  $("#overlay").removeClass("hidden");
  $("#EditPermissionFullPopup").removeClass("hidden");
  $("#edit-permission-full-name").val(permissionName);
  $("#edit-permission-full-id").val(permissionId);

  // Permission details yüklə
  loadPermissionDetails(permissionId);
}

// Permission silmə funksiyası (updated)
function deleteCurrentPermission() {
  console.log("deleteCurrentPermission çağırıldı:", {
    currentPermissionId: currentPermissionId,
    currentPermissionDefault: currentPermissionDefault,
    currentPermissionName: currentPermissionName,
  });

  if (!currentPermissionId) {
    console.error("Permission ID tapılmadı!");
    alert("Permission ID tapılmadı.");
    return;
  }

  // Default yoxlanışı
  if (currentPermissionDefault) {
    console.warn(
      "Default permission silinməyə çalışıldı:",
      currentPermissionName
    );
    alert("Default permission-lar silinə bilməz.");
    return;
  }

  console.log("Permission silinməyə hazırlanır:", currentPermissionId);
  deletePermission(currentPermissionId);
}

// Close funksiyaları
function closeEditPermissionDefaultPopup() {
  console.log("closeEditPermissionDefaultPopup çağırıldı");
  $("#overlay").addClass("hidden");
  $("#EditPermissionDefaultPopup").addClass("hidden");

  // Form-u təmizlə
  $("#editPermissionDefaultForm")[0].reset();
}

function closeEditPermissionFullPopup() {
  console.log("closeEditPermissionFullPopup çağırıldı");
  $("#overlay").addClass("hidden");
  $("#EditPermissionFullPopup").addClass("hidden");

  // Form-u təmizlə
  $("#editPermissionFullForm")[0].reset();
  $("#company-info-subsections").addClass("h-0").removeClass("h-auto");
}

// Form submit funksiyaları
function submitEditPermissionDefaultForm() {
  console.log("submitEditPermissionDefaultForm çağırıldı");

  const form = $("#editPermissionDefaultForm");
  const formData = new FormData(form[0]);

  console.log("Form URL:", form.data("url"));
  console.log("FormData hazırlandı");

  $.ajax({
    url: form.data("url"),
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      console.log("Default permission edit response:", response);
      if (response.success) {
        closeEditPermissionDefaultPopup();
        // Table-ı yenilə
        if (typeof permissionsTable !== "undefined") {
          permissionsTable.ajax.reload();
          console.log("Permission table yeniləndi");
        }
        alert("Permission adı uğurla dəyişdirildi.");
      } else {
        console.error("Default permission edit xətası:", response.message);
        alert(response.message || "Xəta baş verdi.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Default permission edit AJAX xətası:", {
        xhr: xhr,
        status: status,
        error: error,
        responseText: xhr.responseText,
      });
      alert("Server xətası baş verdi.");
    },
  });
}

function submitEditPermissionFullForm() {
  console.log("submitEditPermissionFullForm çağırıldı");

  const form = $("#editPermissionFullForm");

  // Permission data-larını topla
  const permissions = {};
  const checkboxes = form.find('input[name^="permissions[]"]');

  console.log("Checkbox sayı:", checkboxes.length);

  checkboxes.each(function () {
    const name = $(this).attr("name");
    const permissionKey = name.match(/permissions\[(.+)\]/)[1];
    const value = $(this).is(":checked") ? $(this).val() : "none";
    permissions[permissionKey] = value;

    console.log(`Permission checkbox ${permissionKey}:`, {
      checked: $(this).is(":checked"),
      value: value,
    });
  });

  const formData = {
    _csrf: $('meta[name="csrf-token"]').attr("content"),
    id: $("#edit-permission-full-id").val(),
    name: $("#edit-permission-full-name").val(),
    permissions: permissions,
  };

  console.log("Full permission form data:", formData);

  return $.ajax({
    url: form.data("url"),
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(formData),
    success: function (response) {
      console.log("Full permission edit response:", response);
      if (response.success) {
        closeEditPermissionFullPopup();
        // Table-ı yenilə
        if (typeof permissionsTable !== "undefined") {
          permissionsTable.ajax.reload();
          console.log("Permission table yeniləndi");
        }
        alert("Permission uğurla yeniləndi.");
      } else {
        console.error("Full permission edit xətası:", response.message);
        alert(response.message || "Xəta baş verdi.");
      }
    },
    error: function (xhr, status, error) {
      console.error("Full permission edit AJAX xətası:", {
        xhr: xhr,
        status: status,
        error: error,
        responseText: xhr.responseText,
      });
      alert("Server xətası baş verdi.");
    },
  });
}

// Permission silmə funksiyası
function deletePermission(permissionId) {
  console.log("deletePermission çağırıldı, permissionId:", permissionId);

  if (
    !permissionId ||
    permissionId === "undefined" ||
    permissionId === "null"
  ) {
    console.error("Permission ID keçərsizdir:", permissionId);
    alert("Permission ID tapılmadı. Səhifəni yeniləyib yenidən cəhd edin.");
    return;
  }

  if (confirm("Bu permission-ı silmək istədiyinizə əminsiniz?")) {
    // CSRF token-ı əldə et
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    console.log("CSRF token tapıldı:", csrfToken);
    console.log("Permission silinəcək, ID:", permissionId);

    // Request data - CSRF token-ı data-ya da əlavə et
    const requestData = {
      ids: [permissionId],
      _csrf: csrfToken,
    };

    console.log("Request data:", requestData);

    $.ajax({
      url: "/rbac/rbacPermission/delete",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: requestData,
      success: function (response) {
        console.log("Permission delete response:", response);

        if (response.success) {
          // OTP tələb olunursa
          if (response.otpRequired && response.tempDeleteId) {
            console.log(
              "OTP tələb olunur, tempDeleteId:",
              response.tempDeleteId
            );
            showOtpModal(response.tempDeleteId, "permission");
          } else {
            // Birbaşa silindi
            if (typeof permissionsTable !== "undefined") {
              permissionsTable.ajax.reload();
              console.log("Permission table yeniləndi (delete)");
            }
            alert("Permission uğurla silindi.");
          }
        } else {
          console.error("Permission delete xətası:", response.message);
          alert(response.message || "Xəta baş verdi.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Permission delete AJAX xətası:", {
          xhr: xhr,
          status: status,
          error: error,
          responseText: xhr.responseText,
          url: "/rbac/rbacPermission/delete",
          statusCode: xhr.status,
        });

        if (xhr.status === 401) {
          alert("İcazə xətası. Səhifəni yeniləyib yenidən cəhd edin.");
        } else if (xhr.status === 403) {
          alert("CSRF token xətası. Səhifəni yenilə.");
        } else {
          alert("Server xətası baş verdi.");
        }
      },
    });
  } else {
    console.log("Permission silmə ləğv edildi");
  }
}

// submitForm funksiyasına əlavə case-lər
$(document).ready(function () {
  console.log("Permission Edit - Document ready başladı");

  // Popup açılışı üçün handler
  $(document).on("click", '.dots-menu[data-table="permissions"]', function (e) {
    e.stopPropagation();
    console.log("Permission dots menu click edildi");

    // Element-dən bütün data atributlarını əldə et
    const element = $(this);
    const rawId = element.attr("data-id") || element.data("id");
    const rawDefault = element.attr("data-default") || element.data("default");
    const rawName = element.attr("data-name") || element.data("name");

    // Məlumatları saxla
    currentPermissionId = rawId;
    currentPermissionDefault = rawDefault === true || rawDefault === "true";
    currentPermissionName = rawName;

    console.log("Permission seçildi:", {
      id: currentPermissionId,
      default: currentPermissionDefault,
      name: currentPermissionName,
    });
  });

  // Mövcud submitForm funksiyasını extend et

  const originalSubmitForm = window.submitFormm;

  window.submitFormm = function (formType) {
    console.log("submitForm çağırıldı, formType:", formType);

    switch (formType) {
      case "editPermissionDefault":
        console.log("editPermissionDefault case-ə gəldi");
        submitEditPermissionDefaultForm();
        break;
      case "editPermissionFull":
        console.log("editPermissionFull case-ə gəldi");
        submitEditPermissionFullForm();
        break;
      case "mainEdit":
        submitForm("mainEdit");
      default:
        console.log("Default case, original funksiya çağırılacaq");
        if (originalSubmitForm) {
          originalSubmitForm(formType);
        } else {
          console.warn("submitForm funksiyası tapılmadı:", formType);
        }
        break;
    }
  };

  // Company info checkbox toggle
  $(document).on("change", "#edit-company-checkbox", function () {
    console.log("Company checkbox dəyişdi:", $(this).is(":checked"));
    const subsections = $("#company-info-subsections");
    if ($(this).is(":checked")) {
      subsections.removeClass("h-0").addClass("h-auto");
    } else {
      subsections.addClass("h-0").removeClass("h-auto");
    }
  });

  // Overlay click-lə permission popup-larını bağlama
  $("#overlay").on("click", function (e) {
    console.log("Overlay click edildi");
    // Yalnız overlay-in özünə klik edilərsə
    if (e.target === this) {
      console.log("Overlay-ə klik edildi, popup-lar bağlanacaq");
      closeEditPermissionDefaultPopup();
      closeEditPermissionFullPopup();
    }
  });

  // Console log debug üçün
  console.log("Permission Edit JS tam yükləndi");
  console.log("Global dəyişənlər hazırlandı:", {
    currentPermissionId: currentPermissionId,
    currentPermissionDefault: currentPermissionDefault,
    currentPermissionName: currentPermissionName,
  });
});

// OTP Modal funksiyası (task tələbi)
function showOtpModal(tempDeleteId, type) {
  console.log("OTP modal açılır:", { tempDeleteId, type });

  // OTP modal HTML-i (əgər yoxdursa)
  if (!$("#otpModal").length) {
    const otpModalHtml = `
      <div id="otpModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" style="display: none;">
        <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">OTP Təsdiqi</h3>
          <p class="mb-4">E-poçt ünvanınıza göndərilən OTP kodunu daxil edin:</p>
          <input type="text" id="otpInput" class="w-full p-2 border rounded mb-4" placeholder="6 rəqəmli OTP kodu" maxlength="6">
          <div class="flex justify-end space-x-2">
            <button onclick="closeOtpModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded">Ləğv et</button>
            <button onclick="submitOtp('${tempDeleteId}', '${type}')" class="px-4 py-2 bg-red-500 text-white rounded">Təsdiq et və Sil</button>
          </div>
        </div>
      </div>
    `;
    $("body").append(otpModalHtml);
  }

  // Modal-ı göstər
  $("#otpModal").show();
  $("#otpInput").focus();
}

// OTP Modal bağlama
function closeOtpModal() {
  console.log("OTP modal bağlanır");
  $("#otpModal").hide();
  $("#otpInput").val("");
}

// OTP təsdiqi və final silmə
function submitOtp(tempDeleteId, type) {
  const otpCode = $("#otpInput").val().trim();

  console.log("OTP təsdiqi:", { tempDeleteId, type, otpCode });

  if (!otpCode || otpCode.length !== 6) {
    alert("6 rəqəmli OTP kodunu daxil edin.");
    return;
  }

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Route URL-i düzəldildi
  const acceptUrl =
    type === "permission"
      ? "/rbac/rbacPermission/acceptPermissionDelete"
      : "/rbac/rbacDuty/acceptDutyDelete";

  console.log("Accept URL:", acceptUrl);

  $.ajax({
    url: acceptUrl,
    type: "POST",
    headers: {
      "CSRF-Token": csrfToken,
    },
    data: {
      tempDeleteId: tempDeleteId,
      otpCode: otpCode,
    },
    success: function (response) {
      console.log("OTP accept response:", response);

      if (response.success) {
        closeOtpModal();

        // Redirect (task tələbi)
        if (response.redirect) {
          console.log("Redirect edilir:", response.redirect);
          alertModal("Uğurla silindi.");
          window.location.href = response.redirect;
        } else {
          // Table yenilə
          if (typeof permissionsTable !== "undefined") {
            permissionsTable.ajax.reload();
          }
          alertModal("Uğurla silindi.");
        }
      } else {
        console.error("OTP accept xətası:", response.message);
        alertModal(response.message || "OTP təsdiqi uğursuz oldu.", "error");
      }
    },
    error: function (xhr, status, error) {
      console.error("OTP accept AJAX xətası:", {
        xhr: xhr,
        status: status,
        error: error,
        responseText: xhr.responseText,
        url: acceptUrl,
      });
      alert("OTP təsdiqi zamanı xəta baş verdi.");
    },
  });
}
