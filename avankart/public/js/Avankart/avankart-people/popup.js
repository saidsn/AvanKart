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


let deaktivTesdiqPop = document.querySelector("#deaktivTesdiqPop")
let clickTesdiqDeaktiv = false
let clickTesdiqDeaktiv2 = false
let clickTesdiqDeaktiv3 = false

function clickDeaktivTesdiq() {
    clickTesdiqDeaktiv = !clickTesdiqDeaktiv
    if(clickTesdiqDeaktiv) {
        deaktivTesdiqPop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        deaktivTesdiqPop.style.display = 'none'
        overlay.style.display = 'none'
    }
}


function clickDeaktivTesdiqDogrulama() {
    clickTesdiqDeaktiv2 = !clickTesdiqDeaktiv2
    if(clickTesdiqDeaktiv2) {
        hesabtesdiqipop.style.display = 'block'
        deaktivTesdiqPop.style.display = 'none' // <-- burda düzəliş
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        hesabtesdiqipop.style.display = 'none'
        deaktivTesdiqPop.style.display = 'none' // <-- burda da düzəliş
        overlay.style.display = 'none'
    }
}



function clickReddEt() {
    clickTesdiqDeaktiv3 = !clickTesdiqDeaktiv3
    if(clickTesdiqDeaktiv3) {
        hesabtesdiqipop.style.display = 'block'
        overlay.style.display = 'block'
        sidebar.style.background = 'transparent'
        sidebarToggle.style.background = 'transparent'
        notfCount.style.background = 'transparent'
    }
    else{
        hesabtesdiqipop.style.display = 'none'
        overlay.style.display = 'none'
    }
}



let timeLeft = 4 * 60 + 59; // 4:59 in seconds
const countdownEl = document.getElementById('countdown');
const resendBtn = document.getElementById('resendBtn');
const otpInputs = document.querySelectorAll('.otp-input');
const updateTimer = () => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    resendBtn.disabled = false;
    resendBtn.classList.remove("text-gray-600");
    resendBtn.classList.add("text-purple-600", "cursor-pointer");
  }
  timeLeft--;
};
const timer = setInterval(updateTimer, 1000);
updateTimer();
otpInputs.forEach((input, index) => {
  input.classList.add(
    "w-full", "h-[34px]", "text-center", "border-2", "border-purple-300",
    "rounded-md", "focus:outline-none", "focus:border-purple-500", "text-xl"
  );
  input.setAttribute("type", "text");
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("pattern", "[0-9]*");
  input.setAttribute("autocomplete", "one-time-code");
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
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
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pastedText.replace(/\D/g, '').split("");
    if (digits.length > 0) {
      otpInputs.forEach((input, i) => {
        input.value = digits[i] || "";
      });
      otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
    }
  });
});
