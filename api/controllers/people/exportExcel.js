import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import xlsx from "node-xlsx";
import path from "path";
import fs from "fs";



export const excelExport = async (req,res) => {
   try {
   const { ids, all_checked} = req.body;
   const userId = req.user.id;

   const peopleUser = await PeopleUser.findById(userId);
   if (!peopleUser) {
            return res.status(404).send("User not found.");
    }
   
   let users = [];
   if (ids.length === 0 || !all_checked) return res.status(401).send("User not found");
   if(all_checked) {
    users = await PartnerUser.find({});
   } else if(ids.length > 0) {
    users = await PartnerUser.find({_id: {$in: ids}});
   };
   

   const data = [
    [
        "Id","Ad və Soyad", "Email", "Telefon nömrəsi", "Cinsi", "Vəzifəsi"
    ]
   ];

    users.forEach(user => {
    data.push([
    user.id,
    user.name + " " + user.surname,
    user.email,
    user.phone,
    user.gender,
    user.duty
   ])});

   const buffer = xlsx.build([{name: 'Əməkdaşlar', data: data}]);
   const uploadDir = path.join(path.resolve(),`public/upload/${peopleUser?.sirket_id}/export`);
   if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir,{recursive: true});
   };
   const timestamp = Date.now();
   const filename = `${timestamp}_${peopleUser?.sirket_id}.xlsx`;
   const filePath = path.join(uploadDir,filename);
  
   fs.writeFileSync(filePath, buffer, "binary");
        res.download(filePath, "emekdaslar.xlsx" ,(err) => {
            if(err) {
                console.error("Fayl göndərilərkən xəta baş verdi:", err);
                res.status(500).send("Fayl göndərilə bilmədi.");
            } else {
                console.log("Fayl uğurla göndərildi.");
            }
    });
   

   } catch (error) {
    console.log("Something is wrong",error.message);
    return res.status(500).send("Internal server error");
   };
   

};
