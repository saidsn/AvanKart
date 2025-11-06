document.addEventListener("DOMContentLoaded", function () {
    const SupportButtons = document.querySelectorAll(".support-type");

    SupportButtons.forEach(button => {
        button.addEventListener("click", function () {
            SupportButtons.forEach(btn => {
                btn.classList.remove(
                    "bg-inverse-on-surface",
                    "dark:bg-surface-variant-dark",
                    "text-messages",
                    "dark:text-primary-text-color-dark"
                );
                btn.classList.add(
                    "text-tertiary-text",
                    "dark:text-tertiary-text-color-dark"
                );
            });

            this.classList.add(
                "active",
                "bg-inverse-on-surface",
                "dark:bg-surface-variant-dark",
                "text-messages",
                "dark:text-primary-text-color-dark"
            );
            this.classList.remove(
                "text-tertiary-text",
                "dark:text-tertiary-text-color-dark"
            );
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const PrioritetButtons = document.querySelectorAll(".prioritet-btn");

    SupportButtons.forEach(button => {
        button.addEventListener("click", function () {
            PrioritetButtons.forEach(btn => {
                btn.classList.remove(
                    "active",
                    "bg-inverse-on-surface",
                    "dark:bg-surface-variant-dark",
                    "text-messages",
                    "dark:text-primary-text-color-dark"
                );
                btn.classList.add(
                    "text-tertiary-text",
                    "dark:text-tertiary-text-color-dark"
                );
            });

            this.classList.add(
                "active",
                "bg-inverse-on-surface",
                "dark:bg-surface-variant-dark",
                "text-messages",
                "dark:text-primary-text-color-dark"
            );
            this.classList.remove(
                "text-tertiary-text",
                "dark:text-tertiary-text-color-dark"
            );
        });
    });
});


let sorguDiv = document.querySelector('.sorgu-div')
let redakteDiv = document.querySelector('.redakte-div')
let toggleclick = false

function toggleSorgu() {
    toggleclick = !toggleclick;
    if (toggleclick) {
        sorguDiv.style.display = 'block';   
        overlay.style.display = 'block';
    } else {
        sorguDiv.style.display = 'none';
        overlay.style.display = 'none';
    }

}

let click2 = false

function redakteClick(){
    click2 = !click2
    if(click2){
        redakteDiv.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        redakteDiv.style.display = 'none'
        overlay.style.display = 'none'
    }
}


const deletediv = document.querySelector('#deletediv')
let buttonclick = false

function deleteclick(){
    buttonclick = !buttonclick
    if(buttonclick){
        deletediv.style.display = 'block'
        overlay.style.display = 'block'
    }
    else{
        deletediv.style.display = 'none'
        overlay.style.display = 'none'
    }
}