const csrfToken = $('meta[name="csrf-token"]').attr("content");
$(document).ready(function () {
  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("az-AZ", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initSlider() {
    if (typeof globalMinAmount === "undefined" || globalMinAmount === null) {
      globalMinAmount = 0;
    }
    if (
      typeof globalMaxAmount === "undefined" ||
      globalMaxAmount === null ||
      globalMaxAmount <= globalMinAmount
    ) {
      globalMaxAmount = 300000;
    }

    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-range").slider("destroy");
    }

    const initialMin = globalMinAmount;
    const initialMax = globalMaxAmount;

    $("#slider-range").slider({
      range: true,
      min: globalMinAmount,
      max: globalMaxAmount,
      values: [initialMin, initialMax],
      step: 100,
      animate: "fast",
      orientation: "horizontal",

      create: function (event, ui) {
        $(this).find(".ui-slider-handle").attr("tabindex", "0");
      },

      start: function (event, ui) {
        $(this)
          .find(".ui-slider-range")
          .css("box-shadow", "0 4px 16px rgba(99, 102, 241, 0.4)");
      },

      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));

        $(this)
          .find(".ui-slider-range")
          .css("box-shadow", "0 4px 16px rgba(99, 102, 241, 0.4)");
      },

      stop: function (event, ui) {
        $(this)
          .find(".ui-slider-range")
          .css("box-shadow", "0 2px 8px rgba(99, 102, 241, 0.3)");
      },

      change: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
        console.log("Slider values changed to:", ui.values);
      },
    });

    $("#min-value").text(formatCurrency(initialMin));
    $("#max-value").text(formatCurrency(initialMax));

    if ($("#slider-range").hasClass("ui-slider")) {
      $("#slider-fallback").addClass("hidden");
    } else {
      $("#slider-fallback").removeClass("hidden");
    }
  }

  if ($("#slider-range").length > 0) {
    initSlider();
  }

  const table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    serverside: true,
    processing: true,
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

        d.from = form.find('input[name="start_date"]').val();
        d.to = form.find('input[name="end_date"]').val();

        const checkedStatuses = [];
        form.find('input[name="status"]:checked').each(function () {
          checkedStatuses.push($(this).val());
        });
        d.statuses = checkedStatuses;

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
          d.min_total = sliderValues[0];
          d.max_total = sliderValues[1];
        }

        const searchValue = $("#customSearch").val();
        if (searchValue && searchValue.trim()) {
          d.search = searchValue.trim();
        }

        return d;
      },
      dataSrc: function (json) {
        if (json.minAmount !== undefined && json.maxAmount !== undefined) {
          globalMinAmount = json.minAmount;
          globalMaxAmount = json.maxAmount;

          initSlider();
        }
        return json.data;
      },
    },
    columns: [
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.invoice}</span>`;
        },
        name: "invoice",
      },
      {
        data: function (row) {
          return `<div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                                <span class="text-[13px] font-normal">${row.transactions}</span>
                                <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
                            </div>
                    `;
        },
        name: "transactions",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${(row.amount
            ? Number(row.amount)
            : 0
          ).toFixed(2)} ₼</span>`;
        },
        name: "amount",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${(row.commission
            ? Number(row.commission)
            : 0
          ).toFixed(2)} ₼</span>`;
        },
        name: "commission",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${(row.amount &&
          row.commission
            ? Number(row.amount) - Number(row.commission)
            : 0
          ).toFixed(2)}
 ₼</span>`;
        },
        name: "total",
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
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
              color = "bg-[#4FC3F7]";
              break;
            case "qaralama":
              color = "bg-[#BDBDBD]";
              break;
            case "tamamlandi":
              color = "bg-[#66BB6A]";
              break;
            case "gozleyir":
              color = "bg-[#FFCA28]";
              break;
            case "reported_arasdirilir":
              parts = row.status.split(">").map((s) => s.trim());
              mystatus = `<span>${parts[0]}</span> > <span>${parts[1]}</span>`;
              color = "bg-[#EF5350]";
              break;
            case "reported":
              color = "bg-[#EF5350]";
              break;
            case "reported_arasdirilir_yeniden":
              parts = row.status.split(">").map((s) => s.trim());
              mystatus = `<span>${parts[0]}</span> > <span>${parts[1]}</span> > <span>${parts[2]}</span>`;
              color = "bg-[#EF5350]";
              break;
            default:
              color = "bg-[#FFCA28]";
          }

          return `
            <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit  whitespace-nowrap overflow-hidden text-ellipsis">
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
          const status = row.status.toLowerCase();

          const isAvankartActive =
            status === "qaralama" ||
            status === "waiting_aktiv" ||
            status === "gözləyir" ||
            status === "aktiv";
          const avankartDisabled = !isAvankartActive
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "";
          const avankartOnclick = isAvankartActive
            ? `onclick="openAvankartaModal('${row.invoice}')"`
            : "";

          const isReportDisabled =
            status === "reported" || status === "reported_arasdirilir";
          const reportDisabled = isReportDisabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "";
          const reportOnclick = !isReportDisabled
            ? `onclick="openReportModal('${row.invoice}', '${
                row.transactions
              }', '${(row.amount ? Number(row.amount) : 0).toFixed(2)}', '${
                row.date
              }')"`
            : "";

          const htmlOutput = `
            <div class="relative flex items-center">
                <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"
                    onclick="toggleDropdown(this, ${meta.row}, event)"></div>
                <div class="dropdown-menu absolute right-0 top-6 z-50 min-w-[200px] bg-white dark:bg-table-hover-dark text-[#1D222B] dark:text-white rounded-[12px] shadow-lg border border-[#0000001A] dark:border-[#ffffff1A] py-2 hidden">
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal" 
                   onclick="event.stopPropagation(); openInvoicePage('${row.invoice}')"
                    >
                         <img src="/images/hesablasmalar-pages/cursor-06.svg" alt="cursor" class="w-4 h-4 filter dark:invert" />
                        <span>Aç</span>
                    </div>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal ${avankartDisabled}" onclick="event.stopPropagation(); ${isAvankartActive ? "openAvankartaModal('" + row.invoice + "')" : ""}">
                         <img src="/images/hesablasmalar-pages/file-check-02.svg" alt="cursor" class="w-4 h-4 filter dark:invert" />
                        <span>Avankarta göndər</span>
                    </div>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal hidden" onclick="event.stopPropagation(); fakturaClick()">
                         <img src="/images/hesablasmalar-pages/file-attach-01.svg" alt="cursor" class="w-4 h-4 filter dark:invert" />
                        <span>Faktura əlavə et</span>
                    </div>
                    <div class="border-t my-1"></div>
                    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[#DD3838] hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal ${reportDisabled}" onclick="event.stopPropagation(); ${!isReportDisabled ? "openReportModal('" + row.invoice + "', '" + row.transactions + "', '" + (row.amount ? Number(row.amount) : 0).toFixed(2) + "', '" + row.date + "')" : ""}">
                         <img src="/images/hesablasmalar-pages/help-circle-contained.svg" alt="cursor" class="w-4 h-4" />
                        <span>Report et</span>
                    </div>
                </div>
            </div>
        `;
          return htmlOutput;
        },
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
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

      $pagination.append(`
    <div class="flex items-center justify-center px-3 leading-tight ${
      pageInfo.page === 0 ? "opacity-50 cursor-not-allowed" : "text-messages"
    }" 
      onclick="${pageInfo.page > 0 ? `changePage(${pageInfo.page - 1})` : ""}">
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
    <div class="flex items-center justify-center px-3 leading-tight ${
      pageInfo.page === pageInfo.pages - 1
        ? "opacity-50 cursor-not-allowed"
        : "text-tertiary-text"
    }" 
      onclick="${
        pageInfo.page < pageInfo.pages - 1
          ? `changePage(${pageInfo.page + 1})`
          : ""
      }">
      <div class="icon stratis-chevron-right !w-[12px] !h-[12px]"></div>
    </div>
  `);
    },
  });

  window.filterTable = () => {
    table.ajax.reload();
    openFilterModal();
  };

  window.refreshTable = () => {
    $("#customSearch").val("");
    $("#filterForm")[0].reset();
    table.ajax.reload();
  };

  $("#customSearch").on("keypress", function (e) {
    if (e.which === 13) {
      table.ajax.reload();
    }
  });

  let searchTimeout;
  $("#customSearch").on("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      table.ajax.reload();
    }, 300);
  });

  $("#myTable tbody").on("click", "tr", function (e) {
    if (
      $(e.target).closest(".dropdown-menu, .stratis-dot-vertical").length > 0
    ) {
      e.stopPropagation();
      return;
    }

    const rowData = table.row(this).data();
    if (rowData && rowData.invoice) {
      window.location.href = `/hesablashmalar/${rowData.invoice}`;
    }
  });

  $("#myTable tbody").on("mouseenter", "tr", function () {
    $(this).css("cursor", "pointer");
  });
});

