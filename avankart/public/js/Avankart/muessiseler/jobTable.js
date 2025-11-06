// Global variables
let jobTable = null;
let currentJobFilters = {};

$(document).ready(function () {
  // You should define csrfToken in your HTML meta tag or retrieve it another way
  const csrfToken =
    $('meta[name="csrf-token"]').attr("content") || "mock-csrf-token";

  function initializeJobTable() {
    // Check if the table is already a DataTable instance and destroy it
    if ($.fn.DataTable.isDataTable("#jobTable")) {
      jobTable.destroy();
    }

    // Initialize the DataTable with the provided settings
    jobTable = $("#jobTable").DataTable({
      ajax: {
        url: "/muessiseler/job-table",
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
            ...currentJobFilters,
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
          data: "jobTitle",
          render: function (data) {
            return `<span class="flex text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
        {
          data: "createdBy",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
        {
          data: "createdAt",
          render: function (data) {
            return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${data}</span>`;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = jobTable.page.info();
        const $pagination = $("#jobPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#jobTablePageCount").text(
          `${pageInfo.page + 1} / ${pageInfo.pages || 1}`
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeJobPage(' +
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
            '" onclick="changeJobPage(' +
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
            '" onclick="changeJobPage(' +
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
        $("#jobTable tbody").off("click","tr").on("click", "tr", function () {
          const jobId = $(this).data("id")
          console.log(jobId,"job id")
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
  initializeJobTable();
  
  $("#jobRefreshBtn").on("click", function (){
    if(jobTable) {
      jobTable.ajax.reload(null,false);
    }
  })

  // Attach event listener for the "GO" button
  $(".job-go-button").on("click", function (e) {
    e.preventDefault();

    const pageInput = $(this).siblings(".job-page-input");
    let pageNumber = parseInt(pageInput.val());
    pageInput.val(""); // Clear the input field

    if (!isNaN(pageNumber) && pageNumber > 0) {
      if (jobTable) {
        const pageInfo = jobTable.page.info();
        let dataTablePage = pageNumber - 1;

        if (dataTablePage < pageInfo.pages) {
          jobTable.page(dataTablePage).draw("page");
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
window.changeJobPage = function (page) {
  if (jobTable) {
    jobTable.page(page).draw("page");
  }
};

function performJobSearch() {
  const searchValue = $("#jobSearch").val();
  if (jobTable) {
    jobTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#jobSearch").on("keyup", function (e) {
  performJobSearch();
});
