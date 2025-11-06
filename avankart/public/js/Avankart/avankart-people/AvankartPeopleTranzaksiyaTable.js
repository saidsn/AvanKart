let peopleTransactionsTable = null;
window.peopleTransactionsTable = null;
window.peopleTransactionsFilters = window.peopleTransactionsFilters || {};

function formatAmount(row){
    const isIncome = row.destination === 'Mədaxil';
    const sign = isIncome ? '+' : '-';
    const cls = isIncome ? 'text-massages' : 'text-red-500';
    return `<span class="${cls}">${sign} ${row.amount}</span>`;
}

function formatStatus(status){
    const successCls = 'text-green-500';
    const failCls = 'text-red-500';
    if(!status) return '';
    const lower = status.toLowerCase();
    const pretty = status.charAt(0).toUpperCase() + status.slice(1);
    if(lower === 'uğurlu') return `<span class="${successCls}">${pretty}</span>`;
    if(lower === 'uğursuz') return `<span class="${failCls}">${pretty}</span>`;
    return `<span class="text-yellow-600">${pretty}</span>`;
}

function initPeopleTransactionsTable(){
    const $table = $('#tranzaksiyaTable');
    if(!$.fn.DataTable){
        console.warn('DataTables plugin tapılmadı');
        return;
    }
    if($.fn.DataTable.isDataTable($table)){
        peopleTransactionsTable.destroy();
    }

    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();

    peopleTransactionsTable = $table.DataTable({
        serverSide: true,
        processing: true,
        searching: true,
        ordering: false,
        dom:"t",
        paging: true,
        pageLength: 15,
        lengthChange: false,
    language: {
            processing: 'Yüklənir...',
            zeroRecords: 'Nəticə yoxdur',
            info: '_TOTAL_ tranzaksiyadan _START_ - _END_',
            infoEmpty: '0 nəticə',
            paginate: { previous: '<', next: '>' }
        },
        ajax: function(data, callback){
            const payload = {
                draw: data.draw,
                start: data.start,
                length: data.length,
                search: data.search.value,
                
                ...window.peopleTransactionsFilters
            };
            const url = `/istifadeci-hovuzu/people/${peopleId}/transactions/table`;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(payload)
            })  
            .then(r=>r.json())
            .then(json=>{
                
                try {
                    const total = (typeof json.recordsTotal === 'number' ? json.recordsTotal : (json.recordsFiltered || (json.data ? json.data.length : 0)));
                    $('#transactionsCount').text(total);
                } catch(e){ /* ignore */ }
                callback({
                    draw: json.draw,
                        recordsTotal: json.recordsTotal || 0,
                        recordsFiltered: json.recordsFiltered || 0,
                        data: json.data || []
                });
            })
            .catch(err=>{
                console.error('Transactions fetch error', err, { url, peopleId, payload });
                callback({draw:data.draw, recordsTotal:0, recordsFiltered:0, data:[]});
            });
        },
        columns: [
            { data: 'transaction_id', render: d=> `<span class="font-medium">${d}</span>` },
            { data: 'destination' },
            { data: 'card_category', defaultContent: '' },
            { data: 'amount', render: (d,_,row)=> formatAmount(row) },
            { data: 'subject', defaultContent: '' },
            { data: 'date', defaultContent: '' },
            { data: 'status', render: d => formatStatus(d) }
        ],
        createdRow: function(row){
            $(row).addClass('bg-white dark:bg-menu-dark border-b-1 text-[13px]');
            $('td', row).addClass('px-5 py-4');
        }
    });
    window.peopleTransactionsTable = peopleTransactionsTable;
}

$(document).on('keyup', '#peopleTransactionsSearch', function(){
    const val = $(this).val();
    if(peopleTransactionsTable){
        peopleTransactionsTable.search(val).draw();
    }
});

function getPeopleTransRefreshBtn(){
    return $('#peopleTransactionsRefreshBtn');
}

function startRefreshLoading($btn){
    if(!$btn || !$btn.length) return;
    $btn.addClass('opacity-60 pointer-events-none');
    const $icon = $btn.find('.spin-icon');
    if($icon.length){
        $icon.addClass('animate-spin');
    }
}

function stopRefreshLoading($btn){
    if(!$btn || !$btn.length) return;
    $btn.removeClass('opacity-60 pointer-events-none');
    const $icon = $btn.find('.spin-icon');
    if($icon.length){
        $icon.removeClass('animate-spin');
    }
}

window.refreshPeopleTransactions = function(){
    if(!peopleTransactionsTable) return;
    const $btn = getPeopleTransRefreshBtn();
    if($btn.data('loading')) return;
    $btn.data('loading', true);
    startRefreshLoading($btn);
    peopleTransactionsTable.one('xhr', function(){
        stopRefreshLoading($btn);
        $btn.data('loading', false);
    });
    peopleTransactionsTable.ajax.reload(null, false);
};

$(document).on('click', '#peopleTransactionsRefreshBtn', function(e){
    e.preventDefault();
    window.refreshPeopleTransactions();
});

if (typeof window.openPeopleTransactionsFilter === 'undefined') {
    window.openPeopleTransactionsFilter = function() {
        if (window.openPeopleTransactionsFilter && typeof window.openPeopleTransactionsFilter === 'function') {
            window.openPeopleTransactionsFilter();
        } else {
            console.warn('transactionsFilter.js düzgün yüklənməyib');
        }
    };
}

$(document).ready(function(){
    initPeopleTransactionsTable();
});
