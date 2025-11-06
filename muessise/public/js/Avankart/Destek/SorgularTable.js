// $(document).ready(function () {
//     // Verilənlər
//     var myData = [
//         [
//             {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
//             name: "Orxan icrai",
//             logo: "Oİ",
//             status: "Baxılır",
//             date: "12.01.2024",
//             user: "AP istifadəçi",
//             priority: "High"
//         },
//         {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Müəssisə istifadəçiləri QR kod yarada bilmirlər",
//             name: "Fərid İcrai",
//             logo: "FƏ",
//             status: "Baxılır",
//             date: "16.01.2024",
//             user: "Müəssisə",
//             priority: "Low"
//         },
//         {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Müəssisə istifadəçiləri QR kod yarada bilmirlər",
//             name: "Fərid İcrai",
//             logo: "FƏ",
//             status: "Medium",
//             date: "16.01.2024",
//             user: "Şirkət",
//             priority: "Low"
//         },
//         ],
//         [
//             {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
//             name: "Orxan icrai",
//             logo: "Oİ",
//             status: "Baxılır",
//             date: "12.01.2024",
//             user: "AP istifadəçi",
//             priority: "High"
//         },
//         {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Müəssisə istifadəçiləri QR kod yarada bilmirlər",
//             name: "Fərid İcrai",
//             logo: "FƏ",
//             status: "Baxılır",
//             date: "16.01.2024",
//             user: "Müəssisə",
//             priority: "Low"
//         },
//         ],
//         [
//             {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
//             name: "Orxan icrai",
//             logo: "Oİ",
//             status: "Baxılır",
//             date: "12.01.2024",
//             user: "AP istifadəçi",
//             priority: "High"
//         },
//         {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Müəssisə istifadəçiləri QR kod yarada bilmirlər",
//             name: "Fərid İcrai",
//             logo: "FƏ",
//             status: "Baxılır",
//             date: "16.01.2024",
//             user: "Müəssisə",
//             priority: "Low"
//         },
//         {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Müəssisə istifadəçiləri QR kod yarada bilmirlər",
//             name: "Fərid İcrai",
//             logo: "FƏ",
//             status: "Medium",
//             date: "16.01.2024",
//             user: "Şirkət",
//             priority: "Low"
//         },
//         ],
//         [
//             {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Tətbiqdə yaranan texniki problemlərdən dolayı bir çox istifadəçilər ödənişlərlə bağlı şikayət müraciətləri ünvanlayıb",
//             name: "Orxan icrai",
//             logo: "Oİ",
//             status: "Baxılır",
//             date: "12.01.2024",
//             user: "AP istifadəçi",
//             priority: "High"
//         },
//         {
//             id: "S-XXXXXXXXX",
//             title: "İstifadəçinin ödəniş edə bilməməsi",
//             problem: "Müəssisə istifadəçiləri QR kod yarada bilmirlər",
//             name: "Fərid İcrai",
//             logo: "FƏ",
//             status: "Baxılır",
//             date: "16.01.2024",
//             user: "Müəssisə",
//             priority: "Low"
//         },
//         ],
//     ];

//     // Buradan sonra sizin mövcud DataTable konfiqurasiyanız olduğu kimi işləyə bilər.
//     // `activeData` dəyişənini bu `myData` ilə təyin edib, cədvəldə göstərmək kifayətdir.
//     // 1. Məlumatları düzləşdir
// var flatData = myData.flat(); // bütün iç-içə array-ləri tək bir array halına gətirir

// // 2. DataTables başlat
// var table = $('#myTable').DataTable({
//     paging: true,
//     info: false,
//     dom: 't',
//     data: flatData,
//     columns: [
//         {
//             data: function(row) {
//                 // burada row artıq bir object-dir, row.status, row.title və s. şəklində çağırılmalıdır

//                 // Rəng və ikonlar
//                 let statusColor = "#BFC8CC";
//                 if (row.status === "Baxılır") statusColor = "#F9B100";
//                 if (row.status === "Həll olundu") statusColor = "#32B5AC";
//                 if (row.status === "Rədd edildi") statusColor = "#DD3838";

//                 let priorityIcon = "Low.svg";
//                 if (row.priority === "High") priorityIcon = "High.svg";
//                 if (row.priority === "Medium") priorityIcon = "Medium.svg";

