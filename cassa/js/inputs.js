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
	$('#customer').change(function () {
		order.customer = $(this).val().trim();
	});

	$('#guests').on('change keyup', function () {
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

	$('#table').on('change keyup', function () {
		let val = $(this).val().trim();
		order.table = val == '' ? null : val;
		if (!$('#guests').is(':disabled'))
			prevGuests = order.guests;
		checkInputDisabled();
	});

	$('.take_away_button').change(function () {
		order.take_away_type = ($(this).is(':checked') ? $(this).val() : null);
		let actual_id = $(this).prop('id');
		const actualCustomer = $.trim($('#customer').val());

		$('.take_away_button').each(function () {
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

		//autocompilazione x ordini bar e ordini flash
		console.log('take_away_type: ' + order.take_away_type);
		if (actualCustomer == "FLASH" || actualCustomer == "BAR" || actualCustomer == "")
			$('#customer').val($('.take_away_button:checked').data('fast-description')).trigger('change');

	});

	$('#is_fast_order').change(function () {
		const actualCustomer = $.trim($('#customer').val());
		order.has_tickets = !$(this).is(':checked');
		
		if (!order.has_tickets) {
			disableGuestsAndTable();
			order.take_away_type = null;
			$('.take_away_button').prop('checked', false);

			//per ora necessariamente hardcoded, da integrare in un oggetto globale in futuro x estendere i tipi ordini indefinitamente
			if (actualCustomer == "BAR" || actualCustomer == "")
				$('#customer').val($('#is_fast_order').data('fast-description')).trigger('change');
		} else {
			resumeGuestsAndTable();
			if (actualCustomer == "FLASH")
				$('#customer').val('').trigger('change');
		}
		checkInputDisabled();
	});

	$('#is_voucher').change(function () {
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

	$('#is_for_service').change(function () {
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

	$('#notes').change(function () {
		let val = $(this).val().trim();
		order.notes = val == '' ? null : val;
	});

	$('#paymentMethod').change(function () {
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

function addProd(prod_id) {
	let prod = order_products[prod_id];

	if (prod) {
		prod.quantity++;

		if (order.id != null) {
			if (prod.edited_product) {
				if (prod.quantity == prod.original_quantity) {
					prod.edited_product = null;
					prod.original_quantity = null;
				}
			} else {
				prod.edited_product = true;
				prod.original_quantity = prod.quantity - 1;
			}
		}
	} else {
		order_products[prod_id] = {
			quantity: 1,
			notes: null
		};

		if (order.id != null) {
			order_products[prod_id].edited_product = true;
			order_products[prod_id].original_quantity = 0;
			order_products[prod_id].category_id = fallbackCategory(products[prod_id].category_id);
		}
	}

	updateIngredients(prod_id, true);
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

function removeProd(prod_id) {
	let prod = order_products[prod_id];

	if (prod && prod.quantity > 0) {
		prod.quantity--;
		let deleted = false;

		if (prod.quantity <= 0) {
			if (order.id == null || (prod.edited_product && prod.original_quantity == 0)) {
				delete order_products[prod_id];
				deleted = true;
			}
		}
		if (order.id != null && !deleted) {
			if (prod.edited_product) {
				if (prod.quantity == prod.original_quantity) {
					prod.edited_product = null;
					prod.original_quantity = null;
				}
			} else {
				prod.edited_product = true;
				prod.original_quantity = prod.quantity + 1;
			}
		}
	}

	updateIngredients(prod_id, false);
	loadOrderProducts();
}

function updateIngredients(prod_id, adding) {
	products[prod_id].ingredients.forEach(prod_ing => {
		if (prod_ing.is_default && ingredients[prod_ing.ingredient_id] != null) {
			if (adding)
				ingredients[prod_ing.ingredient_id] -= prod_ing.max_quantity;
			else
				ingredients[prod_ing.ingredient_id] += prod_ing.max_quantity;
		}
	});

	products.forEach((prod, id) => {
		if (prod.salable_quantity != null) {
			$('#salable_quantity_' + id).html(getSalableQuantity(id));
		}
	});
}

//TODO changing notes and not quantity needs anyway to set edited_product = true

function addNotes(prod_id) {
	$('#tagnotes' + prod_id).removeClass('d-none');
	$('#btnaddnotes' + prod_id).addClass('d-none');
	$('#notes' + prod_id).val('').focus();
}

function updateNotes(prod_id) {
	let val = $('#notes' + prod_id).val().trim();
	order_products[prod_id].notes = val == '' ? null : val;
}

function removeNotes(prod_id) {
	$('#btnaddnotes' + prod_id).removeClass('d-none');
	$('#tagnotes' + prod_id).addClass('d-none');
	order_products[prod_id].notes = null;
}

function updatePrice() {
	let total = 0;

	if (!order.is_voucher) {
		total += settings.cover_charge * order.guests;

		order_products.forEach((prod, id) => {
			total += products[id].price * prod.quantity;
		});
	}

	order.price = total;

	if (order.id != null && total != originalTotalPrice) {
		$('#totalPrice').html('<span style="text-decoration: line-through;">' + formatPrice(originalTotalPrice) + '</span>&nbsp;<span class="text-' + (total > originalTotalPrice ? 'success' : 'danger') + '">' + formatPrice(total) + '</span>');
		$('#totalChangeInstructions').html(total > originalTotalPrice ?
			'(chiedere al gent. cliente ' + formatPrice(total - originalTotalPrice) + ')' :
			'(restituire al gent. cliente ' + formatPrice(originalTotalPrice - total) + ')');

		//gestione rendiresto
		$('#dueAmount').val(escapeDecimal(total - originalTotalPrice).toFixed(2));

	} else {
		$('#totalPrice').html(formatPrice(total));
		$('#totalChangeInstructions').html('');

		//gestione rendiresto
		$('#dueAmount').val((total).toFixed(2));

	}
}
