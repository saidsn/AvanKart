import Invoice from "../../../shared/models/invoysSirketModel.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";

export const hesablasmaPage = async (req, res) => {
  try {
    const currentUser = await PeopleUser.findById(req.user.id)
    .populate({ path: 'sirket_id', select: 'commission_percentage', options: { lean: true } })
    .exec();
    if (!currentUser) {
      return res.redirect("/auth/login");
    }

    const invoices = await Invoice.find({ sirket_id: currentUser.sirket_id });

    let totalBalance = 0;
    let complatedBalance = 0;
    let waitingBalance = 0;
    let minAmount = 0;
    let maxAmount = 30000; // Default max value

    // Calculate amounts and find min/max
    invoices.forEach(invoice => {
      const balance = invoice.balance || 0;
      totalBalance += balance;

      if (invoice.status === 'complated') {
        complatedBalance += balance;
      } else {
        waitingBalance += balance;
      }
    });

    if (invoices.length > 0) {
      const amounts = invoices.map(inv => inv.balance || 0);
      minAmount = Math.min(...amounts);
      maxAmount = Math.max(...amounts);
    }

    console.log(complatedBalance,"complated")
    console.log(totalBalance,"from total balance")
    return res.render("pages/hesablasmalar/hesablasmalar", {
      title: "Hesablaşma",
      user: req.user,
      minAmount,
      maxAmount,
      comission_percentage: currentUser?.sirket_id?.commission_percentage ?? 0,
      counts: {
        total: totalBalance,
        waiting_aktiv: waitingBalance,
        waiting_tamamlandi: 0,
        tamamlandi: complatedBalance
      },
      totalBalance,
      complatedBalance,
      waitingBalance,
      csrfToken: req.csrfToken(),
      layout: "./layouts/main.ejs"
    });

  } catch (error) {
    return res.status(500).send("Server error");
  }
};
