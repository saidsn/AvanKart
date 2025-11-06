let isSearchOpen = false;
let excelClick = false;
let filterclick = false;
const yeni_isciDiv = document.getElementById("yeni-isci-div");
const overlay = document.getElementById("overlay");
const ishciId = document.getElementById("ishciId");
const excelIsciler = document.getElementById("excelIsciler");
const iscisilDiv = document.getElementById("iscisilDiv2");
const emaildogrulamaDiv = document.querySelector(".emaildogrulama-div");
const filterPop = document.getElementById("filterPopForm");
const aside = document.getElementById("aside") || {};
const span4 = document.getElementById("span4") || {};
const span4_1 = document.getElementById("span4_1") || {};
const curveleft = document.getElementById("curveleft") || {};
const tenzimlemelerDiv = document.getElementById("tenzimlemelerDiv") || {};
const destekDiv = document.getElementById("destekDiv") || {};
const destekLogo = document.getElementById("destekLogo") || {};

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
  }
}

function excelPopUp() {
  excelClick = !excelClick;

  if (excelClick) {
    excelIsciler.style.display = "block";
    yeni_isciDiv.style.display = "none";
    overlay.style.display = "block";
    // aside.style.background = "transparent";
    // span4.style.background = "transparent";
    // span4_1.style.background = "transparent";
    // curveleft.style.background = "transparent";
    // tenzimlemelerDiv.style.background = "transparent";
    // destekDiv.style.background = "transparent";
    // destekLogo.style.background = "transparent";
  } else {
    excelIsciler.style.display = "none";
    overlay.style.display = "none";
  }
}

function selectExcelFile() {
  document.getElementById("excelFileInput").click();

}

// Fayl seçildikdə backendə göndər


// Fayl seçildikdə backendə göndər
document
  .getElementById("excelFileInput")
  .addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/excel-upload", {
        method: "POST",
        headers: {
          "CSRF-Token": document.querySelector("meta[name='csrf-token']")
            .content,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Excel popup aç
        if (result.data.length > 0) {
          excelPopUp();
        } else {
          alertModal("Data tapılmadı", "error");
        }

        // Cədvəli doldur
        const table = $("#myTable2").DataTable();
        table.clear();
        result.data.forEach((d) => {
          table.row.add({
            id: d.id,
            partner_id: d.partner_id,
            name: d.name,
            email: d.email,
            phone: d.phone,
          });
        });
        table.draw();
      } else {
        alertModal(
          result.message || "Excel yüklənərkən xəta baş verdi!",
          "error"
        );
      }

      console.log("Excel upload result:", result);
    } catch (err) {
      console.error("Excel upload error:", err);
      alertModal("Server ilə əlaqə xətası.", "error");
    }
  });

// Isci sil
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
  }
}

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
  }
}

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
  }
}

function redrawMyTable3() {
  console.log("Redrawing tables...");

  // Collect filter form data for debugging
  const formData = $("#filterPopForm").serializeArray();
  console.log("Filter form data:", formData);

  if ($.fn.DataTable.isDataTable("#myTable3")) {
    $("#myTable3").DataTable().ajax.reload();
  } else {
    console.warn("myTable3 DataTable is not initialized");
  }

  // Also reload left partners table if it exists
  if ($.fn.DataTable.isDataTable("#myTableLeft")) {
    $("#myTableLeft").DataTable().ajax.reload();
  }

  // Filter popup-unu bağla
  openFilterModal();
}

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
(() => {
  const otpInputs = document.querySelectorAll(".otp-input");

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
})();

