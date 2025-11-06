$(document).ready(function () {
  console.log("🎯 Dashboard Table başladı - Hybrid mode");

  // 🔧 CSRF Token əldə etmək
  function getCSRFToken() {
    let token = $('meta[name="csrf-token"]').attr("content");
    if (!token) {
      token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("_csrf="));
      if (token) {
        token = token.split("=")[1];
      }
    }
    return token;
  }

  // 🎯 Filter dəyərlərini əldə etmək
  function getFilterData() {
    console.log("🔍 ========== GET FILTER DATA START ==========");

    // Global filter dəyərlərindən məlumat götür
    const globalFilters = window.currentFilters || {};
    console.log("🔍 Global Filters:", globalFilters);

    // Əgər modal açıqdırsa, oradan da məlumat götür
    let modalStartDate = "";
    let modalEndDate = "";
    let modalCards = [];

    const filterModal = document.getElementById("dateModal");
    console.log("🔍 Filter Modal Element:", filterModal);

    if (filterModal) {
      const startDateInput = filterModal.querySelector("#startDate");
      const endDateInput = filterModal.querySelector("#endDate");

      console.log("🔍 Modal Date Inputs:");
      console.log("- Start Date Input:", startDateInput);
      console.log("- End Date Input:", endDateInput);

      if (startDateInput && startDateInput.value) {
        modalStartDate = startDateInput.value;
        console.log("- Modal Start Date Value:", modalStartDate);
      }
      if (endDateInput && endDateInput.value) {
        modalEndDate = endDateInput.value;
        console.log("- Modal End Date Value:", modalEndDate);
      }

      // Seçilmiş kartları tap
      const cardCheckboxes = filterModal.querySelectorAll(
        'input[type="checkbox"][id^="card_"]:checked'
      );
      console.log("🔍 Modal Card Checkboxes:");
      console.log("- Found Checked Checkboxes:", cardCheckboxes.length);

      cardCheckboxes.forEach((checkbox, index) => {
        console.log(`- Checkbox ${index}:`, {
          id: checkbox.id,
          value: checkbox.value,
          checked: checkbox.checked,
        });
        modalCards.push(checkbox.value);
      });
    }

    const finalData = {
      start_date: globalFilters.startDate || modalStartDate || "",
      end_date: globalFilters.endDate || modalEndDate || "",
      cards: globalFilters.cards || modalCards || [],
      statuses: getSelectedStatuses(),
      query: $("#customSearch").val() || "",
    };

    console.log("🔍 Final Filter Data:", finalData);
    console.log("🔍 ========== GET FILTER DATA END ==========");

    return finalData;
  }

  function getSelectedStatuses() {
    const statuses = [];
    $('input[name="status"]:checked').each(function () {
      statuses.push($(this).val());
    });
    return statuses.length > 0 ? statuses : ["success", "pending", "failed"];
  }

  // Verilənlər (static fallback)
  var myData = [
    {
      id: "AA-210",
      receiver: "RO-200",
      card: "Yemək",
      amount: "200.00",
      date: "01.12.2023 08:20",
    },
    {
      id: "AA-211",
      receiver: "RO-201",
      card: "Yanacaq",
      amount: "150.00",
      date: "02.12.2023 09:15",
    },
    {
      id: "AA-212",
      receiver: "RO-202",
      card: "Hədiyyə",
      amount: "300.00",
      date: "03.12.2023 10:30",
    },
    {
      id: "AA-213",
      receiver: "RO-203",
      card: "Yemək",
      amount: "120.00",
      date: "04.12.2023 11:45",
    },
    {
      id: "AA-214",
      receiver: "OR-210",
      card: "Yanacaq",
      amount: "180.00",
      date: "05.12.2023 12:20",
    },
    {
      id: "AA-215",
      receiver: "AG-210",
      card: "Hədiyyə",
      amount: "250.00",
      date: "06.12.2023 13:10",
    },
    {
      id: "AA-216",
      receiver: "RO-200",
      card: "Yemək",
      amount: "90.00",
      date: "07.12.2023 14:25",
    },
    {
      id: "AA-217",
      receiver: "OR-211",
      card: "Yanacaq",
      amount: "320.00",
      date: "08.12.2023 15:40",
    },
    {
      id: "AA-218",
      receiver: "AG-211",
      card: "Hədiyyə",
      amount: "140.00",
      date: "09.12.2023 16:55",
    },
  ];

  var activeData = myData;
  var useServerSide = true; // Server-side processing flag
  var table;

  // 📊 Server-Side DataTable
  function createServerSideTable() {
    console.log("🌐 Server-Side DataTable yaradılır...");

    if ($.fn.DataTable.isDataTable("#myTable")) {
      $("#myTable").DataTable().destroy();
    }

    // Global DataTable referansı yaradırıq
    window.dataTable = $("#myTable").DataTable({
      processing: true,
      serverSide: true,
      info: false,
      dom: "t",
      pageLength: 10,
      order: [{ date: "desc" }],
      lengthChange: false,

      ajax: {
        url: "/dashboardChart/transactions-table",
        type: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCSRFToken(),
        },
        data: function (d) {
          const filterData = getFilterData();
          const requestData = {
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            columns: d.columns,
            order: d.order,
            ...filterData,
          };

          console.log("📤 Server Request:", requestData);
          return JSON.stringify(requestData);
        },
        dataSrc: function (json) {
          console.log("📥 Server Response:", json);

          if (json.error) {
            console.error("❌ Server Error:", json.error);
            createStaticTable();
            return [];
          }

          return json.data || [];
        },
        error: function (xhr, status, error) {
          console.error("❌ AJAX Error:", error);
          console.log("🔄 Static mode-a keçilir...");
          createStaticTable();
        },
      },

      columns: [
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.id}</span>`;
          },
          name: "id",
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.receiver}</span>`;
          },
          name: "receiver",
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.card}</span>`;
          },
          name: "card",
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
          name: "amount",
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
          },
          name: "date",
        },
      ],

      createdRow: function (row, data, dataIndex) {
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
        console.log("✅ Server-Side Table hazır");

        $("#myTable thead th").css({
          "padding-left": "20px",
          "padding-top": "10.5px",
          "padding-bottom": "10.5px",
        });

        $("#myTable thead th.filtering").each(function () {
          $(this).html(
            '<div class="custom-header flex gap-2.5 items-center"><div>' +
              $(this).text() +
              '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
          );
        });
      },

      drawCallback: function () {
        handlePagination(this.api());
      },
    });
  }

  // 📊 Static DataTable (fallback)
  function createStaticTable() {
    console.log("📊 Static DataTable yaradılır...");
    useServerSide = false;

    if ($.fn.DataTable.isDataTable("#myTable")) {
      $("#myTable").DataTable().destroy();
    }

    // Global DataTable referansı yaradırıq
    window.dataTable = $("#myTable").DataTable({
      processing: false,
      serverSide: false,
      info: false,
      dom: "t",
      data: myData,
      pageLength: 9,
      order: [],
      lengthChange: false,

      columns: [
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.id}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.receiver}</span>`;
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

      createdRow: function (row, data, dataIndex) {
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
        console.log("✅ Static Table hazır");

        $("#myTable thead th").css({
          "padding-left": "20px",
          "padding-top": "10.5px",
          "padding-bottom": "10.5px",
        });

        $("#myTable thead th.filtering").each(function () {
          $(this).html(
            '<div class="custom-header flex gap-2.5 items-center"><div>' +
              $(this).text() +
              '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
          );
        });
      },

      drawCallback: function () {
        handlePagination(this.api());
      },
    });
  }

  // 📄 Pagination idarəsi (mövcud kodunuzdan)
  function handlePagination(api) {
    if (!api) {
      console.error("❌ API məlumatı yoxdur");
      return;
    }

    var pageInfo = api.page.info();
    var $pagination = $("#customPagination");

    if (pageInfo.pages === 0) {
      $pagination.empty();
      return;
    }

    $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
    $pagination.empty();

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
      const pageNum = parseInt(inputVal, 10);
      const pageInfo = table.page.info();

      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageInfo.pages) {
        table.page(pageNum - 1).draw("page");
      } else {
        table.page(0).draw("page");
      }

      $(".page-input").val("");
    }

    const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
    $lastRow.find("td").css({
      "border-bottom": "0.5px solid #E0E0E0",
    });

    // Səhifələmə düymələri
    $pagination.append(`
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
        pageInfo.page === 0
          ? "text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-primary-text-color-dark"
      }" 
          onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
          <div class="icon stratis-chevron-left"></div>
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
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
        pageInfo.page === pageInfo.pages - 1
          ? "text-[#636B6F] cursor-not-allowed"
          : "text-tertiary-text dark:text-primary-text-color-dark"
      }" 
          onclick="changePage(${pageInfo.page + 1})">
          <div class="icon stratis-chevron-right"></div>
      </div>
    `);
  }

  // 🔍 Axtarış
  $("#customSearch").on("keyup", function () {
    const searchValue = this.value;
    console.log("🔍 Axtarış:", searchValue);

    if (table) {
      table.search(searchValue).draw();
      if (!useServerSide) {
        updateCounts(activeData);
      }
    }
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
    if (table) {
      var pageInfo = table.page.info();
      if (page < 0) page = 0;
      if (page >= pageInfo.pages) page = pageInfo.pages - 1;
      table.page(page).draw("page");
    }
  };

  // 🎯 Filter Funksiyaları
  window.applyFilters = function () {
    console.log("🎯 Filter tətbiq edilir...");

    if (useServerSide && table && table.ajax) {
      table.ajax.reload();
    } else if (table) {
      table.draw();
    }
  };

  window.applyIllerFilters = function () {
    console.log("📅 İllər filtri");
    applyFilters();
  };

  window.clearIllerFilters = function () {
    console.log("🧹 İllər filterləri təmizlənir");
    $('input[value*="20"]').prop("checked", false);
    applyFilters();
  };

  window.applyKartlarFilters = function () {
    console.log("💳 Kartlar filtri");
    applyFilters();
  };

  window.clearKartlarFilters = function () {
    console.log("🧹 Kartlar filterləri təmizlənir");
    $('#kartlarPopupOverlay input[type="checkbox"]').prop("checked", false);
    applyFilters();
  };

  // Refresh funksiyası
  window.refreshTransactionsTable = function () {
    console.log("🔄 Table yenilənir...");

    if (useServerSide && table && table.ajax) {
      table.ajax.reload();
    } else if (table) {
      table.draw();
    }
  };

  // 🛠️ Debug Funksiyaları
  window.transactionsDebug = {
    getMode: function () {
      console.log("🔧 Mode:", useServerSide ? "Server-Side" : "Static");
      return useServerSide ? "server-side" : "static";
    },

    toggleMode: function () {
      useServerSide = !useServerSide;
      console.log(
        "🔄 Mode dəyişdirildi:",
        useServerSide ? "Server-Side" : "Static"
      );

      if (useServerSide) {
        createServerSideTable();
      } else {
        createStaticTable();
      }
    },

    testAPI: function () {
      console.log("🧪 API test edilir...");
      return $.ajax({
        url: "/dashboardChart/transactions-table",
        type: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCSRFToken(),
        },
        data: JSON.stringify({
          draw: 1,
          start: 0,
          length: 10,
          search: "",
          ...getFilterData(),
        }),
        success: function (data) {
          console.log("✅ API Test uğurlu:", data);
        },
        error: function (xhr, status, error) {
          console.error("❌ API Test uğursuz:", error);
        },
      });
    },

    getCurrentData: function () {
      if (table) {
        return table.data().toArray();
      }
      return [];
    },
  };

  // Event listeners
  $('a[href="#"]').on("click", function (e) {
    e.preventDefault();
    refreshTransactionsTable();
  });

  // 🚀 İlk yükləmə
  console.log("🚀 İlk yükləmə başlayır...");

  if ($("#myTable").length) {
    if (useServerSide) {
      console.log("🌐 Server-Side mode seçildi");
      createServerSideTable();
    } else {
      console.log("📊 Static mode seçildi");
      createStaticTable();
    }
  } else {
    console.error("❌ Table element tapılmadı");
  }

  console.log("✅ Dashboard Table hazır!");
  console.log("🛠️ Debug: transactionsDebug metodlarını istifadə edin");
});
