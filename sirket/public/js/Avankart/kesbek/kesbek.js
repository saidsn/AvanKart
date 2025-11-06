function openFilterModal() {
    let modal = document.createElement("div");
    modal.id = "filterModal";
    modal.className =
      "fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-200";
  
    modal.innerHTML = `
        <div class="bg-sidebar-item dark:bg-side-bar-item-dark w-[450px] p-6 rounded-2xl shadow-lg border-3 border-stroke dark:border-[#FFFFFF1A] relative">
          <div class="relative flex flex-col gap-1 pb-3">
            <h2 class="text-base font-medium text-messages dark:text-primary-text-color-dark">Filter</h2>
            <span onclick="closeFilterModal()" class="absolute top-0 right-0 icon stratis-x-02 cursor-pointer text-sm dark:text-primary-text-color-dark"></span>
          </div>
          <form class="flex flex-col gap-3">
            <label class="flex flex-col gap-[6px]">
              <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-[6px]">
                      <label for="yearSelect" class="text-[12px] text-[#1D222BA6] font-medium">İl</label>
                      <select id="yearSelect"
                          class="w-full h-[36px] px-3 rounded-full border border-[#E5E7EB] bg-white text-xs font-normal text-[##1D222B] appearance-none">
                          <option value="">Seçim edin</option>
                          <option value="2023">2023</option>
                          <option value="2024">2024</option>
                          <option value="2025">2025</option>
                      </select>
                  </div>
                  <div class="flex flex-col gap-[6px]">
                      <label for="monthSelect" class="text-[12px] text-[#1D222BA6] font-medium">Ay</label>
                      <select id="monthSelect"
                          class="w-full h-[36px] px-3 rounded-full border border-[#E5E7EB] bg-white  text-xs font-normal text-[##1D222B] appearance-none">
                          <option value="">Seçim edin</option>
                          <option value="01">Yanvar</option>
                          <option value="02">Fevral</option>
                          <option value="03">Mart</option>
                          <option value="04">Aprel</option>
                          <option value="05">May</option>
                          <option value="06">İyun</option>
                          <option value="07">İyul</option>
                          <option value="08">Avqust</option>
                          <option value="09">Sentyabr</option>
                          <option value="10">Oktyabr</option>
                          <option value="11">Noyabr</option>
                          <option value="12">Dekabr</option>
                      </select>
                  </div>
              </div>
            </label>
            <label class="flex flex-col gap-[6px]">
              <span class="text-[12px] text-tertiary-text dark:text-tertiary-text-color-dark font-medium">Status</span> 
              <div class="flex items-center gap-4">
                <label for="newCheckbox" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="newCheckbox" class="peer hidden">
                  <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                              text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                              peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                              peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                    <div class="icon stratis-check-01 scale-60"></div>
                  </div>
                  <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Davam edir</span>
                </label>
  
                <label for="readCheckbox" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="readCheckbox" class="peer hidden">
                  <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center 
                              text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark 
                              peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark 
                              peer-checked:border-primary dark:peer-checked:border-primary-dark transition">
                    <div class="icon stratis-check-01 scale-60"></div>
                  </div>
                  <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">Tamamlanıb</span>
                </label>
              </div>
            </label>
    
            <div class="flex justify-end gap-2 mt-4">
              <button type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer" onclick="closeFilterModal()">Bağla</button>
              <button onclick="clearFilters()" type="button" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-surface-bright dark:bg-surface-bright-dark text-on-surface-variant dark:text-on-surface-variant-dark rounded-full cursor-pointer">Filterləri təmizlə</button>
              <button type="submit" class="text-[13px] font-medium py-[6.5px] px-[18px] bg-primary dark:bg-primary-dark hover:bg-hover-button dark:hover:bg-hover-button-dark focus:bg-focus dark:focus:bg-focus-color-dark text-on-primary dark:text-on-primary-dark rounded-full cursor-pointer">Filterlə</button>
            </div>
          </form>
        </div>
      `;
  
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeFilterModal();
      }
    });
  
    document.body.appendChild(modal);
  }
  
  function closeFilterModal() {
    let modal = document.getElementById("filterModal");
    if (modal) {
      modal.remove();
    }
  }
  
  function clearFilters() {
    document.getElementById("yearSelect").value = "";
    document.getElementById("monthSelect").value = "";
    document.getElementById("newCheckbox").checked = false;
    document.getElementById("readCheckbox").checked = false;
  }
  