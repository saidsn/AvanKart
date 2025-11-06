function openById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function closeById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

function toggleById(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("hidden");
}
window.excelPopUp = function () {
  closeById("yeni-isci-div");
  closeById("ishciId");
  closeById("EmekdaslarRedaktePop");
  closeById("balancePopup");
  openById("ExceldenElaveEtPop");
};

window.closeExcelPopup = function () {
  closeById("ExceldenElaveEtPop");
  closeById("ExceldenIshciElaveEtPop");
};

window.excel2PopUp = function () {
  closeById("ishciId");
  openById("ExceldenElaveEtPop");
};

window.toggleIsci = function () {
  toggleById("yeni-isci-div");
};
window.openFilterModal = function () {
  toggleById("filterPop");
};
window.openBalancePopup = function () {
  openById("balancePopup");
};
window.closeBalancePopup = function () {
  closeById("balancePopup");
};
window.openDeleteInvoiceModal = function () {
  openById("deleteInvoiceModal");
};
window.closeDeleteInvoiceModal = function () {
  closeById("deleteInvoiceModal");
};
window.deleteInvoice = function () { closeById("deleteInvoiceModal"); };
window.toggleYeniVezife = function () {
  openById("YeniVezifePop");
};
window.closeYeniVezifePopup = function () {
  closeById("YeniVezifePop");
};
window.toggleRedakteVezife = function () {
  openById("RedakteEtPopUpVezife");
};
window.redakteVezife = function () {
  closeById("RedakteEtPopUpVezife");
};

window.deletePopUp = function () {
  toggleById("VezifeSilPop");
};
window.toggleEmail = function (formId) { submitForm(formId); closeById("VezifeSilPop"); };
window.deleteGroupPop = function () {
  openById("QrupuSilPop");
};
window.deleteQrupPopUp = function () {
  // Clear the stored group ID when canceling
  window.groupToDelete = null;
  toggleById("QrupuSilPop");
};
window.toggleEmail2 = function () { 
  if (window.groupToDelete) {
    deleteImtiyazGroup(window.groupToDelete);
  } else {
    closeById("QrupuSilPop"); 
    openById("emaildogrulamaDiv2"); 
  }
};
window.emekdaslarclick = function () {
  toggleById("EmekdaslarRedaktePop");
};
window.imtiyazState = window.imtiyazState || { groupName: '', selectedUsers: [] };

window.proceedImtiyazGroup = function () {
  const input = document.getElementById('imtiyazGroupNameInput');
  if (!input) return;
  const val = (input.value || '').trim();
  if (!val) { input.classList.add('border-error'); input.focus(); return; }
  input.classList.remove('border-error');
  window.imtiyazState.groupName = val;
  openById('BasMuhasiblerPop');
  const hdr = document.getElementById('addImtiyazHeader'); if (hdr) hdr.textContent = val;
};

