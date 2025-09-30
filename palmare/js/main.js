var orders = [];
//var ordinic = [];
var confirmed = [];
var current_id = null;
var current_table;
var msg_err = '';


function updateStatus() {
	//$('#attesa').html(ordinic.length > 0 ? '<i class="bi bi-upload"></i>' : '');
	$('#errorIcon').html(msg_err != '' ? '<i class="bi bi-exclamation-triangle-fill text-danger"></i>' : '');
}


function showError() {
	if (msg_err != '') {
		dialog('Errore', msg_err);
	}
}


function initList() {
	menuColor('bg-success');
	let out = '<div class="row">';
	out += '<div class="col-auto"><button class="btn btn-success" onclick="getList();"><i class="bi bi-arrow-clockwise text-lead"></i></button></div>';
	out += '<div class="col my-auto ps-0"><h3 class="m-0">Ordini da raccogliere</h3></div></div>';
	$('#page-header').html(out);
	getList();
}


function getList() {
	$('#page-body').html('');//<div class="spinner-border spinner-border-sm"></div>&nbsp;Caricamento in corso...');

	$.ajax({
		url: apiUrl + '/orders/',
		type: "GET",
		data: { order_by: "created_at", need_confirm: true },
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			$('#page-body').html('');
			try {
				orders = [];
				//Preparazione della lista con gli ordini non ancora associati in locale
				$.each(response.orders, function(i, order) {
					if (localStorage.getItem('order_' + order.id) == null)
						orders[order.id] = order;
				});
			} catch (err) {
				$('#page-body').html('<span class="text-danger"><strong>Errore nell\'elaborazione della richiesta:</strong></span>' + err);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#page-body').html('<span class="text-danger">' + getErrorMessage(jqXHR, textStatus, errorThrown) + '</span><br />');
		}
	}).always(function() {
		let delay = 0;
		for (let i = 0; i < orders.length; i++) {
			if (orders[i] != null) {
				$('#page-body').append('<button class="btn btn-secondary w-100 mb-3 ordinesala" style="animation-delay: ' + delay + 's;" onclick="associateOrder(' + i + ');"><div class="row"><div class="col-4"><big>' + i + '</big></div><div class="col my-auto">' + orders[i].customer + '</div></div></button><br>');
				delay += 0.02;
			}
		}
		if (delay == 0)
			$('#page-body').append('Nessun ordine da raccogliere.');
		updateStatus();
	});
}


function sendData() {
	updateStatus();

	const [confirms, rollbacks] = localConfirmsAndRollbacks();

	if (confirms.length + rollbacks.length > 0) {
		$.ajax({
			url: apiUrl + '/orders/confirm',
			type: "PATCH",
			data: JSON.stringify({confirms: confirms, rollbacks: rollbacks}),
			contentType: 'application/json; charset=utf-8',
			headers: { "Authorization": "Bearer " + token },
			success: function(response) {
				msg_err = '';
				response.rollbacks_succeeded.forEach(id => localStorage.removeItem('rollback_' + id));
				response.confirms_succeeded.forEach(id => localStorage.removeItem('order_' + id));
				response.errors.forEach(error => {
					msg_err += 'Errore durante l\'operazione ' + (error.type) + ' dell\'ordine ' + error.order_id + ': ' + error.message + '<br>';
				});
				showError();
				updateStatus();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				msg_err = 'Errore nell\'invio dei dati: ' + getErrorMessage(jqXHR, textStatus, errorThrown);
			},
			timeout: 2000
		});
	}
}
setInterval(sendData, 3000);


function localConfirmsAndRollbacks() {
	let confirms = [];
	let rollbacks = [];

	for (let i = 0; i < localStorage.length; i++) {
		let k = localStorage.key(i);

		if (k.startsWith('rollback_')) {
			rollbacks.push(JSON.parse(localStorage.getItem(k)).id);
		}

		if (k.startsWith('order_')) {
			let item = JSON.parse(localStorage.getItem(k));
			confirms.push({order_id: item.id, table: item.table});
		}
	}

	return [confirms, rollbacks];
}


function localConfirms() {
	let confirms = [];

	for (let i = 0; i < localStorage.length; i++) {
		let k = localStorage.key(i);

		if (k.startsWith('order_')) {
			let item = JSON.parse(localStorage.getItem(k));
			let rollback = localStorage.getItem('rollback_' + item.id);
			if (rollback == null || rollback.done_at < item.done_at)
				confirms.push(item);
		}
	}
	
	return confirms;
}