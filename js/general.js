function setCookie(cname, cvalue) {
	const d = new Date();
	d.setTime(d.getTime() + (730 * 24 * 60 * 60 * 1000));
	let expires = 'expires='+ d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
	let name = cname + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

function getErrorMessage(jqXHR, textStatus, errorThrown) {
	console.error("Errore AJAX:", textStatus, errorThrown, jqXHR);

	if (jqXHR.status === 0) {
		return 'Impossibile connettersi al server. Il server potrebbe essere offline o irraggiungibile.';
	} else if (jqXHR.status === 401) {
		return 'Accesso non autorizzato. Controlla il tuo token.';
	} else if (jqXHR.status === 404) {
		return 'Risorsa non trovata. Controlla l\'URL della richiesta.';
	} else if (jqXHR.status >= 500) {
		return 'Errore interno del server. Riprova più tardi.';
	} else {
		return `Si è verificato un errore: ${textStatus} ${errorThrown}<br><strong>${jqXHR.responseJSON.message}</strong>`;
	}
}

function formatDateTime(fullStr) {
	const dateObj = new Date(fullStr);
	return new Intl.DateTimeFormat('it-IT', {
		weekday: 'short',
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(dateObj).replace(/\./g, '');
}

function formatShortDate(fullStr) {
	const dateObj = new Date(fullStr);
	return new Intl.DateTimeFormat('it-IT', {
		weekday: 'short',
		day: '2-digit',
		month: 'short',
	}).format(dateObj).replace(/\./g, '');
}

function formatTime(fullStr) {
	const dateObj = new Date(fullStr);
	return new Intl.DateTimeFormat('it-IT', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(dateObj);
}
