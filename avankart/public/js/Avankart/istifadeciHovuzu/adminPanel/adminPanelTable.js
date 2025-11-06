// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
let globalMinAmount = 0;
let globalMaxAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Massivlərin düzgün serialize olunması üçün
  $.ajaxSetup({ traditional: true });

  /* ======================= KONFİQ / HELPERS ======================= */
  // OTP hərəkətlər üçün məcburidir
  const OTP_REQUIRED = true;

  // ADM-xxx → PM-xxx (server hər ikisini qəbul etsə də normallaşdıraq)
  function toApiAdminId(id) {
    return String(id || "").replace(/^ADM-/i, "PM-");
  }

  // Sadə POST helper
  async function apiPost(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken || "",
      },
      body: JSON.stringify(body || {}),
    });
    let data = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || "Xəta baş verdi.";
      throw new Error(msg);
    }
    return data;
  }

  /* =========================== OTP MODAL =========================== */
  // OTP konteksti və gözləyən əməliyyat
  const otpContext = {
    adminId: null, // PM-xxxxx
    action: null, // "set-status" | "request-delete" | "2fa-disable"
    callFn: null, // (otp) => Promise
  };

  // Modalı AÇ – input required + təmizləmə
  function openOtpModal(adminId, action, callFn) {
    otpContext.adminId = adminId ? String(adminId).trim() : null;
    otpContext.action = action || null;
    otpContext.callFn = typeof callFn === "function" ? callFn : null;

    const $modal = $("#twoStepVerificationPop");
    if (!$modal.length) {
      console.warn("OTP modal (#twoStepVerificationPop) tapılmadı.");
      return;
    }
    const $otpInput = $("#otpCodeInput");
    if ($otpInput.length) {
      $otpInput.attr("required", true).val("");
    }
    $("#otpError").text("");
    $modal.removeClass("hidden");
    // UX: input fokus
    setTimeout(() => {
      $otpInput.trigger("focus");
    }, 0);
  }

  // Modalı BAĞLA
  function closeOtpModal() {
    $("#twoStepVerificationPop").addClass("hidden");
    otpContext.adminId = null;
    otpContext.action = null;
    otpContext.callFn = null;
  }

  // Public: menyudan “2 addımlı doğrulamanı ləğv et” klikləri üçün
  window.openTwoStepVerificationPop = function (adminId, action) {
    const apiId = toApiAdminId(adminId);
    openOtpModal(apiId, action || "2fa-disable", async function (otp) {
      // 2FA ləğv et endpoint (lazım olduqda backenddə aktivləşdirin)
      await apiPost(
        `/istifadeci-hovuzu/people/adminPanel/table/${encodeURIComponent(apiId)}/2fa/disable`,
        { otp }
      );
    });
  };

  window.closeTwoStepVerificationPop = function () {
    closeOtpModal();
  };

  // OTP form submit
  $(document).on("submit", "#otpForm", async function (e) {
    e.preventDefault();
    const $otpInput = $("#otpCodeInput");
    const code = ($otpInput.val() || "").trim();

    if (!code) {
      $("#otpError").text("OTP kodu tələb olunur.");
      $otpInput.trigger("focus");
      return;
    }

    try {
      if (typeof otpContext.callFn === "function") {
        await otpContext.callFn(code);
      } else {
        // callFn təyin olunmayıbsa, heç olmasa xəbərdar et
        console.warn("OTP callFn tapılmadı; kontekst:", otpContext);
      }
      closeOtpModal();
      if (dataTable) dataTable.ajax.reload(null, false);
    } catch (err) {
      console.error("OTP əməliyyatı xətası:", err);
      $("#otpError").text(err?.message || "OTP təsdiqlənmədi.");
    }
  });

  // Modal düymələri
  $(document).on("click", "#otpConfirmBtn", function () {
    $("#otpForm").trigger("submit");
  });
  $(document).on("click", "#otpCancelBtn", function () {
    closeOtpModal();
  });
  /* ========================= /OTP MODAL ============================ */

  /* ======================= HƏRƏKƏT FUNKSİYALARI ======================= */
  // Aktiv / Deaktiv – OTP tələb et
  window.adminSetStatus = async function (adminId, action) {
    try {
      const apiId = toApiAdminId(adminId);

      const perform = async (otp) => {
        await apiPost(
          `/istifadeci-hovuzu/people/adminPanel/table/${encodeURIComponent(apiId)}/status`,
          { action, otp }
        );
      };

     
        await perform(null);
        if (dataTable) dataTable.ajax.reload(null, false);
    } catch (err) {
      console.error("adminSetStatus error:", err);
      alert(err?.message || "Status yenilənmədi.");
    }
  };

  // “Silinmə üçün müraciət et” – OTP tələb et
  window.adminRequestDelete = async function (adminId) {
    try {
      const apiId = toApiAdminId(adminId);

      const perform = async (otp) => {
        await apiPost(
          `/istifadeci-hovuzu/people/adminPanel/table/${encodeURIComponent(apiId)}/request-delete`,
          { otp }
        );
      };

      if (OTP_REQUIRED) {
        openOtpModal(apiId, "request-delete", perform);
      } else {
        await perform(null);
        if (dataTable) dataTable.ajax.reload(null, false);
      }
    } catch (err) {
      console.error("adminRequestDelete error:", err);
      alert(err?.message || "Silinmə müraciəti göndərilmədi.");
    }
  };
  /* ===================== /HƏRƏKƏT FUNKSİYALARI ====================== */

  /* ======================= QALAN UI LOJİKASI ======================= */
  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
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

  function setIfExists(selector, value) {
    const $el = $(selector);
    if ($el.length) $el.text(value);
  }

  // status pill-lər
  function updateStatusPills(counters) {
    if (!counters) return;
    const safe = (n) => (typeof n === "number" && !isNaN(n) ? n : 0);
    $("#allButton").length &&
      $("#allButton").html(`Hamısı (${safe(counters.all)})`);
    $("#activeButton").length &&
      $("#activeButton").html(`Aktiv (${safe(counters.active)})`);
    $("#deactiveButton").length &&
      $("#deactiveButton").html(`Deaktiv (${safe(counters.deactive)})`);
    $("#deletedButton").length &&
      $("#deletedButton").html(`Silinmişlər (${safe(counters.deleted)})`);
    $("#pendingButton").length &&
      $("#pendingButton").html(
        `Silinmə gözləyir (${safe(counters.pendingDelete)})`
      );
  }

  // Sütun görünməsi xəritəsi (0: name | 1: gender | 2: date | 3: jobTitle | 4: email | 5: phone | 6: status | 7: actions)
  const columnVisibilityMap = {
    "checkbox-cinsi": 1,
    "checkbox-dogum": 2,
    "checkbox-vezife": 3,
    "checkbox-email": 4,
    "checkbox-telefon": 5,
    "checkbox-status": 6,
    "checkbox-uzvluq": null,
    "checkbox-qeydiyyat": null,
    "checkbox-dogrulama": null,
  };

  function applyColumnVisibilityFromChecks() {
    if (!dataTable) return;
    Object.entries(columnVisibilityMap).forEach(([id, idx]) => {
      if (idx === null || idx === undefined) return;
      const isChecked = $("#" + id).is(":checked");
      dataTable.column(idx).visible(isChecked, false);
    });
    dataTable.columns.adjust().draw(false);
  }

  // ======== Dinamik filter listləri ========
  const getLabel = (it) =>
    it?.name ||
    it?.fullName ||
    it?.title ||
    it?.label ||
    it?.text ||
    String(it?.id ?? it?.value ?? it?._id ?? it?.slug ?? "");

  // Sətirdən "düzgün" user ID-ni seç (backend-in gözlədiyi ola bilər)
  const pickUserId = (r) =>
    r?.userId ?? r?.user_id ?? r?.uid ?? r?._id ?? r?.dbId ?? r?.id;

  function renderCheckboxList(containerSel, items, idPrefix, filterKey) {
    const $container = $(containerSel);
    if (!$container.length) return;

    $container.empty();

    const selected = new Set((currentFilters[filterKey] || []).map(String));
    const frag = document.createDocumentFragment();

    (items || []).forEach((it) => {
      const rawId = (
        it.id ??
        it.value ??
        it._id ??
        it.slug ??
        pickUserId(it) ??
        getLabel(it)
      ).toString();

      const htmlId = `${idPrefix}${rawId.replace(/\s+/g, "-").toLowerCase()}`;
      const labelText = getLabel(it);

      const wrapper = document.createElement("label");
      wrapper.setAttribute("for", htmlId);
      wrapper.className =
        "flex items-center px-4 py-1 text-[13px] hover:bg-input-hover cursor-pointer select-none gap-2 dark:hover:bg-input-hover-dark";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = htmlId;
      input.className = "peer hidden";
      input.setAttribute("data-value", rawId);
      if (selected.has(String(rawId))) input.checked = true;

      const box = document.createElement("div");
      box.className =
        "w-[14px] h-[14px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer";

      const icon = document.createElement("div");
      icon.className =
        "icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center";

      const span = document.createElement("span");
      span.className = "dark:text-white";
      span.textContent = labelText;

      box.appendChild(icon);
      wrapper.appendChild(input);
      wrapper.appendChild(box);
      wrapper.appendChild(span);
      frag.appendChild(wrapper);
    });

    $container.append(frag);
  }

  function deriveFiltersFromRows(rows) {
    const users = [];
    const positions = [];
    const companies = [];
    (rows || []).forEach((r) => {
      const uid = pickUserId(r);
      if (uid && r?.name) users.push({ id: uid, name: r.name });
      if (r?.jobTitle) positions.push({ id: r.jobTitle, title: r.jobTitle });
      const comp = r?.company || r?.companyName;
      if (comp) companies.push({ id: comp, title: comp });
    });

    const byId = (list) => {
      const seen = new Set();
      return list.filter((x) => {
        const key = String(x.id ?? x.title ?? x.name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    return {
      users: byId(users),
      positions: byId(positions),
      companies: byId(companies),
    };
  }

  function keepGendersAlwaysEnabled() {
    $('input[name="card_gender"]').each(function () {
      $(this).prop("disabled", false);
      $(this).closest("label").css("opacity", "");
    });
  }

  function updateFilterOptionsFromBackend(filters, rowsFallback) {
    const src = filters || deriveFiltersFromRows(rowsFallback || []);
    renderCheckboxList(
      "#dropdown_users",
      src.users || [],
      "istifadeci-",
      "users"
    );
    renderCheckboxList(
      "#dropdown_position",
      src.positions || [],
      "subyekt-",
      "positions"
    );
    renderCheckboxList(
      "#dropdown_company",
      src.companies || [],
      "subyekt-",
      "companys"
    );
    keepGendersAlwaysEnabled();
  }

  // ======== DataTable ========
  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    dataTable = $("#myTable").DataTable({
      ajax: {
        url: "/istifadeci-hovuzu/people/adminPanel/table",
        type: "GET",
        dataType: "json",
        headers: { "X-CSRF-Token": csrfToken },
        traditional: true,

        data: function (d) {
          d.user_id = $("#userId").val();

          d.search =
            (typeof d.search === "object" ? d.search.value : d.search) || "";

          Object.assign(d, currentFilters);

          if (currentFilters.users?.length) {
            d["users[]"] = currentFilters.users;
            d["user_ids[]"] = currentFilters.users;
          }
          if (currentFilters.positions?.length) {
            d["positions[]"] = currentFilters.positions;
            d["position_ids[]"] = currentFilters.positions;
          }
          if (currentFilters.companys?.length) {
            d["companys[]"] = currentFilters.companys;
            d["company_ids[]"] = currentFilters.companys;
          }
          if (currentFilters.cardGender?.length) {
            d["gender[]"] = currentFilters.cardGender;
          }

          return d;
        },

        dataSrc: function (json) {
          $("#tr_counts").html(json.data?.length ?? 0);

          if (json.counters) {
            setIfExists("#count_all", json.counters.all);
            setIfExists("#count_aktiv", json.counters.active);
            setIfExists("#count_deaktiv", json.counters.deactive);
            setIfExists("#count_pending", json.counters.pendingDelete);
            setIfExists("#count_silinmis", json.counters.deleted);

            setIfExists('[data-role="count_all"]', json.counters.all);
            setIfExists('[data-role="count_aktiv"]', json.counters.active);
            setIfExists('[data-role="count_deaktiv"]', json.counters.deactive);
            setIfExists(
              '[data-role="count_pending"]',
              json.counters.pendingDelete
            );
            setIfExists('[data-role="count_silinmis"]', json.counters.deleted);

            updateStatusPills(json.counters);
          }

          updateFilterOptionsFromBackend(json.filters, json.data);

          const amounts = (json.data || []).map((tr) => tr.amount);
          globalMinAmount = amounts.length ? Math.min(...amounts) : 0;
          globalMaxAmount = amounts.length ? Math.max(...amounts) : 0;
          initSlider();

          return json.data;
        },
        error: function (xhr, textStatus, err) {
          console.error("DT Ajax error:", xhr.status, textStatus, err);
          console.error("Response:", xhr.responseText);
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 3,
      columns: [
        {
          data: "name",
          render: function (data, type, row) {
            const initials = String(row?.name || "")
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .join("");
            return `
             <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                      ${initials}
                  </div>
                  <div class="flex flex-col">
                      <span class="text-messages text-[13px] font-medium dark:text-white text-left">${row?.name || "—"}</span>
                      <span class="text-secondary-text text-[11px] font-normal dark:text-white text-left">ID: ${row?.id || "—"}</span>
                  </div>
              </div>
            `;
          },
        },
        {
          data: "gender",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "date",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "jobTitle",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "email",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "phone",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: function (row) {
            let color = "";
            switch (row.status) {
              case "Aktiv":
                color = "bg-[#4FC3F7]";
                break;
              case "Deaktiv":
                color = "bg-[#BDBDBD]";
                break;
              case "Tamamlandı":
                color = "bg-[#66BB6A]";
                break;
              case "Silinmə gözləyir":
                color = "bg-[#FFCA28]";
                break;
              case "Silinib":
                color = "bg-[#EF5350]";
                break;
              default:
                color = "bg-[#FF7043]";
            }
            return `
            <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
              <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
              <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status || "—"}</span>
            </div>`;
          },
        },
        {
          data: function (row) {
            const adminIdSafe = String(row?.id || row?._id || "")
              .replace(/'/g, "\\'")
              .trim();

            let dropdownContent = "";
            if (row.status === "Aktiv") {
              dropdownContent = `
              <div onclick="openConfirmModal()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                <span class="icon stratis-password-01 text-[13px] mt-1"></span>
                <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Şifrəni sıfırla</span>
              </div>
              <div onclick="openMailadressiPopup()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                <span class="icon stratis-mail-01 text-[13px] mt-1"></span>
                <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Mail adresini dəyiş</span>
              </div>
              <div onclick="openTwoStepVerificationPop('${adminIdSafe}','2fa-disable')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                <span class="icon stratis-lock-02 text-[13px]"></span>
                <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">2 addımlı doğrulamanı ləğv et</span>
              </div>
              <div onclick="window.adminSetStatus('${adminIdSafe}','deactivate')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                <span class="icon stratis-minus-circle-contained text-error text-[13px]"></span>
                <span class="font-medium text-error text-[13px] whitespace-nowrap">Deaktiv et</span>
              </div>
              <div class="h-[.5px] bg-stroke my-1"></div>
              <div onclick="window.adminRequestDelete('${adminIdSafe}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
              </div>`;
            } else if (row.status === "Deaktiv") {
              dropdownContent = `
               <div class="flex items-center gap-2 px-4 py-[3.5px]">
                <span class="icon stratis-password-01 text-tertiary-text text-[13px] mt-1"></span>
                <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Şifrəni sıfırla</span>
              </div>
               <div class="flex items-center gap-2 px-4 py-[3.5px]">
                <span class="icon stratis-mail-01 text-tertiary-text text-[13px] mt-1"></span>
                <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Mail adresini dəyiş</span>
              </div>
              <div onclick="window.adminSetStatus('${adminIdSafe}','activate')" class="flex items-center gap-2 px-4 py-[3.5px] cursor-pointer hover:bg-input-hover">
                <span class="icon stratis-shield-check text-messages text-[13px]"></span>
                <span class="font-medium text-messages text-[13px] whitespace-nowrap">Aktiv et</span>
              </div>
              <div class="h-[.5px] bg-stroke my-1"></div>
              <div onclick="window.adminRequestDelete('${adminIdSafe}')" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-error-hover cursor-pointer">
                <span class="icon stratis-trash-01 text-error text-[13px]"></span>
                <span class="font-medium text-error text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
              </div>`;
            } else if (row.status === "Silinmə gözləyir") {
              dropdownContent = `
              <div onclick="openSilinmeTesdiqPopUp()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                <span class="icon stratis-file-check-02 text-[13px]"></span>
                <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Silinməni təsdiqlə</span>
              </div>
              <div onclick="openConfirmModal()" class="flex items-center gap-2 px-4 py-[3.5px] hover:bg-input-hover cursor-pointer">
                <span class="icon stratis-file-minus-02 text-[13px]"></span>
                <span class="font-medium text-[#1D222B] text-[13px] whitespace-nowrap">Rədd et</span>
              </div>
              <div class="h-[.5px] bg-stroke my-1"></div>
              <div class="flex items-center gap-2 px-4 py-[3.5px]">
                <span class="icon stratis-trash-01 text-tertiary-text text-[13px]"></span>
                <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
              </div>`;
            } else {
              dropdownContent = `
              <div class="flex items-center gap-2 px-4 py-[3.5px]">
                <span class="icon stratis-file-check-02 text-tertiary-text text-[13px]"></span>
                <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Silinməni təsdiqlə</span>
              </div>
              <div class="flex items-center gap-2 px-4 py-[3.5px]">
                <span class="icon stratis-file-minus-02 text-tertiary-text text-[13px]"></span>
                <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Rədd et</span>
              </div>
              <div class="h-[.5px] bg-stroke my-1"></div>
              <div class="flex items-center gap-2 px-4 py-[3.5px]">
                <span class="icon stratis-trash-01 text-tertiary-text text-[13px]"></span>
                <span class="font-medium text-tertiary-text text-[13px] whitespace-nowrap">Silinmə üçün müraciət et</span>
              </div>`;
            }

            return `
            <div id="wrapper" class="relative inline-block text-left">
              <div onclick="toggleDropdown(this)" class="icon stratis-dot-vertical text-messages text-base cursor-pointer z-100"></div>
              <div class="hidden absolute right-[-12px] max-w-[244px] z-50 dropdown-menu">
                <div class="relative h-[8px]">
                  <div class="absolute top-1/2 right-4 w-3 h-3 bg-menu rotate-45 border-l-[.5px] border-t-[.5px] z-50 border-[.5px] border-stroke"></div>
                </div>
                <div class="rounded-xl shadow-lg bg-menu overflow-hidden relative z-50 border-[.5px] border-stroke">
                  <div class="py-[3.5px] text-sm">
                    ${dropdownContent}
                  </div>
                </div>
              </div>
            </div>`;
          },
        },
      ],
      drawCallback: function () {
        const pageInfo = dataTable.page.info();
        const $pagination = $("#customPagination");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#pageCount").text(`${pageInfo.page + 1} / ${pageInfo.pages || 1}`);

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changePage(' +
            Math.max(0, pageInfo.page - 1) +
            ')">' +
            '<div class="icon stratis-chevron-left text-xs"></div>' +
            "</div>"
        );

        let paginationButtons = '<div class="flex gap-2">';
        for (let i = 0; i < pageInfo.pages; i++) {
          paginationButtons +=
            '<button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark ' +
            (i === pageInfo.page
              ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
              : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark") +
            '" onclick="changePage(' +
            i +
            ')">' +
            (i + 1) +
            "</button>";
        }
        paginationButtons += "</div>";
        $pagination.append(paginationButtons);

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === pageInfo.pages - 1
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changePage(' +
            Math.min(pageInfo.page + 1, pageInfo.pages - 1) +
            ')">' +
            '<div class="icon stratis-chevron-right text-xs"></div>' +
            "</div>"
        );
      },
      createdRow: function (row, data) {
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          })
          .on("mouseleave", function () {
            $(this).css("background-color", "");
          });

        $(row)
          .find("td")
          .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");
        $(row)
          .find("td:not(:last-child)")
          .css({ "padding-top": "14.5px", "padding-bottom": "14.5px" });
        $(row)
          .find("td:last-child")
          .css({ "padding-right": "0", "text-align": "left" });

        // 🔹 Sətir klikində /hovuz/admin/:admin_id yönləndir (ADM -> PM çevrilir)
        $(row).on("click", function (e) {
          const lastTd = $(this).find("td").last()[0];
          if (e.target === lastTd || $(e.target).closest("td")[0] === lastTd) {
            return;
          }
          let adminId =
            (data && (data.adminUser_id || data.id || data._id)) || null;

          if (!adminId) {
            console.warn("adminId tapılmadı:", data);
            return;
          }

          adminId = String(adminId).trim();

          // if (/^ADM-/i.test(adminId)) {
          //   adminId = adminId.replace(/^ADM-/i, "PM-");
          // }

          location.href = `/hovuz/admin/${encodeURIComponent(adminId)}`;
        });
      },
    });

    applyColumnVisibilityFromChecks();
  }

  // init
  initializeDataTable();

  // “Sütunlar” checkbox-ları → sütun görünməsi
  $('#sutunlarPopup input[type="checkbox"]')
    .off("change.columnvis")
    .on("change.columnvis", function () {
      const idx = columnVisibilityMap[this.id];
      if (idx === null || idx === undefined || !dataTable) return;
      dataTable.column(idx).visible(this.checked);
      dataTable.columns.adjust();
    });

  // “Səhifəni yenilə”
  $(document).on(
    "click",
    ".stratis-arrow-refresh-04, a:contains('Səhifəni yenilə')",
    function (e) {
      e.preventDefault();
      if (dataTable) dataTable.ajax.reload(null, false);
    }
  );
});

/* ======================= GLOBAL FUNKSİYALAR ======================= */
window.changePage = function (page) {
  if (dataTable) dataTable.page(page).draw("page");
};

window.toggleActiveStatus = function (element) {
  const allButtons = document.querySelectorAll(
    "#toggleContainer button, #toggleContainer span"
  );
  allButtons.forEach((btn) => {
    btn.classList.remove(
      "bg-inverse-on-surface",
      "font-medium",
      "text-messages"
    );
    btn.classList.add("text-tertiary-text");
  });

  element.classList.add(
    "bg-inverse-on-surface",
    "font-medium",
    "text-messages"
  );
  element.classList.remove("text-tertiary-text");

  const statusText = element.textContent.trim().split(" ")[0];
  if (statusText === "Hamısı") delete currentFilters.status;
  else currentFilters.status = statusText;

  if (dataTable) dataTable.ajax.reload(null, true); // 1-ci səhifəyə
};

// Filter modal
window.openFilterModal = function () {
  $("#filterPop").toggleClass("hidden");
};
window.closeFilterModal = function () {
  $("#filterPop").addClass("hidden");
};

// Dropdowns
window.toggleDropdown_position = function () {
  const el = document.getElementById("dropdown_position");
  el.classList.toggle("hidden");
  el.classList.toggle("visible");
};
window.toggleDropdown_company = function () {
  const el = document.getElementById("dropdown_company");
  el.classList.toggle("hidden");
  el.classList.toggle("visible");
};
window.toggleDropdown_users = function () {
  const el = document.getElementById("dropdown_users");
  el.classList.toggle("hidden");
  el.classList.toggle("visible");
};

// Kənara klikdə bağla
document.addEventListener("click", function (event) {
  const positionDropdown = document.getElementById("dropdown_position");
  const companyDropdown = document.getElementById("dropdown_company");
  const usersDropdown = document.getElementById("dropdown_users");
  const positionButton = document.getElementById(
    "dropdownDefaultButton_position"
  );
  const usersButton = document.getElementById("dropdownDefaultButton_users");
  const companyButton = document.getElementById(
    "dropdownDefaultButton_company"
  );

  if (
    positionDropdown &&
    !positionButton.contains(event.target) &&
    !positionDropdown.contains(event.target)
  ) {
    positionDropdown.classList.add("hidden");
    positionDropdown.classList.remove("visible");
  }
  if (
    companyDropdown &&
    !companyButton.contains(event.target) &&
    !companyDropdown.contains(event.target)
  ) {
    companyDropdown.classList.add("hidden");
    companyDropdown.classList.remove("visible");
  }
  if (
    usersDropdown &&
    !usersButton.contains(event.target) &&
    !usersDropdown.contains(event.target)
  ) {
    usersDropdown.classList.add("hidden");
    usersDropdown.classList.remove("visible");
  }
});

// Apply filters
window.applyFilters = function () {
  currentFilters = {};

  const startDate = $('input[name="start_date"]').val();
  const endDate = $('input[name="end_date"]').val();
  if (startDate) currentFilters.start_date = startDate;
  if (endDate) currentFilters.end_date = endDate;

  // helper: string rəqəmdirsə number-a çevir
  const norm = (v) => (/^\d+$/.test(String(v)) ? Number(v) : String(v));

  // Positions
  const positions = [];
  $('#dropdown_position input[type="checkbox"]:checked').each(function () {
    const val =
      $(this).attr("data-value") || $(this).attr("id")?.replace("subyekt-", "");
    if (val != null) positions.push(norm(val));
  });
  if (positions.length) currentFilters.positions = positions;

  // Companies
  const companys = [];
  $('#dropdown_company input[type="checkbox"]:checked').each(function () {
    const val =
      $(this).attr("data-value") || $(this).attr("id")?.replace("subyekt-", "");
    if (val != null) companys.push(norm(val));
  });
  if (companys.length) currentFilters.companys = companys;

  // Users
  const users = [];
  $('#dropdown_users input[type="checkbox"]:checked').each(function () {
    const val =
      $(this).attr("data-value") ||
      $(this).attr("id")?.replace("istifadeci-", "");
    if (val != null) users.push(norm(val));
  });
  if (users.length) currentFilters.users = users;

  // Kart kateqoriyası
  const cardCategories = [];
  $('input[name="card_category"]:checked').each(function () {
    cardCategories.push($(this).val());
  });
  if (cardCategories.length) currentFilters.card_category = cardCategories;

  // Təyinat
  const cardDestinations = [];
  $('input[name="card_destination"]:checked').each(function () {
    cardDestinations.push($(this).val());
  });
  if (cardDestinations.length)
    currentFilters.cardDestinations = cardDestinations;

  // Gender
  const cardGender = [];
  $('input[name="card_gender"]:checked').each(function () {
    cardGender.push($(this).val());
  });
  if (cardGender.length) currentFilters.cardGender = cardGender;

  // Məbləğ
  if ($("#slider-range").hasClass("ui-slider")) {
    const minValue = $("#slider-range").slider("values", 0);
    const maxValue = $("#slider-range").slider("values", 1);
    if (minValue != null && maxValue != null) {
      currentFilters.min = minValue;
      currentFilters.max = maxValue;
    }
  }

  if (dataTable) {
    $("#customSearch").val(""); // axtarışı sıfırla
    dataTable.search(""); // global search clear
    dataTable.ajax.reload(null, true); // 1-ci səhifəyə və yeni filtrlə
  }

  $("#filterPop").addClass("hidden");
};

// Clear filters
window.clearFilters = function () {
  $("#filterForm")[0].reset();
  $("#startDate").val("");
  $("#endDate").val("");
  $('input[type="checkbox"]').prop("checked", false);

  if ($("#slider-range").hasClass("ui-slider")) {
    $("#slider-range").slider("values", [0, 10000]);
    $("#min-value").text("0 AZN");
    $("#max-value").text("10000 AZN");
  }

  currentFilters = {};

  if (dataTable) {
    $("#customSearch").val("");
    dataTable.search("");
    dataTable.ajax.reload(function () {}, true);
  }
};

window.openDatePicker = function (inputId) {
  $("#" + inputId).focus();
  $("#" + inputId).click();
};

function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) dataTable.search(searchValue).draw();
}
$("#customSearch").on("keyup", function () {
  performSearch();
});

// GO button
$(".go-button").on("click", function (e) {
  e.preventDefault();
  const pageInput = $(this).siblings(".page-input");
  let pageNumber = parseInt(pageInput.val());
  pageInput.val("");
  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (dataTable) {
      const pageInfo = dataTable.page.info();
      let dataTablePage = pageNumber - 1;
      if (dataTablePage < pageInfo.pages)
        dataTable.page(dataTablePage).draw("page");
      else console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

function toggleDropdown(triggerElement) {
  const wrapper = triggerElement.closest("#wrapper");
  const dropdown = wrapper.querySelector(".dropdown-menu");
  document.querySelectorAll(".dropdown-menu").forEach((el) => {
    if (el !== dropdown) el.classList.add("hidden");
  });
  dropdown.classList.toggle("hidden");
  document.addEventListener("click", function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      document.removeEventListener("click", outsideClick);
    }
  });
}

// Sutunlar modal
window.openSutunlarPopup = function () {
  $("#sutunlarPopup").toggleClass("hidden");
};
window.closeSutunlarPopup = function () {
  $("#sutunlarPopup").addClass("hidden");
};

// Aktiv modal
window.openAktivModal = function () {
  $("#aktivModal").toggleClass("hidden");
};
window.closeAktivModal = function () {
  $("#aktivModal").addClass("hidden");
};

// Deaktiv modal
window.openDeAktivModal = function () {
  $("#deAktivModal").toggleClass("hidden");
};
window.closeDeAktivModal = function () {
  $("#deAktivModal").addClass("hidden");
};

// Silinmə müraciət popup
window.openSilinmeMuracietPopUp = function () {
  $("#silinmeMuracietPopUp").toggleClass("hidden");
};
window.closeSilinmeMuracietPopUp = function () {
  $("#silinmeMuracietPopUp").addClass("hidden");
};

// Confirm modal
// window.openConfirmModal = function () {
// };
// window.closeConfirmModal = function () {
//   $("#confirmModal").addClass("hidden");
// };

// Mail adresi popup
window.openMailadressiPopup = function () {
  $("#mailadressiPopup").toggleClass("hidden");
};
window.closeMailadressiPopup = function () {
  $("#mailadressiPopup").addClass("hidden");
};

// Silinmə təsdiqi popup
window.openSilinmeTesdiqPopUp = function () {
  $("#silinmeTesdiqPopUp").toggleClass("hidden");
};
window.closeSilinmeTesdiqPopUp = function () {
  $("#silinmeTesdiqPopUp").addClass("hidden");
};
