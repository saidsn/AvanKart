
const odenilmisChartElement = document.getElementById("odenilmisChart");
const odenilmisChartCtx = odenilmisChartElement
  ? odenilmisChartElement.getContext("2d")
  : null;

let odenilmisChart;

// ===============================
// Chart-u serverdən yükləyirik
// ===============================
function loadOdenilmisChartData(range = "all") {
  let requestData = { range };

  $.ajax({
    url: "/dashboardChart/toplam-odemeler",
    method: "POST",
    data: JSON.stringify(requestData),
    contentType: "application/json",
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    success: function (response) {
      createOdenilmisChart(response);
    },
    error: function (xhr, status, error) {
      console.error("❌ Chart yükləmə xətası:", error);
      createOdenilmisChart({
        formattedBalance: { labels: [], datasets: [], total: 0 }
      });
    },
  });
}

// ===============================
// Chart-u yaratmaq / update etmək
// ===============================
function createOdenilmisChart(data) {
  if (!odenilmisChartCtx) return;

  if (odenilmisChart) odenilmisChart.destroy();

  const labels = data.formattedBalance?.labels || [];
  const datasets = data.formattedBalance?.datasets || [];
  const total = data.formattedBalance?.total || 0;


  odenilmisChart = new Chart(odenilmisChartCtx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: datasets,
          backgroundColor: [
            "#7086FD",
            "#FFAE4C",
            "#6FD195",
            "#00A3FF",
            "#9B7DAA",
            "#32B5AC",
            "#0076B2",
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      radius: "80%",
      plugins: { legend: { display: false } },
    },
    plugins: [
      {
        id: "centerText",
        afterDraw: function (chart) {
          const { ctx, chartArea: { width, height } } = chart;
          ctx.save();
          const isDarkMode = document.documentElement.classList.contains("dark");
          const labelColor = isDarkMode ? "#FFFFFF80" : "#1D222B80";
          const valueColor = isDarkMode ? "#FFFFFF" : "#1D222B";

          ctx.font = "400 12px Poppins";
          ctx.fillStyle = labelColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Toplam", width / 2, height / 2 - 20);

          ctx.font = "600 22px Poppins";
          ctx.fillStyle = valueColor;
          ctx.fillText(
            total.toLocaleString("az-Latn-AZ") + " AZN",
            width / 2,
            height / 2 + 10
          );
          ctx.restore();
        },
      },
    ],
  });

  updateOdenilmisLegend();
}

// ===============================
// Custom HTML legend
// ===============================
function updateOdenilmisLegend() {
  const legendEl = document.getElementById("odenilmisLegend");
  if (!legendEl || !odenilmisChart) return;

  legendEl.innerHTML = odenilmisChart.data.labels
    .map((label, i) => {
      const color = odenilmisChart.data.datasets[0].backgroundColor[i];
      const value =
        odenilmisChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");
      return `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="width:8px;height:8px;border-radius:50%;background-color:${color};flex-shrink:0;"></span>
          <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${label}</span>
          <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
          <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${value} AZN</span>
        </div>`;
    })
    .join("");
}

// ===============================
// Tabları init etmək
// ===============================
function initOdenilmisTabs() {
  const tabs = document.querySelectorAll(".odenisTab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const label = tab.textContent.trim();
      let rangeKey = "all";

      if (label.startsWith("1 ay")) rangeKey = "1";
      else if (label.startsWith("3 ay")) rangeKey = "3";
      else if (label.startsWith("6 ay")) rangeKey = "6";
      else if (label.startsWith("12 ay")) rangeKey = "12";
      else if (label.startsWith("Hamı")) rangeKey = "all";


      setActiveOdenisTab(tab, tabs);

      loadOdenilmisChartData(rangeKey);
    });
  });

  // İlk aktiv tab
  setActiveOdenisTab(tabs[0], tabs);
}

// ===============================
// Aktiv tab vizual
// ===============================
function setActiveOdenisTab(active, all) {
  all.forEach((t) => {
    t.classList.remove(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    t.classList.add("text-tertiary-text", "dark:text-tertiary-text-color-dark");
  });
  active.classList.remove("text-tertiary-text", "dark:text-tertiary-text-color-dark");
  active.classList.add(
    "bg-inverse-on-surface",
    "dark:bg-inverse-on-surface-dark",
    "text-messages",
    "dark:text-primary-text-color-dark"
  );
}

// ===============================
// Page load zamanı chart-u yükləyirik
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initOdenilmisTabs();
  loadOdenilmisChartData("all");
});





