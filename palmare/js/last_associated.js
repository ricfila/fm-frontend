function lastAssociated() {
	lastMenuFunction = lastAssociated;
	updateHeader('info', 'caret-left-fill', 'initList();', 'Ultimi associati');
	$('#page-body').html('');
	
	let ids_from_server = [];

	$.ajax({
		url: apiUrl + '/orders/',
		type: "GET",
		data: Object.assign({}, required_for_summary, {
			order_by: "-confirmed_at",
			limit: 20,
			confirmed_by_user: true
		}),
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
		
		locals.forEach(order => {
			if (confirmed[order.id] == null)
				confirmed[order.id] = order;
		});
		rollbacks.forEach(rollback => {
			confirmed[rollback.id] = null;
			ids_from_server[ids_from_server.indexOf(rollback.id)] = null;
		});
		
		let delay = 0;
		for (let i = 0; i < locals.length; i++) {
			$('#page-body').append(btnOrderSimple(locals[i].id, delay));
			delay += 0.02;
		}
		for (let i = 0; i < ids_from_server.length; i++) {
			if (ids_from_server[i] != null) {
				$('#page-body').append(btnOrderSimple(ids_from_server[i], delay));
				delay += 0.02;
			}
		}
		if (delay == 0)
			$('#page-body').append('Nessun ordine associato recentemente.');
		updateStatus();
	});
}
