function selectedProducts() {
	let num_products = 0;
	order_products.forEach((list, _) => {
		num_products += list.filter(element => element.id != "").length;
	});
	return num_products;
}

async function saveOrder() {
	// Check products
	if (selectedProducts() == 0) {
		showToast(false, 'Nessun prodotto selezionato!', 2);
		return;
	}

	// Check fields
	if (order.customer.trim() == '') {
		showToast(false, 'Inserire il nome del cliente!', 2);
		$('#customer').focus();
		return;
	}
	if (order.id == null && !order.is_take_away && order.has_tickets && order.guests == null) {
		showToast(false, 'Inserire il numero di coperti!', 2);
		$('#guests').focus();
		return;
	}
	if (order.payment_method_id == null) {
		showToast(false, 'Selezionare il metodo di pagamento!', 2);
		$('#paymentMethod').focus();
		return;
	}

	// Check include cover charge
	let include_cover_charge = false;
	order_products.forEach((list, i) => {
		if (list.length > 0 && subcats[i].include_cover_charge) {
			include_cover_charge = true;
		}
	});
	if (order.guests != null && order.guests > 0) {
		if (!include_cover_charge) {
			let ok = await modalConfirm('<span class="text-danger"><i class="bi bi-person-slash"></i> Conferma ordine senza coperto</span>', 'Nessun prodotto selezionato prevede il coperto, pertanto <strong>i coperti indicati verranno azzerati.</strong><br>Continuare?');
			if (!ok) return;
			$('#guests').val(0);
			order.guests = 0;
			updatePrice();
		}
	}

	// Alert for no tickets
	if (order.id == null && !order.has_tickets) {
		let ok = await modalConfirm('<span class="text-primary"><i class="bi bi-lightning-charge-fill"></i> Conferma cassa flash</span>', 'La modalità <strong>flash</strong> non prevede la stampa delle comande, e dopo la stampa della ricevuta l\'ordine verrà contrassegnato come completato.<br>Confermi la modalità <strong>flash</strong>?');
		if (!ok) return;
	}

	sendOrder();
}

function sendOrder() {
	let params = {
		customer: order.customer,
		guests: order.is_take_away || order.guests == 0 ? null : order.guests,
		is_take_away: order.is_take_away,
		table: order.table,
		is_voucher: order.is_voucher,
		is_for_service: order.is_for_service,
		has_tickets: order.has_tickets,
		notes: order.notes,
		parent_order_id: null,
		payment_method_id: order.payment_method_id,
		products: [],
		menus: []
	};

	order_products.forEach((subcat, i) => {
		subcat.forEach((prod, j) => {
			params.products.push({
				product_id: subcat_products[i][j].id,
				quantity: prod.quantity,
				notes: prod.notes,
				edited_product: prod.edited_product,
				original_quantity: prod.original_quantity,
				category_id: prod.category_id
			});
		});
	});

	let editing = order.id != null;
	$.ajax({
		async: false,
		url: apiUrl + '/orders/' + (editing ? order.id : ''),
		type: (editing ? "PUT" : "POST"),
		data: JSON.stringify(params),
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: async function(response) {
			showToast(true, 'L\'ordine è stato salvato con successo');
			
			if (editing) {
				loadFromServer(order.id);
			} else {
				order.guests = response.order.guests;
				order.table = response.order.table;
				order.price = response.order.price;
				
				if (order.id == null) {
					order.id = response.order.id;
					order.created_at = response.order.created_at;
					order.user = { username: username };

					let order_copy = structuredClone(order);
					printOrder(order_copy, structuredClone(order_products));

					recent_orders.unshift(order_copy);
					if (recent_orders.length > MAX_RECENT_ORDERS)
						recent_orders.pop();
					newOrder();
				} else {
					loadOrder();
				}
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}
