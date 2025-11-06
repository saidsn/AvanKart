$(document).ready(function () {
    // Tab switching functionality
    const tabs = document.querySelectorAll("#imtiyazKartlariTop .notification-type");

    tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            // Remove active classes from all tabs
            tabs.forEach((t) => {
                t.classList.remove(
                    "active",
                    "bg-inverse-on-surface",
                    "dark:bg-surface-variant-dark",
                    "text-messages",
                    "dark:text-primary-text-color-dark"
                );
                t.classList.add("text-tertiary-text", "dark:text-tertiary-text-color-dark");
            });

            // Add active classes to clicked tab
            this.classList.add(
                "active",
                "bg-inverse-on-surface",
                "dark:bg-surface-variant-dark",
                "text-messages",
                "dark:text-primary-text-color-dark"
            );
            this.classList.remove("text-tertiary-text", "dark:text-tertiary-text-color-dark");

            // Fixed logic: Show correct content based on clicked tab
            if (this.id === "kartlar") {
                document.getElementById("imtiyazKartlari").classList.remove("hidden");
                document.getElementById("muracietKecmisiContent").classList.add("hidden");
                document.getElementById("imtiyazFilter").classList.add("hidden"); 
            }
            else if (this.id === "muracietKecmisi") {
                document.getElementById("muracietKecmisiContent").classList.remove("hidden");
                document.getElementById("imtiyazFilter").classList.remove("hidden");
                document.getElementById("imtiyazKartlari").classList.add("hidden");
            }
        });
    });

    // Initialize the correct state on page load
    // Since "kartlar" has the active class initially, show its content
    document.getElementById("imtiyazKartlari").classList.remove("hidden");
    document.getElementById("muracietKecmisiContent").classList.add("hidden");
    document.getElementById("imtiyazFilter").classList.add("hidden");
});