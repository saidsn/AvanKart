document.addEventListener('DOMContentLoaded', function() {
    // Loading state'i göster
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }

    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    const addedPermissionGroup = document.getElementById('addedPermissionGroup');
    const selectAllCheckbox = document.getElementById('newCheckbox1');
    const itemCheckboxes = document.querySelectorAll('[data-type="permCheckbox"]');

    let columnValues = {};
    let dataTableInstances = {};
    let hiddenRowsState = {};
    let lineCountByTable = {};
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

    function extractPermIdFromTargetId(targetId) {
        const match = targetId.match(/target_created_(.+)$/);
        return match ? match[1] : null;
    }

    function isPermCheckboxChecked(permId) {
        return permCheckboxStates[permId] || false;
    }

    // Card columns template
    const cardColumns = sirketCards.map(card => ({
        data: function(row) {
            const cardId = card._id;
            const permId = row.imtiyaz;
            const userId = row._id;
            const specificKey = `${cardId}_${permId}_${userId}`;
            
            const currentValue = columnValues[specificKey] !== undefined ? 
                columnValues[specificKey] : '';

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

    // drawTable fonksiyonu - updateTableVisibility'den ÖNCE
    function drawTable(tableId, amountId) {
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }

        const dt = $(tableId).DataTable({
            paging: true,
            searching: false,
            info: false,
            lengthChange: false,
            pageLength: 10,
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
                
                const tableKey = tableId.replace('#', '');
                if (hiddenRowsState[tableKey] && hiddenRowsState[tableKey][data._id]) {
                    $(row).addClass('row-hidden');
                    setTimeout(() => {
                        addRedLine(data._id);
                        updateCheckboxState(data._id, true);
                    }, 0);
                }
            },
            rowCallback: function(row, data) {
                $(row).find('input[data-card-id][data-perm-id]').off('input').on('input', function() {
                    data.value = $(this).val();
                });
            }
        });

        dataTableInstances[tableId] = dt;
        
        const tableKey = tableId.replace('#', '');
        if (!lineCountByTable[tableKey]) {
            lineCountByTable[tableKey] = 0;
        }
        if (!hiddenRowsState[tableKey]) {
            hiddenRowsState[tableKey] = {};
        }
    }

    // Global toggleRowVisibility fonksiyonu
    window.toggleRowVisibility = function(rowId, currentTableId) {
        const tr = document.getElementById('tr_row_id_' + rowId);
        const checkbox = document.getElementById('is_deleted_' + rowId);
        if (!tr || !checkbox) return;

        const tableKey = currentTableId ? currentTableId.replace('#', '') : 'unknown';
        const currentState = hiddenRowsState[tableKey] && hiddenRowsState[tableKey][rowId];
        const newState = !currentState;

        if (!hiddenRowsState[tableKey]) hiddenRowsState[tableKey] = {};
        hiddenRowsState[tableKey][rowId] = newState;

        tr.classList.toggle('row-hidden', newState);
        updateCheckboxState(rowId, newState);

        if (newState) {
            addRedLine(rowId);
        } else {
            removeRedLine(rowId);
        }

        updateLineCount(tableKey);
        
        const permId = tableKey.replace('perm_user_table_', '');
        sirketCards.forEach(card => {
            calculateBalance(permId, card._id);
            updateBalanceDisplay(permId, card._id);
        });
    };

    // updateTableVisibility - drawTable'dan SONRA
    window.updateTableVisibility = (id, show = false, permName) => {
        if (!id) return;

        let element = document.getElementById(id);
        let amountId = id.split('_').pop();
        
        if (!element) {
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
        element.classList.toggle('hidden', !show);
    }

    // Geliştirilmiş updateTableColumn fonksiyonu
    window.updateTableColumn = (cardId, permId, value, syncAll = true) => {
        const generalKey = `${cardId}_${permId}`;
        columnValues[generalKey] = value;

        const tableId = `#perm_user_table_${permId}`;
        
        if (!dataTableInstances[tableId]) {
            return;
        }

        const dt = dataTableInstances[tableId];

        if (dt.ajax.json() && dt.ajax.json().data) {
            dt.ajax.json().data.forEach(rowData => {
                const userId = rowData._id;
                const specificKey = `${cardId}_${permId}_${userId}`;
                columnValues[specificKey] = value;
            });
        }

        if (!syncAll) return;

        dt.draw(false);

        dt.rows({ page: 'current' }).nodes().to$()
            .find(`input[data-card-id="${cardId}"][data-perm-id="${permId}"]`)
            .each((_, input) => {
                input.value = value;
                input.dataset.value = value;
            });

        calculateBalance(permId, cardId);
        updateBalanceDisplay(permId, cardId);
    };

    // SelectAll checkbox event listener
    selectAllCheckbox.addEventListener('change', function() {
        const checked = this.checked;
        itemCheckboxes.forEach(cb => {
            cb.checked = checked;
            
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
        
        recalculateAllBalances();
    });

    // Item checkbox event listeners
    itemCheckboxes.forEach(cb => {
        const permId = extractPermIdFromTargetId(cb.dataset.targetId);
        if (permId) {
            permCheckboxStates[permId] = cb.checked;
        }
        
        cb.addEventListener('change', () => {
            const permId = extractPermIdFromTargetId(cb.dataset.targetId);
            if (permId) {
                permCheckboxStates[permId] = cb.checked;
            }
            
            const allChecked = [...itemCheckboxes].every(c => c.checked);
            selectAllCheckbox.checked = allChecked;
            updateTableVisibility(cb.dataset.targetId, cb.checked, cb.dataset.permName);
            
            if (permId) {
                sirketCards.forEach(card => {
                    calculateBalance(permId, card._id);
                    updateBalanceDisplay(permId, card._id);
                });
            }
        });
    });

    function recalculateAllBalances() {
        Object.keys(permCheckboxStates).forEach(permId => {
            sirketCards.forEach(card => {
                calculateBalance(permId, card._id);
                updateBalanceDisplay(permId, card._id);
            });
        });
    }

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
        const key = `${cardId}_${permId}_${userId}`;
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

    window.saveThisTable = (main = {}, colVal = null, hid = {}) => {
        const main_values = main ?? {};
        const exceptions = {};
        const hidden = {};
        
        for (const [key, value] of Object.entries(colVal || columnValues || {})) {
            const parts = key.split("_");
            if (parts.length === 3) {
                const cardId = parts[0];
                const permId = parts[1];
                const userId = parts[2];
                
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

        for (const tableKey in hiddenRowsState) {
            if (tableKey.startsWith('perm_user_table_')) {
                const permId = tableKey.replace('perm_user_table_', '');
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

        console.log('SaveThisTable result (edit mode):', result);
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
            let dataSend = {...result, ...{balance_id: folderId} }; 

            const meta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = meta ? meta.getAttribute('content') : '';
            const response = await fetch('/isci/edit-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "CSRF-Token": csrfToken,
                },
                body: JSON.stringify(dataSend)
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

    window.updateBalanceDisplay = (permId, cardId) => {
        const balance = calculateBalance(permId, cardId);
        const displayElement = document.getElementById(`total_for_card_${permId}_${cardId}`);
        if (displayElement) {
            const safeBalance = isNaN(balance) ? 0 : balance;
            displayElement.textContent = safeBalance.toFixed(2);
            if (!kartlarBalance[permId]) kartlarBalance[permId] = {};
            kartlarBalance[permId][cardId] = safeBalance;
        }
        
        updateTotalBalance(permId);
    }

    window.updateTotalBalance=(permId) => {
        let totalBalance = 0;
        sirketCards.forEach(card => {
            const cardBalance = calculateBalance(permId, card._id);
            totalBalance += isNaN(cardBalance) ? 0 : cardBalance;
        });
        
        const permNameElement = document.getElementById(`permName_update_${permId}`);
        if (permNameElement) {
            const parentContainer = permNameElement.closest('.bg-table-hover');
            if (parentContainer) {
                const totalElement = parentContainer.querySelector('.text-tertiary-text .font-medium');
                if (totalElement) {
                    const safeTotalBalance = isNaN(totalBalance) ? 0 : totalBalance;
                    totalElement.textContent = `${safeTotalBalance.toFixed(2)} ₼`;
                }
            }
        }
        updateAllTotal();
    }

    function updateAllTotal() {
        let kartBazliToplamlar = {};

        sirketCards.forEach(card => {
            kartBazliToplamlar[card._id] = 0;
        });

        Object.entries(kartlarBalance).forEach(([permId, cardsObj]) => {
            if (isPermCheckboxChecked(permId)) {
                Object.entries(cardsObj).forEach(([cardId, balance]) => {
                    if (!kartBazliToplamlar[cardId]) kartBazliToplamlar[cardId] = 0;
                    kartBazliToplamlar[cardId] += balance;
                });
            }
        });

        sirketCards.forEach(card => {
            const cardId = card._id;
            const toplam = kartBazliToplamlar[cardId] || 0;
            const cardElement = document.getElementById(`total_card_balance_${cardId}`);
            if (cardElement) {
                cardElement.textContent = `${toplam.toFixed(2)} ₼`;
            }
        });

        const kartlarGenelToplam = Object.values(kartBazliToplamlar)
            .reduce((sum, val) => sum + val, 0);

        const genelElement = document.getElementById("total_card_balancelar");
        if (genelElement) {
            genelElement.textContent = `${kartlarGenelToplam.toFixed(2)} ₼`;
        }
    }

    window.calculateBalance = (permId, cardId) => {
        if (!isPermCheckboxChecked(permId)) {
            return 0;
        }

        const data = window.saveThisTable();
        const tableId = "#perm_user_table_" + permId;
        
        if (!dataTableInstances[tableId]) {
            return 0;
        }
        
        const dataTable = dataTableInstances[tableId];
        const pageInfo = dataTable.page.info();
        const totalRecords = pageInfo ? pageInfo.recordsTotal : 0;
        
        const hiddenUsers = data.hidden[permId] || {};
        const hiddenUserIds = Object.keys(hiddenUsers).filter(userId => hiddenUsers[userId]);
        const hiddenCount = hiddenUserIds.length;
        
        const activeUserCount = totalRecords - hiddenCount;
        
        let totalBalance = 0;
        
        if (data.exceptions[permId]) {
            const exceptions = data.exceptions[permId];
            
            for (const userId in exceptions) {
                if (!hiddenUsers[userId]) {
                    if (exceptions[userId][cardId] !== undefined) {
                        const parsedExceptionValue = parseFloat(exceptions[userId][cardId]);
                        const exceptionValue = isNaN(parsedExceptionValue) ? 0 : parsedExceptionValue;
                        totalBalance += exceptionValue;
                    }
                }
            }
        }
        
        const finalBalance = isNaN(totalBalance) ? 0 : totalBalance;
        return finalBalance;
    };

    // YENİ: VERILERI YÜKLEME FONKSİYONU
    window.loadEditData = function(editData) {
        console.log('Loading edit data:', editData);
        console.log('Available sirketCards:', sirketCards);
        
        // 1. Exceptions verilerini columnValues'a yükle - CARD._ID KULLAN
        if (editData.exceptions) {
            Object.entries(editData.exceptions).forEach(([permId, users]) => {
                Object.entries(users).forEach(([userId, cards]) => {
                    Object.entries(cards).forEach(([cardIdOrName, value]) => {
                        // Önce direkt card._id olarak dene
                        let cardId = cardIdOrName;
                        
                        // Eğer card bulunamazsa, name'e göre ara
                        const cardById = sirketCards.find(c => c._id === cardIdOrName);
                        if (!cardById) {
                            const cardByName = sirketCards.find(c => c.name === cardIdOrName);
                            if (cardByName) {
                                cardId = cardByName._id;
                            } else {
                                console.warn(`Card not found for: ${cardIdOrName}`);
                                return;
                            }
                        }
                        
                        const key = `${cardId}_${permId}_${userId}`;
                        columnValues[key] = value;
                        console.log(`Loaded value: ${key} = ${value}`);
                    });
                });
            });
        }

        // 2. Checkbox'ları işaretle ve div'leri oluştur
        const permsToLoad = new Set();
        
        if (editData.exceptions) {
            Object.keys(editData.exceptions).forEach(permId => permsToLoad.add(permId));
        }

        console.log('Perms to load:', Array.from(permsToLoad));

        // Her bir perm için checkbox'ı işaretle ve visibility'yi güncelle
        permsToLoad.forEach(permId => {
            const checkbox = Array.from(itemCheckboxes).find(cb => {
                const cbPermId = extractPermIdFromTargetId(cb.dataset.targetId);
                return cbPermId === permId;
            });

            if (checkbox) {
                checkbox.checked = true;
                permCheckboxStates[permId] = true;
                
                // Div'i oluştur ve göster
                const targetId = checkbox.dataset.targetId;
                const permName = checkbox.dataset.permName;
                updateTableVisibility(targetId, true, permName);
                
                console.log(`Checked and created div for permId: ${permId}`);
            }
        });

        // SelectAll checkbox durumunu güncelle
        const allChecked = [...itemCheckboxes].every(c => c.checked);
        selectAllCheckbox.checked = allChecked;

        // Tüm hesaplamaları başlat (tabloların yüklenmesini bekle)
        setTimeout(() => {
            recalculateAllBalances();
            console.log('All balances recalculated');
            
            // Loading overlay'i gizle
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
        }, 1500);
    };
});

const balanceTemplate = `
<div class="bg-table-hover dark:bg-table-hover-dark px-3 rounded-lg">
  <div class="w-full py-3 flex justify-between items-center border-b border-stroke dark:border-surface-variant-dark">
    <h3 class="text-[15px] font-medium text-messages dark:text-primary-text-color-dark" id="permName_update___AMOUNT_ID__">
      Add balance
    </h3>
    <div class="flex items-center gap-2 cursor-pointer toggle-section" data-target-id="perm_target___AMOUNT_ID__">
      <div class="text-[13px] font-normal text-tertiary-text dark:text-tertiary-text-color-dark">
        Məbləğ: <span class="font-medium text-messages dark:text-primary-text-color-dark">Loading ₼</span>
      </div>
      <div class="icon stratis-chevron-up rotate-180 text-[10px] mb-1 toggle-icon dark:text-primary-text-color-dark"></div>
    </div>
  </div>

  <div class="flex items-center justify-start text-[13px] py-3 text-tertiary-text dark:text-tertiary-text-color-dark gap-3">
    ${sirketCards.map((card, ic) => `
      <div class="flex items-center gap-2">
        <span>${card.name}:</span>
        <span class="font-medium text-messages dark:text-primary-text-color-dark">
          <span id="total_for_card___AMOUNT_ID___${card._id}">Loading</span> ₼
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