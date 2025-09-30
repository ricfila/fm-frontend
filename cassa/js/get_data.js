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

function getSettings() {
	$.ajax({
		async: false,
		url: apiUrl + '/settings/',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			cover_charge = response.settings.cover_charge;
			receipt_header = response.settings.receipt_header;
			order_requires_confirmation = response.settings.order_requires_confirmation;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});

	$.ajax({
		async: false,
		url: apiUrl + '/payment_methods/',
		type: "GET",
		data: { order_by: 'order' },
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			$('#paymentMethod').html('');
			payment_methods = response.payment_methods;
			if (payment_methods.length == 0) {
				$('#paymentMethod').append('<option value="">Nessun metodo di pagamento</option>');
			} else {
				payment_methods.forEach(element => {
					$('#paymentMethod').append('<option value="' + element.id + '">' + element.name + '</option>');
				});
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}
