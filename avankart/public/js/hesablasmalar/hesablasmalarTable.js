const csrfToken = $('meta[name="csrf-token"]').attr("content");
$(document).ready(function () {
  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  // --- LIVE slider debounce timer ---
  let sliderLiveTimer = null;
  function scheduleSliderLiveRedraw() {
    clearTimeout(sliderLiveTimer);
    sliderLiveTimer = setTimeout(() => window.redrawTable(), 150);
  }

  // İlk renderdə data-init-* dəyərlərini oxu (mövcuddursa)
  (function primeSliderBoundsFromDom() {
    const $sr = $("#slider-range");
    if (!$sr.length) return;
    const dMin = Number($sr.data("init-min"));
    const dMax = Number($sr.data("init-max"));
    if (!Number.isNaN(dMin) && typeof window.globalMinAmount === "undefined") {
      window.globalMinAmount = dMin;
    }
    if (!Number.isNaN(dMax) && typeof window.globalMaxAmount === "undefined") {
      window.globalMaxAmount = dMax;
    }
    // default fallback-lar
    if (typeof window.globalMinAmount === "undefined")
      window.globalMinAmount = 0;
    if (typeof window.globalMaxAmount === "undefined")
      window.globalMaxAmount = 1000;
  })();

  function initSlider() {
    // safety: rəqəmə çevir
    let min = Number(window.globalMinAmount ?? 0);
    let max = Number(window.globalMaxAmount ?? 1000);
    if (Number.isNaN(min)) min = 0;
    if (Number.isNaN(max) || max < min) max = min;

    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("destroy");
    }
    $("#slider-range").slider({
      range: true,
      min: min,
      max: max,
      values: [min, max],
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
        // LIVE: sürüşdürərkən də filter tətbiq et (debounce)
        scheduleSliderLiveRedraw();
      },
      change: function (event, ui) {
        // LIVE: klaviatura/accessible dəyişikliklərdə də
        if (ui && ui.values) {
          $("#min-value").text(formatCurrency(ui.values[0]));
          $("#max-value").text(formatCurrency(ui.values[1]));
          scheduleSliderLiveRedraw();
        }
      },
      stop: function () {
        // mouse buraxılanda son dəfə də çək
        window.redrawTable();
      },
    });

    $("#min-value").text(formatCurrency(min));
    $("#max-value").text(formatCurrency(max));
  }

  // DOM hazır olan kimi (serverdən cavab gəlməsini gözləmədən) slider-i göstər
  if ($("#slider-range").length) {
    initSlider();
  }

  // UI status dəyərlərini backend açarlarına xəritələndir (startswith dəstəyi ilə)
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

  // Cədvəldə tarixi təhlükəsiz göstər (yoxdursa boş göstər)
  function safeFormatDate(displayVal) {
    if (!displayVal) return "";
    // ISO → DD.MM.YYYY
    const iso = String(displayVal).slice(0, 10); // 2025-08-31
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;
    return displayVal; // backend artıq formatlı göndəribsə
  }

  var table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    processing: true,
    serverSide: true,
    ajax: {
      url: "/hesablashmalar/datatable",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      data: function (d) {
        const form = $("#filterForm");

        // ✅ Tarixləri RAW göndər (YYYY-MM-DD) və hər iki açarla (from/to + start_date/end_date)
        const rawFrom = form.find('input[name="start_date"]').val() || null;
        const rawTo = form.find('input[name="end_date"]').val() || null;

        if (rawFrom) {
          d.from = rawFrom;
          d.start_date = rawFrom;
        } else {
          delete d.from;
          delete d.start_date;
        }

        if (rawTo) {
          d.to = rawTo;
          d.end_date = rawTo;
        } else {
          delete d.to;
          delete d.end_date;
        }

        const checkedStatuses = [];
        form.find('input[name="status"]:checked').each(function () {
          checkedStatuses.push($(this).val());
        });
        d.statuses = expandStatusesForBackend(checkedStatuses);

        const checkedCards = [];
        form.find('input[name="cards[]"]:checked').each(function () {
          checkedCards.push($(this).val());
        });
        d.cards = checkedCards;

        if (
          $("#slider-range").length > 0 &&
          $("#slider-range").hasClass("ui-slider")
        ) {
          const sliderValues = $("#slider-range").slider("values");
          d.min_total = sliderValues[0]; // mövcud açar (dəyişmədim)
          d.max_total = sliderValues[1];

          // 🔁 Ehtiyat üçün amount açarları da göndər (backend fərqli ad gözləyirsə)
          d.min_amount = sliderValues[0];
          d.max_amount = sliderValues[1];
        }

        // backend search.value gözləyir → obyekt kimi göndəririk
        d.search = { value: $("#customSearch").val() };

        d._ts = Date.now(); // cache-bust

        // DEBUG
        console.log("DT → payload", d);
        return d;
      },
      dataSrc: function (json) {
        // DEBUG
        console.log("DT ← response", json);

        // Server yeni limitlər göndəribsə slider-i yenilə
        if (json.minAmount !== undefined && json.maxAmount !== undefined) {
          window.globalMinAmount = Number(json.minAmount);
          window.globalMaxAmount = Number(json.maxAmount);
          initSlider();
        }
        return json.data;
      },
    },
    columns: [
      {
        data: function (row) {
          console.log(row,'row')
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.invoice_id}</span>`;
        },
        name: "invoice",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${(row.amount ? Number(row.amount) : 0).toFixed(2)} ₼</span>`;
        },
        name: "amount",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${(row.comission ? Number(row.comission) : 0).toFixed(2)} ₼</span>`;
        },
        name: "comission",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${(row.final_amount ? Number(row.final_amount) : 0).toFixed(2)} ₼</span>`;
        },
        name: "total",
      },
      {
        data: function (row) {
          const txt = safeFormatDate(row.settlement_date);
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${txt}</span>`;
        },
        name: "date",
      },
      {
        data: function (row) {
          let color = "";
          let mystatus = row.status;
          let parts = [];
          switch (row.status_key) {
            case "aktiv":
            case "active":
              color = "bg-[#4FC3F7]";
              break;
            case "qaralama":
              color = "bg-[#BDBDBD]";
              break;
            case "tamamlandi":
              color = "bg-[#66BB6A]";
              break;
            case "gozleyir":
            case "waiting":
              color = "bg-[#FFCA28]";
              break;
            case "reported_arasdirilir":
              parts = String(row.status)
                .split(">")
                .map((s) => s.trim());
              mystatus = `<span>${parts[0]}</span> > <span>${parts[1] ?? ""}</span>`;
              color = "bg-[#EF5350]";
              break;
            case "reported":
              color = "bg-[#EF5350]";
              break;
            case "reported_arasdirilir_yeniden":
              parts = String(row.status)
                .split(">")
                .map((s) => s.trim());
              mystatus = `<span>${parts[0]}</span> > <span>${parts[1] ?? ""}</span> > <span>${parts[2] ?? ""}</span>`;
              color = "bg-[#EF5350]";
              break;
            default:
              color = "bg-[#FFCA28]";
          }

          return `
            <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit whitespace-nowrap overflow-hidden text-ellipsis">
              <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
              <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${mystatus}</span>
            </div>
          `;
        },
        name: "status",
      },
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const invoiceId = row.invoice_id;
          const status = row.status_key?.toLowerCase() || "";
          const isAvankartActive =
            status === "waiting" ||
            status === "waiting_aktiv" ||
            status === "reported_arasdirilir_yeniden" ||
            status === "reported_arasdirilir";

          const avankartDisabled = isAvankartActive
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "";
          const avankartAttrs = !isAvankartActive
            ? `onclick="openAvankartaModal('${invoiceId}')"`
            : "";

          const firstActionLabel =
            status === "reported" ? "Problemi Analiz et" : "Redaktə et";

          // Edit üçün AMOUNT dəyərini ötürürük
          const editAttrs = `data-invoice-id="${invoiceId}" 
                             data-amount="${(row.amount ? Number(row.amount) : 0).toFixed(2)}" 
                             onclick="openEditModal(this)"`;

          const content = `
            <div class="dropdown-menu absolute right-0 top-6 z-50 min-w-[200px] 
                        bg-white dark:bg-table-hover-dark rounded-[12px] shadow-lg 
                        border border-[#0000001A] dark:border-[#ffffff1A] py-2 hidden">

              <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] 
                          dark:hover:bg-[#353945] text-[13px] font-normal" 
                  ${editAttrs}>
                <img src="/images/hesablashmalar-pages/cursor-06.svg" alt="cursor" class="w-4 h-4 filter dark:invert" />
                <span>${firstActionLabel}</span>
              </div>

              <div class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[13px] font-normal 
                          hover:bg-[#F5F5F5] dark:hover:bg-[#353945] ${avankartDisabled}" 
                  ${avankartAttrs}>
                <img src="/images/hesablashmalar-pages/file-check-02.svg" alt="cursor" class="w-4 h-4 filter dark:invert" />
                <span>Təsdiq üçün Avankarta göndər</span>
              </div>

              <div class="border-t my-1"></div>

              <div class="delete-invoice flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer
                          hover:bg-[#F5F5F5] dark:hover:bg-[#353945]"
                   data-invoice-id="${invoiceId}">
                <img src="/images/hesablashmalar-pages/trash-01.svg" alt="delete" class="w-4 h-4 filter dark:invert" />
                <span>Invoysu sil</span>
              </div>
            </div>
          `;

          return `
            <div class="relative flex items-center">
              <div class="icon stratis-dot-vertical w-5 h-5 cursor-pointer text-messages dark:text-primary-text-color-dark"
                   onclick="toggleDropdown(this, ${meta.row})"></div>
              ${content}
            </div>
          `;
        },
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 10,

    createdRow: function (row, data) {
      console.log(
        "Created row for invoice_id:",
        data.invoice_id,
        "cards:",
        data.cards
      );

      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          $(this).css("background-color", "#FFFFFF1A", "opacity:0.1");
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

      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
        );
      });

      $("#myTable, #myTable_wrapper").css("overflow", "visible");
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

      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({ "border-bottom": "0.5px solid #E0E0E0" });
      $lastRow
        .find("td:last-child")
        .css({ "border-left": "0.5px solid #E0E0E0" });

      // "Məlumat tapılmadı" mesajı
      const rowsCount = api.rows({ page: "current" }).data().length;
      if (rowsCount === 0) {
        const noDataRow = `
          <tr class="no-data-row">
            <td colspan="${colCount}" style="padding:16px; text-align:center; color:#9E9E9E;">
              Məlumat tapılmadı
            </td>
          </tr>
        `;
        $("#myTable tbody").append(noDataRow);
      }

      $pagination.append(`
        <div class="flex items-center justify-center px-3 leading-tight ${pageInfo.page === 0 ? "opacity-50 cursor-not-allowed" : "text-messages"}" 
             onclick="\${pageInfo.page > 0 ? \`changePage(\${pageInfo.page - 1})\` : ""}">
          <div class="icon stratis-chevron-left !w-[12px] !h-[12px]"></div>
        </div>
      `);

      const maxPages = 100;
      const totalPages = Math.min(
        Math.max(1, parseInt(pageInfo.pages) || 1),
        maxPages
      );

      let paginationButtons = '<div class="flex gap-2">';
      for (let i = 0; i < totalPages; i++) {
        paginationButtons += `
          <button class="cursor-pointer w-10 h-10 rounded-[8px] text-[13px] hover:text-messages 
            ${i === pageInfo.page ? "bg-[#F6D9FF] text-messages" : "bg-transparent text-tertiary-text"}"
            onclick="changePage(${i})">${i + 1}</button>
        `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
        <div class="flex items-center justify-center px-3 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "opacity-50 cursor-not-allowed" : "text-tertiary-text"}" 
             onclick="\${pageInfo.page < pageInfo.pages - 1 ? \`changePage(\${pageInfo.page + 1})\` : ""}">
          <div class="icon stratis-chevron-right !w-[12px] !h-[12px]"></div>
        </div>
      `);
    },
  });

  // real-time search (debounce)
  let searchTimer = null;
  $("#customSearch").on("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      window.redrawTable();
    }, 300);
  });

  // bütün filterlər birlikdə işləsin (checkbox + tarix girişləri) -> change + input + .date-input
  const filterSelectors =
    'input[name="status"], input[name="cards[]"], input[name="start_date"], input[name="end_date"], .date-input';
  $("#filterForm").on("change input", filterSelectors, function () {
    window.redrawTable();
  });

  // ✅ Tarixlər üçün ayrıca “live” debounce (calendar-dan seçim & klaviatura)
  let dateTimer = null;
  $(
    '#filterForm input[name="start_date"], #filterForm input[name="end_date"]'
  ).on("input change keyup", function () {
    clearTimeout(dateTimer);
    dateTimer = setTimeout(() => window.redrawTable(), 150);
  });

  // modalda “Filter” düyməsi
  $(document).on(
    "click",
    '#filtersApply, #filters-apply, #applyFilters, [data-apply="filters"], .apply-filters',
    function () {
      window.redrawTable();
    }
  );

  window.redrawTable = () => {
    $("#myTable").DataTable().ajax.reload(null, false); // page qalır
  };
});

