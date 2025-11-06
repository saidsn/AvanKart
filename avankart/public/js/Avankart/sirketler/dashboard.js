//! Qenaet chart
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
        position: "top", // ✅ Yazıları yuxarıya daşıyır
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
    // 1️⃣ Sarı şəffaf fon – axıra qədər
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
    // 2️⃣ Məbləğ yazısı mərkəzdə
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

//! Doughnut chart - odenilmis
const odenilmisChartCtx = document
  .getElementById("odenilmisChart")
  .getContext("2d");

const odenilmisChart = new Chart(odenilmisChartCtx, {
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
        data: [3350, 2650, 1800, 1700, 1800, 1000, 1500], // 2 yeni data da əlavə etdim
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

        ctx.font = "600 22px Poppins";
        ctx.fillStyle = valueColor;
        ctx.fillText("124.200.00 AZN", width / 2, height / 2 + 10);

        ctx.restore();
      },
    },
  ],
});

// Custom HTML legend
document.getElementById("odenilmisLegend").innerHTML =
  odenilmisChart.data.labels
    .map((label, i) => {
      const color = odenilmisChart.data.datasets[0].backgroundColor[i];
      const value =
        odenilmisChart.data.datasets[0].data[i].toLocaleString("az-Latn-AZ");

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

//! Doughnut chart - kesbek
const kesbekChartCtx = document.getElementById("kesbekChart").getContext("2d");

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
        data: [3350, 2650, 1800, 1700, 1800, 1000, 1500], // 2 yeni data da əlavə etdim
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

        ctx.font = "600 22px Poppins";
        ctx.fillStyle = valueColor;
        ctx.fillText("124.200.00 AZN", width / 2, height / 2 + 10);

        ctx.restore();
      },
    },
  ],
});

// Custom HTML legend
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

//! QR Kod Sayı Chart
const qrChartDiv = document.getElementById("qrChart");
const qrChart = qrChartDiv.getContext("2d");
const primaryColor2 = "#00504B";
const borderGlow2 = "#00504B4D";
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
        ticks: { stepSize: 20000 },
      },
    },
  },
});

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

//! balans chart
// İşçi statistikasını saxlayan massiv
const employeeStats = [
  {
    color: "#6FD195",
    label: "Aktiv balans:",
    data: [
      30000, 45000, 25000, 60000, 40000, 70000, 20000, 80000, 55000, 90000,
      10000, 95000,
    ],
  },
  {
    color: "#FDC786",
    label: "Passiv balans:",
    data: [
      25000, 20000, 30000, 35000, 40000, 45000, 30000, 25000, 40000, 45000,
      50000, 55000,
    ],
  },
  {
    color: "#FF6B6B",
    label: "Xərcləmə:",
    data: [
      15000, 3000, 25000, 5000, 20000, 12000, 40000, 7000, 1000, 30000, 45000,
      60000,
    ],
  },
  {
    color: "#7086FD",
    label: "Kəşbek:",
    data: [
      12000, 13000, 5000, 50000, 40000, 43000, 70000, 20000, 13000, 41000,
      10000, 25000,
    ],
  },
  {
    color: "#9747FF",
    label: "Toplam:",
    data: [
      10000, 15000, 12000, 18000, 20000, 25000, 22000, 27000, 30000, 35000,
      40000, 45000,
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

// Canvas elementi və konteksti
const employeeCanvas = document.getElementById("balans");
const ctx = employeeCanvas.getContext("2d");

// Dataset yaratmaq
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

// Chart yaradılması
const employeeChart = new Chart(ctx, {
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
      // Yalnız yuxarıdakı default legendi silir
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

// Chartin altında custom legend yaratmaq üçün hissə bərpa edilib
const legendContainer = document.getElementById("balanslabels");
employeeStats.forEach((dt) => {
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
      <span class="text-messages font-medium dark:text-[#FFFFFF]">${dt.data.reduce(
        (a, b) => a + b,
        0
      )} AZN</span>
    </div>`;
  legendContainer.appendChild(div);
});

//! balans chart tab-a gore secim
// Tab elementlərini götürürük
const tabs = document.querySelectorAll(".iscilerTab");
// Tab klik eventi
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    // Aktiv class-ı dəyişək
    tabs.forEach((t) => {
      t.classList.remove(
        "bg-inverse-on-surface",
        "dark:bg-inverse-on-surface-dark",
        "text-messages"
      );
      t.classList.add(
        "text-tertiary-text",
        "dark:text-tertiary-text-color-dark"
      );
    });

    tab.classList.add(
      "bg-inverse-on-surface",
      "dark:bg-inverse-on-surface-dark",
      "text-messages"
    );
    tab.classList.remove(
      "text-tertiary-text",
      "dark:text-tertiary-text-color-dark"
    );

    // Chart datasetini yenilə
    if (index === 0) {
      // Hamısı seçilibsə bütün datasetləri göstər
      employeeChart.data.datasets = chartDatasets;
      updateLegend(chartDatasets);
    } else if (tab.textContent.trim() === "Toplam") {
      // Toplam seçiləndə: Chart yalnız Toplam
      employeeChart.data.datasets = [chartDatasets[4]];

      // Alt hissədə isə Aktiv + Passiv + Xərcləmə göstərilsin
      const legendData = [
        chartDatasets[0], // Aktiv balans
        chartDatasets[1], // Xərcləmə
        chartDatasets[2], // Passiv balans
      ];
      updateLegend(legendData);
    } else {
      // Yalnız kliklənmiş tab-ın datası
      const dataset = [chartDatasets[index - 1]];
      employeeChart.data.datasets = dataset;
      updateLegend(dataset);
    }

    employeeChart.update();
  });
});

// 🔹 Custom Legend yeniləmə funksiyası
function updateLegend(datasets) {
  legendContainer.innerHTML = ""; // təmizlə
  datasets.forEach((dt) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="text-center text-xs font-medium text-messages flex items-center justify-center gap-1">
        <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${
          dt.borderColor
        }A1">
          <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${
            dt.borderColor
          }"></div>
          <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${
            dt.borderColor
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
  dropdown.querySelectorAll("div").forEach((item) => {
    item.addEventListener("click", function () {
      toggle.querySelector("span").textContent = this.textContent;
      dropdown.classList.add("hidden");
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("allDropdownToggle");
  const dropdown = document.getElementById("allDropdown");

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
  dropdown.querySelectorAll("div").forEach((item) => {
    item.addEventListener("click", function () {
      toggle.querySelector("span").textContent = this.textContent;
      dropdown.classList.add("hidden");
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("iscilerYearDropdownToggle");
  const dropdown = document.getElementById("iscilerYearDropdown");

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
  dropdown.querySelectorAll("div").forEach((item) => {
    item.addEventListener("click", function () {
      toggle.querySelector("span").textContent = this.textContent;
      dropdown.classList.add("hidden");
    });
  });
});

//! Date modal
function openDateModal() {
  const modal = document.querySelector("#dateModal");
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

//! kartlarTab tab
document.querySelectorAll(".kartlarTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".kartlarTab").forEach((t) => {
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

//! iscilerTab tab
document.querySelectorAll(".iscilerTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".iscilerTab").forEach((t) => {
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

//! odenisTab tab
document.querySelectorAll(".odenisTab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Əvvəlcə bütün .tab elementlərindən aktiv background class-larını sil
    document.querySelectorAll(".odenisTab").forEach((t) => {
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
