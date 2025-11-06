// public/js/muessise melumatlari pages/cardsDataLoader.js
// Bu fayl cards datasını yükləmək üçündür

class CardsDataLoader {
  constructor() {
    this.isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    this.init();
  }

  init() {
    // DOM yüklənəndən sonra işləsin
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.loadData());
    } else {
      this.loadData();
    }
  }

  loadData() {
    try {
      // Server-dən cards datasını fetch edib global variable-lara yüklə
      this.fetchCardsData();
    } catch (error) {
      if (this.isDevelopment) {
        console.error("❌ CardsDataLoader init error:", error);
      }
    }
  }

  async fetchCardsData() {
    try {
      if (this.isDevelopment) {
      }

      // CSRF token al
      const csrfToken =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content") ||
        document.querySelector('input[name="_csrf"]')?.value;

      const response = await fetch("/muessise-info/get-muessise-info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Global variable-lara yüklə
        window.allCards = data.allCards || [];
        window.muessiseData = data.muessise || {};
        window.csrfToken = data.csrfToken;

        // Event dispatch et ki, EditPopupManager bunu bilsin
        this.dispatchDataLoadedEvent();
      } else {
        throw new Error(data.message || "Failed to load cards data");
      }
    } catch (error) {
      if (this.isDevelopment) {
        console.error("❌ Error fetching cards data:", error);
      }

      // Fallback: boş datalar
      window.allCards = [];
      window.muessiseData = {};
      window.csrfToken = "";

      this.dispatchDataLoadedEvent(false);
    }
  }

  dispatchDataLoadedEvent(success = true) {
    // Custom event dispatch et
    const event = new CustomEvent("cardsDataLoaded", {
      detail: {
        success: success,
        allCards: window.allCards || [],
        muessiseData: window.muessiseData || {},
      },
    });

    document.dispatchEvent(event);
  }
}

// Instance yarat
window.cardsDataLoader = new CardsDataLoader();