window.loadImtiyazUsers = function (opts = {}) {
  const { search = '', start = 0, length = 25 } = opts;
  const tbody = document.querySelector('#ExceldenElaveEtPop table tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-[12px]">Yüklənir...</td></tr>';
  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || window.csrfToken;
  $.ajax({
    url: '/people/avankart-people-imtiyaz', method: 'POST', contentType: 'application/json', headers: { 'CSRF-Token': csrf },
    data: JSON.stringify({ draw: 1, start, length, search, category: 'current' }),
    success: function (data) {
      if (!tbody) return;
      if (!data || !data.data || !data.data.length) { tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-[12px] opacity-60">İstifadəçi tapılmadı</td></tr>'; return; }
      tbody.innerHTML = '';
      data.data.forEach(u => {
        const tr = document.createElement('tr');
        tr.className = 'text-[12px] border-b border-[#0000000D] dark:border-[#ffffff1A] hover:bg-[#F6D9FF26] dark:hover:bg-[#5B396D26] dark:text-white';
        tr.innerHTML = `
          <td class="px-2 py-2 dark:text-white"><input type="checkbox" class="imtiyaz-user-check" data-id="${u.id}" data-fullname="${u.fullname}" data-email="${u.email || ''}" /></td>
          <td class="px-3 py-2 whitespace-nowrap text-[#1E1E1E] dark:text-white/70">${u.id}</td>
          <td class="px-3 py-2 whitespace-nowrap dark:text-white">${u.fullname}</td>
          <td class="px-3 py-2 whitespace-nowrap dark:text-white">${u.email || ''}</td>
          <td class="px-3 py-2 whitespace-nowrap dark:text-white">${u.duty || '-'} </td>
          <td class="px-3 py-2 whitespace-nowrap dark:text-white">${u.permission || '-'} </td>
          <td class="px-3 py-2 whitespace-nowrap dark:text-white">${u.phoneNumber || ''}</td>`;
        tbody.appendChild(tr);
      });
      tbody.querySelectorAll('tr').forEach(tr => {
        tr.addEventListener('click', e => { if (e.target.matches('input.imtiyaz-user-check')) return; const cb = tr.querySelector('input.imtiyaz-user-check'); if (cb) { cb.checked = !cb.checked; tr.classList.toggle('bg-[#F6D9FF26]'); syncHeaderCheckbox(); } });
      });
      tbody.querySelectorAll('input.imtiyaz-user-check').forEach(cb => { cb.addEventListener('change', () => { cb.closest('tr').classList.toggle('bg-[#F6D9FF26]', cb.checked); syncHeaderCheckbox(); }); });
      const headerCb = document.getElementById('newCheckbox');
      if (headerCb) {
        headerCb.checked = false; headerCb.indeterminate = false;
        if (!headerCb._imtiyazBound) {
          headerCb.addEventListener('change', function () {
            const checked = headerCb.checked;
            tbody.querySelectorAll('input.imtiyaz-user-check').forEach(cb => { cb.checked = checked; cb.closest('tr').classList.toggle('bg-[#F6D9FF26]', checked); });
          });
          headerCb._imtiyazBound = true;
        }
      }
      function syncHeaderCheckbox() {
        const all = tbody.querySelectorAll('input.imtiyaz-user-check');
        const sel = tbody.querySelectorAll('input.imtiyaz-user-check:checked');
        const header = document.getElementById('newCheckbox');
        if (!header) return;
        header.checked = all.length > 0 && sel.length === all.length;
        header.indeterminate = sel.length > 0 && sel.length < all.length;
      }
    },
    error: function () { if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-[12px] text-error">Xəta baş verdi</td></tr>'; }
  });
};

window.clickIstifadeciElaveEt = function () { closeById('BasMuhasiblerPop'); openById('ExceldenElaveEtPop'); window.loadImtiyazUsers(); };

window.addImtiyazUser = function (user) { if (!user || !user._id) return; if (window.imtiyazState.selectedUsers.some(u => u._id === user._id)) return; window.imtiyazState.selectedUsers.push(user); window.renderSelectedImtiyazUsers && window.renderSelectedImtiyazUsers(); };

window.clickSaveIshciler = function () {
  const checks = document.querySelectorAll('#ExceldenElaveEtPop input.imtiyaz-user-check:checked');
  checks.forEach(cb => window.addImtiyazUser({ _id: cb.dataset.id, fullname: cb.dataset.fullname, email: cb.dataset.email }));
  closeById('ExceldenElaveEtPop'); openById('BasMuhasiblerPop');
};

window.renderSelectedImtiyazUsers = function () {
  const list = document.getElementById('selectedUsersList'); const placeholder = document.getElementById('noSelectedUsersPlaceholder');
  if (!list) return; const users = window.imtiyazState.selectedUsers; if (placeholder) placeholder.classList.toggle('hidden', users.length > 0);
  list.innerHTML = ''; list.classList.toggle('hidden', users.length === 0);
  users.forEach(u => { const div = document.createElement('div'); div.className = 'flex items-center justify-between gap-2 py-2 border-b border-[#0000001A] dark:border-[#ffffff1A]'; div.innerHTML = `<div class="flex flex-col"><span class="text-[12px] font-medium dark:text-white">${u.fullname}</span><span class="text-[11px] opacity-60 dark:text-white">${u.email || ''}</span></div><button type="button" data-uid="${u._id}" class="remove-imtiyaz-user text-[11px] px-2 py-1 rounded-full bg-error text-white">Sil</button>`; list.appendChild(div); });
  list.querySelectorAll('.remove-imtiyaz-user').forEach(btn => btn.addEventListener('click', e => { const id = e.currentTarget.getAttribute('data-uid'); window.imtiyazState.selectedUsers = window.imtiyazState.selectedUsers.filter(x => x._id !== id); window.renderSelectedImtiyazUsers(); }));
};

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('createImtiyazGroupBtn'); if (!btn) return;

    // Check if button has already been processed by this script
    if (btn.hasAttribute('data-popup-handler-attached')) {
      console.log('Button already has handler attached, skipping...');
      return;
    }

    // Mark button as processed
    btn.setAttribute('data-popup-handler-attached', 'true');
    console.log('Attaching event handler to createImtiyazGroupBtn');

    // Add a flag to prevent duplicate processing during execution
    let isProcessing = false;

    btn.addEventListener('click', function () {
      console.log('CREATE BUTTON CLICKED - Processing flag:', isProcessing);

      if (isProcessing) {
        console.log('Already processing, ignoring duplicate click');
        return;
      }

      isProcessing = true;
      const st = window.imtiyazState; if (!st.groupName) { alertModal('Qrup adı boş ola bilməz', 'error'); return; } if (!st.selectedUsers.length) { alertModal('Ən az 1 istifadəçi seçilməlidir', 'error'); return; }
      const cardsPayload = {}; document.querySelectorAll('input[name^="cards["]').forEach(inp => { const m = inp.name.match(/cards\[(.+)\]/); if (m) { const raw = (inp.value || '').trim(); if (raw) { const num = Number(raw.replace(/[^0-9.]/g, '')); if (!isNaN(num)) cardsPayload[m[1]] = num; } } });
      const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      const payload = { name: st.groupName, ids: st.selectedUsers.map(u => u._id), cards: cardsPayload, _csrf: csrf };
      btn.disabled = true; btn.classList.add('opacity-60');
      $.ajax({
        url: '/rbac/add-imtiyaz',
        method: 'POST',
        contentType: 'application/json',
        headers: { 'CSRF-Token': csrf },
        data: JSON.stringify(payload),
        success: function (r) {
          // Close all modals
          const modalIds = ['BasMuhasiblerPop', 'ExceldenElaveEtPop', 'YeniQrupPop'];
          modalIds.forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
              modal.classList.add('hidden');
            }
          });

          // Reset the imtiyaz state
          if (window.imtiyazState) {
            window.imtiyazState.groupName = '';
            window.imtiyazState.selectedUsers = [];
          }

          // Clear form inputs
          const nameInput = document.getElementById('imtiyazGroupNameInput');
          if (nameInput) {
            nameInput.value = '';
          }

          // Call the UI update function
          if (window.onImtiyazGroupCreated && typeof window.onImtiyazGroupCreated === 'function') {
            window.onImtiyazGroupCreated({
              name: r.data?.name || groupName,
              message: r.message || 'Qrup yaradıldı',
              data: r.data || null,
              id: r.data?.id,
              usersAdded: r.data?.usersAdded || 0
            });
          } else {
            // Fallback alert if callback doesn't exist
            alertModal(r.message || 'Qrup yaradıldı');
          }

          btn.disabled = false;
          btn.classList.remove('opacity-60');
          isProcessing = false; // Reset the flag
        },
        error: function (xhr) {
          const msg = xhr?.responseJSON?.message || xhr?.responseJSON?.details || 'Xəta baş verdi';
          alertModal(msg, 'error');
          btn.disabled = false;
          btn.classList.remove('opacity-60');
          isProcessing = false; // Reset the flag
        }
      });
    });
  });
})();
window.openRenameGroupModal = function () {
  openById("YeniQrupPop");
};
window.openEditGroupModal = function () {
  openById("BasMuhasiblerPop");
};
window.openDeleteGroupModal = function (groupId) {
  if (!groupId) {
    console.error('Group ID is required for delete');
    return;
  }
  
  // Store the group ID globally for deletion
  window.groupToDelete = groupId;
  openById("QrupuSilPop");
};

