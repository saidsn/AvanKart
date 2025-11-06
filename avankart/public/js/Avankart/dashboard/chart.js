// Doughnut chart - kesbek
const kesbekChartCtx = document.getElementById("kesbekChart").getContext("2d");
const sirketModal = document.getElementById("sirketlerModal");
const kartlarModal = document.getElementById("kartlarModal");

let medaxilSelectedCards = [];
let mexaricSelectedCards = [];
let hesapSelectedYears = [];
let transactionSelectedYears = [];
let muessiseSayiYears = [];
let sirketSayiYears = [];
let commissionSelectedYears = [];
let balanceMovementSelectedYears = [];
let receivedAmountSelectedYears = [];
let registeredUserSelectedYears = [];
let mexaricKartSelectedYears = [];
let medaxilKartSelectedYears = [];
let hesapSelectedMuessiseId = null;
let hesapMuessiseData = [];
let hesapSirketData = [];
let hesapLineChart = null;
let hesapDoughnutChart = null;
let commissionLineChart = null;
let commissionDoughnutChart = null;

const kesbekChart = new Chart(kesbekChartCtx, {
  type: "doughnut",
  data: {
    labels: [
      "Yanacaq",
      "Yemək",
      "Hədiyyə",
      "Biznes",
      "Market",
      "Premium",
      "Avto Yuma",
    ],
    datasets: [
      {
        data: [3350, 2650, 1800, 1700, 1800, 1000, 1500],
        backgroundColor: [
          "#7086FD", // mavi
          "#FFAE4C", // sarı
          "#6FD195", // göy-yaşıl
          "#00A3FF", // açıq mavi
          "#9B7DAA", // bənövşəyi
          "#32B5AC", // yeni rəng 1
          "#0076B2", // yeni rəng 2
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
        ctx.fillText("124.200.00 AZN", width / 2, height / 2 + 10);

        ctx.restore();
      },
    },
  ],
});

document.getElementById("kesbekLegend").innerHTML = kesbekChart.data.labels
  .map((label, i) => {
    const color = kesbekChart.data.datasets[0].backgroundColor[i];
    const value =
      kesbekChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");

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

const qrChartDiv = document.getElementById("qrChart");
const qrChart = qrChartDiv.getContext("2d");
const primaryColor2 = "#7086FD";
const borderGlow2 = "#7086FD4D";
const backgroundGradient2 = createGradient(qrChart, primaryColor2);

new Chart(qrChart, {
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
        data: [
          5000, 0, 10000, 23340, 50000, 23340, 23340, 43340, 100000, 73340,
          82334, 30934,
        ],
        borderColor: primaryColor2,
        backgroundColor: backgroundGradient2,
        borderWidth: 1,
        tension: 0.4,
        fill: "start",
        pointRadius: 4,
        pointBackgroundColor: primaryColor2,
        pointBorderColor: borderGlow2,
        pointBorderWidth: 6,
        pointHoverRadius: 4,
        pointHoverBorderColor: borderGlow2,
        pointHoverBorderWidth: 6,
        clip: false,
      },
    ],
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
          callback: function (value, index, values) {
            if (value === 0) return "0";
            if (value >= 1000) return value / 1000 + "k";
            return value;
          },
        },
      },
    },
  },
});

const sirketChartDiv = document.getElementById("sirketChart");
const sirketChart = sirketChartDiv.getContext("2d");
const primaryColor3 = "#FFAE4C";
const borderGlow3 = "#FFAE4C4D";
const backgroundGradient3 = createGradient(sirketChart, primaryColor3);

new Chart(sirketChart, {
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
        data: [
          5000, 0, 10000, 23340, 50000, 23340, 23340, 43340, 100000, 73340,
          82334, 30934,
        ],
        borderColor: primaryColor3,
        backgroundColor: backgroundGradient3,
        borderWidth: 1,
        tension: 0.4,
        fill: "start",
        pointRadius: 4,
        pointBackgroundColor: primaryColor3,
        pointBorderColor: borderGlow3,
        pointBorderWidth: 6,
        pointHoverRadius: 4,
        pointHoverBorderColor: borderGlow3,
        pointHoverBorderWidth: 6,
        clip: false,
      },
    ],
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
          stepSize: 20000, // Hər dəfə 20.000 artım
          callback: function (value, index, values) {
            if (value === 0) return "0";
            if (value >= 1000) return value / 1000 + "k";
            return value;
          },
        },
      },
    },
  },
});

const meblegChartDiv = document.getElementById("meblegChart");
const meblegChart = meblegChartDiv.getContext("2d");
const primaryColor4 = "#6FD195";
const borderGlow4 = "#6FD1954D";
const backgroundGradient4 = createGradient(meblegChart, primaryColor4);

const transactionsChartDiv = document.getElementById("transactionsChart");
const transactionsChartContent = transactionsChartDiv.getContext("2d");
const primaryColor5 = "#6FD195";
const borderGlow5 = "#6FD1954D";
const backgroundGradient5 = createGradient(
  transactionsChartContent,
  primaryColor5
);

const qeydiyyatChartDiv = document.getElementById("qeydiyyatChart");
const qeydiyyatChartContent = qeydiyyatChartDiv.getContext("2d");
const primaryColor6 = "#6FD195";
const borderGlow6 = "#6FD1954D";
const backgroundGradient6 = createGradient(
  qeydiyyatChartContent,
  primaryColor6
);

const colorPalette = [
  "#32B5AC",
  "#401955",
  "#EC2024",
  "#F9B100",
  "#FF8C42",
  "#FFB627",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#3A86FF",
  "#8338EC",
  "#9D4EDD",
  "#C77DFF",
  "#2EC4B6",
  "#219EBC",
  "#0077B6",
  "#00B4D8",
  "#00F5D4",
  "#F15BB5",
  "#FF6392",
  "#FF9F1C",
  "#FFBF69",
  "#FF5D8F",
  "#06D6A0",
  "#118AB2",
  "#073B4C",
  "#52796F",
  "#354F52",
  "#6A4C93",
  "#4E148C",
  "#9A031E",
  "#E36414",
  "#FB5607",
];

// RGB string → HEX string
function rgbToHex(rgb) {
  // rgb: "rgb(99, 38, 251)"
  const result = rgb.match(/\d+/g); // ["99","38","251"]
  if (!result || result.length < 3) return "#000000";
  const r = parseInt(result[0]).toString(16).padStart(2, "0");
  const g = parseInt(result[1]).toString(16).padStart(2, "0");
  const b = parseInt(result[2]).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

// Gradient yarat
function createGradient(ctx, color) {
  // Eğer rgb ile gelmişse hex'e çevir
  let hexColor = color.startsWith("rgb") ? rgbToHex(color) : color;

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, hexColor + "4D");
  gradient.addColorStop(1, hexColor + "00");
  return gradient;
}

let meblegChartData;

