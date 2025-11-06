let sidebar = document.querySelector('#sidebar')
let sidebarToggle = document.querySelector('#sidebarToggle')
let notfCount = document.querySelector('.notfCount')
const overlay = document.querySelector('#overlay')
const aktivetPop = document.querySelector('#aktivetPop')
const filterPop = document.querySelector('#filterPop')
const deaktivPop = document.querySelector('#deaktivPop')
const hesabTesdiq = document.querySelector('#hesab-tesdiq')
const kartElaveEtPop = document.querySelector('#kart-elaveet-popup')
const muessiseKategoriyasi = document.querySelector('#muessise-kategoriyasi')
const iconsPopUp = document.querySelector('#icons-popup')
const colorPicker = document.querySelector('#color-picker')

let click = false
let click2 = false
let click3 = false
let click4 = false
let click5 = false
let click6 = false
let click7 = false
let click8 = false
let click9 = false
function clickAktiv(){
    click = !click
    if(click){
        aktivetPop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        aktivetPop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}

function openFilterModal(){
    click2 = !click2
    if(click2){
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

function clickDeaktiv(){
    click3 = !click3
    if(click3){
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


function clickTesdiq(){
    click4 = !click4
    if(click4){
        hesabTesdiq.style.display = 'block'
        overlay.style.display = 'block'
        aktivetPop.style.display = 'none'
        deaktivPop.style.display = 'none'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        hesabTesdiq.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}

function closeTesdiqPop(){
    click5 = !click5
    if(click5){
        hesabTesdiq.style.display = 'none'
        overlay.style.display = 'none'
    }
    else{
        hesabTesdiq.style.display = 'block'
        overlay.style.display = 'block'
    }
}

function clickKategoriya(){
    click6 = !click6
    if(click6){
        muessiseKategoriyasi.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        muessiseKategoriyasi.style.display = 'none'
    }
}

function chooseIcon(){
    click7 = !click7
    if(click7){
        iconsPopUp.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        iconsPopUp.style.display = 'none'
    }
}

function chooseBackgroundColor(){
    click8 = !click8
    if(click8){
        colorPicker.style.display = 'block'
    }
    else{
        colorPicker.style.display = 'none'
    }
}


function toggleSorgu(){
    click9 = !click9
    if(click9){
        kartElaveEtPop.style.display = 'block'
        overlay.style.display = 'block' 
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        kartElaveEtPop.style.display = 'none'
        overlay.style.display = 'none'
        sidebar.style.background = '#fafafa'
        sidebarToggle.style.background = '#fafafa'
        notfCount.style.background = '#fafafa'
    }
}


// Bütün filter-button sinifli elementləri seçirik
const filterButtons = document.querySelectorAll('.filter-button');

filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault(); // Linkin default davranışını bloklayırıq

        // Əvvəlki aktiv olanı deaktiv edirik
        filterButtons.forEach(btn => btn.classList.remove('active', 'text-messages', 'border-b-2', 'border-messages', 'dark:text-primary-text-color-dark', 'dark:border-primary-text-color-dark'));

        // Klik olunan elementi aktiv edirik
        this.classList.add('active', 'text-messages', 'border-b-2', 'border-messages', 'dark:text-primary-text-color-dark', 'dark:border-primary-text-color-dark');
    });
});


const btnText = document.querySelector('#btnText')
const deactivation_rules_4 = document.querySelector('#deactivation-rules-4')
const deactivation_conditions_rule_1 = document.querySelector('#deactivation-conditions-rule-1')
const deactivation_conditions_rule_2 = document.querySelector('#deactivation-conditions-rule-2')
const deactivation_conditions_rule_3 = document.querySelector('#deactivation-conditions-rule-3')

function rulesofuse() {
    btnText.innerHTML = 'Yeni qayda əlavə et';
    updateActiveTab('rules-of-use');
}

function activationinformation() {
    btnText.innerHTML = 'Yeni şərt əlavə et';
    updateActiveTab('activation-information');
}

function deactivationcondition() {
    deactivation_rules_4.style.display = 'flex'
    btnText.innerHTML = 'Yeni şərt əlavə et';
    deactivation_conditions_rule_1.innerHTML = '1.İşçi şirkətdən ayrılıb'
    deactivation_conditions_rule_2.innerHTML = '2.İşçi şirkətdən ayrılıb'
    deactivation_conditions_rule_3.innerHTML = '3.İşçi şirkətdən ayrılıb'
    updateActiveTab('deactivation-conditions');
    updateActiveTab('deactivation-conditions-rule-1');
    updateActiveTab('deactivation-conditions-rule-2');
    updateActiveTab('deactivation-conditions-rule-3');
}

function reasonsfordeactivation(){
    btnText.innerHTML = 'Yeni səbəb əlavə et'
    updateActiveTab('reasons-for-deactivation')
}