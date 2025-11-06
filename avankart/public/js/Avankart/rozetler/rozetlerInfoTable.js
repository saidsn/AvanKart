// ==================== GLOBAL DƏYIŞƏNLƏR ====================
let dataTable = null;
let currentFilters = {};
let globalMinAmount = 0;
let globalMaxAmount = 0;
let modalMode = "create";
let editingRozetId = null;
let selectedRozetId = null;
let originalRozetData = null; 

// ==================== DATATABLE İNİSİALİZASİYA ====================
$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  const categoryId = window.location.pathname.split("/").pop();

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₼";
  }

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
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: `/imtiyazlar/rozetler/rozet/${categoryId}`,
        type: "POST",
        contentType: "application/json",
        serverSide: true,
        headers: { "X-CSRF-Token": csrfToken },
        data: function (d) {
          return JSON.stringify({
            user_id: $("#userId").val(),
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
            ...currentFilters,
          });
        },
        dataSrc: function (json) {
          $("#tr_counts").html(json.data.length ?? 0);
          const amounts = json.data.map((tr) => tr.amount);
          globalMinAmount = Math.min(...amounts);
          globalMaxAmount = Math.max(...amounts);
          initSlider();
          return json.data;
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 1,
      columns: [
        { data: (row) => `<div class="flex items-center gap-3"><img src="${row.image_path}" alt="badge" class="w-[75px] h-[59px] object-contain"/></div>` },
        { data: (row) => `<span class="text-[13px] text-messages font-medium">${row.name}</span>` },
        { data: (row) => `<span class="text-[13px] text-messages font-normal">${row.description}</span>` },
        { data: (row) => `<span class="text-[13px] text-messages font-normal">${row.card_category?.name || "Ümumi"}</span>` },
        {
          data: (row) => {
            const targetMap = { xidmet_sayi: "Xidmət sayı", muddet: "Müddət", amount: "Məbləğ", uzvluk: "Üzvlük", active_card_count: "Aktiv kart sayı" };
            return `<span class="text-[13px] text-messages font-normal">${targetMap[row.target] || row.target}</span>`;
          },
        },
        {
          data: (row) => {
            const typeMap = { expense: "Məxaric", target_count: "Hədəf sayı", income: "Mədaxil", account: "Hesab", company: "Şirkət" };
            return `<span class="text-[13px] text-messages font-normal">${typeMap[row.target_type] || row.target_type}</span>`;
          },
        },
        {
          data: (row) => {
            const active = Object.entries(row.conditions || {}).filter(([_, v]) => v !== 0).map(([_, v]) => v).join(", ");
            return `<span class="text-[13px] text-messages font-medium">${active || "-"}</span>`;
          },
        },
        { data: (row) => `<span class="text-[13px] text-messages font-medium">${row.userCount || 0}</span>` },
        {
          data: (row) => {
            const d = new Date(row.createdAt);
            return `<span class="text-[13px] text-messages font-normal">${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}</span>`;
          },
        },
        {
          data: () => `
            <div id="wrapper" class="relative inline-block text-left">
              <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages w-5 h-5 cursor-pointer"></div>
              <div class="hidden absolute right-[-12px] w-30 z-50 dropdown-menu">
                <div class="relative h-[8px]"><div class="absolute top-1/2 right-4 w-3 h-3 bg-white rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div></div>
                <div class="rounded-xl shadow-lg bg-white overflow-hidden relative z-50 border-[.5px] border-stroke">
                  <div class="py-[3.5px] text-sm">
                    <div onclick="openRozetModalFromRow(this)" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                      <span class="icon stratis-edit-03 text-[13px]"></span><span class="font-medium text-[#1D222B] text-[13px]">Redaktə et</span>
                    </div>
                    <div class="h-[.5px] bg-stroke my-1"></div>
                    <div onclick="toggleDeleteModal(this)" class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-error-hover">
                      <span class="icon stratis-trash-01 text-error text-[13px]"></span><span class="font-medium text-error text-[13px]">Sil</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>`,
        },
      ],
      drawCallback: function () {
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();
        if (pageInfo.pages <= 1) return;

        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 leading-tight ${pageInfo.page === 0 ? "text-[#BFC8CC] cursor-not-allowed" : "text-messages cursor-pointer"}" onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
            <div class="icon stratis-chevron-left text-xs"></div>
          </div>`
        );

        let buttons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
          buttons += `<button class="cursor-pointer w-10 h-10 rounded-[8px] ${i === pageInfo.page ? "bg-[#F6D9FF] text-messages" : "bg-transparent text-tertiary-text"}" onclick="changePage(${i})">${i + 1}</button>`;
        }
        buttons += "</div>";
        $pagination.append(buttons);

        $pagination.append(
          `<div class="flex items-center justify-center px-3 h-8 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? "text-[#BFC8CC] cursor-not-allowed" : "text-messages cursor-pointer"}" onclick="changePage(${Math.min(pageInfo.page + 1, pageInfo.pages - 1)})">
            <div class="icon stratis-chevron-right text-xs"></div>
          </div>`
        );
      },
      createdRow: function (row, data) {
        $(row).attr("data-id", data._id);
        $(row).css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () { $(this).css("background-color", $("html").hasClass("dark") ? "#242c30" : "#f6f6f6"); })
          .on("mouseleave", function () { $(this).css("background-color", ""); });
        $(row).find("td").addClass("border-b-[.5px] border-stroke");
        $(row).find("td:not(:last-child)").css({ "padding-left": "20px", "padding-top": "14.5px", "padding-bottom": "14.5px" });
        $(row).find("td:last-child").css({ "padding-right": "0", "text-align": "left" });
      },
    });
  }

  $("#refreshTableBtn").on("click", () => dataTable.ajax.reload(null, false));
  initializeDataTable();

  // ==================== KART KATEQORİYA DÜYMƏ HANDLERLƏRİ ====================
  $(document).on('click', '#customRewardSection .grid-cols-4 button', function () {
    const btnIndex = $(this).index();
    const btnText = $(this).text().trim();

    console.log("🔘 Kart kateqoriya düyməsi kliklədi:", btnIndex, btnText);

    // Bütün düymələrdən aktiv class-ı sil
    $('#customRewardSection .grid-cols-4 button').removeClass('bg-primary text-on-primary');

    // Kliklənən düyməyə əlavə et
    $(this).addClass('bg-primary text-on-primary');

    // Wrapper2-ni əvvəlcə göstər
    const wrapper2 = document.getElementById('targetInputWrapper2');
    if (wrapper2) {
      wrapper2.style.display = 'block';

      // Bütün input-ları gizlət
      Array.from(wrapper2.children).forEach(child => child.style.display = 'none');

      // Seçilən input-u göstər
      // btnIndex: 0=Xidmət sayı, 1=Müddət, 2=Məbləğ, 3=Kart
      // wrapper2.children: 0=Xidmət, 1=Müddət, 2=Məbləğ (Kart üçün input yoxdur)
      if (btnIndex < 3 && wrapper2.children[btnIndex]) {
        wrapper2.children[btnIndex].style.display = 'block';
        console.log("✅ Input göstərildi - index:", btnIndex);
      } else if (btnIndex === 3) {
        console.log("ℹ️ Kart seçildi - input yoxdur");
      }
    } else {
      console.error("❌ targetInputWrapper2 tapılmadı!");
    }
  });

  // ==================== KART KATEQORİYALARI YÜKLƏ ====================
  $.ajax({
    url: `/imtiyazlar/rozetler/cards`,
    method: "GET",
    headers: { "X-CSRF-Token": csrfToken },
    success: function (response) {
      const list = $("#categoryDropdownList");
      list.empty();
      list.append(`<li class="px-3 py-2 hover:bg-gray-100 cursor-pointer" data-id="" onclick="selectCategory(this)">Ümumi</li>`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        response.data.forEach((item) => {
          list.append(`<li class="px-3 py-2 hover:bg-gray-100 cursor-pointer" data-id="${item._id}" onclick="selectCategory(this)">${item.name}</li>`);
        });
      } else {
        list.append(`<li class="px-3 py-2 text-gray-500">Data tapılmadı</li>`);
      }
    },
    error: (xhr, status, error) => console.error("❌ Kateqoriya yüklənmədi:", error),
  });
});

