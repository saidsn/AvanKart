$(document).ready(function () {
  // Verilənlər
  var myData = [
    {
      img: "/public/images/Avankart/Sirketler/PostEngineer.png",
      name: "Özsüt Restoran",
      id: "ID: MM-XXXXXXXX",
      count: "18%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Ramin Orucov",
      companyname: "Orkhan Icrai",
      status: "Aktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/CapitalFinance.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "10%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Ramin Orucov",
      companyname: "Orkhan Icrai",
      status: "Aktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/Malta.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "15%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Haqverdi Mustafayev",
      companyname: "İlkin Musayev",
      status: "Deaktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/PostEngineer.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "18%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "İsa Sadiqli",
      companyname: "Ramin Məmmədov",
      status: "Aktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/CapitalFinance.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "15%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Ramin Orucov",
      companyname: "Orkhan Icrai",
      status: "Silinmiş",
    },
    {
      img: "/public/images/Avankart/Sirketler/Malta.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "15%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Haqverdi Mustafayev",
      companyname: "İlkin Musayev",
      status: "Deaktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/CapitalFinance.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "10%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Murad Orucov",
      companyname: "Fuad Babayev",
      status: "Aktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/Malta.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "15%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Haqverdi Mustafayev",
      companyname: "İlkin Musayev",
      status: "Deaktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/Malta.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "15%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "Haqverdi Mustafayev",
      companyname: "İlkin Musayev",
      status: "Deaktiv",
    },
    {
      img: "/public/images/Avankart/Sirketler/PostEngineer.png",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "18%",
      mail: "capitalfinance@info.com",
      lastUpdateDate: "03.11.2024 - 12:45:22",
      authorizedPerson: "İsa Sadiqli",
      companyname: "Ramin Məmmədov",
      status: "Aktiv",
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
          return `
            <div class="flex items-center gap-3 relative">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-table-hover text-[#7F57F1] font-semibold text-lg">
                <!-- Burada istəyə görə loqonun ilk hərfləri və ya şəkil ola bilər -->
                <img src="${row.img}" /> 
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="font-medium text-[#1D222B] text-[13px]">${row.name}</span>
                <span class="text-[11px] text-[#1D222B] opacity-70 font-normal">${row.id}</span>
              </div>
            </div>
          `;
        },
      },

      {
        data: function (row) {
          return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.count}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="flex text-[13px]  text-messages dark:text-primary-text-color-dark font-normal">${row.mail}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.lastUpdateDate}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.authorizedPerson}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.companyname}</span>`;
        },
      },
      {
        data: function (row) {
          let color = "";
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
                          <div class="text-base flex items-center cursor-pointer ">
                              <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
                          </div>
                      `;
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
    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      const isDarkMode = document.documentElement.classList.contains("dark"); // və ya: document.documentElement.classList.contains('dark')

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header w-[200px] flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 px-2 text-messages dark:text-primary-text-color-dark"></div></div>'
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
});
