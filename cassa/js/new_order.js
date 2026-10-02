function getProducts() {
	
	$('#productTabsSpinner').show();
	
	const params = {
		offset: 0,
		order_by: 'order',
		include_subgroup: true,
		include_locks: true
	};

	$.ajax({
		async: false,
		url: apiUrl + '/products/',
		type: "GET",
		data: params,
		headers: { "Authorization": "Bearer " + token },
		success: function (response) {
			last_products = response.products;
			loadProducts();
		},
		error: function (jqXHR, textStatus, errorThrown) {
			showToast(false, getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function loadProducts() {
	subgroups = [];
	subgroup_products = [];

	for (let i = 0; i < last_products.length; i++) {
		let product = last_products[i];
		let subgroup = product.subgroup;

		if (subgroups[subgroup.id] == null) {
			subgroups[subgroup.id] = subgroup;
			subgroup_products[subgroup.id] = [];
		}

		subgroup_products[subgroup.id][product.id] = product;
	}

	// qui si biforca se il flag è attivo diventano tabs, se il flag è disattivato diventano lista di prodotti
	if (localStorage.getItem('FM_show_menu_tabs') == 'true') {
		loadProductsAsTabs(subgroups, subgroup_products);
		$('#productList').hide();
		$('#productTabsContainer').show();
	} else {
		loadProductsAsList(subgroups, subgroup_products);
		$('#productTabsContainer').hide();
		$('#productList').show();
	}
}

function loadProductsAsTabs(subgroups, subgroup_products) {
	let out = '';

	subgroups.forEach((subgroup, i) => {
		out += '<li class="nav-item m-1" role="presentation">';
		out += '<button class="tabs-product rounded p-3' + (i == 0 ? ' active' : '') + '" id="tab-' + subgroup.id + '" data-bs-toggle="tab" data-bs-target="#content-' + subgroup.id + '" type="button" role="tab" aria-controls="content-' + subgroup.id + '" aria-selected="' + (i == 0 ? 'true' : 'false') + '">' + subgroup.name + '</button>';
		out += '</li>';
	});
	$('#productTabs').html(out);

	const startHue = 25;
	$('.tabs-product').each((i, tab) => {
		tab.style.setProperty('--bg-color', `hsl(${(startHue + i * 137.508) % 360}, 65%, 45%)`);
	});

	out = '';
	subgroups.forEach((subgroup, i) => {
		out += '<div class="tab-pane fade' + (i == 0 ? ' show active' : '') + '" id="content-' + subgroup.id + '" role="tabpanel" aria-labelledby="tab-' + subgroup.id + '">';
		out += '<div class="row">';
		subgroup_products[i].forEach((prod, j) => {
			out += '<div class="col-6 col-sm-4 col-md-3 col-lg-2 ps-0 pe-1">';
			out += '<button class="btn btn-product px-1 py-0 mb-1 text-light' + (prod.locked ? ' disabled text-decoration-line-through' : '') + '" style="--bg-color: ' + prod.color + ';" onclick="addProd(' + i + ', ' + j + ');">' + prod.short_name + '</button>';
			out += '</div>';
		});
		out += '</div>';
		out += '</div>';
	});

	$('#productTabsContent').html(out);
	// fa vedere la prima tab aperta di default, altrimenti se si cambia tab e si torna indietro rimane aperta l'ultima tab selezionata
	$('#productTabs button:first').trigger('click');

	$('#productTabsSpinner').hide();
}

function loadProductsAsList(subgroups, subgroup_products) {
	let out = '';
	subgroups.forEach((subgroup, i) => {
		out += headSubgroup(subgroup.name, 2);
		out += '<div class="row">';
		subgroup_products[i].forEach((prod, j) => {
			out += '<div class="col-6 col-sm-4 col-md-3 col-lg-2 ps-0 pe-1">';
			out += '<button class="btn btn-product px-1 py-0 mb-1 text-light' + (prod.locked ? ' disabled text-decoration-line-through' : '') + '" style="--bg-color: ' + prod.color + ';" onclick="addProd(' + i + ', ' + j + ');">' + prod.short_name + '</button>';
			out += '</div>';
		});
		out += '</div>';
	});
	$('#productList').html(out);
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
		is_take_away: false,
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
	subgroups.forEach((_, i) => {
		order_products[i] = [];
	});

	prevGuests = null;
	prevTable = null;
	prevPaymentMethod = null;
	prevFlash = false;

	loadOrder();
}
