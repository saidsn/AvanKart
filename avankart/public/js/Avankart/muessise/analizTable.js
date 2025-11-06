// Global dəyişənlər
let analizDataTable = null;
let currentAnalizFilters = {};
let currentHesablasmaId = null;

$(document).ready(function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Analiz modalı açıldığında çağırılacaq
  window.openAnalizModal = function (hesablasmaId) {
    currentHesablasmaId = hesablasmaId;

    if ($("#analizModal").hasClass("hidden")) {
      $("#analizModal").removeClass("hidden");

      // Hesablaşma məlumatlarını yüklə
      loadHesablasmaAnalizData(hesablasmaId);

      // Transaction table-ını initialize et
      initializeAnalizDataTable(hesablasmaId);
    }
  };

  // Hesablaşma analiz məlumatlarını yükləmək
  function loadHesablasmaAnalizData(hesablasmaId) {
    $.ajax({
      url: "/emeliyyatlar/muessise/hesablasma/analiz/" + hesablasmaId,
      type: "GET",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      success: function (response) {
        if (response.success && response.data) {
          const data = response.data;

          // Modal başlığını yenilə
          $("#analizModalHeader").html(
            '<div class="flex justify-center items-center">' +
              '<div class="flex justify-center items-center w-10 h-10 rounded-[50%] bg-table-hover">' +
              '<img src="' +
              data.muessise.logo +
              '" class="object-cover" alt="Logo">' +
              "</div>" +
              "</div>" +
              '<div class="w-full">' +
              '<div class="text-[13px] font-medium">' +
              data.muessise.name +
              "</div>" +
              '<div class="text-[11px] text-messages opacity-65 font-normal">' +
              'ID: <span class="opacity-100">' +
              data.muessise.id +
              "</span>" +
              "</div>" +
              "</div>"
          );

          // Problem təsvirini yenilə
          $("#analizModalProblemText").text(data.problem_tasviri);

          // Məlumat sətirini yenilə
          const infoSection = $("#analizModalInfoSection");
          if (infoSection.length > 0) {
            infoSection.html(
              '<div class="pl-4 pr-3 border-r-[0.5px] border-[#0000001A]">' +
                '<span class="text-[13px] font-normal text-messages opacity-50">İnvoys nömrəsi:</span>' +
                '<span class="text-[13px] font-normal text-messages">' +
                data.invoice_nomresi +
                "</span>" +
                "</div>" +
                '<div class="pl-4 pr-3 border-r-[0.5px] border-[#0000001A]">' +
                '<span class="text-[13px] font-normal text-messages opacity-50">Tranzaksiya sayı:</span>' +
                '<span class="text-[13px] font-normal text-messages">' +
                data.tranzaksiya_sayi +
                "</span>" +
                "</div>" +
                '<div class="pl-4 pr-3 border-r-[0.5px] border-[#0000001A]">' +
                '<span class="text-[13px] font-normal text-messages opacity-50">Hesablaşma məbləği:</span>' +
                '<span class="text-[13px] font-normal text-messages">' +
                data.yekun_mebleg.toFixed(2) +
                " AZN</span>" +
                "</div>" +
                '<div class="pl-4 pr-3 border-r-[0.5px] border-[#0000001A]">' +
                '<span class="text-[13px] font-normal text-messages opacity-50">Hesablaşma tarixi:</span>' +
                '<span class="text-[13px] font-normal text-messages">' +
                data.hesablasma_tarixi_baslangic +
                " - " +
                data.hesablasma_tarixi_son +
                "</span>" +
                "</div>" +
                '<div class="pl-4 pr-3 flex items-center gap-2 border-[#0000001A]">' +
                '<span class="text-[13px] font-normal text-messages opacity-50">Status:</span>' +
                '<span class="text-[13px] font-normal text-messages flex items-center gap-2 bg-container-2 py-[3.5px] px-2 rounded-full">' +
                '<span class="bg-error w-1.5 h-1.5 rounded-full"></span>' +
                '<span class="text-[13px] font-medium">Report edildi</span>' +
                "</span>" +
                "</div>"
            );
          }
        }
      },
      error: function (xhr, status, error) {
        alert("Analiz məlumatları yüklənərkən xəta baş verdi");
      },
    });
  }

  // Transaction table-ını initialize etmək
  function initializeAnalizDataTable(hesablasmaId) {
    if (!hesablasmaId) {
      return;
    }

    if ($.fn.DataTable.isDataTable("#analizTable")) {
      analizDataTable.destroy();
    }

    analizDataTable = $("#analizTable").DataTable({
      ajax: {
        url:
          "/emeliyyatlar/muessise/hesablasma/analiz/" +
          hesablasmaId +
          "/transactions",
        type: "POST",
        contentType: "application/json",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        data: function (d) {
          const requestData = {
            draw: d.draw,
            start: d.start,
            length: d.length,
            search: d.search.value,
          };
          return JSON.stringify(requestData);
        },
        dataSrc: function (response) {
          if (!response || !response.success) {
            return [];
          }

          return response.data || [];
        },
        error: function (xhr, status, error) {
          console.error("Analiz DataTable AJAX Error:", {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
            error: error,
          });
        },
      },
      serverSide: true,
      processing: true,
      paging: true,
      dom: "t",
      info: false,
      order: [],
      lengthChange: true,
      pageLength: 10,
      columns: [
        {
          data: "transaction_id",
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
          data: "card_name",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
        {
          data: "amount",
          render: function (data) {
            return (
              '<span class="text-[13px] text-messages dark:text-on-primary-dark font-normal">' +
              (data || "—") +
              "</span>"
            );
          },
        },
      ],
      drawCallback: function () {
        // Edit funksiyaları silinib - yalnız görüntüləmə təmin edilir

        // Pagination
        const pageInfo = analizDataTable.page.info();
        const $pagination = $("#customPaginationAnaliz");
        $pagination.empty();

        if (pageInfo.pages <= 1) return;

        $("#pageCountAnaliz").text(
          pageInfo.page + 1 + " / " + (pageInfo.pages || 1)
        );

        $pagination.append(
          '<div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ' +
            (pageInfo.page === 0
              ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
              : "text-messages dark:text-[#FFFFFF] cursor-pointer") +
            '" onclick="changeAnalizPage(' +
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
            '" onclick="changeAnalizPage(' +
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
            '" onclick="changeAnalizPage(' +
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

        $(row)
          .find("td")
          .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

        $(row).find("td").css({
          "padding-left": "20px",
          "padding-top": "14.5px",
          "padding-bottom": "14.5px",
        });
      },
    });
  }

  // "Təsdiqlə və yenidən göndər" funksiyası
  window.approveAndResendHesablasma = function () {
    if (!currentHesablasmaId) {
      alert("Hesablaşma ID tapılmadı");
      return;
    }

    // Close analiz modal and open confirm modal
    $("#analizModal").addClass("hidden");
    $("#confirmModal").removeClass("hidden");

    // Update confirm modal başlığı və məlumatı
    $("#confirmModal h2").text("Hesablaşma təsdiqi");

    $("#confirmModal .otp-input").val("");
    $("#confirmModal .otp-input").first().focus();

    window.sendOtpToAdmin();
  };
});

window.resendOtp = function () {
  if (!currentHesablasmaId) {
    alert("Hesablaşma ID tapılmadı");
    return;
  }

  // OTP input-ları təmizlə
  $("#confirmModal .otp-input").val("");
  $("#confirmModal .otp-input").first().focus();

  // Yenidən OTP göndər
  sendOtpToAdmin();
};

// sendOtpToAdmin funksiyasını global et
window.sendOtpToAdmin = function () {
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  fetch(
    "/emeliyyatlar/muessise/hesablasma/analiz/" +
      currentHesablasmaId +
      "/send-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        $("#otpEmailDisplay").text(data.email);

        alert("OTP kodu " + data.email + " adresinə göndərildi!");
      } else {
        alert("OTP göndərilmədi: " + data.message);
      }
    })
    .catch((error) => {
      alert("OTP göndərilmədi");
    });
};

