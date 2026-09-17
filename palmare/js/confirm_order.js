function associateOrder(num) {
	actionOrderMenu(num);
}


function actionOrderMenu(num) {
	current_id = num;
	updateOrderHeader(orders[current_id], 'warning');
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
				<button class="btn btn-danger btn-lg w-100 mb-2" onclick="cancelTable();"><i class="bi bi-x-circle me-3"></i>Annulla</button>\
				<button class="btn btn-success btn-lg w-100" onclick="saveTable();"><i class="bi bi-check-circle-fill me-3"></i>Conferma</button>\
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
				<button class="btn btn-success btn-lg w-100 btnlater disabled" onclick="confirmScreen();"><i class="bi bi-check-circle-fill me-3"></i>OK</button>\
			</div></div>';
	return out;
}
