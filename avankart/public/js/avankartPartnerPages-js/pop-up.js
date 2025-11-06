const yeni_isciDiv = document.querySelector("#yeni-isci-div");
let aside = document.querySelector("aside");
let span4 = document.querySelector(".span4");
let span4_1 = document.querySelector(".span4-1");
let curveleft = document.querySelector("#curve-left-div");
let tenzimlemelerDiv = document.querySelector("#tenzimlemeler-div");
let destekDiv = document.querySelector(".destek-div");
let destekLogo = document.querySelector(".destek-logo");

let isIsciOpen = false;
let isSearchOpen = false;

function toggleIsci() {
  isIsciOpen = !isIsciOpen;
  if (isIsciOpen) {
    yeni_isciDiv.style.display = "block";
    overlay.style.display = "block";
    ishciId.style.display = "none";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    yeni_isciDiv.style.display = "none";
    overlay.style.display = "none";
    ishciId.style.display = "none";
    aside.style.background = "#fafafa";
    span4.style.background = "#fafafa";
    span4_1.style.background = "#fafafa";
    destekLogo.style.background = "#fafafa";
    curveleft.style.background = "#fff";
    tenzimlemelerDiv.style.background = "#fff";
    destekDiv.style.background = "#fff";
  }
}

function SearchId() {
  isSearchOpen = !isSearchOpen;
  if (isSearchOpen) {
    ishciId.style.display = "block";
    yeni_isciDiv.style.display = "none";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    ishciId.style.display = "none";
    overlay.style.display = "none";
    aside.style.background = "#fafafa";
    span4.style.background = "#fafafa";
    span4_1.style.background = "#fafafa";
    destekLogo.style.background = "#fafafa";
    curveleft.style.background = "#fff";
    tenzimlemelerDiv.style.background = "#fff";
    destekDiv.style.background = "#fff";
  }
}

let excelIsciler = document.querySelector("#excelIsciler");
let excelClick = false;

function excelPopUp() {
  excelClick = !excelClick;
  if (excelClick) {
    excelIsciler.style.display = "block";
    yeni_isciDiv.style.display = "none";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    excelIsciler.style.display = "none";
    overlay.style.display = "none";
    aside.style.background = "#fafafa";
    span4.style.background = "#fafafa";
    span4_1.style.background = "#fafafa";
    destekLogo.style.background = "#fafafa";
    curveleft.style.background = "#fff";
    tenzimlemelerDiv.style.background = "#fff";
    destekDiv.style.background = "#fff";
  }
}

// Isci sil
const iscisilDiv = document.querySelector("#iscisilDiv");

let IsciSilclick = false;

function isciniSil() {
  IsciSilclick = !IsciSilclick;
  if (IsciSilclick) {
    iscisilDiv.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    iscisilDiv.style.display = "none";
    overlay.style.display = "none";
    aside.style.background = "#fafafa";
    span4.style.background = "#fafafa";
    span4_1.style.background = "#fafafa";
    destekLogo.style.background = "#fafafa";
    curveleft.style.background = "#fff";
    tenzimlemelerDiv.style.background = "#fff";
    destekDiv.style.background = "#fff";
  }
}

const emaildogrulamaDiv = document.querySelector(".emaildogrulama-div");

let emailClick = false;

function siltesdiq() {
  emailClick = !emailClick;
  if (emailClick) {
    emaildogrulamaDiv.style.display = "block";
    overlay.style.display = "block";
    iscisilDiv.style.display = "none";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    emaildogrulamaDiv.style.display = "none";
    overlay.style.display = "none";
    aside.style.background = "#fafafa";
    span4.style.background = "#fafafa";
    span4_1.style.background = "#fafafa";
    destekLogo.style.background = "#fafafa";
    curveleft.style.background = "#fff";
    tenzimlemelerDiv.style.background = "#fff";
    destekDiv.style.background = "#fff";
  }
}

const filterPop = document.querySelector("#filterPop");
let filterclick = false;

function openFilterModal() {
  filterclick = !filterclick;
  if (filterclick) {
    filterPop.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    filterPop.style.display = "none";
    overlay.style.display = "none";
    aside.style.background = "#fafafa";
    span4.style.background = "#fafafa";
    span4_1.style.background = "#fafafa";
    destekLogo.style.background = "#fafafa";
    curveleft.style.background = "#fff";
    tenzimlemelerDiv.style.background = "#fff";
    destekDiv.style.background = "#fff";
  }
}

const minPrice = document.querySelector("#min-price");
const maxPrice = document.querySelector("#max-price");
const minpricerange = document.querySelector("#minpricerange");
const maxpricerange = document.querySelector("#maxpricerange");
const MAX_VALUE = 300000;
function yekunminprice() {
  minPrice.innerHTML =
    minpricerange.value +
    `<img src="/public/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`;
}
function yekunmaxprice() {
  const reverseValue = MAX_VALUE - maxpricerange.value;
  maxPrice.innerHTML =
    maxpricerange.value +
    `<img src="/public/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`;
}

