let istati = [['compass', 'printer', 'clipboard2-pulse'],
			['hourglass-split', 'clipboard2-pulse']];
let lstati = [['In attesa di associazione al tavolo', 'In attesa di stampa', 'In lavorazione'],
			['In attesa', 'In lavorazione']];


function orderSummary(id) {
	current_id = id;
	if (confirmed[current_id] == null) {
		initList();
		dialog('Ordine non trovato', 'L\'ordine ' + id + ' non è presente nell\'archivio locale');
		return;
	}
	
	loadOrderHeader(confirmed[current_id], 'info', 'lastMenu();');
	let out = '';
	if (!isThisSession(confirmed[current_id].created_at))
		out += '<div class="p-2 alert alert-danger"><strong class="text-danger">Attenzione!</strong> Il presente ordine non è stato emesso in questo turno di servizio. Verifica la data sulla comanda!</div>';
	out += '<h4 class="mb-0">Cliente: <strong>' + confirmed[current_id].customer + '</strong></h4>';

	let guests = confirmed[current_id].guests
	out += (guests != null ? '&emsp;<strong>' + guests + '</strong> copert' + (guests == 1 ? 'o' : 'i') : '');

	let notes = confirmed[current_id].notes;
	out += (notes != null && notes.length > 0 ? '<br>&emsp;<i class="bi bi-sticky-fill"></i>&nbsp;' + notes : '');

	if (confirmed[current_id].is_take_away) {
		out += '<h4 class="mt-2">Ordine per ASPORTO</h4>';
	} else {
		let table = confirmed[current_id].table;
		let has_table = table != null && table != '';

		out += '<h4 class="mt-2 mb-0">Tavolo: <strong>';
		if (has_table) {
			out += table;
		} else {
			if (orders[current_id] == null)
				orders[current_id] = confirmed[current_id];
			out += '<small class="text-body-secondary"><i>non associato</i>&emsp;<button class="btn btn-sm btn-success" onclick="associateOrder(' + current_id + ');">Associa ora</button></small>';
		}

		out += '</strong>';
		
		let started_to_print = false;
		if (confirmed[current_id].tickets != null) {
			confirmed[current_id].tickets.forEach(ticket => { if (ticket.is_printed) started_to_print = true; });
		}
		if (!started_to_print)
			out += '&emsp;<button class="btn btn-sm btn-outline-danger" onclick="confirmRollback();">Dissocia</button>';
		out += '</h4>';

		if (confirmed[current_id].done_at != null)
			out += '&emsp;Associato da <strong><i>te stesso</i></strong>';
		else if (confirmed[current_id].confirmed_at != null && confirmed[current_id].confirmed_by)
			out += '&emsp;Associato da <strong>' + confirmed[current_id].confirmed_by.username + '</strong> alle ' + formatTime(confirmed[current_id].confirmed_at);
	}

	if (confirmed[current_id].tickets != null) {
		out += '<br><hr>';
		confirmed[current_id].tickets.forEach(ticket => {
			out += '<div class="row">';
			out += '<div class="col"><h4 class="mb-0 text-info">Comanda ' + ticket.category.name + '</h4></div>';
			out += '<div class="col-auto"><button class="btn btn-sm btn-light" onclick="showTicket(' + ticket.category.id + ');"><i class="bi bi-list-task"></i> Leggi</button></div>';
			out += '</div>';

			let c_at = new Date(confirmed[current_id].confirmed_at);
			let p_at = new Date(c_at.getTime() + ticket.category.print_delay * 1000);
			let print_at = formatTime(p_at.toISOString());

			if (ticket.is_printed) {
				out += '<strong class="text-success"><i class="bi bi-check-square"></i> Stampata</strong> alle ore ' + print_at;
			} else {
				out += '<i class="bi bi-check-square"></i> Stampa prevista alle ore ' + print_at;
			}
		});
	}

	$('#page-body')
	.css('opacity', 0)
	.html(out)
	.animate({opacity: 1});
}


function showTicket(tipo) {
	out = '';
	$.getJSON("ajax.php?a=comanda&id=" + confirmed[current_id].id + "&tipo=" + tipo)
	.done(function(json) {
		try {
			tipologia = null;
			$.each(json, function(i, art) {
				if (art.tipologia != tipologia) {
					out += '<h6 class="' + (tipologia != null ? 'mt-3 ' : '') + 'p-2 text-light" style="background: var(--bs-gray);">' + art.tipologia + '</h6>';
					tipologia = art.tipologia;
				}
				out += '<div class="row"><div class="col-1">' + art.quantita + '</div><div class="col">' + art.descrizione + '</div></div>';
				if (art.note.length > 0)
					out += '<div class="row"><div class="col-1"></div><div class="col"><i class="bi bi-sticky-fill"></i>&nbsp;' + art.note + '</div></div>';
			});
		} catch (err) {
			out = '<span class="text-danger"><strong>Errore nell\'elaborazione della richiesta:</strong></span>' + json;
		}
	})
	.fail(function(jqxhr, textStatus, error) {
		out = '<span class="text-danger"><strong>Errore durante la richiesta:</strong></span>' + jqxhr.responseText;
	})
	.always(function() {
		dialog((tipo == 1 ? '<strong class="text-info">Comanda bevande</strong>' : '<strong style="color: var(--bs-orange);">Comanda cucina</strong>'), out);
	});
}


function confirmRollback() {
	dialog('Dissocia tavolo', 'Sei sicuro di voler annullare l\'associazione al tavolo di questo ordine?<br><br><span id="msgdrip"></span>', '<button class="btn btn-success" onclick="rollback();"><i class="bi bi-check-circle-fill"></i> Conferma</button>');
}


function rollback() {
	localStorage.setItem('rollback_' + current_id, JSON.stringify({ id: current_id, done_at: Date.now()	}));
	
	confirmed[current_id].table = null;
	orders[current_id] = confirmed[current_id];
	confirmed[current_id] = null;
	current_id = null;

	modal.hide();
	lastAssociated();
}


function lastMenu() {

}

