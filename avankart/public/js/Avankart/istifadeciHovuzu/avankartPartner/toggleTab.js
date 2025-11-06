document.querySelectorAll(".main-tab-link").forEach(tab => {
    tab.addEventListener("click", function () {
        const target = this.getAttribute("data-tab");

        // bütün tabları deaktiv et
        document.querySelectorAll(".main-tab-link").forEach(t => {
            t.classList.remove("text-messages", "border-b-2", "border-messages", "cursor-default");
            t.classList.add("cursor-pointer");
        });

        // seçilən taba active class-larını əlavə et
        this.classList.add("text-messages", "border-b-2", "border-messages", "cursor-default");
        this.classList.remove("cursor-pointer");

        // bütün content-ləri gizlət
        document.querySelectorAll(".tab-content").forEach(content => {
            content.classList.add("hidden");
        });

        // seçilən content-i göstər
        document.getElementById(target).classList.remove("hidden");

        // seçilən tab-a əsasən uyğun TableWrapper göstər
        showTab(target);
    });
});

function showTab(tab) {
    if (tab === "qr") {
      $("#qrTableWrapper").show();
      $("#sorgularTableWrapper").hide();
    } else {
      $("#qrTableWrapper").hide();
      $("#sorgularTableWrapper").show();
    }
}

// Səhifə açıldıqda default olaraq QR tab göstərilsin
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('.main-tab-link[data-tab="qr"]').click();
});