/* ===== EDIT MODAL ===== */
window.openEditModal = function (element) {
  const invoiceId = element.dataset.invoiceId;
  const amount = element.dataset.amount;

  const invoiceIdHidden = document.getElementById("invoiceIdHidden");
  if (invoiceIdHidden) invoiceIdHidden.value = invoiceId;

  const amountInput = document.querySelector(
    '#updateInvoiceForm input[name="balance"]'
  );
  if (amountInput) amountInput.value = amount + " ₼";

  document.getElementById("UpdateInvoys").classList.remove("hidden");

  document
    .querySelectorAll(".dropdown-menu")
    .forEach((menu) => menu.classList.add("hidden"));
};

window.closeEditModal = function () {
  document.getElementById("UpdateInvoys").classList.add("hidden");
};

function openReportModalFromEl(el) {
  const { invoice, transactions, amount, date } = el.dataset;
  openReportModal(invoice, transactions, amount, date);
}

window.openInvoicePage = function (invoiceId) {
  window.location.href = `/hesablashmalar/${invoiceId}`;
};

window.changePage = function (page) {
  $("#myTable").DataTable().page(page).draw("page");
};

window.toggleDropdown = function (icon) {
  document
    .querySelectorAll(".dropdown-menu")
    .forEach((menu) => menu.classList.add("hidden"));
  const dropdown = icon.nextElementSibling;
  if (dropdown) dropdown.classList.toggle("hidden");
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

/* ===== Avankarta ===== */
function openAvankartaModal(invoiceNumber) {
  document.getElementById("avankartaModalOverlay").classList.remove("hidden");
  document.getElementById("avankartaModal").classList.remove("hidden");
  document.getElementById("avankartInvoice").innerText = invoiceNumber;
  window.selectedInvoiceNumber = invoiceNumber;
}
function closeAvankartaModal() {
  document.getElementById("avankartaModalOverlay").classList.add("hidden");
  document.getElementById("avankartaModal").classList.add("hidden");
}
window.confirmAvankarta = function () {
  const invoice = selectedInvoiceNumber;
  if (!invoice) {
    alert("Invoice nömrəsi yoxdur!");
    return;
  }

  fetch("/hesablashmalar/send-to-avankart", {
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
        data.message || "Avankarta göndərildi!!",
        data.success ? "success" : "error"
      );
    })
    .catch((error) => {
      alertModal(error, "error");
    });

  closeAvankartaModal();
};

