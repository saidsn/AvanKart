  const threeDotBtn = document.getElementById('threeDotBtn');
        const popup = document.getElementById('popup');

        // Toggle popup when clicking three dot button
        threeDotBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            popup.classList.toggle('hidden');
        });

        // Close popup when clicking anywhere else
        document.addEventListener('click', function(e) {
            if (!popup.contains(e.target) && !threeDotBtn.contains(e.target)) {
                popup.classList.add('hidden');
            }
        });

        // Prevent popup from closing when clicking inside it
        popup.addEventListener('click', function(e) {
            e.stopPropagation();
        });