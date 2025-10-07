var categories = [];
var subcategories = [];
var wards = [];

$(document).one('fm:sessionReady', function() {
	$.ajax({
		url: apiUrl + '/categories',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			response.categories.forEach(cat => categories[cat.id] = cat); 
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura delle categorie: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
	$.ajax({
		url: apiUrl + '/subcategories',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			response.subcategories.forEach(subcat => subcategories[subcat.id] = subcat); 
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura delle sottocategorie: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
	$.ajax({
		url: apiUrl + '/ingredients/wards',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			wards = response.wards;
			wards.forEach(ward => {
				$('#ward-list').append('<div class="col-6 col-sm-4 col-md-3 col-lg-2"><button class="btn btn-lg btn-primary w-100 mb-3" onclick="openWard(\'' + ward + '\')">' + ward + '</button></div>');
			})
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura dei reparti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
});
