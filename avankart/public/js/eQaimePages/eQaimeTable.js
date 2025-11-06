$(document).ready(function () {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    // DataTable yaratmaq
    var table = $("#myTable").DataTable({
        paging: true,
        info: false,
        dom: "t",
        serverSide: true,
        processing: true,
        ajax: {
            url: "/qaime/table",
            type: "POST",
            headers: { "CSRF-Token": csrfToken },
            data: function (d) {
                const form = $("#filterPop");

                // Status filtri
                const checkedStatuses = [];
                form.find('input[name="status"]:checked').each(function () {
                    checkedStatuses.push($(this).val());
                });
                d.status = checkedStatuses;

                // Year filtri - backend tək year gözləyir
                const checkedYears = [];
                form.find('input[name="year[]"]:checked').each(function () {
                    checkedYears.push(parseInt($(this).val()));
                });
                if (checkedYears.length > 0) {
                    d.year = checkedYears[0]; // İlk seçilən ili gönder
                }

                // Month filtri - backend tək month gözləyir
                const checkedMonths = [];
                form.find('input[name="months[]"]:checked').each(function () {
                    checkedMonths.push(parseInt($(this).val()));
                });
                if (checkedMonths.length > 0) {
                    d.month = checkedMonths[0]; // İlk seçilən ayı gönder
                }

                // Slider - min/max məbləğ
                if ($("#slider-range").length && $("#slider-range").hasClass("ui-slider")) {
                    const sliderValues = $("#slider-range").slider("values");
                    d.min = sliderValues[0];
                    d.max = sliderValues[1];
                }

                // Axtarış
                d.search = $("#customSearch").val();

                // Pagination
                d.page = Math.floor(d.start / d.length) + 1;
                d.limit = d.length;
                d.draw = d.draw;

                return d;
            },
            dataSrc: function (json) {
                return json.data || [];
            },
            error: function (xhr, error, thrown) {
                console.error("AJAX ERROR:", xhr.responseText);
            }
        },

        columns: [
            {
                data: function (row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.qaime_id}</span>`;
                },
            },
            {
                data: function (row) {
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.total_balance}</span>`;
                },
            },
            {
                data: function (row) {
                    const date = row.createdAt ? new Date(row.createdAt) : null;
                    if (!date) return '';
                    const months = ['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr'];
                    const monthName = months[date.getMonth()]; // 0-11
                    return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal flex items-center justify-left">${monthName}</span>`;
                },
            },
            {
                data: function (row) {
                    let color = "";
                    switch ((row.status || "").toLowerCase()) {
                        case "active": color = "bg-[#4FC3F7]"; break;
                        case "passive": color = "bg-[#BDBDBD]"; break;
                        case "tamamlandı": color = "bg-[#66BB6A]"; break;
                        case "gözləyir": color = "bg-[#FFCA28]"; break;
                        case "report edildi": color = "bg-[#EF5350]"; break;
                        default: color = "bg-[#FF7043]";
                    }

                    return `
                        <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                            <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                            <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
                        </div>
                    `;
                },
            },
        ],
        order: [],
        lengthChange: false,
        pageLength: 10,

        createdRow: function (row, data) {
            // Hover effekti
            $(row).css("transition", "background-color 0.2s ease")
                .on("mouseenter", function () {
                    $(this).css("background-color", document.documentElement.classList.contains("dark") ? "#242C30" : "#FAFAFA");
                })
                .on("mouseleave", function () {
                    $(this).css("background-color", "");
                });

            $(row).find("td").addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");
            $(row).find("td:not(:last-child)").css({ "padding-left": "20px", "padding-top": "14.5px", "padding-bottom": "14.5px" });

            // Qaimə sətrinə klik edildikdə kartlar səhifəsinə yönləndir
            $(row).on("click", "td", function (e) {
                if ($(e.target).is("input, button, a, label")) return;
                
                // localStorage-ə seçilən qaiməni saxla
                localStorage.setItem("selectedInvoice", JSON.stringify(data));
                
                // /qaime/:qaime_id/kartlar səhifəsinə yönləndir
                window.location.href = `/qaime/${data.qaime_id}/kartlar`;
            });
        },

        initComplete: function () {
            $("#myTable thead th").css({ "padding-left": "20px", "padding-top": "10.5px", "padding-bottom": "10.5px" });

            $("#myTable thead th.filtering").each(function () {
                $(this).html('<div class="custom-header flex gap-2.5 items-center"><div>' + $(this).text() + '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>');
            });
        },

        drawCallback: function () {
            const api = this.api();
            const pageInfo = api.page.info();
            const $pagination = $("#customPagination");

            if (pageInfo.pages === 0) { $pagination.empty(); return; }

            $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
            $pagination.empty();

            // Səhifələmə düymələri
            $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0 ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed" : "text-messages dark:text-[#FFFFFF] cursor-pointer"}" onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                    <div class="icon stratis-chevron-left text-xs"></div>
                </div>
            `);

            var paginationButtons = '<div class="flex gap-2">';
            for (var i = 0; i < pageInfo.pages; i++) {
                paginationButtons += `<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ${i === pageInfo.page ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark" : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"}" onclick="changePage(${i})">${i + 1}</button>`;
            }
            paginationButtons += "</div>";
            $pagination.append(paginationButtons);

            $pagination.append(`
                <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed" : "text-messages dark:text-[#FFFFFF] cursor-pointer"}" ${pageInfo.page < pageInfo.pages - 1 ? `onclick="changePage(${pageInfo.page + 1})"` : ""}>
                    <div class="icon stratis-chevron-right text-xs"></div>
                </div>
            `);
        }
    });

    $("#newCheckbox").on("change", function () {
        const isChecked = $(this).is(":checked");
        $('#myTable tbody input[type="checkbox"]').each(function () {
            $(this).prop("checked", isChecked).trigger("change");
        });
    });

    $("#customSearch").on("keyup", function () {
        table.ajax.reload();
    });

    window.changePage = function (page) {
        table.page(page).draw("page");
    };

    $("#applyFilterBtn").on("click", function (e) {
        e.preventDefault();

        openFilterModal();

        table.ajax.reload();
    });
});