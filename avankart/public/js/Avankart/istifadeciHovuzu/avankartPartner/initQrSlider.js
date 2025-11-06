// Global variables for QR slider
let qrGlobalMinAmount = 0;
let qrGlobalMaxAmount = 1000;
let qrCurrentMinAmount = 0;
let qrCurrentMaxAmount = 1000;

// Initialize QR slider when document is ready
$(document).ready(function () {
  // Initial slider setup with default values
  initQrSlider();

  // Note: We don't fetch range data here anymore
  // The central fetchWorkplaceData function in avankartPartnerQrTable.js 
  // will call updateQrSliderRange directly
});

// This function is no longer needed since data fetching is centralized
// Keeping a simplified version for backward compatibility
function fetchQrAmountRange() {
  console.log("fetchQrAmountRange is deprecated - data is now fetched by fetchWorkplaceData");
  // This function is now a no-op as the central fetchWorkplaceData handles the API call
}

// Function to initialize the QR slider
function initQrSlider() {
  console.log('Initializing QR slider with min:', qrGlobalMinAmount, 'max:', qrGlobalMaxAmount);

  // Check if slider element exists
  if ($("#qrTableSliderRange").length === 0) {
    console.error('Slider element #qrTableSliderRange not found');
    return;
  }

  // Check if jQuery UI is loaded
  if (typeof $.ui === 'undefined' || typeof $.ui.slider === 'undefined') {
    console.error('jQuery UI or slider component not loaded');
    return;
  }

  try {
    // Destroy existing slider if it exists
    if ($("#qrTableSliderRange").hasClass("ui-slider")) {
      $("#qrTableSliderRange").slider("destroy");
    }

    // Set default range if too small
    if (qrGlobalMaxAmount <= qrGlobalMinAmount) {
      qrGlobalMaxAmount = qrGlobalMinAmount + 1000;
    }

    // Get current filter values for slider initialization
    const minValue = qrCurrentMinAmount || qrGlobalMinAmount;
    const maxValue = qrCurrentMaxAmount || qrGlobalMaxAmount;

    // Apply some styling to make the slider more visible
    $("#qrTableSliderRange").css({
      'height': '4px',
      'background': '#E0E0E0',
      'border': 'none',
      'border-radius': '4px',
      'margin': '15px 0'
    });

    // Create slider
    $("#qrTableSliderRange").slider({
      range: true,
      min: qrGlobalMinAmount,
      max: qrGlobalMaxAmount,
      values: [minValue, maxValue],
      slide: function (event, ui) {
        updateQrSliderLabels(ui.values[0], ui.values[1]);
      },
      change: function (event, ui) {
        qrCurrentMinAmount = ui.values[0];
        qrCurrentMaxAmount = ui.values[1];
        console.log("Slider changed to:", ui.values[0], "-", ui.values[1]);
      }
    });

    // Style the slider handles
    $(".ui-slider-handle").css({
      'background': '#FFFFFF',
      'border': '2px solid #6750A4',
      'border-radius': '50%',
      'width': '16px',
      'height': '16px',
      'top': '-6px',
      'cursor': 'pointer',
      'outline': 'none'
    });

    // Style the slider range
    $(".ui-slider-range").css({
      'background': '#6750A4'
    });

    // Initialize labels
    updateQrSliderLabels(minValue, maxValue);
    console.log('QR Slider initialized successfully');
  } catch (error) {
    console.error('Error initializing QR slider:', error);
  }
}

// Function to update slider labels
function updateQrSliderLabels(min, max) {
  $("#qrTableMinValue").text(formatAmount(min) + " ₼");
  $("#qrTableMaxValue").text(formatAmount(max) + " ₼");
}

// Function to format amount with commas
function formatAmount(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function to update the QR slider with new min/max values
function updateQrSliderRange(min, max) {
  if (min !== undefined && max !== undefined) {
    qrGlobalMinAmount = min;
    qrGlobalMaxAmount = max;
    qrCurrentMinAmount = min;
    qrCurrentMaxAmount = max;

    // Reinitialize the slider
    initQrSlider();
  }
}

// Export function to global scope
window.initQrSlider = initQrSlider;
window.updateQrSliderRange = updateQrSliderRange;
