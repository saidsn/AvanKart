// public/js/eQaimePages/eQaimeDetails.js
(function () {
  const QAIME_ID = window.__QAIME_ID__;
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content;

  const $ = (sel) => document.querySelector(sel);

  const el = {
    cmpLogo: $("#cmpLogo"),
    cmpName: $("#cmpName"),
    cmpId: $("#cmpId"),
    invNo: $("#invNo"),
    period: $("#period"),
    statusDot: $("#statusDot"),
    statusText: $("#statusText"),
    approveBtn: $("#approveBtn"),
    totalAmount: $("#totalAmount"),
    cardsWrap: $("#cardsWrap"),
  };

  const statusColor = (raw) =>
    raw === "active" ? "#31C48D" : raw === "canceled" ? "#F05252" : "#F59E0B";

  async function load() {
    const r = await fetch(
      `/emeliyyatlar/sirket/eqaime/${encodeURIComponent(QAIME_ID)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "csrf-token": csrf,
          "x-requested-with": "XMLHttpRequest",
        },
        body: "{}",
      }
    );
    const json = await r.json();
    if (!json.ok) return;

    const { data } = json;

    // company
    if (el.cmpLogo && data.company?.logo) el.cmpLogo.src = data.company.logo;
    if (el.cmpName) el.cmpName.textContent = data.company?.name || "-";
    if (el.cmpId) el.cmpId.textContent = data.company?.cm_id || "-";

    // invoice / period
    if (el.invNo) el.invNo.textContent = data.invoice_no || "-";
    if (el.period) el.period.textContent = data.period || "-";

    // status
    if (el.statusText) el.statusText.textContent = data.status?.label || "-";
    if (el.statusDot)
      el.statusDot.style.backgroundColor = statusColor(data.status?.raw);

    // approve button
    if (el.approveBtn) {
      const disabled =
        data.status?.raw === "active" || data.status?.raw === "canceled";
      el.approveBtn.disabled = disabled;
    }

    // total
    if (el.totalAmount)
      el.totalAmount.textContent =
        (data.total_amount || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }) + " ₼";

    // cards
    if (el.cardsWrap) {
      el.cardsWrap.innerHTML = "";
      (data.cards || []).forEach((card) => {
        const item = document.createElement("div");
        item.className =
          "flex items-center gap-3 p-3 rounded-lg border border-stroke";

        item.innerHTML = `
          <div class="w-[34px] h-[34px] rounded-full flex items-center justify-center" style="background:${card.background_color || "#F3F4F6"}"></div>
          <div class="flex-1">
            <div class="text-[13px] font-medium">${card.name || "-"}</div>
            <div class="text-[12px] opacity-65">${(card.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} ₼ · ${card.percent || 0}%</div>
          </div>
        `;
        el.cardsWrap.appendChild(item);
      });
    }
  }

  async function approve() {
    if (!confirm("Qaiməni təsdiqləmək istəyirsiniz?")) return;

    const r = await fetch(
      `/emeliyyatlar/sirket/eqaime/${encodeURIComponent(QAIME_ID)}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "csrf-token": csrf,
          "x-requested-with": "XMLHttpRequest",
        },
        body: "{}",
      }
    );
    const json = await r.json();
    if (json.ok) {
      await load(); // перерисуем статус/кнопку
    } else {
      alert(json.message || "Xəta baş verdi");
    }
  }

  if (el.approveBtn) el.approveBtn.addEventListener("click", approve);

  load();
})();
