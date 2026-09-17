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
		return 'Accesso non autorizzato.';
	} else if (jqXHR.status === 403) {
		return 'Utente non autorizzato.';
	} else if (jqXHR.status === 404) {
		return 'Risorsa non trovata. Controlla l\'URL della richiesta.';
	} else if (jqXHR.status >= 500) {
		return 'Errore interno del server. Riprova più tardi.';
	} else {
		return `Errore ${jqXHR.status}: ${textStatus} ${errorThrown}<br><strong>${jqXHR.responseJSON.message}</strong>`;
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

async function fetchOrder(id, params) {
	try {
		return await $.ajax({
			async: true,
			url: apiUrl + '/orders/' + id,
			type: "GET",
			data: params,
			contentType: 'application/json; charset=utf-8',
			headers: { "Authorization": "Bearer " + token }
		});
	} catch (jqXHR) {
		showError(getErrorMessage(jqXHR, jqXHR.statusText, jqXHR.errorThrown));
		return null;
	}
}

function getKeyboard(placeholder, sign = false) {
	let out = '';
	out += '<div class="row"><div class="col" style="padding: 2px;">\
				<div class="input-group mb-3">' + (sign ? '\
					<button class="btn btn-success btn-lg" id="keyboardSign" onclick="toggleKeyboardSign();"><i class="bi bi-plus-lg"></i></button><input type="number" class="d-none" id="keyboardSignValue" value="1"></input>' : '') + '\
					<input type="text" class="form-control form-control text-center" id="inputKeyboard" style="padding: 5px; font-size: 1.5em; margin: 0px;" placeholder="' + placeholder + '">\
					<button class="btn btn-dark btn-lg" onclick="key(false);"><i class="bi bi-backspace"></i></button>\
				</div>\
			</div></div>\
			<div class="row">\
				<div class="col" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'1\');">1</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'4\');">4</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'7\');">7</button><br>\
				</div>\
				<div class="col" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'2\');">2</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'5\');">5</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'8\');">8</button><br>\
				</div>\
				<div class="col" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'3\');">3</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'6\');">6</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn" onclick="key(\'9\');">9</button><br>\
				</div>\
			</div>\
			<div class="row">\
				<div class="col"></div>\
				<div class="col-4" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 keyboard-btn btnlater disabled" onclick="key(\'0\');">0</button>\
				</div>\
				<div class="col"></div>\
			</div>';
			
	return out;
}

function key(string) {
	if (!string) {
		$('#inputKeyboard').val('');
		$('.btnlater').each(function() {$(this).addClass('disabled');});
	} else {
		$('#inputKeyboard').val($('#inputKeyboard').val() + string);
		$('.btnlater').each(function() {$(this).removeClass('disabled');});
	}
}

function toggleKeyboardSign() {
	$('#keyboardSignValue').val($('#keyboardSignValue').val() * -1);
	if ($('#keyboardSignValue').val() > 0) {
		$('#keyboardSign').removeClass('btn-danger').addClass('btn-success').html('<i class="bi bi-plus-lg"></i>');
	} else {
		$('#keyboardSign').removeClass('btn-success').addClass('btn-danger').html('<i class="bi bi-dash-lg"></i>');
	}
}

function ticketList(order, showTicketBtn = false) {
	ordered_tickets = [...(order.tickets)].sort((a, b) => {
		const delayA = categories[a.category_id] ? categories[a.category_id].print_delay : 0;
		const delayB = categories[b.category_id] ? categories[b.category_id].print_delay : 0;
		return delayA - delayB;
	});

	let out = '';
	ordered_tickets.forEach(ticket => {
		out += '<div class="row">';
		out += '<div class="col"><h4 class="mb-0 text-info">Comanda ' + categories[ticket.category_id].name + '</h4></div>';
		if (showTicketBtn)
			out += '<div class="col-auto"><button class="btn btn-sm btn-light" onclick="showTicket(' + ticket.category_id + ');"><i class="bi bi-list-task me-2"></i>Leggi</button></div>';
		out += '</div>';

		out += ticketStory(order, ticket);
	});
	
	return out;
}

function ticketStory(order, ticket) {
	let out = '<p>';

	if (ticket.printed_at != null) {
		out += '<strong class="text-success"><i class="bi bi-printer-fill me-2"></i>Stampata</strong> alle ' + formatTime(ticket.printed_at) + '<br>';
	} else {
		let trigger_time = null;

		if (!categories[ticket.category_id].wait_parent_category) {
			if (order.needs_confirmation)
				if (order.confirmed_at != null)
					trigger_time = new Date(order.confirmed_at);
				else
					out += '<i class="bi bi-hourglass me-2"></i>In attesa dell\'associazione del tavolo<br>';
			else
				trigger_time = new Date(order.created_at);
		} else {
			let parent_category = categories[categories[ticket.category_id].parent_category_id];
			let parent_ticket = order.tickets.find(ticket => ticket.id == parent_category.id);

			if (parent_ticket == null)
				out += '<div class="p-2 alert alert-danger"><strong class="text-danger">Attenzione!</strong> Comanda in attesa del completamento della comanda ' + parent_category.name + ', inesistente per quest\'ordine! Richiederne la stampa forzata.</div>';
			else
				if (parent_ticket.completed_at != null)
					trigger_time = new Date(parent_ticket.completed_at);
				else
					out += '<i class="bi bi-hourglass me-2"></i>In attesa del completamento della comanda ' + parent_category.name + '<br>';
		}

		if (trigger_time != null) {
			let print_time = new Date(trigger_time.getTime() + ((order.needs_confirmation && !categories[ticket.category_id].wait_parent_category ? settings.delay_after_confirmation : 0) + categories[ticket.category_id].print_delay) * 1000);
			let print_at = formatTime(print_time.toISOString());
			out += '<i class="bi bi-printer me-2"></i>' + (ticket.completed_at != null ? '<span style="text-decoration: line-through;">' : '') + 'Stampa prevista alle ' + print_at + (ticket.completed_at != null ? '</span>' : '') + '<br>';
		}
	}
	if (ticket.completed_at != null) {
		out += '<strong class="text-success"><i class="bi bi-check-circle-fill me-2"></i>Evasa</strong> alle ' + formatTime(ticket.completed_at);
	}

	out +='</p>';
	return out;
}

function orderMenuRow(id, customer, delay, id_to_show = null) {
	if (id_to_show == null)
		id_to_show = id;
	return '<button class="btn btn-secondary w-100 mb-3 btn-ordermenu" style="animation-delay: ' + delay + 's;" onclick="actionOrderMenu(' + id + ');"><div class="row"><div class="col-4 my-auto"><big>' + id_to_show + '</big></div><div class="col my-auto">' + customer + '</div></div></button>';
}
