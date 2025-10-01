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

	let guests = confirmed[current_id].guests
	if (guests != null)
		out += '<h4><i class="bi bi-fork-knife"></i> Copert' + (guests == 1 ? 'o' : 'i') + ': <strong>' + guests + '</strong></h4>';

	let notes = confirmed[current_id].notes;
	if (notes != null && notes.length > 0)
		out += '&emsp;<i class="bi bi-sticky-fill"></i>&nbsp;' + notes;

	if (confirmed[current_id].is_take_away) {
		out += '<h4 class="mt-2"><i class="bi bi-handbag"></i> Ordine per ASPORTO</h4>';
	} else {
		let table = confirmed[current_id].table;
		let has_table = table != null && table != '';

		out += '<h4 class="mt-2 mb-0"><i class="bi bi-compass-fill"></i> Tavolo: <strong>';
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
		else if (confirmed[current_id].confirmed_at != null && confirmed[current_id].confirmed_by) {
			let name = confirmed[current_id].confirmed_by.username;
			name = name == username ? '<i>te stesso</i>' : name;
			out += '&emsp;Associato da <strong>' + name + '</strong> alle ' + formatTime(confirmed[current_id].confirmed_at);
		}
	}

	if (confirmed[current_id].tickets != null) {
		out += '<br><hr>';
		confirmed[current_id].tickets.forEach(ticket => {
			out += '<div class="row">';
			out += '<div class="col"><h4 class="mb-0 text-info">Comanda ' + categories[ticket.category_id].name + '</h4></div>';
			out += '<div class="col-auto"><button class="btn btn-sm btn-light" onclick="showTicket(' + ticket.category_id + ');"><i class="bi bi-list-task"></i> Leggi</button></div>';
			out += '</div>';

			let c_at = new Date(confirmed[current_id].confirmed_at);
			let p_at = new Date(c_at.getTime() + categories[ticket.category_id].print_delay * 1000);
			let print_at = formatTime(p_at.toISOString());

			if (ticket.is_printed) {
				out += '<p><strong class="text-success"><i class="bi bi-check-square"></i> Stampata</strong> alle ore ' + print_at + '</p>';
			} else {
				out += '<p><i class="bi bi-square"></i> Stampa prevista alle ore ' + print_at + '</p>';
			}
		});
	}

	$('#page-body')
	.css('opacity', 0)
	.html(out)
	.animate({opacity: 1});
}


function showTicket(cat_id) {
	let out = '';
	let subcat = null;
	let products = confirmed[current_id].products;

	products.sort(function(a, b) {
		if (a == null || b == null) return 0;
		return subcategories[a.product.subcategory_id].order - subcategories[b.product.subcategory_id].order;
	}).forEach(product => {
		if (product.category_id == cat_id) {
			if (product.product.subcategory_id != subcat) {
				out += '<h6 class="' + (subcat != null ? 'mt-3 ' : '') + 'p-2 text-light" style="background: var(--bs-gray);">' + subcategories[product.product.subcategory_id].name + '</h6>';
				subcat = product.product.subcategory_id;
			}
			out += '<div class="row"><div class="col-1">' + product.quantity + '</div><div class="col">' + product.product.name + '</div></div>';
			if (product.notes != null && product.notes.length > 0)
				out += '<div class="row"><div class="col-1"></div><div class="col"><i class="bi bi-arrow-return-right"></i>&nbsp;' + product.notes + '</div></div>';
		}
	});

	dialog('<strong class="text-info">Comanda ' + categories[cat_id].name + '</strong>', out);
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

