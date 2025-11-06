
const removeModal = document.getElementById('removeModal');


function showEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');
}

function deleteSubmit() {
    const modal = document.getElementById('removeModal');
    modal.classList.remove('hidden'); // show modal
}
function closeRemoveModal() {
    const modal = document.getElementById('removeModal');
    modal.classList.add('hidden'); // hide instead of remove
}

// "Xeyr" button
removeModal.querySelector('button[type="button"]').addEventListener('click', closeRemoveModal);
removeModal.querySelector('button[type="submit"]').addEventListener('click', function(){
    document.getElementById("confirmModal").classList.remove('hidden')
});

// Clicking outside modal content
removeModal.addEventListener('click', (event) => {
    if (event.target === removeModal) {
        closeRemoveModal();
    }
});


$('#dropdownDefaultButton').on('click', function () {
    $('#dropdown').removeClass('hidden')
})
document.addEventListener("DOMContentLoaded", function () {
    const nameSelBtn = document.getElementById("nameSel");
    const nameSelLabel = document.getElementById("nameSelLabel");
    const vezifeBtn = document.getElementById("vezifeBtn");
    const dropdown = document.getElementById("dropdownVezife");
    const select = document.getElementById("selectVezife");
    const selectedSpan = document.getElementById("selectedValueVezife");
    const closeIconNameSel = document.getElementById("closeIconNameSel");
    const closeIconVezife = document.getElementById("closeIconVezife");

    const hideDropdown = () => dropdown.classList.add("hidden");

    nameSelBtn.addEventListener("click", (e) => {
        if (e.target.closest("#closeIconNameSel")) return; // handled below
        dropdown.classList.toggle("hidden");
    });

    vezifeBtn.addEventListener("click", (e) => {
        if (e.target.closest("#closeIconVezife")) return; // handled below
        dropdown.classList.toggle("hidden");
    });

    closeIconNameSel.addEventListener("click", (e) => {
        e.stopPropagation();
        nameSelBtn.classList.add("hidden");
        vezifeBtn.classList.remove("hidden");
        hideDropdown();
    });

    closeIconVezife.addEventListener("click", (e) => {
        e.stopPropagation();
        nameSelBtn.classList.remove("hidden");
        vezifeBtn.classList.add("hidden");
        hideDropdown();
    });

    dropdown.querySelectorAll("a").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const value = item.getAttribute("data-value");
            selectedSpan.textContent = value;
            nameSelLabel.textContent = value;
            select.value = value;

            hideDropdown();

            if (nameSelBtn.classList.contains("hidden") === false) {
                nameSelBtn.classList.add("hidden");
                vezifeBtn.classList.remove("hidden");
            }
        });
    });

    // Click outside closes dropdown
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !nameSelBtn.contains(e.target) && !vezifeBtn.contains(e.target)) {
            hideDropdown();
        }
    });

    // Escape key closes dropdown
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") hideDropdown();
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const readonlyBtn = document.getElementById("selahiyyetReadonly");
    const readonlyLabel = document.getElementById("selahiyyetLabel");
    const editableBtn = document.getElementById("selahiyyetEditable");
    const editableLabel = document.getElementById("selahiyyetSelected");
    const dropdown = document.getElementById("dropdownSelahiyyet");
    const realSelect = document.getElementById("realSelectSelahiyyet");
    const closeReadonly = document.getElementById("closeIconSelahiyyetReadonly");
    const closeEditable = document.getElementById("closeIconSelahiyyetEditable");

    const hideDropdown = () => dropdown.classList.add("hidden");

    // Toggle dropdown (readonly)
    readonlyBtn.addEventListener("click", (e) => {
        if (e.target.closest("#closeIconSelahiyyetReadonly")) return;
        dropdown.classList.toggle("hidden");
    });

    // Toggle dropdown (editable)
    editableBtn.addEventListener("click", (e) => {
        if (e.target.closest("#closeIconSelahiyyetEditable")) return;
        dropdown.classList.toggle("hidden");
    });

    // Switch to editable
    closeReadonly.addEventListener("click", (e) => {
        e.stopPropagation();
        readonlyBtn.classList.add("hidden");
        editableBtn.classList.remove("hidden");
        hideDropdown();
    });

    // Switch back to readonly
    closeEditable.addEventListener("click", (e) => {
        e.stopPropagation();
        readonlyBtn.classList.remove("hidden");
        editableBtn.classList.add("hidden");
        hideDropdown();
    });

    // Select option
    dropdown.querySelectorAll("a").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const value = item.getAttribute("data-value");

            editableLabel.textContent = value;
            readonlyLabel.textContent = value;
            realSelect.value = value;

            hideDropdown();

            if (!readonlyBtn.classList.contains("hidden")) {
                readonlyBtn.classList.add("hidden");
                editableBtn.classList.remove("hidden");
            }
        });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !readonlyBtn.contains(e.target) && !editableBtn.contains(e.target)) {
            hideDropdown();
        }
    });

    // Close with Esc
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") hideDropdown();
    });
});

function clickOperator(element) {
    const operatorText = document.getElementById('operatorText');
    if (operatorText && element) {
        operatorText.innerHTML = element.textContent.trim();
    }
}

let countdownTimer;
let countdownDuration = 5 * 60; // 5 minutes in seconds

// Start or restart countdown
function startCountdown() {
    let timeLeft = countdownDuration;

    clearInterval(countdownTimer); // clear previous timer
    updateCountdownDisplay(timeLeft); // initial display

    countdownTimer = setInterval(() => {
        timeLeft--;
        updateCountdownDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            $("#countdown").text("0:00");
        }
    }, 1000);
}

// Update the countdown UI
function updateCountdownDisplay(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    $("#countdown").text(`${minutes}:${secs < 10 ? "0" : ""}${secs}`);
}

// Open modal
function openConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.classList.remove('hidden');
    startCountdown();
}

// Close modal
function closeConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.classList.add('hidden');
    clearInterval(countdownTimer);
}

// Reset countdown on "Yenidən göndər"
$(document).on("click", "#confirmModal a", function (e) {
    e.preventDefault();
    startCountdown();
});

// OTP input auto-focus and numeric only
$(document).on("input", ".otp-input", function () {
    let $this = $(this);
    let value = $this.val();

    // Only allow digits
    $this.val(value.replace(/[^0-9]/g, ""));

    // Move to next input if 1 digit entered
    if (value.length === 1) {
        $this.next(".otp-input").focus();
    }
});

// Backspace moves to previous input
$(document).on("keydown", ".otp-input", function (e) {
    if (e.key === "Backspace" && $(this).val() === "") {
        $(this).prev(".otp-input").focus();
    }
});

// Close modal when clicking outside the inner content
const confirmModal = document.getElementById('confirmModal');
confirmModal.addEventListener('click', (event) => {
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
});

// Close modal on "Ləğv et" or X button
function closeConfirmModalButton() {
    closeConfirmModal();
}

// Optional: clicking Təsdiqlə button
document.querySelector("#confirmModal .send").addEventListener('click', () => {
    // Add OTP validation logic here
    console.log("OTP confirmed!");
    closeConfirmModal();
});


