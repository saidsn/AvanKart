// ! transactionsChart
let dataPoints = [];
// labels avtomatik yaradılır (0,1,2,...)
let labels = dataPoints.map((_, i) => i + 1);
let transactionChart;
const transactionsChartDiv = document.getElementById("transactionsChart");
const transactionsChart = transactionsChartDiv.getContext("2d");
const primaryColor5 = "#6FD195";
const borderGlow5 = "#6FD1954D";
const backgroundGradient5 = createGradient(transactionsChart, primaryColor5);


function updateTransactionsChart(fetchedData) {
    if(transactionChart) {
      transactionChart.destroy();
    }
  // const ctx = transactionsChartDiv.getContext("2d");
  if(fetchedData || fetchedData.length === 0) {
  labels = fetchedData.map(item => item.date); 
  // Data üçün sadəcə amount array
  dataPoints = fetchedData.map(item => item.amount);
  }
  transactionChart = new Chart(transactionsChart, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Məbləğ",
          data: dataPoints, // burada backend datası istifadə olunur
          borderColor: primaryColor5,
          backgroundColor: backgroundGradient5,
          borderWidth: 1,
          tension: 0.4,
          fill: "start",
          pointRadius: 4,
          pointBackgroundColor: primaryColor5,
          pointBorderColor: borderGlow5,
          pointBorderWidth: 6,
          pointHoverRadius: 4,
          pointHoverBorderColor: borderGlow5,
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
        x: { ticks: { display: false }, grid: { drawTicks: false } },
        y: { min: 0, max: Math.max(...fetchedData) * 1.2, ticks: { stepSize: 40 } },
      },
    },
  });
}

// new Chart(transactionsChart, {
//   type: "line",
//   data: {
//     labels: labels, // lazımdır, amma gizlədəcəyik
//     datasets: [
//       {
//         label: "Məbləğ",
//         data: dataPoints,
//         borderColor: primaryColor5,
//         backgroundColor: backgroundGradient5,
//         borderWidth: 1,
//         tension: 0.4,
//         fill: "start",
//         pointRadius: 4,
//         pointBackgroundColor: primaryColor5,
//         pointBorderColor: borderGlow5,
//         pointBorderWidth: 6,
//         pointHoverRadius: 4,
//         pointHoverBorderColor: borderGlow5,
//         pointHoverBorderWidth: 6,
//         clip: false,
//       },
//     ],
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//     },
//     scales: {
//       x: {
//         ticks: {
//           display: false, // 🔥 altda yazılar çıxmayacaq
//         },
//         grid: {
//           drawTicks: false, // tick-ləri də gizlədir
//         },
//       },
//       y: {
//         min: 0,
//         max: 200,
//         ticks: {
//           stepSize: 40,
//         },
//       },
//     },
//   },
// });

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

// ! Doughnut chart - hesablasmaDoughnut


