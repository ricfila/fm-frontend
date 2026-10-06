let prevGuests = null;
let prevTable = null;
let prevPaymentMethod = null;
let prevFlash = false;

function checkInputDisabled() {
	$('#guests').prop('disabled', order.parent_order != null || !order.has_tickets ||
		(order.id == null && (
			order.take_away_type != null || (order.table != null && settings.order_requires_confirmation)
		))
	);
	$('#table').prop('disabled', order.parent_order != null || !order.has_tickets ||
		(order.id == null && (
			order.take_away_type != null || (order.guests != null && settings.order_requires_confirmation)
		))
	);

	$('.take_away_button').prop('disabled', order.id != null || order.parent_order != null);
	$('#is_fast_order').prop('disabled', order.id != null);
	
	let background = '#ffffff';
	let border = '#000000';
	if (order.take_away_type != null) {
		background = '#affdbc';
		border = '#4b7151';
	} else if (!order.has_tickets) {
		background = '#d0eaf1';
		border = '#165c6f';
	} else if ((order.guests == null && order.table != null) || order.parent_order != null) {
		background = '#ffe993';
		border = '#d66600';
	}
	$('#orderContainer').css('background-color', background);//.css('border-color', border);
}

function loadComponents() {
	$('#customer').change(function() {
		order.customer = $(this).val().trim();
	});

	$('#guests').on('change keyup', function() {
		let val = parseInt($(this).val());
		if (isNaN(val) || val <= 0) {
			order.guests = null;
			$(this).val('');
		} else {
			order.guests = val;
		}
		if (!$('#table').is(':disabled'))
			prevTable = order.table;
		updatePrice();
		checkInputDisabled();
	});

	$('#table').on('change keyup', function() {
		let val = $(this).val().trim();
		order.table = val == '' ? null : val;
		if (!$('#guests').is(':disabled'))
			prevGuests = order.guests;
		checkInputDisabled();
	});

	$('.take_away_button').change(function() {
		order.take_away_type = ($(this).is(':checked') ? $(this).val() : null);
		let actual_id = $(this).prop('id');
		$('.take_away_button').each(function() {
			if ($(this).prop('id') != actual_id)
				$(this).prop('checked', false);
		});

		if (order.take_away_type != null) {
			disableGuestsAndTable();
			order.has_tickets = true;
			$('#is_fast_order').prop('checked', false);
		} else {
			resumeGuestsAndTable();
		}
		checkInputDisabled();
	});

	$('#is_fast_order').change(function() {
		order.has_tickets = !$(this).is(':checked');
		if (!order.has_tickets) {
			disableGuestsAndTable();
			order.take_away_type = null;
			$('.take_away_button').prop('checked', false);
		} else {
			resumeGuestsAndTable();
		}
		checkInputDisabled();
	});

	$('#is_voucher').change(function() {
		order.is_voucher = $(this).is(':checked');

		if (order.id == null)
			if (order.is_voucher) {
				prevPaymentMethod = $('#paymentMethod').val();
				if (prevPaymentMethod == null)
					$('#paymentMethod').val($('#paymentMethod').children().eq(1).attr('value')).trigger('change');
			} else {
				$('#paymentMethod').val(prevPaymentMethod).trigger('change');
			}
			
		updatePrice();
	});

	$('#is_for_service').change(function() {
		order.is_for_service = $(this).is(':checked');

		if (order.id == null) {
			$('#is_voucher').prop('checked', order.is_for_service).trigger('change');
			if (order.is_for_service) {
				prevFlash = $('#is_fast_order').is(':checked');
				$('#is_fast_order').prop('checked', true).trigger('change');
			} else {
				$('#is_fast_order').prop('checked', prevFlash).trigger('change');
			}
		}
	});

	$('#notes').change(function() {
		let val = $(this).val().trim();
		order.notes = val == '' ? null : val;
	});

	$('#paymentMethod').change(function() {
		order.payment_method_id = $(this).val();
	});
}

function disableGuestsAndTable() {
	if (!$('#guests').is(':disabled')) {
		prevGuests = order.guests;
	}
	if (!$('#table').is(':disabled')) {
		prevTable = order.table;
	}
	$('#guests').val('').trigger('change');
	$('#table').val('').trigger('change');
}

function resumeGuestsAndTable() {
	$('#guests').val(prevGuests).trigger('change');
	if (order.parent_order == null)
		$('#table').val(prevTable).trigger('change');
	else
		$('#table').val(order.parent_order.table);
}

