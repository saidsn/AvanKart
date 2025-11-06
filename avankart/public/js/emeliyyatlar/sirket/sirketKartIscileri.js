// Kart İşçiləri JavaScript
console.log("Sirket Kart Iscileri page loaded");

$(document).ready(function () {
  // Initialize DataTable
  let employeesTable = null;
  let currentFilters = {
    positionGroup: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  };

  // Get card ID from URL
  const cardId = window.location.pathname.split("/")[3];

  // Initialize DataTable
  function initializeTable() {
    if (employeesTable) {
      employeesTable.destroy();
    }

    employeesTable = $("#cardEmployeesTable").DataTable({
      processing: true,
      serverSide: true,
      pageLength: 10,
      lengthMenu: [
        [10, 25, 50, 100],
        [10, 25, 50, 100],
      ],
      language: {
        url: "/js/datatables/az.json",
        processing:
          '<div class="flex items-center justify-center p-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><span class="ml-3">Məlumatlar yüklənir...</span></div>',
      },
      ajax: {
        url: `/emeliyyatlar/sirket/kart-iscileri/${cardId}/data`,
        type: "POST",
        headers: {
          "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
        },
        data: function (d) {
          return {
            ...d,
            positionGroup: currentFilters.positionGroup,
            minAmount: currentFilters.minAmount,
            maxAmount: currentFilters.maxAmount,
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
          };
        },
      },
      columns: [
        {
          data: "employee_id",
          name: "employee_id",
          render: function (data, type, row) {
            return `<span class="font-mono text-sm text-primary dark:text-primary-dark font-medium">${data}</span>`;
          },
        },
        {
          data: "employee_name",
          name: "employee_name",
          render: function (data, type, row) {
            return `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-surface dark:bg-surface-dark rounded-full flex items-center justify-center text-messages dark:text-primary-text-color-dark font-bold text-sm">
                                    ${data
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                </div>
                                <div>
                                    <div class="font-medium text-messages dark:text-primary-text-color-dark">${data}</div>
                                </div>
                            </div>
                        `;
          },
        },
        {
          data: "position",
          name: "position",
          render: function (data, type, row) {
            return `<span class="text-sm text-messages dark:text-primary-text-color-dark">${data}</span>`;
          },
        },
        {
          data: "position_group",
          name: "position_group",
          render: function (data, type, row) {
            let groupClass = "";
            let groupText = "";
            switch (data) {
              case "manager":
                groupClass =
                  "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
                groupText = "Rəhbər";
                break;
              case "staff":
                groupClass =
                  "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
                groupText = "İşçi";
                break;
              case "supervisor":
                groupClass =
                  "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
                groupText = "Nəzarətçi";
                break;
              default:
                groupClass =
                  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
                groupText = data;
            }
            return `<span class="px-2.5 py-1 rounded-full text-xs font-medium ${groupClass}">${groupText}</span>`;
          },
        },
        {
          data: "amount",
          name: "amount",
          className: "text-right",
          render: function (data, type, row) {
            const amount = parseFloat(data);
            const colorClass =
              amount > 0
                ? "text-messages dark:text-primary-text-color-dark"
                : "text-red-600 dark:text-red-400";
            return `<span class="font-semibold ${colorClass}">${row.formatted_amount} AZN</span>`;
          },
        },
        {
          data: "date",
          name: "date",
          render: function (data, type, row) {
            return `<span class="text-sm text-messages dark:text-primary-text-color-dark">${row.formatted_date}</span>`;
          },
        },
        {
          data: "_id",
          name: "actions",
          orderable: false,
          className: "text-center",
          render: function (data, type, row) {
            return `
                            <div class="flex items-center justify-center gap-2">
                                <button onclick="viewEmployeeDetails('${data}')" class="p-2 text-primary dark:text-primary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="İşçi detalları">
                                    <div class="icon stratis-eye"></div>
                                </button>
                                <button onclick="editEmployeeBalance('${data}')" class="p-2 text-primary dark:text-primary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Balansı düzəlt">
                                    <div class="icon stratis-edit-02"></div>
                                </button>
                                <button onclick="viewEmployeeTransactions('${data}')" class="p-2 text-primary dark:text-primary-dark hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Tranzaksiyalar">
                                    <div class="icon stratis-receipt"></div>
                                </button>
                            </div>
                        `;
          },
        },
      ],
      order: [[5, "desc"]], // Sort by date descending
      drawCallback: function () {
        // Add hover effects
        $("#cardEmployeesTable tbody tr").hover(
          function () {
            $(this).addClass("bg-surface-bright dark:bg-surface-bright-dark");
          },
          function () {
            $(this).removeClass(
              "bg-surface-bright dark:bg-surface-bright-dark"
            );
          }
        );
      },
    });
  }

  // Search functionality
  $("#searchEmployeesInput").on("keyup", function () {
    if (employeesTable) {
      employeesTable.search(this.value).draw();
    }
  });

  // Refresh button
  $("#refreshEmployeesBtn").on("click", function () {
    if (employeesTable) {
      employeesTable.ajax.reload(null, false);
    }
  });

  // Filter modal
  $("#filterEmployeesBtn").on("click", function () {
    $("#employeesFilterModal").removeClass("hidden").addClass("flex");
  });

  $("#closeEmployeesFilterModal").on("click", function () {
    $("#employeesFilterModal").removeClass("flex").addClass("hidden");
  });

  // Apply filters
  $("#applyEmployeesFiltersBtn").on("click", function () {
    currentFilters.positionGroup = $("#positionGroupFilter").val();
    currentFilters.minAmount = $("#minEmployeeAmount").val();
    currentFilters.maxAmount = $("#maxEmployeeAmount").val();
    currentFilters.startDate = $("#employeesStartDate").val();
    currentFilters.endDate = $("#employeesEndDate").val();

    if (employeesTable) {
      employeesTable.ajax.reload();
    }

    $("#employeesFilterModal").removeClass("flex").addClass("hidden");
  });

  // Clear filters
  $("#clearEmployeesFiltersBtn").on("click", function () {
    currentFilters = {
      positionGroup: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    };

    // Clear form
    $("#positionGroupFilter").val("");
    $("#minEmployeeAmount").val("");
    $("#maxEmployeeAmount").val("");
    $("#employeesStartDate").val("");
    $("#employeesEndDate").val("");

    if (employeesTable) {
      employeesTable.ajax.reload();
    }
  });

  // Close modal on background click
  $("#employeesFilterModal").on("click", function (e) {
    if (e.target === this) {
      $(this).removeClass("flex").addClass("hidden");
    }
  });

  // Initialize table on page load
  initializeTable();
});

// Global functions
window.viewEmployeeDetails = function (employeeId) {
  console.log("View employee details:", employeeId);
  // Implement employee details modal
  alert(`İşçi detalları: ${employeeId}`);
};

window.editEmployeeBalance = function (employeeId) {
  console.log("Edit employee balance:", employeeId);
  // Implement balance editing modal
  alert(`Balansı düzəlt: ${employeeId}`);
};

window.viewEmployeeTransactions = function (employeeId) {
  console.log("View employee transactions:", employeeId);
  // Implement transactions viewing
  alert(`İşçi tranzaksiyaları: ${employeeId}`);
};
