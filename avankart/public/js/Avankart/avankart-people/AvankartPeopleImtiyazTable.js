
$(document).ready(function () {
  const $cardsContainer = $("#imtiyazKartlari .flex.flex-col.w-full");
  const csrfToken = $('meta[name="csrf-token"]').attr('content');
  const peopleId = window.location.pathname.split("/").pop();

  let statusMap = [];
  let currentCardId = null;
  let selectedReasonIds = [];

  // ============================================
  // 1️⃣ KART STATUSLARINI YÜKLƏ
  // ============================================
  window.loadCardStatuses = function () {
    $.ajax({
      url: `/api/people/usercard-status/${peopleId}`,
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      success: function (result) {
        statusMap = result.data || [];
        console.log("🗺️ Kart statusları:", statusMap);
        loadCards();
      },
      error: function (xhr, status, error) {
        console.error("Kart statusları alınarkən xəta:", error);
        loadCards();
      }
    });
  }

  // ============================================
  // 2️⃣ KARTLARI YÜKLƏ VƏ RENDER ET
  // ============================================
  function loadCards() {
    $.ajax({
      url: "/api/people/imtiyaz-cards",
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      dataType: "json",
      success: function (result) {
        const cards = result.cards || [];
        $cardsContainer.html("");

        if (cards.length === 0) {
          $cardsContainer.append(`
            <p class="text-center py-4 text-gray-500">Heç bir kart tapılmadı</p>
          `);
          return;
        }

        cards.forEach(card => {
          const bgColor = card.background_color || "#FFBC0D";
          const iconSrc = card.icon
            ? "/" + card.icon.replace(/\\/g, "/").split("/").map(encodeURIComponent).join("/")
            : "/images/default-icon.svg";

          const isActive = statusMap.some(s => s.cardId === card._id.toString() && s.isActive);

          $cardsContainer.append(`
            <div class="flex justify-between items-center border-b border-[#0000001A] w-full py-2">
              <div class="h-full py-[12px] px-[20px] flex gap-[8px]">
                <div class="rounded-[8px] p-[8px] w-[34px] h-[34px]" style="background-color:${bgColor}">
                  <img src="${iconSrc}" class="w-[20px] h-[20px]" alt="${card.name}" />
                </div>
                <span class='flex flex-col gap-[4px]'>
                  <p class="text-[13px] font-medium">${card.name}</p>
                  <p class="text-[#1D222BA6] text-[13px] font-light w-80">
                    ${card.description || "Kart haqqında məlumat yoxdur."}
                  </p>
                </span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer mr-4">
                <input type="checkbox" class="sr-only peer" data-active="${isActive}" data-id="${card._id}" ${isActive ? "checked" : ""}>
                <div class="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-[#9C78AE] transition-colors"></div>
                <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
          `);
        });

        attachToggleEvents();
        console.log("✅ Kartlar render olundu");
      },
      error: function (xhr, status, error) {
        console.error("Kartlar yüklənərkən xəta:", error);
        $cardsContainer.html(`<p class="text-center py-4 text-red-500">Kartlar yüklənərkən xəta baş verdi.</p>`);
      }
    });
  }

  // ============================================
  // 3️⃣ TOGGLE EVENT-LƏRİNİ ƏLAVƏ ET
  // ============================================
  function attachToggleEvents() {
    $cardsContainer.find('input[type="checkbox"]').on('change', function () {
      const cardId = $(this).attr("data-id");
      const isActive = $(this).is(':checked');
      window.tempCardId = cardId;

      console.log("Toggle: cardId =", cardId, "isActive =", isActive);

      if (isActive) {
        fillKartPopup(peopleId, cardId);
        $('#kartPopUp').removeClass('hidden');
      } else {
        openCancelPopUp(cardId, peopleId);
      }
    });
  }

  // ============================================
  // 4️⃣ DEAKTIV POPUP-U AÇ
  // ============================================
  function openCancelPopUp(cardId, peopleId) {
    console.log("🔍 Səbəblər sorğusu: cardId =", cardId, "peopleId =", peopleId);

    $.ajax({
      url: `/api/people/requests/${cardId}/reasons/${peopleId}`,
      method: "GET",
      headers: { "Csrf-token": csrfToken },
      success: function (res) {
        console.log("✅ Səbəblər cavabı:", res);

        const reasons = res.data || res.reasons || [];
        const $ul = $("#cancelPopUp ul");
        $ul.html("");

        if (reasons.length === 0) {
          $ul.append(`
            <li class="py-4 text-center text-gray-500">
              <p>Səbəb mövcud deyil</p>
            </li>
          `);
        } else {
          reasons.forEach((reason, index) => {
            const id = `n${index + 1}Checkbox`;
            const reasonText = reason.description || reason.name || "Səbəb";
            const reasonId = reason._id || reason.id;

            $ul.append(`
              <li class="border-b-1 border-stroke py-2 flex w-full gap-3">
                <input type="checkbox" id="${id}" class="peer hidden reason-checkbox" data-reason-id="${reasonId}">
                <label for="${id}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                  <div class="icon stratis-check-01 scale-60 hidden peer-checked:block"></div>
                </label>
                <label for="${id}" class="text-[15px] cursor-pointer">${reasonText}</label>
              </li>
            `);
          });
        }

        attachReasonCheckboxEvents();
        $("#cancelPopUp").removeClass("hidden");
      },
      error: function (xhr, status, error) {
        console.error("❌ Səbəblər yüklənərkən xəta:");
        console.error("Status:", status);
        console.error("Error:", error);
        console.error("Response:", xhr.responseJSON || xhr.responseText);

        // Xəta mesajını göstər
        const errorMsg = xhr.responseJSON?.message || xhr.responseText || "Səbəblər yüklənərkən xəta baş verdi";
        alert(errorMsg);

        // Toggle-ı geri qaytar
        const checkbox = $(`input[data-id="${cardId}"]`);
        checkbox.prop('checked', true);
      }
    });
  }

  // ============================================
  // 5️⃣ SƏBƏB SEÇİMİ EVENT-LƏRİ
  // ============================================
  function attachReasonCheckboxEvents() {
    selectedReasonIds = [];
    $(".reason-checkbox").on("change", function () {
      const reasonId = $(this).data("reason-id");
      if ($(this).is(":checked")) {
        selectedReasonIds.push(reasonId);
      } else {
        selectedReasonIds = selectedReasonIds.filter(id => id !== reasonId);
      }
      console.log("Seçilmiş səbəblər:", selectedReasonIds);
    });
  }

  // ============================================
  // 6️⃣ OTP MODAL FUNKSİYALARI
  // ============================================
  function openOtpModal(email, action) {
    $("#confirmModal .userEmail").text(email);
    $("#confirmModal").removeClass("hidden");
    $("#confirmModal").attr("data-action", action);
    startCountdown(300);
    clearOtpInputs();
  }

  function closeOtpModal() {
    $("#confirmModal").addClass("hidden");
    clearOtpInputs();
  }

  function clearOtpInputs() {
    $(".otp-input").val("");
    $(".otp-input").first().focus();
  }

  function startCountdown(seconds) {
    let remaining = seconds;
    const $countdown = $("#countdown");

    const interval = setInterval(() => {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      $countdown.text(`${mins}:${secs.toString().padStart(2, '0')}`);

      if (remaining <= 0) {
        clearInterval(interval);
        $countdown.text("Vaxt bitdi");
      }
      remaining--;
    }, 1000);
  }

  // ============================================
  // 7️⃣ KART POPUP-UNU DOLDUR
  // ============================================
  function fillKartPopup(peopleId, cardId) {
    window.activeCardId = cardId;
    console.log("📌 Popup açılır, peopleId:", peopleId, "cardId:", cardId);

    $.ajax({
      url: `/api/people/${peopleId}/user-active-summary/${cardId}`,
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      success: function (data) {
        console.log("📦 Backend-dən data alındı:", data);

        if (!data || !data.userInfo) return;

        // Şəxsi məlumatlar
        const user = data.userInfo;
        const personalInfoDiv = $(".personalInfo");
        personalInfoDiv.find("span:nth-child(2)").eq(0).text(`${user.name} ${user.surname}`);
        personalInfoDiv.find("span:nth-child(2)").eq(1).text(user.gender === "male" ? "Kişi" : user.gender === "female" ? "Qadın" : "-");
        personalInfoDiv.find("span:nth-child(2)").eq(2).text(new Date(user.birth_date).toLocaleDateString() || "-");
        personalInfoDiv.find("span:nth-child(2)").eq(3).text(user.duty || "-");
        personalInfoDiv.find("span:nth-child(2)").eq(4).text(user.email || "-");
        personalInfoDiv.find("span:nth-child(2)").eq(5).text(user.sirket_name || "-");
        personalInfoDiv.find("span:nth-child(2)").eq(6).text(user.phone || "-");

        // Deaktiv səbəblər
        const reasonsDiv = $("#popUpContent .deactiveReasons");
        reasonsDiv.html("");
        const reasons = data.requestInfo?.reasons || [];
        if (reasons.length === 0 && data.requestInfo?.actionMessage) {
          reasonsDiv.append(`<p class="text-[13px] font-medium py-3">${data.requestInfo.actionMessage}</p>`);
        } else if (reasons.length > 0) {
          reasons.forEach((reason) => {
            reasonsDiv.append(`<p class="text-[13px] font-medium py-3 border-b-1 border-stroke">${reason.title || reason.description}</p>`);
          });
        } else {
          reasonsDiv.append(`<p class="text-[13px] font-medium py-3">Səbəb mövcud deyil</p>`);
        }

        // Aktiv kartlar
        const activeCardsDiv = $(".activeCardsList");
        activeCardsDiv.html("");
        const activeCards = data.activeCards || [];
        activeCards.forEach((card) => {
          activeCardsDiv.append(`
          <div class="bg-[#FAFAFA] rounded-[16px] px-4 py-2 flex items-center gap-5">
            <div
              class="rounded-full flex items-center justify-center w-[34px] h-[34px]"
              style="background-color: ${card.background_color || '#E5E5E5'};"
            >
              <img src="/${card.card_icon.replace(/\\/g, '/')}" class="w-[18px] h-[18px]" />
            </div>
            <p class="text-[13px] font-medium">${card.card_name}</p>
          </div>
        `);
        });

        // 🔹 Keçmiş müraciətləri table-a yazırıq
        // 🔹 Keçmiş müraciətləri table-a yazırıq
        const tableBody = $("#popUpTable tbody");
        tableBody.html(""); // əvvəlki məlumatları təmizləyirik
        const allRequests = data.allRequests || [];

        allRequests.forEach((item) => {
          const date = item.createdAt || "-"; // tarix formatı
          const type = item.actionMessage || "-";

          // type-ə görə rəng
          const colorProccessClass = type === 'Kartın deaktiv edilməsi' ? 'text-red-500' : 'text-green-500';

          // result üçün status mapping: active -> Təsdiqlənib, rejected -> Rədd edilib, pending -> Gözləyir
          const resultText =
            item.status === 'active' ? 'Təsdiqlənib' :
              item.status === 'rejected' ? 'Rədd edilib' :
                'Gözləyir';

          // status rəngi
          const colorDot =
            resultText === 'Təsdiqlənib' ? 'fill-[#32B5AC]' :
              resultText === 'Rədd edilib' ? 'fill-[#DD3838]' :
                'fill-[#FFA100]';

          tableBody.append(`
    <tr class="bg-white border-b-1 dark:bg-menu-dark rounded-lg px-[20px] py-[22px]" style="height:68px">
      <td class="px-[20px] py-[22px] text-[13px] text-messages dark:text-primary-text-color-dark font-normal">
        ${date}
      </td>
      <td class="px-[20px] py-[22px] text-[13px] dark:text-primary-text-color-dark font-normal ${colorProccessClass}">
        ${type}
      </td>
      <td class="mx-[20px] my-[22px] text-[13px] flex items-center text-messages dark:text-primary-text-color-dark font-normal">
        <div class="bg-[#FAFAFA] px-2 rounded-full flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="${colorDot}" fill="currentColor" width="30px" height="30px" viewBox="0 0 20 20">
            <path d="M7.8 10a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0-4.4 0z"/>
          </svg>
          <span>${resultText}</span>
        </div>
      </td>
    </tr>
  `);
        });


        $("#kartPopUp").removeClass("hidden");
      },
      error: function (err) {
        console.error("❌ Backend-dən data alınarkən xəta:", err);
        alert("Məlumatları yükləmək mümkün olmadı");
      }
    });
  }


  // ============================================
  // 8️⃣ BUTTON EVENT-LƏRİ
  // ============================================

  // Deaktiv et düyməsi
  $(document).on("click", "[data-action='deactivate']", function () {
    console.log("🔴 Deaktiv et düyməsi basıldı");

    $.ajax({
      url: "/api/people/send-deactivate-otp",
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      contentType: "application/json",
      data: JSON.stringify({
        cardId: window.tempCardId,
        peopleId: peopleId,
      }),
      success: function (response) {
        console.log("✅ Deaktiv OTP göndərildi:", response);
        $("#cancelPopUp").addClass("hidden");
        openOtpModal(response.email, "deactivate");
      },
      error: function (xhr) {
        console.error("❌ OTP göndərilərkən xəta:", xhr.responseJSON);
        alert(xhr.responseJSON?.message || "OTP göndərilərkən xəta baş verdi");
      }
    });
  });

  // Aktiv et düyməsi
  $(document).on("click", "[data-action='activate']", function () {
    console.log("🟢 Aktiv et düyməsi basıldı");

    $.ajax({
      url: "/api/people/activate-user-card",
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      contentType: "application/json",
      data: JSON.stringify({
        peopleId: peopleId,
        cardId: window.tempCardId
      }),
      success: function (response) {
        console.log("✅ Aktiv OTP göndərildi:", response);
        $("#kartPopUp").addClass("hidden");
        if (response.success && response.otpRequired) {
          openOtpModal(response.email, "activate");
        }
      },
      error: function (err) {
        console.error("❌ OTP göndərilmə zamanı xəta:", err);
        alert("OTP göndərilə bilmədi");
      }
    });
  });

  // OTP təsdiqlə düyməsi
  $("#confirmOtpBtn").on("click", function (e) {
    e.preventDefault();

    const otpInputs = $(".otp-input");
    let otp = "";
    otpInputs.each(function () {
      otp += $(this).val().trim();
    });

    if (otp.length !== 6) {
      alertModal("Zəhmət olmasa 6 rəqəmli OTP-ni daxil edin");
      return;
    }

    const action = $("#confirmModal").attr("data-action");
    const apiUrl = action === "activate"
      ? "/api/people/confirm-activate-user-card"
      : "/api/people/accept-deactivate-otp";

    const requestData = {
      otp1: otp[0],
      otp2: otp[1],
      otp3: otp[2],
      otp4: otp[3],
      otp5: otp[4],
      otp6: otp[5],
      peopleId: peopleId,
      cardId: window.tempCardId
    };

    if (action === "deactivate") {
      requestData.reasonIds = selectedReasonIds;
    }

    $.ajax({
      url: apiUrl,
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      contentType: "application/json",
      data: JSON.stringify(requestData),
      success: function (response) {
        console.log("✅ OTP təsdiqləndi:", response);
        alertModal(response.message || "Əməliyyat uğurla tamamlandı");
        closeOtpModal();
        loadCardStatuses();
      },
      error: function (xhr) {
        console.error("❌ OTP təsdiq edilərkən xəta:", xhr.responseJSON);
        alert(xhr.responseJSON?.message || "OTP təsdiq edilərkən xəta baş verdi");
      }
    });
  });

  // Yenidən göndər düyməsi
  $("#resendOtpBtn").on("click", function (e) {
    e.preventDefault();

    const $btn = $(this);
    if ($btn.prop("disabled")) return;

    $btn.prop("disabled", true);

    const action = $("#confirmModal").attr("data-action");
    const apiUrl = action === "activate"
      ? "/api/people/activate-user-card"
      : "/api/people/send-deactivate-otp";

    $.ajax({
      url: apiUrl,
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      contentType: "application/json",
      data: JSON.stringify({
        cardId: window.tempCardId,
        peopleId: peopleId,
      }),
      success: function (response) {
        console.log("✅ Yeni OTP göndərildi:", response);
        startCountdown(300);
        setTimeout(() => $btn.prop("disabled", false), 5000);
      },
      error: function (xhr) {
        console.error("❌ OTP yenidən göndərilərkən xəta:", xhr.responseJSON);
        alert(xhr.responseJSON?.message || "OTP yenidən göndərilərkən xəta baş verdi");
        setTimeout(() => $btn.prop("disabled", false), 5000);
      }
    });
  });

  // ============================================
  // 9️⃣ MODAL BAĞLAMA BUTTON-LARI
  // ============================================
  $(".closeCancel").on("click", function () {
    $("#cancelPopUp").addClass("hidden");
    loadCardStatuses();
  });

  $(".closeKart").on("click", function () {
    $("#kartPopUp").addClass("hidden");
    loadCardStatuses();
  });

  window.closeConfirmModal = function () {
    closeOtpModal();
  };

  // ============================================
  // 🔟 OTP INPUT DAVRANIŞI
  // ============================================
  $(document).on("input", ".otp-input", function () {
    const $this = $(this);
    const val = $this.val();

    if (!/^\d*$/.test(val)) {
      $this.val("");
      return;
    }

    if (val.length === 1) {
      $this.next(".otp-input").focus();
    }
  });

  $(document).on("keydown", ".otp-input", function (e) {
    if (e.key === "Backspace" && $(this).val() === "") {
      $(this).prev(".otp-input").focus();
    }
  });

  // ============================================
  // ✅ İLKİN YÜKLƏMƏ
  // ============================================
  loadCardStatuses();
});


