$(document).ready(function () {
  var table;
  function expandStatusesForBackend(rawList) {
    const out = new Set();
    (rawList || []).forEach((v) => {
      const x = String(v || "")
        .toLowerCase()
        .trim();

      // waiting ailəsi
      if (
        x === "waiting" ||
        x === "wait" ||
        x === "gozleyir" ||
        x.startsWith("waiting")
      ) {
        out.add("waiting");
        out.add("waiting_aktiv");
        out.add("waiting_tamamlandi");
        return;
      }

      // active ailəsi
      if (
        x === "active" ||
        x === "aktiv" ||
        x.startsWith("active") ||
        x.startsWith("aktiv")
      ) {
        out.add("aktiv");
        out.add("active");
        return;
      }

      // completed ailəsi
      if (
        x === "completed" ||
        x === "complete" ||
        x === "tamamlandi" ||
        x === "complated" ||
        x.startsWith("tamam")
      ) {
        out.add("tamamlandi");
        out.add("completed");
        out.add("complated");
        return;
      }

      if (x === "draft" || x === "qaralama") {
        out.add("qaralama");
        return;
      }

      if (x === "reported" || x === "report" || x.startsWith("reported")) {
        out.add("reported");
        out.add("reported_arasdirilir");
        out.add("reported_arasdirilir_yeniden");
        return;
      }

      if (x) out.add(x); // artıq backend açarıdırsa olduğu kimi əlavə et
    });
    return Array.from(out);
  }
  function initializeServerSideTable() {
    if (table) {
      table.destroy();
    }

    table = $("#myTable").DataTable({
      processing: true,
      serverSide: true,
      ajax: {
        url: "/isci/add-balance-table",
        type: "POST",
        beforeSend: function (xhr, settings) {
          const token = getCsrfToken();
          if (token) {
            xhr.setRequestHeader("X-CSRF-TOKEN", token);
          }

          if (!token) {
            $.get("/csrf-token", function (response) {
              if (response.token) {
                localStorage.setItem("csrfToken", response.token);
                xhr.setRequestHeader("X-CSRF-TOKEN", response.token);
              }
            });
          }
        },
        data: function (d) {
          const form = $("#filterForm");
          const checkedStatuses = [];
          form.find('input[name="status"]:checked').each(function () {
            checkedStatuses.push($(this).val());
          });
          d.statuses = expandStatusesForBackend(checkedStatuses);

          if (
            $("#slider-range").length > 0 &&
            $("#slider-range").hasClass("ui-slider")
          ) {
            // 🔑 Slider dəyərləri: override varsa onu istifadə et (slide/change anında ən aktual dəyər)
            let sliderValues = null;
            if (Array.isArray(window.__sliderValuesOverride)) {
              sliderValues = window.__sliderValuesOverride.slice(0, 2);
            } else {
              sliderValues = $("#slider-range").slider("values");
            }
            d.min_total = Number(sliderValues[0]);
            d.max_total = Number(sliderValues[1]);

            // 🔁 Ehtiyat üçün amount açarları da göndər (backend fərqli ad gözləyirsə)
            d.min_amount = Number(sliderValues[0]);
            d.max_amount = Number(sliderValues[1]);
          }
          return {
            draw: d.draw,   // 🔑 eksik olan kısım 
            start: d.start,
            length: d.length,
            statuses: d.statuses ?? [],
            year: $("#monthYearHidden").val(),
            month: $("#monthMonthHidden").val(),
            search: $("#customSearch").val() || d.search.value,
            start_date: $("#startDate").val(),
            end_date: $("#endDate").val(),
            min: d.min_total,
            max: d.max_total,
            tab: $("#tabFilter").val(),
            genders: $("#genderFilter").val() ? [$("#genderFilter").val()] : [],
          };
        },
        dataSrc: function (json) {
          const rows = Array.isArray(json.data) ? json.data : [];
          try {
            const stats = calculateStatsFromData(rows);
            updateStatistics(stats);

            const $s = $("#slider-range");
            if (!$s.length) return;

            if ($s.hasClass("ui-slider")) {
              $("#slider-range").slider("destroy");
              $("#slider-range").slider({
                range: true,
                min: 0,
                max: window.globalMaxAmount ?? 300000,
                values: [0, window.globalMaxAmount ?? 300000],
                slide: function(event, ui) {
                  $("#min-value").text(formatCurrency(ui.values[0]));
                  $("#max-value").text(formatCurrency(ui.values[1]));
                }
              });

              // Set initial values
              $("#min-value").text(formatCurrency($("#slider-range").slider("values", 0)));
              $("#max-value").text(formatCurrency($("#slider-range").slider("values", 1)));

              // Format numbers with thousand separators and decimals
              function formatCurrency(value) {
                return new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value) + "  ₼";
              }
              return rows;
            }
          } catch (e) {
            console.warn("Stats error:", e);
          }
          return rows;
        },
        error: function (xhr, error, thrown) {
          console.error("DataTable AJAX error:", error);
          showErrorMessage("Məlumatları yüklərkən xəta baş verdi");
        },
      },

      columns: [
        // İnvoys nömrəsi
        {
          data: null,
          name: "invoice_no",
          render: function (_, __, row) {
            const inv =
              row.balance_id || "-";
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${inv}</span>`;
          },
        },
        // Kart sayı
        {
          data: null,
          name: "card_count",
          render: function (_, __, row) {
            const cnt =
              row.cards ? (Array.isArray(row.cards) ? row.cards.length : 0) : 0;
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${cnt+ " ".trim() ?? "-"}</span>`;
          },
        },
        // Məbləğ
        {
          data: null,
          name: "amount",
          render: function (_, __, row) {
            const amt = row.total_balance ?? row.amount ?? 0;
            const f = (Number(amt) || 0).toFixed(2);
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${f} AZN</span>`;
          },
        },
        // Tarix
        {
          data: null,
          name: "date",
          render: function (_, __, row) {
            const iso = row.createdAt || row.date;
            const text = iso ? new Date(iso).toLocaleDateString("az-AZ") : "-";
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${text}</span>`;
          },
        },
        // Status
        {
          data: null,
          name: "status",
          render: function (_, __, row) {
            const { badge } = mapStatus(row.status);
            return `
         <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px]">
           <span class="w-[6px] h-[6px] rounded-full ${badge} shrink-0 mr-2"></span>
           <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.statusName}</span>
         </div>`;
          },
        },
        // Actions
        {
          data: null,
          orderable: false,
          searchable: false,
          render: function (_d, _t, row, meta) {
            const balanceId = row.balance_id || "";
            if(row.status === 'active'){
              return `
                <div class="relative flex items-center">
                  <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"
                    onclick="toggleDropdown(this, ${meta.row}, 'main-dropdown')"></div>
                  <div class="main-dropdown-menu dropdown-menu absolute right-0 top-6 z-50 min-w-[183px] bg-white dark:bg-table-hover-dark text-[#1D222B] dark:text-white rounded-[12px] shadow-lg border border-[#0000001A] dark:border-[#ffffff1A] py-1 hidden">
                    <span onclick="viewInvoice('${balanceId}')" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px]">
                      <div class="icon stratis-cursor-06 w-4 h-4"></div><span>Aç</span>
                    </span>
                    <span onclick="editInvoice('${balanceId}')" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px]">
                      <div class="icon stratis-edit-02 w-4 h-4"></div><span>Redaktə et</span>
                    </span>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px]" onclick="confirmInvoice('${balanceId}')">
                      <div class="icon stratis-file-check-02 w-4 h-4"></div><span>İnvoysu təsdiqlə</span>
                    </div>
                    <div class="border-t my-1 dark:border-surface-variant-dark"></div>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[#DD3838] hover:bg-error-hover dark:hover:bg-error-hover-dark text-[13px]" onclick="deleteInvoice('${balanceId}')">
                      <div class="icon stratis-trash-01 text-error w-4 h-4"></div><span class="text-error">Sil</span>
                    </div>
                  </div>
                </div>`;
            }else if(row.status === 'complated'){
              return `
                <div class="relative flex items-center">
                  <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"
                    onclick="toggleDropdown(this, ${meta.row}, 'main-dropdown')"></div>
                  <div class="main-dropdown-menu dropdown-menu absolute right-0 top-6 z-50 min-w-[183px] bg-white dark:bg-table-hover-dark text-[#1D222B] dark:text-white rounded-[12px] shadow-lg border border-[#0000001A] dark:border-[#ffffff1A] py-1 hidden">
                    <span onclick="viewInvoice('${balanceId}')" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px]">
                      <div class="icon stratis-cursor-06 w-4 h-4"></div><span>Aç</span>
                    </span>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-disabled text-[13px] opacity-65">
                      <div class="icon stratis-file-check-02 w-4 h-4"></div><span>İnvoysu təsdiqlə</span>
                    </div>
                  </div>
                </div>`;
            }else if(row.status === 'waiting'){
              return `
                <div class="relative flex items-center">
                  <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"
                    onclick="toggleDropdown(this, ${meta.row}, 'main-dropdown')"></div>
                  <div class="main-dropdown-menu dropdown-menu absolute right-0 top-6 z-50 min-w-[183px] bg-white dark:bg-table-hover-dark text-[#1D222B] dark:text-white rounded-[12px] shadow-lg border border-[#0000001A] dark:border-[#ffffff1A] py-1 hidden">
                    <span onclick="viewInvoice('${balanceId}')" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px]">
                      <div class="icon stratis-cursor-06 w-4 h-4"></div><span>Aç</span>
                    </span>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[13px]" onclick="confirmBalance('${balanceId}')">
                      <div class="icon stratis-file-check-02 w-4 h-4"></div><span>Balansı təsdiqlə</span>
                    </div>
                  </div>
                </div>`;
            }else {
              return `
                <div class="relative flex items-center">
                  <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"
                    onclick="toggleDropdown(this, ${meta.row}, 'main-dropdown')"></div>
                  <div class="main-dropdown-menu dropdown-menu absolute right-0 top-6 z-50 min-w-[183px] bg-white dark:bg-table-hover-dark text-[#1D222B] dark:text-white rounded-[12px] shadow-lg border border-[#0000001A] dark:border-[#ffffff1A] py-1 hidden">
                    <span onclick="viewInvoice('${balanceId}')" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px]">
                      <div class="icon stratis-cursor-06 w-4 h-4"></div><span>Aç</span>
                    </span>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px] opacity-65">
                      <div class="icon stratis-file-check-02 w-4 h-4"></div><span>İnvoysu təsdiqlə</span>
                    </div>
                  </div>
                </div>`;
            }
          },
        },
      ],

      order: [[0, "desc"]],
      pageLength: 10,
      lengthChange: false,
      searching: false,
      info: false,
      dom: "t",

      createdRow: function (row, data, dataIndex) {
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          })
          .on("mouseleave", function () {
            $(this).css("background-color", "");
          });

        $(row)
          .find("td")
          .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

        $(row).find("td:not(:last-child)").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").addClass("border-l-[.5px] border-stroke");

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
      },

      drawCallback: function () {
        var api = this.api();
        var pageInfo = api.page.info();

        $("#myTable tbody tr.spacer-row").remove();
        const colCount = $("#myTable thead th").length;
        const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
        $("#myTable tbody").prepend(spacerRow);

        const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
        if ($lastRow.length > 0) {
          $lastRow.find("td").css({
            "border-bottom": "0.5px solid var(--table-border-color)",
          });
          $lastRow.find("td:last-child").css({
            "border-left": "0.5px solid var(--table-border-color)",
          });
        }

        updateCustomPagination(pageInfo);
      },
    });
  }

  

  function mapStatus(raw) {
    const s = String(raw || "").toLowerCase();
    if (s === "active" || s === "aktiv")
      return { badge: "bg-[#4FC3F7]", text: "active" };
    if (s === "passive" || s === "gözləyir" || s === "waiting")
      return { badge: "bg-[#FFA100]", text: "gözləyir" };
    if (s === "complated" || s === "completed") return { badge: "bg-[#32B5AC]", text: "tamamlandı" };
    if (s === "canceled") return { badge: "bg-[#EF5350]", text: "ləğv edilib" };
    return { badge: "bg-[#BDBDBD]", text: "naməlum" };
  }

  function calculateStatsFromData(rows) {
    const stats = {
      total: rows.length,
      aktiv: 0,
      gozleyir: 0,
      tamamlandi: 0,
      qaralama: 0,
      ayrilan: 0,
      total_amount: 0,
    };
    for (const r of rows) {
      const norm = mapStatus(r.status).text;
      // mapStatus returns these normalized labels: 'active', 'gözləyir', 'tamamlandı', 'ləğv edilib', 'naməlum'
      if (norm === "active") stats.aktiv++;
      else if (norm === "gözləyir") stats.gozleyir++;
      else if (norm === "tamamlandı") stats.tamamlandi++;
      else if (norm === "ləğv edilib") stats.ayrilan++;
      else if (norm === "naməlum") stats.qaralama++;
      else stats.qaralama++;
      const amt = Number(r.total_balance ?? r.amount ?? 0);
      if (!Number.isNaN(amt)) stats.total_amount += amt;
    }
    return stats;
  }

    // Ay cədvəlini aç
  window.openMonthTable = function (year, month, monthIndex) {
    isMonthView = true;
    // activeData = monthData;

    // Başlıqları dəyişdir
    $("#mainTitle").addClass("hidden");
    $("#monthTitle").removeClass("hidden");
    $("#monthTitleText").text(`${year} - ${month}`);
    $("#monthYearHidden").val(year);
    $("#monthMonthHidden").val(monthIndex);

    // Ay popup-larını bağla
    closeMonthsPopup();
    closeInvoysPopup();

    // Cədvəli yenidən başlat (pagination olmadan)
    table.ajax.reload(null, false);
  };

  window.backToMainTable = function () {
    isMonthView = false;

    // Başlıqları dəyişdir
    $("#monthTitle").addClass("hidden");
    $("#mainTitle").removeClass("hidden");
    $("#monthYearHidden").val('');
    $("#monthMonthHidden").val('');
    // Cədvəli yenidən başlat (pagination olmadan)
    table.ajax.reload(null, false);
  };

  function updateStatistics(stats) {
    console.log(stats);
    $(".aktiv-count").text(stats.aktiv || 0);
    $(".gozleyir-count").text(stats.gozleyir || 0);
    $(".tamamlandi-count").text(stats.tamamlandi || 0);
    $(".toplam-stat").text(
      stats.total_amount ? stats.total_amount.toFixed(2) + " AZN" : "0.00 AZN"
    );

    const totalRecords = stats.total;
    $("#mainTitle").text(`İşçilərin balansı (${totalRecords})`);

    $("#aktiv-count").text(stats.aktiv || 0);
    $("#qaralama-count").text(stats.qaralama || 0);
    $("#ayrilan-count").text(stats.ayrilan || 0);
    $("#total-count").text(stats.total || 0);
  }

  function updateCustomPagination(pageInfo) {
    var $pagination = $("#customPagination");

    if (pageInfo.pages === 0) {
      $pagination.empty();
      return;
    }

    $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
    $pagination.empty();

    $pagination.append(`
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
        pageInfo.page === 0
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF] cursor-pointer"
      }" onclick="${pageInfo.page > 0 ? `changePage(${pageInfo.page - 1})` : ""}">
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
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }"
          onclick="${
            pageInfo.page < pageInfo.pages - 1
              ? `changePage(${pageInfo.page + 1})`
              : ""
          }">
          <div class="icon stratis-chevron-right text-xs"></div>
      </div>
    `);
  }

  $("#customSearch").on(
    "keyup",
    debounce(function () {
      table.draw();
    }, 500)
  );

  $("#tabFilter, #genderFilter").on("change", function () {
    table.draw();
  });

  $("#resetFilters").on("click", function () {
    $("#tabFilter").val("");
    $("#genderFilter").val("");
    $("#startDate").val("");
    $("#endDate").val("");
    $("#customSearch").val("");
    table.draw();
  });

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function showErrorMessage(message) {
    console.error(message);
  }

  window.changePage = function (page) {
    table.page(page).draw("page");
  };

  window.filterBalances = () => {
    table.ajax.reload(null, false);
  }

  $(".page-input").on("keypress", function (e) {
    if (e.which === 13) {
      goToPage();
    }
  });

  $(".go-button").on("click", function (e) {
    e.preventDefault();
    goToPage();
  });

  function goToPage() {
    const inputVal = $(".page-input").val().trim();
    const pageNum = parseInt(inputVal, 10);
    const pageInfo = table.page.info();

    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageInfo.pages) {
      table.page(pageNum - 1).draw("page");
    }

    $(".page-input").val("");
  }

  $("#refreshPage").on("click", function (e) {
    table.ajax.reload(null, false);
  });

  function getCsrfToken() {
    return (
      $('meta[name="csrf-token"]').attr("content") ||
      $('input[name="_token"]').val() ||
      window.csrfToken ||
      localStorage.getItem("csrfToken") ||
      sessionStorage.getItem("csrfToken")
    );
  }

  initializeServerSideTable();

  window.viewInvoice = function (balanceId) {
    if (balanceId) {
      window.location.href = `/balances/${balanceId}`;
    } else {
      console.error("Balance ID tapılmadı");
    }
  };

  window.editInvoice = function (balanceId) {
    if (balanceId) {
      window.location.href = `/isci/edit-balance/${balanceId}`;
    } else {
      console.error("Balance ID tapılmadı");
    }
  };

  window.confirmAvankarta = function () {
    const invoice = window.selectedInvoiceNumber;
    if (!invoice) {
      alertModal("Invoice nömrəsi yoxdur!", 'error');
      return;
    }
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    fetch("/isci/send-to-avankart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ invoice }),
    })
      .then((response) => {
        if (!response.ok) {
          alertModal(response.message || "Something went wrong", "error");
        }
        return response.json();
      })
      .then((data) => {
        closeAvankartaModal();
        alertModal(
          data.message || "Avankarta göndərildi!",
          data.success ? "success" : "error"
        );
        table.ajax.reload(null, false);
      })
      .catch((error) => {
        alertModal(error, "error");
      });

    closeAvankartaModal();
  };
  
  function closeAvankartaModal() {
    document.getElementById("avankartaModalOverlay").classList.add("hidden");
    document.getElementById("avankartaModal").classList.add("hidden");
    document.getElementById("avankartaBalanceModal").classList.add("hidden");
  }

  window.confirmInvoice = function (balanceId) {
    document.getElementById("avankartaModalOverlay").classList.remove("hidden");
    document.getElementById("avankartaModal").classList.remove("hidden");
    document.getElementById("avankartaBalanceModal").classList.remove("hidden");
    // document.getElementById("avankartInvoice").innerText = balanceId;
    window.selectedInvoiceNumber = balanceId;
  };

  window.confirmBalance = function (balanceId) {
    document.getElementById("avankartaModalOverlay").classList.remove("hidden");
    document.getElementById("avankartaBalanceModal").classList.remove("hidden");
    // document.getElementById("avankartInvoice").innerText = balanceId;
    window.selectedInvoiceNumber = balanceId;
  };

  window.acceptDeleteInvoice  = function () {
    const invoice = window.selectedDeleteInvoiceNumber;
    if (!invoice) {
      alertModal("Invoice nömrəsi yoxdur!", 'error');
      return;
    }
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    fetch("/isci/delete-balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ invoice }),
    })
      .then((response) => {
        if (!response.ok) {
          alertModal(response.message || "Something went wrong", "error");
        }
        return response.json();
      })
      .then((data) => {
        closeAvankartaModal();
        alertModal(
          data.message || "Silindi!",
          data.success ? "success" : "error"
        );
        table.ajax.reload(null, false);
      })
      .catch((error) => {
        alertModal(error, "error");
      });

    closeAvankartaModal();
  };

  window.deleteInvoice = function (balanceId) {
    document.getElementById("deleteInvoiceModalOverlay").classList.remove("hidden");
    document.getElementById("deleteInvoiceModal").classList.remove("hidden");
    // document.getElementById("avankartInvoice").innerText = balanceId;
    window.selectedDeleteInvoiceNumber = balanceId;
  };

  window.viewUserDetails = function (userId) {
    window.location.href = `/isci/isciler-detay/${userId}`;
  };

  window.editUser = function (userId) {
    window.location.href = `/isci/isciler-redakte/${userId}`;
  };

  window.generateReport = function (userId) {
    window.location.href = `/isci/isciler-hesabat/${userId}`;
  };

  window.deleteUser = function (userId) {
    if (confirm("Bu işçini silmək istədiyinizdən əminsiniz?")) {
      $.ajax({
        url: `/isci/isciler-sil/${userId}`,
        type: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
        },
        success: function (response) {
          table.ajax.reload();
          alert("İşçi uğurla silindi");
        },
        error: function (xhr) {
          alert(
            "Xəta baş verdi: " + xhr.responseJSON?.message || "Naməlum xəta"
          );
        },
      });
    }
  };

  window.toggleDropdown = function (icon, rowIndex, dropdownType) {
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((menu) => menu.classList.add("hidden"));

    const dropdown = icon.nextElementSibling;
    if (dropdown) {
      dropdown.classList.toggle("hidden");
    }
  };

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
});
