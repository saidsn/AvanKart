
// Doughnut chart - imtiyaz
const imtiyazChartCtx = document
  .getElementById("imtiyazChart")
  .getContext("2d");

let imtiyazChart;

// Odenilmis chart üçün global variables
const odenilmisChartElement = document.getElementById("odenilmisChart");

const odenilmisChartCtx = odenilmisChartElement
  ? odenilmisChartElement.getContext("2d")
  : null;

let odenilmisChart;

// ===============================
// Ödənilmiş toplam məbləğ interval filter (Hamısı, 1,3,6,12 ay)
// ===============================
let odenilmisBaseData = { labels: [], data: [] };
let odenilmisActiveRange = "all"; // all | 1 | 3 | 6 | 12

function loadOdenilmisChartData(range = "year", startDate = null, endDate = null, refreshBase = true) {
  const requestData = { range };
  if (range === "custom" && startDate && endDate) {
    requestData.from = startDate;
    requestData.to = endDate;
  }
  $.ajax({
    url: "/dashboardChart/toplam-odemeler",
    method: "POST",
    data: JSON.stringify(requestData),
    contentType: "application/json",
    headers: { "CSRF-Token": $('meta[name="csrf-token"]').attr("content") },
    success: function (response) {
      createOdenilmisChart(response, refreshBase);
    },
    error: function () {
      createOdenilmisChart({ labels: [], datasets: [], total: 0 });
    },
  });
}