const hesablasmaChartCtx = document
  .getElementById("hesablasmaDoughnut")
  .getContext("2d");

  let hesablasmaChart;
  function updateHesablasmaChart(fetchedData) {
     if (!Array.isArray(fetchedData)) return;
    if(hesablasmaChart) {
      hesablasmaChart.destroy();
    }
   const toplam = fetchedData.reduce((sum, item) => sum + (item.total || 0), 0);
  const odenilen = fetchedData.reduce((sum, item) => sum + (item.yekun_mebleg || 0), 0);
  const qaliq = toplam - odenilen
  hesablasmaChart = new Chart(hesablasmaChartCtx, {
  type: "doughnut",
  data: {
    labels: ["Avankartın ödədiyi", "Qalıq"],
    datasets: [
      {
        data: [odenilen, qaliq],
        backgroundColor: ["#7086FD", "#FFAE4C"],
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

        const isDarkMode = document.documentElement.classList.contains("dark");

        const labelColor = isDarkMode ? "#FFFFFF80" : "#1D222B80";
        const valueColor = isDarkMode ? "#FFFFFF" : "#1D222B";

        ctx.font = "400 12px Poppins";
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Toplam", width / 2, height / 2 - 20);

        // Məlumatların cəmi hesablanır və formatlaşdırılır
        const totalValue = toplam
        const formattedTotal = totalValue.toLocaleString("az-Latn-AZ") + " AZN";

        ctx.font = "600 22px Poppins";
        ctx.fillStyle = valueColor;
        ctx.fillText(formattedTotal, width / 2, height / 2 + 10);

        ctx.restore();
      },
    },
  ],
});
  

//  hesablasmaChart = new Chart(hesablasmaChartCtx, {
//   type: "doughnut",
//   data: {
//     labels: ["Avankartın ödədiyi", "Qalıq"],
//     datasets: [
//       {
//         data: [6350, 2150],
//         backgroundColor: ["#7086FD", "#FFAE4C"],
//         hoverOffset: 4,
//       },
//     ],
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: "80%",
//     radius: "80%",
//     plugins: {
//       legend: {
//         display: false, // HTML legend üçün default legend söndürüldü
//       },
//     },
//   },
//   plugins: [
//     {
//       id: "centerText",
//       afterDraw: function (chart) {
//         const {
//           ctx,
//           chartArea: { width, height },
//         } = chart;
//         ctx.save();

//         const isDarkMode = document.documentElement.classList.contains("dark");

//         const labelColor = isDarkMode ? "#FFFFFF80" : "#1D222B80";
//         const valueColor = isDarkMode ? "#FFFFFF" : "#1D222B";

//         ctx.font = "400 12px Poppins";
//         ctx.fillStyle = labelColor;
//         ctx.textAlign = "center";
//         ctx.textBaseline = "middle";
//         ctx.fillText("Toplam", width / 2, height / 2 - 20);

//         // Məlumatların cəmi hesablanır və formatlaşdırılır
//         const totalValue = chart.data.datasets[0].data.reduce(
//           (a, b) => a + b,
//           0
//         );
//         const formattedTotal = totalValue.toLocaleString("az-Latn-AZ") + " AZN";

//         ctx.font = "600 22px Poppins";
//         ctx.fillStyle = valueColor;
//         ctx.fillText(formattedTotal, width / 2, height / 2 + 10);

//         ctx.restore();
//       },
//     },
//   ],
// });

// Custom HTML legend
const hesablasmaLegend = document.getElementById("hesablasmaLegend");

if (hesablasmaLegend) {
  hesablasmaLegend.innerHTML = hesablasmaChart.data.labels
    .map((label, i) => {
      const color = hesablasmaChart.data.datasets[0].backgroundColor[i];
      const value =
        hesablasmaChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");

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
};


// ! QR Kod Sayı Chart
const qrChartDiv = document.getElementById("qrChart");
const qrChart = qrChartDiv.getContext("2d");
let qrChartInstance = null;
const primaryColor2 = "#7086FD";
const borderGlow2 = "#7086FD4D";
const backgroundGradient2 = createGradient(qrChart, primaryColor2);

function updateQrChart (fetchedData) {
  if (!qrChartDiv) return;

  // Əgər chart artıq varsa, əvvəlcə sil
  if (qrChartInstance) {
    qrChartInstance.destroy();
    qrChartInstance = null;
  }

  // Əgər chart artıq varsa, əvvəlcə sil
  if (qrChartInstance) {
    qrChartInstance.destroy();
  }
qrChartInstance = new Chart(qrChart, {
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
        data: fetchedData || [],
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
};




// ! Məxaric chart
 function updateMexaric (fetchedData) {
  if (!Array.isArray(fetchedData) || fetchedData.length === 0) return;
   const colors = [
    "#FFAE4C", "#6FD195", "#7086FD", "#9B7DAA", "#00A3FF", "#32B5AC", "#0076B2"
  ];
  // Məxaric charti ucun isci statistikasini saxlayan massiv
  const employeeStats = [
    {
      color: "#FFAE4C",
      label: "Yemək:",
      data: [
        30000, 45000, 25000, 60000, 40000, 70000, 20000, 80000, 55000, 90000,
        10000, 95000,
      ],
    },
    {
      color: "#6FD195",
      label: "Hədiyyə:",
      data: [
        15000, 3000, 25000, 5000, 20000, 12000, 40000, 7000, 1000, 30000, 45000,
        60000,
      ],
    },
    {
      color: "#7086FD",
      label: "Yanacaq:",
      data: [
        25000, 20000, 30000, 35000, 40000, 45000, 30000, 25000, 40000, 45000,
        50000, 55000,
      ],
    },
    {
      color: "#9B7DAA",
      label: "Food:",
      data: [
        22000, 25000, 30000, 30000, 40000, 33000, 42000, 28000, 37000, 45000,
        50000, 58000,
      ],
    },
    {
      color: "#00A3FF",
      label: "Biznes:",
      data: [
        10000, 15000, 12000, 18000, 20000, 25000, 22000, 27000, 30000, 35000,
        40000, 45000,
      ],
    },
    {
      color: "#32B5AC",
      label: "VIP:",
      data: [
        15000, 12000, 15000, 12000, 26000, 22000, 25000, 27000, 31000, 34000,
        42000, 43000,
      ],
    },
    {
      color: "#0076B2",
      label: "Wash:",
      data: [
        10000, 8000, 12000, 10000, 21000, 25000, 28000, 22000, 33000, 30000,
        42000, 40000,
      ],
    },
  ];

  // Gradient yaratmaq üçün funksiya
  function createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color + "4D");
    gradient.addColorStop(1, color + "00");
    return gradient;
  }

  // Canvas elementi ve konteksti
  const mexaricCanvas = document.getElementById("mexaricChart");
  if (!mexaricCanvas) return; // Element tapilmasa, kodu dayandir

  const ctx = mexaricCanvas.getContext("2d");

  // Dataset yaratmaq
  const chartDatasets = fetchedData.map((item,index) => {
    const color = colors[index % colors.length];
   return { 
    label: item.label,
    data: Array.isArray(item.amounts) ? item.amounts : [],
    borderColor: color,
    backgroundColor: createGradient(ctx, color),
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
    clip: false
  }
  });

   const labels = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
    "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
  ];
  if (window.mexaricChart && typeof window.mexaricChart.destroy === "function") {
  window.mexaricChart.destroy();
};

  // Məxaric charti yaradilmasi
  window.mexaricChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
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

  // Chartin altinda custom legend yaratmaq ucun hisse
  const legendContainer = document.getElementById("mexaricChartLabels");
  if (legendContainer) {
    legendContainer.innerHTML = "";
    fetchedData.forEach((dt,index) => {
      const color = colors[index % colors.length];
      const total = Array.isArray(dt.amounts)
      ? dt.amounts.reduce((a, b) => a + b, 0)
      : 0;
      const div = document.createElement("div");
      div.innerHTML = `
                <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
                    <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${
                      color
                    }A1">
                        <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${
                          color
                        }"></div>
                        <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${
                          color
                        }"></div>
                    </div>
                    <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${
                      dt.cardName
                    }</span>:
                    <span class="text-messages font-medium dark:text-[#FFFFFF]">${total.toLocaleString() } AZN</span>
                </div>`;
      legendContainer.appendChild(div);
    });
  }
}


// Custom HTML legend

function updateCards (fetchedData) {

  const kartlarMexaricDoughnutCtx = document
  .getElementById("kartlarMexaricDoughnut")
  .getContext("2d");
  let cardName = [];
  let cardAmount = [];
  fetchedData.forEach(item => {
    cardName.push(item.cardName)
    cardAmount.push(item.amounts);
  })
  if (window.kartlarMexaricDoughnut && typeof window.kartlarMexaricDoughnut.destroy === "function") {
  window.kartlarMexaricDoughnut.destroy();
}
window.kartlarMexaricDoughnut = new Chart(kartlarMexaricDoughnutCtx, {
  type: "doughnut",
  data: {
    labels: cardName,
    datasets: [
      {
        data: cardAmount,
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

        const isDarkMode = document.documentElement.classList.contains("dark");

        const labelColor = isDarkMode ? "#FFFFFF80" : "#1D222B80";
        const valueColor = isDarkMode ? "#FFFFFF" : "#1D222B";

        ctx.font = "400 12px Poppins";
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Toplam", width / 2, height / 2 - 20);

        // Məlumatların cəmi hesablanır və formatlaşdırılır
        const totalValue = chart.data.datasets[0].data.reduce(
          (a, b) => +a + +b,
          0
        );
        const formattedTotal = totalValue.toLocaleString("az-Latn-AZ") + " AZN";

        ctx.font = "600 22px Poppins";
        ctx.fillStyle = valueColor;
        ctx.fillText(formattedTotal, width / 2, height / 2 + 10);

        ctx.restore();
      },
    },
  ],
});
const kartlarMexaricDoughnutLegend = document.getElementById(
  "kartlarMexaricDoughnutLegend"
);

if (kartlarMexaricDoughnutLegend) {
  kartlarMexaricDoughnutLegend.innerHTML = kartlarMexaricDoughnut.data.labels
    .map((label, i) => {
      const color = kartlarMexaricDoughnut.data.datasets[0].backgroundColor[i];
      const value =
        kartlarMexaricDoughnut.data.datasets[0].data[i].toLocaleString(
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
}


//! Toggle and modal functions
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("yearDropdownToggle");
  const dropdown = document.getElementById("yearDropdown");

  toggle.addEventListener("click", function (e) {
    e.stopPropagation(); // Digər click-ləri blokla
    dropdown.classList.toggle("hidden");
  });

  // Dropdown-a klik etdikdə də bağlanmasın
  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Çöldə klik etdikdə dropdown bağlansın
  document.addEventListener("click", function () {
    dropdown.classList.add("hidden");
  });

  // İli seçdikdə yazını dəyiş və dropdown-u bağla
  dropdown.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", function () {
      fetchQr(this.textContent.trim());
      toggle.querySelector("span").textContent = this.textContent;
      dropdown.classList.add("hidden");
    });
  });
});