function loadMeblegChart(sirket = null) {
  $.ajax({
    url: `/dashboardChart/mebleg/by-year`,
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      year: receivedAmountSelectedYears.length
        ? receivedAmountSelectedYears
        : undefined,
      sirket,
    }),
    success: function (res) {
      if (res && res.data) {
        updateMeblegChart(res.data);
        updateMeblegLegend(res.data);
      }
    },
    error: (xhr, status, err) => console.error("Müəssisə chart xətası:", err),
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!meblegChartDiv) return;

  const ctx = meblegChartDiv.getContext("2d");

  meblegChartData = new Chart(ctx, {
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
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
        x: {
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
      },
    },
  });

  // 🔹 Chart datanı yenilə
  window.updateMeblegChart = function (data) {
    if (!data) return;
    const datasets = [];
    const years = Object.keys(data);

    years.forEach((year, index) => {
      const color = colorPalette[index % colorPalette.length];
      const backgroundGradient = createGradient(ctx, color);
      datasets.push({
        label: year,
        data: data[year].monthly,
        borderColor: color,
        backgroundColor: backgroundGradient,
        borderWidth: 1,
        tension: 0.4,
        fill: "start",
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: color + "4D",
        pointBorderWidth: 6,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 6,
        clip: false,
      });
    });

    meblegChartData.data.datasets = datasets;
    meblegChartData.update();
  };

  // 🔹 Alt hissədə rəngli “legend” və toplam say göstər
  window.updateMeblegLegend = function (data) {
    const container = document.getElementById("receivedAmountFromCompanies");
    if (!container) return;

    const years = Object.keys(data);
    const html = years
      .map((year, i) => {
        const color = colorPalette[i % colorPalette.length];
        const total = data[year].total || 0;
        return `
        <div class="flex items-center justify-center gap-1 text-xs font-medium mb-1">
          
          <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${color}A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${color}"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${color}"></div>
        </div>
          <span class="text-tertiary-text dark:text-tertiary-text-color-dark font-normal">${year}:</span>
          <span class="text-messages dark:text-primary-text-color-dark">${total}</span>
        </div>`;
      })
      .join("");

    container.innerHTML = html;
  };

  loadMeblegChart();
});

function lightenColor(rgbString, amount = 0.2) {
  const rgb = rgbString.match(/\d+/g).map(Number); // "rgb(100, 200, 150)" → [100,200,150]
  const lighten = (val) => Math.round(val + (255 - val) * amount);
  const [r, g, b] = rgb.map(lighten);
  return `rgb(${r}, ${g}, ${b})`;
}

let transactionChart;

function loadTransactionsChart() {
  $.ajax({
    url: `/dashboardChart/transactions/by-year`,
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      year: transactionSelectedYears.length
        ? transactionSelectedYears
        : undefined,
    }),
    success: function (res) {
      if (res && res.data) {
        updateTransactionsChart(res.data);
        updateTransactionsLegend(res.data);
      }
    },
    error: (xhr, status, err) => console.error("Müəssisə chart xətası:", err),
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!transactionsChartDiv) return;

  const ctx = transactionsChartDiv.getContext("2d");

  transactionChart = new Chart(ctx, {
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
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
        x: {
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
      },
    },
  });

  // 🔹 Chart datanı yenilə
  window.updateTransactionsChart = function (data) {
    if (!data) return;
    const datasets = [];
    const years = Object.keys(data);

    years.forEach((year, index) => {
      const color = colorPalette[index % colorPalette.length];
      const backgroundGradient = createGradient(ctx, color);
      datasets.push({
        label: year,
        data: data[year].monthly,
        borderColor: color,
        backgroundColor: backgroundGradient,
        borderWidth: 1,
        tension: 0.4,
        fill: "start",
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: color + "4D",
        pointBorderWidth: 6,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 6,
        clip: false,
      });
    });

    transactionChart.data.datasets = datasets;
    transactionChart.update();
  };

  // 🔹 Alt hissədə rəngli “legend” və toplam say göstər
  window.updateTransactionsLegend = function (data) {
    const container = document.getElementById("tranzaksiyaSayiLegend");
    if (!container) return;

    const years = Object.keys(data);
    const html = years
      .map((year, i) => {
        const color = colorPalette[i % colorPalette.length];
        const total = data[year].totalTransactions || 0;
        return `
        <div class="flex items-center justify-center gap-1 text-xs font-medium mb-1">
          
          <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${color}A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${color}"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${color}"></div>
        </div>
          <span class="text-tertiary-text dark:text-tertiary-text-color-dark font-normal">${year}:</span>
          <span class="text-messages dark:text-primary-text-color-dark">${total}</span>
        </div>`;
      })
      .join("");

    container.innerHTML = html;
  };

  loadTransactionsChart();
});

let qeydiyyatChart;

function loadQeydiyyatChart(sirket = null) {
  $.ajax({
    url: `/dashboardChart/registered/users`,
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      year: registeredUserSelectedYears.length
        ? registeredUserSelectedYears
        : undefined,
      sirket,
    }),
    success: function (res) {
      if (res && res.data) {
        updateQeydiyyatChart(res.data);
        updateQeydiyyatLegend(res.data);
        if (res.genderStats) updateGenderChart(res.genderStats);
        if (res.ageGroups) updateAgeChart(res.ageGroups);
      }
    },
    error: (xhr, status, err) => console.error("Qeydiyyat chart xətası:", err),
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!qeydiyyatChartDiv) return;

  const ctx = qeydiyyatChartDiv.getContext("2d");

  qeydiyyatChart = new Chart(ctx, {
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
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
        x: {
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
      },
    },
  });

  // 🔹 Chart datanı yenilə
  window.updateQeydiyyatChart = function (data) {
    if (!data) return;
    const datasets = [];
    const years = Object.keys(data);

    years.forEach((year, index) => {
      const color = colorPalette[index % colorPalette.length];
      const backgroundGradient = createGradient(ctx, color);
      datasets.push({
        label: year,
        data: data[year].monthly,
        borderColor: color,
        backgroundColor: backgroundGradient,
        borderWidth: 1,
        tension: 0.4,
        fill: "start",
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: color + "4D",
        pointBorderWidth: 6,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 6,
        clip: false,
      });
    });

    qeydiyyatChart.data.datasets = datasets;
    qeydiyyatChart.update();
  };

  window.updateQeydiyyatLegend = function (data) {
    const container = document.getElementById("qeydiyyatSayiLegend");
    if (!container) return;

    const years = Object.keys(data);
    const html = years
      .map((year, i) => {
        const color = colorPalette[i % colorPalette.length];
        const total = data[year].totalRegistered || 0;
        return `
        <div class="flex items-center justify-center gap-1 text-xs font-medium mb-1">
          
          <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${color}A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${color}"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${color}"></div>
        </div>
          <span class="text-tertiary-text dark:text-tertiary-text-color-dark font-normal">${year}:</span>
          <span class="text-messages dark:text-primary-text-color-dark">${total}</span>
        </div>`;
      })
      .join("");

    container.innerHTML = html;
  };

  loadQeydiyyatChart();
});

