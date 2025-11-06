document.addEventListener("DOMContentLoaded", function () {
  const SupportButtons = document.querySelectorAll(".support-type");

  SupportButtons.forEach((button) => {
    button.addEventListener("click", function () {
      SupportButtons.forEach((btn) => {
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

  SupportButtons.forEach((button) => {
    button.addEventListener("click", function () {
      PrioritetButtons.forEach((btn) => {
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

let sorguDiv = document.querySelector(".sorgu-div");
let redakteDiv = document.querySelector(".redakte-div");
let toggleclick = false;

function toggleSorgu() {
  toggleclick = !toggleclick;
  if (toggleclick) {
    sorguDiv.style.display = "block";
    overlay.style.display = "block";
  } else {
    sorguDiv.style.display = "none";
    overlay.style.display = "none";
  }
}

let click2 = false;

function redakteClick() {
  click2 = !click2;
  if (click2) {
    redakteDiv.style.display = "block";
    overlay.style.display = "block";
  } else {
    redakteDiv.style.display = "none";
    overlay.style.display = "none";
  }
}

const deletediv = document.querySelector("#deletediv");
let buttonclick = false;

function deleteclick() {
  buttonclick = !buttonclick;
  if (buttonclick) {
    deletediv.style.display = "block";
    overlay.style.display = "block";
  } else {
    deletediv.style.display = "none";
    overlay.style.display = "none";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const dropdownButton = document.getElementById("dropdownDefaultButton");
  const dropdownItems = document.querySelectorAll("#dropdown6 a");
  const realSelect = document.getElementById("realSelect");

  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      const selectedValue = this.getAttribute("data-value");
      dropdownButton.innerHTML =
        selectedValue +
        `
                    <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="2"
                            d="m1 1 4 4 4-4" />
                    </svg>
                `;

      // Gerçək <select> dəyərini də dəyişirik
      realSelect.value = selectedValue;

      // Dropdown bağlansın
      document.getElementById("dropdown6").classList.add("hidden");
    });
  });

  // Toggle dropdown (əgər artıq bu hissə varsa silə bilərsən)
  dropdownButton.addEventListener("click", function () {
    document.getElementById("dropdown6").classList.toggle("hidden");
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const dropdownButton = document.getElementById("dropdownDefaultButton1  ");
  const dropdownItems = document.querySelectorAll("#dropdown1 a");
  const realSelect = document.getElementById("realSelect");

  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      const selectedValue = this.getAttribute("data-value");
      dropdownButton.innerHTML =
        selectedValue +
        `
                    <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="2"
                            d="m1 1 4 4 4-4" />
                    </svg>
                `;

      // Gerçək <select> dəyərini də dəyişirik
      realSelect.value = selectedValue;

      // Dropdown bağlansın
      document.getElementById("dropdown1").classList.add("hidden");
    });
  });

  // Toggle dropdown (əgər artıq bu hissə varsa silə bilərsən)
  dropdownButton.addEventListener("click", function () {
    document.getElementById("dropdown1").classList.toggle("hidden");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const dropdownButtons = document.querySelectorAll(
    "button[data-dropdown-toggle]"
  );

  dropdownButtons.forEach((button, index) => {
    const dropdownId = button.getAttribute("data-dropdown-toggle");
    const dropdown = document.getElementById(dropdownId);
    const items = dropdown.querySelectorAll("li[data-value]");
    const select = button.closest("form").querySelector("select");

    // Açıb-bağlamaq üçün
    button.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
    });

    // Seçim ediləndə
    items.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        const value = this.getAttribute("data-value");

        // Düymə yazısını dəyiş
        button.innerHTML = `
                        ${value}
                        <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="2"
                                d="m1 1 4 4 4-4" />
                        </svg>
                    `;

        // <select> dəyərini dəyiş
        select.value = value;

        // Dropdown bağlansın
        dropdown.classList.add("hidden");
      });
    });
  });
});


let clickredakte = false;
const yeniQaydaPop = document.querySelector("#yeniQaydaPop");

const redakteet = () => {
  clickredakte = !clickredakte;
  if (clickredakte) {
    yeniQaydaPop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    yeniQaydaPop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
};


let clickredakte2 = false;
const yeniQaydaPopRedakte = document.querySelector("#yeniQaydaPopRedakte");

const clickreason = () => {
  clickredakte2 = !clickredakte2;
  if (clickredakte2) {
    yeniQaydaPopRedakte.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    yeniQaydaPopRedakte.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
};

const detail = document.querySelector("#detail")
let clickdet = false

const detailclick1 = () => {
  clickdet = !clickdet
  if(clickdet) {
    detail.style.maxHeight = "200px"
  }
  else{
    detail.style.maxHeight = "0"
  }
}


const detail2 = document.querySelector("#detail2")
let clickdet2 = false

const detailclick2 = () => {
  clickdet2 = !clickdet2
  if(clickdet2) {
    detail2.style.maxHeight = "200px"
  }
  else{
    detail2.style.maxHeight = "0"
  }
}


const detail3 = document.querySelector("#detail3")
let clickdet3 = false

const detailclick3 = () => {
  clickdet3 = !clickdet3
  if(clickdet3) {
    detail3.style.maxHeight = "200px"
  }
  else{
    detail3.style.maxHeight = "0"
  }
}


$(document).ready(function () {
    $("#tabMenu li").on("click", function () {
        // bütün tablardan active class-ları sil
        $("#tabMenu li").removeClass("border-b-2 border-messages").addClass("opacity-50");

        // kliklənənə əlavə et
        $(this).removeClass("opacity-50").addClass("border-b-2 border-messages");

        // mətn dəyiş
        $("#tabText").text($(this).data("text"));
    });
});
