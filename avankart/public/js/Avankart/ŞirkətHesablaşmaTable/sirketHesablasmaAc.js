$(document).ready(function () {
  let table = $("#myTable").DataTable({
    paging: true,
    info: false,
    dom: "t",
    processing: true,
    serverSide: false, 
    ajax: {
      url: "/api/avankart/muessise/hesablasmaAc.json", 
      type: "GET",
      dataSrc: function (json) {
        return json.data || [];
      },
    },
    columns: [
      {
        data: null,
        render: function (data, type, row) {
          return `<div class="flex items-center gap-2.5">
                    <div class="bg-table-hover">
                      <img src="${row.logo}" class="w-[40px] h-[40px] rounded-full object-cover" alt="Logo">
                    </div>
                    <div class="w-full">
                      <div class="text-[13px] font-medium">${row.companyName}</div>
                      <div class="text-[11px] text-messages opacity-65 font-normal mt-1">
                        ID: <span class="text-[#161E22] opacity-100"> CM-XXXXXXXX</span>
                      </div>
                    </div>
                  </div>`;
        },
      },
      {
        data: "transactionNumber",
        render: function (data) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark ml-5   justify-center font-normal">${data}</span>`;
        },
      },
      {
        data: "finalAmount",
        render: function (data) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark  justify-center font-normal">${data} AZN</span>`;
        },
      },
    ],
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
      $(row)
        .find("td")
        .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A] cursor-pointer");
      $(row).find("td:not(:last-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });
      $(row).find("td:last-child").addClass("border-l-[.5px] border-stroke");
    },
    initComplete: function () {
      $("#myTable thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });
      $("#myTable thead th:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });
      $("#myTable thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex w-[120px] gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 p-2 mt-1 text-messages"></div></div>'
        );
      });
    },
    drawCallback: function () {
      var api = this.api();
      var pageInfo = api.page.info();
      var $pagination = $("#customPagination");
      if (pageInfo.pages === 0) {
        $pagination.empty();
        return;
      }
      $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
      $pagination.empty();
      const colCount = $("#myTable thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable tbody").prepend(spacerRow);
      const $lastRow = $("#myTable tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });
      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid #E0E0E0",
      });
    },
  });

  // Axtarış (əgər varsa)
  $("#customSearch2").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Səhifə dəyişdirmə funksiyası (əgər varsa)
  window.changePage = function (page) {
    table.page(page).draw("page");
  };
});


// Dropdown açıb-bağlamaq üçün
window.toggleDropdown_subject = function () {
  const dropdown = document.getElementById("dropdown_subject");
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    dropdown.classList.add("visible");
  } else {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("visible");
  }
};

// Dropdown menyuları xaricində klikdə bağlamaq üçün
document.addEventListener("click", function (event) {
  const subjectDropdown = document.getElementById("dropdown_subject");
  const subjectButton = document.getElementById("dropdownDefaultButton_subject");
  if (subjectButton && subjectDropdown) {
    if (
      !subjectButton.contains(event.target) &&
      !subjectDropdown.contains(event.target)
    ) {
      subjectDropdown.classList.add("hidden");
      subjectDropdown.classList.remove("visible");
    }
  }
});

// Slider init funksiyası
function initSlider() {
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("destroy");
  }
  $("#slider-range").slider({
    range: true,
    min: globalMinAmount,
    max: globalMaxAmount,
    values: [globalMinAmount, globalMaxAmount],
    slide: function (event, ui) {
      $("#min-value").text(formatCurrency(ui.values[0]));
      $("#max-value").text(formatCurrency(ui.values[1]));
    },
  });

  // İlk dəyərləri yaz
  $("#min-value").text(formatCurrency(globalMinAmount));
  $("#max-value").text(formatCurrency(globalMaxAmount));
}

// Filter modal açıb-bağlamaq üçün
window.openFilterModal = function () {
  if ($("#filterPop").hasClass("hidden")) {
    $("#filterPop").removeClass("hidden");
  } else {
    $("#filterPop").addClass("hidden");
  }
};

window.closeFilterModal = function () {
  $("#filterPop").addClass("hidden");
};

// Filterləri tətbiq et
window.applyFilters = function () {
  currentFilters = {};

  // Tarix aralığını al
  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();

  if (startDate) currentFilters.start_date = startDate;
  if (endDate) currentFilters.end_date = endDate;

  // Subyektləri al
  const subjects = [];
  $('#dropdown_subject input[type="checkbox"]:checked').each(function () {
    const subjectId = $(this).attr("id");
    subjects.push(subjectId.replace("subyekt-", ""));
  });
  if (subjects.length > 0) currentFilters.subjects = subjects;

  // Kart kateqoriyalarını al
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });
  if (cardCategories.length > 0) currentFilters.card_category = cardCategories;

  // Təyinatı al
  const cardDestinations = [];
  $('input[name="card_destination"]:checked').each(function () {
    cardDestinations.push($(this).val());
  });
  if (cardDestinations.length > 0) currentFilters.cardDestinations = cardDestinations;

  // Statusları al
  const cardStatus = [];
  $('input[name="card_status"]:checked').each(function () {
    cardStatus.push($(this).val());
  });
  if (cardStatus.length > 0) currentFilters.cardStatus = cardStatus;

  // Məbləğ aralığını al (slider)
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);
    if (minValue !== null && maxValue !== null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
  }

  // Məlumat cədvəlini yenilə
  if (dataTable) {
    dataTable.ajax.reload(null, false);
  }

  // Filter modalını bağla
  $("#filterPop").addClass("hidden");
};

// Filterləri təmizlə
window.clearFilters = function () {
  // Reset form
  $("#filterForm")[0].reset();
  $("#startDate").val("");
  $("#endDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  // Slider sıfırla
  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [globalMinAmount, globalMaxAmount]);
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  // Filterləri sıfırla
  currentFilters = {};

  // DataTable yenilə
  if (dataTable) {
    dataTable.ajax.reload(null, true);
  }
};