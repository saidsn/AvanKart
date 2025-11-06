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
window.toggleEmail = function () { closeById("VezifeSilPop"); openById("emaildogrulamaDiv"); };
window.deleteGroupPop = function () {
  openById("QrupuSilPop");
};
window.deleteQrupPopUp = function () {
  toggleById("QrupuSilPop");
};
window.toggleEmail2 = function () { closeById("QrupuSilPop"); openById("emaildogrulamaDiv2"); };
window.emekdaslarclick = function () {
  toggleById("EmekdaslarRedaktePop");
};
window.imtiyazState = window.imtiyazState || { groupName: '', selectedUsers: [] };

window.proceedImtiyazGroup = function(){
  const input = document.getElementById('imtiyazGroupNameInput');
  if(!input) return;
  const val = (input.value||'').trim();
  if(!val){ input.classList.add('border-error'); input.focus(); return; }
  input.classList.remove('border-error');
  window.imtiyazState.groupName = val;
  openById('BasMuhasiblerPop');
  const hdr = document.getElementById('addImtiyazHeader'); if(hdr) hdr.textContent = val;
};

window.loadImtiyazUsers = function(opts={}){
  const { search='', start=0, length=25 } = opts;
  const tbody = document.querySelector('#ExceldenElaveEtPop table tbody');
  if(tbody) tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-[12px]">Yüklənir...</td></tr>';
  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || window.csrfToken;
  $.ajax({
    url:'/people/avankart-people', method:'POST', contentType:'application/json', headers:{'CSRF-Token': csrf},
    data: JSON.stringify({ draw:1, start, length, search, category:'current' }),
    success: function(data){
      if(!tbody) return;
      if(!data || !data.data || !data.data.length){ tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-[12px] opacity-60">İstifadəçi tapılmadı</td></tr>'; return; }
      tbody.innerHTML='';
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
        tr.addEventListener('click', e => { if(e.target.matches('input.imtiyaz-user-check')) return; const cb=tr.querySelector('input.imtiyaz-user-check'); if(cb){ cb.checked=!cb.checked; tr.classList.toggle('bg-[#F6D9FF26]'); syncHeaderCheckbox(); } });
      });
      tbody.querySelectorAll('input.imtiyaz-user-check').forEach(cb => { cb.addEventListener('change', ()=> { cb.closest('tr').classList.toggle('bg-[#F6D9FF26]', cb.checked); syncHeaderCheckbox(); }); });
      const headerCb = document.getElementById('newCheckbox');
      if(headerCb){
        headerCb.checked=false; headerCb.indeterminate=false;
        if(!headerCb._imtiyazBound){
          headerCb.addEventListener('change', function(){
            const checked = headerCb.checked;
            tbody.querySelectorAll('input.imtiyaz-user-check').forEach(cb=>{ cb.checked=checked; cb.closest('tr').classList.toggle('bg-[#F6D9FF26]', checked); });
          });
          headerCb._imtiyazBound=true;
        }
      }
      function syncHeaderCheckbox(){
        const all = tbody.querySelectorAll('input.imtiyaz-user-check');
        const sel = tbody.querySelectorAll('input.imtiyaz-user-check:checked');
        const header = document.getElementById('newCheckbox');
        if(!header) return;
        header.checked = all.length>0 && sel.length===all.length;
        header.indeterminate = sel.length>0 && sel.length < all.length;
      }
    },
    error: function(){ if(tbody) tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-[12px] text-error">Xəta baş verdi</td></tr>'; }
  });
};

window.clickIstifadeciElaveEt = function(){ closeById('BasMuhasiblerPop'); openById('ExceldenElaveEtPop'); window.loadImtiyazUsers(); };

window.addImtiyazUser = function(user){ if(!user || !user._id) return; if(window.imtiyazState.selectedUsers.some(u=>u._id===user._id)) return; window.imtiyazState.selectedUsers.push(user); window.renderSelectedImtiyazUsers && window.renderSelectedImtiyazUsers(); };

window.clickSaveIshciler = function(){
  const checks = document.querySelectorAll('#ExceldenElaveEtPop input.imtiyaz-user-check:checked');
  checks.forEach(cb => window.addImtiyazUser({ _id: cb.dataset.id, fullname: cb.dataset.fullname, email: cb.dataset.email }));
  closeById('ExceldenElaveEtPop'); openById('BasMuhasiblerPop');
};