$(document).ready(function () {
  const table = $("#myTable2").DataTable({
    paging: true,
    info: false,
    dom: "t",
    data: [],
    columns: [
      {
        orderable: false,
        data: function (row, type, set, meta) {
          const idx = meta.row;
          return `
                      <input type="checkbox" id="cb-${idx}" class="peer hidden" >
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
                          <span class="text-messages dark:text-on-primary-dark text-[11px] font-normal">ID: ${row.partner_id}</span>
                      </div>
                  `;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${row.email}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">${row.phone}</span>`;
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

      $("#myTable23 thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTable23 thead th:first-child label").css({
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
      $("#myTable23 thead th").css({
        "padding-left": "20px",
        "padding-top": "10.5px",
        "padding-bottom": "10.5px",
      });

      // Table başlıqlarına stil burada verilməlidir
      $("#myTable23 thead th:first-child").css({
        "padding-left": "0",
        "padding-right": "0",
        width: "58px",
        "text-align": "center",
        "vertical-align": "middle",
      });

      $("#myTable23 thead th:first-child label").css({
        margin: "0 auto",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      });

      // Filtrləmə ikonları üçün mövcud kodun saxlanması
      $("#myTable23 thead th.filtering").each(function () {
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
      $("#myTable23 tbody tr.spacer-row").remove();

      const colCount = $("#myTable23 thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable23 tbody").prepend(spacerRow);

      // ✅ Sonuncu real satırın td-lərinə sərhəd əlavə et
      const $lastRow = $("#myTable23 tbody tr:not(.spacer-row):last");

      $lastRow.find("td").css({
        "border-bottom": "0.5px solid #E0E0E0",
      });

      // Səhifələmə düymələri
      $pagination.append(`
              <div class="flex items-center justify-center  pr-[42px] h-8 ms-0 leading-tight ${pageInfo.page === 0
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
                          ${i === pageInfo.page
            ? "bg-[#F6D9FF] text-messages"
            : "bg-transparent text-tertiary-text"
          }"
                          onclick="changePage(${i})">${i + 1}</button>
              `;
      }
      paginationButtons += "</div>";
      $pagination.append(paginationButtons);

      $pagination.append(`
              <div class="flex items-center justify-center h-8 ms-0 pl-[42px] leading-tight ${pageInfo.page === pageInfo.pages - 1
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
  $("#customSearchPop").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Səhifə dəyişdirmə
  window.changePage = function (page) {
    table.page(page).draw("page");
  };
});

document.getElementById("submitByIdBtn").addEventListener("click", async () => {
  const id = document.getElementById("idInput").value.trim();
  const errorEl = document.getElementById("searchError");
  errorEl.classList.add("hidden");
  if (!id || !id.startsWith("PA-")) {
    errorEl.textContent = "Please enter a valid ID";
    errorEl.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch("/partner/get-user-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": document.querySelector("meta[name='csrf-token']").content,
      },
      body: JSON.stringify({ partnyor_id: id }),
    });
    if (!res.ok) return alertModal("User not found", "error");

    const user = await res.json();

    document.getElementById("userInfoResult").innerHTML = `
      <div class="flex justify-between border-b pb-3">
        <span class="opacity-65">Ad:</span><span class="font-medium">${user.name}</span>
      </div>
      <div class="flex justify-between border-b pb-3">
        <span class="opacity-65">Soyad:</span><span class="font-medium">${user.surname}</span>
      </div>
      <div class="flex justify-between border-b pb-3">
        <span class="opacity-65">Cinsi:</span><span class="font-medium">${user.gender}</span>
      </div>
      <div class="flex justify-between border-b pb-3">
        <span class="opacity-65">Email:</span><span class="font-medium">${user.email}</span>
      </div>
      <div class="flex justify-between border-b pb-3">
        <span class="opacity-65">Telefon:</span><span class="font-medium">+${user.phone_suffix} ${user.phone}</span>
      </div>
      <input type="hidden" id="hiddenUserId" value="${user._id}" />
    `;
    document.getElementById("ishciId").style.display = "block";
    document.getElementById("yeni-isci-div").style.display = "none";
    document.getElementById("overlay").style.display = "block";
  } catch (err) {
    errorEl.textContent = "User not found";
    errorEl.classList.remove("hidden");
  }
});
document
  .querySelector("#ishciId #inviteButton")
  .addEventListener("click", async () => {
    const userId = document.getElementById("hiddenUserId")?.value;
    if (!userId) return alert("Error occured");

    try {
      const res = await fetch("/partner/invite-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": document.querySelector("meta[name='csrf-token']")
            .content,
        },
        body: JSON.stringify({ id: userId }),
      });

      const data = await res.json();

      if (res.ok) {
        alertModal("User added successfully");
        document.getElementById("ishciId").style.display = "none";
        document.getElementById("overlay").style.display = "none";
        location.reload();
      } else {
        alertModal(data.message || "Error occured", "error");
      }
    } catch (err) {
      alertModal("Server error", "error");
    }
  });

document
  .querySelector("#excelIsciler a.bg-primary")
  .addEventListener("click", async () => {
    const table = $("#myTable2").DataTable();
    const selectedIds = [];

    $("#myTable2 tbody tr").each(function () {
      const checkbox = $(this).find('input[type="checkbox"]');

      if (checkbox.is(":checked")) {
        const row = table.row($(this)).data();
        const userId =
          row?._id || row?.id;
        if (userId) {
          selectedIds.push(userId);
        }
      }
    });

    if (selectedIds.length === 0) {
      return alertModal("Zəhmət olmasa ən azı bir işçi seçin", "error");
    }

    try {
      const bodyData =
        selectedIds.length === 1
          ? { id: selectedIds[0] }
          : { ids: selectedIds };

      const res = await fetch("/partner/invite-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": document.querySelector("meta[name='csrf-token']")
            .content,
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok) {
        alertModal(data.message || "İşçilərə dəvət göndərildi");
        location.reload();
      } else {
        alertModal(data.message || "Xəta baş verdi", "error");
      }
    } catch (err) {
      console.error("Invite error:", err);
      alertModal("Server xətası baş verdi", "error");
    }
  });
