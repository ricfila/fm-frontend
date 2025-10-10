var required_for_summary = {
	include_confirmer_user: true,
	include_tickets: true,
	include_products: true,
	include_products_product: true
};
var lastMenuFunction = null;


function orderSummary(id) {
	current_id = id;
	if (confirmed[current_id] == null) {
		initList();
		dialog('Ordine non trovato', 'L\'ordine ' + id + ' non è presente nell\'archivio locale');
		return;
	}
	
	loadOrderHeader(confirmed[current_id], 'info', 'window[\'lastMenuFunction\']();');
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
			
			let started_to_print = false;
			if (confirmed[current_id].tickets != null) {
				confirmed[current_id].tickets.forEach(ticket => {
					if (ticket.printed_at != null)
						started_to_print = true;
				});
			}
			if (!confirmed[current_id].is_done)
				out += '<button class="btn btn-sm btn-warning ms-2" onclick="orders[' + current_id + '] = confirmed[' + current_id + ']; associateOrder(' + current_id + ');"><i class="bi bi-pencil-fill"></i> Modifica</button>';
			if (!started_to_print)
				out += '<button class="btn btn-sm btn-danger ms-2" onclick="confirmRollback();"><i class="bi bi-x-lg"></i> Dissocia</button>';

		} else {
			if (orders[current_id] == null)
				orders[current_id] = confirmed[current_id];
			out += '<small class="text-body-secondary"><i>non associato</i>&emsp;<button class="btn btn-sm btn-success" onclick="associateOrder(' + current_id + ');">Associa ora</button></small>';
		}
		out += '</strong></h4>';

		if (confirmed[current_id].done_at != null)
			out += '&emsp;Associato da <strong><i>te stesso</i></strong>';
		else if (confirmed[current_id].confirmed_at != null && confirmed[current_id].confirmed_by) {
			let name = confirmed[current_id].confirmed_by.username;
			name = name == username ? '<i>te stesso</i>' : name;
			out += '&emsp;Associato da <strong>' + name + '</strong> alle ' + formatTime(confirmed[current_id].confirmed_at);
		}
	}

	if (confirmed[current_id].tickets != null) {
		out += '<hr>';
		out += ticketList(confirmed[current_id].tickets, categories, confirmed[current_id].confirmed_at, true);
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
	dialog('Dissocia tavolo', 'Sei sicuro di voler annullare l\'associazione al tavolo di questo ordine?<br><br><span id="msgdrip"></span>', 'Conferma', 'rollback();');
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
