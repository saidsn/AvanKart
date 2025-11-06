let contractsTable = null;
let currentContractFilters = {};

$(document).ready(function () {
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") || "mock-csrf-token";

  function initializeContractsTable() {
    if ($.fn.DataTable.isDataTable("#contractsTable")) {
      contractsTable.destroy();
    }

    contractsTable = $("#contractsTable").DataTable({
      ajax: {
        url: "/muessiseler/contracts",
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          return JSON.stringify({
            user_id: $("#userId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            muessise_id: $("#muessiseId").val(),
            // start_date: $("#contractsStartDate").val(),
            // end_date: $("#contractsEndDate").val(),
            ...currentContractFilters,
          });
        },
        dataSrc: function (json){
          $("#muqavilelerCounts").html(
            "Müqavilələr ( " + json.recordsTotal + " )"
          )
          return json.data;
        }
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t", // yalnız table body
      info: false,
      order: [],
      pageLength: 6, // istəsən dəyiş
      columns: [
        {
          data: null,
          render: function (row) {
            return `
              <form id="deleteMuqavileForm" onsubmit="return false" data-url="/muessiseler/contracts/delete" class="relative rounded-[8px] py-5 px-3 flex flex-col items-center text-center w-full bg-sidebar-bg dark:bg-[#0C1418]">
                <!-- Trash icon -->
                <input type="hidden" name="muqavile_id" id="muqavileId" value="${row.muqavile_id}"/>
                <button type="submit" onClick="submitForm('deleteMuqavile')" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center hover:bg-error-hover rounded-full cursor-pointer">
                  <div class="icon stratis-trash-02 text-sm text-error"></div>  
                </button>

                <!-- PDF İkonu -->
                <div class="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-3 dark:bg-[#161E22]">
                  <img src="/images/Sorgular Pages Images/${row.iconName === 'pdf' ? 'pdf-image.svg': 'excel-image.svg'}" alt="PDF" class="w-6 h-6">
                </div>

                <!-- Başlıq -->
                <p class="text-[13px] font-medium text-[#1D222BA6] mb-1 dark:text-[#FFFFFFA6]">${row.title}</p>

                <!-- Tarix və Saat -->
                <p class="text-[12px] font-normal text-[#1D222B80] mb-3 dark:text-[#FFFFFF80]">${row.date} - ${row.time}</p>

                <!-- Yüklə düyməsi -->
                <a href="/files/contracts/${row.fileName}" download
                  class="cursor-pointer flex items-center gap-1 px-4 py-1 border border-[#DBE4E8] rounded-full text-[12px] text-[#1D222B] hover:text-primary bg-[#FFFFFF] transition dark:bg-[#161E22] dark:text-white dark:hover:text-[#9C78AE] dark:border-[#40484C]">
                  <div class="icon stratis-download w-4 h-4 text-messages dark:text-[#FFFFFF]"></div> Yüklə
                </a>
              </form>
            `;
          },
        },
      ],
      createdRow: function (row, data, dataIndex) {
        // td-ləri silirik, tam genişlikdə card göstəririk
        $(row).find("td").addClass("p-0 border-0");
      },
      drawCallback: function (settings) {
        $("#muqavilelerCount").text(" Müqavilələr ( "+settings.json.recordsTotal+ " )")
        const pageInfo = contractsTable.page.info();
        const $pagination = $("#contractsPagination");
        $pagination.empty();

        // pagination text update
        $("#contractsTablePageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        // grid düzülüşünü düzəlt
        const $tbody = $("#contractsTable tbody");
        const items = [];
        $tbody.find("tr td").each(function () {
          items.push($(this).children()); // kartı götürürük
        });
        $tbody.empty(); // köhnə <tr>-ləri silirik
        items.forEach((item) => {
          $tbody.append($("<div>").append(item).addClass("col-span-1"));
        });

        // pagination düymələri
        if (pageInfo.pages > 1) {
          // Prev
          $pagination.append(
            `<div class="flex items-center justify-center px-3 h-8 ${
              pageInfo.page === 0
                ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
                : "text-messages dark:text-[#FFFFFF] cursor-pointer"
            }" onclick="changeContractsPage(${Math.max(0, pageInfo.page - 1)})">
         <div class="icon stratis-chevron-left text-xs"></div>
       </div>`
          );

          // page buttons
          let paginationButtons = '<div class="flex gap-2">';
          for (let i = 0; i < pageInfo.pages; i++) {
            paginationButtons +=
              `<button class="cursor-pointer w-10 h-10 rounded-[8px] ${
                i === pageInfo.page
                  ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                  : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
              }" onclick="changeContractsPage(${i})">` +
              (i + 1) +
              "</button>";
          }
          paginationButtons += "</div>";
          $pagination.append(paginationButtons);

          // Next
          $pagination.append(
            `<div class="flex items-center justify-center px-3 h-8 ${
              pageInfo.page === pageInfo.pages - 1
                ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
                : "text-messages dark:text-[#FFFFFF] cursor-pointer"
            }" onclick="changeContractsPage(${Math.min(
              pageInfo.page + 1,
              pageInfo.pages - 1
            )})">
         <div class="icon stratis-chevron-right text-xs"></div>
       </div>`
          );
        }
      },
    });
  }

  initializeContractsTable();

    $("#reloadPage").on("click", function (){
      if(contractsTable){ 
      contractsTable.ajax.reload(null,false)
      }
    })
  
  // GO düyməsi
  $(".contracts-go-button").on("click", function (e) {
    e.preventDefault();
    const pageInput = $(this).siblings(".contracts-page-input");
    let pageNumber = parseInt(pageInput.val());
    pageInput.val("");
    if (!isNaN(pageNumber) && pageNumber > 0) {
      const pageInfo = contractsTable.page.info();
      if (pageNumber - 1 < pageInfo.pages) {
        contractsTable.page(pageNumber - 1).draw("page");
      } else {
        console.warn("Daxil etdiyiniz səhifə mövcud deyil.");
      }
    }
  });
});

window.changeContractsPage = function (page) {
  if (contractsTable) {
    contractsTable.page(page).draw("page");
  }
};

// Filter modal functions
window.openContractsFilterModal = function () {
  if ($("#contractsFilterPop").hasClass("hidden")) {
    $("#contractsFilterPop").removeClass("hidden");
  } else {
    $("#contractsFilterPop").addClass("hidden");
  }
};

window.closeContractsFilterModal = function () {
  $("#contractsFilterPop").addClass("hidden");
};

// Apply filters function
window.applyContractsFilters = function () {
  console.log("=== Applying contracts filters ===");

  // Filterləri sıfırla
  currentContractFilters = {};

  // Tarix aralığını al (HTML-dəki name-lərə uyğun)
  const startDate = $('input[name="contracts_start_date"]').val();
  const endDate = $('input[name="contracts_end_date"]').val();

  if (startDate) {
    currentContractFilters.start_date = startDate;
  }

  if (endDate) {
    currentContractFilters.end_date = endDate;
  }


  console.log("New currentContractFilters:", currentContractFilters);
  console.log("currentContractFilters keys:", Object.keys(currentContractFilters));

  // Məlumat cədvəlini yenilə
  if (contractsTable) {
    console.log("Reloading contractsTable...");
    contractsTable.ajax.reload(function (json) {
      console.log("contractsTable reload completed");
    }, false);
  }

  // Filter modalını bağla (HTML-dəki modal ID-sinə uyğun)
  $("#contractsFilterPop").addClass("hidden");
};

// Clear filters function
window.clearContractsFilters = function () {
  console.log("=== Clearing contracts filters ===");

  // Reset form
  $("#contractsFilterForm")[0].reset();
  $("#contractsStartDate").val("");
  $("#contractsEndDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  // Clear filters
  currentContractFilters = {};

  // Reload DataTable
  if (contractsTable) {
    console.log("Reloading contractsTable after clearing filters...");
    contractsTable.ajax.reload(function (json) {
      console.log("contractsTable clear and reload completed");
    }, true);
  }
};

window.openContractsDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performContractsSearch() {
  const searchValue = $("#contractsSearch").val();
  if (contractsTable) {
    contractsTable.search(searchValue).draw();
  }
}

$("#contractsSearch").on("keyup", function () {
  performContractsSearch();
});
