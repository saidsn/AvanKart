// Global variables
let selahiyyetTable = null;
let currentSelahiyyetFilters = {};

$(document).ready(function () {
  // You should define csrfToken in your HTML meta tag or retrieve it another way
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") || "mock-csrf-token";

  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }

  function initializeSelahiyyetDataTable() {
    // Check if the table is already a DataTable instance and destroy it
    if ($.fn.DataTable.isDataTable("#selahiyyetTable")) {
      selahiyyetTable.destroy();
    }

    // Initialize the DataTable with the provided settings
    selahiyyetTable = $("#selahiyyetTable").DataTable({
      ajax: {
        url: "/muessiseler/selahiyyet-table",
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          return JSON.stringify({
            selahiyyet_id: $("#selahiyyetId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            muessise_id: $("#muessiseId").val(),
            ...currentSelahiyyetFilters,
          });
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t", // Show only the table body
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 3,
      columns: [
        {
          data: "groupName",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.groupName}</span>`;
          },
        },
        {
          data: "permissions",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.permissions}</span>`;
          },
        },
        {
          data: "peopleCount",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.peopleCount}</span>`;
          },
        },
        {
          data: "date",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = selahiyyetTable.page.info();
        const $pagination = $("#selahiyyetPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#selahiyyetTablePageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeSelahiyyetPage(' +
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
            '" onclick="changeSelahiyyetPage(' +
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
            '" onclick="changeSelahiyyetPage(' +
            Math.min(pageInfo.page + 1, pageInfo.pages - 1) +
            ')">' +
            '<div class="icon stratis-chevron-right text-xs"></div>' +
            "</div>"
        );
      },
      createdRow: function (row, data, dataIndex) {
        $(row)
          .attr("data-id", data.id)
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

        // Row klikləmə funksiyası
        $("#selahiyyetTable tbody").off("click", "tr").on("click", "tr", async function () {
          const selectedId = $(this).data("id");
          if(selectedId) {
          const result = await fetch("/muessiseler/selahiyyet-detail-table", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify({ id: selectedId }),
          })

          console.log(result.data,"result")

    //       if (window.selahiyyetDetailTable) {
    // // window.selahiyyetDetailTable.ajax.reload(null, false); // server-side reload
    // // və ya sadəcə draw
    // window.selahiyyetDetailTable.draw(); // local data redraw
    //       }
          //  window.currentselahiyyetDetailFilters.id = selectedId;

    // detail table reload et
    // if (window.selahiyyetDetailTable) {
    //   window.selahiyyetDetailTable.ajax.reload();
    // }
        }
        
          // MainView gizlədilir
          $("#istifadecilerContent").addClass("hidden");
          $("#selahiyyetDetail").removeClass("hidden");
        });

        // Geri button
        $(document).on("click", "#backToIStifadecilerContent", function () {

          $("#selahiyyetDetail").addClass("hidden");
          $("#istifadecilerContent").removeClass("hidden");
          
        });
      },
    });
  }
  // Initialize DataTable when the document is ready
  initializeSelahiyyetDataTable();
   $("#rbacRefreshBtn").on("click", function () {
    if(selahiyyetTable){ 
      selahiyyetTable.ajax.reload(null,false)
    }
  })

  // Attach event listener for the "GO" button
  $(".selahiyyet-go-button").on("click", function (e) {
    e.preventDefault();

    const pageInput = $(this).siblings(".selahiyyet-page-input");
    let pageNumber = parseInt(pageInput.val());
    pageInput.val(""); // Clear the input field

    if (!isNaN(pageNumber) && pageNumber > 0) {
      if (selahiyyetTable) {
        const pageInfo = selahiyyetTable.page.info();
        let targetPage = pageNumber - 1;

        if (targetPage < pageInfo.pages) {
          selahiyyetTable.page(targetPage).draw("page");
        } else {
          console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
        }
      }
    } else {
      console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
    }
  });
});

// Global function to change page
window.changeSelahiyyetPage = function (page) {
  if (selahiyyetTable) {
    selahiyyetTable.page(page).draw("page");
  }
};

function performSelahiyyetSearch() {
  const searchValue = $("#selahiyyetSearch").val();
  if (selahiyyetTable) {
    selahiyyetTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#selahiyyetSearch").on("keyup", function (e) {
  performSelahiyyetSearch();
});
