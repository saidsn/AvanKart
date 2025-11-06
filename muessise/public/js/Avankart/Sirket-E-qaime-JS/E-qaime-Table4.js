$(document).ready(function () {
    // Verilənlər

    const myData = [
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2023, Sentyabr",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
        },
        {
            logo: "/public/images/Avankart/Sirket/Veyseloglu.svg",
            companyName: "Veysəloğlu",
            companyId: "CM-XXXXXXXX",
            ReceiptNumber: "EQA-XXXXXXXXXX",
            amount: "3.500.00",
            date: "2024, Yanvar",
            status: "Aktiv"
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
                    return `<div class="flex items-center gap-2.5">
                    <div class="bg-table-hover w-[40px] h-[40px] rounded-[50%]">
                        <div class="p-2">
                            <img src="${row.logo}" alt="Logo">
                        </div>
                    </div>
                    <div>
                        <div class="text-[13px] font-medium">${row.companyName}</div>
                        <div class="text-[11px] text-messages opacity-65 font-normal">ID: <span class="opacity-100">${row.companyId}</span></div>
                    </div>
                </div>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.ReceiptNumber}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal flex items-center justify-left">${row.amount}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.date} ₼</span>`;
                }
            },
            {
            data: function(row) {
                let color = '';
                switch (row.status) {
                case "Aktiv":
                    color = 'bg-[#4FC3F7]'; // mavi
                    break;
                case "Qaralama":
                    color = 'bg-[#BDBDBD]'; // boz
                    break;
                case "Tamamlandı":
                    color = 'bg-[#66BB6A]'; // yaşıl
                    break;
                case "Gözləyir":
                    color = 'bg-[#FFCA28]'; // sarı
                    break;
                case "Report edildi":
                    color = 'bg-[#EF5350]'; // qırmızı
                    break;
                default:
                    color = 'bg-[#FF7043]'; // narıncı (digər)
                }
            
                return `
                 <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                    <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
                </div>
                `;
            }
            },
            {
                orderable: false,
                data: function(row, type, set, meta) {
                    const idx = meta.row;
                    return `
                        <div class="text-base flex items-center cursor-pointer dropdown-trigger" data-row="${idx}">
                            <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-white"></div>
                            <div class="dropdown-menu hidden absolute z-50" id="dropdown-${idx}">
                                <div class="absolute top-[-11.5px] right-[0px] transform -translate-x-1/2 z-10">
                                    <img src="../../../public/images/avankart-partner-pages-images/Polygon 1.svg"
                                         alt="polygon"
                                         class="w-[14px] h-[12px]">
                                </div>
                                <div class="relative w-[103px] h-[74px] border-[#0000001A] border-[0.5px]
                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
                                    <div class="flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                                        <div class="icon stratis-cursor-06 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                                        <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Aç</span>
                                    </div>
                                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                                    <div class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                                        ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                                        <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                                        <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Cihazı sil</span>
                                    </div>
                                </div>
                            </div>
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
            
            // Sağ td (üç nöqtə): border ver
            $(row).find('td:last-child')
                .addClass('border-l-[.5px] border-stroke')
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