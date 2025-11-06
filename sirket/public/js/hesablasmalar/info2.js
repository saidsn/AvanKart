$(document).ready(function () {
  // CSRF token və invoice ID-ni alır
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // URL-dən invoice ID-ni çıxar
  const currentPath = window.location.pathname;
  const invoiceId = currentPath.split("/").pop(); // /hesablashmalar/MINV-5152665585 => MINV-5152665585


  if (!csrfToken) {
    console.error("CSRF token not found!");
    return;
  }

  if (!invoiceId) {
    console.error("Invoice ID not found!");
    return;
  }


  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + " ₼";
  }

  function initSlider() {
    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("destroy");
    }
    $("#slider-range").slider({
      range: true,
      min: globalMinAmount,
      max: globalMaxAmount,
      values: [globalMinAmount, globalMaxAmount],
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      }
    });

    // İlk değerleri yaz
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }
  var table = $("#myTableOn").DataTable({
    paging: true,
    info: false,
    dom: "t",
    serverside: true,
    processing: true,
    processing: true,
    serverSide: true,
    ajax: {
      url: `/hesablashmalar/${invoiceId}/details`,
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: function (d) {
        // Search parametrlərini əlavə et
        d.search = {
          value: $("#customSearch").val() || "",
        };
        d.invoiceId = invoiceId;
        
        // 🔥 Filter məlumatlarını əlavə et (əgər filter modal varsa)
        const form = $("#filterForm");
        if (form.length) {
          // Cards filter
          const checkedCards = [];
          form.find('input[name="cards[]"]:checked').each(function () {
            checkedCards.push($(this).val());
          });
          d.cards = checkedCards;
        if ( $("#slider-range").length > 0 &&
          $("#slider-range").hasClass("ui-slider")) {
            const sliderValues = $("#slider-range").slider("values");
            d.min_amount = sliderValues[0];
            d.max_amount = sliderValues[1];
          }
        }
        
        return d;
      },
      dataSrc: function (json) {
        const amounts = json.data.map(tr => tr.amount);
        globalMinAmount = Math.min(...amounts);
        globalMaxAmount = Math.max(...amounts);
        // Update slider if it exists
        initSlider();
        return json.data;
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
          
          let cardInfo = row.card || row.cardInfo || null;
          let cardName = row.cardName || (cardInfo ? cardInfo.name : null);
          
          if (!cardInfo && !cardName) {
            return `<span class="text-[13px] text-gray-400 dark:text-gray-500 font-normal">Kart yoxdur</span>`;
          }
          
          // Əgər card obyekti varsa, rəng və ikon göstər
          if (cardInfo && typeof cardInfo === 'object') {
            const backgroundColor = cardInfo.background_color || '#CCCCCC';
            const cardIcon = cardInfo.icon || '';
            const displayName = cardInfo.name || cardName || 'Kart';
            
            return `
              <div class="flex items-center gap-3">

                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">
                  ${displayName}
                </span>
              </div>`;
          } else {
            // Sadə mətn kimi göstər
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${cardName || 'Kart'}</span>`;
          }
        },
        name: "cardName",
      },
      {
        data: function (row) {
          return `
                    <div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                        <span class="text-[13px] font-normal">${row.amount} ₼</span>
                    </div>`;
        },
        name: "amount",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.createdAt}</span>`;
        },
        name: "createdAt",
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 10,

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
      $("#myTableOn thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      $("#myTableOn thead th.filtering").each(function () {
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

      $("#pageCount").text(
        `${pageInfo.recordsDisplay} / ${pageInfo.recordsTotal}`
      );

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

      
      const $lastRow = $("#myTableOn tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0 ? "text-[#636B6F] cursor-not-allowed" : "text-messages dark:text-primary-text-color-dark"}" 
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left"></div>
                </div>
            `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
                    <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
                            ${i === pageInfo.page ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark" : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"}"
                            onclick="changePage(${i})">${i + 1}</button>
                `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "text-[#636B6F] cursor-not-allowed" : "text-tertiary-text dark:text-primary-text-color-dark"}" 
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right"></div>
                </div>
            `);
    },
  });

  window.openFilterModal = function () {
    const filterModal = $("#filterPop");
    const overlay = $("#overlay");
    
    if (filterModal.is(":visible")) {
      filterModal.hide();
      overlay.hide();
    } else {
      filterModal.show();
      overlay.show();
    }
  };
  window.submitForm = function (type) {
    if (type === 'filter') {
      table.draw(); // Table-ı yenidən yüklə
      $("#filterPop").hide();
      $("#overlay").hide();
    }
  };

  window.clearFilters = function () {
    $("#filterForm")[0].reset();
    $("#filterForm input[type='checkbox']").prop("checked", false);
    $("#customSearch").val("");
    table.draw();
  };

  // Axtarış
  $("#customSearch").on("keyup", function () {
    table.draw();
  });

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    table.page(page).draw("page");
  };
});