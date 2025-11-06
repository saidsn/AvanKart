// let notData = []
// function renderNotificationData(data){
//     let bildirisler = $("#bildirisler");
//     bildirisler.empty();
//     const bildirisData =  data.map(item => 
//     `
//       <div class="bg-container-2 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
//         <div class="flex items-start justify-between">
//           <div class="flex items-center gap-2">
//             <h3 class="text-[14px] font-semibold text-primary">
//               Başlıq: ${item.title}
//             </h3>
//           </div>
//           <span class="text-[11px] text-gray-400">
//             Tarix: ${item.createdAt}
//           </span>
//         </div>

//         <p class="text-[12px] text-gray-600 mt-2">
//           Mətn: ${item.text}
//         </p>
//         <div class="flex flex-col gap-1 mt-3 text-[12px] text-gray-600">
//           <span>Tip: ${item.type || "-"}</span>
//           <span>Prioritet: ${item.data?.priority || "-"}</span>
//           <span>Status: 
//             <span class="px-2 py-[2px] rounded-full font-medium capitalize">
//               ${item.status}
//             </span>
//           </span>
//         </div>
//       </div>
      
//     `
//  ).join("");
// bildirisler.append(bildirisData);
// };
// function loadNotificationsData (m_id) {
//     const muessiseId = m_id
//     const csrfToken = $("meta[name=csrf-token]").attr("content") || "mock-csrf-token";
//     $.ajax({
//         url: '/muessiseler/notifications',
//         type: "POST",
//         contentType: "application/json",
//         headers: {
//             "X-CSRF-Token": csrfToken
//         },
//         data: JSON.stringify({muessise_id: muessiseId}),
//         success: function(response) {
//             notData = response.data;
//             renderNotificationData(notData);

//         },
//         error: function (error) {
//             console.log(error,"Notification data yuklenmedi");
//         }
//     });
// };