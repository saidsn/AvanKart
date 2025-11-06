// Global dəyişənlər
let queriesData = []; // API və ya başqa mənbədən gələn data

// Statuslara uyğun rəng xəritəsi
const colorMap = {
  Qaralama: "bg-[#BFC8CC]",
  Baxılır: "bg-[#F9B100]",
  "Həll olundu": "bg-[#32B5AC]",
  "Rədd edildi": "bg-[#DD3838]",
};

/* ========================== PROFIL MƏLUMATINI YÜKLƏ ========================== */
/*  BU BLOKU ƏLAVƏ ETDİM — MÖVCUD KODLARA DƏYMİR  */

// Header və “Şəxsi məlumatlar” hissələrini doldurmaq üçün köməkçilər
const statusDotColors = {
  Aktiv: "bg-[#4FC3F7]",
  Deaktiv: "bg-[#BDBDBD]",
  "Silinmə gözləyir": "bg-[#FFCA28]",
  Silinib: "bg-[#EF5350]",
  Tamamlandı: "bg-[#66BB6A]",
  "—": "bg-[#FF7043]",
};

function getCsrf() {
  return $('meta[name="csrf-token"]').attr("content") || "";
}

// URL-dən admin_id çıxar (ADM-xxxx və ya PM-xxxx) — yalnız URL-dən götür!
function extractAdminId() {
  const path = window.location.pathname || "";
  const m = path.match(/(ADM|PM)-[A-Za-z0-9-]+/i);
  return m ? m[0] : null;
}

// Şəxsi məlumatlar hissəsində label görə dəyəri yaz
function setPersonalRow(labelText, valueHtml) {
  const $row = $(
    ".space-y-1 > .flex.justify-between, .space-y-1 > .flex.justify-between.items-center"
  )
    .filter(function () {
      const $lab = $(this).find("span").first();
      return $lab && $lab.text().trim().replace(/\s+/g, " ") === labelText;
    })
    .first();
  if ($row.length) {
    // dəyər span/div ikinci elementdir
    const $val = $row.children().last();
    $val.html(valueHtml);
  }
}

// Header hissəsini doldur (Ad Soyad, ID, İnişial)
function fillHeader(profile) {
  const $header = $(".border-b.border-stroke.pb-5").first();

  // Ad Soyad – bir neçə ehtiyat selektorla
  const $nameEl = $header.find("h2.text-[17px]").first().length
    ? $header.find("h2.text-[17px]").first()
    : $header.find("h2").first();
  $nameEl.text(profile.fullName || "—");

  // ID
  const $idLabel = $header
    .find("span")
    .filter(function () {
      return $(this).text().trim() === "ID:";
    })
    .first();
  if ($idLabel.length) {
    const $idVal = $idLabel.next("span");
    if ($idVal.length) $idVal.text(profile.adminId || "—");
  }

  // İnişial / Avatar
  const $avatar = $header.find("div.w-16.h-16.rounded-full").first();
  if ($avatar.length) {
    if (profile.avatarUrl) {
      $avatar.css({
        backgroundImage: `url("${profile.avatarUrl}")`,
        backgroundSize: "cover",
        color: "transparent",
      });
    } else {
      $avatar
        .css({ backgroundImage: "", color: "" })
        .text((profile.initials || "").slice(0, 2).toUpperCase());
    }
  }
}

// Status pillini yenilə
function fillStatus(statusText) {
  const color = statusDotColors[statusText] || statusDotColors["—"];
  const $row = $(
    ".space-y-1 > .flex.items-center.py\\[9\\.5px\\].px-2, .space-y-1 > .flex.justify-between.items-center.py\\[9\\.5px\\].px-2"
  )
    .filter(function () {
      return $(this).find("span").first().text().trim() === "Status:";
    })
    .first();

  if ($row.length) {
    const $pill = $row.find("span.flex.items-center.gap-2");
    const $dot = $pill.find("span.w-\\[6px\\].h-\\[6px\\].rounded-full");
    // dot rəngi
    $dot.removeClass(function (_, cls) {
      return (cls || "")
        .split(" ")
        .filter(
          (c) =>
            c.startsWith("bg[") ||
            c.startsWith("bg-[") ||
            c.startsWith("bg-#") ||
            c.startsWith("bg-")
        )
        .join(" ");
    });
    $dot.addClass(color);
    // mətn
    $pill
      .contents()
      .filter(function () {
        return this.nodeType === 3;
      })
      .remove(); // text düyünlərini təmizlə
    $pill.append(document.createTextNode(" " + (statusText || "—")));
  }
}

// 2FA ikonunu yenilə
function fillTwoFA(enabled) {
  const $row = $(".space-y-1 > .flex.justify-between.py\\[9\\.5px\\].px-2")
    .filter(function () {
      return (
        $(this).find("span").first().text().trim() === "2 addımlı doğrulama:"
      );
    })
    .first();

  if ($row.length) {
    const $icon = $row.find(".icon").first();
    if (!$icon.length) return;
    $icon
      .removeClass(
        "stratis-minus-circle-contained text-error stratis-check-verified-01"
      )
      .removeClass(function (_, cls) {
        return (cls || "")
          .split(" ")
          .filter((c) => c.startsWith("text-[") || c.startsWith("text-"))
          .join(" ");
      });

    if (enabled) {
      $icon.addClass("stratis-check-verified-01 text-[#32B5AC]");
    } else {
      $icon.addClass("stratis-minus-circle-contained text-error");
    }
  }
}

