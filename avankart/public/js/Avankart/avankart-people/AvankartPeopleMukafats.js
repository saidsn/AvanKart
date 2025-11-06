$(document).ready(function () {
    const urlParts = window.location.pathname.split("/");
    const peopleId = urlParts[urlParts.length - 1];
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    function loadMukafats(search) {
        $.ajax({
            url: `/api/people/mukafat/${peopleId}`,
            method: "POST",
            headers: { "CSRF-Token": csrfToken },
            contentType: "application/json",
            data: JSON.stringify({ search: search }),
            success: function (res) {
                if (!res.success) return console.error("User not found");
                renderMukafats(res.cardCategories);
            },
            error: function (err) {
                console.error("AJAX error:", err);
            }
        });
    }

    function renderMukafats(cardCategories) {
        const container = $("#mukafatContent");
        container.empty();
        Object.keys(cardCategories).forEach((cardName) => {
            const mukafats = cardCategories[cardName];
            const cardCount = mukafats.length;

            const cardDiv = $(`
            <div class="border-t-1 border-stroke py-3">
                <p class="text-[11px] text-[#1D222B80] font-medium">${cardName} (${cardCount})</p>
                <div class="flex flex-wrap gap-[38px]" id="card-${cardName.replace(/\s+/g, "")}"></div>
            </div>
        `);

            container.append(cardDiv);

            const mukafatContainer = cardDiv.find(`#card-${cardName.replace(/\s+/g, "")}`);

            mukafats.forEach((m) => {
                const mukafatSpan = $(`
                <span class="flex flex-col gap-2 items-center">
                    <img class="w-[72px] h-[72px]" src="${m.image}" alt="${m.mukafatName}">
                    <p class="text-[13px] text-[#1D222B] w-30 text-center">${m.mukafatName}</p>
                </span>
            `);
                mukafatContainer.append(mukafatSpan);
            });
        });

    }

    $(document).on("input", "#customSearch", function () {
        const val = $(this).val();
        loadMukafats(val);
    });

     $(document).on("click", "#refreshBtn", function(e) {
        e.preventDefault();
        const val = $("#customSearch").val();
        loadMukafats(val); 
    });

    loadMukafats();
});
