$(document).ready(function () {
  var myData = [
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Hesablaşma Müqaviləsi",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
    // {
    //   title: "Test Müqavilə",
    //   date: "12.05.2024",
    //   time: "09:45",
    //   format: "pdf",
    //   fileName: "/images/muessise melumatlari images/uiw_file-pdf.svg",
    // },
  ];

  // Pagination variables for contractsGrid4 (first table)
  let currentPageContracts = 0;
  const itemsPerPageContracts = 8; // 4 columns x 2 rows = 8 items per page
  const totalPagesContracts = Math.ceil(myData.length / itemsPerPageContracts);

  // Function to render current page for contractsGrid4
  function renderCurrentPageContracts() {
    const $tbody = $("#contractsGrid2 tbody");
    $tbody.empty();

    const startIndex = currentPageContracts * itemsPerPageContracts;
    const endIndex = Math.min(
      startIndex + itemsPerPageContracts,
      myData.length
    );
    const currentItems = myData.slice(startIndex, endIndex);

    currentItems.forEach((row) => {
      const html = `
        <div class="rounded-[8px] py-5 px-3 flex flex-col items-center text-center w-full bg-sidebar-bg dark:bg-[#0C1418]">
          <div class="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-3 dark:bg-[#161E22] ">
            <img src="${row.fileName}" alt="PDF" class="w-6 h-6 dark:filter invert ">
          </div>
          <p class="text-[13px] font-medium text-[#1D222BA6] mb-1 dark:text-[#FFFFFFA6]">${row.title}</p>
          <p class="text-[12px] font-normal text-[#1D222B80] mb-3 dark:text-[#FFFFFF80]">${row.date} - ${row.time}</p>
          <a href="/files/contracts/hesablasma-muqavilesi.pdf" download
            class="cursor-pointer flex items-center gap-1 px-4 py-1.5 border border-[#DBE4E8] rounded-full text-[12px] text-[#1D222B] hover:text-primary bg-[#FFFFFF] transition dark:bg-[#161E22] dark:text-white dark:hover:text-[#9C78AE] dark:border-[#40484C]">
            <div class="icon stratis-download w-4 h-4 text-messages dark:text-[#FFFFFF]"></div> Yüklə
          </a>
        </div>
      `;
      $tbody.append(html);
    });

    // Update pagination info
    updatePaginationInfoContracts();
  }

  // Function to update pagination controls for contractsGrid4
  function updatePaginationInfoContracts() {
    const $pagination = $("#customPaginationContracts");
    const $pageCount = $("#pageCountContracts");

    // Update page count
    $pageCount.text(`${currentPageContracts + 1} / ${totalPagesContracts}`);

    // Clear and rebuild pagination
    $pagination.empty();

    if (totalPagesContracts === 0) {
      return;
    }

    // Previous button
    $pagination.append(`
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight cursor-pointer ${
        currentPageContracts === 0
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF]"
      }"
        ${
          currentPageContracts > 0
            ? `onclick="changeContractsPage(${currentPageContracts - 1})"`
            : ""
        }>
        <div class="icon stratis-chevron-left"></div>
      </div>
    `);

    // Page buttons
    let paginationButtons = '<div class="flex gap-2">';
    for (let i = 0; i < totalPagesContracts; i++) {
      paginationButtons += `
        <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages transition-colors duration-200
          ${
            i === currentPageContracts
              ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
              : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
          }"
          onclick="changeContractsPage(${i})">${i + 1}</button>
      `;
    }
    paginationButtons += "</div>";
    $pagination.append(paginationButtons);

    // Next button
    $pagination.append(`
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight cursor-pointer ${
        currentPageContracts === totalPagesContracts - 1
          ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
          : "text-messages dark:text-[#FFFFFF]"
      }"
        ${
          currentPageContracts < totalPagesContracts - 1
            ? `onclick="changeContractsPage(${currentPageContracts + 1})"`
            : ""
        }>
        <div class="icon stratis-chevron-right"></div>
      </div>
    `);
  }

  // Global function to change page for contractsGrid4
  window.changeContractsPage = function (page) {
    if (page >= 0 && page < totalPagesContracts) {
      currentPageContracts = page;
      renderCurrentPageContracts();
    }
  };

  // GO button functionality for contractsGrid4
  $("#contractsGrid4")
    .find(".go-button")
    .on("click", function (e) {
      // Targeted specific to contractsGrid4
      e.preventDefault();
      const pageInput = $(this).siblings(".page-input");
      const pageNumber = parseInt(pageInput.val());

      if (pageNumber && pageNumber > 0 && pageNumber <= totalPagesContracts) {
        changeContractsPage(pageNumber - 1); // 0-indexed
        pageInput.val(""); // Clear input
      }
    });

  // Enter key functionality for GO button for contractsGrid4
  $("#contractsGrid4")
    .find(".page-input")
    .on("keypress", function (e) {
      // Targeted specific to contractsGrid4
      if (e.which === 13) {
        // Enter key
        $(this).siblings(".go-button").click();
      }
    });

  // Initialize the grid
  renderCurrentPageContracts();

  // --- Start of DataTables (contractsGrid2) specific code ---
  var activeData = myData;
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  window.table = $("#myTable1").DataTable({
    paging: true,
    info: false,
    processing: true,
    serverSide: true,
    dom: "t",
    ajax: {
      url: "/muessise-info/muessise-muqavile",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      contentType: "application/json",
      data: function (d) {
        d.search = $("#customSearch2").val();
        return JSON.stringify(d);
      },
      xhrFields: {
        withCredentials: true,
        rejectUnauthorized: false,
      },
    },
    columns: [
      {
        data: function (row) {
          return `
            <div class="flex items-center gap-6 w-full">
                <div class="flex items-center gap-2 text-[14px] text-[#1D222B] dark:text-white">
                    <img src="${row.fileName}" alt="icon" class="w-5 h-5 dark:filter invert" />
                    <span>${row.title}</span>
                </div>
                <a href="/files/contracts/hesablasma-muqavilesi.pdf" download
                class="flex items-center gap-1 px-4 py-1.5 border border-[#DBE4E8] rounded-full text-[12px] text-[#1D222B] hover:text-primary bg-[#FFFFFF] transition dark:border-[#40484C] dark:bg-[#161E22] dark:text-white dark:hover:text-[#9C78AE]">
                <div class="icon stratis-download w-4 h-4 dark:text-white"></div> Yüklə
                </a>
            </div>
          `;
        },
      },
      {
        data: function (row) {
          return `
            <div class="flex flex-start text-[13px] text-[#1D222B] whitespace-nowrap dark:text-white">
                ${row.date} - ${row.time}
            </div>
          `;
        },
      },
    ],

    order: [],
    lengthChange: false,
    pageLength: 8, // Set the number of rows per page

    createdRow: function (row, data, dataIndex) {
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (document.documentElement.classList.contains("dark")) {
            $(this).css("background-color", "#242C30"); // dark gray for dark mode
          } else {
            $(this).css("background-color", "#FAFAFA"); // light gray for light mode
          }
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      const isDarkMode = document.documentElement.classList.contains("dark");
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      /// Bütün td-lərə border alt
      $(row)
        .find("td")
        .css({
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      $(row).find("td").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      // Sol td (checkbox): padding və genişliyi sıfırla, border ver
      $(row)
        .find("td:first-child")
        .addClass("border-r-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .css({
          width: "48px",
          "text-align": "center",
          "border-bottom": `0.5px solid ${borderColor}`,
        });

      // Label içində margin varsa sıfırla
      $(row).find("td:first-child label").css({
        margin: "0",
        display: "inline-flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sağ td (üç nöqtə): border ver
      $(row)
        .find("td:last-child")
        .addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]")
        .css({
          "padding-right": "0",
          "text-align": "right",
        });
    },

    initComplete: function () {
      $("#myTable1 thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      const isDarkMode = document.documentElement.classList.contains("dark");
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";

      $("#myTable1 thead th:first-child").css({
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
        "border-right": `0.5px solid ${borderColor}`,
      });

      $("#myTable1 thead th:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      $("#myTable1 thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable1 thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
        );
      });
    },

    drawCallback: function () {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination2");
      var $pageInput = $("#contractsGrid2 .page-input"); // Targeted specific to contractsGrid2
      var $goButton = $("#contractsGrid2 .go-button"); // Targeted specific to contractsGrid2

      if (pageInfo.pages === 0) {
        $pagination.empty();
        $("#pageCount2").text("0 / 0");
        return;
      }

      $("#pageCount2").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      // Spacer-row əlavə olunur
      $("#myTable1 tbody tr.spacer-row").remove();

      const colCount = $("#myTable1 thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable1 tbody").prepend(spacerRow);

      const isDarkMode = document.documentElement.classList.contains("dark");
      const borderColor = isDarkMode ? "#FFFFFF1A" : "#E0E0E0";
      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable1 tbody tr:not(.spacer-row):last");

      $lastRow.find("td:first-child").css({
        "border-right": `0.5px solid ${borderColor}`,
      });

      $lastRow.find("td:last-child").css({
        "border-left": `0.5px solid ${borderColor}`,
      });

      // Səhifələmə düymələri - Previous button
      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                  pageInfo.page === 0
                    ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
                    : "text-messages dark:text-[#FFFFFF] cursor-pointer"
                } prev-page-button">
                    <div class="icon stratis-chevron-left"></div>
                </div>
            `);

      var paginationButtons = '<div class="flex gap-2">';
      // Calculate start and end for page buttons
      let startPage = Math.max(0, pageInfo.page - 2);
      let endPage = Math.min(pageInfo.pages - 1, pageInfo.page + 2);

      // Adjust start/end if near boundaries
      if (endPage - startPage < 4) {
        if (startPage === 0) {
          endPage = Math.min(pageInfo.pages - 1, startPage + 4);
        } else if (endPage === pageInfo.pages - 1) {
          startPage = Math.max(0, endPage - 4);
        }
      }

      for (var i = startPage; i <= endPage; i++) {
        paginationButtons += `
                    <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages
                            ${
                              i === pageInfo.page
                                ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                                : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
                            } page-button" data-page="${i}">${i + 1}</button>
                `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      // Səhifələmə düymələri - Next button
      $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
                  pageInfo.page === pageInfo.pages - 1
                    ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
                    : "text-messages dark:text-[#FFFFFF] cursor-pointer"
                } next-page-button">
                    <div class="icon stratis-chevron-right"></div>
                </div>
            `);

      // Event listeners for pagination buttons
      $pagination
        .off("click", ".page-button")
        .on("click", ".page-button", function () {
          const page = $(this).data("page");
          table.page(page).draw("page");
        });

      $pagination
        .off("click", ".prev-page-button")
        .on("click", ".prev-page-button", function () {
          if (pageInfo.page > 0) {
            table.page(pageInfo.page - 1).draw("page");
          }
        });

      $pagination
        .off("click", ".next-page-button")
        .on("click", ".next-page-button", function () {
          if (pageInfo.page < pageInfo.pages - 1) {
            table.page(pageInfo.page + 1).draw("page");
          }
        });

      // Go button functionality for myTable1 (horizontal table)
      // These listeners are defined within drawCallback to ensure they re-attach after table redraws
      $goButton.off("click").on("click", function () {
        const pageNum = parseInt($pageInput.val());
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= pageInfo.pages) {
          table.page(pageNum - 1).draw("page");
          $pageInput.val(""); // Clear input after going to page
        } else {
          alert("Please enter a valid page number.");
        }
      });

      // Enter key functionality for GO button for myTable1
      $pageInput.off("keypress").on("keypress", function (e) {
        if (e.which == 13) {
          $goButton.click();
        }
      });
    },
  });

  // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
  $("#tableCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");

    $('#myTable1 tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });

  // Axtarış for myTable1 (horizontal table)
  // Ensure the search input for myTable1 is correctly targeted.
  // Assuming a unique ID for search input for the second table, e.g., 'customSearch1'
  $("#customSearch2").on("keyup", function () {
    // Changed from #customSearch to #customSearch2 based on your HTML
    table.search(this.value).draw();
    updateCounts(activeData); // This function might need adjustment based on how counts are derived for DataTables
  });

  // Sayları yeniləmək üçün funksiya (Not directly related to pagination fix, but kept for completeness)
  function updateCounts(data) {
    const totalCount = data.length;
    // Assuming 'status' property exists in your data for filtering
    const readCount = data.filter((row) => row.status === "Oxundu").length;
    const unreadCount = data.filter((row) => row.status === "Yeni").length;

    $("#total-count").text(`Hamısı (${totalCount})`);
    $("#read-count").text(`Oxunmuşlar (${readCount})`);
    $("#unread-count").text(`Oxunmamışlar (${unreadCount})`);
  }

  $("#refreshPageMuq").on("click", function (e) {
    e.preventDefault();
    table.ajax.reload(); // If you use AJAX, otherwise table.draw()
  });
});

