let dataTable = null;
let currentFilters = {};
let globalMinAmount = 0;
let globalMaxAmount = 0;

const SLIDER_DEFAULT_MAX = 30000;

let selectedInvoice = null;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function normalizeStatus(raw) {
    if (!raw) return "other";
    const s = String(raw).toLowerCase().trim();
    if (["gözləyir", "gozleyir", "waiting", "pending","reported_sended_again"].includes(s))
      return "waiting";
    if (["təsdiqlənib", "tesdiqlenib", "approved"].includes(s))
      return "approved";
    if (["tamamlandı", "tamamlandi", "completed", "complated"].includes(s))
      return "completed";
    if (["qaralama", "draft"].includes(s)) return "draft";
    if (["report edildi", "reported"].includes(s))
      return "reported";
    return "other";
  }

  function getActionPermissions(status) {
    switch (normalizeStatus(status)) {
      case "waiting":
        return { showMenu: true, approveEnabled: true, reportEnabled: true };
      case "approved":
        return { showMenu: true, approveEnabled: false, reportEnabled: true };
      case "completed":
        return { showMenu: true, approveEnabled: false, reportEnabled: true };
      case "draft":
        return { showMenu: true, approveEnabled: true, reportEnabled: false };
      case "reported":
        return { showMenu: false, approveEnabled: false, reportEnabled: false };
      default:
        return { showMenu: false, approveEnabled: false, reportEnabled: false };
    }
  }

  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }
  window.formatCurrency = formatCurrency;

  function updateStats(stats) {
    const pendingAmt = Number(stats?.pending?.amount || 0);
    const approvedAmt = Number(stats?.approved?.amount || 0);
    const totalAmt = Number(stats?.totalAmount || 0);
    $("#stat_waiting_amount").text(formatCurrency(pendingAmt));
    $("#stat_approved_amount").text(formatCurrency(approvedAmt));
    $("#stat_total_amount").text(formatCurrency(totalAmt));
  }

  async function initSlider() {
    if (!$("#slider-range").length) return;

    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("destroy");
    }

    let datasetCount = 0;
    try {
      const resp = await fetch(
        "/emeliyyatlar/sirket/hesablasma/api/hesablasma/amount-range",
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const json = await resp.json().catch(() => ({}));
      if (
        resp.ok &&
        json &&
        typeof json.min === "number" &&
        typeof json.max === "number"
      ) {
        globalMinAmount = Math.max(0, Number(json.min) || 0);
        globalMaxAmount = Math.max(0, Number(json.max) || 0);
        datasetCount = Number(json.count) || 0;
      } else {
        globalMinAmount = 0;
        globalMaxAmount = 0;
        datasetCount = 0;
      }
    } catch (e) {
      globalMinAmount = 0;
      globalMaxAmount = 0;
      datasetCount = 0;
    }

    let trackMin = Number(globalMinAmount) || 0;
    let trackMax = Number(globalMaxAmount) || 0;
    if (datasetCount === 0) {
      trackMin = 0;
      trackMax = SLIDER_DEFAULT_MAX;
    }

    const defaultMinValue = trackMin;
    const defaultMaxValue = trackMax;

    $("#slider-range").slider({
      range: true,
      min: trackMin,
      max: trackMax,
      values: [defaultMinValue, defaultMaxValue],
      animate: true,
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
        $("#minutes_min").val(ui.values[0]);
        $("#minutes_max").val(ui.values[1]);
      },
      start: function () {
        $("#slider-range, #slider-range *").css("pointer-events", "auto");
      },
      stop: function (event, ui) {
        $("#minutes_min").val(ui.values[0]);
        $("#minutes_max").val(ui.values[1]);
      },
    });

    $("#min-value").text(formatCurrency(defaultMinValue));
    $("#max-value").text(formatCurrency(defaultMaxValue));
    $("#minutes_min").val(defaultMinValue);
    $("#minutes_max").val(defaultMaxValue);

    if (trackMin === trackMax) {
      $("#slider-range").slider("disable");
    } else {
      $("#slider-range").slider("enable");
      $("#slider-range").slider("option", "disabled", false);
    }
  }

  function whenSliderReady(cb) {
    try {
      if (typeof $.ui !== "undefined" && typeof $.ui.slider !== "undefined") {
        cb();
        return;
      }
    } catch (_) {}
    $(document).one("jqueryUILoaded", function () {
      cb();
    });
  }
  window.whenSliderReady = whenSliderReady;
  window.initSlider = initSlider;

  function buildFiltersPayload() {
    const payload = {};

    const startDate = $('input[name="start_date"]').val();
    const endDate = $('input[name="end_date"]').val();
    if (startDate) payload.start_date = startDate;
    if (endDate) payload.end_date = endDate;

    const companies = [];
    $('#dropdown_company input[type="checkbox"]:checked').each(function () {
      const companyId = $(this).attr("id");
      companies.push(companyId.replace("subyekt-", ""));
    });
    if (companies.length > 0) payload.companies = companies;

    const cardStatus = [];
    $('input[name="card_status[]"]:checked').each(function () {
      cardStatus.push($(this).val()); // waiting, completed ...
    });
    if (cardStatus.length > 0) payload.cardStatus = cardStatus;

    if ($("#slider-range").hasClass("ui-slider")) {
      const minValue = $("#slider-range").slider("values", 0);
      const maxValue = $("#slider-range").slider("values", 1);
      if (minValue !== null && maxValue !== null) {
        payload.min = minValue;
        payload.max = maxValue;
      }
    }

    if (currentFilters.companyId) payload.companyId = currentFilters.companyId;
    if (currentFilters.year) payload.year = currentFilters.year;
    if (currentFilters.month) payload.month = currentFilters.month;

    return payload;
  }
  window.buildFiltersPayload = buildFiltersPayload;

  function updateCompanyDropdownFromTree(tree) {}

  window.updateCompanyDropdownFromTree = updateCompanyDropdownFromTree;

  async function fetchFilterTreeAndRender() {
    const payload = buildFiltersPayload();
    try {
      const resp = await fetch("/emeliyyatlar/sirket/hesablasma/tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(payload),
      });
      const json = await resp.json().catch(() => ({}));
      if (resp.ok && json?.success) {
        updateCompanyDropdownFromTree(json.data || []);
      } else {
      }
    } catch (e) {}
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: "/emeliyyatlar/sirket/hesablasma",
        type: "POST",
        dataType: "json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          const extra = buildFiltersPayload();
          return {
            user_id: $("#userId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search?.value || "",
            ...extra, 
          };
        },
        dataSrc: function (json) {
          if (json?.stats) {
            updateStats(json.stats);
          }

          try {
            const payloadNow =
              typeof window.buildFiltersPayload === "function"
                ? window.buildFiltersPayload()
                : {};
            const hasAnyFilter = !!(
              payloadNow.start_date ||
              payloadNow.end_date ||
              (Array.isArray(payloadNow.companies) &&
                payloadNow.companies.length) ||
              (Array.isArray(payloadNow.cardStatus) &&
                payloadNow.cardStatus.length) ||
              payloadNow.min !== undefined ||
              payloadNow.max !== undefined ||
              payloadNow.companyId ||
              payloadNow.year ||
              payloadNow.month
            );
            const currentSearch = ($("#customSearch").val() || "").trim();

            if (!hasAnyFilter && !currentSearch) {
              if (typeof json.recordsTotal === "number") {
                json.recordsFiltered = json.recordsTotal;
              } else if (Array.isArray(json.data)) {
                json.recordsFiltered = json.data.length;
                json.recordsTotal = json.data.length;
              }
            }
          } catch (_) {}

          const totalFiltered = Number.isFinite(json?.recordsFiltered)
            ? json.recordsFiltered
            : Array.isArray(json?.data)
              ? json.data.length
              : 0;
          $("#invoys_count").text(totalFiltered);

          const rows = Array.isArray(json?.data) ? json.data : [];
          $("#tr_counts").html(rows.length ?? 0);

          whenSliderReady(initSlider);

          return rows;
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 10,
      columns: [
        {
          data: "logo",
          render: function (data, type, row) {
            const logoPath = (row.company?.logo || "").startsWith("/")
              ? row.company.logo
              : row.company?.logo
                ? `/images/${row.company.logo}`
                : "/images/Avankart/Sirket/food-icon.svg";
            return `
              <div class="flex justify-center items-center gap-2.5">
                <div class="flex justify-center items-center">
                  <div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">
                    <img src="${logoPath}" class="object-contain w-8 h-8" alt="Logo">
                  </div>
                </div>
                <div class="w-full">
                  <div class="text-[13px] font-medium">${row.company?.name}</div>
                  <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${row.company?.cm_id}</span></div>
                </div>
              </div>
            `;
          },
        },
        {
          data: "doc_no",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.amount} ₼</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.commission} ₼</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.total_balance} ₼</span>`;
          },
        },
        {
          data: "date",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
        {
          data: function (row) {
            // active", "passive", "canceled", "waiting", "reported", "reported_sended_again", "complated
            let color = "";
            let name = "";
            let active = false;
            switch (row.status) {
              case "active":
                color = "bg-[#4FC3F7]";
                name = "Aktiv";
                break;
              case "qaralama":
                color = "bg-[#BDBDBD]";
                name = "Qaralama";
                break;
              case "complated":
                color = "bg-[#66BB6A]";
                name = "Tamamlandı";
                break;
              case "waiting":
              case "pending":
                color = "bg-[#FFCA28]";
                name = "Gözləyir";
                active = true;
                break;
              case "reported_sended_again":
                color = "bg-[#EF5350]";
                name = "Report edildi > Yenidən göndərildi";
                break;
              case "reported":
                color = "bg-[#EF5350]";
                name = "Report edildi";
                break;
              default:
                active = true;
                color = "bg-[#FF7043]";
            }

            return `
              <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${name}</span>
              </div>
            `;
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            const perms = getActionPermissions(row.status);
            console.log(row.status);
            if (!perms.showMenu) {
              return '<div class="relative inline-block text-left"></div>';
            }

            const invId = row._id || "";
            const invNo = row.doc_no || row.invoice || "";
            const invAmount = Number(row.total_balance ?? row.amount ?? 0);
            const invDate = row.date || "";
            const invTx = row.transactions ?? "—";

            const approveAttrs = perms.approveEnabled
              ? `onclick="openTesdiqModal('${invId}', '${invNo}')" class="hover:bg-input-hover cursor-pointer flex items-center gap-2 px-4 py-[3.5px]"`
              : `class="opacity-65 cursor-not-allowed flex items-center gap-2 px-4 py-[3.5px]"`;

            const reportAttrs = perms.reportEnabled
              ? `onclick="openReportModal('${invId}', '${invNo}', '${invAmount}', '${invDate}', '${invTx}')" class="hover:bg-error-hover cursor-pointer flex items-center gap-2 px-4 py-[3.5px]"`
              : `class="opacity-65 cursor-not-allowed flex items-center gap-2 px-4 py-[3.5px]"`;

            return `
              <div id="wrapper" class="relative inline-block text-left">
                <!-- Trigger icon -->
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages w-5 h-5 cursor-pointer z-100"></div>

                <!-- Dropdown wrapper -->
                <div class="hidden absolute right-[-12px] w-[142px] z-50 dropdown-menu">
                  <!-- Caret wrapper -->
                  <div class="relative h-[8px]">
                    <div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>

                  <!-- Dropdown box -->
                  <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke ">
                    <div class="py-[3.5px] text-sm">
                      <div ${approveAttrs}>
                        <span class="icon stratis-file-check-02 text-[13px]"></span>
                        <span class="font-medium text-[#1D222B] text-[13px]">Təsdiqlə</span>
                      </div>
                      <div class="h-[.5px ] bg-stroke my-1"></div>
                      <div ${reportAttrs}>
                        <span class="icon stratis-help-circle-contained text-error text-[13px]"></span>
                        <span class="font-medium text-error text-[13px]">Report et</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();

        const totalPages = Math.max(1, pageInfo.pages || 0);
        const currentPage = Math.min(pageInfo.page + 1, totalPages);

        $("#pageCount").text(`${currentPage} / ${totalPages}`);

        // Prev
        const isPrevDisabled = pageInfo.page === 0 || pageInfo.pages === 0;
        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (isPrevDisabled
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" ' +
            (isPrevDisabled
              ? ""
              : 'onclick="changePage(' +
                Math.max(0, pageInfo.page - 1) +
                ')"') +
            ">" +
            '<div class="icon stratis-chevron-left text-xs"></div>' +
            "</div>"
        );

        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < (pageInfo.pages || 0); i++) {
          paginationButtons +=
            '<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ' +
            (i === pageInfo.page
              ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
              : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark") +
            '" onclick="changePage(' +
            i +
            ')">' +
            (i + 1) +
            "</button>";
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        const isNextDisabled =
          pageInfo.pages === 0 || pageInfo.page === pageInfo.pages - 1;
        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (isNextDisabled
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" ' +
            (isNextDisabled
              ? ""
              : 'onclick="changePage(' +
                Math.min(pageInfo.page + 1, Math.max(0, pageInfo.pages - 1)) +
                ')"') +
            ">" +
            '<div class="icon stratis-chevron-right text-xs"></div>' +
            "</div>"
        );
      },
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
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });
      },
    });

    $("#confirmYesBtn")
      .off("click")
      .on("click", async function () {
        if (!selectedInvoice?.id) return;

        const btn = $(this);
        btn.prop("disabled", true).addClass("opacity-70");

        try {
          const resp = await fetch(
            `/emeliyyatlar/sirket/hesablasma/${selectedInvoice.id}/confirm`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
              },
              body: JSON.stringify({invoice_id : selectedInvoice.id}),
            }
          );

          const json = await resp.json().catch(() => ({}));
          if (resp.ok && json?.success) {
            closeTesdiqModal();
            alertModal(json.message);
            if (dataTable) dataTable.ajax.reload(null, false);
          } else {
            closeTesdiqModal();
            alertModal(json.error || json.message,'error');
            if (dataTable) dataTable.ajax.reload(null, false);
          }
        } catch (e) {
        } finally {
          btn.prop("disabled", false).removeClass("opacity-70");
        }
      });

    $("#reportModal button[type='submit']")
      .off("click")
      .on("click", async function (e) {
        e.preventDefault();
        if (!selectedInvoice?.id) return;

        const btn = $(this);
        btn.prop("disabled", true).addClass("opacity-70");

        const msg = ($("#reportModal textarea").val() || "").trim();
        const invoice_id = ($("#invoiceReported").val() || "").trim();
        if (!msg) {
          alertModal('Provide message','error')
          btn.prop("disabled", false).removeClass("opacity-70");
          return;
        }

        try {
          const resp = await fetch(
            `/emeliyyatlar/sirket/hesablasma/${selectedInvoice.id}/report`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
              },
              body: JSON.stringify({ message: msg, invoice_id }),
            }
          );

          const json = await resp.json().catch(() => ({}));
          if (resp.ok && json?.success) {
            closeReportModal();
            alertModal(json.message);
            if (dataTable) dataTable.ajax.reload(null, false);
          } else {
            alertModal(json.error|| json.message, 'error');
            if (dataTable) dataTable.ajax.reload(null, false);
          }
        } catch (e) {
        } finally {
          btn.prop("disabled", false).removeClass("opacity-70");
        }
      });
    fetchFilterTreeAndRender();
  }

  initializeDataTable();

  $("#refreshTableBtn, #refreshTableIcon").on("click", function (e) {
    e.preventDefault();
    if (dataTable) {
      dataTable.ajax.reload(function () {}, true); 
    }
    return false;
  });

  window.refreshInvoicesTable = function () {
    $("#refreshTableBtn").trigger("click");
  };

  window.addEventListener("invoiceFolderSelected", function (e) {
    const { companyId, year, month } = e.detail || {};
    if (!companyId || !year || !month) return;
    window.setFolderFilter(companyId, Number(year), Number(month));
  });
  window.addEventListener("invoicesFolderSelected", function (e) {
    const { companyId, year, month } = e.detail || {};
    if (!companyId || !year || !month) return;
    window.setFolderFilter(companyId, Number(year), Number(month));
  });
});

