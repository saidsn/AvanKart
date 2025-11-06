// Operations Filter JavaScript Functions
// Bu fayl əməliyyat tarixçəsi üçün filter funksionallığını idarə edir

class OperationsFilter {
    constructor() {
        this.filterData = {
            startDate: '',
            endDate: '',
            cardCategories: [],
            destinations: [],
            statuses: [],
            minAmount: 0,
            maxAmount: 10000
        };
        
        this.init();
    }

    init() {
        this.initializeSlider();
        this.bindEvents();
    }

    // Slider-i initialize etmək
    initializeSlider() {
        const sliderContainer = document.getElementById('operationsSliderRange');
        if (sliderContainer && typeof noUiSlider !== 'undefined') {
            this.slider = noUiSlider.create(sliderContainer, {
                start: [0, 10000],
                connect: true,
                range: {
                    'min': 0,
                    'max': 10000
                },
                format: {
                    to: function (value) {
                        return Math.round(value);
                    },
                    from: function (value) {
                        return Number(value);
                    }
                }
            });

            // Slider dəyişdikdə filter datanı yeniləmək
            this.slider.on('update', (values, handle) => {
                this.filterData.minAmount = parseInt(values[0]);
                this.filterData.maxAmount = parseInt(values[1]);
                
                document.getElementById('operationsMinValue').textContent = values[0] + ' AZN';
                document.getElementById('operationsMaxValue').textContent = values[1] + ' AZN';
            });
        }
    }