function addProd(subgroup_index, prod_index) {
	let p = (order_products[subgroup_index] != null ? order_products[subgroup_index][prod_index] : null);
	if (p) {
		p.quantity++;
		if (order.id != null) {
			if (p.edited_product) {
				if (p.quantity == p.original_quantity) {
					order_products[subgroup_index][prod_index]["edited_product"] = null;
					order_products[subgroup_index][prod_index]["original_quantity"] = null;
				}
			} else {
				order_products[subgroup_index][prod_index]["edited_product"] = true;
				order_products[subgroup_index][prod_index]["original_quantity"] = p.quantity - 1;
			}
		}
	} else {
		if (order_products[subgroup_index] == null)
			order_products[subgroup_index] = [];

		order_products[subgroup_index][prod_index] = { quantity: 1, notes: null };
		if (order.id != null) {
			order_products[subgroup_index][prod_index]["edited_product"] = true;
			order_products[subgroup_index][prod_index]["original_quantity"] = 0;
			order_products[subgroup_index][prod_index]["category_id"] = fallbackCategory(subgroup_products[subgroup_index][prod_index].category_id);
		}
	}
	loadOrderProducts();
}

function fallbackCategory(cat) {
	if (order.tickets.filter(t => t.category_id == cat).length == 1)
		return cat;

	// Default category for product has no ticket for this order

	// First: check fallback for take away
	if (order.take_away_type != null) {
		let take_away_tickets = order.tickets.filter(t => categories[t.category_id].take_away_type == order.take_away_type);
		if (take_away_tickets.length == 1)
			return take_away_tickets[0].category_id;
	}

	// Second: check fallback for parent for main products
	if (order.tickets.filter(t => t.category_id == categories[cat].parent_for_main_products_id).length == 1)
		return categories[cat].parent_for_main_products_id;

	// Third: check fallback for parent
	if (order.tickets.filter(t => t.category_id == categories[cat].parent_category_id).length == 1)
		return categories[cat].parent_category_id;

	// Default (even for order with no tickets)
	return null;
}

function removeProd(subgroup_index, prod_index) {
	let p = (order_products[subgroup_index] != null ? order_products[subgroup_index][prod_index] : null);
	if (p && p.quantity > 0) {
		p.quantity--;
		let deleted = false;

		if (p.quantity <= 0) {
			if (order.id == null || (p.edited_product && p.original_quantity == 0)) {
				order_products[subgroup_index].splice(prod_index, 1);
				if (order_products[subgroup_index].filter( element => element.id != "" ).length == 0) {
					order_products[subgroup_index] = [];
				}
				deleted = true;
			}
		}
		if (order.id != null && !deleted) {
			if (p.edited_product) {
				if (p.quantity == p.original_quantity) {
					order_products[subgroup_index][prod_index]["edited_product"] = null;
					order_products[subgroup_index][prod_index]["original_quantity"] = null;
				}
			} else {
				order_products[subgroup_index][prod_index]["edited_product"] = true;
				order_products[subgroup_index][prod_index]["original_quantity"] = p.quantity + 1;
			}
		}
	}
	loadOrderProducts();
}

function addNotes(subgroup_index, prod_index) {
	let id = subgroup_index + '_' + prod_index;
	$('#tagnotes' + id).removeClass('d-none');
	$('#btnaddnotes' + id).addClass('d-none');
	$('#notes' + id).val('').focus();
}

function updateNotes(subgroup_index, prod_index) {
	let val = $('#notes' + subgroup_index + '_' + prod_index).val().trim();
	order_products[subgroup_index][prod_index].notes = val == '' ? null : val;
}

function removeNotes(subgroup_index, prod_index) {
	let id = subgroup_index + '_' + prod_index;
	$('#btnaddnotes' + id).removeClass('d-none');
	$('#tagnotes' + id).addClass('d-none');
	order_products[subgroup_index][prod_index].notes = null;
}

function updatePrice() {
	let total = 0;
	if (!order.is_voucher) {
		total += settings.cover_charge * order.guests;

		order_products.forEach((subgroup_p, i) => {
			subgroup_p.forEach((p, j) => {
				let prod = subgroup_products[i][j];
				total += prod.price * p.quantity;
			});
		});
	}
	order.price = total;
	if (order.id != null && total != originalTotalPrice) {
		$('#totalPrice').html('<span style="text-decoration: line-through;">' + formatPrice(originalTotalPrice) + '</span>&nbsp;<span class="text-' + (total > originalTotalPrice ? 'success' : 'danger') + '">' + formatPrice(total) + '</span>');
		$('#totalChangeInstructions').html(total > originalTotalPrice ?
			'(chiedere al gent. cliente ' + formatPrice(total - originalTotalPrice) + ')' :
			'(restituire al gent. cliente ' + formatPrice(originalTotalPrice - total) + ')');
	} else {
		$('#totalPrice').html(formatPrice(total));
		$('#totalChangeInstructions').html('');
	}
}
