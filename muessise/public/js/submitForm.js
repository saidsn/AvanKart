// Keep a reference to any previously defined submitForm (from other modules)
const __previousSubmitForm = typeof window !== "undefined" ? window.submitForm : undefined;

function submitForm(formadi) {
  // Prevent multiple submissions
  if (window.isSubmittingForm) {
    console.log('Form already being submitted, preventing duplicate');
    return;
  }
  window.isSubmittingForm = true;

  if (typeof $ === "undefined") {
    console.error("[submitForm] jQuery ($) is not available on this page");
    window.isSubmittingForm = false;
    return;
  }
  const $form = $(`#${formadi}Form`);
  const $button = $(`#${formadi}Button`);
  const url = $form.data("url");
  const urlTemplate = $form.data("url") || $form.attr("action");
  const effectiveUrl = urlTemplate;
  const enctype = $form.attr("enctype");
  const method = ($form.attr("method") || "POST").toUpperCase();
  const $formErrors = $(`#${formadi}FormErrors`);
  const hasFormErrors = $formErrors.length > 0;

  if (!$form || $form.length === 0) {
    console.error(`[submitForm] Form tapılmadı: #${formadi}Form`);
    window.isSubmittingForm = false;
    return;
  }
  if (!effectiveUrl) {
    console.error(`[submitForm] URL tapılmadı (data-url və ya action yoxdur): #${formadi}Form`);
    window.isSubmittingForm = false;
    return;
  }

  // Eğer method GET ise, yönlendirme yap
  if (method === "GET") {
    let finalUrl = urlTemplate;

    // formdaki inputların değerlerini al
    $form.serializeArray().forEach(({ name, value }) => {
      finalUrl = finalUrl.replace(`:${name}`, encodeURIComponent(value));
    });

    // URL hâlâ parametre içeriyorsa (eksik input varsa) direkt yönlendirme yapma
    if (finalUrl.includes(":")) {
      if ($formErrors.length) {
        $formErrors
          .removeClass("hidden text-green-700")
          .addClass("text-red-500")
          .text("Lazımi parametrlər daxil edilməyib.");
      }
      alertModal("Lazımi parametrlər daxil edilməyib.", "error", 2500);
      return;
    }
    window.location.href = finalUrl;
    return;
  }

  // Hataları temizle
  $form.find('span[id$="Error"]').addClass("hidden").text("");
  if (hasFormErrors) {
    $formErrors.addClass("hidden text-red-500 text-green-700").text("");
  }

  // Butonun orijinal içeriğini sakla (buton olmayabilir)
  const hasButton = $button && $button.length > 0;
  const originalHtml = hasButton ? $button.html() : null;

  // Yükleniyor ikonu ekle (buton varsa)
  if (hasButton) {
    const buttonText = ($button.text() || "").trim() || "Göndər";
    $button
      .prop("disabled", true)
      .html(
        `<span class="icon stratis-loader-01 text-messages dark:text-primary-text-color-dark mr-1 inline-block"></span> ${buttonText}`
      );
  }

  const ajaxOptions = {
    url: effectiveUrl,
    method: "POST",
    success: (response) => {
      if (response.csrfToken) {
        $form.find('input[name="_csrf"]').val(response.csrfToken);
      }

      if (response.success) {
        if (response.qr) {
          $("#qrImageCont").attr("src", response.qr);
        }

        // Handle OTP requirement like sirket module
        if (response.otpRequired === true || response.otpSent === true) {
          console.log('OTP required detected. FormId:', formadi, 'Response:', response);

          if (typeof Otp === "function") {
            // Set up options for OTP popup
            let options = {};
            if (response.resendUrl) options.resendUrl = response.resendUrl;
            if (response.url) options.url = response.url;

            console.log('Initial options:', options);

            // Determine formType based on the original form or response URL
            if (response.url) {
              if (response.url.includes('accept-add-user')) {
                options.formType = 'addUser';
                options.title = 'Yeni İstifadəçi OTP';
                console.log('Detected add user from URL');
              } else if (response.url.includes('accept-edit-user')) {
                options.formType = 'editUser';
                options.title = 'İstifadəçi Redaktəsi OTP';
                console.log('Detected edit user from URL');
              } else if (response.url.includes('accept-delete-user')) {
                options.formType = 'deleteUser';
                options.title = 'İstifadəçi Silmə OTP';
                console.log('Detected delete user from URL');
              }
            }

            // Fallback: determine from form name
            if (!options.formType) {
              console.log('No formType from URL, checking form name:', formadi);
              if (formadi.includes('hesabElaveEt') || formadi.includes('addUser')) {
                options.formType = 'addUser';
                options.title = 'Yeni İstifadəçi OTP';
                options.url = '/muessise-info/accept-add-user';
                console.log('Detected add user from form name');
              } else if (formadi.includes('edit') || formadi.includes('redakte')) {
                options.formType = 'editUser';
                options.title = 'İstifadəçi Redaktəsi OTP';
                options.url = '/muessise-info/accept-edit-user';
                console.log('Detected edit user from form name');
              }
            }

            console.log('Final options for OTP:', options);

            // Call OTP popup with user email and temp ID
            Otp(response.user_email, response.tempDeleteId, options);
          } else {
            console.error('Otp function not found. Make sure Popup.js is loaded.');
            alertModal('OTP kodu göndərildi, lakin popup açıla bilmədi. Səhifəni yeniləyin.', 'warning');
          }
        }

        if (response.message) {
          if (hasFormErrors) {
            $formErrors
              .removeClass("hidden text-red-500")
              .addClass("text-green-700")
              .text(response.message);
          }
          alertModal(response.message, "success", 3000);
          if (response.redirect) {
            setTimeout(() => {
              window.location.href = response.redirect;
            }, 2000);
          }
          // Form-specific success behaviors
          try {
            if (formadi === "redakteEt") {
              // Close modal and overlay, then refresh users table
              $("#RedakteEtPopUp").addClass("hidden").hide();
              $("#overlay").addClass("hidden").hide();
              reloadTableSafely("#myTable");
            }
          } catch (e) {
            console.warn("[submitForm] post-success handling failed:", e);
          }
        } else if (response.redirect) {
          window.location.href = response.redirect;
        }
      } else {
        const message =
          response.message || response.error || "Bilinmeyen bir hata oluştu.";

        if (hasFormErrors) {
          $formErrors
            .removeClass("hidden text-green-700")
            .addClass("text-red-500")
            .text(message);
        }
        alertModal(message, "error", 2500);
        if (response.redirect) {
          setTimeout(() => {
            window.location.href = response.redirect;
          }, 2000);
        }
      }
    },
    error: (xhr) => {
      const { errors = {}, csrfToken, error } = xhr.responseJSON || {};
      let hasGlobalError = false;
      let foundError = false;

      // Alanlara özel hata varsa göster
      Object.entries(errors).forEach(([key, val]) => {
        const $errorSpan = $(`#${key}Error`);
        if ($errorSpan.length) {
          $errorSpan.removeClass("hidden").text(val || "Hatalı giriş");
          foundError = true;
        } else {
          hasGlobalError = true;
        }
      });

      const errorMessage = error || "Bazı alanlar eksik veya hatalı.";

      // Eğer alanlara özel hata yoksa, yine de alertModal göster
      if (!foundError || hasGlobalError) {
        if ($formErrors.length) {
          $formErrors
            .removeClass("hidden text-green-700")
            .addClass("text-red-500")
            .text(errorMessage);
        }
        alertModal(errorMessage, "error", 2500);
      }

      if (csrfToken) {
        $form.find('input[name="_csrf"]').val(csrfToken);
      }
    },
    complete: () => {
      window.isSubmittingForm = false;
      if (hasButton) {
        $button.prop("disabled", false).html(originalHtml);
      }
    },
  };

  if (enctype === "multipart/form-data") {
    ajaxOptions.data = new FormData($form[0]);
    ajaxOptions.processData = false;
    ajaxOptions.contentType = false;
  } else {
    ajaxOptions.data = $form.serialize();
  }

  if (formadi === "redakteEt") {
    const formFields = $form.serializeArray();
    const fullNameField = formFields.find(field => field.name === 'fullName');
    if (fullNameField && fullNameField.value) {
      let trimmedName = fullNameField.value.trim();

      if (trimmedName) {
        const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
        trimmedName = nameParts.join(' ');
      }

      const fullNameInput = $form.find('input[name="fullName"]');
      if (fullNameInput.length) {
        fullNameInput.val(trimmedName);
        ajaxOptions.data = $form.serialize();
      }
    }
  }

  $.ajax(ajaxOptions);
}

