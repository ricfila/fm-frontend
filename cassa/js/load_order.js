function loadFromServer(order_id) {
	$.ajax({
		async: true,
		url: apiUrl + '/orders/' + order_id,
		type: "GET",
		data: { include_products: true, include_products_product: true, include_user: true },
		headers: { "Authorization": "Bearer " + token },
		success: async function(order) {
			let op = [];

			order.products.forEach(order_product => {
				let subcat_id = order_product.product.subcategory_id;
				if (op[subcat_id] == null)
					op[subcat_id] = [];
				op[subcat_id][order_product.product_id] = {
					quantity: order_product.quantity,
					notes: order_product.notes,
					price: order_product.price
				};
			});
			await printOrder(order, op, false);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione dell\'ordine: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function loadOrder() {
	$('#customer').val(order.customer);
	$('#guests').val(order.guests == null ? '' : order.guests);
	$('#is_take_away').prop('checked', order.is_take_away);
	$('#is_fast_order').prop('checked', !order.has_tickets);
	$('#table').val(order.table == null ? '' : order.table);
	$('#is_voucher').prop('checked', order.is_voucher);
	$('#is_for_service').prop('checked', order.is_for_service);
	$('#notes').val(order.notes == null ? '' : order.notes);
	$('#paymentMethod').val(order.payment_method_id);
	checkInputDisabled();
	loadOrderProducts();
}

function loadOrderProducts() {
	let out = '';
	subcats.forEach((subcat, i) => {
		if (order_products[i].length > 0) {
			out += headSubcat(subcat.name, 2);
		}
		order_products[i].forEach((p, j) => {
			let prod = subcat_products[i][j];
			out += productRow(i, j, prod.name, prod.price, p.quantity, p.notes);
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

function productRow(i, j, name, price, quantity, notes) {
	let id = i + '_' + j;
	let out = '';
	out += '<div class="row d-flex align-items-center order-row py-1">';

	// Buttons and quantity
	out += '<div class="col-auto p-0"><div class="row d-flex align-items-center">';
	out += '<div class="col pe-1"><button class="btn btn-sm btn-dark" onclick="removeProd(' + i + ', ' + j + ');"><i class="bi bi-dash-lg"></i></button></div>';
	out += '<div class="col p-0 text-right"><button class="btn btn-sm btn-info" onclick="addProd(' + i + ', ' + j + ');"><i class="bi bi-plus-lg"></i></button></div>';
	out += '<div class="col"><strong>' + quantity + '</strong></div>';
	out += '</div>';

	// Name and notes
	out += '</div><div class="col">' + name;
	out += '<span id="btnaddnotes' + id + '"' + (notes != null ? ' class="d-none"' : '') + '><button class="btn btn-sm btn-light ms-3" onclick="addNotes(' + i + ', ' + j + ');"><i class="bi bi-pencil-fill"></i> Note</button></span>';
	out += '<span id="tagnotes' + id + '"' + (notes == null ? ' class="d-none"' : '') + '><br>';
	out += '<i class="bi bi-arrow-return-right"></i>&nbsp;';
	out += '<input class="form-control form-control-sm d-inline" type="text" id="notes' + id + '" onchange="updateNotes(' + i + ', ' + j + ');" maxlength="63" style="width: 300px;" value="' + (notes != null ? notes : '') + '" />&nbsp;';
	out += '<button class="btn btn-sm btn-light" onclick="removeNotes(' + i + ', ' + j + ');"><i class="bi bi-x-lg"></i></button></span>';
	out += '</div>';

	// Price
	out += '<div class="col-auto p-0">' + formatPrice(price * quantity) + '</div></div>';
	return out;
}

function formatPrice(p) {
	return '&euro;&nbsp;' + ('' + p).replace(".", ",") + ((p - Math.trunc(p)) != 0 ? '0' : ',00');
}
