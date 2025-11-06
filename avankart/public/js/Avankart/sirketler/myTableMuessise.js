$(document).ready(function () {
  // Verilənlər
  var myData = [
    {
      name: "Ramin Orucov",
      date: "12.01.2023 - 09:23:12",
    },
    {
      name: "İsa Sadiqli",
      date: "12.01.2023 - 09:23:12",
    },
    {
      name: "İbrahim Feyzullazadə",
      date: "12.01.2023 - 09:23:12",
    },
    {
      name: "Tofiq Əliyev",
      date: "12.01.2023 - 09:23:12",
    },
    {
      name: "Ramin Orucov",
      date: "12.01.2023 - 09:23:12",
    },
    {
      name: "İsa Sadiqli",
      date: "12.01.2023 - 09:23:12",
    },
    {
      name: "Tofiq Əliyev",
      date: "12.01.2023 - 09:23:12",
    },
  ];

  var activeData = myData;

  var table = $("#myTableMuessise").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: activeData,
    columns: [
      {
        data: function (row, meta) {
          const idx = meta.row;
          return `
            <div class="flex items-center gap-3">
                <input id="rb-${idx}" type="radio"name="rowSelectRadio" value="female" class="w-4 h-4 text-[#745086] bg-menu border-surface-variant focus:ring-[#745086] dark:focus:ring-[#745086] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
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
    pageLength: myData.length,

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

    drawCallback: function () {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination");

      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      }

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      // Spacer-row əlavə olunur
      $("#myTableMuessise tbody tr.spacer-row").remove();

      const colCount = $("#myTableMuessise thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTableMuessise tbody").prepend(spacerRow);

      // Səhifələmə düymələri
      $pagination.append(`
                  <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                    pageInfo.page === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "text-messages dark:text-primary-text-color-dark"
                  }"
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left"></div>
                  </div>
              `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
                      <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages
                              ${
                                i === pageInfo.page
                                  ? "bg-[#F6D9FF] text-messages"
                                  : "bg-transparent text-tertiary-text"
                              }"
                              onclick="changePage(${i})">${i + 1}</button>
                  `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
                  <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                    pageInfo.page === pageInfo.pages - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "text-tertiary-text"
                  }"
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right"></div>
                  </div>
              `);
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
