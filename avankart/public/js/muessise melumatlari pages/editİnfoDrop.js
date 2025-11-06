// Permission system for checkboxes in BasMuhasiblerPop
document.addEventListener('DOMContentLoaded', function() {
    // Get all checkboxes in the BasMuhasiblerPop modal
    const modal = document.getElementById('BasMuhasiblerPop');
    if (!modal) return;

    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Find the parent row
            const parentRow = this.closest('div[class*="flex items-center"]');
            if (!parentRow) return;

            // Find the permission section (İcazə) in this row
            const permissionElements = parentRow.querySelectorAll('div');
            let icazeElement = null;
            let icazeParent = null;

            permissionElements.forEach(el => {
                if (el.textContent.trim() === 'İcazə') {
                    icazeElement = el;
                    icazeParent = el.closest('div[class*="flex items-center gap-2"]');
                }
            });

            if (icazeElement && icazeParent) {
                if (this.checked) {
                    // Make icaze clickable and remove opacity
                    icazeParent.style.opacity = '1';
                    icazeParent.style.cursor = 'pointer';
                    icazeParent.classList.remove('opacity-50');

                    // Add click event for permission dropdown
                    icazeParent.onclick = function(e) {
                        e.stopPropagation();
                        showPermissionDropdown(this, parentRow);
                    };
                } else {
                    // Make icaze non-clickable and add opacity
                    icazeParent.style.opacity = '0.5';
                    icazeParent.style.cursor = 'default';
                    icazeParent.classList.add('opacity-50');

                    // Remove click event
                    icazeParent.onclick = null;

                    // Close any open permission dropdown
                    closePermissionDropdown();
                }
            }
        });
    });
});

// Show permission dropdown
function showPermissionDropdown(icazeParent, parentRow) {
    // Close any existing dropdown
    closePermissionDropdown();

    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.id = 'permissionDropdown';
    dropdown.style.cssText = `
        position: absolute;
        right: 0;
        top: 100%;
        z-index: 1000;
        min-width: 120px;
        background: white;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 8px;
        box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
        padding: 8px 0;
        margin-top: 4px;
    `;

    // Check if dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isDarkMode) {
        dropdown.style.background = '#161E22';
        dropdown.style.borderColor = 'rgba(255,255,255,0.1)';
    }

    dropdown.innerHTML = `
        <div class="permission-option" onclick="selectPermission('Tam idarə')" style="padding: 8px 16px; cursor: pointer; font-size: 13px; color: ${isDarkMode ? 'white' : 'black'};">
            Tam idarə
        </div>
        <div class="permission-option" onclick="selectPermission('Baxış')" style="padding: 8px 16px; cursor: pointer; font-size: 13px; color: ${isDarkMode ? 'white' : 'black'};">
            Baxış
        </div>
    `;

    // Add hover effects
    const options = dropdown.querySelectorAll('.permission-option');
    options.forEach(option => {
        option.addEventListener('mouseenter', function() {
            this.style.backgroundColor = isDarkMode ? 'rgba(91, 57, 109, 0.3)' : 'rgba(246, 217, 255, 0.5)';
        });
        option.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });

    // Position dropdown relative to the icaze parent
    icazeParent.style.position = 'relative';
    icazeParent.appendChild(dropdown);

    // Add click outside to close
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 100);
}

// Close permission dropdown
function closePermissionDropdown() {
    const existingDropdown = document.getElementById('permissionDropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        document.removeEventListener('click', handleClickOutside);
    }
}

// Handle click outside dropdown
function handleClickOutside(event) {
    const dropdown = document.getElementById('permissionDropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        closePermissionDropdown();
    }
}

// Select permission and close dropdown
function selectPermission(permission) {
    console.log('Selected permission:', permission);

    // Find the dropdown and get its parent (the icaze element)
    const dropdown = document.getElementById('permissionDropdown');
    if (dropdown) {
        const icazeParent = dropdown.parentElement;

        // Find the text element that contains "İcazə"
        const icazeTextElement = icazeParent.querySelector('div[class*="text-[12px]"]');
        if (icazeTextElement) {
            // Update the text to show selected permission
            icazeTextElement.textContent = permission;
        }
    }

    closePermissionDropdown();
}