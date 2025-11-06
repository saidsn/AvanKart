// Document ready - initialize events
$(document).ready(function() {
    // Tab click events
    $('#ferdi').on('click', function() {
        switchOperationsTab('ferdi');
    });
    
    $('#korporativ').on('click', function() {
        switchOperationsTab('korporativ');
    });
    
    // Default olarak Korporativ tab-ı aktiv et
    switchOperationsTab('korporativ');
});

// Əməliyyat Tarixçəsi - Fərdi/Korporativ Tab Management

let peopleOperationsPersonalTable = null;
window.peopleOperationsPersonalTable = null;
window.peopleOperationsFilters = window.peopleOperationsFilters || {};

// Tab switching functionality
function switchOperationsTab(tabType) {
    console.log('Switching to tab:', tabType);
    
    const ferdiBtn = document.getElementById('ferdi');
    const korporativBtn = document.getElementById('korporativ');
    const ferdiTable = document.getElementById('ferdiTable');
    const korporativTable = document.getElementById('korporativTable');
    const detailTable = document.getElementById('tranzaksiyaEmeliyyatTable');
    
    console.log('Found elements:', { ferdiBtn, korporativBtn, ferdiTable, korporativTable });
    
    if (tabType === 'ferdi') {
        // Fərdi tab aktiv
        ferdiBtn.classList.add('active', 'text-messages', 'bg-inverse-on-surface');
        ferdiBtn.classList.remove('text-tertiary-text');
        korporativBtn.classList.remove('active', 'text-messages', 'bg-inverse-on-surface');
        korporativBtn.classList.add('text-tertiary-text');
        
        // Tables göstər/gizlə
        ferdiTable.classList.remove('hidden');
        korporativTable.classList.add('hidden');
    if (detailTable) detailTable.classList.add('hidden'); // Şirkət detal cədvəlini gizlət
        
        console.log('Fərdi tab activated, initializing table...');
        
        // Fərdi table initialize et
        if (!peopleOperationsPersonalTable) {
            initPeopleOperationsPersonalTable();
        }
    } else {
        // Korporativ tab aktiv
        korporativBtn.classList.add('active', 'text-messages', 'bg-inverse-on-surface');
        korporativBtn.classList.remove('text-tertiary-text');
        ferdiBtn.classList.remove('active', 'text-messages', 'bg-inverse-on-surface');
        ferdiBtn.classList.add('text-tertiary-text');
        
        // Tables göstər/gizlə
        // Əgər detallı table açıqdırsa korporativ əsas cədvəlini yenidən göstərmək üçün onu da nəzərə al
        if (detailTable && !detailTable.classList.contains('hidden')) {
            // İstəyinizə görə burada detallı görünüşü saxlaya bilərik. Hazırda saxlayırıq.
        } else {
            korporativTable.classList.remove('hidden');
        }
        ferdiTable.classList.add('hidden');
        
        console.log('Korporativ tab activated, initializing table...');
        
        // Korporativ table initialize et
        if (!window.peopleOperationsCorporateTable) {
            initPeopleOperationsCorporateTable();
        }
    }
}

// Fərdi əməliyyatlar table initialize
function initPeopleOperationsPersonalTable() {
    const $table = $('#ferdiTable');
    if (!$.fn.DataTable) return;
    if ($.fn.DataTable.isDataTable($table)) peopleOperationsPersonalTable.destroy();

    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();

    peopleOperationsPersonalTable = $table.DataTable({
        serverSide: true,
        processing: true,
        searching: true,
        ordering: false,
        dom: "t",
        paging: true,
        pageLength: 15,
        lengthChange: false,
        language: {
            processing: 'Yüklənir...',
            zeroRecords: 'Nəticə yoxdur',
            info: '_TOTAL_ əməliyyatdan _START_ - _END_',
            infoEmpty: '0 nəticə',
            paginate: { previous: '<', next: '>' }
        },
        ajax: function(data, callback) {
            const payload = {
                draw: data.draw,
                start: data.start,
                length: data.length,
                search: data.search.value,
                ...window.peopleOperationsFilters
            };
            
            const url = `/istifadeci-hovuzu/people/${peopleId}/operations/personal/table`;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(payload)
            })
            .then(r => r.json())
            .then(json => {
                try {
                    const total = (typeof json.recordsTotal === 'number' ? json.recordsTotal : (json.recordsFiltered || (json.data ? json.data.length : 0)));
                    $('#operationsCount').text(total);
                } catch(e) { /* ignore */ }
                callback({
                    draw: json.draw,
                    recordsTotal: json.recordsTotal || 0,
                    recordsFiltered: json.recordsFiltered || 0,
                    data: json.data || []
                });
            })
            .catch(err => {
                callback({draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: []});
            });
        },
        columns: [
            { data: 'transaction_id', render: d => `<span class="font-medium">${d}</span>` },
            { data: 'destination' },
            { data: 'card_category', defaultContent: '' },
            { data: 'amount', render: (d, _, row) => formatOperationAmount(row) },
            { data: 'subject', defaultContent: '' },
            { data: 'date', defaultContent: '' },
            { data: 'status', render: d => formatOperationStatus(d) }
        ],
        createdRow: function(row) {
            $(row).addClass('bg-white dark:bg-menu-dark border-b-1 text-[13px]');
            $('td', row).addClass('px-5 py-4');
        }
    });

    window.peopleOperationsPersonalTable = peopleOperationsPersonalTable;
}

