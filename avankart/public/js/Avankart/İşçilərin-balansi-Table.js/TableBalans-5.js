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
    let selectedCompany = "";
    let selectedYear = "";
    let selectedMonth = "";

    var table = $('#myTable3').DataTable({
        paging: true,
        info: false,
        dom: 't',
        data: activeData,
        columns: [
            {
                data: function (row) {
                    return `<div class="max-w-[157px] w-full flex items-center justify-center flex-col">
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
                data: function (row) {
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
                data: function (row) {
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
                data: function (row) {
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
                data: function (row) {
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
                data: function (row) {
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
                data: function () {
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
        createdRow: function (row, data, dataIndex) {
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
                .addClass('border-b-[.5px] border-stroke dark:border-[#FFFFFF1A] cursor-pointer')

            $(row).find('td:not(:last-child)')
                .css({
                    'padding-left': '20px',
                    'padding-top': '14.5px',
                    'padding-bottom': '14.5px'
                })

            // Sağ td (üç nöqtə): border ver
            $(row).find('td:last-child')
                .addClass('border-l-[.5px] border-stroke')

            $(row).find('td').each(function (cellIndex) {
                $(this).on("click", function () {
                    // Hər bir hüceyrənin index-i ilə uyğun şirkəti tap
                    let company = data[cellIndex];
                    if (company && company.companyName) {
                        showMonthsPopup(company.companyName);
                    }
                });
            });
        },

        initComplete: function () {
            $('#myTable3 thead th').css({
                'padding-left': '20px',
                'padding-top': '10.5px',
                'padding-bottom': '10.5px'
            });


            $('#myTable3 thead th:last-child').css({
                'border-left': '0.5px solid #E0E0E0'
            });


            // Filtrləmə ikonları üçün mövcud kodun saxlanması
            $('#myTable3 thead th.filtering').each(function () {
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

function updateMainTitle() {
    const mainTitle = document.getElementById("mainTitle");
    if (!selectedCompany) {
        mainTitle.innerHTML = 'Üzv şirkətlər (60)';
        mainTitle.className = "text-[15px] text-messages dark:text-primary-text-color-dark font-medium pt-[5px]"; 
        return;
    }

    let html = `
        <div class="flex items-center gap-2 bg-[#FAFAFA] rounded-lg px-4 py-2">
            <img src="/public/icons/calendar-07.svg" alt="calendar" class="w-[18px] h-[18px] mr-1" />
            <span class="font-medium text-[13px] text-[#161E22]">${selectedCompany} <span class="ml-1 text-[17px]">/</span></span>
    `;

    if (selectedYear) {
        html += `<span class="font-medium text-[13px] text-[#161E22]"> ${selectedYear}</span>`;
        if (selectedMonth) {
            html += `<span class="font-medium text-[13px] text-[#161E22]">- ${selectedMonth}</span>`;
        }
        
        html += `
            <button onclick="resetMainTitle()" class="ml-2 focus:outline-none">
                <img src="/public/images/Sorgular Pages Images/Close.svg" alt="close" class="w-[18px] h-[18px] cursor-pointer " />
            </button>
        `;
    }

    html += `</div>`;

    mainTitle.innerHTML = html;
    mainTitle.className = ""; 
}

// Başlığı sıfırlayan funksiya
function resetMainTitle() {
    selectedCompany = "";
    selectedYear = "";
    selectedMonth = "";
    updateMainTitle();
    // Əlavə olaraq balansı gizlət, table-i göstər:
    $('#balanceTableContainer').hide();
    $('#myTable3Container').show();
}

function showMonthsPopup(companyName) {
    selectedCompany = companyName;
    selectedYear = "";
    selectedMonth = "";
    updateMainTitle();
    const oldPopup = document.getElementById('monthsPopup');
    if (oldPopup) oldPopup.remove();

    $('#myTable3Container').show();
    $('#balanceTableContainer').hide();

    // Yeni popup əlavə et
    const popupHtml = `
    <div id="monthsPopup" class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1198px] h-[621px] bg-body-bg dark:bg-side-bar-item-dark text-messages border-[3px] border-[#0000001A] dark:border-[#FFFFFF1A] shadow-md rounded-2xl z-101 p-6">
        <div>
            <div class="flex items-center justify-between">
                <h2 class="text-[15px] font-semibold text-messages dark:text-primary-text-color-dark">
                <img src="/public/icons/arrow-left-sm.svg" alt="Arrow" class="inline-block w-[14px] h-[14px] mr-2 cursor-pointer" onclick="closeMonthsPopup()">
                    İllər
                </h2>
                <img src="/public/images/Sorgular Pages Images/Close.svg" alt="Close" class="cursor-pointer dark:hidden" onclick="closeMonthsPopup()">
                <img src="/public/images/avankart-partner-pages-images/Close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" onclick="closeMonthsPopup()">
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-5 gap-5 pt-4">
                    ${[2024, 2023, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999].map(year => `
                        <div class="text-left ml-2 cursor-pointer" onclick="openMonthsPopup('${year}')">
                            <h3 class="text-[15px] font-medium text-messages dark:text-primary-text-color-dark">${year}</h3>
                            <p class="text-[11px] text-[#1D222B80] dark:text-secondary-text-color-dark mt-2">150 invoys</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHtml);
}

// İllərə klikləyəndə aylar popup-u açılır
function openMonthsPopup(year) {
    selectedYear = year;
    selectedMonth = "";
    updateMainTitle();
    const oldPopup = document.getElementById('monthsPopup');
    if (oldPopup) oldPopup.remove();

    $('#myTable3Container').show();
    $('#balanceTableContainer').hide();

    const months = [
        { name: "Yanvar", count: 9 },
        { name: "Fevral", count: 700 },
        { name: "Mart", count: 600 },
        { name: "Aprel", count: 300 },
        { name: "May", count: 150 },
        { name: "İyun", count: 150 },
        { name: "İyul", count: 150 },
        { name: "Avqust", count: 150 },
        { name: "Sentyabr", count: 150 },
        { name: "Oktyabr", count: 150 },
        { name: "Noyabr", count: 150 },
        { name: "Dekabr", count: 150 }
    ];

    const popupHtml = `
    <div id="monthsPopup" class="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1198px] h-[621px] bg-body-bg dark:bg-side-bar-item-dark text-messages border-[3px] border-[#0000001A] dark:border-[#FFFFFF1A] shadow-md rounded-2xl z-101 p-6">
        <div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <button onclick="goBackToYears()" class="cursor-pointer w-[10px] h-[8px]">
                        <div class="icon stratis-arrow-left text-messages dark:text-primary-text-color-dark "></div>
                    </button>
                    <h2 class="text-[15px] font-semibold text-messages dark:text-primary-text-color-dark mt-2 ml-2">
                        Aylar</h2>
                </div>
                <img src="/public/images/Sorgular Pages Images/Close.svg" alt="Close" class="cursor-pointer dark:hidden" onclick="closeMonthsPopup()">
                <img src="/public/images/avankart-partner-pages-images/Close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" onclick="closeMonthsPopup()">
            </div>
            <div class="mt-6 ml-3">
                <h3 class="text-[13px] font-medium text-[#1D222B80] dark:text-primary-text-color-dark ">${year}</h3>
                <div class="grid grid-cols-4 gap-5 pt-5">
                    ${months.map(m => `
                        <div class="text-left cursor-pointer" onclick="openMonthTable('${year}', '${m.name}')">
                            <h3 class="text-[15px] font-medium text-messages dark:text-primary-text-color-dark">${m.name}</h3>
                            <p class="text-[11px] text-[#1D222B80] dark:text-secondary-text-color-dark mt-2">${m.count} invoys</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHtml);
}


function openMonthTable(year, month) {
    selectedYear = year;
    selectedMonth = month;
    updateMainTitle();

    // Popup-u tam bağla
    $('#invoyspopup').hide();
    // Popup-un içindəki table-i gizlət
    $('#monthsPopup').remove();
    $('#myTable3Container').hide();
    // Əsas balans container-i göstər
    $('#balanceTableContainer').show();
    $('#overlay').remove();

    
}



function goBackToYears() {
    showMonthsPopup();
}

function closeMonthsPopup() {
    const popup = document.getElementById('monthsPopup');
    if (popup) popup.remove();
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.remove();
}

