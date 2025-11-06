$(document).ready(function () {
  // Check if DataTable is loaded
  if (typeof $.fn.DataTable === "undefined") {
    console.error(
      "❌ DataTables is not loaded! Make sure to include DataTables JS file."
    );
    return;
  }

  // Initialize DataTable
  let companiesTable = null;
  let currentFilters = {
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
    status: [],
  };

  // Initialize DataTable
  function initializeTable() {
    if (companiesTable) {
      companiesTable.destroy();
    }

    companiesTable = $("#myTable").DataTable({
      processing: true,
      serverSide: true,
      pageLength: 10,
      lengthMenu: [
        [10, 25, 50, 100],
        [10, 25, 50, 100],
      ],
      searching: false,
      lengthChange: false,
      info: false,
      language: {
        processing: "Məlumatlar yüklənir...",
        emptyTable: "Heç bir məlumat tapılmadı",
      },
      ajax: {
        url: "/emeliyyatlar/sirket/isciler/data",
        type: "POST",
        headers: {
          "CSRF-Token": $('meta[name="csrf-token"]').attr("content") || "",
        },
        data: function (d) {
          return {
            ...d,
            minAmount: currentFilters.minAmount,
            maxAmount: currentFilters.maxAmount,
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
            status: currentFilters.status,
          };
        },
        dataSrc: function (json) {
          // Update statistics and title
          updateStatistics(json.statistics);
          return json.data;
        },
        error: function (xhr, error, thrown) {
          console.error("❌ AJAX Error:", error, thrown);
          console.error("Response:", xhr.responseText);
          console.error("Status:", xhr.status);
        },
      },
      columns: [
        {
          data: "company_name",
          name: "company_name",
          // render: function (data, type, row) {
          //   return `
          //                   <div class="flex items-center gap-3">
          //                       <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
          //                           ${(typeof data === "string" ? data : "").substr(0, 2).toUpperCase()}
          //                       </div>
          //                       <div>
          //                           <div class="font-medium text-[13px] text-messages dark:text-white">${data}</div>
          //                           <div class="text-[11px] text-secondary-text dark:text-secondary-text-color-dark">${row.company_id}</div>
          //                       </div>
          //                   </div>
          //               `;
          // },
          render: function (data, type, row) {
            return `
              <div class="flex justify-center items-center gap-2.5">
                  <div class="flex justify-center items-center">
                      <div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">
                          <img src="${row.company_logo}" class="object-cover" alt="Logo">
                      </div>
                  </div>
                  <div class="w-full">
                      <div class="text-[13px] font-medium">${data}</div>
                      <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${row.company_id}</span></div>
                  </div>
              </div>
            `;
          },
        },
        {
          data: "invoice_number",
          name: "invoice_number",
          render: function (data, type, row) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "card_count",
          name: "card_count",
          className: "text-center",
          render: function (data, type, row) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span> "
            );
          },
        },
        {
          data: "amount",
          name: "amount",
          className: "text-right",
          render: function (data, type, row) {
            // return `<span class="font-semibold text-[13px] text-messages dark:text-white">${row.formatted_amount} AZN</span>`;
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (row.formatted_amount + "AZN" || "—") +
              "</span> "
            );
          },
        },
        {
          data: "date",
          name: "date",
          render: function (data, type, row) {
            // return `<span class="text-[13px] text-secondary-text dark:text-secondary-text-color-dark">${row.formatted_date}</span>`;
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.formatted_date}</span>`;
          },
        },
        {
          data: function (row) {
            let color = "";
            let statusText = "";

            switch (row.status) {
              case "completed":
                color = "bg-[#66BB6A]"; // green
                statusText = "Tamamlandı";
                break;
              case "pending":
                color = "bg-[#FFCA28]"; // yellow
                statusText = "Gözləyir";
                break;
              case "active":
                color = "bg-[#00A3FF]"; // blue
                statusText = "Aktiv";
                break;
              default:
                color = "bg-[#BDBDBD]"; // gray
                statusText = row.status || "Bilinmir";
            }

            return `
                   <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                      <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                      <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${statusText}</span>
                  </div>
                  `;
          },
        },
        {
          data: function () {
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
                      <div onclick="openTesdiqModal()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
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
      order: [[4, "desc"]], // Sort by date descending
      drawCallback: function () {
        // Add click event to rows
        $("#myTable tbody tr")
          .off("click")
          .on("click", function (e) {
            // Skip if clicked on action buttons
            if ($(e.target).closest("button, .icon").length > 0) {
              return;
            }

            const data = companiesTable.row(this).data();
            if (data && data.sirket_id) {
              // Redirect to company cards page using sirket_id
              window.location.href = `/emeliyyatlar/sirket/kartlari/${data.sirket_id}`;
            }
          });

        // Add hover effects
        $("#myTable tbody tr").hover(
          function () {
            $(this).addClass(
              "bg-surface-bright dark:bg-surface-bright-dark cursor-pointer"
            );
          },
          function () {
            $(this).removeClass(
              "bg-surface-bright dark:bg-surface-bright-dark cursor-pointer"
            );
          }
        );
      },
    });

    document.getElementById("totalCompaniesCount").innerText = (
      stats.totalAmount || 0
    ).toLocaleString("az-AZ");
  }

  // Update statistics
  function updateStatistics(stats) {
    if (stats) {
      $("#activeCompanies").text(stats.activeCompanies || 0);
      $("#pendingCompanies").text(stats.pendingCompanies || 0);
      $("#completedCompanies").text(stats.completedCompanies || 0);
      $("#totalAmount").text(
        (stats.totalAmount || 0).toLocaleString("az-AZ", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " AZN"
      );
    }
  }

  // Search functionality
  $("#searchSirketInput").on("keyup", function () {
    if (companiesTable) {
      companiesTable.search(this.value).draw();
    }
  });

  // Refresh button
  $("#refreshSirketBtn").on("click", function () {
    if (companiesTable) {
      companiesTable.ajax.reload(null, false);
    }
  });

  // Filter modal
  $("#filterSirketBtn").on("click", function () {
    $("#sirketFilterModal").removeClass("hidden").addClass("flex");
  });

  $("#closeSirketFilterModal").on("click", function () {
    $("#sirketFilterModal").removeClass("flex").addClass("hidden");
  });

  // Apply filters
  $("#applySirketFiltersBtn").on("click", function () {
    // Get selected statuses
    const selectedStatuses = [];
    $('input[type="checkbox"]:checked').each(function () {
      selectedStatuses.push($(this).val());
    });

    currentFilters.minAmount = $("#minSirketAmount").val();
    currentFilters.maxAmount = $("#maxSirketAmount").val();
    currentFilters.startDate = $("#sirketStartDate").val();
    currentFilters.endDate = $("#sirketEndDate").val();
    currentFilters.status = selectedStatuses;

    if (companiesTable) {
      companiesTable.ajax.reload();
    }

    $("#sirketFilterModal").removeClass("flex").addClass("hidden");
  });

  // Clear filters
  $("#clearSirketFiltersBtn").on("click", function () {
    currentFilters = {
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
      status: [],
    };

    // Clear form
    $("#minSirketAmount").val("");
    $("#maxSirketAmount").val("");
    $("#sirketStartDate").val("");
    $("#sirketEndDate").val("");
    $('input[type="checkbox"]').prop("checked", false);

    if (companiesTable) {
      companiesTable.ajax.reload();
    }
  });

  // Close modal on background click
  $("#sirketFilterModal").on("click", function (e) {
    if (e.target === this) {
      $(this).removeClass("flex").addClass("hidden");
    }
  });

  // Initialize table on page load
  initializeTable();

  // Check if DataTable is loaded
  if (typeof $.fn.DataTable === "undefined") {
    console.error(
      "❌ DataTables is not loaded! Make sure to include DataTables JS file."
    );
    return;
  }
});

// Global functions
window.viewCompanyDetails = function (companyId) {
  // Redirect to company cards page
  window.location.href = `/emeliyyatlar/sirket/kartlari/${companyId}`;
};

window.refreshPage = function () {
  window.location.reload();
};
