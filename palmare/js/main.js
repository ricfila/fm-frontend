var orders = [];
var confirmed = [];
var current_id = null;
var current_table;
var msg_err = '';
var lastMenuFunction = null;


$(document).one('fm:sessionReady', function() {
	setInterval(sendData, 3000);
});


function updateStatus() {
	//$('#attesa').html(ordinic.length > 0 ? '<i class="bi bi-upload"></i>' : '');
	$('#errorIcon').html(msg_err != '' ? '<i class="bi bi-exclamation-triangle-fill text-danger"></i>' : '');
}


function showError() {
	if (msg_err != '') {
		dialog('Errore', msg_err);
	}
}


function updateHeader(bgStyle, btnIcon, btnAction, title) {
	$('nav').removeClass('bg-warning').removeClass('bg-info').removeClass('bg-success').addClass('bg-' + bgStyle);
	$(".collapse").collapse('hide');

	let out = '<div class="row">';
	out += '<div class="col-auto"><button class="btn btn-' + bgStyle + '" onclick="' + btnAction + '"><i class="bi bi-' + btnIcon + '"></i></button></div>';
	out += '<div class="col ps-0 my-auto"><h3 class="m-0">' + title + '</h3></div></div>';
	$('#page-header').html(out);
}


function updateOrderHeader(order, style) {
	let title = '<strong>' + order.id + '</strong><i class="bi bi-dot"></i><i>' + order.customer + '</i></h3></div>';
	title += '<div class="col-auto text-end' + (!isThisSession(order.created_at) ? ' bg-danger text-light' : '') + '" style="line-height: 1.2;"><small>' + formatShortDate(order.created_at) + '<br />' + formatTime(order.created_at) + '</small>';
	updateHeader(style, 'caret-left-fill', 'window[\'lastMenuFunction\']();', title);
}


function btnOrderSimple(id, delay) {
	return '<button class="btn btn-secondary w-100 mb-3 btn-ordermenu" style="animation-delay: ' + delay + 's;" onclick="orderSummary(' + id + ');"><div class="row"><div class="col-4"><big>&emsp;&emsp;' + id + '</big></div><div class="col my-auto">' + confirmed[id].customer + '</div></div></button><br>';
}


function btnOrder(order, delay) {
	let table = (order.table != null && order.table != '' ? order.table :
		order.parent_order != null && order.parent_order.table != null && order.parent_order.table != '' ? order.parent_order.table : null);
	
	let out = '<button class="btn btn-secondary w-100 mb-3 btn-ordermenu" style="animation-delay: ' + delay + 's;" onclick="orderSummary(' + order.id + ');"><div class="row">';

	out += '<div class="col-3 my-auto"><big>' + order.id + '</big></div>';

	out += '<div class="col my-auto">' + order.customer + '<hr class="m-1">';
	out += '<div class="row text-info"><div class="col"><i class="bi bi-clock me-2"></i>' + formatTime(order.created_at) + '</div>' + (table != null ? '<div class="col"><i class="bi bi-diamond me-2"></i>' + table + '</div>' : '') + '</div></div>';

	out += '<div class="col-auto my-auto">' + (isBookmarked(order.id) ? '<i class="bi bi-bookmark-fill text-warning"></i>' : '<i class="bi bi-bookmark"></i>') + '</div>';

	out += '</div></button><br>';
	return out;
}