// Global funksiyalar
window.changeAnalizPage = function (page) {
  if (analizDataTable) {
    analizDataTable.page(page).draw("page");
  }
};

function performAnalizSearch() {
  const searchValue = $("#customSearchAnaliz").val();
  if (analizDataTable) {
    analizDataTable.search(searchValue).draw();
  }
}

$("#customSearchAnaliz").on("keyup", function (e) {
  performAnalizSearch();
});

$(".go-button-analiz").on("click", function (e) {
  e.preventDefault();

  const pageInput = $(this).siblings(".page-input-analiz");
  let pageNumber = parseInt(pageInput.val());

  pageInput.val("");

  if (!isNaN(pageNumber) && pageNumber > 0) {
    if (analizDataTable) {
      const pageInfo = analizDataTable.page.info();
      let dataTablePage = pageNumber - 1;

      if (dataTablePage < pageInfo.pages) {
        analizDataTable.page(dataTablePage).draw("page");
      } else {
        console.warn("Daxil etdiyiniz səhifə nömrəsi mövcud deyil.");
      }
    }
  } else {
    console.warn("Zəhmət olmasa etibarlı səhifə nömrəsi daxil edin.");
  }
});

// Hesablaşmanı təsdiqlə və yenidən göndər - OTP ilə
window.approveHesablasmaWithOtp = function () {
  const otpInputs = document.querySelectorAll("#confirmModal .otp-input");
  let otpCode = "";

  otpInputs.forEach((input) => {
    otpCode += input.value;
  });

  if (otpCode.length !== 6) {
    alert("6 rəqəmli OTP kodunu daxil edin");
    return;
  }

  if (!currentHesablasmaId) {
    alert("Hesablaşma ID tapılmadı");
    return;
  }

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  fetch(
    "/emeliyyatlar/muessise/hesablasma/analiz/" +
      currentHesablasmaId +
      "/approve-resend",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ otp_code: otpCode }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Hesablaşma uğurla təsdiqləndi və yenidən göndərildi");
        $("#confirmModal").addClass("hidden");
        $("#analizModal").addClass("hidden");

        // Main table-ı yenilə
        if (typeof dataTable !== "undefined" && dataTable) {
          dataTable.ajax.reload();
        }
      } else {
        alert(data.message || "Xəta baş verdi");
      }
    })
    .catch((error) => {
      alert("Xəta baş verdi");
    });
};
