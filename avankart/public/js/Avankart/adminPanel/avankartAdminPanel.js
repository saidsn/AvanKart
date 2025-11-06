$(document).ready(function () {
    const myData = [
        {
            name: "Ramin Orucov",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "16.12.1997",
            AuthorityGroup: "UX Designer",
            email: "ramin.orucvvv@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
        {
            name: "İsa Sadıqlı",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "06.08.2002",
            AuthorityGroup: "Front-end developer",
            email: "isasadigli@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
        {
            name: "İbrahim Feyzullazadə",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "16.01.1998",
            AuthorityGroup: "UX Designer",
            email: "ibrahimfeyzullazade@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
        {
            name: "Ramin Orucov",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "06.08.2002",
            AuthorityGroup: "UX Designer",
            email: "ramin.orucvvv@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
        {
            name: "İsa Sadıqlı",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "06.08.2002",
            AuthorityGroup: "Front-end developer",
            email: "isasadigli@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
        {
            name: "İbrahim Feyzullazadə",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "16.01.1998",
            AuthorityGroup: "UX Designer",
            email: "ibrahimfeyzullazade@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
        {
            name: "Ramin Orucov",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "16.01.1998",
            AuthorityGroup: "UX Designer",
            email: "ramin.orucvvv@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },

        {
            name: "İbrahim Feyzullazadə",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "16.01.1998",
            AuthorityGroup: "UX Designer",
            email: "ibrahimfeyzullazade@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
        {
            name: "Ramin Orucov",
            id: "PA-XXXXXX",
            gender: "Kişi",
            date: "16.01.1998",
            AuthorityGroup: "UX Designer",
            email: "ramin.orucvvv@gmail.com",
            phone: "+994 50 770 35 22",
            status: "Aktiv",
        },
    ];

    const table = $("#myTable").DataTable({
        paging: true,
        info: false,
        dom: "t",
        data: myData,
        columns: [

            {
                data: function (row) {
                    return `
                        <div class="flex items-center gap-3 ml-3">
                            <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                                ${row.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-messages text-[13px] font-medium dark:text-white text-left">${row.name
                        }</span>
                                    <span class="text-secondary-text text-[11px] font-normal dark:text-white text-left">ID: ${row.id}</span>
                               
                            </div>
                        </div>
                    `;
                },
            },
            {
                data: function (row) {
                    return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.gender}</span>`;
                },
            },
            {
                data: function (row) {
                    return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.date}</span>`;
                },
            },
            {
                data: function (row) {
                    return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.AuthorityGroup}</span>`;
                },
            },
            {
                data: function (row) {
                    return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.email}</span>`;
                },
            },

            {
                data: function (row) {
                    return `<span class="text-[13px] text-messages  font-normal dark:text-white">${row.phone}</span>`;
                },
            },

            {
                data: function (row) {
                    let color = "";
                    switch (row.status) {
                        case "Aktiv":
                            color = "bg-[#4FC3F7]"; // mavi
                            break;
                        case "Qaralama":
                            color = "bg-[#BDBDBD]"; // boz
                            break;
                        case "Tamamlandı":
                            color = "bg-[#66BB6A]"; // yaşıl
                            break;
                        case "Gözləyir":
                            color = "bg-[#FFCA28]"; // sarı
                            break;
                        case "Report edildi":
                            color = "bg-[#EF5350]"; // qırmızı
                            break;
                        default:
                            color = "bg-[#FF7043]"; // narıncı (digər)
                    }

                    return `
             <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
            </div>
            `;
                },
            },
            {
                orderable: false,
                data: function (row, type, set, meta) {
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
                    <div class="relative w-[211px] border-[#0000001A] border-[0.5px]
                        shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-white z-0">
                     
                           <div onclick="clickhesabTesdiqi()" class="flex items-center  my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                            transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                            <div class="icon stratis-password-01 mt-[6px] w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                            <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Şifrəni sıfırla</span>
                        </div>
                        <div onclick="clickmaildeyish()" class="flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                            transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                            <div class="icon stratis-mail-01 mt-1 w-[12px] h-[9px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                            <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Mail adresini dəyiş</span>
                        </div>
                               <div onclick="clickTwoStepVerification()" class="flex items-center my-1 py-[3.5px] pl-[12px] cursor-pointer h-[28px] hover:bg-item-hover
                            transition ease-out duration-300 active:bg-item-hover disabled:bg-none">
                            <div class="icon stratis-lock-02 mt-1 w-[12px] h-[9px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                            <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">2 addımlı doğrulamanı ləğv et</span>
                        </div>
                        <div onclick="clickDeaktiv()" class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                            ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg">
                            <div class="icon stratis-minus-circle-contained  w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                            <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Deaktiv et</span>
                        </div>
                            <div class="h-[0.5px] bg-[#0000001A]"></div>
                        <div onclick="clickSilinmeMuraciet()" class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition
                            ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg">
                            <div class="icon stratis-trash-01  w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                            <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Silinmə üçün müraciət et</span>
                        </div>
                    </div>
                </div>
            </div>
                    `;
                },
            },
        ],

        order: [],
        lengthChange: false,
        pageLength: 10,
        createdRow: function (row, data, dataIndex) {
            // Hover effect
            $(row)
                .css("transition", "background-color 0.2s ease")
                .on("mouseenter", function () {
                    $(this).css("background-color", "#F5F5F5");
                })
                .on("mouseleave", function () {
                    $(this).css("background-color", "");
                });

            // Add border to all td elements
            $(row).find("td").addClass("border-b-[.5px] border-stroke cursor-pointer");

            $(row).find("td:not(:first-child):not(:last-child)").css({
                "padding-left": "20px",
                "padding-top": "14.5px",
                "padding-bottom": "14.5px",
            });


            $("#myTable thead th:last-child").css({
                "border-left": "0.5px solid #E0E0E0",
            });

            $("#myTable thead th:first-child label").css({
                margin: "0 auto",
                display: "flex",
                "justify-content": "center",
                "align-items": "center",
            });

            // Style first cell (checkbox)
            $(row).find("td:first-child").css({
                "padding-left": "0",
                "padding-right": "0",
                width: "48px",
                "text-align": "center",
            });

            // Center checkbox label
            $(row).find("td:first-child label").css({
                margin: "0",
                display: "inline-flex",
                "justify-content": "center",
                "align-items": "center",
            });

            // Style last cell (three dots)
            $(row)
                .find("td:last-child")
                .addClass("border-l-[.5px] border-stroke")
                .css({
                    "padding-right": "0",
                    "text-align": "right",
                    position: "relative", // Important for dropdown positioning
                });
        },

        initComplete: function () {
            $("#myTable thead th").css({
                "padding-left": "20px",
                "padding-top": "10.5px",
                "padding-bottom": "10.5px",
            });

            // Style table headers


            $("#myTable thead th:last-child").css({
                "border-left": "0.5px solid #E0E0E0",
            });

            $("#myTable thead th:first-child label").css({
                margin: "0 auto",
                display: "flex",
                "justify-content": "center",
                "align-items": "center",
            });

            // Add filtering icons to headers
            $("#myTable thead th.filtering").each(function () {
                $(this).html(
                    '<div class="custom-header flex gap-1 items-center"><div>' +
                    $(this).text() +
                    '</div><div class="icon p-2 stratis-sort-vertical-02 mt-1 ml-1 text-messages"></div></div>'
                );
            });
        },
        drawCallback: function () {
            var api = this.api();
            var pageInfo = api.page.info();
            var $pagination = $("#customPagination");

            if (pageInfo.pages === 0) {
                $pagination.empty();
                return;
            }

            // Update page count display
            $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
            $pagination.empty();

            // Add spacer row
            $("#myTable tbody tr.spacer-row").remove();
            const colCount = $("#myTable thead th").length;
            const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
            $("#myTable tbody").prepend(spacerRow);

            // Style the last row
            const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
            $lastRow.find("td").css({
                "border-bottom": "0.5px solid #E0E0E0",
            });
            $lastRow.find("td:last-child").css({
                "border-left": "0.5px solid #E0E0E0",
            });

            // Create pagination
            $pagination.append(`
                <div class="flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ${pageInfo.page === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "text-messages"
                }"
                    onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left !h-[12px] !w-[7px]"></div>
                </div>
            `);

            var paginationButtons = '<div class="flex gap-2">';
            for (var i = 0; i < pageInfo.pages; i++) {
                paginationButtons += `
                    <button class="cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages
                            ${i === pageInfo.page
                        ? "bg-[#F6D9FF] text-messages"
                        : "bg-transparent text-tertiary-text"
                    }"
                            onclick="changePage(${i})">${i + 1}</button>
                `;
            }
            paginationButtons += "</div>";
            $pagination.append(paginationButtons);

            $pagination.append(`
                <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${pageInfo.page === pageInfo.pages - 1
                    ? "opacity-50 cursor-not-allowed"
                    : "text-tertiary-text"
                }"
                    onclick="changePage(${Math.min(
                    pageInfo.pages - 1,
                    pageInfo.page + 1
                )})">
                    <div class="icon stratis-chevron-right !h-[12px] !w-[7px]"></div>
                </div>
            `);
        },
    });




    // Handle search input
    $("#customSearch").on("keyup", function () {
        table.search(this.value).draw();
    });

    // Page change function
    window.changePage = function (page) {
        table.page(page).draw("page");
    };

    // Handle dropdown menu clicks
    // Handle dropdown menu clicks
    $(document).on("click", ".dropdown-trigger", function (e) {
        e.stopPropagation();
        const rowId = $(this).data("row");

        // Hide all other dropdowns first
        $(".dropdown-menu").addClass("hidden");

        // Show this dropdown
        const $dropdown = $(`#dropdown-${rowId}`);
        $dropdown.removeClass("hidden");

        // Position the dropdown menu correctly
        const $trigger = $(this);

        // Position the dropdown relative to its parent cell
        $dropdown.css({
            top: "30px", // Position it directly below the trigger
            right: "22px", // Align to right edge of the cell
            left: "auto", // Clear any left positioning
        });

        // Make the parent cell position relative to contain the absolute dropdown
        $trigger.parent().css("position", "relative");
    });

    // Close dropdown when clicking elsewhere
    $(document).on("click", function () {
        $(".dropdown-menu").addClass("hidden");
    });

    // Handle "Aç" (Open) button click
    $(document).on("click", ".open-action", function (e) {
        e.stopPropagation();
        const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
        // Add your "open" action here
        console.log(`Open action for row ${rowId}`);
        $(".dropdown-menu").addClass("hidden");
    });

    // Handle "Cihazı sil" (Delete device) button click
    $(document).on("click", ".delete-action", function (e) {
        e.stopPropagation();
        const rowId = $(this).closest(".dropdown-menu").attr("id").split("-")[1];
        // Add your "delete" action here
        console.log(`Delete action for row ${rowId}`);
        $(".dropdown-menu").addClass("hidden");
    });

    // Prevent dropdown from closing when clicking inside it
    $(document).on("click", ".dropdown-menu", function (e) {
        e.stopPropagation();
    });
});



$(document).ready(function () {
 

    $('#myTable tbody').on('click', 'tr', function (e) {
        
        if (
            $(e.target).closest('.dropdown-trigger').length ||
            $(e.target).closest('.dropdown-menu').length ||
            $(e.target).hasClass('icon')
        ) return;

      
        if ($(this).hasClass('spacer-row')) return;

        // DataTable row-un data-sını götür
        const rowData = $("#myTable").DataTable().row(this).data();
        if (!rowData) return;

        window.location.href = '/views/Avankart/adminPanel/adminPanelSorgular.html?id=' + encodeURIComponent(rowData.id);
    });


});