document.addEventListener("DOMContentLoaded", function () {
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: function (chart) {
      const {
        ctx,
        chartArea: { width, height },
      } = chart;
      ctx.save();
      const isDarkMode = document.documentElement.classList.contains("dark");
      const labelColor = isDarkMode ? "#FFFFFF80" : "#1D222B80";
      const valueColor = isDarkMode ? "#FFFFFF" : "#1D222B";

      ctx.font = "400 12px sans-serif";
      ctx.fillStyle = labelColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Toplam", width / 2, height / 2 - 20);

      const totalValue = chart.data.datasets[0].data.reduce(
        (acc, val) => acc + val,
        0
      );
      ctx.font = "600 20px sans-serif";
      ctx.fillStyle = valueColor;
      ctx.fillText(
        `${totalValue.toLocaleString("az-Latn-AZ")}`,
        width / 2,
        height / 2 + 10
      );
      ctx.restore();
    },
  };

  const genderChartCtx = document
    .getElementById("genderChart")
    .getContext("2d");
  const genderData = {
    labels: ["Kişi", "Qadın"],
    datasets: [
      {
        data: [1400, 3200],
        backgroundColor: ["#7086FD", "#FFAE4C"],
        hoverOffset: 0,
      },
    ],
  };

  const genderChart = new Chart(genderChartCtx, {
    type: "doughnut",
    data: genderData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      radius: "100%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw.toLocaleString("az-Latn-AZ");
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
    plugins: [centerTextPlugin],
  });

  const genderLegendElement = document.getElementById("genderChartLegend");
  if (genderLegendElement) {
    genderLegendElement.innerHTML = genderChart.data.labels
      .map((label, i) => {
        const color = genderChart.data.datasets[0].backgroundColor[i];
        const value =
          genderChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");
        return `
                            <div class="flex items-center gap-2 mb-1">
                                <span style="
                                    width: 8px;
                                    height: 8px;
                                    border-radius: 50%;
                                    background-color: ${color};
                                    flex-shrink: 0;
                                "></span>
                                <span class="text-gray-500 dark:text-gray-400 text-xs">${label}</span>
                                <span class="text-gray-300 dark:text-gray-600 text-xs">|</span>
                                <span class="text-gray-900 dark:text-gray-100 text-xs font-medium">${value}</span>
                            </div>
                        `;
      })
      .join("");
  }

  const ageChartCtx = document.getElementById("ageChart").getContext("2d");
  const ageData = {
    labels: ["18-25", "25-32", "32-39", "39-46", "46-52", "52-59", "59+"],
    datasets: [
      {
        data: [2200, 400, 300, 250, 180, 150, 1120],
        backgroundColor: [
          "#FFAE4C",
          "#6FD195",
          "#7086FD",
          "#88649A",
          "#00A3FF",
          "#32B5AC",
          "#0076B2",
        ],
      },
    ],
  };

  const ageChart = new Chart(ageChartCtx, {
    type: "doughnut",
    data: ageData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      radius: "100%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw.toLocaleString("az-Latn-AZ");
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
    plugins: [centerTextPlugin],
  });

  const ageLegendElement = document.getElementById("ageChartLegend");
  if (ageLegendElement) {
    ageLegendElement.innerHTML = ageChart.data.labels
      .map((label, i) => {
        const color = ageChart.data.datasets[0].backgroundColor[i];
        const value =
          ageChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");
        return `
                            <div class="flex items-center gap-2 mb-1">
                                <span style="
                                    width: 8px;
                                    height: 8px;
                                    border-radius: 50%;
                                    background-color: ${color};
                                    flex-shrink: 0;
                                "></span>
                                <span class="text-gray-500 dark:text-gray-400 text-xs">${label}</span>
                                <span class="text-gray-300 dark:text-gray-600 text-xs">|</span>
                                <span class="text-gray-900 dark:text-gray-100 text-xs font-medium">${value}</span>
                            </div>
                        `;
      })
      .join("");
  }

  window.updateGenderChart = function (genderStats) {
    if (!genderChart || !genderStats) return;

    const data = [genderStats.male || 0, genderStats.female || 0];
    genderChart.data.datasets[0].data = data;
    genderChart.update();

    const genderLegendElement = document.getElementById("genderChartLegend");
    if (genderLegendElement) {
      genderLegendElement.innerHTML = genderChart.data.labels
        .map((label, i) => {
          const color = genderChart.data.datasets[0].backgroundColor[i];
          const value = data[i].toLocaleString("az-Latn-AZ");
          return `
          <div class="flex items-center gap-2 mb-1">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: ${color};
              flex-shrink: 0;
            "></span>
            <span class="text-gray-500 dark:text-gray-400 text-xs">${label}</span>
            <span class="text-gray-300 dark:text-gray-600 text-xs">|</span>
            <span class="text-gray-900 dark:text-gray-100 text-xs font-medium">${value}</span>
          </div>`;
        })
        .join("");
    }
  };

  window.updateAgeChart = function (ageGroups) {
    if (!ageChart || !ageGroups) return;

    const order = ["18-25", "25-32", "32-39", "39-46", "46-52", "52-59", "59+"];
    const data = order.map((label) => ageGroups[label] || 0);
    ageChart.data.datasets[0].data = data;
    ageChart.update();

    const ageLegendElement = document.getElementById("ageChartLegend");
    if (ageLegendElement) {
      ageLegendElement.innerHTML = ageChart.data.labels
        .map((label, i) => {
          const color = ageChart.data.datasets[0].backgroundColor[i];
          const value = data[i].toLocaleString("az-Latn-AZ");
          return `
          <div class="flex items-center gap-2 mb-1">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: ${color};
              flex-shrink: 0;
            "></span>
            <span class="text-gray-500 dark:text-gray-400 text-xs">${label}</span>
            <span class="text-gray-300 dark:text-gray-600 text-xs">|</span>
            <span class="text-gray-900 dark:text-gray-100 text-xs font-medium">${value}</span>
          </div>`;
        })
        .join("");
    }
  };
});

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

const qenaetChart = document.getElementById("qenaetChart").getContext("2d");