// Modal açma
function openPrivilegeModal() {
  document.getElementById('privilegeModal').classList.remove('hidden');
  document.getElementById('privilegeModal').classList.add('flex');
}

// Modal bağlama
function closePrivilegeModal() {
  document.getElementById('privilegeModal').classList.add('hidden');
  document.getElementById('privilegeModal').classList.remove('flex');
}

// Filterləri təmizlə
function clearFilter() {
  document.querySelectorAll('input[name="imtiyaz"]').forEach(radio => {
    radio.checked = false;
  });
  
  loadImtiyazChartData();
  
  closePrivilegeModal();
}

// Filterlə buttonu
function applyPrivilegeFilter() {
  const selectedImtiyaz = document.querySelector('input[name="imtiyaz"]:checked');
  
  if (!selectedImtiyaz) {
    alert('Zəhmət olmasa bir imtiyaz qrupu seçin');
    return;
  }
  
  const imtiyazId = selectedImtiyaz.value;
  console.log("🔍 Seçilmiş imtiyaz ID:", imtiyazId);
  loadImtiyazChartData(imtiyazId);
  
  closePrivilegeModal();
}

// ===============================
// İmtiyaz chart 
// ===============================
const imtiyazChartCtx = document.getElementById("imtiyazChart").getContext("2d");

let imtiyazChart;

function loadImtiyazChartData(imtiyazId = null) {
  const requestData = imtiyazId ? { imtiyazId: imtiyazId } : {};
  
  $.ajax({
    url: "/dashboardChart/imtiyaz-qruplari-uzre-odemeler",
    method: "POST",
    data: JSON.stringify(requestData),
    contentType: "application/json",
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    success: function (response) {
      createImtiyazChart(response.formattedBalance);
    },
    error: function (xhr, status, error) {
      console.error("❌ Chart data yüklənmədi:", error);
      createImtiyazChart({ labels: [], datasets: [], total: 0 });
    },
  });
}

function createImtiyazChart(data) {
  if (imtiyazChart) {
    imtiyazChart.destroy();
  }

  const labels = data.labels || [];
  const datasets = data.datasets || [];
  const total = data.total || datasets.reduce((a, b) => a + b, 0);
  
  imtiyazChart = new Chart(imtiyazChartCtx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: datasets,
          backgroundColor: [
            "#7086FD",
            "#FFAE4C",
            "#6FD195",
            "#00A3FF",
            "#9B7DAA",
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      radius: "80%",
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    plugins: [
      {
        id: "centerText",
        afterDraw: function (chart) {
          const {
            ctx,
            chartArea: { width, height },
          } = chart;
          ctx.save();

          const isDarkMode = document.documentElement.classList.contains("dark");
          const labelColor = isDarkMode ? "#FFFFFF80" : "#1D222B80";
          const valueColor = isDarkMode ? "#FFFFFF" : "#1D222B";

          ctx.font = "400 12px Poppins";
          ctx.fillStyle = labelColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Toplam", width / 2, height / 2 - 20);

          ctx.font = "600 22px Poppins";
          ctx.fillStyle = valueColor;
          ctx.fillText(
            total.toLocaleString("az-Latn-AZ") + " AZN",
            width / 2,
            height / 2 + 10
          );

          ctx.restore();
        },
      },
    ],
  });

  // Custom HTML legend
  document.getElementById("imtiyazLegend").innerHTML = imtiyazChart.data.labels
    .map((label, i) => {
      const color = imtiyazChart.data.datasets[0].backgroundColor[i];
      const value = imtiyazChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");

      return `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${color};
          flex-shrink: 0;
        "></span>
        <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${label}</span>
        <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
        <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${value} AZN</span>
      </div>
    `;
    })
    .join("");
}

// ===============================
// Search funksiyası 
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Səhifə yükləndi, chart data yüklənir...");
  loadImtiyazChartData();
  
  // Search input
  const searchInput = document.getElementById('customSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const labels = document.querySelectorAll('#privilegeModal label');
      
      labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          label.style.display = 'flex';
        } else {
          label.style.display = 'none';
        }
      });
    });
  }
});



