function getProducts() {
	
	$('#productTabsSpinner').show();

	$.ajax({
		async: false,
		url: apiUrl + '/products/',
		type: "GET",
		data: {
			order_by: 'order',
			include_ingredients: true,
			include_locks: true,
			include_salable_quantity: true,
			from_date: shiftDates.start,
			to_date: shiftDates.end
		},
		headers: { "Authorization": "Bearer " + token },
		success: function (response) {
			products = [];
			response.products.forEach(prod => {
				products[prod.id] = prod;
			});
		},
		error: function (jqXHR, textStatus, errorThrown) {
			showToast(false, getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});

	$.ajax({
		async: false,
		url: apiUrl + '/ingredients/',
		type: "GET",
		data: {
			include_stock_quantities: true,
			await_cooking_time: false,
			from_date: shiftDates.start,
			to_date: shiftDates.end
		},
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			ingredients = [];
			response.ingredients.forEach(ingredient => {
				if (ingredient.sell_if_stocked) {
					ingredients[ingredient.id] = ingredient.added_stock - ingredient.consumed_stock;
				}
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura degli ingredienti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
	
	loadProducts();
}

function loadProducts() {
	let subgroup_html = [];

	products.forEach(prod => {
		if (subgroup_html[prod.subgroup_id] == null) {
			subgroup_html[prod.subgroup_id] = headSubgroup(subgroups[prod.subgroup_id].name, 2);
			subgroup_html[prod.subgroup_id] += '<div class="row">';
		}

		subgroup_html[prod.subgroup_id] += btnProduct(prod);
	});
	subgroup_html.forEach((_, id) => { subgroup_html[id] += '</div>'; });

	if (localStorage.getItem('FM_show_menu_tabs') == 'true') {
		let group_html = [];

		subgroup_html.forEach((html, subgroup_id) => {
			let group_id = subgroups[subgroup_id].group_id;
			if (group_html[group_id] == null)
				group_html[group_id] = '';

			group_html[group_id] += html;
		});

		let i = 0;
		let outTab = '';
		let outContent = '';
		group_html.forEach((html, group_id) => {
			outTab += '<li class="nav-item m-1" role="presentation">';
			outTab += '<button class="tabs-product rounded p-3' + (i == 0 ? ' active' : '') + '" id="tab-' + group_id + '" data-bs-toggle="tab" data-bs-target="#content-' + group_id + '" type="button" role="tab" aria-controls="content-' + group_id + '" aria-selected="' + (i == 0 ? 'true' : 'false') + '">' + groups[group_id].name + '</button>';
			outTab += '</li>';

			outContent += '<div class="tab-pane fade' + (i == 0 ? ' show active' : '') + '" id="content-' + group_id + '" role="tabpanel" aria-labelledby="tab-' + group_id + '">';
			outContent += '<div class="row">';
			outContent += html;
			outContent += '</div>';
			outContent += '</div>';

			i++;
		});

		$('#productTabs').html(outTab);
		const startHue = 25;
		$('.tabs-product').each((i, tab) => {
			tab.style.setProperty('--bg-color', `hsl(${(startHue + i * 137.508) % 360}, 65%, 45%)`);
		});
		
		$('#productTabsContent').html(outContent);
		// fa vedere la prima tab aperta di default, altrimenti se si cambia tab e si torna indietro rimane aperta l'ultima tab selezionata
		$('#productTabs button:first').trigger('click');

		$('#productTabsSpinner').hide();
		
		$('#productList').hide();
		$('#productTabsContainer').show();
	} else {
		let out = '';
		subgroup_html.forEach(html => { out += html; });
		$('#productList').html(out);

		$('#productTabsContainer').hide();
		$('#productList').show();
	}
}

function headSubgroup(name, mb = 0) {
	let out = '<div class="row mt-2 mb-' + mb + '">';
	out += '<div class="col-auto my-auto"><h6 class="m-0">' + name + '</h6></div>';
	out += '<div class="col p-0"><hr class="m-2"></div>';
	out += '</div>';
	return out;
}

function btnProduct(prod) {
	out = '<div class="col-6 col-sm-4 col-md-3 col-lg-2 ps-0 pe-1">';
	out += '<button class="btn btn-product px-1 py-0 mb-1 text-light' + (prod.locked ? ' disabled text-decoration-line-through' : '') + '" style="--bg-color: ' + prod.color + ';" onclick="addProd(' + prod.id + ');">';
	out += prod.short_name;

	let salable_quantity = getSalableQuantity(prod.id);
	if (salable_quantity != null && salable_quantity <= 20) {
		products[prod.id].salable_quantity = salable_quantity;
		out += ' <span class="badge bg-danger badge_salable_quantity" id="salable_quantity_' + prod.id + '">' + products[prod.id].salable_quantity + '</span>';
	}
		
	out += '</button>';
	out += '</div>';
	return out;
}

function getSalableQuantity(prod_id) {
	let quantities = [];
	products[prod_id].ingredients.forEach(prod_ing => {
		let ing_id = prod_ing.ingredient_id;
		if (prod_ing.is_default && ingredients[ing_id] != null) {
			quantities.push(Math.floor(ingredients[ing_id] / prod_ing.max_quantity));
		}
	});
	if (quantities.length > 0)
		return Math.min(...quantities);
	else
		return null;
}


function newOrder(parent_order_id = null, parent_order_customer = null, parent_order_table = null) {
	getProducts(); // Always called to update availability of products

	let parent_order = null;
	if (parent_order_id != null) {
		parent_order = { id: parent_order_id, customer: parent_order_customer, table: parent_order_table };
	}

	order = {
		id: null,
		customer: (parent_order_customer != null ? parent_order_customer : ''),
		guests: null,
		take_away_type: null,
		table: null,
		is_voucher: false,
		is_for_service: false,
		has_tickets: true,
		notes: null,
		price: 0,
		created_at: null,
		parent_order: parent_order,
		payment_method_id: null,
		user: null
	};

	order_products = [];

	prevGuests = null;
	prevTable = null;
	prevPaymentMethod = null;
	prevFlash = false;

	loadOrder();
}
