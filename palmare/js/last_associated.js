function lastAssociated() {
	menuColor('bg-info');
	$('#page-header').html('<h3 class="m-0"><button class="btn btn-info" onclick="initList();"><i class="bi bi-caret-left-fill"></i></button> Ultimi associati');
	$('#page-body').html('');
	let ids_from_server = [];

	$.ajax({
		url: apiUrl + '/orders/',
		type: "GET",
		data: {
			order_by: "-confirmed_at",
			limit: 20,
			confirmed_by_user: true,
			include_confirmer_user: true,
			include_tickets: true,
			include_products: true,
			include_products_product: true
		},
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			try {
				$.each(response.orders, function(i, order) {
					confirmed[order.id] = order;
					ids_from_server.push(order.id);
				});
			} catch (err) {
				$('#page-body').html('<span class="text-danger"><strong>Errore nell\'elaborazione della richiesta:</strong></span>' + err);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#page-body').html('<span class="text-danger">' + getErrorMessage(jqXHR, textStatus, errorThrown) + '</span><br />');
		}
	}).always(function() {
		const [locals, rollbacks] = localConfirmsAndRollbacksMerged();
		if (locals.length > 1)
			locals.sort(function(a, b) {
				if (a == null || b == null) return 0;
				return a.done_at - b.done_at;
			});
		
		// Warning: it overrides eventually data of the same order from the server
		locals.forEach(order => confirmed[order.id] = order);
		rollbacks.forEach(rollback => {
			confirmed[rollback.id] = null;
			ids_from_server[ids_from_server.indexOf(rollback.id)] = null;
		});
		
		let delay = 0;
		for (let i = 0; i < locals.length; i++) {
			btnOrder(locals[i].id, delay);
			delay += 0.02;
		}
		for (let i = 0; i < ids_from_server.length; i++) {
			if (ids_from_server[i] != null) {
				btnOrder(ids_from_server[i], delay);
				delay += 0.02;
			}
		}
		if (delay == 0)
			$('#page-body').append('Nessun ordine associato recentemente.');
		updateStatus();
	});
}


function btnOrder(id, delay) {
	$('#page-body').append('<button class="btn btn-secondary w-100 mb-3 ordinesala" style="animation-delay: ' + delay + 's;" onclick="orderSummary(' + id + ');"><div class="row"><div class="col-4"><big>&emsp;&emsp;' + id + '</big></div><div class="col my-auto">' + confirmed[id].customer + '</div></div></button><br>');
}