// date modal
let modalName = ""
function openDateModal(chartName) {
  let modal = ""
  if(chartName === "transaction") {
    modal = document.querySelector("#dateModal");
    modalName = chartName
  } else if( chartName === "hesablasma") {
    modal = document.querySelector("#dateModal");
    modalName = chartName
  }
 
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeDateModal() {
  const modal = document.querySelector("#dateModal"); 
  if (modal) {
    modal.classList.add("hidden");
  }
}

function clearDateModalFilters() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
}

//! transactionsTab tab
document.querySelectorAll(".transactionsTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    fetchTransactions(String($(this).data("day")))

  
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".transactionsTab").forEach((t) => {
      t.classList.remove(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
      t.classList.add(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark"
      );
    });

    // Kliklənmiş elementə aktiv class-lar əlavə et
    this.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    this.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  });
});
$("#dateForm").on("submit", async function (e) {
e.preventDefault();
let csrfToken = $("meta[name='csrf-token']").attr("content");
const formData = new FormData(this)
let bodyData = {}
for (const [key, value] of formData.entries()) {
  bodyData[key] = value
  if(key === "_csrf") {
    csrfToken = value
  }
}
try {
  if(modalName === "transaction") {
  let response = await fetch("/muessiseler/transaction",{
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "CSRF-Token":  csrfToken
    },
    body: JSON.stringify(bodyData)
  });

  const result = await response.json();
   $("#transactionsCount").text(result.recordsFiltered)
   updateTransactionsChart(result.data.data)
  } 
  if( modalName === "hesablasma") {
     let response = await fetch("/muessiseler/hesablasma",{
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "CSRF-Token":  csrfToken
    },
    body: JSON.stringify(bodyData)
  });

  const result = await response.json();
   $("#hesablasmaCount").text(result.recordsFiltered)
   updateHesablasmaChart(result.data.data)
  }
  
} catch (error) {
    console.log(error);
}
  clearDateModalFilters();
  closeDateModal()
});

