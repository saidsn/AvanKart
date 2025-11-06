$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");
  // support pages that use either #detailsTable or #myTable
  const $tableBody = $("#detailsTable tbody").length
    ? $("#detailsTable tbody")
    : $("#myTable tbody");
  const $filterType = $("#detailsFilterType");

  // populate the card select used in the create modal
  function populateCardSelect() {
    const sel = $("#rewardCardSelect");
    if (!sel || !sel.length) return;
    // clear existing options but keep placeholder
    sel.find('option:not([value=""])').remove();
    fetch("/imtiyazlar/kartlar/formatted-data", {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((json) => {
        const items = (json && json.data) || json || [];
        items.forEach((it) => {
          const val = it.kartId || it._id || it.id || it.id_card || it.id;
          const text = it.name || it.kartType || it.title || it.kartId || val;
          if (!val) return;
          const opt = document.createElement("option");
          opt.value = val;
          opt.textContent = text;
          sel.append(opt);
        });
        // if viewing a specific card, preselect it
        try {
          if (window && window.__CARD_ID__) {
            sel.val(window.__CARD_ID__);
            $("#rewardForCard").val(window.__CARD_ID__);
          }
        } catch (e) {}
      })
      .catch((err) => {
        console.warn("Could not load cards for select", err);
      });

    sel.on("change", function () {
      const hidden = $("#rewardForCard");
      if (hidden && hidden.length) hidden.val($(this).val() || "");
    });
  }

  // populate once on page load so the modal select isn't empty
  try {
    populateCardSelect();
  } catch (e) {
    console.warn("populateCardSelect failed", e);
  }

  function renderRows(data) {
    $tableBody.empty();
    data.forEach((r) => {
      const places = Array.isArray(r.muessise_category)
        ? r.muessise_category.join(" • ")
        : r.muessise_category || "—";
      const created = r.createdAt
        ? new Date(r.createdAt).toLocaleDateString()
        : "—";
      const img =
        (r.icon_url || r.image_path || r.image_name || "").trim() ||
        "/images/default-icon.svg";
      const tr = $(
        `<tr data-id="${r._id}" class="border-b-[.5px] border-stroke">
          <td><img src="${img}" onerror="this.src='/images/default-icon.svg'" class="w-8 h-8 rounded-full"/></td>
          <td>${r.name || "—"}</td>
          <td>${places}</td>
          <td>${r.conditions && (r.conditions.count || r.conditions.muddet || r.conditions.amount) ? r.conditions.count || r.conditions.muddet || r.conditions.amount : "—"}</td>
          <td>${(r.service_count || 0) === 0 ? `<div class="w-full text-center">0</div>` : r.service_count || 0}</td>
          <td>${r.gift || "—"}</td>
          <td>${r.gift_conditions && (r.gift_conditions.sale || r.gift_conditions.bonus || r.gift_conditions.amount) ? (r.gift_conditions.sale ? r.gift_conditions.sale + "%" : r.gift_conditions.amount ? (Number(r.gift_conditions.amount) === 0 ? `<div class="w-full text-center">0 ₼</div>` : r.gift_conditions.amount + " ₼") : r.gift_conditions.bonus) : "—"}</td>
          <td>${(r.winners_count || 0) === 0 ? `<div class="w-full text-center">0</div>` : r.winners_count || 0}</td>
          <td>${created}</td>
          <td>
            <button class="detailsActionBtn">⋯</button>
            <div class="detailsActionMenu hidden bg-white p-2 rounded border">
              <button class="detailsEditBtn">Redaktə et</button>
              <button class="detailsDeleteBtn text-red-600">Sil</button>
            </div>
          </td>
        </tr>`
      );

      tr.find(".detailsActionBtn").on("click", function (e) {
        e.stopPropagation();
        $(".detailsActionMenu").addClass("hidden");
        $(this).siblings(".detailsActionMenu").toggleClass("hidden");
      });

      tr.find(".detailsEditBtn").on("click", function () {
        const id = tr.data("id");
        openEditModal(id);
      });

      tr.find(".detailsDeleteBtn").on("click", function () {
        const id = tr.data("id");
        if (confirm("Mükafatı silmək istədiyinizə əminsiniz?")) {
          $.ajax({
            url: `/api/avankart/mukafatlar/${id}`,
            method: "DELETE",
            headers: { "X-CSRF-Token": csrfToken },
          })
            .done(function () {
              load();
            })
            .fail(function () {
              alert("Silinərkən xəta baş verdi");
            });
        }
      });

      $tableBody.append(tr);
    });
  }

  function load() {
    // Expect card id in URL: /avankart/mukafatlar/:cardId
    const parts = location.pathname.split("/");
    const cardId = parts[parts.length - 1];
    $.get(`/api/avankart/mukafatlar/card/${cardId}`, function (res) {
      const card = res.card || {};
      if (card) {
        // cardHeaderIcon is a container; image has id cardHeaderIconImg
        $("#cardHeaderIconImg").attr(
          "src",
          card.icon_url || "/images/default-icon.svg"
        );
        $("#cardHeaderName").text(card.name || "—");
      }
      const rows = res.data || res;
      // update count element if present
      if ($("#cardHeaderCount").length) {
        $("#cardHeaderCount").text((rows.length || 0) + " mükafat");
      }
      renderRows(rows);
    }).fail(function () {
      alert("Məlumat gətirilərkən xəta baş verdi");
    });
  }

  $("#detailsRefresh").on("click", load);
  $("#detailsSearch").on("keyup", function () {
    const q = $(this).val().toLowerCase();
    $("#detailsTable tbody tr").each(function () {
      const text = $(this).text().toLowerCase();
      $(this).toggle(text.indexOf(q) !== -1);
    });
  });

  $filterType.on("change", function () {
    load();
  });

  // Edit modal handlers
  function openEditModal(id) {
    $.get(`/api/avankart/mukafatlar/${id}`, function (res) {
      const r = res.data || res;
      $("#detailsRewardId").val(r._id || r.id);
      $("#detailsRewardIcon").val(
        r.icon_url || r.image_path || r.image_name || ""
      );
      $("#detailsRewardName").val(r.name || "");
      $("#detailsRewardPlaces").val(
        Array.isArray(r.muessise_category)
          ? r.muessise_category.join(",")
          : r.muessise_category || ""
      );
      $("#detailsRewardTargetCount").val(
        r.conditions &&
          (r.conditions.count || r.conditions.muddet || r.conditions.amount)
          ? r.conditions.count || r.conditions.muddet || r.conditions.amount
          : ""
      );
      $("#detailsRewardTargetType").val(r.target || "count");
      $("#detailsRewardType").val(r.gift || "amount");
      const g = r.gift_conditions || {};
      if (g.sale) $("#detailsRewardValue").val(g.sale + "%");
      else if (g.amount) $("#detailsRewardValue").val(g.amount + " ₼");
      else if (g.bonus) $("#detailsRewardValue").val(g.bonus);
      else $("#detailsRewardValue").val("");
      $("#detailsRewardRecurrence").val(r.recurrence || "");
      $("#detailsEditModal").removeClass("hidden");
    }).fail(function () {
      alert("Məlumat götürülərkən xəta baş verdi");
    });
  }

  $("#closeDetailsEditModal, #detailsCancelBtn").on("click", function () {
    $("#detailsEditModal").addClass("hidden");
  });

  $("#detailsEditForm").on("submit", function (e) {
    e.preventDefault();
    const id = $("#detailsRewardId").val();
    const payload = {
      icon: $("#detailsRewardIcon").val(),
      name: $("#detailsRewardName").val(),
      places: ($("#detailsRewardPlaces").val() || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      target: $("#detailsRewardTargetCount").val(),
      target_type: $("#detailsRewardTargetType").val(),
      type: $("#detailsRewardType").val(),
      value: $("#detailsRewardValue").val(),
      recurrence: $("#detailsRewardRecurrence").val(),
    };
    $.ajax({
      url: `/api/avankart/mukafatlar/${id}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(payload),
      headers: { "X-CSRF-Token": csrfToken },
    })
      .done(function () {
        $("#detailsEditModal").addClass("hidden");
        load();
      })
      .fail(function () {
        alert("Yadda saxlanarkən xəta baş verdi");
      });
  });

  // -- Create modal & form handling (ensure create works even when mukafatlarDetails.js isn't loaded)
  function openCreateModal() {
    // ensure card select is freshly populated before opening
    try {
      populateCardSelect();
    } catch (e) {}
    $("#rewardId").val("");
    $("#rewardModalTitle").text("Yeni mükafat yarat");
    $("#rewardIcon").val("");
    $("#rewardName").val("");
    $("#rewardPlaces").val("");
    $("#rewardTargetCount").val("");
    $("#rewardTargetType").val("count");
    $("#rewardType").val("amount");
    $("#rewardValue").val("");
    $("#rewardRecurrence").val("");
    // provide required backend fields with empty defaults
    $("#rewardForCard").val("");
    try {
      if (window && window.__CARD_ID__) {
        $("#rewardForCard").val(window.__CARD_ID__);
        const sel = $("#rewardCardSelect");
        if (sel && sel.length) sel.val(window.__CARD_ID__);
      }
    } catch (e) {
      // ignore
    }
    $("#rewardDescription").val("");
    $("#rewardModal").removeClass("hidden");
  }

  $("#createRewardBtn").on("click", function () {
    openCreateModal();
  });

  $("#closeRewardModal, #cancelRewardBtn").on("click", function () {
    $("#rewardModal").addClass("hidden");
  });

  // Submit handler for reward form (create or update)
  $("#rewardForm").on("submit", function (e) {
    e.preventDefault();
    const id = $("#rewardId").val();
    const payload = {
      icon: $("#rewardIcon").val(),
      name: $("#rewardName").val(),
      forCard: $("#rewardForCard").val(),
      description: $("#rewardDescription").val(),
      places: ($("#rewardPlaces").val() || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      target: $("#rewardTargetCount").val(),
      target_type: $("#rewardTargetType").val(),
      type: $("#rewardType").val(),
      value: $("#rewardValue").val(),
      recurrence: $("#rewardRecurrence").val(),
    };

    // Basic client-side validation to avoid Mongoose validation errors
    if (!payload.forCard || payload.forCard.toString().trim() === "") {
      alert("Zəhmət olmasa kartı seçin (forCard).");
      return;
    }
    if (!payload.description || payload.description.toString().trim() === "") {
      alert("Zəhmət olmasa təsviri daxil edin.");
      return;
    }
    // ensure icon is present; use default icon URL if none selected
    if (!payload.icon || payload.icon.toString().trim() === "") {
      payload.icon = "/images/default-icon.svg";
    }

    const url = id
      ? `/api/avankart/mukafatlar/${id}`
      : "/api/avankart/mukafatlar";
    const method = id ? "PUT" : "POST";

    $.ajax({
      url,
      method,
      contentType: "application/json",
      data: JSON.stringify(payload),
      headers: { "X-CSRF-Token": csrfToken },
    })
      .done(function () {
        $("#rewardModal").addClass("hidden");
        load();
      })
      .fail(function () {
        alert("Yadda saxlanarkən xəta baş verdi");
      });
  });

  // initial load
  load();
});
