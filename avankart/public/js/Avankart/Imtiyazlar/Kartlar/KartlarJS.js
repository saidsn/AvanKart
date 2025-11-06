
const aktivetPop = document.querySelector("#aktivetPop");
const filterPop = document.querySelector("#filterPop");
const deaktivPop = document.querySelector("#deaktivPop");
const hesabTesdiq = document.querySelector("#hesab-tesdiq");
const deletePop = document.querySelector("#deletePop"); // bunu html-də id ilə əlavə et

let click = false;
let click2 = false;
let click3 = false;
let click4 = false;
let click5 = false;
let click6 = false;
let click7 = false;
let click8 = false;
let click9 = false;
let click20 = false;

function clickAktiv() {
  click = !click;
  if (click) {
    aktivetPop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    aktivetPop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}

function openFilterModal() {
  click2 = !click2;
  if (click2) {
    filterPop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    filterPop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}

function clickDeaktiv() {
  click3 = !click3;
  if (click3) {
    deaktivPop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    deaktivPop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}

function clickTesdiq() {
  click4 = !click4;
  if (click4) {
    hesabTesdiq.style.display = "block";
    overlay.style.display = "block";
    aktivetPop.style.display = "none";
    deaktivPop.style.display = "none";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    hesabTesdiq.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}

function closeTesdiqPop() {
  click5 = !click5;
  if (click5) {
    hesabTesdiq.style.display = "none";
    overlay.style.display = "none";
  } else {
    hesabTesdiq.style.display = "block";
    overlay.style.display = "block";
  }
}



function chooseIcon() {
  click7 = !click7;
  if (click7) {
    iconsPopUp.style.display = "block";
    overlay.style.display = "block";
  } else {
    iconsPopUp.style.display = "none";
  }
}



function deleteclick() {
  click20 = !click20;
  if (click20) {
    deletePop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    deletePop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}



// Filter buttons
const filterButtons = document.querySelectorAll(".filter-button");
filterButtons.forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault();
    filterButtons.forEach((btn) =>
      btn.classList.remove(
        "active",
        "text-messages",
        "border-b-2",
        "border-messages",
        "dark:text-primary-text-color-dark",
        "dark:border-primary-text-color-dark"
      )
    );
    this.classList.add(
      "active",
      "text-messages",
      "border-b-2",
      "border-messages",
      "dark:text-primary-text-color-dark",
      "dark:border-primary-text-color-dark"
    );
  });
});

// Support type
const supportType = document.querySelectorAll(".support-type");
supportType.forEach((TypeBtn) => {
  TypeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    supportType.forEach((btn) =>
      btn.classList.remove("active", "bg-inverse-on-surface")
    );
    this.classList.add("active", "bg-inverse-on-surface", "text-tertiary-text");
  });
});

const btnText = document.querySelector("#btnText");
const deactivation_rules_4 = document.querySelector("#deactivation-rules-4");
const deactivation_conditions_rule_1 = document.querySelector("#deactivation-conditions-rule-1");
const deactivation_conditions_rule_2 = document.querySelector("#deactivation-conditions-rule-2");
const deactivation_conditions_rule_3 = document.querySelector("#deactivation-conditions-rule-3");

function rulesofuse() {
  btnText.innerHTML = "Yeni qayda əlavə et";
  deactivation_rules_4.style.display = "none";
  deactivation_conditions_rule_1.innerHTML = "1. Kart yalnız restoranlarda istifadə <br> edilə bilər.";
  deactivation_conditions_rule_2.innerHTML = "2. Balans çatmadıqda xəbərdarlıq <br> alacaqsınız.";
  deactivation_conditions_rule_3.innerHTML = "3. Kart tərəfdaş müəssisələrdə <br> keçərlidir.";
  updateActiveTab("deactivation-conditions");
  updateActiveTab("deactivation-conditions-rule-1");
  updateActiveTab("deactivation-conditions-rule-2");
  updateActiveTab("deactivation-conditions-rule-3");
  updateActiveTab("rules-of-use");
}

function handleButtonClick() {
  const btnTextContent = document.getElementById("btnText").innerText.trim();
  if (btnTextContent === "Yeni şərt əlavə et" || btnTextContent === "Yeni qayda əlavə et") {
    redakteet();
  } else {
    clickreasonPop();
  }
}

function activationinformation() {
  deactivation_rules_4.style.display = "none";
  btnText.innerHTML = "Yeni şərt əlavə et";
  deactivation_conditions_rule_1.innerHTML = "1. Kart yalnız restoranlarda istifadə <br> edilə bilər.";
  deactivation_conditions_rule_2.innerHTML = "2. Balans çatmadıqda xəbərdarlıq <br> alacaqsınız.";
  deactivation_conditions_rule_3.innerHTML = "3. Kart tərəfdaş müəssisələrdə <br> keçərlidir.";
  updateActiveTab("deactivation-conditions");
  updateActiveTab("deactivation-conditions-rule-1");
  updateActiveTab("deactivation-conditions-rule-2");
  updateActiveTab("deactivation-conditions-rule-3");
  updateActiveTab("activation-information");
}