// Expose a stable reference that won't be overridden by other scripts
try {
  window.__genericSubmitForm = submitForm;
  // Wrap global submitForm to route by type: use generic for standard forms, fall back to previous for custom handlers
  window.submitForm = function (formadi) {
    try {
      const preferPrev = new Set(["editPermissionDefault", "editPermissionFull"]);
      const formEl = document.getElementById(`${formadi}Form`);
      if (!preferPrev.has(formadi) && formEl) {
        return window.__genericSubmitForm(formadi);
      }
      if (preferPrev.has(formadi) && typeof __previousSubmitForm === "function") {
        return __previousSubmitForm(formadi);
      }
      // Fallbacks
      if (typeof window.__genericSubmitForm === "function") {
        return window.__genericSubmitForm(formadi);
      }
      if (typeof __previousSubmitForm === "function") {
        return __previousSubmitForm(formadi);
      }
    } catch (e) {
      console.error("[submitForm wrapper] error:", e);
    }
  };
} catch (ex) {
  console.warn("[submitForm] wrapper setup failed:", ex);
}

function filterForm() {
  $(".filter-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const formSelector = $(this).data("form");
    const tableSelector = "#" + $(this).data("table") || "#myTable";
    const fnName = $(this).data("close");

    if (!formSelector) return console.warn("No data-form specified on button");

    const form = $("#" + formSelector);
    if (form.length === 0) return console.warn("Form not found:", formSelector);

    reloadTableSafely(tableSelector);

    if (typeof window[fnName] === "function") {
      window[fnName]();
    }
  });
}