// Format functions
function formatOperationAmount(row) {
    const isIncome = row.destination === 'Mədaxil';
    const sign = isIncome ? '+' : '-';
    const cls = isIncome ? 'text-green-500' : 'text-red-500';
    return `<span class="${cls}">${sign} ${row.amount} AZN</span>`;
}

function formatOperationStatus(status) {
    const successCls = 'text-green-500';
    const failCls = 'text-red-500';
    if (!status) return '';
    const lower = status.toLowerCase();
    const pretty = status.charAt(0).toUpperCase() + status.slice(1);
    if (lower === 'uğurlu') return `<span class="${successCls}">${pretty}</span>`;
    if (lower === 'uğursuz') return `<span class="${failCls}">${pretty}</span>`;
    return `<span class="text-yellow-600">${pretty}</span>`;
}

// Refresh functionality
window.refreshPeopleOperations = function() {
    if (!peopleOperationsPersonalTable) return;
    const $btn = $('#operationsRefreshBtn');
    if ($btn.data('loading')) return;
    $btn.data('loading', true);
    
    const originalHtml = $btn.html();
    $btn.addClass('opacity-60 pointer-events-none');
    
    peopleOperationsPersonalTable.one('xhr', function() {
        $btn.removeClass('opacity-60 pointer-events-none');
        $btn.data('loading', false);
    });
    
    peopleOperationsPersonalTable.ajax.reload(null, false);
};

// Search functionality
$(document).on('keyup', '#customSearch', function() {
    const val = $(this).val();
    if (peopleOperationsPersonalTable) {
        peopleOperationsPersonalTable.search(val).draw();
    }
});

// Event listeners
$(document).on('click', '#ferdi', function() {
    switchOperationsTab('ferdi');
});

$(document).on('click', '#korporativ', function() {
    switchOperationsTab('korporativ');
});

// Korporativ əməliyyatlar table initialize
function initPeopleOperationsCorporateTable() {
    const $table = $('#korporativTable');
    if (!$.fn.DataTable) return;
    if ($.fn.DataTable.isDataTable($table)) {
        window.peopleOperationsCorporateTable.destroy();
    }

    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();

    window.peopleOperationsCorporateTable = $table.DataTable({
        serverSide: true,
        processing: true,
        searching: false, // Korporativ tab üçün axtarış deaktiv
        ordering: false,
        dom: "t",
        paging: true,
        pageLength: 15,
        lengthChange: false,
        language: {
            processing: 'Yüklənir...',
            zeroRecords: 'Şirkət tapılmadı',
            info: '_TOTAL_ şirkətdən _START_ - _END_',
            infoEmpty: '0 şirkət',
            paginate: { previous: '<', next: '>' }
        },
        ajax: {
            url: `/istifadeci-hovuzu/people/${peopleId}/operations/corporate/table`,
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'X-CSRF-Token': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: function(d) {
                return JSON.stringify({
                    draw: d.draw,
                    start: d.start,
                    length: d.length,
                    search: d.search?.value || '',
                    ...window.peopleOperationsFilters
                });
            },
            error: function(xhr, error, thrown) {
                console.error('Korporativ table AJAX xətası:', xhr.responseText);
            }
        },
    columns: [
            { 
                data: 'company_name', 
                title: "Müəssisə", 
                width: "20%",
                className: "text-left"
            },
            { 
                data: 'transaction_count', 
                title: "Tranzaksiya sayı", 
                width: "15%",
                className: "text-left"
            },
            { 
                data: 'total_expense', 
                title: "Məxaric(AZN)", 
                width: "15%",
                className: "text-left"
            },
            { 
                data: 'total_income', 
                title: "Mədaxil (AZN)", 
                width: "15%",
                className: "text-left"
            },
            { 
                data: 'start_date', 
                title: "Başlama tarixi", 
                width: "15%",
                className: "text-left"
            },
            { 
                data: 'end_date', 
        title: "Ayrılma tarixi", 
        width: "20%",
        className: "text-left"
            }
        ],
        createdRow: function(row, data, dataIndex) {
            $(row).addClass('bg-white dark:bg-menu-dark border-b-1 text-[13px]');
        },
        // Ətraflı column və handler çıxarıldı
    });

    // Sətir click - şirkət detay əməliyyatları
    $('#korporativTable tbody').off('click').on('click', 'tr', function() {
        const rowData = window.peopleOperationsCorporateTable.row(this).data();
        if (!rowData || !rowData.company_id) return;
        loadCompanyOperationsDetails(rowData.company_id);
    });

    console.log('Korporativ table initialized');
}

