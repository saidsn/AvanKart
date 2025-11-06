// Global dəyişənlər
let queriesData = []; // API və ya başqa mənbədən gələn data
let currentPartnerId = null;
let currentPage = 1;
let totalPages = 1;
let pageSize = 20;

// Statuslara uyğun rəng xəritəsi
const colorMap = {
  Qaralama: "bg-[#BFC8CC]",
  Baxılır: "bg-[#F9B100]",
  "Həll olundu": "bg-[#32B5AC]",
  "Rədd edildi": "bg-[#DD3838]",
};

// Status sütunlarını render edən funksiya
function renderStatusColumns(data) {
  const statuses = ["Qaralama", "Baxılır", "Həll olundu", "Rədd edildi"];

  statuses.forEach((status) => {
    // Use the ticket containers instead of column IDs
    const statusKey = status.replace(" ", "-").toLowerCase();
    let containerId;

    switch (status) {
      case "Qaralama":
        containerId = "qaralama-tickets";
        break;
      case "Baxılır":
        containerId = "baxilir-tickets";
        break;
      case "Həll olundu":
        containerId = "hell-olundu-tickets";
        break;
      case "Rədd edildi":
        containerId = "redd-edildi-tickets";
        break;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ""; // Clear existing content

    // Kartları statusa görə əlavə et
    data
      .filter((item) => item.status === status)
      .forEach((item) => {
        const initials = item.userInitials ||
          item.responsible
            .split(" ")
            .map((n) => n[0])
            .join("");

        const priorityIcon =
          item.priority === "High"
            ? '<img src="/images/Avankart/avankartPartner/high.svg" alt="High" class="w-4 h-4"/>'
            : item.priority === "Medium" ? '<img src="/images/Avankart/avankartPartner/medium.svg" alt="Medium" class="w-4 h-4"/>'
              : '<img src="/images/Avankart/avankartPartner/low.svg" alt="Low" class="w-4 h-4"/>';

        const cardHtml = `
          <div class="cursor-pointer mb-2 p-3 bg-container-2 rounded-[8px] hover:bg-input-hover transition-colors ticket-card" data-ticket-id="${item.id}">
            <div class="flex items-center justify-between">
              <span class="text-[11px] opacity-65">${item.id}</span>
            </div>
            <div class="mt-0.5 mb-3">
              <div class="text-[13px] font-medium mb-1">${item.title}</div>
              <div class="text-[11px] font-normal opacity-65">${item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}</div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <div class="w-[34px] h-[34px] bg-button-disabled rounded-full flex justify-center items-center">
                  <div class="text-[12px] font-semibold font-poppins w-[13px] h-[19px] leading-[160%] text-primary">${initials}</div>
                </div>
                <h3 class="text-[13px] font-normal">${item.responsible}</h3>
              </div>
              <div class="flex items-center gap-2 justify-center">
                ${priorityIcon}
                <span class="text-[13px] font-medium">${item.priority}</span>
              </div>
            </div>
            <div class="my-3 flex items-center justify-between">
              <div class="bg-table-hover rounded-full flex items-center justify-center gap-1 h-[27px] !w-[97px]">
                <div class="icon stratis-calendar-check"></div>
                <span class="!text-[12px] font-medium">${item.date}</span>
              </div>
              <div class="flex items-center justify-center gap-1 py-[4.5px]">
                <div class="icon stratis-users-profiles-02"></div>
                <span class="!text-[12px] font-medium">${item.userType}</span>
              </div>
            </div>
          </div>
        `;

        container.innerHTML += cardHtml;
      });
  });
}

// Data yükləmə (API-dən)
function loadQueriesData(page = 1) {
  if (!currentPartnerId) {
    console.error("Partner ID tapılmadı!");
    return;
  }

  currentPage = page;

  // Show loading state
  const containers = ["qaralama-tickets", "baxilir-tickets", "hell-olundu-tickets", "redd-edildi-tickets"];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500">Yüklənir...</div>';
    }
  });

  // Get CSRF token with fallback
  let csrfToken = $('meta[name="csrf-token"]').attr("content");
  if (!csrfToken) {
    // Fallback: try to get from hidden input
    csrfToken = $('input[name="_csrf"]').val();
  }
  console.log("CSRF Token:", csrfToken ? "Found" : "Not found");
  console.log("Partner ID:", currentPartnerId);
  console.log("Fetching tickets for page:", page);

  $.ajax({
    url: `/istifadeci-hovuzu/partner/${currentPartnerId}/tickets/data`,
    type: "POST",
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    data: JSON.stringify({
      search: $("#customSearchSorgular").val() || "",
      start: (page - 1) * pageSize,
      length: pageSize,
      draw: 1
    }),
    success: function (response) {
      if (response.success) {
        queriesData = response.data; // API-dən gələn array
        renderStatusColumns(queriesData);
        updatePagination(response.recordsFiltered, response.recordsTotal);
      } else {
        console.error("API error:", response.error);
        showErrorState();
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX error:", error);
      console.error("Status:", status);
      console.error("Response:", xhr.responseText);

      // Handle specific error cases
      if (xhr.status === 403) {
        console.error("CSRF token invalid or missing");
        alert("Səssiya bitib. Səhifəni yeniləyin və yenidən cəhd edin.");
      } else if (xhr.status === 401) {
        console.error("Unauthorized access");
        alert("İcazəniz yoxdur. Yenidən giriş edin.");
      } else {
        showErrorState();
      }
    },
  });
}

