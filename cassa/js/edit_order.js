async function deleteOrder() {
	let ok = await modalConfirm('Elimina ordine', 'Sei sicuro di voler eliminare quest\'ordine?');
	if (ok) {
		$.ajax({
			async: true,
			url: apiUrl + '/orders/' + order.id,
			type: "DELETE",
			headers: { "Authorization": "Bearer " + token },
			success: async function(response) {
				showToast(true, 'Ordine eliminato con successo');
				newOrder();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				showToast(false, 'Errore nella cancellazione dell\'ordine: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
			}
		});
	}
}

async function resumeOrder() {
	let ok = await modalConfirm('Ripristina ordine', 'Sei sicuro di voler ripristinare quest\'ordine?');
	if (ok) {
		$.ajax({
			async: true,
			url: apiUrl + '/orders/' + order.id,
			type: "POST",
			headers: { "Authorization": "Bearer " + token },
			success: async function(response) {
				showToast(true, 'Ordine ripristinato con successo');
				loadFromServer(order.id);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				showToast(false, 'Errore nella cancellazione dell\'ordine: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
			}
		});
	}
}
