const minPrice = document.querySelector('#min-price')
const maxPrice = document.querySelector('#max-price')
const minpricerange = document.querySelector('#minpricerange')
const maxpricerange = document.querySelector('#maxpricerange')
const MAX_VALUE = 300000
function yekunminprice(){
    minPrice.innerHTML = minpricerange.value + `<img src="/public/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
}
function yekunmaxprice(){
    const reverseValue = MAX_VALUE - maxpricerange.value
    maxPrice.innerHTML = maxpricerange.value + `<img src="/public/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
}

const filterPop = document.querySelector('#filterPop')
const overlay = document.querySelector('#overlay')
let filterclick = false

function openFilterModal(){
    filterclick = !filterclick
    if(filterclick){
        filterPop.style.display = 'block'
        
    }
    else{
        filterPop.style.display = 'none'

    }
}

const invoyspopup = document.querySelector('#invoyspopup')
let clickpop = false

function invoysclick(){
    clickpop = !clickpop
    if(clickpop){
        invoyspopup.style.display = 'block'
    }
    else{
        invoyspopup.style.display = 'none'  
   }
}



function clearFilters() {

    document.querySelectorAll('#filterPop input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    document.querySelectorAll('#filterPop input[type="date"]').forEach(input => input.value = '');
}


function openAvankartaModal() {
  // Əvvəlki modal varsa sil
  $('#avankartaModal').remove();

  // Modal HTML-i
  const modalHtml = `
    <div id="avankartaModal" class="fixed bg-[#00000033] inset-0 z-200 flex items-center justify-center">
      <div class="relative w-[306px] h-[190px] border-[#0000001A] border-[0.5px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white dark:bg-table-hover-dark dark:border-[#ffffff1A] z-50">
        <div class="flex items-center justify-center mt-[12px] ml-[12px] w-[40px] h-[40px] bg-inverse-on-surface rounded-full dark:bg-[#2E3135]">
          <div class="icon iconex-danger-1 w-[20px] h-[20px] dark:text-[#FFFFFF]"></div>
        </div>
        <h2 class="ml-3 mt-3 text-messages font-medium text-[15px] dark:text-[#FFFFFF]">Təsdiqləmə</h2>
        <div class="flex flex-wrap mt-[12px] ml-[12px] gap-[3px] font-normal text-[13px] font-poppins text-messages opacity-100">
          <span class="font-medium dark:text-[#FFFFFF] ">AA-210 <span class="dark:text-[#FFFFFF] opacity-65"> invoys nömrəli hesablaşmanı təsdiqləmək istədiyinizə əminsiniz? </span> </span>
        </div>
        <div class="absolute bottom-[12px] right-[12px] flex gap-[12px]">
          <button class="text-[12px] cursor-pointer text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[51px] !h-[25px] dark:bg-[#36393E] dark:text-white" onclick="closeAvankartaModal()">Xeyr</button>
          <button class="text-[12px] cursor-pointer text-on-primary font-medium bg-success rounded-[50px] !w-[112px] !h-[25px] hover:bg-[#4CAF1E] transition" onclick="confirmAvankarta()">Bəli, təsdiqlə</button>
        </div>
      </div>
    </div>
  `;
 
  $('body').append(modalHtml);
}


function closeAvankartaModal() {
  $('#avankartaModal').remove();
}


function confirmAvankarta() {
  closeAvankartaModal();
}



function openReportEtModal() {
  // Əvvəlki report popup varsa sil
  $('#reportPopup').remove();

  // Popup HTML-i
  const popupHtml = `
    <div id="reportPopup" class="fixed bg-[#00000033] inset-0 z-200 flex items-center justify-center" >
      <div class="relative w-[403px] bg-body-bg border-[#0000001A] border-[2px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] z-50 dark:bg-[#161E22]">
        <div class="mt-[12px] gap-[3px] font-normal ml-[20px] text-[12px] leading-[160%] font-poppins text-messages opacity-100">
          <div class="flex items-center justify-end px-3" onclick="reportclick()">
            <img src="/public/images/Sorgular Pages Images/Close.svg" alt="Close" class="cursor-pointer dark:text-white text-me">
          </div>
          <div class="text-[13px] font-medium mb-[5px] text-[#1D222B] dark:text-white">Report</div>
          <div class="font-normal opacity-50 text-[10px] text-[#1D222B80] dark:text-[#FFFFFF80]">
            7/24 cavablamağa hazırıq
          </div>
        </div>
        <div class="space-y-3 text-[12px] text-messages max-w-[363px] w-[100%] m-auto pt-[24px]">
          <div class="flex justify-between border-b pb-3 dark:border-[#FFFFFF1A]">
            <span class="font-normal opacity-50 dark:text-white">Şirkət adı:</span>
            <span class="font-medium dark:text-white">Pasha Holding</span>
          </div>
          <div class="flex justify-between border-b pb-3 dark:border-[#FFFFFF1A]">
            <span class="font-normal opacity-50 dark:text-white">İnvoys nömrəsi:</span>
            <span class="font-medium dark:text-white">AEFS-2312</span>
          </div>
          <div class="flex justify-between border-b pb-3 dark:border-[#FFFFFF1A]">
            <span class="font-normal opacity-50 dark:text-white">Məbləğ:</span>
            <span class="font-medium dark:text-white">101.500.00 AZN</span>
          </div>
          <div class="flex justify-between border-b pb-3 dark:border-[#FFFFFF1A]">
            <span class="font-normal opacity-50 dark:text-white">Komissiya:</span>
            <span class="font-medium whitespace-nowrap dark:text-white">3.400.80 AZN</span>
          </div>
            <div class="flex justify-between border-b pb-3 dark:border-[#FFFFFF1A]">
            <span class="font-normal opacity-50 dark:text-white">Yekun:</span>
            <span class="font-medium whitespace-nowrap dark:text-white">104.900.80 AZN</span>
          </div>
            <div class="flex justify-between border-b pb-3 dark:border-[#FFFFFF1A]">
            <span class="font-normal opacity-50 dark:text-white">Yaradılma tarixi:</span>
            <span class="font-medium whitespace-nowrap dark:text-white">01.12.2023 09:23</span>
          </div>
        </div>
        <div class="space-y-[6px] max-w-[363px] w-[100%] m-auto">
          <label class="block text-messages opacity-65 text-[12px] mt-[12px] font-medium dark:text-[#FFFFFFA6]">Mesajınız</label>
          <div class="relative">
            <textarea class="w-full h-[73px] border pt-[3px] pl-[12px] text-gray-700 resize-none focus:outline-none focus:ring-gray-300 border-stroke border-opacity-[10%] rounded-[8px] text-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-[#161E22] dark:placeholder-[#636B6F] dark:border-[#FFFFFF1A]" placeholder="Mesajınızı daxil edin" maxlength="150"></textarea>
            <span class="absolute bottom-2 right-4 text-sm text-gray-400 dark:text-[#FFFFFF80]">max: 150</span>
          </div>
        </div>
        <button type="submit" class="cursor-pointer text-[13px] mt-[73px] flex items-center justify-center mx-[24px] w-[100%] max-w-[363px] font-poppins leading-[160%] font-medium h-[34px] bg-primary rounded-full text-on-primary hover:bg-hover-button focus:bg-primary focus:shadow-[0px_0px_16px_0px_rgba(0,0,0,0.2)] disabled:bg-primary disabled:opacity-[30%] transition-all ease-out duration-300 focus:outline-none">
          Göndər
        </button>
        <button type="button" onclick="reportclick()" class="cursor-pointer mt-[8px] text-[13px] flex items-center justify-center mx-[24px] w-[100%] max-w-[363px] font-poppins leading-[160%] font-medium h-[34px] bg-surface-bright rounded-full text- disabled:bg-[#7450864D] mb-6 dark:bg-[#36393E] dark:text-white">
          Ləğv et
        </button>
      </div>
    </div>
  `;
  $('body').append(popupHtml);
}

// Popup-u bağlayan funksiya
function reportclick() {
  $('#reportPopup').remove();
}