// Pagination yenilə
function updatePagination(filteredRecords, totalRecords) {
  totalPages = Math.ceil(filteredRecords / pageSize);

  const pagination = $("#ticketsPagination");
  const pageInfo = $("#pageInfo");
  const prevBtn = $("#prevPageBtn");
  const nextBtn = $("#nextPageBtn");

  if (totalPages > 1) {
    pagination.removeClass("hidden").addClass("flex");
    pageInfo.text(`Səhifə ${currentPage} / ${totalPages}`);

    // Previous button
    if (currentPage <= 1) {
      prevBtn.prop("disabled", true);
    } else {
      prevBtn.prop("disabled", false);
    }

    // Next button
    if (currentPage >= totalPages) {
      nextBtn.prop("disabled", true);
    } else {
      nextBtn.prop("disabled", false);
    }
  } else {
    pagination.removeClass("flex").addClass("hidden");
  }
}

// Error state göstər
function showErrorState() {
  const containers = ["qaralama-tickets", "baxilir-tickets", "hell-olundu-tickets", "redd-edildi-tickets"];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '<div class="text-center py-4 text-red-500">Xəta baş verdi!</div>';
    }
  });
}

// Ticket detail açma funksiyası
// function openTicketDetail(ticketId) {
//   if (!currentPartnerId || !ticketId) {
//     console.error("Partner ID və ya Ticket ID tapılmadı!");
//     return;
//   }

//   // Show loading modal first
//   // showTicketDetailModal({
//   //   id: ticketId,
//   //   title: "Yüklənir...",
//   //   content: "Sorğu məlumatları yüklənir...",
//   //   status: "",
//   //   priority: "",
//   //   userName: "",
//   //   userEmail: "",
//   //   reasonName: "",
//   //   createdAt: "",
//   //   assignedTo: ""
//   // });

//   // Fetch ticket details
//   $.ajax({
//     url: `/istifadeci-hovuzu/partner/${currentPartnerId}/tickets/${ticketId}`,
//     type: "GET",
//     success: function (response) {
//       if (response.success) {
//         // showTicketDetailModal(response.data);
//         console.log("Ticket detail data:", response.data);
//       } else {
//         console.error("API error:", response.error);
//         alert("Sorğu məlumatları yüklənə bilmədi!");
//       }
//     },
//     error: function (xhr, status, error) {
//       console.error("AJAX error:", error);
//       console.error("Status:", status);
//       console.error("Response:", xhr.responseText);

//       if (xhr.status === 403) {
//         alert("İcazəniz yoxdur. Səhifəni yeniləyin və yenidən cəhd edin.");
//       } else if (xhr.status === 401) {
//         alert("Yenidən giriş edin.");
//       } else if (xhr.status === 404) {
//         alert("Sorğu tapılmadı.");
//       } else {
//         alert("Xəta baş verdi!");
//       }
//     },
//   });
// }

// Ticket detail modal göstərmə funksiyası
// function showTicketDetailModal(ticket) {
//   // Remove existing modal if any
//   $("#ticketDetailModal").remove();

//   const priorityColor = ticket.priority === "High" ? "text-red-600" : "text-yellow-600";
//   const statusColor = getStatusColor(ticket.status);

//   const createdDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('az-AZ') : "";

//   const modalHtml = `
//     <div id="ticketDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//         <div class="flex justify-between items-center mb-4">
//           <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Sorğu Detalları</h2>
//           <button onclick="closeTicketDetailModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
//             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
//             </svg>
//           </button>
//         </div>

//         <div class="space-y-4">
//           <!-- Header Info -->
//           <div class="grid grid-cols-2 gap-4">
//             <div>
//               <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Sorğu ID:</label>
//               <p class="text-gray-800 dark:text-white">${ticket.id}</p>
//             </div>
//             <div>
//               <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Status:</label>
//               <p class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
//                 ${ticket.status}
//               </p>
//             </div>
//           </div>

