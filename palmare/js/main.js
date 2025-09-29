var orders = [];
var ordinic = [];
var fatti = [];
var current_id = null;
var current_table;
var msg_err = '';


function updateStatus() {
	//$('#attesa').html(ordinic.length > 0 ? '<i class="bi bi-upload"></i>' : '');
	$('#errorIcon').html(msg_err != '' ? '<i class="bi bi-exclamation-triangle-fill text-danger"></i>' : '');
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
				$('#page-body').html('<span class="text-danger"><strong>Errore nell\'elaborazione della richiesta:</strong></span>' + json);
			}
		},
		error: function(jqxhr, textStatus, error) {
			$('#page-body').html('<span class="text-danger"><strong>Errore durante la richiesta:</strong></span>' + jqxhr.responseText);
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
		}
	);
}


function associateOrder(num) {
	menuColor('bg-warning');
	current_id = num;
	loadOrderHeader(orders[current_id], 'warning');
	let out = '<div class="pt-1 px-3" style="overflow-x: hidden;"><div style="animation: tastieraTav 0.4s; animation-fill-mode: forwards;">';
	out += '<div id="keyboard">' + keyboard + '</div>';
	out += '</div></div>';
	$('#page-body').html(out);
}


function confirmScreen() {
	current_table = $('#inputTable').val();
	if (current_table.length > 0) {
		$('#keyboard')
		.html('<h4 style="letter-spacing: 10px;" id="riep">Tavolo: <big><strong class="text-success">' + current_table + '</strong></big></h4><br>\
			<div class="row" id="confirm-buttons"><div class="col" style="padding: 2px;">\
				<button class="btn btn-danger btn-lg w-100 mb-2" onclick="cancelTable();"><i class="bi bi-x-circle"></i>&emsp;Annulla</button>\
				<button class="btn btn-success btn-lg w-100" onclick="saveTable();"><i class="bi bi-check-circle-fill"></i>&emsp;Conferma</button>\
			</div></div>')
		$('#riep').animate({letterSpacing: "0px"});
	}
}


function cancelTable() {
	$('#keyboard')
	.css('opacity', 0)
	.html(keyboard)
	.animate({opacity: 1});
}


function saveTable() {
	let order = {
		id: current_id,
		customer: orders[current_id].customer,
		guests: orders[current_id].guests,
		table: current_table,
		created_at: orders[current_id].created_at
	};
	localStorage.setItem('order_' + current_id, JSON.stringify(order))
	orders[current_id] = null;
	initList();
}


function sendData() {
	updateStatus();

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
			error: function(jqxhr, textStatus, error) {
				msg_err = 'Errore nell\'invio dei dati: ' + error;
			},
			timeout: 2000
		});
	}
}
setInterval(sendData, 5000);


function showError() {
	if (msg_err != '') {
		dialog('Errore', msg_err);
	}
}


function loadOrderHeader(order, style, action = "initList();") {
	let out = '<div class="row">';
	out += '<div class="col-auto"><button class="btn btn-' + style + '" onclick="' + action + '"><i class="bi bi-caret-left-fill"></i></button></div>';
	out += '<div class="col-auto ps-0 my-auto"><h3 class="m-0"><strong>' + order.id + '</strong><i class="bi bi-dot"></i><i>' + order.customer + '</i></h3></div>';
	out += '<div class="col text-end" style="line-height: 1.2;"><small>' + formatShortDate(order.created_at) + '<br />' + formatTime(order.created_at) + '</small></div>';
	out += '</div>';
	$('#page-header').html(out);
}


let keyboard = '<div class="row"><div class="col" style="padding: 2px;">\
				<div class="input-group mb-3">\
					<input type="text" class="form-control form-control text-center" id="inputTable" style="padding: 5px; font-size: 1.5em; margin: 0px;" placeholder="Tavolo">\
					<button class="btn btn-danger btn-lg" onclick="tav(false);"><i class="bi bi-backspace"></i></button>\
				</div>\
			</div></div>\
			<div class="row">\
				<div class="col" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'1\');">1</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'4\');">4</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'7\');">7</button><br>\
				</div>\
				<div class="col" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'2\');">2</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'5\');">5</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'8\');">8</button><br>\
				</div>\
				<div class="col" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'3\');">3</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'6\');">6</button><br>\
					<button class="btn btn-outline-dark btn-lg w-100 numt" onclick="tav(\'9\');">9</button><br>\
				</div>\
			</div>\
			<div class="row">\
				<div class="col"></div>\
				<div class="col-4" style="padding: 0px 2px;">\
					<button class="btn btn-outline-dark btn-lg w-100 numt btnlater disabled" onclick="tav(\'0\');">0</button>\
				</div>\
				<div class="col"></div>\
			</div>\
			<div class="row mb-3">\
				<div class="col" style="padding: 2px;">\
					<button class="btn btn-outline-primary btn-lg w-100 numt btnlater disabled" onclick="tav(\' SX\');">SX</button>\
				</div>\
				<div class="col" style="padding: 2px;">\
					<button class="btn btn-outline-primary btn-lg w-100 numt btnlater disabled" onclick="tav(\' CX\');">CX</button>\
				</div>\
				<div class="col" style="padding: 2px;">\
					<button class="btn btn-outline-primary btn-lg w-100 numt btnlater disabled" onclick="tav(\' DX\');">DX</button>\
				</div>\
			</div>\
			<div class="row"><div class="col" style="padding: 2px;">\
				<button class="btn btn-success btn-lg w-100 btnlater disabled" onclick="confirmScreen();"><i class="bi bi-check-circle-fill"></i>&emsp;OK</button>\
			</div></div>';


function tav(stringa) {
	if (!stringa) {
		$('#inputTable').val('');
		$('.btnlater').each(function() {$(this).addClass('disabled');});
	} else {
		$('#inputTable').val($('#inputTable').val() + stringa);
		$('.btnlater').each(function() {$(this).removeClass('disabled');});
	}
}