function openDatePicker(id) {
  let input = document.getElementById(id);
  if (input.showPicker) {
    input.showPicker();
  } else {
    input.focus();
  }
}

window.openInvoicePage = function (invoice) {
  window.location.href = `/hesablashmalar/${invoice}`;
};

window.toggleDropdown = function (icon, rowIndex, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

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

function openAvankartaModal(invoiceNumber) {
  console.log("openAvankartaModal called with:", invoiceNumber);

  const overlay = document.getElementById("avankartaModalOverlay");
  const modal = document.getElementById("avankartaModal");
  const invoiceElement = document.getElementById("avankartInvoice");

  console.log("Modal elements found:", { overlay, modal, invoiceElement });

  if (!overlay || !modal) {
    console.error("Modal elements not found!");
    return;
  }

  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");

  if (invoiceElement) {
    invoiceElement.innerText = invoiceNumber;
  }
  window.selectedInvoiceNumber = invoiceNumber;

  console.log("Modal should be visible now");
}
function closeAvankartaModal() {
  document.getElementById("avankartaModalOverlay").classList.add("hidden");
  document.getElementById("avankartaModal").classList.add("hidden");
}
window.confirmAvankarta = function () {
  const invoice = window.selectedInvoiceNumber;

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

function openReportModal(invoice, transactions, amount, date) {
  console.log("=== openReportModal called ===", {
    invoice,
    transactions,
    amount,
    date,
  });

  try {
    const overlay = document.getElementById("reportModalOverlay");
    const modal = document.getElementById("reportModal");
    const invoiceEl = document.getElementById("reportInvoice");
    const transactionsEl = document.getElementById("reportTransactions");
    const amountEl = document.getElementById("reportAmount");
    const dateEl = document.getElementById("reportDate");
    const invoiceIdEl = document.getElementById("reportInvoiceId");

    console.log("Report modal elements found:", {
      overlay: !!overlay,
      modal: !!modal,
      invoiceEl: !!invoiceEl,
      transactionsEl: !!transactionsEl,
      amountEl: !!amountEl,
      dateEl: !!dateEl,
    });

    if (!overlay || !modal) {
      console.error("Report modal elements not found!");
      return;
    }

    if (invoiceEl) invoiceEl.textContent = invoice || "N/A";
    if (transactionsEl) transactionsEl.textContent = transactions || "0";
    if (amountEl) amountEl.textContent = (amount || "0") + " AZN";
    if (dateEl) dateEl.textContent = date || "N/A";
    if (invoiceIdEl) invoiceIdEl.value = invoice || "";

    overlay.classList.remove("hidden");
    modal.classList.remove("scale-95", "opacity-0");
    modal.classList.add("scale-100", "opacity-100");

    document.body.style.overflow = "hidden";

    console.log("Report modal opened successfully");
  } catch (error) {
    console.error("Error opening report modal:", error);
  }
}
function closeReportModal() {
  try {
    const overlay = document.getElementById("reportModalOverlay");
    const modal = document.getElementById("reportModal");
    const messageEl = document.getElementById("reportMessage");

    if (overlay) {
      overlay.classList.add("hidden");
    }

    if (modal) {
      modal.classList.remove("scale-100", "opacity-100");
      modal.classList.add("scale-95", "opacity-0");
    }

    if (messageEl) {
      messageEl.value = "";
    }

    document.body.style.overflow = "";

    console.log("Report modal closed successfully");
  } catch (error) {
    console.error("Error closing report modal:", error);
  }
}

function submitForm(formType) {
  try {
    if (formType === "report") {
      const form = document.getElementById("reportForm");
      const messageEl = document.getElementById("reportMessage");

      if (!form) {
        console.error("Report form not found!");
        alert("Form tapılmadı!");
        return false;
      }

      if (!messageEl || !messageEl.value.trim()) {
        alert("Zəhmət olmasa mesaj yazın!");
        messageEl?.focus();
        return false;
      }

      if (messageEl.value.trim().length < 10) {
        alert("Mesaj minimum 10 simvol olmalıdır!");
        messageEl.focus();
        return false;
      }

      fetch("/csrf-token", {
        credentials: "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then((response) => response.json())
        .then((tokenData) => {
          const formData = new FormData(form);
          formData.set("_csrf", tokenData.csrfToken);

          return fetch(form.dataset.url || "/hesablashmalar/add-report", {
            method: "POST",
            body: formData,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "same-origin",
          });
        })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            alert("Şikayətiniz uğurla göndərildi!");
            closeReportModal();
            if (typeof table !== "undefined") {
              table.ajax.reload(null, false);
            }
          } else {
            alert(data.message || "Xəta baş verdi!");
          }
        })
        .catch((error) => {
          console.error("Report submission error:", error);
          alert("Şikayət göndərilərkən xəta baş verdi!");
        });
    } else if (formType === "avankart") {
      const form = document.getElementById("avankartForm");
      if (!form) {
        console.error("Avankart form not found!");
        alert("Form tapılmadı!");
        return false;
      }

      console.log("Submitting avankart form...");
      form.submit();
    }
  } catch (error) {
    console.error("Submit form error:", error);
    alert("Forma göndərilərkən xəta baş verdi!");
  }

  return false;
}

function fakturaClick() {
  document.getElementById("fakturaModalOverlay").classList.toggle("hidden");
  document.getElementById("fakturaModal").classList.toggle("hidden");
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

window.openFilterModal = function () {
  const overlay = document.getElementById("overlay");
  const filterPop = document.getElementById("filterPop");

  if (overlay && filterPop) {
    overlay.classList.toggle("hidden");
    filterPop.classList.toggle("hidden");
  }
};

window.applyFilter = function () {
  if (typeof table !== "undefined") {
    table.ajax.reload();
  }
  openFilterModal();
};

window.clearFilters = function () {
  const filterForm = document.getElementById("filterForm");
  if (filterForm) {
    filterForm.reset();
  }

  if (
    $("#slider-range").length > 0 &&
    $("#slider-range").hasClass("ui-slider")
  ) {
    $("#slider-range").slider("values", [globalMinAmount, globalMaxAmount]);
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  if (typeof table !== "undefined") {
    table.ajax.reload();
  }
};
