$(document).ready(function () {
    const data = [
        { category: "Restoranlar", createDate: "12.12.2024" },
        { category: "PUB", createDate: "12.12.2024" },
        { category: "Kinoteatrlar", createDate: "12.12.2024" },
        { category: "CoffeShop", createDate: "12.12.2024" },
        { category: "Şirkət", createDate: "12.12.2024" },
        { category: "Yanacaq Doldurma Məntəqəsi", createDate: "12.12.2024" },
        { category: "Kinoteatrlar", createDate: "12.12.2024" },
        { category: "CoffeShop", createDate: "12.12.2024" },
        { category: "Yanacaq Doldurma Məntəqəsi", createDate: "12.12.2024" },
        { category: "Restoranlar", createDate: "12.12.2024" }
    ];

    const $table = $("#muessiseKategoriyasiTable");
    $table.html(`
        <thead>
            <tr class="bg-container-2 dark:bg-container-2-dark text-[12px] font-normal">
                <th class="px-5 py-3 text-left filtering">
                    <div class="custom-header flex gap-2.5 items-center">
                        <div style="color:#1D222BA6;font-weight:400;">Kateqoriya adı</div>
                        <div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div>
                    </div>
                </th>
                <th class="px-5 py-3 text-left filtering " style="padding-left:115px;">
                    <div class="custom-header flex gap-2.5 items-center">
                        <div style="color:#1D222BA6;font-weight:400;">Yaranma tarixi</div>
                        <div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div>
                    </div>
                </th>
                <th class="px-5 py-3"></th>
            </tr>
        </thead>
        <tbody></tbody>
    `);
    const $tbody = $table.find("tbody");
    $tbody.html("");
    data.forEach(item => {
        $tbody.append(`
            
            <tr class="bg-white dark:bg-menu-dark rounded-lg mb-2 mt-2" style="height:48px;">
                <td class="px-5 mt-3 py-0 flex items-center ml-5 gap-2 text-[13px] text-messages dark:text-primary-text-color-dark font-normal align-middle ">
                    ${item.category}
                </td>
                <td class="px-5 py-0 text-[13px] text-messages dark:text-primary-text-color-dark font-normal align-middle ">
                    <span class="ml-[120px]">${item.createDate}</span>
                </td>
                <td class="px-5 py-0 align-middle flex justify-end mr-8">
                  <div class="relative inline-block">
              <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical dropdown-trigger text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer z-100"></div>
              <div class="absolute right-[-12px] mt-2 w-40 z-50 dropdown-menu hidden">
                <div class="relative h-[8px]">
                  <div class="absolute top-1/2 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-white z-50"></div>
                </div>
                <div class="rounded-xl shadow-lg bg-white overflow-hidden relative z-50">
                  <div class="py-[3.5px] text-sm">
                    <div  class="categoryEditBtn flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer" onclick="editItem(this)">
                      <span class="icon stratis-edit-03 text-[13px]"></span>
                      <span class="font-medium text-[#1D222B] text-[13px]">Redaktə et</span>
                    </div>
                    <div class="h-px bg-stroke my-1"></div>
                    <div class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover" onclick="deleteItem(this)">
                      <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                      <span class="font-medium text-error text-[13px]">Sil</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                </td>
            </tr>
        `);
    });

});




$(document).on('input', '#customSearchBlog', function () {
    var value = $(this).val().toLowerCase();
    $('#muessiseKategoriyasiTable tbody tr').filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
});






$(document).on("click", ".dropdown-trigger", function (e) {
    e.stopPropagation();
    const $wrapper = $(this).closest(".relative");
    const $dropdown = $wrapper.find(".dropdown-menu");
    // Bütün dropdownları bağla
    $(".dropdown-menu").not($dropdown).addClass("hidden");
    // Cari dropdownu aç/bağla
    $dropdown.toggleClass("hidden");
});


$(document).on("click", function (e) {
    $(".dropdown-menu").each(function () {
        const $dropdown = $(this);
           const $trigger = $dropdown.prev();
        if (
            !$dropdown.is(e.target) &&
            !$dropdown.has(e.target).length &&
            !$trigger.is(e.target) &&
            !$trigger.has(e.target).length
        ) {
            $dropdown.addClass("hidden");
        }
    });
});


function deleteItem() {
    $("#deletePopup").removeClass("hidden");
}

// "Xeyr" kliklənəndə popup bağlanır
$(document).on("click", "#cancelDeleteBtn", function () {
    $("#deletePopup").addClass("hidden");
});

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // Burada dilə uyğun input dəyərini dəyişə bilərsiniz
    });
});

document.getElementById('categoryCreateBtn').onclick = function() {
    document.getElementById('categoryPopup').classList.remove('hidden');
};
function closeCategoryPopup() {
    document.getElementById('categoryPopup').classList.add('hidden');
}
document.getElementById('cancelCategoryBtn').onclick = closeCategoryPopup;
$('#categoryPopup').on('click', function(e) {
    if (!$(e.target).closest('.popup-content').length) {
        $('#categoryPopup').addClass('hidden');
    }
});


function closeEditCategoryPopup() {
    document.getElementById('editCategoryPopup').classList.add('hidden');
    document.getElementById('popupOverlay').classList.add('hidden');
}

// ...existing code...

// Bütün redaktə düymələrinə event əlavə et
$(document).on('click', '.categoryEditBtn', function () {
    $('#editCategoryPopup').removeClass('hidden');
    $('#popupOverlay').removeClass('hidden');
});

// Popupun içindəki "Ləğv et" düyməsi
$('#cancelEditCategoryBtn').on('click', function () {
    $('#editCategoryPopup').addClass('hidden');
    $('#popupOverlay').addClass('hidden');
});

// Overlay kliklənəndə popup bağlansın
$('#popupOverlay').on('click', function () {
    $('#editCategoryPopup').addClass('hidden');
    $('#popupOverlay').addClass('hidden');
});

// Dəyişikliyi təsdiqlə düyməsi üçün
$('#confirmEditCategoryBtn').on('click', function () {
    // Burada dəyişiklikləri yadda saxlamaq üçün kod yazın
    $('#editCategoryPopup').addClass('hidden');
    $('#popupOverlay').addClass('hidden');
});
$('#editCategoryPopup').on('click', function(e) {
    if (!$(e.target).closest('.editCategoryPopup-content').length) {
        $('#editCategoryPopup').addClass('hidden');
    }
});
