$(document).ready(function () {
  // Verilənlər

  const myData = [
    {
      id: "AP-XXXXXXXXXX",
      name: "Ramin Orucov",
      position: "Designer",
      group: "Marketing",
      amount: 150.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Fuad Bayramov",
      position: "Mühasib",
      group: "Mühasiblər",
      amount: 18000.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Elvin Hüseynov",
      position: "Layihə Rəhbəri",
      group: "Layihə Rəhbərləri",
      amount: 220.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Etibar Quliyev",
      position: "Baş Mühasib",
      group: "Mühasiblər",
      amount: 150.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Kamran Əliyev",
      position: "Layihə Rəhbəri",
      group: "Layihə Rəhbərləri",
      amount: 110.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Fatimə Ağayeva",
      position: "Designer",
      group: "Marketing",
      amount: 270.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Mənsur İsmayilov",
      position: "Developer",
      group: "Information Technology",
      amount: 90.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Zaur Ağayev",
      position: "Cyber Security",
      group: "Information Technology",
      amount: 85.5,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "İbrahim Feyzullazadə",
      position: "IT Biznes Analitik",
      group: "Information Technology",
      amount: 210.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "İlkin Məmmədov",
      position: "SQL Developer",
      group: "Information Technology",
      amount: 350.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Nihad Məmmədov",
      position: "Developer",
      group: "Information Technology",
      amount: 110.0,
      date: "01.12.2023 08:20",
    },
    {
      id: "AP-XXXXXXXXXX",
      name: "Heydər Şxiyev",
      position: "IT Biznes Analitik",
      group: "Information Technology",
      amount: 190.0,
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
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.position}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.group}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.amount.toFixed(
            2
          )} ₼</span>`;
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
    pageLength: myData.length,

    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function (row, data, dataIndex) {
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          const isDark = $("html").hasClass("dark");
          $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6"); // Dark üçün ağ, Light üçün qara şəffaf fon
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      /// Bütün td-lərə border alt
      $(row)
        .find("td")
        .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

      $(row).find("td:not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      // Sağ td (üç nöqtə): border ver
      $(row).find("td:last-child").addClass("border-l-[.5px] border-stroke");
    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid var(--table-border-color)",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-on-primary-dark"></div></div>'
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

      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid var(--table-border-color)",
      });

      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid var(--table-border-color)",
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

  // Sayları yeniləmək
  updateCounts(activeData);

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    var pageInfo = table.page.info();
    if (page < 0) page = 0;
    if (page >= pageInfo.pages) page = pageInfo.pages - 1; // cəmi səhifədən çox olmasın
    table.page(page).draw("page");
  };
  $("#refreshPage").on("click", function (e) {
    e.preventDefault();
    filterByStatus(currentFilter); // Hal-hazırda hansı filterdədirsə ona uyğun redraw
  });
});

// ...existing code...

window.toggleDropdown = function (icon, rowIndex) {
  // Bütün açıq dropdown-ları bağla
  document
    .querySelectorAll(".dropdown-menu")
    .forEach((menu) => menu.classList.add("hidden"));
  // Cari dropdown-u aç/bağla
  const dropdown = icon.nextElementSibling;
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
};

// Səhifədə başqa yerə klikləyəndə popup-ları bağla
document.addEventListener("click", function (e) {
  if (
    !e.target.closest(".dropdown-menu") &&
    !e.target.classList.contains("stratis-dot-vertical")
  ) {
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((menu) => menu.classList.add("hidden"));
  }
});

function openAvankartaModal() {
  document.getElementById("avankartaModalOverlay").classList.remove("hidden");
  document.getElementById("avankartaModal").classList.remove("hidden");
}
function closeAvankartaModal() {
  document.getElementById("avankartaModalOverlay").classList.add("hidden");
  document.getElementById("avankartaModal").classList.add("hidden");
}
window.confirmAvankarta = function () {
  // Burada təsdiqləmə əməliyyatını yaz (API və ya başqa əməliyyat)
  closeAvankartaModal();
  alert("Avankarta göndərildi!");
};

function openReportModal(invoice, transactions, amount, date) {
  document.getElementById("reportModalOverlay").classList.remove("hidden");
  document.getElementById("reportModal").classList.remove("hidden");
  // Dəyərləri doldur
  document.getElementById("reportInvoice").innerText = invoice;
  document.getElementById("reportTransactions").innerText = transactions;
  document.getElementById("reportAmount").innerText = amount + " AZN";
  document.getElementById("reportDate").innerText = date;
}
function closeReportModal() {
  document.getElementById("reportModalOverlay").classList.add("hidden");
  document.getElementById("reportModal").classList.add("hidden");
}

function fakturaClick() {
  document.getElementById("fakturaModalOverlay").classList.toggle("hidden");
  document.getElementById("drop-zone").classList.toggle("hidden");
}
