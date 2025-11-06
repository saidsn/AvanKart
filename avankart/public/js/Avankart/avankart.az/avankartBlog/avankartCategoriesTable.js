// Global dəyişənlər
let blogCategoriesTable = null;
let blogCategoriesFilters = {};

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");


  function initializeBlogCategoriesTable() {
    if ($.fn.DataTable.isDataTable("#blogCategoriesTable")) {
      blogCategoriesTable.destroy();
    }

    blogCategoriesTable = $("#blogCategoriesTable").DataTable({
      ajax: {
        url: "/avankartaz/blogCategory/list",
        type: "GET",
        headers: { "X-CSRF-Token": csrfToken },
        data: function (d) {
          console.log("Blog Categories: AJAX data function çağrıldı, params:", d);
          // Get language from localStorage or default to 'az'
          const savedLang = localStorage.getItem("selectedLanguage") || "az";
          const page = Math.floor(d.start / d.length) + 1;
          const params = {
            page: page,
            limit: d.length,
            search: d.search.value,
            lang: savedLang,
            ...blogCategoriesFilters,
          };
          console.log("Blog Categories: Backend-ə göndəriləcək params:", params);
          return params;
        },
        dataSrc: function (json) {
          console.log("Blog Categories: Backend cavabı:", json);
          if (json.success && json.data) {
            json.recordsTotal = json.pagination?.total ?? 0;
            json.recordsFiltered = json.pagination?.total ?? 0;
            console.log("Blog Categories: Data qaytarılır, count:", json.data.length);
            return json.data;
          }
          console.log("Blog Categories: Boş data qaytarılır");
          return [];
        },
        error: function(xhr, error, thrown) {
          console.error("Blog Categories: AJAX error:", error, thrown);
          console.error("Blog Categories: XHR:", xhr);
        }
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 4,
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
            const formattedDate = `${day} ${month} ${year}`;

            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              formattedDate +
              "</span>"
            );
          },
        },
        {
          data: function (row) {
            return `
              <div id="wrapper" class="relative inline-block text-left">
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages text-base cursor-pointer z-100"></div>

                <div class="hidden absolute right-[-12px] max-w-[244px] z-50 dropdown-menu">

                  <div class="relative h-[8px]">
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>

                  <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
                    <div class="py-[3.5px] text-sm">
                       <div onclick='toggleEditModal(${JSON.stringify(
                         row
                       )})' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                  <span class="icon stratis-edit-03 text-[13px] mt-1"></span>
                  <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Redaktə et</span>
                </div>
                <div class="h-[.5px] bg-stroke my-1"></div>
                 <div onclick='prepareDeleteCategory("${row._id}")' class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
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
        const pageInfo = blogCategoriesTable.page.info();
        const $pagination = $("#blogCategoriesPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#blogCategoriesPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        // Left arrow
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeBlogCategoriesPage(${Math.max(
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
            }" onclick="changeBlogCategoriesPage(${i})">
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
          }" onclick="changeBlogCategoriesPage(${Math.min(
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

  initializeBlogCategoriesTable();

  // Listen for language changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'selectedLanguage' && blogCategoriesTable) {
      const newLang = localStorage.getItem('selectedLanguage');
      console.log('Language changed (different tab), reloading blog categories...');
      blogCategoriesTable.destroy();
      initializeBlogCategoriesTable();
    }
  });

  window.addEventListener('languageChanged', function() {
    const newLang = localStorage.getItem('selectedLanguage');
    console.log('Language changed (same tab), reloading blog categories...');
    if (blogCategoriesTable) {
      blogCategoriesTable.destroy();
      initializeBlogCategoriesTable();
    }
  });
});

// Pagination
window.changeBlogCategoriesPage = function (page) {
  if (blogCategoriesTable) {
    blogCategoriesTable.page(page).draw("page");
  }
};

// Filter modal functions
window.toggleBlogCategoriesFilterModal = function () {
  if ($("#blogCategoriesFilterPop").hasClass("hidden")) {
    $("#blogCategoriesFilterPop").removeClass("hidden");
  } else {
    $("#blogCategoriesFilterPop").addClass("hidden");
  }
};

// Apply filters function for Blog Categories
window.applyBlogCategoriesFilters = function () {
  console.log("=== Applying Blog Categories filters ===");

  // Filterləri sıfırla
  blogCategoriesFilters = {};

  // Tarix aralığını al
  const startDate = $("#blogCategoriesStartDate").val();
  const endDate = $("#blogCategoriesEndDate").val();

  console.log('Selected category dates:', { startDate, endDate });

  if (startDate) {
    blogCategoriesFilters.start_date = startDate;
    console.log('Added start_date to category filters:', startDate);
  }

  if (endDate) {
    blogCategoriesFilters.end_date = endDate;
    console.log('Added end_date to category filters:', endDate);
  }

  console.log("New blogCategoriesFilters:", blogCategoriesFilters);
  console.log("blogCategoriesFilters keys:", Object.keys(blogCategoriesFilters));

  // Blog Categories cədvəlini yenilə
  if (blogCategoriesTable) {
    blogCategoriesTable.ajax.reload(function (json) {
      console.log("Blog Categories DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#blogCategoriesFilterPop").addClass("hidden");
};

// Clear filters function for Blog Categories
window.clearBlogCategoriesFilters = function () {
  console.log("=== Clearing Blog Categories filters ===");

  // Reset form
  $("#blogCategoriesFilterForm")[0].reset();
  $("#blogCategoriesStartDate").val("");
  $("#blogCategoriesEndDate").val("");

  // Clear filters
  blogCategoriesFilters = {};

  // Blog Categories cədvəlini yenilə
  if (blogCategoriesTable) {
    console.log("Reloading Blog Categories DataTable after clearing filters...");
    blogCategoriesTable.ajax.reload(function (json) {
      console.log("Blog Categories DataTable clear and reload completed");
    }, true);
  }
};

// Search
function performBlogCategoriesSearch() {
  const searchValue = $("#blogCategoriesSearch").val();
  if (blogCategoriesTable) {
    blogCategoriesTable.search(searchValue).draw();
  }
}

$("#blogCategoriesSearch").on("keyup", performBlogCategoriesSearch);

// GO button
$(".blog-categories-go-button").on("click", function (e) {
  e.preventDefault();
  const pageInput = $(this).siblings(".blog-categories-page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");
  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (blogCategoriesTable) {
      const pageInfo = blogCategoriesTable.page.info();
      let dataTablePage = pageNumber - 1;
      if (dataTablePage < pageInfo.pages) {
        blogCategoriesTable.page(dataTablePage).draw("page");
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

// Global variable to store category data during edit
let editingCategoryData = null;
let categoryTitles = { az: '', tr: '', en: '', ru: '' };
let currentActiveLang = 'az';

window.toggleEditModal = function (rowData = null) {
  const modal = $("#editModal");
  const modalTitle = modal.find("#modal-title");
  const categoryInput = modal.find("#categoryInput");
  const saveButton = modal.find("#saveButton");
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  if (modal.hasClass("hidden")) {
    // Modalı aç
    modal.removeClass("hidden");

    // Reset category titles
    categoryTitles = { az: '', tr: '', en: '', ru: '' };
    currentActiveLang = 'az';

    if (rowData) {
      // REDAKTƏ REJİMİ
      console.log('Edit mode, rowData:', rowData);
      editingCategoryData = rowData;

      modalTitle.text("Redaktə et");
      saveButton.find("span").text("Dəyişikliyi təsdiqlə");

      // Load category titles from titleFull or title
      if (rowData.titleFull) {
        categoryTitles = { ...rowData.titleFull };
      } else if (typeof rowData.title === 'object') {
        categoryTitles = { ...rowData.title };
      } else {
        // Single language title
        categoryTitles.az = rowData.title || '';
      }

      // Show Azerbaijani title first
      categoryInput.val(categoryTitles.az || '');
    } else {
      // YENİ YARATMA REJİMİ
      editingCategoryData = null;

      modalTitle.text("Yeni kateqoriya");
      saveButton.find("span").text("Yarat");
      categoryInput.val("");
    }

    // Dil düymələrini sıfırla
    const langButtons = modal.find(".lang-btn");
    langButtons
      .removeClass("active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark")
      .addClass("text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark");

    langButtons.first()
      .addClass("active text-messages bg-inverse-on-surface cursor-default dark:bg-surface-variant-dark")
      .removeClass("text-tertiary-text cursor-pointer dark:text-tertiary-text-color-dark");

    // Remove old click handler and add new one
    saveButton.off('click').on('click', function() {
      saveBlogCategory(csrfToken);
    });

  } else {
    // Modalı bağla
    modal.addClass("hidden");
    editingCategoryData = null;
  }
};

// Dil düymələrinin aktiv/deaktiv vəziyyətini idarə edən funksiya
window.toggleLanguage = function (element) {
  // Save current language input before switching
  const categoryInput = $("#categoryInput");
  const currentValue = categoryInput.val();

  // Save to categoryTitles object
  categoryTitles[currentActiveLang] = currentValue;

  // Get the new language code from the clicked button
  const newLang = $(element).data('lang');
  currentActiveLang = newLang;

  // Load the title for the new language
  categoryInput.val(categoryTitles[newLang] || '');

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

// Save blog category (create or update)
window.saveBlogCategory = function(csrfToken) {
  const categoryInput = $("#categoryInput");

  // Save current language input
  categoryTitles[currentActiveLang] = categoryInput.val();

  // Validate all language inputs
  if (!categoryTitles.az || !categoryTitles.tr || !categoryTitles.en || !categoryTitles.ru) {
    alertModal('Xahiş edirik bütün dil variantlarını daxil edin (Azərbaycan, Türkçə, İngiliscə, Rusca)', 'warning');
    return;
  }

  const requestData = {
    title: {
      az: categoryTitles.az,
      tr: categoryTitles.tr,
      en: categoryTitles.en,
      ru: categoryTitles.ru
    }
  };

  let url, method;

  if (editingCategoryData) {
    // UPDATE MODE
    url = `/avankartaz/blogCategory/${editingCategoryData._id}`;
    method = 'PUT';
  } else {
    // CREATE MODE
    url = '/avankartaz/blogCategory';
    method = 'POST';
  }

  $.ajax({
    url: url,
    type: method,
    headers: {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(requestData),
    success: function(response) {
      console.log('Category saved successfully:', response);

      // Close modal
      $("#editModal").addClass("hidden");
      editingCategoryData = null;

      // Reload table
      if (blogCategoriesTable) {
        blogCategoriesTable.ajax.reload();
      }

      // Show success message (you can add a toast/notification here)
      alertModal(response.message || 'Kateqoriya uğurla saxlanıldı', 'success');
    },
    error: function(xhr, status, error) {
      console.error('Error saving category:', error);
      const errorMessage = xhr.responseJSON?.message || 'Kateqoriya saxlanarkən xəta baş verdi';
      alertModal(errorMessage, 'error');
    }
  });
};

// Delete category
let deletingCategoryId = null;

window.prepareDeleteCategory = function(categoryId) {
  deletingCategoryId = categoryId;
  toggleDeleteModal();
};

window.confirmDeleteCategory = function() {
  if (!deletingCategoryId) {
    console.error('No category ID to delete');
    return;
  }

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $.ajax({
    url: `/avankartaz/blogCategory/${deletingCategoryId}`,
    type: 'DELETE',
    headers: {
      'X-CSRF-Token': csrfToken
    },
    success: function(response) {
      console.log('Category deleted successfully:', response);

      // Close modal
      toggleDeleteModal();
      deletingCategoryId = null;

      // Reload table
      if (blogCategoriesTable) {
        blogCategoriesTable.ajax.reload();
      }

      // Show success message
      alertModal(response.message || 'Kateqoriya uğurla silindi', 'success');
    },
    error: function(xhr, status, error) {
      console.error('Error deleting category:', error);
      const errorMessage = xhr.responseJSON?.message || 'Kateqoriya silinərkən xəta baş verdi';
      alertModal(errorMessage, 'error');
    }
  });
};