// ------------------------------------------------------------------


// Imtiyaz Kartlari Section 2

$(document).ready(function () {
  const peopleId = window.location.pathname.split("/").pop();
  const apiUrl = `/api/people/requests/${peopleId}`;
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  const $table = $("#muracietKecmisiTable");
  const $tbody = $table.find("tbody");
  const $searchInput = $("#customSearchImtiyaz");
  const $cardsContainer = $(".cardContainer");

  // Global seçilmiş row məlumatı
  window.selectedRow = null;

  // 📦 Cədvəli yükləyən əsas funksiya
  function loadRequests(filters = {}) {
    $.ajax({
      url: apiUrl,
      method: "POST",
      dataType: "json",
      headers: { "Csrf-token": csrfToken },
      contentType: "application/json",
      data: JSON.stringify(filters),
      success: function (response) {
        console.log("📦 Gələn data:", response);
        $tbody.html("");

        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          response.data.forEach((item) => {
            const card = item.card || "Naməlum kart";
            const date = item.date || "-";
            const type = item.type || "-";
            const result = item.result || "-";
            const resultDate = item.resultDate || "-";
            const rowId = item.id;
            const modalId = `clickModal-${rowId}`;

            const colorProccessClass =
              type === "Kartın deaktiv edilməsi" ? "text-red-500" : "text-green-500";
            const colorDot = {
              "Təsdiqlənib": "fill-[#32B5AC]",
              "Rədd edilib": "fill-[#DD3838]",
              "Gözləyir": "fill-[#FFA100]",
            };

            $tbody.append(`
              <tr class="bg-white relative border-b-1 dark:bg-menu-dark rounded-lg mb-2 mt-2" style="height:48px;">
                <td class="px-5 py-4 text-[15px] font-medium">${card}</td>
                <td class="px-15 py-4 text-[15px] font-normal">${date}</td>
                <td class="px-15 py-4 text-[15px] font-normal ${colorProccessClass}">${type}</td>
                <td class="px-15 py-4 text-[15px] font-normal">${resultDate}</td>
                <td class="pl-15 my-4 text-[15px] w-40 font-normal">
                  <div class='bg-[#FAFAFA] px-2 rounded-full flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" class='${colorDot[result]}' width="30px" height="30px" viewBox="0 0 20 20">
                      <path d="M7.8 10a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0-4.4 0z"/>
                    </svg>
                    <span>${result}</span>
                  </div>
                </td>
                <td class="py-4 px-5 absolute right-0 border-l-1 border-stroke">
                  <div class="relative inline-block">
                    <div class="icon stratis-dot-vertical dropdown text-[20px] cursor-pointer z-100 ${result !== 'Gözləyir' ? 'text-gray-400 cursor-not-allowed' : ''}" 
                         onclick="openClickModal('${modalId}', '${rowId}', '${result}')">
                    </div>
                    <div class="absolute right-[-12px] mt-2 w-40 z-50 dropdown-inside">
                      <div class="relative h-[8px]">
                        <div class="absolute top-1/2 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-white z-50"></div>
                      </div>
                      <div id="${modalId}" class="hidden rounded-xl shadow-lg bg-white overflow-hidden relative z-50">
                        <div class="py-[3.5px] text-sm">
                          <div class="confirmRequest flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                            <span class="icon stratis-file-check-02 text-[13px]"></span>
                            <span class="font-medium text-[#1D222B] text-[13px]">Təsdiqlə</span>
                          </div>
                          <div class="h-px bg-stroke my-1"></div>
                          <div class="rejectRequest flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-error-hover">
                            <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
                            <span class="font-medium text-error text-[13px]">Rədd et</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            `);
          });
        } else {
          $tbody.html(`<tr><td colspan="6" class="text-center py-4 text-gray-500">Heç bir müraciət tapılmadı</td></tr>`);
        }
      },
      error: function (xhr, status, error) {
        console.error("❌ Sorğu zamanı xəta:", error);
        $tbody.html(`<tr><td colspan="6" class="text-center py-4 text-red-500">Xəta baş verdi</td></tr>`);
      },
    });
  }

  // İlk yükləmə
  loadRequests();

  // 🔄 Reload düyməsi
  $("#reloadBtnForCards").on("click", function (e) {
    e.preventDefault();
    loadRequests({ search: $searchInput.val().trim() });
  });

  // 🔍 Axtarış
  $searchInput.on("input", function () {
    const searchTerm = $(this).val().trim();
    loadRequests({ search: searchTerm });
  });

  // ⚙️ Modal açmaq üçün
  window.openClickModal = function (modalId, rowId, rowStatus) {
    if (rowStatus !== "Gözləyir") return;
    window.selectedRow = { modalId, id: rowId, status: rowStatus };
    console.log("Seçilmiş row:", window.selectedRow);
    $(`#${modalId}`).removeClass("hidden");
  };

  // 🎴 Filter modalını açmaq
  window.openFilterModalForImtiyaz = function () {
    $("#imtiyazFilterPop").removeClass("hidden");
  };

  // 🎴 Kartları yüklə
  function loadCards() {
    $.ajax({
      url: "/api/people/imtiyaz-cards",
      method: "POST",
      headers: { "Csrf-token": csrfToken },
      contentType: "application/json",
      data: JSON.stringify({ query: "" }),
      success: function (response) {
        if (response.success && Array.isArray(response.cards)) {
          const $wrapper = $('<div class="flex items-center flex-wrap gap-4"></div>');
          $cardsContainer.html($wrapper);

          response.cards.forEach((card) => {
            const safeId = card._id || Math.random().toString(36).substr(2, 9);
            const safeName = card.name || "Naməlum kart";
            const checkboxId = `cbx-imtiyaz-${safeName.toLowerCase().replace(/\s+/g, "-")}`;

            const label = `
              <label for="${checkboxId}"
                class="flex items-center gap-2 cursor-pointer select-none text-[13px] font-normal"
                data-id="${safeId}">
                <input type="checkbox" id="${checkboxId}" class="peer hidden" name="card_category" value="${safeName}">
               <div
                                        class="bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary
                           peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                                        <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center">
                                        </div>
                                    </div>
                <div>${safeName}</div>
              </label>`;
            $wrapper.append(label);
          });
        } else {
          $cardsContainer.html(`<div class="text-gray-500 text-sm">Heç bir kart tapılmadı</div>`);
        }
      },
      error: function (xhr, status, error) {
        console.error("❌ Kartlar yüklənərkən xəta:", error);
        $cardsContainer.html(`<div class="text-red-500 text-sm">Xəta baş verdi</div>`);
      },
    });
  }

  // 🧩 Filter tətbiqi
  window.applyImtiyazFilters = function () {
    const startDate = $("#imtiyazStartDate").val() || null;
    const endDate = $("#imtiyazEndDate").val() || null;

    const cardCategories = [];
    $(".cardContainer input[type='checkbox']:checked").each(function () {
      const id = $(this).closest("label").data("id");
      cardCategories.push({ id });
    });

    const requestTypes = [];
    $("input[name='request_type']:checked").each(function () {
      const labelText = $(this).parent().text().trim();
      requestTypes.push(labelText);
    });

    const statuses = [];
    $("input[name='request_status']:checked").each(function () {
      const val = $(this).val();
      if (val === "gozleyir") statuses.push("pending");
      else if (val === "tesdiq") statuses.push("active");
      else if (val === "redd") statuses.push("rejected");
    });

    const filters = { startDate, endDate, cardCategories, requestTypes, statuses };

    console.log("📤 Backendə göndərilən filter:", filters);
    loadRequests(filters);
    $("#imtiyazFilterPop").addClass("hidden");
  };
  window.clearImtiyazFilters1 = function () {
    // 1️⃣ Tarixləri sıfırla
    $("#imtiyazStartDate").val('');
    $("#imtiyazEndDate").val('');

    // 2️⃣ Kart kateqoriyalarının seçimini sıfırla
    $(".cardContainer input[type='checkbox']").prop("checked", false);

    // 3️⃣ Müraciət növlərini sıfırla
    $("input[name='request_type']").prop("checked", false);

    // 4️⃣ Statusları sıfırla
    $("input[name='request_status']").prop("checked", false);

    // 5️⃣ Cədvəli yenilə bütün filterləri boş göndərərək
    window.applyImtiyazFilters();
  };
  window.closeImtiyazFilterModal = function () {
    $("#imtiyazFilterPop").addClass("hidden");
  };

  // Səhifə açılan kimi kartları yüklə
  loadCards();
});




