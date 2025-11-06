// Global dəyişənlər
let enterpriseCategoriesTable = null;
let enterpriseCategoriesFilters = {};
let globalMinAmountEnterpriseCategories = 0;
let globalMaxAmountEnterpriseCategories = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function initSliderEnterprise() {
    if ($("#slider-range-enterprise").hasClass("ui-slider")) {
      $("#slider-range-enterprise").slider("destroy");
    }
    $("#slider-range-enterprise").slider({
      range: true,
      min: globalMinAmountEnterpriseCategories,
      max: globalMaxAmountEnterpriseCategories,
      values: [
        globalMinAmountEnterpriseCategories,
        globalMaxAmountEnterpriseCategories,
      ],
      slide: function (event, ui) {
        $("#min-value-enterprise").text(ui.values[0]);
        $("#max-value-enterprise").text(ui.values[1]);
      },
    });

    // İlk göstəriş üçün birbaşa slider-in hazır qiymətlərini al
    const initialValues = $("#slider-range-enterprise").slider("values");
    $("#min-value-enterprise").text(initialValues[0]);
    $("#max-value-enterprise").text(initialValues[1]);
  }

  function initializeEnterpriseCategoriesTable() {
    if ($.fn.DataTable.isDataTable("#enterpriseCategoriesTable")) {
      enterpriseCategoriesTable.destroy();
    }

    enterpriseCategoriesTable = $("#enterpriseCategoriesTable").DataTable({
      ajax: {
        url: "/avankartaz/muracietler-kateqoriya",
        type: "GET",
        headers: { "X-CSRF-Token": csrfToken },
        data: function (d) {
          const params = {
            lang: 'az',
            page: Math.floor(d.start / d.length) + 1,
            limit: d.length,
            search: d.search.value,
            ...enterpriseCategoriesFilters,
          };
          return params;
        },
        dataSrc: function (json) {
          if (json.success && json.data) {
            // Update pagination info
            if (json.pagination) {
              json.recordsTotal = json.pagination.total;
              json.recordsFiltered = json.pagination.total;
            }
            return json.data;
          }
          return [];
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [[1, 'desc']],
      lengthChange: true,
      pageLength: 3,
      columns: [
        {
          data: "title",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "createdAt",
          render: function (data) {
            if (!data) return '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">—</span>';
            const date = new Date(data);
            const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const formatted = `${day} ${month} ${year}`;
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              formatted +
              "</span>"
            );
          },
        },
        {
          data: function (row) {
            const rowDataEscaped = JSON.stringify(row).replace(/"/g, '&quot;');
            return `
              <div id="wrapper" class="relative inline-block text-left">
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages text-base cursor-pointer z-100"></div>

                <div class="hidden absolute right-[-12px] max-w-[244px] z-50 dropdown-menu">

                  <div class="relative h-[8px]">
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>

                  <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
                    <div class="py-[3.5px] text-sm">
                       <div onclick='toggleEditModal(${JSON.stringify(row)})' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-edit-03 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Redaktə et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                 <div onclick='toggleDeleteModal("${row._id}")' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                  <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                  <span class="font-medium text-error text-[13px] whitespace-nowrap">Sil</span>
                </div>
                    </div>
                  </div>
                </div>
              </div>
            `;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = enterpriseCategoriesTable.page.info();
        const $pagination = $("#enterpriseCategoriesPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#enterpriseCategoriesPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        // Left arrow
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeEnterpriseCategoriesPage(${Math.max(
            0,
            pageInfo.page - 1
          )})">
              <div class="icon stratis-chevron-left text-xs"></div>
           </div>`
        );

        // Page buttons
        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
          paginationButtons += `
            <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${
              i === pageInfo.page
                ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
            }" onclick="changeEnterpriseCategoriesPage(${i})">
              ${i + 1}
            </button>
          `;
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        // Right arrow
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === pageInfo.pages - 1
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeEnterpriseCategoriesPage(${Math.min(
            pageInfo.page + 1,
            pageInfo.pages - 1
          )})">
              <div class="icon stratis-chevron-right text-xs"></div>
           </div>`
        );
      },
      createdRow: function (row, data, dataIndex) {
        const isDark = $("html").hasClass("dark");

        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            if (!$(this).hasClass("row-selected")) {
              $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
            }
          })
          .on("mouseleave", function () {
            if (!$(this).hasClass("row-selected")) {
              $(this).css("background-color", "");
            }
          });

        // Bütün td-lər üçün alt border və padding
        $(row).find("td").css({
          "border-bottom": ".5px solid #E5E5E5",
          "padding-left": "10px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        // Checkbox içindəki label üçün
        $(row).find("td:first-child label").css({
          margin: "0 auto", // horizontal ortala
        });
      },
    });
  }

  initializeEnterpriseCategoriesTable();
});

// Pagination
window.changeEnterpriseCategoriesPage = function (page) {
  if (enterpriseCategoriesTable) {
    enterpriseCategoriesTable.page(page).draw("page");
  }
};

// Filter modal functions
window.toggleEnterpriseCategoriesFilterModal = function () {
  if ($("#enterpriseCategoriesFilterPop").hasClass("hidden")) {
    $("#enterpriseCategoriesFilterPop").removeClass("hidden");
  } else {
    $("#enterpriseCategoriesFilterPop").addClass("hidden");
  }
};

// Apply filters function for Enterprise Categories
window.applyEnterpriseCategoriesFilters = function () {
  console.log("=== Applying Enterprise Categories filters ===");

  // Filterləri sıfırla
  enterpriseCategoriesFilters = {};

  // Tarix aralığını al
  const startDate = $("#enterpriseCategoriesStartDate").val();
  const endDate = $("#enterpriseCategoriesEndDate").val();

  if (startDate) {
    enterpriseCategoriesFilters.startDate = startDate;
  }

  if (endDate) {
    enterpriseCategoriesFilters.endDate = endDate;
  }

  console.log("New enterpriseCategoriesFilters:", enterpriseCategoriesFilters);

  // enterprise Categories cədvəlini yenilə
  if (enterpriseCategoriesTable) {
    enterpriseCategoriesTable.ajax.reload(function (json) {
      console.log("Enterprise Categories DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#enterpriseCategoriesFilterPop").addClass("hidden");
};

// Clear filters function for Enterprise Categories
window.clearEnterpriseCategoriesFilters = function () {
  console.log("=== Clearing Enterprise Categories filters ===");

  // Reset form
  $("#enterpriseCategoriesFilterForm")[0].reset();
  $("#enterpriseCategoriesStartDate").val("");
  $("#enterpriseCategoriesEndDate").val("");
  $('#enterpriseCategoriesFilterForm input[type="checkbox"]').prop(
    "checked",
    false
  );

  // Clear filters
  enterpriseCategoriesFilters = {};

  // Enterprise Categories cədvəlini yenilə
  if (enterpriseCategoriesTable) {
    console.log(
      "Reloading Enterprise Categories DataTable after clearing filters..."
    );
    enterpriseCategoriesTable.ajax.reload(function (json) {
      console.log("Enterprise Categories DataTable clear and reload completed");
    }, true);
  }
};

// Search
function performEnterpriseCategoriesSearch() {
  const searchValue = $("#enterpriseCategoriesSearch").val();
  if (enterpriseCategoriesTable) {
    enterpriseCategoriesTable.search(searchValue).draw();
  }
}

$("#enterpriseCategoriesSearch").on("keyup", performEnterpriseCategoriesSearch);

// GO button
$(".enterprise-categories-go-button").on("click", function (e) {
  e.preventDefault();
  const pageInput = $(this).siblings(".enterprise-categories-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");
  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (enterpriseCategoriesTable) {
      const pageInfo = enterpriseCategoriesTable.page.info();
      let dataTablePage = pageNumber - 1;
      if (dataTablePage < pageInfo.pages) {
        enterpriseCategoriesTable.page(dataTablePage).draw("page");
      } else {
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");

  // Xaricə kliklənəndə bağla
  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

window.toggleDeleteModal = function () {
  if ($("#deleteModal").hasClass("hidden")) {
    $("#deleteModal").removeClass("hidden");
  } else {
    $("#deleteModal").addClass("hidden");
  }
};

window.toggleEditModal = function (rowData = null) {
  const modal = $("#editModal");
  const modalTitle = modal.find("#modal-title");
  const modalDescription = modal.find("#modal-description");
  const categoryInput = modal.find("#categoryInput");
  const saveButton = modal.find("#saveButton");

  if (modal.hasClass("hidden")) {
    // Modalı aç
    modal.removeClass("hidden");

    if (rowData) {
      // REDAKTƏ REJİMİ
      // Başlıq və düymə mətnini dəyiş
      modalTitle.text("Redaktə et");
      saveButton.find("span").text("Dəyişikliyi təsdiqlə");

      // Input-a mövcud kateqoriya adını yaz
      categoryInput.val(rowData.category);

      // Burda digər dataları da yükləyə bilərsiniz (məsələn, dilə görə məlumat)
    } else {
      // YENİ YARATMA REJİMİ
      // Başlıq və düymə mətnini ilkin vəziyyətinə qaytar
      modalTitle.text("Yeni kateqoriya");
      saveButton.find("span").text("Yarat");

      // Input-u sıfırla
      categoryInput.val("");
    }

    // Dil düymələrini vəziyyətini sıfırla (default olaraq Azərbaycan seçili)
    const langButtons = modal.find(".lang-btn");
    langButtons
      .removeClass(
        "active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark"
      )
      .addClass(
        "text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark"
      );

    langButtons
      .first()
      .addClass(
        "active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark"
      )
      .removeClass(
        "text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark"
      );
  } else {
    // Modalı bağla
    modal.addClass("hidden");
  }
};

// Dil düymələrinin aktiv/deaktiv vəziyyətini idarə edən funksiya
window.toggleLanguage = function (element) {
  const parent = $(element).closest(".flex"); // Valideyn div-i tap
  parent.find(".lang-btn").each(function () {
    // Bütün düymələri sıfırla
    $(this)
      .removeClass(
        "active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark"
      )
      .addClass(
        "text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark"
      );
  });
  // Basılan düyməni aktiv et
  $(element)
    .addClass(
      "active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark"
    )
    .removeClass(
      "text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark"
    );
};

// Global dəyişənlər - edit və delete üçün
let currentEditingCategory = null;
let currentDeletingCategoryId = null;
let categoryTitles = { az: '', tr: '', en: '', ru: '' };

// Toggle Edit Modal with full data support
window.toggleEditModal = function (rowData = null) {
  const modal = $("#editModal");
  const modalTitle = modal.find("#modal-title");
  const categoryInput = modal.find("#categoryInput");
  const saveButton = modal.find("#saveButton");
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  if (modal.hasClass("hidden")) {
    modal.removeClass("hidden");

    if (rowData && rowData._id) {
      // REDAKTƏ REJİMİ
      currentEditingCategory = rowData;
      modalTitle.text("Redaktə et");
      saveButton.find("span").text("Dəyişikliyi təsdiqlə");

      // Backend-dən tam məlumatı al
      $.ajax({
        url: `/avankartaz/muracietler-kateqoriya/${rowData._id}/edit`,
        type: "GET",
        headers: { "X-CSRF-Token": csrfToken },
        success: function (response) {
          if (response.success && response.data.category) {
            const category = response.data.category;
            categoryTitles = category.title;

            // Default Azərbaycan dilini göstər
            categoryInput.val(category.title.az || '');
          }
        },
        error: function (xhr) {
          console.error("Kateqoriya məlumatları yüklənə bilmədi:", xhr);
          alertModal("Xəta baş verdi!", "error");
        }
      });
    } else {
      // YENİ YARATMA REJİMİ
      currentEditingCategory = null;
      categoryTitles = { az: '', tr: '', en: '', ru: '' };
      modalTitle.text("Yeni kateqoriya");
      saveButton.find("span").text("Yarat");
      categoryInput.val("");
    }

    // Dil düymələrini sıfırla (Azərbaycan seçili)
    const langButtons = modal.find(".lang-btn");
    langButtons.removeClass("active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark")
      .addClass("text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark");
    langButtons.first().addClass("active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark")
      .removeClass("text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark");
  } else {
    modal.addClass("hidden");
  }
};

// Dil dəyişdirəndə input dəyərini yenilə
$(document).on('click', '.lang-btn', function() {
  const currentLang = $(this).text().trim();
  const categoryInput = $("#categoryInput");
  const activeLangBtn = $(".lang-btn.active");

  // Cari dilin dəyərini saxla
  const currentActiveLang = activeLangBtn.text().trim();
  let langCode = 'az';
  if (currentActiveLang === 'Türkçə') langCode = 'tr';
  else if (currentActiveLang === 'English') langCode = 'en';
  else if (currentActiveLang === 'Russian') langCode = 'ru';

  categoryTitles[langCode] = categoryInput.val();

  // Yeni dilin dəyərini göstər
  let newLangCode = 'az';
  if (currentLang === 'Türkçə') newLangCode = 'tr';
  else if (currentLang === 'English') newLangCode = 'en';
  else if (currentLang === 'Russian') newLangCode = 'ru';

  categoryInput.val(categoryTitles[newLangCode] || '');
});

// Save Button Handler
$("#saveButton").on("click", function() {
  const categoryInput = $("#categoryInput");
  const activeLangBtn = $(".lang-btn.active");
  const currentLang = activeLangBtn.text().trim();
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Cari dilin dəyərini saxla
  let langCode = 'az';
  if (currentLang === 'Türkçə') langCode = 'tr';
  else if (currentLang === 'English') langCode = 'en';
  else if (currentLang === 'Russian') langCode = 'ru';

  categoryTitles[langCode] = categoryInput.val();

  // Validate - bütün dillər doldurulmalıdır
  if (!categoryTitles.az || !categoryTitles.tr || !categoryTitles.en || !categoryTitles.ru) {
    alertModal("Zəhmət olmasa bütün dillərdə kateqoriya adını daxil edin!", "warning");
    return;
  }

  const requestData = {
    title: categoryTitles
  };

  if (currentEditingCategory) {
    // UPDATE
    $.ajax({
      url: `/avankartaz/muracietler-kateqoriya/${currentEditingCategory._id}`,
      type: "PUT",
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestData),
      success: function(response) {
        if (response.success) {
          alertModal("Kateqoriya uğurla yeniləndi!", "success");
          toggleEditModal();
          if (enterpriseCategoriesTable) {
            enterpriseCategoriesTable.ajax.reload();
          }
        }
      },
      error: function(xhr) {
        console.error("Update xətası:", xhr);
        alertModal("Kateqoriya yenilənərkən xəta baş verdi!", "error");
      }
    });
  } else {
    // CREATE
    $.ajax({
      url: "/avankartaz/muracietler-kateqoriya",
      type: "POST",
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestData),
      success: function(response) {
        if (response.success) {
          alertModal("Kateqoriya uğurla yaradıldı!", "success");
          toggleEditModal();
          if (enterpriseCategoriesTable) {
            enterpriseCategoriesTable.ajax.reload();
          }
        }
      },
      error: function(xhr) {
        console.error("Create xətası:", xhr);
        const errorMsg = xhr.responseJSON?.message || "Kateqoriya yaradılarkən xəta baş verdi!";
        alertModal(errorMsg, "error");
      }
    });
  }
});

// Delete Modal
window.toggleDeleteModal = function(categoryId = null) {
  const modal = $("#deleteModal");

  if (modal.hasClass("hidden")) {
    currentDeletingCategoryId = categoryId;
    modal.removeClass("hidden");
  } else {
    modal.addClass("hidden");
    currentDeletingCategoryId = null;
  }
};

// Delete Confirmation
$("#deleteModal").find("button").last().on("click", function() {
  if (!currentDeletingCategoryId) {
    alertModal("Silinəcək kateqoriya seçilməyib!", "warning");
    return;
  }

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: `/avankartaz/muracietler-kateqoriya/${currentDeletingCategoryId}`,
    type: "DELETE",
    headers: { "X-CSRF-Token": csrfToken },
    success: function(response) {
      if (response.success) {
        alertModal("Kateqoriya uğurla silindi!", "success");
        toggleDeleteModal();
        if (enterpriseCategoriesTable) {
          enterpriseCategoriesTable.ajax.reload();
        }
      }
    },
    error: function(xhr) {
      console.error("Delete xətası:", xhr);
      alertModal("Kateqoriya silinərkən xəta baş verdi!", "error");
    }
  });
});