$(function initSlider() {
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: window.globalMaxAmount ?? 300000,
      values: [0, window.globalMaxAmount ?? 300000],
      slide: function(event, ui) {
        $("#min-value").text(formatCurrency(ui.values[0]));
        $("#max-value").text(formatCurrency(ui.values[1]));
      }
    });

    // Set initial values
    $("#min-value").text(formatCurrency($("#slider-range").slider("values", 0)));
    $("#max-value").text(formatCurrency($("#slider-range").slider("values", 1)));

    // Format numbers with thousand separators and decimals
    function formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value) + "  ₼";
    }
  });