// Simple rename modal for imtiyaz groups
window.openSimpleRenameModal = function (groupId) {
  console.log('openSimpleRenameModal called with groupId:', groupId);
  
  if (!groupId) {
    console.error('Group ID is required for rename');
    return;
  }

  // Get current group name - simpler approach
  let currentName = '';
  
  try {
    // Try to get from window.imtiyazTable
    if (window.imtiyazTable && typeof window.imtiyazTable.rows === 'function') {
      window.imtiyazTable.rows().every(function (rowIdx) {
        const data = this.data();
        if (data && (data.id === groupId || data._id === groupId)) {
          currentName = data.groupName || data.name || '';
          return false; // Break the loop
        }
      });
    }
    
    // If no name found, try DOM approach
    if (!currentName) {
      const rows = document.querySelectorAll('#myTableImtiyaz tbody tr');
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
          const empId = checkbox.getAttribute('data-employee-id');
          if (empId === groupId) {
            const nameCell = row.querySelector('td:nth-child(2) span');
            if (nameCell) {
              currentName = nameCell.textContent.trim();
              break;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting current name:', error);
  }

  console.log('Current name found:', currentName);

  // Create rename modal HTML
  const modalHTML = `
    <div id="renameImtiyazModal" class="z-[9999] fixed inset-0 border-[#0000001A] bg-opacity-50 flex items-center justify-center">
      <div class="relative w-[400px] border-[#0000001A] border-[0.5px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white dark:bg-menu-dark">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-surface-variant dark:border-surface-variant-dark">
          <h3 class="text-[15px] font-medium text-messages dark:text-white">İmtiyaz qrupu adını dəyişdir</h3>
          <button onclick="closeRenameModal()" class="text-messages dark:text-white hover:text-primary dark:hover:text-primary">
            <div class="icon stratis-x-01 text-[13px] cursor-pointer"></div>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-[12px] font-medium text-messages dark:text-white mb-2">Yeni qrup adı</label>
            <input type="text" id="newGroupNameInput" value="${currentName}" 
                   placeholder="Qrup adını daxil edin"
                   class="cursor-pointer w-full dark:text-primary-text-color-dark h-[34px] font-poppins font-normal text-[12px] 
                   leading-[160%] border-[1px] border-surface-variant rounded-full pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover 
                   focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus 
                   active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] 
                   transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-on-surface-variant">
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-4 border-t border-surface-variant dark:border-surface-variant-dark">
          <button onclick="closeRenameModal()" 
                  class="px-4 py-2 text-[12px] font-medium text-on-surface-variant dark:text-on-surface-variant-dark 
                         bg-surface-bright dark:bg-surface-bright-dark rounded-full hover:bg-surface-variant dark:hover:bg-surface-variant-dark">
            Ləğv et
          </button>
          <button onclick="confirmRename('${groupId}')" 
                  class="px-4 py-2 text-[12px] font-medium text-on-primary bg-primary rounded-full hover:bg-primary-hover">
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('renameImtiyazModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Focus on input and select text
  setTimeout(() => {
    const input = document.getElementById('newGroupNameInput');
    if (input) {
      input.focus();
      input.select();
      
      // Add Enter key support
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmRename(groupId);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeRenameModal();
        }
      });
    }
  }, 100);
};

// Close rename modal function
window.closeRenameModal = function() {
  const modal = document.getElementById('renameImtiyazModal');
  if (modal) {
    modal.remove();
  }
};

// Confirm rename function
window.confirmRename = function(groupId) {
  const input = document.getElementById('newGroupNameInput');
  if (!input) return;

  const newName = input.value.trim();
  if (!newName) {
    // Show error in the modal
    showModalError('Ad boş ola bilməz');
    return;
  }

  // Disable button during request
  const saveBtn = document.querySelector('#renameImtiyazModal button[onclick*="confirmRename"]');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Yaddaşa yazılır...';
  }

  // Send AJAX request to update group name
  fetch('/rbac/update-imtiyaz-name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    body: JSON.stringify({
      groupId: groupId,
      newName: newName
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Close modal
      closeRenameModal();
      
      // Refresh imtiyaz table
      if (typeof window.refreshImtiyazTable === 'function') {
        window.refreshImtiyazTable();
      }
      
      // Show success message
      if (typeof showAlert === 'function') {
        alertModal('İmtiyaz qrupu adı uğurla yeniləndi', 'success');
      } else {
        alertModal('İmtiyaz qrupu adı uğurla yeniləndi');
      }
    } else {
      alertModal(data.message || 'Xəta baş verdi', 'error');
      // Re-enable button
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Yadda saxla';
      }
    }
  })
  .catch(error => {
    console.error('Error updating group name:', error);
    showModalError('Xəta baş verdi');
    // Re-enable button
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Yadda saxla';
    }
  });
};

// Show error in modal
function showModalError(message) {
  const modal = document.getElementById('renameImtiyazModal');
  if (!modal) return;
  
  // Remove existing error
  const existingError = modal.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error message
  const input = modal.querySelector('#newGroupNameInput');
  if (input) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-[11px] text-error dark:text-error-dark mt-1';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
    
    // Add error styling to input
    input.classList.add('border-error', 'dark:border-error-dark');
    
    // Remove error styling after 3 seconds
    setTimeout(() => {
      input.classList.remove('border-error', 'dark:border-error-dark');
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 3000);
  }
}

window.closeSimpleRenameModal = function () {
  const modal = document.getElementById('simpleRenameModal');
  if (modal) {
    modal.remove();
  }
};

window.saveGroupName = function (groupId) {
  const input = document.getElementById('newGroupName');
  if (!input) return;

  const newName = input.value.trim();
  if (!newName) {
    alertModal('Ad boş ola bilməz', 'error');
    return;
  }

  // Send AJAX request to update group name
  fetch('/rbac/update-imtiyaz-name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    body: JSON.stringify({
      groupId: groupId,
      newName: newName
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Close modal
      closeSimpleRenameModal();
      
      // Refresh imtiyaz table
      if (typeof window.refreshImtiyazTable === 'function') {
        window.refreshImtiyazTable();
      }
      
      // Show success message
      if (typeof showAlert === 'function') {
        alertModal('İmtiyaz qrupu adı uğurla yeniləndi');
      } else {
        alertModal('İmtiyaz qrupu adı uğurla yeniləndi');
      }
    } else {
      alertModal(data.message || 'Xəta baş verdi', 'error');
    }
  })
  .catch(error => {
    console.error('Error updating group name:', error);
    alertModal('Xəta baş verdi', 'error');
  });
};

// Delete imtiyaz group function
window.deleteImtiyazGroup = function (groupId) {
  if (!groupId) {
    console.error('Group ID is required for delete');
    return;
  }

  // Send AJAX request to delete group
  fetch('/rbac/delete-imtiyaz-group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    body: JSON.stringify({
      groupId: groupId
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Close modal
      closeById("QrupuSilPop");
      
      // Clear the stored group ID
      window.groupToDelete = null;
      
      // Refresh imtiyaz table
      if (typeof window.refreshImtiyazTable === 'function') {
        window.refreshImtiyazTable();
      }
      
      // Show success message
      if (typeof showAlert === 'function') {
        alertModal('İmtiyaz qrupu uğurla silindi');
      } else {
        alertModal('İmtiyaz qrupu uğurla silindi');
      }
    } else {
      alertModal(data.message || 'Silmə zamanı xəta baş verdi', 'error');
    }
  })
  .catch(error => {
    console.error('Error deleting group:', error);
    alertModal('Silmə zamanı xəta baş verdi', 'error');
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const dBtn6 = document.getElementById("dropdownDefaultButton6");
  const d6 = document.getElementById("dropdown6");
  if (dBtn6 && d6) {
    dBtn6.addEventListener("click", () => d6.classList.toggle("hidden"));
    document.addEventListener("click", (e) => {
      if (!dBtn6.contains(e.target) && !d6.contains(e.target))
        d6.classList.add("hidden");
    });
  }
});

window.toggleDropdownIcon = function () {
  const dropdownIcon = document.getElementById("dropdownIcon");
  if (!dropdownIcon) return;
  const isChevronDown = dropdownIcon.src.includes("chevron-down.svg");
  dropdownIcon.src = isChevronDown
    ? "/images/uzv-sirket/iscilerinBalansi-images/search-02.svg"
    : "/images/Avankart/Sirket/chevron-down.svg";
};

if (!window.clickSaveMuhasibler) {
  window.clickSaveMuhasibler = function () {
    if (typeof window.clickSaveIshciler === 'function') return window.clickSaveIshciler();
    closeById('ExceldenElaveEtPop');
    openById('BasMuhasiblerPop');
  };
}
if (!window.closeYeniQrupPopup) {
  window.closeYeniQrupPopup = function () {
    closeById('YeniQrupPop');
    const inp = document.getElementById('imtiyazGroupNameInput');
    if (inp) inp.value = '';
    if (window.imtiyazState) window.imtiyazState.groupName = '';
  };
}

if (!window.clickBasMuhasiblerPop) {
  window.clickBasMuhasiblerPop = function () {
    closeById('BasMuhasiblerPop');
  };
}
window.resetImtiyazFilters = function () {
  const searchInp = document.querySelector('#ExceldenElaveEtPop #customSearch');
  if (searchInp) searchInp.value = '';
  const headerCb = document.getElementById('newCheckbox'); if (headerCb) { headerCb.checked = false; headerCb.indeterminate = false; }
  document.querySelectorAll('#ExceldenElaveEtPop input.imtiyaz-user-check').forEach(cb => { cb.checked = false; cb.closest('tr')?.classList.remove('bg-[#F6D9FF26]'); });
  window.loadImtiyazUsers({ search: '' });
};

document.addEventListener('DOMContentLoaded', function () {
  const excelPop = document.getElementById('ExceldenElaveEtPop');
  if (excelPop) {
    const resetBtn = excelPop.querySelector('button[type="reset"]');
    if (resetBtn && !resetBtn._imtiyazBound) {
      resetBtn.addEventListener('click', function (e) { e.preventDefault(); window.resetImtiyazFilters(); });
      resetBtn._imtiyazBound = true;
    }
    const searchInp = excelPop.querySelector('#customSearch');
    if (searchInp && !searchInp._imtiyazBound) {
      searchInp.addEventListener('keyup', function (e) { if (e.key === 'Enter') { window.loadImtiyazUsers({ search: searchInp.value.trim() }); } });
      searchInp._imtiyazBound = true;
    }
    const searchIcon = excelPop.querySelector('#hideeye');
    if (searchIcon && !searchIcon._imtiyazBound) {
      searchIcon.addEventListener('click', function () { const val = (excelPop.querySelector('#customSearch')?.value || '').trim(); window.loadImtiyazUsers({ search: val }); });
      searchIcon._imtiyazBound = true;
    }
  }
});
