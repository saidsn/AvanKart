import PeopleUser from "../../../shared/models/peopleUserModel.js";
import PeopleCardBalance from "../../../shared/model/people/cardBalances.js";
import TempPeopleUserDelete from "../../../shared/model/people/tempPeopleUserDelete.js";
import Cards from "../../../shared/models/cardModel.js";

const STATUS_LABELS = { 0: "Aktiv", 1: "Deaktiv", 2: "Silinib" };
const GENDER_LABELS = { male: "Kişi", female: "Qadın", other: "Digər" };

function formatDate(date) {
	if (!date) return { iso: null, formatted: "—" };
	const d = new Date(date);
	const formatted = d
		.toLocaleString("az-Latn-AZ", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
		.replace(",", " -");
	return { iso: d.toISOString(), formatted };
}

function formatBirth(date) {
	if (!date) return { iso: null, formatted: "—" };
	const d = new Date(date);
	const formatted = d.toLocaleDateString("az-Latn-AZ", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
	return { iso: d.toISOString(), formatted };
}

function diffHuman(from, to = new Date()) {
	if (!from) return { days: 0, hours: 0, minutes: 0, human: "—" };
	const ms = Math.max(0, to - new Date(from));
	const days = Math.floor(ms / 86400000);
	const hours = Math.floor((ms % 86400000) / 3600000);
	const minutes = Math.floor((ms % 3600000) / 60000);
	const human = `${days} gün, ${hours} saat`;
	return { days, hours, minutes, human };
}

export const getPeopleInsideDetail = async (req, res) => {
	try {
		const { peopleId } = req.params;

		let user = await PeopleUser.findOne({ people_id: peopleId })
			.populate("duty", "name")
			.populate("sirket_id", "sirket_name");
		if (!user && peopleId.match(/^[0-9a-fA-F]{24}$/)) {
			user = await PeopleUser.findById(peopleId)
				.populate("duty", "name")
				.populate("sirket_id", "sirket_name");
		}
		if (!user) return res.status(404).json({ message: "İstifadəçi tapılmadı" });

		const [pendingDocs, balances] = await Promise.all([
			TempPeopleUserDelete.find({ users: user._id }).select("users").lean(),
			PeopleCardBalance.find({ user_id: user._id }).lean(),
		]);

		const cardIds = [...new Set(balances.map((b) => b.card_id).filter(Boolean))];
		const cards = cardIds.length
			? await Cards.find({ _id: { $in: cardIds } })
					.select("name icon background_color")
					.lean()
			: [];
		const cardMap = new Map(cards.map((c) => [String(c._id), c]));

		const pendingDelete =
			pendingDocs.some((doc) => doc.users.some((u) => String(u) === String(user._id))) &&
			user.status !== 2;

		const createdAtFmt = formatDate(user.createdAt);
		const registrationDuration = diffHuman(user.createdAt);
		const birthDateFmt = formatBirth(user.birth_date);

		const twoFactorEnabled = [
			user.otp_email_status,
			user.otp_sms_status,
			user.otp_authenticator_status,
		].includes(2);
		let statusLabel = STATUS_LABELS[user.status] || "—";
		if (pendingDelete) statusLabel = "Silinmə gözləyir";

		const phoneDisplay = `+${user.phone_suffix || 994} ${user.phone || ""}`.trim();

		const cardBalances = balances.map((b) => {
			const c = b.card_id ? cardMap.get(String(b.card_id)) : null;
			return {
				cardId: c?._id || b.card_id || null,
				name: c?.name || "—",
				icon: c?.icon || null,
				backgroundColor: c?.background_color || null,
				balance: b.balance ?? 0,
				lastPaymentAt: b.lastPayment ? new Date(b.lastPayment).toISOString() : null,
			};
		});

		const totalBalanceSum = cardBalances.reduce((acc, c) => acc + (c.balance || 0), 0);

		return res.json({
			user: {
				id: user._id,
				people_id: user.people_id,
				name: user.name || "",
				surname: user.surname || "",
				fullName: `${user.name || ""} ${user.surname || ""}`.trim(),
				gender: { code: user.gender, label: GENDER_LABELS[user.gender] || "—" },
				birthDate: birthDateFmt,
				duty: user.duty ? { id: user.duty._id, name: user.duty.name } : null,
				company: user.sirket_id
					? { id: user.sirket_id._id, name: user.sirket_id.sirket_name }
					: null,
				email: user.email || "—",
				phone: { raw: user.phone || null, prefix: "+994", display: phoneDisplay },
				membership: { label: user.sirket_id?.sirket_name || "—" },
				createdAt: createdAtFmt,
				registrationDuration,
				status: { code: user.status, label: statusLabel, pendingDelete, pendingDeactivation: false },
				twoFactor: {
					email: user.otp_email_status,
					sms: user.otp_sms_status,
					authenticator: user.otp_authenticator_status,
					enabled: twoFactorEnabled,
				},
			},
			cardBalances,
			totals: { totalBalance: Number(totalBalanceSum.toFixed(2)), cardCount: cardBalances.length },
			meta: { now: new Date().toISOString(), version: 1 },
		});
	} catch (err) {
		console.error("getPeopleInsideDetail error:", err);
		return res.status(500).json({ message: "Server xətası" });
	}
};
