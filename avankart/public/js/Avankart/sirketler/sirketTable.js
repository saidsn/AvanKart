// Global dəyişənlər

let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

// Single source of truth for current status
window.currentStatus = window.currentStatus || "all";

// Helper function to set active status tab
function setActiveStatusTab(next) {
  const allowed = ["all", "active", "inactive", "deleted", "pending-delete"];
  window.currentStatus = allowed.includes(next) ? next : "all";
  $("#statusTabs [data-status]")
    .removeClass("bg-inverse-on-surface font-medium text-messages active")
    .addClass("text-tertiary-text")
    .attr("aria-selected", "false");
  $('#statusTabs [data-status="' + window.currentStatus + '"]')
    .addClass("bg-inverse-on-surface font-medium text-messages active")
    .removeClass("text-tertiary-text")
    .attr("aria-selected", "true");
}

$(document).ready(function () {
  const csrfToken = window.CSRF_TOKEN;

  // Initialize currentStatus from the active tab
  function initializeCurrentStatus() {
    const activeTab = document.querySelector(
      "#statusTabs [data-status].active, #statusTabs [data-status][aria-selected='true']"
    );
    if (activeTab) {
      window.currentStatus = activeTab.dataset.status || "all";
    } else {
      window.currentStatus = "all";
    }
    setActiveStatusTab(window.currentStatus);
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

  function initSlider() {
    // slider not used for this table data payload anymore; keep function noop
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#companiesTable")) {
      dataTable.destroy();
    }

    const $search = $("#sirket-search");
    dataTable = $("#companiesTable").DataTable({
      ajax: function (data, callback) {
        const payload = {
          ...data,
          status: window.currentStatus,
          search: { value: ($search.val() || "").trim() },
        };
        // Temporary debug (ok to keep)
        // console.log("POST /sirketler/table payload", payload);
        fetch("/sirketler/table", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "CSRF-Token": window.CSRF_TOKEN,
          },
          body: JSON.stringify(payload),
        })
          .then((r) => r.json())
          .then((jsonData) => {
            if (jsonData.counts) {
              const tabs = document.querySelectorAll(
                "#statusTabs [data-status]"
              );
              tabs.forEach((tab) => {
                const status = tab.getAttribute("data-status");
                let count = 0;

                switch (status) {
                  case "all":
                    count = jsonData.counts.all;
                    break;
                  case "active":
                    count = jsonData.counts.active;
                    break;
                  case "inactive":
                    count = jsonData.counts.inactive;
                    break;
                  case "deleted":
                    count = jsonData.counts.deleted;
                    break;
                  case "pending-delete":
                    count = jsonData.counts.pendingDelete;
                    break;
                }

                const label = tab.textContent.replace(/\(\d+\)/, "").trim();
                tab.textContent = `${label} (${count})`;
              });
            }
            callback(jsonData);
          })
          .catch((err) => {
            console.error("table load error", err);
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: [],
            });
          });
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [[3, "desc"]], // Default sort by "Son düzəliş tarixi" column (index 3) descending
      lengthChange: true,
      pageLength: 10,
      columns: [
        {
          data: function (row) {
            const img = row.logo
              ? `<img src="/images/${row.logo}" class="w-8 h-8 rounded-full object-cover"/>`
              : `<div class=\"w-8 h-8 rounded-full bg-table-hover flex items-center justify-center text-[#7F57F1] font-semibold text-xs\">${(row.name || "?").substring(0, 1)}</div>`;
            return `
              <div class="flex items-center gap-3 relative">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-table-hover text-[#7F57F1] font-semibold text-lg">
                  ${img}
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="font-medium text-[#1D222B] text-[13px]">${row.name || ""}</span>
                  <span class="text-[11px] text-[#1D222B] opacity-70 font-normal">${row.company_id || ""}</span>
                </div>
              </div>
            `;
          },
        },
        {
          data: function (row) {
            return `<span class=\"flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">${row.commission || ""}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class=\"flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">${row.email || ""}</span>`;
          },
        },
        {
          data: function (row) {
            const d = row.updated_at ? new Date(row.updated_at) : null;
            return `<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">${d ? d.toLocaleDateString() : ""}</span>`;
          },
          orderable: true,
        },
        {
          data: function (row) {
            return `<span class=\"text-[13px] text-messages dark:text-primary-text-color-dark font-normal\">${row.authorized_person || ""}</span>`;
          },
        },
        {
          data: function (row) {
            return `<span class=\"text-[13px] text-messages font-normal dark:text-white\">${row.created_by || ""}</span>`;
          },
        },
        {
          data: function (row) {
            let color = "bg-[#FF7043]";
            switch (row.status) {
              case "active":
                color = "bg-[#4FC3F7]";
                break;
              case "inactive":
                color = "bg-[#BDBDBD]";
                break;
              case "deleted":
                color = "bg-[#EF5350]";
                break;
              case "pending-delete":
                color = "bg-[#FF7043]";
                break;
            }
            const label =
              row.status === "active"
                ? "Aktiv"
                : row.status === "inactive"
                  ? "Deaktiv"
                  : row.status === "deleted"
                    ? "Silinmiş"
                    : "Silinmə üçün müraciət";
            return `
                <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${label}</span>
                </div>
            `;
          },
        },
        {
          data: function (row) {
            const id = row._id;
            const actions = [];
            actions.push(
              `<div data-row-action="open" data-id="${id}" class=\"flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer\"><span class=\"icon stratis-cursor-06 text-[13px] mt-1\"></span><span class=\"font-medium text-[#1D222B] text-[13px] whitespace-nowrap\">Aç</span></div>`
            );
            if (row.status === "active") {
              actions.push(
                `<div data-row-action="edit" data-id="${id}" class=\"flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer\"><span class=\"icon stratis-edit-03 text-[13px] mt-1\"></span><span class=\"font-medium text-[#1D222B] text-[13px] whitespace-nowrap\">Redaktə et</span></div>`
              );
              actions.push(
                `<div data-row-action="toggle" data-id="${id}" data-status="inactive" class=\"flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer\"><span class=\"icon stratis-minus-circle-contained text-error text-[13px]\"></span><span class=\"font-medium text-error text-[13px] whitespace-nowrap\">Deaktiv et</span></div>`
              );
            } else if (row.status === "inactive") {
              actions.push(
                `<div class=\"flex items-center gap-2 px-4 py-[3.5px]\"><span class=\"icon stratis-edit-03 text-tertiary-text text-[13px] mt-1\"></span><span class=\"font-medium text-tertiary-text text-[13px] whitespace-nowrap\">Redaktə et</span></div>`
              );
              actions.push(
                `<div data-row-action="toggle" data-id="${id}" data-status="active" class=\"flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover\"><span class=\"icon stratis-shield-check text-messages text-[13px]\"></span><span class=\"font-medium text-messages text-[13px] whitespace-nowrap\">Aktiv et</span></div>`
              );
            }
            actions.push('<div class="h-[.5px] bg-stroke my-1"></div>');
            actions.push(
              `<div data-row-action="request-del" data-id="${id}" class=\"flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer\"><span class=\"icon stratis-trash-01 text-error text-[13px]\"></span><span class=\"font-medium text-error text-[13px] whitespace-nowrap\">Silinmə üçün müraciət et</span></div>`
            );

            return `
              <div id="wrapper" class="relative inline-block text-left">
                <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages text-base cursor-pointer z-100"></div>
                <div class="hidden absolute right-[-12px] max-w-[244px] z-50 dropdown-menu">
                  <div class="relative h-[8px]"><div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div></div>
                  <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
                    <div class="py-[3.5px] text-sm">${actions.join("")}</div>
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
          "padding-left": "10px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        // 🔹 Növbəti səhifəyə keçid
        $(row).on("click", function (e) {
          // Sıra daxilindəki bütün hüceyrələri götür
          const lastTd = $(this).find("td").last()[0];

          // Əgər klik olunan element sonuncu td-dirsə — yönləndirmə etmə
          if (e.target === lastTd || $(e.target).closest("td")[0] === lastTd) {
            return; // Heç nə etmə
          }

          // Əks halda yönləndir
          location.href = `/sirketler/${data._id}`;
        });
      },
    });
  }

  // Initialize currentStatus and DataTable
  initializeCurrentStatus();
  initializeDataTable();

  // Status tabs: delegated click
  $("#statusTabs")
    .off("click.status")
    .on("click.status", "[data-status]", function (e) {
      e.preventDefault();
      setActiveStatusTab(this.dataset.status);
      window.reloadTable?.({ resetPage: true });
    });

  // Modal: Apply / Clear (status only)
  $("#filter-apply")
    .off("click.filter")
    .on("click.filter", function () {
      const checked = $(".status-filter:checked").first().get(0);
      setActiveStatusTab(checked ? checked.dataset.status : "all");
      window.reloadTable?.({ resetPage: true });
      // close the modal using the page's existing close method if present
      window.closeFilterModal?.();
    });

  $("#filter-clear")
    .off("click.filter")
    .on("click.filter", function () {
      $(".status-filter").prop("checked", false);
      setActiveStatusTab("all");
      window.reloadTable?.({ resetPage: true });
      // close modal if required
      window.closeFilterModal?.();
    });

  // Search + Refresh
  const $search = $("#sirket-search");
  let searchTimer;
  $search.off("input.status").on("input.status", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(
      () => window.reloadTable?.({ resetPage: true }),
      350
    );
  });

  $("#btn-refresh-table")
    .off("click.status")
    .on("click.status", function () {
      window.reloadTable?.({ resetPage: false });
    });

  // Row actions event delegation
  $(document)
    .off("click.row-actions")
    .on("click.row-actions", "[data-row-action]", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const action = this.dataset.rowAction;
      const id = this.dataset.id;
      const status = this.dataset.status;

      switch (action) {
        case "open":
          handleOpen(id);
          break;
        case "edit":
          handleEdit(id);
          break;
        case "toggle":
          handleToggleStatus(id, status);
          break;
        case "request-del":
          handleRequestDelete(id);
          break;
      }
    });

  // Edit form submission handler
  $("#editCompanyForm")
    .off("submit.edit")
    .on("submit.edit", function (e) {
      e.preventDefault();

      const companyId = $(this).data("company-id");
      if (!companyId) {
        console.error("No company ID found for edit form");
        return;
      }

      const formData = {
        sirket_name: $("#editCompanyName").val(),
        email: $("#editCompanyEmail").val(),
        commission_percentage: $("#editCommissionPercentage").val(),
        authorized_person_name: $("#editAuthorizedPersonName").val(),
        authorized_person_gender: $("#editAuthorizedPersonGender").val(),
        authorized_person_phone: $("#editAuthorizedPersonPhone").val(),
        authorized_person_phone_suffix: $(
          "#editAuthorizedPersonPhoneSuffix"
        ).val(),
        address: $("#editAddress").val(),
        description: $("#editDescription").val(),
        website: $("#editWebsite").val(),
      };

      fetch(`/sirketler/${companyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": window.CSRF_TOKEN,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok) {
            window.closeMainEditPopup?.();
            window.reloadTable?.({ resetPage: false });
          } else {
            console.error("Failed to update company:", data.message);
          }
        })
        .catch((error) => {
          console.error("Error updating company:", error);
        });
    });

  window.reloadTable = function ({ resetPage } = {}) {
    if (dataTable) {
      dataTable.ajax.reload(null, !!resetPage);
    }
  };

  // Row action handler functions
  function handleOpen(id) {
    window.location.href = `/sirketler/${id}`;
  }

  function handleEdit(id) {
    // Fetch company details and open edit modal
    fetch(`/sirketler/api/${id}`, {
      method: "GET",
      headers: {
        "CSRF-Token": window.CSRF_TOKEN,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok && data.company) {
          // Prefill the edit form with company data
          const company = data.company;
          $("#editCompanyName").val(company.sirket_name || "");
          $("#editCompanyEmail").val(
            Array.isArray(company.email)
              ? company.email[0] || ""
              : company.email || ""
          );
          $("#editCommissionPercentage").val(
            company.commission_percentage || ""
          );
          $("#editAuthorizedPersonName").val(
            company.authorized_person?.name || ""
          );
          $("#editAuthorizedPersonGender").val(
            company.authorized_person?.gender || ""
          );
          $("#editAuthorizedPersonPhone").val(
            company.authorized_person?.phone || ""
          );
          $("#editAuthorizedPersonPhoneSuffix").val(
            company.authorized_person?.phone_suffix || ""
          );
          $("#editAddress").val(company.address || "");
          $("#editDescription").val(company.description || "");
          $("#editWebsite").val(
            Array.isArray(company.website)
              ? company.website[0] || ""
              : company.website || ""
          );

          // Store the company ID for the update
          $("#editCompanyForm").data("company-id", id);

          // Open the edit modal
          window.openMainEditPopup?.();
        } else {
          console.error("Failed to fetch company details:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching company details:", error);
      });
  }

  function handleToggleStatus(id, newStatus) {
    fetch(`/sirketler/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": window.CSRF_TOKEN,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          window.reloadTable?.({ resetPage: false });
        } else {
          console.error("Failed to update company status:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error updating company status:", error);
      });
  }

  function handleRequestDelete(id) {
    fetch(`/sirketler/${id}/request-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": window.CSRF_TOKEN,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          window.reloadTable?.({ resetPage: false });
        } else {
          console.error("Failed to request company deletion:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error requesting company deletion:", error);
      });
  }
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};

