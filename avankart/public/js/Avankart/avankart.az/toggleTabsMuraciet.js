document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".notification-type");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            // bütün tablardan "active" və style class-ları sil
            tabs.forEach((t) => {
                t.classList.remove(
                    "active",
                    "bg-inverse-on-surface",
                    "dark:bg-surface-variant-dark",
                    "text-messages",
                    "dark:text-primary-text-color-dark"
                ),
                t.classList.add(
                    "text-tertiary-text"
                )
            }
            );

            // kliklənən taba əlavə et
            this.classList.add(
                "active",
                "bg-inverse-on-surface",
                "dark:bg-surface-variant-dark",
                "text-messages",
                "dark:text-primary-text-color-dark"
            );
            this.classList.remove(
                "text-tertiary-text",

            )
            // bütün content-ləri gizlət
            contents.forEach((c) => c.classList.add("hidden"));

            // uyğun content-i göstər
            if (this.id === "sirketMuracieti") {
                document.getElementById("sirketMuracietiKontent").classList.remove("hidden");
                document.getElementById("sirketMuracietiKontent").classList.add("block");
                document.getElementById('categoryCreateBtn').classList.add('hidden');

            } else if (this.id === "muessiseMuracieti") {
                document.getElementById("muessiseMuracietiKontent").classList.remove("hidden");
                document.getElementById("sirketMuracietiKontent").classList.remove("block");
                document.getElementById('categoryCreateBtn').classList.add('hidden');


            }
            else if (this.id === "muessiseKategoriyasi") {
                document.getElementById("muessiseKategoriyasiKontent").classList.remove("hidden");
                document.getElementById("sirketMuracietiKontent").classList.remove("block");
                document.getElementById('categoryCreateBtn').classList.remove('hidden');


            }
        });
    });
});
