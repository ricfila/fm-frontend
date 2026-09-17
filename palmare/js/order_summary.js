var required_for_summary = {
	include_confirmer_user: true,
	include_tickets: true,
	include_products: true,
	include_products_product: true
};
var lastMenuFunction = null;


async function orderSummary(id) {
	current_id = id;
	let current_order = confirmed[current_id];

	if (current_order == null) {
		initList();
		dialog('Ordine non trovato', 'L\'ordine ' + id + ' non è presente nell\'archivio locale');
		return;
	}
	
	loadOrderHeader(current_order, 'info', 'window[\'lastMenuFunction\']();');
	let out = '';
	if (!isThisSession(confirmed[current_id].created_at))
		out += '<div class="p-2 alert alert-danger"><strong class="text-danger">Attenzione!</strong> Il presente ordine non è stato emesso in questo turno di servizio. Verifica la data sulla comanda!</div>';

	let guests = current_order.guests;
	if (guests != null)
		out += '<h4><i class="bi bi-fork-knife me-2"></i>Copert' + (guests == 1 ? 'o' : 'i') + ': <strong>' + guests + '</strong></h4>';
	
	if (current_order.is_take_away) {
		out += '<h4 class="mt-2"><i class="bi bi-handbag me-2"></i>Ordine per asporto</h4>';
	} else {
		if (current_order.has_tickets === false)
			out += '<h4 class="mt-2"><i class="bi bi-lightning-charge-fill me-2"></i>Ordine Flash</h4>';
		
		if (current_order.parent_order_id != null) {
			out += '<h4 class="mt-2"><i class="bi bi-plus-circle me-2"></i>Ordine di aggiunta al ' + current_order.parent_order_id + '</h4>'; //TODO add link
			if (current_order.parent_order == null) {
				let parent_order = await fetchOrder(current_order.parent_order_id, required_for_summary);
				current_order.parent_order = parent_order;
				confirmed[current_id].parent_order = parent_order;
			}
		}

		if (current_order.guests == null && current_order.table != null)
			out += '<h4 class="mt-2"><i class="bi bi-plus-circle me-2"></i>Ordine di aggiunta</h4>';

		if (current_order.has_tickets !== false) {
			let has_table = (current_order.table != null && current_order.table != '') ||
				(current_order.parent_order != null && current_order.parent_order.table != null && current_order.parent_order.table != '');
			out += '<h4 class="mt-2 amb-0"><i class="bi bi-diamond-fill me-2"></i>Tavolo: <strong>';

			if (has_table) {
				out += (current_order.parent_order == null ? current_order.table : current_order.parent_order.table);
				
				if (current_order.parent_order == null && current_order.guests != null) {
					// Can edit (or remove) table only if order is not an adding one
					let started_to_print = false;
					let finished_to_print = true;
					if (current_order.tickets != null) {
						current_order.tickets.forEach(ticket => {
							if (ticket.printed_at != null)
								started_to_print = true;
							else
								finished_to_print = false;
						});
					}
					if (!finished_to_print)
						out += '<button class="btn btn-sm btn-warning ms-2" onclick="orders[' + current_id + '] = confirmed[' + current_id + ']; associateOrder(' + current_id + ');"><i class="bi bi-pencil-fill me-2"></i>Modifica</button>';
					if (!started_to_print && current_order.needs_confirmation)
						out += '<button class="btn btn-sm btn-danger ms-2" onclick="confirmRollback();"><i class="bi bi-x-lg me-2"></i>Dissocia</button>';
				}

			} else {
				if (orders[current_id] == null)
					orders[current_id] = current_order;
				out += '<small class="text-body-secondary"><i>non associato</i>&emsp;<button class="btn btn-sm btn-success" onclick="associateOrder(' + current_id + ');">Associa ora</button></small>';
			}
			out += '</strong></h4>';

			if (current_order.done_at != null)
				out += '<p>Associato da <strong><i>te stesso</i></strong></p>';
			else if (current_order.confirmed_at != null && current_order.confirmed_by != null) {
				let name = current_order.confirmed_by.username;
				if (name == username)
					name = '<i>te stesso</i>';
				out += '<p>Associato da <strong>' + name + '</strong> alle ' + formatTime(confirmed[current_id].confirmed_at) + '</p>';
			}
		}
	}

	let notes = current_order.notes;
	if (notes != null && notes.length > 0)
		out += '<p><strong>Note:</strong> ' + notes + '</p>';


	if (current_order.tickets != null && current_order.tickets.length > 0) {
		out += '<hr>';
		out += ticketList(current_order, true);
	}

	let products_outside_categories = false;
	current_order.products.forEach(p => {
		if (p.category_id == null)
			products_outside_categories = true;
	});
	if (products_outside_categories) {
		out += '<p><button class="btn btn-sm btn-light" onclick="showTicket(null);"><i class="bi bi-list-task me-2"></i>Leggi articoli non inclusi nelle comande</button></p>';
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
				out += '<div class="row"><div class="col-1"></div><div class="col"><i class="bi bi-arrow-return-right me-2"></i>' + product.notes + '</div></div>';
		}
	});

	dialog('<strong class="text-info">' + (cat_id != null ? 'Comanda ' + categories[cat_id].name : 'Articoli non inclusi nelle comande') + '</strong>', out);
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
