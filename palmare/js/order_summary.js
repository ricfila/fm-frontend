var required_for_summary = {
	include_confirmer_user: true,
	include_tickets: true,
	include_products: true,
	include_products_product: true
};


async function orderSummary(id) {
	current_id = id;
	let order = confirmed[current_id];

	if (order == null) {
		initList();
		dialog('Ordine non trovato', 'L\'ordine ' + id + ' non è presente nell\'archivio locale');
		return;
	}
	
	updateOrderHeader(order, 'info');
	let out = '';

	out += '<div class="text-end mb-3" astyle="margin-top: -1rem; background: #d0d2d4; border-radius: 0px 0px 5px 5px;">';
	out += '<span id="btnBookmark">' + btnBookmark() + '</span>';
	out += '<button class="btn btn-sm btn-info" onclick="reloadSummary();"><i class="bi bi-arrow-clockwise me-2"></i>Aggiorna</button>';
	out += '</div>';
	
	if (!isThisSession(order.created_at))
		out += '<div class="p-2 alert alert-danger"><strong class="text-danger">Attenzione!</strong> Il presente ordine non è stato emesso in questo turno di servizio!</div>';

	let guests = order.guests;
	if (guests != null)
		out += '<h4><i class="bi bi-fork-knife me-2"></i>Copert' + (guests == 1 ? 'o' : 'i') + ': <strong>' + guests + '</strong></h4>';
	
	if (order.is_take_away) {
		out += '<h4 class="mt-2"><i class="bi bi-handbag me-2"></i>Ordine per asporto</h4>';
	} else {
		if (order.has_tickets === false)
			out += '<h4 class="mt-2"><i class="bi bi-lightning-charge-fill me-2"></i>Ordine Flash</h4>';
		
		if (order.parent_order_id != null) {
			out += '<h4 class="mt-2"><i class="bi bi-plus-circle me-2"></i>Ordine di aggiunta al ' + order.parent_order_id + '</h4>'; //TODO add link
			if (order.parent_order == null) {
				let parent_order = await fetchOrder(order.parent_order_id, required_for_summary);
				order.parent_order = parent_order;
				confirmed[current_id].parent_order = parent_order;
			}
		}

		if (order.guests == null && order.table != null)
			out += '<h4 class="mt-2"><i class="bi bi-plus-circle me-2"></i>Ordine di aggiunta</h4>';

		if (order.has_tickets !== false) {
			let has_table = (order.table != null && order.table != '') ||
				(order.parent_order != null && order.parent_order.table != null && order.parent_order.table != '');
			out += '<h4 class="mt-2 amb-0"><i class="bi bi-diamond-fill me-2"></i>Tavolo: <strong>';

			if (has_table) {
				out += (order.parent_order == null ? order.table : order.parent_order.table) + '</strong></h4>';
				
				if (order.parent_order == null && order.guests != null) {
					// Can edit (or remove) table only if order is not an adding one
					let started_to_print = false;
					let finished_to_print = true;
					if (order.tickets != null) {
						order.tickets.forEach(ticket => {
							if (ticket.printed_at != null)
								started_to_print = true;
							else
								finished_to_print = false;
						});
					}
					if (!finished_to_print)
						out += '<button class="btn btn-sm btn-warning mb-3 me-2" onclick="orders[' + current_id + '] = confirmed[' + current_id + ']; associateOrder(' + current_id + ');"><i class="bi bi-pencil-fill me-2"></i>Modifica</button>';
					if (!started_to_print && order.needs_confirmation)
						out += '<button class="btn btn-sm btn-danger mb-3" onclick="rollback();"><i class="bi bi-x-lg me-2"></i>Dissocia</button>';
				}

			} else {
				if (orders[current_id] == null)
					orders[current_id] = order;
				out += '<small class="text-body-secondary"><i>non associato</i></small></strong></h4>';
				out += '<button class="btn btn-sm btn-success mb-3" onclick="associateOrder(' + current_id + ');"><i class="bi bi-compass-fill me-2"></i>Associa ora</button>';
			}

			if (order.done_at != null)
				out += '<p>Associato da <strong><i>te stesso</i></strong></p>';
			else if (order.confirmed_at != null && order.confirmed_by != null) {
				let name = order.confirmed_by.username;
				if (name == username)
					name = '<i>te stesso</i>';
				out += '<p>Associato da <strong>' + name + '</strong> alle ' + formatTime(order.confirmed_at) + '</p>';
			}
		}
	}

	let notes = order.notes;
	if (notes != null && notes.length > 0)
		out += '<p><strong>Note:</strong> ' + notes + '</p>';


	if (order.tickets != null && order.tickets.length > 0) {
		out += '<hr>';
		out += ticketList(order, true);
	}

	if (order.products != null) {
		let products_outside_categories = false;
		order.products.forEach(p => {
			if (p.category_id == null)
				products_outside_categories = true;
		});
		if (products_outside_categories) {
			out += '<p><button class="btn btn-sm btn-light" onclick="showTicket(null);"><i class="bi bi-list-task me-2"></i>Leggi articoli non inclusi nelle comande</button></p>';
		}
	}

	$('#page-body')
	.css('opacity', 0)
	.html(out)
	.animate({opacity: 1});
}


async function reloadSummary() {
	let order = await fetchOrder(current_id, required_for_summary);
	if (order == null) return;
	confirmed[current_id] = order;
	orderSummary(current_id);
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


async function rollback() {
	let ok = await modalConfirm('Dissocia tavolo', 'Sei sicuro di voler annullare l\'associazione al tavolo di questo ordine?');
	if (ok) {
		localStorage.setItem('rollback_' + current_id, JSON.stringify({ id: current_id, done_at: Date.now()	}));
	
		confirmed[current_id].table = null;
		orders[current_id] = confirmed[current_id];
		confirmed[current_id] = null;
		current_id = null;

		modal.hide();
		window['lastMenuFunction']();
	}
}