new Chart(qenaetChart, {
  type: "bar",
  data: {
    labels: ["Yemək"],
    datasets: [
      {
        data: [3600],
        backgroundColor: "#FDC786",
        borderRadius: 5,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
      },
    ],
  },
  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        position: "top",
        min: 0,
        max: 10000,
        ticks: {
          callback: (value) => (value >= 1000 ? value / 1000 + "k" : value),
        },
        grid: { color: "#eee" },
      },
      y: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
  },
  plugins: [
    {
      id: "backgroundBar",
      beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const { top, bottom, left, right } = chartArea;
        const fullBarWidth = Math.min(
          scales.x.getPixelForValue(10000),
          right - left
        );
        const barHeight = bottom - top;

        ctx.save();
        ctx.fillStyle = "#FDC786A1";
        ctx.fillRect(scales.x.left, top, fullBarWidth, barHeight);
        ctx.restore();
      },
    },
    {
      id: "centerText",
      afterDatasetsDraw(chart) {
        const {
          ctx,
          chartArea: { top, bottom },
          data,
        } = chart;
        const dataset = chart.data.datasets[0].data[0];
        const y = (top + bottom) / 2;
        const x = chart.scales.x.getPixelForValue(dataset / 2);

        ctx.save();
        ctx.font = "400 18px Poppins";
        ctx.fillStyle = "#1D222B";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${dataset.toLocaleString()} AZN`, x, y);
        ctx.restore();
      },
    },
  ],
});

const imtiyazChartCtx = document
  .getElementById("imtiyazChart")
  .getContext("2d");

const imtiyazChart = new Chart(imtiyazChartCtx, {
  type: "doughnut",
  data: {
    labels: ["Kəşbek", "Passiv balans", "Aktiv balans", "Mükafat"],
    datasets: [
      {
        data: [6850, 2350, 1800, 1200],
        backgroundColor: [
          "#7086FD", // mavi
          "#FFAE4C", // sarı
          "#6FD195", // göy-yaşıl
          "#32B5AC", // açıq mavi
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
        ctx.fillText("124.200.00 AZN", width / 2, height / 2 + 10);

        ctx.restore();
      },
    },
  ],
});

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

const tabs = document.querySelectorAll(".odenisTab");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      t.classList.remove("bg-inverse-on-surface");
      t.classList.add("text-tertiary-text");
    });
    tab.classList.add("bg-inverse-on-surface");
    tab.classList.remove("text-tertiary-text");

    const selectedLabel = tab.getAttribute("data-label");

    handleTabClick(selectedLabel);
  });
});

let employeeStats = [];

function loadBalansChart(filter = "all") {
  $.ajax({
    url: "/dashboardChart/card-balances",
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({ filter: filter }),
    success: function (res) {
      const { data } = res;

      const defaultColors = [
        "#FFAE4C",
        "#6FD195",
        "#7086FD",
        "#9B7DAA",
        "#32B5AC",
        "#FF6B6B",
        "#FDC786",
        "#9747FF",
      ];

      employeeStats = data.map((card, index) => ({
        color:
          card.background_color || defaultColors[index % defaultColors.length],
        label: `${card.name}:`,
        data: new Array(12).fill(Math.round((card.totalBalance || 0) / 12)),
      }));

      createBalansChart();
      updateBalansLegend();

      const totalAmount = data.reduce(
        (sum, item) => sum + item.totalBalance,
        0
      );
      const totalAmountElement = document.getElementById("balans-total-amount");
      if (totalAmountElement) {
        totalAmountElement.textContent = `${(totalAmount || 0).toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN`;
      }
    },
    error: (xhr, status, err) => {
      console.error("❌ Card balances chart xətası:", err);
      console.error("❌ Status:", status);
      console.error("❌ Response:", xhr.responseText);
      createBalansChart();
      updateBalansLegend();
    },
  });
}

function handleTabClick(selectedLabel) {
  let filter = "all";

  switch (selectedLabel.toLowerCase()) {
    case "aktiv balans":
      filter = "active";
      break;
    case "passiv balans":
      filter = "passive";
      break;
    case "xərcləmə":
      filter = "spend";
      break;
    case "hamısı":
    default:
      filter = "all";
      break;
  }

  loadBalansChart(filter);
}

function createBalansChart() {
  if (window.employeeChart) {
    window.employeeChart.destroy();
  }

  const employeeCanvas = document.getElementById("balans");
  if (!employeeCanvas) return;

  const ctx = employeeCanvas.getContext("2d");
  const chartDatasets = employeeStats.map((item) => ({
    label: item.label,
    data: item.data,
    borderColor: item.color,
    backgroundColor: createGradient(ctx, item.color),
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

  window.employeeChart = new Chart(ctx, {
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
      datasets: chartDatasets,
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

function updateBalansLegend() {
  const legendContainer = document.getElementById("balanslabels");
  if (!legendContainer) return;

  legendContainer.innerHTML = "";
  employeeStats.forEach((dt) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
        <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${dt.color}A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${dt.color}"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${dt.color}"></div>
        </div>
        <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${dt.label}</span>: 
        <span class="text-messages font-medium dark:text-[#FFFFFF]">${dt.data.reduce((a, b) => a + b, 0)} AZN</span>
      </div>`;
    legendContainer.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎯 DOMContentLoaded - Starting balans chart...");
  loadBalansChart();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    console.log("🎯 DOMContentLoaded (late) - Starting balans chart...");
    loadBalansChart();
  });
} else {
  console.log("🎯 DOM already ready - Starting balans chart immediately...");
  loadBalansChart();
}

let kartlarLineChart;
let kartlarDoughnutChart;