$(document).on('click', function (e) {
  const $trigger = $(e.target).closest('.dropdown');
  const $menu = $trigger.siblings('.dropdown-inside');

  // If click happened inside a trigger
  if ($trigger.length) {
    e.stopPropagation();
    // close all other menus
    $('.dropdown-inside').not($menu).addClass('hidden');
    // toggle current
    $menu.toggleClass('hidden');
  } else {
    // Click outside -> close all
    $('.dropdown-inside').addClass('hidden');
  }
});

// Open popup
$(document).on('click', '.confirmBtn', function (e) {
  e.stopPropagation();
  $('#imtiyazPopUp').removeClass('hidden');
});
$(document).on('click', '.cancelBtn', function (e) {
  e.stopPropagation();
  $('#cancelPopUp').removeClass('hidden');
});
// Close popup (Bağla button or X icon)
$(document).on('click', '#cancelPopUp .closeCancel, #cancelPopUp .btn-close', function () {
  $('#cancelPopUp').addClass('hidden');
  loadCardStatuses();
});
// Close popup (Bağla button or X icon)
$(document).on('click', '#imtiyazPopUp .closeBtn, #imtiyazPopUp .btn-close', function () {
  $('#imtiyazPopUp').addClass('hidden');
});
$(document).on('click', '#kartPopUp .closeCancel, #kartPopUp .btn-close', function () {
  $('#cancelPopUp').addClass('hidden');
  loadCardStatuses();
});
// Prevent closing when clicking inside the popup content
$(document).on('click', '#popUpContent', function (e) {
  e.stopPropagation();
});

