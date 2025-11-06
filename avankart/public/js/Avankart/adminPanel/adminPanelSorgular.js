function openFilterModal() {
    const filterPop = document.getElementById('filterPop');
    filterPop.classList.toggle('hidden');
}

window.toggleDropdown_company = function () {
  const dropdown = document.getElementById("dropdown_company");
  dropdown.classList.toggle("hidden");
};

document.addEventListener("click", function (event) {
  const companyDropdown = document.getElementById("dropdown_company");
  const companyButton = document.getElementById("dropdownDefaultButton_company");
  if (companyButton && companyDropdown) {
    if (
      !companyButton.contains(event.target) &&
      !companyDropdown.contains(event.target)
    ) {
      companyDropdown.classList.add("hidden");
    }
  }
});




$(document).ready(function () {
    // 3 nöqtə ikonuna klikləyəndə dropdown açılır
    $("#threeDotsIcon").on("click", function (e) {
        e.stopPropagation();
        $("#profileDropdown").removeClass("hidden");
    });

    // Səhifədə başqa yerə klikləyəndə dropdown bağlanır
    $(document).on("click", function () {
        $("#profileDropdown").addClass("hidden");
    });

    // Dropdownun içində klikləyəndə bağlanmasın
    $("#profileDropdown").on("click", function (e) {
        e.stopPropagation();
    });
});






// ...existing code...

window.clickhesabTesdiqi = function () {
    $("#hesabtesdiqipop").toggleClass("hidden");
    // Overlay-i aç/bağla
    if (!$("#hesabtesdiqipop").hasClass("hidden")) {
        $("#overlay").removeClass("hidden");
    } else {
        $("#overlay").addClass("hidden");
    }
};



// ...existing code...

window.clickmaildeyish = function () {
    $("#mailadressiPop").toggleClass("hidden");
    // Overlay-i aç/bağla
    if (!$("#mailadressiPop").hasClass("hidden")) {
        $("#overlay").removeClass("hidden");
    } else {
        $("#overlay").addClass("hidden");
    }
};

window.confirmMailChange = function () {
    // Mail popup-u bağla
    $("#mailadressiPop").addClass("hidden");
    // OTP popup-u aç
    $("#hesabtesdiqipop").removeClass("hidden");
    // Overlay aktiv olsun
    $("#overlay").removeClass("hidden");
};

window.clickTwoStepVerification = function () {
    $("#twoStepVerificationPop").toggleClass("hidden");
    // Overlay-i aç/bağla
    if (!$("#twoStepVerificationPop").hasClass("hidden")) {
        $("#overlay").removeClass("hidden");
    } else {
        $("#overlay").addClass("hidden");
    }
}; 

window.twoStepVerificationConfirm = function () {
   
    $("#twoStepVerificationPop").addClass("hidden");

    $("#hesabtesdiqipop").removeClass("hidden");

    $("#overlay").removeClass("hidden");
};


// ...existing code...

window.clickDeaktiv = function () {
    $("#deaktivPop").toggleClass("hidden");
    // Overlay-i aç/bağla
    if (!$("#deaktivPop").hasClass("hidden")) {
        $("#overlay").removeClass("hidden");
    } else {
        $("#overlay").addClass("hidden");
    }
};

// ...existing code...

window.clickSilinmeMuraciet = function () {
    $("#silinmeMuracietPopUp").toggleClass("hidden");
    // Overlay-i aç/bağla
    if (!$("#silinmeMuracietPopUp").hasClass("hidden")) {
        $("#overlay").removeClass("hidden");
    } else {
        $("#overlay").addClass("hidden");
    }
};

// Modal və overlay arxa fona kliklənəndə bağlansın
$(document).on("mousedown", function (e) {
    const $modal1 = $("#hesabtesdiqipop");
    const $modal2 = $("#mailadressiPop");
    const $modal3 = $("#twoStepVerificationPop");
    const $modal4 = $("#deaktivPop");
    const $modal5 = $("#silinmeMuracietPopUp");
    if (
        (!$modal1.hasClass("hidden") && !$modal1.is(e.target) && $modal1.has(e.target).length === 0) ||
        (!$modal2.hasClass("hidden") && !$modal2.is(e.target) && $modal2.has(e.target).length === 0) ||
        (!$modal3.hasClass("hidden") && !$modal3.is(e.target) && $modal3.has(e.target).length === 0) ||
        (!$modal4.hasClass("hidden") && !$modal4.is(e.target) && $modal4.has(e.target).length === 0) ||
        (!$modal5.hasClass("hidden") && !$modal5.is(e.target) && $modal5.has(e.target).length === 0)
    ) {
        $modal1.addClass("hidden");
        $modal2.addClass("hidden");
        $modal3.addClass("hidden");
        $modal4.addClass("hidden");
        $modal5.addClass("hidden");
        $("#overlay").addClass("hidden");
    }
});

// ...existing code...