// Ticket Edit Functionality

// Array to track files marked for deletion
let filesToDelete = [];

// Function to update the deletion counter display
function updateDeletionCounter() {
  const counter = document.getElementById('fileDeletionCount');
  const info = document.getElementById('fileDeletionInfo');

  if (counter && info) {
    counter.textContent = filesToDelete.length;

    if (filesToDelete.length > 0) {
      info.classList.remove('hidden');
      info.classList.add('flex');
    } else {
      info.classList.add('hidden');
      info.classList.remove('flex');
    }
  }
}

// Function to populate edit popup with current ticket data
function populateEditPopup() {
  // Reset files to delete when opening popup
  filesToDelete = [];
  updateDeletionCounter();

  // Remove any deletion markers from previous edits
  const markedFiles = document.querySelectorAll('.file-marked-for-deletion');
  markedFiles.forEach(file => {
    file.classList.remove('file-marked-for-deletion', 'opacity-50');
    const restoreBtn = file.querySelector('.restore-file-btn');
    const deleteBtn = file.querySelector('.delete-file-btn');
    if (restoreBtn) restoreBtn.remove();
    if (deleteBtn) deleteBtn.style.display = '';
  });

  const category = document.getElementById('ticketCategory')?.value || '';
  const reason = document.getElementById('ticketReason')?.value || '';
  const subject = document.getElementById('ticketSubject')?.value || '';
  const priority = document.getElementById('ticketPriority')?.value || '';
  const title = document.getElementById('ticketTitle')?.value || '';
  const content = document.getElementById('ticketContent')?.value || '';

  console.log('Populating edit form with:', { category, reason, subject, priority, title, content });

  // Set category
  if (category) {
    document.getElementById('categorySelect').value = category;
    document.getElementById('categoryDropdownText').textContent = category;
  }

  // Set reason
  if (reason) {
    document.getElementById('reasonSelect').value = reason;
    document.getElementById('reasonDropdownText').textContent = reason;
  }

  // Set subject
  if (subject) {
    document.getElementById('subjectSelect').value = subject;
    document.getElementById('subjectDropdownText').textContent = subject;
  }

  // Set priority
  if (priority) {
    const priorityButtons = document.querySelectorAll('.prioritet-btn');
    priorityButtons.forEach(btn => {
      btn.classList.remove('active', 'bg-primary', 'text-white');
      const btnText = btn.textContent.trim().toLowerCase();
      if (btnText === priority.toLowerCase()) {
        btn.classList.add('active', 'bg-primary', 'text-white');
      }
    });
  }

  // Set title
  const titleInput = document.querySelector('#sorguPopup input[placeholder="Mövzu başlığını daxil edin"]');
  if (titleInput && title) {
    titleInput.value = title;
  }

  // Set content
  const contentInput = document.querySelector('#sorguPopup input[placeholder="Sorğu məzmunu..."]');
  if (contentInput && content) {
    contentInput.value = content;
  }
}

// Function to mark a file for deletion (visual only)
function markFileForDeletion(fileId, filename) {
  // Find the file card element
  const fileCards = document.querySelectorAll('#sorguPopup .border.rounded-lg');
  let fileCard = null;

  fileCards.forEach(card => {
    const button = card.querySelector(`button[onclick*="${fileId}"]`);
    if (button) {
      fileCard = card;
    }
  });

  if (!fileCard) {
    console.error('File card not found for:', fileId);
    return;
  }

  // Check if already marked
  if (filesToDelete.includes(fileId)) {
    console.log('File already marked for deletion');
    return;
  }

  // Add to deletion list
  filesToDelete.push(fileId);
  console.log('Marked for deletion:', filename, 'Total marked:', filesToDelete.length);

  // Update counter display
  updateDeletionCounter();

  // Add visual indication
  fileCard.classList.add('file-marked-for-deletion', 'opacity-50');
  fileCard.style.transition = 'opacity 0.3s ease';

  // Replace delete button with restore button
  const deleteBtn = fileCard.querySelector('button[onclick*="deleteTicketFile"]');
  if (deleteBtn) {
    deleteBtn.style.display = 'none';

    // Create restore button
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'restore-file-btn bg-transparent border-0 p-0 cursor-pointer group';
    restoreBtn.title = 'Geri qaytır';
    restoreBtn.innerHTML = '<div class="icon stratis-refresh-ccw-01 w-[18px] h-[18px] text-success opacity-70 hover:opacity-100"></div>';
    restoreBtn.onclick = function () {
      restoreFile(fileId, filename);
    };

    deleteBtn.parentElement.appendChild(restoreBtn);
  }
}