// Close when clicking outside popup
$(document).on('click', '#imtiyazPopUp', function () {
  $('#imtiyazPopUp').addClass('hidden');

});
$(document).on('click', '#kartPopUp', function () {
  $('#kartPopUp').addClass('hidden');

});
$(document).on('click', '#cancelPopUp', function () {

  $('#cancelPopUp').addClass('hidden');

});
// Open popup
$(document).on('click', '.send', function (e) {
  e.stopPropagation();
  e.preventDefault()

  $('#confirmModalImtiyaz').removeClass('hidden');
});

const toggleSwitch = document.getElementById("toggleSwitch");

// Store the actual current state
let currentState = toggleSwitch.checked;
let pendingState = currentState;

// Prevent direct changes - revert and show confirmation
toggleSwitch.addEventListener("change", function (e) {
  const attemptedState = e.target.checked;

  // If user is trying to change to a different state, show confirmation
  if (attemptedState !== currentState) {
    // Revert the visual change immediately
    toggleSwitch.checked = currentState;

    // Store what they're trying to change to
    pendingState = attemptedState;

    // Show appropriate popup based on CURRENT state (not pending)
    if (!currentState) {
      // Toggle is currently ON, user wants to turn OFF - show kartPopUp
      document.getElementById("kartPopUp").classList.remove("hidden");
      document.getElementById("cancelPopUp").classList.add("hidden");
    } else {
      // Toggle is currently OFF, user wants to turn ON - show cancelPopUp
      document.getElementById("kartPopUp").classList.add("hidden");
      document.getElementById("cancelPopUp").classList.remove("hidden");
    }
  }
});

