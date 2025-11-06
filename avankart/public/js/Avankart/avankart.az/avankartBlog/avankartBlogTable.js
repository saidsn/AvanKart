// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Load blog categories from backend
  function loadBlogCategories() {
    // Get current language from localStorage
    const currentLang = localStorage.getItem("selectedLanguage") || "az";

    $.ajax({
      url: "/avankartaz/blog/create",
      type: "GET",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      success: function(response) {
        if (response.success && response.data?.categories) {
          const categories = response.data.categories;
          const dropdown = $("#dropdown_blogCategory .flex.flex-col");
          dropdown.empty();

          categories.forEach(function(category) {
            // Get title based on current language
            let categoryTitle;
            if (typeof category.title === 'object') {
              categoryTitle = category.title[currentLang] || category.title.az || category.title;
            } else {
              categoryTitle = category.title;
            }

            dropdown.append(`
              <label class="flex font-medium hover:bg-item-hover px-3 py-1 cursor-pointer select-none text-[13px]"
                onclick="selectBlogCategory('${categoryTitle}', '${category._id}')">
                ${categoryTitle}
              </label>
            `);
          });
        }
      },
      error: function(xhr, error) {
        console.error("Kateqoriyalar yüklənərkən xəta baş verdi:", error);
      }
    });
  }

  // Load categories on page load
  loadBlogCategories();

  // Load categories for filter modal
  function loadBlogFilterCategories() {
    // Get current language from localStorage
    const currentLang = localStorage.getItem("selectedLanguage") || "az";

    $.ajax({
      url: "/avankartaz/blog/create",
      type: "GET",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      success: function(response) {
        if (response.success && response.data?.categories) {
          const categories = response.data.categories;
          const container = $("#blogFilterCategories");
          container.empty();

          categories.forEach(function(category, index) {
            // Get title based on current language
            let categoryTitle;
            if (typeof category.title === 'object') {
              categoryTitle = category.title[currentLang] || category.title.az || category.title;
            } else {
              categoryTitle = category.title;
            }

            // Create checkbox HTML
            const checkboxHtml = `
              <label for="cbx-blog-filter-${index}" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                <input type="checkbox" id="cbx-blog-filter-${index}" class="peer hidden"
                  name="blog_category_filter" value="${category._id}">
                <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                  <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <div>${categoryTitle}</div>
              </label>
            `;

            container.append(checkboxHtml);
          });
        }
      },
      error: function(xhr, error) {
        console.error("Filter kateqoriyaları yüklənərkən xəta baş verdi:", error);
      }
    });
  }

  // Load filter categories on page load
  loadBlogFilterCategories();

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
    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("destroy");
    }
    $("#slider-range").slider({
      range: true,
      min: globalMinAmount,
      max: globalMaxAmount,
      values: [globalMinAmount, globalMaxAmount],
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      },
    });

    // İlk değerleri yaz
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  function initializeDataTable() {
    // Yalnız #myTableBlog elementı varsa initialize et
    if ($("#myTableBlog").length === 0) {
      return;
    }

    if ($.fn.DataTable.isDataTable("#myTableBlog")) {
      dataTable.destroy();
    }

    dataTable = $("#myTableBlog").DataTable({
      ajax: {
        url: "/avankartaz/blog/list",
        type: "GET",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          console.log("Blog: AJAX data function çağrıldı, params:", d);
          // Get language from localStorage or default to 'az'
          const savedLang = localStorage.getItem("selectedLanguage") || "az";
          const page = Math.floor(d.start / d.length) + 1;
          const params = {
            page: page,
            limit: d.length,
            search: d.search.value,
            lang: savedLang, // Add language parameter here
            ...currentFilters,
          };
          console.log("Blog: Backend-ə göndəriləcək params:", params);
          return params;
        },
        dataSrc: function (json) {
          console.log("Blog: Backend cavabı:", json);
          if (json.success && json.data) {
            $("#tr_counts").html(json.pagination?.total ?? 0);
            json.recordsTotal = json.pagination?.total ?? 0;
            json.recordsFiltered = json.pagination?.total ?? 0;
            console.log("Blog: Data qaytarılır, count:", json.data.length);
            return json.data;
          }
          console.log("Blog: Boş data qaytarılır");
          return [];
        },
        error: function(xhr, error, thrown) {
          console.error("Blog: AJAX error:", error, thrown);
          console.error("Blog: XHR:", xhr);
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
          data: function (row) {
            // Format date
            const date = new Date(row.createdAt);
            const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const formattedDate = `${day} ${month} ${year}`;

            // Get category title
            const categoryTitle = row.category?.title || 'Kateqoriya yoxdur';

            // Truncate content for description (max 150 characters)
            const description = row.content?.length > 150
              ? row.content.substring(0, 150) + '...'
              : row.content || '';

            return `
           <div data-blog-id="${row._id}">
             <div class="relative flex items-center gap-2 rounded-lg p-3 bg-container-2 hover:bg-[#f6f6f6]">
              <img src="${row.coverImage}" alt="Bloq Şəkli"
                  class="w-[176px] h-[125px] rounded-[4px] object-cover">
              <div class="flex flex-col gap-2 flex-1">
                  <div class="flex items-center justify-between">
                      <span class="text-[13px] font-medium text-[#1D222B] bg-[#0076B21A] dark:text-primary-dark inline-block py-1 px-2 rounded-[3px]">
                        ${categoryTitle}
                      </span>
                      <div class="absolute right-0 flex items-center gap-4 mr-4">
                        <div class="blog-edit-btn icon stratis-edit-03 !w-[14px] !h-[14px] cursor-pointer"></div>
                          <div onclick="toggleDeleteBlogModal('${row._id}')" class="icon stratis-trash-02 !w-[14px] !h-[14px] text-[#DD3838] cursor-pointer"></div>
                      </div>
                  </div>
                 <div class="flex flex-col gap-1">
                   <h3 class="text-[13px] font-semibold text-[#1D222B] dark:text-primary-text-color-dark ">
                    ${row.title}
                  </h3>
                  <p class="text-[11px] text-secondary-text">
                    ${description}
                  </p>
                 </div>
                  <span class="text-[12px] text-tertiary-text font-medium">
                    ${formattedDate}
                  </span>
              </div>
            </div>
           </div>
          `;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPaginationBlog");
        $pagination.empty();

        // Add click handler for edit buttons
        $('.blog-edit-btn').off('click').on('click', function() {
          const blogId = $(this).closest('[data-blog-id]').data('blog-id');
          console.log('Edit button clicked, blog ID:', blogId);

          // Get the row data from DataTable
          const rowData = dataTable.rows().data().toArray().find(row => row._id === blogId);

          if (rowData) {
            console.log('Found row data:', rowData);
            toggleBlog(rowData);
          } else {
            console.error('Blog data not found for ID:', blogId);
          }
        });

        if (pageInfo.pages <= 1) return;

        $("#blogPageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeBlogPage(' +
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
            '" onclick="changeBlogPage(' +
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
            '" onclick="changeBlogPage(' +
            Math.min(pageInfo.page + 1, pageInfo.pages - 1) +
            ')">' +
            '<div class="icon stratis-chevron-right text-xs"></div>' +
            "</div>"
        );
      },
      createdRow: function (row, data, dataIndex) {
        $(row).find("td:not(:last-child)").css({
          "padding-left": "10px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });
      },
    });
  }

  // Initialize DataTable
  initializeDataTable();

  // Listen for language changes in localStorage
  window.addEventListener('storage', function(e) {
    if (e.key === 'selectedLanguage' && dataTable) {
      const newLang = localStorage.getItem('selectedLanguage');
      console.log('Language changed (different tab), new language:', newLang);
      // Destroy and reinitialize to ensure fresh data
      dataTable.destroy();
      initializeDataTable();
      loadBlogCategories(); // Reload categories with new language
      loadBlogFilterCategories(); // Reload filter categories with new language
    }
  });

  // Also listen for custom language change event (for same-tab changes)
  window.addEventListener('languageChanged', function() {
    const newLang = localStorage.getItem('selectedLanguage');
    console.log('Language changed (same tab), new language:', newLang);
    if (dataTable) {
      // Destroy and reinitialize to ensure fresh data
      dataTable.destroy();
      initializeDataTable();
      loadBlogCategories(); // Reload categories with new language
      loadBlogFilterCategories(); // Reload filter categories with new language
    }
  });
});

// Global functions
window.changeBlogPage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};

