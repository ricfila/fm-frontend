var orders = [];
var confirmed = [];
var current_id = null;
var current_table;
var msg_err = '';


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