// closeKart button - hide all popups, no state change
$(".closeKart").on("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("kartPopUp").classList.add("hidden");
  document.getElementById("cancelPopUp").classList.add("hidden");
  document.getElementById("confirmModalImtiyaz").classList.add("hidden");
  loadCardStatuses();
});

// send button - open confirmModalImtiyaz
$(".send").on("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("confirmModalImtiyaz").classList.remove("hidden");
});

// legv button - hide all popups, no state change
$(".legv").on("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("kartPopUp").classList.add("hidden");
  document.getElementById("cancelPopUp").classList.add("hidden");
  document.getElementById("confirmModalImtiyaz").classList.add("hidden");
});

// tesdiq button - apply the pending change
$(".tesdiq").on("click", function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Apply the pending state change
  currentState = pendingState;
  toggleSwitch.checked = currentState;

  // Hide all popups
  document.getElementById("kartPopUp").classList.add("hidden");
  document.getElementById("imtiyazPopUp").classList.add("hidden");
  document.getElementById("cancelPopUp").classList.add("hidden");
  document.getElementById("confirmModalImtiyaz").classList.add("hidden");
});

// Optional: If you need to programmatically set the toggle without confirmation
function setToggleState(newState, skipConfirmation = false) {
  if (skipConfirmation) {
    currentState = newState;
    toggleSwitch.checked = newState;
  } else {
    // This will trigger the confirmation flow
    toggleSwitch.checked = newState;
  }
}
window.openImtiyazFilterModal = function () {
  if ($("#imtiyazFilterPop").hasClass("hidden")) {
    $("#imtiyazFilterPop").removeClass("hidden");
  } else {
    $("#imtiyazFilterPop").addClass("hidden");
  }
};



