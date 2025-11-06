$(document).ready(function () {
    // Verilənlər

    const myData = [
        {
          user: "Ramin Orucov",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Yemək",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "İbrahim Feyzullazadə",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Yanacaq",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "Pərviz Nəzərov",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Hədiyyə",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "Əli İsa-zadə",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Yemək",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "Əsəd Əsədov",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Premium",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "Faiq Baxışov",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Avto Yuma",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "Murad Orucov",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Biznes",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "Nicat Orucov",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Premium",
          amount: 140.00,
          settlementDate: "01.03.2025"
        },
        {
          user: "Mehman Babayev",
          userId: "AP-XXXXXXXXXX",
          transactionId: "AG-2314",
          cardCategory: "Avto Yuma",
          amount: 140.00,
          settlementDate: "01.03.2025"
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
                    return `
                        <div class="flex flex-col items-start gap-[2px]">
                            <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.user}</span>
                            <span class="text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-normal">ID: ${row.userId}</span>
                        </div>
                    `;
                }
            },
            {
                data: function(row) {
                    return `<div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                                <span class="text-[13px] font-normal">${row.transactionId}</span>
                                <div class="icon stratis-currency-coin-manat w-5 h-5"></div>
                            </div>
                    `;
                }
            },
            {
                data: function(row) {
                    return `<div class="flex items-center gap-1 cursor-pointer text-messages dark:text-primary-text-color-dark">
                                <span class="text-[13px] font-normal">${row.cardCategory}</span>
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
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.settlementDate}</span>`;
                }
            }
        ],
        order: [],
        lengthChange: false,
        pageLength: myData.length,

        // ✅ Hover effekti əlavə olunur yalnız tbody satırlarına
        createdRow: function(row, data, dataIndex) {
            // Hover effekti
            $(row)
                .css('transition', 'background-color 0.2s ease')
                .on('mouseenter', function () {
                    $(this).css('background-color', '#F5F5F5');
                })
                .on('mouseleave', function () {
                    $(this).css('background-color', '');
                });
        
            /// Bütün td-lərə border alt
            $(row).find('td')
            .addClass('border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]')

            $(row).find('td:not(:last-child)')
                .css({
                    'padding-left': '20px',
                    'padding-top': '14.5px',
                    'padding-bottom': '14.5px'
                })
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