const kesbekChartCtx = document.getElementById("kesbekChart").getContext("2d");

let kesbekChart;
function loadCashbackChartData() {
  $.ajax({
    url: "/dashboardChart/cashback-donught",
    method: "POST",
    data: JSON.stringify({}),
    contentType: "application/json",
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    success: function (response) {
      createCashbackChart(response);
    },
    error: function (xhr, status, error) {
      createCashbackChart({
        labels: [],
        datasets: [{ data: [] }],
      });
    },
  });
}

function createCashbackChart(data) {
  if (kesbekChart) {
    kesbekChart.destroy();
  }

  const labels = data.labels || [];
  const datasets = data.datasets || [{ data: [] }];
  const chartData = datasets[0]?.data || [];

  const total = chartData.reduce(
    (sum, value) => sum + (parseFloat(value) || 0),
    0
  );

  kesbekChart = new Chart(kesbekChartCtx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: [
            "#7086FD",
            "#FFAE4C",
            "#6FD195",
            "#00A3FF",
            "#9B7DAA",
            "#32B5AC",
            "#0076B2",
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      radius: "80%",
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    plugins: [
      {
        id: "centerText",
        afterDraw: function (chart) {
          const {
            ctx,
            chartArea: { width, height },
          } = chart;
          ctx.save();

          const isDarkMode =
            document.documentElement.classList.contains("dark");

          const labelColor = isDarkMode ? "#FFFFFF80" : "#1D222B80";
          const valueColor = isDarkMode ? "#FFFFFF" : "#1D222B";

          ctx.font = "400 12px Poppins";
          ctx.fillStyle = labelColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Toplam", width / 2, height / 2 - 20);

          ctx.font = "600 22px Poppins";
          ctx.fillStyle = valueColor;
          ctx.fillText(
            total.toLocaleString("az-Latn-AZ") + " AZN",
            width / 2,
            height / 2 + 10
          );

          ctx.restore();
        },
      },
    ],
  });

  document.getElementById("kesbekLegend").innerHTML = kesbekChart.data.labels
    .map((label, i) => {
      const color = kesbekChart.data.datasets[0].backgroundColor[i];
      const value = (kesbekChart.data.datasets[0].data[i] || 0).toLocaleString(
        "az-Latn-AZ"
      );

      return `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: ${color};
            flex-shrink: 0;
          "></span>
          <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${label}</span>
          <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
          <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${value} AZN</span>
        </div>
      `;
    })
    .join("");
}





let meblegChart;
let currentMeblegCardType = "all";
let currentMeblegYear = "2025"; // default year

// Chart məlumatlarını API-dən yüklə
async function loadMeblegChartData(cardType = "all", year = "2025") {
  try {
    const response = await fetch("/dashboardChart/mebleg-chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window.csrfToken,
      },
      body: JSON.stringify({ card_id: cardType, year }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    return result.success
      ? { monthlyData: result.data || [], total: result.total || 0 }
      : { monthlyData: [], total: 0 };
  } catch (error) {
    return { monthlyData: [], total: 0 };
  }
}

// Chart yarat
function createMeblegChart(monthlyData, total) {
  const meblegChartDiv = document.getElementById("meblegChart");
  if (!meblegChartDiv) return;

  const ctx = meblegChartDiv.getContext("2d");
  const primaryColor = "#00504B";
  const borderGlow = "#00504B4D";
  const backgroundGradient = createGradient(ctx, primaryColor);

  if (meblegChart) meblegChart.destroy();

  // max dəyəri tap
  const counts = monthlyData.map((item) => item ?? 0);
  let maxValue = Math.max(...counts, 0);

  let roundedMax;
  if (maxValue <= 0) {
    roundedMax = 10;
  } else {
    const digits = Math.pow(10, Math.floor(Math.log10(maxValue)));
    roundedMax = Math.ceil(maxValue / digits) * digits;
  }

  const stepSize = Math.ceil(roundedMax / 5);
  roundedMax = stepSize * 5;

  meblegChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Yan",
        "Fev",
        "Mart",
        "Apr",
        "May",
        "İyun",
        "İyul",
        "Avq",
        "Sen",
        "Okt",
        "Noy",
        "Dek",
      ],
      datasets: [
        {
          label: "Məbləğ",
          data: monthlyData,
          borderColor: primaryColor,
          backgroundColor: backgroundGradient,
          borderWidth: 1,
          tension: 0.4,
          fill: "start",
          pointRadius: 4,
          pointBackgroundColor: primaryColor,
          pointBorderColor: borderGlow,
          pointBorderWidth: 6,
          pointHoverRadius: 4,
          pointHoverBorderColor: borderGlow,
          pointHoverBorderWidth: 6,
          clip: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 0,
          max: roundedMax,
          ticks: {
            stepSize,
            callback: (value) => value.toLocaleString() + " AZN",
          },
          grid: { color: "rgba(255, 255, 255, 0.1)" },
        },
        x: {
          grid: { color: "rgba(255, 255, 255, 0.1)" },
        },
      },
    },
  });
}

