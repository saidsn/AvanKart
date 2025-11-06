// Global dəyişənlər
let queriesData = []; // API və ya başqa mənbədən gələn data

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
    const col = $("#column-" + status.replace(" ", "-"));
    col.empty();

    // Başlıq
    col.append(`
      <div class="flex items-center gap-2 mb-3">
        <span class="w-[6px] h-[6px] rounded-full ${colorMap[status]}"></span>
        <h3 class="font-medium text-xs">${status}</h3>
      </div>
    `);

    // Kartları statusa görə əlavə et
    data
      .filter((item) => item.status === status)
      .forEach((item) => {
        const initials = item.responsible
          .split(" ")
          .map((n) => n[0])
          .join("");

        const priorityIcon =
          item.priority === "High"
            ? '<img src="/public/images/Avankart/avankartPartner/high.svg" alt="High" class="w-4 h-4"/>'
            : '<img src="/public/images/Avankart/avankartPartner/low.svg" alt="Low" class="w-4 h-4"/>';

        const cardHtml = `
          <div onclick="window.location.href='../../destek/sorgu-detaylari.html'" class="cursor-pointer mb-2 p-3 bg-container-2 rounded-[8px]">
            <div class="flex items-center justify-between">
              <span class="text-[11px] opacity-65">${item.id}</span>
            </div>
            <div class="mt-0.5 mb-3">
              <div class="text-[13px] font-medium mb-1">${item.title}</div>
              <div class="text-[11px] font-normal opacity-65">${item.description}</div>
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

        col.append(cardHtml);
      });
  });
}

// Data yükləmə (API-dən və ya başqa mənbədən)
function loadQueriesData() {
  // Məsələn, AJAX ilə API çağırışı
  $.ajax({
    url: "/api/avankart/istifadeciHovuzu/avankartPartner/avankartPartner-sorgular-table.json",
    type: "GET",
    contentType: "application/json",
    success: function (response) {
      queriesData = response.data; // API-dən gələn array
      renderStatusColumns(queriesData);
    },
    error: function () {
      console.error("Queries data yüklənmədi!");
    },
  });
}




// Səhifə yüklənəndə
$(document).ready(function () {
  loadQueriesData();

  // Search funksiyası
  $("#customSearchSorgular").on("keyup", function () {
    const query = $(this).val().toLowerCase();

    // Filter edilmiş data
    const filteredData = queriesData.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.responsible.toLowerCase().includes(query)
      );
    });

    // Yenidən render et
    renderStatusColumns(filteredData);
  });
});