// Filter modal functions
window.toggleBlogFilterModal = function () {
  if ($("#blogFilterPop").hasClass("hidden")) {
    $("#blogFilterPop").removeClass("hidden");
  } else {
    $("#blogFilterPop").addClass("hidden");
  }
};

// Apply filters function for Blog
window.applyBlogFilters = function () {
  console.log("=== Applying Blog filters ===");

  // Filterləri sıfırla
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $("#blogStartDate").val();
  const endDate = $("#blogEndDate").val();

  console.log('Selected dates:', { startDate, endDate });

  if (startDate) {
    currentFilters.start_date = startDate;
    console.log('Added start_date to filters:', startDate);
  }

  if (endDate) {
    currentFilters.end_date = endDate;
    console.log('Added end_date to filters:', endDate);
  }

  // Kart kateqoriyalarını al (category IDs)
  const categoryIds = [];
  $('input[name="blog_category_filter"]:checked').each(function () {
    categoryIds.push($(this).val());
  });

  if (categoryIds.length > 0) {
    currentFilters.category = categoryIds.join(','); // Backend expects comma-separated IDs or single ID
  }

  // Məbləğ aralığını al (slider)
  if ($("#blog-slider-range").hasClass("ui-slider")) {
    const minValue = $("#blog-slider-range").slider("values", 0);
    const maxValue = $("#blog-slider-range").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
  }

  console.log("New currentFilters:", currentFilters);
  console.log("currentFilters keys:", Object.keys(currentFilters));

  // Blog cədvəlini yenilə
  if (dataTable) {
    dataTable.ajax.reload(function (json) {
      console.log("Blog DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#blogFilterPop").addClass("hidden");
};

// Clear filters function for Blog
window.clearBlogFilters = function () {
  console.log("=== Clearing Blog filters ===");

  // Reset form
  $("#blogFilterForm")[0].reset();
  $("#blogStartDate").val("");
  $("#blogEndDate").val("");
  $('#blogFilterForm input[type="checkbox"]').prop("checked", false);

  // Clear filters
  currentFilters = {};

  // Blog cədvəlini yenilə
  if (dataTable) {
    console.log("Reloading Blog DataTable after clearing filters...");
    dataTable.ajax.reload(function (json) {
      console.log("Blog DataTable clear and reload completed");
    }, true);
  }
};

// Search
function performSearch() {
  const searchValue = $("#customSearchBlog").val();
  if (dataTable) {
    dataTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#customSearchBlog").on("keyup", function (e) {
  performSearch();
});

// Sehifeler arasi kecid GO button ile
$(".blog-go-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".blog-page-input");
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

// Global variable for blog delete
let currentDeletingBlogId = null;

window.toggleDeleteBlogModal = function (blogId = null) {
  const modal = $("#deleteBlogModal");

  if (modal.hasClass("hidden")) {
    currentDeletingBlogId = blogId;
    modal.removeClass("hidden");
  } else {
    currentDeletingBlogId = null;
    modal.addClass("hidden");
  }
};

window.toggleBlog = function (rowData = null) {
  console.log('toggleBlog called with rowData:', rowData);

  const mainView = document.getElementById("mainView");
  const blogView = document.getElementById("blogView");
  const blogHeader = document.getElementById("blogHeader");
  const blogBackHeader = document.getElementById("blogBackHeader");
  const submitButton = document.getElementById("blogSubmitButton");

  console.log('Elements found:', {
    mainView: !!mainView,
    blogView: !!blogView,
    submitButton: !!submitButton
  });

  if (!mainView || !blogView || !submitButton) {
    console.error("Required elements not found!");
    return;
  }

  mainView.classList.toggle("hidden");
  blogView.classList.toggle("hidden");

  if (!blogView.classList.contains("hidden")) {
    if (blogBackHeader) blogBackHeader.classList.remove("hidden");
    if (blogHeader) blogHeader.classList.add("hidden");

    if (rowData) {
      console.log('Filling form with rowData...');
      // Edit üçün rowData ilə doldur (backend response structure)
      $("#blogTopic").val(rowData.title || "");

      // Language mapping: backend uses lowercase (az, tr, en, ru)
      const langMap = {
        'az': 'AZ',
        'tr': 'TR',
        'en': 'ENG',
        'ru': 'RU'
      };
      const displayLang = langMap[rowData.lang] || rowData.lang;
      $("#selected_language").text(displayLang);
      $("#languageInput").val(displayLang);

      // Category - handle object structure and multi-language support
      const currentLang = localStorage.getItem("selectedLanguage") || "az";
      let categoryTitle = "Seçim edin";

      if (rowData.category) {
        if (typeof rowData.category.title === 'object') {
          // Multi-language title object
          categoryTitle = rowData.category.title[currentLang] ||
                         rowData.category.title.az ||
                         rowData.category.title;
        } else {
          // Single language title
          categoryTitle = rowData.category.title;
        }
      }

      const categoryId = rowData.category?._id || "";
      $("#selected_blogCategory").text(categoryTitle);
      $("#blogCategoryInput").val(categoryId);

      // Content instead of description
      $("#editChoiceContent").html(rowData.content || "");
      $("#blogContent").val(rowData.content || "");

      // Cover image preview if exists
      if (rowData.coverImage) {
        $("#coverPreview").attr("src", rowData.coverImage).removeClass("hidden");
        $("#coverHoverOverlay").removeClass("hidden");
      }

      // Store blog ID for updates
      $("#blogView").attr("data-blog-id", rowData._id);

      // Düymə text-i "Təsdiqlə"
      submitButton.textContent = "Dəyişikliyi təsdiqlə";
    } else {
      // Yeni blog: formu təmizlə
      $("#blogTopic").val("");
      $("#selected_language").text("Seçim edin");
      $("#languageInput").val("");
      $("#selected_blogCategory").text("Seçim edin");
      $("#blogCategoryInput").val("");
      $("#editChoiceContent").html("");
      $("#blogContent").val("");

      // Clear image preview
      $("#coverPreview").attr("src", "").addClass("hidden");
      $("#coverHoverOverlay").addClass("hidden");

      // Remove blog ID
      $("#blogView").removeAttr("data-blog-id");

      // Düymə text-i "Bloq yarat"
      submitButton.textContent = "Bloq yarat";
    }
  } else {
    if (blogHeader) blogHeader.classList.remove("hidden");
    if (blogBackHeader) blogBackHeader.classList.add("hidden");
  }
};

// Blog delete handler
$(document).ready(function() {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Delete confirmation button for blog
  $("#deleteBlogModal").find("button").last().on("click", function() {
    if (!currentDeletingBlogId) {
      console.error("No blog ID to delete");
      return;
    }

    $.ajax({
      url: `/avankartaz/blog/${currentDeletingBlogId}`,
      type: "DELETE",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      success: function(response) {
        if (response.success) {
          // Close modal
          $("#deleteBlogModal").addClass("hidden");
          currentDeletingBlogId = null;

          // Reload table
          if (dataTable) {
            dataTable.ajax.reload(null, false);
          }

          alertModal(response.message || "Bloq uğurla silindi", "success");
        }
      },
      error: function(xhr, error) {
        console.error("Error deleting blog:", error);
        const errorMessage = xhr.responseJSON?.message || "Bloq silinərkən xəta baş verdi";
        alertModal(errorMessage, "error");
      }
    });
  });
});

// Blog form submit handler
$(document).ready(function() {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  $("#blogView form").on("submit", function(e) {
    e.preventDefault();

    const blogId = $("#blogView").attr("data-blog-id");
    const isEdit = !!blogId;

    // Language mapping: convert display format (AZ, TR, ENG, RU) to backend format (az, tr, en, ru)
    const langMap = {
      'AZ': 'az',
      'TR': 'tr',
      'ENG': 'en',
      'RU': 'ru'
    };

    // Get form data
    const title = $("#blogTopic").val();
    const displayLang = $("#languageInput").val();
    const lang = langMap[displayLang] || displayLang.toLowerCase();
    const category = $("#blogCategoryInput").val();
    const content = $("#editChoiceContent").html();

    // Validate required fields
    if (!title || !lang || !category || !content) {
      alertModal("Xahiş edirik bütün sahələri doldurun", "warning");
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("title", title);
    formData.append("lang", lang);
    formData.append("category", category);
    formData.append("content", content);

    // Cover image
    const coverInput = document.getElementById("coverInput");
    if (coverInput && coverInput.files.length > 0) {
      formData.append("coverImage", coverInput.files[0]);
    } else if (!isEdit) {
      alertModal("Cover şəkli yükləyin", "warning");
      return;
    }

    // Detail image (using same cover image if not specified)
    if (coverInput && coverInput.files.length > 0) {
      formData.append("detailImage", coverInput.files[0]);
    } else if (!isEdit) {
      alertModal("Şəkil yükləyin", "warning");
      return;
    }

    let url, method;

    if (isEdit) {
      // UPDATE MODE - PUT metodu üçün FormData problem yaradır, ona görə POST istifadə edirik
      url = `/avankartaz/blog/${blogId}`;
      method = "POST";

      // PUT metodunu simulate etmək üçün _method parametri əlavə edirik
      formData.append("_method", "PUT");
    } else {
      // CREATE MODE
      url = "/avankartaz/blog";
      method = "POST";
    }

    $.ajax({
      url: url,
      type: method,
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        console.log("Blog saved successfully:", response);

        // Close form view
        toggleBlog();

        // Reload table
        if (dataTable) {
          dataTable.ajax.reload();
        }

        alertModal(response.message || "Bloq uğurla saxlanıldı", "success");
      },
      error: function(xhr, status, error) {
        console.error("Error saving blog:", error);
        const errorMessage = xhr.responseJSON?.message || "Bloq saxlanarkən xəta baş verdi";
        alertModal(errorMessage, "error");
      }
    });
  });
});
