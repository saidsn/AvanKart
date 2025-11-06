const meblegChart = document.getElementById("meblegChart").getContext("2d");
const primaryColor1 = "#7086FD";
const borderGlow1 = "#7086FD4D";
const backgroundGradient1 = createGradient(meblegChart, primaryColor1);

function hexToRgba(hex, alpha = 1) {
  const hexValue = hex.replace("#", "");
  const bigint = parseInt(hexValue, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// **Gradient Oluşturma Fonksiyonu**
function createGradient(ctx, baseColor) {
  let gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, hexToRgba(baseColor, 0.3)); // 30% opacity
  gradient.addColorStop(1, hexToRgba(baseColor, 0)); // Transparent
  return gradient;
}

function loadMeblegChart(year = new Date().getFullYear()) {
  $.ajax({
    url: "/charts/mebleg-chart",
    method: "POST",
    data: { date: year },
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    success: function (response) {
      const counts = response.data.map((item) => item.total ?? 0);
      const maxValue = Math.max(...counts);

      let roundedMax;
      if (maxValue <= 10) {
        roundedMax = 10;
      } else if (maxValue <= 100) {
        roundedMax = Math.ceil(maxValue / 10) * 10;
      } else if (maxValue <= 1000) {
        roundedMax = Math.ceil(maxValue / 100) * 100;
      } else {
        roundedMax = Math.ceil(maxValue / 10000) * 10000;
      }

      const stepSize = Math.ceil(roundedMax / 5);
      roundedMax = stepSize * 5;
      const ctx = document.getElementById("meblegChart").getContext("2d");

      if (window.meblegChartInstance) {
        window.meblegChartInstance.destroy();
      }

      $("#meblegTotal").text(maxValue ?? 0);

      window.meblegChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Yan", "Fev", "Mart", "Apr", "May", "İyun",
            "İyul", "Avq", "Sen", "Okt", "Noy", "Dek"
          ],
          datasets: [
            {
              label: "Məbləğ",
              data: counts,
              borderColor: primaryColor1,
              backgroundColor: backgroundGradient1,
              borderWidth: 1,
              tension: 0.4,
              fill: "start",
              pointRadius: 4,
              pointBackgroundColor: primaryColor1,
              pointBorderColor: borderGlow1,
              pointBorderWidth: 6,
              pointHoverRadius: 4,
              pointHoverBorderColor: borderGlow1,
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
              beginAtZero: true,
              min: 0,
              max: roundedMax,
              ticks: {
                stepSize: stepSize,
                callback: function (value) {
                  return value.toString(); // zorla string yaparsak çizgiler bozulmaz
                }
              }
            },
          },
        },
      });
    },
    error: function (xhr, status, error) {
      console.error("Chart data could not be loaded:", error);
    },
  });
}

// Hesablashma Chart (Donut Chart)
function loadHesablasmaChart(range = "year", startDate = null, endDate = null) {
  const hesablasmaChart = document
    .getElementById("hesablashmaChart")
    .getContext("2d");

  // Prepare request data
  let requestData = { range };

  // Add custom dates if provided
  if (range === "custom" && startDate && endDate) {
    requestData.from = startDate;
    requestData.to = endDate;
  } else if (typeof range === "number") {
    // If range is a year number (legacy behavior)
    requestData.date = range;
  }

  console.log("📊 Hesablashma Chart request data:", requestData);

  $.ajax({
    url: "/charts/hesablasmalar",
    method: "POST",
    data: JSON.stringify(requestData),
    contentType: "application/json",
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    beforeSend: function () {
      // Show loading state
      console.log("🔄 Loading Hesablashma Chart data...");
    },
    success: function (response) {
      console.log("✅ Hesablashma Chart data loaded successfully:", response);
      if (window.hesablasmaChartInstance) {
        window.hesablasmaChartInstance.destroy();
      }
      window.hesablasmaChartInstance = new Chart(hesablasmaChart, {
        type: "doughnut",
        data: {
          labels: response.labels ?? ["Avankartın ödədiyi", "Qalıq"],
          datasets: [
            {
              data: response.datasets ?? [0, 0],
              backgroundColor: ["#7086FD", "#F2AB4B"],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "80%", // iç boşluq (dairənin ortası)
          radius: "80%", // chart radiusu (default: 100%)
          plugins: {
            legend: {
              display: true,
              position: "right",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
              },
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

              // Toplam yazısı
              ctx.font = "400 12px Poppins";
              ctx.fillStyle = labelColor;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                response.text?.total ?? "Toplam",
                width / 2,
                height / 2 - 20
              );

              // 8500 AZN
              ctx.font = "600 22px Poppins";
              ctx.fillStyle = valueColor;
              ctx.fillText(
                response.datasets[0] + response.datasets[1] + " AZN",
                width / 2,
                height / 2 + 10
              );

              ctx.restore();
            },
          },
        ],
      });
    },
    error: function (xhr, status, error) {
      console.error("❌ Hesablashma Chart data loading failed:", error);
      console.error("❌ Response:", xhr.responseText);
    }
  });
}

