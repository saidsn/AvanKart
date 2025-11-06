// Filter modal aç / bağla
window.openPeopleTransactionsFilter = function() {
    $('#transactionsFilterPop').removeClass('hidden').addClass('flex');
    initializeTransactionsAmountSlider();
    
    $('#cardCategoriesContainer').html('<div class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">Yüklənir...</div>');
    $('#destinationsContainer').html('<div class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">Yüklənir...</div>');
    $('#statusesContainer').html('<div class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">Yüklənir...</div>');
    
    loadSubjects();
    loadCardCategories();
    loadDestinationsAndStatuses();
};

window.closeTransactionsFilterModal = function() {
    $('#transactionsFilterPop').removeClass('flex').addClass('hidden');
};

window.toggleDropdown_subject = function() {
    const dropdown = $('#dropdown_subject');
    const button = $('#dropdownDefaultButton_subject');
    
    if (dropdown.hasClass('hidden')) {
        dropdown.removeClass('hidden');
        button.find('img').addClass('rotate-180');
    } else {
        dropdown.addClass('hidden');
        button.find('img').removeClass('rotate-180');
    }
};

function loadSubjects() {
    if ($('#dropdown_subject').children().length > 0) {
        return;
    }

    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    fetch(`/istifadeci-hovuzu/people/${peopleId}/transactions/subjects`, {
        method: 'GET',
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(r => r.json())
    .then(data => {
        const dropdown = $('#dropdown_subject');
        dropdown.empty();
        
        if (data.success && data.subjects) {
            data.subjects.forEach((subject, index) => {
                const checkboxId = `subject-${index}`;
                const label = `
                    <label for="${checkboxId}"
                        class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
                        <input type="checkbox" id="${checkboxId}" class="peer hidden" name="subject" value="${subject}">
                        <div
                            class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                            <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                        </div>
                        <span class="dark:text-white">${subject}</span>
                    </label>
                `;
                dropdown.append(label);
            });
        }
    })
    .catch(err => {
        console.error('Subyektləri yükləyərkən xəta:', err);
    });
}

function loadCardCategories() {
    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const cardCategoriesUrl = `/istifadeci-hovuzu/people/${peopleId}/transactions/card-categories`;
    
    fetch(cardCategoriesUrl, {
        method: 'GET',
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(r => {
        if (!r.ok) {
            throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        }
        return r.json();
    })
    .then(data => {
        if (data.success && data.cardCategories && data.cardCategories.length > 0) {
            createDynamicCardCategoryCheckboxes(data.cardCategories);
        } else {
            $('#cardCategoriesContainer').html(`
                <div class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
                    Kart kateqoriyası tapılmadı
                </div>
            `);
        }
    })
    .catch(err => {
        $('#cardCategoriesContainer').html(`
            <div class="text-sm text-red-500 dark:text-red-400 px-4 py-2">
                Yükləmə xətası: ${err.message}
            </div>
        `);
    });
}

// Dinamik kart kateqoriyası checkbox-larını yaratmaq
function createDynamicCardCategoryCheckboxes(categories) {
    const container = $('#cardCategoriesContainer');
    container.empty();
    
    categories.forEach((category, index) => {
        const checkboxId = `trans-cbx-dynamic-${category.id}`;
        const checkboxHtml = `
            <label for="${checkboxId}" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                <input type="checkbox" id="${checkboxId}" class="peer hidden" name="card_category" value="${category.id}">
                <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <div>${category.name}</div>
            </label>
        `;
        container.append(checkboxHtml);
    });
    
}

function loadDestinationsAndStatuses() {
    const peopleId = window.currentPeopleId || $('#peopleIdHidden').val() || window.location.pathname.split('/').pop();
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const destinationsUrl = `/istifadeci-hovuzu/people/${peopleId}/transactions/destinations-and-statuses`;
    
    fetch(destinationsUrl, {
        method: 'GET',
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(r => {
        if (!r.ok) {
            throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        }
        return r.json();
    })
    .then(data => {
        if (data.success) {
            if (data.destinations && data.destinations.length > 0) {
                createDynamicDestinationCheckboxes(data.destinations);
            } else {
                $('#destinationsContainer').html('<div class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">Təyinat tapılmadı</div>');
            }
            
            if (data.statuses && data.statuses.length > 0) {
                createDynamicStatusCheckboxes(data.statuses);
            } else {
                $('#statusesContainer').html('<div class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2">Status tapılmadı</div>');
            }
        }
    })
    .catch(err => {
        $('#destinationsContainer').html('<div class="text-sm text-red-500 dark:text-red-400 px-4 py-2">Yükləmə xətası: ' + err.message + '</div>');
        $('#statusesContainer').html('<div class="text-sm text-red-500 dark:text-red-400 px-4 py-2">Yükləmə xətası: ' + err.message + '</div>');
    });
}

// Dinamik təyinat checkbox-larını yaratmaq
function createDynamicDestinationCheckboxes(destinations) {
    const container = $('#destinationsContainer');
    container.empty();
    
    destinations.forEach((destination, index) => {
        const checkboxId = `trans-cbx-dest-dynamic-${index}`;
        // Backend ingilis value gözləyir (Internal / External) amma biz UI-də lokal label göstəririk.
        const backendValue = destination.value || destination.label; // value varsa onu istifadə et.
        const checkboxHtml = `
            <label for="${checkboxId}" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                <input type="checkbox" id="${checkboxId}" class="peer hidden" name="destination" value="${backendValue}">
                <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <div>${destination.label}</div>
            </label>
        `;
        container.append(checkboxHtml);
    });
    
}

// Dinamik status checkbox-larını yaratmaq
function createDynamicStatusCheckboxes(statuses) {
    const container = $('#statusesContainer');
    container.empty();
    
    statuses.forEach((status, index) => {
        const checkboxId = `trans-cbx-stat-dynamic-${index}`;
        const backendValue = status.value || status.label; // success/failed/pending və ya lokallaşdırılmış label
        const checkboxHtml = `
            <label for="${checkboxId}" class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal">
                <input type="checkbox" id="${checkboxId}" class="peer hidden" name="status" value="${backendValue}">
                <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <div>${status.label}</div>
            </label>
        `;
        container.append(checkboxHtml);
    });
    
}

window.openTransactionsDatePicker = function(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.showPicker();
    }
};

function initializeTransactionsAmountSlider() {
    const slider = $("#transactionsSliderRange");
    
    function setupSlider() {
        if (!window.jQuery || !window.jQuery.ui) {
            console.warn('jQuery UI tapılmadı, slider işləməyəcək');
            return;
        }

        if (slider.hasClass('ui-slider')) {
            slider.slider('destroy');
        }

        slider.slider({
            range: true,
            min: 0,
            max: 10000,
            values: [0, 10000],
            step: 10,
            slide: function(event, ui) {
                $("#transactionsMinValue").text(ui.values[0] + " AZN");
                $("#transactionsMaxValue").text(ui.values[1] + " AZN");
            },
            change: function(event, ui) {
                $("#transactionsMinValue").text(ui.values[0] + " AZN");
                $("#transactionsMaxValue").text(ui.values[1] + " AZN");
            }
        });

        $("#transactionsMinValue").text("0 AZN");
        $("#transactionsMaxValue").text("10000 AZN");
    }

    if (window.jQuery && window.jQuery.ui && window.jQuery.ui.slider) {
        setupSlider();
    } else {
        $(document).on('jqueryUILoaded', setupSlider);
        setTimeout(() => {
            if (window.jQuery && window.jQuery.ui && window.jQuery.ui.slider) {
                setupSlider();
            }
        }, 1000);
    }
}

window.applyTransactionsFilters = function() {
    const filters = {};
    
    const selectedSubjects = [];
    $('input[name="subject"]:checked').each(function() {
        selectedSubjects.push($(this).val());
    });
    if (selectedSubjects.length > 0) {
        filters.subjects = selectedSubjects;
    }
    
    const startDate = $('#transactionsStartDate').val();
    const endDate = $('#transactionsEndDate').val();
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const selectedCategories = [];
    $('input[name="card_category"]:checked').each(function() {
        selectedCategories.push($(this).val());
    });
    if (selectedCategories.length > 0) {
        filters.cardCategories = selectedCategories;
    }
    
    const selectedDestinations = [];
    $('input[name="destination"]:checked').each(function() {
        selectedDestinations.push($(this).val());
    });
    if (selectedDestinations.length > 0) {
        filters.destinations = selectedDestinations; // Internal / External already
    }
    
    const selectedStatuses = [];
    $('input[name="status"]:checked').each(function() {
        selectedStatuses.push($(this).val());
    });
    if (selectedStatuses.length > 0) {
        filters.statuses = selectedStatuses; // success / failed / pending
    }
    
    const slider = $("#transactionsSliderRange");
    if (slider.hasClass('ui-slider')) {
        const values = slider.slider('values');
        filters.minAmount = values[0];
        filters.maxAmount = values[1];
    }
    
    window.peopleTransactionsFilters = filters;
    if (window.peopleTransactionsTable) {
        window.peopleTransactionsTable.ajax.reload();
    }
    closeTransactionsFilterModal();
    showFilterAppliedNotification();
};

window.clearTransactionsFilters = function() {
    $('#transactionsFilterForm')[0].reset();
    
    $('input[type="checkbox"]', '#transactionsFilterForm').prop('checked', false);
    
    const slider = $("#transactionsSliderRange");
    if (slider.hasClass('ui-slider')) {
        slider.slider('values', [0, 10000]);
        $("#transactionsMinValue").text("0 AZN");
        $("#transactionsMaxValue").text("10000 AZN");
    }
    
    $('#dropdownDefaultButton_subject').html(`
        Seçim edin
        <div>
            <img src="/public/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">
        </div>
    `);
    window.peopleTransactionsFilters = {};
    if (window.peopleTransactionsTable) {
        window.peopleTransactionsTable.ajax.reload();
    }
};

function showFilterAppliedNotification() {
    // if (window.showNotification) {
    //     window.showNotification('Filterlər tətbiq edildi', 'success');
    // }
}

$(document).on('click', function(e) {
    const target = $(e.target);
    const dropdown = $('#dropdown_subject');
    const button = $('#dropdownDefaultButton_subject');
    
    if (!target.closest('#dropdownDefaultButton_subject').length && 
        !target.closest('#dropdown_subject').length) {
        dropdown.addClass('hidden');
        button.find('img').removeClass('rotate-180');
    }
});

$(document).on('change', 'input[name="subject"]', function() {
    const selectedSubjects = [];
    $('input[name="subject"]:checked').each(function() {
        selectedSubjects.push($(this).val());
    });
    
    const button = $('#dropdownDefaultButton_subject');
    let buttonText = 'Seçim edin';
    
    if (selectedSubjects.length > 0) {
        if (selectedSubjects.length === 1) {
            buttonText = selectedSubjects[0];
        } else {
            buttonText = `${selectedSubjects.length} seçim`;
        }
    }
    
    button.html(`
        ${buttonText}
        <div>
            <img src="/public/images/Avankart/Sirket/chevron-down.svg" alt="" class="w-[15px] h-[13px] dark:invert">
        </div>
    `);
});

