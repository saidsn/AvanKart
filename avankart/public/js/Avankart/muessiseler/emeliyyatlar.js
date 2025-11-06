// Global dəyişənlər
let currentEmeliyyatlarView = "main"; // 'main', 'years', 'months', 'table'
let selectedEmeliyyatlarYear = null;
let selectedEmeliyyatlarMonth = null;
let csrfToken;

// Görünüşləri idarə edən funksiya
function setEmeliyyatlarView(view) {
  currentEmeliyyatlarView = view;
  $("#clickable-card").addClass("hidden");
  $("#yearsContainer").addClass("hidden");
  $("#monthsContainer").addClass("hidden");
  $("#tableContainer").addClass("hidden");
  $("#backButton").addClass("hidden");

  if (view === "main") {
    $("#clickable-card").removeClass("hidden");
    $("#modalTitle").text("");
  } else if (view === "years") {
    $("#yearsContainer").removeClass("hidden");
    $("#modalTitle").text(`Hesablaşma`);
    $("#backButton").removeClass("hidden");
    $("#backArrow").removeClass("hidden");
    loadYears();
  } else if (view === "months") {
    $("#monthsContainer").removeClass("hidden");
    $("#modalTitle").text(`${selectedEmeliyyatlarYear}`);
    $("#backButton").removeClass("hidden");
    $("#backArrow").removeClass("hidden");
    loadMonths(selectedEmeliyyatlarYear);
  } else if (view === "table") {
    $("#tableContainer").removeClass("hidden");
    $("#modalTitle").text(
      `${selectedEmeliyyatlarYear} - ${selectedEmeliyyatlarMonth}`
    );
    showSelectedValues(); // Seçilmiş dəyərləri burada göstərir
    // Cədvəli yükləyən funksiyanı burada çağırın
    // initializeEmeliyyatlarTable();
  }
}

// Seçilmiş dəyərləri sıfırlayan funksiya
function resetSelectedValues() {
  selectedEmeliyyatlarYear = null;
  selectedEmeliyyatlarMonth = null;
  $("#selectedValues").addClass("hidden");
  setEmeliyyatlarView("years");
}

// Seçilmiş dəyərləri göstərən funksiya
function showSelectedValues() {
  const container = $("#selectedValues");
  if (selectedEmeliyyatlarYear && selectedEmeliyyatlarMonth) {
    container.removeClass("hidden");
    container.html(`
            <div class="px-2 flex gap-6 items-center">
                <div class="flex gap-1 items-center">
                    <div class="icon stratis-calendar-07 text-xs"></div>
                    ${selectedEmeliyyatlarYear} - ${selectedEmeliyyatlarMonth}
                </div>
                <div class="icon stratis-x-02 text-xs cursor-pointer" onclick="resetSelectedValues()"></div>
            </div>
        `);
  }
}

// İlləri yükləyən funksiya
function loadYears() {
  const container = $("#years");
  container
    .empty()
    .html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');
  let date = new Date()
  let currentYear = new Date(date).getFullYear()
  container.empty();
  for (let year = currentYear; year >= 2023; year--) {
    const yearData = { year: year, count: Math.floor(Math.random() * 12) + 1 };
    container.append(renderYearCard(yearData));
  }

  $(".year-card").on("click", function () {
    selectedEmeliyyatlarYear = $(this).data("year");
    setEmeliyyatlarView("months");
  });
}

// İl kartının HTML-i
function renderYearCard(data) {
  return `
        <div class="year-card py-6 pl-6 min-w-[237px] border-b-[.5px] border-stroke hover:bg-input-hover cursor-pointer" data-year='${data.year}'>
            <p class="text-[15px] font-medium text-messages">${data.year}</p>
            <p class="text-[11px] text-tertiary-text mt-1">${data.count} invoys</p>
        </div>
    `;
}

// Ayları API-dən yükləyən funksiya
function loadMonths(year) {
  const container = $("#months");
  container
    .empty()
    .html('<p class="text-gray-500 text-center w-full">Yüklənir...</p>');

  $.ajax({
    url: `/api/avankart/sirket/hesablasma/invoys-months.json`,
    type: "GET",
    data: { year: year },
    contentType: "application/json",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    success: function (response) {
      container.empty();
      response.data.forEach((month) => {
        container.append(renderMonthCard(month));
      });
      $(".month-card").on("click", function () {
        const month = $(this).data("month");
        selectedEmeliyyatlarMonth = month;
        console.log("Seçilmiş ay:", selectedEmeliyyatlarMonth);
        setEmeliyyatlarView("table");
      });
    },
    error: function () {
      container.html(
        '<p class="text-red-500 text-center w-full">Aylar məlumatı yüklənmədi.</p>'
      );
    },
  });
}

// Ay kartının HTML-i
function renderMonthCard(data) {
  return `
        <div class="month-card pl-6 py-6 max-w-[237px] w-full border-b-[.5px] border-stroke hover:bg-input-hover cursor-pointer" data-month='${data.month}'>
            <p class="text-[15px] font-medium text-messages">${data.month}</p>
            <p class="text-[11px] text-tertiary-text mt-1">${data.count} invoys</p>
        </div>
    `;
}

// DOM yükləndikdən sonra işləyən jQuery kodu
$(document).ready(function () {
  csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Geri düyməsinə klik funksiyası
  $("#backButton").on("click", function () {
    if (currentEmeliyyatlarView === "years") {
      setEmeliyyatlarView("main");
    } else if (currentEmeliyyatlarView === "months") {
      setEmeliyyatlarView("years");
    } else if (currentEmeliyyatlarView === "table") {
      setEmeliyyatlarView("months");
    }
  });

  // Başlanğıc "clickable-card" üçün klik hadisəsi
  $("#clickable-card").on("click", function () {
    setEmeliyyatlarView("years");
  });

  // Başlanğıcda yalnız "clickable-card" göstərilir
  setEmeliyyatlarView("main");
});
