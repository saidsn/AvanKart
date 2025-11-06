// Global dəyişənlər
const csrfToken = $('input[name="_csrf"]').val() || "";
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

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

  function updateHeaderFromSummary(summary) {
    $(".toplam-mebleg").text(
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(summary.total || 0)) + " AZN"
    );

    const map = {
      Yemək: ".bar-yemek",
      Hədiyyə: ".bar-hediyye",
      Yanacaq: ".bar-yanacaq",
      Market: ".bar-market",
      Biznes: ".bar-biznes",
      Premium: ".bar-premium",
      "Avto Yuma": ".bar-avto-yuma",
    };

    (summary.cards || []).forEach((c) => {
      const sel = map[c.name?.trim()] || null;
      if (!sel) return;
      const $wrap = $(sel);
      $wrap.find(".value").text(
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(c.amount || 0)) + " AZN"
      );
      const pct = summary.total
        ? Math.round((Number(c.amount || 0) / summary.total) * 100)
        : 0;
      $wrap.find(".percent").text(pct + "%");
    });
  }

  function initSlider() {
    if ($("#slider-range").hasClass("ui-slider"))
      $("#slider-range").slider("destroy");
    const min = Number(globalMinAmount) || 0;
    const max = Number(globalMaxAmount) || 0;
    const safeMax = max > min ? max : min + 1;

    $("#slider-range").slider({
      range: true,
      min,
      max: safeMax,
      values: [min, safeMax],
      slide: (e, ui) => {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      },
    });
    $("#min-value").text(formatCurrency(min));
    $("#max-value").text(formatCurrency(safeMax));
  }

  function extractYears() {
  return $('#dropdown_years input[type="checkbox"]:checked')
    .map(function () {
      const m = ($(this).attr("id") || "").match(/\d{4}/);
      return m ? Number(m[0]) : null;
    })
    .get()
    .filter(Boolean); // null olanları temizle
}