//! hesablasmaTab tab
document.querySelectorAll(".hesablasmaTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    fetchHesablasma(String($(this).data("day")))
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".hesablasmaTab").forEach((t) => {
      t.classList.remove(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages",
        "dark:text-primary-text-color-dark"
      );
      t.classList.add(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark"
      );
    });

    // Kliklənmiş elementə aktiv class-lar əlavə et
    this.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages",
      "dark:text-primary-text-color-dark"
    );
    this.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );
  });
});

// fetching transactions data
async function fetchTransactions (date) {
const csrfToken = $("meta[name='csrf-token']").attr("content");
const muessiseId = $("#muessiseId").val()
const bodyData = {
       muessise_id: muessiseId,
       search: date
      };
  try {
    let response = await fetch("/muessiseler/transaction", {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "CSRF-Token":  csrfToken
    },
    body: JSON.stringify(bodyData)
      })
      const result = await response.json();
      $("#transactionsCount").text(result.recordsFiltered)
      updateTransactionsChart(result.data.data)
  } catch (error) {
    console.log(error)
  }
} 


// fetching hesablasma data
async function fetchHesablasma (date) {
const csrfToken = $("meta[name='csrf-token']").attr("content");
const muessiseId = $("#muessiseId").val()
const bodyData = {
       muessise_id: muessiseId,
       search: date
      };
  try {
    let response = await fetch("/muessiseler/hesablasma", {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "CSRF-Token":  csrfToken
    },
    body: JSON.stringify(bodyData)
      })
      const result = await response.json();
      $("#hesablasmaCount").text(result.recordsFiltered)
      updateHesablasmaChart(result.data.data)
  } catch (error) {
    console.log(error)
  }
} 

