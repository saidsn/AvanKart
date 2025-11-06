$(document).ready(function () {
  // CSRF token-i meta tag-dən al
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  if (!csrfToken) {
    console.error('CSRF token tapılmadı');
  }

  // URL-dən qaime_id-ni al
  const people_id = $('#data_id').val();
  let table;
  if (table) table.destroy();
  table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    serverSide: true,
    processing: true,
    ajax: {
      url: "/isci/duty-details",
      type: "POST",
      headers: { "CSRF-Token": csrfToken },
      data: function (d) {
        // CSRF token əlavə et
        d._csrf = csrfToken;

        // Qaime ID-ni əlavə et
        d.imtiyaz_id = people_id;

        // Axtarış
        const searchValue = $("#customSearch").val();
        if (searchValue && searchValue.trim() !== '') {
          d.searchText = searchValue.trim();
        }

        // Pagination
        d.page = Math.floor(d.start / d.length) + 1;
        d.limit = d.length;
        d.draw = d.draw;

        return d;
      },
      dataSrc: function (json) {
        // DataTable üçün lazım olan məlumatları set et
        json.recordsTotal = json.recordsTotal || 0;
        json.recordsFiltered = json.recordsFiltered || json.recordsTotal || 0;
        return json.data || [];
      },
      error: function (xhr, error, thrown) {
        console.error("AJAX ERROR:", xhr.responseText);
      }
    },
    columns: [
        // {
        //   orderable: false,
        //   data: function (row, type, set, meta) {
        //     const idx = meta.row;
        //     const employeeId = row._id || row.id || "";
        //     const peopId = row.people_id || row.id || "";
        //     return `
        //     <input type="checkbox" id="cb-active-${idx}" data-employee-id="${employeeId}" data-peop-id="${peopId}" class="peer hidden">
        //     <label for="cb-active-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:text-on-primary dark:peer-checked:text-primary-text-color-dark peer-checked:border-primary dark:peer-checked:border-primary transition">
        //       <div class="icon stratis-check-01 scale-60"></div>
        //     </label>
        //   `;
        //   },
        // },
        {
          data: function (row) {
            const initials = (row.fullname || "")
              .split(" ")
              .map((w) => w[0])
              .join("");
            return `
              <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                ${initials}
              </div>
              <div class="flex flex-col">
                <span class="text-messages text-[13px] font-medium dark:text-white">${
                  row.fullname || ""
                }</span>
                <span class="text-secondary-text text-[11px] font-normal dark:text-white">ID: ${
                  row.id || ""
                }</span>
              </div>
            </div>
          `;
          },
        },
        {
          data: "gender",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${
              d || ""
            }</span>`,
        },
        {
          data: "duty",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${
              d === "N/A" || null ? "-" : d
            }</span>`,
        },
        {
          data: "email",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${
              d || ""
            }</span>`,
        },
        {
          data: "phoneNumber",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${
              d || ""
            }</span>`,
        },
        {
          data: "hireDate",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${
              d || ""
            }</span>`,
        },
      ],
    lengthChange: false,
    pageLength: 10,
    language: {
      processing: "Məlumatlar yüklənir...",
      emptyTable: "Cədvəldə heç bir məlumat yoxdur",
      zeroRecords: "Axtarışa uygun nəticə tapılmadı"
    },
    // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
    createdRow: function (row, data, dataIndex) {
      $(row).on("click", "td:not(:last-child)", function (e) {
          if ($(e.target).is("input, button, a, label")) return;
          localStorage.setItem("selectedUser", JSON.stringify(data));

          const balanceId = data.balance_id || data.id;
          if (balanceId) {
            viewInvoice(balanceId);
          } else {
            console.error("Balance ID tapılmadı - məlumatı yoxlayın:", data);
          }
        });
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (document.documentElement.classList.contains("dark")) {
            $(this).css("background-color", "#242C30"); // dark gray for dark mode
          } else {
            $(this).css("background-color", "#FAFAFA"); // light gray for light mode
          }
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

      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

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

      // Səhifələmə düymələri
      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF] cursor-pointer"
        }" 
            onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
            <div class="icon stratis-chevron-left text-xs"></div>
        </div>
    `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
            <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
                ${i === pageInfo.page
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
            ${pageInfo.page === pageInfo.pages - 1
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF] cursor-pointer"
        }" 
            ${pageInfo.page < pageInfo.pages - 1
          ? `onclick="changePage(${pageInfo.page + 1})"`
          : ""
        }>
            <div class="icon stratis-chevron-right text-xs"></div>
        </div>
    `);
    },
  });

  // Axtarış - debounce ilə (performans üçün)
  let searchTimeout;
  $("#customSearch").on("keyup", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      table.ajax.reload();
    }, 500); // 500ms gecikmə
  });
  window.viewInvoice = function (balanceId) {
    if (balanceId) {
      window.location.href = `/isci/details/${balanceId}`;
    } else {
      console.error("Balance ID tapılmadı");
    }
  };
  $("#refreshPage").on("click", function() {
    table.ajax.reload();
  });
  // Filter button click handler
  $("#applyFilterBtn").on("click", function (e) {
    e.preventDefault();

    console.log('Filter button clicked');

    // Filter popup-ı bağla
    if (typeof openFilterModal === 'function') {
      openFilterModal();
    }

    // Table-ı yenidən yüklə
    table.ajax.reload();
  });

  // Filter təmizlə button
  $("#clearFiltersBtn").on("click", function (e) {
    e.preventDefault();

    console.log('Clear filters clicked');

    // Slider reset et
    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("values", [0, 1000]);
      // Slider value display-ni yenilə
      $("#min-value").text('0');
      $("#max-value").text('1000');
    }

    // Min/max input-ları təmizlə (əgər var)
    $("#min-amount, #max-amount").val('');

    // Search input təmizlə
    $("#customSearch").val('');

    // Table-ı yenidən yüklə
    table.ajax.reload();
  });

  // Range slider dəyişəndə real-time filter
  if ($("#slider-range").length) {
    $("#slider-range").on("slidechange", function (event, ui) {
      console.log('Slider changed:', ui.values);
      // Auto-reload etmə, yalnız Apply Filter düyməsi basılanda
    });
  }

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    console.log('Changing to page:', page);
    table.page(page).draw("page");
  };
});

$(document).ready(function () {
  const invoiceData = JSON.parse(localStorage.getItem("selectedInvoice"));
  console.log(invoiceData,"data")
  if (invoiceData) {
    $("#detail-invoice").text(invoiceData.receiptNumber);
    // $("#detail-customers").text(`${invoiceData.amount} ₼`); qaime meblegini owerwrite edir
    $("#detail-transactions").text(invoiceData.date);

    let color = "";
    switch (invoiceData.status) {
      case "Aktiv":
        color = "#4FC3F7";
        break;
      case "Qaralama":
        color = "#BDBDBD";
        break;
      case "Tamamlandı":
        color = "#66BB6A";
        break;
      case "Gözləyir":
        color = "#FFCA28";
        break;
      case "Report edildi":
        color = "#EF5350";
        break;
      default:
        color = "#FF7043";
        break;
    }

    $("#detail-status").html(`
      <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="w-[6px] h-[6px] rounded-full" style="background-color:${color}; margin-right:8px;"></span>
        <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${invoiceData.status}</span>
      </div>
    `);
  }
});
