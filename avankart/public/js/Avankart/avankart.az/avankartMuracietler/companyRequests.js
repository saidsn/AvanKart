// TH checkbox-un idarəsi
$(document).on("change", "#companyRequestsCheckbox", function () {
  const isChecked = $(this).is(":checked");
  $("#companyRequestsTable tbody input[type='checkbox']")
    .prop("checked", isChecked)
    .trigger("change");
});

// Satırdakı checkbox-lar dəyişəndə TH checkbox-u kontrol et
$(document).on("change", "#companyRequestsTable tbody input[type='checkbox']", function () {
  const all = $("#companyRequestsTable tbody input[type='checkbox']").length;
  const checked = $("#companyRequestsTable tbody input[type='checkbox']:checked").length;

  $("#companyRequestsCheckbox").prop("checked", all > 0 && all === checked);
});

// Satırdakı checkbox-lar dəyişəndə TH checkbox-u kontrol et
$(document).on("change", "#companyRequestsTable tbody input[type='checkbox']", function () {
  const all = $("#companyRequestsTable tbody input[type='checkbox']").length;
  const checked = $("#companyRequestsTable tbody input[type='checkbox']:checked").length;

  $("#companyRequestsCheckbox").prop("checked", all > 0 && all === checked);

  // ✅ Sətir seçimi rənglənsin
  const $row = $(this).closest("tr");
  const isDark = $("html").hasClass("dark");

  if ($(this).is(":checked")) {
    $row
      .addClass("row-selected")
      .css("background-color", isDark ? "#242c30" : "#f6f6f6");
  } else {
    $row.removeClass("row-selected").css("background-color", "");
  }
});

// Checkbox dəyişikliklərini izləyən funksiya
$(document).on("change", "#companyRequestsTable tbody input[type='checkbox']", function () {
  const selectedCount = $(
    "#companyRequestsTable tbody input[type='checkbox']:checked"
  ).length;
  const $categoryCount = $("#category-count");

  if (selectedCount > 0) {
    // Seçilən varsa, button göstər
    $categoryCount.html(`
      <button onclick="toggleDeleteModal('this')" class="cursor-pointer flex items-center gap-1.5 text-error hover:bg-error-hover py-1 px-2 rounded-[4px]">
        <div class="icon stratis-trash-01 text-xs"></div>
        <span class="text-[13px] font-medium">Seçilənləri sil</span>
      </button>
    `);
  } else {
    // Heç bir checkbox seçilməyibsə, default yazı
    const totalCount = $("#companyRequestsTable tbody tr").length; // ümumi abunəlik sayı
    $categoryCount.text(`Abunəliklər (${totalCount})`);
  }
});