// editPopup.js - Fixed version for all issues

class EditPopupManager {
  constructor() {
    this.selectedCardsData = [];
    this.currentUserSelections = new Set(); // Track current user selections
    this.init();
  }

  init() {
    this.loadSelectedCards();
    this.setupCardsTab();
    this.setupScheduleInputs();
    this.setupPhonePrefixHandling();
    this.setupSocialNetworkHandling();
  }

  // DB-dan seçilmiş kartları yüklə
  loadSelectedCards() {
    if (window.muessiseData && window.muessiseData.cards) {
      this.selectedCardsData = window.muessiseData.cards;
    }
  }

  // Tab açıldığında checkbox-ları yenilə
  setupCardsTab() {
    const tabItems = document.querySelectorAll(".tab-item");

    tabItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const targetTab = item.getAttribute("data-tab");

        // Save current selections before switching away from cards tab
        if (item.closest('.tab-item.active') && item.closest('.tab-item.active').getAttribute('data-tab') === 'tab-cards') {
          this.saveCurrentCardSelections();
        }

        if (targetTab === "tab-cards") {
          setTimeout(() => {
            this.updateCardSelection();
          }, 50);
        }
      });
    });

    // Also listen for checkbox changes to track user selections
    document.addEventListener('change', (e) => {
      if (e.target.matches('#tab-cards input[name="cards[]"]')) {
        this.trackCardSelection(e.target);
      }
    });

    // Səhifə yüklənəndə də yoxla
    setTimeout(() => {
      this.initializeCardSelections();
    }, 100);
  }

  initializeCardSelections() {
    // Initialize current selections with database data
    if (this.selectedCardsData && this.selectedCardsData.length > 0) {
      this.selectedCardsData.forEach(card => {
        const cardValue = typeof card === "object" ? card.name : card;
        this.currentUserSelections.add(cardValue);
      });
    }
    this.updateCardSelection();
  }

  saveCurrentCardSelections() {
    // Save the current state of all checkboxes
    const checkboxes = document.querySelectorAll('#tab-cards input[name="cards[]"]');
    this.currentUserSelections.clear();

    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        this.currentUserSelections.add(checkbox.value);
      }
    });
  }

  trackCardSelection(checkbox) {
    // Track individual checkbox changes
    if (checkbox.checked) {
      this.currentUserSelections.add(checkbox.value);
    } else {
      this.currentUserSelections.delete(checkbox.value);
    }
  }

  // 1. Fix schedule inputs to have name="schedule[]" and value from data-day
  setupScheduleInputs() {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        this.fixScheduleInputs();
      }, 200);
    });

    // Also fix when tab is switched to schedule
    const tabItems = document.querySelectorAll(".tab-item");
    tabItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const targetTab = item.getAttribute("data-tab");
        if (targetTab === "tab-schedule") {
          setTimeout(() => {
            this.fixScheduleInputs();
          }, 50);
        }
      });
    });
  }

  fixScheduleInputs() {
    // Fix all schedule inputs
    const scheduleInputs = document.querySelectorAll('input[data-day]');

    scheduleInputs.forEach((input) => {
      const dayValue = input.getAttribute('data-day');
      if (dayValue) {
        // Set name attribute to schedule[]
        input.setAttribute('name', 'schedule[]');
        // Set value to the data-day value
        input.setAttribute('value', dayValue);
      }
    });
  }

  // 2. Fix phone prefix handling for all phone inputs
  setupPhonePrefixHandling() {
    // Remove any existing event listeners from add buttons
    this.overrideAddPhoneButton();

    // Handle prefix dropdown clicks using event delegation
    document.addEventListener('click', (e) => {
      // Handle prefix dropdown items
      if (e.target.matches('[data-value]') && e.target.closest('[id*="PrefixDropdown"]')) {
        this.handlePrefixSelection(e.target);
        return;
      }

      // Handle prefix button clicks
      if (e.target.closest('button[id*="prefixButton"]') || e.target.closest('button[id*="PrefixButton"]')) {
        e.preventDefault();
        const button = e.target.closest('button');
        this.togglePrefixDropdown(button);
        return;
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative')) {
        const allDropdowns = document.querySelectorAll('[id*="PrefixDropdown"]');
        allDropdowns.forEach(dropdown => dropdown.classList.add('hidden'));
      }
    });

    // Setup existing phone fields on load
    setTimeout(() => {
      this.setupAllPhoneFields();
      this.fixExistingPhoneInputs();
    }, 200);
  }

  overrideAddPhoneButton() {
    // Find the add phone button and override its behavior
    const addPhoneButton = document.querySelector('[data-type="phone"]');
    if (addPhoneButton) {
      // Remove any existing event listeners by cloning the element
      const newButton = addPhoneButton.cloneNode(true);
      addPhoneButton.parentNode.replaceChild(newButton, addPhoneButton);

      // Add our controlled event listener
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.addNewPhoneField();
      });
    }
  }

  handlePrefixSelection(dropdownItem) {
    const selectedPrefix = dropdownItem.getAttribute('data-value');
    const dropdown = dropdownItem.closest('[id*="PrefixDropdown"]');
    const phoneContainer = dropdown.closest('.relative').parentElement;

    // Update the display button
    const prefixSelected = phoneContainer.querySelector('[id*="prefixSelected"], [id*="PrefixSelected"]');
    if (prefixSelected) {
      prefixSelected.textContent = selectedPrefix;
    }

    // Update the hidden input
    const hiddenInput = phoneContainer.querySelector('input[name="phone_prefix[]"]');
    if (hiddenInput) {
      hiddenInput.value = selectedPrefix;
    }

    // Hide the dropdown
    dropdown.classList.add('hidden');
  }

  togglePrefixDropdown(button) {
    const dropdown = button.parentElement.querySelector('[id*="PrefixDropdown"]');
    if (dropdown) {
      dropdown.classList.toggle('hidden');

      // Close other dropdowns
      const allDropdowns = document.querySelectorAll('[id*="PrefixDropdown"]');
      allDropdowns.forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
          otherDropdown.classList.add('hidden');
        }
      });
    }
  }

  addNewPhoneField() {
    const phoneContainer = document.getElementById("phoneContainer");
    const uniqueId = Date.now();

    const newPhone = document.createElement("div");
    newPhone.className = "removable-item flex items-center gap-2 mb-2";

    newPhone.innerHTML = `
      <div class="relative inline-block w-20">
        <button id="phonePrefixButton-${uniqueId}" type="button"
          class="w-full border border-stroke dark:border-[#FFFFFF1A] text-xs dark:text-primary-text-color-dark rounded-full px-3 py-[7.5px] text-left flex justify-between items-center">
          <span id="phonePrefixSelected-${uniqueId}">+994</span>
          <svg class="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <input type="hidden" name="phone_prefix[]" value="+994" />

        <div id="phonePrefixDropdown-${uniqueId}" class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-20 max-h-[168px] overflow-y-scroll dark:border-[#FFFFFF1A] bg-menu dark:bg-menu-dark rounded-[8px] shadow-lg custom-scroll touch-auto hidden z-10">
          <div class="py-2 text-start space-y-2 text-[13px] text-messages dark:text-primary-text-color-dark font-medium ml-1 mr-2">
            <div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+01">+01</div>
            <div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+010">+010</div>
            <div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+099">+099</div>
            <div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+994">+994</div>
            <div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+600">+600</div>
            <div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+100">+100</div>
            <div class="text-center cursor-pointer hover:bg-[#F6D9FF] dark:hover:bg-input-hover-dark" data-value="+899">+899</div>
          </div>
        </div>
      </div>

      <input type="text" name="phone_number[]" placeholder="Telefon nömrənizi daxil edin"
        class="focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 flex-1 dark:bg-menu-dark border border-stroke dark:border-[#FFFFFF1A] placeholder:text-[#BFC8CC] dark:placeholder:text-[#636B6F] text-messages dark:text-primary-text-color-dark font-normal rounded-full px-3 py-[7.5px] text-xs" />

      <button type="button" class="remove-btn hidden">
        <div class="icon stratis-trash-01 w-[14px] h-[14px] text-red-500"></div>
      </button>
    `;

    phoneContainer.appendChild(newPhone);

    // Update remove buttons
    this.updateRemoveButtonsForCategory("phone");
    this.attachRemoveListener(newPhone, "phone");
  }

  fixExistingPhoneInputs() {
    // Fix any existing phone inputs that don't have proper name attributes
    const phoneInputs = document.querySelectorAll('#phoneContainer input[type="text"], .removable-item input[type="text"][placeholder*="Telefon"]');
    phoneInputs.forEach(input => {
      if (!input.name || input.name === '') {
        input.setAttribute('name', 'phone_number[]');
      }
    });

    // Fix prefix inputs
    const prefixInputs = document.querySelectorAll('input[name="phonePrefix[]"]');
    prefixInputs.forEach(input => {
      input.setAttribute('name', 'phone_prefix[]');
    });
  }

  updateRemoveButtonsForCategory(category) {
    let selector;
    if (category === "phone") {
      selector = ".removable-item:has(input[placeholder*='Telefon']), #phoneContainer .removable-item";
    } else if (category === "email") {
      selector = ".removable-item:has(input[type='email'])";
    } else if (category === "web") {
      selector = ".removable-item:has(input[placeholder*='Linki'])";
    }

    const items = document.querySelectorAll(selector);
    items.forEach((item, index) => {
      const removeBtn = item.querySelector('.remove-btn');
      if (removeBtn) {
        if (index === 0) {
          removeBtn.classList.add('hidden');
        } else {
          removeBtn.classList.remove('hidden');
        }
      }
    });
  }

  attachRemoveListener(item, category) {
    const removeBtn = item.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        item.remove();
        this.updateRemoveButtonsForCategory(category);
      });
    }
  }

  setupAllPhoneFields() {
    // Setup any existing phone fields that might not have proper event listeners
    const existingButtons = document.querySelectorAll('button[id*="prefixButton"], button[id*="PrefixButton"]');
    existingButtons.forEach(button => {
      // Remove any existing listeners and add our controlled ones
      button.replaceWith(button.cloneNode(true));
    });
  }

  // 3. Fix social network link clickability after add button
  setupSocialNetworkHandling() {
    // Handle Instagram
    this.setupSocialNetwork('instagram');
    // Handle Facebook  
    this.setupSocialNetwork('facebook');
    // Handle LinkedIn if exists
    this.setupSocialNetwork('linkedin');
  }

  setupSocialNetwork(platform) {
    const addBtn = document.getElementById(`${platform}AddBtn`);
    const submitBtn = document.getElementById(`${platform}SubmitBtn`);
    const cancelBtn = document.getElementById(`${platform}CancelBtn`);
    const removeBtn = document.getElementById(`${platform}RemoveBtn`);
    const inputGroup = document.getElementById(`${platform}InputGroup`);
    const linkDisplay = document.getElementById(`${platform}LinkDisplay`);
    const linkInput = document.getElementById(`${platform}LinkInput`);
    const linkHref = document.getElementById(`${platform}LinkHref`);
    const hiddenInput = document.getElementById(`${platform}Input`);

    if (!addBtn) return;

    // Add button click
    addBtn.addEventListener('click', () => {
      addBtn.style.display = 'none';
      inputGroup.classList.remove('hidden');
      inputGroup.classList.add('flex');
      linkInput.focus();
    });

    // Submit function
    const submitLink = () => {
      const linkValue = linkInput.value.trim();
      if (linkValue) {
        const fullLink = linkValue.startsWith('http') ? linkValue : `https://${linkValue}`;

        // Update hidden input for form submission
        hiddenInput.value = fullLink;

        // Update display link and make it clickable
        linkHref.href = fullLink;
        linkHref.textContent = linkValue;
        linkHref.style.pointerEvents = 'auto'; // Ensure clickable
        linkHref.style.cursor = 'pointer';

        // Show link display, hide input group
        inputGroup.classList.add('hidden');
        inputGroup.classList.remove('flex');
        linkDisplay.classList.remove('hidden');
        linkDisplay.classList.add('flex');

        // Clear input
        linkInput.value = '';
      }
    };

    // Submit button click
    if (submitBtn) {
      submitBtn.addEventListener('click', submitLink);
    }

    // Enter key support
    if (linkInput) {
      linkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitLink();
        }
      });
    }

    // Cancel button click
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        inputGroup.classList.add('hidden');
        inputGroup.classList.remove('flex');
        addBtn.style.display = 'block';
        linkInput.value = '';
      });
    }

    // Remove button click
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        linkDisplay.classList.add('hidden');
        linkDisplay.classList.remove('flex');
        addBtn.style.display = 'block';
        hiddenInput.value = '';
        linkHref.href = '#';
        linkHref.textContent = '';
      });
    }
  }

  // Checkbox-ları yenilə
  updateCardSelection() {
    const checkboxes = document.querySelectorAll(
      '#tab-cards input[name="cards[]"]'
    );

    checkboxes.forEach((checkbox) => {
      const cardValue = checkbox.value;
      // Use current user selections instead of just database data
      const shouldBeChecked = this.currentUserSelections.has(cardValue);
      checkbox.checked = shouldBeChecked;
    });
  }

  // Kartın seçilmiş olub olmadığını yoxla (for backward compatibility)
  isCardSelected(cardValue) {
    return this.currentUserSelections.has(cardValue);
  }

  // Seçilmiş kartları al (form submit üçün)
  getSelectedCards() {
    // Return current user selections
    return Array.from(this.currentUserSelections);
  }
}

// Global instance
let editPopupManager;
document.addEventListener("DOMContentLoaded", () => {
  editPopupManager = new EditPopupManager();
  window.editPopupManager = editPopupManager;
});

// Data loaded event listener
document.addEventListener("cardsDataLoaded", (event) => {
  if (event.detail.success && window.editPopupManager) {
    window.editPopupManager.selectedCardsData =
      event.detail.muessiseData?.cards || [];
    // Re-initialize selections with new data
    window.editPopupManager.initializeCardSelections();
  }
});
