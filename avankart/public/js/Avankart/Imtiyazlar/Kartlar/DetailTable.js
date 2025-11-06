$(document).ready(function () {
    // Sample data for different tabs
    const aktivlerData = [
        {
            id: "AP-XXXXXXXXXX",
            name: "Ramin Orucov",
            mail: "ramin.orujovv@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Veysəloğlu MMC",
            dateofactivation: "12.02.2023",
            status: "active"
        },
        {
            id: "AP-XXXXXXXXXX",
            name: "İsa Sadiqli",
            mail: "isasadigli@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Socar",
            dateofactivation: "15.02.2023",
            status: "active"
        },
        {
            id: "AP-XXXXXXXXXX",
            name: "İbrahim Feyzullazadə",
            mail: "ibrahimfeyzullazadeh@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Kapital Bank",
            dateofactivation: "09.02.2023",
            status: "active"
        },
        // Add more data as needed...
    ];

    const deaktivlerData = [
        {
            id: "AP-XXXXXXXXXX",
            name: "Ramin Orucov",
            mail: "ramin.orujovv@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Veysəloğlu MMC",
            dateofdeactivation: "12.02.2023",
            status: "inactive"
        },
        {
            id: "AP-XXXXXXXXXX",
            name: "İsa Sadiqli",
            mail: "isasadigli@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Socar",
            dateofdeactivation: "15.02.2023",
            status: "inactive"
        },
        // Add more data as needed...
    ];

    const reddEdilenlerData = [
        {
            id: "AP-XXXXXXXXXX",
            name: "Ramin Orucov",
            mail: "ramin.orujovv@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Veysəloğlu MMC",
            dateofrejection: "12.02.2023",
            status: "rejected"
        },
        {
            id: "AP-XXXXXXXXXX",
            name: "İsa Sadiqli",
            mail: "isasadigli@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Socar",
            dateofrejection: "15.02.2023",
            status: "rejected"
        },
        // Add more data as needed...
    ];

    const muracietlerData = [
        {
            id: "AP-XXXXXXXXXX",
            name: "Ramin Orucov",
            mail: "ramin.orujovv@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Veysəloğlu MMC",
            requestType: "Kartın deaktiv edilməsi",
            requestDate: "12.02.2023",
            status: "request",
            requestTypeColor: "error"
        },
        {
            id: "AP-XXXXXXXXXX",
            name: "İsa Sadiqli",
            mail: "isasadigli@gmail.com",
            phone: "+994 50 770 35 22",
            companyName: "Socar",
            requestType: "Kartın aktivləşdirilməsi",
            requestDate: "15.02.2023",
            status: "request",
            requestTypeColor: "success"
        },
        // Add more data as needed...
    ];

    let currentTable = null;
    let activeTab = 'aktivler';

    // Function to get dropdown content based on tab
    function getDropdownContent(tabType, row, idx) {
        switch (tabType) {
            case 'aktivler':
                return `
                    <div class="bg-body-bg z-50">
                        <div class="flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                        <div class="icon stratis-file-check-02 w-[13px] h-[13px]  mr-2 text-on-surface-variant-dark !disabled:text-on-surface-variant-dark"></div>
                        <span class="text-[13px] font-medium !text-on-surface-variant-dark">Təsdiqlə</span>
                    </div>
                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                    <div onclick="clickDeaktiv()" class="flex items-center py-[3.5px] z-101 bg-body-bg mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                        ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                        <div class="icon stratis-minus-circle-contained w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                        <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Deaktiv et</span>
                    </div>
                    </div>
                `;

            case 'deaktivler':
                return `
                    <div class="bg-body-bg z-50 w-[211px] h-[68px]">
                        <div class="flex items-center my-1 py-[5px] pl-[12px] cursor-pointer  hover:bg-item-hover
                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                        <div class="icon stratis-file-check-02 !w-[13px] !h-[13px]  mr-2 text-messages !disabled:text-on-surface-variant-dark"></div>
                        <span class="text-[13px] font-medium !text-messages">Kartı aktivləşdir</span>
                    </div>
                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                    <div class="flex items-center py-[3.5px] z-101 bg-body-bg mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                        ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                        <div class="icon stratis-minus-circle-contained w-[13px] h-[13px] text-[#BFC8CC] mr-[9px] disabled:text-on-surface-variant-dark"></div>
                        <span class="text-[13px] text-[#BFC8CC] font-medium disabled:text-on-surface-variant-dark">Kartı deaktiv et</span>
                    </div>
                    </div>
                `;

            case 'muracietler':
                return `
                    <div class="bg-body-bg z-50 w-[211px] h-[68px]">
                        <div class="flex items-center my-1 py-[5px] pl-[12px] cursor-pointer  hover:bg-item-hover
                        transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                        <div class="icon stratis-file-check-02 !w-[13px] !h-[13px]  mr-2 text-messages !disabled:text-on-surface-variant-dark"></div>
                        <span class="text-[13px] font-medium !text-messages">Təsdiqlə</span>
                    </div>
                    <div class="h-[0.5px] bg-[#0000001A]"></div>
                    <div onclick="clickDeaktiv()" class="flex items-center py-[3.5px] z-101 bg-body-bg mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                        ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                        <div class="icon stratis-minus-circle-contained w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                        <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Rədd et</span>
                    </div>
                    </div>
                `;

            default:
                return '';
        }
    }

    // Function to create table columns based on tab type
    function getTableColumns(tabType) {
        const baseColumns = [
            {
                data: function(row) {
                    return `
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                                ${row.name.split(' ').map(w => w[0]).join('')}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-messages text-[13px] font-medium dark:text-white text-left">${row.name}</span>
                                <span class="text-secondary-text text-[11px] font-normal dark:text-white text-left">ID: ${row.id}</span>
                            </div>
                        </div>
                    `;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.mail}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.phone}</span>`;
                }
            },
            {
                data: function(row) {
                    return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.companyName}</span>`;
                }
            }
        ];

        // Add tab-specific columns
        switch (tabType) {
            case 'aktivler':
                baseColumns.push({
                    data: function(row) {
                        return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.dateofactivation}</span>`;
                    }
                });
                break;

            case 'deaktivler':
                baseColumns.push({
                    data: function(row) {
                        return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.dateofdeactivation}</span>`;
                    }
                });
                break;

            case 'redd':
                baseColumns.push({
                    data: function(row) {
                        return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.dateofrejection}</span>`;
                    }
                });
                // No action column for rejected items
                return baseColumns;

            case 'muracietler':
                baseColumns.push(
                    {
                        data: function(row) {
                            const colorClass = row.requestTypeColor === 'error' ? 'text-error' : 'text-[#5BBE2D]';
                            return `<span class="text-[13px] ${colorClass} font-normal dark:text-white">${row.requestType}</span>`;
                        }
                    },
                    {
                        data: function(row) {
                            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.requestDate}</span>`;
                        }
                    }
                );
                break;
        }

        // Add action column (except for rejected items)
        if (tabType !== 'redd') {
            baseColumns.push({
                orderable: false,
                data: function(row, type, set, meta) {
                    const idx = meta.row;
                    const dropdownContent = getDropdownContent(tabType, row, idx);

                    return `
                        <div class="text-base flex items-center cursor-pointer dropdown-trigger" data-row="${idx}" data-status="${row.status}">
                            <div class="icon stratis-dot-vertical !text-messages !w-5 h-5 dark:text-white"></div>
                            <div class="dropdown-menu hidden absolute z-50" id="dropdown-${tabType}-${idx}">
                                <div class="absolute top-[-10.5px] right-[0px] transform -translate-x-1/2 z-10">
                                    <img src="/public/images/avankart-partner-pages-images/Polygon 1.svg"
                                         alt="polygon"
                                         class="w-[14px] h-[12px]">
                                </div>
                                <div class="relative w-[211px]
                                    shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-transparent z-0">
                                    ${dropdownContent}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        }

        return baseColumns;
    }

    // Function to initialize a DataTable
    function initializeTable(tableId, tabType, data, hasPagination = true) {
        const tableConfig = {
            paging: hasPagination,
            info: false,
            dom: 't',
            data: data,
            columns: getTableColumns(tabType),
            order: [],
            lengthChange: false,
            pageLength: 10,
            createdRow: function(row, data, dataIndex) {
                // Hover effect
                $(row)
                    .css('transition', 'background-color 0.2s ease')
                    .on('mouseenter', function () {
                        $(this).css('background-color', '#F5F5F5');
                    })
                    .on('mouseleave', function () {
                        $(this).css('background-color', '');
                    });

                // Add border to all td elements
                $(row).find('td')
                    .addClass('border-b-[.5px] border-stroke')

                $(row).find('td:not(:first-child):not(:last-child)')
                    .css({
                        'padding-left': '20px',
                        'padding-top': '14.5px',
                        'padding-bottom': '14.5px'
                    });

                // Style first cell
                $(row).find('td:first-child')
                    .css({
                        'padding-left': '20px',
                        'padding-top': '14.5px',
                        'padding-bottom': '14.5px'
                    });

                // Style last cell (if exists)
                if ($(row).find('td:last-child').length && tabType !== 'redd') {
                    $(row).find('td:last-child')
                        .addClass('border-l-[.5px] border-stroke')
                        .css({
                            'padding-right': '20px',
                            'text-align': 'center',
                            'position': 'relative'
                        });
                }
            },

            initComplete: function() {
                $(`#${tableId} thead th`).css({
                    'padding-left': '20px',
                    'padding-top': '10.5px',
                    'padding-bottom': '10.5px'
                });

                // Add filtering icons to headers
                $(`#${tableId} thead th.filtering`).each(function() {
                    $(this).html('<div class="custom-header flex gap-2.5 items-center"><div>' + $(this).text() + '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>');
                });
            },

            drawCallback: function () {
                if (!hasPagination) return;

                var api = this.api();
                var pageInfo = api.page.info();
                var $pagination = $('#customPagination');

                if (pageInfo.pages === 0) {
                    $pagination.empty();
                    return;
                }

                // Update page count display
                $("#pageCount").text((pageInfo.page + 1) + " / " + pageInfo.pages);
                $pagination.empty();

                // Add spacer row
                $(`#${tableId} tbody tr.spacer-row`).remove();
                const colCount = $(`#${tableId} thead th`).length;
                const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
                $(`#${tableId} tbody`).prepend(spacerRow);

                // Style the last row
                const $lastRow = $(`#${tableId} tbody tr:not(.spacer-row):last`);
                $lastRow.find('td').css({
                    'border-bottom': '0.5px solid #E0E0E0',
                });
                if (tabType !== 'redd') {
                    $lastRow.find('td:last-child').css({
                        'border-left': '0.5px solid #E0E0E0'
                    });
                }

                // Create pagination
                $pagination.append(`
                    <div class="flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ${pageInfo.page === 0 ? 'opacity-50 cursor-not-allowed' : 'text-messages'}"
                        onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                        <div class="icon stratis-chevron-left !h-[12px] !w-[7px]"></div>
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
                        onclick="changePage(${Math.min(pageInfo.pages - 1, pageInfo.page + 1)})">
                        <div class="icon stratis-chevron-right !h-[12px] !w-[7px]"></div>
                    </div>
                `);
            }
        };

        return $(`#${tableId}`).DataTable(tableConfig);
    }

    // Initialize all tables
    const aktivlerTable = initializeTable('aktivlerTable', 'aktivler', aktivlerData, true);
    const deaktivlerTable = initializeTable('deaktivlerTable', 'deaktivler', deaktivlerData, true);
    const reddEdilenlerTable = initializeTable('reddEdilenlerTable', 'redd', reddEdilenlerData, false);
    const muracietlerTable = initializeTable('muracietlerTable', 'muracietler', muracietlerData, false);

    // Set initial table
    currentTable = aktivlerTable;

    // Tab switching functionality
    $('.support-type').on('click', function() {
        // Remove active class from all tabs
        $('.support-type').removeClass('active bg-inverse-on-surface text-messages').addClass('text-tertiary-text');

        // Add active class to clicked tab
        $(this).addClass('active bg-inverse-on-surface text-messages').removeClass('text-tertiary-text');

        // Hide all tables
        $('#aktivlerTable, #deaktivlerTable, #reddEdilenlerTable, #muracietlerTable').addClass('hidden');

        // Show pagination by default
        $('#paginationContainer').show();

        // Show appropriate table based on clicked tab
        const tabId = $(this).attr('id');

        switch(tabId) {
            case 'AllSupport': // Aktivlər
                $('#aktivlerTable').removeClass('hidden');
                currentTable = aktivlerTable;
                activeTab = 'aktivler';
                break;

            case 'ActiveSupport': // Deaktivlər
                $('#deaktivlerTable').removeClass('hidden');
                currentTable = deaktivlerTable;
                activeTab = 'deaktivler';
                break;

            case 'NonactiveSupport': // Rədd edilənlər
                $('#reddEdilenlerTable').removeClass('hidden');
                currentTable = reddEdilenlerTable;
                activeTab = 'redd';
                $('#paginationContainer').hide(); // Hide pagination for this tab
                break;

            case 'DeletedSupport': // Müraciətlər
                $('#muracietlerTable').removeClass('hidden');
                currentTable = muracietlerTable;
                activeTab = 'muracietler';
                $('#paginationContainer').hide(); // Hide pagination for this tab
                break;
        }

        // Redraw current table to update pagination
        if (currentTable) {
            currentTable.draw();
        }
    });

    // Handle search input
    $('#customSearch').on('keyup', function () {
        if (currentTable) {
            currentTable.search(this.value).draw();
        }
    });

    // Fixed page change function
    window.changePage = function (page) {
        if (currentTable && (activeTab === 'aktivler' || activeTab === 'deaktivler')) {
            currentTable.page(page).draw('page');
        }
    };

    // Handle GO button for pagination input
    $('.go-button').on('click', function(e) {
        e.preventDefault();
        const pageInput = $('.page-input').val();
        const pageNumber = parseInt(pageInput) - 1; // Convert to 0-based index

        if (currentTable && !isNaN(pageNumber) && pageNumber >= 0) {
            const pageInfo = currentTable.page.info();
            if (pageNumber < pageInfo.pages) {
                currentTable.page(pageNumber).draw('page');
            }
        }
        $('.page-input').val(''); // Clear input
    });

    // Handle Enter key in pagination input
    $('.page-input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            $('.go-button').click();
        }
    });

    // Handle dropdown menu clicks
    $(document).on('click', '.dropdown-trigger', function(e) {
        e.stopPropagation();
        const $this = $(this);
        const rowid = $this.data('row');
        const tablePrefix = activeTab === 'aktivler' ? 'aktivlerTable' :
                           activeTab === 'deaktivler' ? 'deaktivlerTable' :
                           activeTab === 'muracietler' ? 'muracietlerTable' : '';

        // Hide all other dropdowns first
        $('.dropdown-menu').addClass('hidden');

        // Show this dropdown
        const $dropdown = $(`#dropdown-${activeTab}-${rowid}`);
        $dropdown.removeClass('hidden');

        // Position the dropdown menu correctly
        $dropdown.css({
            top: '30px',
            right: '22px',
            left: 'auto'
        });

        // Make the parent cell position relative to contain the absolute dropdown
        $this.parent().css('position', 'relative');
    });

    // Close dropdown when clicking elsewhere
    $(document).on('click', function() {
        $('.dropdown-menu').addClass('hidden');
    });

    // Handle action button clicks
    $(document).on('click', '.open-action', function(e) {
        e.stopPropagation();
        const dropdownId = $(this).closest('.dropdown-menu').attr('id');
        const parts = dropdownId.split('-');
        const tabType = parts[1];
        const rowid = parts[2];

        console.log(`${tabType === 'aktivler' ? 'Təsdiqlə' : tabType === 'deaktivler' ? 'Kartı aktivləşdir' : 'Təsdiqlə'} action for row ${rowid} in ${tabType} tab`);
        $('.dropdown-menu').addClass('hidden');
    });

    $(document).on('click', '.delete-action', function(e) {
        e.stopPropagation();
        const dropdownId = $(this).closest('.dropdown-menu').attr('id');
        const parts = dropdownId.split('-');
        const tabType = parts[1];
        const rowid = parts[2];

        console.log(`${tabType === 'aktivler' ? 'Deaktiv et' : tabType === 'deaktivler' ? 'Kartı deaktiv et' : 'Rədd et'} action for row ${rowid} in ${tabType} tab`);
        $('.dropdown-menu').addClass('hidden');
    });

    // Prevent dropdown from closing when clicking inside it
    $(document).on('click', '.dropdown-menu', function(e) {
        e.stopPropagation();
    });
});