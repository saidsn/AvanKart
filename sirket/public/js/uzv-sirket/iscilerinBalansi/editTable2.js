$(document).ready(function () {
  // Updated data structure to match the image
  const myData = [
    {
      id: "RO002",
      name: "Ramin Orucov",
      position: "UX Designer",
      cards: {
        mealCard: 200.0,
        fuelCard: 150.0,
        giftCard: 250.0,
        marketCard: 250.0,
        businessCard: 250.0,
        premiumCard: 250.0,
        carWashCard: 250.0,
      },
    },
    {
      id: "RO002",
      name: "Isa Sadiqli",
      position: "UX Designer",
      cards: {
        mealCard: 200.0,
        fuelCard: 150.0,
        giftCard: 250.0,
        marketCard: 250.0,
        businessCard: 250.0,
        premiumCard: 250.0,
        carWashCard: 250.0,
      },
    },
    {
      id: "RO002",
      name: "Haqverdi Mustafayev",
      position: "UX Designer",
      cards: {
        mealCard: 200.0,
        fuelCard: 150.0,
        giftCard: 250.0,
        marketCard: 250.0,
        businessCard: 250.0,
        premiumCard: 250.0,
        carWashCard: 250.0,
      },
    },
  ];
  var activeData = myData;

  var table = $("#myTable2").DataTable({
    paging: false,
    info: false,
    searching: false,
    ordering: false,
    dom: "t",
    data: activeData,
    columns: [
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.id}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.name}</span>`;
        },
      },
      {
        data: function (row) {
          return `<span class="text-[13px] text-messages dark:text-primary-text-color-dark font-normal">${row.position}</span>`;
        },
      },
      {
        data: function (row) {
          return `<div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden 
            focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] 
            focus-within:ring-0 focus-within:outline-none 
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300 
            hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        <input id="mealCard2" value="${row.cards.mealCard.toFixed(2)}" type="text"
                            placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0 
            text-[13px] text-messages dark:text-primary-text-color-dark 
            placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                        <div class="absolute right-3">
                            <div class="dark:text-primary-text-color-dark">
                                <span>₼</span>
                            </div>
                        </div>
                    </div>`;
        },
      },
      {
        data: function (row) {
          return `<div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden 
            focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] 
            focus-within:ring-0 focus-within:outline-none 
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300 
            hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        <input id="fuelCard2" value="${row.cards.fuelCard.toFixed(2)}" type="text"
                            placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0 
            text-[13px] text-messages dark:text-primary-text-color-dark 
            placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                        <div class="absolute right-3">
                            <div class="dark:text-primary-text-color-dark">
                                <span>₼</span>
                            </div>
                        </div>
                    </div>`;
        },
      },
      {
        data: function (row) {
          return `<div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden 
            focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] 
            focus-within:ring-0 focus-within:outline-none 
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300 
            hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        <input id="giftCard2" value="${row.cards.giftCard.toFixed(2)}" type="text"
                            placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0 
            text-[13px] text-messages dark:text-primary-text-color-dark 
            placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                        <div class="absolute right-3">
                            <div class="dark:text-primary-text-color-dark">
                                <span>₼</span>
                            </div>
                        </div>
                    </div>`;
        },
      },
      {
        data: function (row) {
          return `<div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden 
            focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] 
            focus-within:ring-0 focus-within:outline-none 
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300 
            hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        <input id="marketCard2" value="${row.cards.marketCard.toFixed(2)}" type="text"
                            placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0 
            text-[13px] text-messages dark:text-primary-text-color-dark 
            placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                        <div class="absolute right-3">
                            <div class="dark:text-primary-text-color-dark">
                                <span>₼</span>
                            </div>
                        </div>
                    </div>`;
        },
      },
      {
        data: function (row) {
          return `<div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden
            focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            focus-within:ring-0 focus-within:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300
            hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        <input id="businessCard2" value="${row.cards.businessCard.toFixed(2)}" type="text"
                            placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0
            text-[13px] text-messages dark:text-primary-text-color-dark
            placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                        <div class="absolute right-3">
                            <div class="dark:text-primary-text-color-dark">
                                <span>₼</span>
                            </div>
                        </div>
                    </div>`;
        },
      },
      {
        data: function (row) {
          return `<div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden
            focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            focus-within:ring-0 focus-within:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300
            hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        <input id="premiumCard2" value="${row.cards.premiumCard.toFixed(2)}" type="text"
                            placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0
            text-[13px] text-messages dark:text-primary-text-color-dark
            placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                        <div class="absolute right-3">
                            <div class="dark:text-primary-text-color-dark">
                                <span>₼</span>
                            </div>
                        </div>
                    </div>`;
        },
      },
      {
        data: function (row) {
          return `<div class="relative flex items-center border border-surface-variant dark:border-surface-variant-dark rounded-full overflow-hidden
            focus-within:border-focus focus-within:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            focus-within:ring-0 focus-within:outline-none
            active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)]
            transition-all ease-out duration-300
            hover:bg-input-hover dark:hover:bg-input-hover-dark">
                        <input id="carWashCard2" value="${row.cards.carWashCard.toFixed(2)}" type="text"
                            placeholder="Məbləği daxil edin" class="w-full h-full bg-transparent border-none focus:outline-none outline-none ring-0 focus:ring-0
            text-[13px] text-messages dark:text-primary-text-color-dark
            placeholder:text-on-surface-variant-dark dark:placeholder:text-[#636B6F]">
                        <div class="absolute right-3">
                            <div class="dark:text-primary-text-color-dark">
                                <span>₼</span>
                            </div>
                        </div>
                    </div>`;
        },
      },
      {
        data: function (row, type, set, meta) {
          const eyeClass = row.isHidden ? "iconex-hide-1" : "iconex-eye-1";
          const eyeOpacity = row.isHidden ? "opacity-30" : "opacity-100";

          return `
            <div class="flex justify-center">
              <span id="eye2-${meta.row}" onclick="toggleRowVisibility2(${meta.row})"
                    class="icon ${eyeClass} cursor-pointer text-messages dark:text-primary-text-color-dark ${eyeOpacity} !w-[18px] !h-[18px]"></span>
            </div>
          `;
        },
        width: "60px",
      },
    ],
    order: [],
    lengthChange: false,

    createdRow: function (row, data, dataIndex) {
      // Apply red line through effect if row is hidden
      if (data.isHidden) {
        $(row).addClass("row-hidden");
        $(row).css({
          position: "relative",
        });
      }

      // Hover effect
      $(row)
        .css("transition", "background-color 0.2s ease")
        .on("mouseenter", function () {
          if (!data.isHidden) {
            const isDark = $("html").hasClass("dark");
            $(this).css("background-color", isDark ? "#242c30" : "#f6f6f6");
          }
        })
        .on("mouseleave", function () {
          $(this).css("background-color", "");
        });

      // Border styling
      $(row)
        .find("td")
        .addClass("border-b-[.5px] border-stroke dark:border-[#FFFFFF1A]");

      // Last column (eye column) styling with left border
      $(row)
        .find("td:last-child")
        .addClass("border-l-[.5px] border-stroke dark:border-[#FFFFFF1A]");

      // Add red line overlay that crosses the entire row AFTER row creation
      if (data.isHidden) {
        setTimeout(() => {
          const tableWidth = $("#myTable2").outerWidth();
          $(row).append(`
            <div style="position: absolute; top: 50%; left: 0; width: ${tableWidth}px; height: 2px; background-color: #ef4444; z-index: 1000; pointer-events: none; transform: translateY(-50%);"></div>
          `);
        }, 10);
      }
    },

    initComplete: function () {
      // Add left border to last header column
      $("#myTable2 thead th:last-child").css({
        "border-left": "0.5px solid var(--table-border-color)",
      });

      // Filter icons
      $("#myTable2 thead th.filtering").each(function () {
        $(this).html(
          '<div class="custom-header flex gap-2.5 items-center"><div>' +
            $(this).text() +
            '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-on-primary-dark"></div></div>'
        );
      });

      // Set table2 reference for global access
      window.table2 = table;
    },

    drawCallback: function () {
      const colCount = $("#myTable2 thead th").length;
      const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
      $("#myTable2 tbody").prepend(spacerRow);

      // Last row border
      const $lastRow = $("#myTable2 tbody tr:not(.spacer-row):last");
      $lastRow.find("td").css({
        "border-bottom": "0.5px solid var(--table-border-color)",
      });

      // Add left border to last column of last row
      $lastRow.find("td:last-child").css({
        "border-left": "0.5px solid var(--table-border-color)",
      });
    },
  });

  // Search functionality (if needed)
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Toggle row visibility function
  window.toggleRowVisibility2 = function (rowIndex) {
    const data = table.row(rowIndex).data();
    data.isHidden = !data.isHidden;

    // Update the data in the table
    table.row(rowIndex).data(data).draw(false);

    // Add red line for hidden rows after redraw
    if (data.isHidden) {
      setTimeout(() => {
        const row = table.row(rowIndex).node();
        const $row = $(row);
        const tableWidth = $("#myTable2").outerWidth();
        const rowHeight = $row.outerHeight();

        $row.find(".red-line").remove(); // Remove existing line
        $row.css("position", "relative");

        $row.append(`
          <div class="red-line" style="
            position: absolute;
            top: ${rowHeight / 2}px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #ef4444;
            z-index: 1000;
            pointer-events: none;
            transform: translateY(-1px);"></div>
        `);
      }, 50);
    } else {
      // Remove red line when showing row
      const row = table.row(rowIndex).node();
      $(row).find(".red-line").remove();
    }
  };
});