// ==================== GLOBAL FUNKSIYALAR ====================
window.changePage = (page) => dataTable && dataTable.page(page).draw("page");

$("#customSearch").on("keyup", function () {
  dataTable && dataTable.search($(this).val()).draw();
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");
  document.querySelectorAll(".dropdown-menu").forEach((el) => el !== dropdown && el.classList.add("hidden"));
  dropdown.classList.toggle("hidden");
  const tr = triggerElement.closest("tr");
  selectedRozetId = tr ? tr.getAttribute("data-id") : null;
}

document.addEventListener("click", (e) => !e.target.closest("#wrapper") && document.querySelectorAll(".dropdown-menu").forEach((el) => el.classList.add("hidden")));

window.toggleDeleteModal = () => $("#deleteModal").toggleClass("hidden");
window.toggleRozetModal = () => {
  $("#rozetModal").toggleClass("hidden");
  // Modal bağlananda orijinal datanı sıfırla
  if ($("#rozetModal").hasClass("hidden")) {
    originalRozetData = null;
  }
};

function reloadDataTable(selector) {
  const table = $(selector).DataTable();
  table && table.ajax.reload(null, false);
}

// ==================== KATEQORİYA SEÇİMİ ====================
function selectCategory(element) {
  const selectedText = element.innerText.trim();
  const selectedId = element.getAttribute("data-id");
  const selectedCategory = document.getElementById("selectedCategoryText");
  selectedCategory.innerText = selectedText;
  selectedCategory.setAttribute("data-id", selectedId || "");
  document.getElementById("categoryDropdownList").classList.add("hidden");

  const targetSection = document.getElementById("targetTypeSection");
  const customRewardSection = document.getElementById("customRewardSection");

  if (selectedText === "Ümumi") {
    targetSection.classList.remove("hidden");
    customRewardSection.classList.add("hidden");
  } else {
    targetSection.classList.add("hidden");
    customRewardSection.classList.remove("hidden");
  }

  resetTargets();
}

function resetTargets() {
  ["service", "duration", "amount", "membership", "card"].forEach((type) => {
    const section = document.getElementById("target-" + type);
    const btn = document.getElementById("btn-" + type);
    section && section.classList.add("hidden");
    btn && btn.classList.remove("bg-primary", "text-white", "text-on-primary");
  });

  const wrapper2 = document.getElementById("targetInputWrapper2");
  wrapper2 && [...wrapper2.children].forEach((el) => (el.style.display = "none"));
  if (wrapper2) wrapper2.style.display = "none";

  document.querySelectorAll("#customRewardSection .grid-cols-4 button").forEach((btn) => btn.classList.remove("bg-primary", "text-on-primary"));

  if (typeof lastSelectedSpending !== 'undefined') {
    lastSelectedSpending = [];
  }
  document.getElementById("selectedSpending") && (document.getElementById("selectedSpending").textContent = "Seçim edin");
}

// ==================== ROZET YARATMA ====================
function createRozet() {
  const urlParams = window.location.pathname.split("/");
  const selectedCategory = document.getElementById("selectedCategoryText");
  const cardCategoryId = selectedCategory?.getAttribute("data-id") || null;
  const isUmumi = !cardCategoryId || cardCategoryId === "" || cardCategoryId === "undefined";

  const activeTargetBtn = isUmumi
    ? document.querySelector("#buttons button.bg-primary, #buttons button.text-on-primary")
    : document.querySelector("#customRewardSection .grid-cols-4 button.bg-primary, #customRewardSection .grid-cols-4 button.text-on-primary");

  const targetType = activeTargetBtn?.innerText?.trim() || "";
  const targetEnumMap = {
    "Xidmət sayı": "xidmet_sayi",
    "Müddət": "muddet",
    "Məbləğ": "amount",
    "Üzvlük": "uzvluk",
    "Kart": "active_card_count"
  };

  let targetValue = 0, subjectValue = null, transactionValue = null;

  if (isUmumi) {
    const selectors = {
      "Xidmət sayı": "#target-service input",
      "Müddət": "#target-duration input[placeholder='0']",
      "Məbləğ": "#target-amount input[placeholder='Hədəf məbləği']",
      "Üzvlük": "#target-membership input",
      "Kart": "#target-card input",
    };
    targetValue = parseInt($(selectors[targetType])?.val(), 10) || 0;
    if (targetType === "Müddət") subjectValue = $("input[name='subject']:checked").val() || null;
    if (targetType === "Məbləğ") transactionValue = $("input[name='transaction']:checked").val() || null;
  } else {
    const visibleInput = Array.from(document.getElementById("targetInputWrapper2").children).find((el) => el.style.display !== "none");
    if (visibleInput) {
      targetValue = parseInt(visibleInput.querySelector("input[type='number']")?.value, 10) || 0;
      if (targetType === "Məbləğ") transactionValue = visibleInput.querySelector("input[name='transactionType']:checked")?.value || null;
    }
  }

  // Edit zamanı orijinal datadan götür, create zamanı yeni yaradılan
  const profileFile = document.getElementById("profileInput")?.files[0];

  const rozetData = {
    name: $("input[placeholder='Daxil edin']").val()?.trim() || "",
    description: $("textarea[placeholder*='Rozet təsvirini']").val()?.trim() || "",
    rozet_category: urlParams[urlParams.length - 1],
    card_category: cardCategoryId || null,
    target: targetEnumMap[targetType] || null,
    conditions: {
      xidmet_sayi: targetType === "Xidmət sayı" ? targetValue : 0,
      muddet: targetType === "Müddət" ? targetValue : 0,
      amount: targetType === "Məbləğ" ? targetValue : 0,
      uzvluk: targetType === "Üzvlük" ? targetValue : 0,
      active_card_count: targetType === "Kart" ? targetValue : 0,
    },
    target_type: `${subjectValue || ""}${transactionValue ? "_" + transactionValue : ""}`.replace(/^_/, "") || "target_count",
    muessise_category: !isUmumi ? (typeof lastSelectedSpending !== 'undefined' ? lastSelectedSpending : []) : [],
  };

  // Edit zamanı və yeni şəkil seçilməyibsə, köhnə image məlumatlarını saxla
  if (modalMode === "edit" && !profileFile && originalRozetData) {
    rozetData.image_name = originalRozetData.image_name;
    rozetData.image_path = originalRozetData.image_path;
  } else if (profileFile) {
    rozetData.image_name = profileFile.name;
    rozetData.image_path = `/uploads/badges/${profileFile.name}`;
  } else {
    rozetData.image_name = null;
    rozetData.image_path = "/uploads/badges/default_badge.png";
  }

  return rozetData;
}

// ==================== VALİDASİYA ====================
function validateRozetForm() {
  const errors = [];
  const name = $("input[placeholder='Daxil edin']").val()?.trim();
  const description = $("textarea[placeholder*='Rozet təsvirini']").val()?.trim();

  if (!name) errors.push("❌ Rozetin adı boş ola bilməz!");
  if (!description) errors.push("❌ Açıqlama boş ola bilməz!");

  // Edit zamanı şəkil yoxlamasını dəyişdir
  if (modalMode === "create") {
    const profileFile = document.getElementById("profileInput")?.files[0];
    if (!profileFile) errors.push("❌ Şəkil seçilməlidir!");
  }

  const selectedCategoryText = $("#selectedCategoryText").text().trim();
  if (!selectedCategoryText || selectedCategoryText === "Seçim edin") {
    errors.push("❌ Kart kateqoriyası seçilməlidir!");
  }

  const cardCategoryId = $("#selectedCategoryText").attr("data-id");
  const isUmumi = !cardCategoryId || cardCategoryId === "" || cardCategoryId === "undefined";

  console.log("🔍 Validasiya:", {
    selectedCategoryText,
    cardCategoryId,
    isUmumi,
    targetTypeSection_visible: !$("#targetTypeSection").hasClass("hidden"),
    customRewardSection_visible: !$("#customRewardSection").hasClass("hidden")
  });

  const activeTargetBtn = isUmumi
    ? document.querySelector("#buttons button.bg-primary, #buttons button.text-on-primary")
    : document.querySelector("#customRewardSection .grid-cols-4 button.bg-primary, #customRewardSection .grid-cols-4 button.text-on-primary");

  console.log("🔍 Validasiya - isUmumi:", isUmumi, "activeTargetBtn:", activeTargetBtn);

  if (!activeTargetBtn) {
    errors.push("❌ Hədəf növü seçilməlidir!");
    console.error("❌ Aktiv target button tapılmadı!");
    return errors;
  }

  const targetType = activeTargetBtn.innerText.trim();

  // Kart target type-ı üçün input yoxdur, ona görə yoxlama keç
  if (!isUmumi && targetType === "Kart") return errors;

  let targetValue = 0;
  if (isUmumi) {
    const selectors = {
      "Xidmət sayı": "#target-service input",
      "Müddət": "#target-duration input[placeholder='0']",
      "Məbləğ": "#target-amount input[placeholder='Hədəf məbləği']",
      "Üzvlük": "#target-membership input",
      "Kart": "#target-card input",
    };
    targetValue = parseInt($(selectors[targetType])?.val(), 10) || 0;
  } else {
    const visibleInput = Array.from(document.getElementById("targetInputWrapper2").children).find((el) => el.style.display !== "none");
    targetValue = visibleInput ? parseInt(visibleInput.querySelector("input[type='number']")?.value, 10) || 0 : 0;
  }

  if (targetValue <= 0 && targetType !== "Kart") {
    errors.push(`❌ ${targetType} üçün dəyər 0-dan böyük olmalıdır!`);
  }

  if (targetType === "Müddət" && targetValue > 0 && !$("input[name='subject']:checked").val()) {
    errors.push("❌ Müddət növü seçilməlidir!");
  }

  if (targetType === "Məbləğ" && targetValue > 0) {
    const transactionValue = isUmumi ? $("input[name='transaction']:checked").val() : $("input[name='transactionType']:checked").val();
    if (!transactionValue) errors.push("❌ Əməliyyat növü seçilməlidir!");
  }

  if (!isUmumi && (typeof lastSelectedSpending === 'undefined' || !lastSelectedSpending || lastSelectedSpending.length === 0)) {
    errors.push("❌ Müəssisə kateqoriyası seçilməlidir!");
  }

  return errors;
}

// ==================== YADDA SAXLAMA ====================
async function saveRozet() {
  console.log("💾 SaveRozet başladı - Mode:", modalMode);

  const umumiButtons = document.querySelectorAll("#buttons button");
  const kartButtons = document.querySelectorAll("#customRewardSection .grid-cols-4 button");

  console.log("🔍 Debug - Ümumi buttons:", Array.from(umumiButtons).map(b => ({
    text: b.innerText,
    classes: b.className,
    hasPrimary: b.classList.contains('bg-primary')
  })));

  console.log("🔍 Debug - Kart buttons:", Array.from(kartButtons).map(b => ({
    text: b.innerText,
    classes: b.className,
    hasPrimary: b.classList.contains('bg-primary')
  })));

  const errors = validateRozetForm();
  if (errors.length > 0) {
    alertModal("Zəhmət olmasa bütün sahələri doldurun");
    console.log("❌ Validasiya xətaları:", errors);
    return;
  }

  const csrfToken = $("meta[name='csrf-token']").attr("content");
  const rozetData = createRozet();
  const urlParams = window.location.pathname.split("/");
  const categoryId = urlParams[urlParams.length - 1];

  console.log("📤 Göndərilən Data:", {
    mode: modalMode,
    rozetData: rozetData,
    editingRozetId: editingRozetId,
    hasNewImage: !!document.getElementById("profileInput")?.files[0]
  });

  const formData = new FormData();
  formData.append("data", JSON.stringify(rozetData));

  const profileFile = document.getElementById("profileInput")?.files[0];
  if (profileFile) {
    formData.append("files", profileFile);
    console.log("📷 Yeni şəkil əlavə edildi:", profileFile.name);
  } else if (modalMode === "edit") {
    console.log("📷 Köhnə şəkil saxlanılır:", rozetData.image_path);
  }

  const url = modalMode === "create"
    ? `/imtiyazlar/rozetler/rozet/create/${categoryId}`
    : `/imtiyazlar/rozetler/rozet/update/${editingRozetId}`;
  const method = modalMode === "create" ? "POST" : "PUT";

  console.log(`🌐 API çağırılır: ${method} ${url}`);

  try {
    const response = await fetch(url, {
      method,
      headers: { "X-CSRF-Token": csrfToken },
      body: formData
    });
    const result = await response.json();

    console.log("📥 Gələn Cavab:", result);

    if (result.success) {
      alertModal(modalMode === "create" ? "Rozet uğurla yaradıldı!" : "Rozet uğurla redaktə edildi!");
      $("#rozetModal").addClass("hidden");
      originalRozetData = null;
      window.location.reload();
    } else {
      console.error("❌ Server xətası:", result);
      alertModal("Xəta baş verdi: " + (result.message || "Naməlum xəta"));
    }
  } catch (error) {
    console.error("❌ Fetch xətası:", error);
    alertModal("Server xətası! Konsolu yoxlayın.");
  }
}

// ==================== SİLMƏ ====================
async function deleteRozet() {
  if (!selectedRozetId) {
    alertModal("Silinəcək rozet seçilməyib!");
    return;
  }

  const csrfToken = $("meta[name='csrf-token']").attr("content");
  try {
    await $.ajax({
      url: `/imtiyazlar/rozetler/rozet/delete`,
      method: "DELETE",
      contentType: "application/json",
      headers: { "X-CSRF-Token": csrfToken },
      data: JSON.stringify({ id: selectedRozetId }),
    });

    alertModal("Rozet uğurla silindi!");
    $("#deleteModal").addClass("hidden");
    window.location.reload();
  } catch (error) {
    console.error("❌ Silmə xətası:", error);
    alertModal("Rozet silinmədi!");
  }
}

// ==================== MODAL İDARƏSİ ====================
function openRozetModal(mode, data = null) {
  modalMode = mode;
  const $modal = $("#rozetModal");

  console.log(`🔧 Modal açılır - Mode: ${mode}`, data ? "Data var" : "Data yoxdur");

  if (mode === "create") {
    $("#modalTitle").text("Yeni rozet");
    $("#modalConfirmText").text("Yarat");
    $("#rozetModal input[type='text'], #rozetModal textarea, #rozetModal input[type='number']").val("");
    $("#profileInput").val("");
    $("#selectedCategoryText").text("Seçim edin").removeAttr("data-id");
    $("#profilePreview").attr("src", "").addClass("hidden");
    $("#profileHoverOverlay").addClass("hidden");
    $(".iconex-rocket-1").removeClass("hidden");
    $("#targetTypeSection").removeClass("hidden");
    $("#customRewardSection").addClass("hidden");
    $("#targetInputWrapper").addClass("hidden");
    $("#targetInputWrapper2").css("display", "none");
    resetTargets();
    editingRozetId = null;
    originalRozetData = null;

    console.log("✅ CREATE modal hazırlandı");

  } else if (mode === "edit" && data) {
    // Orijinal datanı saxla
    originalRozetData = JSON.parse(JSON.stringify(data));
    console.log("💾 Orijinal data saxlanıldı:", originalRozetData);

    $("#modalTitle").text("Rozeti redaktə et");
    $("#modalConfirmText").text("Dəyişikliyi təsdiqlə");
    $("input[placeholder='Daxil edin']").val(data.name || "");
    $("textarea[placeholder*='Rozet təsvirini']").val(data.description || "");

    // Şəkil göstərilməsi
    if (data.image_path && data.image_path !== "/uploads/badges/default_badge.png") {
      $("#profilePreview").attr("src", data.image_path).removeClass("hidden");
      $(".iconex-rocket-1").addClass("hidden");
      $("#profileHoverOverlay").removeClass("hidden");
    } else {
      $("#profilePreview").addClass("hidden");
      $(".iconex-rocket-1").removeClass("hidden");
      $("#profileHoverOverlay").addClass("hidden");
    }

    // Kateqoriya set et
    if (data.card_category && data.card_category._id) {
      $("#selectedCategoryText").text(data.card_category.name).attr("data-id", data.card_category._id);
      $("#targetTypeSection").addClass("hidden");
      $("#customRewardSection").removeClass("hidden");
      console.log("✅ Kart kateqoriyası set edildi:", data.card_category.name, "ID:", data.card_category._id);
    } else {
      $("#selectedCategoryText").text("Ümumi").removeAttr("data-id");
      $("#targetTypeSection").removeClass("hidden");
      $("#customRewardSection").addClass("hidden");
      console.log("✅ Ümumi kateqoriya set edildi");
    }

    // Müəssisə kateqoriyası set et
    if (data.muessise_category && data.muessise_category.length > 0) {
      window.lastSelectedSpending = [...data.muessise_category];
      $("#selectedSpending").text(data.muessise_category.join(", "));
    } else {
      window.lastSelectedSpending = [];
      $("#selectedSpending").text("Seçim edin");
    }

    // Target type və dəyərini set et
    if (data.target && data.conditions) {
      const targetMap = {
        xidmet_sayi: { btn: "#btn-service", section: "#target-service", input: "#target-service input", text: "Xidmət sayı" },
        muddet: { btn: "#btn-duration", section: "#target-duration", input: "#target-duration input[placeholder='0']", text: "Müddət" },
        amount: { btn: "#btn-amount", section: "#target-amount", input: "#target-amount input[placeholder='Hədəf məbləği']", text: "Məbləğ" },
        uzvluk: { btn: "#btn-membership", section: "#target-membership", input: "#target-membership input", text: "Üzvlük" },
        active_card_count: { btn: "#btn-card", section: "#target-card", input: "#target-card input", text: "Kart" }
      };

      const targetInfo = targetMap[data.target];
      if (targetInfo) {
        console.log("🎯 Target type set edilir:", data.target, targetInfo);

        resetTargets();

        if (data.card_category) {
          // Kart kateqoriyalı rozet üçün (4 düymə var: Xidmət sayı, Müddət, Məbləğ, Kart)
          const btnMap = {
            xidmet_sayi: 0,
            muddet: 1,
            amount: 2,
            active_card_count: 3
          };
          const btns = document.querySelectorAll("#customRewardSection .grid-cols-4 button");
          const btnIndex = btnMap[data.target];

          console.log("📋 Kart kateqoriyalı rozet - Button index:", btnIndex, "Target:", data.target);

          if (btnIndex !== undefined && btns[btnIndex]) {
            btns[btnIndex].className = "py-[10px] border-r border-[#E5E7EB] hover:bg-gray-100 focus:bg-primary focus:text-on-primary transition bg-primary text-on-primary";
            console.log("✅ Button aktivləşdirildi:", btnIndex, btns[btnIndex].innerText);

            // Wrapper-i də göstər
            const wrapper2 = document.getElementById("targetInputWrapper2");
            if (wrapper2) wrapper2.style.display = "block";

            // İnput sahəsini göstər və doldur
            if (wrapper2) {
              console.log("📝 Wrapper2 children sayı:", wrapper2.children.length);

              // Kart üçün input yoxdur (yalnız 0,1,2 index-ləri: Xidmət, Müddət, Məbləğ)
              if (data.target !== "active_card_count" && wrapper2.children[btnIndex]) {
                wrapper2.children[btnIndex].style.display = "block";
                const input = wrapper2.children[btnIndex].querySelector("input[type='number']");
                if (input) {
                  input.value = data.conditions[data.target] || 0;
                  console.log("✅ Input dolduruldu:", data.target, "=", input.value);
                }

                // Əgər məbləğdirsə, əməliyyat növünü də set et
                if (data.target === "amount" && data.target_type) {
                  const transactionType = data.target_type.split("_").pop();
                  const radio = wrapper2.children[btnIndex].querySelector(`input[name="transactionType"][value="${transactionType}"]`);
                  if (radio) {
                    radio.checked = true;
                    console.log("✅ Radio seçildi:", transactionType);
                  }
                }
              } else if (data.target === "active_card_count") {
                console.log("ℹ️ Kart target type-ı üçün input yoxdur");
              }
            }
          }
        } else {
          // Ümumi rozet üçün
          console.log("📋 Ümumi rozet - Target:", data.target, "Button:", targetInfo.btn);

          const btn = $(targetInfo.btn);
          if (btn.length) {
            btn.removeClass();
            btn.addClass("py-[10px] border-r border-[#E5E7EB] hover:bg-gray-100 focus:bg-primary focus:text-on-primary transition text-white bg-primary text-on-primary");
            console.log("✅ Ümumi button aktivləşdirildi:", btn.text());
          } else {
            console.error("❌ Button tapılmadı:", targetInfo.btn);
          }


          $(targetInfo.section).removeClass("hidden");
          $("#targetInputWrapper").removeClass("hidden");
          $(targetInfo.input).val(data.conditions[data.target] || 0);

          console.log("✅ Ümumi rozet input dolduruldu:", data.target, "=", data.conditions[data.target]);

          // Müddət üçün subject set et
          if (data.target === "muddet" && data.target_type) {
            const subject = data.target_type.split("_")[0];
            const radio = $(`input[name='subject'][value='${subject}']`);
            if (radio.length) {
              radio.prop("checked", true);
              radio.siblings('.inner-circle').removeClass('hidden');
              console.log("✅ Müddət subject seçildi:", subject);
            }
          }

          if (data.target === "amount" && data.target_type) {
            const transactionType = data.target_type.split("_").pop();
            const radio = $(`input[name='transaction'][value='${transactionType}']`);
            if (radio.length) {
              radio.prop("checked", true);
              radio.siblings('.inner-circle').removeClass('hidden');
              console.log("✅ Məbləğ transaction seçildi:", transactionType);
            }
          }
        }
      }
    }

    editingRozetId = data._id;
    console.log("✅ EDIT modal hazırlandı - ID:", editingRozetId);
  }

  $modal.removeClass("hidden");
}

function openRozetModalFromRow(triggerElement) {
  const row = $(triggerElement).closest("tr");
  const rowData = dataTable.row(row).data();

  console.log("🔍 Sətirdən data alındı:", rowData);

  if (rowData) {
    openRozetModal("edit", rowData);
  } else {
    console.error("❌ Row data tapılmadı!");
  }
}

// Radio button-lar üçün custom stil handler
$(document).on('change', 'input[type="radio"].radio-input', function () {
  const name = $(this).attr('name');
  // Eyni name-li bütün radio-ların inner-circle-ini gizlət
  $(`input[name="${name}"]`).each(function () {
    $(this).siblings('.inner-circle').addClass('hidden');
  });
  // Yalnız seçilənin inner-circle-ini göstər
  if ($(this).is(':checked')) {
    $(this).siblings('.inner-circle').removeClass('hidden');
  }
});