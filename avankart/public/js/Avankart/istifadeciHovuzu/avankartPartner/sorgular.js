const btn = document.getElementById("statusDropdownButton");
const menu = document.getElementById("statusDropdownMenu");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");

let sorguPopup = document.getElementById("sorguPopup");
const deleteModal = document.getElementById("deleteModal");

// Status dropdown - only attach if elements exist
if (btn && menu) {
  // Toggle dropdown
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  // Click outside → close dropdown
  document.addEventListener("click", () => {
    if (menu) {
      menu.classList.add("hidden");
    }
  });

  // Handle option click
  if (statusText && statusDot) {
    menu.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", async () => {
        const label = item.dataset.label;
        const color = item.dataset.color;
        const statusValue = item.dataset.value;

        // Get ticket and partner IDs
        const ticketId = document.getElementById('currentTicketId')?.value;
        const partnerId = document.getElementById('currentPartnerId')?.value;

        if (!ticketId || !partnerId) {
          console.error('Missing ticket or partner ID');
          alert('Sorğu məlumatları tapılmadı');
          return;
        }

        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
          // Update status in backend
          const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: statusValue,
              _csrf: csrfToken
            })
          });

          const result = await response.json();

          if (result.success) {
            console.log('✅ Status updated successfully:', statusValue);
            // Update UI
            statusText.textContent = label;
            statusDot.style.backgroundColor = color;
            menu.classList.add("hidden");
          } else {
            console.error('❌ Failed to update status:', result.error);
            alert(result.error || 'Status yeniləməsində xəta baş verdi');
          }
        } catch (error) {
          console.error('❌ Status update error:', error);
          alert('Status yeniləməsində xəta baş verdi');
        }
      });
    });
  }
}

// Priority dropdown for detail page
const priorityBtn = document.getElementById("priorityDropdownButton");
const priorityMenu = document.getElementById("priorityDropdownMenu");
const priorityText = document.getElementById("priorityText");
const priorityImg = document.getElementById("priorityImg");

if (priorityBtn && priorityMenu && priorityText && priorityImg) {
  // Toggle dropdown
  priorityBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    priorityMenu.classList.toggle("hidden");
  });

  // Click outside → close
  document.addEventListener("click", (event) => {
    if (!priorityBtn.contains(event.target) && !priorityMenu.contains(event.target)) {
      priorityMenu.classList.add("hidden");
    }
  });

  // Handle option click
  priorityMenu.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", () => {
      const label = item.dataset.label;
      const img = item.dataset.img;

      priorityText.textContent = label;
      priorityImg.src = img;
      priorityImg.alt = label;

      priorityMenu.classList.add("hidden");
    });
  });
}

//! toggleDeleteModal


// Toggle funksiyası
function toggleDeleteModal() {
  deleteModal.classList.toggle("hidden");
}

// Confirm and delete ticket
async function confirmDeleteTicket() {
  const ticketId = document.getElementById('currentTicketId')?.value;
  const partnerId = document.getElementById('currentPartnerId')?.value;
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (!ticketId || !partnerId) {
    console.error('Missing ticket or partner ID');
    alert('Sorğu məlumatları tapılmadı');
    return;
  }

  try {
    console.log('🗑️ Deleting ticket:', ticketId);

    const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        _csrf: csrfToken
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Ticket deleted successfully');
      alert('Sorğu uğurla silindi');
      // Go back to partner details page
      window.location.href = `/istifadeci-hovuzu/partner/${partnerId}`;
    } else {
      console.error('❌ Failed to delete ticket:', result.error);
      alert(result.error || 'Sorğu silinməsində xəta baş verdi');
      toggleDeleteModal(); // Close modal on error
    }
  } catch (error) {
    console.error('❌ Delete ticket error:', error);
    alert('Sorğu silinməsində xəta baş verdi');
    toggleDeleteModal(); // Close modal on error
  }
}

// Make functions globally available
window.confirmDeleteTicket = confirmDeleteTicket;

//! toggleSorguPopup

