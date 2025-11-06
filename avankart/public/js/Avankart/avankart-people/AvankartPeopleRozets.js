$(document).ready(function () {
    const urlParts = window.location.pathname.split("/");
    const peopleId = urlParts[urlParts.length - 1];
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    let selectedCategories = [];

    //debounce yazdiq ki ard arda cox axtaris edende servere yuk dusmesin
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function loadRozets(search = "", categories = []) {
        $.ajax({
            url: `/api/people/rozets/${peopleId}`,
            method: "POST",
            headers: { "CSRF-Token": csrfToken },
            contentType: "application/json",
            data: JSON.stringify({ search, categories }),
            success: function (res) {
                if (!res.success) return console.error("User not found");
                renderRozets(res.rozetCategories, search);
            },
            error: function (err) {
                console.error("AJAX error:", err);
            }
        });
    }

function renderRozets(categories) {
    const rozetContent = $("#rozetContent");
    rozetContent.empty();

    let totalRozetCount = 0;

    for (const [categoryName, rozetList] of Object.entries(categories)) {
        totalRozetCount += rozetList.length;
        const categoryDiv = $(`
            <div class="border-t-1 border-stroke py-3">
                <p class="text-[11px] text-[#1D222B80] font-medium">${categoryName} (${rozetList.length})</p>
                <div class="flex flex-wrap gap-[38px]" id="category-${categoryName.replace(/\s/g, '')}"></div>
            </div>
        `);
        rozetContent.append(categoryDiv);

        const categoryContainer = categoryDiv.find(`div[id^="category-"]`);
        rozetList.forEach(rozet => {
            categoryContainer.append(`
                <span class="flex flex-col gap-2 items-center">
                    <img class="w-[72px] h-[72px]" src="${rozet.image_path}" alt="${rozet.name}">
                    <p class="text-[13px] text-[#1D222B]">${rozet.name}</p>
                    <p class="text-[12px] text-[#1D222B80] font-medium">${rozet.description}</p>
                </span>
            `);
        });
    }

    $("#rozetTitle").text(`Qazanılan rozetlər (${totalRozetCount})`);
}


    $(document).on("input", "#customSearch", debounce(function () {
        const val = $(this).val();
        loadRozets(val, selectedCategories);
    }, 300));

    $("#refreshRozets").on("click", function () {
        loadRozets($("#customSearch").val(), selectedCategories);
    });

    loadRozets(); // ilkin render

    // Filter funksiyaları
    window.toggleRozetFilter = function () {
        const $modal = $("#rozetFilterPop");
        $modal.toggleClass("hidden");

        if (!$modal.hasClass("hidden")) {
            $.ajax({
                url: "/api/people/rozets/rozet-categories",
                method: "GET",
                success: function (res) {
                    if (!res.success) return console.error("Categories not found");

                    const container = $modal.find(".flex.flex-col.gap-2");
                    container.empty();

                    res.data.forEach(cat => {
                        const isChecked = selectedCategories.includes(cat._id) ? 'checked' : '';
                        container.append(`
                            <label class="flex items-center gap-2 border-b-1 py-3 border-stroke cursor-pointer select-none text-[13px] font-normal">
                                <input type="checkbox" class="peer hidden" name="category" value="${cat._id}" ${isChecked}>
                                <div class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary
                                    peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                                </div>
                                <div>${cat.name}</div>
                            </label>
                        `);
                    });
                },
                error: function (err) {
                    console.error("Rozet categories fetch error:", err);
                }
            });
        }
    }

    window.applyRozetFilters = function () {
        selectedCategories = $("#rozetFilterPop input[name='category']:checked")
            .map(function () { return this.value; })
            .get();

        loadRozets($("#customSearch").val(), selectedCategories);
        toggleRozetFilter();
    }

    window.clearRozetFilters = function () {
        selectedCategories = [];
        loadRozets($("#customSearch").val());
        const $modal = $("#rozetFilterPop");
        if (!$modal.hasClass("hidden")) {
            toggleRozetFilter();
            toggleRozetFilter();
        }
    }

});
