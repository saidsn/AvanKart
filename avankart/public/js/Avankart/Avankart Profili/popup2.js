
const yeni_isciDiv = document.querySelector('#yeni-isci-div')

let isIsciOpen = false;
let isSearchOpen = false;

const showEditModal = () => {
  const existing = document.getElementById("editModal");
  if (existing) existing.remove();

  const modalHTML = `
    <div id="editModal" class="fixed inset-0 flex items-center justify-center bg-[#0000002A] bg-opacity-30 z-500">
      <div class="redakte-div font-poppins w-[490px] h-[560px] bg-body-bg dark:bg-body-bg-dark border-[3px] border-[#0000001A] !shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50 dark:border-[#ffffff1A]">
        <div class="flex items-center justify-between py-0.5 mb-5">
          <span class="text-[15px] font-medium text-messages dark:text-white">Redaktə et</span>
          <img onclick="document.getElementById('editModal').remove()" src="/public/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden">
          <img onclick="document.getElementById('editModal').remove()" src="/public/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block">
        </div>
        <div class="mt-5">
          <form action="#">
            <div class="w-full ">
            
                <div><span class="text-error text-[12px]">*</span> <span class="text-messages dark:text-white text-[12px] font-medium opacity-65">Ad və Soyad</span>
                    </div>
              <input type="text" placeholder="Ramin Orucov"  class="w-full h-[34px] py-[7.5px] px-3 text-[12px] font-normal border-[1px] border-[#0000001A] rounded-[500px] bg-[#EBEBEB]">
            </input>
            <div>
                    <div class="mt-1"><span class="text-error text-[12px]">*</span> <span class="text-messages dark:text-white text-[12px] font-medium opacity-65">Cinsiyyət</span>
                    </div>
                    <div class="flex items-center gap-3 mt-2.5 ">
                      <div class="flex items-center gap-2 ">
                        <input id="link-radio" type="radio" name="gender" value="male" checked="" class="w-4 h-4 text-[#745086] bg-gray-100 border-surface-variant focus:ring-[#745086] dark:focus:ring-[#745086] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="link-radio" class="text-[13px] font-medium text-messages dark:text-white cursor-pointer  ">
                          Kişi
                        </label>
                      </div>
                      <div class="flex items-center gap-2">
                        <input id="link-radio2" type="radio" name="gender" value="female" class="w-4 h-4 text-[#745086] bg-gray-100 border-surface-variant focus:ring-[#745086] dark:focus:ring-[#745086] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <label for="link-radio2" class="text-[13px] font-medium text-messages dark:text-white cursor-pointer">
                          Qadin
                        </label>
                      </div>
                    </div>
                  </div>
            <div class="w-full my-3">
                  <div><span class="text-error text-[12px]">*</span> <span class="text-messages dark:text-white text-[12px] font-medium opacity-65">Email</span>
                    </div>
              <input type="email" placeholder="ramin.orucovv@gmail.com" class="w-full h-[34px] py-[7.5px] px-3 text-[12px] font-normal border-[1px] border-[#0000001A] rounded-[500px] bg-[#EBEBEB] ">
            </div>
           <div><span class="text-error text-[12px]">*</span>
                        <span class="text-messages text-[12px] font-medium opacity-65 dark:text-white">Telefon
                          nömrəniz</span>
                      </div>
            <div class="flex items-center justify-between gap-2">
              <div class="w-max h-[34px] border border-[#0000001A] dark:!border-[#ffffff1A] px-3 my-3 rounded-[500px]  dark:bg-table-hover-dark  bg-[#EBEBEB] relative" >
                <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" class="operator text-center flex items-center justify-center gap-[9px] text-[12px] font-normal !h-[34px] cursor-pointer px-3 " type="button">
                  <span id="operatorText" class="text-messages dark:text-white">+994</span>
                  <img src="/public/images/settings/chevron-down.svg" alt="Down" class="!w-[15px] !h-[15px] block dark:hidden">
                  <img src="/public/images/settings/chevron-dark.svg" alt="Down" class="hidden dark:block">
                </button>
                <div id="dropdown" class="z-10 w-[80px] hidden   absolute left-0 top-full dark:bg-table-hover-dark dark:text-white bg-body-bg rounded-lg border-[0.5px] border-[#0000001A] !shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)]" data-popper-reference-hidden="" data-popper-escaped="" data-popper-placement="bottom" style="position: absolute; inset: 0px auto auto 0px; margin: 0px; transform: translate3d(0px, 9.69697px, 0px);">
                  <ul class="py-2 text-[13px] font-medium" aria-labelledby="dropdownDefaultButton">
                    <li onclick="clickOperator(this)" data-value="+01">
                      <a href="#" class="number block pl-3 py-[5.5px] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">+01</a>
                    </li>
                    <li onclick="clickOperator(this)" data-value="+010">
                      <a href="#" class="number block pl-3 py-[5.5px] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">+010</a>
                    </li>
                    <li onclick="clickOperator(this)" data-value="+099">
                      <a href="#" class="number block pl-3 py-[5.5px] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">+099</a>
                    </li>
                    <li onclick="clickOperator(this)" data-value="+994">
                      <a href="#" class="number block pl-3 py-[5.5px] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">+994</a>
                    </li>
                    <li onclick="clickOperator(this)" data-value="+600">
                      <a href="#" class="number block pl-3 py-[5.5px] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">+600</a>
                    </li>
                    <li onclick="clickOperator(this)" data-value="+100">
                      <a href="#" class="number block pl-3 py-[5.5px] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">+100</a>
                    </li>
                    <li onclick="clickOperator(this)" data-value="+899">
                      <a href="#" class="number block pl-3 py-[5.5px] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">+899</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="w-full rounded-[500px] border-[1px] border-[#0000001A]   ">
                <input type="tel" class="rounded-full border-0 w-full h-[34px] outline-none text-[12px] font-normal bg-[#EBEBEB]" placeholder="050 770 35 22">
              </div>
              <select id="realSelect" class="hidden">
                <option value="">Seçim edin</option>
                <option value="+01">+01</option>
                <option value="010">+010</option>
                <option value="+099">+099</option>
                <option value="+994">+994</option>
                <option value="+600">+600</option>
                <option value="+100">+100</option>
                <option value="+899">+899</option>
              </select>
            </div>
            
          <div class="mt-3">
                    <div><span class="text-error text-[12px]">*</span> <span class="text-messages text-[12px] font-medium opacity-65 dark:text-white">Vəzifə</span>
                    </div>
                    <div>
                      <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown2" type="button" class="w-full h-[34px] dark:text-white flex items-center justify-between cursor-pointer rounded-full border dark:border-[#FFFFFF1A] px-3 text-[12px] font-normal">
                        <span id="selectedValue2">Seçim edin</span>
                        <svg class="w-2.5 h-2.5 ms-3" fill="none" viewBox="0 0 10 6">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path>
                        </svg>
                      </button>

                      <div id="dropdown2" class="z-10 bg-white dark:bg-menu-dark dark:text-white rounded-lg w-[552px] border dark:border-[#FFFFFF1A] shadow hidden" data-popper-placement="bottom" style="position: absolute; inset: 0px auto auto 0px; margin: 0px; transform: translate3d(776.566px, 369.293px, 0px);">
                        <ul class="py-1 px-1" aria-labelledby="dropdownDefaultButton">
                          <li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="Mühasib">Mühasib</a>
                          </li>
                          <li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="UX dizayner">UX
                              dizayner</a>
                          </li>
                          <li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="Baş mühasib">Baş
                              mühasib</a>
                          </li>
                        </ul>
                      </div>

                      <select id="realSelect2" class="hidden">
                        <option value="Mühasib">Mühasib</option>
                        <option value="UX dizayner">UX dizayner</option>
                        <option value="Baş mühasib">Baş mühasib</option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-3">
                    <div><span class="text-error text-[12px]">*</span> <span class="text-messages text-[12px] font-medium opacity-65 dark:text-white">Səlahiyyət
                        qrupu</span></div>
                    <div>
                      <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown3" type="button" class="w-full h-[34px] dark:text-white flex items-center justify-between cursor-pointer rounded-full border px-3 text-[12px] font-normal dark:border-[#FFFFFF1A]">
                        <span id="selectedValue3">Seçim edin</span>
                        <svg class="w-2.5 h-2.5 ms-3" fill="none" viewBox="0 0 10 6">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path>
                        </svg>
                      </button>

                      <div id="dropdown3" class="z-10 bg-white dark:bg-menu-dark dark:text-white rounded-lg w-[552px] border-[1px] border-[#0000001A] dark:border-[#FFFFFF1A] shadow hidden" data-popper-placement="bottom" style="position: absolute; inset: 0px auto auto 0px; margin: 0px; transform: translate3d(0px, 9.69697px, 0px);" data-popper-reference-hidden="" data-popper-escaped="">
                        <ul class="py-1 px-1" aria-labelledby="dropdownDefaultButton">
                          <li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="Sistem inzibatçısı">Sistem
                              inzibatçısı</a></li>
                          <li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="Super Admin">Super
                              Admin</a>
                          </li>
                          <li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="Admin">Admin</a>
                          </li>
                          <li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="Mühasiblər">Mühasiblər</a>
                          </li>
                        </ul>
                      </div>

                      <select id="realSelect3" class="hidden">
                        <option value="Sistem inzibatçısı">Sistem
                          inzibatçısı</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin" selected="">Admin</option>
                        <option value="Mühasiblər">Mühasiblər</option>
                      </select>
                    </div>
                  </div>
            <div>
              <div class="flex items-center gap-3 mt-5 justify-end">
                <button type="button" class="bg-surface py-[6.5px] px-3 text-[13px] text-on-surface-variant font-medium rounded-[50px] cursor-pointer hover:bg-surface dark:bg-surface-bright-dark dark:text-on-surface-variant-dark" onclick="document.getElementById('editModal').remove()">Ləğv et</button>
                <button type="submit" class="bg-primary text-body-bg py-[6.5px] px-3 rounded-[100px] text-[13px] font-medium cursor-pointer hover:bg-hover-button">Dəyişikliyi təsdiqlə</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
};

function toggleIsci() {
    isIsciOpen = !isIsciOpen;
    if(isIsciOpen) {
        yeni_isciDiv.style.display = 'block';
        overlay.style.display = 'block';
        ishciId.style.display = 'none';
    } else {
        yeni_isciDiv.style.display = 'none';
        overlay.style.display = 'none';
        ishciId.style.display = 'none';
    }
}


function SearchId() {
    isSearchOpen = !isSearchOpen;
    if (isSearchOpen) {
        ishciId.style.display = 'block';
        yeni_isciDiv.style.display = 'none';
        overlay.style.display = 'block';
    } else {
        ishciId.style.display = 'none';
        overlay.style.display = 'none';
    }
}

let excelIsciler = document.querySelector('#excelIsciler')
let excelClick = false;

function excelPopUp(){
    excelClick = !excelClick
    if (excelClick) {
        excelIsciler.style.display = 'block';
        yeni_isciDiv.style.display = 'none';
        overlay.style.display = 'block';
    } else {
        excelIsciler.style.display = 'none';
        overlay.style.display = 'none';
    }

}


// Isci sil
const iscisilDiv = document.querySelector('#iscisilDiv')

let IsciSilclick = false

function isciniSil(){
    IsciSilclick = !IsciSilclick
    if(IsciSilclick){
        iscisilDiv.style.display = 'block';
        overlay.style.display = 'block';
    }
    else{
        iscisilDiv.style.display = 'none';
        overlay.style.display = 'none';
    }
}

const emaildogrulamaDiv = document.querySelector('.emaildogrulama-div')

let emailClick = false

function siltesdiq(){
    emailClick = !emailClick
    if(emailClick){
        emaildogrulamaDiv.style.display = 'block';
        overlay.style.display = 'block';
        iscisilDiv.style.display = 'none';
    }
    else{
        emaildogrulamaDiv.style.display = 'none';
        overlay.style.display = 'none';
    }
}



const minPrice = document.querySelector('#min-price')
const maxPrice = document.querySelector('#max-price')
const minpricerange = document.querySelector('#minpricerange')
const maxpricerange = document.querySelector('#maxpricerange')
const MAX_VALUE = 300000
function yekunminprice(){
    minPrice.innerHTML = minpricerange.value + `<img src="/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
}
function yekunmaxprice(){
    const reverseValue = MAX_VALUE - maxpricerange.value
    maxPrice.innerHTML = maxpricerange.value + `<img src="/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
}



let timeLeft = 4 * 60 + 59; // 4:59 in seconds
const countdownEl = document.getElementById('countdown');
const resendBtn = document.getElementById('resendBtn');
const otpInputs = document.querySelectorAll('.otp-input');
const updateTimer = () => {
  if (!countdownEl) return; // Əgər element yoxdursa, heç nə etmir
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    resendBtn.disabled = false;
    resendBtn.classList.remove("text-gray-600");
    resendBtn.classList.add("text-purple-600", "cursor-pointer");
  }
  timeLeft--;
};
const timer = setInterval(updateTimer, 1000);
updateTimer();
otpInputs.forEach((input, index) => {
  input.classList.add(
    "w-full", "h-[34px]", "text-center", "border-2", "border-purple-300",
    "rounded-md", "focus:outline-none", "focus:border-purple-500", "text-xl"
  );
  input.setAttribute("type", "text");
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("pattern", "[0-9]*");
  input.setAttribute("autocomplete", "one-time-code");
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    if (e.target.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pastedText.replace(/\D/g, '').split("");
    if (digits.length > 0) {
      otpInputs.forEach((input, i) => {
        input.value = digits[i] || "";
      });
      otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
    }
  });
});





$(document).ready(function () {
  const myData = [
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      },
      {
          id: "RO002",
          name: "Ramin Orucov",
          email: "ramin.orucovvv@gmail.com",
          phone: "+994 50 770 35 22",
      }
  ];

  const table = $('#myTable2').DataTable({
      paging: true,
      info: false,
      dom: 't',
      data: myData,
      columns: [
          {
              orderable: false,
              data: function(row, type, set, meta) {
                  const idx = meta.row;
                  return `
                      <input type="checkbox" id="cb-${idx}" class="peer hidden">
                      <label for="cb-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                          <div class="icon stratis-check-01 scale-60"></div>
                      </label>
                  `;
              }
          },
          {
              data: function(row) {
                  return `
                      <div class="flex items-center gap-3">
                          <span class="text-secondary-text text-[11px] font-normal">ID: ${row.id}</span>
                      </div>
                  `;
              }
          },
          {
              data: function(row) {
                  return `<span class="text-[13px] text-messages font-normal">${row.name}</span>`;
              }
          },
          {
              data: function(row) {
                  return `<span class="text-[13px] text-messages font-normal">${row.email}</span>`;
              }
          },
          {
              data: function(row) {
                  return `<span class="text-[13px] text-messages font-normal">${row.phone}</span>`;
              }
          }
      ],
      order: [],
      lengthChange: false,
      pageLength: 10,
      createdRow: function(row, data, dataIndex) {
          // Hover effekti
          $(row)
              .css('transition', 'background-color 0.2s ease')
              .on('mouseenter', function () {
                  $(this).css('background-color', '#FAFAFA');
              })
              .on('mouseleave', function () {
                  $(this).css('background-color', '');
              });

          /// Bütün td-lərə border alt
          $(row).find('td')
              .addClass('border-b-[.5px] border-stroke')

          $(row).find('td:not(:first-child)')
              .css({
                  'padding-left': '20px',
                  'padding-top': '14.5px',
                  'padding-bottom': '14.5px'
              })

          $('#myTable2 thead th:first-child')
              .css({
                  'padding-left': '0',
                  'padding-right': '0',
                  'width': '58px',
                  'text-align': 'center',
                  'vertical-align': 'middle',
              });


          $('#myTable2 thead th:first-child label')
              .css({
                  'margin': '0 auto',
                  'display': 'flex',
                  'justify-content': 'center',
                  'align-items': 'center'
              });

          // Sol td (checkbox): padding və genişliyi sıfırla, border ver
          $(row).find('td:first-child')
              .css({
                  'padding-left': '0',
                  'padding-right': '0',
                  'width': '48px',   // checkbox sütunu üçün daha dar genişlik (uyğunlaşdıra bilərsən)
                  'text-align': 'center'
              });

          // Label içində margin varsa sıfırla
          $(row).find('td:first-child label').css({
              'margin': '0',
              'display': 'inline-flex',
              'justify-content': 'center',
              'align-items': 'center'
          });

      },

      initComplete: function() {
          $('#myTable2 thead th').css({
              'padding-left': '20px',
              'padding-top': '10.5px',
              'padding-bottom': '10.5px'
          });

          // Table başlıqlarına stil burada verilməlidir
          $('#myTable2 thead th:first-child').css({
              'padding-left': '0',
              'padding-right': '0',
              'width': '58px',
              'text-align': 'center',
              'vertical-align': 'middle',
          });


          $('#myTable2 thead th:first-child label').css({
              'margin': '0 auto',
              'display': 'flex',
              'justify-content': 'center',
              'align-items': 'center'
          });

          // Filtrləmə ikonları üçün mövcud kodun saxlanması
          $('#myTable2 thead th.filtering').each(function() {
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

          // Spacer-row əlavə olunur
          $('#myTable2 tbody tr.spacer-row').remove();

          const colCount = $('#myTable2 thead th').length;
          const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
          $('#myTable2 tbody').prepend(spacerRow);

          // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
          const $lastRow = $('#myTable2 tbody tr:not(.spacer-row):last');

          $lastRow.find('td').css({
              'border-bottom': '0.5px solid #E0E0E0',
          });

          // Səhifələmə düymələri
          $pagination.append(`
              <div class="flex items-center justify-center  pr-[42px] h-8 ms-0 leading-tight ${pageInfo.page === 0 ? 'opacity-50 cursor-not-allowed' : 'text-messages'}"
                  onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                  <div class="icon stratis-chevron-left !h-[12px] !w-[7px] " ></div>
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
                  onclick="changePage(${pageInfo.page + 1})">
                  <div class="icon stratis-chevron-right !h-[12px] !w-[7px] "></div>
              </div>
          `);
      }
  });
  // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
  $('#newCheckbox').on('change', function () {
      const isChecked = $(this).is(':checked');

      $('#myTable2 tbody input[type="checkbox"]').each(function () {
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


const filterPop = document.querySelector('#filterPop')
const overlay = document.querySelector('#overlay')
let filterclick = false

function openFilterModal(){
    filterclick = !filterclick
    if(filterclick){
        filterPop.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        filterPop.style.display = 'none'
        overlay.style.display = 'none'
    }
}
function clearFilters() {

    document.querySelectorAll('#filterPop input[type="checkbox"]').forEach(cb => cb.checked = false);

    document.querySelectorAll('#filterPop input[type="date"]').forEach(input => input.value = '');
}
let surunlarpop = document.querySelector('#sutunlarPop');

let click7 = false;

function openSutunlarPop() {
    click7 = !click7;
    if (click7) {
        surunlarpop.classList.remove('hidden');
        overlay.classList.remove('hidden');
        overlay.style.display = 'block';
    } else {
        surunlarpop.classList.add('hidden');
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
}

overlay.addEventListener('click', function() {
    surunlarpop.classList.add('hidden');
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
    click7 = false;
});

document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton = document.getElementById('dropdownDefaultButton6');
    const dropdownMenu = document.getElementById('dropdown6');

    if (dropdownButton && dropdownMenu) {
        dropdownButton.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
            dropdownMenu.classList.toggle('visible');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.add('hidden');
                dropdownMenu.classList.remove('visible');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const dropdownButton78 = document.getElementById('dropdownDefaultButton78');
    const dropdownMenu78 = document.getElementById('dropdown78');

    if (dropdownButton78 && dropdownMenu78) {
        dropdownButton78.addEventListener('click', () => {
            dropdownMenu78.classList.toggle('hidden');
            dropdownMenu78.classList.toggle('visible');
        });

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (!dropdownButton78.contains(event.target) && !dropdownMenu78.contains(event.target)) {
                dropdownMenu78.classList.add('hidden');
                dropdownMenu78.classList.remove('visible');
            }
        });
    }
});





// Vəzifə üçün
document.querySelectorAll('#dropdown2 ul li a').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('selectedValue2').textContent = this.getAttribute('data-value');
    document.getElementById('dropdown2').classList.add('hidden');
    // Əgər select də varsa, onu da dəyiş
    document.getElementById('realSelect2').value = this.getAttribute('data-value');
  });
});

// Səlahiyyət qrupu üçün
document.querySelectorAll('#dropdown3 ul li a').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('selectedValue3').textContent = this.getAttribute('data-value');
    document.getElementById('dropdown3').classList.add('hidden');
    document.getElementById('realSelect3').value = this.getAttribute('data-value');
  });
});


window.clickhesabTesdiqi = function() {
    const popup = document.getElementById('hesabtesdiqipop');
    const overlay = document.getElementById('overlay');
    const mailPopup = document.getElementById('mailadressiPop');
    if (popup.classList.contains('hidden')) {
        popup.classList.remove('hidden');
        if (mailPopup) mailPopup.classList.add('hidden');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'block';
        }
    } else {
        popup.classList.add('hidden');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
}


window.clickmaildeyish = function() {
    const mailPopup = document.getElementById('mailadressiPop');
    const overlay = document.getElementById('overlay');
    if (mailPopup.classList.contains('hidden')) {
        mailPopup.classList.remove('hidden');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'block';
        }
    } else {
        mailPopup.classList.add('hidden');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
}

window.confirmMailChange = function() {
    // Mail popup-u bağla
    const mailPopup = document.getElementById('mailadressiPop');
    if (mailPopup) mailPopup.classList.add('hidden');
    // OTP popup-u aç
    window.clickhesabTesdiqi();
}



window.clickDeaktiv = function() {
    const popup = document.getElementById('deaktivPop');
    const overlay = document.getElementById('overlay');
    if (popup.classList.contains('hidden')) {
        popup.classList.remove('hidden');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'block';
        }
    } else {
        popup.classList.add('hidden');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
}


window.clickSilinmeMuraciet = function() {
    const popup = document.getElementById('silinmeMuracietPopUp');
    const overlay = document.getElementById('overlay');
    if (popup.classList.contains('hidden')) {
        popup.classList.remove('hidden');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'block';
        }
    } else {
        popup.classList.add('hidden');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
}



window.clickTwoStepVerification = function() {
    const popup = document.getElementById('twoStepVerificationPop');
    const overlay = document.getElementById('overlay');
    if (popup.classList.contains('hidden')) {
        popup.classList.remove('hidden');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'block';
        }
    } else {
        popup.classList.add('hidden');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
}


window.twoStepVerificationConfirm = function() {

    const popup = document.getElementById('twoStepVerificationPop');
    if (popup) popup.classList.add('hidden');

    window.clickhesabTesdiqi();
}

function openNewUserModal() {
    document.getElementById('createModal2').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeNewUserModal() {
    document.getElementById('createModal2').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof openNewItemModal === 'function') {
        window.openNewItemModal = openNewUserModal;
    }

    const newUserBtn = document.querySelector('[onclick*="openNewItemModal"]');
    if (newUserBtn) {
        newUserBtn.setAttribute('onclick', 'openNewUserModal(); return false;');
    }

    document.querySelectorAll('#createModal2 img[alt="Close"]').forEach(button => {
        button.addEventListener('click', closeNewUserModal);
    });

    const cancelButton = document.getElementById('createCancelBtn');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeNewUserModal);
    }

    document.getElementById('overlay').addEventListener('click', closeNewUserModal);
});

function clickoperatorCreate(element) {
    const value = element.getAttribute('data-value');
    document.getElementById('operatorCreateText').textContent = value;
    document.getElementById('dropdownCreate').classList.add('hidden');
}
// Outside click for dynamically created edit modal
document.addEventListener("click", (e) => {
    const editModalEl = document.getElementById("editModal");
    if (!editModalEl) return; // modal not open
    const redakteDiv = editModalEl.querySelector('.redakte-div');
    // If click is outside the inner content but still inside overlay area => close
    if (redakteDiv && !redakteDiv.contains(e.target) && editModalEl === e.target) {
        editModalEl.remove();
    }
});

     document.addEventListener("DOMContentLoaded", function () {
    const createModal = document.getElementById("createModal");
     const createCancelBtn = document.getElementById("createCancelBtn");
    const createForm = document.getElementById("createForm");

    // === Operator Dropdown ===
    const operatorBtn = document.getElementById("dropdownCreateDefaultButton");
    const operatorText = document.getElementById("operatorCreateText");
    const operatorDropdown = document.getElementById("dropdownCreate");
    const realCreateSelect = document.getElementById("realCreateSelect");

    function hideDropdown(dropdown) {
        dropdown.classList.add("hidden");
    }

    function toggleDropdown(dropdown) {
        dropdown.classList.toggle("hidden");
    }

    operatorBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdown(operatorDropdown);
    });

    operatorDropdown.querySelectorAll("li").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const value = item.getAttribute("data-value");
            operatorText.textContent = value;
            realCreateSelect.value = value;
            hideDropdown(operatorDropdown);
        });
    });

    // Vəzifə & Səlahiyyət dropdown handlers removed.
    // New unified logic lives in avankartProfili.js (bindCreateDropdownClicks / populateCreateDropdowns).
    // Keeping only operator dropdown logic here to avoid conflicts.

    // === Cancel Button ===
    createCancelBtn.addEventListener("click", () => {
        createModal.classList.add("hidden");
    });

    // === Click Outside Create Modal ===
    document.addEventListener("click", (e) => {
        if (createModal && !createModal.contains(e.target)) {
            createModal.classList.add("hidden");
            hideDropdown(operatorDropdown);
            hideDropdown(vezifeDropdown);
            hideDropdown(selahiyyetDropdown);
        }
    });

    // === Escape Key Closes Modal and Dropdowns ===
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            createModal.classList.add("hidden");
            hideDropdown(operatorDropdown);
            hideDropdown(vezifeDropdown);
            hideDropdown(selahiyyetDropdown);
        }
    });

    // === Operator Click (for inline li onclick fallback) ===
    window.clickoperatorCreate = function (element) {
        const value = element.getAttribute("data-value");
        operatorText.textContent = value;
        realCreateSelect.value = value;
        hideDropdown(operatorDropdown);
    };
});