// Function to load assigned users for the edit popup
async function loadAssignedUsersDropdown() {
  try {
    const ticketId = document.getElementById('currentTicketId')?.value;
    const partnerId = document.getElementById('currentPartnerId')?.value;
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (!ticketId || !partnerId) {
      console.error('Missing ticket ID or partner ID');
      return;
    }

    // Fetch available users from the backend
    const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}/available-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    const users = data.users || [];
    const currentAssignedUserIds = data.currentAssignedUserIds || [];

    // Get dropdown elements
    const dropdownMenu = document.getElementById('assigneeDropdownMenu');
    const dropdownText = document.getElementById('assigneeDropdownText');
    const dropdownBtn = document.getElementById('assigneeDropdownBtn');
    const hiddenSelect = document.getElementById('assigneeSelect');

    if (!dropdownMenu || !dropdownText || !dropdownBtn || !hiddenSelect) {
      console.error('Assignee dropdown elements not found');
      return;
    }

    // Clear existing options
    const ul = dropdownMenu.querySelector('ul');
    if (ul) {
      ul.innerHTML = '';
    }

    // Clear hidden select
    hiddenSelect.innerHTML = '<option value="">Seçim edin</option>';

    if (users.length === 0) {
      ul.innerHTML = '<li class="px-3 py-2 text-[13px] text-secondary-text">İstifadəçi tapılmadı</li>';
      return;
    }

    // Populate dropdown with users
    users.forEach(user => {
      const userId = user._id || user.id;
      const userName = `${user.name || ''} ${user.surname || ''}`.trim() || 'İstifadəçi';
      const isCurrentlyAssigned = currentAssignedUserIds.includes(userId);

      // Create list item
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';

      // If currently assigned, make it disabled/non-clickable
      if (isCurrentlyAssigned) {
        a.className = 'block text-[13px] font-medium px-3 py-1 opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800';
        a.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <span>${userName}</span>
            <span class="text-[10px] bg-[#32B5AC] text-white px-2 py-0.5 rounded-full">Hazırda təyin edilib</span>
          </div>
        `;
        // Don't add click handler for currently assigned user
        a.addEventListener('click', (e) => {
          e.preventDefault();
          // Do nothing - user is already assigned
        });
      } else {
        a.className = 'block text-[13px] font-medium px-3 py-1 hover:bg-item-hover cursor-pointer';
        a.textContent = userName;
        a.setAttribute('data-value', userId);

        // Add click handler only for non-assigned users
        a.addEventListener('click', (e) => {
          e.preventDefault();
          dropdownText.textContent = userName;
          hiddenSelect.value = userId;
          dropdownMenu.classList.add('hidden');
        });
      }

      li.appendChild(a);
      ul.appendChild(li);

      // Add to hidden select
      const option = document.createElement('option');
      option.value = userId;
      option.textContent = userName;
      if (isCurrentlyAssigned) {
        option.setAttribute('data-assigned', 'true');
        option.disabled = true; // Disable the option
      }
      hiddenSelect.appendChild(option);
    });

    // Set dropdown button text
    if (currentAssignedUserIds.length > 0) {
      // Show currently assigned user but keep select empty (forcing new selection)
      const firstAssignedUser = users.find(u => currentAssignedUserIds.includes(u._id || u.id));
      if (firstAssignedUser) {
        const assignedUserName = `${firstAssignedUser.name || ''} ${firstAssignedUser.surname || ''}`.trim();
        dropdownText.innerHTML = `
          <div class="flex items-center gap-2">
            <span>${assignedUserName}</span>
            <span class="text-[10px] opacity-60">(Hazırda)</span>
          </div>
        `;
        // Keep select empty - user must choose a NEW person
        hiddenSelect.value = '';
      }
    } else {
      dropdownText.textContent = 'Seçim edin';
      hiddenSelect.value = '';
    }

    // Add dropdown toggle functionality
    dropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.add('hidden');
      }
    });

  } catch (error) {
    console.error('Error loading assigned users:', error);
    const dropdownText = document.getElementById('assigneeDropdownText');
    if (dropdownText) {
      dropdownText.textContent = 'Xəta baş verdi';
    }
  }
}

// Function to populate the popup with current ticket data
function populateSorguPopup() {
  // Get ticket data from hidden inputs
  const ticketTitle = document.getElementById('ticketTitle')?.value || '';
  const ticketContent = document.getElementById('ticketContent')?.value || '';
  const ticketCategory = document.getElementById('ticketCategory')?.value || '';
  const ticketReason = document.getElementById('ticketReason')?.value || '';
  const ticketSubject = document.getElementById('ticketSubject')?.value || '';
  const ticketPriority = document.getElementById('ticketPriority')?.value || '';

  // Populate category dropdown
  const categoryText = document.getElementById('categoryDropdownText');
  const categorySelect = document.getElementById('categorySelect');
  if (ticketCategory && categoryText && categorySelect) {
    categoryText.textContent = ticketCategory;
    categorySelect.value = ticketCategory;
  }

  // Populate reason dropdown
  const reasonText = document.getElementById('reasonDropdownText');
  const reasonSelect = document.getElementById('reasonSelect');
  if (ticketReason && reasonText && reasonSelect) {
    reasonText.textContent = ticketReason;
    reasonSelect.value = ticketReason;
  }

  // Populate subject dropdown
  const subjectText = document.getElementById('subjectDropdownText');
  const subjectSelect = document.getElementById('subjectSelect');
  if (ticketSubject && subjectText && subjectSelect) {
    // Map the subject value to display text
    const subjectMap = {
      'AP İstifadəçi': 'AP İstifadəçi',
      'Müəssisə': 'Müəssisə',
      'ap-istifadeci': 'AP İstifadəçi',
      'muessise': 'Müəssisə',
      'sirket': 'Şirkət',
      'Şirkət': 'Şirkət'
    };
    const displaySubject = subjectMap[ticketSubject] || ticketSubject;
    subjectText.textContent = displaySubject;
    subjectSelect.value = ticketSubject;
  }

  // Populate priority buttons
  const priorityButtons = document.querySelectorAll('.prioritet-btn');
  if (ticketPriority && priorityButtons.length > 0) {
    priorityButtons.forEach(btn => {
      btn.classList.remove('bg-focus', 'text-on-primary');
      btn.classList.add('text-tertiary-text');

      const btnText = btn.textContent.trim().toLowerCase();
      if (btnText === ticketPriority.toLowerCase()) {
        btn.classList.add('bg-focus', 'text-on-primary');
        btn.classList.remove('text-tertiary-text');
      }
    });
  }

  // Populate title input
  const titleInput = document.querySelector('#sorguPopup input[placeholder="Mövzu başlığını daxil edin"]');
  if (titleInput && ticketTitle) {
    titleInput.value = ticketTitle;
  }

  // Populate content input
  const contentInput = document.querySelector('#sorguPopup input[placeholder="Sorğu məzmunu..."]');
  if (contentInput && ticketContent) {
    contentInput.value = ticketContent;
  }

  // Load assigned users dropdown
  loadAssignedUsersDropdown();
}

// Toggle funksiyası
function toggleSorguPopup() {
  const isHidden = sorguPopup.classList.contains("hidden");
  sorguPopup.classList.toggle("hidden");

  // If opening the popup, populate it with current data
  if (isHidden) {
    populateSorguPopup();
  }
}

// ! Dropdown
function initDropdown(dropdownBtnId, dropdownMenuId, dropdownTextId, selectId) {
  const btn = document.getElementById(dropdownBtnId);
  const menu = document.getElementById(dropdownMenuId);
  const text = document.getElementById(dropdownTextId);
  const realSelect = document.getElementById(selectId);

  if (!btn || !menu || !text || !realSelect) {
    console.warn(`Dropdown elements not found: ${dropdownBtnId}`);
    return;
  }

  // Açılıb-bağla
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  // Seçim
  menu.querySelectorAll("a").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const value = item.getAttribute("data-value");
      const label = item.textContent.trim();

      // Button-un textini dəyişir
      text.textContent = label;

      // Hidden select-in value-sini dəyişir
      realSelect.value = value;

      // Dropdown bağlansın
      menu.classList.add("hidden");
    });
  });

  // Çöldə klik ediləndə dropdown bağlansın
  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
}

// İki dropdown-u işə salırıq
initDropdown(
  "categoryDropdownBtn",
  "categoryDropdownMenu",
  "categoryDropdownText",
  "categorySelect"
);
initDropdown(
  "reasonDropdownBtn",
  "reasonDropdownMenu",
  "reasonDropdownText",
  "reasonSelect"
);
// Subject dropdown-u işə salırıq
initDropdown(
  "subjectDropdownBtn",
  "subjectDropdownMenu",
  "subjectDropdownText",
  "subjectSelect"
);

// Təyin olunmuş şəxs dropdown-u işə salırıq (will be populated dynamically)
// Don't initialize static dropdown for assignee
// initDropdown(
//   "assigneeDropdownBtn",
//   "assigneeDropdownMenu",
//   "assigneeDropdownText",
//   "assigneeSelect"
// );

// ! High, Medium, Low
const priorityButtons = document.querySelectorAll(".prioritet-btn");

priorityButtons.forEach((button) => {
  // Click event
  button.addEventListener("click", () => {
    priorityButtons.forEach((btn) => {
      // Bütün button-ları default vəziyyətə gətiririk
      btn.classList.remove(
        "bg-focus",
        "text-on-primary",
        "bg-item-hover",
        "text-messages"
      );
      btn.classList.add("text-tertiary-text");
      btn.classList.add("cursor-pointer");
    });

    // Kliklənən button seçilmiş vəziyyət alır
    button.classList.add("bg-focus", "text-on-primary");
    button.classList.remove("text-tertiary-text");
    button.classList.remove("cursor-pointer");
  });

  // Hover effekti
  button.addEventListener("mouseenter", () => {
    if (!button.classList.contains("bg-focus")) {
      button.classList.remove("text-tertiary-text");
      button.classList.add("bg-item-hover", "text-messages");
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!button.classList.contains("bg-focus")) {
      button.classList.remove("bg-item-hover", "text-messages");
      button.classList.add("text-tertiary-text");
    }
  });
});

// ! popup tehkimEt
// Açmaq üçün
function openTehkimEtPopup() {
  document.getElementById("tehkimEtPop").classList.remove("hidden");
}

// Bağlamaq üçün
function closeTehkimEtPopup() {
  document.getElementById("tehkimEtPop").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("customSearchTehkimEt");
  const userList = document.querySelectorAll("#tehkimEtPop .px-6 > div");

  searchInput.addEventListener("input", function () {
    const filter = searchInput.value.toLowerCase().trim();

    userList.forEach(function (item) {
      const text = item.textContent.toLowerCase();

      if (text.includes(filter)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
});
