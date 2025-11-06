$(document).ready(function () {
  // Verilənlər
  var myData = [
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yanacaq",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Hədiyyə",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yanacaq",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Hədiyyə",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Yanacaq",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "TRX-XXXXXXXXXXXXXX",
      card: "Hədiyyə",
      amount: "200.00",
      date: "01.12.2023 08:20",
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
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.id}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.card}</span>`;
        },
      },
      {
        data: function (row) {
          return `
                    <div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                        <span class="text-[13px] font-normal">${row.amount}</span>
                        <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
                    </div>
                    `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
        },
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 9,

    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function (row, data, dataIndex) {
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          const isDark = $("html").hasClass("dark");
          $(this).css("background-color", isDark ? "#FFFFFF0A" : "#0000000A"); // Dark üçün ağ, Light üçün qara şəffaf fon
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      /// Bütün td-lərə border alt
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
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable thead th.filtering").each(function () {
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

      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      }

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      // Input sahəsində Enter düyməsinə basıldıqda və ya "GO" düyməsinə klik edildikdə səhifəyə keçid
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
        const pageNum = parseInt(inputVal, 10); // input-u tam ədəd kimi al
        const pageInfo = table.page.info(); // mövcud DataTable səhifə məlumatı

        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageInfo.pages) {
          table.page(pageNum - 1).draw("page"); // DataTable 0-dan başlayır
        } else {
          table.page(0).draw("page"); // Əgər səhvdirsə → 1-ci səhifə
        }

        $(".page-input").val(""); // input sahəsini təmizlə
      }

      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid var(--table-border-color)",
      });
      // Səhifələmə düymələri
      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
          pageInfo.page === 0
            ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-[#FFFFFF]"
        }" 
            onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
            <div class="icon stratis-chevron-left text-xs"></div>
        </div>
    `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
            <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
                ${
                  i === pageInfo.page
                    ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                    : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
                }"
                onclick="changePage(${i})">${i + 1}</button>
        `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight 
            ${
              pageInfo.page === pageInfo.pages - 1
                ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
                : "text-messages dark:text-[#FFFFFF]"
            }" 
            ${
              pageInfo.page < pageInfo.pages - 1
                ? `onclick="changePage(${pageInfo.page + 1})"`
                : ""
            }>
            <div class="icon stratis-chevron-right text-xs"></div>
        </div>
    `);
    },
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