// Profil məlumatını yüklə və UI-ə yaz
async function fetchAndRenderProfile() {
  try {
    const adminId = extractAdminId();
    if (!adminId) {
      console.warn("admin_id tapılmadı (URL-də yoxdur).");
      return;
    }
    const url = `/istifadeci-hovuzu/people/adminPanel/table/${encodeURIComponent(
      adminId
    )}/profile`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-CSRF-Token": getCsrf(),
      },
      credentials: "same-origin",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json?.ok) throw new Error(json?.error || "Profil məlumatı yoxdur");

    const p = json.data || {};

    // Header (Ad Soyad, ID, İnişial) — BURADA AD DƏYİŞİR
    fillHeader(p);

    // Personal info rows
    setPersonalRow("Cinsi:", p.gender || "—");
    setPersonalRow("Doğum tarixi:", p.birthDate || "—");
    setPersonalRow("Vəzifə:", p.jobTitle || "—");
    setPersonalRow("Email:", p.email || "—");
    setPersonalRow("Üzvlük:", p.membership || "—");
    setPersonalRow("Telefon nömrəsi:", p.phone || "—");
    setPersonalRow("Qeydiyyat tarixi:", p.registrationDateText || "—");
    setPersonalRow("Qeydiyyat müddəti:", p.registrationDuration || "—");

    fillStatus(p.status || "—");
    fillTwoFA(!!p.twoFA);
  } catch (e) {
    console.error("Profil məlumatı yüklənmədi:", e);
  }
}
/* ======================== /PROFIL MƏLUMATINI YÜKLƏ ========================= */

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
    url: "/api/avankart/istifadeciHovuzu/adminPanel/adminPanel-sorgular-table.json",
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

$("#reload_btn").on("click", function (){
  loadQueriesData();
})

// Səhifə yüklənəndə
$(document).ready(function () {
  $("#queriesSection").show();

  // Əvvəl profilə aid məlumatları çək və UI-ni doldur (Ad Soyad BURADA DƏYİŞİR)
  fetchAndRenderProfile();

  // Sorğular siyahısını yüklə
  loadQueriesData();

  // Search funksiyası
  $("#customSearch").on("keyup", function () {
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

// Filter modal functions
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

// Dropdown functions
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

// Bu funksiyalar dropdown menyuları xaricində hər hansı bir yerə basıldıqda bağlamaq üçündür
document.addEventListener("click", function (event) {
  const subjectDropdown = document.getElementById("dropdown_subject");
  const subjectButton = document.getElementById(
    "dropdownDefaultButton_subject"
  );

  if (
    !subjectButton.contains(event.target) &&
    !subjectDropdown.contains(event.target)
  ) {
    subjectDropdown.classList.add("hidden");
    subjectDropdown.classList.remove("visible");
  }
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");

  // Başqa açıq dropdown varsa, onu bağla
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // Öz dropdown-unu aç/bağla
  dropdown.classList.toggle("hidden");

  // Xaricə kliklənəndə bağla
  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// Tesdiq modal functions
window.openDeAktivModal = function () {
  if ($("#deAktivModal").hasClass("hidden")) {
    $("#deAktivModal").removeClass("hidden");
  } else {
    $("#deAktivModal").addClass("hidden");
  }
};

window.closeDeAktivModal = function () {
  $("#deAktivModal").addClass("hidden");
};

// Silinmə Müraciət Popup funksiyaları
window.openSilinmeMuracietPopUp = function () {
  if ($("#silinmeMuracietPopUp").hasClass("hidden")) {
    $("#silinmeMuracietPopUp").removeClass("hidden");
  } else {
    $("#silinmeMuracietPopUp").addClass("hidden");
  }
};

window.closeSilinmeMuracietPopUp = function () {
  $("#silinmeMuracietPopUp").addClass("hidden");
};

// Confirm Moda functions
// window.openConfirmModal = function () {
//   if ($("#confirmModal").hasClass("hidden")) {
//     $("#confirmModal").removeClass("hidden");
//     startCountdown();
//   } else {
//     $("#confirmModal").addClass("hidden");
//   }
// };

// window.closeConfirmModal = function () {
//   $("#confirmModal").addClass("hidden");
// };

// Mail adresi popup funksiyaları
window.openMailadressiPopup = function () {
  if ($("#mailadressiPopup").hasClass("hidden")) {
    $("#mailadressiPopup").removeClass("hidden");
  } else {
    $("#mailadressiPopup").addClass("hidden");
  }
};

window.closeMailadressiPopup = function () {
  $("#mailadressiPopup").addClass("hidden");
};

// Two-step verification popup funksiyaları
window.openTwoStepVerificationPop = function () {
  if ($("#twoStepVerificationPop").hasClass("hidden")) {
    $("#twoStepVerificationPop").removeClass("hidden");
  } else {
    $("#twoStepVerificationPop").addClass("hidden");
  }
};

window.closeTwoStepVerificationPop = function () {
  $("#twoStepVerificationPop").addClass("hidden");
};
