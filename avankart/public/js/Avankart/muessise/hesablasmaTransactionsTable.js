$(document).ready(function () {
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") ||
    $('input[name="_token"]').val() ||
    null;

  const activeFilters = {
    trx_id: "",
    date_from: null,
    date_to: null,
    category: "",
    amount_min: null,
    amount_max: null,
  };

  // === Amount filter inputs (existing fields in the page) ===
  const amountMinEl = document.getElementById("f-amount-min");
  const amountMaxEl = document.getElementById("f-amount-max");

  // Safe number parser
  function toNum(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).replace(",", ".").trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  // Read current inputs into activeFilters
  function readAmountFilterInputsIntoState() {
    activeFilters.amount_min = toNum(amountMinEl?.value);
    activeFilters.amount_max = toNum(amountMaxEl?.value);

    if (
      activeFilters.amount_min != null &&
      activeFilters.amount_max != null &&
      activeFilters.amount_min > activeFilters.amount_max
    ) {
      const tmp = activeFilters.amount_min;
      activeFilters.amount_min = activeFilters.amount_max;
      activeFilters.amount_max = tmp;
      if (amountMinEl) amountMinEl.value = activeFilters.amount_min;
      if (amountMaxEl) amountMaxEl.value = activeFilters.amount_max;
    }
  }

  function getUrlParams() {
    if (window.trxContext?.hesablasma_id && window.trxContext?.company_id) {
      return {
        hesablasma_id: window.trxContext.hesablasma_id,
        company_id: window.trxContext.company_id,
      };
    }
    const parts = window.location.pathname.split("/").filter(Boolean);
    const d = parts.indexOf("details");
    const t = parts.indexOf("transactions");
    if (d !== -1 && t !== -1 && parts[d + 1] && parts[t + 1]) {
      return { hesablasma_id: parts[d + 1], company_id: parts[t + 1] };
    }
    console.error("[trx] URL parameters not found. path:", parts.join("/"));
    return null;
  }

  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("az-AZ", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " AZN"
    );
  }

  function initializeTransactionTable() {
    const urlParams = getUrlParams();
    if (!urlParams) {
      const host = document.querySelector("#myTable")?.closest(".card,body");
      if (host) {
        const el = document.createElement("div");
        el.className = "text-red-600 p-3";
        el.textContent = "Invalid URL parameters. Please check the URL format.";
        host.prepend(el);
      }
      return null;
    }

    const apiUrl = `/emeliyyatlar/muessise/hesablasma/api/details/${urlParams.hesablasma_id}/transactions/${urlParams.company_id}`;
    console.log("Initializing transaction table with API URL:", apiUrl);

    // Sync state from inputs on load
    readAmountFilterInputsIntoState();

    // DataTable
    const table = $("#myTable").DataTable({
      processing: true,
      serverSide: true,
      dom: "t",
      ajax: {
        url: apiUrl,
        type: "POST",
        data: function (d) {
          if (csrfToken) d._csrf = csrfToken;

          // read inputs -> state before sending
          readAmountFilterInputsIntoState();

          d.filters = {
            ...activeFilters,
            amount_min: activeFilters.amount_min, // number or null
            amount_max: activeFilters.amount_max, // number or null
          };
          return d;
        },
        dataSrc: function (res) {
          try {
            console.log(
              "[TRX.FE] res keys:",
              Object.keys(res || {}),
              "success=",
              res?.success,
              "len=",
              (res?.data || []).length
            );
          } catch (e) {}
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.rows)) return res.rows;
          return [];
        },
        error: function (xhr) {
          console.error("[TRX.FE] ajax error", xhr?.status, xhr?.responseText);
        },
      },

      columns: [
        {
          data: "istifadeci",
          title: "İstifadəçi",
          render: function (data, type, row) {
            const primary = (data && data !== "undefined" ? data : "").trim();
            const fallback = row?.people_id || row?.phone || "—";
            const display = primary || fallback;
            return `
              <div class="flex justify-center items-center gap-2.5">
                  <div class="flex justify-center items-center">
                  </div>
                  <div class="w-full">
                      <div class="text-[13px] font-medium">${display}</div>
                      <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${row?.people_id ? row.people_id : ""}</span></div>
                  </div>
              </div>
            `;
          },
        },
        {
          data: "tranzaksiya_id",
          title: "Tranzaksiya ID",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
          // },
          // {
          //   data: "tranzaksiya_id",
          //   title: "Tranzaksiya ID",
          //   render: function (data) {
          //     return `<span class="font-mono text-sm">${data}</span>`;
          //   },
        },
        {
          data: "kart_kateqoriyasi",
          title: "Kart Kateqoriyası",
          render: function (data) {
            return `<span class="px-2 py-1 text-xs font-medium rounded-full">${data}</span>`;
          },
        },
        {
          data: "mebleg",
          title: "Məbləğ",
          render: function (data, type) {
            const val = Number(data || 0);
            if (type === "sort" || type === "type" || type === "filter")
              return val;
            return `<p style="text-align: left;" class="font-semibold text-red-500 text-[12px]">-${formatCurrency(
              val
            )}</p>`;
          },
          className: "dt-body-right",
        },
        {
          data: "mekan",
          title: "Məkan",
          render: function (data) {
            return `<span class="text-sm">${data}</span>`;
          },
        },
        {
          data: "tarix",
          title: "Tarix",
          render: function (data) {
            return `<span class="text-sm text-gray-600">${data}</span>`;
          },
        },
      ],
      columnDefs: [{ targets: 3, type: "num" }], // Məbləğ
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        // Add bottom border to each row
        $(row).find("td").addClass("border-b-[.5px] border-stroke ");

        // Add padding to each cell
        $(row).find("td").css({
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });
      },
      order: [[5, "desc"]],
      language: {
        search: "Axtarış:",
        lengthMenu: "Səhifədə _MENU_ nəticə göstər",
        info: "_START_-_END_ arası _TOTAL_ nəticədən",
        infoEmpty: "0-0 arası 0 nəticədən",
        infoFiltered: "(_MAX_ nəticə arasından filtrlənib)",
        loadingRecords: "Yüklənir...",
        zeroRecords: "Heç bir nəticə tapılmadı",
        emptyTable: "Cədvəldə heç bir məlumat yoxdur",
        paginate: {
          first: "İlk",
          last: "Son",
          next: "Növbəti",
          previous: "Əvvəlki",
        },
      },
      responsive: true,
      initComplete: function () {
        console.log("Transaction table initialized successfully");
      },
    });

    window.__trxTable = table;

    // Apply on change/blur/Enter
    ["change", "blur", "keyup"].forEach((ev) => {
      if (amountMinEl)
        amountMinEl.addEventListener(ev, (e) => {
          if (ev === "keyup" && e.key !== "Enter") return;
          readAmountFilterInputsIntoState();
          table.ajax.reload(null, true);
        });
      if (amountMaxEl)
        amountMaxEl.addEventListener(ev, (e) => {
          if (ev === "keyup" && e.key !== "Enter") return;
          readAmountFilterInputsIntoState();
          table.ajax.reload(null, true);
        });
    });

    // Optional: Apply button if present (#f-apply)
    const applyBtn = document.getElementById("f-apply");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        readAmountFilterInputsIntoState();
        table.ajax.reload(null, true);
      });
    }

    const resetBtn = document.getElementById("f-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (amountMinEl) amountMinEl.value = "";
        if (amountMaxEl) amountMaxEl.value = "";
        activeFilters.amount_min = null;
        activeFilters.amount_max = null;
        table.ajax.reload(null, true);
      });
    }

    return table;
  }

  const transactionTable = initializeTransactionTable();

  window.handleTransactionRowClick = function (row) {
    console.log("Transaction row clicked:", row);
  };

  window.searchTransactions = function () {
    const searchTerm = document.querySelector(
      'input[placeholder="Search..."]'
    )?.value;
    if (transactionTable && searchTerm !== undefined) {
      transactionTable.search(searchTerm).draw();
    }
  };

  window.openTrxFilterModal = function () {
    const modal = document.getElementById("trx-filter-modal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeTrxFilterModal = function () {
    const modal = document.getElementById("trx-filter-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  };

  window.applyTrxFilters = function () {
    const trxId = document.getElementById("f-trx-id")?.value?.trim() || "";
    const category = document.getElementById("f-category")?.value || "";
    const dateFrom = document.getElementById("f-date-from")?.value || null;
    const dateTo = document.getElementById("f-date-to")?.value || null;

    const amountMinValue = document
      .getElementById("f-amount-min")
      ?.value?.trim();
    const amountMaxValue = document
      .getElementById("f-amount-max")
      ?.value?.trim();

    const amountMin =
      amountMinValue && !isNaN(amountMinValue) && amountMinValue !== ""
        ? Number(amountMinValue)
        : null;
    const amountMax =
      amountMaxValue && !isNaN(amountMaxValue) && amountMaxValue !== ""
        ? Number(amountMaxValue)
        : null;

    if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
      alert("Min məbləğ max məbləğdən böyük ola bilməz!");
      return;
    }

    activeFilters.trx_id = trxId;
    activeFilters.category = category;
    activeFilters.date_from = dateFrom;
    activeFilters.date_to = dateTo;
    activeFilters.amount_min = amountMin;
    activeFilters.amount_max = amountMax;

    console.log("Applied filters:", {
      trx_id: trxId,
      category,
      date_from: dateFrom,
      date_to: dateTo,
      amount_min: amountMin,
      amount_max: amountMax,
    });

    window.closeTrxFilterModal();
    if (window.__trxTable) {
      window.__trxTable.ajax.reload();
    }
  };

  window.resetTrxFilters = function () {
    const fields = [
      "f-trx-id",
      "f-category",
      "f-date-from",
      "f-date-to",
      "f-amount-min",
      "f-amount-max",
    ];
    fields.forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.value = "";
    });

    Object.keys(activeFilters).forEach((key) => {
      if (typeof activeFilters[key] === "string") {
        activeFilters[key] = "";
      } else {
        activeFilters[key] = null;
      }
    });

    window.closeTrxFilterModal();
    if (window.__trxTable) {
      window.__trxTable.ajax.reload();
    }
  };

  window.exportToPDF = function () {
    const params =
      window.trxContext ||
      (function () {
        const p = window.location.pathname.split("/").filter(Boolean);
        const d = p.indexOf("details");
        const t = p.indexOf("transactions");
        return d !== -1 && t !== -1
          ? { hesablasma_id: p[d + 1], company_id: p[t + 1] }
          : null;
      })();
    if (params) {
      window.location.href = `/emeliyyatlar/muessise/hesablasma/details/${params.hesablasma_id}/transactions/${params.company_id}/pdf`;
    }
  };

  (function bindSearch() {
    const inp = document.getElementById("trx-search");
    if (!inp || !transactionTable) return;
    let t;
    inp.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        transactionTable.search(inp.value || "").draw();
      }, 300);
    });
  })();

  // Refresh
  (function bindRefresh() {
    const btn = document.getElementById("trx-refresh");
    if (!btn || !transactionTable) return;
    btn.addEventListener("click", () => {
      transactionTable.ajax.reload(null, false);
    });
  })();

  (function bindFilter() {
    const btn = document.getElementById("trx-filter");
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.openTrxFilterModal();
    });
  })();

  (function bindPDF() {
    const btn = document.getElementById("trx-pdf");
    if (!btn) return;
    btn.addEventListener("click", () => window.print());
  })();

  (function bindModalBackground() {
    const modal = document.getElementById("trx-filter-modal");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        window.closeTrxFilterModal();
      }
    });
  })();

  // Cards fetcher
  (function fetchAndRenderCards() {
    function urlParams() {
      if (window.trxContext?.hesablasma_id && window.trxContext?.company_id) {
        return window.trxContext;
      }
      const parts = window.location.pathname.split("/").filter(Boolean);
      const d = parts.indexOf("details");
      const t = parts.indexOf("transactions");
      if (d !== -1 && t !== -1 && parts[d + 1] && parts[t + 1]) {
        return { hesablasma_id: parts[d + 1], company_id: parts[t + 1] };
      }
      return null;
    }

    const p = urlParams();
    if (!p) return;

    const cardsUrl = `/emeliyyatlar/muessise/hesablasma/api/details/${p.hesablasma_id}/transactions/${p.company_id}/cards`;

    fetch(cardsUrl, { credentials: "same-origin" })
      .then((r) => r.json())
      .then(({ success, totalAmount, cardExpenses }) => {
        if (!success || !Array.isArray(cardExpenses)) return;

        const fmt = (v) => `${Number(v || 0).toFixed(2)} AZN`;

        const totalEl = document.querySelector(
          '[data-category="Toplam"] .amount'
        );
        if (totalEl) totalEl.textContent = fmt(totalAmount || 0);

        cardExpenses.forEach(({ category, amount, percentage }) => {
          const wrap = document.querySelector(`[data-category="${category}"]`);
          if (!wrap) return;
          const amountEl = wrap.querySelector(".amount");
          const percentEl = wrap.querySelector(".percent");

          if (amountEl) amountEl.textContent = fmt(amount);
          if (percentEl) percentEl.textContent = `${percentage}%`;
        });
      })
      .catch((err) => console.warn("[cards] fetch failed:", err));
  })();
});