// Function to restore a file (remove from deletion list)
function restoreFile(fileId, filename) {
  // Remove from deletion list
  const index = filesToDelete.indexOf(fileId);
  if (index > -1) {
    filesToDelete.splice(index, 1);
    console.log('Restored file:', filename, 'Remaining marked:', filesToDelete.length);
  }

  // Update counter display
  updateDeletionCounter();

  // Find the file card element
  const fileCards = document.querySelectorAll('#sorguPopup .border.rounded-lg');
  let fileCard = null;

  fileCards.forEach(card => {
    const button = card.querySelector(`button[onclick*="${fileId}"]`);
    if (button) {
      fileCard = card;
    }
  });

  if (!fileCard) return;

  // Remove visual indication
  fileCard.classList.remove('file-marked-for-deletion', 'opacity-50');

  // Remove restore button and show delete button
  const restoreBtn = fileCard.querySelector('.restore-file-btn');
  const deleteBtn = fileCard.querySelector('button[onclick*="deleteTicketFile"]');

  if (restoreBtn) restoreBtn.remove();
  if (deleteBtn) deleteBtn.style.display = '';
}

// Function to delete a file from ticket
async function deleteTicketFile(fileId, filename) {
  // Mark for deletion instead of immediate delete
  markFileForDeletion(fileId, filename);
}

