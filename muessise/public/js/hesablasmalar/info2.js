$(document).ready(function () {
  // CSRF token və invoice ID-ni alır
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // URL-dən invoice ID-ni çıxar
  const currentPath = window.location.pathname;
  const invoiceId = currentPath.split("/").pop(); // /hesablashmalar/MINV-5152665585 => MINV-5152665585

  // Global variables for slider
  var globalMinAmount = 0;
  var globalMaxAmount = 300000;

  if (!csrfToken) {
    console.error("CSRF token not found!");
    return;
  }

  if (!invoiceId) {
    console.error("Invoice ID not found!");
    return;
  }

  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initSlider() {
    console.log(
      "Initializing slider with values:",
      globalMinAmount,
      globalMaxAmount
    );

    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("destroy");
    }

    // Ensure the slider container is visible
    if ($("#slider-range").length === 0) {
      console.error("Slider container not found!");
      return;
    }

    // Check if jQuery UI is available
    if (typeof $.fn.slider === "undefined") {
      console.error("jQuery UI slider not available!");
      return;
    }

    try {
      $("#slider-range").slider({
        range: true,
        min: globalMinAmount,
        max: globalMaxAmount,
        values: [globalMinAmount, globalMaxAmount],
        step: 0.01,
        slide: function (event, ui) {
          $("#min-value").text(formatCurrency(ui.values[0]));
          $("#max-value").text(formatCurrency(ui.values[1]));
        },
        change: function (event, ui) {
          $("#min-value").text(formatCurrency(ui.values[0]));
          $("#max-value").text(formatCurrency(ui.values[1]));
        },
      });

      // Set initial values
      $("#min-value").text(formatCurrency(globalMinAmount));
      $("#max-value").text(formatCurrency(globalMaxAmount));

      console.log("Slider initialized successfully");
      console.log("Slider element classes:", $("#slider-range").attr("class"));
      console.log("Slider is visible:", $("#slider-range").is(":visible"));

      // Hide fallback button if it exists
      $("#slider-fallback").addClass("hidden");
    } catch (error) {
      console.error("Error initializing slider:", error);
    }
  }
  var table = $("#myTableOn").DataTable({
    paging: true,
    info: false,
    dom: "t",
    serverside: true,
    processing: true,
    processing: true,
    serverSide: true,
    ajax: {
      url: `/hesablashmalar/${invoiceId}/details`,
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: function (d) {
        // Search parametrlərini əlavə et
        d.search = {
          value: $("#customSearch").val() || "",
        };
        d.invoiceId = invoiceId;

        // 🔥 Filter məlumatlarını əlavə et (əgər filter modal varsa)
        const form = $("#filterForm");
        if (form.length) {
          // Date filters
          d.start_date = form.find('input[name="start_date"]').val();
          d.end_date = form.find('input[name="end_date"]').val();

          // Cards filter
          const checkedCards = [];
          form.find('input[name="cards[]"]:checked').each(function () {
            checkedCards.push($(this).val());
          });
          d.cards = checkedCards;
          console.log("Checked cards:", checkedCards);

          // Amount range filter
          if (
            $("#slider-range").length > 0 &&
            $("#slider-range").hasClass("ui-slider")
          ) {
            const sliderValues = $("#slider-range").slider("values");
            d.min_amount = sliderValues[0];
            d.max_amount = sliderValues[1];
            console.log("Slider values:", sliderValues);
          } else {
            console.log("Slider not found or not initialized");
          }
        }

        return d;
      },
      dataSrc: function (json) {
        console.log("Server response:", json);

        if (!json.data || !Array.isArray(json.data)) {
          console.log("No data or data is not array:", json);
          return [];
        }

        // Only update slider values on initial load, not on every filter
        if (json.draw == 1 && json.data.length > 0) {
          const amounts = json.data.map((tr) => parseFloat(tr.amount) || 0);
          if (amounts.length > 0) {
            const newMinAmount = Math.min(...amounts);
            const newMaxAmount = Math.max(...amounts);

            // Only update if values changed significantly and it's the first draw
            if (
              Math.abs(newMinAmount - globalMinAmount) > 0.01 ||
              Math.abs(newMaxAmount - globalMaxAmount) > 0.01
            ) {
              globalMinAmount = newMinAmount;
              globalMaxAmount = newMaxAmount;
              console.log(
                "Updating slider values on initial load:",
                globalMinAmount,
                globalMaxAmount
              );
              // Update slider if it exists
              if (typeof initSlider === "function") {
                initSlider();
              }
            }
          }
        }

        return json.data;
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", error);
        console.error("Status:", status);
        console.error("Response:", xhr.responseText);

        // Show user-friendly error message
        if (xhr.status === 500) {
          console.error("Server error occurred while loading transactions");
        } else if (xhr.status === 404) {
          console.error("Transactions endpoint not found");
        }

        return [];
      },
    },
    columns: [
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.id}</span>`;
        },
        name: "id",
      },
      {
        data: function (row) {
          let cardInfo = row.card || row.cardInfo || null;
          let cardName = row.cardName || (cardInfo ? cardInfo.name : null);

          if (!cardInfo && !cardName) {
            return `<span class="text-[13px] text-gray-400 dark:text-gray-500 font-normal">Kart yoxdur</span>`;
          }

          // Əgər card obyekti varsa, rəng və ikon göstər
          if (cardInfo && typeof cardInfo === "object") {
            const backgroundColor = cardInfo.background_color || "#CCCCCC";
            const cardIcon = cardInfo.icon || "";
            const displayName = cardInfo.name || cardName || "Kart";

            return `
              <div class="flex items-center gap-3">

                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">
                  ${displayName}
                </span>
              </div>`;
          } else {
            // Sadə mətn kimi göstər
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${cardName || "Kart"}</span>`;
          }
        },
        name: "cardName",
      },
      {
        data: function (row) {
          return `
                    <div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                        <span class="text-[13px] font-normal">${row.amount} ₼</span>
                    </div>`;
        },
        name: "amount",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.createdAt}</span>`;
        },
        name: "createdAt",
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 10,

    createdRow: function (row, data, dataIndex) {
      $(row)
        .find("td")
        .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

      $(row).find("td").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });
    },

    initComplete: function () {
      $("#myTableOn thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      $("#myTableOn thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages  dark:text-primary-text-color-dark"></div></div>'
        );
      });
    },

    drawCallback: function () {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination");

      $("#pageCount").text(
        `${pageInfo.recordsDisplay} / ${pageInfo.recordsTotal}`
      );

      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      }

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      $(".page-input")
        .off("keypress")
        .on("keypress", function (e) {
          if (e.which === 13) {
            goToPage();
          }
        });

      $(".go-button")
        .off("click")
        .on("click", function (e) {
          e.preventDefault();
          goToPage();
        });

      function goToPage() {
        const inputVal = $(".page-input").val().trim();
        const pageNum = parseInt(inputVal, 10);
        const pageInfo = table.page.info();

        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageInfo.pages) {
          table.page(pageNum - 1).draw("page");
        } else {
          table.page(0).draw("page");
        }

        $(".page-input").val("");
      }

      const $lastRow = $("#myTableOn tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0 ? "text-[#636B6F] cursor-not-allowed" : "text-messages dark:text-primary-text-color-dark"}" 
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left"></div>
                </div>
            `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
                    <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
                            ${i === pageInfo.page ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark" : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"}"
                            onclick="changePage(${i})">${i + 1}</button>
                `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "text-[#636B6F] cursor-not-allowed" : "text-tertiary-text dark:text-primary-text-color-dark"}" 
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right"></div>
                </div>
            `);
    },
  });

  window.openFilterModal = function () {
    const filterModal = $("#filterPop");
    const overlay = $("#overlay");

    if (filterModal.is(":visible")) {
      filterModal.hide();
      overlay.hide();
    } else {
      filterModal.show();
      overlay.show();

      // Initialize slider when modal opens
      setTimeout(function () {
        if (
          $("#slider-range").length > 0 &&
          !$("#slider-range").hasClass("ui-slider")
        ) {
          console.log("Initializing slider on modal open");
          initSlider();
        } else if (
          $("#slider-range").length > 0 &&
          $("#slider-range").hasClass("ui-slider")
        ) {
          console.log("Slider already initialized, refreshing...");
          // Refresh slider values
          $("#slider-range").slider("values", [
            globalMinAmount,
            globalMaxAmount,
          ]);
          $("#min-value").text(formatCurrency(globalMinAmount));
          $("#max-value").text(formatCurrency(globalMaxAmount));
        }
      }, 100);
    }
  };
  window.submitForm = function (type) {
    if (type === "filter") {
      console.log("Applying filters...");

      // Validate date inputs
      const startDate = $("#startDate").val();
      const endDate = $("#endDate").val();

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert("Başlanğıc tarixi bitiş tarixindən böyük ola bilməz!");
        return;
      }

      // Apply filters and redraw table
      table.draw();
      $("#filterPop").hide();
      $("#overlay").hide();
    }
  };

  window.clearFilters = function () {
    console.log("Clearing all filters...");

    // Очистить форму фильтров
    $("#filterForm")[0].reset();
    $("#filterForm input[type='checkbox']").prop("checked", false);

    // Очистить поиск
    $("#customSearch").val("");

    // Очистить таймаут поиска
    clearTimeout(searchTimeout);

    // Сбросить индикаторы поиска
    toggleSearchIndicators(false, false);

    // Reset slider to initial values
    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("values", [globalMinAmount, globalMaxAmount]);
      $("#min-value").text(formatCurrency(globalMinAmount));
      $("#max-value").text(formatCurrency(globalMaxAmount));
    } else {
      // If slider is not initialized, initialize it
      initSlider();
    }

    console.log("All filters cleared, redrawing table...");
    table.draw();
  };

  // Axtarış - улучшенный поиск
  let searchTimeout;

  // Функция для показа/скрытия индикаторов поиска
  function toggleSearchIndicators(showLoading = false, showClear = false) {
    if (showLoading) {
      $("#searchLoading").removeClass("hidden");
      $("#searchIcon").addClass("hidden");
    } else {
      $("#searchLoading").addClass("hidden");
      $("#searchIcon").removeClass("hidden");
    }

    if (showClear) {
      $("#clearSearch").removeClass("hidden");
    } else {
      $("#clearSearch").addClass("hidden");
    }
  }

  // Обработчик ввода в поле поиска
  $("#customSearch").on("keyup input", function () {
    const searchValue = $(this).val();
    console.log("Search input changed:", searchValue);

    // Показать кнопку очистки если есть текст
    toggleSearchIndicators(false, searchValue.length > 0);

    // Очистить предыдущий таймаут
    clearTimeout(searchTimeout);

    if (searchValue === "") {
      console.log("Search cleared");
      table.draw();
      return;
    }

    // Добавить задержку для избежания слишком частых запросов
    searchTimeout = setTimeout(function () {
      console.log("Executing search with value:", searchValue);
      toggleSearchIndicators(true, true);
      table.draw();
    }, 300); // 300ms задержка
  });

  // Обработчик кнопки очистки поиска
  $("#clearSearch").on("click", function () {
    console.log("Clear search button clicked");
    $("#customSearch").val("");
    toggleSearchIndicators(false, false);
    clearTimeout(searchTimeout);
    table.draw();
  });

  // Скрыть индикатор загрузки после завершения запроса
  $(document).on("draw.dt", function () {
    toggleSearchIndicators(false, $("#customSearch").val().length > 0);
  });

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    table.page(page).draw("page");
  };

  // Date picker function
  window.openDatePicker = function (id) {
    let input = document.getElementById(id);
    if (input.showPicker) {
      input.showPicker();
    }
  };

  // Initialize slider on page load with default values
  console.log("Checking for slider container...");
  console.log("Slider container found:", $("#slider-range").length > 0);
  console.log(
    "jQuery UI slider available:",
    typeof $.fn.slider !== "undefined"
  );

  function forceInitSlider() {
    if ($("#slider-range").length > 0 && typeof $.fn.slider !== "undefined") {
      console.log("Force initializing slider...");
      initSlider();
      $("#slider-fallback").addClass("hidden");
      return true;
    }
    return false;
  }

  // Global function for fallback button
  window.forceInitSlider = function () {
    return forceInitSlider();
  };

  // Show fallback button if slider doesn't initialize after 3 seconds
  setTimeout(function () {
    if (
      $("#slider-range").length > 0 &&
      !$("#slider-range").hasClass("ui-slider")
    ) {
      console.log("Showing fallback button for slider initialization");
      $("#slider-fallback").removeClass("hidden");
    }
  }, 3000);

  if ($("#slider-range").length > 0) {
    console.log(
      "Initializing slider with values:",
      globalMinAmount,
      globalMaxAmount
    );

    // Try immediate initialization
    if (typeof $.fn.slider !== "undefined") {
      console.log("jQuery UI slider available, initializing immediately...");
      initSlider();
    } else {
      console.log("jQuery UI slider not loaded, waiting...");
      // Try multiple times with different delays
      setTimeout(function () {
        if (!forceInitSlider()) {
          setTimeout(function () {
            if (!forceInitSlider()) {
              setTimeout(function () {
                forceInitSlider();
              }, 2000);
            }
          }, 1500);
        }
      }, 500);
    }
  } else {
    console.log("Slider container not found on page load");
  }

  // Also try to initialize when window loads completely
  $(window).on("load", function () {
    console.log("Window loaded, checking slider again...");
    setTimeout(function () {
      if (
        $("#slider-range").length > 0 &&
        !$("#slider-range").hasClass("ui-slider")
      ) {
        console.log(
          "Slider not initialized on window load, forcing initialization..."
        );
        forceInitSlider();
      }
    }, 500);
  });

  // ===== ФУНКЦИОНАЛЬНОСТЬ КНОПОК =====

  // Функция для открытия модального окна подтверждения
  window.odenishclick = function () {
    console.log("Opening confirmation modal...");
    const modal = $("#OdenisPopUp");
    const overlay = $("#overlay");

    if (modal.is(":visible")) {
      modal.hide();
      overlay.hide();
    } else {
      modal.show();
      overlay.show();
    }
  };

  // Функция для подтверждения отправки в Avankart
  window.confirmSendToAvankart = function () {
    console.log("Confirming send to Avankart...");

    // Получаем данные из формы
    const invoiceId = window.location.pathname.split("/").pop();
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    console.log("Invoice ID from URL:", invoiceId);
    console.log("CSRF Token:", csrfToken);
    console.log("Current URL:", window.location.pathname);

    // Проверяем, что invoice ID существует
    if (!invoiceId || invoiceId === "inside" || invoiceId === "hesablasmalar") {
      console.error("Invalid invoice ID:", invoiceId);
      alertModal("Xəta: Invoice ID tapılmadı", "error");
      return;
    }

    // Показываем индикатор загрузки
    const confirmButton = $("#OdenisPopUp button:last-child");
    const originalText = confirmButton.text();
    confirmButton.prop("disabled", true).text("Göndərilir...");

    // Отправляем запрос
    $.ajax({
      url: "/hesablashmalar/send-to-avankart",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: {
        invoice_id: invoiceId,
        invoice: invoiceId, // Добавляем оба варианта для совместимости
        _csrf: csrfToken,
      },
      success: function (response) {
        console.log("Successfully sent to Avankart:", response);

        // Закрываем модальное окно
        $("#OdenisPopUp").hide();
        $("#overlay").hide();

        // Показываем уведомление об успехе
        alertModal("Hesablaşma uğurla Avankart-a göndərildi!", "success");

        // Обновляем страницу через 2 секунды
        setTimeout(function () {
          window.location.reload();
        }, 2000);
      },
      error: function (xhr, status, error) {
        console.error("Error sending to Avankart:", error);
        console.error("XHR response:", xhr.responseText);
        console.error("Status:", status);

        // Восстанавливаем кнопку
        confirmButton.prop("disabled", false).text(originalText);

        // Пытаемся получить сообщение об ошибке из ответа
        let errorMessage = "Xəta baş verdi. Yenidən cəhd edin.";
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.message) {
            errorMessage = response.message;
          }
        } catch (e) {
          console.error("Could not parse error response:", e);
        }

        // Показываем уведомление об ошибке
        alertModal(errorMessage, "error");
      },
    });
  };

  // Функция для открытия модального окна отчета
  window.openReportModal = function (
    invoiceId,
    transactionCount,
    amount,
    date
  ) {
    console.log("Opening report modal...", {
      invoiceId,
      transactionCount,
      amount,
      date,
    });

    // Заполняем данные в модальном окне
    $("#reportInvoice").text(invoiceId);
    $("#reportTransactions").text(transactionCount);
    $("#reportAmount").text(amount + " AZN");
    $("#reportDate").text(date);
    $("#reportInvoiceId").val(invoiceId);

    // Показываем модальное окно
    $("#reportPopup").show();
    $("#overlay").show();
  };

  // Функция для закрытия модального окна отчета
  window.closeReportModal = function () {
    console.log("Closing report modal...");
    $("#reportPopup").hide();
    $("#overlay").hide();
  };

  // Функция для отправки отчета
  window.submitReport = function () {
    console.log("Submitting report...");

    const form = $("#reportForm");
    const formData = new FormData(form[0]);

    // Показываем индикатор загрузки
    const submitButton = form.find('button[type="submit"]');
    const originalText = submitButton.text();
    submitButton.prop("disabled", true).text("Göndərilir...");

    $.ajax({
      url: form.data("url"),
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        // Закрываем модальное окно
        closeReportModal();

        // Показываем уведомление об успехе
        alertModal("Report uğurla göndərildi!", "success");

        // Очищаем форму
        form[0].reset();
      },
      error: function (xhr, status, error) {
        console.error("Error submitting report:", error);

        // Восстанавливаем кнопку
        submitButton.prop("disabled", false).text(originalText);

        // Показываем уведомление об ошибке
        alertModal("Xəta baş verdi. Yenidən cəhd edin.", "error");
      },
    });
  };

  // Функция для показа уведомлений
  // function alertModal(message, type = "info") {
  //   const notification = $(`
  //     <div class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full">
  //       <div class="flex items-center gap-3">
  //         <div class="w-6 h-6 rounded-full flex items-center justify-center">
  //           ${type === "success"
  //       ? '<div class="icon stratis-check-01 text-white"></div>'
  //       : type === "error"
  //         ? '<div class="icon stratis-close-01 text-white"></div>'
  //         : '<div class="icon stratis-information-circle-contained text-white"></div>'
  //     }
  //         </div>
  //         <span class="text-white font-medium">${message}</span>
  //       </div>
  //     </div>
  //   `);

  //   // Добавляем стили в зависимости от типа
  //   const notificationDiv = notification.find("div").first();
  //   if (type === "success") {
  //     notificationDiv.addClass("bg-green-500");
  //   } else if (type === "error") {
  //     notificationDiv.addClass("bg-red-500");
  //   } else {
  //     notificationDiv.addClass("bg-blue-500");
  //   }

  //   $("body").append(notification);

  //   // Анимация появления
  //   setTimeout(() => {
  //     notification.removeClass("translate-x-full");
  //   }, 100);

  //   // Автоматическое скрытие через 5 секунд
  //   setTimeout(() => {
  //     notification.addClass("translate-x-full");
  //     setTimeout(() => {
  //       notification.remove();
  //     }, 300);
  //   }, 5000);
  // }

  // Обновляем функцию submitForm для обработки отчета
  const originalSubmitForm = window.submitForm;
  window.submitForm = function (type) {
    if (type === "report") {
      submitReport();
    } else {
      originalSubmitForm(type);
    }
  };

  // Добавляем обработчик для кнопки подтверждения в модальном окне
  $(document).on("click", "#OdenisPopUp button:last-child", function () {
    confirmSendToAvankart();
  });

  // Добавляем обработчик для кнопки "Нет" в модальном окне
  $(document).on("click", "#OdenisPopUp button:first-child", function () {
    odenishclick();
  });

  // Добавляем обработчик для закрытия модальных окон по клику на overlay
  $(document).on("click", "#overlay", function () {
    $("#OdenisPopUp").hide();
    $("#reportPopup").hide();
    $("#overlay").hide();
  });
});
