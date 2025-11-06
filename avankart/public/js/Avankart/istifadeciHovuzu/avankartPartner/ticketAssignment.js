// Ticket Assignment Functionality
(function () {
  'use strict';

  // Get ticket and partner IDs from hidden inputs
  const getTicketInfo = () => {
    const ticketId = document.getElementById('currentTicketId')?.value;
    const partnerId = document.getElementById('currentPartnerId')?.value;
    return { ticketId, partnerId };
  };

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  };

  // Loading state management
  const setLoadingState = (isLoading) => {
    const popup = document.getElementById('tehkimEtPop');
    const loadingOverlay = popup.querySelector('.loading-overlay');

    if (isLoading) {
      if (!loadingOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-[12px]';
        overlay.innerHTML = `
          <div class="flex flex-col items-center gap-3">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span class="text-white text-[13px]">Yüklənir...</span>
          </div>
        `;
        popup.querySelector('.relative').appendChild(overlay);
      }
    } else {
      if (loadingOverlay) {
        loadingOverlay.remove();
      }
    }
  };

  // Show notification
  // const showNotification = (message, type = 'success') => {
  //   const notification = document.createElement('div');
  //   notification.className = `fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
  //     type === 'success' ? 'bg-[#32B5AC] text-white' : 'bg-error text-white'
  //   }`;
  //   notification.innerHTML = `
  //     <div class="flex items-center gap-3">
  //       <div class="icon ${type === 'success' ? 'stratis-check-circle' : 'stratis-x-circle'} text-xl"></div>
  //       <span class="text-[13px] font-medium">${message}</span>
  //     </div>
  //   `;
  //   document.body.appendChild(notification);

  //   setTimeout(() => {
  //     notification.style.opacity = '0';
  //     setTimeout(() => notification.remove(), 300);
  //   }, 3000);
  // };

  // Fetch available users
  const fetchAvailableUsers = async () => {
    const { ticketId, partnerId } = getTicketInfo();

    if (!ticketId || !partnerId) {
      console.error('Ticket ID or Partner ID not found');
      return [];
    }

    try {
      setLoadingState(true);

      const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}/available-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        return data.data || [];
      } else {
        console.error('Failed to fetch users:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alertModal('İstifadəçilər yüklənərkən xəta baş verdi', 'error');
      return [];
    } finally {
      setLoadingState(false);
    }
  };

  // Render users in popup
  const renderUsers = (users) => {
    const userListContainer = document.querySelector('#tehkimEtPop .px-6.my-2');

    if (!userListContainer) {
      console.error('User list container not found');
      return;
    }

    if (users.length === 0) {
      userListContainer.innerHTML = `
        <div class="py-8 text-center text-secondary-text">
          <div class="icon stratis-users-profiles-02 text-[32px] opacity-30 mb-2"></div>
          <div class="text-[13px]">Təhkim etmək üçün istifadəçi tapılmadı</div>
        </div>
      `;
      return;
    }

    userListContainer.innerHTML = users.map((user, index) => `
      <div class="py-3 px-2 rounded-md ${index < users.length - 1 ? 'border-b-[0.5px] border-[#0000001A]' : ''} cursor-pointer hover:bg-item-hover rounded transition-colors user-item" data-user-id="${user._id}">
        <div class="flex items-center gap-3">
          <div class="flex flex-col">
            <span class="text-[13px] font-medium">${user.fullName}</span>
            <span class="text-[11px] opacity-65">${user.email}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Add click handlers to user items
    attachUserClickHandlers();
  };

  // Attach click handlers to user items
  const attachUserClickHandlers = () => {
    const userItems = document.querySelectorAll('.user-item');

    userItems.forEach(item => {
      item.addEventListener('click', async function () {
        const userId = this.dataset.userId;
        await assignUserToTicket(userId);
      });
    });
  };

  // Assign user to ticket
  const assignUserToTicket = async (userId) => {
    const { ticketId, partnerId } = getTicketInfo();
    const csrfToken = getCsrfToken();

    if (!ticketId || !partnerId) {
      alertModal('Ticket məlumatları tapılmadı', 'error');
      return;
    }

    try {
      setLoadingState(true);

      const response = await fetch(`/istifadeci-hovuzu/partner/${partnerId}/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        alertModal(data.message || 'İstifadəçi uğurla təhkim edildi', 'success');

        // Close popup
        closeTehkimEtPopup();

        // Reload page after short delay to show updated assignment
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alertModal(data.error || 'Təhkim edilərkən xəta baş verdi', 'error');
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      alertModal('Təhkim edilərkən xəta baş verdi', 'error');
    } finally {
      setLoadingState(false);
    }
  };

  // Search functionality
  const initSearchFunctionality = () => {
    const searchInput = document.getElementById('customSearchTehkimEt');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
      const filter = this.value.toLowerCase().trim();
      const userItems = document.querySelectorAll('.user-item');

      userItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(filter) ? '' : 'none';
      });
    });
  };

  // Initialize when popup opens
  window.openTehkimEtPopup = async function () {
    const popup = document.getElementById('tehkimEtPop');
    popup.classList.remove('hidden');

    // Clear search input
    const searchInput = document.getElementById('customSearchTehkimEt');
    if (searchInput) {
      searchInput.value = '';
    }

    // Fetch and render users
    const users = await fetchAvailableUsers();
    renderUsers(users);

    // Initialize search
    initSearchFunctionality();
  };

  // Close popup function
  window.closeTehkimEtPopup = function () {
    const popup = document.getElementById('tehkimEtPop');
    popup.classList.add('hidden');
  };

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    initSearchFunctionality();
  });

})();
