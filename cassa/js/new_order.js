function getProducts() {
	const params = {
		offset: 0,
		order_by: 'order',
		include_subcategory: true,
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
	subcats = [];
	subcat_products = [];

	for (let i = 0; i < last_products.length; i++) {
		let product = last_products[i];
		let subcategory = product.subcategory;

		if (subcats[subcategory.id] == null) {
			subcats[subcategory.id] = subcategory;
			subcat_products[subcategory.id] = [];
		}

		subcat_products[subcategory.id][product.id] = product;
	}

	let out = '';
	subcats.forEach((subcat, i) => {
		out += headSubcat(subcat.name, 2);
		out += '<div class="row">';
		subcat_products[i].forEach((prod, j) => {
			out += '<div class="col-6 col-sm-4 col-md-3 col-lg-2 ps-0 pe-1">';
			out += '<button class="btn btn-product px-1 py-0 mb-1 text-light' + (prod.locked ? ' disabled' : '') + '" style="--bg-color: ' + prod.color + ';" onclick="addProd(' + i + ', ' + j + ');">' + prod.frontend_name + '</button>';
			out += '</div>';
		});
		out += '</div>';
	});
	$('#productList').html(out);
}

function newOrder() {
	getProducts(); // Always called to update availability of products

	order = {
		id: null,
		customer: '',
		guests: null,
		is_take_away: false,
		table: null,
		is_voucher: false,
		is_for_service: false,
		has_tickets: true,
		notes: null,
		payment_method_id: null,
		price: 0,
		created_at: null,
		user: null
	};

	order_products = [];
	subcats.forEach((_, i) => {
		order_products[i] = [];
	});

	loadOrder();
}