/* ===== Report Modalları ===== */
function openReportModal(invoice, transactions, amount, date) {
  document.getElementById("reportModalOverlay").classList.remove("hidden");
  document.getElementById("reportModal").classList.remove("hidden");
  document.getElementById("reportInvoice").innerText = invoice;
  document.getElementById("reportTransactions").innerText = transactions;
  document.getElementById("reportAmount").innerText = amount + " AZN";
  document.getElementById("reportDate").innerText = date;
}
function closeReportModal() {
  document.getElementById("reportModalOverlay").classList.add("hidden");
  document.getElementById("reportModal").classList.add("hidden");
}

function formatCurrency(value) {
  return (
    new Intl.NumberFormat("az-AZ", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₼"
  );
}

/* 
   BACKEND INTEGRATION (EDIT + DELETE)
   */

// String -> number
function parseAmountToNumber(str) {
  if (!str) return 0;
  return (
    Number(
      String(str)
        .replace(/[^\d.,-]/g, "")
        .replace(",", ".")
    ) || 0
  );
}

// EDIT — URL /hesablashmalar/:invoiceId/edit və body-də həm amount, həm balance
$(document).on("submit", "#updateInvoiceForm", async function (e) {
  e.preventDefault();

  const invoiceId = $("#invoiceIdHidden").val();
  const rawAmount = $(this).find('input[name="balance"]').val();
  const amount = parseAmountToNumber(rawAmount);

  if (!invoiceId) return alertModal("Invoice ID tapılmadı", "error");
  if (!(amount >= 0)) return alertModal("Məbləğ düzgün deyil", "error");

  const url = `/hesablashmalar/${encodeURIComponent(invoiceId)}/edit`;

  console.log("EDIT SUBMIT →", { url, invoiceId, amount }); // debug

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ amount, balance: amount }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      alertModal(data.message || "Invoys yeniləndi", "success");
      closeEditModal();
      window.redrawTable();
    } else {
      alertModal(data.message || "Yeniləmə uğursuz oldu", "error");
    }
  } catch (err) {
    console.error("EDIT ERROR", err);
    alertModal("Server xətası", "error");
  }
});

