// Global variables
let jobDetailTable = null;
let currentjobDetailFilters = {};

$(document).ready(function () {
  // You should define csrfToken in your HTML meta tag or retrieve it another way
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") || "mock-csrf-token";

  function initializejobDetailTable() {
    // Check if the table is already a DataTable instance and destroy it
    if ($.fn.DataTable.isDataTable("#jobDetailTable")) {
      jobDetailTable.destroy();
    }

    // Initialize the DataTable with the provided settings
    jobDetailTable = $("#jobDetailTable").DataTable({
      ajax: {
        url: "/muessiseler/job-detail-table",
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
            ...currentjobDetailFilters,
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
          data: "name",
          render: function (data, type, row) {
            return `
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                        ${row.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-messages text-[13px] font-medium dark:text-white text-left">${
                          row.name
                        }</span>
                        <span class="text-secondary-text text-[11px] font-normal dark:text-white text-left">ID: ${
                          row.id
                        }</span>
                    </div>
                </div>
            `;
          },
        },
        {
          data: "gender",
          render: function (data, type, row) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.gender}</span>`;
          },
        },
        {
          data: "position",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.position}</span>`;
          },
        },
        {
          data: "email",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.email}</span>`;
          },
        },
        {
          data: "phone",
          render: function (data, type, row) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.phone}</span>`;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = jobDetailTable.page.info();
        const $pagination = $("#jobDetailPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#jobDetailTablePageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changejobDetailPage(' +
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
            '" onclick="changejobDetailPage(' +
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
            '" onclick="changejobDetailPage(' +
            Math.min(pageInfo.page + 1, pageInfo.pages - 1) +
            ')">' +
            '<div class="icon stratis-chevron-right text-xs"></div>' +
            "</div>"
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

        // Row klikləmə funksiyası
        $("#jobDetailTable tbody").on("click", "tr", function () {
          // MainView gizlədilir
          $("#istifadecilerContent").addClass("hidden");
          $("#jobDetail").removeClass("hidden");
        });

        // Geri button
        $(document).on("click", "#backToJobContent", function () {
          $("#jobDetail").addClass("hidden");
          $("#istifadecilerContent").removeClass("hidden");
        });
      },
    });
  }

  // Initialize DataTable when the document is ready
  initializejobDetailTable();
  $("#jobDetailRefreshBtn").on("click",function () {
    if(jobDetailTable) {
      jobDetailTable.ajax.reload(null,false)
    };
  });

  // Attach event listener for the "GO" button
  $(".jobDetail-go-button").on("click", function (e) {
    e.preventDefault();

    const pageInput = $(this).siblings(".jobDetail-page-input");
    let pageNumber = parseInt(pageInput.val());
    pageInput.val(""); // Clear the input field

    if (!isNaN(pageNumber) && pageNumber > 0) {
      if (jobDetailTable) {
        const pageInfo = jobDetailTable.page.info();
        let dataTablePage = pageNumber - 1;

        if (dataTablePage < pageInfo.pages) {
          jobDetailTable.page(dataTablePage).draw("page");
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
window.changejobDetailPage = function (page) {
  if (jobDetailTable) {
    jobDetailTable.page(page).draw("page");
  }
};

function performjobDetailSearch() {
  const searchValue = $("#jobDetailSearch").val();
  if (jobDetailTable) {
    jobDetailTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#jobDetailSearch").on("keyup", function (e) {
  performjobDetailSearch();
});
