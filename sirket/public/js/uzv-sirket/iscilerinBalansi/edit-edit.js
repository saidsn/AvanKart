document.addEventListener('DOMContentLoaded', function() {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    const addedPermissionGroup = document.getElementById('addedPermissionGroup');
    const selectAllCheckbox = document.getElementById('newCheckbox1');
    const itemCheckboxes = document.querySelectorAll('[data-type="permCheckbox"]');

    let columnValues = {};
    let dataTableInstances = {}; // DataTable instance'larını saklayacağız
    let hiddenRowsState = {}; // Her tablo için gizli satırları saklayacağız
    let lineCountByTable = {}; // Her tablo için line count'unu saklayacağız

    // Checkbox durumlarını takip etmek için yeni obje
    window.permCheckboxStates = {};

    // Global helper fonksiyonlar
    function addRedLine(rowId) {
        const tr = document.getElementById('tr_row_id_' + rowId);
        if (!tr) return;
        
        let line = document.getElementById('is_deleted_line_' + rowId);
        if (!line) {
            line = document.createElement('div');
            line.id = 'is_deleted_line_' + rowId;
            line.style.cssText = "position:absolute;top:50%;left:0;right:0;height:2px;background:#ef4444;transform:translateY(-50%);pointer-events:none;z-index:1000;";
            tr.appendChild(line);
        }
    }

    function removeRedLine(rowId) {
        const line = document.getElementById('is_deleted_line_' + rowId);
        if (line) line.remove();
    }

    function updateCheckboxState(rowId, isHidden) {
        const checkbox = document.getElementById('is_deleted_' + rowId);
        if (checkbox) checkbox.checked = isHidden;
    }

    function updateLineCount(tableKey) {
        const count = Object.keys(hiddenRowsState[tableKey] || {}).filter(
            rowId => hiddenRowsState[tableKey][rowId]
        ).length;
        lineCountByTable[tableKey] = count;
    }

    // PermId'yi target-id'den çıkaran yardımcı fonksiyon
    function extractPermIdFromTargetId(targetId) {
        // target_created_<%=perm._id%> formatından perm._id'yi çıkar
        const match = targetId.match(/target_created_(.+)$/);
        return match ? match[1] : null;
    }

    // Checkbox durumunu kontrol eden fonksiyon
    function isPermCheckboxChecked(permId) {
        return permCheckboxStates[permId] || false;
    }

    // Global toggleRowVisibility fonksiyonu - BALANCE HESAPLAMASINI EKLEDIK
    window.toggleRowVisibility = function(rowId, currentTableId) {
        
        const tr = document.getElementById('tr_row_id_' + rowId);
        const checkbox = document.getElementById('is_deleted_' + rowId);
        if (!tr || !checkbox) {
            console.log('TR veya checkbox bulunamadı:', tr, checkbox);
            return;
        }

        // tableKey'i doğru şekilde belirle
        const tableKey = currentTableId ? currentTableId.replace('#', '') : 'unknown';
        const currentState = hiddenRowsState[tableKey] && hiddenRowsState[tableKey][rowId];
        const newState = !currentState;

        // State'i güncelle
        if (!hiddenRowsState[tableKey]) hiddenRowsState[tableKey] = {};
        hiddenRowsState[tableKey][rowId] = newState;

        // Visual değişiklikleri uygula
        tr.classList.toggle('row-hidden', newState);
        updateCheckboxState(rowId, newState);

        if (newState) {
            addRedLine(rowId);
        } else {
            removeRedLine(rowId);
        }

        // Line count'unu güncelle
        updateLineCount(tableKey);
        
        // BALANCE HESAPLAMASINI EKLEDIK - Tüm kartlar için balance'ı yeniden hesapla
        const permId = tableKey.replace('perm_user_table_', '');
        sirketCards.forEach(card => {
            calculateBalance(permId, card._id);
            updateBalanceDisplay(permId, card._id);
        });
    };

    window.updateTableVisibility = (id, show = false, permName) => {
        if (!id) return;

        let element = document.getElementById(id);
        let amountId = id.split('_').pop();
        
        if (!element) {
            // sadece ilk sefer
            element = document.createElement('div');
            element.id = id;
            element.innerHTML = balanceTemplate.replaceAll('__AMOUNT_ID__', amountId);
            addedPermissionGroup.appendChild(element);
            $('#permName_update_'+amountId).html(permName);

            element.querySelectorAll('.toggle-section').forEach(section => {
                section.addEventListener('click', function() {
                    const target = document.getElementById(this.dataset.targetId);
                    if (target) target.classList.toggle('hidden');
                });
            });

            const tableId = `#perm_user_table_` + amountId;
            drawTable(tableId, amountId);
        } 
        // toggle için sadece class toggle yap
        element.classList.toggle('hidden', !show);
    }

    

    // SelectAll checkbox event listener'ı güncellendi
    selectAllCheckbox.addEventListener('change', function() {
        const checked = this.checked;
        itemCheckboxes.forEach(cb => {
            cb.checked = checked;
            
            // PermId'yi al
            const permId = extractPermIdFromTargetId(cb.dataset.targetId);
            if (permId) {
                permCheckboxStates[permId] = checked;
            }
            
            if(!cb.checked){
                const target = document.getElementById(cb.dataset.targetId);
                if (target) target.remove();
            }
            updateTableVisibility(cb.dataset.targetId, checked, cb.dataset.permName);
        });
        
        // Tüm hesaplamaları yeniden yap
        recalculateAllBalances();
    });

    // Item checkbox event listener'ları güncellendi
    itemCheckboxes.forEach(cb => {
        // Başlangıçta checkbox durumunu kaydet
        const permId = extractPermIdFromTargetId(cb.dataset.targetId);
        if (permId) {
            permCheckboxStates[permId] = cb.checked;
        }
        
        cb.addEventListener('change', () => {
            // PermId'yi al ve durumu güncelle
            const permId = extractPermIdFromTargetId(cb.dataset.targetId);
            if (permId) {
                permCheckboxStates[permId] = cb.checked;
            }
            
            const allChecked = [...itemCheckboxes].every(c => c.checked);
            selectAllCheckbox.checked = allChecked;
            updateTableVisibility(cb.dataset.targetId, cb.checked, cb.dataset.permName);
            
            // Bu perm için hesaplamaları yeniden yap
            if (permId) {
                sirketCards.forEach(card => {
                    calculateBalance(permId, card._id);
                    updateBalanceDisplay(permId, card._id);
                });
            }
        });
    });

    // Tüm hesaplamaları yeniden yapan fonksiyon
    function recalculateAllBalances() {
        Object.keys(permCheckboxStates).forEach(permId => {
            sirketCards.forEach(card => {
                calculateBalance(permId, card._id);
                updateBalanceDisplay(permId, card._id);
            });
        });
    }

    // Card columns template
    const cardColumns = sirketCards.map(card => ({
        data: function(row) {
            // Değeri önce cache'den kontrol et, sonra row verisinden al
            const cardId = card._id;
            const permId = row.imtiyaz;
            const userId = row._id;
            const generalKey = `${cardId}_${permId}`;
            const specificKey = `${cardId}_${permId}_${userId}`;
            
            // Önce specific key'i kontrol et, sonra general key'i, en son boş string
            const currentValue = columnValues[specificKey] !== undefined ? 
                columnValues[specificKey] : 
                (columnValues[generalKey] !== undefined ? columnValues[generalKey] : '');

            return `
                <div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden 
                    focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] 
                    focus-within:ring-0 focus-within:outline-none 
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300 
                    hover:bg-input-hover dark:hover:bg-input-hover-dark">
                    <input data-card-id="${cardId}" data-perm-id="${permId}" data-user-id="${userId}" 
                           type="number" placeholder="0.00" value="${currentValue}"
                           class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0 
                           text-[13px] text-messages dark:text-primary-text-color-dark 
                           placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                    <div class="absolute right-3">
                        <div class="dark:text-primary-text-color-dark"><span>₼</span></div>
                    </div>
                </div>`;
        },
        name: 'card_id_rand_' + card._id
    }));

    function drawTable(tableId, amountId) {
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }

        const dt = $(tableId).DataTable({
            paging: true,
            searching: false,
            info: false,
            lengthChange: false,
            pageLength: 1,
            dom: "tp",
            processing: true,
            serverSide: true,
            ajax: {
                url: "/isci/isciler-table-perm",
                type: "POST",
                headers: { "CSRF-Token": csrfToken },
                data: function(d) {
                    d.id = amountId;
                    return d;
                }
            },
            columns: [
                {
                    data: row => `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.people_id}</span>`,
                    name: "people_id"
                },
                {
                    data: row => `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.name} ${row.surname ?? ''}</span>`,
                    name: "name"
                },
                {
                    data: row => `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.dutyData}</span>`,
                    name: "dutyData"
                },
                ...cardColumns,
                {
                    data: function(row, type, set, meta) {
                        const eyeClass = row.isHidden ? "iconex-hide-1" : "iconex-eye-1";
                        const eyeOpacity = row.isHidden ? "opacity-30" : "opacity-100";
                        return `
                            <div class="flex justify-center">
                                <input type="checkbox" class="hidden" data-hidden-toggle="true" data-row-id="${row._id}" data-user-id="${row.id}" data-table-id="#perm_user_table_${row.imtiyaz}" id="is_deleted_${row._id}" ${row.isHidden ? 'checked' : ''}>
                                <label id="eye-${meta.row}" onclick="this.previousElementSibling.click()">
                                    <div class="icon ${eyeClass} cursor-pointer text-messages dark:text-primary-text-color-dark ${eyeOpacity} !w-[18px] !h-[18px]"></div>
                                </label>
                            </div>`;
                    },
                    name: 'icon'
                }
            ],
            createdRow: function(row, data) {
                if (data.isHidden) $(row).addClass("row-hidden");
                $(row).css({ position: "relative" }).attr("id", "tr_row_id_" + data._id);
                $(row).find("td").addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");
                $(row).find("td:last-child").addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]");
                
                // Saklanan hidden state'i kontrol et ve line'ı ekle
                const tableKey = tableId.replace('#', '');
                if (hiddenRowsState[tableKey] && hiddenRowsState[tableKey][data._id]) {
                    $(row).addClass('row-hidden');
                    // Line'ı ekle
                    setTimeout(() => {
                        addRedLine(data._id);
                        updateCheckboxState(data._id, true);
                    }, 0);
                }
            },
            rowCallback: function(row, data) {
                // Önceki eventleri kaldırıp yeniden ekle
                $(row).find('input[data-card-id][data-perm-id]').off('input').on('input', function() {
                    data.value = $(this).val();
                });
            }
        });

        // DataTable instance'ını sakla
        dataTableInstances[tableId] = dt;
        
        // Bu tablo için line count'unu initialize et
        const tableKey = tableId.replace('#', '');
        if (!lineCountByTable[tableKey]) {
            lineCountByTable[tableKey] = 0;
        }
        if (!hiddenRowsState[tableKey]) {
            hiddenRowsState[tableKey] = {};
        }
    }

    // Line count'larını almak için global fonksiyonlar
    window.getLineCountForTable = function(tableId) {
        const tableKey = tableId.replace('#', '');
        return lineCountByTable[tableKey] || 0;
    };

    window.getAllLineCounts = function() {
        return { ...lineCountByTable };
    };

    window.getHiddenRowsForTable = function(tableId) {
        const tableKey = tableId.replace('#', '');
        const hiddenRows = hiddenRowsState[tableKey] || {};
        return Object.keys(hiddenRows).filter(rowId => hiddenRows[rowId]);
    };

    document.addEventListener("input", e => {
        const target = e.target;
        if (!target.matches("input[data-card-id][data-perm-id]")) return;

        target.dataset.value = target.value;

        const cardId = target.dataset.cardId;
        const permId = target.dataset.permId;
        const userId = target.dataset.userId;
        const key = userId ? `${cardId}_${permId}_${userId}` : `${cardId}_${permId}`;
        columnValues[key] = target.value;
        calculateBalance(permId, cardId);
        updateBalanceDisplay(permId, cardId);
    });

    document.addEventListener('change', e => {
        if(e.target.matches('input[data-hidden-toggle]')) {
            const rowId = e.target.dataset.rowId;
            const tableId = e.target.dataset.tableId;
            toggleRowVisibility(rowId, tableId);
        }
    });

    // Geliştirilmiş updateTableColumn fonksiyonu
    window.updateTableColumn = (cardId, permId, value, syncAll = true) => {
        const generalKey = `${cardId}_${permId}`;
        columnValues[generalKey] = value;

        const tableId = `#perm_user_table_${permId}`;
        
        // Eğer DataTable henüz oluşturulmamışsa, sadece cache'i güncelle
        if (!dataTableInstances[tableId]) {
            return;
        }

        const dt = dataTableInstances[tableId];

        // Tüm kullanıcılar için cache değerlerini güncelle
        // Bu, render edilmemiş satırlar için değerleri saklar
        if (dt.ajax.json() && dt.ajax.json().data) {
            dt.ajax.json().data.forEach(rowData => {
                const userId = rowData._id;
                const specificKey = `${cardId}_${permId}_${userId}`;
                columnValues[specificKey] = value;
            });
        }

        if (!syncAll) return;

        // DataTable'ı yeniden çiz - bu sayede tüm satırlar güncel değerlerle render edilir
        dt.draw(false); // false parametresi sayfanın aynı kalmasını sağlar

        // Aynı zamanda mevcut DOM inputlarını da güncelle (anında görünüm için)
        dt.rows({ page: 'current' }).nodes().to$()
            .find(`input[data-card-id="${cardId}"][data-perm-id="${permId}"]`)
            .each((_, input) => {
                input.value = value;
                input.dataset.value = value;
            });

        calculateBalance(permId, cardId);
        updateBalanceDisplay(permId, cardId);
    };

    // Build: { perm_id: [permId...], cards: { [cardId]: { users: { [userId]: { [permId]: value }}}}}
    window.saveThisTable = (main = {}, colVal = null, hid = {}) => {
        const main_values = main ?? {};      // perm_id -> { card_id: value }
        const exceptions = {};       // perm_id -> { user_id: { card_id: value } }
        const hidden = {};
        
        for (const [key, value] of Object.entries(colVal || columnValues || {})) {
            const parts = key.split("_");
            if (parts.length === 2) {
                // cardId_permId - main card value
                const cardId = parts[0];
                const permId = parts[1];
                
                // Checkbox kontrolü - sadece checked olanları ekle
                if (isPermCheckboxChecked(permId)) {
                    if (!main_values[permId]) {
                        main_values[permId] = {};
                    }
                    main_values[permId][cardId] = value;
                    
                    console.log(`Main value - PermId: ${permId}, CardId: ${cardId}, Value: ${value}`);
                }
                
            } else if (parts.length === 3) {
                // cardId_permId_userId - user specific value
                const cardId = parts[0];
                const permId = parts[1];
                const userId = parts[2];
                
                // Checkbox kontrolü - sadece checked olanları ekle
                if (isPermCheckboxChecked(permId)) {
                    if (!exceptions[permId]) {
                        exceptions[permId] = {};
                    }
                    if (!exceptions[permId][userId]) {
                        exceptions[permId][userId] = {};
                    }
                    exceptions[permId][userId][cardId] = value;
                }
            }
        }

        // Hidden state'leri topla - sadece checked olan permler için
        for (const tableKey in hiddenRowsState) {
            if (tableKey.startsWith('perm_user_table_')) {
                const permId = tableKey.replace('perm_user_table_', '');
                // Checkbox kontrolü - sadece checked olanları ekle
                if (isPermCheckboxChecked(permId)) {
                    hidden[permId] = hiddenRowsState[tableKey];
                }
            }
        }

        const result = {
            main_values: main_values,
            exceptions: exceptions,
            hidden: hidden
        };

        console.log('SaveThisTable result with checkbox filtering:', result);
        return result;
    };

    window.sendToServer = async () => {
        try {
            const btn = event?.target || document.activeElement;
            if (btn && btn.tagName === 'BUTTON') {
                btn.disabled = true;
                btn.style.opacity = '0.7';
            }

            let result = window.saveThisTable && window.saveThisTable();
            result = await Promise.resolve(result);

            const meta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = meta ? meta.getAttribute('content') : '';
            const response = await fetch('/people/add-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "CSRF-Token": csrfToken,
                },
                body: JSON.stringify(result)
            });

            const data = await response.json().catch(() => null);

            let message = '';
            if (!response.ok) {
                message = (data && (data.message || data.error || data.msg)) || `Server error: ${response.status}`;
                if (typeof alertModal === 'function') {
                    alertModal(message, 'error');
                } else {
                    alert(message);
                }
                if (btn && btn.tagName === 'BUTTON') {
                    btn.disabled = false;
                    btn.style.opacity = '';
                }
            } else {
                // uğurlu cavab
                message = (data && (data.message || data.msg)) || 'Əməliyyat uğurla həyata keçirildi.';
                if (typeof alertModal === 'function') {
                    alertModal(message);
                } else {
                    alert(message);
                }
                if (btn && btn.tagName === 'BUTTON') {
                    btn.disabled = false;
                    btn.style.opacity = '';
                }
            }

        } catch (err) {
            console.error('sendToServer error:', err);
            const msg = err?.message || 'Naməlum xəta baş verdi';
            if (typeof alertModal === 'function') {
                alertModal(msg, 'error');
            } else {
                alert(msg);
            }
        } finally {
            try {
                const btn = event?.target || document.activeElement;
                if (btn && btn.tagName === 'BUTTON') {
                    btn.disabled = false;
                    btn.style.opacity = '';
                }
            } catch (e) {
                console.error('Error occurred while enabling button:', e);
            }
        }
    };

    let kartlarBalance = {};

    // YENİ BALANCE DISPLAY GÜNCELLEME FONKSİYONU
    window.updateBalanceDisplay = (permId, cardId, kartsBalances = {}) => {
        const balance = calculateBalance(permId, cardId);
        const displayElement = document.getElementById(`total_for_card_${permId}_${cardId}`);
        if (displayElement) {
            // NaN kontrolü ekle
            const safeBalance = isNaN(balance) ? 0 : balance;
            displayElement.textContent = safeBalance.toFixed(2);
            if (!kartlarBalance[permId]) kartlarBalance[permId] = {};
            kartlarBalance[permId][cardId] = safeBalance;
        }
        
        // Toplam balance'ı da güncelle
        updateTotalBalance(permId);
    }

    // TOPLAM BALANCE GÜNCELLEME FONKSİYONU
    window.updateTotalBalance=(permId) => {
        let totalBalance = 0;
        sirketCards.forEach(card => {
            const cardBalance = calculateBalance(permId, card._id);
            // NaN kontrolü ekle
            totalBalance += isNaN(cardBalance) ? 0 : cardBalance;
        });
        
        // Toplam balance'ı göster (template'te uygun element varsa)
        const totalElement = document.querySelector(`#permName_update_${permId}`).closest('.bg-table-hover').querySelector('.text-tertiary-text .font-medium');
        if (totalElement) {
            const safeTotalBalance = isNaN(totalBalance) ? 0 : totalBalance;
            totalElement.textContent = `${safeTotalBalance.toFixed(2)} ₼`;
        }
        updateAllTotal();
    }

    // GENEL TOPLAMLAR
    window.updateAllTotal = function() {
        // Kart bazlı toplamları hesapla - SADECE CHECKED OLAN PERMLERDE
        let kartBazliToplamlar = {}; // {cardId: toplamBalance}

        // sirketCards'ı initialize et
        sirketCards.forEach(card => {
            kartBazliToplamlar[card._id] = 0;
        });

        Object.entries(kartlarBalance).forEach(([permId, cardsObj]) => {
            // Checkbox kontrol et - sadece checked olanları dahil et
            if (isPermCheckboxChecked(permId)) {
                Object.entries(cardsObj).forEach(([cardId, balance]) => {
                    if (!kartBazliToplamlar[cardId]) kartBazliToplamlar[cardId] = 0;
                    kartBazliToplamlar[cardId] += balance;
                });
            }
        });

        // Her kart için DOM'a yaz
        sirketCards.forEach(card => {
            const cardId = card._id;
            const toplam = kartBazliToplamlar[cardId] || 0;
            const cardElement = document.getElementById(`total_card_balance_${cardId}`);
            if (cardElement) {
                cardElement.textContent = `${toplam.toFixed(2)} ₼`;
            }
        });

        // Tüm kartların genel toplamı
        const kartlarGenelToplam = Object.values(kartBazliToplamlar)
            .reduce((sum, val) => sum + val, 0);

        console.log("Kartlar üzerinden genel toplam (sadece checked permler):", kartlarGenelToplam.toFixed(2));

        const genelElement = document.getElementById("total_card_balancelar");
        if (genelElement) {
            genelElement.textContent = `${kartlarGenelToplam.toFixed(2)} ₼`;
        }
    }

    // DÜZENLENMİŞ calculateBalance FONKSİYONU - CHECKBOX KONTROLÜ EKLENDİ
    window.calculateBalance = (permId, cardId) => {
        // Önce checkbox kontrol et - eğer checked değilse 0 döndür
        if (!isPermCheckboxChecked(permId)) {
            return 0;
        }

        // saveThisTable fonksiyonundan data al
        const data = window.saveThisTable();
        
        // DataTable'dan totalRecords al
        const tableId = "#perm_user_table_" + permId;
        
        if (!dataTableInstances[tableId]) {
            return 0;
        }
        
        const dataTable = dataTableInstances[tableId];
        const pageInfo = dataTable.page.info();
        const totalRecords = pageInfo ? pageInfo.recordsTotal : 0;
        // Hidden kullanıcı sayısını al
        const hiddenUsers = data.hidden[permId] || {};
        const hiddenUserIds = Object.keys(hiddenUsers).filter(userId => hiddenUsers[userId]);
        const hiddenCount = hiddenUserIds.length;
        
        // Aktif (hidden olmayan) kullanıcı sayısını hesapla
        const activeUserCount = totalRecords - hiddenCount;
        
        // Main value'yu al ve NaN kontrolü yap
        let mainValue = 0;
        if (data.main_values[permId] && data.main_values[permId][cardId]) {
            const parsedValue = parseFloat(data.main_values[permId][cardId]);
            mainValue = isNaN(parsedValue) ? 0 : parsedValue;
        }
        
        // Ana total balance hesapla (mainValue * activeUserCount)
        let totalBalance = mainValue * activeUserCount;
        
        // Exceptions kontrolü
        if (data.exceptions[permId]) {
            const exceptions = data.exceptions[permId];
            
            console.log(`Checked permId ${permId} - Hidden users:`, hiddenUsers);
            console.log(`Active user count: ${activeUserCount} (Total: ${totalRecords}, Hidden: ${hiddenCount})`);
            
            // Her user için kontrol et
            for (const userId in exceptions) {
                // Eğer user hidden değilse (true olmayan)
                if (!hiddenUsers[userId]) {

                    // Bu user'ın bu cardId için exception value'su var mı?
                    if (exceptions[userId][cardId] !== undefined) {
                        const parsedExceptionValue = parseFloat(exceptions[userId][cardId]);
                        const exceptionValue = isNaN(parsedExceptionValue) ? 0 : parsedExceptionValue;
                        
                        // Main value'yu çıkar, exception value'yu ekle
                        totalBalance = totalBalance - mainValue + exceptionValue;
                        
                        console.log(`User ${userId}: removed main value ${mainValue}, added exception value ${exceptionValue}`);
                        console.log(`New total balance: ${totalBalance}`);
                    }
                } else {
                    console.log(`User ${userId} is hidden, skipping from balance calculation...`);
                }
            }
        }
        
        // Final NaN kontrolü
        const finalBalance = isNaN(totalBalance) ? 0 : totalBalance;
        
        console.log(`Final total balance for ${permId}.${cardId}: ${finalBalance} (Active users: ${activeUserCount}) (Checkbox checked: ${isPermCheckboxChecked(permId)})`);
        return finalBalance;
    };

    function totalBalanceUpdate() {
        // perm cards totalları class ilə seçməli valuesini götürməlidir
        // bunları toplamalıdır və cardlar üzrə aşağıda yazmalıdır.
    }
});

