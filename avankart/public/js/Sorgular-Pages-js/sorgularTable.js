$(document).ready(function () {
  // Buradan sonra sizin mövcud DataTable konfiqurasiyanız olduğu kimi işləyə bilər.
  // `activeData` dəyişənini bu `myData` ilə təyin edib, cədvəldə göstərmək kifayətdir.
  var activeData = [];
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  var table = $("#myTable").DataTable({
    ajax: {
      url: "/sorgular/sorgular-table",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
      },
      dataSrc: function(json) {
        // toplam veriyi göster
        $('#sorgularCount').text(json.recordsFiltered);
        return json.data;
      },
      data: function (d) {
        const form = $("#sorgularFilterForm");
        const subjects = form.find("input[name='subject[]']:checked")
          .map(function () {
            return $(this).val();
          })
          .get();
        const statuses = form.find("input[name='status[]']:checked")
          .map(function () {
            return $(this).val();
          })
          .get();
        d.start_date = form.find("input[name=start_date]").val();
        d.end_date = form.find("input[name=end_date]").val();
        d.search = [$("#customSearch").val(), true];
        d.subject = subjects;
        d.status = statuses;
        // diğer alanları da ekle
      }
    },
    processing: true,
    serverSide: true,
    headers: {
      "CSRF-Token": csrfToken,
    },
    xhrFields: {
      withCredentials: true,
      rejectUnauthorized: false,
    },
    paging: true,
    info: false,
    dom: "t",
    columns: [
      {
        data: function (row) {

          // Status rəngləri
          let statusColor = "";
          switch (row.status) {
            case "Baxılır":
              statusColor = "#F9B100";
              break;
            case "Qaralama":
              statusColor = "#BFC8CC";
              break;
            case "Həll olundu":
              statusColor = "#32B5AC";
              break;
            case "Rədd edildi":
              statusColor = "#DD3838";
              break;
            default:
              statusColor = "#BFC8CC";
          }

          // Priority ikonları
          let priorityIcon = "";
          switch (row.priority) {
            case "High":
              priorityIcon = "Hight.svg";
              break;
            case "Medium":
              priorityIcon = "Medium.svg";
              break;
            case "Low":
              priorityIcon = "Low.svg";
              break;
            default:
              priorityIcon = "Low.svg";
          }

          // Ad sahəsi
          let nameBlock = "";
          if (row.name === "Təyin edilməyib") {
            nameBlock = `
                            <div class="flex items-center gap-1 text-messages dark:text-primary-text-color-dark">
                                <div class="text-[20px] icon stratis-user-profile-minus"></div>
                                <h3 class="text-[13px] font-medium">Təyin edilməyib</h3>
                            </div>
                        `;
          } else {
            const initials = row.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase();
            nameBlock = `
                            <div class="flex items-center gap-1">
                                <div class="w-[34px] h-[34px] bg-button-disabled dark:bg-button-disabled-color-dark rounded-full flex justify-center items-center">
                                    <div class="text-[12px] font-semibold font-poppins text-primary dark:text-primary-dark">${initials}</div>
                                </div>
                                <h3 class="text-[13px] font-normal">${row.name}</h3>
                            </div>
                        `;
          }

          return `
                        <a href="/sorgular/${row.id}" class="w-full bg-sidebar-bg dark:bg-side-bar-bg-dark text-messages dark:text-primary-text-color-dark rounded-[8px] p-3 flex flex-col gap-3 relative">
                            <div class="flex items-center justify-between">
                                <div>
                                    <span class="pb-0.5 text-[11px] opacity-65 font-normal ">${row.id}</span>
                                    <h3 class="pb-1 !text-[13px] font-medium">${row.title}</h3>
                                    <p class="text-[11px] opacity-65 font-normal">${row.problem}</p>
                                </div>
                                <div class="flex items-center gap-[8px] top-[12px] right-[12px] absolute">
                                    <div class="w-[6px] h-[6px] rounded-full" style="background-color: ${statusColor}"></div>
                                    <span class="!text-[12px] font-medium">${row.status}</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>
                                    ${nameBlock}
                                </span>
                                <div class="flex items-center gap-3">
                                    <div class="bg-table-hover dark:bg-table-hover-dark rounded-full flex items-center justify-center gap-1 py-[4.5px] px-[2px]">
                                        <div class="icon stratis-calendar-check w-[18px] h-[18px] py-[5px] ml-2.5"></div>
                                        <span class="!text-[12px] font-medium py-[4px] px-2">${row.date}</span>
                                    </div>
                                    <div class="flex items-center justify-center gap-1 py-[4.5px] px-[2px]">
                                        <div class="icon stratis-users-profiles-02"></div>
                                        <span class="!text-[12px] font-medium px-2">${row.user}</span>
                                    </div>
                                    <div class="flex items-center gap-2 justify-center">
                                        <img src="/images/Sorgular Pages Images/${priorityIcon === 'Hight.svg' ? 'High.svg' : priorityIcon}" alt="${row.priority}">
                                        <span class="text-[13px] font-medium">${row.priority}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    `;
        },
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 5,
    drawCallback: function () {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination");
      
      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      }

      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();

      // Input sahəsində Enter düyməsinə basıldıqda və ya "GO" düyməsinə klik edildikdə səhifəyə keçid
      $(".page-input")
        .off("keypress")
        .on("keypress", function (e) {
          if (e.which === 13) {
            goToPage();
          }
        });

      $(".go-button")
        .off("click")
        .on("click", function (e) {
          e.preventDefault();
          goToPage();
        });

      function goToPage() {
        const inputVal = $(".page-input").val().trim();
        const pageNum = parseInt(inputVal, 10); // input-u tam ədəd kimi al
        const pageInfo = table.page.info(); // mövcud DataTable səhifə məlumatı

        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageInfo.pages) {
          table.page(pageNum - 1).draw("page"); // DataTable 0-dan başlayır
        } else {
          table.page(0).draw("page"); // Əgər səhvdirsə → 1-ci səhifə
        }

        $(".page-input").val(""); // input sahəsini təmizlə
      }

      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      // Səhifələmə düymələri
      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
          pageInfo.page === 0
            ? "text-[#636B6F] cursor-not-allowed"
            : "text-messages dark:text-primary-text-color-dark"
        }" 
            onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
            <div class="icon stratis-chevron-left"></div>
        </div>
      `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
          <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
                  ${
                    i === pageInfo.page
                      ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
                      : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
                  }"
                  onclick="changePage(${i})">${i + 1}</button>
        `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
        <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${
          pageInfo.page === pageInfo.pages - 1
            ? "text-[#636B6F] cursor-not-allowed"
            : "text-tertiary-text dark:text-primary-text-color-dark"
        }" 
            onclick="changePage(${pageInfo.page + 1})">
            <div class="icon stratis-chevron-right"></div>
        </div>
      `);
    },
  });

  // Axtarış
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
    updateCounts(activeData);
  });

  // Sayları yeniləmək üçün funksiya
  function updateCounts(data) {
    const totalCount = data.length;
    const readCount = data.filter((row) => row.status === "Oxundu").length;
    const unreadCount = data.filter((row) => row.status === "Yeni").length;

    $("#total-count").text(`Hamısı (${totalCount})`);
    $("#read-count").text(`Oxunmuşlar (${readCount})`);
    $("#unread-count").text(`Oxunmamışlar (${unreadCount})`);
  }

  // Səhifə dəyişdirmə
  window.changePage = (page) => {
    var pageInfo = table.page.info();
    if (page < 0) page = 0;
    if (page >= pageInfo.pages) page = pageInfo.pages - 1; // cəmi səhifədən çox olmasın
    table.page(page).draw("page");
  };

  // Clear filters function
  window.clearFilters = function () {
    const $form = $('#sorgularFilterForm');

    // Reset form fields
    $form[0].reset();

    // Uncheck all checkboxes and update visual state
    $form.find('input[type="checkbox"]').each(function () {
      $(this).prop('checked', false);
    });

    // Clear date inputs
    $form.find('input[type="date"]').val('');

    // Reset DataTable to show all data without filters
    table.settings()[0].ajax.data = function (d) {
      return d; // Return original parameters without filters
    };

    // Reload table with cleared filters
    table.ajax.reload(function (data) {
      console.log('Filters cleared, showing all data');
      updateCounts(data.data || []);
    });

    console.log('Filters cleared');
  };
});
