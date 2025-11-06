$(document).ready(function () {
  // Current active tab
  let currentMainTab = "emekdaslar";
  let currentSubTab = "aktiv";
  let selectionMode = false;
  let excelDataTable = null;

  const aktivData = [
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Product Designer",
      department: "Layihə rəhbərləri",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      status: "Gözləyir",
    },
    {
      name: "Tofiq Əliyev",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Mühasib",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      status: "Rədd edilib",
    },
    {
      name: "Musa Musayev",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Baş mühasib",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
    {
      name: "Əli İsmayilov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Mühasib",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
    {
      name: "Jale Ağayeva",
      id: "AP-XXXXXXXXXX",
      gender: "Qadın",
      position: "Kiçik mühasib",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
    {
      name: "Musa Musayev",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Android Developer",
      department: "İdarə heyəti",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
    {
      name: "Jale Ağayeva",
      id: "AP-XXXXXXXXXX",
      gender: "Qadın",
      position: "IT mütəxəssis",
      department: "İdarə heyəti",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
    {
      name: "Tofiq Əliyev",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Mühasib",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
    },
  ];

  // Verilənlər - İşdən ayrılanlar
  const ayrilanlarData = [
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
    {
      name: "Ramin Orucov",
      id: "AP-XXXXXXXXXX",
      gender: "Kişi",
      position: "Designer",
      department: "Mühasiblər",
      email: "ramin.orucvvv@gmail.com",
      phone: "+994 50 770 35 22",
      start: "01.12.2021",
      endDate: "01.12.2023",
      type: "ayrilan",
    },
  ];

  const imtiyazData = [
    {
      name: "Mühasiblər",
      count: 12,
      createdDate: "02.12.2024 - 09:45",
    },
    {
      name: "Layihə rəhbərləri",
      count: 6,
      createdDate: "02.12.2024 - 09:45",
    },
    {
      name: "İdarə heyəti",
      count: 24,
      createdDate: "02.12.2024 - 09:45",
    },
  ];

  const vezifeData = [
    {
      name: "Mühasib",
      employees: 24,
      creator: "Ramin Orucov",
      createdDate: "02.12.2024",
    },
    {
      name: "Direktor",
      employees: 24,
      creator: "Fuad Bayramov",
      createdDate: "02.12.2024",
    },
    {
      name: "Sürücü",
      employees: 24,
      creator: "Ramin Orucov",
      createdDate: "02.12.2024",
    },
    {
      name: "İnsan Resursları mütəxəssisi",
      employees: 24,
      creator: "Fuad Bayramov",
      createdDate: "02.12.2024",
    },
  ];

  // Initialize tables
  let emekdaslarTable, imtiyazTable, vezifeTable;
  let activeData = aktivData;

  // Selection control functions
  function updateSelectionCount() {
    let selectedCount = 0;
    let totalCount = 0;

    if (currentMainTab === "emekdaslar") {
      const checkboxes = $('#myTable tbody input[type="checkbox"]');
      totalCount = checkboxes.length;
      selectedCount = checkboxes.filter(":checked").length;
    } else if (currentMainTab === "imtiyaz") {
      const checkboxes = $('#myTableImtiyaz tbody input[type="checkbox"]');
      totalCount = checkboxes.length;
      selectedCount = checkboxes.filter(":checked").length;
    } else if (currentMainTab === "vezife") {
      const checkboxes = $('#myTableVezife tbody input[type="checkbox"]');
      totalCount = checkboxes.length;
      selectedCount = checkboxes.filter(":checked").length;
    }

    $("#selected-count").text(selectedCount);

    // Update selection mode
    const newSelectionMode = selectedCount > 0;
    if (newSelectionMode !== selectionMode) {
      selectionMode = newSelectionMode;
      updateUIForSelectionMode();
    }
  }

  function updateUIForSelectionMode() {
    if (selectionMode) {
      // Hide main tabs
      $("#main-tabs").hide();

      // Show selection controls
      $("#selection-controls").show();

      // Update buttons container based on current tab
      if (currentMainTab === "emekdaslar") {
        // For emekdaslar, hide sub-tabs and most buttons, add balance and excel to selection area
        updateButtonsContainerForSelection("emekdaslar");
      } else if (currentMainTab === "imtiyaz" || currentMainTab === "vezife") {
        // For imtiyaz and vezife, hide all buttons
        updateButtonsContainerForSelection("other");
      }
    } else {
      // Show main tabs
      $("#main-tabs").show();

      // Hide selection controls
      $("#selection-controls").hide();

      // Clear additional buttons
      $("#selection-additional-buttons").empty();

      // Restore normal buttons
      updateButtonsContainer();
    }
  }

  function updateButtonsContainerForSelection(tableType) {
    const buttonsContainer = $("#buttonsContainer");
    const additionalButtonsContainer = $("#selection-additional-buttons");

    if (tableType === "emekdaslar") {
      // Hide all original buttons
      buttonsContainer.empty();

      // Add balance and excel buttons to selection controls area
      if (currentSubTab === "aktiv") {
        additionalButtonsContainer.html(`
          <div class="h-[34px] rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white cursor-pointer" onclick="openBalancePopup()">
            <div class="icon stratis-card-add !w-[12px] !h-[9px] text-messages hover:text-messages dark:text-white"></div>
            <span class="text-[13px] font-medium">Seçilənlərin balansını artır</span>
          </div>
          <div class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white cursor-pointer" onclick="exportSelectedToExcel()">
            <img src="/images/uzv-sirket/isciler/excelIcon.svg" alt="Excel icon">
            <span class="text-xs font-medium">Seçilənləri Excelə çıxart</span>
          </div>
        `);
      } else {
        // For ayrilan tab, only show excel button
        additionalButtonsContainer.html(`
          <div class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white cursor-pointer" onclick="exportSelectedToExcel()">
            <img src="/images/uzv-sirket/isciler/excelIcon.svg" alt="Excel icon">
            <span class="text-xs font-medium">Seçilənləri Excelə çıxart</span>
          </div>
        `);
      }
    } else {
      // For imtiyaz and vezife, show only excel export button
      buttonsContainer.empty();
      additionalButtonsContainer.html(`
        <div class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white cursor-pointer" onclick="exportSelectedToExcel()">
          <img src="/images/uzv-sirket/isciler/excelIcon.svg" alt="Excel icon">
          <span class="text-xs font-medium">Seçilənləri Excelə çıxart</span>
        </div>
      `);
    }
  }

  // Selection control button handlers
  function setupSelectionControls() {
    $("#select-all-btn")
      .off("click")
      .on("click", function () {
        if (currentMainTab === "emekdaslar") {
          $('#myTable tbody input[type="checkbox"]').prop("checked", true);
          $("#newCheckbox").prop("checked", true).prop("indeterminate", false);
        } else if (currentMainTab === "imtiyaz") {
          $('#myTableImtiyaz tbody input[type="checkbox"]').prop(
            "checked",
            true
          );
          $("#newCheckboxImtiyaz")
            .prop("checked", true)
            .prop("indeterminate", false);
        } else if (currentMainTab === "vezife") {
          $('#myTableVezife tbody input[type="checkbox"]').prop(
            "checked",
            true
          );
          $("#newCheckboxVezife")
            .prop("checked", true)
            .prop("indeterminate", false);
        }
        updateSelectionCount();
      });

    $("#clear-selection-btn")
      .off("click")
      .on("click", function () {
        if (currentMainTab === "emekdaslar") {
          $('#myTable tbody input[type="checkbox"]').prop("checked", false);
          $("#newCheckbox").prop("checked", false).prop("indeterminate", false);
        } else if (currentMainTab === "imtiyaz") {
          $('#myTableImtiyaz tbody input[type="checkbox"]').prop(
            "checked",
            false
          );
          $("#newCheckboxImtiyaz")
            .prop("checked", false)
            .prop("indeterminate", false);
        } else if (currentMainTab === "vezife") {
          $('#myTableVezife tbody input[type="checkbox"]').prop(
            "checked",
            false
          );
          $("#newCheckboxVezife")
            .prop("checked", false)
            .prop("indeterminate", false);
        }
        updateSelectionCount();
      });
  }

  // Function to handle select all checkboxes
  function setupSelectAllCheckboxes() {
    // For Emekdaslar table
    $("#newCheckbox")
      .off("change")
      .on("change", function () {
        const isChecked = $(this).is(":checked");
        const currentTableBody = $("#myTable tbody");

        // Select/deselect all checkboxes in the current table
        currentTableBody.find('input[type="checkbox"]').each(function () {
          $(this).prop("checked", isChecked);
        });
        updateSelectionCount();
      });

    // For Imtiyaz table
    $("#newCheckboxImtiyaz")
      .off("change")
      .on("change", function () {
        const isChecked = $(this).is(":checked");
        const currentTableBody = $("#myTableImtiyaz tbody");

        // Select/deselect all checkboxes in the current table
        currentTableBody.find('input[type="checkbox"]').each(function () {
          $(this).prop("checked", isChecked);
        });
        updateSelectionCount();
      });

    // For Vezife table
    $("#newCheckboxVezife")
      .off("change")
      .on("change", function () {
        const isChecked = $(this).is(":checked");
        const currentTableBody = $("#myTableVezife tbody");

        // Select/deselect all checkboxes in the current table
        currentTableBody.find('input[type="checkbox"]').each(function () {
          $(this).prop("checked", isChecked);
        });
        updateSelectionCount();
      });

    // Handle individual checkbox changes to update header checkbox state
    function updateHeaderCheckbox(tableId, headerCheckboxId) {
      const $tableBody = $(`#${tableId} tbody`);
      const $headerCheckbox = $(`#${headerCheckboxId}`);
      const totalCheckboxes = $tableBody.find('input[type="checkbox"]').length;
      const checkedCheckboxes = $tableBody.find(
        'input[type="checkbox"]:checked'
      ).length;

      if (checkedCheckboxes === 0) {
        $headerCheckbox.prop("checked", false);
        $headerCheckbox.prop("indeterminate", false);
      } else if (checkedCheckboxes === totalCheckboxes) {
        $headerCheckbox.prop("checked", true);
        $headerCheckbox.prop("indeterminate", false);
      } else {
        $headerCheckbox.prop("checked", false);
        $headerCheckbox.prop("indeterminate", true);
      }
    }

    // Add event listeners for individual checkboxes
    $(document)
      .off("change", 'input[id^="cb-active-"]')
      .on("change", 'input[id^="cb-active-"]', function () {
        updateHeaderCheckbox("myTable", "newCheckbox");
        updateSelectionCount();
      });

    $(document)
      .off("change", 'input[id^="cb-imtiyaz-"]')
      .on("change", 'input[id^="cb-imtiyaz-"]', function () {
        updateHeaderCheckbox("myTableImtiyaz", "newCheckboxImtiyaz");
        updateSelectionCount();
      });

    $(document)
      .off("change", 'input[id^="cb-vezife-"]')
      .on("change", 'input[id^="cb-vezife-"]', function () {
        updateHeaderCheckbox("myTableVezife", "newCheckboxVezife");
        updateSelectionCount();
      });
  }

  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  function getEmekdaslarFilters() {
    const form = $("#filterForm3");
    const genders = [];
    form.find('input[name="gender[]"]:checked').each(function () {
      genders.push($(this).val());
    });
    return {
      start_date: form.find('input[name="start_date"]').val() || "",
      end_date: form.find('input[name="end_date"]').val() || "",
      genders,
      search: $("#customSearchEmekdaslar").val() || "",
      tab: typeof currentSubTab !== "undefined" ? currentSubTab : "aktiv",
    };
  }

  function bindEmekdaslarFilterEvents() {
    $("#filterApply3")
      .off("click")
      .on("click", function () {
        if (emekdaslarTable) emekdaslarTable.draw();
        openFilterModal();
      });
    $("#filterReset3")
      .off("click")
      .on("click", function () {
        resetFilter3();
      });
  }

  window.resetFilter3 = function () {
    const form = $("#filterForm3");
    form[0].reset();
    form
      .find('input[name="gender[]"]')
      .prop("checked", false)
      .trigger("change");
    $("#start_date").val("");
    $("#end_date").val("");
    if (emekdaslarTable) emekdaslarTable.draw();
  };

  function initializeEmekdaslarTable() {
    if (emekdaslarTable) {
      emekdaslarTable.destroy();
    }

    emekdaslarTable = $("#myTable").DataTable({
      paging: true,
      info: false,
      dom: "t",
      serverSide: true,
      processing: true,
      ajax: {
        url: "/people/avankart-people",
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        data: function (d) {
          const f = getEmekdaslarFilters();
          d.start_date = f.start_date;
          d.end_date = f.end_date;
          d.genders = f.genders;
          d.search = f.search;
          d.tab = f.tab;
          d.category = currentSubTab === "aktiv" ? "current" : "old";
          return d;
        },
        dataSrc: function (json) {
          console.log(json.data);
          return json.data || [];
        },
      },
      columns: [
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            const employeeId = row._id || row.id || '';
            return `
            <input type="checkbox" id="cb-active-${idx}" data-employee-id="${employeeId}" class="peer hidden">
            <label for="cb-active-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:text-on-primary dark:peer-checked:text-primary-text-color-dark peer-checked:border-primary dark:peer-checked:border-primary transition">
              <div class="icon stratis-check-01 scale-60"></div>
            </label>
          `;
          },
        },
        {
          data: function (row) {
            const initials = (row.fullname || "")
              .split(" ")
              .map((w) => w[0])
              .join("");
            return `
              <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-[#7450864D] text-primary text-[16px] flex items-center justify-center font-semibold">
                ${initials}
              </div>
              <div class="flex flex-col">
                <span class="text-messages text-[13px] font-medium dark:text-white">${row.fullname || ""
              }</span>
                <span class="text-secondary-text text-[11px] font-normal dark:text-white">ID: ${row.id || ""
              }</span>
              </div>
            </div>
          `;
          },
        },
        {
          data: "gender",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${d || ""
            }</span>`,
        },
        {
          data: "duty",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${d || ""
            }</span>`,
        },
        {
          data: "permission",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${d || ""
            }</span>`,
        },
        {
          data: "email",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${d || ""
            }</span>`,
        },
        {
          data: "phoneNumber",
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${d || ""
            }</span>`,
        },
        {
          data: null,
          render: function (data, type, row) {
            if (row.status) {
              let color = "";
              switch (row.status) {
                case "Aktiv":
                  color = "bg-[#4FC3F7]";
                  break;
                case "Qaralama":
                  color = "bg-[#BDBDBD]";
                  break;
                case "Tamamlandı":
                  color = "bg-[#66BB6A]";
                  break;
                case "Gözləyir":
                  color = "bg-[#FFCA28]";
                  break;
                case "Report edildi":
                case "Rədd edilib":
                  color = "bg-[#EF5350]";
                  break;
                default:
                  color = "bg-[#FF7043]";
              }
              return `
              <div class="flex items-center justify-start bg-container-2 dark:bg-container-2-dark px-3 py-[5px] rounded-full w-fit max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                <span class="w-[6px] h-[6px] rounded-full ${color} shrink-0 mr-2"></span>
                <span class="text-[13px] text-messages dark:text-primary-text-color-dark font-medium">${row.status}</span>
              </div>
            `;
            }
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${row.hireDate || ""
              }</span>`;
          },
        },
        {
          data: "endDate",
          visible: false,
          render: (d) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${d || ""
            }</span>`,
        },
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const rowIndex = meta.row;
            return createDropdown(rowIndex, "emekdaslar");
          },
        },
      ],
      order: [],
      lengthChange: false,
      pageLength: 5,
      createdRow: function (row, data, dataIndex) {
        styleTableRow(row, dataIndex, "emekdaslar", data);
      },
      initComplete: function () {
        styleTableHeader("#myTable");
        setupSelectAllCheckboxes();
        bindEmekdaslarFilterEvents();
        let searchTimeout;
        $("#customSearchEmekdaslar")
          .off("keyup")
          .on("keyup", function () {
            clearTimeout(searchTimeout);
            const value = this.value;

            searchTimeout = setTimeout(() => {
              emekdaslarTable.search(value).draw();
            }, 300); // 300ms bekleme süresi
          });
      },
      drawCallback: function () {
        handleTableDraw(this.api(), "#customPagination");
        $("#newCheckbox").prop("checked", false).prop("indeterminate", false);
        setupSelectAllCheckboxes();
        updateSelectionCount();
      },
    });

    // Make emekdaslarTable globally accessible
    window.emekdaslarTable = emekdaslarTable;
  }

  // Initialize Imtiyaz table
  function initializeImtiyazTable() {
    if (imtiyazTable) imtiyazTable.destroy();

    imtiyazTable = $("#myTableImtiyaz").DataTable({
      paging: false,
      info: false,
      dom: "t",
      processing: true,
      serverSide: true,
      ajax: {
        url: "/muessise-info/show-imtiyaz",
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        contentType: "application/json",
        data: function (d) {
          return JSON.stringify({
            draw: d.draw,
            start: d.start,
            length: d.length || 10,
            search: d.search?.value || "",
            order: d.order || [],
            columns: (d.columns || []).map((c) => ({ data: c.data })),
          });
        },
        dataSrc: function (json) {
          console.log(json.data);
          return json?.data || [];
        },
      },
      columns: [
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const idx = meta.row;
            const itemId = row._id || row.id || '';
            return `
            <input type="checkbox" id="cb-imtiyaz-${idx}" data-employee-id="${itemId}" class="peer hidden">
            <label for="cb-imtiyaz-${idx}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:text-on-primary dark:peer-checked:text-primary-text-color-dark peer-checked:border-primary dark:peer-checked:border-primary transition">
              <div class="icon stratis-check-01 scale-60"></div>
            </label>
          `;
          },
        },
        {
          data: "groupName",
          render: (v) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${v ?? ""
            }</span>`,
        },
        {
          data: "memberCount",
          render: (v) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${v ?? ""
            }</span>`,
        },
        {
          data: "createdDate",
          render: (v) =>
            `<span class="text-[13px] text-messages font-normal dark:text-white">${v ?? ""
            }</span>`,
        },
        {
          orderable: false,
          data: function (row, type, set, meta) {
            const rowIndex = meta.row;
            return createDropdown(rowIndex, "imtiyaz");
          },
        },
      ],
      order: [],
      lengthChange: false,
      createdRow: function (row, data, dataIndex) {
        styleTableRow(row, dataIndex, "imtiyaz");
      },
      initComplete: function () {
        styleTableHeader("#myTableImtiyaz");
        fixLastRowBorder("#myTableImtiyaz");
        setupSelectAllCheckboxes();

        $("#customSearchImtiyaz")
          .off("keyup")
          .on("keyup", function () {
            imtiyazTable.search(this.value).draw();
          });
      },
    });
  }

  // Initialize Vezife table
  function initializeVezifeTable() {
    if (vezifeTable && typeof vezifeTable.destroy === "function") {
      vezifeTable.destroy();
    }

    vezifeTable = $("#myTableVezife").DataTable({
      serverSide: true,
      processing: true,
      dom: "t",
      paging: false,
      info: false,
      order: [],
      ajax: {
        url: "/rbac/show-duties",
        type: "POST",
        headers: { "CSRF-Token": csrfToken },
        dataSrc: (json) => {
          console.log("Gələn data:", json);

          return json?.data || [];
        },
      },
      columns: [
        {
          orderable: false,
          data: (row, type, set, meta) => {
            const itemId = row._id || row.id || '';
            return `
          <input type="checkbox" id="cb-vezife-${meta.row}" data-employee-id="${itemId}" class="peer hidden">
          <label for="cb-vezife-${meta.row}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:text-on-primary dark:peer-checked:text-primary-text-color-dark peer-checked:border-primary dark:peer-checked:border-primary transition">
            <div class="icon stratis-check-01 scale-60"></div>
          </label>
        `;
          },
        },
        {
          data: "roleName",
          render: (v) =>
            `<span class="text-[13px] text-messages dark:text-white">${v ?? ""}</span>`,
        },
        {
          data: "membersInRole",
          render: (v) =>
            `<span class="text-[13px] text-messages dark:text-white">${v ?? ""}</span>`,
        },
        {
          data: "createdBy",
          render: (v) =>
            `<span class="text-[13px] text-messages dark:text-white">${v ?? ""}</span>`,
        },
        {
          data: "createdDate",
          render: (v) =>
            `<span class="text-[13px] text-messages dark:text-white">${v ?? ""}</span>`,
        },
        {
          orderable: false,
          data: (_row, _type, _set, meta) => createDropdown(meta.row, "vezife"),
        },
      ],
      createdRow: (row, data, dataIndex) => {
        styleTableRow(row, dataIndex, "vezife");
      },
      initComplete: () => {
        styleTableHeader("#myTableVezife");
        fixLastRowBorder("#myTableVezife");
        setupSelectAllCheckboxes();
        $("#customSearchVezife")
          .off("keyup")
          .on("keyup", function () {
            vezifeTable.search(this.value).draw();
          });
      },
    });
  }

  function fixLastRowBorder(tableSelector) {
    const isDarkMode = document.documentElement.classList.contains("dark");
    const borderColor = isDarkMode ? "#40484c" : "#E0E0E0";

    const $lastRow = $(`${tableSelector} tbody tr:last`);
    $lastRow.find("td").css({
      "border-bottom": `0.5px solid ${borderColor}`,
    });
    $lastRow.find("td:first-child").css({
      "border-right": `0.5px solid ${borderColor}`,
    });
    $lastRow.find("td:last-child").css({
      "border-left": `0.5px solid ${borderColor}`,
    });
  }

  // Create dropdown based on table type
  function createDropdown(rowIndex, tableType) {
    return `
     <div class="flex">
       <div class="relative inline-block text-left">
            <div onclick="toggleDropdown(this, ${rowIndex}, '${tableType}')" class="icon stratis-dot-vertical text-messages dark:text-primary-text-color-dark w-5 h-5 cursor-pointer"></div>
            <div class="dropdown-menu absolute right-[-12px] w-[122px] z-50 hidden" id="dropdown-${tableType}-${rowIndex}">
              <div class="relative h-[8px]">
                  <div class="absolute top-1/2 right-4 w-3 h-3 bg-white dark:bg-menu-dark rotate-45 border-l border-t border-white dark:border-menu-dark z-50"
                  style="box-shadow: -2px 0px 3px rgba(0,0,0,0.05), 2px 0px 3px rgba(0,0,0,0.05);"></div>
              </div>
              <div style="box-shadow: 0px 0px 0px rgba(0,0,0,0.1), 0px 2px 2px rgba(0,0,0,0.1);" class="w-[122px] rounded-[8px] shadow-lg bg-white dark:bg-menu-dark overflow-hidden relative z-50">
                  <div class="py-[3.5px] text-[13px]">
                      <div class="text-messages dark:text-primary-text-color-dark flex flex-col gap-1 cursor-pointer" id="dropdown-content-${tableType}-${rowIndex}">
                          <!-- Content will be dynamically updated -->
                      </div>
                  </div>
              </div>
            </div>
        </div>
     </div>
      `;
  }

  // Update dropdown content based on table type
  function updateDropdownContent(rowIndex, tableType, rowData) {
    const dropdownContent = $(`#dropdown-content-${tableType}-${rowIndex}`);

    if (tableType === "emekdaslar") {
      // Get MongoDB ObjectId from row data
      const objectId = rowData?.objectId || rowData?._id || rowData?.id || '';

      if (currentSubTab === "aktiv") {
        dropdownContent.html(`
          <span onclick="openEditPopup('${objectId || ''}')" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal">
            <div class="icon stratis-edit-02 text-messages dark:text-primary-text-color-dark w-4 h-4"></div>
            <span>Redaktə et</span>
          </span>
          <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal" onclick="openBalancePopup('${objectId || ''}')">
            <div class="icon stratis-card-add text-messages dark:text-primary-text-color-dark w-4 h-4"></div>
            <span>Balansı artır</span>
          </div>
          <div class="border-t dark:border-surface-variant-dark"></div>
          <div class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[#DD3838] hover:bg-error-hover dark:hover:bg-error-hover-dark text-[13px] font-normal" onclick="openDeleteInvoiceModal('${objectId || ''}')">
            <div class="icon stratis-trash-01 text-error dark:text-error-dark w-4 h-4"></div>
            <span class="text-error dark:text-error-dark">İnvosyu sil</span>
          </div>
        `);
      } else {
        dropdownContent.html(`
          <span class="flex items-center gap-2 px-3 py-2 cursor-not-allowed hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[13px] font-normal">
            <div class="icon stratis-edit-02 text-[#D8DAE0] dark:text-[#D8DAE0] w-4 h-4"></div>
            <span class="text-[#D8DAE0]">Redaktə et</span>
          </span>
          <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal" onclick="returnEmployee(${rowIndex})">
            <div class="icon stratis-arrow-rotate-left-01 text-[#1D222BA6] dark:text-primary-text-color-dark w-4 h-4"></div>
            <span>Geri qaytar</span>
          </div>
        `);
      }
    } else if (tableType === "imtiyaz") {
      const row = imtiyazTable?.row(rowIndex)?.data() || {};
      const gid = row?.id || row?._id || "";

      dropdownContent.html(`
    <span class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal"
          onclick="openRenameGroupModal('${gid}')">
      <div class="icon stratis-edit-03 text-[#1D222BA6] dark:text-primary-text-color-dark w-4 h-4"></div>
      <span>Qrup Adını dəyiş</span>
    </span>
    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal"
         onclick="openEditGroupModal('${gid}')">
      <div class="icon stratis-file-edit-02 text-[#1D222BA6] dark:text-primary-text-color-dark w-4 h-4"></div>
      <span>Redaktə et</span>
    </div>
    <div class="border-t dark:border-surface-variant-dark"></div>
    <div class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[#DD3838] hover:bg-error-hover dark:hover:bg-error-hover-dark text-[13px] font-normal"
         onclick="openDeleteGroupModal('${gid}')">
      <div class="icon stratis-trash-01 text-error dark:text-error-dark w-4 h-4"></div>
      <span class="text-error dark:text-error-dark">Qrupu sil</span>
    </div>
  `);
    } else if (tableType === "vezife") {
      dropdownContent.html(`
    <div onclick="openVezifeEdit()" class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#353945] text-[#1D222B] dark:text-white text-[13px] font-normal">
      <div class="icon stratis-file-edit-02 text-[#1D222BA6] dark:text-primary-text-color-dark w-4 h-4"></div>
      <span>Redaktə et</span>
    </div>
    <div class="border-t dark:border-surface-variant-dark"></div>
    <div onclick="openVezifeDelete()" class="flex items-center gap-2 px-3 py-2 cursor-pointer text-[#DD3838] hover:bg-error-hover dark:hover:bg-error-hover-dark text-[13px] font-normal">
      <div class="icon stratis-trash-01 text-error dark:text-error-dark w-4 h-4"></div>
      <span class="text-error dark:text-error-dark">Sil</span>
    </div>
  `);
    }
    if (tableType === "emekdaslar") {
      if (!emekdaslarTable) {
        emekdaslarTable.draw(false);
      }
    }
  }

  // Style table rows
  function styleTableRow(row, dataIndex, tableType, rowData) {
    $(row)
      .css("transition", "background-color 0.2s ease")
      .on("mouseenter", function () {
        if (document.documentElement.classList.contains("dark")) {
          $(this).css("background-color", "#242C30");
        } else {
          $(this).css("background-color", "#FAFAFA");
        }
      })
      .on("mouseleave", function () {
        $(this).css("background-color", "");
      });

    const isDarkMode = document.documentElement.classList.contains("dark");
    const borderColor = isDarkMode ? "#40484c" : "#E0E0E0";

    $(row)
      .find("td")
      .css({
        "border-bottom": `0.5px solid ${borderColor}`,
      });

    $(row).find("td:not(:first-child):not(:last-child)").css({
      "padding-left": "20px",
      "padding-top": "14.5px",
      "padding-bottom": "14.5px",
    });

    $(row)
      .find("td:first-child")
      .addClass("border-r-[.5px] border-stroke dark:border-[#40484c]")
      .css({
        "padding-left": "0",
        "padding-right": "0",
        width: "48px",
        "text-align": "center",
        "border-bottom": `0.5px solid ${borderColor}`,
        "border-right": `0.5px solid ${borderColor}`,
      });

    $(row).find("td:first-child label").css({
      margin: "0",
      display: "inline-flex",
      "justify-content": "center",
      "align-items": "center",
    });

    $(row)
      .find("td:last-child")
      .addClass("border-l-[.5px] border-stroke dark:border-[#40484c]")
      .css({
        "padding-right": "0",
        "text-align": "right",
        "border-left": `0.5px solid ${borderColor}`,
      });

    // Update dropdown content after row creation
    setTimeout(() => {
      updateDropdownContent(dataIndex, tableType, rowData);
    }, 0);
  }

  // Style table headers
  function styleTableHeader(tableSelector) {
    $(`${tableSelector} thead th`).css({
      "padding-left": "20px",
      "padding-top": "10.5px",
      "padding-bottom": "10.5px",
    });

    const isDarkMode = document.documentElement.classList.contains("dark");
    const borderColor = isDarkMode ? "#40484c" : "#E0E0E0";

    $(`${tableSelector} thead th:first-child`).css({
      "padding-left": "0",
      "padding-right": "0",
      width: "58px",
      "text-align": "center",
      "vertical-align": "middle",
      "border-right": `0.5px solid ${borderColor}`,
    });

    $(`${tableSelector} thead th:last-child`).css({
      "border-left": `0.5px solid ${borderColor}`,
    });

    $(`${tableSelector} thead th:first-child label`).css({
      margin: "0 auto",
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
    });

    $(`${tableSelector} thead th.filtering`).each(function () {
      $(this).html(
        '<div class="custom-header flex gap-2.5 items-center"><div>' +
        $(this).text() +
        '</div><div class="icon stratis-sort-vertical-02 mt-1 text-messages dark:text-primary-text-color-dark"></div></div>'
      );
    });
  }

  // Handle table draw for pagination
  function handleTableDraw(api, paginationSelector) {
    var pageInfo = api.page.info();
    var $pagination = $(paginationSelector);

    if (pageInfo.pages === 0) {
      $pagination.empty();
      return;
    }

    $("#pageCount").text(pageInfo.page + 1 + " / " + pageInfo.pages);
    $pagination.empty();

    // Add spacer row
    const tableId = api.table().node().id;
    $(`#${tableId} tbody tr.spacer-row`).remove();
    const colCount = $(`#${tableId} thead th`).length;
    const spacerRow = `<tr class="spacer-row"><td colspan="${colCount}" style="height:12px; padding:0; border:none;"></td></tr>`;
    $(`#${tableId} tbody`).prepend(spacerRow);

    const isDarkMode = document.documentElement.classList.contains("dark");
    const borderColor = isDarkMode ? "#40484c" : "#E0E0E0";

    const $lastRow = $(`#${tableId} tbody tr:not(.spacer-row):last`);
    $lastRow.find("td:first-child").css({
      "border-right": `0.5px solid ${borderColor}`,
    });
    $lastRow.find("td:last-child").css({
      "border-left": `0.5px solid ${borderColor}`,
    });

    // Pagination buttons
    $pagination.append(`
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF]"
      }"
          onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
          <div class="icon stratis-chevron-left text-xs"></div>
      </div>
  `);

    var paginationButtons = '<div class="flex gap-2">';
    for (var i = 0; i < pageInfo.pages; i++) {
      paginationButtons += `
          <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
              ${i === pageInfo.page
          ? "bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark"
          : "bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark"
        }"
              onclick="changePage(${i})">${i + 1}</button>
      `;
    }
    paginationButtons += "</div>";
    $pagination.append(paginationButtons);

    $pagination.append(`
      <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight
          ${pageInfo.page === pageInfo.pages - 1
        ? "text-[#BFC8CC] dark:text-[#636B6F] cursor-not-allowed"
        : "text-messages dark:text-[#FFFFFF]"
      }"
          ${pageInfo.page < pageInfo.pages - 1
        ? `onclick="changePage(${pageInfo.page + 1})"`
        : ""
      }>
          <div class="icon stratis-chevron-right text-xs"></div>
      </div>
  `);
  }

  // Update buttons container based on active tab
  function updateButtonsContainer() {
    const buttonsContainer = $("#buttonsContainer");
    console.log(currentMainTab,"ssss")
    if (currentMainTab === "emekdaslar") {
      buttonsContainer.html(`
        <div class="flex !mb-[12.5px] mt-[12.5px] gap-2 items-center border border-surface-variant rounded-full p-1 dark:bg-table-hover-dark dark:border-on-surface-variant">
          <button id="aktivButton" class="px-1 py-[3px] text-messages dark:text-secondary-text-color-dark text-[12px] rounded-full font-medium hover:dark:text-primary-text-color-dark cursor-pointer ${currentSubTab === "aktiv"
          ? "bg-inverse-on-surface dark:bg-[#2E3135]"
          : ""
        }">
            Aktiv işçilər ()
          </button>
          <button id="ayrilanlarButton" class="px-1 py-[3px] text-messages dark:text-secondary-text-color-dark text-[12px] rounded-full font-medium hover:dark:text-primary-text-color-dark cursor-pointer ${currentSubTab === "ayrilan"
          ? "bg-inverse-on-surface dark:bg-[#2E3135]"
          : ""
        }">
            İşdən ayrılanlar ()
          </button>
        </div>
        <div class="relative">
          <input type="email" id="customSearchEmekdaslar" placeholder="İşçi axtar..." class="cursor-pointer dark:text-primary-text-color-dark max-w-[120px] h-[34px] font-poppins font-normal text-[12px] leading-[160%] border-[1px] border-surface-variant rounded-full pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-on-surface-variant" autocomplete="off" />
          <span class="icon stratis-search-02 absolute dark:!text-white dark:opacity-100 top-[8px] cursor-pointer text-messages opacity-[30%] right-[12px] !w-[15px] !h-[15px]"></span>
        </div>
        <div class="h-[34px] border border-surface-variant rounded-full flex items-center justify-center px-2 gap-2 hover:text-primary dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white">
          <a href="#" class="text-[13px] font-medium">Səhifəni yenilə</a>
          <a href="#" class="icon stratis-arrow-refresh-04 !w-[12px] !h-[12px] text-messages hover:text-messages dark:text-white"></a>
        </div>
        <div onclick="openFilterModal()" class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white">
          <a href="#" class="icon stratis-filter !w-[12px] !h-[9px] text-messages hover:text-messages dark:text-white"></a>
          <a href="#" class="text-[13px] font-medium">Filterlə</a>
        </div>

   <div id="balansArtirButton" class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white ${currentSubTab === "ayrilan" ? "pointer-events-none opacity-50" : ""
        }">
    <a href="/isci/add-balance" class="icon stratis-card-add !w-[12px] !h-[9px] text-messages hover:text-messages dark:text-white ${currentSubTab === "ayrilan" ? "text-[#BFC8CC]" : ""
        }"></a>
    <a href="/isci/add-balance" class="text-[13px] font-medium ${currentSubTab === "ayrilan" ? "text-[#BFC8CC]" : ""
        }">Balans artır</a>
</div>
        <div class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white" onclick="excelPopUp()">
          <img src="/images/uzv-sirket/isciler/excelIcon.svg" alt="Excel icon">
          <a href="#" class="text-[13px] font-medium">Excel-dən əlavə et</a>
        </div>
        <div class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white" onclick="exportToExcel()">
          <img src="/images/uzv-sirket/isciler/excelIcon.svg" alt="Excel icon">
          <a href="#" class="text-[13px] font-medium">Excelə çıxart</a>
        </div>
        <div class="h-[34px] bg-primary rounded-full text-body-bg flex items-center justify-center gap-2 px-2 hover:bg-hover-button" onclick="toggleIsci()">
          <a href="#" class="icon stratis-user-profile-add-02 !w-[13px] !h-[12px]"></a>
          <a href="#" class="text-[13px] font-medium">Yeni işçi</a>
        </div>
      `);

      // Re-attach event listeners for emekdaslar
      $("#aktivButton").off("click").on("click", switchToAktiv);
      $("#ayrilanlarButton").off("click").on("click", switchToAyrilanlar);
      $("#customSearchEmekdaslar")
        .off("keyup")
        .on("keyup", function () {
          emekdaslarTable.search(this.value).draw();
        });
    } else if (currentMainTab === "imtiyaz") {
      buttonsContainer.html(`
        <div class="relative">
          <input type="email" id="customSearchImtiyaz" placeholder="Qrup axtar..." class="cursor-pointer dark:text-primary-text-color-dark max-w-[120px] h-[34px] font-poppins font-normal text-[12px] leading-[160%] border-[1px] border-surface-variant rounded-full pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-on-surface-variant" autocomplete="off" />
          <span class="icon stratis-search-02 absolute dark:!text-white dark:opacity-100 top-[8px] cursor-pointer text-messages opacity-[30%] right-[12px] !w-[15px] !h-[15px]"></span>
        </div>
        <div class="h-[34px] border border-surface-variant rounded-full flex items-center justify-center px-2 gap-2 hover:text-primary dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white">
          <a href="#" class="text-[13px] font-medium">Səhifəni yenilə</a>
          <a href="#" class="icon stratis-arrow-refresh-04 !w-[12px] !h-[12px] text-messages hover:text-messages dark:text-white"></a>
        </div>
        <div onclick="openFilterModal()" class="h-[34px] border border-surface-variant rounded-full flex items-center hover:text-primary gap-2 px-2 text-messages dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white">
          <a href="#" class="icon stratis-filter !w-[12px] !h-[9px] text-messages hover:text-messages dark:text-white"></a>
          <a href="#" class="text-[13px] font-medium">Filterlə</a>
        </div>
        <div onclick="toggleYeniQrup()" class="h-[34px] bg-primary rounded-full text-body-bg flex items-center justify-center gap-2 px-2 hover:bg-hover-button">
          <a href="#" class="icon stratis-user-profile-add-02 !w-[13px] !h-[12px]"></a>
          <a href="#" class="text-[13px] font-medium">Yeni qrup</a>
        </div>
      `);

      // Attach search event for imtiyaz
      $("#customSearchImtiyaz")
        .off("keyup")
        .on("keyup", function () {
          imtiyazTable.search(this.value).draw();
        });
    } else if (currentMainTab === "vezife") {
      buttonsContainer.html(`
        <div class="relative">
          <input type="email" id="customSearchVezife" placeholder="Vəzifə axtar..." class="cursor-pointer dark:text-primary-text-color-dark max-w-[120px] h-[34px] font-poppins font-normal text-[12px] leading-[160%] border-[1px] border-surface-variant rounded-full pl-[12px] placeholder-on-surface-variant-dark hover:bg-input-hover focus:border-focus focus:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] focus:ring-0 focus:outline-none active:border-focus active:shadow-[0px_0px_0px_2.5px_var(--color-button-disabled)] transition-all ease-out duration-300 dark:bg-table-hover-dark dark:border-on-surface-variant" autocomplete="off" />
          <span class="icon stratis-search-02 absolute dark:!text-white dark:opacity-100 top-[8px] cursor-pointer text-messages opacity-[30%] right-[12px] !w-[15px] !h-[15px]"></span>
        </div>
        <div class="h-[34px] border border-surface-variant rounded-full flex items-center justify-center px-2 gap-2 hover:text-primary dark:bg-table-hover-dark dark:border-on-surface-variant dark:text-white">
          <a href="#" class="text-[13px] font-medium">Səhifəni yenilə</a>
          <a href="#" class="icon stratis-arrow-refresh-04 !w-[12px] !h-[12px] text-messages hover:text-messages dark:text-white"></a>
        </div>
        <div class="h-[34px] bg-primary rounded-full text-body-bg flex items-center justify-center gap-2 px-2 hover:bg-hover-button" onclick="toggleYeniVezife()">
          <a href="#" class="icon stratis-user-profile-add-02 !w-[13px] !h-[12px]"></a>
          <a href="#" class="text-[13px] font-medium">Yeni vəzifə</a>
        </div>
      `);

      // Attach search event for vezife
      $("#customSearchVezife")
        .off("keyup")
        .on("keyup", function () {
          vezifeTable.search(this.value).draw();
        });
    }
  }

  // Update pagination container visibility
  function updatePaginationVisibility() {
    const paginationContainer = $(".w-full.bg-sidebar-bg");
    if (currentMainTab === "emekdaslar") {
      paginationContainer.show();
    } else {
      paginationContainer.hide();
    }
  }

  // Main tab switching function
  window.switchTab = function (tabName) {
    // Clear selection mode when switching tabs
    selectionMode = false;

    // Hide all tables
    $("#emekdaslarTable").hide();
    $("#imtiyazTable").hide();
    $("#vezifeTable").hide();

    // Remove active class from all tabs
    $("#emekdaslarTab, #imtiyazTab, #vezifeTab").removeClass(
      "bg-inverse-on-surface dark:bg-[#2E3135]"
    );

    // Set current tab and show appropriate table
    currentMainTab = tabName;

    if (tabName === "emekdaslar") {
      $("#emekdaslarTable").show();
      $("#emekdaslarTab").addClass("bg-inverse-on-surface dark:bg-[#2E3135]");
      if (!emekdaslarTable) {
        initializeEmekdaslarTable();
      }
    } else if (tabName === "imtiyaz") {
      $("#imtiyazTable").show();
      $("#imtiyazTab").addClass("bg-inverse-on-surface dark:bg-[#2E3135]");
      if (!imtiyazTable) {
        initializeImtiyazTable();
      }
    } else if (tabName === "vezife") {
      $("#vezifeTable").show();
      $("#vezifeTab").addClass("bg-inverse-on-surface dark:bg-[#2E3135]");
      if (!vezifeTable) {
        initializeVezifeTable();
      }
    }

    // Update UI
    updateUIForSelectionMode();
    updateButtonsContainer();
    updatePaginationVisibility();
  };

  // Sub-tab switching for emekdaslar
  function switchToAktiv() {
    currentSubTab = "aktiv";

    $("#aktivButton").addClass("bg-inverse-on-surface dark:bg-[#2E3135]");
    $("#ayrilanlarButton").removeClass(
      "bg-inverse-on-surface dark:bg-[#2E3135]"
    );

    emekdaslarTable.column(8).visible(false);
    $("#ayrilmaColumn").addClass("hidden");

    emekdaslarTable.draw();

    selectionMode = false;
    updateUIForSelectionMode();
    updateButtonsContainer();
  }

  function switchToAyrilanlar() {
    currentSubTab = "ayrilan";

    $("#ayrilanlarButton").addClass("bg-inverse-on-surface dark:bg-[#2E3135]");
    $("#aktivButton").removeClass("bg-inverse-on-surface dark:bg-[#2E3135]");

    emekdaslarTable.column(8).visible(true);
    $("#ayrilmaColumn").removeClass("hidden");

    emekdaslarTable.draw();

    selectionMode = false;
    updateUIForSelectionMode();
    updateButtonsContainer();
  }

  // Page change function for emekdaslar table
  window.changePage = function (page) {
    if (currentMainTab === "emekdaslar" && emekdaslarTable) {
      var pageInfo = emekdaslarTable.page.info();
      if (page < 0) page = 0;
      if (page >= pageInfo.pages) page = pageInfo.pages - 1;
      emekdaslarTable.page(page).draw("page");
    }
  };

  // Page input functionality for emekdaslar
  function setupPageInput() {
    $(".page-input")
      .off("keypress")
      .on("keypress", function (e) {
        if (e.which === 13) {
          goToPage();
        }
      });

    $(".go-button")
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        goToPage();
      });
  }

  function goToPage() {
    if (currentMainTab !== "emekdaslar" || !emekdaslarTable) return;

    const inputVal = $(".page-input").val().trim();
    const pageNum = parseInt(inputVal, 10);
    const pageInfo = emekdaslarTable.page.info();

    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageInfo.pages) {
      emekdaslarTable.page(pageNum - 1).draw("page");
    } else {
      emekdaslarTable.page(0).draw("page");
    }

    $(".page-input").val("");
  }

  function deleteGroupPop() {
    QrupuSilPop.style.display = "block";
  }

  // Global dropdown toggle function
  window.toggleDropdown = function (_icon, rowIndex, tableType) {
    // // əvvəlcə hamısını gizlət
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((menu) => menu.classList.add("hidden"));

    // seçilmişi aç
    const dd = document.getElementById(`dropdown-${tableType}-${rowIndex}`);
    if (dd) dd.classList.remove("hidden");
  };

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (event) {
    const isDropdown = event.target.closest(".dropdown-menu");
    const isTrigger = event.target.closest(".stratis-dot-vertical");

    if (!isDropdown && !isTrigger) {
      document.querySelectorAll(".dropdown-menu").forEach((el) => {
        el.classList.add("hidden");
      });
    }
  });

  // Action functions - these should be implemented based on your needs
  window.editEmployee = function (rowIndex) {
    // Implement edit employee functionality
  };

  window.returnEmployee = function (rowIndex) {
    // Implement return employee functionality
  };

  window.openImtiyazFilterModal = function () {
    // Implement imtiyaz filter modal
  };

  window.toggleYeniQrup = function () {
    const pop = document.getElementById('YeniQrupPop');
    if(!pop) return;
    // Always open (if you want toggle then replace with classList.toggle logic)
    pop.classList.remove('hidden');
    // Reset input & state
    const inp = document.getElementById('imtiyazGroupNameInput');
    if(inp){ inp.value=''; inp.classList.remove('border-error'); }
    if(window.imtiyazState){ window.imtiyazState.groupName=''; }
  };

  window.toggleYeniVezife = function () {
    document.getElementById("YeniVezifePop").classList.remove("hidden");
  };

  window.toggleRedakteVezife = function () {
    document.getElementById("RedakteEtPopUpVezife").classList.remove("hidden");
  };

  window.openVezifeEdit = function () {
    const el = document.getElementById("RedakteEtPopUpVezife");
    if (el) el.classList.remove("hidden");
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((m) => m.classList.add("hidden"));
  };

  window.openVezifeDelete = function () {
    const el = document.getElementById("VezifeSilPop");
    if (el) el.classList.remove("hidden");
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((m) => m.classList.add("hidden"));
  };

  // Initialize the application
  function initialize() {
    // Start with emekdaslar tab
    switchTab("emekdaslar");
    setupPageInput();
    setupSelectAllCheckboxes();
    setupSelectionControls();
    initializeEditPopupDropdowns();
    setupGlobalDropdownHandlers();
  }

  // Initialize dropdowns for edit popup
  function initializeEditPopupDropdowns() {
    // Wait a bit longer to ensure DOM is ready
    setTimeout(() => {
      initializeDropdown1();
      initializeDropdown2();
    }, 100);
  }

  // Initialize dropdown1 (Vəzifə qrupu)
  function initializeDropdown1() {
    // Look for elements within the popup
    const popup = document.getElementById("EmekdaslarRedaktePop");
    const dropdownButton1 = popup ? popup.querySelector('#dropdownDefaultButton') : document.getElementById('dropdownDefaultButton');
    const dropdown1 = popup ? popup.querySelector('#dropdown1') : document.getElementById('dropdown1');

    if (dropdownButton1 && dropdown1) {
      // Remove any existing listeners to prevent duplicates
      dropdownButton1.onclick = null;

      // Set higher z-index to ensure dropdown appears above other elements
      dropdown1.style.zIndex = '1000';
      dropdown1.style.position = 'absolute';

      dropdownButton1.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Close dropdown2 first
        const dropdown2 = document.getElementById('dropdown2');
        if (dropdown2) dropdown2.classList.add('hidden');

        // Toggle dropdown1
        dropdown1.classList.toggle('hidden');
      });

      // Handle dropdown item selection
      dropdown1.addEventListener('click', function (e) {
        e.stopPropagation();
        if (e.target.tagName === 'A') {
          e.preventDefault();
          const selectedText = e.target.textContent;
          const selectedValue = e.target.getAttribute('data-value');

          // Update button text
          const buttonSpan = dropdownButton1.querySelector('span');
          if (buttonSpan) buttonSpan.textContent = selectedText;

          // Update hidden select
          const realSelect = document.getElementById('realSelect');
          if (realSelect) realSelect.value = selectedValue;

          // Close dropdown
          dropdown1.classList.add('hidden');
        }
      });
    } else {
      // Elements not found - might be rendering issue
    }
  }

  // Initialize dropdown2 (Vəzifəsi)
  function initializeDropdown2() {
    // Look for elements within the popup
    const popup = document.getElementById("EmekdaslarRedaktePop");
    const dropdownButton2 = popup ? popup.querySelector('#dropdownDefaultButton2') : document.getElementById('dropdownDefaultButton2');
    const dropdown2 = popup ? popup.querySelector('#dropdown2') : document.getElementById('dropdown2');

    if (dropdownButton2 && dropdown2) {
      // Remove any existing listeners to prevent duplicates
      dropdownButton2.onclick = null;

      // Set higher z-index to ensure dropdown appears above other elements
      dropdown2.style.zIndex = '1000';
      dropdown2.style.position = 'absolute';

      dropdownButton2.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Close dropdown1 first
        const dropdown1 = document.getElementById('dropdown1');
        if (dropdown1) dropdown1.classList.add('hidden');

        // Toggle dropdown2
        dropdown2.classList.toggle('hidden');
      });

      // Handle dropdown item selection
      dropdown2.addEventListener('click', function (e) {
        e.stopPropagation();
        if (e.target.tagName === 'A') {
          e.preventDefault();
          const selectedText = e.target.textContent;
          const selectedValue = e.target.getAttribute('data-value');

          // Update button text
          const buttonSpan = dropdownButton2.querySelector('span');
          if (buttonSpan) buttonSpan.textContent = selectedText;

          // Update hidden select
          const realSelect2 = document.getElementById('realSelect2');
          if (realSelect2) realSelect2.value = selectedValue;

          // Close dropdown
          dropdown2.classList.add('hidden');
        }
      });

      // Handle search functionality for dropdown2
      const searchInput = document.getElementById('customSearch3');
      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          const searchTerm = e.target.value.toLowerCase();
          const listItems = dropdown2.querySelectorAll('li');

          listItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
              item.style.display = 'block';
            } else {
              item.style.display = 'none';
            }
          });
        });
      }
    } else {
      // Elements not found - might be rendering issue
    }
  }

  // Global click handler to close dropdowns when clicking outside
  function setupGlobalDropdownHandlers() {
    document.addEventListener('click', function (e) {
      const dropdown1 = document.getElementById('dropdown1');
      const dropdown2 = document.getElementById('dropdown2');
      const dropdownButton1 = document.getElementById('dropdownDefaultButton');
      const dropdownButton2 = document.getElementById('dropdownDefaultButton2');

      if (dropdown1 && !dropdownButton1?.contains(e.target) && !dropdown1.contains(e.target)) {
        dropdown1.classList.add('hidden');
      }
      if (dropdown2 && !dropdownButton2?.contains(e.target) && !dropdown2.contains(e.target)) {
        dropdown2.classList.add('hidden');
      }
    });
  }

  // Function to clear/reset popup data
  function clearEditPopupData() {
    const popup = document.getElementById("EmekdaslarRedaktePop");
    if (!popup) return;

    // Reset dropdown selections
    const positionButton = popup.querySelector('#dropdownDefaultButton2');
    if (positionButton) {
      const span = positionButton.querySelector('span');
      if (span) span.textContent = 'Seçim edin';
    }

    const departmentButton = popup.querySelector('#dropdownDefaultButton');
    if (departmentButton) {
      const span = departmentButton.querySelector('span');
      if (span) span.textContent = 'Seçim edin';
    }

    // Restore original span structure for fields that were converted to inputs
    const fieldRows = popup.querySelectorAll('.flex.justify-between');

    fieldRows.forEach((row) => {
      const label = row.querySelector('span:first-child');
      const inputOrSelect = row.querySelector('input[id^="employee-"], select[id^="employee-"]');

      if (label && inputOrSelect) {
        const labelText = label.textContent.trim();

        // Create a new span to replace the input/select
        const newSpan = document.createElement('span');
        newSpan.className = 'font-medium dark:text-white';

        // Set appropriate default text based on field type
        if (labelText.includes('Adı') || labelText.includes('Ad')) {
          newSpan.textContent = 'Ad Soyad';
        } else if (labelText.includes('Email')) {
          newSpan.textContent = 'email@example.com';
        } else if (labelText.includes('Telefon')) {
          newSpan.textContent = '+994 50 770 35 22';
        } else if (labelText.includes('Cinsi')) {
          newSpan.textContent = 'Cinsi';
        } else {
          newSpan.textContent = 'Məlumat';
        }

        // Replace the input/select with the span
        inputOrSelect.replaceWith(newSpan);
      }
    });

    // Clear the current editing ObjectId
    window.currentEditingObjectId = null;
  }

  // Override emekdaslarclick to ensure dropdowns are initialized when popup opens
  window.emekdaslarclick = function () {
    // Toggle the popup
    const popup = document.getElementById("EmekdaslarRedaktePop");
    if (popup) {
      const isCurrentlyVisible = !popup.classList.contains("hidden");

      if (isCurrentlyVisible) {
        // Popup is being closed - clear the data
        clearEditPopupData();
        popup.classList.add("hidden");
      } else {
        // Popup is being opened - show it
        popup.classList.remove("hidden");

        // Initialize dropdowns
        setTimeout(() => {
          initializeEditPopupDropdowns();
        }, 100);
      }
    }
  };

  // Function to open edit popup with specific user data
  window.openEditPopup = function (objectId) {
    if (!objectId) {
      alert("Xəta: İstifadəçi ID-si tapılmadı");
      return;
    }

    // Get the row data from DataTable
    const table = window.emekdaslarTable;
    if (!table) {
      alert("Xəta: Cədvəl tapılmadı");
      return;
    }

    // Check if table has rows method (ensure it's a DataTable instance)
    if (typeof table.rows !== 'function') {
      alert("Xəta: Cədvəl düzgün yüklənməyib");
      return;
    }

    // Find the row with this objectId
    let rowData = null;
    try {
      table.rows().every(function (index) {
        const data = this.data();
        if (data) {
          // Check multiple possible ID fields and also try to match partial IDs
          const possibleIds = [
            data._id,
            data.id,
            data.objectId,
            data.userId,
            data.mongoId,
            data.people_id,
            data.partnyor_id
          ].filter(Boolean); // Remove null/undefined values

          // Check if any of the possible IDs match our target objectId
          const matchingId = possibleIds.find(id =>
            id === objectId ||
            String(id) === String(objectId) ||
            (typeof id === 'string' && id.includes(objectId)) ||
            (typeof objectId === 'string' && objectId.includes(id))
          );

          if (matchingId) {
            rowData = data;
            return false; // Stop iteration
          }
        }
      });
    } catch (error) {
      alert("Xəta: Cədvəl məlumatlarına çıxış alınmadı");
      return;
    }

    if (!rowData) {
      // Fallback: fetch data directly from server
      fetchUserDataAndOpenPopup(objectId);
      return;
    }

    // Open the popup
    const popup = document.getElementById("EmekdaslarRedaktePop");
    if (popup) {
      // Clear any previous data first
      clearEditPopupData();

      popup.classList.remove("hidden");

      // Populate the popup with data
      setTimeout(() => {
        populateEditPopup(rowData);
        // Give more time for DOM elements to be ready
        setTimeout(() => {
          initializeEditPopupDropdowns();
        }, 200);
      }, 100);
    } else {
      alert("Xəta: Redaktə pəncərəsi tapılmadı");
    }
  };

  // Fallback function to fetch user data from server and open popup
  function fetchUserDataAndOpenPopup(objectId) {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    $.ajax({
      url: `/people/user/${objectId}`,
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({ user_id: objectId }),
      success: function (response) {
        if (response.success) {
          // Transform server response to match expected format
          const userData = {
            name: response.name,
            surname: response.surname,
            email: response.email,
            phone: response.phone_suffix || response.phone,
            gender: response.gender,
            _id: response._id || objectId
          };

          // Open the popup
          const popup = document.getElementById("EmekdaslarRedaktePop");
          if (popup) {
            // Clear any previous data first
            clearEditPopupData();

            popup.classList.remove("hidden");

            // Populate the popup with data
            setTimeout(() => {
              populateEditPopup(userData);
              initializeEditPopupDropdowns();
            }, 100);
          }
        } else {
          alert("Xəta: İstifadəçi məlumatları alınmadı - " + response.message);
        }
      },
      error: function (xhr, status, error) {
        alert("Xəta: Server ilə əlaqə problemi");
      }
    });
  }

  // Function to populate edit popup with data
  function populateEditPopup(rowData) {
    const popup = document.getElementById("EmekdaslarRedaktePop");
    if (!popup) return;

    // Store the current editing ObjectId globally
    window.currentEditingObjectId = rowData._id || rowData.objectId || rowData.id;

    // Helper function to get field value with multiple possible names
    const getFieldValue = (data, fieldNames) => {
      for (const fieldName of fieldNames) {
        if (data[fieldName]) return data[fieldName];
      }
      return '';
    };

    // Make fields editable by converting spans to inputs
    const fieldRows = popup.querySelectorAll('.flex.justify-between');

    fieldRows.forEach((row, index) => {
      const label = row.querySelector('span:first-child');
      let valueElement = row.querySelector('span:last-child');

      // Check if there's already an input/select field instead of span
      if (!valueElement) {
        valueElement = row.querySelector('input[id^="employee-"], select[id^="employee-"]');
        if (valueElement) {
          // If there's already an input, just update its value
          updateExistingInput(valueElement, rowData, label?.textContent.trim());
          return;
        }
      }

      if (!label || !valueElement) return;

      const labelText = label.textContent.trim();
      let fieldValue = '';
      let inputElement = null;

      // Convert static spans to editable inputs based on field type
      if (labelText.includes('Adı') || labelText.includes('Ad')) {
        // Name field
        const name = getFieldValue(rowData, ['name', 'fullname', 'firstName', 'ad']);
        const surname = getFieldValue(rowData, ['surname', 'lastName', 'soyad']);
        fieldValue = surname ? `${name} ${surname}` : name;

        inputElement = createEditableInput('text', fieldValue, 'employee-name');
      } else if (labelText.includes('Email')) {
        // Email field
        fieldValue = getFieldValue(rowData, ['email', 'emailAddress', 'mail']);
        inputElement = createEditableInput('email', fieldValue, 'employee-email');
      } else if (labelText.includes('Telefon')) {
        // Phone field
        fieldValue = getFieldValue(rowData, ['phone', 'phoneNumber', 'telefon', 'phone_suffix']);
        inputElement = createEditableInput('tel', fieldValue, 'employee-phone');
      } else if (labelText.includes('Cinsi')) {
        // Gender field - create a select dropdown
        fieldValue = getFieldValue(rowData, ['gender', 'cinsi', 'sex']);
        inputElement = createGenderSelect(fieldValue);
      } else if (labelText.includes('Vəzifəsi') || labelText.includes('Vəzifə qrupu')) {
        // Skip dropdown fields - they will be handled separately
        return;
      } else {
        // Keep other fields as spans for now
        valueSpan.textContent = getFieldValue(rowData, [labelText.toLowerCase()]);
        return;
      }

      if (inputElement) {
        valueElement.replaceWith(inputElement);
      }
    });

    // Helper function to update existing input fields
    function updateExistingInput(inputElement, rowData, labelText) {
      const getFieldValue = (data, fieldNames) => {
        for (const fieldName of fieldNames) {
          if (data[fieldName]) return data[fieldName];
        }
        return '';
      };

      let fieldValue = '';

      if (labelText.includes('Adı') || labelText.includes('Ad')) {
        const name = getFieldValue(rowData, ['name', 'fullname', 'firstName', 'ad']);
        const surname = getFieldValue(rowData, ['surname', 'lastName', 'soyad']);
        fieldValue = surname ? `${name} ${surname}` : name;
      } else if (labelText.includes('Email')) {
        fieldValue = getFieldValue(rowData, ['email', 'emailAddress', 'mail']);
      } else if (labelText.includes('Telefon')) {
        fieldValue = getFieldValue(rowData, ['phone', 'phoneNumber', 'telefon', 'phone_suffix']);
      } else if (labelText.includes('Cinsi')) {
        fieldValue = getFieldValue(rowData, ['gender', 'cinsi', 'sex']);
      }

      // Update the input value
      if (inputElement.tagName === 'SELECT') {
        inputElement.value = fieldValue;
      } else {
        inputElement.value = fieldValue;
      }
    }

    // Update dropdown selections if data exists
    const position = getFieldValue(rowData, ['position', 'vezife', 'job', 'title']);
    if (position) {
      setTimeout(() => {
        const positionButton = document.getElementById('dropdownDefaultButton2');
        if (positionButton) {
          const span = positionButton.querySelector('span');
          if (span) span.textContent = position;
        }
      }, 50);
    }

    const department = getFieldValue(rowData, ['department', 'vezife_qrupu', 'group', 'departman']);
    if (department) {
      setTimeout(() => {
        const departmentButton = document.getElementById('dropdownDefaultButton');
        if (departmentButton) {
          const span = departmentButton.querySelector('span');
          if (span) span.textContent = department;
        }
      }, 50);
    }
  }

  // Helper function to create editable input
  function createEditableInput(type, value, id) {
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.id = id;
    input.className = 'font-medium dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:outline-none px-1 py-1';

    // Add specific attributes for phone input
    if (type === 'tel' && id === 'employee-phone') {
      input.placeholder = '507703522';
      input.title = 'Telefon nömrəsi: 7-15 rəqəm';
      input.pattern = '[0-9]{7,15}';

      // Add input event listener to show only digits as user types
      input.addEventListener('input', function (e) {
        // Allow user to type normally but show cleaned version
        const originalValue = e.target.value;
        const cleanValue = originalValue.replace(/\D/g, '');

        // Only update if it's different (prevents cursor jumping)
        if (originalValue !== cleanValue) {
          e.target.value = cleanValue;
        }

        // Visual feedback for length validation
        const isValid = cleanValue.length >= 7 && cleanValue.length <= 15;
        if (cleanValue.length > 0) {
          e.target.style.borderColor = isValid ? 'green' : 'red';
        } else {
          e.target.style.borderColor = '';
        }
      });
    }

    return input;
  }

  // Helper function to create gender select
  function createGenderSelect(selectedValue) {
    const select = document.createElement('select');
    select.id = 'employee-gender';
    select.className = 'font-medium dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:outline-none px-1 py-1';

    const options = [
      { value: '', text: 'Seçin' },
      { value: 'male', text: 'Kişi' },
      { value: 'female', text: 'Qadın' },
      { value: 'other', text: 'Digər' }
    ];

    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      if (option.value === selectedValue) {
        optionElement.selected = true;
      }
      select.appendChild(optionElement);
    });

    return select;
  }

  // Function to collect edited data from the popup
  function collectEditedData() {
    const popup = document.getElementById("EmekdaslarRedaktePop");
    if (!popup) return null;

    const editedData = {};

    // Get values from editable inputs
    const nameInput = popup.querySelector('#employee-name');
    const emailInput = popup.querySelector('#employee-email');
    const phoneInput = popup.querySelector('#employee-phone');
    const genderSelect = popup.querySelector('#employee-gender');

    if (nameInput) {
      const fullName = nameInput.value.trim();
      editedData.fullName = fullName;
    }

    if (emailInput) editedData.email = emailInput.value.trim();

    if (phoneInput) {
      // Clean phone number to match backend regex /^[0-9]{7,15}$/
      let cleanPhone = phoneInput.value.trim();

      // Remove all non-digit characters (spaces, dashes, parentheses, plus signs, etc.)
      cleanPhone = cleanPhone.replace(/\D/g, '');      // Validate length (7-15 digits as per backend regex)
      if (cleanPhone.length >= 7 && cleanPhone.length <= 15) {
        editedData.phoneNumber = cleanPhone;
      } else if (cleanPhone.length > 0) {
        alert("Telefon nömrəsi 7-15 rəqəm arasında olmalıdır");
        return null; // Stop processing if phone is invalid
      }
    }

    if (genderSelect) editedData.gender = genderSelect.value;

    // Get values from dropdowns
    const positionButton = document.getElementById('dropdownDefaultButton2');
    const departmentButton = document.getElementById('dropdownDefaultButton');

    if (positionButton) {
      const positionSpan = positionButton.querySelector('span');
      if (positionSpan && positionSpan.textContent !== 'Seçim edin') {
        editedData.position = positionSpan.textContent.trim();
      }
    }

    if (departmentButton) {
      const departmentSpan = departmentButton.querySelector('span');
      if (departmentSpan && departmentSpan.textContent !== 'Seçim edin') {
        editedData.department = departmentSpan.textContent.trim();
      }
    }

    // Add the current objectId (should be stored when popup opens)
    if (window.currentEditingObjectId) {
      editedData.objectId = window.currentEditingObjectId;
      editedData.user_id = window.currentEditingObjectId; // for server compatibility
    }

    return editedData;
  }

  // Function to save edited employee data
  window.saveEditedEmployee = function () {
    const editedData = collectEditedData();
    if (!editedData || !editedData.objectId) {
      alert("Xəta: Məlumatları toplamaq mümkün olmadı");
      return;
    }

    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    $.ajax({
      url: "/muessise-info/edit-user",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(editedData),
      success: function (response) {
        if (response.success) {
          alert("İşçi məlumatları uğurla yeniləndi");

          // Clear data and close edit modal
          clearEditPopupData();
          const popup = document.getElementById("EmekdaslarRedaktePop");
          if (popup) popup.classList.add("hidden");

          // Refresh the table
          if (window.emekdaslarTable) {
            window.emekdaslarTable.ajax.reload();
          }
        } else {
          alert("Xəta baş verdi: " + (response.message || "Məlumatları yeniləmək mümkün olmadı"));
        }
      },
      error: function (xhr, status, error) {
        alert("Məlumatları yeniləmə zamanı xəta baş verdi");
      }
    });
  };

  // Global variables for popup operations
  let currentObjectId = null;
  let tempDeleteOperation = null;

  // Balance Popup Functions
  window.openBalancePopup = function (objectId) {
    if (!objectId) {
      return;
    }

    currentObjectId = objectId;

    // Get user data using the MongoDB ObjectId from /people/user/:objectId endpoint
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    $.ajax({
      url: `/people/user/${objectId}`,
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({ objectId: objectId }),
      success: function (response) {
        console.log(response);

        if (response.success) {
          // Populate the popup with user data and show it
          populateBalancePopup(response);
          $("#balancePopup").removeClass("hidden").addClass("flex");
        } else {
          alert("İstifadəçi məlumatları alınarkən xəta baş verdi: " + (response.message || "Məlumat tapılmadı"));
        }
      },
      error: function (xhr, status, error) {
        alert("İstifadəçi məlumatları alınarkən xəta baş verdi");
      }
    });
  };

  // Function to populate balance popup with user data
  function populateBalancePopup(userData) {
    console.log('userData:', userData);

    // Update popup title or content with user information if needed
    const popup = document.getElementById("balancePopup");
    if (!popup) return;

    // Update the popup title to include user name and ID
    const titleElement = popup.querySelector("h2");
    if (titleElement && userData.name && userData.surname) {
      titleElement.textContent = `${userData.name} ${userData.surname} üçün balansı artır`;
    }

    // Update the description to include user ID for reference
    const descriptionElement = popup.querySelector("p");
    if (descriptionElement && userData.people_id) {
      descriptionElement.innerHTML = `
        <strong>İşçi ID:</strong> ${userData.people_id}<br>
        İşçilərin balansını həm Admin paneldən, həm də Excel nümunəsi ilə artıra bilərsiniz
      `;
    }

    // Store user data globally for use in balance operations
    window.currentBalanceUser = userData;
  }

  window.closeBalancePopup = function () {
    $("#balancePopup").removeClass("flex").addClass("hidden");
    currentObjectId = null;
    window.currentBalanceUser = null;

    // Reset popup title and description to default
    const popup = document.getElementById("balancePopup");
    if (popup) {
      const titleElement = popup.querySelector("h2");
      if (titleElement) {
        titleElement.textContent = "Balansı artır";
      }

      const descriptionElement = popup.querySelector("p");
      if (descriptionElement) {
        descriptionElement.textContent = "İşçilərin balansını həm Admin paneldən, həm də Excel nümunəsi ilə artıra bilərsiniz";
      }
    }
  };

  // Delete Functions
  window.openDeleteInvoiceModal = function (objectId) {
    if (!objectId) {
      return;
    }

    currentObjectId = objectId;
    $("#deleteInvoiceModal").removeClass("hidden").addClass("flex");
  };

  window.closeDeleteInvoiceModal = function (keepTempOperation = false) {
    $("#deleteInvoiceModal").removeClass("flex").addClass("hidden");
    currentObjectId = null;
    if (!keepTempOperation) {
      tempDeleteOperation = null;
    }
  };

  window.deleteInvoice = function () {
    if (!currentObjectId) {
      return;
    }

    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    $.ajax({
      url: "/muessise-info/delete-user",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({ id: currentObjectId }),
      success: function (response) {
        if (response.success) {
          if (response.otpRequired) {
            // Store delete operation for OTP confirmation
            tempDeleteOperation = {
              type: 'delete',
              objectId: currentObjectId,
              tempId: response.tempId
            };

            // Close delete modal (but keep tempDeleteOperation)
            $("#deleteInvoiceModal").removeClass("flex").addClass("hidden");
            currentObjectId = null;
            // Note: Don't clear tempDeleteOperation here - we need it for OTP

            // Open existing OTP popup
            $(".emaildogrulama-div").removeClass("hidden");

            // Remove any existing event handlers and add our custom handlers
            $(".emaildogrulama-div button[type='submit']").off('click').on('click', function (e) {
              e.preventDefault();
              confirmOtp();
            });

            $(".emaildogrulama-div button[type='button']").off('click').on('click', function (e) {
              e.preventDefault();
              closeOtpPopup();
            });

            $(".emaildogrulama-div img").off('click').on('click', function (e) {
              e.preventDefault();
              closeOtpPopup();
            });
          } else {
            // Delete completed successfully
            alert("İşçi uğurla silindi");
            closeDeleteInvoiceModal();
            // Refresh the table
            if (window.emekdaslarTable) {
              window.emekdaslarTable.ajax.reload();
            }
          }
        } else {
          alert("Xəta baş verdi: " + (response.message || "Bilinməyən xəta"));
        }
      },
      error: function (xhr, status, error) {
        alert("İşçi silinərkən xəta baş verdi");
      }
    });
  };

  // OTP Functions
  window.closeOtpPopup = function () {
    $(".emaildogrulama-div").addClass("hidden");
    // Clear all OTP inputs
    $(".emaildogrulama-div .otp-input").val("");
    tempDeleteOperation = null;

    // Remove our custom event handlers
    $(".emaildogrulama-div button[type='submit']").off('click');
    $(".emaildogrulama-div button[type='button']").off('click');
    $(".emaildogrulama-div img").off('click');
  };

  window.confirmOtp = function () {
    // Get OTP code from the 6 separate inputs
    const otpInputs = $(".emaildogrulama-div .otp-input");
    const otpData = {};
    let allFilled = true;

    otpInputs.each(function (index) {
      const value = $(this).val();
      if (!value) {
        allFilled = false;
      }
      otpData[`otp${index + 1}`] = value;
    });

    if (!allFilled) {
      alert("6 rəqəmli OTP kodunu daxil edin");
      return;
    }

    if (!tempDeleteOperation) {
      return;
    }

    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    const requestData = {
      ...otpData,
      tempId: tempDeleteOperation.tempId
    };

    $.ajax({
      url: "/muessise-info/accept-delete-user",
      type: "POST",
      headers: {
        "CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestData),
      success: function (response) {
        if (response.success) {
          alert("İşçi uğurla silindi");
          closeOtpPopup();
          // Refresh the table
          if (window.emekdaslarTable) {
            window.emekdaslarTable.ajax.reload();
          }
        } else {
          alert("Xəta baş verdi: " + (response.message || "Yanlış OTP kodu"));
        }
      },
      error: function (xhr, status, error) {
        alert("OTP təsdiqi zamanı xəta baş verdi");
      }
    });
  };

  // Function to close OTP popup and clear temp operation
  function closeOtpPopup() {
    $(".emaildogrulama-div").addClass("hidden");
    tempDeleteOperation = null;
  }

  // Override toggleEmail function to handle OTP cancel
  window.toggleEmail = function () {
    closeOtpPopup();
  };

  // Edit Employee Function
  window.editEmployee = function (objectId) {
    // This will be implemented based on edit popup requirements
    // For now, we'll prepare the data from the table
    alert("Edit funksiyası hazırlanır. ObjectId: " + objectId);
  };

  // Excel Upload Functions
  window.selectExcelFile = function () {
    document.getElementById("excelFileInput").click();
  };

  // File input change handler for Excel upload
  document.getElementById("excelFileInput").addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/excel-upload", {
        method: "POST",
        headers: {
          "CSRF-Token": document.querySelector("meta[name='csrf-token']").content,
        },
        body: formData,
      });

      const result = await response.json();

      console.log("result", result);


      if (result.success) {
        console.log('result.success');

        if (result.data && result.data.length > 0) {
          // Excel popup açıq deyilsə, aç
          if (!excelClick) {
            excelPopUp();
          }

          // Cədvəli doldur
          populateExcelTable(result.data);
          alert(`${result.data.length} işçi tapıldı və cədvələ əlavə edildi`);
        } else {
          alert("Excel faylında məlumat tapılmadı");
        }
      } else {
        alert(result.message || "Excel yüklənərkən xəta baş verdi!");
      }
    } catch (err) {
      alert("Server ilə əlaqə xətası.");
    }

    // Clear file input
    this.value = "";
  });

  // Populate excel table with data
  function populateExcelTable(data) {
    // Destroy existing table if exists
    if (excelDataTable) {
      excelDataTable.destroy();
    }

    // Initialize DataTable with uploaded data
    excelDataTable = $("#myTable2").DataTable({
      data: data,
      pageLength: 10,
      searching: false,
      ordering: false,
      info: false,
      lengthChange: false,
      columns: [
        {
          data: null,
          orderable: false,
          render: function (data, type, row, meta) {
            return `
              <input type="checkbox" id="excel-cb-${meta.row}" class="excel-row-checkbox peer hidden">
              <label for="excel-cb-${meta.row}" class="cursor-pointer bg-menu dark:bg-menu-dark border border-surface-variant dark:border-surface-variant-dark rounded-[2px] w-[18px] h-[18px] flex items-center justify-center text-on-primary dark:text-menu-dark peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:text-on-primary dark:peer-checked:text-on-primary peer-checked:border-primary dark:peer-checked:border-primary transition">
                <div class="icon stratis-check-01 scale-60"></div>
              </label>
            `;
          },
        },
        {
          data: "id",
          render: function (data) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${data || ""}</span>`;
          },
        },
        {
          data: "name",
          render: function (data) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${data || ""}</span>`;
          },
        },
        {
          data: "email",
          render: function (data) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${data || ""}</span>`;
          },
        },
        {
          data: "phone",
          render: function (data) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${data || ""}</span>`;
          },
        },
        {
          data: "gender",
          render: function (data) {
            return `<span class="text-[13px] text-messages font-normal dark:text-white">${data || ""}</span>`;
          },
        },
      ],
    });

    // Handle select all checkbox
    $("#newCheckboxTable").on("change", function () {
      const isChecked = this.checked;
      $(".excel-row-checkbox").prop("checked", isChecked);
    });

    // Handle individual row checkbox changes
    $(document).on("change", ".excel-row-checkbox", function () {
      const totalCheckboxes = $(".excel-row-checkbox").length;
      const checkedCheckboxes = $(".excel-row-checkbox:checked").length;
      $("#newCheckboxTable").prop("checked", totalCheckboxes === checkedCheckboxes);
    });
  }

  // Add selected people from excel
  $("#addSelectedPeople").on("click", function () {
    const selectedRows = [];

    $(".excel-row-checkbox:checked").each(function () {
      const row = $(this).closest("tr");
      const rowData = excelDataTable.row(row).data();
      selectedRows.push(rowData);
    });

    if (selectedRows.length === 0) {
      alert("Zəhmət olmasa əlavə etmək istədiyiniz işçiləri seçin");
      return;
    }

    // Send selected people to backend
    addPeopleToCompany(selectedRows);
  });

  // Add people to company
  async function addPeopleToCompany(peopleData) {
    const csrfToken = $('meta[name="csrf-token"]').attr("content");

    try {
      const response = await fetch("/people/add-to-company", {
        method: "POST",
        headers: {
          "CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ people: peopleData }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`${peopleData.length} işçi uğurla şirkətə əlavə edildi`);

        // Close excel popup
        if (typeof closeExcelPopup === 'function') {
          closeExcelPopup();
        }

        // Refresh main table if exists
        if (window.emekdaslarTable) {
          window.emekdaslarTable.ajax.reload();
        }
      } else {
        alert(result.message || "İşçilər əlavə edilərkən xəta baş verdi");
      }
    } catch (err) {
      alert("Server ilə əlaqə xətası");
    }
  }

  // Excel Export Function for Selected Items
  window.exportSelectedToExcel = async function () {
    let exportButton = null;
    let originalContent = '';

    try {
      // Get selected employees IDs
      const selectedIds = [];
      let checkboxes;
      let tabType = currentMainTab; // emekdaslar, imtiyaz, vezife

      if (currentMainTab === "emekdaslar") {
        checkboxes = document.querySelectorAll('#myTable tbody input[type="checkbox"]:checked');
      } else if (currentMainTab === "imtiyaz") {
        checkboxes = document.querySelectorAll('#myTableImtiyaz tbody input[type="checkbox"]:checked');
      } else if (currentMainTab === "vezife") {
        checkboxes = document.querySelectorAll('#myTableVezife tbody input[type="checkbox"]:checked');
      }

      checkboxes.forEach(checkbox => {
        const id = checkbox.getAttribute('data-employee-id') || checkbox.value;
        if (id) {
          selectedIds.push(id);
        }
      });

      if (selectedIds.length === 0) {
        alert('Heç bir item seçilməyib!');
        return;
      }

      // Show loading indicator
      exportButton = document.querySelector('[onclick="exportSelectedToExcel()"]');
      if (exportButton) {
        originalContent = exportButton.innerHTML;
        exportButton.innerHTML = '<div class="flex items-center gap-2"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div><span class="text-[13px] font-medium">Yüklənir...</span></div>';
        exportButton.style.pointerEvents = 'none';
        exportButton.style.opacity = '0.7';
      }

      // Prepare request body
      const requestBody = {
        selectedIds: selectedIds,
        exportType: 'selected',
        tabType: tabType // Hansı tab tipindən export edilir
      };

      const csrfToken = document.querySelector("meta[name='csrf-token']").content;

      const response = await fetch('/people/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `secilmis_${tabType}.xlsx`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${selectedIds.length} seçilmiş item uğurla Excel faylına export edildi</span>
          </div>
        `;
        document.body.appendChild(notification);

        // Animate notification
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove notification after 4 seconds
        setTimeout(() => {
          notification.style.transform = 'translateX(full)';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);

      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Export uğursuz oldu');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel export zamanı xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      // Restore button - always execute
      if (exportButton && originalContent) {
        exportButton.innerHTML = originalContent;
        exportButton.style.pointerEvents = 'auto';
        exportButton.style.opacity = '1';
      }
    }
  };

  // Excel Export Function
  window.exportToExcel = async function () {
    let exportButton = null;
    let originalContent = '';

    try {
      // Get selected employees IDs
      const selectedIds = [];
      const checkboxes = document.querySelectorAll('#myTable tbody input[type="checkbox"]:checked');

      checkboxes.forEach(checkbox => {
        const employeeId = checkbox.getAttribute('data-employee-id');
        if (employeeId) {
          selectedIds.push(employeeId);
        }
      });

      // Prepare request body
      const requestBody = {
        selectedIds: selectedIds.length > 0 ? selectedIds : null, // null means export all
        exportType: selectedIds.length > 0 ? 'selected' : 'all'
      };

      const csrfToken = document.querySelector("meta[name='csrf-token']").content;

      // Show loading indicator
      exportButton = document.querySelector('[onclick="exportToExcel()"]');
      if (exportButton) {
        originalContent = exportButton.innerHTML;
        exportButton.innerHTML = '<div class="flex items-center gap-2"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span class="text-[13px] font-medium">Yüklənir...</span></div>';
        exportButton.style.pointerEvents = 'none';
        exportButton.style.opacity = '0.7';
      }

      const response = await fetch('/people/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'emekdaslar.xlsx';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Show success message
        const count = selectedIds.length > 0 ? selectedIds.length : 'bütün';

        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${count} əməkdaş uğurla Excel faylına export edildi</span>
          </div>
        `;
        document.body.appendChild(notification);

        // Animate notification
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove notification after 3 seconds
        setTimeout(() => {
          notification.style.transform = 'translateX(full)';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 3000);

      } else {
        const errorData = await response.json().catch(() => ({}));

        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>${errorData.message || 'Excel export zamanı xəta baş verdi'}</span>
          </div>
        `;
        document.body.appendChild(notification);

        // Animate notification
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove notification after 4 seconds
        setTimeout(() => {
          notification.style.transform = 'translateX(full)';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Excel export error:', error);

      // Create error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Excel export zamanı xəta baş verdi</span>
        </div>
      `;
      document.body.appendChild(notification);

      // Animate notification
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);

      // Remove notification after 4 seconds
      setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 4000);
    } finally {
      // Restore button state - always execute
      if (exportButton && originalContent) {
        exportButton.innerHTML = originalContent;
        exportButton.style.pointerEvents = 'auto';
        exportButton.style.opacity = '1';
      }
    }
  };

  // Handle select all checkbox for main table
  $("#newCheckbox").on("change", function () {
    const isChecked = this.checked;
    $("#myTable tbody input[type='checkbox']").prop("checked", isChecked);
  });

  // Handle individual checkboxes to update select all state
  $(document).on("change", "#myTable tbody input[type='checkbox']", function () {
    const totalCheckboxes = $("#myTable tbody input[type='checkbox']").length;
    const checkedCheckboxes = $("#myTable tbody input[type='checkbox']:checked").length;
    $("#newCheckbox").prop("checked", totalCheckboxes === checkedCheckboxes);
    $("#newCheckbox").prop("indeterminate", checkedCheckboxes > 0 && checkedCheckboxes < totalCheckboxes);
  });

  // Run initialization
  initialize();
});