window.renderSelectedImtiyazUsers = function(){
  const list = document.getElementById('selectedUsersList'); const placeholder = document.getElementById('noSelectedUsersPlaceholder');
  if(!list) return; const users = window.imtiyazState.selectedUsers; if(placeholder) placeholder.classList.toggle('hidden', users.length>0);
  list.innerHTML=''; list.classList.toggle('hidden', users.length===0);
  users.forEach(u => { const div=document.createElement('div'); div.className='flex items-center justify-between gap-2 py-2 border-b border-[#0000001A] dark:border-[#ffffff1A]'; div.innerHTML=`<div class="flex flex-col"><span class="text-[12px] font-medium dark:text-white">${u.fullname}</span><span class="text-[11px] opacity-60 dark:text-white">${u.email||''}</span></div><button type="button" data-uid="${u._id}" class="remove-imtiyaz-user text-[11px] px-2 py-1 rounded-full bg-error text-white">Sil</button>`; list.appendChild(div); });
  list.querySelectorAll('.remove-imtiyaz-user').forEach(btn => btn.addEventListener('click', e => { const id=e.currentTarget.getAttribute('data-uid'); window.imtiyazState.selectedUsers = window.imtiyazState.selectedUsers.filter(x=>x._id!==id); window.renderSelectedImtiyazUsers(); }));
};

(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const btn=document.getElementById('createImtiyazGroupBtn'); if(!btn) return;
    btn.addEventListener('click', function(){
      const st=window.imtiyazState; if(!st.groupName){ alert('Qrup adı boş ola bilməz'); return; } if(!st.selectedUsers.length){ alert('Ən az 1 istifadəçi seçilməlidir'); return; }
      const cardsPayload={}; document.querySelectorAll('input[name^="cards["]').forEach(inp=>{ const m=inp.name.match(/cards\[(.+)\]/); if(m){ const raw=(inp.value||'').trim(); if(raw){ const num=Number(raw.replace(/[^0-9.]/g,'')); if(!isNaN(num)) cardsPayload[m[1]]=num; } } });
      const csrf=document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      const payload={ name: st.groupName, ids: st.selectedUsers.map(u=>u._id), cards: cardsPayload, _csrf: csrf };
      btn.disabled=true; btn.classList.add('opacity-60');
  $.ajax({ url:'/rbac/add-imtiyaz', method:'POST', contentType:'application/json', headers:{'CSRF-Token': csrf}, data: JSON.stringify(payload), success:function(r){ alert(r.message || 'Qrup yaradıldı'); btn.disabled=false; btn.classList.remove('opacity-60'); }, error:function(xhr){ const msg = xhr?.responseJSON?.message || xhr?.responseJSON?.details || 'Xəta baş verdi'; alert(msg); btn.disabled=false; btn.classList.remove('opacity-60'); } });
    });
  });
})();
window.openRenameGroupModal = function () {
  openById("YeniQrupPop");
};
window.openEditGroupModal = function () {
  openById("BasMuhasiblerPop");
};
window.openDeleteGroupModal = function () {
  openById("QrupuSilPop");
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
  window.clickBasMuhasiblerPop = function(){
    closeById('BasMuhasiblerPop');
  };
}
window.resetImtiyazFilters = function(){
  const searchInp = document.querySelector('#ExceldenElaveEtPop #customSearch');
  if(searchInp) searchInp.value='';
  const headerCb = document.getElementById('newCheckbox'); if(headerCb){ headerCb.checked=false; headerCb.indeterminate=false; }
  document.querySelectorAll('#ExceldenElaveEtPop input.imtiyaz-user-check').forEach(cb=>{ cb.checked=false; cb.closest('tr')?.classList.remove('bg-[#F6D9FF26]'); });
  window.loadImtiyazUsers({ search:'' });
};

document.addEventListener('DOMContentLoaded', function(){
  const excelPop = document.getElementById('ExceldenElaveEtPop');
  if(excelPop){
    const resetBtn = excelPop.querySelector('button[type="reset"]');
    if(resetBtn && !resetBtn._imtiyazBound){
      resetBtn.addEventListener('click', function(e){ e.preventDefault(); window.resetImtiyazFilters(); });
      resetBtn._imtiyazBound=true;
    }
    const searchInp = excelPop.querySelector('#customSearch');
    if(searchInp && !searchInp._imtiyazBound){
      searchInp.addEventListener('keyup', function(e){ if(e.key==='Enter'){ window.loadImtiyazUsers({ search: searchInp.value.trim() }); }});
      searchInp._imtiyazBound=true;
    }
    const searchIcon = excelPop.querySelector('#hideeye');
    if(searchIcon && !searchIcon._imtiyazBound){
      searchIcon.addEventListener('click', function(){ const val = (excelPop.querySelector('#customSearch')?.value||'').trim(); window.loadImtiyazUsers({ search: val }); });
      searchIcon._imtiyazBound=true;
    }
  }
});