function loadQrChart(range = "year", startDate = null, endDate = null) {
  const $qrChartDiv = $("#qrChart");
  if (!$qrChartDiv.length) return console.warn("QR Chart div not found");

  const ctx = $qrChartDiv[0].getContext("2d");
  const primaryColor = "#6FCF97";
  const borderGlow = "#6FCF974D";
  const backgroundGradient = createGradient(ctx, primaryColor);

  // Prepare request data
  let requestData = { range };

  // Add custom dates if provided
  if (range === "custom" && startDate && endDate) {
    requestData.start_date = startDate;
    requestData.end_date = endDate;
  }

  console.log("📊 QR Chart request data:", requestData);

  $.ajax({
    url: "/charts/qr-code-counts",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(requestData),
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    beforeSend: function () {
      // Show loading state
      console.log("🔄 Loading QR Chart data...");
    },
    success: function (response) {
      console.log("✅ QR Chart data loaded successfully:", response);
      const labels = response.data.map((item) => item.period);
      const counts = response.data.map((item) => item.count);
      const max = Math.max(...counts);
      const roundedMax = max <= 10 ? 10 : max <= 100 ? Math.ceil(max / 10) * 10 : Math.ceil(max / 10000) * 10000;
      const stepSize = Math.ceil(roundedMax / 5);

      if (window.qrChartInstance) {
        window.qrChartInstance.destroy();
      }

      $("#qrCodeTotalCounts").text(response.totalCount);

      window.qrChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "QR Kod Sayı",
            data: counts,
            borderColor: primaryColor,
            backgroundColor: backgroundGradient,
            borderWidth: 2,
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
          }]
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
                stepSize,
                callback: v => v.toString()
              }
            },
            x: {
              ticks: {
                callback: function (value, index) {
                  return index % 2 === 0 ? this.getLabelForValue(value) : "";
                },
              },
            },
          },
        },
      });
    },
    error: function (xhr, status, error) {
      console.error("❌ QR Chart data loading failed:", error);
      console.error("❌ Response:", xhr.responseText);
    },
  });
}

function loadKartlarMeblegCharts() {
  // Kartlar məbləğ chart'ları yükləmək üçün yeni function
  const kartlerMeblegYearsForm = $("#kartlerMeblegYearsForm");
  const kartlerMeblegCardsForm = $("#kartlerMeblegCardsForm");
  const yearsInput = kartlerMeblegYearsForm.find("input[name='years[]']:checked").map(function () {
    return $(this).val();
  })
    .get();
  const cardsInput = kartlerMeblegCardsForm.find("input[name='cards[]']:checked")
    .map(function () {
      return $(this).val();
    })
    .get();
  $.ajax({
    url: "/charts/kartlar-chart",
    method: "POST",
    data: JSON.stringify({
      cards: cardsInput, // boş array = bütün kartlar
      years: yearsInput, // tək il üçün aylıq data
    }),
    contentType: "application/json",
    headers: {
      "CSRF-Token": $('meta[name="csrf-token"]').attr("content"),
    },
    success: function (response) {
      // 1. Donut Chart'ı yenilə
      updateDonutChart(response);

      // 2. Line Chart'ı yenilə
      updateLineChart(response);
    },
    error: function (xhr, status, error) {
      console.error("Kartlar məbləğ data çəkilə bilmədi:", error);
    },
  });
}

// Donut chart'ı yeniləmək
function updateDonutChart(response) {
  const donutLabels = response.donutData.map((item) => item.name);
  const donutValues = response.donutData.map((item) => item.value);
  const donutColors = response.donutData.map((item) => item.color);

  if (window.mebglegDoughnutChartInstance) {
    window.mebglegDoughnutChartInstance.destroy();
  }

  const mebglegDoughnutChart = document
    .getElementById("mebglegDoughnutChart")
    .getContext("2d");

  window.mebglegDoughnutChartInstance = new Chart(mebglegDoughnutChart, {
    type: "doughnut",
    data: {
      labels: donutLabels,
      datasets: [
        {
          data: donutValues,
          backgroundColor: donutColors,
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
          display: true,
          position: "right",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
          },
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

          // Toplam yazısı
          ctx.font = "400 12px Poppins";
          ctx.fillStyle = labelColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Toplam", width / 2, height / 2 - 20);

          // Məbləğ
          ctx.font = "600 22px Poppins";
          ctx.fillStyle = valueColor;
          ctx.fillText(
            response.total.toFixed(2) + " AZN",
            width / 2,
            height / 2 + 10
          );

          ctx.restore();
        },
      },
    ],
  });
}