// Chart-ı yenilə
async function updateMeblegChart() {
  const { monthlyData, total } = await loadMeblegChartData(
    currentMeblegCardType,
    currentMeblegYear
  );
  createMeblegChart(monthlyData, total);
  const totalDisplay = document.getElementById("totalAmountDisplay");
  if (totalDisplay) {
    totalDisplay.textContent = `${total.toLocaleString()} AZN`;
  }
}

// Dropdown event-ləri
function initializeMeblegChartDropdowns() {
  const cardTypeToggle = document.getElementById(
    "meblegCardTypeDropdownToggle"
  );
  const cardTypeDropdown = document.getElementById("meblegCardTypeDropdown");
  const selectedCardType = document.getElementById("selectedMeblegCardType");

  if (cardTypeToggle && cardTypeDropdown && selectedCardType) {
    cardTypeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      cardTypeDropdown.classList.toggle("hidden");
    });
    cardTypeDropdown.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        currentMeblegCardType = e.target.getAttribute("data-card-value");
        selectedCardType.textContent = e.target.textContent;
        cardTypeDropdown.classList.add("hidden");
        updateMeblegChart();
      }
    });
  }

  const yearToggle = document.getElementById("meblegYearDropdownToggle");
  const yearDropdown = document.getElementById("meblegYearDropdown");
  const selectedYear = document.getElementById("selectedMeblegYear");

  if (yearToggle && yearDropdown && selectedYear) {
    yearToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      yearDropdown.classList.toggle("hidden");
    });
    yearDropdown.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        currentMeblegYear = e.target.getAttribute("data-year");
        selectedYear.textContent = currentMeblegYear;
        yearDropdown.classList.add("hidden");
        updateMeblegChart();
      }
    });
  }

  document.addEventListener("click", () => {
    if (cardTypeDropdown && !cardTypeDropdown.classList.contains("hidden")) {
      cardTypeDropdown.classList.add("hidden");
    }
    if (yearDropdown && !yearDropdown.classList.contains("hidden")) {
      yearDropdown.classList.add("hidden");
    }
  });
}

// ===============================
// DIGƏR CHART DATA
// ===============================

// chartData array with 3 datasets (we will use only 2)
const chartData = [
  {
    color: "#6FD195",
    label: "Aktiv işçi:",
    data: [
      30000, // Yanvar
      45000, // Fevral
      25000, // Mart
      60000, // Aprel
      40000, // May
      70000, // İyun
      20000, // İyul
      80000, // Avqust
      55000, // Sentyabr
      90000, // Oktyabr
      10000, // Noyabr
      95000, // Dekabr
    ],
  },
  {
    color: "#FF6B6B",
    label: "İşdən çıxarılan:",
    data: [
      15000, // Yanvar
      3000, // Fevral
      25000, // Mart
      5000, // Aprel
      20000, // May
      12000, // İyun
      40000, // İyul
      7000, // Avqust
      1000, // Sentyabr
      30000, // Oktyabr
      45000, // Noyabr
      60000, // Dekabr
    ],
  },
];

// Gradient function
function createGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color + "4D"); // semi-transparent top
  gradient.addColorStop(1, color + "00"); // fully transparent bottom
  return gradient;
}

// Canvas & context
const kartlarDiv = document.getElementById("kartlar");
const kartlar = kartlarDiv.getContext("2d");

// Only use first 2 datasets
const slicedData = chartData.slice(0, 2);

