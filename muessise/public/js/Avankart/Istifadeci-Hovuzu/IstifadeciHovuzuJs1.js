let sidebar = document.querySelector('#sidebar')
let sidebarToggle = document.querySelector('#sidebarToggle')
let notfCount = document.querySelector('.notfCount')
const filterPop = document.querySelector('#filterPop')
const overlay = document.querySelector('#overlay')
let click = false

function openFilterModal(){
    click = !click
    if(click){
        filterPop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        filterPop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}

let deaktivPop = document.querySelector('#deaktivPop')
let click2 = false

function clickDeaktiv(){
    click2 = !click2
    if(click2){
        deaktivPop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        deaktivPop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}


let silinmeTesdiqPop = document.querySelector('#silinmeTesdiqPop')
let click3 = false

function clicksilinmeTesdiq(){
    click3 = !click3
    if(click3){
        silinmeTesdiqPop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        silinmeTesdiqPop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}

let aktivetPop = document.querySelector('#aktivetPop')
let click4 = false

function clickaktivet(){
    click4 = !click4
    if(click4){
        aktivetPop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        aktivetPop.style.display = 'none'
        overlay.style.display = 'none'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
        sidebar.style.background = '#fafafa'
    }
}


let silinmeMuracietPopUp = document.querySelector('#silinmeMuracietPopUp')
let click5 = false

function clickSilinmeMuraciet(){
    click5 = !click5
    if(click5){
        silinmeMuracietPopUp.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        silinmeMuracietPopUp.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}


let mailadressiPop = document.querySelector('#mailadressiPop')
let click6 = false

function clickmaildeyish(){
    click6 = !click6
    if(click6){
        mailadressiPop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        mailadressiPop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}

let surunlarpop = document.querySelector('#surunlarpop')
let click7 = false;


function surunlarclick(){
    click7 = !click7
    if(click7){
        surunlarpop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        surunlarpop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}


let hesabtesdiqipop = document.querySelector('#hesabtesdiqipop')
let click8 = false


function clickhesabTesdiqi(){
    click8 = !click8
    if(click8){
        hesabtesdiqipop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        hesabtesdiqipop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}