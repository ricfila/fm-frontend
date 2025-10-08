function getProducts() {
	const params = {
		offset: 0,
		order_by: 'order',
		only_name: false,
		include_dates: false,
		include_ingredients: false,
		include_roles: false,
		include_subcategory: true,
		include_variants: false
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
	let subcat_ids = [];
	subcats = [];
	subcat_products = [];

	for (let i = 0; i < last_products.length; i++) {
		let product = last_products[i];
		let subcategory = product.subcategory;

		let index = subcat_ids.indexOf(subcategory.id);
		if (index == -1) {
			subcat_ids.push(subcategory.id);
			subcats.push(subcategory);
			subcat_products.push([]);
			index = subcat_ids.length - 1;
		}

		subcat_products[index].push(product);
	}

	let out = '';
	for (let i = 0; i < subcats.length; i++) {
		out += headSubcat(subcats[i].name, 2);
		out += '<div class="row">';
		for (let j = 0; j < subcat_products[i].length; j++) {
			let prod = subcat_products[i][j];
			out += '<div class="col-6 col-sm-4 col-md-3 col-lg-2 ps-0 pe-1">';
			out += '<button class="btn btn-product px-1 py-0 mb-1 text-light" style="--bg-color: ' + prod.color + ';" onclick="addProd(' + i + ', ' + j + ');">' + prod.frontend_name + '</button>';
			out += '</div>';
		}
		out += '</div>';
	}
	$('#productList').html(out);
}

function newOrder() {
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
