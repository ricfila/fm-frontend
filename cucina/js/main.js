var ingredients = [];
var wardsTab;
var stocksTab;
var updateTask1 = null;
var updateTask2 = null;


$(document).one('fm:sessionReady', function() {
	categories.forEach(category => {
		$('#categoryList').append('<div class="form-check"><input class="form-check-input category-check" type="checkbox" value="' + category.id + '" id="categoryCheck_' + category.id + '" onchange="toggleCategorySelected(' + category.id + ');"' + (localStorage.getItem('categorySelected_' + category.id) ? ' checked=""' : '') + '><label class="form-check-label" for="categoryCheck_' + category.id + '">' + category.name + '</label></div>');
	});

	$.ajax({
        async: false,
		url: apiUrl + '/ingredients/',
		type: "GET",
		data: { only_monitored: true },
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			response.ingredients.forEach(ingredient => {
				ingredients[ingredient.id] = ingredient;
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura degli ingredienti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});

	
	initSettings();
	initAlerts();
	toggleAutoUpdate(true);
});


function initSettings() {
	// Wards list
	wards.forEach(ward => {
		$('#ward-list').append('<div class="form-check"><input class="form-check-input" type="checkbox" value="' + ward + '" id="activeWard_' + ward + '" onchange="toggleActiveWard(\'' + ward + '\');"' + (localStorage.getItem('fm_activeWard_' + ward) != null ? ' checked=""' : '') + '><label class="form-check-label" for="activeWard_' + ward + '">' + ward + '</label></div>');
	});

	// Await cooking time radios
	if (localStorage.getItem('fm_await_cooking_time') == 'true')
		$('#inputAwaitCookingTime_true').prop('checked', true);
	else
		$('#inputAwaitCookingTime_false').prop('checked', true);

	// Checkboxes for alerts
	let ward_ingredients = {};
	ingredients.forEach(ing => {
		if (ward_ingredients[ing.ward] == null)
			ward_ingredients[ing.ward] = [];

		ward_ingredients[ing.ward].push(ing);
	});

	let out = '';
	for (const ward in ward_ingredients) {
		out += '<h4>' + ward + '</h4>';
		ward_ingredients[ward].forEach(ing => {
			out += '<div class="form-check"><input class="form-check-input" type="checkbox" value="' + ing.id + '" id="alertIngredientCheck_' + ing.id + '" onchange="toggleAlertIngredient(' + ing.id + ');"' + (localStorage.getItem('fm_alertFor_' + ing.id) != null ? ' checked=""' : '') + '><label class="form-check-label" for="alertIngredientCheck_' + ing.id + '">' + ing.name + (ing.cooking_time != null ? '<br /><strong>(preparazione ' + ing.cooking_time + 's)</strong>' : '') + '</label></div>';
		});
	}
	$('#ingredientListAlerts').html(out);
}


function toggleAutoUpdate(active) {
	if (active) {
		if (updateTask1 != null)
			clearInterval(updateTask1);
		if (updateTask2 != null)
			clearInterval(updateTask2);

		getStockQuantities();
		getResidualQuantities();
		updateTask1 = setInterval(getStockQuantities, 10000);
		updateTask2 = setInterval(getResidualQuantities, 20000);

		$('#labeltoggleAutoUpdate').html('<i class="bi bi-pause-circle-fill"></i>');
	} else {
		clearInterval(updateTask1);
		updateTask1 = null;

		clearInterval(updateTask2);
		updateTask2 = null;

		$('#labeltoggleAutoUpdate').html('<i class="bi bi-play-circle-fill"></i>');
	}
	$('#toggleAutoUpdate').prop('checked', active);
}


function toggleActiveWard(ward) {
	if (localStorage.getItem('fm_activeWard_' + ward) == null)
		localStorage.setItem('fm_activeWard_' + ward, ward);
	else
		localStorage.removeItem('fm_activeWard_' + ward);
}


function isActiveWard(ward) {
	return localStorage.getItem('fm_activeWard_' + ward) != null;
}


function toggleAwaitCookingTime(val) {
	localStorage.setItem('fm_await_cooking_time', val);
}


function toggleAlertIngredient(id) {
	if (localStorage.getItem('fm_alertFor_' + id) == null)
		localStorage.setItem('fm_alertFor_' + id, id);
	else
		localStorage.removeItem('fm_alertFor_' + id);
}


function toggleCategorySelected(id) {
	if ($('#categoryCheck_' + id).is(':checked'))
		localStorage.setItem('categorySelected_' + id, true);
	else
		localStorage.removeItem('categorySelected_' + id);
}
