var wardsTab, stocksTab;
var actual_ward = null;
var ingredients = [];
var last_consumed_stock = [];
var alert_for = [];
var updateTask = null;

function openWard(ward) {
	actual_ward = ward;
	stocksTab.show();
	$('#title-stocks').html('Monitoraggio stock ' + actual_ward);
	toggleAutoUpdate(true);
}

function toggleAutoUpdate(active) {
	if (active) {
		if (updateTask != null)
			clearInterval(updateTask);

		getStockQuantities();
		updateTask = setInterval(getStockQuantities, 10000);
		$('#labeltoggleAutoUpdate').html('<i class="bi bi-pause-circle-fill"></i>');
	} else {
		clearInterval(updateTask);
		updateTask = null;
		$('#labeltoggleAutoUpdate').html('<i class="bi bi-play-circle-fill"></i>');
	}
	$('#toggleAutoUpdate').prop('checked', active);
}

function getStockQuantities() {
	$.ajax({
		url: apiUrl + '/ingredients',
		type: "GET",
		data: { include_stock_quantities: true, await_cooking_time: true },
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			$('#ingredient-list').html('');
			
			let i = 0;
			let soundAlert = false;
			response.ingredients.forEach(ingredient => {
				ingredients[ingredient.id] = ingredient;
				if (last_consumed_stock[ingredient.id] == null) {
					last_consumed_stock[ingredient.id] = ingredient.consumed_stock;
					if (alert_for[ingredient.id] == null)
						alert_for[ingredient.id] = false;
				} else {
					let diff = ingredient.consumed_stock - last_consumed_stock[ingredient.id];
					if (diff > 0) {
						last_consumed_stock[ingredient.id] = ingredient.consumed_stock;
						if (alert_for[ingredient.id]) {
							alertIngredient(ingredient.id, diff);
							soundAlert = true;
						}
					}
				}

				if (ingredient.ward == actual_ward) {
					$('#ingredient-list').append(ingredientRow(ingredient, i++));
				}
			});

			if (soundAlert) {
				document.getElementById('alert-sound').play();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura degli ingredienti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function ingredientRow(ingredient, i) {
	let stock_diff = ingredient.added_stock - ingredient.consumed_stock;

	let out = '<div class="card mb-3"><div class="card-body">';
	
	// Row title
	out += '<div class="row" role="button" data-bs-toggle="collapse" data-bs-target="#collapse_' + ingredient.id + '" aria-expanded="false" aria-controls="collapse_' + ingredient.id + '">';
	out += '<div class="col-auto card-title my-auto">' + ingredient.name + '</div>';
	out += '<div class="col">';
		out += '<div class="bg-' + (stock_diff > 0 ? 'success' : 'danger') + ' stock-result" style="animation-delay: ' + (i * 0.05) + 's;">';
			out += '<h4 class="text-light m-0">' + stock_diff + '</h4>';
		out += '</div>';
	out += '</div>';

	out += '<div class="col-auto p-0 d-flex flex-row"><div class="form-check ps-0">';
		out += '<input type="checkbox" class="btn-check" id="alert_' + ingredient.id + '" autocomplete="off" onchange="toggleAlert(' + ingredient.id + ');"' + (alert_for[ingredient.id] ? ' checked=""' : '') + '>\
				<label class="btn btn-sm btn-outline-warning" id="labelalert_' + ingredient.id + '" for="alert_' + ingredient.id + '"><i class="bi bi-' + (alert_for[ingredient.id] ? 'bell-fill' : 'bell-slash') + '"></i></label>';
	out += '</div>';

	out += '<div class="form-check ps-3">';
		out += '<input type="checkbox" class="btn-check" id="lock_' + ingredient.id + '" autocomplete="off" onchange="toggleLock(' + ingredient.id + ');"' + (ingredient.sell_if_stocked ? ' checked=""' : '') + '>\
				<label class="btn btn-sm btn-outline-danger" id="labellock_' + ingredient.id + '" for="lock_' + ingredient.id + '"><i class="bi bi-' + (ingredient.sell_if_stocked ? 'lock-fill' : 'unlock') + '"></i></label>';
	out += '</div></div>';

	out += '</div>';
	
	// Collapsed content
	out += '<div class="collapse" id="collapse_' + ingredient.id + '"><div class="row">';
		out += '<div class="col">';
			out += '<span class="text-success"><i class="bi bi-plus-square-fill"></i> ' + (ingredient.added_stock == null ? 'Non impostato' : ingredient.added_stock) + '</span><br>';
			out += '<span class="text-danger"><i class="bi bi-dash-square-fill"></i> ' + ingredient.consumed_stock + '</span>';
	if (ingredient.stock_starting_from != null) {
		out += '<br><i class="bi bi-clock"></i> A partire dalle ' + formatTime(ingredient.stock_starting_from);
		if (!isThisSession(ingredient.stock_starting_from))
			out += ' del ' + formatShortDate(ingredient.stock_starting_from);
	}
		out += '</div>';
		out += '<div class="col-auto align-self-end">';
			out += '<button class="btn btn-sm btn-success" onclick="addStockModal(' + ingredient.id + ');"><i class="bi bi-database-fill-add"></i> Aggiungi stock</button>';
			out += '<button class="btn btn-sm btn-warning ms-2" onclick="viewStockList(' + ingredient.id + ');"><i class="bi bi-clock-history"></i> Cronologia stock</button>';
		out += '</div>';
	out += '</div></div>';

	out += '</div></div>';
	return out;
}

function toggleAlert(id) {
	alert_for[id] = !alert_for[id];
	$('#labelalert_' + id).html('<i class="bi bi-' + (alert_for[id] ? 'bell-fill' : 'bell-slash') + '"></i>');
	if (alert_for[id]) {
		localStorage.setItem('alertingredient_' + id, id);
	} else {
		localStorage.removeItem('alertingredient_' + id);
	}
}

function toggleLock(id) {
	let lock = ($('#lock_' + id).is(':checked'));
	$('#labellock_' + id).html('<div class="spinner-border spinner-border-sm" role="status"></div>');

	$.ajax({
		url: apiUrl + '/ingredients/' + id + '/sell_if_stocked',
		type: "PUT",
		data: JSON.stringify({ sell_if_stocked: lock }),
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			$('#labellock_' + id).html('<i class="bi bi-' + (lock ? 'lock-fill' : 'unlock') + '"></i>');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#lock_' + id).prop('checked', !lock);
			$('#labellock_' + id).html('<i class="bi bi-' + (!lock ? 'lock-fill' : 'unlock') + '"></i>');
			showToast(false, 'Errore nell\'impostazione del blocco per "' + ingredients[id].name + '": ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function alertIngredient(id, quantity) {
	showToast(true, 'Preparare <strong>' + quantity + '</strong> unità di ' + ingredients[id].name + '<br><button class="btn btn-sm btn-light" data-bs-dismiss="toast" onclick="addStock(' + id + ', ' + quantity + ');">Aggiungi allo stock</button>', false, 'info');
}