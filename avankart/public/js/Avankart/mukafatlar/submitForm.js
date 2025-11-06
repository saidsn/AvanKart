function submitForm(formadi) {
  const $form = $(`#${formadi}Form`);
  const $button = $(`#${formadi}Button`);
  const url = $form.data("url");
  const urlTemplate = $form.data("url") || $form.attr("action");
  const enctype = $form.attr("enctype");
  const method = ($form.attr("method") || "POST").toUpperCase();
  const $formErrors = $(`#${formadi}FormErrors`);
  const hasFormErrors = $formErrors.length > 0;
  
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
    console.log(`Redirecting to: ${finalUrl}`);
    window.location.href = finalUrl;
    return;
  }

  // Hataları temizle
  $form.find('span[id$="Error"]').addClass("hidden").text("");
  if (hasFormErrors) {
    $formErrors.addClass("hidden text-red-500 text-green-700").text("");
  }

  // Butonun orijinal içeriğini sakla
  const originalHtml = $button.html();

  // Yükleniyor ikonu ekle
  const buttonText = $button.text().trim();
  $button
    .prop("disabled", true)
    .html(
      `<span class="icon stratis-loader-01 text-messages dark:text-primary-text-color-dark mr-1 inline-block"></span> ${buttonText}`
    );

  const ajaxOptions = {
    url,
    method: "POST",
    success: (response) => {
      if (response.csrfToken) {
        $form.find('input[name="_csrf"]').val(response.csrfToken);
      }

      if (response.success) {
        if(response.qr){
          $('#qrImageCont').attr('src', response.qr);
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
      $button.prop("disabled", false).html(originalHtml);
    },
  };

  if (enctype === "multipart/form-data") {
    ajaxOptions.data = new FormData($form[0]);
    ajaxOptions.processData = false;
    ajaxOptions.contentType = false;
  } else {
    ajaxOptions.data = $form.serialize();
  }

  $.ajax(ajaxOptions);
}

function filterForm() {
  $(".filter-btn").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const formSelector = $(this).data("form");
    const tableSelector = $(this).data("table") || '#myTable';
    const fnName = $(this).data("close");

    if (!formSelector) return console.warn("No data-form specified on button");

    const form = $('#' + formSelector);
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


function reloadTableSafely(tableId = '#myTable') {
  const $table = $(tableId);
  if ($.fn.dataTable.isDataTable($table)) {
    $table.DataTable().ajax.reload();
  } else {
    console.warn("DataTable not initialized for:", tableId);
  }
}
