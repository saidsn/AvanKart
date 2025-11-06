let reportPopup = document.querySelector("#reportPopup");
let aside = document.querySelector("aside");
let span4 = document.querySelector(".span4");
let span4_1 = document.querySelector(".span4-1");
let curveleft = document.querySelector("#curve-left-div");
let tenzimlemelerDiv = document.querySelector("#tenzimlemeler-div");
let avankartDiv = document.querySelector("#avankart-div");
let destekDiv = document.querySelector(".destek-div");
let destekLogo = document.querySelector(".destek-logo");
let toggleclick = false;

function reportclick() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    reportPopup.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    reportPopup.style.display = "none";
    overlay.style.display = "none";
  }
}

let toggleclick2 = false;

function odenishclick() {
  if (toggleclick2) {
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    overlay.style.display = "none";
  }
}

let OdenisPopUp = document.querySelector("#OdenisPopUp");

let toggleclick3 = false;

function odenishclick() {
  toggleclick3 = !toggleclick3;
  if (toggleclick3) {
    OdenisPopUp.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    OdenisPopUp.style.display = "none";
    overlay.style.display = "none";
  }
}

let fakturaDiv = document.querySelector(".faktura-div");

let toggleclick4 = false;

function fakturaclick() {
  toggleclick4 = !toggleclick4;
  if (toggleclick4) {
    fakturaDiv.style.background = "#fff";
    fakturaDiv.style.display = "block";
    overlay.style.display = "block";
    aside.style.background = "transparent";
    span4.style.background = "transparent";
    span4_1.style.background = "transparent";
    curveleft.style.background = "transparent";
    tenzimlemelerDiv.style.background = "transparent";
    destekDiv.style.background = "transparent";
    destekLogo.style.background = "transparent";
  } else {
    fakturaDiv.style.display = "none";
    overlay.style.display = "none";
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

const filterPop = document.querySelector("#filterPop");
let filterclick = false;

function openFilterModal() {
  console.log("opened filter modal in hesablashmalar page");

  if (!filterclick) {
    filterPop.classList.remove("hidden");
    overlay.classList.remove("hidden");
    filterclick = true;

    // Initialize slider with dynamic values
    setTimeout(() => {
      const minVal = globalMinAmount || 0;
      const maxVal = globalMaxAmount || 300000;

      $("#slider-range").slider({
        range: true,
        min: minVal,
        max: maxVal,
        values: [minVal, maxVal],
        slide: function (event, ui) {
          $("#min-value").text(formatCurrency(ui.values[0]));
          $("#max-value").text(formatCurrency(ui.values[1]));
        },
      });

      // Set initial display values
      $("#min-value").text(formatCurrency(minVal));
      $("#max-value").text(formatCurrency(maxVal));

      console.log("Slider initialized with min:", minVal, "max:", maxVal);
    }, 0);
  } else {
    filterPop.classList.add("hidden");
    overlay.classList.add("hidden");
    filterclick = false;
  }
}

function formatCurrency(value) {
  return (
    new Intl.NumberFormat("az-AZ", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₼"
  );
}

function openReportModal(invoiceId, transactions, amount, date) {
  document.getElementById("reportModalOverlay").classList.remove("hidden");
  document.getElementById("reportModal").classList.remove("hidden");

  // Popup içindeki alanları doldur
  document.getElementById("reportInvoice").innerText = invoiceId;
  document.getElementById("reportTransactions").innerText = transactions;
  document.getElementById("reportAmount").innerText = amount + " AZN";
  document.getElementById("reportDate").innerText = date;

  // HIDDEN INPUT değerini ata
  document.getElementById("reportInvoiceId").value = invoiceId;
}

function closeReportModal() {
  document.getElementById("reportModalOverlay").classList.add("hidden");
  document.getElementById("reportModal").classList.add("hidden");
}
