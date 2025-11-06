const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const emailError = document.getElementById('emailError');
const passwordInput = document.getElementById('passwordInput');
const passwordError = document.getElementById('passwordError');
const loginButton = document.getElementById('loginButton');

loginButton.addEventListener('click', function (e) {
    e.preventDefault();

    let hasError = false;

    // Email yoxlama
    if (!emailInput.value.includes('@')) {
        emailError.classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        hasError = true;
    } else {
        emailError.classList.add('hidden');
        emailInput.classList.remove('border-red-500');
    }
    // Şifrə yoxlama
    if (passwordInput.value.length < 6) {
        passwordError.classList.remove('hidden');
        passwordInput.classList.add('border-red-500');
        passwordError.classList.add('mb-[36px]');
        hasError = true;
    } else {
        passwordError.classList.add('hidden');
        passwordInput.classList.remove('border-red-500');
        passwordError.classList.remove('mb-[36px]');
    }
});