// Function to handle ticket update
async function handleTicketUpdate(event) {
  console.log('🚀 handleTicketUpdate called');
  event.preventDefault();

  const partnerId = document.getElementById('currentPartnerId')?.value;
  const ticketId = document.getElementById('currentTicketId')?.value;

  console.log('Partner ID:', partnerId, 'Ticket ID:', ticketId);

  if (!partnerId || !ticketId) {
    alert('Sorğu məlumatları tapılmadı');
    console.error('Missing partner or ticket ID');
    return;
  }

  // Get form values
  const category = document.getElementById('categorySelect')?.value;
  const reason = document.getElementById('reasonSelect')?.value;
  const subject = document.getElementById('subjectSelect')?.value;
  const subjectId = document.getElementById('customSearch')?.value;
  const priorityBtn = document.querySelector('.prioritet-btn.active');
  const priority = priorityBtn ? priorityBtn.textContent.trim().toLowerCase() : '';
  const title = document.querySelector('#sorguPopup input[placeholder="Mövzu başlığını daxil edin"]')?.value;
  const content = document.querySelector('#sorguPopup input[placeholder="Sorğu məzmunu..."]')?.value;

  // Get assignee value - try multiple sources
  const assigneeSelectElement = document.getElementById('assigneeSelect');
  const assigneeDropdownBtn = document.getElementById('assigneeDropdownBtn');
  const assigneeText = document.getElementById('assigneeDropdownText')?.textContent?.trim();

  // Try to get value from select element
  let assignedUser = assigneeSelectElement?.value;

  // If select is empty, try to get from selected option's data-value attribute
  if (!assignedUser || assignedUser === '') {
    const selectedOption = assigneeSelectElement?.querySelector('option:checked');
    if (selectedOption) {
      assignedUser = selectedOption.value;
    }
  }

  // If still empty, try to find the selected item in the dropdown menu by matching text
  if ((!assignedUser || assignedUser === '') && assigneeText && assigneeText !== 'Seçim edin') {
    const dropdownItems = document.querySelectorAll('#assigneeDropdownMenu a');
    dropdownItems.forEach(item => {
      const itemText = item.textContent.trim();
      // Remove badge text if present
      const cleanItemText = itemText.replace('Təyin edilib', '').trim();
      if (cleanItemText === assigneeText) {
        assignedUser = item.getAttribute('data-value');
        console.log('✅ Found user ID from dropdown item:', assignedUser);
      }
    });
  }

  console.log('🔍 Assignee Debug:', {
    selectElement: assigneeSelectElement,
    selectValue: assigneeSelectElement?.value,
    finalAssignedUser: assignedUser,
    dropdownText: assigneeText,
    isSeçimEdin: assigneeText === 'Seçim edin'
  });

  console.log('Raw form values:', { category, reason, subject, subjectId, priority, title, content, assignedUser });

  // Validate required fields
  if (!title || !title.trim()) {
    alert('Mövzu başlığı daxil edin');
    return;
  }

  if (!content || !content.trim()) {
    alert('Sorğu məzmunu daxil edin');
    return;
  }

  // Get CSRF token
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  console.log('CSRF Token:', csrfToken);

  // Build update data - only include non-empty values
  const updateData = {
    title: title.trim(),
    content: content.trim(),
    _csrf: csrfToken
  };

  // Add optional fields only if they have values
  if (category && category !== '' && category !== 'Seçim edin') {
    updateData.category = category;
  }
  if (reason && reason !== '' && reason !== 'Seçim edin') {
    updateData.reason = reason;
  }
  if (subject && subject !== '' && subject !== 'Seçim edin') {
    updateData.subject = subject;
  }
  if (subjectId && subjectId.trim() !== '') {
    updateData.subjectId = subjectId.trim();
  }
  if (priority && priority !== '') {
    updateData.priority = priority;
  }
  // Check assignedUser - only add if it has a real value (not empty or "Seçim edin")
  if (assignedUser && assignedUser !== '' && assignedUser !== 'Seçim edin') {
    console.log('✅ Adding assignedUser to update:', assignedUser);
    updateData.assignedUser = assignedUser;
  } else {
    console.log('⚠️ AssignedUser not added. Value:', assignedUser, 'Text:', assigneeText);
  }

  console.log('Updating ticket with:', updateData);

  try {
    // Get CSRF token for file deletions
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // First, delete marked files if any
    if (filesToDelete.length > 0) {
      console.log(`🗑️ Deleting ${filesToDelete.length} marked file(s)...`);

      const deletePromises = filesToDelete.map(async (fileId) => {
        try {
          const response = await fetch(`/istifadeci-hovuzu/partner/tickets/files/${fileId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              _csrf: csrfToken
            })
          });

          const result = await response.json();
          if (!result.success) {
            console.error('Failed to delete file:', fileId, result.error);
          }
          return result;
        } catch (error) {
          console.error('Error deleting file:', fileId, error);
          return { success: false, error: error.message };
        }
      });

      await Promise.all(deletePromises);
      console.log('✅ File deletion completed');
    }

    // Then update the ticket
    const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();

    if (result.success) {
      alert('Sorğu uğurla yeniləndi');
      // Reset files to delete array
      filesToDelete = [];
      // Reload the page to show updated data
      window.location.reload();
    } else {
      alert(result.error || 'Sorğu yeniləməsində xəta baş verdi');
    }
  } catch (error) {
    console.error('Update ticket error:', error);
    alert('Sorğu yeniləməsində xəta baş verdi');
  }
}

// Toggle edit popup
// Note: Dropdowns are already initialized by sorgular.js
function toggleSorguPopup() {
  const popup = document.getElementById('sorguPopup');
  if (!popup) return;

  const isHidden = popup.classList.contains('hidden');

  if (isHidden) {
    // Opening popup - populate with current data
    populateEditPopup();
    popup.classList.remove('hidden');
  } else {
    // Closing popup
    popup.classList.add('hidden');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  console.log('Ticket edit script loaded');

  // Handle priority button clicks
  const priorityButtons = document.querySelectorAll('.prioritet-btn');
  priorityButtons.forEach(button => {
    button.addEventListener('click', function () {
      priorityButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white');
      });
      this.classList.add('active', 'bg-primary', 'text-white');
    });
  });

  // Dropdowns (category, reason, subject) are already initialized by sorgular.js

  // Handle assignee dropdown
  document.getElementById('assigneeDropdownBtn')?.addEventListener('click', async function () {
    const menu = document.getElementById('assigneeDropdownMenu');
    const isHidden = menu.classList.contains('hidden');

    if (isHidden) {
      // Load available users
      const partnerId = document.getElementById('currentPartnerId')?.value;
      const ticketId = document.getElementById('currentTicketId')?.value;

      if (partnerId && ticketId) {
        try {
          const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}/available-users`);
          const data = await response.json();

          if (data.success && data.users) {
            const ul = menu.querySelector('ul');
            ul.innerHTML = '';

            data.users.forEach(user => {
              const li = document.createElement('li');
              li.innerHTML = `
                <a href="#" class="block text-[13px] font-medium px-3 py-1 hover:bg-item-hover" data-value="${user._id}">
                  ${user.name} ${user.surname}
                </a>
              `;

              li.querySelector('a').addEventListener('click', function (e) {
                e.preventDefault();
                document.getElementById('assigneeSelect').value = this.getAttribute('data-value');
                document.getElementById('assigneeDropdownText').textContent = this.textContent.trim();
                menu.classList.add('hidden');
              });

              ul.appendChild(li);
            });
          }
        } catch (error) {
          console.error('Error loading users:', error);
        }
      }

      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
  });

  // Handle form submission
  // Note: Submit button uses onclick="handleTicketUpdate(event)" in HTML
  // No need to add addEventListener to avoid duplicate calls
  const submitButton = document.getElementById('submitTicketEditBtn');
  console.log('Submit button found:', submitButton ? 'YES' : 'NO');

  // Click-outside handlers are already managed by sorgular.js
});

// Make functions globally available
window.toggleSorguPopup = toggleSorguPopup;
window.deleteTicketFile = deleteTicketFile;
window.handleTicketUpdate = handleTicketUpdate;