window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};

window.openFilterModal = function () {
  const wasHidden = $("#filterPop").hasClass("hidden");
  if (wasHidden) {
    $("#filterPop").removeClass("hidden");
    if (window.whenSliderReady && window.initSlider) {
      window.whenSliderReady(function () {
        setTimeout(function () {
          window.initSlider();
        }, 0);
      });
    }
  } else {
    $("#filterPop").addClass("hidden");
  }
};

window.closeFilterModal = function () {
  $("#filterPop").addClass("hidden");
};

window.toggleDropdown_company = function () {
  const dropdown = document.getElementById("dropdown_company");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

document.addEventListener("click", function (event) {
  const companyDropdown = document.getElementById("dropdown_company");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_company"
  );

  if (
    companyDropdown &&
    companyButton &&
    !companyButton.contains(event.target) &&
    !companyDropdown.contains(event.target)
  ) {
    companyDropdown.classList.add("hidden");
    companyDropdown.classList.remove("visible");
  }
});

window.applyFilters = function () {
  const keepFolder = {
    companyId: currentFilters.companyId,
    year: currentFilters.year,
    month: currentFilters.month,
  };

  currentFilters = {};

  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();
  if (startDate) currentFilters.start_date = startDate;
  if (endDate) currentFilters.end_date = endDate;

  const companies = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    companies.push(companyId.replace("subyekt-", ""));
  });
  if (companies.length > 0) currentFilters.companies = companies;

  const cardStatus = [];
  $('input[name="card_status[]"]:checked').each(function () {
    cardStatus.push($(this).val());
  });
  if (cardStatus.length > 0) currentFilters.cardStatus = cardStatus;

  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);
    if (minValue !== null && maxValue !== null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
  }

  if (keepFolder.companyId) currentFilters.companyId = keepFolder.companyId;
  if (keepFolder.year) currentFilters.year = keepFolder.year;
  if (keepFolder.month) currentFilters.month = keepFolder.month;

  if (dataTable) {
    dataTable.ajax.reload(function () {}, true);
  }

  (async () => {
    try {
      const csrfToken = $('meta[name="csrf-token"]').attr("content");
      const resp = await fetch("/emeliyyatlar/sirket/hesablasma/tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(
          window.buildFiltersPayload ? window.buildFiltersPayload() : {}
        ),
      });
      const json = await resp.json().catch(() => ({}));
      if (resp.ok && json?.success) {
        if (window.updateCompanyDropdownFromTree) {
          window.updateCompanyDropdownFromTree(json.data || []);
        }
      } else {
      }
    } catch (e) {}
  })();

  $("#filterPop").addClass("hidden");
};

