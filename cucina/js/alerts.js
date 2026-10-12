function initAlerts() {
	let alerts = [];
	for (const key in localStorage)
		if (key.startsWith('fm_alert_'))
			alerts.push(key);
	
	alerts.sort();
	alerts.forEach(alert => { showAlert(alert); });
}


function alertIngredient(ingredient_id, quantity) {
	let alert_id = 'fm_alert_' + Date.now();
	localStorage.setItem(alert_id, ingredient_id + '_' + quantity);
	showAlert(alert_id);
}


function showAlert(alert_id) {
	let alert_data = localStorage.getItem(alert_id).split('_');

	let out = '<div id="' + alert_id + '">';
	out += '<div class="row">';
	out += '<div class="col-auto my-auto ps-3"><h4 class="m-0">' + alert_data[1] + '</h4></div>';
	out += '<div class="col my-auto">' + ingredients[alert_data[0]].name + '</div>';
	out += '<div class="col-auto p-0"><button class="btn btn-lg btn-light py-1" onclick="addStockAlert(\'' + alert_id + '\');"><i class="bi bi-database-fill-add text-warning"></i></button></div>';
	out += '<div class="col-auto"><button class="btn btn-lg btn-success py-1" onclick="dismissAlert(\'' + alert_id + '\');"><i class="bi bi-check-lg"></i></button></div>';
	out += '</div><hr>';
	out += '</div>';

	$('#alert-list').append(out);
}


function addStockAlert(alert_id) {
	let alert_data = localStorage.getItem(alert_id).split('_');
	addStock(alert_data[0], alert_data[1]);
	dismissAlert(alert_id);
}


function dismissAlert(alert_id) {
	localStorage.removeItem(alert_id);
	$('#' + alert_id).animate(
		{height: 0, opacity: 0},
		function() { $(this).remove(); }
	);
}
