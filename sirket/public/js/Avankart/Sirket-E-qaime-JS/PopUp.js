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


const eqaimepopup = document.querySelector('#eqaimepopup')
const eqaimepopup2 = document.querySelector("#eqaimepopup2")
const eqaimepopup3 = document.querySelector("#eqaimepopup3")
let clickpop = false

function eqaimeclick(){
    clickpop = !clickpop
    if(clickpop){
        eqaimepopup.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        eqaimepopup.style.display = 'none'
        overlay.style.display = 'none'
    }
}

const tediqlemediv = document.querySelector('#tediqlemediv')
let clickqaime = false

function tediqleclick(){
    clickqaime = !clickqaime
    if(clickqaime){
        tediqlemediv.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        tediqlemediv.style.display = 'none'
        overlay.style.display = 'none'
    }
}

const emaildogrulamaDiv = document.querySelector('.emaildogrulama-div')
let toggleclick = false

function hesabtesdiq(){
    toggleclick = !toggleclick
    if(toggleclick){
        tediqlemediv.style.display = 'none'
        emaildogrulamaDiv.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        emaildogrulamaDiv.style.display = 'none'
        overlay.style.display = 'none'
    }
}

const invoyspopup2 = document.querySelector('#invoyspopup2')
let illerclick = false

function invoysiller(company){
    illerclick = !illerclick
    if(illerclick){
        eqaimepopup.style.display = 'none'
        invoyspopup2.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        invoyspopup2.style.display = 'none'
        overlay.style.display = 'none'
    }
}

let illerclick2 = false
let aylarclick2 = false

function aylaruzreclick(){
    aylarclick2 = !aylarclick2
    if(aylarclick2){
        eqaimepopup3.style.display = 'block'
        eqaimepopup2.style.display = 'none'
        overlay.style.display = 'block'
    }
    else{
        eqaimepopup3.style.display = 'none'
        overlay.style.display = 'none'
    }
}

function illeruzreClick(){
    illerclick2 = !illerclick2
    if(illerclick2){
        eqaimepopup.style.display = 'none'
        eqaimepopup2.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        eqaimepopup2.style.display = 'none'
        overlay.style.display = 'none'
    }
}

let evveleqayit = false

function evveleqayitclick(){
    evveleqayit = !evveleqayit
    if(evveleqayit){
        eqaimepopup.style.display = 'block'
        eqaimepopup2.style.display = 'none'
    }
    else{
        eqaimepopup2.style.display = 'block'
    }
}


let evveleqayit2 = false

function evveleqayitaylar(){
    evveleqayit2 = !evveleqayit2
    if(evveleqayit2){
        eqaimepopup3.style.display = 'none'
        eqaimepopup2.style.display = 'block'
    }
    else{
        eqaimepopup2.style.display = 'none'
        eqaimepopup3.style.display = 'block'
    }
}