// Dropdown functions
window.toggleDropdown_imtiyaz_company = function () {
  const dropdown = document.getElementById("dropdown_imtiyaz_company");
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
  const companyDropdown = document.getElementById("dropdown_imtiyaz_company");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_imtiyaz_company"
  );

  if (
    !companyButton.contains(event.target) &&
    !companyDropdown.contains(event.target)
  ) {
    companyDropdown.classList.add("hidden");
    companyDropdown.classList.remove("visible");
  }
});

// Apply filters function
// window.applyImtiyazFilters = function () {
//   console.log("=== Applying filters ===");


//   // Tarix aralığını al
//   const startDate = $('input[name="imtiyazStartDate"]').val();
//   const endDate = $('input[name="imtiyazEndDate"]').val();

//   if (startDate) {
//     currentFilters.imtiyazStartDate = startDate;
//   }

//   if (endDate) {
//     currentFilters.imtiyazEndDate = endDate;
//   }

//   // subyekt-imtiyazləri al
//   const companys = [];
//   $('#dropdown_imtiyaz_company input[type="checkbox"]:checked').each(function () {
//     const companyId = $(this).attr("id");
//     companys.push(companyId.replace("subyekt-imtiyaz-", ""));
//   });


//   // Məbləğ aralığını al (slider)
//   if ($("#imtiyazSliderRange").hasClass("ui-slider")) {
//     const minValue = $("#imtiyazSliderRange").slider("values", 0);
//     const maxValue = $("#imtiyazSliderRange").slider("values", 1);

