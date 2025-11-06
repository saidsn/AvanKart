
$(document).ready(function () {
    // Tab switching functionality
    const tabs = document.querySelectorAll("#emeliyyatTarixcesiTop .notification-type");

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

            // Hide all tables first

            // Show the appropriate table
            if (this.id === "korporativ") {
                document.getElementById("korporativTable").classList.remove("hidden");
            document.getElementById("tranzaksiyaEmeliyyatTable").classList.add("hidden");

            } else if (this.id === "ferdi") {
                document.getElementById("tranzaksiyaEmeliyyatTable").classList.remove("hidden");
                document.getElementById("korporativTable").classList.add("hidden");


            }

        });
    });
})