async function fetchQr (date) {
const csrfToken = $("meta[name='csrf-token']").attr("content");
const muessiseId = $("#muessiseId").val()
const now = new Date()
const nowDate = now.getFullYear()
const bodyData = {
       muessise_id: muessiseId,
       date: date ? date : nowDate 
      };
  try {
    let response = await fetch("/muessiseler/qr", {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "CSRF-Token":  csrfToken
    },
    body: JSON.stringify(bodyData)
    })
      const result = await response.json();
      const totalAmount = (result.data[0].amounts || []).reduce((a, b) => a + b, 0);
      $("#qrCount").text(totalAmount + " AZN")
      updateQrChart(result.data[0].amounts)
  } catch (error) {
    console.log(error)
  }
}



//! Years Modal
function openYearsModal() {
  const modal = document.getElementById("yearsModal");
  modal.classList.remove("hidden");
  // Modal açıldıqda bədənin scrollunu gizlətmək istəyirsinizsə, əlavə edə bilərsiniz:
  // document.body.style.overflow = 'hidden';
}

function closeYearsModal() {
  const modal = document.getElementById("yearsModal");
  modal.classList.add("hidden");
  // Scrollu bərpa etmək üçün:
  // document.body.style.overflow = '';
}

// Modal arxa fonuna kliklə bağlama
document.getElementById("yearsModal").addEventListener("click", function () {
  closeYearsModal();
});

// Modalın içindəki əsas konteyner kliklərində eventin yayılmasını dayandırırıq
document
  .querySelector("#yearsModal > div")
  .addEventListener("click", function (event) {
    event.stopPropagation();
  });

// Search input üçün event listener
document.getElementById("customSearch").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  const listItems = document.querySelectorAll(
    "#yearsModal ul li, #yearsModal ul label"
  );

  // Checkboxların olduğu label elementlərinə baxırıq
  document.querySelectorAll("#yearsModal ul label").forEach((label) => {
    const text = label.textContent.toLowerCase();
    if (text.includes(filter)) {
      label.style.display = "flex"; // Göstər
    } else {
      label.style.display = "none"; // Gizlət
    }
  });
});

// "Filterlə" düyməsi klik olanda

const filterButton = document.querySelector("#filterButton");
filterButton.addEventListener("click", async function () {
const csrfToken = $("meta[name='csrf-token']").attr("content");
const muessiseId = $("#muessiseId").val()
  const checkedIds = Array.from(
  document.querySelectorAll("#kartlarModal input[type='checkbox']:checked")
).map(cb => {
  // Hər inputun yanındakı div-i tapırıq (label daxilində olduğu üçün nextElementSibling-dir)
  const div = cb.nextElementSibling;
  return div ? div.id : null;
}).filter(id => id !== null);

   let response = await fetch("/muessiseler/kart", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "CSRF-Token":  csrfToken
     },
    body: JSON.stringify({
      muessise_id: muessiseId,
      cards: checkedIds,
    }),
  })
  let result = await response.json();
  clearKartlarFilter()
  closeKartlarModal();
  updateMexaric(result.data);
  updateCards(result.data);
  // Bütün checkbox-ları sıfırla
  document
    .querySelectorAll("#kartlarModal input[type='checkbox']")
    .forEach((cb) => (cb.checked = false));
});
const filterButtonIller = document.querySelector("#filterButtonIller");
filterButtonIller.addEventListener("click", async function () {
  const csrfToken = $("meta[name='csrf-token']").attr("content");
const muessiseId = $("#muessiseId").val()
  const checkedValues = Array.from(
    document.querySelectorAll("#yearsModal input[type='checkbox']:checked")
  ).map((cb) => cb.value);

  let response = await fetch("/muessiseler/kart", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "CSRF-Token":  csrfToken
     },
    body: JSON.stringify({
      muessise_id: muessiseId,
      years: checkedValues,
    }),
  })
  let result = await response.json();
  clearFilter();
  closeYearsModal()
  updateMexaric(result.data);
   updateCards(result.data);
  // Bütün checkbox-ları sıfırla
  document
    .querySelectorAll("#yearsModal input[type='checkbox']")
    .forEach((cb) => (cb.checked = false));
});


