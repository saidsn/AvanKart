$(document).ready(function () {
  // Updated data structure to match the image
  var table = $("#myTable").DataTable({
    paging: false,
    info: false,
    processing: true,
    serverSide: true,
    searching: true, // Make sure searching is enabled
    ordering: false,
    dom: "t",
    ajax: {
        url: "/balances/table",
        type: "POST",
        beforeSend: function (xhr, settings) {
          const token = getCsrfToken();
          if (token) {
            xhr.setRequestHeader("X-CSRF-TOKEN", token);
          }

          if (!token) {
            $.get("/csrf-token", function (response) {
              if (response.token) {
                localStorage.setItem("csrfToken", response.token);
                xhr.setRequestHeader("X-CSRF-TOKEN", response.token);
              }
            });
          }
        },
        data: function (d) {
          return {
            draw: d.draw,   // 🔑 eksik olan kısım
            start: d.start,
            length: d.length,
            balance_id: $("#balance_idHiddIn").val(),
            search: $("#customSearch").val() || d.search.value,
            start_date: $("#startDate").val(),
            end_date: $("#endDate").val(),
            tab: $("#tabFilter").val(),
            genders: $("#genderFilter").val() ? [$("#genderFilter").val()] : [],

          };

        },
        dataSrc: function (json) {
          console.log(json.data,"evvelden")
          const rows = Array.isArray(json.data) ? json.data : [];
          $('#kartlarCountDyn').html(rows.length ?? 0);
          $("#kartSayi").html(rows.length ?? 0);
          let badgeClass = window.mapStatus($('#statusBadge').attr('data-status'));
          $('#statusBadge').addClass(badgeClass.badge)
          console.log(rows,"roww")
          return rows;
        },
        error: function (xhr, error, thrown) {
          console.error("DataTable AJAX error:", error);
          showErrorMessage("Məlumatları yüklərkən xəta baş verdi");
        },
      },
    columns: [
      {
        data: "card_name", // Define searchable data property
        
        render: function (data, type, row) {

          // For search/sort, return plain text
          if (type === 'display') {
            const opacity = row.isHidden ? 'opacity-50' : '';
            const lineThrough = row.isHidden ? 'line-through' : '';
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal ${opacity} ${lineThrough}">${data}</span>`;
          }
          return data ; // Return plain data for search/sort
        },
      },
      {
        data: "worker_count", // Define searchable data property
        render: function (data, type, row) {
          if (type === 'display') {
            const opacity = row.isHidden ? 'opacity-50' : '';
            const lineThrough = row.isHidden ? 'line-through' : '';
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal w-full flex items-start text-left ${opacity} ${lineThrough}">${data}</span>`;
          }
          return data;
        },
      },
      {
        data: "total_amount", // Define searchable data property
        render: function (data, type, row) {
          if (type === 'display') {
            const opacity = row.isHidden ? 'opacity-50' : '';
            const lineThrough = row.isHidden ? 'line-through' : '';
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal w-full flex items-start text-left  ${opacity} ${lineThrough}">${data.toFixed(2)} ₼</span>`;
          }
          return data; // Return numeric value for search
        },
      },
      {
        data: "createdAtFormatted", // Define searchable data property
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
                <span id="eye-${meta.row}" 
                      class="icon ${eyeClass} cursor-pointer text-messages ${eyeOpacity} !w-[18px] !h-[18px]"></span>
              </div>
            `;
          }
          return ''; // Return empty for search onclick="toggleRowVisibility(${meta.row})"
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


   window.confirmAvankarta = function () {
    const invoice = window.selectedInvoiceNumber;
    if (!invoice) {
      alertModal("Invoice nömrəsi yoxdur!", 'error');
      return;
    }
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    fetch("/isci/send-to-avankart", {
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
          data.message || "Avankarta göndərildi!",
          data.success ? "success" : "error"
        );
        table.ajax.reload(null, false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch((error) => {
        alertModal(error, "error");
      });

    closeAvankartaModal();
  };
  
  function closeAvankartaModal() {
    document.getElementById("avankartaModalOverlay").classList.add("hidden");
    document.getElementById("avankartaModal").classList.add("hidden");
  }

  window.confirmInvoice = function (balanceId) {
    document.getElementById("avankartaModalOverlay").classList.remove("hidden");
    document.getElementById("avankartaModal").classList.remove("hidden");
    // document.getElementById("avankartInvoice").innerText = balanceId;
    window.selectedInvoiceNumber = balanceId;
  };

  window.confirmBalance = function (balanceId) {
    document.getElementById("avankartaModalOverlay").classList.remove("hidden");
    document.getElementById("avankartaBalanceModal").classList.remove("hidden");
    // document.getElementById("avankartInvoice").innerText = balanceId;
    window.selectedInvoiceNumber = balanceId;
  };

    window.acceptDeleteInvoice  = function () {
    const invoice = window.selectedDeleteInvoiceNumber;
    if (!invoice) {
      alertModal("Invoice nömrəsi yoxdur!", 'error');
      return;
    }
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    fetch("/isci/delete-balance", {
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
          data.message || "Silindi!",
          data.success ? "success" : "error"
        );
        setTimeout(() => {
          window.location.href= '/isci/isciler-balance';
        }, 1500);
      })
      .catch((error) => {
        alertModal(error, "error");
      });

    document.getElementById("deleteInvoiceModalOverlay").classList.add("hidden");
    document.getElementById("deleteInvoiceModal").classList.add("hidden");
  };

  window.deleteInvoice = function (balanceId) {
    document.getElementById("deleteInvoiceModalOverlay").classList.remove("hidden");
    document.getElementById("deleteInvoiceModal").classList.remove("hidden");
    // document.getElementById("avankartInvoice").innerText = balanceId;
    window.selectedDeleteInvoiceNumber = balanceId;
  };

  $("#refreshPage").on("click", function (e) {
    table.ajax.reload(null, false);
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

  window.mapStatus = function (raw) {
    const s = String(raw || "").toLowerCase();
    if (s === "active" || s === "aktiv")
      return { badge: "bg-[#4FC3F7]", text: "active" };
    if (s === "passive" || s === "gözləyir" || s === "waiting")
      return { badge: "bg-[#FFA100]", text: "gözləyir" };
    if (s === "completed") return { badge: "bg-[#32B5AC]", text: "tamamlandı" };
    if (s === "canceled") return { badge: "bg-[#EF5350]", text: "ləğv edilib" };
    return { badge: "bg-[#BDBDBD]", text: "naməlum" };
  }
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
