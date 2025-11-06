$(document).ready(function () {
    // Verilənlər

    const myData = [
        {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Ramin Orucov",
            specialty: "Designer",
            taskgroup: "Marketing",
            amount: "150.00",
            date: "01.12.2023 08:20",
        },
        {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Fuad Bayramov",
            specialty: "Mühasib",
            taskgroup: "Mühasiblər",
            amount: "18000",
            date: "01.12.2023 08:20",
        },
        {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Elvin Hüseynov",
            specialty: "Layihə Rəhbəri",
            taskgroup: "Layihə Rəhbərləri",
            amount: "220.00",
            date: "01.12.2023 08:20",
        },
        {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Etibar Quliyev",
            specialty: "Baş Mühasib",
            taskgroup: "Mühasiblər",
            amount: "150.00",
            date: "01.12.2023 08:20",
        },
        {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Kamran Əliyev",
            specialty: "Layihə Rəhbəri",
            taskgroup: "Layihə Rəhbərləri",
            amount: "110.00",
            date: "01.12.2023 08:20",
        },
        {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Fatimə Ağayeva",
            specialty: "Designer",
            taskgroup: "Marketing",
            amount: "270.00",
            date: "01.12.2023 08:20",
          },
          {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Mənsur İsmayilov",
            specialty: "Developer",
            taskgroup: "Information Technology",
            amount: "90.00",
            date: "01.12.2023 08:20",
          },
          {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Zaur Ağayev",
            specialty: "Cyber Security",
            taskgroup: "Information Technology",
            amount: "85.50",
            date: "01.12.2023 08:20",
          },
          {
            ID: "AP-XXXXXXXXXX",
            namesurname: "İbrahim Feyzullazadə",
            specialty: "IT Biznes Analitik",
            taskgroup: "Information Technology",
            amount: "210.00",
            date: "01.12.2023 08:20",
          },
          {
            ID: "AP-XXXXXXXXXX",
            namesurname: "İlkin Məmmədov",
            specialty: "SQL Developer",
            taskgroup: "Information Technology",
            amount: "350.00",
            date: "01.12.2023 08:20",
          },
          {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Nihad Məmmədov",
            specialty: "Developer",
            taskgroup: "Information Technology",
            amount: "110.00",
            date: "01.12.2023 08:20",
          },
          {
            ID: "AP-XXXXXXXXXX",
            namesurname: "Heydər Şxiyev",
            specialty: "IT Biznes Analitik",
            taskgroup: "Information Technology",
            amount: "190.00",
            date: "01.12.2023 08:20",
          },
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
                    return `<span class="text-[13px] text-messages font-normal">${row.ID}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal flex items-center justify-left">${row.namesurname}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal flex items-center justify-left">${row.specialty}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal">${row.taskgroup}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal">${row.amount} ₼</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal">${row.date}</span>`;
                }
            },
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

        
            $('#myTable thead th:last-child').css({
                'border-left': '0.5px solid #E0E0E0'
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

            $lastRow.find('td:last-child').css({
                'border-left': '0.5px solid #E0E0E0'
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
