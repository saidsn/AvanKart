$(document).ready(function () {
  // Verilənlər
  var myData = [
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Özsüt Restoran",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "Davam edir",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
    },
    {
      img: "/public/images/Avankart/avankartPartner/restoranImg.svg",
      name: "Goory Restorant",
      id: "ID: MM-XXXXXXXX",
      count: "4352",
      amount: "3,200.00",
      startDate: "01.12.2023",
      statusDate: "16.08.2023",
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
          return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.amount}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.startDate}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.statusDate}</span>`;
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

      $(row).on("click", function () {
        localStorage.setItem("selectedPrize", JSON.stringify(data));
        window.location.href = "../avankartPartner/qrKodTarixcesi.html";
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

$(document).ready(function () {
  const myData = [
    {
      status: "Qaralama",
      id: "S-XXXXXXXXX",
      title: "İstifadəçinin ödəniş edə bilməməsi",
      description:
        "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
      responsible: "Orxan İcrai",
      priority: "High",
      date: "12.01.2024",
      userType: "İstifadəçi",
    },
    {
      status: "Qaralama",
      id: "S-XXXXXXXXX",
      title: "İstifadəçinin ödəniş edə bilməməsi",
      description:
        "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
      responsible: "Orxan İcrai",
      priority: "Low",
      date: "12.01.2024",
      userType: "İstifadəçi",
    },
    {
      status: "Qaralama",
      id: "S-XXXXXXXXX",
      title: "İstifadəçinin ödəniş edə bilməməsi",
      description:
        "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
      responsible: "Orxan İcrai",
      priority: "Low",
      date: "12.01.2024",
      userType: "İstifadəçi",
    },
    {
      status: "Baxılır",
      id: "S-XXXXXXXXX",
      title: "İstifadəçinin ödəniş edə bilməməsi",
      description:
        "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
      responsible: "Orxan İcrai",
      priority: "High",
      date: "12.01.2024",
      userType: "İstifadəçi",
    },
    {
      status: "Baxılır",
      id: "S-XXXXXXXXX",
      title: "İstifadəçinin ödəniş edə bilməməsi",
      description:
        "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
      responsible: "Orxan İcrai",
      priority: "High",
      date: "12.01.2024",
      userType: "İstifadəçi",
    },
    {
      status: "Rədd edildi",
      id: "S-XXXXXXXXX",
      title: "İstifadəçinin ödəniş edə bilməməsi",
      description:
        "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
      responsible: "Orxan İcrai",
      priority: "High",
      date: "12.01.2024",
      userType: "İstifadəçi",
    },
    {
      status: "Həll olundu",
      id: "S-XXXXXXXXX",
      title: "İstifadəçinin ödəniş edə bilməməsi",
      description:
        "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
      responsible: "Orxan İcrai",
      priority: "High",
      date: "12.01.2024",
      userType: "İstifadəçi",
    },
  ];

  const colorMap = {
    "Qaralama": "bg-[#BFC8CC]",
    "Baxılır": "bg-[#F9B100]",
    "Həll olundu": "bg-[#32B5AC]",
    "Rədd edildi": "bg-[#DD3838]",
  };

  function renderGroupedStatusCards(data) {
    const container = $("#queriesSection");
    container.find(".status-column").empty();

    const statuses = ["Qaralama", "Baxılır", "Həll olundu", "Rədd edildi"];

    // Başlıqları əlavə et
    statuses.forEach((status) => {
      const col = $("#column-" + status.replace(" ", "-"));
      col.html(`
      <div class="flex items-center gap-2 mb-3">
        <span class="w-[6px] h-[6px] rounded-full ${colorMap[status]}"></span>
        <h3 class="font-medium text-xs">${status}</h3>
      </div>
    `);
    });

    // Kartları statusa görə əlavə et
    data.forEach((item) => {
      const initials = item.responsible
        .split(" ")
        .map((n) => n[0])
        .join("");
      const priorityIcon =
        item.priority === "High"
          ? '<img src="/public/images/Avankart/avankartPartner/high.svg" alt="High" class="w-4 h-4"/>'
          : '<img src="/public/images/Avankart/avankartPartner/low.svg" alt="Low" class="w-4 h-4"/>';

      const cardHtml = `
        <div class="mb-2 p-3 bg-container-2 rounded-[8px]">
          <div class="flex items-center justify-between">
            <span class="text-[11px] opacity-65">${item.id}</span>
          </div>
          <div class="mt-0.5 mb-3">
            <div class="text-[13px] font-medium mb-1">${item.title}</div>
            <div class="text-[11px] font-normal opacity-65">${item.description}</div>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <div class="w-[34px] h-[34px] bg-button-disabled rounded-full flex justify-center items-center">
                <div class="text-[12px] font-semibold font-poppins w-[13px] h-[19px] leading-[160%] text-primary">${initials}</div>
              </div>
              <h3 class="text-[13px] font-normal">${item.responsible}</h3>
            </div>
            <div class="flex items-center gap-2 justify-center">
              ${priorityIcon}
              <span class="text-[13px] font-medium">${item.priority}</span>
            </div>
          </div>
          <div class="my-3 flex items-center justify-between">
            <div class="bg-table-hover rounded-full flex items-center justify-center gap-1 h-[27px] !w-[97px]">
              <div class="icon stratis-calendar-check"></div>
              <span class="!text-[12px] font-medium">${item.date}</span>
            </div>
            <div class="flex items-center justify-center gap-1 py-[4.5px] px-[2px]">
              <div class="icon stratis-users-profiles-02"></div>
              <span class="!text-[12px] font-medium px-2">${item.userType}</span>
            </div>
          </div>
        </div>
      `;

      const columnId = "column-" + item.status.replace(" ", "-");
      const col = $("#" + columnId);
      if (col.length) {
        col.append(cardHtml);
      }
    });
  }

  // Tab klikləri
  $("#menuTabs a.filter-button").click(function (e) {
    e.preventDefault();
    const tabText = $(this).text().toLowerCase();

    if (tabText.includes("qr kod tarixçəsi")) {
      $("#qrHistorySection").show();
      $("#queriesSection").hide();
    } else if (tabText.includes("sorğular")) {
      $("#qrHistorySection").hide();
      $("#queriesSection").show();
      renderGroupedStatusCards(myData);
    }
  });

  // İlkin olaraq "Qr kod tarixçəsi" aktivdir
  $("#qrHistorySection").show();
  $("#queriesSection").hide();
});
