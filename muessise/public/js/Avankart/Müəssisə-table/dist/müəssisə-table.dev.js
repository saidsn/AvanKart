"use strict";

$(document).ready(function () {
  // Verilənlər
  var myData = [{
    logo: "/public/images/müəssisə-logo/Vector.png",
    companyName: "Goory Restorant",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 6,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Aktiv"
  }, {
    logo: "/public/images/müəssisə-logo/vector-1.png",
    companyName: "Malta",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 7,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Gözləyir"
  }, {
    logo: "/public/images/müəssisə-logo/Vector.png",
    companyName: "Goory Restorant",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 7,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Tamamlandı"
  }, {
    logo: "/public/images/müəssisə-logo/Vector.png",
    companyName: "Goory Restorant",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 6,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Aktiv"
  }, {
    logo: "/public/images/müəssisə-logo/vector-1.png",
    companyName: "Malta",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 6,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Aktiv"
  }, {
    logo: "/public/images/müəssisə-logo/Vector.png",
    companyName: "Goory Restorant",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 7,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Tamamlandı"
  }, {
    logo: "/public/images/müəssisə-logo/Vector.png",
    companyName: "Goory Restorant",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 7,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Tamamlandı"
  }, {
    logo: "/public/images/müəssisə-logo/vector-1.png",
    companyName: "Malta",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 6,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Aktiv"
  }, {
    logo: "/public/images/müəssisə-logo/Vector.png",
    companyName: "Goory Restorant",
    companyId: "CM-XXXXXXXX",
    invoice: "MINV-XXXXXXXXXX",
    TransactionNumber: 7,
    amount: "102.78",
    commission: "2.50",
    finalAmount: "100.28",
    date: "01.12.2023 - 16.12.2023",
    status: "Tamamlandı"
  }];
  var activeData = myData;
  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: activeData,
    columns: [{
      data: function data(row) {
        return "<div class=\"flex items-center gap-2.5\">\n                      <div class=\"bg-table-hover rounded-[50%]\">\n                          <div >\n                              <img src=\"".concat(row.logo, "\" class=\"w-[50px] h-[33px] \" alt=\"Logo\">\n                          </div>\n                      </div>\n                      <div class=\"w-full\">\n                          <div class=\"text-[13px] font-medium\">").concat(row.companyName, "</div>\n                          <div class=\"text-[11px] text-messages opacity-65 font-normal\">ID: <span class=\"opacity-100\">").concat(row.companyId, "</span></div>\n                      </div>\n                  </div>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px]  text-messages dark:text-primary-text-color-dark  flex justify-center font-normal\">".concat(row.invoice, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px]  text-messages dark:text-primary-text-color-dark  flex justify-center font-normal\">".concat(row.TransactionNumber, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.amount, " \u20BC</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.commission, " \u20BC</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.finalAmount, " \u20BC</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] w-full text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.date, "</span>");
      }
    }, {
      data: function data(row) {
        var color = "";

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
            color = "bg-[#FF7043]";
          // narıncı (digər)
        }

        return "\n                   <div class=\"flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis\">\n                      <span class=\"w-[6px] h-[6px] rounded-full ".concat(color, " shrink-0 mr-2\"></span>\n                      <span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-medium\">").concat(row.status, "</span>\n                  </div>\n                  ");
      }
    }, {
      orderable: false,
      data: function data() {
        return "\n                          <div class=\"text-base flex items-center cursor-pointer\">\n                              <div class=\"icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5\"></div>\n                          </div>\n                      ";
      }
    }],
    order: [],
    lengthChange: false,
    pageLength: myData.length,
    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function createdRow(row, data, dataIndex) {
      // Hover effekti
      $(row).css("transition", "background-color 0.2s ease").on("mouseenter", function () {
        $(this).css("background-color", "#F5F5F5");
      }).on("mouseleave", function () {
        $(this).css("background-color", "");
      }); /// Bütün td-lərə border alt

      $(row).find("td").addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");
      $(row).find("td:not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px"
      }); // Sağ td (üç nöqtə): border ver

      $(row).find("td:last-child").addClass("border-l-[.5px] border-stroke");
    },
    initComplete: function initComplete() {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px"
      });
      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0"
      }); // Filtrləmə ikonları üçün mövcud kodun saxlanması

      $("#myTable thead th.filtering").each(function () {
        $(this).html('<div class="custom-header flex w-fit gap-2.5 items-center"><div>' + $(this).text() + '</div><div class="icon stratis-sort-vertical-02 p-2 mt-1 text-messages"></div></div>');
      });
    },
    drawCallback: function drawCallback() {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination");

      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      }

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();
      var colCount = $("#myTable thead th").length;
      var spacerRow = "<tr class=\"spacer-row\"><td colspan=\"".concat(colCount, "\" style=\"height:12px; padding:0; border:none;\"></td></tr>");
      $("#myTable tbody").prepend(spacerRow); // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et

      var $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0"
      });
      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid #E0E0E0"
      }); // Səhifələmə düymələri

      $pagination.append("\n                  <div class=\"flex items-center justify-center px-3 h-8 ms-0 leading-tight ".concat(pageInfo.page === 0 ? "opacity-50 cursor-not-allowed" : "text-messages", "\" \n                      onclick=\"changePage(").concat(Math.max(0, pageInfo.page - 1), ")\">\n                      <div class=\"icon stratis-chevron-left\"></div>\n                  </div>\n              "));
      var paginationButtons = '<div class="flex gap-2">';

      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += "\n                      <button class=\"cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages \n                              ".concat(i === pageInfo.page ? "bg-[#F6D9FF] text-messages" : "bg-transparent text-tertiary-text", "\"\n                              onclick=\"changePage(").concat(i, ")\">").concat(i + 1, "</button>\n                  ");
      }

      paginationButtons += "</div>";
      $pagination.append(paginationButtons);
      $pagination.append("\n                  <div class=\"flex items-center justify-center px-3 h-8 ms-0 leading-tight ".concat(pageInfo.page === pageInfo.pages - 1 ? "opacity-50 cursor-not-allowed" : "text-tertiary-text", "\" \n                      onclick=\"changePage(").concat(pageInfo.page + 1, ")\">\n                      <div class=\"icon stratis-chevron-right\"></div>\n                  </div>\n              "));
    }
  }); // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin

  $("#newCheckbox").on("change", function () {
    var isChecked = $(this).is(":checked");
    $('#myTable tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  }); // Axtarış

  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
    updateCounts(activeData);
  }); // Sayları yeniləmək üçün funksiya

  function updateCounts(data) {
    var totalCount = data.length;
    var readCount = data.filter(function (row) {
      return row.status === "Oxundu";
    }).length;
    var unreadCount = data.filter(function (row) {
      return row.status === "Yeni";
    }).length;
    $("#total-count").text("Ham\u0131s\u0131 (".concat(totalCount, ")"));
    $("#read-count").text("Oxunmu\u015Flar (".concat(readCount, ")"));
    $("#unread-count").text("Oxunmam\u0131\u015Flar (".concat(unreadCount, ")"));
  } // Səhifə dəyişdirmə


  window.changePage = function (page) {
    table.page(page).draw("page");
  };
});