function sendOrder() {
	let params = {
		customer: order.customer,
		guests: order.is_take_away || order.guests == 0 ? null : order.guests,
		is_take_away: order.is_take_away,
		table: order.table,
		is_voucher: order.is_voucher,
		has_tickets: order.has_tickets,
		notes: order.notes,
		parent_order_id: null,
		payment_method_id: order.payment_method_id,
		products: [],
		menus: []
	};

	order_products.forEach((subcat, i) => {
		subcat.forEach((prod, j) => {
			params.products.push({
				product_id: subcat_products[i][j].id,
				quantity: prod.quantity,
				notes: prod.notes
			});
		});
	});

	$.ajax({
		async: false,
		url: apiUrl + '/orders/',
		type: "POST",
		data: JSON.stringify(params),
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: async function(response) {
			showToast(true, 'L\'ordine è stato salvato con successo');

			order.guests = response.order.guests;
			order.table = response.order.table;
			order.price = response.order.price;
			
			if (order.id == null) {
				order.id = response.order.id;
				order.created_at = response.order.created_at;
				order.user = { name: username };
				await printOrder();
				//newOrder();
			} else {
				loadOrder();
			}
		},
		error: handleError
	});
}
