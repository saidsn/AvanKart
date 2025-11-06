const kartElaveEtPop = document.querySelector("#kart-elaveet-popup");
let sidebar = document.querySelector("#sidebar");
let sidebarToggle = document.querySelector("#sidebarToggle");
let notfCount = document.querySelector(".notfCount");
const overlay = document.querySelector("#overlay");
const colorPicker = document.querySelector("#color-picker");
const iconsPopUp = document.querySelector("#icons-popup");
const muessiseKategoriyasi = document.getElementById("muessise-kategoriyasi");
const categoryCheckboxes = muessiseKategoriyasi.querySelectorAll(
  'input[type="checkbox"]'
);
const container = document.getElementById("icons-container");
const searchInput = document.getElementById("searchIconsForCards");
const submitCreateBtn = document.getElementById("createNewCardSubmit");
const submitUpdateBtn = document.getElementById("updateCardSubmit");
const submitCategoriesBtn = document.getElementById("KategoriyaSubmit");
const iconImgForCard = document.getElementById("iconImgForCard");

let page = 0;
const limit = 40;
let currentSearch = "";
let selectedIcon = null;
let selectedCategories = [];

let clickForCardCreatePop = false;
let toggleColorPicker = false;
let chooseIconPop = false;
let toggleKategoriyaPop = false;

function toggleSorgu() {
  clickForCardCreatePop = !clickForCardCreatePop;
  if (clickForCardCreatePop) {
    kartElaveEtPop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    kartElaveEtPop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}

function chooseBackgroundColor() {
  toggleColorPicker = !toggleColorPicker;
  if (toggleColorPicker) {
    colorPicker.style.display = "block";
  } else {
    colorPicker.style.display = "none";
  }
}

function chooseIcon() {
  chooseIconPop = !chooseIconPop;
  if (chooseIconPop) {
    iconsPopUp.style.display = "block";
    overlay.style.display = "block";
  } else {
    iconsPopUp.style.display = "none";
  }
}

function clickKategoriya() {
  toggleKategoriyaPop = !toggleKategoriyaPop;
  if (toggleKategoriyaPop) {
    muessiseKategoriyasi.style.display = "block";
    overlay.style.display = "block";
  } else {
    muessiseKategoriyasi.style.display = "none";
  }
}

async function loadIcons(page = 0, limit = 20, search = "") {
  const res = await fetch(
    `/imtiyazlar/kartlar/icons?page=${page}&limit=${limit}&search=${search}`
  );
  const icons = await res.json();

  if (page === 0) container.innerHTML = "";

  icons.forEach((file) => {
    const div = document.createElement("div");
    div.className =
      "flex flex-col items-center justify-center gap-2.5 cursor-pointer";
    div.innerHTML = `
                  <div class="icon stratis-${file.replace(".svg", "")} text-[28px]"></div>
                  <div class="text-[12px] font-normal opacity-65 text-center truncate w-full">${file.replace(".svg", "")}</div>
                `;
    container.appendChild(div);
  });
}

container.addEventListener("scroll", () => {
  if (
    container.scrollTop + container.clientHeight >=
    container.scrollHeight - 50
  ) {
    page++;
    loadIcons(page, limit, currentSearch);
  }
});

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim();
  page = 0;
  loadIcons(page, limit, currentSearch);
});

loadIcons(page, limit);

container.addEventListener("click", (e) => {
  const iconDiv = e.target.closest(".flex");
  if (!iconDiv) return;

  container
    .querySelectorAll(".flex")
    .forEach((div) => div.classList.remove("selected"));

  iconDiv.classList.add("selected");

  const iconNameDiv = iconDiv.querySelector(".icon");
  selectedIcon = iconNameDiv
    ? iconNameDiv.className.split(" ").find((c) => c.startsWith("stratis-"))
    : null;

  iconImgForCard.src = `/icons/${selectedIcon.replace("stratis-", "")}.svg`;
  chooseIcon();
});