// Initialize on document ready
$(document).ready(function() {
    // Tab click events
    $('#ferdi').on('click', function() {
        switchOperationsTab('ferdi');
    });
    
    $('#korporativ').on('click', function() {
        switchOperationsTab('korporativ');
    });
    
    // Refresh button functionality
    $('#emeliyyatFilter').on('click', 'a:contains("Səhifəni yenilə")', function(e) {
        e.preventDefault();
        console.log('Refreshing operations tables...');
        
        // Active tab-a görə refresh et
        const ferdiTable = document.getElementById('ferdiTable');
        const korporativTable = document.getElementById('korporativTable');
        
        if (!ferdiTable.classList.contains('hidden') && peopleOperationsPersonalTable) {
            peopleOperationsPersonalTable.ajax.reload();
            console.log('Fərdi table refreshed');
        }
        
        if (!korporativTable.classList.contains('hidden') && window.peopleOperationsCorporateTable) {
            window.peopleOperationsCorporateTable.ajax.reload();
            console.log('Korporativ table refreshed');
        }
    });
    
    // Default Korporativ tab aktiv olduğunu dəyişək - Korporativ ilə başla
    switchOperationsTab('korporativ');
});

// Əməliyyat count display
window.updateOperationsCount = function(count) {
    $('#operationsCount').text(count || 0);
};

// Şirkət üçün detay əməliyyatları yüklə və göstər
function loadCompanyOperationsDetails(companyId) {
    window.currentCompanyForDetails = companyId;
    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const $detailsTable = $('#tranzaksiyaEmeliyyatTable');
    const $tbody = $detailsTable.find('tbody');
    $tbody.html('<tr><td colspan="7" class="text-center py-6 text-[13px]">Yüklənir...</td></tr>');
    $detailsTable.removeClass('hidden');

    fetch(`/istifadeci-hovuzu/people/${peopleId}/operations/corporate/company-table`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ company_id: companyId, draw: 1, start: 0, length: 50 })
    })
    .then(r => r.json())
    .then(json => {
        $tbody.empty();
        const rows = json.data || [];
        if (!rows.length) {
            $tbody.html('<tr><td colspan="7" class="text-center py-6 text-[13px]">Məlumat yoxdur</td></tr>');
            return;
        }
        rows.forEach(t => {
            const amountSign = t.destination === 'Mədaxil' ? '+' : '-';
            const amountCls = t.destination === 'Mədaxil' ? 'text-green-500' : 'text-red-500';
            let statusCls = 'text-yellow-600';
            if (t.status?.toLowerCase() === 'uğurlu') statusCls = 'text-green-500';
            else if (t.status?.toLowerCase() === 'uğursuz') statusCls = 'text-red-500';
            $tbody.append(`
                <tr class="bg-white dark:bg-menu-dark border-b-1 text-[13px]">
                    <td class="px-5 py-4 font-medium">${t.transaction_id || ''}</td>
                    <td class="px-5 py-4">${t.destination || ''}</td>
                    <td class="px-5 py-4">${t.card_category || ''}</td>
                    <td class="px-5 py-4 ${amountCls}">${amountSign} ${t.amount} AZN</td>
                    <td class="px-5 py-4">${t.subject || ''}</td>
                    <td class="px-5 py-4">${t.date || ''}</td>
                    <td class="px-5 py-4 ${statusCls}">${t.status || ''}</td>
                </tr>
            `);
        });
        // Tabları dəyiş: korporativ table gizlət, detal table göstər
        $('#korporativTable').addClass('hidden');
        $('#tranzaksiyaEmeliyyatTable').removeClass('hidden');
    })
    .catch(err => {
        console.error('Detay əməliyyat yükləmə xətası:', err);
        $tbody.html('<tr><td colspan="7" class="text-center py-6 text-[13px] text-red-500">Xəta baş verdi</td></tr>');
    });
}

