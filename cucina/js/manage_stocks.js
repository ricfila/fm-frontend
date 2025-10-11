function viewStockList(id) {
	$.ajax({
		url: apiUrl + '/ingredients/' + id + '/stock',
		type: "GET",
		data: { valid: true },
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			let list = '';
			response.stocks.forEach((stock, i) => {
				list += '<div class="row mb-1">';
				list += '<div class="col-6 my-auto">' + formatShortDate(stock.available_from) + '<i class="bi bi-dot"></i><strong>' + formatTime(stock.available_from) + '</strong></div>';
				list += '<div class="col p-0"><div class="bg-' + (stock.quantity > 0 ? 'success' : 'danger') + ' stock-result" style="animation-delay: ' + (i * 0.05) + 's;"><h5 class="text-light mb-0">' + stock.quantity + '</h5></div></div>';
				list += '<div class="col-auto"><button class="btn btn-sm btn-warning" onclick="editStockModal(' + id + ', ' + stock.id + ');"><i class="bi bi-pencil-fill"></i><span class="d-none d-md-inline"> Modifica</span></button>';
				list += '<button class="btn btn-sm btn-danger ms-2" onclick="deleteStock(' + id + ', ' + stock.id + ');"><i class="bi bi-x-lg"></i><span class="d-none d-md-inline"> Elimina</span></button></div>';
				list += '</div>';
			});
			dialog('Stock inseriti per ' + ingredients[id].name, list);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == 404)
				showToast(false, 'Nessuno stock inserito per questo ingrediente');
			else
				showToast(false, 'Errore durante la lettura degli stock per "' + ingredients[id].name + '": ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function addStockModal(id) {
	dialog('Aggiungi stock', getKeyboard('Quantità', true), 'Conferma', 'addStock(' + id + ');');
}

function addStock(id, quantity = null) {
	$.ajax({
		url: apiUrl + '/ingredients/' + id + '/stock',
		type: "POST",
		data: JSON.stringify({ quantity: (quantity == null ? $('#inputKeyboard').val() * $('#keyboardSignValue').val() : quantity) }),
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			showToast(true, 'Stock salvato con successo', 2);
			modal.hide();
			getStockQuantities();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore durante l\'aggiunta dello stock per "' + ingredients[id].name + '": ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

function editStockModal(id, id_stock) {
	dialog('Modifica stock', getKeyboard('Quantità', true), 'Conferma', 'editStock(' + id + ', ' + id_stock + ');');
}

function editStock(id, id_stock) {
	$.ajax({
		url: apiUrl + '/ingredients/' + id + '/stock/' + id_stock,
		type: "PUT",
		data: JSON.stringify({ quantity: ($('#inputKeyboard').val() * $('#keyboardSignValue').val()) }),
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			showToast(true, 'Stock aggiornato con successo', 2);
			modal.hide();
			getStockQuantities();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore durante l\'aggiornamento dello stock per "' + ingredients[id].name + '": ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

async function deleteStock(id, id_stock) {
	let ok = await modalConfirm('Elimina stock', 'Sicuro di voler eliminare questo stock per ' + ingredients[id].name + '? L\'azione non è reversibile');
	if (ok) {
		$.ajax({
			url: apiUrl + '/ingredients/' + id + '/stock/' + id_stock,
			type: "DELETE",
			headers: { "Authorization": "Bearer " + token },
			success: function(response) {
				showToast(true, 'Stock eliminato con successo', 2);
				modal.hide();
				getStockQuantities();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				showToast(false, 'Errore durante l\'eliminazione dello stock per "' + ingredients[id].name + '": ' + getErrorMessage(jqXHR, textStatus, errorThrown));
			}
		});
	}
}