// Legacy function - now handled by delegated click handler
function toggleActiveStatus(element) {
  // This function is now handled by the delegated click handler above
  // Keeping it for backward compatibility but it will be overridden by the new handler
}

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
window.toggleDropdown_creators = function () {
  const dropdown = document.getElementById("dropdown_creators");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
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

window.toggleDropdown_users = function () {
  const dropdown = document.getElementById("dropdown_users");
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
  const creatorsDropdown = document.getElementById("dropdown_creators");
  const companyDropdown = document.getElementById("dropdown_company");
  const usersDropdown = document.getElementById("dropdown_users");
  const creatorsButton = document.getElementById(
    "dropdownDefaultButton_creators"
  );
  const usersButton = document.getElementById("dropdownDefaultButton_users");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_company"
  );

  if (
    !creatorsButton.contains(event.target) &&
    !creatorsDropdown.contains(event.target)
  ) {
    creatorsDropdown.classList.add("hidden");
    creatorsDropdown.classList.remove("visible");
  }

  if (
    !companyButton.contains(event.target) &&
    !companyDropdown.contains(event.target)
  ) {
    companyDropdown.classList.add("hidden");
    companyDropdown.classList.remove("visible");
  }

  if (
    !usersButton.contains(event.target) &&
    !usersDropdown.contains(event.target)
  ) {
    usersDropdown.classList.add("hidden");
    usersDropdown.classList.remove("visible");
  }
});