function deactivationcondition() {
  deactivation_rules_4.style.display = "flex";
  btnText.innerHTML = "Yeni şərt əlavə et";
  deactivation_conditions_rule_1.innerHTML = "1.İşçi şirkətdən ayrılıb";
  deactivation_conditions_rule_2.innerHTML = "2.Kartın istifadəsində şübhəli əməliyyatlar aşkarlanıb.";
  deactivation_conditions_rule_3.innerHTML = "3.Kart texniki səbəbdən yanlış aktivləşdirilib";
  updateActiveTab("deactivation-conditions");
  updateActiveTab("deactivation-conditions-rule-1");
  updateActiveTab("deactivation-conditions-rule-2");
  updateActiveTab("deactivation-conditions-rule-3");
}

function reasonsfordeactivation() {
  btnText.innerHTML = "Yeni səbəb əlavə et";
  deactivation_rules_4.style.display = "none";
  deactivation_conditions_rule_1.innerHTML = "1. Kart yalnız restoranlarda istifadə <br> edilə bilər.";
  deactivation_conditions_rule_2.innerHTML = "2. Balans çatmadıqda xəbərdarlıq <br> alacaqsınız.";
  deactivation_conditions_rule_3.innerHTML = "3. Kart tərəfdaş müəssisələrdə <br> keçərlidir.";
  updateActiveTab("deactivation-conditions");
  updateActiveTab("deactivation-conditions-rule-1");
  updateActiveTab("deactivation-conditions-rule-2");
  updateActiveTab("deactivation-conditions-rule-3");
  updateActiveTab("reasons-for-deactivation");
}

const detail = document.querySelector("#detail");
let click21 = false;

function detailclick() {
  click21 = !click21;
  if (click21) {
    detail.style.maxHeight = "900px";
    detail.style.paddingTop = "12px";
    detail.style.paddingBottom = "12px";
  } else {
    detail.style.maxHeight = "0";
    detail.style.paddingTop = "0";
    detail.style.paddingBottom = "0";
  }
}

const detail2 = document.querySelector("#detail2");
let click22 = false;

function detailclick2() {
  click22 = !click22;
  if (click22) {
    detail2.style.maxHeight = "900px";
    detail2.style.paddingTop = "12px";
    detail2.style.paddingBottom = "12px";
  } else {
    detail2.style.maxHeight = "0";
    detail2.style.paddingTop = "0";
    detail2.style.paddingBottom = "0";
  }
}

const detail3 = document.querySelector("#detail3");
let click23 = false;

function detailclick3() {
  click23 = !click23;
  if (click23) {
    detail3.style.maxHeight = "900px";
    detail3.style.paddingTop = "12px";
    detail3.style.paddingBottom = "12px";
  } else {
    detail3.style.maxHeight = "0";
    detail3.style.paddingTop = "0";
    detail3.style.paddingBottom = "0";
  }
}

const kartideaktivPop = document.getElementById("kartideaktivPop");
let clickDeaktiv2 = false;

function clickKartDeaktiv() {
  clickDeaktiv2 = !clickDeaktiv2;
  if (clickDeaktiv2) {
    kartideaktivPop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    kartideaktivPop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}

let tesdiqclickdeaktiv = false;
function clickDeaktivTesdiq() {
  tesdiqclickdeaktiv = !tesdiqclickdeaktiv;
  if (tesdiqclickdeaktiv) {
    hesabTesdiq.style.display = "block";
    kartideaktivPop.style.display = "none";
    overlay.style.display = "block";
  } else {
    hesabTesdiq.style.display = "none";
    overlay.style.display = "none";
  }
}

let clickredakte = false;
const yeniQaydaPop = document.querySelector("#yeniQaydaPop");
function redakteet() {
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
}

function formatText(command, value = null) {
  document.execCommand(command, false, value);
}

let clickredakte2 = false;
const yeniQaydaPopRedakte = document.querySelector("#yeniQaydaPopRedakte");
function clickreason() {
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
}

let clickredakte3 = false;
const ReasonRedaktePop = document.querySelector("#ReasonRedaktePop");
function clickreasonPop() {
  clickredakte3 = !clickredakte3;
  if (clickredakte3) {
    ReasonRedaktePop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    ReasonRedaktePop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}

let clickAktivlesdirState = false;
const KartAktivlesdirPop = document.querySelector("#KartAktivlesdirPop");
function clickAktivlesdir() {
  clickAktivlesdirState = !clickAktivlesdirState;
  if (clickAktivlesdirState) {
    KartAktivlesdirPop.style.display = "block";
    overlay.style.display = "block";
    sidebar.style.background = "transparent";
    sidebarToggle.style.background = "transparent";
    notfCount.style.background = "transparent";
  } else {
    KartAktivlesdirPop.style.display = "none";
    overlay.style.display = "none";
    sidebar.style.background = "#fafafa";
    sidebarToggle.style.background = "#fafafa";
    notfCount.style.background = "#fafafa";
  }
}
