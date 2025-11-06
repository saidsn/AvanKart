$(function () {
  // Ждем, пока DOM полностью загрузится
  $(document).ready(function () {
    // Инициализация слайдера
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 300000,
      values: [0, 300000],
      slide: function (event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      },
      change: function (event, ui) {
        // При изменении слайдера автоматически обновляем таблицу
        console.log("Slider changed:", {
          min: ui.values[0],
          max: ui.values[1],
        });
        if (window.table && typeof window.table.ajax.reload === "function") {
          window.table.ajax.reload();
        }
      },
    });

    // Инициализация значений
    $("#min-value").text(
      formatCurrency($("#slider-range").slider("values", 0))
    );
    $("#max-value").text(
      formatCurrency($("#slider-range").slider("values", 1))
    );

    console.log(
      "Slider initialized with values:",
      $("#slider-range").slider("values")
    );

    // Проверяем, что слайдер правильно инициализирован
    setTimeout(() => {
      const values = $("#slider-range").slider("values");
      console.log("Slider values after initialization:", values);
      console.log("Min value element text:", $("#min-value").text());
      console.log("Max value element text:", $("#max-value").text());
    }, 100);
  });

  function formatCurrency(value) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + " ₼"
    );
  }
});