// Apply filters function
window.applyFilters = function () {
  console.log("=== Applying filters ===");

  // Filterləri sıfırla
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  if (startDate) {
    currentFilters.start_date = startDate;
  }

  if (endDate) {
    currentFilters.end_date = endDate;
  }

  // creators al
  const creators = [];
  $('#dropdown_creators input[type="checkbox"]:checked').each(function () {
    const creatorId = $(this).attr("id");
    creators.push(creatorId.replace("subyekt-", ""));
  });

  if (creators.length > 0) {
    currentFilters.creators = creators;
  }

  // Subyektləri al
  const companies = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const companyId = $(this).attr("id");
    companies.push(companyId.replace("subyekt-", ""));
  });

  if (companies.length > 0) {
    currentFilters.companies = companies;
  }

  // İstifadəçiləri al
  const users = [];
  $('#dropdown_users input[type="checkbox"]:checked').each(function () {
    const userId = $(this).attr("id");
    users.push(userId.replace("istifadeci-", ""));
  });

  if (users.length > 0) {
    currentFilters.users = users;
  }

  // Kart kateqoriyalarını al
  const status = [];
  $('input[name="card_status"]:checked').each(function () {
    status.push($(this).val());
  });

  if (status.length > 0) {
    currentFilters.card_status = status;
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

function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) {
    dataTable.search(searchValue).draw();
  }
}

