$(document).ready(function () {
    const data = [
  {
    card: "Yemək",
    date: "08.10.2024 - 12:40",
    type: "Kartın deaktiv edilməsi",
    resultDate: "",
    result : "Gözləyir"
  },
  {
    card: "Yanacaq",
    date: "08.10.2024 - 12:40",
    type: "Kartın deaktiv edilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Təsdiqləlib"
  },
  {
    card: "Hediyyə",
    date: "08.10.2024 - 12:40",
    type: "Kartın aktivləşdirilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Rədd edilib"
  },
  {
    card: "Market",
    date: "08.10.2024 - 12:40",
    type: "Kartın deaktiv edilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Rədd edilib"
  },
  {
    card: "Biznes",
    date: "08.10.2024 - 12:40",
    type: "Kartın aktivləşdirilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Təsdiqləlib"
  },
  {
    card: "Premium",
    date: "08.10.2024 - 12:40",
    type: "Kartın aktivləşdirilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Təsdiqləlib"
  },
  {
    card: "Avto Yuma",
    date: "08.10.2024 - 12:40",
    type: "Kartın aktivləşdirilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Rədd edilib"
  },
  {
    card: "Yemək",
    date: "08.10.2024 - 12:40",
    type: "Kartın deaktiv edilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Rədd edilib"
  },
  {
    card: "Yanacaq",
    date: "08.10.2024 - 12:40",
    type: "Kartın aktivləşdirilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Rədd edilib"
  },
  {
    card: "Biznes",
    date: "08.10.2024 - 12:40",
    type: "Kartın deaktiv edilməsi",
    resultDate: "08.10.2024 - 12:40",
    result : "Təsdiqləlib"
  }
];



    const $table = $("#popUpTable");
    const $tbody = $table.find("tbody");
    $tbody.html(""); 
    data.forEach(item => {
     
        const colorProccessClass = (item.type === 'Kartın deaktiv edilməsi'? 'text-red-500' : 'text-green-500');
        const colorDot = (item.result === 'Təsdiqlənib'? 'text-[#32B5AC]' :( item.result === 'Rədd edilib'?'text-[#DD3838]':'text-[#FFA100]'));

        $tbody.append(`
            <tr class="bg-white border-b-1 dark:bg-menu-dark rounded-lg px-[20px] py-[22px]" style="height:68px">
               
                <td class="px-[20px] py-[22px] text-[13px] text-messages dark:text-primary-text-color-dark font-normal">
                    ${item.date}
                </td>
               
                <td class='px-[20px] py-[22px]  text-[13px] dark:text-primary-text-color-dark font-normal ${colorProccessClass}'>
                     ${item.type}
                </td>
                
                <td class="px-[20px] py-[22px] text-[13px] text-messages dark:text-primary-text-color-dark font-normal">
                 <span class='icon stratis-dot-horizontal ${colorDot}'></span>   ${item.result}
                </td>
               
            </tr>
        `);
    });

    $table.find("thead th").css({
        "padding-top": "10.5px",
        "padding-bottom": "10.5px"
    });
});




