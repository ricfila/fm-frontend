function actionOrderMenu(num) {
	menuColor('bg-warning');
	current_id = num;
	loadOrderHeader(orders[current_id], 'warning', 'window[\'lastMenuFunction\']();');
	let out = '<div class="pt-1 px-3" style="overflow-x: hidden;"><div style="animation: keyboardIn 0.4s; animation-fill-mode: forwards;">';
	out += '<div id="keyboard">' + tableKeyboard() + '</div>';
	out += '</div></div>';
	$('#page-body').html(out);
}


function confirmScreen() {
	current_table = $('#inputKeyboard').val();
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
	.html(tableKeyboard())
	.animate({opacity: 1});
}


function saveTable() {
	let order = {
		id: current_id,
		customer: orders[current_id].customer,
		guests: orders[current_id].guests,
		table: current_table,
		created_at: orders[current_id].created_at,
		done_at: Date.now()
	};
	localStorage.setItem('order_' + current_id, JSON.stringify(order))
	orders[current_id] = null;
	initList();
}


function loadOrderHeader(order, style, action = "initList();") {
	let out = '<div class="row">';
	out += '<div class="col-auto"><button class="btn btn-' + style + '" onclick="' + action + '"><i class="bi bi-caret-left-fill"></i></button></div>';
	out += '<div class="col ps-0 my-auto"><h3 class="m-0"><strong>' + order.id + '</strong><i class="bi bi-dot"></i><i>' + order.customer + '</i></h3></div>';
	out += '<div class="col-auto text-end' + (!isThisSession(order.created_at) ? ' bg-danger text-light' : '') + '" style="line-height: 1.2;"><small>' + formatShortDate(order.created_at) + '<br />' + formatTime(order.created_at) + '</small></div>';
	out += '</div>';
	$('#page-header').html(out);
}

function tableKeyboard() {
	out = getKeyboard('Tavolo');
	out += '<div class="row mb-3">\
				<div class="col" style="padding: 2px;">\
					<button class="btn btn-outline-primary btn-lg w-100 keyboard-btn btnlater disabled" onclick="key(\' SX\');">SX</button>\
				</div>\
				<div class="col" style="padding: 2px;">\
					<button class="btn btn-outline-primary btn-lg w-100 keyboard-btn btnlater disabled" onclick="key(\' CX\');">CX</button>\
				</div>\
				<div class="col" style="padding: 2px;">\
					<button class="btn btn-outline-primary btn-lg w-100 keyboard-btn btnlater disabled" onclick="key(\' DX\');">DX</button>\
				</div>\
			</div>\
			<div class="row"><div class="col" style="padding: 2px;">\
				<button class="btn btn-success btn-lg w-100 btnlater disabled" onclick="confirmScreen();"><i class="bi bi-check-circle-fill"></i>&emsp;OK</button>\
			</div></div>';
	return out;
}