// Search with debounce
const debounce = (fn, wait) => {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
};

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

// Sutunlar modal functions
window.openSutunlarPopup = function () {
  if ($("#sutunlarPopup").hasClass("hidden")) {
    $("#sutunlarPopup").removeClass("hidden");
  } else {
    $("#sutunlarPopup").addClass("hidden");
  }
};

window.closeSutunlarPopup = function () {
  $("#sutunlarPopup").addClass("hidden");
};

// Aktiv modal functions
window.openAktivModal = function () {
  if ($("#aktivModal").hasClass("hidden")) {
    $("#aktivModal").removeClass("hidden");
  } else {
    $("#aktivModal").addClass("hidden");
  }
};

window.closeAktivModal = function () {
  $("#aktivModal").addClass("hidden");
};

// Tesdiq modal functions
window.openDeAktivModal = function () {
  if ($("#deAktivModal").hasClass("hidden")) {
    $("#deAktivModal").removeClass("hidden");
  } else {
    $("#deAktivModal").addClass("hidden");
  }
};

window.closeDeAktivModal = function () {
  $("#deAktivModal").addClass("hidden");
};

// Silinmə Müraciət Popup funksiyaları
window.openSilinmeMuracietPopUp = function () {
  if ($("#silinmeMuracietPopUp").hasClass("hidden")) {
    $("#silinmeMuracietPopUp").removeClass("hidden");
  } else {
    $("#silinmeMuracietPopUp").addClass("hidden");
  }
};

