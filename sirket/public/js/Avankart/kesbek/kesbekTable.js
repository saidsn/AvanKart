$(document).ready(function () {
    // Verilənlər

    const myData = [
        {
          invoice: "AINV-XXXXXXXXXX",
          customers: 280,
          transactions: 380,
          amount: 140.00,
          date: "Mart, 2025",
          status: "Davam edir"
        },
        {
          invoice: "AINV-XXXXXXXXXX",
          customers: 250,
          transactions: 180,
          amount: 140.00,
          date: "Mart, 2025",
          status: "Tamamlanıb"
        },
        {
          invoice: "AINV-XXXXXXXXXX",
          customers: 200,
          transactions: 300,
          amount: 140.00,
          date: "Mart, 2025",
          status: "Tamamlanıb"
        },
        {
          invoice: "AINV-XXXXXXXXXX",
          customers: 270,
          transactions: 360,
          amount: 140.00,
          date: "Mart, 2025",
          status: "Tamamlanıb"
        },
        {
          invoice: "AINV-XXXXXXXXXX",
          customers: 280,
          transactions: 380,
          amount: 140.00,
          date: "Mart, 2025",
          status: "Tamamlanıb"
        },
        {
          invoice: "AINV-XXXXXXXXXX",
          customers: 280,
          transactions: 380,
          amount: 140.00,
          date: "Mart, 2025",
          status: "Tamamlanıb"
        }
      ];
      
    var activeData = myData;

    var table = $('#myTable').DataTable({
        paging: true,
        info: false,
        dom: 't',
        data: activeData,
        columns: [
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.invoice}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                                <span class="text-[13px] font-normal">${row.customers}</span>
                                <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
                            </div>
                    `;
                }
            },
            {
                data: function(row) {
                    return `<div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                                <span class="text-[13px] font-normal">${row.transactions}</span>
                                <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
                            </div>
                    `;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.amount.toFixed(2)} ₼</span>`;
                }
            },
            
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date}</span>`;
                }
            },
            {
                data: function(row) {
                    let color = row.status === "Davam edir" ? "bg-[#BFC8CC]" : "bg-[#32B5AC]";
                    return `
                        <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                            <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                            <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
                        </div>
                    `;
                }
            }
        ],
        order: [],
        lengthChange: false,
        pageLength: myData.length,

        // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
        createdRow: function(row, data, dataIndex) {
            $(row).css('transition', 'background-color 0.2s ease')
                .on('mouseenter', function () {
                    $(this).css('background-color', '#F5F5F5');
                })
                .on('mouseleave', function () {
                    $(this).css('background-color', '');
                });
        
            $(row).find('td')
                .addClass('border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]')
                .not(':last-child')
                .css({
                    'padding-left': '20px',
                    'padding-top': '14.5px',
                    'padding-bottom': '14.5px'
                });
        
            // ✅ Satıra klik ilə yönləndirmə
            $(row).on('click', function () {
                localStorage.setItem('selectedPrize', JSON.stringify(data));
                window.location.href = '../prize/prizedetails.html';
            });
        },
        

        initComplete: function() {
            $('#myTable thead th').css({
                'padding-left': '20px',
                'padding-top': '10.5px',
                'padding-bottom': '10.5px'
            });

            // Filtrləmə ikonları üçün mövcud kodun saxlanması
            $('#myTable thead th.filtering').each(function() {
                $(this).html('<div class="custom-header flex gap-2.5 items-center"><div>' + $(this).text() + '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>');
            });
        },

        drawCallback: function () {
            var api = this.api();
            var pageInfo = api.page.info();
            var $pagination = $('#customPagination');

            if (pageInfo.pages === 0) {
                $pagination.empty();
                return;
            }

            $("#pageCount").text((pageInfo.page + 1) + " / " + pageInfo.pages);
            $pagination.empty();
            
           

            const colCount = $('#myTable thead th').length;
            const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
            $('#myTable tbody').prepend(spacerRow);

            // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
            const $lastRow = $('#myTable tbody tr:not(.spacer-row):last');

            $lastRow.find('td').css({
                'border-bottom': '0.5px solid #E0E0E0',
            });

            // Səhifələmə düymələri
            $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0 ? 'opacity-50 cursor-not-allowed' : 'text-messages'}" 
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left"></div>
                </div>
            `);

            var paginationButtons = '<div class="flex gap-2">';
            for (var i = 0; i < pageInfo.pages; i++) {
                paginationButtons += `
                    <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages 
                            ${i === pageInfo.page ? 'bg-[#F6D9FF] text-messages' : 'bg-transparent text-tertiary-text'}"
                            onclick="changePage(${i})">${i + 1}</button>
                `;
            }
            paginationButtons += '</div>';
            $pagination.append(paginationButtons);

            $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? 'opacity-50 cursor-not-allowed' : 'text-tertiary-text'}" 
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right"></div>
                </div>
            `);
        }
    });

    // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
    $('#newCheckbox').on('change', function () {
        const isChecked = $(this).is(':checked');

        $('#myTable tbody input[type="checkbox"]').each(function () {
            $(this).prop('checked', isChecked).trigger('change');
        });
    });

    // Axtarış
    $('#customSearch').on('keyup', function () {
        table.search(this.value).draw();
        updateCounts(activeData);
    });

    // Sayları yeniləmək üçün funksiya
    function updateCounts(data) {
        const totalCount = data.length;
        const readCount = data.filter(row => row.status === "Oxundu").length;
        const unreadCount = data.filter(row => row.status === "Yeni").length;

        $('#total-count').text(`Hamısı (${totalCount})`);
        $('#read-count').text(`Oxunmuşlar (${readCount})`);
        $('#unread-count').text(`Oxunmamışlar (${unreadCount})`);
    }

    // Səhifə dəyişdirmə
    window.changePage = function (page) {
        table.page(page).draw('page');
    };
});

localStorage.setItem("myData", JSON.stringify(myData));