let timeLeft = 4 * 60 + 59; // 4:59 in seconds
const countdownEl = document.getElementById("countdown");
const resendBtn = document.getElementById("resendBtn");
const otpInputs = document.querySelectorAll(".otp-input");
const updateTimer = () => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    resendBtn.disabled = false;
    resendBtn.classList.remove("text-gray-600");
    resendBtn.classList.add("text-purple-600", "cursor-pointer");
  }
  timeLeft--;
};
const timer = setInterval(updateTimer, 1000);
updateTimer();
otpInputs.forEach((input, index) => {
  input.classList.add(
    "w-full",
    "h-[34px]",
    "text-center",
    "border-2",
    "border-purple-300",
    "rounded-md",
    "focus:outline-none",
    "focus:border-purple-500",
    "text-xl"
  );
  input.setAttribute("type", "text");
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("pattern", "[0-9]*");
  input.setAttribute("autocomplete", "one-time-code");
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
    if (e.target.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text"
    );
    const digits = pastedText.replace(/\D/g, "").split("");
    if (digits.length > 0) {
      otpInputs.forEach((input, i) => {
        input.value = digits[i] || "";
      });
      otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
    }
  });
});

$(document).ready(function () {
  const myData = [
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
    {
      id: "RO002",
      name: "Ramin Orucov",
      email: "ramin.orucovvv@gmail.com",
      phone: "+994 50 770 35 22",
    },
  ];

  const table = $("#myTable2").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: myData,
    columns: [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
                      <input type="checkbox" id="cb-${idx}" class="peer hidden">
                      <label for="cb-${idx}" class="cursor-pointer bg-menu border border-surface-variant rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition">
                          <div class="icon stratis-check-01 scale-60"></div>
                      </label>
                  `;
        },
      },
      {
        data: function (row) {
          return `
                      <div class="flex items-center gap-3">
                          <span class="text-secondary-text text-[11px] font-normal">ID: ${row.id}</span>
                      </div>
                  `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.email}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages font-normal">${row.phone}</span>`;
        },
      },
    ],
    order: [],
    lengthChange: false,
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      // Hover effekti
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          $(this).css("background-color", "#FAFAFA");
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      /// Bütün td-lərə border alt
      $(row).find("td").addClass("border-b-[.5px] border-stroke");

      $(row).find("td:not(:first-child)").css({
        "padding-left": "20px",
        "padding-top": "14.5px",
        "padding-bottom": "14.5px",
      });

      $("#myTable2 thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTable2 thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Sol td (checkbox): padding və genişliyi sıfırla, border ver
      $(row).find("td:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "48px", // checkbox sütunu üçün daha dar genişlik (uyğunlaşdıra bilərsən)
        "text-align": "center",
      });

      // Label içində margin varsa sıfırla
      $(row).find("td:first-child label").css({
        margin: "0",
        display: "inline-flex",
        "justify-content": "center",
        "align-items": "center",
      });
    },

    initComplete: function () {
      $("#myTable2 thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Table başlıqlarına stil burada verilməlidir
      $("#myTable2 thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTable2 thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable2 thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages"></div></div>'
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

      // Spacer-row əlavə olunur
      $("#myTable2 tbody tr.spacer-row").remove();

      const colCount = $("#myTable2 thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable2 tbody").prepend(spacerRow);

      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable2 tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      // Səhifələmə düymələri
      $pagination.append(`
              <div class="flex items-center justify-center  pr-[42px] h-8 ms-0 leading-tight ${
                pageInfo.page === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "text-messages"
              }"
                  onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
                  <div class="icon stratis-chevron-left !h-[12px] !w-[7px] " ></div>
              </div>
          `);

      var paginationButtons = '<div class="flex gap-2">';
      for (var i = 0; i < pageInfo.pages; i++) {
        paginationButtons += `
                  <button class="cursor-pointer w-10 text-[13px] h-10 rounded-[8px] hover:text-messages
                          ${
                            i === pageInfo.page
                              ? "bg-[#F6D9FF] text-messages"
                              : "bg-transparent text-tertiary-text"
                          }"
                          onclick="changePage(${i})">${i + 1}</button>
              `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
              <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${
                pageInfo.page === pageInfo.pages - 1
                  ? "opacity-50 cursor-not-allowed"
                  : "text-tertiary-text"
              }"
                  onclick="changePage(${pageInfo.page + 1})">
                  <div class="icon stratis-chevron-right !h-[12px] !w-[7px] "></div>
              </div>
          `);
    },
  });
  // ✅ Baş checkbox klikləndikdə bütün tbody checkbox-lar seçilsin
  $("#newCheckbox").on("change", function () {
    const isChecked = $(this).is(":checked");

    $('#myTable2 tbody input[type="checkbox"]').each(function () {
      $(this).prop("checked", isChecked).trigger("change");
    });
  });
  // Axtarış
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
    updateCounts(activeData);
  });

  // Sayları yeniləmək üçün funksiya
  function updateCounts(data) {
    const totalCount = data.length;
    const readCount = data.filter((row) => row.status === "Oxundu").length;
    const unreadCount = data.filter((row) => row.status === "Yeni").length;

    $("#total-count").text(`Hamısı (${totalCount})`);
    $("#read-count").text(`Oxunmuşlar (${readCount})`);
    $("#unread-count").text(`Oxunmamışlar (${unreadCount})`);
  }

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    table.page(page).draw("page");
  };
});
