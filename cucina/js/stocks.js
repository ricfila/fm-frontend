function getStockQuantities() {
	$.ajax({
		url: apiUrl + '/ingredients/',
		type: "GET",
		data: {
			include_stock_quantities: true,
			await_cooking_time: (localStorage.getItem('fm_await_cooking_time') == 'true'),
			from_date: shiftDates.start,
			to_date: shiftDates.end
		},
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			$('#stock-list').html('');
			
			let i = 0;
			let soundAlert = false;
			response.ingredients.forEach(ingredient => {
				ingredients[ingredient.id] = ingredient;
				let last_key = 'fm_last_consumed_stock_' + shiftDates.start + ingredient.id;
				
				let diff;
				if (localStorage.getItem(last_key) == null)
					diff = ingredient.consumed_stock;
				else
					diff = ingredient.consumed_stock - localStorage.getItem(last_key);
				
				if (diff > 0) {
					localStorage.setItem(last_key, ingredient.consumed_stock);
					if (localStorage.getItem('fm_alertFor_' + ingredient.id) != null) {
						alertIngredient(ingredient.id, diff);
						soundAlert = true;
					}
				}

				if (isActiveWard(ingredient.ward)) {
					$('#stock-list').append(ingredientRow(ingredient, i++));
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
	out += '<div class="col p-0 card-title my-auto">' + ingredient.name + '</div>';
	out += '<div class="col-auto">';
		out += '<div class="bg-' + (stock_diff > 0 ? 'success' : 'danger') + ' stock-result" style="animation-delay: ' + (i * 0.05) + 's;">';
			out += '<h4 class="text-light m-0">' + stock_diff + '</h4>';
		out += '</div>';
	out += '</div>';

	out += '<div class="col-auto p-0"><div class="form-check ps-0">';
		out += '<input type="checkbox" class="btn-check" id="lock_' + ingredient.id + '" autocomplete="off" onchange="toggleLock(' + ingredient.id + ');"' + (ingredient.sell_if_stocked ? ' checked=""' : '') + '>\
				<label class="btn btn-sm btn-outline-danger" id="labellock_' + ingredient.id + '" for="lock_' + ingredient.id + '"><i class="bi bi-' + (ingredient.sell_if_stocked ? 'lock-fill' : 'unlock') + '"></i></label>';
	out += '</div></div>';

	out += '</div>';
	
	// Collapsed content
	out += '<div class="collapse" id="collapse_' + ingredient.id + '"><div class="row">';
		out += '<div class="col">';
			out += '<span class="text-success"><i class="bi bi-plus-square-fill me-2"></i>' + (ingredient.added_stock == null ? 'Non impostato' : ingredient.added_stock) + '</span><br>';
			out += '<span class="text-danger"><i class="bi bi-dash-square-fill me-2"></i>' + ingredient.consumed_stock + '</span>';
	if (ingredient.stock_starting_from != null) {
		out += '<br><i class="bi bi-clock me-2"></i>A partire dalle ' + formatTime(ingredient.stock_starting_from);
		if (!isThisSession(ingredient.stock_starting_from))
			out += ' del ' + formatShortDate(ingredient.stock_starting_from);
	}
		out += '</div>';
		out += '<div class="col-auto align-self-end">';
			out += '<button class="btn btn-sm btn-success" onclick="addStockModal(' + ingredient.id + ');"><i class="bi bi-database-fill-add me-2"></i>Aggiungi stock</button>';
			out += '<button class="btn btn-sm btn-warning ms-2" onclick="viewStockList(' + ingredient.id + ');"><i class="bi bi-clock-history me-2"></i>Cronologia stock</button>';
		out += '</div>';
	out += '</div></div>';

	out += '</div></div>';
	return out;
}

function toggleLock(id) {
	let lock = ($('#lock_' + id).is(':checked'));
	$('#labellock_' + id).html('<div class="spinner-border spinner-border-sm" role="status"></div>');

	$.ajax({
		url: apiUrl + '/ingredients/' + id + '/sell_if_stocked/',
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
