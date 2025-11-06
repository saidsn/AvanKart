(function () {
	let currentStatusCode = null; // 0=Aktiv,1=Deaktiv,2=Silinib
	function getPeopleIdFromUrl() {
		const parts = window.location.pathname.split('/').filter(Boolean);
		return parts[parts.length - 1];
	}

	const peopleId = getPeopleIdFromUrl();
	if (!peopleId) return;

		function postAction(path) {
			const csrf = document.querySelector("meta[name='csrf-token']")?.content || '';
				console.log('[peopleInside] action:start', path, { peopleId });
			return fetch(`/api/people/${peopleId}/${path}`, {
				method: 'POST',
				credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRF-Token': csrf
						}
			})
					.then(async r => {
						let json = null;
						try { json = await r.json(); } catch (e) { console.warn('[peopleInside] action:json-parse-fail', path, e); }
						console.log('[peopleInside] action:response', path, { status: r.status, ok: r.ok, body: json });
						return json;
					})
					.then(data => {
						if (data?.success) {
							console.log('[peopleInside] action:success -> reload()', path);
							reload();
						} else {
							console.warn('[peopleInside] action:failed', path, data);
						}
			})
			.catch(e => console.error('postAction error', e));
	}

	window.activatePeopleUser = () => postAction('activate');
	window.deactivatePeopleUser = () => postAction('deactivate');
	window.requestDeletePeopleUser = () => {
		postAction('delete-request');
		// Optimistic UI: show pending delete badge immediately
		const pendingDeleteBadge = document.getElementById('pendingDeleteBadge');
		if (pendingDeleteBadge) pendingDeleteBadge.classList.remove('hidden');
		const deleteMenuText = document.getElementById('deleteMenuText');
		if (deleteMenuText) deleteMenuText.textContent = 'Silinmə göndərildi';
		const deleteMenuIcon = document.getElementById('deleteMenuIcon');
		if (deleteMenuIcon) deleteMenuIcon.className = 'icon stratis-clock-01 text-error text-[13px]';
	};
			window.toggleActivation = () => {
				console.log('[peopleInside] toggleActivation statusCode=', currentStatusCode);
				if (currentStatusCode === 2) {
					console.warn('[peopleInside] toggleActivation blocked: deleted user');
					return;
				}
				if (currentStatusCode === 1) { // currently Deaktiv -> activate
					return window.activatePeopleUser();
				}
				if (currentStatusCode === 0) { // currently Aktiv -> deactivate
					return window.deactivatePeopleUser();
				}
				console.warn('[peopleInside] toggleActivation unknown status, fallback deactivate');
				return window.deactivatePeopleUser();
			};

	function render(payload) {
		if (!payload || !payload.user) return;
		const u = payload.user;
		const initials = (u.name?.[0] || '') + (u.surname?.[0] || '');
		const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = (val ?? '—'); };

		setText('userAvatarInitials', initials.toUpperCase());
		setText('userFullName', u.fullName || '—');
		setText('userFullNamePath', u.fullName || '—');
		setText('userPeopleId', u.people_id || '—');
		setText('fieldGender', u.gender?.label);
		setText('fieldBirthDate', u.birthDate?.formatted);
		setText('fieldDuty', u.duty?.name || '—');
		setText('fieldCompany', u.company?.name || '—');
		setText('fieldEmail', u.email || '—');
		setText('fieldMembership', u.membership?.label || '—');
		setText('fieldPhone', u.phone?.display || '—');
		setText('fieldCreatedAt', u.createdAt?.formatted || '—');
		setText('fieldRegDuration', u.registrationDuration?.human || '—');

		const statusLabelEl = document.getElementById('statusLabel');
		const statusDot = document.getElementById('statusDot');
		const pendingDeleteBadge = document.getElementById('pendingDeleteBadge');
		currentStatusCode = u.status?.code;
		// Show pure activation label (Aktiv/Deaktiv/Silinib) in primary badge, and separate yellow badge if pending delete
		const RAW_STATUS_LABELS = { 0: 'Aktiv', 1: 'Deaktiv', 2: 'Silinib' };
		const rawActivationLabel = RAW_STATUS_LABELS[currentStatusCode] || '—';
		if (statusLabelEl) statusLabelEl.textContent = rawActivationLabel;
		if (pendingDeleteBadge) {
			if (u.status?.pendingDelete && currentStatusCode !== 2) {
				pendingDeleteBadge.classList.remove('hidden');
			} else {
				pendingDeleteBadge.classList.add('hidden');
			}
		}
		if (statusDot) {
			let color = '#00A3FF';
			if (currentStatusCode === 1) color = '#666';
			else if (currentStatusCode === 2) color = '#E53935';
			statusDot.className = 'w-[6px] h-[6px] rounded-full';
			statusDot.style.backgroundColor = color;
		}

			// Update menu item text/icon
			const actText = document.getElementById('activationMenuText');
			const actIcon = document.getElementById('activationMenuIcon');
					if (actText && actIcon) {
						if (currentStatusCode === 1) { // Deaktiv
							actText.textContent = 'Aktiv et';
							actIcon.className = 'icon stratis-check-broken text-success text-[13px]';
						} else if (currentStatusCode === 2) { // Silinib
							actText.textContent = 'Silinib';
							actIcon.className = 'icon stratis-minus-circle-contained text-error text-[13px] opacity-40';
						} else { // 0 or other -> Aktiv
							actText.textContent = 'Deaktiv et';
							actIcon.className = 'icon stratis-minus-circle-contained text-error text-[13px]';
						}
				} else {
					console.warn('[peopleInside] activationMenu elements not found at render time');
			}

		const twoFaIcon = document.getElementById('twoFactorIcon');
		if (twoFaIcon) {
			if (u.twoFactor?.enabled) {
				twoFaIcon.className = 'icon stratis-check-broken text-sm text-success';
			} else {
				twoFaIcon.className = 'icon stratis-minus-circle-contained text-sm text-error';
			}
		}

		const wrap = document.getElementById('cardBalancesWrapper');
		if (wrap) {
			wrap.innerHTML = '';
			(payload.cardBalances || []).forEach(card => {
				
				const container = document.createElement('div');
				container.className = 'w-[calc(50%-4px)] flex gap-2 bg-sidebar-bg rounded-[12px]';

				// img wrapper
				const imgWrap = document.createElement('div');
				imgWrap.className = 'pl-2 py-[14.5px] flex items-center justify-center rounded-[8px]';
				imgWrap.style.backgroundColor = card.background_color || 'transparent';

				const img = document.createElement('img');
				img.className = 'w-[20px] h-[20px] object-contain';
				img.alt = card.name || 'Card';

				// ikon yolu
				const ICON_IMAGE_FOLDER = '/icons';
				const ICON_GENERIC_FOLDER = '/icons/';
				const FALLBACK_ICON = ICON_GENERIC_FOLDER + 'card-01.svg';
				let rawIcon = (card.icon || '').replace(/\.svg$/i, '').trim();
				let resolved = '';
				if (!rawIcon) resolved = ICON_IMAGE_FOLDER + 'chevron-down.svg';
				else if (rawIcon.startsWith('/') || rawIcon.startsWith('http')) resolved = rawIcon;
				else resolved = ICON_GENERIC_FOLDER + rawIcon + '.svg';
				img.src = resolved;
				img.onerror = () => { img.onerror = null; img.src = FALLBACK_ICON; };

				imgWrap.appendChild(img);

				// info bölümü
				const info = document.createElement('div');
				info.className = 'py-[14.5px]';

				const title = document.createElement('div');
				title.className = 'text-[11px] opacity-50';
				title.textContent = card.name || '—';

				const amount = document.createElement('div');
				amount.className = 'text-[17px] font-semibold';
				const balance = (card.balance ?? 0).toFixed(2) + ' ₼';
				amount.textContent = balance;

				info.appendChild(title);
				info.appendChild(amount);

				container.appendChild(imgWrap);
				container.appendChild(info);

				wrap.appendChild(container);

			});
		}
	}

	function reload() {
		fetch(`/api/people/${peopleId}/inside`, { credentials: 'include' })
			.then(r => r.json())
			.then(render)
			.catch(err => console.error('peopleInsideDetail fetch error', err));
	}

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', reload);
		} else {
			reload();
		}
})();