// Line chart'ı yeniləmək
function updateLineChart(response) {
  if (window.kartlarChartInstance) {
    window.kartlarChartInstance.destroy();
  }

  const kartlarDiv = document.getElementById("kartlar");
  const kartlar = kartlarDiv.getContext("2d");

  // Dataset'ləri hazırla
  const datasets = response.chartData.map((item) => ({
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

  // Maximum değeri hesapla
  const allValues = response.chartData.flatMap((d) => d.data);
  const maxValue = Math.max(...allValues);
  let roundedMax;
  if (maxValue <= 10) {
    roundedMax = 10;
  } else if (maxValue <= 100) {
    roundedMax = Math.ceil(maxValue / 10) * 10;
  } else if (maxValue <= 1000) {
    roundedMax = Math.ceil(maxValue / 100) * 100;
  } else {
    roundedMax = Math.ceil(maxValue / 10000) * 10000;
  }

  const stepSize = Math.ceil(roundedMax / 5);
  roundedMax = stepSize * 5;

  window.kartlarChartInstance = new Chart(kartlar, {
    type: "line",
    data: {
      labels: response.labels,
      datasets: datasets,
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
          ticks: { stepSize: stepSize },
        },
        x: {
          ticks: {
            callback: function (value, index, values) {
              let myval = this.getLabelForValue(value);
              return myval.slice(0, 4);
            },
          },
        },
      },
    },
  });

  // Custom legend yenilə
  updateCustomLegend(response.chartData);
}

// Custom legend yeniləmək
function updateCustomLegend(chartData) {
  const kartlarlabel = document.getElementById("kartlarlabels");
  kartlarlabel.innerHTML = ""; // Mövcud legend'i təmizlə

  chartData.forEach((dt) => {
    const total = dt.data.reduce((a, b) => a + b, 0);
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
        <span class="text-tertiary-text font-normal">${dt.label
      }: ${total.toFixed(2)} AZN</span>
      </div>
    `;
    kartlarlabel.appendChild(div);
  });
}

// Səhifə yüklənəndə kartlar chart'larını çağır
function setActiveTab(clickedTab, chartType) {
  // Get all tabs in the same chart section
  const chartContainer = clickedTab.closest('.w-\\[50\\%\\]');
  const allTabs = chartContainer.querySelectorAll('.tab:not([onclick])'); // Exclude the date picker button

  // Remove active classes from all tabs
  allTabs.forEach(tab => {
    tab.classList.remove('text-messages', 'dark:text-primary-text-color-dark', 'bg-inverse-on-surface', 'dark:bg-inverse-on-surface-dark', 'py-[3px]', 'px-3');
    tab.classList.add('text-tertiary-text', 'dark:text-tertiary-text-color-dark', 'hover:text-messages', 'dark:hover:text-primary-text-color-dark');
  });

  // Add active classes to clicked tab
  clickedTab.classList.remove('text-tertiary-text', 'dark:text-tertiary-text-color-dark', 'hover:text-messages', 'dark:hover:text-primary-text-color-dark', 'active');
  clickedTab.classList.add('text-messages', 'dark:text-primary-text-color-dark', 'bg-inverse-on-surface', 'dark:bg-inverse-on-surface-dark', 'py-[3px]', 'px-3', 'flex', 'items-center', 'justify-center', 'active');

  // Here you can add logic to update the chart based on the selected period
  const tabText = clickedTab.textContent.trim();
  console.log(`${chartType} chart updated to: ${tabText}`);
  filterChart(clickedTab);
}

// Initialize click handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Add click handlers to all tabs except the "Tarix əlavə et" button
  const allTabs = document.querySelectorAll('.tab:not(.active)');
  allTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // Determine which chart this tab belongs to
      const chartType = this.closest('.w-\\[50\\%\\]').querySelector('[class*="text-[15px]"]').textContent.trim();
      setActiveTab(this, chartType);

    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadMeblegChart();           // Məbləğ xətti chart
  loadHesablasmaChart();       // Hesablaşma donut chart
  loadQrChart();               // QR kod xətti chart
  loadKartlarMeblegCharts();   // Kartlar məbləğ xətti və donut chart
});