function extractMonths() {
  return $('#dropdown_months input[type="checkbox"]:checked')
    .map(function () {
      const m = ($(this).attr("id") || "").match(/month(\d{2})/);
      return m ? Number(m[1]) : null;
    })
    .get()
    .filter(Boolean);
}
  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }
    dataTable = $("#myTable").DataTable({
      ajax: {
        url: '/emeliyyatlar/sirket/eqaime',
        type: "POST",
        contentType: "application/json",
        processData: false,
        headers: { "x-csrf-token": csrfToken, "csrf-token": csrfToken },
        data: function (d) {
          const page = Math.floor(d.start / d.length) + 1;
          const limit = d.length;

          const payload = {
            page,
            limit,
            search: $('#customSearch').val() || "",
            ...(currentFilters.min != null ? { min: currentFilters.min } : {}),
            ...(currentFilters.max != null ? { max: currentFilters.max } : {}),
            ...(extractYears() ? { year: extractYears() } : {}),
            ...(extractMonths() ? { month: extractMonths() } : {}),
            ...(Array.isArray(currentFilters.cardStatus) &&
            currentFilters.cardStatus.length
              ? { status: currentFilters.cardStatus }
              : {}),
            ...(Array.isArray(currentFilters.cards) &&
            currentFilters.cards.length
              ? { cards: currentFilters.cards }
              : {}),
          };
          return JSON.stringify(payload);
        },
        dataFilter: function (raw) {
          const resp = JSON.parse(raw);
          try {
            if (resp?.summary) updateHeaderFromSummary(resp.summary);
            const amounts = (resp?.data || [])
              .map((r) => Number(r.amount || 0))
              .filter((v) => !Number.isNaN(v));
            if (amounts.length) {
              globalMinAmount = 0;
              globalMaxAmount = resp?.summary.total ?? 1000;
            } else {
              globalMinAmount = 0;
              globalMaxAmount = 0;
            }
            initSlider();
          } catch (e) {
            console.warn(e);
          }

          const dt = {
            draw: resp.draw,
            recordsTotal: resp?.total || 0,
            recordsFiltered: resp?.total || 0,
            data: (resp?.data || []).map((row) => ({
              logo: row?.company?.logo || "",
              companyName: row?.company?.name || "",
              companyId: row?.company?.cm_id || "",
              ReceiptNumber: row?.qaime_id || "",
              amount: Number(row?.amount || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              date: row?.period?.label || "",
              status: row?.status || "—",
              raw_status: row?.raw_status || "—",
              _qaime_id: row?.qaime_id || "",
            })),
          };
          return JSON.stringify(dt);
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
            return `
              <div class="flex justify-center items-center gap-2.5">
                  <div class="flex justify-center items-center">
                      <div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">
                          <img src="https://company.avankart.com/${row.logo_path}" class="object-cover">
                      </div>
                  </div>
                  <div class="w-full">
                      <div class="text-[13px] font-medium">${row.companyName}</div>
                      <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${row.companyId}</span></div>
                  </div>
              </div>
            `;
          },
        },
        {
          data: "ReceiptNumber",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "amount",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span> ₼"
            );
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
            let color = "";
            switch (row.raw_status) {
              case "tamamlandi":
                color = "bg-[#66BB6A]";
                break; // yaşıl
              case "active":
                color = "bg-[#4FC3F7]";
                break; // sarı
              case "passive":
                color = "bg-[#EF5350]";
                break; // qırmızı
              default:
                color = "bg-[#BDBDBD]"; // boz (digər)
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
          data: function (row) {
            return `
              <div id="wrapper" class="relative inline-block text-left">
                <!-- Trigger icon -->
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages w-5 h-5 cursor-pointer z-100"></div>

                <!-- Dropdown wrapper -->
                <div class="hidden absolute right-[-12px] w-[158px] z-50 dropdown-menu">

                  <!-- Caret wrapper -->
                  <div class="relative h-[8px]">
                    <!-- Caret -->
                    <div class="absolute top-1/2 right-4 w-4 h-4 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                  </div>

                  <!-- Dropdown box -->
                  <div class="rounded-lg shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
                    <div class="py-[3.5px] text-sm">
                      <div ${row.raw_status === 'active' ? `onclick="openTesdiqModal('`+row.ReceiptNumber+`')"` : '' } class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer ${row.raw_status !== 'active' ? `opacity-65` : '' }">
                        <span class="icon stratis-file-check-02 text-[13px]"></span>
                        <span class="font-medium text-[#1D222B] text-[13px]">Qaiməni təsdiqlə</span>
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
        document.getElementById("invoysTitleContainer").innerText =
          "E-qaimə" + (dataTable ? ` (${dataTable.data().count()})` : "");

        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changePage(' +
            Math.max(0, pageInfo.page - 1) +
            ')">' +
            '<div class="icon stratis-chevron-left text-xs"></div>' +
            "</div>"
        );

        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
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

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === pageInfo.pages - 1
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changePage(' +
            Math.min(pageInfo.page + 1, pageInfo.pages - 1) +
            ')">' +
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

        // 🔹 Növbəti səhifəyə keçid
        $(row).on("click", function (e) {
          const lastTd = $(this).find("td").last()[0];
          if (e.target === lastTd || $(e.target).closest("td")[0] === lastTd)
            return;

          if (data._qaime_id) {
            location.href = `/emeliyyatlar/sirket/eqaime/${encodeURIComponent(data._qaime_id)}/view`;
          }
        });
      },
    });
  }

  // Initialize DataTable
  initializeDataTable();
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};
$("#refreshTable, #refreshTableIcon").on("click", function (e) {
    e.preventDefault();
    if (dataTable) {
      dataTable.ajax.reload(function () {}, true); 
    }
    return false;
  });
// Filter modal functions
window.openFilterModal = function () {
  if ($("#filterPop").hasClass("hidden")) {
    $("#filterPop").removeClass("hidden");
  } else {
    $("#filterPop").addClass("hidden");
  }
};

window.closeFilterModal = function () {
  $("#filterPop").addClass("hidden");
};

// Dropdown functions
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

// Bu funksiyalar dropdown menyuları xaricində hər hansı bir yerə basıldıqda bağlamaq üçündür
document.addEventListener("click", function (event) {
  const companyDropdown = document.getElementById("dropdown_company");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_company"
  );

  // companyButton elementinin mövcudluğunu yoxla
  if (companyButton && companyDropdown) {
    if (
      !companyButton.contains(event.target) &&
      !companyDropdown.contains(event.target)
    ) {
      companyDropdown.classList.add("hidden");
      companyDropdown.classList.remove("visible");
    }
  }
});

// Dropdown functions
window.toggleDropdown_years = function () {
  const dropdown = document.getElementById("dropdown_years");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

window.toggleDropdown_months = function () {
  const dropdown = document.getElementById("dropdown_months");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

// Bu funksiyalar dropdown menyuları xaricində hər hansı bir yerə basıldıqda bağlamaq üçündür
document.addEventListener("click", function (event) {
  const yearDropdown = document.getElementById("dropdown_years");
  const monthsDropdown = document.getElementById("dropdown_months");
  const yearButton = document.getElementById("dropdownDefaultButton_years");
  const monthsButton = document.getElementById("dropdownDefaultButton_months");

  if (
    !yearButton.contains(event.target) &&
    !yearDropdown.contains(event.target)
  ) {
    yearDropdown.classList.add("hidden");
    yearDropdown.classList.remove("visible");
  }

  if (
    !monthsButton.contains(event.target) &&
    !monthsDropdown.contains(event.target)
  ) {
    monthsDropdown.classList.add("hidden");
    monthsDropdown.classList.remove("visible");
  }
});

// Apply filters function
window.applyFilters = function () {
  console.log("=== Applying filters ===");

  // Filterləri sıfırla
  currentFilters = {};

  // Subyektləri al
  const companies = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    companies.push(companyId.replace("subyekt-", ""));
  });

  if (companies.length > 0) {
    currentFilters.companies = companies;
  }

  // Subyektləri al
  const years = [];
  $('#dropdown_years input[type="checkbox"]:checked').each(function () {
    const yearId = $(this).attr("id");
    years.push(yearId.replace("subyekt-", ""));
  });

  if (years.length > 0) {
    currentFilters.years = years;
  }

  // İstifadəçiləri al
  const months = [];
  $('#dropdown_months input[type="checkbox"]:checked').each(function () {
    const monthId = $(this).attr("id");
    months.push(monthId.replace("istifadeci-", ""));
  });

  if (months.length > 0) {
    currentFilters.months = months;
  }

  const cardIds = [];
  $('input[name="card_category"]:checked').each(function () {
    cardIds.push($(this).val());
  });

  if (cardIds.length > 0) {
    currentFilters.cards = cardIds;
  }
  // Statusları al
  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    cardStatus.push($(this).val());
  });

  if (cardStatus.length > 0) {
    currentFilters.cardStatus = cardStatus;
  }

  // Məbləğ aralığını al (slider)
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);

    if (minValue !== null && maxValue !== null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
  }

  console.log("New currentFilters:", currentFilters);
  console.log("currentFilters keys:", Object.keys(currentFilters));

  // Məlumat cədvəlini yenilə
  if (dataTable) {
    console.log("Reloading DataTable...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable reload completed");
    }, false);
  }

  // Filter modalını bağla
  $("#filterPop").addClass("hidden");
};

// Clear filters function
window.clearFilters = function () {
  console.log("=== Clearing filters ===");

  // Reset form
  $("#filterForm")[0].reset();
  $("#startDate").val("");
  $("#endDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  // implement olacaq bu
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [0, 10000]);
    $("#min-value").text("0 AZN");
    $("#max-value").text("10000 AZN");
  }

  // Clear filters
  currentFilters = {};

  // Reload DataTable
  if (dataTable) {
    console.log("Reloading DataTable after clearing filters...");
    dataTable.ajax.reload(function (json) {
      console.log("DataTable clear and reload completed");
    }, true);
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function performSearch() {
  if (dataTable) {
    dataTable.ajax.reload();
  }
}

// Debounced versiyon
const debouncedSearch = debounce(performSearch, 300);

// Search inputuna event listener
$("#customSearch").on("keyup", function () {
  debouncedSearch();
});

// Sehifeler arasi kecid GO button ile
$(".go-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".page-input");
  let pageNumber = parseInt(pageInput.val());

  // Input sahəsini hər halda təmizləyirik
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (dataTable) {
      const pageInfo = dataTable.page.info();
      let dataTablePage = pageNumber - 1;

      if (dataTablePage < pageInfo.pages) {
        // Səhifə mövcuddursa, keçid edir
        dataTable.page(dataTablePage).draw("page");
      } else {
        // Səhifə mövcud deyilsə, xəta yazır
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    // Etibarsız girişdə xəta yazır
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");
  triggerElement.addEventListener("click", (e) => e.stopPropagation());
  dropdown.addEventListener("click", (e) => e.stopPropagation());
  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");

  // Xaricə kliklənəndə bağla
  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// Tesdiq Modal functions
window.openTesdiqModal = function (es) {
  if ($("#tesdiqModal").hasClass("hidden")) {
    $("#tesdiqModal").removeClass("hidden");
    $('#qaimeid_approve').html(es);
  } else {
    $("#tesdiqModal").addClass("hidden");
  }
};

window.closeTesdiqModal = function () {
  $("#tesdiqModal").addClass("hidden");
};

// Confirm Moda functions
window.openConfirmModal = async function () {
  const qaimeId = $('#qaimeid_approve').html();
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  try {
    const resp = await fetch(`/emeliyyatlar/sirket/eqaime/${qaimeId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ qaime_id: qaimeId }),
    });

    const json = await resp.json();
    closeTesdiqModal();

    if (resp.ok) {
      alertModal(json.message);
      setTimeout(() => {
              window.location.reload();
            }, 2000);
    } else {
      alertModal(json.error || json.message, 'error');
    }

    if (dataTable) dataTable.ajax.reload(null, false);

  } catch (e) {
    console.error(e);
    closeTesdiqModal();
    alertModal('Bir hata oluştu', 'error');
  }
};

window.closeConfirmModal = function () {
  $("#confirmModal").addClass("hidden");
};
