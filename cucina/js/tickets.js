var orders = [];
var tickets_map = {};
var actual_status = null;

function getTickets(status) {
	$('.link-tickets').each(function() {
		$(this).removeClass('active');
	});
	$('#linktickets' + status).addClass('active');
	actual_status = status;

	let cats = [];
	$('.category-check').each(function() {
		if ($(this).is(':checked')) cats.push(parseInt($(this).val()));
	});

	const params = {
		order_by: 'id',
		from_date: shiftDates.start,
		to_date: shiftDates.end,
		include_confirmer_user: true,
		include_products: true,
		include_products_product: true,
		include_tickets: true,
		include_user: true,
		has_tickets: true
	};

	$.ajax({
		url: apiUrl + '/orders/',
		type: "GET",
		data: params,
		traditional: true,
		headers: { "Authorization": "Bearer " + token },
		success: async function(response) {
			let delay = 0;
			$('#ticketList').html('');

			for (const order of response.orders) {
				if (order.parent_order_id != null)
					order.parent_order = await fetchOrder(order.parent_order_id, params);

				orders[order.id] = order;

				order.tickets.forEach(ticket => {
					if (
						cats.includes(ticket.category_id) && (
							(status == 0 && order.needs_confirmation && order.confirmed_at == null && ticket.printed_at == null && ticket.completed_at == null) ||
							(status == 1 && (!order.needs_confirmation || order.confirmed_at != null) && ticket.printed_at == null && ticket.completed_at == null) ||
							(status == 2 && ticket.printed_at != null && ticket.completed_at == null) ||
							(status == 3 && ticket.completed_at != null)
						)
					) {
						tickets_map[ticket.id] = order.id;
						let table = (order.table != null ? order.table : (order.parent_order != null && order.parent_order.table != null ? order.parent_order.table : null));

						$('#ticketList').append(
							orderMenuRow(
								ticket.id,
								(table != null ? 'Tav. ' + table + '<i class="bi bi-dot"></i>' : '') + order.customer,
								delay,
								order.id
							)
						);
						delay += 0.02;
					}
				});
			}

			if (delay == 0)
				$('#ticketList').html('Nessuna comanda in questo stato');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status === 404)
				$('#ticketList').html('Nessuna comanda in questo stato');
			else
				showToast(false, 'Errore nella lettura degli ordini: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function actionOrderMenu(id) {
	let order = orders[tickets_map[id]];
	let ticket = order.tickets.find(ticket => ticket.id == id);

	let title = 'Ordine N° <strong>' + order.id + '</strong>';
	let body = '<p>Cliente: <strong>' + order.customer + '</strong>' + (order.guests != null ? ' (' + order.guests + ' coperti)' : '') + '<br>';
	body += 'Emesso da ' + order.user.username + ' alle <strong>' + formatTime(order.created_at) + '</strong><br>';
	if (order.is_confirmed)
		body += 'Confermato' + (order.confirmed_by != null ? ' da <strong>' + order.confirmed_by.username + '</strong>': '') + ' alle <strong>' + formatTime(order.confirmed_at) + '</strong>';
	
	body += '</p><h4 class="mb-0 text-info">Comanda ' + categories[ticket.category_id].name + '</h4>';
	body += ticketStory(order, ticket);

	if (ticket.completed_at == null)
		body += '<button class="btn btn-lg btn-info w-100 my-4" style="font-size: 2em;" onclick="completeTicket(' + id + ', true);"><i class="bi bi-star me-2"></i>Evadi</button>';
	else
		body += '<button class="btn btn-lg btn-warning w-100 my-4" style="font-size: 2em;" onclick="completeTicket(' + id + ', false);"><i class="bi bi-box-arrow-left me-2"></i>Ripristina</button>';
	dialog(title, body);
}

function completeTicket(id, completed) {
	$.ajax({
		url: apiUrl + '/tickets/' + id + '/completed/',
		type: "PUT",
		data: JSON.stringify({ is_completed: completed }),
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			showToast(true, 'La comanda è stata ' + (completed ? 'evasa' : 'ripristinata') + ' con successo');
			hideDialog();
			getTickets(actual_status);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nell\'aggiornamento dello stato della comanda: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}
