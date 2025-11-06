document.addEventListener("DOMContentLoaded", function () {
  // Определяем endpoint в зависимости от авторизации
  const FAQ_ENDPOINT = document.querySelector('meta[name="csrf-token"]')
    ? "/faq_auth"
    : "/faq";

  let faqData = [];

  function getScriptLang() {
    try {
      const s =
        document.currentScript ||
        (function () {
          const scripts = document.getElementsByTagName("script");
          for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src && /faq\.js(\?|$)/.test(scripts[i].src))
              return scripts[i];
          }
          return null;
        })();
      if (!s || !s.src) return "az";
      const url = new URL(s.src, window.location.origin);
      return (url.searchParams.get("lang") || "az").toLowerCase();
    } catch {
      return "az";
    }
  }

  function postJSON(url, payload) {
    const csrf =
      document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

    const headers = { "Content-Type": "application/json" };
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
    }

    return fetch(url, {
      method: "POST",
      headers,
      credentials: "same-origin",
      body: JSON.stringify(payload || {}),
    }).then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  function normalizeFaqResponse(raw) {
    const arr = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : [];
    return arr
      .map((x, i) => ({
        question: String(x.question ?? x.q ?? ""),
        answer: String(x.answer ?? x.a ?? ""),
        order: typeof x.order === "number" ? x.order : i + 1,
      }))
      .filter((x) => x.question && x.answer)
      .sort((a, b) => a.order - b.order);
  }

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderFaqItem(i, qa) {
    const q = escapeHTML(qa.question);
    const a = escapeHTML(qa.answer);
    return `
      <div class="bg-table-hover dark:bg-table-hover-dark rounded-xl">
        <div class="divide-y divide-neutral-200">
          <div>
            <details class="group">
              <summary class="py-3 px-5 flex cursor-pointer list-none items-center justify-between font-medium text-sm">
                <span>${i}. ${q}</span>
                <span class="flex items-center justify-center rounded-full bg-inverse-on-surface dark:bg-inverse-on-surface-dark w-10 h-10 transition group-open:rotate-[-45deg]">
                  <div class="icon stratis-arrow-right duration-300 ease-in-out"></div>
                </span>
              </summary>
              <div class="w-full group-open:animate-fadeIn border-t-[.5px] border-stroke dark:border-[#FFFFFF1A]">
                <p class="py-3 px-5 text-start font-normal text-[12px] text-secondary-text dark:text-secondary-text-color-dark pt-3">
                  ${a}
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>`;
  }

  function renderFaqList(faqs) {
    if (!faqs?.length) {
      return `
        <div class="rounded-xl border border-dashed border-stroke dark:border-[#FFFFFF1A]">
          <div class="p-5 text-center text-sm text-secondary-text dark:text-secondary-text-color-dark">
            Melumat tapilmadi.
          </div>
        </div>`;
    }
    let html = "";
    for (let i = 0; i < faqs.length; i++) html += renderFaqItem(i + 1, faqs[i]);
    return html;
  }

  if (!window.faqModal) {
    const faqModal = document.getElementById("faqModal");
    window.faqModal = faqModal || null;
  }

  if (!window.openSupportModal) {
    function openSupportModal() {
      supportModal.classList.toggle("hidden");
      supportOverlay.classList.toggle("hidden");
    }
    window.openSupportModal = openSupportModal;

    function closeSupportModal() {
      supportModal.classList.toggle("hidden");
      supportOverlay.classList.toggle("hidden");
    }
    window.closeSupportModal = closeSupportModal;
  }

  const lang = getScriptLang();
  postJSON(FAQ_ENDPOINT, { lang })
    .then((json) => {
      const normalized = normalizeFaqResponse(json);
      faqData = normalized;
    })
    .catch(() => {
      faqData = [];
    });

  function openFaqModal() {
    const modalRoot = window.faqModal || document.getElementById("faqModal");
    if (!modalRoot) return;

    modalRoot.innerHTML = `
     <!-- Qaralmiş Overlay -->
    <div onclick="closeFaqModal()"
            class="fixed inset-0 bg-[rgb(0,0,0,.5)] z-90"></div>
        <div style="scrollbar-width: none;"
            class="border-3 border-stroke dark:border-[#FFFFFF1A] w-[577px] bg-sidebar-bg dark:bg-side-bar-bg-dark fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-100 shadow-xl rounded-[12px] max-h-[100vh] overflow-y-auto custom-scroll">
            <div class="p-5 relative">
                <div onclick="closeFaqModal()"
                    class="w-[18px] h-[18px] absolute right-7 top-7 cursor-pointer">
                    <div class="icon stratis-x-02"></div>
                </div>
                <div class="text-center mt-7">
                    <h3
                        class="text-[18px] font-bold text-messages dark:text-primary-text-color-dark mt-3">Tez-tez
                        verilən suallar</h3>
                </div>

             
                <div id="faqLoopContainer" class="mt-6 space-y-3"></div>

            </div>
        </div>
    `;

    const listEl = document.getElementById("faqLoopContainer");
    if (listEl) listEl.innerHTML = renderFaqList(faqData);
  }

  function closeFaqModal() {
    const modalRoot = window.faqModal || document.getElementById("faqModal");
    if (modalRoot) modalRoot.innerHTML = "";
  }

  window.openFaqModal = openFaqModal;
  window.closeFaqModal = closeFaqModal;
});
