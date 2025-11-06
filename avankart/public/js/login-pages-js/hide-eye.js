function togglePassword() {
    let passwordField = document.getElementById('passwordField');
    let hideeye = document.getElementById('hideeye');
    if (passwordField.type === "password") {
        passwordField.type = "text";
        hideeye.classList.replace('iconex-hide-1', 'iconex-eye-1');
    } else {
        passwordField.type = "password";
        hideeye.classList.replace('iconex-eye-1', 'iconex-hide-1');
    }
}