var originalTotalPrice = null;

function loadFromServer(order_id) {
	$.ajax({
		async: true,
		url: apiUrl + '/orders/' + order_id,
		type: "GET",
		data: {
			include_confirmer_user: true,
			include_products: true,
			include_products_product: true,
			include_tickets: true,
			include_user: true,
			include_deleted_orders: true
		},
		headers: { "Authorization": "Bearer " + token },
		success: async function(response) {
			order = response;
			order_products = [];

			order.products.forEach(order_product => {
				let subcat_id = order_product.product.subcategory_id;
				if (order_products[subcat_id] == null)
					order_products[subcat_id] = [];
				order_products[subcat_id][order_product.product_id] = {
					quantity: order_product.quantity,
					notes: order_product.notes,
					price: order_product.price
				};
			});
			
			loadOrder();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione dell\'ordine: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function searchOrder() {
	let input = prompt('Inserisci il numero dell\'ordine');
	if (input != null)
		loadFromServer(input);
}

function loadOrder() {
	$('#customer').val(order.customer);
	$('#guests').val(order.guests == null ? '' : order.guests);
	$('#is_take_away').prop('checked', order.is_take_away).prop('disabled', order.id != null);
	$('#is_fast_order').prop('checked', !order.has_tickets).prop('disabled', order.id != null);
	$('#table').val(order.table == null ? '' : order.table);
	$('#is_voucher').prop('checked', order.is_voucher);
	$('#is_for_service').prop('checked', order.is_for_service);
	$('#notes').val(order.notes == null ? '' : order.notes);
	$('#paymentMethod').val(order.payment_method_id);
	originalTotalPrice = order.price;
	if (order.id != null)
	$('#save-btn').html('<i class="bi bi-save"></i> SALVA' + (order.id == null ? ' e STAMPA' : ''));

	checkInputDisabled();
	loadOrderProducts();
	loadInfoHeader();
}

function loadOrderProducts() {
	let out = '';
	order_products.forEach((subcat_p, i) => {
		if (subcat_p.length > 0) {
			out += headSubcat(subcats[i].name, 2);
		}
		subcat_p.forEach((p, j) => {
			let prod = subcat_products[i][j];
			out += productRow(i, j, prod.name, prod.price, p);
		});
	});
	
	document.getElementById('orderProducts').scrollTop = 0; //TODO: risolvere l'ombra che rimane in alto se lo scorrimento è completo verso il basso al momento dello svuotamento
	$('#orderProducts').html(out);
	updatePrice();
}

function headSubcat(name, mb = 0) {
	let out = '<div class="row mt-2 mb-' + mb + '">';
	out += '<div class="col-auto my-auto"><h6 class="m-0">' + name + '</h6></div>';
	out += '<div class="col p-0"><hr class="m-2"></div>';
	out += '</div>';
	return out;
}

function productRow(i, j, name, price, prod) {
	let id = i + '_' + j;
	let out = '';
	let rowClass = (prod.original_quantity != null ? (prod.quantity > prod.original_quantity ? 'order-row-inc' : 'order-row-dec') : 'order-row');
	out += '<div class="row d-flex align-items-center py-1 ' + rowClass + '">';

	// Buttons and quantity
	out += '<div class="col-auto p-0"><div class="row d-flex align-items-center">';
	out += '<div class="col pe-1"><button class="btn btn-sm btn-dark" onclick="removeProd(' + i + ', ' + j + ');"><i class="bi bi-dash-lg"></i></button></div>';
	out += '<div class="col p-0 text-right"><button class="btn btn-sm btn-info" onclick="addProd(' + i + ', ' + j + ');"><i class="bi bi-plus-lg"></i></button></div>';
	out += '<div class="col"><strong>' + prod.quantity + '</strong></div>';
	out += '</div>';

	// Name and notes
	out += '</div><div class="col">' + name;
	out += '<span id="btnaddnotes' + id + '"' + (prod.notes != null ? ' class="d-none"' : '') + '><button class="btn btn-sm btn-light ms-3" onclick="addNotes(' + i + ', ' + j + ');"><i class="bi bi-pencil-fill"></i> Note</button></span>';
	out += '<span id="tagnotes' + id + '"' + (prod.notes == null ? ' class="d-none"' : '') + '><br>';
	out += '<i class="bi bi-arrow-return-right"></i>&nbsp;';
	out += '<input class="form-control form-control-sm d-inline" type="text" id="notes' + id + '" onchange="updateNotes(' + i + ', ' + j + ');" maxlength="63" style="width: 300px;" value="' + (prod.notes != null ? prod.notes : '') + '" />&nbsp;';
	out += '<button class="btn btn-sm btn-light" onclick="removeNotes(' + i + ', ' + j + ');"><i class="bi bi-x-lg"></i></button></span>';
	if (prod.category_id != null)
	out += '<br><small>Assegnato alla comanda ' + categories[prod.category_id].name + '</small>';
	out += '</div>';

	// Price
	out += '<div class="col-auto p-0">' + formatPrice(price * prod.quantity) + '</div></div>';
	return out;
}

function formatPrice(p) {
	return '&euro;&nbsp;' + ('' + p).replace(".", ",") + ((p - Math.trunc(p)) != 0 ? '0' : ',00');
}

function loadInfoHeader() {
	if (order.id == null) {
		$('#infoHeader').addClass('d-none');
		return;
	}

	$('#order-id').html(order.id);
	$('#order-user').html(order.user.username);

	let outdate = '';
	if (!isThisSession(order.created_at))
		outdate += '<strong class="text-danger">' + formatShortDate(order.created_at) + '</strong> ';
	outdate += 'alle ore <strong>' + formatTime(order.created_at) + '</strong>';
	$('#order-created_at').html(outdate);

	let outconfirm = '';
	if (order.is_confirmed) {
		outconfirm += 'Ordine confermato';
		if (order.confirmed_by != null) {
			outconfirm += ' da ' + order.confirmed_by.username
		}
		if (order.confirmed_at != null) {
			if (!isThisSession(order.confirmed_at))
				outconfirm += ' <strong class="text-danger">' + formatShortDate(order.confirmed_at) + '</strong> ';
			outconfirm += ' alle ore <strong>' + formatTime(order.confirmed_at) + '</strong>';
		}
	}
	$('#ticket-list').html(outconfirm + '<br>' + ticketList(order.tickets, categories, order.confirmed_at));
	
	$('#delete-order-btn').html(order.is_deleted ?
		'<button class="btn btn-sm btn-outline-success" onclick="resumeOrder();"><i class="bi bi-recycle"></i> Ripristina ordine</button>' :
		'<button class="btn btn-sm btn-outline-danger" onclick="deleteOrder();"><i class="bi bi-trash3-fill"></i> Elimina ordine</button>');
	$('#infoHeader').removeClass('d-none');
}