//                 return `
//                     <div class="p-3 bg-container-2 rounded-[8px]">
//                         <div class="flex items-center justify-between">
//                             <span class="text-[11px] opacity-65">${row.id}</span>
//                             <div class="icon stratis-dot-vertical"></div>
//                         </div>
//                         <div class="mt-0.5 mb-3">
//                             <div class="text-[13px] font-medium mb-1">${row.title}</div>
//                             <div class="text-[11px] font-normal opacity-65">${row.problem}</div>
//                         </div>
//                         <div class="flex items-center justify-between">
//                             <div class="flex items-center gap-1">
//                                 <div class="w-[34px] h-[34px] bg-button-disabled rounded-[50%] flex justify-center items-center">
//                                     <div class="text-[12px] font-semibold font-poppins text-primary">${row.logo}</div>
//                                 </div>
//                                 <h3 class="text-[13px] font-normal">${row.name}</h3>
//                             </div>
//                             <div class="flex items-center gap-2 justify-center">
//                                 <img src="${row.priority}" alt="${row.priority}">
//                                 <span class="text-[13px] font-medium">${row.priority}</span>
//                             </div>
//                         </div>
//                         <div class="my-3 flex items-center justify-between">
//                             <div class="bg-table-hover rounded-full flex items-center justify-center gap-1 h-[27px] !w-[97px]">
//                                 <div class="icon stratis-calendar-check"></div>
//                                 <span class="!text-[12px] font-medium">${row.date}</span>
//                             </div>
//                             <div class="flex items-center justify-center gap-1 py-[4.5px] px-[2px]">
//                                 <div class="icon stratis-users-profiles-02"></div>
//                                 <span class="!text-[12px] font-medium px-2">${row.user}</span>
//                             </div>
//                         </div>
//                     </div>
//                 `;
//             }
//         }
//     ],

//         order: [],
//         lengthChange: false,
//         pageLength: 5,
//         drawCallback: function () {
//             var api = this.api();
//             var pageInfo = api.page.info();
//             var $pagination = $('#customPagination');

//             if (pageInfo.pages === 0) {
//                 $pagination.empty();
//                 return;
//             }

//             $("#pageCount").text((pageInfo.page + 1) + " / " + pageInfo.pages);
//             $pagination.empty();


//             // Input sahəsində Enter düyməsinə basıldıqda və ya "GO" düyməsinə klik edildikdə səhifəyə keçid
//             $('.page-input').off('keypress').on('keypress', function (e) {
//                 if (e.which === 13) {
//                     goToPage();
//                 }
//             });

//             $('.go-button').off('click').on('click', function (e) {
//                 e.preventDefault();
//                 goToPage();
//             });

//             function goToPage() {
//                 const inputVal = $('.page-input').val().trim();
//                 const pageNum = parseInt(inputVal, 10); // input-u tam ədəd kimi al
//                 const pageInfo = table.page.info(); // mövcud DataTable səhifə məlumatı

//                 if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageInfo.pages) {
//                     table.page(pageNum - 1).draw('page'); // DataTable 0-dan başlayır
//                 } else {
//                     table.page(0).draw('page'); // Əgər səhvdirsə → 1-ci səhifə
//                 }

//                 $('.page-input').val(""); // input sahəsini təmizlə
//             }
            
//             // Səhifələmə düymələri
//             $pagination.append(`
//                 <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === 0 ? 'text-[#636B6F] cursor-not-allowed' : 'text-messages dark:text-primary-text-color-dark'}" 
//                     onclick="changePage(${Math.max(0, pageInfo.page - 1)})">
//                     <div class="icon stratis-chevron-left"></div>
//                 </div>
//             `);

//             var paginationButtons = '<div class="flex gap-2">';
//             for (var i = 0; i < pageInfo.pages; i++) {
//                 paginationButtons += `
//                     <button class="cursor-pointer w-10 h-10 rounded-[8px] hover:text-messages dark:hover:text-primary-text-color-dark
//                             ${i === pageInfo.page ? 'bg-[#F6D9FF] dark:bg-[#5B396D4D] text-messages dark:text-primary-text-color-dark' : 'bg-transparent text-tertiary-text dark:text-tertiary-text-color-dark'}"
//                             onclick="changePage(${i})">${i + 1}</button>
//                 `;
//             }
//             paginationButtons += '</div>';
//             $pagination.append(paginationButtons);

//             $pagination.append(`
//                 <div class="flex items-center justify-center px-3 h-8 ms-0 leading-tight ${pageInfo.page === pageInfo.pages - 1 ? 'text-[#636B6F] cursor-not-allowed' : 'text-tertiary-text dark:text-primary-text-color-dark'}" 
//                     onclick="changePage(${pageInfo.page + 1})">
//                     <div class="icon stratis-chevron-right"></div>
//                 </div>
//             `);
//         }
//     });

//     // Axtarış
//     $('#customSearch').on('keyup', function () {
//         table.search(this.value).draw();
//         updateCounts(activeData);
//     });

//     // Sayları yeniləmək üçün funksiya
//     function updateCounts(data) {
//         const totalCount = data.length;
//         const readCount = data.filter(row => row.status === "Oxundu").length;
//         const unreadCount = data.filter(row => row.status === "Yeni").length;

//         $('#total-count').text(`Hamısı (${totalCount})`);
//         $('#read-count').text(`Oxunmuşlar (${readCount})`);
//         $('#unread-count').text(`Oxunmamışlar (${unreadCount})`);
//     }

//     // Səhifə dəyişdirmə
//     window.changePage = function (page) {
//         table.page(page).draw('page');
//     };
// });
