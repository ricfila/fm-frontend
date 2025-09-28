function loadOrder() {
	$('#customer').val(order.customer);
	$('#guests').val(order.guests == null ? '' : order.guests);
	$('#is_take_away').prop('checked', order.is_take_away);
	$('#is_fast_order').prop('checked', !order.has_tickets);
	$('#table').val(order.table == null ? '' : order.table);
	$('#is_voucher').prop('checked', order.is_voucher);
	$('#notes').val(order.notes == null ? '' : order.notes);
	$('#paymentMethod').val(order.payment_method_id);
	checkInputDisabled();
	loadOrderProducts();
}

function checkInputDisabled() {
	$('#guests').prop('disabled', order.is_take_away);
	$('#table').prop('disabled', order.is_take_away || (order.has_tickets && order_requires_confirmation));
}

function loadComponents() {
	// Menu
	$('#newOrderItem').click(async function() {
		if (selectedProducts() > 0) {
			let ok = await modalConfirm('<span class="text-success"><i class="bi bi-plus-circle"></i> Nuovo ordine</span>', 'Iniziare un <strong>nuovo ordine</strong>? Tutte le modifiche non salvate andranno perse.');
			if (ok) newOrder();
		} else newOrder();
	});

	// Inputs
	$('#customer').change(function() {
		order.customer = $(this).val().trim();
	});

	$('#guests').on('change keyup', function() {
		let val = parseInt($(this).val());
		if (isNaN(val) || val < 0) {
			order.guests = null;
			$(this).val('');
		} else {
			order.guests = val;
		}
		updatePrice();
	});

	$('#is_take_away').change(function() {
		order.is_take_away = $(this).is(':checked');
		if (order.is_take_away) {
			order.guests = null;
			$('#guests').val('');

			order.table = null;
			$('#table').val('');

			order.has_tickets = true;
			$('#is_fast_order').prop('checked', false);
		}
		checkInputDisabled();
	});

	$('#is_fast_order').change(function() {
		order.has_tickets = !$(this).is(':checked');
		if (!order.has_tickets) {
			order.is_take_away = false;
			$('#is_take_away').prop('checked', false);
		} else {
			order.table = null;
			$('#table').val('');
		}
		checkInputDisabled();
	});

	$('#table').change(function() {
		let val = $(this).val().trim();
		order.table = val == '' ? null : val;
	});

	$('#is_voucher').change(function() {
		order.is_voucher = $(this).is(':checked');
		checkInputDisabled();
		updatePrice();
	});

	$('#notes').change(function() {
		let val = $(this).val().trim();
		order.notes = val == '' ? null : val;
	});

	$('#paymentMethod').change(function() {
		order.payment_method_id = $(this).val();
	});
}

function addProd(subcat_index, prod_index) {
	let p = order_products[subcat_index][prod_index];
	if (p) {
		p.quantity++;
	} else {
		order_products[subcat_index][prod_index] = { quantity: 1, notes: null };
	}
	loadOrderProducts();
}

function removeProd(subcat_index, prod_index) {
	let p = order_products[subcat_index][prod_index];
	if (p) {
		p.quantity--;
		if (p.quantity <= 0) {
			order_products[subcat_index].splice(prod_index, 1);
			if (order_products[subcat_index].filter( element => element.id != "" ).length == 0) {
				order_products[subcat_index] = [];
			}
		}
	}
	loadOrderProducts();
}

function addNotes(subcat_index, prod_index) {
	let id = subcat_index + '_' + prod_index;
	$('#tagnotes' + id).removeClass('d-none');
	$('#btnaddnotes' + id).addClass('d-none');
	$('#notes' + id).val('').focus();
}

function updateNotes(subcat_index, prod_index) {
	let val = $('#notes' + subcat_index + '_' + prod_index).val().trim();
	order_products[subcat_index][prod_index].notes = val == '' ? null : val;
}

function removeNotes(subcat_index, prod_index) {
	let id = subcat_index + '_' + prod_index;
	$('#btnaddnotes' + id).removeClass('d-none');
	$('#tagnotes' + id).addClass('d-none');
	order_products[subcat_index][prod_index].notes = null;
}

function updatePrice() {
	let total = 0;
	if (!order.is_voucher) {
		total += cover_charge * order.guests;

		subcats.forEach((_, i) => {
			order_products[i].forEach((p, j) => {
				let prod = subcat_products[i][j];
				total += prod.price * p.quantity;
			});
		});
	}
	order.price = total;
	$('#totalPrice').html(formatPrice(total));
}
