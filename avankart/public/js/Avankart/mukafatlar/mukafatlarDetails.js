// Global dəyişənlər
let dataTable = null;
let currentFilters = {};
// Global değişken olarak tanımla
let globalMinAmount = 0;
let globalMaxAmount = 0;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

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

    // İlk değerleri yaz
    $("#min-value").text(formatCurrency(globalMinAmount));
    $("#max-value").text(formatCurrency(globalMaxAmount));
  }

  function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#myTable")) {
      dataTable.destroy();
    }

    // choose ajax url depending on whether we are on a specific card page
    const cardId = window.__CARD_ID__ || "";
    const ajaxConfig = cardId
      ? {
          url: `/api/avankart/mukafatlar/card/${cardId}`,
          type: "GET",
          headers: { "X-CSRF-Token": csrfToken },
          dataSrc: function (json) {
            // debug: inspect response
            console.debug("[mukafat] listByCard response:", json);
            // json: { card: {...}, data: [...] }
            const rows = (json && json.data) || [];
            if (!json || typeof json !== "object") {
              console.error(
                "[mukafat] unexpected response for listByCard, see network tab"
              );
              // show a placeholder row later by returning empty array
              return [];
            }

            // Card header məlumatlarını yenilə
            $("#cardHeaderCount").text((rows.length || 0) + " mükafat");

            if (json && json.card) {
              const cardIconUrl =
                json.card.icon_url ||
                `https://api.avankart.com/v1/icon/${json.card.icon}` ||
                "/images/default-icon.svg";

              $("#cardHeaderIconImg").attr("src", cardIconUrl);
              $("#cardHeaderName").text(json.card.name || "—");
            }

            // Min/max amount hesabla (əgər amount məlumatı varsa)
            const amounts = rows
              .map((r) => r.conditions?.amount || 0)
              .filter((a) => a > 0);

            if (amounts.length) {
              globalMinAmount = Math.min(...amounts);
              globalMaxAmount = Math.max(...amounts);
            } else {
              globalMinAmount = 0;
              globalMaxAmount = 0;
            }

            initSlider();
            return rows;
          },
        }
      : {
          // Expect backend to return { data: [ ... ] } for DataTables
          url: "/api/avankart/mukafatlar/list",
          type: "GET",
          contentType: "application/json",
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
            console.debug("[mukafat] list response:", json);
            $("#tr_counts").html(json.data.length ?? 0);
            const amounts = (json.data || []).map((tr) => tr.amount || 0);
            if (amounts.length) {
              globalMinAmount = Math.min(...amounts);
              globalMaxAmount = Math.max(...amounts);
            } else {
              globalMinAmount = 0;
              globalMaxAmount = 0;
            }
            initSlider();
            return json.data || [];
          },
        };

    dataTable = $("#myTable").DataTable({
      ajax: ajaxConfig,
      serverSide: cardId ? false : true,
      processing: cardId ? false : true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 3,
      columns: [
        // 1. Mükafat ikonu
        {
          data: null,
          render: function (data, type, row) {
            // icon_url, image_path, image_name və ya forCard.icon istifadə et
            const img =
              row.icon_url ||
              row.image_path ||
              (row.forCard && row.forCard.icon_url) ||
              "/images/default-icon.svg";
            return `
        <div class="flex items-center gap-3">
          <div class="reward-icon w-14 h-14 rounded-full flex items-center justify-center overflow-hidden bg-[#F3F4F6]">
            <img src="${img}" onerror="this.src='/images/default-icon.svg'" class="w-10 h-10 object-cover" />
          </div>
        </div>`;
          },
        },

        // 2. Mükafatın adı və təsviri
        {
          data: "name",
          render: (d, t, row) => {
            const name = d || "—";
            const desc = row.description || "";
            return `
        <div class="reward-meta">
          <div class="reward-name text-[13px] font-medium text-messages">${name}</div>
          <div class="reward-desc text-[12px] text-tertiary-text mt-1">${desc}</div>
        </div>
      `;
          },
        },

        // 3. Xərcləmə yeri (müəssisə kateqoriyası)
        {
          data: "muessise_category",
          render: (d) => {
            if (Array.isArray(d) && d.length > 0) {
              return d.join(" • ");
            }
            return "—";
          },
        },

        // 4. Mükafatın hədəfi
        {
          data: "target",
          render: (d, t, row) => {
            const conditions = row.conditions || {};

            if (d === "count" && conditions.count) {
              return `${conditions.count} alış-veriş`;
            }
            if (d === "amount" && conditions.amount) {
              return `${conditions.amount} ₼`;
            }
            if (d === "muddet" && conditions.muddet) {
              return `${conditions.muddet} gün`;
            }

            return d || "—";
          },
        },

        // 5. Xidmət sayı (response-da yoxdur, hardcoded 0 göstəririk)
        {
          data: "service_count",
          render: (d) => {
            return `<div class="w-full text-center">—</div>`;
          },
        },

        // 6. Mükafatın növü
        {
          data: "gift",
          render: (d) => {
            const types = {
              sale: "Endirim",
              bonus: "Bonus",
              amount: "Məbləğ",
            };
            return types[d] || d || "—";
          },
        },

        // 7. Mükafat dəyəri
        {
          data: null,
          render: (d, t, row) => {
            const giftConditions = row.gift_conditions || {};

            if (giftConditions.sale && Number(giftConditions.sale) > 0) {
              return `${giftConditions.sale}%`;
            }
            if (giftConditions.bonus && Number(giftConditions.bonus) > 0) {
              return `${giftConditions.bonus} bonus`;
            }
            if (giftConditions.amount && Number(giftConditions.amount) > 0) {
              return `${giftConditions.amount} ₼`;
            }

            return `<div class="w-full text-center">—</div>`;
          },
        },

        // 8. Qazanan şəxs sayı (response-da yoxdur)
        {
          data: "winners_count",
          render: (d) => {
            return `<div class="w-full text-center">—</div>`;
          },
        },

        // 9. Yaradılma tarixi (response-da yoxdur, amma card-da var)
        {
          data: "createdAt",
          render: (d) => {
            if (d) {
              const date = new Date(d);
              return date.toLocaleDateString("az-AZ", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              });
            }
            return "—";
          },
        },

        // 10. Action buttons
        {
          data: null,
          orderable: false,
          searchable: false,
          render: function (data, type, row) {
            const id = row._id || row.id;
            return `
        <div class="relative">
          <button class="actionBtn p-2" data-id="${id}">⋯</button>
          <div class="actionMenu hidden absolute right-0 mt-2 w-36 bg-white dark:bg-[#0B1114] border rounded shadow z-10">
            <button class="w-full text-left px-3 py-2 editRewardBtn" data-id="${id}">Redaktə et</button>
            <button class="w-full text-left px-3 py-2 deleteRewardBtn text-red-600" data-id="${id}">Sil</button>
          </div>
        </div>
      `;
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
      createdRow: function (row, data, dataIndex) {
        $(row)
          .css("transition", "background-color 0.2s ease")
          .on("mouseenter", function () {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          })
          .on("mouseleave", function () {
            $(this).css("background-color", "");
          });

        $(row).find("td").addClass("border-b-[.5px] border-stroke");

        $(row).find("td:not(:last-child)").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });

        $(row).find("td:last-child").css({
          "padding-right": "0",
          "text-align": "left",
        });

        // Action menu toggle
        $(row)
          .find(".actionBtn")
          .on("click", function (e) {
            e.stopPropagation();
            $(".actionMenu").addClass("hidden");
            $(this).siblings(".actionMenu").toggleClass("hidden");
          });

        // Edit button
        $(row)
          .find(".editRewardBtn")
          .on("click", function (e) {
            e.stopPropagation();
            const id = $(this).data("id");
            openEditModal(id);
          });

        // Delete button
        $(row)
          .find(".deleteRewardBtn")
          .on("click", function (e) {
            e.stopPropagation();
            const id = $(this).data("id");
            if (confirm("Mükafatı silmək istədiyinizə əminsiniz?")) {
              deleteReward(id);
            }
          });

        // Row click navigates to details page
        $(row).on("click", function (e) {
          // prevent when clicking action buttons
          if ($(e.target).closest(".actionMenu, .actionBtn").length) return;
          const id = data.id || data._id;
          if (id) {
            location.href = `/avankart/mukafatlar/${id}`;
          }
        });
      },
    });
  }

  // Initialize DataTable
  initializeDataTable();

  // Refresh button
  $("#refreshTableBtn").on("click", function () {
    if (dataTable) dataTable.ajax.reload();
  });

  // Modal handlers
  function openCreateModal() {
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
    // if viewing a card details page, default the new reward to that card
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

  function openEditModal(id) {
    // fetch reward by id
    $.get(`/api/avankart/mukafatlar/${id}`, function (res) {
      const r = res.data || res;
      $("#rewardId").val(r.id || r._id);
      $("#rewardModalTitle").text("Mükafatı redaktə et");
      $("#rewardIcon").val(r.icon || r.logo || "");
      $("#rewardName").val(r.name || "");
      $("#rewardPlaces").val(
        Array.isArray(r.places) ? r.places.join(",") : r.places || ""
      );
      $("#rewardTargetCount").val(r.target || "");
      $("#rewardTargetType").val(r.target_type || "count");
      $("#rewardType").val(r.type || "amount");
      $("#rewardValue").val(r.value || "");
      $("#rewardRecurrence").val(r.recurrence || "");
      // populate forCard and description if available
      try {
        $("#rewardForCard").val(
          (r.forCard && (r.forCard._id || r.forCard)) || ""
        );
      } catch (e) {
        $("#rewardForCard").val("");
      }
      $("#rewardDescription").val(r.description || "");
      $("#rewardModal").removeClass("hidden");
    }).fail(function () {
      alert("Məlumat götürülərkən xəta baş verdi");
    });
  }

  $("#createRewardBtn").on("click", function () {
    openCreateModal();
  });
  $("#closeRewardModal, #cancelRewardBtn").on("click", function () {
    $("#rewardModal").addClass("hidden");
  });

  // Save reward (create or update)
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
      alert("Z\u0259hm\u0259t olmasa kart\u0131 seçin (forCard).");
      return;
    }
    if (!payload.description || payload.description.toString().trim() === "") {
      alert("Z\u0259hm\u0259t olmasa t\u0259sviri daxil edin.");
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
        if (dataTable) dataTable.ajax.reload();
      })
      .fail(function () {
        alert("Yadda saxlanarkən xəta baş verdi");
      });
  });

  function deleteReward(id) {
    if (!id || id === "undefined") {
      console.warn("deleteReward called with invalid id:", id);
      alert("Silmək üçün etibarlı id tapılmadı. Konsolu yoxlayın.");
      return;
    }
    $.ajax({
      url: `/api/avankart/mukafatlar/${id}`,
      method: "DELETE",
      headers: { "X-CSRF-Token": csrfToken },
    })
      .done(function () {
        if (dataTable) dataTable.ajax.reload();
      })
      .fail(function () {
        alert("Silinərkən xəta baş verdi");
      });
  }
});

// Global functions
window.changePage = function (page) {
  if (dataTable) {
    dataTable.page(page).draw("page");
  }
};

// Search
function performSearch() {
  const searchValue = $("#customSearch").val();
  if (dataTable) {
    dataTable.search(searchValue).draw();
  }
}

// Search inputuna event listener əlavə etmək
$("#customSearch").on("keyup", function (e) {
  performSearch();
});