window.clearFilters = function () {
  $("#filterForm")[0]?.reset();
  $("#startDate").val("");
  $("#EndDate").val(""); 
  $("#endDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  if ($("#slider-range").hasClass("ui-slider")) {
    const minOpt = $("#slider-range").slider("option", "min") || 0;
    const maxOpt =
      $("#slider-range").slider("option", "max") || SLIDER_DEFAULT_MAX;
    $("#slider-range").slider("values", [minOpt, maxOpt]);
    $("#min-value").text(formatCurrency(minOpt));
    $("#max-value").text(formatCurrency(maxOpt));
  }

  currentFilters = {};

  if (dataTable) {
    dataTable.ajax.reload(function () {}, true); 
  }

  (async () => {
    try {
      const csrfToken = $('meta[name="csrf-token"]').attr("content");
      const resp = await fetch("/emeliyyatlar/sirket/hesablasma/tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({}),
      });
      const json = await resp.json().catch(() => ({}));
      if (resp.ok && json?.success) {
        if (window.updateCompanyDropdownFromTree) {
          window.updateCompanyDropdownFromTree(json.data || []);
        }
      }
    } catch (_) {}
  })();
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performSearch() {
  const searchValue = ($("#customSearch").val() || "").trim();
  if (dataTable) {
    // **axtarışda da 1-ci səhifəyə dön və tam redraw et**
    dataTable.search(searchValue).page(0).draw();
  }
}

