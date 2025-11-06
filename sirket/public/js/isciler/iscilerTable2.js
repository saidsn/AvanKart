$(document).ready(function () {
  const myData = [
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
  ];

  const table = $("#myTable2").DataTable({
    // Set paging to false to disable pagination
    paging: false,
    info: false,
    // 't' stands for table, completely removing any other controls including pagination
    dom: "t",
    data: myData,
    columns: [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
                        <input type="checkbox" id="cbx-${idx}" class="peer hidden">
                        <label for="cbx-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary dark:border-surface-variant-dark dark:text-side-bar-item-dark dark:peer-checked:bg-primary-dark dark:peer-checked:text-on-primary-dark dark:peer-checked:border-primary-dark dark:bg-[#161E22] transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </label>
                    `;
        },
      },
      {
        data: function (row) {
          return `
                        <div class="flex items-center gap-3">
                            <span class="text-secondary-text text-[11px] font-normal dark:text-white">ID: ${row.id}</span>
                        </div>
                    `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.email}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.phone}</span>`;
        },
      },
    ],
    order: [],
    // lengthChange is not needed if paging is false, but keeping it doesn't harm
    lengthChange: false,
    // pageLength is not needed if paging is false, but keeping it doesn't harm
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          const isDark = $("html").hasClass("dark"); // Dark mod yoxlanılır
          if (!isDark) {
            $(this).css("background-color", "#FAFAFA"); // Yalnız light modda hover effekti
          }
        })
        .on("mouseleave", function () {
          $(this).css("background-color", ""); // Hover effekti silinir
        });

      // Bütün td-lərə border alt
      $(row).find("td").addClass("border-b-[.5px] border-stroke");

      /// Bütün td-lərə border alt
      $(row).find("td").addClass("border-b-[.5px] border-stroke");

      $(row).find("td:not(:first-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      $("#myTable2 thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTable2 thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sol td (checkbox): padding və genişliyi sıfırla, border ver
      $(row).find("td:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "48px", // checkbox sütunu üçün daha dar genişlik (uyğunlaşdıra bilərsən)
        "text-align": "center",
      });

      // Label içində margin varsa sıfırla
      $(row).find("td:first-child label").css({
        margin: "0",
        display: "inline-flex",
        "justify-content": "center",
        "align-items": "center",
      });
    },

    initComplete: function () {
      $("#myTable2 thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Table başlıqlarına stil burada verilməlidir
      $("#myTable2 thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTable2 thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable2 thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-white"></div></div>'
        );
      });
    },
    drawCallback: function () {
      // Spacer-row əlavə olunur
      $("#myTable tbody tr.spacer-row").remove();

      const colCount = $("#myTable2 thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable2 tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

    },
  });
  // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
  $("#newCheckboxTable").on("change", function () {
    const isChecked = $(this).is(":checked");

    $('#myTable2 tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  // Axtarış
  $("#customSearch2").on("keyup", function () {
    table.search(this.value).draw();
    
  });
 
});