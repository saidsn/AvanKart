// Şirkət Kartları JavaScript
console.log("🚀 Sirket Kartlari page loaded");

$(document).ready(function () {
  console.log("📋 Document ready, initializing...");

  // Check if DataTable is loaded
  if (typeof $.fn.DataTable === "undefined") {
    console.error(
      "❌ DataTables is not loaded! Make sure to include DataTables JS file."
    );
    return;
  }

  console.log("✅ DataTables is loaded successfully");

  // Initialize DataTable
  let cardsTable = null;
  let currentFilters = {
    minEmployeeCount: "",
    maxEmployeeCount: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  };

  // Get company ID from URL
  const companyId = window.location.pathname.split("/").pop();

  // Initialize DataTable
  function initializeTable() {
    console.log("🔄 Initializing Cards DataTable...");

    if (cardsTable) {
      cardsTable.destroy();
    }

    cardsTable = $("#cardsTable").DataTable({
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
        emptyTable: "Heç bir kart tapılmadı",
      },
      ajax: {
        url: `/emeliyyatlar/sirket/kartlari/${companyId}/data`,
        type: "POST",
        headers: {
          "CSRF-Token": $('meta[name="csrf-token"]').attr("content") || "",
        },
        data: function (d) {
          console.log("📤 Sending AJAX data:", d);
          return {
            ...d,
            minEmployeeCount: currentFilters.minEmployeeCount,
            maxEmployeeCount: currentFilters.maxEmployeeCount,
            minAmount: currentFilters.minAmount,
            maxAmount: currentFilters.maxAmount,
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
          };
        },
        dataSrc: function (json) {
          console.log("📥 Received response:", json);

          // Update company info and statistics
          updateCompanyInfo(json.company);
          updateCardStatistics(json.statistics);
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
          data: "card_name",
          name: "card_name",
          render: function (data, type, row) {
            // Get card icon and background color

            return (
              '<div class="flex items-center gap-0 py-2">' +
              '<div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[13px]" style="background-color:;">' +
              '<div class="icon"></div>' +
              "</div>" +
              "<div>" +
              '<div class="font-medium text-[13px] text-messages dark:text-white">' +
              (data || "Bilinməyən Kart") +
              "</div>" +
              (row.card_description
                ? '<div class="text-[11px] text-secondary-text dark:text-secondary-text-color-dark">' +
                  row.card_description +
                  "</div>"
                : "") +
              "</div>" +
              "</div>"
            );
          },
        },
        {
          data: "employee_count",
          name: "employee_count",
          className: "text-center",
          render: function (data, type, row) {
            return (
              '<span class="text-[13px] text-messages dark:text-white font-medium">' +
              data +
              "</span>"
            );
          },
        },
        {
          data: "amount",
          name: "amount",
          className: "text-right",
          render: function (data, type, row) {
            return (
              '<span class="font-semibold text-[13px] text-messages dark:text-white">' +
              (row.formatted_amount || data) +
              " AZN</span>"
            );
          },
        },
        {
          data: "date",
          name: "date",
          className: "text-center",
          render: function (data, type, row) {
            return (
              '<span class="text-[13px] text-secondary-text dark:text-secondary-text-color-dark">' +
              (row.formatted_date || data) +
              "</span>"
            );
          },
        },
        {
          data: "_id",
          name: "actions",
          orderable: false,
          className: "text-center",
          render: function (data, type, row) {
            return (
              '<div class="flex items-center justify-center gap-2">' +
              "<button onclick=\"viewCardDetails('" +
              data +
              '\')" class="p-2 text-messages dark:text-white hover:bg-surface dark:hover:bg-surface-dark rounded-lg transition-colors" title="Kart detalları">' +
              '<div class="icon stratis-arrow-right-01"></div>' +
              "</button>" +
              "</div>"
            );
          },
        },
      ],
      order: [[3, "desc"]], // Sort by date descending
      drawCallback: function () {
        // Style the table rows to match the design
        $("#cardsTable tbody tr").each(function () {
          $(this).addClass(
            "border-b border-stroke dark:border-[#FFFFFF1A] hover:bg-surface-bright dark:hover:bg-surface-bright-dark"
          );
          $(this).find("td").addClass("py-4 px-4 first:pl-4 last:pr-4");
        });

        // Add click event to rows
        $("#cardsTable tbody tr")
          .off("click")
          .on("click", function (e) {
            // Skip if clicked on action buttons
            if ($(e.target).closest("button, .icon").length > 0) {
              return;
            }

            const data = cardsTable.row(this).data();
            if (data && data._id) {
              // Redirect to card employees page using the correct route
              window.location.href = `/emeliyyatlar/sirket/kart-iscileri/${data._id}`;
            }
          });

        // Add hover effects
        $("#cardsTable tbody tr").hover(
          function () {
            $(this).addClass(
              "cursor-pointer bg-surface-bright dark:bg-surface-bright-dark"
            );
          },
          function () {
            $(this).removeClass(
              "cursor-pointer bg-surface-bright dark:bg-surface-bright-dark"
            );
          }
        );

        // Update pagination if needed
        updateCustomPagination();
      },
    });
  }

  // Update company information
  function updateCompanyInfo(company) {
    if (company) {
      // Set company logo source (if available, otherwise use default)
      const logoSrc = company.logo || "/images/default-company-logo.png";
      $("#companyLogo").attr("src", logoSrc);

      $("#companyName").text(company.name || "Unknown");
      $("#companyId").text("ID: " + (company.id || ""));
      $("#invoiceNumber").text(company.invoice_number || "");
      $("#companyDate").text(company.formatted_date || "");

      // Update status
      const statusMap = {
        active: { class: "text-[#00A3FF]", text: "● Aktiv" },
        pending: { class: "text-[#FFA100]", text: "● Gözləyir" },
        completed: { class: "text-[#32B5AC]", text: "● Tamamlandı" },
      };

      const statusInfo = statusMap[company.status] || statusMap["active"];
      $("#companyStatus")
        .attr("class", "text-[13px] font-medium " + statusInfo.class)
        .text(statusInfo.text);
    }
  }

  // Update card statistics
  function updateCardStatistics(stats) {
    console.log("📊 Updating card statistics:", stats);

    if (stats) {
      $("#cardCount").text(stats.totalCards || 0);
      $("#totalAmount").text(
        (stats.totalAmount || 0).toLocaleString("az-AZ", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + " AZN"
      );
      $("#totalCardsCount").text(stats.totalCards || 0);
    }
  }

  // Custom pagination update
  function updateCustomPagination() {
    if (cardsTable) {
      const info = cardsTable.page.info();
      $("#pageCount").text(info.page + 1 + " / " + (info.pages || 1));

      // Update pagination controls
      const paginationContainer = $("#customPagination");
      paginationContainer.empty();

      if (info.pages > 1) {
        // Previous button
        if (info.page > 0) {
          paginationContainer.append(
            '<button class="pagination-btn prev-btn" onclick="navigatePage(' +
              (info.page - 1) +
              ')">' +
              '<div class="icon stratis-arrow-left-01"></div>' +
              "</button>"
          );
        }

        // Page numbers
        for (
          let i = Math.max(0, info.page - 2);
          i <= Math.min(info.pages - 1, info.page + 2);
          i++
        ) {
          const isActive = i === info.page;
          paginationContainer.append(
            '<button class="pagination-btn ' +
              (isActive ? "active" : "") +
              '" onclick="navigatePage(' +
              i +
              ')">' +
              (i + 1) +
              "</button>"
          );
        }

        // Next button
        if (info.page < info.pages - 1) {
          paginationContainer.append(
            '<button class="pagination-btn next-btn" onclick="navigatePage(' +
              (info.page + 1) +
              ')">' +
              '<div class="icon stratis-arrow-right-01"></div>' +
              "</button>"
          );
        }
      }
    }
  }

  // Search functionality
  $("#customSearch").on("keyup", function () {
    if (cardsTable) {
      cardsTable.search(this.value).draw();
    }
  });

  // Filter modal
  window.openFilterModal = function () {
    $("#cardsFilterModal").removeClass("hidden").addClass("flex");
  };

  $("#closeCardsFilterModal").on("click", function () {
    $("#cardsFilterModal").removeClass("flex").addClass("hidden");
  });

  // Apply filters
  $("#applyCardsFiltersBtn").on("click", function () {
    currentFilters.minEmployeeCount = $("#minEmployeeCount").val();
    currentFilters.maxEmployeeCount = $("#maxEmployeeCount").val();
    currentFilters.minAmount = $("#minAmount").val();
    currentFilters.maxAmount = $("#maxAmount").val();
    currentFilters.startDate = $("#startDate").val();
    currentFilters.endDate = $("#endDate").val();

    if (cardsTable) {
      cardsTable.ajax.reload();
    }

    $("#cardsFilterModal").removeClass("flex").addClass("hidden");
  });

  // Clear filters
  $("#clearCardsFiltersBtn").on("click", function () {
    currentFilters = {
      minEmployeeCount: "",
      maxEmployeeCount: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    };

    // Clear form
    $("#minEmployeeCount").val("");
    $("#maxEmployeeCount").val("");
    $("#minAmount").val("");
    $("#maxAmount").val("");
    $("#startDate").val("");
    $("#endDate").val("");

    if (cardsTable) {
      cardsTable.ajax.reload();
    }
  });

  // Close modal on background click
  $("#cardsFilterModal").on("click", function (e) {
    if (e.target === this) {
      $(this).removeClass("flex").addClass("hidden");
    }
  });

  // GO button functionality for page navigation
  $(".go-button").on("click", function () {
    const pageInput = $(".page-input").val();
    if (pageInput && cardsTable) {
      const pageNum = parseInt(pageInput) - 1; // Convert to 0-based index
      const info = cardsTable.page.info();

      if (pageNum >= 0 && pageNum < info.pages) {
        cardsTable.page(pageNum).draw("page");
      }
    }
  });

  // Enter key support for page input
  $(".page-input").on("keypress", function (e) {
    if (e.which === 13) {
      // Enter key
      $(".go-button").click();
    }
  });

  // Initialize table on page load
  initializeTable();
});

// Global functions
window.viewCardDetails = function (cardId) {
  console.log("View card details:", cardId);
  // Redirect to card details page
  window.location.href = "/emeliyyatlar/sirket/kart/" + cardId;
};

window.refreshPage = function () {
  if (typeof cardsTable !== "undefined" && cardsTable) {
    cardsTable.ajax.reload(null, false);
  } else {
    window.location.reload();
  }
};

// Navigate to specific page
window.navigatePage = function (page) {
  if (typeof cardsTable !== "undefined" && cardsTable) {
    cardsTable.page(page).draw("page");
  }
};
