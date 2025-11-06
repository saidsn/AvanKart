"use strict";

$(document).ready(function () {
  // Verilənlər
  var myData = [{
    img: "/public/images/Avankart/Sirketler/PostEngineer.png",
    name: "Özsüt Restoran",
    id: "ID: MM-XXXXXXXX",
    count: "18%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Ramin Orucov",
    companyname: "Orkhan Icrai",
    status: "Aktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/CapitalFinance.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "10%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Ramin Orucov",
    companyname: "Orkhan Icrai",
    status: "Aktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/Malta.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "15%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Haqverdi Mustafayev",
    companyname: "İlkin Musayev",
    status: "Deaktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/PostEngineer.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "18%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "İsa Sadiqli",
    companyname: "Ramin Məmmədov",
    status: "Aktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/CapitalFinance.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "15%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Ramin Orucov",
    companyname: "Orkhan Icrai",
    status: "Silinmiş"
  }, {
    img: "/public/images/Avankart/Sirketler/Malta.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "15%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Haqverdi Mustafayev",
    companyname: "İlkin Musayev",
    status: "Deaktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/CapitalFinance.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "10%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Murad Orucov",
    companyname: "Fuad Babayev",
    status: "Aktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/Malta.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "15%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Haqverdi Mustafayev",
    companyname: "İlkin Musayev",
    status: "Deaktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/Malta.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "15%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "Haqverdi Mustafayev",
    companyname: "İlkin Musayev",
    status: "Deaktiv"
  }, {
    img: "/public/images/Avankart/Sirketler/PostEngineer.png",
    name: "Goory Restorant",
    id: "ID: MM-XXXXXXXX",
    count: "18%",
    mail: "capitalfinance@info.com",
    lastUpdateDate: "03.11.2024 - 12:45:22",
    authorizedPerson: "İsa Sadiqli",
    companyname: "Ramin Məmmədov",
    status: "Aktiv"
  }];
  var activeData = myData;
  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: activeData,
    columns: [{
      data: function data(row) {
        return "\n            <div class=\"flex items-center gap-3 relative\">\n              <div class=\"flex items-center justify-center w-12 h-12 rounded-full bg-table-hover text-[#7F57F1] font-semibold text-lg\">\n                <!-- Burada ist\u0259y\u0259 g\xF6r\u0259 loqonun ilk h\u0259rfl\u0259ri v\u0259 ya \u015F\u0259kil ola bil\u0259r -->\n                <img src=\"".concat(row.img, "\" /> \n              </div>\n              <div class=\"flex flex-col gap-0.5\">\n                <span class=\"font-medium text-[#1D222B] text-[13px]\">").concat(row.name, "</span>\n                <span class=\"text-[11px] text-[#1D222B] opacity-70 font-normal\">").concat(row.id, "</span>\n              </div>\n            </div>\n          ");
      }
    }, {
      data: function data(row) {
        return "<span class=\"flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.count, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"flex text-[13px]  text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.mail, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.lastUpdateDate, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">".concat(row.authorizedPerson, "</span>");
      }
    }, {
      data: function data(row) {
        return "<span class=\"text-[13px] text-messages font-normal dark:text-white\">".concat(row.companyname, "</span>");
      }
    }, {
      data: function data(row) {
        var color = "";

        switch (row.status) {
          case "Aktiv":
            color = "bg-[#4FC3F7]"; // mavi

            break;

          case "Deaktiv":
            color = "bg-[#BDBDBD]"; // boz

            break;

          case "Tamamlandı":
            color = "bg-[#66BB6A]"; // yaşıl

            break;

          case "Gözləyir":
            color = "bg-[#FFCA28]"; // sarı

            break;

          case "Silinmiş":
            color = "bg-[#EF5350]"; // qırmızı

            break;

          default:
            color = "bg-[#FF7043]";
          // narıncı (digər)
        }

        return "\n                 <div class=\"flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis\">\n                    <span class=\"w-[6px] h-[6px] rounded-full ".concat(color, " shrink-0 mr-2\"></span>\n                    <span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-medium\">").concat(row.status, "</span>\n                </div>\n                ");
      }
    }, {
      orderable: false,
      data: function data() {
        return "\n                          <div class=\"text-base flex items-center cursor-pointer \">\n                              <div class=\"icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5\"></div>\n                          </div>\n                      ";
      }
    }],
    order: [],
    lengthChange: false,
    pageLength: 9,
    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function createdRow(row, data, dataIndex) {
      // Hover effekti
      $(row).css("transition", "background-color 0.2s ease").on("mouseenter", function () {
        if (document.documentElement.classList.contains("dark")) {
          $(this).css("background-color", "#161E22"); // dark gray for dark mode
        } else {
          $(this).css("background-color", "#FAFAFA"); // light gray for light mode
        }
      }).on("mouseleave", function () {
        $(this).css("background-color", "");
      });
      var isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')

      var borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0"; /// Bütün td-lərə border alt

      $(row).find("td").css({
        "border-bottom": "0.5px solid ".concat(borderColor)
      });
    },
    initComplete: function initComplete() {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px"
      });
      var isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')
      // Filtrləmə ikonları üçün mövcud kodun saxlanması

      $("#myTable thead th.filtering").each(function () {
        $(this).html('<div class="custom-header w-[200px] flex gap-2.5 items-center"><div>' + $(this).text() + '</div><div class="icon stratis-sort-vertical-02 mt-1 px-2 text-messages dark:text-primary-text-color-dark"></div></div>');
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
      $pagination.empty(); // Səhifələmə düymələri

      $pagination.append("\n                <div class=\"flex items-center justify-center px-3 h-8 ms-0 leading-tight ".concat(pageInfo.page === 0 ? "opacity-50 cursor-not-allowed" : "text-messages dark:text-primary-text-color-dark", "\" \n                    onclick=\"changePage(").concat(Math.max(0, pageInfo.page - 1), ")\">\n                    <div class=\"icon stratis-chevron-left\"></div>\n                </div>\n            "));
      var paginationButtons = '<div class="flex gap-2">';

      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += "\n                    <button class=\"cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages \n                            ".concat(i === pageInfo.page ? "bg-[#F6D9FF] text-messages" : "bg-transparent text-tertiary-text", "\"\n                            onclick=\"changePage(").concat(i, ")\">").concat(i + 1, "</button>\n                ");
      }

      paginationButtons += "</div>";
      $pagination.append(paginationButtons);
      $pagination.append("\n                <div class=\"flex items-center justify-center px-3 h-8 ms-0 leading-tight ".concat(pageInfo.page === pageInfo.pages - 1 ? "opacity-50 cursor-not-allowed" : "text-tertiary-text", "\" \n                    onclick=\"changePage(").concat(pageInfo.page + 1, ")\">\n                    <div class=\"icon stratis-chevron-right\"></div>\n                </div>\n            "));
    }
  });
});