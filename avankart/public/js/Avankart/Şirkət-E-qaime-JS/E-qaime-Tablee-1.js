$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  let table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    processing: true,
    serverSide: true,
    ajax: {
      url: "/api/avankart/Sirket/E-qaime/Eqaime-table.json", // Use same endpoint for both api\avankart\hesablasma-sirket.json
      type: "GET",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: function (d) {
        d.start_date = $("#startDate").val() || "";
        d.end_date = $("#endDate").val() || "";
        d.type = 'currentType'; // Send category to backend
        d.category = 'currentType'; // Alternative field name
        // ✅ statusleri checkboxlardan al
        const status = [];
        if ($("#newCheckbox1").is(":checked")) status.push("unread");
        if ($("#readCheckbox2").is(":checked")) status.push("read");

        // hiçbir şey seçilmediyse “all” gönder
        d.statuses = status.length ? status : [];
      },
      dataSrc: function (json) {
        // 📊 Count-ları server response-dan yenilə
        if (json.counts) {
          notificationCounts = json.counts;
          updateDisplayCounts();
        }
        return json.data || [];
      },
    },
    columns: [
      {
        data: function (row) {
          return `<div class="flex items-center gap-2.5">
                      <div class="bg-table-hover rounded-[50%] w-[50px] h-[33px] flex items-center justify-center">
                          <div>
                              <img src="${row.logo}" class="object-cover" alt="Logo">
                          </div>
                      </div>
                      <div class="w-full">
                          <div class="text-[13px] font-medium">${row.companyName}</div>
                          <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${row.companyId}</span></div>
                      </div>
                  </div>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px]  text-messages dark:text-primary-text-color-dark  flex justify-center font-normal">${row.ReceiptNumber}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px]  text-messages dark:text-primary-text-color-dark  flex justify-center font-normal">${row.amount} ₼</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] w-full text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
        },
      },
      {
        data: function (row) {
          let color = "";
          switch (row.status) {
            case "Aktiv":
              color = "bg-[#4FC3F7]"; // mavi
              break;
            case "Qaralama":
              color = "bg-[#BDBDBD]"; // boz
              break;
            case "Tamamlandı":
              color = "bg-[#66BB6A]"; // yaşıl
              break;
            case "Gözləyir":
              color = "bg-[#FFCA28]"; // sarı
              break;
            case "Report edildi":
              color = "bg-[#EF5350]"; // qırmızı
              break;
            default:
              color = "bg-[#FF7043]"; // narıncı (digər)
          }

          return `
                   <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                      <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                      <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
                  </div>
                  `;
        },
      },
      {
        orderable: false,
        data: function () {
          return `
                          <div class="text-base flex items-center cursor-pointer">
                              <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 open-popup"></div>
                          </div>
                      `;
        },
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 10,
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
        "border-left": "0.5px solid #E0E0E0",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex w-[120px] gap-2.5 items-center"><div>' +
          $(this).text() +
          '</div><div class="icon stratis-sort-vertical-02 p-2 mt-1 text-messages"></div></div>'
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
        "border-bottom": "0.5px solid #E0E0E0",
      });

      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });

      // Səhifələmə düymələri
      $pagination.append(`
                  <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0
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
                              ${i === pageInfo.page
            ? "bg-[#F6D9FF] text-messages"
            : "bg-transparent text-tertiary-text"
          }"
                              onclick="changePage(${i})">${i + 1}</button>
                  `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
                  <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1
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





// 3 nöqtə iconuna klikdə açılan dropdown üçün event delegation
$(document).on('click', '.open-popup', function (e) {
  e.stopPropagation();

  // Əvvəlki açıq dropdown-ları bağla
  $('.main-dropdown-menu').remove();

  // Dropdown HTML-i
  const dropdownHtml = `
    <div class="main-dropdown-menu dropdown-menu absolute right-0 top-11 z-50 min-w-[183px] bg-white dark:bg-table-hover-dark text-[#1D222B] dark:text-white rounded-[12px] shadow-lg border border-[#0000001A] dark:border-[#ffffff1A] py-1">
   
      <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal" onclick="openAvankartaModal('BINV-XXXXXXXXXX')">
        <div class="icon stratis-file-check-02 text-messages dark:text-primary-text-color-dark w-4 h-4"></div>
        <span>Təsdiqlə</span>
      </div>
      <div class="border-t my-1 dark:border-surface-variant-dark"></div>
      <div class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[#DD3838] hover:bg-error-hover dark:hover:bg-error-hover-dark text-[#1D222B] dark:text-white text-[13px] font-normal" onclick="openReportEtModal()">
        <div class="icon stratis-help-circle-contained text-error dark:text-error-dark w-4 h-4"></div>
        <span class="text-error dark:text-error-dark">Report et</span>
      </div>
    </div>
  `;

  // Mövcud dropdown varsa sil
  $(this).closest('td').find('.main-dropdown-menu').remove();

  // Dropdown-u əlavə et
  $(this).closest('td').css('position', 'relative').append(dropdownHtml);
});

// Səhifədə başqa yerə klikləyəndə dropdown bağlansın
$(document).on('click', function () {
  $('.main-dropdown-menu').remove();
});

// Dropdownun içində klikdə bağlanmasın
$(document).on('click', '.main-dropdown-menu', function (e) {
  e.stopPropagation();
});
$(document).on('click', function () {
  $('.main-dropdown-menu').remove();
});







function openYearPopup(companyName) {

  const years = [];
  for (let y = 2024; y >= 1999; y--) {
    if (y !== 2023) years.push(y);
  }
 
}


function openMonthPopup(companyName, year) {

}

// Ay seçiləndə yeni səhifəni AJAX-la yüklə və başlığı dəyiş
function loadInvoicePage(companyName, year, month) {
  // Başlığı dəyiş
  $('#mainTitle').text(`${companyName} / ${year} - ${month}`);

  // AJAX ilə kontenti yüklə
  $.ajax({
    url: `/invoices?company=${encodeURIComponent(companyName)}&year=${year}&month=${month}`,
    method: 'GET',
    success: function(data) {
      $('#mainContent').html(data); // və ya uyğun div
    }
  });

  // Popup-ları bağla
  $('.popup-class').remove();
}