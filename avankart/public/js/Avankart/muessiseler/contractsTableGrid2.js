let contractsGridTable = null;
let currentContractGridTableFilters = {};

$(document).ready(function () {
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") || "mock-csrf-token";

  function initializeContractsGridTable() {
    if ($.fn.DataTable.isDataTable("#contractsGridTable")) {
      contractsGridTable.destroy();
    }

    contractsGridTable = $("#contractsGridTable").DataTable({
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
            ...currentContractGridTableFilters,
            muessise_id: $("#muessiseId").val()
          });
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      pageLength: 6,
      columns: [
        {
          data: function (row) {
            return `
            <div class="flex items-center gap-6 w-full">
                <div class="flex items-center gap-2 text-[14px] text-[#1D222B] dark:text-white">
                    <img src="${row.fileName}" alt="icon" class="w-5 h-5" />
                    <span>${row.title}</span>
                </div>
                <a href="/files/contracts/${row.fileName}" download
                class="flex items-center gap-1 px-4 py-1 border border-[#DBE4E8] rounded-full text-[12px] text-[#1D222B] hover:text-primary bg-[#FFFFFF] transition dark:border-[#40484C] dark:bg-[#161E22] dark:text-white dark:hover:text-[#9C78AE]">
                <div class="icon stratis-download w-4 h-4 dark:text-white"></div> Yüklə
                </a>
            </div>
          `;
          },
        },
        {
          data: function (row) {
            return `
            <div class="flex justify-between items-center pr-5 text-[13px] text-[#1D222B] whitespace-nowrap dark:text-white">
                <div>${row.date} - ${row.time}</div>
                <div class="flex items-center gap-2 text-error hover:bg-error-hover px-3 py-1 rounded-full cursor-pointer">
                  <div class="icon stratis-trash-02 text-xs text-error cursor-pointer"></div>
                  Sil
                </div>
            </div>
          `;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = contractsGridTable.page.info();
        const $pagination = $("#contractsGridTablePagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#contractsGridTablePageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        // Prev düyməsi
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeContractsGridTablePage(${Math.max(
            0,
            pageInfo.page - 1
          )})">
             <div class="icon stratis-chevron-left text-xs"></div>
           </div>`
        );

        // Səhifə düymələri
        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
          paginationButtons +=
            `<button class="cursor-pointer w-10 h-10 rounded-[8px] ${
              i === pageInfo.page
                ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
            }" onclick="changeContractsGridTablePage(${i})">` +
            (i + 1) +
            "</button>";
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        // Next düyməsi
        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
            pageInfo.page === pageInfo.pages - 1
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer"
          }" onclick="changeContractsGridTablePage(${Math.min(
            pageInfo.page + 1,
            pageInfo.pages - 1
          )})">
             <div class="icon stratis-chevron-right text-xs"></div>
           </div>`
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
      },
    });
  }

  initializeContractsGridTable();
   $("#reloadPage").on("click", function (){
      if(contractsGridTable){ 
      contractsGridTable.ajax.reload(null,false)
      }
    })

  // GO düyməsi
  $(".contracts-gridtable-go-button").on("click", function (e) {
    e.preventDefault();
    const pageInput = $(this).siblings(".contracts-gridtable-page-input");
    let pageNumber = parseInt(pageInput.val());
    pageInput.val("");
    if (!isNaN(pageNumber) && pageNumber > 0) {
      const pageInfo = contractsGridTable.page.info();
      if (pageNumber - 1 < pageInfo.pages) {
        contractsGridTable.page(pageNumber - 1).draw("page");
      } else {
        console.warn("Daxil etdiyiniz səhifə mövcud deyil.");
      }
    }
  });
});

window.changeContractsGridTablePage = function (page) {
  if (contractsGridTable) {
    contractsGridTable.page(page).draw("page");
  }
};

function performContractsGridTableSearch() {
  const searchValue = $("#contractsSearch").val();
  if (contractsGridTable) {
    contractsGridTable.search(searchValue).draw();
  }
}

$("#contractsSearch").on("keyup", function () {
  performContractsGridTableSearch();
});
