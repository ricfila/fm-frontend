function getProducts() {
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
		success: function(response) {
			last_products = response.products;
			loadProducts();
		},
		error: function(jqXHR, textStatus, errorThrown) {
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
		parent_order = {id: parent_order_id, customer: parent_order_customer, table: parent_order_table};
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