const balanceTemplate = `
<div class="bg-table-hover dark:bg-table-hover-dark px-3 rounded-lg">
  <div class="w-full py-3 flex justify-between items-center border-b border-stroke dark:border-surface-variant-dark">
    <h3 class="text-[15px] font-medium text-messages dark:text-primary-text-color-dark" id="permName_update___AMOUNT_ID__">
      Add balance
    </h3>
    <div class="flex items-center gap-2 cursor-pointer toggle-section dark:text-primary-text-color-dark" data-target-id="perm_target___AMOUNT_ID__">
      <div class="text-[13px] font-normal text-tertiary-text dark:text-tertiary-text-color-dark">
        Məbləğ: <span class="font-medium text-messages dark:text-primary-text-color-dark">0 ₼</span>
      </div>
      <div class="icon stratis-chevron-up rotate-180 text-[10px] mb-1 toggle-icon"></div>
    </div>
  </div>

  <div class="flex items-center justify-start text-[13px] py-3 text-tertiary-text dark:text-tertiary-text-color-dark gap-3">
    ${sirketCards.map((card, ic) => `
      <div class="flex items-center gap-2">
        <span>${card.name}:</span>
        <span class="font-medium text-messages dark:text-primary-text-color-dark">
          <span id="total_for_card___AMOUNT_ID___${card._id}">0</span> ₼
        </span>
      </div>
      ${ic < sirketCards.length - 1 ? '<span class="text-stroke dark:text-surface-variant-dark">|</span>' : ''}
    `).join('')}
  </div>

  <div id="perm_target___AMOUNT_ID__" class="hidden flex flex-col border-t border-stroke dark:border-surface-variant-dark py-3">
    <div class="flex justify-start gap-4">
      ${sirketCards.map(card => `
        <div class="flex flex-col gap-1 items-start">
          <label class="text-[13px] text-tertiary-text dark:text-tertiary-text-color-dark">${card.name}</label>
          <div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus-within:ring-0 focus-within:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 hover:bg-input-hover dark:hover:bg-input-hover-dark">
            <input id="input_card_value_${card._id}" type="number" autocomplete="off" onchange="updateTableColumn('${card._id}', '__AMOUNT_ID__', event.target.value)" placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0 text-[13px] text-messages dark:text-primary-text-color-dark placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
            <div class="absolute right-3">
              <div class="dark:text-primary-text-color-dark">
                <span>₼</span>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="mt-3 pb-3 border-t border-stroke dark:border-surface-variant-dark"> 
      <table class="table-fixed border-collapse w-full cards_table" id="perm_user_table___AMOUNT_ID__"> 
        <thead class="border-none pb-0.5"> 
          <tr class="bg-container-2 dark:bg-container-2-dark border-none text-[12px] text-secondary-text dark:text-secondary-text-color-dark font-normal"> 
            <th class="rounded-l-lg filtering"> ID </th> 
            <th class="filtering"> Ad və Soyad </th> 
            <th class="filtering"> Vəzifəsi </th> 
            ${sirketCards.map(card => `
              <th class="filtering"> 
                ${card.name} 
              </th> 
            `).join('')} 
            <th class="rounded-r-lg"></th> 
          </tr> 
        </thead> 
        <tbody>
            
        </tbody> 
      </table> 
    </div>
  </div>
</div>
`;