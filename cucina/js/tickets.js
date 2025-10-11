var tickets = [];

function getTickets(status) {
	$('.link-tickets').each(function() {
		$(this).removeClass('active');
	});
	$('#linktickets' + status).addClass('active');

	let cats = [];
	$('.category-check').each(function() {
		if ($(this).is(':checked')) cats.push($(this).val());
	});
	let params = {
		include_order: true,
		categories: cats
	};
	switch (status) {
		case 0:
			params["is_confirmed"] = false;
			params["is_printed"] = false;
			params["is_completed"] = false;
			break;
		case 1:
			params["is_confirmed"] = true;
			params["is_printed"] = false;
			params["is_completed"] = false;
			break;
		case 2:
			params["is_printed"] = true;
			params["is_completed"] = false;
			break;
		case 3:
			params["is_completed"] = true;
	}

	$.ajax({
		url: apiUrl + '/tickets',
		type: "GET",
		data: params,
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			let delay = 0;
			$('#ticketList').html('');
			response.tickets.forEach(ticket => {
				tickets[ticket.id] = ticket;
				$('#ticketList').append(orderMenuRow(ticket.id, ticket.order.customer, delay));
				delay += 0.02;
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura delle comande: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function actionOrderMenu(id) {
	let ticket = tickets[id];
	let order = ticket.order;
	let title = 'Ordine N° <strong>' + order.id + '</strong>';
	let body = '<p>Cliente: <strong>' + order.customer + '</strong>' + (order.guests != null ? ' (' + order.guests + ' coperti)' : '') + '<br>';
	body += 'Emesso da ' + order.user.username + ' alle ore <strong>' + formatTime(order.created_at) + '</strong><br>';
	if (order.is_confirmed)
		body += 'Confermato' + (order.confirmed_by != null ? ' da <strong>' + order.confirmed_by.username + '</strong>': '') + ' alle ore <strong>' + formatTime(order.confirmed_at) + '</strong>';
	
	body += '</p><h4 class="mb-0 text-info">Comanda ' + categories[ticket.category_id].name + '</h4>';
	body += ticketStory(ticket, categories, order.confirmed_at);
	dialog(title, body);
}