//     if (minValue !== null && maxValue !== null) {
//       currentFilters.min = minValue;
//       currentFilters.max = maxValue;
//     }
//   }

//   console.log("New currentFilters:", currentFilters);
//   console.log("currentFilters keys:", Object.keys(currentFilters));

//   // Məlumat cədvəlini yenilə
//   if (dataTable) {
//     console.log("Reloading DataTable...");
//     dataTable.ajax.reload(function (json) {
//       console.log("DataTable reload completed");
//     }, false);
//   }

//   // Filter modalını bağla
//   $("#imtiyazFilterPop").addClass("hidden");
// };

// Clear filters function
window.clearImtiyazFilters = function () {
  console.log("=== Clearing filters ===");

  // Reset form
  $("#imtiyazFilterForm")[0].reset();
  $("#imtiyazStartDate").val("");
  $("#imtiyazEndDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  // implement olacaq bu
  if ($("#imtiyazSliderRange").hasClass("ui-slider")) {
    $("#imtiyazSliderRange").slider("values", [0, 10000]);
    $("#imtiyazMinValue").text("0 AZN");
    $("#imtiyazMaxValue").text("10000 AZN");
  }


};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performSearch() {
  const searchValue = $("#customSearchImtiyaz").val();
  filteredData = data.filter(item => {
    // obyektin dəyərlərini massivə çeviririk
    return Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchValue.toLowerCase())
    );
  });
}

// Search inputuna event listener əlavə etmək
$("#customSearchImtiyaz").on("keyup", function (e) {
  performSearch();
});

// Sehifeler arasi kecid GO button ile
$(".go-button").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".page-input");
  let pageNumber = parseInt(pageInput.val());

  // Input sahəsini hər halda təmizləyirik
  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (dataTable) {
      const pageInfo = dataTable.page.info();
      let dataTablePage = pageNumber - 1;

      if (dataTablePage < pageInfo.pages) {
        // Səhifə mövcuddursa, keçid edir
        dataTable.page(dataTablePage).draw("page");
      } else {
        // Səhifə mövcud deyilsə, xəta yazır
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    // Etibarsız girişdə xəta yazır
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

