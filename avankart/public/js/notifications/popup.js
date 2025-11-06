const popupNotificationsOverlay = document.getElementById(
  "notificationsOverlay"
);
const notificationsModal = document.getElementById("notificationsModal");
const allNotificationsModal = document.getElementById("allNotificationsModal");
const personalNotificationsModal = document.getElementById(
  "personalNotificationsModal"
);

function openAllNotificationsModal() {
  // Show the "all notifications" section and hide the "personal notifications" section
  document.getElementById("allNotificationsModal").classList.remove("hidden");
  document.getElementById("personalNotificationsModal").classList.add("hidden");

  // Get the buttons
  const allNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(1)"
  );
  const personalNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(2)"
  );

  // Check if the "All Notifications" button is not active and add the "active" class
  if (!allNotificationsButton.classList.contains("active")) {
    allNotificationsButton.classList.add("active");
    allNotificationsButton.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    allNotificationsButton.classList.add(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    allNotificationsButton.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );

    // Remove "active" and change styles of the "Personal Notifications" button
    personalNotificationsButton.classList.remove("active");
    personalNotificationsButton.classList.remove(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    personalNotificationsButton.classList.remove(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    personalNotificationsButton.classList.add(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  }
}

function openPersonalNotificationsModal() {
  // Show the "personal notifications" section and hide the "all notifications" section
  document.getElementById("allNotificationsModal").classList.add("hidden");
  document
    .getElementById("personalNotificationsModal")
    .classList.remove("hidden");

  // Get the buttons
  const allNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(1)"
  );
  const personalNotificationsButton = document.querySelector(
    ".notificationModalType:nth-child(2)"
  );

  // Check if the "Personal Notifications" button is not active and add the "active" class
  if (!personalNotificationsButton.classList.contains("active")) {
    personalNotificationsButton.classList.add("active");
    personalNotificationsButton.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    personalNotificationsButton.classList.add(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    personalNotificationsButton.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );

    // Remove "active" and change styles of the "All Notifications" button
    allNotificationsButton.classList.remove("active");
    allNotificationsButton.classList.remove(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark"
    );
    allNotificationsButton.classList.remove(
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    allNotificationsButton.classList.add(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  }
}

function toggleActiveTab(event, tab) {
  // Get all the tabs
  const tabs = document.querySelectorAll(".filterModal-button");

  // Loop through each tab and remove the 'active' class
  tabs.forEach((tabElement) => {
    tabElement.classList.remove(
      "active",
      "text-messages",
      "dark:text-primary-text-color-dark",
      "border-messages",
      "dark:border-primary-text-color-dark"
    );
    tabElement.classList.add("border-transparent");
  });

  // Get the clicked tab
  const clickedTab = event.currentTarget;

  // Add 'active' class and styles to the clicked tab
  clickedTab.classList.add(
    "active",
    "text-messages",
    "dark:text-primary-text-color-dark",
    "border-messages",
    "dark:border-primary-text-color-dark"
  );
  clickedTab.classList.remove("border-transparent");

  // You can also use the tab parameter if you need to trigger specific actions depending on the tab clicked
  // For example, showing/hiding content based on the selected tab
  console.log(tab); // 'all', 'read', 'unread'
}

document.addEventListener("DOMContentLoaded", function () {
  // Notification type buttons (Korporativ və Fərdi bildirişlər)
  const notificationButtons = document.querySelectorAll(".notification-type");

  notificationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove styles from all buttons
      notificationButtons.forEach((btn) => {
        btn.classList.remove("bg-inverse-on-surface", "text-messages");
      });

      // Add styles to the clicked button
      this.classList.add("bg-inverse-on-surface", "text-messages");
    });
  });

  // Filter buttons (Hamısı, Oxunmuşlar, Oxunmamışlar)
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      // Remove underline and text color from all filter buttons
      filterButtons.forEach((btn) => {
        btn.classList.remove("border-messages", "text-messages", "border-b-2");
      });

      // Add underline and text color to clicked filter
      this.classList.add("border-messages", "text-messages", "border-b-2");
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Korporativ və fərdi bildiriş düymələri
  const notificationButtons = document.querySelectorAll(".notification-type");

  notificationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Əgər düymə artıq aktivdirsə, "active" sinfini sil və text rəngini dəyiş
      if (this.classList.contains("active")) {
        this.classList.remove("active", "text-messages");
        this.classList.add("text-tertiary-text"); // Rəngi dəyiş
      } else {
        // Digər düymələrdən "active" sinfini və rəngləri sil
        notificationButtons.forEach((btn) => {
          btn.classList.remove("active", "text-messages");
          btn.classList.add("text-tertiary-text"); // Digər düymələrə text-tertiary-text əlavə et
        });

        // Seçilən düyməyə "active" sinfini əlavə et və text-messages rəngini təyin et
        this.classList.add("active", "text-messages");
        this.classList.remove("text-tertiary-text"); // Digər rəngi sil
      }
    });
  });
});