function createOdenilmisChart(data, storeBase = false) {
  if (!odenilmisChartCtx) return;
  if (odenilmisChart) odenilmisChart.destroy();
  const labels = data.labels || [];
  const datasets = data.datasets || [];
  const total = data.total || 0;

  if (storeBase && labels.length && datasets.length) {
    odenilmisBaseData = { labels: [...labels], data: Array.isArray(datasets) ? [...datasets] : [] };
  }

  odenilmisChart = new Chart(odenilmisChartCtx, {
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

  // Custom HTML legend update
  updateOdenilmisLegend();
}

function updateOdenilmisLegend() {
  const legendEl = document.getElementById("odenilmisLegend");
  if (!legendEl || !odenilmisChart) return;
  legendEl.innerHTML = odenilmisChart.data.labels
    .map((label, i) => {
      const color = odenilmisChart.data.datasets[0].backgroundColor[i];
      const value = odenilmisChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background-color:${color};flex-shrink:0;"></span>
          <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${label}</span>
          <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
          <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${value} AZN</span>
        </div>`;
    })
    .join("");
}

function applyOdenilmisRange(rangeKey) {
  if (!odenilmisBaseData.labels.length) return;
  odenilmisActiveRange = rangeKey;
  let sliceCount;
  switch (rangeKey) {
    case "1": sliceCount = 1; break;
    case "3": sliceCount = 3; break;
    case "6": sliceCount = 6; break;
    case "12": sliceCount = 12; break;
    case "all": default: sliceCount = odenilmisBaseData.labels.length; break;
  }
  const labels = odenilmisBaseData.labels.slice(-sliceCount);
  const data = odenilmisBaseData.data.slice(-sliceCount);
  const total = data.reduce((a,b)=> a + (parseFloat(b)||0), 0);
  createOdenilmisChart({ labels, datasets: data, total }, false);
}

function initOdenilmisTabs() {
  const tabs = document.querySelectorAll(".odenisTab");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const label = tab.textContent.trim();
      let key = "all";
      if (label.startsWith("1 ay")) key = "1";
      else if (label.startsWith("3 ay")) key = "3";
      else if (label.startsWith("6 ay")) key = "6";
      else if (label.startsWith("12 ay")) key = "12";
      else if (label.startsWith("Hamı")) key = "all";
      setActiveOdenisTab(tab, tabs);
      applyOdenilmisRange(key);
    });
  });
  if (tabs[0]) setActiveOdenisTab(tabs[0], tabs); // default
}

function setActiveOdenisTab(active, all) {
  all.forEach((t) => {
    t.classList.remove("bg-inverse-on-surface","dark:bg-inverse-on-surface-dark","text-messages","dark:text-primary-text-color-dark");
    t.classList.add("text-tertiary-text","dark:text-tertiary-text-color-dark");
  });
  active.classList.remove("text-tertiary-text","dark:text-tertiary-text-color-dark");
  active.classList.add("bg-inverse-on-surface","dark:bg-inverse-on-surface-dark","text-messages","dark:text-primary-text-color-dark");
}

function loadImtiyazChartData() {
  $.ajax({
    url: "/dashboardChart/imtiyaz-qruplari-uzre-odemeler",
    method: "POST",
    data: JSON.stringify({}),
    contentType: "application/json",
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    success: function (response) {
      createImtiyazChart(response);
    },
    error: function (xhr, status, error) {
      createImtiyazChart({
        labels: [],
        datasets: [],
        total: 0,
      });
    },
  });
}

function createImtiyazChart(data) {
  if (imtiyazChart) {
    imtiyazChart.destroy();
  }

  const labels = data.labels || [];
  const datasets = data.datasets || [];
  const total = data.total || 0;

  imtiyazChart = new Chart(imtiyazChartCtx, {
    type: "doughnut",
    data: {
      labels: labels, // Backend-dən gələn labels
      datasets: [
        {
          data: datasets, // Backend-dən gələn datasets
          backgroundColor: [
            "#7086FD", // mavi
            "#FFAE4C", // sarı
            "#6FD195", // göy-yaşıl
            "#00A3FF", // açıq mavi
            "#9B7DAA", // bənövşəyi
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
          display: false, // HTML legend üçün default legend söndürüldü
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

  // Custom HTML legend
  document.getElementById("imtiyazLegend").innerHTML = imtiyazChart.data.labels
    .map((label, i) => {
      const color = imtiyazChart.data.datasets[0].backgroundColor[i];
      const value =
        imtiyazChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");

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
  error: function () {
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

const kesbekChartCtx = document.getElementById("kesbekChart").getContext("2d");

let kesbekChart;

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
  const cardTypeToggle = document.getElementById("meblegCardTypeDropdownToggle");
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
      <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${
        dt.color
      }A1">
        <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${
          dt.color
        }"></div>
        <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${
          dt.color
        }"></div>
      </div>
      <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${
        dt.label
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
          max: 100000,
          ticks: {
            stepSize: 20000,
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
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
        <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${
          employeeChartColors[idx]
        }A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${
            employeeChartColors[idx]
          }"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${
            employeeChartColors[idx]
          }"></div>
        </div>
        <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${
          dt.label
        }</span>: 
        <span class="text-messages font-medium dark:text-[#FFFFFF]">${dt.data.reduce(
          (a, b) => a + b,
          0
        )} AZN</span>
      </div>`;
    legendContainer.appendChild(div);
  });
}

async function loadEmployeeChartData(filter = "all", year = "2024") {
  $.ajax({
  // Endpoint corrected to match backend mounting path (/dashboardChart/*)
  url: "/dashboardChart/balance-movement",
    method: "POST",
    data: JSON.stringify({ filter, year }),
    contentType: "application/json",
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    success: function (result) {
      if (result.success) {
        employeeChartLabels = result.labels || [
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
        ];
        employeeChartData = result.data || [];
        createOrUpdateEmployeeChart(employeeChartLabels, employeeChartData);
        updateEmployeeLegend(employeeChartData);
      } else {
        createOrUpdateEmployeeChart([], []);
        updateEmployeeLegend([]);
      }
    },
    error: function () {
      createOrUpdateEmployeeChart([], []);
      updateEmployeeLegend([]);
    },
  });
}

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
  loadOdenilmisChartData("year", null, null, true); // baza dataset
  loadCashbackChartData();

  // Məbləğ chart initialize
  initializeMeblegChartDropdowns();
  updateMeblegChart();

  initializeEmployeeChartFilters();
  loadEmployeeChartData();
  initOdenilmisTabs();
});
