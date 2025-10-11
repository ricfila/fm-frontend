var categories = [];
var subcategories = [];
var wards = [];

$(document).one('fm:sessionReady', function() {
	$.ajax({
		url: apiUrl + '/categories',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			response.categories.forEach(cat => {
				categories[cat.id] = cat;
				$('#categoryList').append('<div class="form-check"><input class="form-check-input category-check" type="checkbox" value="' + cat.id + '" id="categoryCheck_' + cat.id + '"><label class="form-check-label" for="categoryCheck_' + cat.id + '">' + cat.name + '</label></div>')
			});
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

$(document).ready(function() {
	wardsTab = bootstrap.Tab.getOrCreateInstance(document.querySelector('#wards-link'));
	stocksTab = bootstrap.Tab.getOrCreateInstance(document.querySelector('#stocks-link'));

	$('#stocks-link').on('shown.bs.tab', function() {
		$('#wards-link').addClass('active');
	}).on('hide.bs.tab', function() {
		$('#stocks-link').removeClass('active');
	});

	$('#wards-link').on('click', function() {
		$(this).removeClass('active');
		wardsTab.show();
	});

	for (let i = 0; i < localStorage.length; i++) {
		let k = localStorage.key(i);
		if (k.startsWith('alertingredient_')) {
			alert_for[localStorage.getItem(k)] = true;
		}
	}
});
