let sidebar = document.querySelector("#sidebar");
let sidebarToggle = document.querySelector("#sidebarToggle");
let notfCount = document.querySelector(".notfCount");
const overlay = document.querySelector("#overlay");


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