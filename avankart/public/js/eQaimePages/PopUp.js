const minPrice = document.querySelector('#min-price')
const maxPrice = document.querySelector('#max-price')
const minpricerange = document.querySelector('#minpricerange')
const maxpricerange = document.querySelector('#maxpricerange')
const MAX_VALUE = 300000
function yekunminprice(){
    minPrice.innerHTML = minpricerange.value + `<img src="/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
}
function yekunmaxprice(){
    const reverseValue = MAX_VALUE - maxpricerange.value
    maxPrice.innerHTML = maxpricerange.value + `<img src="/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
}

const filterPop = document.querySelector('#filterPop')
const overlay = document.querySelector('#overlay')
let filterclick = false

function openFilterModal(){
    filterclick = !filterclick
    if(filterclick){
        filterPop.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        filterPop.style.display = 'none'
        overlay.style.display = 'none'
    }

}
$("#slider-range").slider({
  range: true,
  min: 0,
  max: 300000,
  values: [12345, 245000],
  slide: function (event, ui) {
    $("#min-value").text(formatCurrency(ui.values[0]));
    $("#max-value").text(formatCurrency(ui.values[1]));
  }
});


function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + " ₼";
}


document.getElementById("filterForm").addEventListener("reset", function () {
    const defaultMin = 12345;
    const defaultMax = 245000;

    $("#slider-range").slider("values", [defaultMin, defaultMax]);

    $("#min-value").text(formatCurrency(defaultMin));
    $("#max-value").text(formatCurrency(defaultMax));
});


