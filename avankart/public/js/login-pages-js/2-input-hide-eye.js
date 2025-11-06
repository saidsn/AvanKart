function togglePassword(inputId, icon) {
    let passwordField = document.getElementById(inputId);
    if (passwordField.type === "password") {
        passwordField.type = "text"; // Show password
        icon.classList.replace('iconex-hide-1', 'iconex-eye-1'); // Change icon
    } else {
        passwordField.type = "password"; // Hide password
        icon.classList.replace('iconex-eye-1', 'iconex-hide-1'); // Change icon back
    }
}
