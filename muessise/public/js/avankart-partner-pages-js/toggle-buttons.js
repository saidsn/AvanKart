document.addEventListener("DOMContentLoaded", function () {
  const aktivButton = document.getElementById("aktivButton");
  const ayrilanlarSpan = document.getElementById("ayrilanlarSpan");

  const aktivWrapper = document.getElementById("aktivWrapper");
  const ayrilanWrapper = document.getElementById("ayrilanWrapper");

  const activeClasses = [
    "bg-inverse-on-surface",
    "text-black",
    "dark:text-white",
    "dark:bg-[#2E3135]"
  ];

  const inactiveClasses = [
    "text-messages",
    "dark:text-secondary-text-color-dark",
    "cursor-pointer",
    "hover:dark:text-primary-text-color-dark"
  ];

  // Başlanğıc vəziyyət
  aktivWrapper.classList.remove("hidden");
  ayrilanWrapper.classList.add("hidden");

  aktivButton.classList.add(...activeClasses);
  aktivButton.classList.remove(...inactiveClasses);

  ayrilanlarSpan.classList.remove(...activeClasses);
  ayrilanlarSpan.classList.add(...inactiveClasses);

  // Toggle funksiyası
  aktivButton.addEventListener("click", function () {
    aktivWrapper.classList.remove("hidden");
    ayrilanWrapper.classList.add("hidden");

    aktivButton.classList.add(...activeClasses);
    aktivButton.classList.remove(...inactiveClasses);

    ayrilanlarSpan.classList.remove(...activeClasses);
    ayrilanlarSpan.classList.add(...inactiveClasses);
  });

  ayrilanlarSpan.addEventListener("click", function () {
    aktivWrapper.classList.add("hidden");
    ayrilanWrapper.classList.remove("hidden");

    ayrilanlarSpan.classList.add(...activeClasses);
    ayrilanlarSpan.classList.remove(...inactiveClasses);

    aktivButton.classList.remove(...activeClasses);
    aktivButton.classList.add(...inactiveClasses);
  });
});


$(document).ready(function () {
  const defaultMin = globalMinAmount;
  const defaultMax = globalMaxAmount;

  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 300000,
    values: [defaultMin, defaultMax],
    slide: function (event, ui) {
      $("#min-value").text(formatCurrency(ui.values[0]));
      $("#max-value").text(formatCurrency(ui.values[1]));
    },
  });

  $("#min-value").text(formatCurrency(defaultMin));
  $("#max-value").text(formatCurrency(defaultMax));

  document.getElementById("filterForm").addEventListener("reset", function () {
    $("#slider-range").slider("values", [defaultMin, defaultMax]);
    $("#min-value").text(formatCurrency(defaultMin));
    $("#max-value").text(formatCurrency(defaultMax));
  });
});

function formatCurrency(value) {
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₼"
  );
}

function openFilterModal() {
  const modal = document.getElementById("filterPop");
  modal.classList.toggle("hidden");

  setTimeout(() => {
    $("#slider-range").slider("refresh");
  }, 50);
}

    let clickDel = false;

  function deletePopUp() {
      clickDel = !clickDel;
      const isciniSil2 = document.querySelector('#iscisilDiv2');
      if (clickDel) {
        isciniSil2.style.display = 'block';
      } else {
        isciniSil2.style.display = 'none';
      }
    }
    
    let clickTesdiq = false
    
    function toggleEmail() {
      clickTesdiq = !clickTesdiq
      const emaildogrulamaDiv = document.querySelector('.emaildogrulama-div');
      const isciniSil2 = document.querySelector('#iscisilDiv2');
    if(clickTesdiq) {
      isciniSil2.style.display = 'none';
      emaildogrulamaDiv.style.display = 'block';
    }
    else{
      emaildogrulamaDiv.style.display = 'none';
    }
  }