$("#customSearch").on("keyup input", function () {
  performSearch();
});

$(".go-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".page-input");
  let pageNumber = parseInt(pageInput.val());

  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (dataTable) {
      const pageInfo = dataTable.page.info();
      let dataTablePage = pageNumber - 1;

      if (dataTablePage < pageInfo.pages) {
        dataTable.page(dataTablePage).draw("page");
      } else {
      }
    }
  } else {
  }
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  dropdown.classList.toggle("hidden");

  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}
window.toggleDropdown = toggleDropdown;

window.openTesdiqModal = function (id, invoice) {
  selectedInvoice = { id, invoice };
  if ($("#confirmInvoiceNo").length) {
    $("#confirmInvoiceNo").text(invoice || "—");
  }
  $("#tesdiqModal").removeClass("hidden");
};

window.closeTesdiqModal = function () {
  $("#tesdiqModal").addClass("hidden");
  selectedInvoice = null;
};

window.openReportModal = function (id, invoice, amount, date, transactions) {
  selectedInvoice = { id, invoice };
  $('#invoiceReported').val(id);
  $("#reportInvoice").text(invoice || "—");
  $("#reportAmount").text(
    typeof amount === "number"
      ? formatCurrency(amount).replace(" ₼", " AZN")
      : amount || "—"
  );
  $("#reportDate").text(date || "—");
  $("#reportTransactions").text(transactions || "—");
  $("#reportModal textarea").val("");
  $("#reportModal").removeClass("hidden");
};

window.closeReportModal = function () {
  $("#reportModal").addClass("hidden");
};

window.setFolderFilter = function (companyId, year, month) {
  currentFilters.companyId = companyId;
  currentFilters.year = Number(year);
  currentFilters.month = Number(month) + 1;

  if (dataTable) {
    dataTable.ajax.reload(function () {}, true); // **resetPaging**
  }
};

window.clearFolderFilter = function () {
  delete currentFilters.companyId;
  delete currentFilters.year;
  delete currentFilters.month;

  if (dataTable) {
    dataTable.ajax.reload(function () {}, true); // **resetPaging**
  }
};
