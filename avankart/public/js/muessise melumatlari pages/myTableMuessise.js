$(document).ready(function () {
  // CSRF token əldə etmə funksiyası
  function getCSRFToken() {
    return (
      $('meta[name="csrf-token"]').attr("content") ||
      $('input[name="_token"]').val()
    );
  }

  // Loading state funksiyaları
  // function showLoading() {
  //   if ($(".history-loading-overlay").length === 0) {
  //     $("#myTableMuessise_wrapper").append(
  //       '<div class="history-loading-overlay absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">' +
  //         '<div class="text-center">' +
  //         '<div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary" role="status">' +
  //         '<span class="sr-only">Yüklənir...</span>' +
  //         "</div>" +
  //         '<div class="mt-2 text-sm text-gray-600">Tarix məlumatları yüklənir...</div>' +
  //         "</div>" +
  //         "</div>"
  //     );
  //   }
  // }

  function hideLoading() {
    $(".history-loading-overlay").remove();
  }

  // Xəta mesajı göstərmə funksiyası
  function showError(message) {
    console.error("History AJAX Xətası:", message);
    alert("Tarix məlumatları yüklənərkən xəta: " + message);
  }

  // // AJAX history data yükləmə funksiyası
  // function loadHistoryData() {
  //   // showLoading();

  //   $.ajaxSetup({
  //     headers: {
  //       "X-CSRF-TOKEN": getCSRFToken(),
  //     },
  //   });

  //   $.post("/muessise-info/show-history-table", {})
  //     .done(function (response) {
  //       if (response.success) {
  //         // Data-ları yenilə
  //         myData = response.data || [];
  //         activeData = myData;

  //         // Cədvəli yenilə
  //         refreshHistoryTable(activeData);
  //         updateCounts(activeData);
  //       } else {
  //         showError(response.message || "Bilinməyən xəta");
  //       }
  //     })
  //     .fail(function (xhr, status, error) {
  //       console.error("History AJAX Xətası:", xhr.responseText);
  //       showError("Server xətası: " + error);
  //     })
  //     .always(function () {
  //       hideLoading();
  //     });
  // }

  // // Cədvəlin yenilənməsi funksiyası
  // function refreshHistoryTable(activeData) {
  //   if (table) {
  //     table.clear();
  //     table.rows.add(activeData);
  //     table.draw();
  //   }
  // }

  // // Verilənlər - HAL-HAZIRDA BOŞ ARRAY
  // var myData = [];
  // var activeData = myData;

  var table = $("#myTableMuessise").DataTable({
    paging: true,
    info: false,
    dom: "t",
    ajax: {
      url: "/muessise-info/show-history-table",
      type: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCSRFToken(),
      },
    },
    columns: [
      {
        data: null,
        render: function(data, type, row, meta) {
          const idx = meta.row;
          const isChecked = idx === 0 ? 'checked' : '';
          return `
            <div class="flex items-center gap-3">
                <input id="rb-${row.id}" type="radio" value="${row.id}" name="rowHistorySelectRadio" value="female" class="w-4 h-4 text-[#745086] bg-menu border-surface-variant focus:ring-[#745086] dark:focus:ring-[#745086] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" ${isChecked}>
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.name}</span>
            </div>
          `;
        },
      },
      {
        data: function (row) {
          return `<span class="flex flex-start text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
        },
      },
    ],

    order: [],
    lengthChange: false,
    pageLength: 10,

    createdRow: function (row, data, dataIndex) {
      $(row).css("cursor", "pointer");

      // Check if this row's radio button is already checked on creation/draw
      // This is important for when DataTables redraws the table (e.g., pagination, search)
      if ($(row).find('input[type="radio"]').prop("checked")) {
        if (document.documentElement.classList.contains("dark")) {
          $(row).addClass("selected-row-dark");
        } else {
          $(row).addClass("selected-row-light");
        }
      } else {
        // Ensure no selected class if not checked initially
        $(row).removeClass("selected-row-dark selected-row-light");
      }

      // Hover effekti - only apply if the row is NOT selected
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (
            !$(this).hasClass("selected-row-dark") &&
            !$(this).hasClass("selected-row-light")
          ) {
            if (document.documentElement.classList.contains("dark")) {
              $(this).css("background-color", "#242C30"); // dark gray for dark mode
            } else {
              $(this).css("background-color", "#FAFAFA"); // light gray for light mode
            }
          }
        })
        .on("mouseleave", function () {
          if (
            !$(this).hasClass("selected-row-dark") &&
            !$(this).hasClass("selected-row-light")
          ) {
            $(this).css("background-color", ""); // Reset to default background
          }
        });

      $(row).on("click", function () {
        const radioInput = $(this).find('input[type="radio"]');

        // IMPORTANT: Remove selected class from ALL rows first
        $("#myTableMuessise tbody tr").removeClass(
          "selected-row-dark selected-row-light"
        );
        // Also, reset inline background styles from previously selected rows
        $("#myTableMuessise tbody tr").css("background-color", "");

        // Add selected class to the current row
        if (document.documentElement.classList.contains("dark")) {
          $(this).addClass("selected-row-dark");
        } else {
          $(this).addClass("selected-row-light");
        }

        // Check the radio button
        if (!radioInput.prop("checked")) {
          radioInput.prop("checked", true).trigger("change").focus();
        }
      });

      // Amma radio və ya label-a klik etdikdə bu hadisəni 2 dəfə işlətməsin
      $(row)
        .find("input, label")
        .on("click", function (e) {
          e.stopPropagation();
        });

      const isDarkMode = document.documentElement.classList.contains("dark");
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      /// Bütün td-lərə border alt
      $(row)
        .find("td")
        .css({
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      $(row).find("td").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      $("#myTableMuessise thead th:first-child").css({
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTableMuessise thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sol td (checkbox): padding və genişliyi sıfırla, border ver
      $(row)
        .find("td:first-child")
        .css({
          width: "48px",
          "text-align": "center",
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      // Label içində margin varsa sıfırla
      $(row).find("td:first-child label").css({
        margin: "0",
        display: "inline-flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sağ td (üç nöqtə): border ver
      $(row).find("td:last-child").css({
        "text-align": "right",
      });
    },

    initComplete: function () {
      $("#myTableMuessise thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      $("#myTableMuessise thead th:first-child").css({
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTableMuessise thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTableMuessise thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
          $(this).text() +
          '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
        );
      });
    },

  });

  // Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
  $("#tableCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");

    // This part is for checkbox selection, not radio selection,
    // so it doesn't directly affect the row background for a single selection.
    $('#myTableMuessise tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  // Axtarış
  $("#customSearchMuessise").on("keyup", function () {
    table.search(this.value).draw();
    updateCounts(activeData);
  });

  // Sayları yeniləmək üçün funksiya
  function updateCounts(data) {
    const totalCount = data.length;
    // Assuming 'status' property exists in your data for filtering
    // If not, these counts will always be 0 unless you add a 'status' field to your myData.
    const readCount = data.filter((row) => row.status === "Oxundu").length;
    const unreadCount = data.filter((row) => row.status === "Yeni").length;

    $("#total-count").text(`Hamısı (${totalCount})`);
    $("#read-count").text(`Oxunmuşlar (${readCount})`);
    $("#unread-count").text(`Oxunmamışlar (${unreadCount})`);
  }

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    table.page(page).draw("page");
  };
});