    // Event listener-ləri bağlamaq
    bindEvents() {
        // Checkbox-lar üçün "hamısı" seçimi
        this.handleSelectAllCheckboxes();
        
        // Form submit-ini dayandırmaq
        const form = document.getElementById('operationsFilterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.applyFilters();
            });
        }
    }

    // "Hamısı" checkbox-larının idarə edilməsi
    handleSelectAllCheckboxes() {
        // Kart kateqoriyası üçün "hamısı"
        const cardCategoryAll = document.getElementById('operations-card-category-all');
        const cardCategoryCheckboxes = document.querySelectorAll('input[name="cardCategory"]:not(#operations-card-category-all)');
        
        if (cardCategoryAll) {
            cardCategoryAll.addEventListener('change', () => {
                cardCategoryCheckboxes.forEach(checkbox => {
                    checkbox.checked = cardCategoryAll.checked;
                });
            });
        }

        // Təyinat üçün "hamısı"
        const destinationAll = document.getElementById('operations-destination-all');
        const destinationCheckboxes = document.querySelectorAll('input[name="destination"]:not(#operations-destination-all)');
        
        if (destinationAll) {
            destinationAll.addEventListener('change', () => {
                destinationCheckboxes.forEach(checkbox => {
                    checkbox.checked = destinationAll.checked;
                });
            });
        }

        // Status üçün "hamısı"
        const statusAll = document.getElementById('operations-status-all');
        const statusCheckboxes = document.querySelectorAll('input[name="status"]:not(#operations-status-all)');
        
        if (statusAll) {
            statusAll.addEventListener('change', () => {
                statusCheckboxes.forEach(checkbox => {
                    checkbox.checked = statusAll.checked;
                });
            });
        }
    }

    // Filter modalını açmaq
    openModal() {
        const modal = document.getElementById('operationsFilterPop');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    // Filter modalını bağlamaq
    closeModal() {
        const modal = document.getElementById('operationsFilterPop');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // Date picker açmaq
    openDatePicker(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.focus();
            if (input.showPicker) {
                input.showPicker();
            }
        }
    }

    // Filter-ləri təmizləmək
    clearFilters() {
        // Tarix input-larını təmizləmək
        const startDateInput = document.getElementById('operationsStartDate');
        const endDateInput = document.getElementById('operationsEndDate');
        
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        
        // Bütün checkbox-ları təmizləmək
        const checkboxes = document.querySelectorAll('#operationsFilterForm input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Slider-i reset etmək
        if (this.slider) {
            this.slider.set([0, 10000]);
        }
        
        // Filter datanı reset etmək
        this.filterData = {
            startDate: '',
            endDate: '',
            cardCategories: [],
            destinations: [],
            statuses: [],
            minAmount: 0,
            maxAmount: 10000
        };

        // Təmizlənmiş filter-ləri tətbiq etmək
        this.applyFilters();
    }

    // Filter məlumatlarını toplamaq
    collectFilterData() {
        // Tarix məlumatları
        const startDateInput = document.getElementById('operationsStartDate');
        const endDateInput = document.getElementById('operationsEndDate');
        
        this.filterData.startDate = startDateInput ? startDateInput.value : '';
        this.filterData.endDate = endDateInput ? endDateInput.value : '';
        
        // Kart kateqoriyaları
        const cardCategoryCheckboxes = document.querySelectorAll('#operationsFilterForm input[name="cardCategory"]:checked');
        this.filterData.cardCategories = Array.from(cardCategoryCheckboxes).map(cb => cb.value);
        
        // Təyinatlar
        const destinationCheckboxes = document.querySelectorAll('#operationsFilterForm input[name="destination"]:checked');
        this.filterData.destinations = Array.from(destinationCheckboxes).map(cb => cb.value);
        
        // Statuslar
        const statusCheckboxes = document.querySelectorAll('#operationsFilterForm input[name="status"]:checked');
        this.filterData.statuses = Array.from(statusCheckboxes).map(cb => cb.value);
    }

    // Filter-ləri tətbiq etmək
    applyFilters() {
        // Filter məlumatlarını toplamaq
        this.collectFilterData();
        
        // Aktiv tab-a görə müvafiq cədvələ filter tətbiq etmək
        const activeTab = document.querySelector('.notification-type.active');
        if (activeTab) {
            const tabId = activeTab.id;
            if (tabId === 'korporativ') {
                this.applyFiltersToTable('corporate');
            } else if (tabId === 'ferdi') {
                this.applyFiltersToTable('personal');
            }
        }

        // Filter modal-ını bağlamaq
        this.closeModal();

        // Filter göstəricisini yeniləmək
        this.updateFilterIndicator();
    }

    // Cədvələ filter tətbiq etmək
    applyFiltersToTable(tableType) {
        let table;
        
        if (tableType === 'corporate' && typeof korporativTable !== 'undefined') {
            table = korporativTable;
        } else if (tableType === 'personal' && typeof ferdiTable !== 'undefined') {
            table = ferdiTable;
        }

        if (table && table.ajax) {
            // DataTable-nin AJAX parametrlərini yeniləmək
            const ajaxData = table.ajax.params();
            
            // Filter parametrlərini əlavə etmək
            Object.assign(ajaxData, {
                filterStartDate: this.filterData.startDate,
                filterEndDate: this.filterData.endDate,
                filterCardCategories: this.filterData.cardCategories.join(','),
                filterDestinations: this.filterData.destinations.join(','),
                filterStatuses: this.filterData.statuses.join(','),
                filterMinAmount: this.filterData.minAmount,
                filterMaxAmount: this.filterData.maxAmount
            });

            // Cədvəli yenidən yükləmək
            table.ajax.reload(null, false);
        }
    }

    // Filter göstəricisini yeniləmək
    updateFilterIndicator() {
        const filterButton = document.querySelector('#emeliyyatFilter .cursor-pointer');
        if (!filterButton) return;

        const hasActiveFilters = 
            this.filterData.startDate || 
            this.filterData.endDate ||
            this.filterData.cardCategories.length > 0 ||
            this.filterData.destinations.length > 0 ||
            this.filterData.statuses.length > 0 ||
            this.filterData.minAmount > 0 ||
            this.filterData.maxAmount < 10000;

        if (hasActiveFilters) {
            filterButton.classList.add('bg-primary', 'text-white');
            filterButton.classList.remove('border-surface-variant');
            
            // Filter ikonunu vurğulamaq
            const filterIcon = filterButton.querySelector('.stratis-filter');
            if (filterIcon) {
                filterIcon.classList.add('text-white');
                filterIcon.classList.remove('text-messages');
            }
        } else {
            filterButton.classList.remove('bg-primary', 'text-white');
            filterButton.classList.add('border-surface-variant');
            
            // Filter ikonunu normal vəziyyətinə qaytarmaq
            const filterIcon = filterButton.querySelector('.stratis-filter');
            if (filterIcon) {
                filterIcon.classList.remove('text-white');
                filterIcon.classList.add('text-messages');
            }
        }
    }

    // Filter datanı əldə etmək
    getFilterData() {
        return this.filterData;
    }

    // Filter datanı təyin etmək
    setFilterData(data) {
        this.filterData = { ...this.filterData, ...data };
        this.updateFilterForm();
    }

    // Filter formu elementlərini yeniləmək
    updateFilterForm() {
        // Tarix input-larını yeniləmək
        const startDateInput = document.getElementById('operationsStartDate');
        const endDateInput = document.getElementById('operationsEndDate');
        
        if (startDateInput) startDateInput.value = this.filterData.startDate;
        if (endDateInput) endDateInput.value = this.filterData.endDate;

        // Checkbox-ları yeniləmək
        this.updateCheckboxes('cardCategory', this.filterData.cardCategories);
        this.updateCheckboxes('destination', this.filterData.destinations);
        this.updateCheckboxes('status', this.filterData.statuses);

        // Slider-i yeniləmək
        if (this.slider) {
            this.slider.set([this.filterData.minAmount, this.filterData.maxAmount]);
        }
    }

    // Checkbox-ları yeniləmək
    updateCheckboxes(name, selectedValues) {
        const checkboxes = document.querySelectorAll(`#operationsFilterForm input[name="${name}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectedValues.includes(checkbox.value);
        });
    }
}

// Global operationsFilter obyektini yaratmaq
let operationsFilter;

// DOM yüklənəndə operations filter-i initialize etmək
document.addEventListener('DOMContentLoaded', function() {
    operationsFilter = new OperationsFilter();
});

// Global funksiyalar (modaldan çağırmaq üçün)
function openOperationsFilterModal() {
    if (operationsFilter) {
        operationsFilter.openModal();
    }
}

function closeOperationsFilterModal() {
    if (operationsFilter) {
        operationsFilter.closeModal();
    }
}

function openOperationsDatePicker(inputId) {
    if (operationsFilter) {
        operationsFilter.openDatePicker(inputId);
    }
}

function clearOperationsFilters() {
    if (operationsFilter) {
        operationsFilter.clearFilters();
    }
}

function applyOperationsFilters() {
    if (operationsFilter) {
        operationsFilter.applyFilters();
    }
}
