$(document).ready(function () {
  // Verilənlər
  var myData = [
    {
      name: "İphone 11, İOS 17.6",
      date: "11.12.2023 08:20",
      location: "Azərbaycan, Bakı, Xətai rayonu",
    },
    {
      name: "İphone 12, İOS 17.6",
      date: "21.10.2023 08:20",
      location: "Azərbaycan, Bakı, Xətai rayonu",
    },
    {
      name: "İphone 13, İOS 18.0",
      date: "07.07.2023 08:20",
      location: "Azərbaycan, Bakı, Yasamal rayonu",
    },
    {
      name: "İphone 14, İOS 18.0",
      date: "09.01.2023 08:20",
      location: "Azərbaycan, Bakı, Nəsimi rayonu",
    },
    {
      name: "İphone 15, İOS 18.1",
      date: "23.11.2023 08:20",
      location: "Azərbaycan, Bakı, Xətai rayonu",
    },
    {
      name: "İphone 11, İOS 17.6",
      date: "01.10.2023 08:20",
      location: "Azərbaycan, Gəncə, Xətai rayonu",
    },
    {
      name: "İphone 16, İOS 18.2",
      date: "17.12.2023 08:20",
      location: "Azərbaycan, Bakı, Nizami rayonu",
    },
  ];

  var activeData = myData;

  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: activeData,
    columns: [
      {
        orderable: false, // ✅ 1-ci sütun (checkbox) filter off
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
                        <input type="checkbox" id="cb-${idx}" class="peer hidden">
                        <label for="cb-${idx}" 
                            class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark 
                                peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                            <div class="icon stratis-check-01 scale-60 hidden peer-checked:block"></div>
                        </label>

                    `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.location}</span>`;
        },
      },
      {
        orderable: false,
        data: function () {
          return `
                        <div class="text-base flex items-center cursor-pointer relative">
                            <div onclick="showSessionTooltip(this)" data-tooltip="Sessiyanı bitir"
                                class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
                        </div>
                    `;
        },
      },
    ],

    order: [],
    lengthChange: false,
    pageLength: myData.length,

    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function (row, data, dataIndex) {
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (document.documentElement.classList.contains("dark")) {
            $(this).css("background-color", "#161E22"); // dark gray for dark mode
          } else {
            $(this).css("background-color", "#FAFAFA"); // light gray for light mode
          }
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      const isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      /// Bütün td-lərə border alt
      $(row)
        .find("td")
        .css({
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      $(row).find("td:not(:first-child):not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sol td (checkbox): padding və genişliyi sıfırla, border ver
      $(row)
        .find("td:first-child")
        .addClass("border-r-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .css({
          "padding-left": "0",
          "padding-right": "0",
          width: "48px", // checkbox sütunu üçün daha dar genişlik (uyğunlaşdıra bilərsən)
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
      $(row)
        .find("td:last-child")
        .addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .css({
          "padding-right": "0",
          "text-align": "right",
        });
    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      const isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      $("#myTable thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable thead th.filtering").each(function () {
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
      $("#myTable tbody tr.spacer-row").remove();

      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      const isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";
      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");

      $lastRow.find("td:first-child").css({
        "border-right": `0.5px solid ${borderColor}`,
      });

      $lastRow.find("td:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

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

  // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
  $("#tableCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");

    $('#myTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  // Axtarış
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
    updateCounts(activeData);
  });

  // Sayları yeniləmək üçün funksiya
  function updateCounts(data) {
    const totalCount = data.length;
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