function loadKartlarChart() {
  $.ajax({
    url: `/dashboardChart/medaxil/kartlar`, // 🔹 Endpoint (hazır olanda dəyişəcəksən)
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      cards: medaxilSelectedCards.length ? medaxilSelectedCards : undefined,
    }),
    success: function (res) {
      if (!res || !res.data) return;
      const { monthly, total } = res.data;
      updateKartlarLineChart(monthly);
      updateKartlarDoughnutChart(total);
      updateKartlarLegend(monthly, total);
    },
    error: (xhr, status, err) => console.error("Kartlar chart xətası:", err),
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const lineCanvas = document.getElementById("kartlarChart");
  const doughnutCanvas = document.getElementById("kartlarDoughnut");

  if (!lineCanvas || !doughnutCanvas) return;

  const lineCtx = lineCanvas.getContext("2d");
  const doughnutCtx = doughnutCanvas.getContext("2d");

  // 🔹 Line Chart (boş struktur)
  kartlarLineChart = new Chart(lineCtx, {
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
        "Avq",
        "Sen",
        "Okt",
        "Noy",
        "Dek",
      ],
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20000,
            callback: (v) => (v === 0 ? "0" : `${v / 1000}K`),
          },
          grid: { color: "#3333" },
        },
        x: {
          ticks: {
            callback: function (value) {
              const label = this.getLabelForValue(value);
              return label.slice(0, 3);
            },
          },
          grid: { color: "#3333" },
        },
      },
    },
  });

  // 🔹 Doughnut Chart (boş struktur)
  kartlarDoughnutChart = new Chart(doughnutCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
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
        afterDraw(chart) {
          const {
            ctx,
            chartArea: { width, height },
          } = chart;
          ctx.save();

          const isDark = document.documentElement.classList.contains("dark");
          const labelColor = isDark ? "#FFFFFF80" : "#1D222B80";
          const valueColor = isDark ? "#FFFFFF" : "#1D222B";

          ctx.font = "400 12px Poppins";
          ctx.fillStyle = labelColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Toplam", width / 2, height / 2 - 20);

          const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const formatted = total.toLocaleString("az-Latn-AZ") + " AZN";

          ctx.font = "600 22px Poppins";
          ctx.fillStyle = valueColor;
          ctx.fillText(formatted, width / 2, height / 2 + 10);
          ctx.restore();
        },
      },
    ],
  });

  // 🔹 Line Chart yeniləmə
  window.updateKartlarLineChart = function (monthlyData) {
    if (!monthlyData) return;
    const datasets = [];
    const cardNames = Object.keys(monthlyData);

    cardNames.forEach((name, i) => {
      const color = colorPalette[i % colorPalette.length];
      const bgGradient = createGradient(lineCtx, color);
      datasets.push({
        label: name.split("_")[0],
        data: monthlyData[name],
        borderColor: color,
        backgroundColor: bgGradient,
        borderWidth: 2,
        tension: 0.4,
        fill: "start",
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: color + "4D",
        pointBorderWidth: 6,
        pointHoverRadius: 4,
        pointHoverBorderColor: color + "4D",
        pointHoverBorderWidth: 6,
        clip: false,
      });
    });

    kartlarLineChart.data.datasets = datasets;
    kartlarLineChart.update();
  };

  // 🔹 Doughnut Chart yeniləmə
  window.updateKartlarDoughnutChart = function (totalData) {
    if (!totalData) return;
    const rawLabels = Object.keys(totalData);
    const labels = rawLabels.map((label) => label.split("_")[0]);
    const values = Object.values(totalData);
    const colors = labels.map((_, i) => colorPalette[i % colorPalette.length]);

    kartlarDoughnutChart.data.labels = labels;
    kartlarDoughnutChart.data.datasets[0].data = values;
    kartlarDoughnutChart.data.datasets[0].backgroundColor = colors;
    kartlarDoughnutChart.update();
  };

  // 🔹 Legend yeniləmə (Line + Doughnut üçün)
  window.updateKartlarLegend = function (monthlyData, totalData) {
    const lineLegend = document.getElementById("kartlarChartLabels");
    const doughnutLegend = document.getElementById("kartlarDoughnutLegend");
    if (!lineLegend || !doughnutLegend) return;

    const cardNames = Object.keys(monthlyData);
    const htmlLine = cardNames
      .map((name, i) => {
        const color = colorPalette[i % colorPalette.length];
        const total = totalData[name] || 0;
        return `
          <div class="flex items-center justify-center gap-1 text-xs font-medium mb-1">
            <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${color}A1">
              <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${color}"></div>
              <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${color}"></div>
            </div>
            <span class="text-tertiary-text dark:text-tertiary-text-color-dark font-normal">${name.split("_")[0]}:</span>
            <span class="text-messages dark:text-primary-text-color-dark">${total.toLocaleString("az-Latn-AZ")} AZN</span>
          </div>`;
      })
      .join("");

    const htmlDoughnut = cardNames
      .map((name, i) => {
        const color = colorPalette[i % colorPalette.length];
        const value = totalData[name]?.toLocaleString("az-Latn-AZ") || "0";
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; flex-shrink: 0;"></span>
            <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${name.split("_")[0]}</span>
            <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
            <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${value} AZN</span>
          </div>`;
      })
      .join("");

    lineLegend.innerHTML = htmlLine;
    doughnutLegend.innerHTML = htmlDoughnut;
  };

  // İlk dəfə yüklə
  loadKartlarChart();
});

let mexaricLineChart;
let mexaricDoughnutChart;

function loadMexaricChart() {
  $.ajax({
    url: `/dashboardChart/mexaric/kartlar`,
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      cards: mexaricSelectedCards.length ? mexaricSelectedCards : undefined,
    }),
    success: function (res) {
      if (!res || !res.data) return;
      const { monthly, total } = res.data;
      updateMexaricLineChart(monthly);
      updateMexaricDoughnutChart(total);
      updateMexaricLegend(monthly, total);
    },
    error: (xhr, status, err) => console.error("Mexaric chart xətası:", err),
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const lineCanvas = document.getElementById("mexaricChart");
  const doughnutCanvas = document.getElementById("kartlarMexaricDoughnut");

  if (!lineCanvas || !doughnutCanvas) return;

  const lineCtx = lineCanvas.getContext("2d");
  const doughnutCtx = doughnutCanvas.getContext("2d");

  // 🔹 Line Chart (boş struktur)
  mexaricLineChart = new Chart(lineCtx, {
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
        "Avq",
        "Sen",
        "Okt",
        "Noy",
        "Dek",
      ],
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20000,
            callback: (v) => (v === 0 ? "0" : `${v / 1000}K`),
          },
          grid: { color: "#3333" },
        },
        x: {
          ticks: {
            callback: function (value) {
              const label = this.getLabelForValue(value);
              return label.slice(0, 3);
            },
          },
          grid: { color: "#3333" },
        },
      },
    },
  });

  // 🔹 Doughnut Chart (boş struktur)
  mexaricDoughnutChart = new Chart(doughnutCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
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
        afterDraw(chart) {
          const {
            ctx,
            chartArea: { width, height },
          } = chart;
          ctx.save();

          const isDark = document.documentElement.classList.contains("dark");
          const labelColor = isDark ? "#FFFFFF80" : "#1D222B80";
          const valueColor = isDark ? "#FFFFFF" : "#1D222B";

          ctx.font = "400 12px Poppins";
          ctx.fillStyle = labelColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Toplam", width / 2, height / 2 - 20);

          const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const formatted = total.toLocaleString("az-Latn-AZ") + " AZN";

          ctx.font = "600 22px Poppins";
          ctx.fillStyle = valueColor;
          ctx.fillText(formatted, width / 2, height / 2 + 10);
          ctx.restore();
        },
      },
    ],
  });

  // 🔹 Line Chart yeniləmə
  window.updateMexaricLineChart = function (monthlyData) {
    if (!monthlyData) return;
    const datasets = [];
    const cardNames = Object.keys(monthlyData);

    cardNames.forEach((name, i) => {
      const color = colorPalette[i % colorPalette.length];
      const bgGradient = createGradient(lineCtx, color);
      datasets.push({
        label: name.split("_")[0],
        data: monthlyData[name],
        borderColor: color,
        backgroundColor: bgGradient,
        borderWidth: 2,
        tension: 0.4,
        fill: "start",
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: color + "4D",
        pointBorderWidth: 6,
        pointHoverRadius: 4,
        pointHoverBorderColor: color + "4D",
        pointHoverBorderWidth: 6,
        clip: false,
      });
    });

    mexaricLineChart.data.datasets = datasets;
    mexaricLineChart.update();
  };

  // 🔹 Doughnut Chart yeniləmə
  window.updateMexaricDoughnutChart = function (totalData) {
    if (!totalData) return;
    const rawLabels = Object.keys(totalData);
    const labels = rawLabels.map((label) => label.split("_")[0]);
    const values = Object.values(totalData);
    const colors = labels.map((_, i) => colorPalette[i % colorPalette.length]);

    mexaricDoughnutChart.data.labels = labels;
    mexaricDoughnutChart.data.datasets[0].data = values;
    mexaricDoughnutChart.data.datasets[0].backgroundColor = colors;
    mexaricDoughnutChart.update();
  };

  // 🔹 Legend yeniləmə (Line + Doughnut)
  window.updateMexaricLegend = function (monthlyData, totalData) {
    const lineLegend = document.getElementById("mexaricChartLabels");
    const doughnutLegend = document.getElementById(
      "kartlarMexaricDoughnutLegend"
    );
    if (!lineLegend || !doughnutLegend) return;

    const cardNames = Object.keys(monthlyData);

    const htmlLine = cardNames
      .map((name, i) => {
        const color = colorPalette[i % colorPalette.length];
        const total = totalData[name] || 0;
        return `
          <div class="flex items-center justify-center gap-1 text-xs font-medium mb-1">
            <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${color}A1">
              <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${color}"></div>
              <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${color}"></div>
            </div>
            <span class="text-tertiary-text dark:text-tertiary-text-color-dark font-normal">${name.split("_")[0]}:</span>
            <span class="text-messages dark:text-primary-text-color-dark">${total.toLocaleString(
              "az-Latn-AZ"
            )} AZN</span>
          </div>`;
      })
      .join("");

    const htmlDoughnut = cardNames
      .map((name, i) => {
        const color = colorPalette[i % colorPalette.length];
        const value = totalData[name]?.toLocaleString("az-Latn-AZ") || "0";
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; flex-shrink: 0;"></span>
            <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${name.split("_")[0]}</span>
            <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
            <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${value} AZN</span>
          </div>`;
      })
      .join("");

    lineLegend.innerHTML = htmlLine;
    doughnutLegend.innerHTML = htmlDoughnut;
  };

  // İlk dəfə yüklə
  loadMexaricChart();
});

