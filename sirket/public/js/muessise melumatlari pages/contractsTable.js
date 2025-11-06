$(document).ready(function () {
   let myData = [];
    
  // Pagination variables
  let currentPage = 0;
  let itemsPerPage = 8; // 4 columns x 2 rows = 8 items per page
  let totalPages = 0
  // Fetch CSRF token from meta tag
  const csrfToken = $('meta[name="csrf-token"]').attr('content');
  // Fetch data from the API and update the table
  $.ajax({
    url: "/muessise-info/muessise-muqavile",
    type: "POST",
    processing: true,
    serverSide: true,
    headers: {
      "CSRF-Token": csrfToken,
    },
    contentType: 'application/json',
    data: function (d) {
      d.search = $('#customSearch2').val();
      return JSON.stringify(d);
    },
    xhrFields: {
      withCredentials: true,
      rejectUnauthorized: false,
    },

    success: function (response) {
      if (response.data && Array.isArray(response.data)) {
        $("#muqavilelerTotal").text(response.recordsFiltered); // Update total count
       myData = response.data; // Update the data array
        totalPages = Math.ceil(myData.length / itemsPerPage); // Recalculate total pages
        renderCurrentPage(); // Render the updated table
      }
    }
  });
   
  $("#customSearch2").on("keyup", function(e) {
    e.preventDefault();
      const csrfToken = $('meta[name="csrf-token"]').attr('content');

    // təkrar AJAX
    $.ajax({
        url: "/muessise-info/muessise-muqavile",
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        contentType: "application/json",
        data: JSON.stringify({ search: $('#customSearch2').val() }),
        success: function(response) {
            if(response.data && Array.isArray(response.data)) {
                myData = response.data;
                totalPages = Math.ceil(myData.length / itemsPerPage);
                renderCurrentPage();
                $("#muqavilelerTotal").text(response.recordsFiltered);
            }
        }
    });
});


  // Function to render current page
  function renderCurrentPage() {
 
    const $tbody = $("#contractsGrid4 tbody");
    $tbody.empty();
       $("#muqavilelerTotal").text(myData.recordsFiltered); // Update total count
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, myData.length);
    const currentItems = myData.slice(startIndex, endIndex);

    currentItems.forEach((row) => {
      const html = `
        <div class="rounded-[8px] py-5 px-3 flex flex-col items-center text-center w-full bg-sidebar-bg dark:bg-[#0C1418]">
          <!-- PDF İkonu -->
          <div class="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-3 dark:bg-[#161E22] ">
            <img src="${row.fileName}" alt="PDF" class="w-6 h-6 dark:filter invert ">
          </div>
          <!-- Başlıq -->
          <p class="text-[13px] font-medium text-[#1D222BA6] mb-1 dark:text-[#FFFFFFA6]">${row.title}</p>
          <!-- Tarix və Saat -->
          <p class="text-[12px] font-normal text-[#1D222B80] mb-3 dark:text-[#FFFFFF80]">${row.date} - ${row.time}</p>
          <!-- Yüklə düyməsi -->
          <a href="/files/contracts/hesablasma-muqavilesi.pdf" download
            class="cursor-pointer flex items-center gap-1 px-4 py-1.5 border border-[#DBE4E8] rounded-full text-[12px] text-[#1D222B] hover:text-primary bg-[#FFFFFF] transition dark:bg-[#161E22] dark:text-white dark:hover:text-[#9C78AE] dark:border-[#40484C]">
            <div class="icon stratis-download w-4 h-4 text-messages dark:text-[#FFFFFF]"></div> Yüklə
          </a>
        </div>
      `;
      $tbody.append(html);
    });

    // Update pagination info
    updatePaginationInfo();
  }

  // Function to update pagination controls
  function updatePaginationInfo() {
    const $pagination = $("#customPaginationContracts");
    const $pageCount = $("#pageCountContracts");

    // Update page count
    $pageCount.text(`${currentPage + 1} / ${totalPages}`);

    // Clear and rebuild pagination
    $pagination.empty();

    if (totalPages === 0) {
      return;
    }

    // Previous button
    $pagination.append(`
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight cursor-pointer ${currentPage === 0
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF]"
      }"
        ${currentPage > 0 ? `onclick="changeContractsPage(${currentPage - 1})"` : ""}>
        <div class="icon stratis-chevron-left"></div>
      </div>
    `);

    // Page buttons
    let paginationButtons = '<div class="flex gap-2">';
    for (let i = 0; i < totalPages; i++) {
      paginationButtons += `
        <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages transition-colors duration-200
          ${i === currentPage
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
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight cursor-pointer ${currentPage === totalPages - 1
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF]"
      }"
        ${currentPage < totalPages - 1 ? `onclick="changeContractsPage(${currentPage + 1})"` : ""}>
        <div class="icon stratis-chevron-right"></div>
      </div>
    `);
  }

  // Global function to change page
  window.changeContractsPage = function (page) {
    if (page >= 0 && page < totalPages) {
      currentPage = page;
      renderCurrentPage();
    }
  };

  // GO button functionality
  $("#contractsGrid4 .go-button").on("click", function (e) {
    e.preventDefault();
    const pageInput = $(this).siblings(".page-input");
    const pageNumber = parseInt(pageInput.val());

    if (pageNumber && pageNumber > 0 && pageNumber <= totalPages) {
      changeContractsPage(pageNumber - 1); // 0-indexed
      pageInput.val(''); // Clear input
    }
  });

  // Enter key functionality for GO button
  $("#contractsGrid4 .page-input").on("keypress", function (e) {
    if (e.which === 13) { // Enter key
      $(this).siblings(".go-button").click();
    }
  });

  // Initialize the grid
  // renderCurrentPage();
  $("#refreshPageMuq").on("click", function (e) {
    e.preventDefault();
    table.ajax.reload(); 
  });
});

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
}