// The following functions are not directly related to DataTables pagination and can remain as is.
function openContractsTableGrid4() {
  // Görünüş dəyişiklikləri
  document.getElementById("contractsGrid4").classList.remove("hidden");
  document.getElementById("contractsGrid2").classList.add("hidden");

  // Aktiv stil əlavə et
  const gridBtn = document.querySelector(
    'button[onclick="openContractsTableGrid4()"]'
  );
  const tableBtn = document.querySelector(
    'button[onclick="openContractsTableGrid2()"]'
  );

  gridBtn.classList.add(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
  tableBtn.classList.remove(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
  // Re-render the grid-style pagination when switching back
  renderCurrentPageContracts();
}

function openContractsTableGrid2() {
  // Görünüş dəyişiklikləri
  document.getElementById("contractsGrid4").classList.add("hidden");
  document.getElementById("contractsGrid2").classList.remove("hidden");

  // Aktiv stil əlavə et
  const gridBtn = document.querySelector(
    'button[onclick="openContractsTableGrid4()"]'
  );
  const tableBtn = document.querySelector(
    'button[onclick="openContractsTableGrid2()"]'
  );

  tableBtn.classList.add(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
  gridBtn.classList.remove(
    "bg-[#F7F9FB]",
    "dark:bg-transparent",
    "text-[#1D222B]",
    "dark:text-on-primary-dark",
    "rounded-full"
  );
  // Ensure DataTables redraws when switching to this view
  if (window.table) {
    window.table.draw();
  }
}

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#rewardCreateModal");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  dropdown.classList.toggle("hidden");
}

document.addEventListener("click", function (event) {
  const isDropdown = event.target.closest(".dropdown-menu");
  const isTrigger = event.target.closest(".stratis-dot-vertical");

  if (!isDropdown && !isTrigger) {
    document.querySelectorAll(".dropdown-menu").forEach((el) => {
      el.classList.add("hidden");
    });
  }
});

function openPopup(clickedElement) {
  $(".custom-popup").remove();

  const popupOverlay = document.createElement("div");
  popupOverlay.className =
    "custom-popup fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center z-[9999]";

  const popup = document.createElement("div");
  popup.className =
    "bg-white dark:bg-menu-dark w-[350px] p-6 rounded-xl shadow-lg flex flex-col items-start gap-4 relative";

  popup.innerHTML = `
    <div class="w-[306px] flex flex-col gap-3">
      <div class="w-10 h-10 rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark flex items-center justify-center">
        <div class="iconex iconex-music-plate-1 w-5 h-5 text-messages dark:text-on-primary-dark"></div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-[#1D222B] dark:text-on-primary-dark font-medium text-[15px]">Sessiya</div>
        <div class="text-secondary-text dark:text-secondary-text-color-dark text-[13px] font-normal">Seçilən bütün sessiyaları bitirmək istədiyinizə əminsiniz?</div>
      </div>
    </div>

    <div class="flex justify-end gap-2 w-full mt-2 text-xs font-medium">
      <button class="cursor-pointer px-3 py-1 rounded-full text-on-surface-variant dark:text-on-surface-variant-dark bg-surface-bright dark:bg-surface-bright-dark hover:bg-container-2 transition" onclick="this.closest('.custom-popup').remove()">Xeyr</button>
      <button class="cursor-pointer px-3 py-1 rounded-full text-on-primary dark:text-on-primary-dark bg-error dark:bg-error-dark transition" id="confirmDeleteBtn">Bəli, bitir</button>
    </div>
  `;

  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);

  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
    }
  });
}
