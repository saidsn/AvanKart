$(document).ready(function () {
  // Verilənlər
  var myData = [
    {
      name: "Ramin Orucov",
      gender: "Kişi",
      position: "Mühsasib",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "İbrahim Feyzullazadə",
      gender: "Kişi",
      position: "Mühsasib",
      email: "ibrahim.feyzullazadə@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "İbrahim Feyzullazadə",
      gender: "Kişi",
      position: "Mühsasib",
      email: "ibrahim.feyzullazadə@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "Ramin Orucov",
      gender: "Kişi",
      position: "Mühsasib",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "İsa Sadiqli",
      gender: "Kişi",
      position: "Mühsasib",
      email: "isa.sadigli@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "İbrahim Feyzullazadə",
      gender: "Kişi",
      position: "Mühsasib",
      email: "ibrahim.feyzullazadə@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "İbrahim Feyzullazadə",
      gender: "Kişi",
      position: "Mühsasib",
      email: "ibrahim.feyzullazadə@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "Ramin Orucov",
      gender: "Kişi",
      position: "Mühsasib",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
    {
      name: "İsa Sadiqli",
      gender: "Kişi",
      position: "Mühsasib",
      email: "isa.sadigli@gmail.com",
      phone: "+994 51 444 44 44",
      group: "Sistem inzibatçısı",
    },
  ];

  var activeData = myData;

  var table = $("#myTable").DataTable({
    responsive: true,
    paging: true,
    info: false,
    dom: "t",
    data: activeData,

    columns: [
      {
        data: function (row) {
          return `
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                                ${row.name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")}
                            </div>
                            <span class="text-messages text-[13px] font-medium">${
                              row.name
                            }</span>
                        </div>
                    `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.gender}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.position}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.email}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.phone}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.group}</span>`;
        },
      },
    ],

    order: [],
    lengthChange: false,
    pageLength: 6,

    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function (row, data, dataIndex) {
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          $(this).css("background-color", "#F5F5F5");
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      /// Bütün td-lərə border alt
      $(row).find("td").addClass("border-b-[.5px] border-stroke");

      $(row).find("td:not(:first-child):not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "10px",
        "padding-bottom": "10px",
      });

      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": "0.5px solid #E0E0E0",
      });

      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
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
        .addClass("border-r-[.5px] border-stroke")
        .css({
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

      // Sağ td (üç nöqtə): border ver
    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Table başlıqlarına stil burada verilməlidir
      $("#myTable thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": "0.5px solid #E0E0E0",
      });

      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
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
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
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

      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      $lastRow.find("td:first-child").css({
        "border-right": "0.5px solid #E0E0E0",
      });

      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });

      // Səhifələmə düymələri
      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                  pageInfo.page === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "text-messages"
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
  $("#newCheckbox").on("change", function () {
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