function filterChart(buttonElement) {
  const $btn = $(buttonElement);
  const fnName = $btn.data("function"); // <- dinamik fonksiyon adı
  const fnRange = $btn.data("range"); // <- dinamik fonksiyon adı

  if (typeof window[fnName] === "function") {
    window[fnName](fnRange); // dinamik fonksiyonu çalıştır
  } else {
    console.warn("Fonksiyon bulunamadı:", fnName);
  }
}

function reloadTableSafely(tableId = "#myTable") {
  const $table = $(tableId);
  if ($.fn.dataTable.isDataTable($table)) {
    $table.DataTable().ajax.reload();
  } else {
    console.warn("DataTable not initialized for:", tableId);
  }
}

function sendNewOtp(countDownId) {
  let token = $('meta[name="csrf-token"]').attr("content");
  if (!token) {
    token = document.cookie.split("; ").find((row) => row.startsWith("_csrf="));
    if (token) {
      token = token.split("=")[1];
    }
  }
  const countdownEl = document.getElementById(countDownId);
  if (!countdownEl) {
    console.error(`Countdown element not found: ${countDownId}`);
    return;
  }

  $.ajax({
    url: "/resend-otp",
    type: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    contentType: "application/json",
    success: function (data) {
      if (data.success) {
        alertModal(data.message);
        startCountdown(countdownEl, 300);
      } else {
        console.error("OTP göndərilmədi:", data.message);
        alertModal(data.message ?? data.error ?? "An Error happened", "error");
      }
    },
    error: function (xhr, status, err) {
      console.error("OTP göndərmə xətası:", err);
      alertModal(err ?? "An Error happened", "error");
    },
  });
}

function startCountdown(el, duration) {
  let remaining = duration;
  el.textContent = formatTime(remaining);

  const interval = setInterval(() => {
    remaining--;
    el.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      el.textContent = "OTP müddəti bitdi";
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Delegated click binding for dynamic content and CSP-safe behavior
document.addEventListener("click", function (e) {
  const btn = e.target && e.target.closest && e.target.closest("#hesabElaveEtButton");
  if (btn) {
    const fn = window.__genericSubmitForm || window.submitForm;
    if (typeof fn === "function") {
      e.preventDefault();
      e.stopPropagation();
      try {
        fn("hesabElaveEt");
      } catch (err) {
        console.error("[delegate] submitForm call failed:", err);
      }
    }
  }
});

// Delegated handler for Redaktə et (edit user) button
document.addEventListener("click", function (e) {
  const btn = e.target && e.target.closest && e.target.closest("#redakteEtButton");
  if (btn) {
    // If inline onclick exists, let it handle to avoid double-submit
    if (btn.getAttribute && btn.getAttribute("onclick")) return;
    const fn = window.__genericSubmitForm || window.submitForm;
    if (typeof fn === "function") {
      e.preventDefault();
      e.stopPropagation();
      try {
        fn("redakteEt");
      } catch (err) {
        console.error("[delegate] redakteEt submit failed:", err);
      }
    } else {
      console.warn("No submit handler available for redakteEt");
    }
  }
});