let muessiseChart;

function loadMuessiselerChart() {
  $.ajax({
    url: `/dashboardChart/muessiseler/by-year`,
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      year: muessiseSayiYears.length ? muessiseSayiYears : undefined,
    }),
    success: function (res) {
      if (res && res.data) {
        updateMuessiseChart(res.data);
        updateMuessiseLegend(res.data);
      }
    },
    error: (xhr, status, err) => console.error("Müəssisə chart xətası:", err),
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const muessiseChartDiv = document.getElementById("muessiseChart");
  if (!muessiseChartDiv) return;

  const ctx = muessiseChartDiv.getContext("2d");

  muessiseChart = new Chart(ctx, {
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
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }, // native legend gizlədilir
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
        x: {
          ticks: { color: "#aaa" },
          grid: { color: "#3333" },
        },
      },
      elements: {
        point: { radius: 0 }, // nöqtələri gizlət
      },
    },
  });

  // 🔹 Chart datanı yenilə
  window.updateMuessiseChart = function (data) {
    if (!data) return;
    const datasets = [];
    const years = Object.keys(data);

    years.forEach((year, index) => {
      const color = colorPalette[index % colorPalette.length];
      datasets.push({
        label: year,
        data: data[year].monthly,
        borderColor: color,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
      });
    });

    muessiseChart.data.datasets = datasets;
    muessiseChart.update();
  };

  // 🔹 Alt hissədə rəngli “legend” və toplam say göstər
  window.updateMuessiseLegend = function (data) {
    const container = document.getElementById("muessiseSayiLegend");
    if (!container) return;

    const years = Object.keys(data);
    const html = years
      .map((year, i) => {
        const color = colorPalette[i % colorPalette.length];
        const total = data[year].totalRegistered || 0;
        return `
        <div class="flex items-center justify-center gap-1 text-xs font-medium mb-1">
          
          <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${color}A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${color}"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${color}"></div>
        </div>
          <span class="text-tertiary-text dark:text-tertiary-text-color-dark font-normal">${year}:</span>
          <span class="text-messages dark:text-primary-text-color-dark">${total}</span>
        </div>`;
      })
      .join("");

    container.innerHTML = html;
  };

  loadMuessiselerChart();
});

function getRoundedMaxAndStepSize(dataArray, defaultMax = 10000) {
  const counts = dataArray.map((item) => item ?? 0);
  let maxValue = Math.max(...counts, 0);
  if (maxValue <= 0)
    return { roundedMax: defaultMax, stepSize: defaultMax / 5 };
  const digits = Math.pow(10, Math.floor(Math.log10(maxValue)));
  let roundedMax = Math.ceil(maxValue / digits) * digits;
  const stepSize = Math.ceil(roundedMax / 5);
  roundedMax = stepSize * 5;
  return { roundedMax, stepSize };
}

function renderLineChart(canvasId, chartInstance, chartStats, defaultMax) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (chartInstance) chartInstance.destroy();

  const allData = chartStats.flatMap((dt) => dt.data);
  const { roundedMax, stepSize } = getRoundedMaxAndStepSize(
    allData,
    defaultMax
  );

  const datasets = chartStats.map((item) => ({
    label: item.label,
    data: item.data,
    borderColor: item.color,
    backgroundColor: createGradient(ctx, item.color),
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

  return new Chart(ctx, {
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
        "Avqust",
        "Sentyabr",
        "Oktyabr",
        "Noyabr",
        "Dekabr",
      ],
      datasets,
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
            callback: (val) =>
              val === 0
                ? "0"
                : val < 1000
                  ? `${val.toLocaleString()} AZN`
                  : `${(val / 1000).toFixed(0)}K`,
          },
        },
        x: {
          ticks: {
            callback: function (val) {
              return this.getLabelForValue(val).slice(0, 3);
            },
          },
        },
      },
    },
  });
}

function renderDoughnutChart(
  canvasId,
  chartInstance,
  labels,
  values,
  colors,
  centerText
) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (chartInstance) chartInstance.destroy();

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, hoverOffset: 4 }],
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
        afterDraw: (chart) => {
          const {
            ctx,
            chartArea: { width, height },
          } = chart;
          ctx.save();
          const isDark = document.documentElement.classList.contains("dark");
          ctx.font = "400 12px Poppins";
          ctx.fillStyle = isDark ? "#FFFFFF80" : "#1D222B80";
          ctx.textAlign = "center";
          ctx.fillText("Toplam", width / 2, height / 2 - 20);
          ctx.font = "600 22px Poppins";
          ctx.fillStyle = isDark ? "#FFFFFF" : "#1D222B";
          ctx.fillText(
            centerText.toLocaleString("az-Latn-AZ") + " AZN",
            width / 2,
            height / 2 + 10
          );
          ctx.restore();
        },
      },
    ],
  });
}
function getLegendHTML(containerId, chartStats) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  return chartStats
    .map(
      (dt) => `
    <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
      <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${dt.color}A1">
        <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${dt.color}"></div>
        <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${dt.color}"></div>
      </div>
      <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${dt.label}</span>: 
      <span class="text-messages font-medium dark:text-[#FFFFFF]">${dt.data.reduce((a, b) => a + b, 0)} AZN</span>
    </div>
  `
    )
    .join("");
}

function updateLegend(containerId, chartStats) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  chartStats.forEach((dt) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
        <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${dt.color}A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${dt.color}"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${dt.color}"></div>
        </div>
        <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${dt.label}</span>: 
        <span class="text-messages font-medium dark:text-[#FFFFFF]">${dt.data.reduce((a, b) => a + b, 0)} AZN</span>
      </div>`;
    container.appendChild(div);
  });
}

function loadHesablasmaChart() {
  $.ajax({
    url: "/dashboardChart/amount",
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      year: hesapSelectedYears.length ? hesapSelectedYears : undefined,
      muessise_id: hesapSelectedMuessiseId,
    }),
    success: function (res) {
      const odenilenData = res.data.monthlyData.map((m) => m.odenilen);
      const odenilecekData = res.data.monthlyData.map((m) => m.odenilecek);

      const odenilenTotal = odenilenData.reduce((a, b) => a + b, 0);
      const odenilecekTotal = odenilecekData.reduce((a, b) => a + b, 0);

      const chartStats = [
        { color: "#6FD195", label: "Ödənilən məbləğ:", data: odenilenData },
        { color: "#7086FD", label: "Ödəniləcək məbləğ:", data: odenilecekData },
      ];

      hesapLineChart = renderLineChart(
        "hesablasmaLineChart",
        hesapLineChart,
        chartStats
      );

      const doughLabels = ["Ödənilən məbləğ", "Ödəniləcək məbləğ"];
      const doughData = [odenilenTotal, odenilecekTotal];
      const doughColors = ["#6FD195", "#7086FD"];

      hesapDoughnutChart = renderDoughnutChart(
        "hesablasmaDoughnut",
        hesapDoughnutChart,
        doughLabels,
        doughData,
        doughColors,
        res.toplam_yekun
      );

      updateLegend("hesablasmalabels", chartStats);

      const doughLegendContainer = document.getElementById("hesablasmaLegend");
      if (doughLegendContainer) {
        doughLegendContainer.innerHTML = doughLabels
          .map(
            (label, i) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="width:8px;height:8px;border-radius:50%;background-color:${doughColors[i]};flex-shrink:0;"></span>
            <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${label}</span>
            <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
            <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${doughData[i].toLocaleString("az-Latn-AZ")} AZN</span>
          </div>
        `
          )
          .join("");
      }
    },
    error: (xhr, status, err) => console.error("Hesablama chart xətası:", err),
  });
}