//           <!-- Title -->
//           <div>
//             <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Başlıq:</label>
//             <p class="text-gray-800 dark:text-white font-medium">${ticket.title}</p>
//           </div>

//           <!-- Content -->
//           <div>
//             <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Məzmun:</label>
//             <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-1">
//               <p class="text-gray-700 dark:text-gray-200">${ticket.content}</p>
//             </div>
//           </div>

//           <!-- User Info -->
//           <div class="grid grid-cols-2 gap-4">
//             <div>
//               <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Göndərən:</label>
//               <p class="text-gray-800 dark:text-white">${ticket.userName}</p>
//               ${ticket.userEmail ? `<p class="text-sm text-gray-500">${ticket.userEmail}</p>` : ''}
//             </div>
//             <div>
//               <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Prioritet:</label>
//               <p class="${priorityColor} font-medium">${ticket.priority}</p>
//             </div>
//           </div>

//           <!-- Additional Info -->
//           ${ticket.reasonName ? `
//           <div>
//             <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Səbəb:</label>
//             <p class="text-gray-800 dark:text-white">${ticket.reasonName}</p>
//           </div>
//           ` : ''}

//           ${ticket.assignedTo && ticket.assignedTo.length > 0 ? `
//           <div>
//             <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Məsul şəxs:</label>
//             <p class="text-gray-800 dark:text-white">${ticket.assignedTo.map(a => a.name).join(", ")}</p>
//           </div>
//           ` : ''}

//           <!-- Dates -->
//           <div class="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Yaradılma tarixi:</label>
//               <p class="text-gray-600 dark:text-gray-400">${createdDate}</p>
//             </div>
//             ${ticket.updatedAt && ticket.updatedAt !== ticket.createdAt ? `
//             <div>
//               <label class="text-sm font-medium text-gray-600 dark:text-gray-300">Yenilənmə tarixi:</label>
//               <p class="text-gray-600 dark:text-gray-400">${new Date(ticket.updatedAt).toLocaleDateString('az-AZ')}</p>
//             </div>
//             ` : ''}
//           </div>
//         </div>

//         <div class="flex justify-end mt-6">
//           <button onclick="closeTicketDetailModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
//             Bağla
//           </button>
//         </div>
//       </div>
//     </div>
//   `;

//   $("body").append(modalHtml);
// }

// // Modal bağlama funksiyası
// function closeTicketDetailModal() {
//   $("#ticketDetailModal").remove();
// }

// Status rəngi əldə etmə funksiyası
function getStatusColor(status) {
  switch (status) {
    case "Qaralama":
      return "bg-gray-100 text-gray-800";
    case "Baxılır":
      return "bg-yellow-100 text-yellow-800";
    case "Həll olundu":
      return "bg-green-100 text-green-800";
    case "Rədd edildi":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Search funksiyası
function handleSearch() {
  currentPage = 1; // Reset to first page on search
  loadQueriesData(1);
}

// Reload button handler
$("#reload_btn").on("click", function () {
  loadQueriesData(currentPage);
});

// Search input handler
$("#customSearchSorgular").on("keyup", function () {
  // Debounce search
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    currentPage = 1; // Reset to first page on search
    handleSearch();
  }, 300);
});

// Pagination event handlers
$(document).on("click", "#prevPageBtn", function () {
  if (currentPage > 1) {
    loadQueriesData(currentPage - 1);
  }
});

$(document).on("click", "#nextPageBtn", function () {
  if (currentPage < totalPages) {
    loadQueriesData(currentPage + 1);
  }
});

// Initialize on page load
$(document).ready(function () {
  // Get partner ID from hidden input
  currentPartnerId = $("#currentPartnerId").val();

  if (!currentPartnerId) {
    console.error("Partner ID tapılmadı!");
    return;
  }

  // Load initial data when sorgular tab is visible
  if ($("#sorgular").is(":visible")) {
    loadQueriesData();
  }

  // Load data when sorgular tab is clicked
  $(document).on('click', '[data-tab="sorgular"]', function () {
    setTimeout(() => {
      if ($("#sorgular").is(":visible")) {
        loadQueriesData();
      }
    }, 100);
  });

  // Ticket card click handler - navigate to detail page
  $(document).on('click', '.ticket-card', function (e) {
    e.preventDefault();
    const ticketId = $(this).data('ticket-id');

    if (ticketId && currentPartnerId) {
      // Navigate to ticket detail page
      window.location.href = `/istifadeci-hovuzu/partner/${currentPartnerId}/tickets/${ticketId}`;
    }
  });
});