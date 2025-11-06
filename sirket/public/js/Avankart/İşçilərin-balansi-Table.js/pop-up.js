const minPrice = document.querySelector('#min-price')
const maxPrice = document.querySelector('#max-price')
const minpricerange = document.querySelector('#minpricerange')
const maxpricerange = document.querySelector('#maxpricerange')
const MAX_VALUE = 300000
function yekunminprice(){
    minPrice.innerHTML = minpricerange.value + `<img src="/public/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
}
function yekunmaxprice(){
    const reverseValue = MAX_VALUE - maxpricerange.value
    maxPrice.innerHTML = maxpricerange.value + `<img src="/public/images/hesablasmalar-pages/aznimg.svg" alt="AZN">`
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

const invoyspopup = document.querySelector('#invoyspopup')
let clickpop = false

function invoysclick(){
    clickpop = !clickpop
    if(clickpop){
        invoyspopup.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        invoyspopup.style.display = 'none'
        overlay.style.display = 'none'
    }
}