const kartlarDatasets = slicedData.map((item) => ({
  label: item.label,
  data: item.data,
  borderColor: item.color,
  backgroundColor: createGradient(kartlar, item.color),
  borderWidth: 2,
  tension: 0.4,
  fill: "start",
  pointRadius: 4,
  pointBackgroundColor: item.color,
  pointBorderColor: item.color + "4D",
  pointBorderWidth: 6,
  pointHoverRadius: 4,
  pointHoverBorderColor: item.color + "4D",
  pointHoverBorderWidth: 6,
  clip: false,
}));

// Create chart
const kartlarChart = new Chart(kartlar, {
  type: "line",
  data: {
    labels: [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "İyun",
      "İyul",
      "Avgust",
      "Sentyabr",
      "Oktyabr",
      "Noyabr",
      "Dekabr",
    ],
    datasets: kartlarDatasets,
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100000,
        ticks: {
          stepSize: 20000, // 20K aralıqla tick göstərilməsi üçün
          callback: function (value) {
            // 1000-lə bölüb "K" ilə göstər
            if (value % 20000 === 0) {
              return value === 0 ? "0" : `${value / 1000}K`;
            }
            return "";
          },
        },
      },
      x: {
        ticks: {
          callback: function (value, index, values) {
            let myval = this.getLabelForValue(value);
            return myval.slice(0, 3);
          },
        },
      },
    },
  },
});

// Create custom legend
const kartlarlabel = document.getElementById("kartlarlabels");
slicedData.forEach((dt, i) => {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
      <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${dt.color
    }A1">
        <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${dt.color
    }"></div>
        <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${dt.color
    }"></div>
      </div>
      <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${dt.label
    }</span>: 
     <span class="text-messages font-medium dark:text-[#FFFFFF]">
        ${dt.label === "Aktiv işçi:" ? "980" : "297"}
      </span>
    </div>`;
  kartlarlabel.appendChild(div);
});

let employeeChart = null;
let employeeChartData = [];
let employeeChartLabels = [];
let employeeChartColors = ["#6FD195", "#FF6B6B", "#FDC786", "#9747FF"];

// Gradient yaratmaq üçün funksiya
function createGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color + "4D");
  gradient.addColorStop(1, color + "00");
  return gradient;
}

// Canvas elementi və konteksti
const employeeCanvas = document.getElementById("balans");
const ctx = employeeCanvas.getContext("2d");

function getEmployeeChartDatasets(dataArr) {
  return dataArr.map((item, idx) => ({
    label: item.label,
    data: item.data,
    borderColor: employeeChartColors[idx],
    backgroundColor: createGradient(ctx, employeeChartColors[idx]),
    borderWidth: 2,
    tension: 0.4,
    fill: "start",
    pointRadius: 4,
    pointBackgroundColor: employeeChartColors[idx],
    pointBorderColor: employeeChartColors[idx] + "4D",
    pointBorderWidth: 6,
    pointHoverRadius: 4,
    pointHoverBorderColor: employeeChartColors[idx] + "4D",
    pointHoverBorderWidth: 6,
    clip: false,
  }));
}

function createOrUpdateEmployeeChart(labels, dataArr) {
  if (employeeChart) {
    employeeChart.destroy();
  }

  let maxValue = 0;
  dataArr.forEach((dataset) => {
    const datasetMax = Math.max(...dataset.data);
    if (datasetMax > maxValue) {
      maxValue = datasetMax;
    }
  });

  let roundedMax;
  let stepSize;

  if (maxValue <= 0) {
    roundedMax = 10;
    stepSize = 2;
  } else if (maxValue <= 50) {
    roundedMax = Math.ceil(maxValue / 10) * 10;
    stepSize = Math.ceil(roundedMax / 5);
  } else if (maxValue <= 500) {
    roundedMax = Math.ceil(maxValue / 50) * 50;
    stepSize = Math.ceil(roundedMax / 5);
  } else if (maxValue <= 5000) {
    roundedMax = Math.ceil(maxValue / 500) * 500;
    stepSize = Math.ceil(roundedMax / 5);
  } else if (maxValue <= 50000) {
    roundedMax = Math.ceil(maxValue / 5000) * 5000;
    stepSize = Math.ceil(roundedMax / 5);
  } if (maxValue <= 50000) {
    roundedMax = Math.min(Math.ceil(maxValue / 10000) * 10000, 100000);
    stepSize = Math.ceil(roundedMax / 5);
  } else {
    roundedMax = Math.min(Math.ceil(maxValue / 100000) * 100000, 1000000);
    stepSize = Math.ceil(roundedMax / 5);
  }

  roundedMax = stepSize * 5;

  employeeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: getEmployeeChartDatasets(dataArr),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          min: 0,
          max: roundedMax,
          ticks: {
            stepSize: stepSize,
            callback: function (value) {
              return value === 0 ? "0" : `${value / 1000}K`;
            },
          },
        },
        x: {
          ticks: {
            callback: function (value) {
              let myval = this.getLabelForValue(value);
              return myval.slice(0, 3);
            },
          },
        },
      },
    },
  });
}

function updateEmployeeLegend(dataArr) {
  const legendContainer = document.getElementById("balanslabels");
  legendContainer.innerHTML = "";
  dataArr.forEach((dt, idx) => {
    const total = dt.data.reduce((a, b) => a + b, 0);
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
        <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${employeeChartColors[idx]
      }A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${employeeChartColors[idx]
      }"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${employeeChartColors[idx]
      }"></div>
        </div>
        <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${dt.label
      }</span>: 
        <span class="text-messages font-medium dark:text-[#FFFFFF]">${total.toFixed(2)} AZN</span>
      </div>`;
    legendContainer.appendChild(div);
  });
}