function loadCommissionChart() {
  $.ajax({
    url: "/dashboardChart/commission",
    method: "POST",
    contentType: "application/json",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    data: JSON.stringify({
      year: commissionSelectedYears.length
        ? commissionSelectedYears
        : undefined,
    }),
    success: function (res) {
      console.log("Backend data:", res);

      const labels = res.data.monthlyData.map((d) => {
        const monthNames = [
          "Yan",
          "Fev",
          "Mar",
          "Apr",
          "May",
          "İyun",
          "İyul",
          "Avq",
          "Sen",
          "Okt",
          "Noy",
          "Dek",
        ];
        return monthNames[d.month - 1];
      });

      const odenilenData = res.data.monthlyData.map((d) => d.odenilen);
      const odenilecekData = res.data.monthlyData.map((d) => d.odenilecek);

      const chartStats = [
        { color: "#6FD195", label: "Ödənilən məbləğ:", data: odenilenData },
        { color: "#7086FD", label: "Ödəniləcək məbləğ:", data: odenilecekData },
      ];

      commissionLineChart = renderLineChart(
        "hesablasmaLineChart2",
        commissionLineChart,
        chartStats,
        1000,
        labels
      );

      const odenilenTotal = odenilenData.reduce((a, b) => a + b, 0);
      const odenilecekTotal = odenilecekData.reduce((a, b) => a + b, 0);

      const doughLabels = ["Ödənilən məbləğ", "Ödəniləcək məbləğ"];
      const doughData = [odenilenTotal, odenilecekTotal];
      const doughColors = ["#6FD195", "#7086FD"];

      commissionDoughnutChart = renderDoughnutChart(
        "hesablasmaDoughnut2",
        commissionDoughnutChart,
        doughLabels,
        doughData,
        doughColors,
        res.toplam_commission
      );

      updateLegend("hesablasmalabels2", chartStats);

      const doughLegendContainer = document.getElementById("hesablasmaLegend2");
      if (doughLegendContainer) {
        doughLegendContainer.innerHTML = doughLabels
          .map(
            (label, i) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="width:8px;height:8px;border-radius:50%;background-color:${doughColors[i]};flex-shrink:0;"></span>
            <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${label}</span>
            <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
            <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${doughData[i].toLocaleString("az-Latn-AZ")} AZN</span>
          </div>
        `
          )
          .join("");
      }
    },
    error: (xhr, status, err) => console.error("Commission chart xətası:", err),
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadHesablasmaChart();
  loadCommissionChart();
  loadMuessiseler();

  const filterBtn = document.querySelector("#yearsModal button.bg-primary");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      const selectedYears = Array.from(
        document.querySelectorAll("#yearsModal input[type=checkbox]:checked")
      ).map((cb) => cb.value);

      if (currentTarget === "hesablasma") {
        hesapSelectedYears = [...selectedYears];
        loadHesablasmaChart();
      } else if (currentTarget === "komissiya") {
        commissionSelectedYears = [...selectedYears];
        loadCommissionChart();
      } else if (currentTarget === "muessiseSayi") {
        muessiseSayiYears = [...selectedYears];
        loadMuessiselerChart();
      } else if (currentTarget === "tranzaksiyaSayi") {
        transactionSelectedYears = [...selectedYears];
        loadTransactionsChart();
      } else if (currentTarget === "sirketSayi") {
        sirketSayiYears = [...selectedYears];
        // loadChart();
      } else if (currentTarget === "balansHereketi") {
        balanceMovementSelectedYears = [...selectedYears];
        // loadChart();
      } else if (currentTarget === "sirketlerdenAlınanMebleğ") {
        receivedAmountSelectedYears = [...selectedYears];
        loadMeblegChart();
      } else if (currentTarget === "istifadeçiQeydiyyatiSayi") {
        registeredUserSelectedYears = [...selectedYears];
        loadQeydiyyatChart();
      } else if (currentTarget === "kartlarUzreMedaxil") {
        medaxilKartSelectedYears = [...selectedYears];
        // loadChart();
      } else if (currentTarget === "kartlarUzrəMexaric") {
        mexaricKartSelectedYears = [...selectedYears];
        // loadChart();
      }

      closeYearsModal();
    });
  }

  const filterCardsBtn = document.getElementById("filterButtonKartlar");
  if (filterCardsBtn) {
    filterCardsBtn.addEventListener("click", () => {
      const selectedYears = Array.from(
        document.querySelectorAll("#kartlarModal input[type=checkbox]:checked")
      ).map((cb) => cb.value);

      const currentCardsTarget = kartlarModal.getAttribute("data-target");

      if (currentCardsTarget === "medaxil") {
        medaxilSelectedCards = [...selectedYears];
        loadKartlarChart();
        console.log(medaxilSelectedCards);
      } else if (currentCardsTarget === "mexaric") {
        mexaricSelectedCards = [...selectedYears];
        loadMexaricChart();
      }

      closeKartlarModal();
    });
  }

  const muessiseSearchInput = document.getElementById("muessiseSearchInput");
  if (muessiseSearchInput) {
    muessiseSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      renderMuessiseList(
        hesapMuessiseData.filter((muessise) =>
          muessise.muessise_name.toLowerCase().includes(searchTerm)
        )
      );
    });
  }
});

function renderMuessiseList(data) {
  const muessiseList = document.getElementById("muessiseList");
  if (!muessiseList) return;
  muessiseList.innerHTML = "";

  data.forEach((muessise) => {
    const item = document.createElement("div");
    item.classList.add(
      "flex",
      "items-center",
      "gap-2",
      "p-2",
      "cursor-pointer",
      "hover:bg-gray-100",
      "dark:hover:bg-gray-700"
    );
    item.innerHTML = `
      <div class="relative w-8 h-8 rounded-full">
        <img src="${muessise.profile_image_path}" alt="${muessise.muessise_name}" class="rounded-full w-full h-full object-cover"/>
      </div>
      <span class="text-black dark:text-white">${muessise.muessise_name}</span>
    `;
    item.dataset.muessiseId = muessise._id;

    if (hesapSelectedMuessiseId === muessise._id) {
      item.classList.add("bg-primary-light", "dark:bg-primary-dark");
    }

    item.addEventListener("click", () => {
      hesapSelectedMuessiseId = muessise._id;
      loadHesablasmaChart();
      closeMuessiselerModal();
    });

    muessiseList.appendChild(item);
  });
}

function renderSirketList(data) {
  const sirketList = document.getElementById("sirketList");
  if (!sirketList) return;
  sirketList.innerHTML = "";

  data.forEach((sirket) => {
    const item = document.createElement("div");
    item.classList.add(
      "flex",
      "items-center",
      "gap-2",
      "p-2",
      "cursor-pointer",
      "hover:bg-gray-100",
      "dark:hover:bg-gray-700"
    );
    item.innerHTML = `
      <div class="relative w-8 h-8 rounded-full">
        <img src="${sirket.profile_image_path}" alt="${sirket.sirket_name}" class="rounded-full w-full h-full object-cover"/>
      </div>
      <span class="text-black dark:text-white">${sirket.sirket_name}</span>
    `;
    item.dataset.sirketId = sirket._id;

    item.addEventListener("click", () => {
      const currentTarget = sirketModal.getAttribute("data-target");
      switch (currentTarget) {
        case "balance-movement":
          // function(sirket._id)
          break;
        case "amount-received-from-companies":
          loadMeblegChart(sirket._id);
          break;
        case "number-of-user-registrations":
          loadQeydiyyatChart(sirket._id);
          break;
        default:
          break;
      }
      closeSirketlerModal();
    });

    sirketList.appendChild(item);
  });
}

function renderKartList(data) {
  const cardList = document.getElementById("kartlarList");
  if (!cardList) return;
  cardList.innerHTML = "";

  data.forEach((card, index) => {
    const label = document.createElement("label");
    label.setAttribute("for", `checkboxKart${index}`);
    label.className =
      "block py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 rounded-md transition-colors";

    label.innerHTML = `
      <input
        id="checkboxKart${index}"
        type="checkbox"
        value="${card._id}"
        class="rounded-[2px] w-[18px] h-[18px] border-[1px] border-surface-variant text-primary focus:outline-none focus:ring-0 focus:shadow-none hover:bg-surface-container-low disabled:bg-switch dark:bg-[var(--color-table-hover-dark)] dark:border-[#40484C]"
      />
      <div class="flex items-center gap-2">
        <span class="text-[13px] text-[#1D222B] pb-[4px] dark:text-[#FFFFFF]">${card.name}</span>
      </div>
    `;

    cardList.appendChild(label);
  });
}

function loadMuessiseler() {
  $.ajax({
    url: "/dashboardChart/muessiseler",
    method: "GET",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    success: function (response) {
      hesapMuessiseData = response.data;
      renderMuessiseList(hesapMuessiseData);
    },
    error: function (xhr, status, err) {
      console.error("Müəssisələr yüklənmə xətası:", err);
    },
  });
}

function loadKartlar() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/dashboardChart/kartlar",
      method: "GET",
      headers: { "CSRF-Token": window.csrfToken },
      xhrFields: { withCredentials: true },
      success: function (response) {
        hesapSirketData = response.data;
        renderKartList(hesapSirketData);
        resolve(); // <-- render bitdi, indi davam et
      },
      error: function (xhr, status, err) {
        console.error("Kartlar yüklənmə xətası:", err);
        reject(err);
      },
    });
  });
}

function loadSirketler() {
  $.ajax({
    url: "/dashboardChart/sirketler",
    method: "GET",
    headers: { "CSRF-Token": window.csrfToken },
    xhrFields: { withCredentials: true },
    success: function (response) {
      hesapSirketData = response.data;
      renderSirketList(hesapSirketData);
    },
    error: function (xhr, status, err) {
      console.error("Şirkətlər yüklənmə xətası:", err);
    },
  });
}

window.openMuessiselerModal = function () {
  loadMuessiseler();
  document.getElementById("muessiselerModal").classList.remove("hidden");
};

window.closeMuessiselerModal = function () {
  document.getElementById("muessiselerModal").classList.add("hidden");
};

window.openKartlarModal = async function (element) {
  const currentTarget = element.getAttribute("data-target");
  kartlarModal.setAttribute("data-target", currentTarget);

  // kartları yüklə və gözlə
  await loadKartlar();

  // əvvəlcə bütün checkboxları sıfırla
  document
    .querySelectorAll("#kartlarModal input[type=checkbox]")
    .forEach((cb) => (cb.checked = false));

  // hədəf arrayi seç
  let selectedCards;
  switch (currentTarget) {
    case "medaxil":
      selectedCards = medaxilSelectedCards;
      break;
    case "mexaric":
      selectedCards = mexaricSelectedCards;
      break;
    default:
      selectedCards = undefined;
      break;
  }

  if (selectedCards && Array.isArray(selectedCards)) {
    selectedCards.forEach((id) => {
      const cb = document.querySelector(`#kartlarModal input[value="${id}"]`);
      if (cb) cb.checked = true;
    });
  }

  kartlarModal.classList.remove("hidden");
  kartlarModal.classList.add("flex");
};

window.closeKartlarModal = function () {
  document.getElementById("kartlarModal").classList.add("hidden");
};

window.openSirketlerModal = function (element) {
  sirketModal.setAttribute("data-target", element.getAttribute("data-target"));

  loadSirketler();
  sirketModal.classList.remove("hidden");
};

window.closeSirketlerModal = function () {
  sirketModal.classList.add("hidden");
};

document.addEventListener("DOMContentLoaded", function () {
  loadBarsChart();

  function loadBarsChart() {
    $.ajax({
      url: "/dashboardChart/card-balances",
      type: "POST",
      headers: {
        "X-CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
      },
      success: function (res) {
        const { data } = res;

        const chartsData = data.map((card) => ({
          id: card.name.replace(" kartı", ""),
          data: card.totalBalance,
          color: card.background_color,
        }));

        const totalAmount = chartsData.reduce(
          (sum, item) => sum + item.data,
          0
        );

        if (document.getElementById("balans-total-amount")) {
          document.getElementById("balans-total-amount").innerText =
            `${totalAmount.toLocaleString("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN`;
        }

        createBarsChart(chartsData);
      },
      error: function (xhr, status, error) {
        const chartsData = [
          { id: "Yemək", data: 4890, color: "#FFAE4C" },
          { id: "Yanacaq", data: 5254.7, color: "#7086FD" },
        ];
        createBarsChart(chartsData);
      },
    });
  }

  function createBarsChart(chartsData) {
    const totalAmount = chartsData.reduce((sum, item) => sum + item.data, 0);

    const totalAmountElement = document.getElementById("totalAmount");
    if (totalAmountElement) {
      totalAmountElement.textContent =
        totalAmount.toLocaleString("az-Latn-AZ") + " AZN";
    }

    if (window.barsChartInstance) {
      window.barsChartInstance.destroy();
    }

    const barsChartCanvas = document.getElementById("barsChart");
    if (barsChartCanvas) {
      const barsChartCtx = barsChartCanvas.getContext("2d");

      window.barsChartInstance = new Chart(barsChartCtx, {
        type: "bar",
        data: {
          labels: chartsData.map((d) => d.id),
          datasets: [
            {
              data: chartsData.map((d) => d.data),
              backgroundColor: chartsData.map((d) => d.color),
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.raw.toLocaleString(
                    "az-Latn-AZ"
                  )} AZN`;
                },
              },
            },
            datalabels: {
              anchor: "end",
              align: "top",
              formatter: (value, context) => value.toLocaleString("az-Latn-AZ"),
              color: "black",
              font: {
                weight: "bold",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 20000,
              ticks: {
                stepSize: 5000,
                callback: function (value) {
                  return value === 0 ? "0" : `${value / 1000}K`;
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                autoSkip: false,
              },
            },
          },
        },
        plugins: [],
      });
    }
  }
});
