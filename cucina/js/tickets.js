var tickets = [];
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
	console.log(cats);
	let params = {
		from_date: shiftDates.start,
		to_date: shiftDates.end,
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
		traditional: true,
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			let delay = 0;
			$('#ticketList').html('');
			response.tickets.forEach(ticket => {
				tickets[ticket.id] = ticket;
				$('#ticketList').append(orderMenuRow(ticket.id, (ticket.order.table != null ? 'Tav. ' + ticket.order.table + '<i class="bi bi-dot"></i>' : '') + ticket.order.customer, delay, ticket.order_id));
				delay += 0.02;
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status === 404)
				$('#ticketList').html('Nessuna comanda in questo stato');
			else
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

	if (ticket.completed_at == null)
		body += '<button class="btn btn-lg btn-info w-100" style="font-size: 2em;" onclick="completeTicket(' + id + ', true);"><i class="bi bi-star"></i> Evadi</button>';
	else
		body += '<button class="btn btn-lg btn-warning w-100" style="font-size: 2em;" onclick="completeTicket(' + id + ', false);"><i class="bi bi-box-arrow-left"></i> Ripristina</button>';
	dialog(title, body);
}

function completeTicket(id, completed) {
	$.ajax({
		url: apiUrl + '/tickets/' + id + '/completed',
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
