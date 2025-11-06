$(document).ready(function () {
  // Updated data structure to match the image
  const myData = [
    {
      id: "card-001",
      category: "Yemək kartı",
      employeeCount: 24,
      amount: 125.5,
      date: "01.12.2023 08:20",
      isHidden: false,
    },
    {
      id: "card-002",
      category: "Hediyyə kartı",
      employeeCount: 12,
      amount: 500.0,
      date: "01.12.2023 08:20",
      isHidden: false,
    },
    {
      id: "card-003",
      category: "Yanacaq kartı",
      employeeCount: 36,
      amount: 350.0,
      date: "01.12.2023 08:20",
      isHidden: false,
    },
    {
      id: "card-004",
      category: "Market kartı",
      employeeCount: 40,
      amount: 220.0,
      date: "01.12.2023 08:20",
      isHidden: false,
    },
    {
      id: "card-005",
      category: "Biznes kartı",
      employeeCount: 10,
      amount: 800.0,
      date: "01.12.2023 08:20",
      isHidden: false,
    },
    {
      id: "card-006",
      category: "Premium kartı",
      employeeCount: 150,
      amount: 600.0,
      date: "01.12.2023 08:20",
      isHidden: false,
    },
    {
      id: "card-007",
      category: "Avto Yuma kartı",
      employeeCount: 56,
      amount: 3650.0,
      date: "01.12.2023 08:20",
      isHidden: false,
    },
  ];

  var activeData = myData;

  var table = $("#myTable").DataTable({
    paging: false,
    info: false,
    searching: true, // Make sure searching is enabled
    ordering: false,
    dom: "t",
    data: activeData,
    columns: [
      {
        data: "category", // Define searchable data property
        render: function (data, type, row) {
          // For search/sort, return plain text
          if (type === 'display') {
            const opacity = row.isHidden ? 'opacity-50' : '';
            const lineThrough = row.isHidden ? 'line-through' : '';
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal ${opacity} ${lineThrough}">${data}</span>`;
          }
          return data; // Return plain data for search/sort
        },
      },
      {
        data: "employeeCount", // Define searchable data property
        render: function (data, type, row) {
          if (type === 'display') {
            const opacity = row.isHidden ? 'opacity-50' : '';
            const lineThrough = row.isHidden ? 'line-through' : '';
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal ${opacity} ${lineThrough}">${data}</span>`;
          }
          return data;
        },
      },
      {
        data: "amount", // Define searchable data property
        render: function (data, type, row) {
          if (type === 'display') {
            const opacity = row.isHidden ? 'opacity-50' : '';
            const lineThrough = row.isHidden ? 'line-through' : '';
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal ${opacity} ${lineThrough}">${data.toFixed(2)} ₼</span>`;
          }
          return data; // Return numeric value for search
        },
      },
      {
        data: "date", // Define searchable data property
        render: function (data, type, row) {
          if (type === 'display') {
            const opacity = row.isHidden ? 'opacity-50' : '';
            const lineThrough = row.isHidden ? 'line-through' : '';
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal ${opacity} ${lineThrough}">${data}</span>`;
          }
          return data;
        },
      },
      {
        data: null, // Not searchable
        searchable: false, // Explicitly disable search for this column
        render: function (data, type, row, meta) {
          if (type === 'display') {
            const eyeClass = row.isHidden ? 'iconex-hide-1' : 'iconex-eye-1';
            const eyeOpacity = row.isHidden ? 'opacity-30' : 'opacity-100';

            return `
              <div class="flex justify-center">
                <span id="eye-${meta.row}" onclick="toggleRowVisibility(${meta.row})"
                      class="icon ${eyeClass} cursor-pointer text-messages ${eyeOpacity} !w-[18px] !h-[18px]"></span>
              </div>
            `;
          }
          return ''; // Return empty for search
        },
        width: "60px",
      },
    ],
    order: [],
    lengthChange: false,

    createdRow: function (row, data, dataIndex) {
      // Apply red line through effect if row is hidden
      if (data.isHidden) {
        $(row).addClass("row-hidden");
        $(row).css({
          position: "relative",
        });
      }

      // Hover effect
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (!data.isHidden) {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          }
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      // Border styling
      $(row)
        .find("td")
        .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

      $(row).find("td:not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      // Last column (eye column) styling with left border
      $(row)
        .find("td:last-child")
        .css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        })
        .addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]");

      // Add red line overlay that crosses the entire row AFTER row creation
      if (data.isHidden) {
        setTimeout(() => {
          const tableWidth = $("#myTable").outerWidth();
          $(row).append(`
            <div style="position: absolute; top: 50%; left: 0; width: ${tableWidth}px; height: 2px; background-color: #ef4444; z-index: 10; pointer-events: none; transform: translateY(-50%);"></div>
          `);
        }, 10);
      }
      $(row).on("click", "td", function (e) {
        if ($(e.target).is("input, button, a, label")) return;

        // Məlumatları localStorage-a göndər
        localStorage.setItem("selectedInvoice", JSON.stringify(data));

        // Yeni səhifəyə yönləndir
        window.location.href = "./iscilerinBalansiYemek.html";
      });
    },

    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Add left border to last header column
      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid var(--table-border-color)",
      });

      // Filter icons
      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-on-primary-dark"></div></div>'
        );
      });
    },

    drawCallback: function () {
      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);

      // Ensure last row has bottom border
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      if ($lastRow.length > 0) {
        // Remove any existing border classes and add them back to ensure they stick
        $lastRow.find("td").removeClass("border-b-[.5px]").addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

        // Ensure the last row's bottom border is visible by adding inline style as backup
        $lastRow.find("td").css("border-bottom", "0.5px solid rgba(0,0,0,0.1)");

        // Dark mode border for last row
        if ($("html").hasClass("dark")) {
          $lastRow.find("td").css("border-bottom", "0.5px solid rgba(255,255,255,0.1)");
        }

        // Ensure left border on last column of the last row (eye column)
        $lastRow.find("td:last-child").addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]");
        $lastRow.find("td:last-child").css("border-left", "0.5px solid rgba(0,0,0,0.1)");

        // Dark mode left border for last column of last row
        if ($("html").hasClass("dark")) {
          $lastRow.find("td:last-child").css("border-left", "0.5px solid rgba(255,255,255,0.1)");
        }
      }
    },
  });

  // Toggle row visibility function
  window.toggleRowVisibility = function (rowIndex) {
    const data = table.row(rowIndex).data();
    data.isHidden = !data.isHidden;

    // Update the data in the table
    table.row(rowIndex).data(data).draw(false);

    // Add red line for hidden rows after redraw
    if (data.isHidden) {
      setTimeout(() => {
        const row = table.row(rowIndex).node();
        const $row = $(row);
        const tableWidth = $("#myTable").outerWidth();
        const rowHeight = $row.outerHeight();

        $row.find(".red-line").remove(); // Remove existing line
        $row.css("position", "relative");

        $row.append(`
          <div class="red-line" style="position: absolute; top: ${
            rowHeight / 2
          }px; left: 0; width: ${tableWidth}px; height: 2px; background-color: #ef4444; z-index: 10; pointer-events: none; transform: translateY(-1px);"></div>
        `);
      }, 50);
    } else {
      // Remove red line when showing row
      const row = table.row(rowIndex).node();
      $(row).find(".red-line").remove();
    }
  };

  // Enhanced search functionality
  $("#customSearch").on("keyup", function () {
    const searchValue = this.value;
    table.search(searchValue).draw();
  });

  // Alternative: Custom search function for more control
  // Uncomment this if you want more sophisticated search
  /*
  $.fn.dataTable.ext.search.push(
    function(settings, data, dataIndex) {
      const searchTerm = $("#customSearch").val().toLowerCase();
      if (!searchTerm) return true;

      // Get the actual row data
      const rowData = table.row(dataIndex).data();

      // Search in category, employeeCount, amount, and date
      const searchableText = [
        rowData.category,
        rowData.employeeCount.toString(),
        rowData.amount.toString(),
        rowData.date
      ].join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    }
  );

  $("#customSearch").on("keyup", function () {
    table.draw();
  });
  */
});
