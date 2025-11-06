const operator = document.querySelector('.operator')

function clickOperator(element){
    document.getElementById("operatorText").textContent = element.textContent.trim();
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