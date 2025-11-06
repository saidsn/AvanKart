$(document).ready(function () {
    // Verilənlər

    const myData = [
        [
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
        ],
        [
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
        ],
        [
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
        ],
        [
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
        ],
        [
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Kapital.svg",
                companyName: "Kapital Bank",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
                companyName: "Veysəloğlu",
                companyId: "ID: VO002",
            },
            {
                logo: "/public/images/Avankart/Sirket/Pasha.svg",
                companyName: "Pasha Holding",
                companyId: "ID: VO002",
            },
        ],
      ];
      
    var activeData = myData;

    var table = $('#myTable3').DataTable({
        paging: true,
        info: false,
        dom: 't',
        data: activeData,
        columns: [
                {
                data: function(row) {
                    return `<div onclick="qovluqclick()" class="max-w-[157px] w-full flex items-center justify-center flex-col">
                                <div class="bg-table-hover w-[48px] h-[48px] rounded-[50%]">
                                    <div class="p-2">
                                        <img src="${row[0]?.logo || ''}" alt="Logo">
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="text-[15px] font-medium">${row[0]?.companyName || ''}</div>
                                    <div class="text-[11px] font-normal text-[#1D222B80]">${row[0]?.companyId || ''}</div>
                                </div>
                            </div>`;
                }
            },
            {
                data: function(row) {
                    return `<div class="max-w-[157px] w-full flex items-center justify-center flex-col">
                                <div class="bg-table-hover w-[48px] h-[48px] rounded-[50%]">
                                    <div class="p-2">
                                        <img src="${row[1]?.logo || ''}" alt="Logo">
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="text-[15px] font-medium">${row[1]?.companyName || ''}</div>
                                    <div class="text-[11px] font-normal text-[#1D222B80]">${row[1]?.companyId || ''}</div>
                                </div>
                            </div>`;
                }
            },
            {
                data: function(row) {
                    return `<div class="max-w-[157px] w-full flex items-center justify-center flex-col">
                                <div class="bg-table-hover w-[48px] h-[48px] rounded-[50%]">
                                    <div class="p-2">
                                        <img src="${row[2]?.logo || ''}" alt="Logo">
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="text-[15px] font-medium">${row[2]?.companyName || ''}</div>
                                    <div class="text-[11px] font-normal text-[#1D222B80]">${row[2]?.companyId || ''}</div>
                                </div>
                            </div>`;
                }
            },
            {
                data: function(row) {
                    return `<div class="max-w-[157px] w-full flex items-center justify-center flex-col">
                                <div class="bg-table-hover w-[48px] h-[48px] rounded-[50%]">
                                    <div class="p-2">
                                        <img src="${row[3]?.logo || ''}" alt="Logo">
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="text-[15px] font-medium">${row[3]?.companyName || ''}</div>
                                    <div class="text-[11px] font-normal text-[#1D222B80]">${row[3]?.companyId || ''}</div>
                                </div>
                            </div>`;
                }
            },
            {
                data: function(row) {
                    return `<div class="max-w-[157px] w-full flex items-center justify-center flex-col">
                                <div class="bg-table-hover w-[48px] h-[48px] rounded-[50%]">
                                    <div class="p-2">
                                        <img src="${row[4]?.logo || ''}" alt="Logo">
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="text-[15px] font-medium">${row[4]?.companyName || ''}</div>
                                    <div class="text-[11px] font-normal text-[#1D222B80]">${row[4]?.companyId || ''}</div>
                                </div>
                            </div>`;
                }
            },
            {
                data: function(row) {
                    return `<div class="max-w-[157px] w-full flex items-center justify-center flex-col">
                                <div class="bg-table-hover w-[48px] h-[48px] rounded-[50%]">
                                    <div class="p-2">
                                        <img src="${row[5]?.logo || ''}" alt="Logo">
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="text-[15px] font-medium">${row[5]?.companyName || ''}</div>
                                    <div class="text-[11px] font-normal text-[#1D222B80]">${row[5]?.companyId || ''}</div>
                                </div>
                            </div>`;
                }
            },
            {
                orderable: false,
                data: function() {
                    return `
                        <div class="text-base flex items-center cursor-pointer">
                            <div class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5"></div>
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
            // Hover effekti
            // $(row)
            //     .css('transition', 'background-color 0.2s ease')
            //     .on('mouseenter', function () {
            //         $(this).css('background-color', '#F5F5F5');
            //     })
            //     .on('mouseleave', function () {
            //         $(this).css('background-color', '');
            //     });
        
            /// Bütün td-lərə border alt
            $(row).find('td')
            .addClass('border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]')

            $(row).find('td:not(:last-child)')
                .css({
                    'padding-left': '20px',
                    'padding-top': '14.5px',
                    'padding-bottom': '14.5px'
                })
            
            // Sağ td (üç nöqtə): border ver
            $(row).find('td:last-child')
                .addClass('border-l-[.5px] border-stroke')
        },

        initComplete: function() {
            $('#myTable3 thead th').css({
                'padding-left': '20px',
                'padding-top': '10.5px',
                'padding-bottom': '10.5px'
            });

        
            $('#myTable3 thead th:last-child').css({
                'border-left': '0.5px solid #E0E0E0'
            });
        
        
            // Filtrləmə ikonları üçün mövcud kodun saxlanması
            $('#myTable3 thead th.filtering').each(function() {
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
            
           

            const colCount = $('#myTable3 thead th').length;
            const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
            $('#myTable3 tbody').prepend(spacerRow);

            // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
            const $lastRow = $('#myTable3 tbody tr:not(.spacer-row):last');

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
                <div  class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? 'opacity-50 cursor-not-allowed' : 'text-tertiary-text'}" 
                    onclick="changePage(${pageInfo.page + 1})">
                    <div class="icon stratis-chevron-right"></div>
                </div>
            `);
        }
    });

    // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
    $('#newCheckbox').on('change', function () {
        const isChecked = $(this).is(':checked');

        $('#myTable3 tbody input[type="checkbox"]').each(function () {
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
