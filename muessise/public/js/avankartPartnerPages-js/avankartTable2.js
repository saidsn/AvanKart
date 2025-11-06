$(document).ready(function () {
    const myData = [
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        },
        {
            id: "RO002",
            name: "Ramin Orucov",
            email: "ramin.orucovvv@gmail.com",
            phone: "+994 50 770 35 22",
        }
    ];

    const table = $('#myTable2').DataTable({
        paging: true,
        info: false,
        dom: 't',
        data: myData,
        columns: [
            {
                orderable: false,
                data: function(row, type, set, meta) {
                    const idx = meta.row;
                    return `
                        <input type="checkbox" id="cb-${idx}" class="peer hidden">
                        <label for="cb-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                            <div class="icon stratis-check-01 scale-60"></div>
                        </label>
                    `;
                }
            },
            {
                data: function(row) {
                    return `
                        <div class="flex items-center gap-3">
                            <span class="text-secondary-text text-[11px] font-normal">ID: ${row.id}</span>
                        </div>
                    `;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal">${row.name}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal">${row.email}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal">${row.phone}</span>`;
                }
            }
        ],
        order: [],
        lengthChange: false,
        pageLength: 10,
        createdRow: function(row, data, dataIndex) {
            // Hover effekti
            $(row)
                .css('transition', 'background-color 0.2s ease')
                .on('mouseenter', function () {
                    $(this).css('background-color', '#FAFAFA');
                })
                .on('mouseleave', function () {
                    $(this).css('background-color', '');
                });
        
            /// Bütün td-lərə border alt
            $(row).find('td')
                .addClass('border-b-[.5px] border-stroke')

            $(row).find('td:not(:first-child)')
                .css({
                    'padding-left': '20px',
                    'padding-top': '14.5px',
                    'padding-bottom': '14.5px'
                })
            
            $('#myTable2 thead th:first-child')
                .css({
                    'padding-left': '0',
                    'padding-right': '0',
                    'width': '58px',
                    'text-align': 'center',
                    'vertical-align': 'middle',
                });


            $('#myTable2 thead th:first-child label')
                .css({
                    'margin': '0 auto',
                    'display': 'flex',
                    'justify-content': 'center',
                    'align-items': 'center'
                });

            // Sol td (checkbox): padding və genişliyi sıfırla, border ver
            $(row).find('td:first-child')
                .css({
                    'padding-left': '0',
                    'padding-right': '0',
                    'width': '48px',   // checkbox sütunu üçün daha dar genişlik (uyğunlaşdıra bilərsən)
                    'text-align': 'center'
                });

            // Label içində margin varsa sıfırla
            $(row).find('td:first-child label').css({
                'margin': '0',
                'display': 'inline-flex',
                'justify-content': 'center',
                'align-items': 'center'
            });

        },

        initComplete: function() {
            $('#myTable2 thead th').css({
                'padding-left': '20px',
                'padding-top': '10.5px',
                'padding-bottom': '10.5px'
            });

            // Table başlıqlarına stil burada verilməlidir
            $('#myTable2 thead th:first-child').css({
                'padding-left': '0',
                'padding-right': '0',
                'width': '58px',
                'text-align': 'center',
                'vertical-align': 'middle',
            });
        
        
            $('#myTable2 thead th:first-child label').css({
                'margin': '0 auto',
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center'
            });
        
            // Filtrləmə ikonları üçün mövcud kodun saxlanması
            $('#myTable2 thead th.filtering').each(function() {
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
            
            // Spacer-row əlavə olunur
            $('#myTable tbody tr.spacer-row').remove();

            const colCount = $('#myTable2 thead th').length;
            const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
            $('#myTable tbody').prepend(spacerRow);

            // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
            const $lastRow = $('#myTable2 tbody tr:not(.spacer-row):last');

            $lastRow.find('td').css({
                'border-bottom': '0.5px solid #E0E0E0',
            });

            // Səhifələmə düymələri
            $pagination.append(`
                <div class="flex items-center justify-center  pr-[42px] h-8 ms-0 leading-tight ${pageInfo.page === 0 ? 'opacity-50 cursor-not-allowed' : 'text-messages'}"
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left !h-[12px] !w-[7px] " ></div>
                </div>
            `);

            var paginationButtons = '<div class="flex gap-2">';
            for (var i = 0; i < pageInfo.pages; i++) {
                paginationButtons += `
                    <button class="cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages
                            ${i === pageInfo.page ? 'bg-[#F6D9FF] text-messages' : 'bg-transparent text-tertiary-text'}"
                            onclick="changePage(${i})">${i + 1}</button>
                `;
            }
            paginationButtons += '</div>';
            $pagination.append(paginationButtons);

            $pagination.append(`
                <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${pageInfo.page === pageInfo.pages - 1 ? 'opacity-50 cursor-not-allowed' : 'text-tertiary-text'}"
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right !h-[12px] !w-[7px] "></div>
                </div>
            `);
        }
    });
    // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
    $('#newCheckbox2').on('change', function () {
        const isChecked = $(this).is(':checked');

        $('#myTable2 tbody input[type="checkbox"]').each(function () {
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