// İlk versiya silindi – yalnız aşağıdakı genişləndirilmiş versiya istifadə olunur.

function initializeEmployeeChartFilters() {
  const filterDropdown = document.getElementById("employeeChartFilterDropdown");
  const yearDropdown = document.getElementById("employeeChartYearDropdown");
  let currentFilter = "all";
  let currentYear = "2024";

  if (filterDropdown) {
    filterDropdown.addEventListener("click", function (e) {
      if (e.target.tagName === "LI") {
        currentFilter = e.target.getAttribute("data-filter");
        loadEmployeeChartData(currentFilter, currentYear);
      }
    });
  }
  if (yearDropdown) {
    yearDropdown.addEventListener("click", function (e) {
      if (e.target.tagName === "LI") {
        currentYear = e.target.getAttribute("data-year");
        loadEmployeeChartData(currentFilter, currentYear);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadImtiyazChartData();
  loadOdenilmisChartData("year", null, null, true); // baza data
  loadCashbackChartData();

  // Məbləğ chart initialize
  initializeMeblegChartDropdowns();
  updateMeblegChart();

  initializeEmployeeChartFilters();
  loadEmployeeChartData();
  initOdenilmisTabs();
});

// ===============================
// ADDIM 1: Balans hərəkəti filter & il seçimi
// ===============================

let currentBalanceYear = null;
let currentBalanceFilterDisplay = "all"; // all | active | passive | spend | total

function initializeBalanceMovementFilters() {
  const tabContainerTabs = document.querySelectorAll(
    ".w-full .tab, .tab" // fallback selector
  );
  // İlk blokdakı balans hərəkəti tab-ları (ilk kart içindəki 5 dənə)
  const balanceTabsWrapper = document.querySelector(
    "#customScroll .flex.justify-between.min-w-96, #customScroll .flex.min-w-96"
  );

  // Praktik filtr: yalnız ilk "Balans hərəkəti" bölməsindəki .tab-ları götürək
  let balanceTabs = [];
  if (balanceTabsWrapper) {
    balanceTabs = balanceTabsWrapper.querySelectorAll(".tab");
  } else {
    // fallback – ilk 5 .tab
    balanceTabs = Array.from(tabContainerTabs).slice(0, 5);
  }

  // İl dropdown elementləri
  const yearToggle = document.getElementById("yearDropdownToggle");
  const yearDropdown = document.getElementById("yearDropdown");

  // Debug: Check if elements exist
  // console.log("yearToggle found:", !!yearToggle);
  // console.log("yearDropdown found:", !!yearDropdown);

  if (yearToggle && !currentBalanceYear) {
    const span = yearToggle.querySelector("span");
    currentBalanceYear = span
      ? span.textContent.trim()
      : new Date().getFullYear().toString();
  }

  balanceTabs.forEach((tabEl) => {
    tabEl.addEventListener("click", () => {
      const label = tabEl.textContent.trim();
      const mapping = {
        Hamısı: "all",
        "Aktiv balans": "active",
        "Passiv balans": "passive",
        Xərclənən: "spend",
        Toplam: "total",
      };
      currentBalanceFilterDisplay = mapping[label] || "all";
      updateBalanceTabsUI(balanceTabs, tabEl);
      fetchAndRenderBalanceChart();
    });
  });

  if (yearToggle && yearDropdown) {
    // console.log("Adding click handlers to year dropdown");
    yearToggle.addEventListener("click", (e) => {
      // console.log("Year toggle clicked!");
      e.stopPropagation();
      yearDropdown.classList.toggle("hidden");
    });
    yearDropdown.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        // console.log("Year selected:", e.target.getAttribute("data-year"));
        currentBalanceYear = e.target.getAttribute("data-year");
        const span = yearToggle.querySelector("span");
        if (span) span.textContent = currentBalanceYear;
        yearDropdown.classList.add("hidden");
        fetchAndRenderBalanceChart();
      }
    });
    document.addEventListener("click", () => {
      if (!yearDropdown.classList.contains("hidden"))
        yearDropdown.classList.add("hidden");
    });
  } else {
    console.log("yearToggle or yearDropdown not found!");
  }

  // İlk yükləmə üçün mövcud chart yenilə (əgər daha əvvəl çağırılmayıbsa)
  fetchAndRenderBalanceChart();
}

