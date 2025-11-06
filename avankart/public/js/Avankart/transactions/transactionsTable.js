// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
let currentSearch = ""; // Глобальная переменная для поиска
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;
let originalMinAmount = 0; // Исходные значения для слайдера
let originalMaxAmount = 0; // Исходные значения для слайдера

// Performance monitoring
const performanceMonitor = {
  startTime: 0,
  endTime: 0,

  start() {
    this.startTime = performance.now();
  },

  end() {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  },

  log(operation, duration) {
    console.log(`[Performance] ${operation}: ${duration.toFixed(2)}ms`);
  },
};

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Load dynamic filter options
  loadFilterOptions();

  // Load transaction summary data
  loadTransactionSummary();

  function loadFilterOptions() {
    performanceMonitor.start();
    $.ajax({
      url: "/transactions/filter-options",
      type: "GET",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      success: function (response) {
        const duration = performanceMonitor.end();
        performanceMonitor.log("Filter Options Load", duration);

        if (response.success) {
          populateFilterDropdowns(response.data);
          if (response.cached) {
            console.log("[Cache] Filter options served from cache");
          }
        }
      },
      error: function (xhr, status, error) {
        performanceMonitor.end();
        console.error("Filter options loading failed:", error);
      },
    });
  }

  function populateFilterDropdowns(data) {
    // Populate card categories
    const cardCategoryContainer = $(
      ".flex.items-center.flex-wrap.gap-4"
    ).first();
    if (cardCategoryContainer.length && data.cardCategories) {
      // Clear existing checkboxes except the first few hardcoded ones
      cardCategoryContainer.find("label").remove();

      // Add dynamic card categories
      data.cardCategories.forEach((category, index) => {
        const checkboxId = `cbx-${category.toLowerCase().replace(/\s+/g, "-")}`;
        const label = $(`
          <label for="${checkboxId}" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
            <input type="checkbox" id="${checkboxId}" class="peer hidden" name="card_category" value="${category}">
            <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary 
                         peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
              <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <div>${category}</div>
          </label>
        `);
        cardCategoryContainer.append(label);
      });
    }

    // Populate subjects dropdown
    if (data.subjects && data.subjects.length > 0) {
      const subjectDropdown = $("#dropdown_subject");
      subjectDropdown.find("label").remove();

      data.subjects.forEach((subject, index) => {
        const checkboxId = `subyekt-${index}`;
        const label = $(`
          <label for="${checkboxId}" class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
            <input type="checkbox" id="${checkboxId}" class="peer hidden">
            <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
              <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span class="dark:text-white">${subject}</span>
          </label>
        `);
        subjectDropdown.append(label);
      });
    }

    // Populate users dropdown
    if (data.users && data.users.length > 0) {
      const usersDropdown = $("#dropdown_users");
      usersDropdown.find("label").remove();

      data.users.forEach((user, index) => {
        const checkboxId = `istifadeci-${index}`;
        const label = $(`
          <label for="${checkboxId}" class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:bg-[#161E22] dark:hover:bg-input-hover-dark">
            <input type="checkbox" id="${checkboxId}" class="peer hidden">
            <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
              <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span class="dark:text-white">${user.name} (ID: ${user.people_id})</span>
          </label>
        `);
        usersDropdown.append(label);
      });
    }
  }

  function loadTransactionSummary() {
    performanceMonitor.start();
    $.ajax({
      url: "/transactions/summary",
      type: "GET",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      success: function (response) {
        const duration = performanceMonitor.end();
        performanceMonitor.log("Transaction Summary Load", duration);

        if (response.success) {
          updateTransactionCards(response.data.groupedCards);
          updateTransactionCount(response.data.totalTransactions);

          if (response.cached) {
            console.log("[Cache] Transaction summary served from cache");
          }
        }
      },
      error: function (xhr, status, error) {
        performanceMonitor.end();
        console.error("Transaction summary loading failed:", error);
      },
    });
  }

  function updateTransactionCards(groupedCards) {
    // Update Mədaxil cards
    if (groupedCards["Mədaxil"] && groupedCards["Mədaxil"].cards) {
      updateCardSection("Mədaxil", groupedCards["Mədaxil"]);
    }

    // Update Məxaric cards
    if (groupedCards["Məxaric"] && groupedCards["Məxaric"].cards) {
      updateCardSection("Məxaric", groupedCards["Məxaric"]);
    }
  }

  function updateCardSection(category, categoryData) {
    const section = $(`.flex.flex-col.gap-1`).filter(function () {
      return $(this).find(".text-[13px].font-medium").text() === category;
    });

    if (section.length === 0) return;

    const cardsContainer = section.find(".flex.w-full").first();
    const totalContainer = section
      .find(
        ".flex.flex-col.flex-grow.whitespace-nowrap.justify-between.ml-\\[11px\\]"
      )
      .first();

    // Clear existing cards
    cardsContainer
      .find(".flex.flex-col.flex-grow.whitespace-nowrap.justify-between")
      .not(".ml-\\[11px\\]")
      .remove();

    // Add new cards
    categoryData.cards.forEach((card, index) => {
      const cardElement = $(`
        <div class="flex flex-col flex-grow whitespace-nowrap justify-between">
          <div class="text-[11px] font-normal text-messages opacity-50 mb-[6px]">
            ${card.label}
          </div>
          <div style="background-color: ${card.background_color};" class="flex justify-between items-center rounded-full h-[30px] w-full">
            <div class="text-[13px] font-medium text-messages pl-[16px]">
              ${parseFloat(card.total).toFixed(2)} AZN
            </div>
            <div class="text-[11px] font-normal text-messages opacity-65 pr-[8px]">
              ${card.percentage}%
            </div>
          </div>
        </div>
      `);

      // Insert before the total container
      cardElement.insertBefore(totalContainer);
    });

    // Update total
    if (totalContainer.length > 0) {
      totalContainer
        .find(".text-[13px].font-medium.text-messages.pl-\\[12px\\]")
        .text(`${parseFloat(categoryData.total).toFixed(2)} AZN`);
    }
  }

  function updateTransactionCount(count) {
    $(
      ".text-[15px].text-messages.dark\\:text-primary-text-color-dark.font-medium.pt-\\[5px\\]"
    ).each(function () {
      const text = $(this).text();
      if (text.includes("Tranzaksiyalar")) {
        $(this).text(`Tranzaksiyalar (${count})`);
      }
    });
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
    // Проверяем, что jQuery UI загружен
    if (typeof $.fn.slider === "undefined") {
      setTimeout(initSlider, 100);
      return;
    }

    // Проверяем, инициализирован ли уже слайдер
    if ($("#slider-range").hasClass("ui-slider")) {
      return;
    }

    // Устанавливаем минимальные и максимальные значения из исходных данных
    const minVal = originalMinAmount || 0;
    const maxVal = originalMaxAmount || 10000;

    $("#slider-range").slider({
      range: true,
      min: minVal,
      max: maxVal,
      values: [minVal, maxVal],
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      },
    });

    // İlk değerleri yaz
    $("#min-value").text(formatCurrency(minVal));
    $("#max-value").text(formatCurrency(maxVal));
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    // Show loading state
    showLoadingState();

    dataTable = $("#myTable").DataTable({
      searching: false, // Отключаем встроенный поиск DataTables
      ajax: {
        url: "/transactions",
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          const requestData = {
            user_id: $("#userId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            query: currentSearch, // Добавляем глобальный поиск
            ...currentFilters, // filtre varsa buradan gelmeli
          };
          return JSON.stringify(requestData);
        },
        dataSrc: function (json) {
          // Hide loading state
          hideLoadingState();

          // Update transaction count
          $("#tr_counts").html(json.data.length ?? 0);

          // Check if data is empty
          if (!json.data || json.data.length === 0) {
            showEmptyState();
            return json.data;
          } else {
            hideEmptyState();
          }

          // Проверяем, инициализирован ли уже слайдер
          const sliderInitialized = $("#slider-range").hasClass("ui-slider");

          if (json.data && json.data.length > 0) {
            const amounts = json.data.map((tr) => parseFloat(tr.amount));
            if (amounts.length > 0) {
              const newMinAmount = Math.min(...amounts);
              const newMaxAmount = Math.max(...amounts);

              // Сохраняем исходные значения только при первой загрузке
              if (originalMinAmount === 0 && originalMaxAmount === 0) {
                originalMinAmount = newMinAmount;
                originalMaxAmount = newMaxAmount;
                globalMinAmount = newMinAmount;
                globalMaxAmount = newMaxAmount;
              }

              // Обновляем глобальные значения для фильтрации
              globalMinAmount = newMinAmount;
              globalMaxAmount = newMaxAmount;

              // Инициализируем слайдер только если он еще не инициализирован
              if (!sliderInitialized) {
                setTimeout(() => {
                  initSlider();
                }, 100);
              }
            }
          }
          return json.data;
        },
        error: function (xhr, error, thrown) {
          console.error("DataTable error:", error, thrown);
          console.error("Response:", xhr.responseText);

          // Hide loading state and show error state
          hideLoadingState();
          showErrorState();
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 10,
      columns: [
        {
          data: null,
          render: function (data, type, row) {
            // from sahəsi
            const fromName = row.from?.name || "";
            const fromSurname = row.from?.surname || "";
            const fromUserId = row.from?.people_id || "";

            // user sahəsi
            const userName = row.user?.name || "";
            const userSurname = row.user?.surname || "";
            const userId = row.user?.partnyor_id || "";

            let displayName = "";
            let displayId = "";

            if (fromName || fromSurname || fromUserId) {
              // from varsa onu göstər
              displayName = `${fromName} ${fromSurname}`.trim();
              displayId = `ID: ${fromUserId}`;
            } else if (userName || userId) {
              // əks halda user göstər
              displayName = `${userName} ${userSurname}`.trim();
              displayId = `ID: ${userId}`;
            }

            return `
              <div class="flex flex-col items-start gap-[2px]">
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">
                  ${displayName}
                </span>
                <span class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-normal">
                  ${displayId}
                </span>
              </div>
            `;
          },
        },
        {
          data: "transactionId",
          render: function (data, type, row) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (row.transaction_id || "—") +
              "</span>"
            );
          },
        },
        {
          data: "destination",

          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "cards",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data?.name || "—") +
              "</span>"
            );
          },
        },
        {
          data: "amount",
          render: function (data, type, row) {
            let amount = parseFloat(data);
            let prefix = amount >= 0 ? "" : "";
            let colorClass = "text-[#1D222B]";

            if (row.status === "Uğursuz" || amount < 0) {
              colorClass = "text-[#DD3838]";
            }

            return `<span class="text-[13px] ${colorClass} font-normal">${prefix}${amount.toFixed(
              2
            )} ₼</span>`;
          },
        },
        {
          data: "from_sirket",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data ? data.sirket_name : "-"}</span>`;
          },
        },
        {
          data: "date",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
        {
          data: "status",
          render: function (data, type, row) {
            let colorDot = "";
            let textColor = "";
            let infoIconHTML = "";

            if (data === "uğurlu" || data === "gözləmədə") {
              colorDot = "bg-[#5BBE2D]";
              textColor = "text-[#5BBE2D]";
            } else if (data === "uğursuz") {
              colorDot = "bg-[#DD3838]";
              textColor = "text-[#DD3838]";
              infoIconHTML = `
                <div class="tooltip w-[20px] h-[20px] rounded-full flex items-center justify-center cursor-pointer relative">
                    <div onmouseover="showErrorTooltip(this)" data-error="Sistemlə əlaqə saxlanıla bilmədi!"
                    class="iconex iconex-info-circle-1 w-5 h-5 text-[#D93E35] font-semibold relative">
                    </div>
                </div>
                `;
            } else {
              colorDot = "bg-[#BFC8CC]";
              textColor = "text-messages dark:text-primary-text-color-dark";
            }

            return `
                <div class="flex justify-between items-center px-3 py-[5px] rounded-full w-full max-w-[240px] whitespace-nowrap text-ellipsis">
                    <div class="flex items-center gap-2 flex-1 overflow-hidden">
                        <span class="w-[6px] h-[6px] rounded-full ${colorDot} shrink-0"></span>
                        <span class="text-[13px] ${textColor} font-medium overflow-hidden text-ellipsis">${data}</span>
                    </div>
                    ${infoIconHTML}
                </div>
            `;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changePage(' +
            Math.max(0, pageInfo.page - 1) +
            ')">' +
            '<div class="icon stratis-chevron-left text-xs"></div>' +
            "</div>"
        );

        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
          paginationButtons +=
            '<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ' +
            (i === pageInfo.page
              ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
              : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark") +
            '" onclick="changePage(' +
            i +
            ')">' +
            (i + 1) +
            "</button>";
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === pageInfo.pages - 1
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changePage(' +
            Math.min(pageInfo.page + 1, pageInfo.pages - 1) +
            ')">' +
            '<div class="icon stratis-chevron-right text-xs"></div>' +
            "</div>"
        );
      },
      createdRow: function (row, data, dataIndex) {
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          })
          .on("mouseleave", function () {
            $(this).css("background-color", "");
          });

        $(row)
          .find("td")
          .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

        $(row).find("td:not(:last-child)").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "right",
        });
      },
    });
  }

  // Функция для получения исходных значений слайдера
  function getOriginalSliderValues() {
    $.ajax({
      url: "/transactions",
      type: "POST",
      contentType: "application/json",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      data: JSON.stringify({
        user_id: $("#userId").val(),
        draw: 1,
        start: 0,
        length: 1000, // Получаем больше данных для точного определения диапазона
        search: "",
        query: "",
        // Без фильтров для получения полного диапазона
      }),
      success: function (response) {
        if (response.data && response.data.length > 0) {
          const amounts = response.data.map((tr) => parseFloat(tr.amount));
          if (amounts.length > 0) {
            originalMinAmount = Math.min(...amounts);
            originalMaxAmount = Math.max(...amounts);
            globalMinAmount = originalMinAmount;
            globalMaxAmount = originalMaxAmount;

            // Инициализируем слайдер с правильными значениями
            setTimeout(() => {
              initSlider();
            }, 100);
          }
        }
      },
      error: function (xhr, error, thrown) {
        // Fallback значения
        originalMinAmount = 0;
        originalMaxAmount = 10000;
        setTimeout(() => {
          initSlider();
        }, 100);
      },
    });
  }

  // Initialize DataTable
  initializeDataTable();

  // Получаем исходные значения для слайдера
  getOriginalSliderValues();
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};
document.getElementById("reloadBtn").addEventListener("click", () => {
  window.location.reload();
});

// Filter modal functions
window.openFilterModal = function () {
  if ($("#filterPop").hasClass("hidden")) {
    $("#filterPop").removeClass("hidden");
  } else {
    $("#filterPop").addClass("hidden");
  }
};

window.closeFilterModal = function () {
  $("#filterPop").addClass("hidden");
};

// Dropdown functions
window.toggleDropdown_subject = function () {
  const dropdown = document.getElementById("dropdown_subject");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

window.toggleDropdown_users = function () {
  const dropdown = document.getElementById("dropdown_users");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

// Bu funksiyalar dropdown menyuları xaricində hər hansı bir yerə basıldıqda bağlamaq üçündür
document.addEventListener("click", function (event) {
  const subjectDropdown = document.getElementById("dropdown_subject");
  const usersDropdown = document.getElementById("dropdown_users");
  const subjectButton = document.getElementById(
    "dropdownDefaultButton_subject"
  );
  const usersButton = document.getElementById("dropdownDefaultButton_users");

  if (
    !subjectButton.contains(event.target) &&
    !subjectDropdown.contains(event.target)
  ) {
    subjectDropdown.classList.add("hidden");
    subjectDropdown.classList.remove("visible");
  }

  if (
    !usersButton.contains(event.target) &&
    !usersDropdown.contains(event.target)
  ) {
    usersDropdown.classList.add("hidden");
    usersDropdown.classList.remove("visible");
  }
});

// Apply filters function
window.applyFilters = function () {
  // Filterləri sıfırla
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  // Валидация дат
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Başlanğıc tarixi son tarixdən böyük ola bilməz!");
      return;
    }
  }

  // Форматируем даты в ISO формат для отправки на сервер
  if (startDate) {
    const formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    currentFilters.start_date = formattedStartDate;
  }

  if (endDate) {
    const formattedEndDate = new Date(endDate).toISOString().split("T")[0];
    currentFilters.end_date = formattedEndDate;
  }

  // Subyektləri al - HIDDEN
  // const subjects = [];
  // $('#dropdown_subject input[type="checkbox"]:checked').each(function () {
  //   const subjectId = $(this).attr("id");
  //   subjects.push(subjectId.replace("subyekt-", ""));
  // });

  // if (subjects.length > 0) {
  //   currentFilters.subjects = subjects;
  // }

  // İstifadəçiləri al - HIDDEN
  // const users = [];
  // $('#dropdown_users input[type="checkbox"]:checked').each(function () {
  //   const userId = $(this).attr("id");
  //   users.push(userId.replace("istifadeci-", ""));
  // });

  // if (users.length > 0) {
  //   currentFilters.users = users;
  // }

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });

  if (cardCategories.length > 0) {
    currentFilters.card_category = cardCategories;
  }

  // Təyinatı al
  const cardDestinations = [];
  $('input[name="card_destination"]:checked').each(function () {
    cardDestinations.push($(this).val());
  });

  if (cardDestinations.length > 0) {
    currentFilters.destination = cardDestinations;
  }

  // Statusları al
  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    cardStatus.push($(this).val());
  });

  //   if (cardStatus.length > 0) {
  //     currentFilters.card_status =
  //       cardStatus.length === 1 ? cardStatus[0] : cardStatus;
  //   }

  if (cardStatus.length > 0) {
    currentFilters.status = cardStatus;
  }

  // Məbləğ aralığını al (slider)
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
  }

  // Məlumat cədvəlini yenilə
  if (dataTable) {
    console.log("Reloading DataTable...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable reload completed");
      console.log("Received data:", json);
    }, false);
  } else {
    console.log("DataTable is null, cannot reload");
  }

  // Filter modalını bağla
  $("#filterPop").addClass("hidden");
};

// Clear filters function
window.clearFilters = function () {
  console.log("=== Clearing filters ===");

  // Reset form
  $("#filterForm")[0].reset();
  $("#startDate").val("");
  $("#endDate").val("");

  // Очищаем поля дат
  $('input[name="start_date"]').val("");
  $('input[name="end_date"]').val("");
  // Don't reset hidden fields for istifadəçi and subyekt
  $(
    'input[type="checkbox"]:not([id^="subyekt-"]):not([id^="istifadeci-"])'
  ).prop("checked", false);

  // Сброс слайдера к исходным значениям
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [
      originalMinAmount || 0,
      originalMaxAmount || 10000,
    ]);
    $("#min-value").text(formatCurrency(originalMinAmount || 0));
    $("#max-value").text(formatCurrency(originalMaxAmount || 10000));
  }

  // Clear filters
  currentFilters = {};

  // Reload DataTable
  if (dataTable) {
    console.log("Reloading DataTable after clearing filters...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable clear and reload completed");
    }, true);
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

// Дебаунс функция для поиска
let searchTimeout;
function performSearch() {
  const searchValue = $("#customSearch").val();
  currentSearch = searchValue;

  if (dataTable) {
    dataTable.ajax.reload(null, true); // Перезагружаем с сервера, сбрасываем пагинацию
  }
}

// Search inputuna event listener с дебаунсом
$("#customSearch").on("keyup", function (e) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(function () {
    performSearch();
  }, 300); // 300ms дебаунс
});

// Sehifeler arasi kecid GO button ile
$(".go-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".page-input");
  let pageNumber = parseInt(pageInput.val());

  // Input sahəsini hər halda təmizləyirik
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (dataTable) {
      const pageInfo = dataTable.page.info();
      let dataTablePage = pageNumber - 1;

      if (dataTablePage < pageInfo.pages) {
        // Səhifə mövcuddursa, keçid edir
        dataTable.page(dataTablePage).draw("page");
      } else {
        // Səhifə mövcud deyilsə, xəta yazır
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    // Etibarsız girişdə xəta yazır
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

// Əvvəlcə, tooltipi göstərmək üçün olan funksiyanızı yeniləyək
window.showErrorTooltip = function (element) {
  // Əgər tooltip artıq mövcuddursa, onu silir
  if ($("#error-tooltip").length) {
    $("#error-tooltip").remove();
  }

  // Elementin data-error atributundan səhv mesajını alır
  const errorMessage = $(element).data("error");
  if (!errorMessage) return;

  // Yeni bir tooltip elementi yaradır
  const tooltip = $(
    `<div id="error-tooltip" class="absolute z-50 p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg -bottom-10 right-0 whitespace-nowrap">
      ${errorMessage}
      <div class="tooltip-arrow absolute w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-gray-800 -top-[33%] right-2"></div>
    </div>`
  );

  // Tooltipi elementin yanına əlavə edir
  $(element).parent().append(tooltip);
};

// Mouse elementin üzərindən çəkiləndə tooltipi silmək üçün funksiya
$(document).on("mouseleave", ".tooltip", function () {
  $("#error-tooltip").remove();
});

// State management functions
function showLoadingState() {
  $("#loadingState").removeClass("hidden");
  $("#errorState").addClass("hidden");
  $("#emptyState").addClass("hidden");
  $("#myTable").addClass("hidden");
}

function hideLoadingState() {
  $("#loadingState").addClass("hidden");
}

function showErrorState() {
  $("#errorState").removeClass("hidden");
  $("#emptyState").addClass("hidden");
  $("#myTable").addClass("hidden");
}

function hideErrorState() {
  $("#errorState").addClass("hidden");
}

function showEmptyState() {
  $("#emptyState").removeClass("hidden");
  $("#errorState").addClass("hidden");
  $("#myTable").addClass("hidden");
}

function hideEmptyState() {
  $("#emptyState").addClass("hidden");
  $("#myTable").removeClass("hidden");
}

// Retry function
window.retryLoad = function () {
  hideErrorState();
  if (dataTable) {
    dataTable.ajax.reload();
  } else {
    initializeDataTable();
  }
};

// Export functionality
window.exportTransactions = function () {
  // Show loading state for export
  const originalText = $(".export-button span").text();
  $(".export-button span").text("Export edilir...");
  $(".export-button").prop("disabled", true);

  // Prepare export data with current filters
  const exportData = {
    ...currentFilters,
    query: currentSearch,
    export: true,
    format: "excel",
  };

  // Create form for export
  const form = $("<form>", {
    method: "POST",
    action: "/transactions/export",
  });

  // Add CSRF token
  form.append(
    $("<input>", {
      type: "hidden",
      name: "_csrf",
      value: $('meta[name="csrf-token"]').attr("content"),
    })
  );

  // Add export data
  Object.keys(exportData).forEach((key) => {
    if (exportData[key] !== undefined && exportData[key] !== null) {
      if (Array.isArray(exportData[key])) {
        exportData[key].forEach((value) => {
          form.append(
            $("<input>", {
              type: "hidden",
              name: key,
              value: value,
            })
          );
        });
      } else {
        form.append(
          $("<input>", {
            type: "hidden",
            name: key,
            value: exportData[key],
          })
        );
      }
    }
  });

  // Submit form
  $("body").append(form);
  form.submit();
  form.remove();

  // Reset button state after a delay
  setTimeout(() => {
    $(".export-button span").text(originalText);
    $(".export-button").prop("disabled", false);
  }, 2000);
};

// Real-time data refresh
function startAutoRefresh() {
  // Refresh every 30 seconds
  setInterval(() => {
    if (!$("#loadingState").is(":visible")) {
      // Refresh transaction summary cards
      loadTransactionSummary();

      // Refresh data table if it exists
      if (dataTable) {
        dataTable.ajax.reload(null, false); // Don't reset pagination
      }
    }
  }, 30000);
}

// Initialize auto-refresh
startAutoRefresh();

// Manual cache invalidation for debugging
window.invalidateCache = function () {
  $.ajax({
    url: "/transactions/invalidate-cache",
    type: "POST",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      if (response.success) {
        console.log("[Cache] Cache invalidated successfully");
        // Reload data with fresh cache
        loadTransactionSummary();
        loadFilterOptions();
        if (dataTable) {
          dataTable.ajax.reload();
        }
      }
    },
    error: function (xhr, status, error) {
      console.error("Cache invalidation failed:", error);
    },
  });
};

// Enhanced reload function with visual feedback
document.getElementById("reloadBtn").addEventListener("click", () => {
  // Add loading animation to reload button
  const reloadBtn = document.getElementById("reloadBtn");
  const originalContent = reloadBtn.innerHTML;

  reloadBtn.innerHTML = `
    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
    <span>Yenilənir...</span>
  `;
  reloadBtn.style.pointerEvents = "none";

  // Reload data
  // Refresh transaction summary first
  loadTransactionSummary();

  if (dataTable) {
    dataTable.ajax.reload(function (json) {
      // Reset button after reload
      setTimeout(() => {
        reloadBtn.innerHTML = originalContent;
        reloadBtn.style.pointerEvents = "auto";
      }, 1000);
    }, true);
  } else {
    // Reset button if no dataTable
    setTimeout(() => {
      reloadBtn.innerHTML = originalContent;
      reloadBtn.style.pointerEvents = "auto";
    }, 1000);
  }
});
