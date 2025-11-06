// 🔌 NOTIFICATION SOCKET SYSTEM
// ==============================================

// 📱 1. HEADER POPUP + SIDEBAR BADGE (EYNİ SOCKET)
// Location: Bütün səhifələrdə aktiv
// Socket event: 'notification'

if (!window.HeaderSidebarManager) {
  window.HeaderSidebarManager = {
  init() {
    // if (!window.notifications) {
    //   window.notifications = { corporate: [], personal: [] };
    // }

    window.notifications = { corporate: [], personal: [] };
    window.notificationCounts = {
      corporate: { total: 0, read: 0, unread: 0 },
      personal: { total: 0, read: 0, unread: 0 },
    };

    // Eyni socket event ilə həm header həm sidebar yenilənir
    socket.on("notification", (data) => {
      // 1. Add to global storage
      this.addToStorage(data);

      // 2. Update header popup (modal)
      this.updateHeaderPopup();

      // 3. Update sidebar badge
      this.updateSidebarBadge();

      // 4. Show toast
      this.showToast(data);
    });

    if (!window.notificationCounts) {
      this.calculateCounts();
    }

    this.updateStatusCount();
    this.updateSidebarBadge();
  },

  addToStorage(notification) {
    if (!window.notifications) {
      window.notifications = { corporate: [], personal: [] };
    }

    const category = notification.user_id ? "personal" : "corporate";
    const status = notification.is_read === false ? "unread" : "read";

    // const category = notification.category || "corporate";
    window.notifications[category].unshift({
      id: this.generateId(),
      title: notification.title,
      message: notification.message,
      status: status,
      category: category,
      createdAt: new Date().toISOString(),
    });

    // Keep max 50 per category
    if (window.notifications[category].length > 50) {
      window.notifications[category] = window.notifications[category].slice(
        0,
        50
      );
    }

    // Update counts
    this.calculateCounts();
    if (window.updateNotificationCounts) {
      window.updateNotificationCounts();
    }
  },

  // calculateCounts() {
  //   if (!window.notificationCounts) {
  //     window.notificationCounts = {
  //       corporate: { total: 0, read: 0, unread: 0 },
  //       personal: { total: 0, read: 0, unread: 0 },
  //     };
  //   }

  //   // Corporate counts
  //   window.notificationCounts.corporate = {
  //     total: window.notifications.corporate.length,
  //     read: window.notifications.corporate.filter((n) => n.status === "read")
  //       .length,
  //     unread: window.notifications.corporate.filter(
  //       (n) => n.status === "unread"
  //     ).length,
  //   };

  //   // Personal counts
  //   window.notificationCounts.personal = {
  //     total: window.notifications.personal.length,
  //     read: window.notifications.personal.filter((n) => n.status === "read")
  //       .length,
  //     unread: window.notifications.personal.filter((n) => n.status === "unread")
  //       .length,
  //   };
  // },

  calculateCounts() {
    // ✅ Əgər notifications obyekti yoxdursa, yarat
    if (!window.notifications) {
      window.notifications = { corporate: [], personal: [] };
    }

    // ✅ Əgər corporate və personal sahələri yoxdursa, fallback ver
    if (!window.notifications.corporate) {
      window.notifications.corporate = [];
    }
    if (!window.notifications.personal) {
      window.notifications.personal = [];
    }

    // ✅ Əgər notificationCounts obyekti yoxdursa, yarat
    if (!window.notificationCounts) {
      window.notificationCounts = {
        corporate: { total: 0, read: 0, unread: 0 },
        personal: { total: 0, read: 0, unread: 0 },
      };
    }

    // ✅ Corporate countları
    window.notificationCounts.corporate = {
      total: window.notifications.corporate.length,
      read: window.notifications.corporate.filter((n) => n.status === "read")
        .length,
      unread: window.notifications.corporate.filter(
        (n) => n.status === "unread"
      ).length,
    };

    // ✅ Personal countları
    window.notificationCounts.personal = {
      total: window.notifications.personal.length,
      read: window.notifications.personal.filter((n) => n.status === "read")
        .length,
      unread: window.notifications.personal.filter((n) => n.status === "unread")
        .length,
    };
  },

  updateHeaderPopup() {
    // Əgər header modal açıqdırsa, məzmunu yenilə
    const notificationsModal = document.getElementById("notificationsModal");

    if (
      notificationsModal &&
      !notificationsModal.classList.contains("hidden")
    ) {
      if (
        (!window.notifications.corporate ||
          window.notifications.corporate.length === 0) &&
        (!window.notifications.personal ||
          window.notifications.personal.length === 0)
      ) {
        notificationsModal.innerHTML = `
        <div class="p-4 text-sm text-secondary-text dark:text-secondary-text-color-dark">
          Heç bir bildiriş yoxdur.
        </div>
      `;
        return;
      }
      // Render notifications in modal
      if (typeof renderNotifications === "function") {
        renderNotifications();
      }

      // Update tab counts in modal
      if (typeof updateNotificationCounts === "function") {
        updateNotificationCounts();
      }

      console.log("🔔 Header popup updated");
    }
  },

  updateSidebarBadge() {
    // REAL count hesabla, fake sayılar yox
    let totalUnread = 0;

    if (window.notifications) {
      const corporateUnread = window.notifications.corporate.filter(
        (n) => n.status === "unread"
      ).length;
      const personalUnread = window.notifications.personal.filter(
        (n) => n.status === "unread"
      ).length;
      totalUnread = corporateUnread + personalUnread;
    }

    const badgeElement = document.getElementById("sidebar-notification-count");
    if (badgeElement) {
      if (totalUnread > 0) {
        badgeElement.textContent = totalUnread;
        badgeElement.style.display = "inline-flex";
        badgeElement.classList.remove("hidden");
      } else {
        badgeElement.style.display = "none";
        badgeElement.classList.add("hidden");
      }
    }
  },

  showToast(notification) {
    // Toast notification yaradır
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 z-[9999] max-w-sm bg-menu dark:bg-menu-dark border border-stroke dark:border-[#FFFFFF1A] rounded-lg shadow-lg p-4 transform translate-x-full transition-transform duration-300";

    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <img class="block dark:hidden w-8 h-8" src="/images/notifications/notificationLogo.svg" alt="notification" />
          <img class="hidden dark:block w-8 h-8" src="/images/notifications/profileDarkMode.svg" alt="notification" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark mb-1">
            ${notification.title}
          </div>
          <div class="text-[11px] text-secondary-text dark:text-secondary-text-color-dark line-clamp-2">
            ${notification.message}
          </div>
          <div class="flex items-center gap-2 mt-2">
            <button onclick="HeaderSidebarManager.hideToast(this)" class="text-[10px] text-tertiary-text dark:text-tertiary-text-color-dark hover:text-messages dark:hover:text-primary-text-color-dark">
              Bağla
            </button>
            <button onclick="HeaderSidebarManager.goToNotifications()" class="text-[10px] text-primary dark:text-primary-dark hover:text-focus dark:hover:text-focus-color-dark">
              Hamısına bax
            </button>
          </div>
        </div>
        <button onclick="HeaderSidebarManager.hideToast(this)" class="flex-shrink-0 text-tertiary-text dark:text-tertiary-text-color-dark hover:text-messages dark:hover:text-primary-text-color-dark">
          <div class="icon stratis-x-02 w-4 h-4"></div>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-x-full");
    }, 100);

    // Auto hide after 5 seconds
    setTimeout(() => {
      this.hideToast(toast);
    }, 5000);

    this.updateStatusCount();
  },

  hideToast(element) {
    const toast = element.closest("div.fixed") || element;
    if (toast) {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  },

  goToNotifications() {
    window.location.href = "/notifications";
  },

  generateId() {
    return (
      "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  },

  updateStatusCount() {
    const unreadCorporate = window.notificationCounts?.corporate?.unread || 0;
    const unreadPersonal = window.notificationCounts?.personal?.unread || 0;
    const totalUnread = unreadCorporate + unreadPersonal;

    // const unread =
    //   (window.notificationCounts &&
    //     window.notificationCounts.corporate &&
    //     window.notificationCounts.corporate.unread) ||
    //   0;

    const totalCountEl = document.getElementById("total-count");
    if (totalCountEl) {
      totalCountEl.innerHTML = `Hamısı (<span class="count">${totalUnread}</span>)`;
    }

    const unreadCountEl = document.getElementById("unread-count");
    if (unreadCountEl) {
      unreadCountEl.innerHTML = `Oxunmamış (<span class="count">${totalUnread}</span>)`;
    }
  },
};
}

// 📋 2. NOTIFICATIONS PAGE (AYRI SOCKET)
// Location: Yalnız /notifications səhifəsində
// Socket event: 'notification-page-update'

if (!window.NotificationsPageManager) {
  window.NotificationsPageManager = {
  init() {
    // Yalnız notifications səhifəsindəysə active et
    if (window.location.pathname.includes("/notifications")) {
      socket.on("notification-page-update", (data) => {
        // DataTable-ı yenilə
        this.refreshDataTable();
      });
    }
  },

  refreshDataTable() {
    // Global table variable-ını yenilə
    if (window.notificationsTable && window.notificationsTable.ajax) {
      window.notificationsTable.ajax.reload(null, false); // Keep current page
    }

    // Update display counts if function exists
    if (typeof window.updateDisplayCounts === "function") {
      window.updateDisplayCounts();
    }
  },
};
}

// 🔌 3. MAIN SOCKET MANAGER
if (!window.NotificationSocketManager) {
  window.NotificationSocketManager = {
  init() {
    if (typeof io === "undefined") {
      console.error("❌ Socket.io library tapılmadı");
      return;
    }

    try {
      this.setupEventListeners();

      // Initialize managers
      HeaderSidebarManager.init(); // Header popup + Sidebar badge (eyni socket)
      NotificationsPageManager.init(); // Page DataTable (ayrı socket)
    } catch (error) {
      console.error("❌ Socket initialization error:", error);
      this.initFallbackMode();
    }
  },

  setupEventListeners() {
    window.socket.on("connect", () => {
      console.log("✅ Socket connected:", window.socket.id);
    });

    window.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    window.socket.on("connect_error", (error) => {
      console.error("🚨 Socket connection error:", error.message || error);
    });

    window.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected. Attempt:", attemptNumber);
    });
  },

  initFallbackMode() {
    console.warn("⚠️ Socket fallback mode activated");
    this.fallbackMode = true;
  },

  // Test functions
  testHeaderSidebar(category = "corporate") {
    const testData = {
      title: "Test Header+Sidebar",
      message: "Bu header popup və sidebar üçün test notification-dır",
      status: "unread",
      category: category,
    };

    HeaderSidebarManager.addToStorage(testData);
    HeaderSidebarManager.updateHeaderPopup();
    HeaderSidebarManager.updateSidebarBadge();
    HeaderSidebarManager.showToast(testData);
  },

  testNotificationsPage() {
    if (window.location.pathname.includes("/notifications")) {
      NotificationsPageManager.refreshDataTable();
    } else {
    }
  },
};
}

// 🚀 AUTO-INITIALIZE
document.addEventListener("DOMContentLoaded", function () {
  if (window.HeaderSidebarManager && typeof window.HeaderSidebarManager.init === "function") {
    window.HeaderSidebarManager.init();
  }
});

// 🌍 GLOBAL ACCESS
window.HeaderSidebarManager = window.HeaderSidebarManager || {};
window.NotificationSocketManager = window.NotificationSocketManager || {};
window.NotificationsPageManager = window.NotificationsPageManager || {};

// 🧪 DEVELOPMENT HELPERS
if (window.location.hostname === "localhost") {
  window.testHeaderSidebar = (category) =>
    NotificationSocketManager.testHeaderSidebar(category);
  window.testNotificationsPage = () =>
    NotificationSocketManager.testNotificationsPage();
}