// Filter modalında "Filterlə" düyməsi üçün istifadə olunan funksiyanı override edirik (mövcuddursa)
window.applyFilters = function() {
    const startDate = $('#startDate').val();
    const endDate = $('#endDate').val();
    const minVal = $('#min-value').data('raw');
    const maxVal = $('#max-value').data('raw');

    // Kart kateqoriyaları
    const cardCategoryIds = [];
    $('#operationsCardCategoriesContainer input[type="checkbox"]:checked').each(function(){
        cardCategoryIds.push($(this).val());
    });
    // Təyinat
    const destinations = [];
    $('.destination-filter:checked').each(function(){ destinations.push($(this).val()); });
    // Status
    const statuses = [];
    $('.status-filter:checked').each(function(){ statuses.push($(this).val()); });

    // Seçilmiş təyinat (destination) və status və kart kateqoriyası üçün ayrıca elementlər varsa burada oxumaq lazımdır.
    // (Hazır markup-da bunlar hələ əlavə edilməyib; əlavə olunduqda id/class vasitəsilə götürmək olar.)

    window.peopleOperationsFilters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minAmount: minVal,
        maxAmount: maxVal,
        cardCategories: cardCategoryIds.length ? cardCategoryIds : undefined,
        destinations: destinations.length ? destinations : undefined,
        statuses: statuses.length ? statuses : undefined
    };

    // Hansı görünüş aktivdirsə onu yenilə
    if (!$('#ferdiTable').hasClass('hidden') && window.peopleOperationsPersonalTable) {
        window.peopleOperationsPersonalTable.ajax.reload();
    } else if (!$('#tranzaksiyaEmeliyyatTable').hasClass('hidden')) {
        // Company detail view aktivdirsə yenidən yüklə (companyId saxlamalıyıq)
        if (window.currentCompanyForDetails) {
            loadCompanyOperationsDetails(window.currentCompanyForDetails);
        }
    } else if (!$('#korporativTable').hasClass('hidden') && window.peopleOperationsCorporateTable) {
        window.peopleOperationsCorporateTable.ajax.reload();
    }

    $('#filterPop').addClass('hidden');
};

window.clearFilters = function() {
    $('#startDate').val('');
    $('#endDate').val('');
    $('#operationsCardCategoriesContainer input[type="checkbox"]').prop('checked', false);
        $('.destination-filter, .status-filter').prop('checked', false);
    window.peopleOperationsFilters = {};
    if (window.peopleOperationsPersonalTable) window.peopleOperationsPersonalTable.ajax.reload();
    if (window.peopleOperationsCorporateTable) window.peopleOperationsCorporateTable.ajax.reload();
    if (window.currentCompanyForDetails) loadCompanyOperationsDetails(window.currentCompanyForDetails);
};

// Kart kateqoriyaları inline doldurulması
function populateCardCategories() {
    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();
    fetch(`/istifadeci-hovuzu/people/${peopleId}/operations/card-categories`)
        .then(r => r.json())
        .then(json => {
            const cont = $('#operationsCardCategoriesContainer');
            if (!json.success || !Array.isArray(json.cardCategories) || !json.cardCategories.length) {
                cont.html('<div class="text-sm text-gray-500 dark:text-gray-400 px-2 py-1">Tapılmadı</div>');
                return;
            }
            cont.empty();
            json.cardCategories.forEach(cat => {
                const id = `op-cat-${cat.id}`;
                cont.append(`
                    <label for="${id}" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                        <input type="checkbox" id="${id}" value="${cat.id}" class="peer hidden">
                        <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                            <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                        </div>
                        <div>${cat.name}</div>
                    </label>`);
            });
        })
        .catch(() => {
            $('#operationsCardCategoriesContainer').html('<div class="text-sm text-red-500 px-2 py-1">Xəta</div>');
        });
}

$(document).ready(function(){
        populateCardCategories();
});
