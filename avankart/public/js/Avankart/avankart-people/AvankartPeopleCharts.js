$(document).ready(function () {
    const urlParts = window.location.pathname.split("/");
    const peopleId = urlParts[urlParts.length - 1];
    const csrfToken = $('meta[name="csrf-token"]').attr('content');

    // ============================================================
    // CASHBACK CHART 
    // ============================================================
    $.ajax({
        url: `/api/people/cashbacks/${peopleId}`,
        method: "POST",
        headers: { "Csrf-token": csrfToken },
        success: function (res) {
            const labels = res.data.map(d => d.cardName);
            const dataValues = res.data.map(d => d.totalCashback);
            const colors = [
                "#7086FD", "#FFAE4C", "#6FD195", "#00A3FF",
                "#9B7DAA", "#32B5AC", "#0076B2", "#FF6384", "#FFA500"
            ].slice(0, labels.length);

            const ctx = document.getElementById("kesbekChart").getContext("2d");
            new Chart(ctx, {
                type: "doughnut",
                data: { labels, datasets: [{ data: dataValues, backgroundColor: colors, hoverOffset: 4 }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "80%",
                    radius: "80%",
                    plugins: { legend: { display: false } }
                },
                plugins: [{
                    id: "centerText",
                    afterDraw: function (chart) {
                        const { ctx, chartArea: { width, height } } = chart;
                        ctx.save();
                        const isDark = document.documentElement.classList.contains("dark");
                        ctx.font = "400 12px Poppins";
                        ctx.fillStyle = isDark ? "#FFFFFF80" : "#1D222B80";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText("Toplam", width / 2, height / 2 - 20);
                        ctx.font = "600 22px Poppins";
                        ctx.fillStyle = isDark ? "#FFFFFF" : "#1D222B";
                        ctx.fillText(res.totalCashback.toLocaleString("az-Latn-AZ") + " AZN", width / 2, height / 2 + 10);
                        ctx.restore();
                    }
                }]
            });

            document.getElementById("kesbekLegend").innerHTML = labels.map((label, i) => {
                return `
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="width:8px;height:8px;border-radius:50%;background-color:${colors[i]};flex-shrink:0;"></span>
                        <span class="text-[#1D222B80] dark:text-tertiary-text-color-dark text-[12px] font-normal">${label}</span>
                        <span class="text-[#0000001A] dark:text-tertiary-text-color-dark text-[12px] font-normal">|</span>
                        <span class="text-[#1D222B] dark:text-primary-text-color-dark text-[12px] font-medium">${dataValues[i].toLocaleString("az-Latn-AZ")} AZN</span>
                    </div>
                `;
            }).join("");
        },
        error: function (xhr, status, error) { console.error("Cashback Xəta:", error); }
    });

    // ============================================================
    //  (ADDED BALANCES) CHART 
    // ============================================================

    let artimSelectedFilters = {
        cardIds: [],
        sirketIds: [],
        years: []
    };

    let artimAppliedFilters = {
        cardIds: [],
        sirketIds: [],
        years: []
    };

    // ------------ ARTIM DOUGHNUT CHART ------------
    function loadArtimDoughnut() {
        $.ajax({
            url: `/api/people/addedbalances/${peopleId}`,
            method: "POST",
            headers: { "Csrf-token": csrfToken },
            data: JSON.stringify(artimAppliedFilters),
            contentType: "application/json",
            success: function (res) {
                const labels = res.data.map(d => d.cardName);
                const dataValues = res.data.map(d => d.totalAddedBalance);

                const colors = [
                    "#7086FD", "#FFAE4C", "#6FD195", "#00A3FF",
                    "#9B7DAA", "#32B5AC", "#0076B2", "#FF6384", "#FFA500"
                ].slice(0, labels.length);

                const ctx = document.getElementById("kartlarDoughnut");
                if (!ctx) return;

                const existingChart = Chart.getChart(ctx);
                if (existingChart) existingChart.destroy();

                new Chart(ctx.getContext("2d"), {
                    type: "doughnut",
                    data: { labels, datasets: [{ data: dataValues, backgroundColor: colors, hoverOffset: 4 }] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "80%",
                        plugins: { legend: { display: false } }
                    },
                    plugins: [{
                        id: "centerText",
                        afterDraw: function (chart) {
                            const { ctx, chartArea: { width, height } } = chart;
                            ctx.save();
                            const total = dataValues.reduce((a, b) => a + b, 0);
                            ctx.font = "400 12px Poppins";
                            ctx.fillStyle = "#1D222B80";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText("Toplam", width / 2, height / 2 - 20);
                            ctx.font = "600 22px Poppins";
                            ctx.fillStyle = "#1D222B";
                            ctx.fillText(total.toLocaleString("az-Latn-AZ") + " AZN", width / 2, height / 2 + 10);
                            ctx.restore();
                        }
                    }]
                });

                const legendDiv = document.getElementById("kartlarDoughnutLegend");
                if (legendDiv) {
                    legendDiv.innerHTML = labels.map((label, i) => `
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                            <span style="width:8px;height:8px;border-radius:50%;background-color:${colors[i]};flex-shrink:0;"></span>
                            <span class="text-[#1D222B80] text-[12px] font-normal">${label}</span>
                            <span class="text-[#1D222B] text-[12px] font-medium">${dataValues[i].toLocaleString("az-Latn-AZ")} AZN</span>
                        </div>
                    `).join("");
                }
            },
            error: function (xhr, status, error) { console.error("Artım Doughnut Xəta:", error); }
        });
    }

    // ------------ ARTIM LINE CHART ------------
    function loadArtimLineChart() {
        $.ajax({
            url: `/api/people/addedbalances/${peopleId}`,
            method: "POST",
            headers: { "Csrf-token": csrfToken },
            data: JSON.stringify(artimAppliedFilters),
            contentType: "application/json",
            success: function (res) {
                const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
                const colorPalette = ["#FFAE4C", "#6FD195", "#7086FD", "#9B7DAA", "#00A3FF", "#32B5AC", "#0076B2"];

                const datasets = res.data.map((item, i) => ({
                    label: item.cardName,
                    data: item.monthlyData,
                    borderColor: colorPalette[i % colorPalette.length],
                    backgroundColor: colorPalette[i % colorPalette.length] + "33",
                    borderWidth: 2,
                    tension: 0.4,
                    fill: "start",
                    pointRadius: 4
                }));

                const chartCanvas = document.getElementById("kartlarChart");
                if (!chartCanvas) return;

                const existingChart = Chart.getChart(chartCanvas);
                if (existingChart) existingChart.destroy();

                new Chart(chartCanvas.getContext("2d"), {
                    type: "line",
                    data: { labels: months, datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: val => {
                                        if (val === 0) return "0";
                                        if (val < 1000) return `${val} AZN`;
                                        return `${(val / 1000).toFixed(1)}K`;
                                    }
                                }
                            },
                            x: {
                                ticks: {
                                    callback: (val, index) => months[index].slice(0, 3)
                                }
                            }
                        }
                    }
                });

                const legendDiv = document.getElementById("kartlarChartLabels");
                if (legendDiv) {
                    legendDiv.innerHTML = '';
                    datasets.forEach(ds => {
                        const total = ds.data.reduce((a, b) => a + b, 0);
                        const div = document.createElement("div");
                        div.classList.add("text-center", "text-xs", "font-medium", "text-messages", "flex", "items-center", "justify-center", "gap-1");
                        div.innerHTML = `
                            <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${ds.borderColor}33">
                                <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${ds.borderColor}"></div>
                                <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${ds.borderColor}"></div>
                            </div>
                            <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${ds.label}</span>:
                            <span class="text-messages font-medium dark:text-[#FFFFFF]">${total.toLocaleString("az-Latn-AZ")} AZN</span>
                        `;
                        legendDiv.appendChild(div);
                    });
                }
            },
            error: function (e) { console.error("Artım Line Chart Xəta:", e); }
        });
    }

    loadArtimDoughnut();
    loadArtimLineChart();

    // ------------ ARTIM FİLTER RENDER ------------
    function renderArtimImtiyazlar(cards) {
        const container = document.getElementById("imtiyazlarList");
        if (!container) return;
        container.innerHTML = "";

        cards.forEach(card => {
            const label = document.createElement("label");
            label.className = "flex px-6 items-center gap-2 py-4 border-b border-[#0000001A] cursor-pointer text-[13px]";
            label.setAttribute("data-id", card._id);
            const isChecked = artimSelectedFilters.cardIds.includes(card._id) ? 'checked' : '';

            label.innerHTML = `
                <input type="checkbox" class="peer hidden" ${isChecked}>
                <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <span>${card.name}</span>
            `;
            container.appendChild(label);
        });
    }

    function renderArtimSirketler(sirkets) {
        const container = document.getElementById("sirketlerList");
        if (!container) return;
        container.innerHTML = "";

        sirkets.forEach(sirket => {
            const label = document.createElement("label");
            label.className = "flex px-6 items-center gap-2 py-4 border-b border-[#0000001A] cursor-pointer text-[13px]";
            label.setAttribute("data-id", sirket.id);
            const isChecked = artimSelectedFilters.sirketIds.includes(sirket.id) ? 'checked' : '';

            label.innerHTML = `
                <input type="checkbox" class="peer hidden" ${isChecked}>
                <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <span>${sirket.name}</span>
            `;
            container.appendChild(label);
        });
    }

    function populateArtimIller() {
        const illerList = document.getElementById("illerList");
        if (!illerList) return;
        illerList.innerHTML = "";

        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 8;

        for (let year = currentYear; year >= startYear; year--) {
            const label = document.createElement("label");
            label.className = "flex items-center gap-2 py-4 px-6 border-b border-[#0000001A] cursor-pointer text-[13px]";
            const isChecked = artimSelectedFilters.years.includes(year) ? 'checked' : '';

            label.innerHTML = `
                <input type="checkbox" value="${year}" class="peer hidden" ${isChecked}>
                <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <span>${year}</span>
            `;
            illerList.appendChild(label);
        }
    }

    // AJAX 
    $.ajax({
        url: '/api/people/imtiyaz-cards',
        method: 'POST',
        headers: { "Csrf-token": csrfToken },
        contentType: "application/json",
        data: JSON.stringify({ query: "" }),
        success: function (res) { renderArtimImtiyazlar(res.cards); },
        error: function (xhr, status, error) { console.error("Kartlar Xəta:", error); }
    });

    $.ajax({
        url: '/api/people/companies',
        method: 'GET',
        headers: { "Csrf-token": csrfToken },
        success: function (res) { renderArtimSirketler(res.data); },
        error: function (xhr, status, error) { console.error("Şirkətlər Xəta:", error); }
    });

    populateArtimIller();

    // Search input
    const searchInput = document.getElementById("searchİmtiyazlar");
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            $.ajax({
                url: '/api/people/imtiyaz-cards',
                method: 'POST',
                headers: { "Csrf-token": csrfToken },
                contentType: "application/json",
                data: JSON.stringify({ query: searchInput.value }),
                success: function (res) { renderArtimImtiyazlar(res.cards); },
                error: function (xhr, status, error) { console.error("Kartlar Xəta:", error); }
            });
        });
    }

    // ------------ ARTIM FİLTER FUNKSİYALARI ------------
    window.applyİmtiyazlarFilters1 = function () {
        artimSelectedFilters.cardIds = Array.from(document.querySelectorAll("#imtiyazlarList input:checked"))
            .map(cb => cb.closest("label")?.getAttribute("data-id"))
            .filter(id => id);

        const mainCheckbox = document.getElementById("kategpriyalar-imtiyaz-chx");
        if (mainCheckbox) mainCheckbox.checked = artimSelectedFilters.cardIds.length > 0;

        if (typeof closeİmtiyazlarDropdown === 'function') closeİmtiyazlarDropdown();
    };

    window.applySirketlerFilters = function () {
        artimSelectedFilters.sirketIds = Array.from(document.querySelectorAll("#sirketlerList input:checked"))
            .map(cb => cb.closest("label")?.getAttribute("data-id"))
            .filter(id => id);

        const mainCheckbox = document.getElementById("kategpriyalar-sirket-chx");
        if (mainCheckbox) mainCheckbox.checked = artimSelectedFilters.sirketIds.length > 0;

        if (typeof closeSirketlerDropdown === 'function') closeSirketlerDropdown();
    };

    window.applyIllerFilters = function () {
        artimSelectedFilters.years = Array.from(document.querySelectorAll("#illerList input:checked"))
            .map(cb => parseInt(cb.value))
            .filter(year => !isNaN(year));

        const mainCheckbox = document.getElementById("kategpriyalar-il-chx");
        if (mainCheckbox) mainCheckbox.checked = artimSelectedFilters.years.length > 0;

        if (typeof closeIllerDropdown === 'function') closeIllerDropdown();
    };

    //  ARTIM FİLTERLƏRİNİ TƏTBİQ
    window.applyArtimFilters = function () {
        artimAppliedFilters.cardIds = [...artimSelectedFilters.cardIds];
        artimAppliedFilters.sirketIds = [...artimSelectedFilters.sirketIds];
        artimAppliedFilters.years = [...artimSelectedFilters.years];

        loadArtimDoughnut();
        loadArtimLineChart();

        const popup = document.getElementById("artimPopUp");
        if (popup) popup.classList.add('hidden');
    };

    // ARTIM FİLTERLƏRİ TƏMİZLƏ
    window.clearArtimFilters = function () {
        document.querySelectorAll("#artimPopUp input[type='checkbox']").forEach(cb => cb.checked = false);

        artimSelectedFilters = { cardIds: [], sirketIds: [], years: [] };
        artimAppliedFilters = { cardIds: [], sirketIds: [], years: [] };

        const imtiyazChx = document.getElementById("kategpriyalar-imtiyaz-chx");
        const sirketChx = document.getElementById("kategpriyalar-sirket-chx");
        const ilChx = document.getElementById("kategpriyalar-il-chx");

        if (imtiyazChx) imtiyazChx.checked = false;
        if (sirketChx) sirketChx.checked = false;
        if (ilChx) ilChx.checked = false;

        loadArtimDoughnut();
        loadArtimLineChart();
    };

    // ============================================================
    // XƏRCLƏMƏ  CHART SİSTEMİ
    // ============================================================

    let xercSelectedFilters = {
        cardIds: [],
        sirketIds: [],
        muessiseIds: [],
        years: []
    };

    let xercAppliedFilters = {
        cardIds: [],
        sirketIds: [],
        muessiseIds: [],
        years: []
    };

    // ------------ XƏRCLƏMƏ DOUGHNUT CHART ------------
    function loadXercDoughnut() {
        $.ajax({
            url: `/api/people/xerclenenbalance/${peopleId}`,
            method: "POST",
            headers: { "Csrf-token": csrfToken },
            data: JSON.stringify(xercAppliedFilters),
            contentType: "application/json",
            success: function (res) {
                const chartData = res.doughnutData || res.data;
                const labels = chartData.map(d => d.cardName);
                const dataValues = chartData.map(d => d.totalAmount);

                const colors = [
                    "#7086FD", "#FFAE4C", "#6FD195", "#00A3FF",
                    "#9B7DAA", "#32B5AC", "#0076B2", "#FF6384", "#FFA500"
                ].slice(0, labels.length);

                const ctx = document.getElementById("kartlarMexaricDoughnut");
                if (!ctx) return;

                const existingChart = Chart.getChart(ctx);
                if (existingChart) existingChart.destroy();

                new Chart(ctx.getContext("2d"), {
                    type: "doughnut",
                    data: { labels, datasets: [{ data: dataValues, backgroundColor: colors, hoverOffset: 4 }] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "80%",
                        plugins: { legend: { display: false } }
                    },
                    plugins: [{
                        id: "centerText",
                        afterDraw: function (chart) {
                            const { ctx, chartArea: { width, height } } = chart;
                            ctx.save();
                            const total = dataValues.reduce((a, b) => a + b, 0);
                            ctx.font = "400 12px Poppins";
                            ctx.fillStyle = "#1D222B80";
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText("Toplam", width / 2, height / 2 - 20);
                            ctx.font = "600 22px Poppins";
                            ctx.fillStyle = "#1D222B";
                            ctx.fillText(total.toLocaleString("az-Latn-AZ") + " AZN", width / 2, height / 2 + 10);
                            ctx.restore();
                        }
                    }]
                });

                const legendDiv = document.getElementById("kartlarMexaricDoughnutLegend");
                if (legendDiv) {
                    legendDiv.innerHTML = labels.map((label, i) => `
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                            <span style="width:8px;height:8px;border-radius:50%;background-color:${colors[i]};flex-shrink:0;"></span>
                            <span class="text-[#1D222B80] text-[12px] font-normal">${label}</span>
                            <span class="text-[#1D222B] text-[12px] font-medium">${dataValues[i].toLocaleString("az-Latn-AZ")} AZN</span>
                        </div>
                    `).join("");
                }
            },
            error: function (xhr, status, error) { console.error("Xərcləmə Doughnut Xəta:", error); }
        });
    }

    // ------------ XƏRCLƏMƏ LINE CHART ------------
    function loadXercLineChart() {
        $.ajax({
            url: `/api/people/xerclenenbalance/${peopleId}`,
            method: "POST",
            headers: { "Csrf-token": csrfToken },
            data: JSON.stringify(xercAppliedFilters),
            contentType: "application/json",
            success: function (res) {
                const months = res.months || ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
                const colorPalette = ["#FFAE4C", "#6FD195", "#7086FD", "#9B7DAA", "#00A3FF", "#32B5AC", "#0076B2"];

                const chartData = res.lineChartData || res.data;
                const datasets = chartData.map((item, i) => ({
                    label: item.cardName,
                    data: item.data || item.monthlyData,
                    borderColor: colorPalette[i % colorPalette.length],
                    backgroundColor: colorPalette[i % colorPalette.length] + "33",
                    borderWidth: 2,
                    tension: 0.4,
                    fill: "start",
                    pointRadius: 4
                }));

                const chartCanvas = document.getElementById("mexaricChart");
                if (!chartCanvas) return;

                const existingChart = Chart.getChart(chartCanvas);
                if (existingChart) existingChart.destroy();

                new Chart(chartCanvas.getContext("2d"), {
                    type: "line",
                    data: { labels: months, datasets },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: val => {
                                        if (val === 0) return "0";
                                        if (val < 1000) return `${val} AZN`;
                                        return `${(val / 1000).toFixed(1)}K`;
                                    }
                                }
                            },
                            x: {
                                ticks: {
                                    callback: (val, index) => months[index].slice(0, 3)
                                }
                            }
                        }
                    }
                });

                const legendDiv = document.getElementById("mexaricChartLabels");
                if (legendDiv) {
                    legendDiv.innerHTML = '';
                    datasets.forEach(ds => {
                        const total = ds.data.reduce((a, b) => a + b, 0);
                        const div = document.createElement("div");
                        div.classList.add("text-center", "text-xs", "font-medium", "text-messages", "flex", "items-center", "justify-center", "gap-1");
                        div.innerHTML = `
                            <div class="relative overflow-hidden w-4 h-4 rounded-full flex items-center justify-center" style="background-color:${ds.borderColor}33">
                                <div class="border-[1px] border-white w-2 h-2 rounded-full z-1" style="background-color:${ds.borderColor}"></div>
                                <div class="w-full h-[2px] absolute top-1/2 -translate-y-1/2" style="background-color:${ds.borderColor}"></div>
                            </div>
                            <span class="text-tertiary-text font-normal dark:text-[#FFFFFF80]">${ds.label}</span>:
                            <span class="text-messages font-medium dark:text-[#FFFFFF]">${total.toLocaleString("az-Latn-AZ")} AZN</span>
                        `;
                        legendDiv.appendChild(div);
                    });
                }
            },
            error: function (e) { console.error("Xərcləmə Line Chart Xəta:", e); }
        });
    }

    loadXercDoughnut();
    loadXercLineChart();

    // ------------ XƏRCLƏMƏ FİLTER RENDER ------------
    function renderXercImtiyazlar(cards) {
        const container = document.getElementById("imtiyazlarXercList");
        if (!container) return;
        container.innerHTML = "";

        cards.forEach(card => {
            const label = document.createElement("label");
            label.className = "flex px-6 items-center gap-2 py-4 border-b border-[#0000001A] cursor-pointer text-[13px]";
            label.setAttribute("data-id", card._id);
            const isChecked = xercSelectedFilters.cardIds.includes(card._id) ? 'checked' : '';

            label.innerHTML = `
                <input type="checkbox" class="peer hidden" ${isChecked}>
                <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <span>${card.name}</span>
            `;
            container.appendChild(label);
        });
    }

    function populateXercIller() {
        const illerList = document.getElementById("illerXercList");
        if (!illerList) return;
        illerList.innerHTML = "";

        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 8;

        for (let year = currentYear; year >= startYear; year--) {
            const label = document.createElement("label");
            label.className = "flex items-center gap-2 py-4 px-6 border-b border-[#0000001A] cursor-pointer text-[13px]";
            const isChecked = xercSelectedFilters.years.includes(year) ? 'checked' : '';

            label.innerHTML = `
                <input type="checkbox" value="${year}" class="peer hidden" ${isChecked}>
                <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                    <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
                </div>
                <span>${year}</span>
            `;
            illerList.appendChild(label);
        }
    }
    function closeXercModal() {
        document.getElementById("xercPopUp").classList.add('hidden')
    }
    // AJAX 
    $.ajax({
        url: '/api/people/imtiyaz-cards',
        method: 'POST',
        headers: { "Csrf-token": csrfToken },
        contentType: "application/json",
        data: JSON.stringify({ query: "" }),
        success: function (res) { renderXercImtiyazlar(res.cards); },
        error: function (xhr, status, error) { console.error("Xərc Kartlar Xəta:", error); }
    });

    populateXercIller();

    // Search input
    const searchXercInput = document.getElementById("searchİmtiyazlarXerc");
    if (searchXercInput) {
        searchXercInput.addEventListener("keyup", function () {
            $.ajax({
                url: '/api/people/imtiyaz-cards',
                method: 'POST',
                headers: { "Csrf-token": csrfToken },
                contentType: "application/json",
                data: JSON.stringify({ query: searchXercInput.value }),
                success: function (res) { renderXercImtiyazlar(res.cards); },
                error: function (xhr, status, error) { console.error("Xərc Kartlar Xəta:", error); }
            });
        });
    }

    // ------------ XƏRCLƏMƏ FİLTER FUNKSİYALARI ------------
    window.applyImtiyazlarXercFilters = function () {
        xercSelectedFilters.cardIds = Array.from(document.querySelectorAll("#imtiyazlarXercList input:checked"))
            .map(cb => cb.closest("label")?.getAttribute("data-id"))
            .filter(id => id);

        const mainCheckbox = document.getElementById("kategpriyalar-imtiyaz-chx1");
        if (mainCheckbox) mainCheckbox.checked = xercSelectedFilters.cardIds.length > 0;

        if (typeof closeİmtiyazlarXercDropdown1 === 'function') closeİmtiyazlarXercDropdown1();
    };

    window.applyIllerXercFilters = function () {
        xercSelectedFilters.years = Array.from(document.querySelectorAll("#illerXercList input:checked"))
            .map(cb => parseInt(cb.value))
            .filter(year => !isNaN(year));

        const mainCheckbox = document.getElementById("kategpriyalar-il-chx1");
        if (mainCheckbox) mainCheckbox.checked = xercSelectedFilters.years.length > 0;
        if (typeof closeIllerXercDropdown1 === 'function') closeIllerXercDropdown1();
    };

    // XƏRCLƏMƏ FİLTERLƏRİNİ TƏTBİQI
    window.applyXercArtimFilters = function () {
        xercAppliedFilters.cardIds = [...xercSelectedFilters.cardIds];
        xercAppliedFilters.sirketIds = [...xercSelectedFilters.sirketIds];
        xercAppliedFilters.muessiseIds = [...xercSelectedFilters.muessiseIds];
        xercAppliedFilters.years = [...xercSelectedFilters.years];

        loadXercDoughnut();
        loadXercLineChart();

        const popup = document.getElementById("xercPopUp");
        if (popup) popup.classList.add('hidden');
    };

    window.clearXercFilters = function () {
        document.querySelectorAll("#xercPopUp input[type='checkbox']").forEach(cb => cb.checked = false);

        xercSelectedFilters = { cardIds: [], sirketIds: [], muessiseIds: [], years: [] };
        xercAppliedFilters = { cardIds: [], sirketIds: [], muessiseIds: [], years: [] };

        const imtiyazChx = document.getElementById("kategpriyalar-imtiyaz-chx1");
        const sirketChx = document.getElementById("kategpriyalar-sirket-chx1");
        const muessiseChx = document.getElementById("kategpriyalar-xercleme-chx1");
        const ilChx = document.getElementById("kategpriyalar-il-chx1");

        if (imtiyazChx) imtiyazChx.checked = false;
        if (sirketChx) sirketChx.checked = false;
        if (muessiseChx) muessiseChx.checked = false;
        if (ilChx) ilChx.checked = false;

        loadXercDoughnut();
        loadXercLineChart();
    };

    // ------------ XƏRCLƏMƏ FİLTER  (Şirkətlər) ------------
    // Xərcləmə üçün şirkətləri yüklə
    $.ajax({
        url: '/api/people/companies',
        method: 'GET',
        headers: { "Csrf-token": csrfToken },
        success: function (res) {
            renderXercSirketler(res.data);
        },
        error: function (xhr, status, error) {
            console.error("Xərc Şirkətlər Xəta:", error);
        }
    });
    function renderXercSirketler(sirkets) {
        const container = document.getElementById("sirketlerXercList");
        if (!container) return;
        container.innerHTML = "";

        sirkets.forEach(sirket => {
            const label = document.createElement("label");
            label.className = "flex px-6 items-center gap-2 py-4 border-b border-[#0000001A] cursor-pointer text-[13px]";
            label.setAttribute("data-id", sirket.id);
            const isChecked = xercSelectedFilters.sirketIds.includes(sirket.id) ? 'checked' : '';

            label.innerHTML = `
            <input type="checkbox" class="peer hidden" ${isChecked}>
            <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span>${sirket.name}</span>
        `;
            container.appendChild(label);
        });
    }
    // ------------ XƏRCLƏMƏ FİLTER FUNKSİYALARI  ------------
    window.applySirketlerXercFilters = function () {
        xercSelectedFilters.sirketIds = Array.from(document.querySelectorAll("#sirketlerXercList input:checked"))
            .map(cb => cb.closest("label")?.getAttribute("data-id"))
            .filter(id => id);

        const mainCheckbox = document.getElementById("kategpriyalar-sirket-chx1");
        if (mainCheckbox) mainCheckbox.checked = xercSelectedFilters.sirketIds.length > 0;

        if (typeof closeSirketlerXercDropdown1 === 'function') closeSirketlerXercDropdown1();
    };

    // ------------ XƏRCLƏMƏ FİLTER RENDER (Müəssisələr) ------------
    $.ajax({
        url: '/api/people/muessiseler',
        method: 'GET',
        headers: { "Csrf-token": csrfToken },
        success: function (res) {
            renderXercMuessiseler(res.data);
        },
        error: function (xhr, status, error) {
            console.error("Xərc Müəssisələr Xəta:", error);
        }
    });
    function renderXercMuessiseler(muessiseler) {
        const container = document.getElementById("xerclemeList");
        if (!container) return;
        container.innerHTML = "";

        muessiseler.forEach(muessise => {
            const label = document.createElement("label");
            label.className = "flex px-6 items-center gap-2 py-4 border-b border-[#0000001A] cursor-pointer text-[13px]";
            label.setAttribute("data-id", muessise._id);
            const isChecked = xercSelectedFilters.muessiseIds.includes(muessise._id) ? 'checked' : '';

            label.innerHTML = `
            <input type="checkbox" class="peer hidden" ${isChecked}>
            <div class="w-[18px] h-[18px] border border-surface-variant dark:border-surface-variant-dark rounded-[2px] flex items-center justify-center dark:bg-[#161E22] text-on-primary dark:text-side-bar-item-dark peer-checked:bg-primary dark:peer-checked:bg-primary-dark peer-checked:text-on-primary dark:peer-checked:text-on-primary-dark peer-checked:border-primary dark:peer-checked:border-primary-dark transition cursor-pointer">
                <div class="icon stratis-check-01 scale-60 h-[18px] w-[18px] text-center"></div>
            </div>
            <span>${muessise.muessise_name}</span>
        `;
            container.appendChild(label);
        });
    }
    // ------------ XƏRCLƏMƏ FİLTER FUNKSİYALARI (Müəssisələr) ------------
    window.applyXerclemeFilters = function () {
        xercSelectedFilters.muessiseIds = Array.from(document.querySelectorAll("#xerclemeList input:checked"))
            .map(cb => cb.closest("label")?.getAttribute("data-id"))
            .filter(id => id);

        const mainCheckbox = document.getElementById("kategpriyalar-xercleme-chx1");
        if (mainCheckbox) mainCheckbox.checked = xercSelectedFilters.muessiseIds.length > 0;

        if (typeof closeXerclemeDropdown1 === 'function') closeXerclemeDropdown1();
    };
    // Müəssisə axtarışı
    const searchXerclemeInput = document.getElementById("searchXercleme");
    if (searchXerclemeInput) {
        searchXerclemeInput.addEventListener("keyup", function () {
            const query = searchXerclemeInput.value.toLowerCase();
            const labels = document.querySelectorAll("#xerclemeList label");

            labels.forEach(label => {
                const text = label.textContent.toLowerCase();
                label.style.display = text.includes(query) ? "flex" : "none";
            });
        });
    }
    // XƏRCLƏMƏ FİLTERLƏRİ TƏMİZLƏ
    window.clearXerclemeFilters = function () {
        document.querySelectorAll("#xerclemeList input[type='checkbox']").forEach(cb => cb.checked = false);

        xercSelectedFilters.muessiseIds = [];

        const mainCheckbox = document.getElementById("kategpriyalar-xercleme-chx1");
        if (mainCheckbox) mainCheckbox.checked = false;

        console.log("Müəssisə filterləri təmizləndi");
    };
});