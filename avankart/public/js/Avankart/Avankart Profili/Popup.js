function Otp() {
  const modalHTML = `
  <div class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-100" id="otp-modal">
  <div class="relative w-[450px] h-[399px] border-[#0000001A] border-[2px]
    shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

     <h2 class="text-[15px] font-medium text-messages ml-[24px] mt-[26px]">Yeni hesab</h2>

          <div class="flex flex-col  mb-[24px]  pt-[20px] max-w-[400px] w-[100%] m-auto">
            <h2 class=" pb-[4px] text-[17px] font-poppins font-semibold  leading-[160%]  text-messages ">OTP</h2>
            <div class="flex flex-wrap gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
                <span class="font-medium">ramin.orucovvv@gmail.com</span>
                <span class="opacity-65 font-normal">email adresinə göndərilən 6 </span>
                <span class=" opacity-65 font-normal">rəqəmli şifrəni daxil edin</span>
              </div>

                      </div>


        <form>

            <div class=" text-center space-y-4 max-w-[400px] w-[100%] m-auto">

                <div id="countdown" class="text-messages bg-inverse-on-surface  rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium  leading--[160%] font-poppins">
                  4:59
                </div>

                <div class="grid grid-cols-6 gap-2 mt-[8px]">
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                </div>
              </div>
              <div class="text-center  flex justify-center max-w-[400px] w-[100%] m-auto">
                <p class="font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
                <a href="#  " class="text-[12px] font-medium font-poppins text-messages  px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none  ">Yenidən göndər</a>
            </div>
            <div class="absolute bottom-[24px] right-[12px] flex gap-[12px]">
                <button href="#" class=" text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[83px] !h-[34px]">Ləvğ et</button>
                <button href="#" class=" text-[13px] text-on-primary font-medium bg-primary rounded-[50px] !w-[91px] !h-[34px]">Təsdiqlə</button>
              </div>


        </form>
</div>
  </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
}

function Otp2() {
  const modalHTML = `
  <div class="fixed inset-0  bg-opacity-30 flex items-center justify-center z-100" id="otp-modal">
  <div class="relative w-[450px] h-[399px] border-[#0000001A] border-[2px]
    shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-[12px] bg-white z-0">

     <h2 class="text-[15px] font-medium text-messages ml-[24px] mt-[26px]">Hesab təsdiqi</h2>

          <div class="flex flex-col  mb-[24px]  pt-[20px] max-w-[400px] w-[100%] m-auto">
            <h2 class=" pb-[4px] text-[17px] font-poppins font-semibold  leading-[160%]  text-messages ">OTP</h2>
            <div class="flex flex-wrap gap-[3px] font-normal text-[13px] leading-[160%] font-poppins text-messages opacity-100">
                <span class="font-medium">ramin.orucovvv@gmail.com</span>
                <span class="opacity-65 font-normal">email adresinə göndərilən 6 </span>
                <span class=" opacity-65 font-normal">rəqəmli şifrəni daxil edin</span>
              </div>

                      </div>


        <form>

            <div class=" text-center space-y-4 max-w-[400px] w-[100%] m-auto">

                <div id="countdown" class="text-messages bg-inverse-on-surface  rounded-full w-[60px] h-[27px] mx-auto py-1 text-[12px] mb-[24px] font-medium  leading--[160%] font-poppins">
                  4:59
                </div>

                <div class="grid grid-cols-6 gap-2 mt-[8px]">
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                    <input type="text" maxlength="1" class="otp-input border-[1px] rounded-[8px] border-stroke  border-opacity-[10%]  pl-[12px] placeholder-on-surface-variant-dark
                    hover:bg-input-hover
                    focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none
                    active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
                    transition-all ease-out duration-300" />
                </div>
              </div>
              <div class="text-center  flex justify-center max-w-[400px] w-[100%] m-auto">
                <p class="font-normal font-poppins leading--[160%] opacity-[65%] text-[12px] pr-[4px] pt-[24px]">Email adresinə mesaj gəlmədi?</p>
                <a href="#" class="text-[12px] font-medium font-poppins text-messages  px-[12px] py-[3px] mt-[21px] hover:bg-[#F6D9FF] rounded-[50px] active:bg-[#F6D9FF] disabled:bg-none  ">Yenidən göndər</a>
            </div>
            <div class="absolute bottom-[24px] right-[12px] flex gap-[12px]">
                <button href="#" class=" text-[13px] text-on-surface-variant font-medium bg-surface-bright rounded-[50px] !w-[83px] !h-[34px]">Ləvğ et</button>
                <button href="#" class=" text-[13px] text-on-primary font-medium bg-primary rounded-[50px] !w-[91px] !h-[34px]">Təsdiqlə</button>
              </div>


        </form>
</div>
  </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);
}

const showEditModal = () => {
  const existing = document.getElementById("editModal");
  if (existing) existing.remove();

  const modalHTML = `
    <div id="editModal" class="fixed inset-0 flex items-center justify-center bg-[#0000002A] bg-opacity-30 z-500">
      <div class="redakte-div font-poppins w-[490px] h-[560px] bg-body-bg dark:bg-body-bg-dark border-[3px] border-[#0000001A] !shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50 dark:border-[#ffffff1A]">
        <div class="flex items-center justify-between py-0.5 mb-5">
          <span class="text-[15px] font-medium text-messages dark:text-white">Redaktə et</span>
          <img onclick="document.getElementById('editModal').remove()" src="/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden">
          <img onclick="document.getElementById('editModal').remove()" src="/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block">
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
                  <img src="/images/settings/chevron-down.svg" alt="Down" class="!w-[15px] !h-[15px] block dark:hidden">
                  <img src="/images/settings/chevron-dark.svg" alt="Down" class="hidden dark:block">
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