window.closeSilinmeMuracietPopUp = function () {
  $("#silinmeMuracietPopUp").addClass("hidden");
};

// Confirm Moda functions
window.openConfirmModal = function () {
  if ($("#confirmModal").hasClass("hidden")) {
    $("#confirmModal").removeClass("hidden");
    startCountdown();
  } else {
    $("#confirmModal").addClass("hidden");
  }
};

window.closeConfirmModal = function () {
  $("#confirmModal").addClass("hidden");
  clearInterval(countdownTimer);
};

// Confirm Moda functions
window.openEditConfirmModal = function () {
  if ($("#editConfirmModal").hasClass("hidden")) {
    $("#editConfirmModal").removeClass("hidden");
    startOtpCountdown();
  } else {
    $("#editConfirmModal").addClass("hidden");
  }
};

window.closeEditConfirmModal = function () {
  $("#editConfirmModal").addClass("hidden");
  clearInterval(countdownTimer);
};

// Mail adresi popup funksiyaları
window.openMailadressiPopup = function () {
  if ($("#mailadressiPopup").hasClass("hidden")) {
    $("#mailadressiPopup").removeClass("hidden");
  } else {
    $("#mailadressiPopup").addClass("hidden");
  }
};

window.closeMailadressiPopup = function () {
  $("#mailadressiPopup").addClass("hidden");
};

// Two-step verification popup funksiyaları
window.openTwoStepVerificationPop = function () {
  if ($("#twoStepVerificationPop").hasClass("hidden")) {
    $("#twoStepVerificationPop").removeClass("hidden");
  } else {
    $("#twoStepVerificationPop").addClass("hidden");
  }
};

window.closeTwoStepVerificationPop = function () {
  $("#twoStepVerificationPop").addClass("hidden");
};

// Silinmə Təsdiqi Popup funksiyaları
window.openSilinmeTesdiqPopUp = function () {
  if ($("#silinmeTesdiqPopUp").hasClass("hidden")) {
    $("#silinmeTesdiqPopUp").removeClass("hidden");
  } else {
    $("#silinmeTesdiqPopUp").addClass("hidden");
  }
};

window.closeSilinmeTesdiqPopUp = function () {
  $("#silinmeTesdiqPopUp").addClass("hidden");
};

// Global row action functions (for backward compatibility)
window.openCompany = function (id) {
  window.location.href = `/sirketler/${id}`;
};

window.openEditCompany = function (id) {
  // This will be handled by the event delegation system
  const editButton = document.querySelector(
    `[data-row-action="edit"][data-id="${id}"]`
  );
  if (editButton) {
    editButton.click();
  }
};

window.setCompanyStatus = function (id, status) {
  // This will be handled by the event delegation system
  const toggleButton = document.querySelector(
    `[data-row-action="toggle"][data-id="${id}"][data-status="${status}"]`
  );
  if (toggleButton) {
    toggleButton.click();
  }
};

window.requestDeleteCompany = function (id) {
  // This will be handled by the event delegation system
  const deleteButton = document.querySelector(
    `[data-row-action="request-del"][data-id="${id}"]`
  );
  if (deleteButton) {
    deleteButton.click();
  }
};
