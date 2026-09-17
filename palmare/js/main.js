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