// ClearFilter funksiyası: bütün checkboxları sıfırla və axtarışı təmizlə
function clearFilter() {
  // Bütün checkboxları tap və unchecked et
  document
    .querySelectorAll('#yearsModal input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  // Axtarış inputunu təmizlə
  const searchInput = document.getElementById("customSearch");
  searchInput.value = "";

  // Bütün label-ları göstər
  document.querySelectorAll("#yearsModal ul label").forEach((label) => {
    label.style.display = "flex";
  });
}

//! Kartlar Modal
function openKartlarModal() {
  const modal = document.getElementById("kartlarModal");
  modal.classList.remove("hidden");
}

function closeKartlarModal() {
  const modal = document.getElementById("kartlarModal");
  modal.classList.add("hidden");
}

// Kənara kliklədikdə modalı bağla
document.addEventListener("click", function (event) {
  const modal = document.getElementById("kartlarModal");
  const modalContent = modal.querySelector("div[class*='rounded-xl']"); // Modal içindəki əsas content

  // Modal açıqdırsa və klik modalContent-in içində deyilsə və klik modalın özündədirsə
  if (
    !modal.classList.contains("hidden") &&
    !modalContent.contains(event.target) &&
    modal.contains(event.target)
  ) {
    closeKartlarModal();
  }
});

// ESC düyməsi ilə bağlamaq üçün (əlavə)
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeKartlarModal();
  }
});

// Axtarış inputu
const searchInput = document.getElementById("customSearch4");

// Checkbox-label-ları tut
const kartlarLabel = document.querySelectorAll("#kartlarModal ul label");

// Axtarış funksiyası
searchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase().trim();

  kartlarLabel.forEach((label) => {
    const text = label.textContent.toLowerCase();
    if (text.includes(query)) {
      label.style.display = "flex";
    } else {
      label.style.display = "none";
    }
  });
});
// 🔹 Dashboard datalarını yükləyən funksiya
async function loadDashboardData() {
const csrfToken = $("meta[name='csrf-token']").attr("content");
const muessiseId = $("#muessiseId").val()
  try {
    const res = await fetch(`/muessiseler/dashboard-data?muessise_id=${muessiseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken
      }
    });
    if (!res.ok) throw new Error("Serverdən məlumat alınmadı");

    const result = await res.json();
    const { recordsTotalTransactions,
            recordsTotalHesablasma } = result;
    const { allCards, hesablasma, qrChart, transactionsData } = result.data[0];
    const totalAmount = result.data[0].qrChart[0].amounts.reduce((a,b) => a += b)
      $("#transactionsCount").text(recordsTotalTransactions);
      $("#hesablasmaCount").text(recordsTotalHesablasma);
      $("#qrCount").text(totalAmount + " AZN")
    updateMexaric(allCards);
    updateCards(allCards);
    updateHesablasmaChart(hesablasma);
    updateQrChart(qrChart);
    updateTransactionsChart(transactionsData);

  } catch (err) {
    console.error("❌ Dashboard dataları yüklənərkən xəta:", err);
  }
}

// 🔹 Səhifə render olanda avtomatik işləsin
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
});


// "Filterlə" düyməsi klik olanda


// "Filterləri təmizlə" düyməsi
function clearKartlarFilter() {
  searchInput.value = "";
  kartlarLabel.forEach((label) => {
    label.style.display = "flex";
  });
  document
    .querySelectorAll("#kartlarModal input[type='checkbox']")
    .forEach((cb) => (cb.checked = false));
}