// DELETE — eyni (URL /hesablashmalar/:invoiceId/delete)
$(document).on("click", ".delete-invoice", async function () {
  const invoiceId = $(this).data("invoiceId");
  if (!invoiceId) return alertModal("Invoys ID tələb olunur", "error");

  if (!confirm("Bu invoysu silmək istədiyinizdən əminsiniz?")) return;

  try {
    const res = await fetch(
      `/hesablashmalar/${encodeURIComponent(invoiceId)}/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({}),
      }
    );

    const data = await res.json();

    if (data?.otpRequired) {
      if (typeof Otp === "function" && data.email && data.tempDeleteId) {
        Otp(data.email, data.tempDeleteId, {
          url: `/hesablashmalar/${encodeURIComponent(invoiceId)}/accept-delete`,
          title: "Invoys Silmə",
          formType: "deleteInvoice",
          submitText: "Təsdiqlə",
          cancelText: "Ləğv et",
          onSuccess: function () {
            window.redrawTable();
          },
        });
      } else {
        alertModal("OTP açıla bilmədi", "error");
      }
      return;
    }

    if (res.ok && data.success) {
      alertModal(data.message || "Invoys silindi", "success");
      window.redrawTable();
    } else {
      alertModal(data.message || "Silinmə uğursuz oldu", "error");
    }
  } catch (err) {
    alertModal("Server xətası", "error");
  }

  document
    .querySelectorAll(".dropdown-menu")
    .forEach((menu) => menu.classList.add("hidden"));
});
