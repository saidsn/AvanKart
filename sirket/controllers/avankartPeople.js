import mongoose from "mongoose";
import ExcelJS from "exceljs";
import AddCardBalance from "../../shared/model/people/addBalances.js";
import AddedBalance from "../../shared/model/people/addedBalances.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import OldSirketUser  from "../../shared/model/people/oldSirketUsers.js"
import InvitePeople from "../../shared/model/people/invitePeopleModel.js";
import i18n from "i18n";

export const getAvankartPeoplePage = async (req, res) => {
  const myUser = await PeopleUser.findById(req.user.id)
    .populate({
      path: 'sirket_id',
      select: '_id cards',
      populate: {
        path: 'cards',
        select: '_id name', // gerekli alanlar
        // cards yoksa hata vermesin
        options: { strictPopulate: false }
      }
    })
    .lean();

   
  return res.render("pages/isciler/isciler.ejs", {
    error: "",
    cards: myUser.sirket_id.cards,
    csrfToken: req.csrfToken()
  });
};

export const peopleTable = async (req, res) => {
  try {
    const {
      search = [],
      start_date,
      end_date,
      draw = 1,
      start = 0,
      length = 10,
      gender = ["male", "female"],
      category = "current",
      users = [],
    } = req.body;

    const currentUser = await PeopleUser.findById(req.user?.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.avankartPartner.unauthorized") });
    }

    let usersCount = 0;
    let userList = [];
    let invitedList = [];

    if (category === "old") {
      const query = {
        sirket_id: currentUser.sirket_id,
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { surname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { people_id: { $regex: search, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: search,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await OldSirketUser.countDocuments(query);
      userList = await OldSirketUser.find(query)
        .limit(Number(length))
        .skip(Number(start));
    } else {
      const baseQuery = {
        sirket_id: currentUser.sirket_id,
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { surname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { people_id: { $regex: search, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$name", " ", "$surname"] },
                  regex: search,
                  options: "i",
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: search,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
      };

      const query = {
        ...baseQuery,
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await PeopleUser.countDocuments(query);
      userList = await PeopleUser.find(query)
        .populate("duty", "name")
        .populate("imtiyaz", "name")
        .lean();

      // Get invited people
      const inviteQuery = {
        sirket_id: currentUser.sirket_id,
        status: { $in: ["pending", "rejected"] },
        ...(start_date && { createdAt: { $gte: new Date(start_date) } }),
        ...(end_date && { createdAt: { $lte: new Date(end_date) } }),
      };

      const invites = await InvitePeople.find(inviteQuery)
        .populate({
          path: "user_id",
          select: "name surname email phone phone_suffix people_id gender total_qr_codes",
        })
        .lean();

      // Filter invited users
      invitedList = invites
        .filter((invite) => {
          if (!invite.user_id) return false;

          // Gender filter
          if (!gender.includes(invite.user_id.gender)) return false;

          // Search filter
          if (search) {
            const userData = invite.user_id;
            const fullName = `${userData.name || ""} ${userData.surname || ""}`.trim();
            const reverseFullName = `${userData.surname || ""} ${userData.name || ""}`.trim();
            const searchFields = [
              userData.name,
              userData.surname,
              userData.email,
              userData.people_id,
              fullName,
              reverseFullName,
            ].filter(Boolean);

            const matchesSearch = searchFields.some((field) =>
              new RegExp(search, "i").test(field)
            );

            if (!matchesSearch) return false;
          }

          // Users filter
          if (users.length > 0) {
            if (!users.some(id => id.toString() === invite.user_id._id.toString())) {
              return false;
            }
          }

          return true;
        })
        .map((invite) => ({
          _id: invite.user_id._id,
          id: invite.user_id.people_id ?? invite.user_id._id,
          fullname: `${invite.user_id.name || ""} ${invite.user_id.surname || ""}`.trim(),
          gender: res.__("partials.popup.muessiseEditPopup.male"),
          email: invite.user_id.email,
          qrCodeCount: invite.user_id.total_qr_codes || 0,
          partner_id: invite.user_id.people_id,
          phoneNumber: `+${invite.user_id.phone_suffix ?? "994"} ${invite.user_id.phone || ""}`,
          hireDate: "N/A",
          dismissalDate: "N/A",
          duty: "N/A",
          permission: "N/A",
          inviteStatus: res.__("isciler."+invite.status), // pending or rejected
          inviteRawStatus: invite.status, // pending or rejected
          isInvite: true,
          sortDate: invite.createdAt, // Invite olunma tarixi
        }));

      // Update total count
      // usersCount += invitedList.length;
    }

    const formattedUsers = userList.map((user) => ({
      _id: user._id,
      id: user.people_id ?? user._id,
      fullname: `${user.name} ${user.surname ?? ""}`,
      gender: res.__('partials.popup.muessiseEditPopup.'+user.gender),
      email: user.email,
      qrCodeCount: user.total_qr_codes,
      partner_id: user.people_id,
      phoneNumber: `+${user.phone_suffix ?? "994"} ${user.phone}`,
      hireDate: user.hire_date
        ? user.hire_date.toLocaleDateString("az-AZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      dismissalDate: user.dismissal_date
        ? user.dismissal_date.toLocaleDateString("az-AZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      duty: user.duty?.name || "N/A",
      permission: user.imtiyaz?.name || "N/A",
      isInvite: false,
      sortDate: user.hire_date || user.createdAt, // Sıralama üçün
    }));

    // Combine both lists
    const allUsers = [...formattedUsers, ...invitedList];

    // Sort by sortDate (newest first)
    allUsers.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

    // Apply pagination on combined and sorted list
    const paginatedUsers = allUsers.slice(Number(start), Number(start) + Number(length));

    // Remove sortDate from final response
    paginatedUsers.forEach(user => delete user.sortDate);

    return res.status(200).json({
      draw: Number(draw),
      recordsTotal: usersCount,
      recordsFiltered: allUsers.length,
      data: paginatedUsers,
    });
  } catch (err) {
    console.error("peopleTable error:", err);
    return res
      .status(500)
      .json({ message: res.__("messages.avankartPartner.server_error") });
  }
};

export const peopleTableImtiyaz = async (req, res) => {
  try {
    const {
      search = [],
      searchText,
      start_date,
      end_date,
      draw = 1,
      start = 0,
      length = 10,
      gender = ["male", "female"],
      category = "current",
      users = [],
    } = req.body;

    const currentUser = await PeopleUser.findById(req.user?.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.avankartPartner.unauthorized") });
    }

    let usersCount = 0;
    let userList = [];
    let invitedList = [];

    if (category === "old") {
      const query = {
        sirket_id: currentUser.sirket_id,
        ...(searchText && {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { surname: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
            { people_id: { $regex: searchText, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: searchText,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await OldSirketUser.countDocuments(query);
      userList = await OldSirketUser.find(query)
        .limit(Number(length))
        .skip(Number(start));
    } else {
      const baseQuery = {
        sirket_id: currentUser.sirket_id,
        ...(searchText && {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { surname: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
            { people_id: { $regex: searchText, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$name", " ", "$surname"] },
                  regex: searchText,
                  options: "i",
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$surname", " ", "$name"] },
                  regex: searchText,
                  options: "i",
                },
              },
            },
          ],
        }),
        ...(start_date && { hire_date: { $gte: new Date(start_date) } }),
        ...(end_date && { dismissal_date: { $lte: new Date(end_date) } }),
        gender: { $in: gender },
      };

      const query = {
        ...baseQuery,
        ...(users.length > 0 && { _id: { $in: users } }),
      };

      usersCount = await PeopleUser.countDocuments(query);
      userList = await PeopleUser.find(query)
        .populate("duty", "name")
        .populate("imtiyaz", "name")
        .lean();

      // Get invited people
      const inviteQuery = {
        sirket_id: currentUser.sirket_id,
        status: { $in: ["pending", "rejected"] },
        ...(start_date && { createdAt: { $gte: new Date(start_date) } }),
        ...(end_date && { createdAt: { $lte: new Date(end_date) } }),
      };

      // Update total count
      // usersCount += invitedList.length;
    }

    const formattedUsers = userList.map((user) => ({
      _id: user._id,
      id: user.people_id ?? user._id,
      fullname: `${user.name} ${user.surname ?? ""}`,
      gender: res.__('partials.popup.muessiseEditPopup.'+user.gender),
      email: user.email,
      qrCodeCount: user.total_qr_codes,
      partner_id: user.people_id,
      phoneNumber: `+${user.phone_suffix ?? "994"} ${user.phone}`,
      hireDate: user.hire_date
        ? user.hire_date.toLocaleDateString("az-AZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      dismissalDate: user.dismissal_date
        ? user.dismissal_date.toLocaleDateString("az-AZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A",
      duty: user.duty?.name || "N/A",
      permission: user.imtiyaz?.name || "N/A",
      isInvite: false,
      sortDate: user.hire_date || user.createdAt, // Sıralama üçün
    }));

    // Combine both lists
    const allUsers = [...formattedUsers];

    // Sort by sortDate (newest first)
    allUsers.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

    // Apply pagination on combined and sorted list
    const paginatedUsers = allUsers.slice(Number(start), Number(start) + Number(length));

    // Remove sortDate from final response
    paginatedUsers.forEach(user => delete user.sortDate);

    return res.status(200).json({
      draw: Number(draw),
      recordsTotal: usersCount,
      recordsFiltered: allUsers.length,
      data: paginatedUsers,
    });
  } catch (err) {
    console.error("peopleTable error:", err);
    return res
      .status(500)
      .json({ message: res.__("messages.avankartPartner.server_error") });
  }
};

export const addBalance = async (req, res) => {
  try {
    const { ids = [], balances = {}, duty_id = null } = req.body;

    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const me = await PeopleUser.findById(req.user.id)
      .populate({ path: "sirket_id", select: "_id sirket_balance" })
      .select("_id sirket_id perm totalBalance");

    if (!me?.sirket_id) return res.status(403).json({ message: "No company" });

    const requesterSirketId = String(me.sirket_id._id);

    const users = await PeopleUser.find({ _id: { $in: ids } }).select(
      "_id sirket_id totalBalance"
    );
    const allowedUsers = users.filter(
      (u) => String(u.sirket_id) === requesterSirketId
    );
    const allowedIds = allowedUsers.map((u) => String(u._id));

    if (!allowedIds.length)
      return res
        .status(400)
        .json({ message: "No valid users from same company" });

    const cardIds = Object.keys(balances || {});
    if (!cardIds.length)
      return res.status(400).json({ message: "No balances provided" });

    const perCard = [];
    let perUserTotal = 0;

    for (const cardId of cardIds) {
      const raw = balances[cardId];
      const amount = Number(raw?.balance ?? raw);
      if (!amount || isNaN(amount) || amount <= 0) continue;
      perCard.push({
        card_id: new mongoose.Types.ObjectId(cardId),
        count: amount,
      });
      perUserTotal += amount;
    }

    if (!perCard.length)
      return res.status(400).json({ message: "Nothing to add" });

    const totalAll = perUserTotal * allowedIds.length;
    const companyBalance = Number(me.sirket_id.sirket_balance ?? 0);

    if (totalAll > companyBalance) {
      return res.status(400).json({ message: "Insufficient company balance" });
    }

    const batch = await AddCardBalance.create({
      user_id: me._id,
      sirket_id: me.sirket_id._id,
      duty_id: duty_id ?? null,
      cards: perCard,
      total_balance: totalAll,
      updatedBy: me._id,
      refModel: "PeopleUser",
      status: "waiting",
    });

    const permId = me.perm ?? null;

    const docs = [];
    for (const uid of allowedIds) {
      const userObj = allowedUsers.find((u) => String(u._id) === uid);
      const lastBalance = Number(userObj?.totalBalance ?? 0);
      const newTotal = lastBalance + perUserTotal;

      for (const c of perCard) {
        docs.push({
          user_id: uid,
          balance_id: batch._id,
          sirket_id: me.sirket_id._id,
          card_id: c.card_id,
          perm_id: permId ?? undefined,
          total_balance: newTotal,
          last_balance: lastBalance,
          added_balance: c.count,
          updatedBy: me._id,
          refModel: "PeopleUser",
          status: "waiting",
        });
      }
    }

    await AddedBalance.insertMany(docs);

    return res.status(201).json({
      message: "Balances queued",
      balance_id: batch._id,
      per_user_total: perUserTotal,
      users: allowedIds.length,
      items: docs.length,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err?.message });
  }
};

export const exportPeopleToExcel = async (req, res) => {
  try {
    const { selectedIds, exportType } = req.body;

    // Get current user
    const currentUser = await PeopleUser.findById(req.user?.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: res.__("messages.avankartPartner.unauthorized") });
    }

    // Build query based on export type
    let query = { sirket_id: currentUser.sirket_id };

    if (exportType === 'selected' && selectedIds && selectedIds.length > 0) {
      // Convert string IDs to ObjectIds and validate
      const objectIds = selectedIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));

      if (objectIds.length === 0) {
        return res.status(400).json({ message: "Seçilmiş istifadəçilər düzgün deyil" });
      }

      query._id = { $in: objectIds };
    }

    // Fetch people data with necessary fields
    const people = await PeopleUser.find(query)
      .select({
        // fullname: 1,
        name: 1,
        surname: 1,
        people_id: 1,
        email: 1,
        phone: 1,
        gender: 1,
        position: 1,
        department: 1,
        balance: 1,
        createdAt: 1,
        status: 1,
        isActive: 1
      })
      .lean();

    console.log('----people----', people);


    if (people.length === 0) {
      return res.status(404).json({ message: "Export ediləcək məlumat tapılmadı" });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Əməkdaşlar');

    // Set workbook properties
    workbook.creator = 'Avankart System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Define columns with styling
    worksheet.columns = [
      { header: 'İşçi ID', key: 'people_id', width: 20 },
      { header: 'Ad və Soyad', key: 'fullname', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefon', key: 'phone', width: 18 },
      { header: 'Cins', key: 'gender', width: 12 },
      { header: 'Vəzifə', key: 'position', width: 20 },
      { header: 'Şöbə', key: 'department', width: 20 },
      { header: 'Balans', key: 'balance', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Qeydiyyat Tarixi', key: 'createdAt', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Add borders to header
    headerRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    people.forEach((person, index) => {
      const row = worksheet.addRow({
        people_id: person.people_id || 'N/A',
        fullname: `${person.name} ${person.surname}` || 'N/A',
        email: person.email || 'N/A',
        phone: person.phone || 'N/A',
        gender: person.gender === 'male' ? 'Kişi' :
          person.gender === 'female' ? 'Qadın' :
            person.gender || 'N/A',
        position: person.position || 'N/A',
        department: person.department || 'N/A',
        balance: person.balance ? `${person.balance} AZN` : '0 AZN',
        status: person.isActive ? 'Aktiv' : 'Deaktiv',
        createdAt: person.createdAt ?
          new Date(person.createdAt).toLocaleDateString('az-AZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'N/A'
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
      }

      // Add borders to data rows
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Add summary information
    const summaryRow = worksheet.addRow({});
    summaryRow.getCell(1).value = `Ümumi sayı: ${people.length}`;
    summaryRow.getCell(1).font = { bold: true };
    summaryRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE699' }
    };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, column.width || 10), 50);
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const exportTypeText = exportType === 'selected' ? 'secilmis' : 'butun';
    const filename = `emekdaslar_${exportTypeText}_${timestamp}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Write Excel file to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Excel export error:', err);
    return res
      .status(500)
      .json({
        message: "Excel export zamanı xəta baş verdi",
        error: err?.message
      });
  }
};