submitCreateBtn.addEventListener("click", async () => {
  const name = document.getElementById("newCardName").value.trim();

  const description = document
    .getElementById("newCardDescription")
    .value.trim();

  const background_color = getSelectedColor();
  const icon = selectedIcon.replace("stratis-", "");
  const categories = selectedCategories;

  const payload = {
    name,
    description,
    category: "68cd82782667fee6eff6c04c",
    icon,
    background_color,
  };

  $.ajax({
    url: "/imtiyazlar/kartlar/create-card",
    type: "POST",
    headers: { "CSRF-Token": csrfToken },
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: function (response) {
      if (response.success) {
        document.getElementById("newCardName").value = "";
        document.getElementById("newCardDescription").value = "";
        selectedIcon = null;
        categoryCheckboxes.forEach((ch) => (ch.checked = false));
        window.colorPickerState = {
          hue: 0,
          sat: 1,
          val: 1,
          alpha: 1,
        };
        window.dispatchEvent(new CustomEvent("reloadCardTable"));
        toggleSorgu();
      } else {
        alert("Hata: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error(error);
      alert("Kart oluşturulamadı: " + error);
    },
  });
});

function getSelectedColor() {
  const selectedColorHex = window.colorPickerState || {
    hue: 0,
    sat: 1,
    val: 1,
    alpha: 1,
  };
  const [r, g, b] = hsvToRgb(
    selectedColorHex.hue,
    selectedColorHex.sat,
    selectedColorHex.val
  );
  return rgbToHex(r, g, b);
}

function hsvToRgb(h, s, v) {
  h /= 360;
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function submitCategories() {
  selectedCategories = [];

  categoryCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const label = checkbox.closest("label");
      const categoryText = label.querySelector(
        'div[class="text-[13px] font-normal"]'
      ).innerText;

      selectedCategories.push(categoryText);
    }
  });

  clickKategoriya();
}

function openCreateNewCardPop() {
  submitUpdateBtn.classList.add("hidden");
  submitCreateBtn.classList.remove("hidden");
  $("#newCardName").val("");
  $("#newCardDescription").val("");
  $("#bgColorForCard").css("background-color", "#FAFAFA");
  $("#iconImgForCard").attr(
    "src",
    `/images/Avankart/Imtiyazlar/Kartlar/Camera-2.svg`
  );

  document.getElementById("cardCreateUpdateTitle").textContent =
    "Kart əlavə et";
  toggleSorgu();
}

submitCategoriesBtn.addEventListener("click", submitCategories);

submitUpdateBtn.addEventListener("click", async () => {
  const cardId = submitUpdateBtn.getAttribute("data-card-id");

  const name = $("#newCardName").val().trim();
  const description = $("#newCardDescription").val().trim();
  const bgEl = document.getElementById("bgColorForCard");
  const background_color = window.getComputedStyle(bgEl).backgroundColor;

  const icon = selectedIcon ? selectedIcon.replace("stratis-", "") : null;

  const payload = {
    name,
    description,
    background_color,
    icon,
  };

  $.ajax({
    url: `/imtiyazlar/kartlar/update-card/${cardId}`,
    type: "PUT",
    headers: { "CSRF-Token": csrfToken },
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: function (response) {
      if (response.success) {
        document.getElementById("newCardName").value = "";
        document.getElementById("newCardDescription").value = "";
        selectedIcon = null;
        categoryCheckboxes.forEach((ch) => (ch.checked = false));
        window.colorPickerState = {
          hue: 0,
          sat: 1,
          val: 1,
          alpha: 1,
        };
        window.dispatchEvent(new CustomEvent("reloadCardTable"));
        toggleSorgu(); // popupu bağla
      } else {
        alert("Update xətası: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      console.error("Update AJAX error:", error);
      alert("Kart güncellenemedi: " + error);
    },
  });
});
