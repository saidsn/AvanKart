document.addEventListener("DOMContentLoaded", function () {
    const toggleContainer = document.getElementById("toggleContainer");

    toggleContainer.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            toggleSelection(event.target.id);
        }
    });
    function toggleSelection(selectedId) {
        const aktivHTML = `
            <button id="aktivButton" class="px-3 py-[3px] rounded-full text-[12px] text-messages opacity-50 font-medium">
                Aktiv işçilər (233)
            </button>`;

        const ayrilanlarHTML = `
            <button id="ayrilanlarButton" class="pl-[20px] py-[3px] pr-[16px] rounded-full text-messages opacity-50 text-[12px] font-medium">
                İşdən ayrılanlar (89)
            </button>`;

        const aktivSpanHTML = `
            <span id="aktivSpan" class="px-3 py-[3px] rounded-full text-[12px] bg-inverse-on-surface text-messages opacity-100 font-medium">
                Aktiv işçilər (233)
            </span>`;

        const ayrilanlarSpanHTML = `
            <span id="ayrilanlarSpan" class="pl-[20px] py-[3px] pr-[16px] rounded-full text-messages opacity-100 text-[12px] bg-inverse-on-surface font-medium">
                İşdən ayrılanlar (89)
            </span>`;

        if (selectedId === "aktivButton") {
            toggleContainer.innerHTML = aktivSpanHTML + ayrilanlarHTML;
        } else if (selectedId === "ayrilanlarButton") {
            toggleContainer.innerHTML = aktivHTML + ayrilanlarSpanHTML;
        }
    }
    toggleSelection("ayrilanlarButton");
});
