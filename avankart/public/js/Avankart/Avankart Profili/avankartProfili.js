$(document).ready(function () {
  console.log("avanakrtProfili.js ");
  // --- CSRF TOKEN HANDLING --------------------------------------------------
  let __csrfToken = null;

  async function getCsrfToken(force = false) {
    if (__csrfToken && !force) return __csrfToken;
    try {
      const r = await fetch("/csrf-token", { credentials: "include" });
      if (!r.ok) throw new Error("csrf fetch status " + r.status);
      const j = await r.json();
      __csrfToken = j.csrfToken;
      return __csrfToken;
    } catch (e) {
      console.warn("CSRF token alınmadı:", e.message);
      return null;
    }
  }
  getCsrfToken().then(() => {});
  let currentTab = "aktiv";
  let currentTable = null;

  let aktivData = [];
  let aktivPagination = { page: 1, pages: 1, total: 0, limit: 10 };

  // Vəzifələr API-dən gələcək
  let vezifelerData = [];
  let isLoadingVezifeler = false;

  // API-dən vəzifələri yüklə
  async function fetchVezifelerData() {
    if (isLoadingVezifeler) return;
    isLoadingVezifeler = true;

    try {
      const searchVal = $("#vezifeler-search").val() || "";
      const response = await fetch(
        `/avankart-profile/api/duties-table?page=1&limit=100&search=${encodeURIComponent(searchVal)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        vezifelerData = result.data;
        console.log("✅ Vəzifələr yükləndi:", vezifelerData.length);
        if (currentTab === "vezifeler") {
          initializeTable();
        }
      } else {
        console.error("❌ API-dən gözlənilməz cavab:", result);
        vezifelerData = [];
      }
    } catch (error) {
      console.error("❌ Vəzifələr yüklənərkən xəta:", error);
      vezifelerData = [];
    } finally {
      isLoadingVezifeler = false;
    }
  }

  let selahiyyetData = [];
  let isLoadingSelahiyyet = false;

  async function fetchSelahiyyetData() {
    if (isLoadingSelahiyyet) return;
    isLoadingSelahiyyet = true;

    try {
      const searchVal = $("#selahiyyet-search").val() || "";
      const response = await fetch(
        `/avankart-profile/api/permission-groups-table?page=1&limit=100&search=${encodeURIComponent(searchVal)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        selahiyyetData = result.data;
        console.log("✅ Səlahiyyət qrupları yükləndi:", selahiyyetData.length);
        if (currentTab === "selahiyyet") {
          initializeTable();
        }
      } else {
        console.error("❌ API-dən gözlənilməz cavab:", result);
        selahiyyetData = [];
      }
    } catch (error) {
      console.error("❌ Səlahiyyət qrupları yüklənərkən xəta:", error);
      selahiyyetData = [];
    } finally {
      isLoadingSelahiyyet = false;
    }
  }

  const auditData = [
    {
      user: "Ramin Orucov",
      position: "Designer",
      company: "Üzv müəssisələr > Capital Finance LLC",
      action: "Create",
      date: "12.12.2022 - 09:23:12",
    },
    {
      user: "Ramin Orucov",
      position: "Designer",
      company: "İstifadəçi hovuzu > Əli Ağayev",
      action: "Düzəliş",
      date: "12.12.2022 - 09:23:12",
    },
    {
      user: "İbrahim Feyzullazadə",
      position: "Baş mühasib",
      company: "Hesabatqramar > Üzv müəssisələr > Capital Finance LLC",
      action: "Düzəliş",
      date: "12.12.2022 - 09:23:12",
    },
    {
      user: "Əli Əliyev",
      position: "Mühasib",
      company: "İstifadəçi hovuzu > Ramin Orucov",
      action: "Silinmə",
      date: "12.12.2022 - 09:23:12",
    },
  ];

  initializeTable();

  window.switchTab = function (tabName) {
    currentTab = tabName;
    updateTabStyles(tabName);
    showTabButtons(tabName);
    updateContentVisibility(tabName);
    updateBackgroundColor(tabName);
    updateStatsVisibility(tabName);

    if (tabName === "aktiv") {
      initializeTable();
    } else if (tabName === "vezifeler") {
      fetchVezifelerData();
    } else if (tabName === "selahiyyet") {
      fetchSelahiyyetData();
    } else if (tabName === "rekvizitler") {
      loadRekvizitler();
    } else if (tabName === "audit") {
      loadAuditLogs();
    }
    $("#main-controls").show();
    $("#aktiv-selection-controls").hide();
    $("#vezifeler-audit-selection-controls").hide();
  };

  function showTabButtons(tabName) {
    $(".tab-buttons").hide();

    switch (tabName) {
      case "aktiv":
        $("#aktiv-buttons").show();
        break;
      case "vezifeler":
        $("#vezifeler-buttons").show();
        break;
      case "selahiyyet":
        $("#selahiyyet-buttons").show();
        break;
      case "rekvizitler":
        $("#rekvizitler-buttons").show();
        break;
      case "audit":
        $("#audit-buttons").show();
        break;
    }
  }

  function updateTabStyles(activeTab) {
    $("#aktivButton")
      .removeClass("bg-inverse-on-surface text-black")
      .addClass("text-messages opacity-50");
    $("#vezifelerSpan")
      .removeClass("bg-inverse-on-surface text-black")
      .addClass("text-messages opacity-50");
    $("#selahiyyetSpan")
      .removeClass("bg-inverse-on-surface text-black")
      .addClass("text-messages opacity-50");
    $("#rekvizitlerSpan")
      .removeClass("bg-inverse-on-surface text-black")
      .addClass("text-messages opacity-50");
    $("#auditSpan")
      .removeClass("bg-inverse-on-surface text-black")
      .addClass("text-messages opacity-50");

    if (activeTab === "aktiv") {
      $("#aktivButton")
        .addClass("bg-inverse-on-surface text-black")
        .removeClass("text-messages opacity-50");
    } else if (activeTab === "vezifeler") {
      $("#vezifelerSpan")
        .addClass("bg-inverse-on-surface text-black")
        .removeClass("text-messages opacity-50");
    } else if (activeTab === "selahiyyet") {
      $("#selahiyyetSpan")
        .addClass("bg-inverse-on-surface text-black")
        .removeClass("text-messages opacity-50");
    } else if (activeTab === "rekvizitler") {
      $("#rekvizitlerSpan")
        .addClass("bg-inverse-on-surface text-black")
        .removeClass("text-messages opacity-50");
    } else if (activeTab === "audit") {
      $("#auditSpan")
        .addClass("bg-inverse-on-surface text-black")
        .removeClass("text-messages opacity-50");
    }
  }

  function updateStatsVisibility(tabName) {
    const statsContainer = $(".py-3.rounded-lg.h-\\[69px\\].mb-4");
    if (tabName === "audit") {
      statsContainer.show();
    } else {
      statsContainer.hide();
    }
  }

  function updateBackgroundColor(tabName) {
    const mainContent = $("#mainContent");
    if (tabName === "rekvizitler") {
      mainContent.css("background-color", "#FAFAFA");
    } else {
      mainContent.css("background-color", "");
    }
  }

  function updateContentVisibility(tabName) {
    $("#mainTablesContainer").toggle(
      tabName === "aktiv" || tabName === "vezifeler" || tabName === "selahiyyet"
    );
    $("#rekvizitlerContent").toggle(tabName === "rekvizitler");
    $("#auditContent").toggle(tabName === "audit");
  }

  let searchTimeout;
  $("#aktiv-search").on("keyup", function () {
    if (currentTab === "aktiv") {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchAktivData(1);
      }, 500);
    }
  });

  $("#aktiv-refresh").on("click", function () {
    if (currentTab === "aktiv") {
      $("#aktiv-search").val("");
      fetchAktivData(1);
    }
  });

  $("#aktiv-filter").on("click", function () {
    openAktivFilterModal();
  });

  $("#aktiv-new-user").on("click", function () {
    openCreateModal();
  });

  let vezifelerSearchTimeout;
  $("#vezifeler-search").on("keyup", function () {
    if (currentTab === "vezifeler") {
      clearTimeout(vezifelerSearchTimeout);
      vezifelerSearchTimeout = setTimeout(() => {
        fetchVezifelerData(); // Backend search
      }, 500);
    }
  });

  $("#vezifeler-refresh").on("click", function () {
    if (currentTab === "vezifeler") {
      $("#vezifeler-search").val("");
      fetchVezifelerData();
    }
  });

  $("#vezifeler-new-position").on("click", function () {
    openNewPositionModal();
  });

  let selahiyyetSearchTimeout;
  $("#selahiyyet-search").on("keyup", function () {
    if (currentTab === "selahiyyet") {
      clearTimeout(selahiyyetSearchTimeout);
      selahiyyetSearchTimeout = setTimeout(() => {
        fetchSelahiyyetData();
      }, 500);
    }
  });

  $("#selahiyyet-refresh").on("click", function () {
    if (currentTab === "selahiyyet") {
      $("#selahiyyet-search").val("");
      fetchSelahiyyetData();
    }
  });

  $("#selahiyyet-filter").on("click", function () {
    openSelahiyyetFilterModal();
  });

  $("#selahiyyet-new-group").on("click", function () {
    openNewGroupModal();
  });

  // Audit tab handlers
  let auditSearchTimeout;
  $("#audit-search").on("keyup", function () {
    const searchValue = $(this).val();

    // Clear previous timeout
    if (auditSearchTimeout) {
      clearTimeout(auditSearchTimeout);
    }

    // Debounce search - wait 500ms after user stops typing
    auditSearchTimeout = setTimeout(() => {
      if (currentTab === "audit") {
        loadAuditLogs({ search: searchValue });
      }
    }, 500);
  });

  $("#audit-refresh").on("click", function () {
    // Refresh audit data
    if (currentTab === "audit") {
      window.location.reload();
      // $("#audit-search").val("");
      // loadAuditLogs();
    }
  });

  $("#audit-filter").on("click", function () {
    openAuditFilterModal();
  });

  $("#audit-excel-export").on("click", function () {
    exportAuditToExcel();
  });

  // Audit checkbox select all
  $("#auditCheckboxAll").on("change", function () {
    const isChecked = $(this).is(":checked");
    $(".audit-checkbox").prop("checked", isChecked);
  });

  // Rekvizitler functions
  window.loadRekvizitler = async function () {
    try {
      const response = await fetch("/api/avankart/rekvizit", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        displayRekvizitler(result);
      } else {
        console.error("Failed to load rekvizitler:", result.message);
      }
    } catch (error) {
      console.error("Error loading rekvizitler:", error);
    }
  };

  function displayRekvizitler(response) {
    const emptyState = $("#rekvizitlerEmptyState");
    const tableContainer = $("#rekvizitlerTableContainer");

    // Extract data from response
    const rekvizitler = response.success ? response.data : [];

    console.log("Displaying rekvizitler:", rekvizitler.length);

    if (rekvizitler.length === 0) {
      // Show empty state
      emptyState.removeClass("hidden");
      tableContainer.addClass("hidden");
    } else {
      // Show cards with data
      emptyState.addClass("hidden");
      tableContainer.removeClass("hidden");

      // Create header with total count
      const header = `
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-[15px] font-medium text-messages bg-whitedark:text-primary-text-color-dark">
            Rekvizitlər (${rekvizitler.length})
          </h3>
          <button id="openRekvizitModalBtn2" class="w-[165px] h-[34px] bg-primary rounded-[100px] flex justify-center items-center gap-2.5 cursor-pointer hover:bg-hover-button transition-colors">
            <div class="icon stratis-plus-02 text-on-primary !w-[8px] !h-[8px]"></div>
            <div class="text-on-primary font-medium text-[13px]">Rekvizit əlavə et</div>
          </button>
        </div>
      `;

      // Create cards for each rekvizit
      const cards = rekvizitler
        .map((rek) => {
          return `
            <div class="bg-sidebar-bg dark:bg-side-bar-bg-dark border-r-[0.5px] border-stroke dark:border-[#FFFFFF1A] text-secondary-text dark:text-secondary-text-color-dark rounded-lg p-6 mb-4 relative">
              <!-- Edit Button -->
              <button onclick="editRekvizit('${rek._id}')" 
                      class="absolute top-4 right-4 flex items-center gap-2 text-primary hover:text-hover-button transition-colors" 
                      title="Redaktə et">
                <i class="icon stratis-edit-02 w-4 h-4"></i>
                <span class="text-[13px] font-medium">Redaktə et</span>
              </button>

              <!-- Two Column Layout -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <!-- Left Column -->
                <div class="space-y-4">
                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Şirkətin adı
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.company_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Bankın adı
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.bank_info?.bank_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Swift
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.bank_info?.swift || "-"}
                    </p>
                  </div>

                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Hesablaşma hesabı
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.bank_info?.settlement_account || "-"}
                    </p>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-4">
                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Hüquqi ünvan
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.huquqi_unvan || rek.legal_address || "-"}
                    </p>
                  </div>

                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Bankın kodu
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.bank_info?.bank_code || "-"}
                    </p>
                  </div>

                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Müxbir hesabı
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.bank_info?.muxbir_hesabi || rek.bank_info?.correspondent_account || "-"}
                    </p>
                  </div>

                  <div>
                    <p class="text-[12px] text-messages dark:text-secondary-text-color-dark opacity-65 mb-1">
                      Vöen
                    </p>
                    <p class="text-[13px] font-medium text-messages dark:text-primary-text-color-dark">
                      ${rek.voen || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      tableContainer.html(header + cards);
    }
  }

  // Edit rekvizit function
  window.editRekvizit = async function (id) {
    try {
      // Fetch the rekvizit data
      const response = await fetch(`/api/avankart/rekvizit/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        const rek = result.data;

        // Populate the form with existing data
        document.querySelector(
          '#rekvizitForm input[name="company_name"]'
        ).value = rek.company_name || "";
        document.querySelector('#rekvizitForm input[name="bank_name"]').value =
          rek.bank_info?.bank_name || "";
        document.querySelector('#rekvizitForm input[name="swift"]').value =
          rek.bank_info?.swift || "";
        document.querySelector(
          '#rekvizitForm input[name="settlement_account"]'
        ).value = rek.bank_info?.settlement_account || "";
        document.querySelector(
          '#rekvizitForm input[name="legal_address"]'
        ).value = rek.legal_address || rek.huquqi_unvan || "";
        document.querySelector('#rekvizitForm input[name="bank_code"]').value =
          rek.bank_info?.bank_code || "";
        document.querySelector(
          '#rekvizitForm input[name="correspondent_account"]'
        ).value =
          rek.bank_info?.correspondent_account ||
          rek.bank_info?.muxbir_hesabi ||
          "";
        document.querySelector('#rekvizitForm input[name="voen"]').value =
          rek.voen || "";

        // Store the ID for update
        document.getElementById("rekvizitForm").dataset.editId = id;

        // Change modal title
        document.querySelector("#rekvizitModal h1").textContent =
          "Rekviziti redaktə et";

        // Open the modal
        document.getElementById("rekvizitModal").classList.remove("hidden");
      } else {
        alert("Rekvizit məlumatları tapılmadı");
      }
    } catch (error) {
      console.error("Error fetching rekvizit:", error);
      alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    }
  };

  // Delete rekvizit function
  window.deleteRekvizit = async function (id) {
    if (!confirm("Bu rekviziti silmək istədiyinizdən əminsiniz?")) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/avankart/rekvizit/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert("Rekvizit uğurla silindi");
        loadRekvizitler(); // Reload the list
      } else {
        alert("Xəta baş verdi: " + (result.message || "Bilinməyən xəta"));
      }
    } catch (error) {
      console.error("Error deleting rekvizit:", error);
      alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    }
  };

  // ============== AUDIT FUNCTIONS ==============

  // Load audit logs
  window.loadAuditLogs = async function (filters = {}) {
    try {
      const csrfToken = await getCsrfToken();

      // Build query params
      const queryParams = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 10,
      });

      if (filters.action) queryParams.append("action", filters.action);
      if (filters.resource) queryParams.append("resource", filters.resource);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(`/api/avankart/audit?${queryParams}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      const result = await response.json();

      if (result.success) {
        displayAuditTable(result.data, result.pagination);
      } else {
        console.error("Audit logları alınmadı:", result.message);
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    }
  };

  // Display audit logs in table
  function displayAuditTable(audits, pagination) {
    const tbody = $("#auditTableBody");
    tbody.empty();

    if (!audits || audits.length === 0) {
      tbody.html(`
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px;" class="text-messages dark:text-white">
            Audit loqu tapılmadı
          </td>
        </tr>
      `);
      return;
    }

    audits.forEach((audit) => {
      // Format action type with color
      let actionText = "";
      let actionColor = "";
      let actionBgColor = "";

      switch (audit.action) {
        case "CREATE":
          actionText = "Create";
          actionColor = "text-blue-600";
          actionBgColor = "bg-blue-100 dark:bg-blue-900/30";
          break;
        case "UPDATE":
          actionText = "Düzəliş";
          actionColor = "text-orange-600";
          actionBgColor = "bg-orange-100 dark:bg-orange-900/30";
          break;
        case "DELETE":
          actionText = "Silinmə";
          actionColor = "text-red-600";
          actionBgColor = "bg-red-100 dark:bg-red-900/30";
          break;
        case "APPROVE":
          actionText = "Təsdiqlənib";
          actionColor = "text-green-600";
          actionBgColor = "bg-green-100 dark:bg-green-900/30";
          break;
        case "READ":
          actionText = "Təsdiqlənib";
          actionColor = "text-green-600";
          actionBgColor = "bg-green-100 dark:bg-green-900/30";
          break;
        default:
          actionText = audit.action;
          actionColor = "text-gray-600";
          actionBgColor = "bg-gray-100 dark:bg-gray-900/30";
      }

      // Format date
      const date = new Date(audit.createdAt);
      const formattedDate = date.toLocaleDateString("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("az-AZ", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Get user initials for avatar
      const initials = (audit.user_name || "NA")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

      // Generate avatar background color based on user name
      const colors = [
        "bg-purple-200",
        "bg-blue-200",
        "bg-green-200",
        "bg-yellow-200",
        "bg-pink-200",
        "bg-indigo-200",
      ];
      const colorIndex = (audit.user_name || "").length % colors.length;
      const avatarColor = colors[colorIndex];

      const row = `
        <tr class="hover:bg-container-2 dark:hover:bg-table-hover-dark transition-colors border-b border-stroke/30 dark:border-[#ffffff1A]">
          <td class="px-4 py-3">
            <input type="checkbox" class="audit-checkbox peer hidden" id="audit-${audit._id}" data-id="${audit._id}" />
            <label for="audit-${audit._id}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
              <div class="icon stratis-check-01 scale-60"></div>
            </label>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="${avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-medium text-messages">
                ${initials}
              </div>
              <span class="text-messages dark:text-white font-normal">${audit.user_name || "N/A"}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-messages dark:text-white">${audit.user_position || "N/A"}</td>
          <td class="px-4 py-3 text-messages dark:text-white">${audit.page || audit.path || "N/A"}</td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${actionColor} ${actionBgColor}">
              <span class="w-1.5 h-1.5 rounded-full ${actionColor.replace("text-", "bg-")}"></span>
              ${actionText}
            </span>
          </td>
          <td class="px-4 py-3 text-messages dark:text-white">${formattedDate} - ${formattedTime}</td>
        </tr>
      `;

      tbody.append(row);
    });

    // Update pagination info
    if (pagination) {
      $("#auditPaginationInfo").text(
        `Səhifə ${pagination.page} / ${pagination.pages} (Toplam: ${pagination.total})`
      );
    }
  }

  // View audit details
  window.viewAuditDetails = async function (auditId) {
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/avankart/audit/${auditId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      const result = await response.json();

      if (result.success) {
        // Display details in modal
        const audit = result.data;
        let detailsHTML = `
          <div class="audit-details">
            <p><strong>İstifadəçi:</strong> ${audit.user_name || "N/A"}</p>
            <p><strong>Vəzifə:</strong> ${audit.user_position || "N/A"}</p>
            <p><strong>Səhifə:</strong> ${audit.page || audit.path || "N/A"}</p>
            <p><strong>Əməliyyat:</strong> ${audit.action}</p>
            <p><strong>Resurс:</strong> ${audit.resource || "N/A"}</p>
            <p><strong>Tarix:</strong> ${new Date(audit.createdAt).toLocaleString("az-AZ")}</p>
            <p><strong>IP Ünvan:</strong> ${audit.ip_address || "N/A"}</p>
        `;

        if (audit.details) {
          detailsHTML += `<p><strong>Ətraflı:</strong> ${JSON.stringify(audit.details, null, 2)}</p>`;
        }

        detailsHTML += `</div>`;

        // Show in a modal or alert (you can customize this)
        alert(detailsHTML.replace(/<[^>]*>/g, "\n"));
      } else {
        alert("Audit məlumatı tapılmadı");
      }
    } catch (error) {
      console.error("Error viewing audit details:", error);
      alert("Xəta baş verdi");
    }
  };

  // Bulk delete audit logs
  window.bulkDeleteAuditLogs = async function () {
    const selectedIds = [];
    $(".audit-checkbox:checked").each(function () {
      selectedIds.push($(this).data("id"));
    });

    if (selectedIds.length === 0) {
      alert("Zəhmət olmasa ən azı bir audit loqu seçin");
      return;
    }

    if (
      !confirm(
        `${selectedIds.length} audit loqu silinəcək. Davam etmək istəyirsiniz?`
      )
    ) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/avankart/audit/bulk", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        loadAuditLogs(); // Reload the table
      } else {
        alert("Xəta baş verdi: " + (result.message || "Bilinməyən xəta"));
      }
    } catch (error) {
      console.error("Error deleting audit logs:", error);
      alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    }
  };

  // Export audit logs to Excel
  window.exportAuditToExcel = async function () {
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/avankart/audit/export", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Convert to Excel using SheetJS or similar
        // For now, let's create a simple CSV
        const audits = result.data;
        let csvContent = "İstifadəçi,Vəzifə,Səhifə,Əməliyyat,Tarix\n";

        audits.forEach((audit) => {
          const date = new Date(audit.createdAt).toLocaleString("az-AZ");
          csvContent += `"${audit.user_name || ""}","${audit.user_position || ""}","${audit.page || audit.path || ""}","${audit.action}","${date}"\n`;
        });

        // Create download link
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `audit_logs_${new Date().getTime()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert("Audit logları uğurla yükləndi");
      } else {
        alert("Xəta baş verdi: " + (result.message || "Bilinməyən xəta"));
      }
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    }
  };

  // ============== END AUDIT FUNCTIONS ==============

  function handleAuditExcelExport() {
    $("#excelExportModal").show();
    $("#overlay").show();
  }

  async function initializeTable() {
    if (currentTable) {
      currentTable.destroy();
      if (currentTab === "audit") {
        $("#auditTable").empty();
      } else {
        $("#myTable").empty();
      }
    }

    let columns, data, tableHtml, tableId;

    switch (currentTab) {
      case "aktiv":
        columns = getAktivColumns();
        data = aktivData;
        tableHtml = getAktivTableHtml();
        tableId = "#myTable";
        break;
      case "vezifeler":
        columns = getVezifelerColumns();
        data = vezifelerData;
        tableHtml = getVezifelerTableHtml();
        tableId = "#myTable";
        break;
      case "selahiyyet":
        columns = getSelahiyyetColumns();
        data = selahiyyetData;
        tableHtml = getSelahiyyetTableHtml();
        tableId = "#myTable";
        break;
      case "audit":
        columns = getAuditColumns();
        data = auditData;
        tableHtml = getAuditTableHtml();
        tableId = "#auditTable";
        break;
    }

    $(tableId).html(tableHtml);
    createDataTable(columns, data, tableId);
  }

  window.closeAktivFilterModal = function () {
    $("#aktivFilterModal").hide();
    $("#overlay").hide();
  };

  window.closeSelahiyyetFilterModal = function () {
    $("#selahiyyetFilterModal").hide();
    $("#overlay").hide();
  };

  window.closeAuditFilterModal = function () {
    $("#auditFilterModal").hide();
    $("#overlay").hide();
  };

  window.closeAuditExcelModal = function () {
    $("#auditExcelExportModal").hide();
    $("#overlay").hide();
  };

  function openAktivFilterModal() {
    loadAktivFilterOptions();
    $("#aktivFilterModal").show();
    $("#overlay").show();
  }

  async function loadAktivFilterOptions() {
    try {
      // Load users
      const usersRes = await fetch(
        "/avankart-profile/api/users?page=1&limit=100"
      );
      const usersData = await usersRes.json();
      if (usersData.success) {
        const usersHtml = usersData.data
          .map(
            (u) => `
          <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
            <input type="checkbox" id="user-${u._id}" class="aktiv-users-checkbox peer hidden" value="${u._id}" />
            <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
              <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span class="dark:text-white">${u.fullName}</span>
          </label>
        `
          )
          .join("");
        $("#aktiv-users-dropdown").html(usersHtml);
      }

      const dutiesRes = await fetch("/avankart-profile/api/duties");
      const dutiesData = await dutiesRes.json();
      if (dutiesData.success) {
        const dutiesHtml = dutiesData.data
          .map(
            (d) => `
          <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
            <input type="checkbox" id="duty-${d.id}" class="aktiv-duty-checkbox peer hidden" value="${d.id}" />
            <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
              <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span class="dark:text-white">${d.name}</span>
          </label>
        `
          )
          .join("");
        $("#aktiv-duty-dropdown").html(dutiesHtml);
      }

      const permsRes = await fetch("/avankart-profile/api/permission-groups");
      const permsData = await permsRes.json();
      if (permsData.success) {
        const permsHtml = permsData.data
          .map(
            (p) => `
          <label class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
            <input type="checkbox" id="perm-${p.id}" class="aktiv-permission-checkbox peer hidden" value="${p.id}" />
            <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
              <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span class="dark:text-white">${p.name}</span>
          </label>
        `
          )
          .join("");
        $("#aktiv-permission-dropdown").html(permsHtml);
      }
    } catch (error) {
      console.error("Filter options yüklənərkən xəta:", error);
    }
  }

  window.toggleAktivUsersDropdown = function () {
    $("#aktiv-users-dropdown").toggleClass("hidden");
  };

  window.toggleAktivDutyDropdown = function () {
    $("#aktiv-duty-dropdown").toggleClass("hidden");
  };

  window.toggleAktivPermissionDropdown = function () {
    $("#aktiv-permission-dropdown").toggleClass("hidden");
  };

  window.clearAktivFilters = function () {
    $('input[id^="aktiv-gender-"]').prop("checked", false);
    $('input[id^="aktiv-status-"]').prop("checked", false);
    $(".aktiv-users-checkbox").prop("checked", false);
    $(".aktiv-duty-checkbox").prop("checked", false);
    $(".aktiv-permission-checkbox").prop("checked", false);
  };

  window.applyAktivFilters = function () {
    const filters = {
      users: $(".aktiv-users-checkbox:checked")
        .map(function () {
          return $(this).val();
        })
        .get(),
      genders: $('input[id^="aktiv-gender-"]:checked')
        .map(function () {
          return $(this).val();
        })
        .get(),
      statuses: $('input[id^="aktiv-status-"]:checked')
        .map(function () {
          return $(this).val();
        })
        .get(),
      duties: $(".aktiv-duty-checkbox:checked")
        .map(function () {
          return $(this).val();
        })
        .get(),
      permissions: $(".aktiv-permission-checkbox:checked")
        .map(function () {
          return $(this).val();
        })
        .get(),
    };

    closeAktivFilterModal();

    fetchAktivDataWithFilters(filters);
  };

  async function fetchAktivDataWithFilters(filters) {
    try {
      const searchVal = $("#aktiv-search").val() || "";
      const params = new URLSearchParams({
        page: 1,
        limit: 10,
        search: searchVal,
      });

      if (filters.users && filters.users.length > 0)
        params.append("users", filters.users.join(","));
      if (filters.genders && filters.genders.length > 0)
        params.append("genders", filters.genders.join(","));
      if (filters.statuses && filters.statuses.length > 0)
        params.append("statuses", filters.statuses.join(","));
      if (filters.duties && filters.duties.length > 0)
        params.append("duties", filters.duties.join(","));
      if (filters.permissions && filters.permissions.length > 0)
        params.append("permissions", filters.permissions.join(","));

      const res = await fetch(
        `/avankart-profile/api/users?${params.toString()}`
      );
      const json = await res.json();

      if (json.success) {
        aktivData = json.data;
        aktivPagination = {
          page: json.page,
          pages: json.pages,
          total: json.total,
          limit: json.limit,
        };
        if (currentTab === "aktiv") {
          initializeTable();
          updatePaginationUI();
        }
      }
    } catch (err) {
      console.error("Filterlənmiş data fetch xətası:", err);
    }
  }

  function openSelahiyyetFilterModal() {
    loadSelahiyyetTypeOptions();
    $("#selahiyyetFilterModal").show();
    $("#overlay").show();
  }

  async function loadSelahiyyetTypeOptions() {
    try {
      const res = await fetch("/avankart-profile/api/permission-types");
      const json = await res.json();

      if (json.success && json.data) {
        const typesHtml = json.data
          .map(
            (type) => `
          <label for="selahiyyet-type-${type.value}" class="flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark">
            <input type="checkbox" id="selahiyyet-type-${type.value}" class="selahiyyet-type-checkbox peer hidden" value="${type.value}" />
            <div class="w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
              <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span class="dark:text-white">${type.text}</span>
          </label>
        `
          )
          .join("");
        $("#selahiyyet-type-dropdown").html(typesHtml);
      }
    } catch (error) {
      console.error("Səlahiyyət növləri yüklənərkən xəta:", error);
    }
  }

  window.toggleSelahiyyetTypeDropdown = function () {
    $("#selahiyyet-type-dropdown").toggleClass("hidden");
  };

  window.closeSelahiyyetFilterModal = function () {
    $("#selahiyyetFilterModal").hide();
    $("#overlay").hide();
  };

  window.clearSelahiyyetFilters = function () {
    $("#selahiyyet-start-date").val("");
    $("#selahiyyet-end-date").val("");
    $("#selahiyyet-min-users").val("");
    $("#selahiyyet-max-users").val("");
    $(".selahiyyet-type-checkbox").prop("checked", false);
  };

  window.applySelahiyyetFilters = function () {
    const filters = {
      startDate: $("#selahiyyet-start-date").val(),
      endDate: $("#selahiyyet-end-date").val(),
      minUsers: $("#selahiyyet-min-users").val(),
      maxUsers: $("#selahiyyet-max-users").val(),
      types: $(".selahiyyet-type-checkbox:checked")
        .map(function () {
          return $(this).val();
        })
        .get(),
    };

    closeSelahiyyetFilterModal();

    fetchSelahiyyetDataWithFilters(filters);
  };

  async function fetchSelahiyyetDataWithFilters(filters) {
    try {
      const searchVal = $("#selahiyyet-search").val() || "";
      const params = new URLSearchParams({
        page: 1,
        limit: 100,
        search: searchVal,
      });

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.minUsers) params.append("minUsers", filters.minUsers);
      if (filters.maxUsers) params.append("maxUsers", filters.maxUsers);
      if (filters.types.length > 0)
        params.append("types", filters.types.join(","));

      const res = await fetch(
        `/avankart-profile/api/permission-groups-table?${params.toString()}`
      );
      const json = await res.json();

      if (json.success) {
        selahiyyetData = json.data;
        if (currentTab === "selahiyyet") {
          initializeTable();
        }
      }
    } catch (error) {
      console.error("❌ Filter xətası:", error);
    }
  }

  function openAuditFilterModal() {
    // Load filter options
    loadAuditFilterOptions();
    $("#auditFilterModal").show();
    $("#overlay").show();
  }

  // Load filter dropdown options
  async function loadAuditFilterOptions() {
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/avankart/audit?limit=1000", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Get unique users
        const users = [
          ...new Set(result.data.map((audit) => audit.user_name)),
        ].filter(Boolean);
        const userSelect = $("#auditFilterUser");
        userSelect.find("option:not(:first)").remove();
        users.forEach((user) => {
          userSelect.append(`<option value="${user}">${user}</option>`);
        });

        // Get unique pages
        const pages = [
          ...new Set(result.data.map((audit) => audit.page || audit.path)),
        ].filter(Boolean);
        const pageSelect = $("#auditFilterPage");
        pageSelect.find("option:not(:first)").remove();
        pages.forEach((page) => {
          pageSelect.append(`<option value="${page}">${page}</option>`);
        });
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  }

  // Apply audit filters
  window.applyAuditFilters = function () {
    const filters = {
      user_name: $("#auditFilterUser").val(),
      page: $("#auditFilterPage").val(),
      startDate: $("#auditFilterStartDate").val(),
      endDate: $("#auditFilterEndDate").val(),
      actions: [],
    };

    // Get checked action types
    $('input[name="auditActionType"]:checked').each(function () {
      filters.actions.push($(this).val());
    });

    // Build filter object for API
    const apiFilters = {};

    if (filters.user_name) {
      apiFilters.search = filters.user_name;
    }

    if (filters.page) {
      apiFilters.search = filters.page; // Page search is also handled by search param
    }

    if (filters.startDate) {
      apiFilters.startDate = filters.startDate;
    }

    if (filters.endDate) {
      apiFilters.endDate = filters.endDate;
    }

    // Support multiple actions as comma-separated string
    if (filters.actions.length > 0) {
      apiFilters.action = filters.actions.join(",");
    }

    // Store current filters globally for pagination
    window.currentAuditFilters = apiFilters;

    // Load filtered data
    loadAuditLogs(apiFilters);

    // Show active filter indicator
    updateFilterIndicator(filters);

    // Close modal
    closeAuditFilterModal();
  };

  // Update filter indicator
  function updateFilterIndicator(filters) {
    let filterCount = 0;

    if (filters.user_name) filterCount++;
    if (filters.page) filterCount++;
    if (filters.startDate) filterCount++;
    if (filters.endDate) filterCount++;
    if (filters.actions.length > 0) filterCount += filters.actions.length;

    const badge = $("#audit-filter-badge");

    if (filterCount > 0) {
      badge.text(filterCount).removeClass("hidden").addClass("flex");
      $("#audit-filter").addClass("border-primary");
    } else {
      badge.addClass("hidden").removeClass("flex");
      $("#audit-filter").removeClass("border-primary");
    }
  }

  // Clear audit filters
  window.clearAuditFilters = function () {
    $("#auditFilterUser").val("");
    $("#auditFilterPage").val("");
    $("#auditFilterStartDate").val("");
    $("#auditFilterEndDate").val("");
    $('input[name="auditActionType"]').prop("checked", false);

    // Clear stored filters
    window.currentAuditFilters = {};

    // Remove filter indicator
    $("#audit-filter-badge").addClass("hidden").removeClass("flex");
    $("#audit-filter").removeClass("border-primary");

    // Reload without filters
    loadAuditLogs();

    // Close modal
    closeAuditFilterModal();
  };

  function handleAuditExcelExport() {
    $("#auditExcelExportModal").show();
    $("#overlay").show();
  }

  function getAktivTableHtml() {
    return `
        <thead class="border-none pb-0.5">
          <tr class="bg-container-2 p-4 border-none text-xs text-tertiary-text font-base !h-[40px] dark:bg-table-hover-dark dark:text-white">
            <th class="w-[58px] border-r-[.5px] border-r-stroke px-4 py-2 rounded-l-lg">
              <input type="checkbox" id="mainCheckbox-aktiv" class="peer hidden" />
              <label for="mainCheckbox-aktiv" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            </th>
            <th class="w-[20%] px-4 filtering">Ad və soyad</th>
            <th class="w-[8%] px-4 filtering">Cinsi</th>
            <th class="w-[12%] px-4 filtering">Vəzifəsi</th>
            <th class="w-[15%] px-4 filtering">Səlahiyyət qrupu</th>
            <th class="w-[15%] px-4 filtering">Email</th>
            <th class="w-[12%] px-4 filtering">Telefon nömrəsi</th>
            <th class="w-[10%] px-4 filtering">Başlama tarixi</th>
            <th class="w-[8%] px-4 rounded-r-lg">Status</th>
          </tr>
        </thead>
        <tbody class="font-base text-xs"></tbody>
      `;
  }

  function getVezifelerTableHtml() {
    return `
        <thead class="border-none pb-0.5">
          <tr class="bg-container-2 p-4 border-none text-xs text-tertiary-text font-base !h-[40px] dark:bg-table-hover-dark dark:text-white">
            <th class="w-[58px] border-r-[.5px] border-r-stroke px-4 py-2 rounded-l-lg">
              <input type="checkbox" id="mainCheckbox-vezife" class="peer hidden" />
              <label for="mainCheckbox-vezife" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            </th>
            <th class="w-[30%] px-4 filtering">Vəzifə adı</th>
            <th class="w-[20%] px-4 text-center filtering">Vəzifədə olan şəxslər</th>
            <th class="w-[25%] px-4 filtering">Yaradan şəxs</th>
            <th class="w-[25%] px-4 rounded-r-lg filtering">Yaranma tarixi</th>
          </tr>
        </thead>
        <tbody class="font-base text-xs"></tbody>
      `;
  }

  function getSelahiyyetTableHtml() {
    return `
        <thead class="border-none pb-0.5">
          <tr class="bg-container-2 p-4 border-none text-xs text-tertiary-text font-base !h-[40px] dark:bg-table-hover-dark dark:text-white">
            <th class="w-[58px] border-r-[.5px] border-r-stroke px-4 py-2 rounded-l-lg">
              <div class="cursor-not-allowed bg-[#0000001A] border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center mx-auto">
                <div class="icon stratis-check-01 scale-60"></div>
              </div>
            </th>
            <th class="w-[30%] px-4 filtering">Qrup adı</th>
            <th class="w-[20%] px-4 filtering">İcazələr</th>
            <th class="w-[15%] px-4 filtering">Səxs sayı</th>
            <th class="w-[35%] px-4 rounded-r-lg filtering">Qrupun yaranma tarixi</th>
          </tr>
        </thead>
        <tbody class="font-base text-xs"></tbody>
      `;
  }

  function getAuditTableHtml() {
    return `
        <thead class="border-none pb-0.5">
          <tr class="bg-container-2 p-4 border-none text-xs text-tertiary-text font-base !h-[40px] dark:bg-table-hover-dark dark:text-white">
            <th class="w-[58px] border-r-[.5px] border-r-stroke px-4 py-2 rounded-l-lg">
              <input type="checkbox" id="mainCheckbox-audit" class="peer hidden" />
              <label for="mainCheckbox-audit" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            </th>
            <th class="w-[20%] px-4 filtering">İstifadəçi</th>
            <th class="w-[15%] px-4 filtering">Vəzifə</th>
            <th class="w-[25%] px-4 filtering">Şirkət</th>
            <th class="w-[15%] px-4 filtering">Əməliyyatın növü</th>
            <th class="w-[25%] px-4 filtering rounded-r-lg">Əməliyyatın həyata keçirilmə tarixi</th>
          </tr>
        </thead>
        <tbody class="font-base text-xs"></tbody>
      `;
  }

  function getAktivColumns() {
    return [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
              <input type="checkbox" id="cb-aktiv-${idx}" class="row-checkbox peer hidden">
              <label for="cb-aktiv-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            `;
        },
      },
      {
        data: function (row) {
          const avatarImg = row.avatar
            ? `<img src="${row.avatar}" alt="Avatar" class="w-12 h-12 rounded-full object-cover" />`
            : `<div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                 ${row.initials || "?"}
               </div>`;
          return `
              <div class="flex items-center gap-3">
                ${avatarImg}
                <div class="flex flex-col">
                  <span class="text-messages text-[13px] font-medium dark:text-white">${row.fullName || ""}</span>
                </div>
              </div>
            `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.gender || ""}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.position || "-"}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.authorityGroup || "-"}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.email || "-"}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.phone || "-"}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.startDate || "-"}</span>`;
        },
      },
      {
        data: function (row) {
          let color = "";
          switch (row.status) {
            case "Aktiv":
              color = "bg-[#66BB6A]";
              break;
            case "Deaktiv":
              color = "bg-[#EF5350]";
              break;
            case "Tamamlandı":
              color = "bg-[#66BB6A]";
              break;
            case "Gözləyir":
              color = "bg-[#FFCA28]";
              break;
            case "Report edildi":
              color = "bg-[#EF5350]";
              break;
            default:
              color = "bg-[#FF7043]";
          }
          return `
              <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                 <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                 <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status || ""}</span>
              </div>
            `;
        },
      },
      {
        orderable: false,
        data: function (row, type, set, meta) {
          return getDropdownHtml(meta.row, "aktiv");
        },
      },
    ];
  }

  async function fetchAktivData(page = 1) {
    try {
      const searchVal = $("#aktiv-search").val() || "";
      const res = await fetch(
        `/avankart-profile/api/users?page=${page}&limit=10&search=${encodeURIComponent(searchVal)}`
      );
      const json = await res.json();
      if (json.success) {
        aktivData = json.data;
        aktivPagination = {
          page: json.page,
          pages: json.pages,
          total: json.total,
          limit: json.limit,
        };
        if (currentTab === "aktiv") {
          initializeTable();
          updatePaginationUI();
        }
      }
    } catch (err) {
      console.error("Aktiv data fetch error", err);
    }
  }

  function updatePaginationUI() {
    $("#pageCount").text(`${aktivPagination.page} / ${aktivPagination.pages}`);
  }

  const originalChangePage = window.changePage;
  window.changePage = function (page) {
    if (currentTab === "aktiv") {
      fetchAktivData(page + 1);
    } else if (originalChangePage) {
      originalChangePage(page);
    }
  };

  fetchAktivData(1);

  function getVezifelerColumns() {
    return [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
              <input type="checkbox" id="cb-vezife-${idx}" class="row-checkbox peer hidden">
              <label for="cb-vezife-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<div class="text-center"><span class="text-[13px] text-messages font-normal dark:text-white">${row.userCount}</span></div>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.createdBy}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.createdDate}</span>`;
        },
      },
      {
        orderable: false,
        data: function (row, type, set, meta) {
          return getDropdownHtml(meta.row, "vezifeler");
        },
      },
    ];
  }

  function getSelahiyyetColumns() {
    return [
      {
        orderable: false,
        data: function () {
          return `
              <div class="cursor-not-allowed bg-[#0000001A] border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center mx-auto">
                <div class="icon stratis-check-01 scale-60"></div>
              </div>
            `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.permissions}</span>`;
        },
      },
      {
        data: function (row) {
          return `<div class="text-center"><span class="text-[13px] text-messages font-normal dark:text-white">${row.userCount}</span></div>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.createdDate}</span>`;
        },
      },
      {
        orderable: false,
        data: function (row, type, set, meta) {
          return getDropdownHtml(meta.row, "selahiyyet");
        },
      },
    ];
  }

  function getAuditColumns() {
    return [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
              <input type="checkbox" id="cb-audit-${idx}" class="row-checkbox peer hidden">
              <label for="cb-audit-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            `;
        },
      },
      {
        data: function (row) {
          return `
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#7450864D] text-primary text-[14px] flex items-center justify-center font-semibold">
                  ${row.user
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div class="flex flex-col">
                  <span class="text-messages text-[13px] font-medium dark:text-white">${row.user}</span>
                </div>
              </div>
            `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.position}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.company}</span>`;
        },
      },
      {
        data: function (row) {
          let color = "";
          switch (row.action) {
            case "Create":
              color = "bg-[#32B5AC]";
              break;
            case "Düzəliş":
              color = "bg-[#FFA100]";
              break;
            case "Silinmə":
              color = "bg-error";
              break;
            case "Təsdiqlənmə":
              color = "bg-[#00A3FF]";
              break;
            default:
              color = "bg-[#FF7043]";
          }
          return `
              <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                 <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                 <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.action}</span>
              </div>
            `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.date}</span>`;
        },
      },
    ];
  }

  function getDropdownHtml(idx, tabType) {
    let dropdownContent = "";

    if (tabType === "aktiv") {
      dropdownContent = `
          <div class="relative w-[154px] h-[74px] border-[#0000001A] border-[0.5px] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
        <div class="flex items-center my-1 py-[3.5px] pl-[9px] cursor-pointer h-[28px] hover:bg-item-hover transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action" data-action="edit" data-row-index="${idx}">
                  <div class="icon stratis-pencil-02 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                  <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Redaktə et</span>
              </div>
              <div class="h-[0.5px] bg-[#0000001A]"></div>
        <div class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action" data-action="delete" data-row-index="${idx}">
                  <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
          <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Hovuzdan çıxart</span>
              </div>
          </div>
        `;
    } else if (tabType === "vezifeler") {
      dropdownContent = `
          <div class="relative w-[185px] h-[74px] border-[#0000001A] border-[0.5px] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
              <div class="flex items-center my-1 py-[3.5px] pl-[9px] cursor-pointer h-[28px] hover:bg-item-hover transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                  <div class="icon stratis-pencil-02 w-[13px] h-[13px] mr-2 text-messages disabled:text-on-surface-variant-dark"></div>
                  <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">Redaktə et</span>
              </div>
              <div class="h-[0.5px] bg-[#0000001A]"></div>
              <div class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                  <div class="icon stratis-trash-01 w-[13px] h-[13px] text-error mr-[9px] disabled:text-on-surface-variant-dark"></div>
                  <span class="text-[13px] text-error font-medium disabled:text-on-surface-variant-dark">Sil</span>
              </div>
          </div>
        `;
    } else if (tabType === "selahiyyet") {
      dropdownContent = `
          <div class="relative w-[196px] h-[74px] border-[#0000001A] border-[0.5px] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] rounded-[8px] bg-menu z-0">
              <div class="flex items-center my-1 py-[3.5px] pl-[9px] cursor-pointer h-[28px] hover:bg-item-hover transition ease-out duration-300 active:bg-item-hover disabled:bg-none open-action">
                  <div class="icon stratis-pencil-02 w-[13px] h-[13px] mr-2 text-[#1D222BA6] disabled:text-on-surface-variant-dark"></div>
                  <span class="text-[13px] font-medium text-messages disabled:text-on-surface-variant-dark">İstifadəçiləri redaktə et</span>
              </div>
              <div class="h-[0.5px] bg-[#0000001A]"></div>
              <div class="flex items-center py-[3.5px] mt-1 mb-[4px] pl-[12px] cursor-pointer h-[28px] transition ease-out duration-300 hover:bg-[#DD38381A] active:bg-[#DD38381A] disabled:bg-body-bg delete-action">
                  <div class="icon stratis-trash-01 w-[13px] h-[13px] text-[#BFC8CC] mr-[9px] disabled:text-on-surface-variant-dark"></div>
                  <span class="text-[13px] text-[#BFC8CC] font-medium disabled:text-on-surface-variant-dark">Qrupu sil</span>
              </div>
          </div>
        `;
    }

    return `
        <div class="text-base flex items-center cursor-pointer dropdown-trigger" data-row="${idx}">
            <div class="icon stratis-dot-vertical text-messages w-5 h-5 dark:text-white"></div>
            <div class="dropdown-menu hidden absolute z-50" id="dropdown-${idx}">
                <div class="absolute top-[-11.5px] right-[0px] transform -translate-x-1/2 z-10">
                    <img src="/images/avankart-partner-pages-images/Polygon 1.svg" alt="polygon" class="w-[14px] h-[12px]">
                </div>
                ${dropdownContent}
            </div>
        </div>
      `;
  }

  function createDataTable(columns, data, tableId) {
    const isAuditTable = tableId === "#auditTable";
    const hasCheckboxes =
      currentTab === "aktiv" ||
      currentTab === "vezifeler" ||
      currentTab === "audit";
    const hasPagination = currentTab === "aktiv" || currentTab === "audit";

    currentTable = $(tableId).DataTable({
      paging: hasPagination,
      info: false,
      dom: "t",
      data: data,
      columns: columns,
      order: [],
      lengthChange: false,
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            $(this).css("background-color", "#F5F5F5");
          })
          .on("mouseleave", function () {
            $(this).css("background-color", "");
          });

        $(row).find("td").addClass("border-b-[.5px] border-stroke");

        if (isAuditTable) {
          $(row).find("td:not(:first-child)").css({
            "padding-left": "20px",
            "padding-top": "14.5px",
            "padding-bottom": "14.5px",
          });

          $(row).find("td:first-child").css({
            "padding-left": "0",
            "padding-right": "0",
            width: "48px",
            "text-align": "center",
          });

          $(row).find("td:first-child label, td:first-child div").css({
            margin: "0",
            display: "inline-flex",
            "justify-content": "center",
            "align-items": "center",
          });
        } else {
          $(row).find("td:not(:first-child):not(:last-child)").css({
            "padding-left": "20px",
            "padding-top": "14.5px",
            "padding-bottom": "14.5px",
          });

          $(row).find("td:first-child").css({
            "padding-left": "0",
            "padding-right": "0",
            width: "48px",
            "text-align": "center",
          });

          $(row).find("td:first-child label, td:first-child div").css({
            margin: "0",
            display: "inline-flex",
            "justify-content": "center",
            "align-items": "center",
          });

          $(row)
            .find("td:last-child")
            .addClass("border-l-[.5px] border-stroke")
            .css({
              "padding-right": "0",
              "text-align": "right",
              position: "relative",
            });
        }
      },
      initComplete: function () {
        if (isAuditTable) {
          $(`${tableId} thead th`).css({
            "padding-left": "20px",
            "padding-top": "10.5px",
            "padding-bottom": "10.5px",
          });
          $(`${tableId} thead th:first-child`).css({
            "padding-left": "20px",
            "padding-right": "20px",
            width: "58px",
            "text-align": "center",
            "vertical-align": "middle",
          });
          $(
            `${tableId} thead th:first-child label, ${tableId} thead th:first-child div`
          ).css({
            margin: "0 auto",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          });
        } else {
          $(`${tableId} thead th`).css({
            "padding-left": "20px",
            "padding-top": "10.5px",
            "padding-bottom": "10.5px",
          });
          $(`${tableId} thead th:first-child`).css({
            "padding-left": "20px",
            "padding-right": "20px",
            width: "58px",
            "text-align": "center",
            "vertical-align": "middle",
          });
          $(`${tableId} thead th:last-child`).css({
            "border-left": "0.5px solid #E0E0E0",
          });
          $(
            `${tableId} thead th:first-child label, ${tableId} thead th:first-child div`
          ).css({
            margin: "0 auto",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          });
        }

        $(`${tableId} thead th.filtering`).each(function () {
          $(this).html(
            '<div class="custom-header flex gap-2.5 items-center"><div>' +
              $(this).text() +
              '</div><div class="icon p-2 stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
          );
        });
      },
      drawCallback: function () {
        if (!hasPagination) {
          $("#mainPagination").hide();
          return;
        } else {
          const paginationSelector = isAuditTable
            ? "#auditPagination"
            : "#mainPagination";
          $(paginationSelector).show();
        }

        var api = this.api();
        var pageInfo = api.page.info();
        var paginationId = isAuditTable
          ? "#auditCustomPagination"
          : "#customPagination";
        var pageCountId = isAuditTable ? "#auditPageCount" : "#pageCount";
        var $pagination = $(paginationId);

        if (pageInfo.pages === 0) {
          $pagination.empty();
          return;
        }

        $(pageCountId).text(pageInfo.page + 1 + " / " + pageInfo.pages);
        $pagination.empty();

        $(`${tableId} tbody tr.spacer-row`).remove();
        const colCount = $(`${tableId} thead th`).length;
        const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
        $(`${tableId} tbody`).prepend(spacerRow);

        const $lastRow = $(`${tableId} tbody tr:not(.spacer-row):last`);
        $lastRow.find("td").css({ "border-bottom": "0.5px solid #E0E0E0" });
        if (!isAuditTable) {
          $lastRow
            .find("td:last-child")
            .css({ "border-left": "0.5px solid #E0E0E0" });
        }

        const changePageFunction = isAuditTable
          ? "changeAuditPage"
          : "changePage";

        $pagination.append(`
            <div class="flex items-center justify-center pr-[42px] h-8 ms-0 leading-tight ${pageInfo.page === 0 ? "opacity-50 cursor-not-allowed" : "text-messages"}" onclick="${changePageFunction}(${Math.max(0, pageInfo.page - 1)})">
              <div class="icon stratis-chevron-left !h-[12px] !w-[7px]"></div>
            </div>
          `);

        var paginationButtons = '<div class="flex gap-2">';
        for (var i = 0; i < pageInfo.pages; i++) {
          paginationButtons += `
              <button class="cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages ${i === pageInfo.page ? "bg-[#F6D9FF] text-messages" : "bg-transparent text-tertiary-text"}" onclick="${changePageFunction}(${i})">${i + 1}</button>
            `;
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        $pagination.append(`
            <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "opacity-50 cursor-not-allowed" : "text-tertiary-text"}" onclick="${changePageFunction}(${Math.min(pageInfo.pages - 1, pageInfo.page + 1)})">
              <div class="icon stratis-chevron-right !h-[12px] !w-[7px]"></div>
            </div>
          `);
      },
    });

    if (hasCheckboxes) {
      let mainCheckboxId, rowCheckboxClass;

      if (currentTab === "aktiv") {
        mainCheckboxId = "#mainCheckbox-aktiv";
        rowCheckboxClass = 'input[id^="cb-aktiv-"]';
      } else if (currentTab === "vezifeler") {
        mainCheckboxId = "#mainCheckbox-vezife";
        rowCheckboxClass = 'input[id^="cb-vezife-"]';
      } else if (currentTab === "audit") {
        mainCheckboxId = "#mainCheckbox-audit";
        rowCheckboxClass = 'input[id^="cb-audit-"]';
      }

      $(mainCheckboxId)
        .off("change")
        .on("change", function () {
          const isChecked = $(this).is(":checked");
          $(`${tableId} tbody ${rowCheckboxClass}`).each(function () {
            $(this).prop("checked", isChecked);
          });
          handleCheckboxSelection();
        });

      $(tableId)
        .off("change", `${rowCheckboxClass}`)
        .on("change", `${rowCheckboxClass}`, function () {
          handleCheckboxSelection();
        });
    }
  }

  function handleCheckboxSelection() {
    const checkedBoxes = currentTable
      .rows()
      .nodes()
      .to$()
      .find(".row-checkbox:checked");
    const selectedCount = checkedBoxes.length;

    if (selectedCount > 0) {
      $("#main-controls").hide();
      if (currentTab === "aktiv") {
        $("#aktiv-selection-controls").show();
        $("#aktiv-selected-count").text(selectedCount);
      } else if (currentTab === "vezifeler" || currentTab === "audit") {
        $("#vezifeler-audit-selection-controls").show();
        if (currentTab === "vezifeler") {
          $("#selection-count-label").text("Seçilən vəzifə sayı");
        } else if (currentTab === "audit") {
          $("#selection-count-label").text("Seçilən əməliyyat sayı");
        }
        $("#selected-count-audit").text(selectedCount);
      }
    } else {
      $("#main-controls").show();
      $("#aktiv-selection-controls").hide();
      $("#vezifeler-audit-selection-controls").hide();
    }
  }

  window.changePage = function (page) {
    if (currentTable && currentTab === "aktiv") {
      currentTable.page(page).draw("page");
    }
  };

  window.changeAuditPage = function (page) {
    if (currentTable && currentTab === "audit") {
      currentTable.page(page).draw("page");
    }
  };

  $(document).on("click", ".dropdown-trigger", function (e) {
    e.stopPropagation();
    const rowId = $(this).data("row");

    $(".dropdown-menu").addClass("hidden");

    const $dropdown = $(`#dropdown-${rowId}`);
    $dropdown.removeClass("hidden");

    const $trigger = $(this);

    $dropdown.css({
      top: "30px",
      right: "22px",
      left: "auto",
    });

    $trigger.parent().css("position", "relative");
  });

  $(document).on("click", function () {
    $(".dropdown-menu").addClass("hidden");
  });

  $(document).on("click", ".open-action", function (e) {
    e.stopPropagation();
    const rowId = $(this).data("row-index");
    if (currentTab === "aktiv") {
      const record = aktivData[rowId];
      if (record) openEditUserModal(record.id);
    }
    $(".dropdown-menu").addClass("hidden");
  });

  $(document).on("click", ".delete-action", function (e) {
    e.stopPropagation();
    const rowId = $(this).data("row-index");
    if (currentTab === "aktiv") {
      const record = aktivData[rowId];
      if (record) confirmDeleteUser(record.id);
    }
    $(".dropdown-menu").addClass("hidden");
  });

  async function openEditUserModal(userId) {
    try {
      const [userRes, dutiesRes, groupsRes] = await Promise.all([
        fetch(`/avankart-profile/api/users/${userId}`),
        fetch(`/avankart-profile/api/duties`),
        fetch(`/avankart-profile/api/permission-groups`),
      ]);
      const userJson = await userRes.json();
      if (!userJson.success) return alert("İstifadəçi tapılmadı");
      const dutiesJson = await dutiesRes.json();
      const groupsJson = await groupsRes.json();
      buildEditModal(
        userJson.data,
        dutiesJson.data || [],
        groupsJson.data || []
      );
    } catch (err) {
      console.error("openEditUserModal error", err);
      alert("Xəta baş verdi");
    }
  }

  function buildEditModal(user, duties, groups) {
    const existing = document.getElementById("edit-user-modal");
    if (existing) existing.remove();
    const dutyItems = duties
      .map(
        (d) =>
          `<li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-value="${d.id}">${d.name}</a></li>`
      )
      .join("");
    const groupItems = groups
      .map(
        (g) =>
          `<li><a href="#" class="block px-4 py-1 text-[13px] font-medium" data-value="${g.id}">${g.name}</a></li>`
      )
      .join("");

    const selectedDutyName = user.duty ? user.duty.name : "Seçim edin";
    const selectedGroupName = user.permission_group
      ? user.permission_group.name
      : "Seçim edin";

    const fullName = [user.name, user.surname].filter(Boolean).join(" ");

    const modal = document.createElement("div");
    modal.id = "edit-user-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center";
    modal.innerHTML = `
    <div id="editModal" class="fixed inset-0 flex items-center justify-center bg-[#0000002A] bg-opacity-30 z-500">
      <div class="redakte-div font-poppins w-[400px] h-[600px] bg-body-bg dark:bg-body-bg-dark border-[3px] border-[#0000001A] !shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)] rounded-2xl p-6 fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50 dark:border-[#ffffff1A]">
        <div class="flex items-center justify-between py-0.5 mb-5">
          <span class="text-[15px] font-medium text-messages dark:text-white">Redaktə et</span>
          <img id="edit-close-light" src="/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden">
          <img id="edit-close-dark" src="/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block">
        </div>
        <div class="mt-5">
          <form id="editUserForm" action="#">
            <div class="w-full">
              <div><span class="text-messages dark:text-white text-[12px] font-medium opacity-65">Ad və Soyad</span></div>
              <input name="name" type="text" value="${fullName}" placeholder="Ramin Orucov" readonly class="w-full h-[34px] py-[7.5px] px-3 text-[12px] font-normal border-[1px] border-[#0000001A] rounded-[500px] bg-[#F5F5F5] text-[#999999] cursor-not-allowed" />
              <div class="mt-1"><span class="text-error text-[12px]">*</span> <span class="text-messages dark:text-white text-[12px] font-medium opacity-65">Cinsiyyət</span></div>
              <div class="flex items-center gap-3 mt-2.5">
                <div class="flex items-center gap-2">
                  <input id="gender-male" type="radio" name="gender" value="male" ${user.gender === "male" ? "checked" : ""} class="w-4 h-4 text-[#745086] bg-gray-100 border-surface-variant focus:ring-[#745086] focus:ring-2" />
                  <label for="gender-male" class="text-[13px] font-medium text-messages dark:text-white cursor-pointer">Kişi</label>
                </div>
                <div class="flex items-center gap-2">
                  <input id="gender-female" type="radio" name="gender" value="female" ${user.gender === "female" ? "checked" : ""} class="w-4 h-4 text-[#745086] bg-gray-100 border-surface-variant focus:ring-[#745086] focus:ring-2" />
                  <label for="gender-female" class="text-[13px] font-medium text-messages dark:text-white cursor-pointer">Qadin</label>
                </div>
              </div>
              <div class="w-full my-3">
                <div><span class="text-messages dark:text-white text-[12px] font-medium opacity-65">Email</span></div>
                <input name="email" type="email" value="${user.email || ""}" placeholder="example@mail.com" readonly class="w-full h-[34px] py-[7.5px] px-3 text-[12px] font-normal border-[1px] border-[#0000001A] rounded-[500px] bg-[#F5F5F5] text-[#999999] cursor-not-allowed" />
              </div>
              <div><span class="text-messages text-[12px] font-medium opacity-65 dark:text-white">Telefon nömrəniz</span></div>
              <div class="flex items-center justify-between gap-2">
                <div class="w-max h-[34px] border border-[#0000001A] px-3 my-3 rounded-[500px] bg-[#F5F5F5] relative pointer-events-none">
                  <div class="operator text-center flex items-center justify-center gap-[9px] text-[12px] font-normal !h-[34px] cursor-not-allowed">
                    <span class="text-[#999999]">+${user.phone_suffix || "994"}</span>
                  </div>
                </div>
                <div class="w-full rounded-[500px] border-[1px] border-[#0000001A]">
                  <input name="phone" value="${user.phone || ""}" type="tel" readonly class="rounded-full border-0 w-full h-[34px] outline-none text-[12px] font-normal bg-[#F5F5F5] text-[#999999] cursor-not-allowed px-3" placeholder="050 770 35 22" />
                </div>
                <input type="hidden" name="phone_suffix" id="phone_suffix_hidden" value="${user.phone_suffix || "994"}" />
              </div>

              <div class="mt-3">
                <div><span class="text-error text-[12px]">*</span> <span class="text-messages text-[12px] font-medium opacity-65 dark:text-white">Vəzifə</span></div>
                <div class="relative">
                  <button type="button" id="dutyDropdownBtn" class="w-full h-[34px] flex items-center justify-between cursor-pointer rounded-full border px-3 text-[12px] font-normal bg-[#EBEBEB]">
                    <span id="selectedDutyText">${selectedDutyName}</span>
                    <svg class="w-2.5 h-2.5 ms-3" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg>
                  </button>
                  <div id="dutyDropdown" class="z-10 bg-white dark:bg-menu-dark dark:text-white rounded-lg w-full border shadow hidden absolute top-[38px] left-0">
                    <ul class="py-1 px-1 max-h-[180px] overflow-y-auto">${dutyItems}</ul>
                  </div>
                  <select name="duty" id="realDutySelect" class="hidden">
                    <option value="">Seçim edin</option>
                    ${duties.map((d) => `<option value="${d.id}" ${user.duty && user.duty.id === d.id ? "selected" : ""}>${d.name}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="mt-3">
                <div><span class="text-error text-[12px]">*</span> <span class="text-messages text-[12px] font-medium opacity-65 dark:text-white">Səlahiyyət qrupu</span></div>
                <div class="relative">
                  <button type="button" id="groupDropdownBtn" class="w-full h-[34px] flex items-center justify-between cursor-pointer rounded-full border px-3 text-[12px] font-normal bg-[#EBEBEB]">
                    <span id="selectedGroupText">${selectedGroupName}</span>
                    <svg class="w-2.5 h-2.5 ms-3" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/></svg>
                  </button>
                  <div id="groupDropdown" class="z-10 bg-white dark:bg-menu-dark dark:text-white rounded-lg w-full border shadow hidden absolute top-[38px] left-0">
                    <ul class="py-1 px-1 max-h-[180px] overflow-y-auto">${groupItems}</ul>
                  </div>
                  <select name="permission_group" id="realGroupSelect" class="hidden">
                    <option value="">Seçim edin</option>
                    ${groups.map((g) => `<option value="${g.id}" ${user.permission_group && user.permission_group.id === g.id ? "selected" : ""}>${g.name}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-3 mt-5 justify-end">
                <button type="button" id="editCancelBtn" class="bg-surface py-[6.5px] px-3 text-[13px] text-on-surface-variant font-medium rounded-[50px] cursor-pointer hover:bg-surface">Ləğv et</button>
                <button type="submit" class="bg-primary text-body-bg py-[6.5px] px-3 rounded-[100px] text-[13px] font-medium cursor-pointer hover:bg-hover-button">Dəyişikliyi təsdiqlə</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>`;

    document.body.appendChild(modal);

    const removeModal = () => {
      const m = document.getElementById("edit-user-modal");
      if (m) m.remove();
    };
    modal
      .querySelector("#edit-close-light")
      .addEventListener("click", removeModal);
    modal
      .querySelector("#edit-close-dark")
      .addEventListener("click", removeModal);
    modal
      .querySelector("#editCancelBtn")
      .addEventListener("click", removeModal);

    const dutyBtn = modal.querySelector("#dutyDropdownBtn");
    const dutyDropdown = modal.querySelector("#dutyDropdown");
    const dutyText = modal.querySelector("#selectedDutyText");
    const realDutySelect = modal.querySelector("#realDutySelect");
    dutyBtn.addEventListener("click", () => {
      dutyDropdown.classList.toggle("hidden");
    });
    dutyDropdown.querySelectorAll("a[data-value]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const val = a.getAttribute("data-value");
        dutyText.textContent = a.textContent.trim();
        realDutySelect.value = val;
        dutyDropdown.classList.add("hidden");
      });
    });

    const groupBtn = modal.querySelector("#groupDropdownBtn");
    const groupDropdown = modal.querySelector("#groupDropdown");
    const groupText = modal.querySelector("#selectedGroupText");
    const realGroupSelect = modal.querySelector("#realGroupSelect");
    groupBtn.addEventListener("click", () => {
      groupDropdown.classList.toggle("hidden");
    });
    groupDropdown.querySelectorAll("a[data-value]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const val = a.getAttribute("data-value");
        groupText.textContent = a.textContent.trim();
        realGroupSelect.value = val;
        groupDropdown.classList.add("hidden");
      });
    });

    document.addEventListener("click", function outside(e) {
      if (!modal.contains(e.target)) return;
      if (!dutyBtn.contains(e.target) && !dutyDropdown.contains(e.target))
        dutyDropdown.classList.add("hidden");
      if (!groupBtn.contains(e.target) && !groupDropdown.contains(e.target))
        groupDropdown.classList.add("hidden");
    });

    const form = modal.querySelector("#editUserForm");
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const formData = new FormData(form);

      const payload = {
        gender: formData.get("gender") || "male",
        duty: formData.get("duty") || undefined,
        permission_group: formData.get("permission_group") || undefined,
        status: formData.get("status_active") ? "active" : "deactive",
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === "") {
          delete payload[key];
        }
      });
      try {
        let token = await getCsrfToken();
        const makeRequest = async (retry = false) => {
          return fetch(`/avankart-profile/api/users/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": token || "",
            },
            credentials: "include",
            redirect: "follow",
            body: JSON.stringify(payload),
          });
        };

        let res = await makeRequest(false);

        if (res.status === 403) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const problem = await res
              .clone()
              .json()
              .catch(() => ({}));
            if (problem && problem.error === "CSRF_INVALID") {
              token = await getCsrfToken(true);
              if (token) {
                res = await makeRequest(true);
              }
            }
          }
        }

        const contentType = res.headers.get("content-type") || "";
        let json;
        if (contentType.includes("application/json")) {
          json = await res.json();
        } else {
          const text = await res.text();
          console.warn(
            "Non-JSON response for update user:",
            res.status,
            text.substring(0, 300)
          );
          if (res.status === 403) {
            alert("403 - İcazə yoxdur. Yenidən giriş edin.");
            return;
          }
          if (res.redirected) {
            alert(
              "Sessiya bitmiş ola bilər. Zəhmət olmasa yenidən daxil olun."
            );
            return;
          }
          alert("Gözlənilməyən cavab alındı");
          return;
        }

        if (!res.ok) {
          console.error("Update failed status:", res.status, json);
          if (res.status === 403) {
            if (json && json.error === "CSRF_INVALID") {
              alert(
                "Form təhlükəsizlik tokeni keçərsizdir. Səhifəni yeniləyib yenidən cəhd edin."
              );
            } else {
              alert("403 - Sessiya və ya icazə problemi. Yenidən giriş edin.");
            }
            return;
          }
          alert(json.message || "Xəta baş verdi");
          return;
        }

        if (!json.success) {
          console.warn("Update returned success:false", json);
          alert(json.message || "Xəta");
          return;
        }
        removeModal();
        fetchAktivData(aktivPagination.page);
      } catch (err) {
        console.error("update user error", err);
        alert("Server xəta");
      }
    });
  }

  function confirmDeleteUser(userId) {
    if (!confirm("İstifadəçi hovuzdan çıxarılsın?")) return;
    (async () => {
      try {
        let token = await getCsrfToken();
        const doRequest = () =>
          fetch(`/avankart-profile/api/users/${userId}`, {
            method: "DELETE",
            headers: { "X-CSRF-Token": token || "" },
            credentials: "include",
          });
        let res = await doRequest();
        // Retry once if CSRF invalid
        if (res.status === 403) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const body = await res
              .clone()
              .json()
              .catch(() => ({}));
            if (body && body.error === "CSRF_INVALID") {
              token = await getCsrfToken(true);
              if (token) res = await doRequest();
            }
          }
          if (ct.includes("application/json")) {
            const body = await res
              .clone()
              .json()
              .catch(() => ({}));
            if (body && body.error === "CSRF_INVALID") {
              token = await getCsrfToken(true);
              if (token) res = await doRequest();
            }
          }
        }
        const contentType = res.headers.get("content-type") || "";
        let json;
        if (contentType.includes("application/json")) {
          json = await res.json();
        } else {
          if (res.status === 403) {
            alert("403 - İcazə / Sessiya problemi. Yenidən giriş edin.");
            return;
          }
          alert("Gözlənilməyən cavab alındı");
          return;
        }
        if (!res.ok || !json.success) {
          if (res.status === 403 && json.error === "CSRF_INVALID") {
            alert("Təhlükəsizlik tokeni keçərsizdir. Səhifəni yeniləyin.");
            return;
          }
          alert(json.message || "Silinmə xətası");
          return;
        }
        fetchAktivData(aktivPagination.page);
      } catch (err) {
        console.error("delete user error", err);
        alert("Server xəta");
      }
    })();
  }

  $(document).on("click", ".dropdown-menu", function (e) {
    e.stopPropagation();
  });

  $("#aktiv-select-all-btn").on("click", function () {
    $(`#myTable tbody input[type="checkbox"]`).prop("checked", true);
    handleCheckboxSelection();
  });

  $("#aktiv-clear-selection-btn").on("click", function () {
    $(`#myTable tbody input[type="checkbox"]`).prop("checked", false);
    handleCheckboxSelection();
  });

  $("#select-all-btn-audit").on("click", function () {
    if (currentTab === "vezifeler") {
      $(`#myTable tbody input[type="checkbox"]`).prop("checked", true);
    } else if (currentTab === "audit") {
      $(`#auditTable tbody input[type="checkbox"]`).prop("checked", true);
    }
    handleCheckboxSelection();
  });

  $("#clear-selection-btn-audit").on("click", function () {
    if (currentTab === "vezifeler") {
      $(`#myTable tbody input[type="checkbox"]`).prop("checked", false);
    } else if (currentTab === "audit") {
      $(`#auditTable tbody input[type="checkbox"]`).prop("checked", false);
    }
    handleCheckboxSelection();
  });

  updateStatsVisibility(currentTab);
  showTabButtons("aktiv");

  async function openCreateModal() {
    const modal = document.getElementById("createModal2");
    if (!modal) return;
    await populateCreateDropdowns();
    modal.classList.remove("hidden");
  }

  async function populateCreateDropdowns() {
    try {
      const [dRes, gRes] = await Promise.all([
        fetch("/avankart-profile/api/duties"),
        fetch("/avankart-profile/api/permission-groups"),
      ]);
      const dJson = await dRes.json();
      const gJson = await gRes.json();
      const duties = (dJson && dJson.data) || [];
      const groups = (gJson && gJson.data) || [];

      if (!Array.isArray(duties)) {
        console.warn("[createModal] duties response not array:", duties);
        console.warn("[createModal] duties response not array:", duties);
      }
      if (!Array.isArray(groups)) {
        console.warn("[createModal] groups response not array:", groups);
        console.warn("[createModal] groups response not array:", groups);
      }
      if (duties.length === 0) {
        console.info("[createModal] No duties received from /api/duties");
        console.info("[createModal] No duties received from /api/duties");
      }
      if (groups.length === 0) {
        console.info(
          "[createModal] No permission groups received from /api/permission-groups"
        );
        console.info(
          "[createModal] No permission groups received from /api/permission-groups"
        );
      }

      const dutyUl = document.querySelector("#dropdownCrtVezife ul");
      if (dutyUl) {
        dutyUl.innerHTML =
          duties
            .map(
              (d) =>
                `<li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-id="${d.id}" data-name="${d.name}">${d.name}</a></li>`
            )
            .join("") ||
          '<li class="px-4 py-2 text-[12px] opacity-60">Məlumat yoxdur</li>';
      }
      const dutySelect = document.getElementById("selectVezifeCrt");
      if (dutySelect) {
        dutySelect.innerHTML =
          '<option value="">Seçim edin</option>' +
          duties
            .map((d) => `<option value="${d.id}">${d.name}</option>`)
            .join("");
      }

      const groupUl = document.querySelector("#dropdownSelahiyyetCrt ul");
      if (groupUl) {
        groupUl.innerHTML =
          groups
            .map(
              (g) =>
                `<li><a href="#" class="block px-4 py-2 text-[13px] font-medium" data-id="${g.id}" data-name="${g.name}">${g.name}</a></li>`
            )
            .join("") ||
          '<li class="px-4 py-2 text-[12px] opacity-60">Məlumat yoxdur</li>';
      }
      const groupSelect = document.getElementById("realSelahiyyetCrt");
      if (groupSelect) {
        groupSelect.innerHTML =
          '<option value="">Seçim edin</option>' +
          groups
            .map((g) => `<option value="${g.id}">${g.name}</option>`)
            .join("");
      }

      bindCreateDropdownClicks(true);
    } catch (err) {
      console.error("populateCreateDropdowns error", err);
      bindCreateDropdownClicks(true);
    }
  }

  function bindCreateDropdownClicks(rebind = false) {
    // Duties
    const dutyContainer = document.getElementById("dropdownCrtVezife");
    const dutyBtn = document.getElementById("vezifeCreateBtn");
    const dutyText = document.getElementById("vezifeCrtSel");
    const dutySelect = document.getElementById("selectVezifeCrt");
    if (dutyBtn && dutyContainer) {
      if (rebind) {
        dutyBtn.onclick = null;
      }
      dutyBtn.onclick = () => {
        dutyContainer.classList.toggle("hidden");
      };
      if (!dutyContainer.__delegated) {
        dutyContainer.addEventListener("click", (e) => {
          const a = e.target.closest("a[data-id]");
          if (!a) return;
          e.preventDefault();
          dutyText.textContent = a.getAttribute("data-name");
          if (dutySelect) dutySelect.value = a.getAttribute("data-id");
          dutyContainer.classList.add("hidden");
        });
        dutyContainer.__delegated = true;
      }
    }
    // Groups
    const groupContainer = document.getElementById("dropdownSelahiyyetCrt");
    const groupBtn = document.getElementById("selahiyyetCrt");
    const groupText = document.getElementById("selahiyyetCrtSel");
    const groupSelect = document.getElementById("realSelahiyyetCrt");
    if (groupBtn && groupContainer) {
      if (rebind) {
        groupBtn.onclick = null;
      }
      groupBtn.onclick = () => {
        groupContainer.classList.toggle("hidden");
      };
      if (!groupContainer.__delegated) {
        groupContainer.addEventListener("click", (e) => {
          const a = e.target.closest("a[data-id]");
          if (!a) return;
          e.preventDefault();
          groupText.textContent = a.getAttribute("data-name");
          if (groupSelect) groupSelect.value = a.getAttribute("data-id");
          groupContainer.classList.add("hidden");
        });
        groupContainer.__delegated = true;
      }
    }
    document.addEventListener("click", function outside(ev) {
      const modal = document.getElementById("createModal2");
      if (!modal || modal.classList.contains("hidden")) return;
      if (
        dutyContainer &&
        !dutyContainer.contains(ev.target) &&
        dutyBtn &&
        !dutyBtn.contains(ev.target)
      )
        dutyContainer.classList.add("hidden");
      if (
        groupContainer &&
        !groupContainer.contains(ev.target) &&
        groupBtn &&
        !groupBtn.contains(ev.target)
      )
        groupContainer.classList.add("hidden");
    });
  }

  const createCancelBtn = document.getElementById("createCancelBtn");
  if (createCancelBtn) {
    createCancelBtn.addEventListener("click", () => {
      const modal = document.getElementById("createModal2");
      if (modal) modal.classList.add("hidden");
    });
  }

  const createForm = document.getElementById("createForm");
  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName =
        document.getElementById("crtFullName")?.value.trim() || "";
      let name = "",
        surname = "";
      if (fullName) {
        const parts = fullName.split(/\s+/);
        name = parts.shift() || "";
        surname = parts.join(" ");
      }
      const gender =
        document.querySelector('input[name="createGender"]:checked')?.value ||
        "male";
      const email = document.getElementById("crtEmail")?.value.trim() || "";
      const phone =
        document.getElementById("crtTel")?.value.replace(/\s+/g, "").trim() ||
        "";
      const phoneSuffixText =
        document.getElementById("operatorCreateText")?.textContent || "+994";
      const phone_suffix = phoneSuffixText.replace("+", "");
      const duty = document.getElementById("selectVezifeCrt")?.value || "";
      const permission_group =
        document.getElementById("realSelahiyyetCrt")?.value || "";

      const payload = {
        name,
        surname,
        gender,
        email,
        phone,
        phone_suffix: phone_suffix,
        duty: duty || undefined,
        permission_group: permission_group || undefined,
      };

      // Basic client validation
      if (!email || !phone || !name) {
        alert("Məlumatları doldurun");
        return;
      }
      let token = await getCsrfToken();
      const doRequest = async () =>
        fetch("/avankart-profile/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token || "",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      let res = await doRequest();
      if (res.status === 403) {
        try {
          const j = await res.clone().json();
          if (j && j.error === "CSRF_INVALID") {
            token = await getCsrfToken(true);
            res = await doRequest();
          }
        } catch (_) {}
      }
      let json;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.error("create parse error", parseErr);
        alert("Server cavabı anlaşılmadı");
        return;
      }
      if (!res.ok || !json.success) {
        if (json && json.code === "EMAIL_IN_USE")
          return alert("Email artıq mövcuddur");
        if (json && json.code === "PHONE_IN_USE")
          return alert("Telefon artıq mövcuddur");
        alert(json.message || "Yaratma xətası");
        return;
      }

      document.getElementById("createModal2")?.classList.add("hidden");
      createForm.reset();
      document.getElementById("crtFullName").value = "";
      openOtpModal(
        json.userId,
        json.maskedEmail,
        json.resendDelay || 60,
        json.otpExpiresIn || 300
      );
    });
  }

  // Fallback delegated listener in case direct binding missed (edge cases)
  document.addEventListener("submit", function (e) {});

  function buildOtpModal() {
    let existing = document.getElementById("otpVerifyModal");
    if (existing) return existing;
    const wrapper = document.createElement("div");
    wrapper.id = "otpVerifyModal";
    wrapper.className =
      "fixed inset-0 hidden flex items-center justify-center bg-[#0000002A] z-[600]";
    wrapper.innerHTML = `
      <div class="w-[400px] bg-body-bg dark:bg-body-bg-dark border-[3px] border-[#0000001A] dark:border-[#ffffff1A] rounded-2xl p-6 font-poppins relative">
        <div class="flex items-center justify-between mb-4">
          <span class="text-[15px] font-medium text-messages dark:text-white">Email təsdiqi</span>
          <img src="/images/settings/Close.svg" alt="Close" class="cursor-pointer block dark:hidden" id="otpCloseLight" />
          <img src="/images/settings/close-dark.svg" alt="Close" class="cursor-pointer hidden dark:block" id="otpCloseDark" />
        </div>
        <p id="otpInfoText" class="text-[12px] mb-4 opacity-70"></p>
        <div class="flex justify-between mb-4" id="otpInputsContainer">
          ${Array.from({ length: 6 })
            .map(
              (_, i) =>
                `<input type="text" maxlength="1" class="otpCell w-[45px] h-[50px] text-center border border-[#0000001A] rounded-lg text-[18px] font-medium focus:outline-none" data-idx="${i}" />`
            )
            .join("")}
        </div>
        <div class="flex items-center justify-between mb-4">
          <button id="otpResendBtn" class="text-[12px] text-primary disabled:opacity-40" disabled>Yenidən göndər (60)</button>
          <span id="otpTimer" class="text-[12px] opacity-70"></span>
        </div>
        <div class="flex items-center justify-end gap-3">
          <button id="otpCancelBtn" class="bg-surface dark:bg-surface-bright-dark dark:text-on-surface-variant-dark rounded-full text-[13px] px-[18px] py-[6.5px] cursor-pointer">Ləğv et</button>
          <button id="otpVerifyBtn" class="bg-primary text-white rounded-full text-[13px] px-[18px] py-[6.5px] cursor-pointer">Təsdiqlə</button>
        </div>
        <div id="otpError" class="mt-3 text-error text-[12px] hidden"></div>
      </div>`;
    document.body.appendChild(wrapper);
    // Close handlers
    const close = () => {
      wrapper.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    };
    wrapper.querySelector("#otpCloseLight").onclick = close;
    wrapper.querySelector("#otpCloseDark").onclick = close;
    wrapper.querySelector("#otpCancelBtn").onclick = close;
    return wrapper;
  }

  let otpCountdownInterval = null;
  function openOtpModal(userId, maskedEmail, resendDelay, expiresIn) {
    const modal = buildOtpModal();
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    const info = modal.querySelector("#otpInfoText");
    info.textContent = `${maskedEmail} ünvanına göndərilən 6 rəqəmli kodu daxil edin.`;
    const inputs = modal.querySelectorAll(".otpCell");
    inputs.forEach((inp) => {
      inp.value = "";
    });
    inputs[0].focus();
    inputs.forEach((inp) => {
      inp.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
        if (e.target.value && e.target.nextElementSibling) {
          e.target.nextElementSibling.focus();
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (
          e.key === "Backspace" &&
          !e.target.value &&
          e.target.previousElementSibling
        ) {
          e.target.previousElementSibling.focus();
        }
      });
    });
    const errorBox = modal.querySelector("#otpError");
    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.classList.remove("hidden");
    }
    function clearError() {
      errorBox.classList.add("hidden");
    }

    let remain = resendDelay;
    const resendBtn = modal.querySelector("#otpResendBtn");
    resendBtn.disabled = true;
    resendBtn.textContent = `Yenidən göndər (${remain})`;
    if (otpCountdownInterval) clearInterval(otpCountdownInterval);
    otpCountdownInterval = setInterval(() => {
      remain--;
      if (remain <= 0) {
        clearInterval(otpCountdownInterval);
        resendBtn.disabled = false;
        resendBtn.textContent = "Yenidən göndər";
      } else {
        resendBtn.textContent = `Yenidən göndər (${remain})`;
      }
    }, 1000);

    const timerSpan = modal.querySelector("#otpTimer");
    let exp = expiresIn;
    const expInt = setInterval(() => {
      exp--;
      if (exp <= 0) {
        clearInterval(expInt);
        showError("OTP vaxtı bitdi. Yenidən göndərin.");
      }
      timerSpan.textContent = `Bitmə: ${exp}s`;
    }, 1000);

    modal.querySelector("#otpVerifyBtn").onclick = async () => {
      clearError();
      const code = Array.from(inputs)
        .map((i) => i.value)
        .join("");
      if (code.length !== 6) {
        showError("6 rəqəm daxil edin");
        return;
      }
      let token = await getCsrfToken();
      const makeReq = () =>
        fetch(`/avankart-profile/api/users/${userId}/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token || "",
          },
          credentials: "include",
          body: JSON.stringify({ otp: code }),
        });
      let r = await makeReq();
      if (r.status === 403) {
        try {
          const jj = await r.clone().json();
          if (jj.error === "CSRF_INVALID") {
            token = await getCsrfToken(true);
            r = await makeReq();
          }
        } catch (_) {}
      }
      let j;
      try {
        j = await r.json();
      } catch (_) {
        showError("Server cavabı anlaşılmadı");
        return;
      }
      if (!r.ok || !j.success) {
        if (j && j.code === "INVALID_OTP") return showError("OTP səhvdir");
        if (j && j.code === "OTP_EXPIRED")
          return showError("OTP vaxtı bitdi. Yenidən göndərin.");
        if (j && j.code === "ALREADY_VERIFIED") {
          modal.classList.add("hidden");
          fetchAktivData(aktivPagination.page);
          return;
        }
        return showError(j.message || "Xəta");
      }
      modal.classList.add("hidden");
      fetchAktivData(aktivPagination.page);
    };

    resendBtn.onclick = async () => {
      if (resendBtn.disabled) return;
      clearError();
      resendBtn.disabled = true;
      resendBtn.textContent = "Göndərilir...";
      let token = await getCsrfToken();
      const doRes = () =>
        fetch(`/avankart-profile/api/users/${userId}/resend-otp`, {
          method: "POST",
          headers: { "X-CSRF-Token": token || "" },
          credentials: "include",
        });
      let r = await doRes();
      if (r.status === 403) {
        try {
          const jj = await r.clone().json();
          if (jj.error === "CSRF_INVALID") {
            token = await getCsrfToken(true);
            r = await doRes();
          }
        } catch (_) {}
      }
      let j;
      try {
        j = await r.json();
      } catch (_) {
        showError("Server cavabı anlaşılmadı");
        resendBtn.disabled = false;
        resendBtn.textContent = "Yenidən göndər";
        return;
      }
      if (!r.ok || !j.success) {
        if (j.code === "RESEND_TOO_SOON") {
          let rr = j.retryAfter || 30;
          remain = rr;
          resendBtn.disabled = true;
          resendBtn.textContent = `Yenidən göndər (${remain})`;
          if (otpCountdownInterval) clearInterval(otpCountdownInterval);
          otpCountdownInterval = setInterval(() => {
            remain--;
            if (remain <= 0) {
              clearInterval(otpCountdownInterval);
              resendBtn.disabled = false;
              resendBtn.textContent = "Yenidən göndər";
            } else {
              resendBtn.textContent = `Yenidən göndər (${remain})`;
            }
          }, 1000);
          return;
        }
        showError(j.message || "Resend xətası");
        resendBtn.disabled = false;
        resendBtn.textContent = "Yenidən göndər";
        return;
      }
      remain = j.resendDelay || 60;
      resendBtn.disabled = true;
      resendBtn.textContent = `Yenidən göndər (${remain})`;
      if (otpCountdownInterval) clearInterval(otpCountdownInterval);
      inputs.forEach((i) => (i.value = ""));
      inputs[0].focus();
      otpCountdownInterval = setInterval(() => {
        remain--;
        if (remain <= 0) {
          clearInterval(otpCountdownInterval);
          resendBtn.disabled = false;
          resendBtn.textContent = "Yenidən göndər";
        } else {
          resendBtn.textContent = `Yenidən göndər (${remain})`;
        }
      }, 1000);
    };
  }
});