function updateBalanceTabsUI(allTabs, activeTab) {
  allTabs.forEach((t) => {
    t.classList.remove(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    t.classList.add("text-tertiary-text", "dark:text-tertiary-text-color-dark");
  });
  activeTab.classList.remove(
    "text-tertiary-text",
    "dark:text-tertiary-text-color-dark"
  );
  activeTab.classList.add(
    "bg-inverse-on-surface",
    "dark:bg-inverse-on-surface-dark",
    "text-messages",
    "dark:text-primary-text-color-dark"
  );
}

// Mövcud loadEmployeeChartData funksiyasını istifadə edib yalnız display-i tənzimləyirik.
const _originalLoadEmployeeChartData = loadEmployeeChartData;
async function loadEmployeeChartData(
  filter = "all",
  year = "2024",
  displayMode = null
) {
  return new Promise((resolve) => {
    $.ajax({
      // Düzəliş: backend route prefix /dashboardChart
      url: "/dashboardChart/balance-movement",
      method: "POST",
      data: JSON.stringify({ filter, year }),
      contentType: "application/json",
      headers: { "CSRF-Token": $('meta[name="csrf-token"]').attr("content") },
      success: function (result) {
        if (result.success) {
          const labels = result.labels || [];
          const allData = result.data || [];
          let selectedData = [];
          const mode = displayMode || currentBalanceFilterDisplay;
          switch (mode) {
            case "active":
              selectedData = allData.filter((d) => d.label.startsWith("Aktiv"));
              break;
            case "passive":
              selectedData = allData.filter((d) =>
                d.label.startsWith("Passiv")
              );
              break;
            case "spend":
              // "Xərclənən" və ya ehtiyat olaraq köhnə "Xərcləmə" prefiksini dəstəklə
              selectedData = allData.filter(
                (d) =>
                  d.label.startsWith("Xərclən") ||
                  d.label.startsWith("Xərcləmə")
              );
              break;
            case "total":
              selectedData = allData.filter((d) =>
                d.label.startsWith("Toplam")
              );
              break;
            case "all":
            default:
              selectedData = allData;
          }
          createOrUpdateEmployeeChart(labels, selectedData);
          updateEmployeeLegend(selectedData);
          resolve({ labels, data: selectedData });
        } else {
          createOrUpdateEmployeeChart([], []);
          updateEmployeeLegend([]);
          resolve({ labels: [], data: [] });
        }
      },
      error: function () {
        createOrUpdateEmployeeChart([], []);
        updateEmployeeLegend([]);
        resolve({ labels: [], data: [] });
      },
    });
  });
}

function fetchAndRenderBalanceChart() {
  const apiFilter = currentBalanceFilterDisplay === "all" ? "all" : "all"; // həmişə bütün dataset-ləri alırıq
  loadEmployeeChartData(
    apiFilter,
    currentBalanceYear,
    currentBalanceFilterDisplay
  );
}

// DOM tam yüklənəndən sonra balans filterlərini initialize et (mövcud blokların ardınca)
document.addEventListener("DOMContentLoaded", () => {
  initializeBalanceMovementFilters();
});
