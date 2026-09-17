$(document).one('fm:sessionReady', function() {
	categories.forEach(category => {
		$('#categoryList').append('<div class="form-check"><input class="form-check-input category-check" type="checkbox" value="' + category.id + '" id="categoryCheck_' + category.id + '" onchange="toggleCategorySelected(' + category.id + ');"' + (localStorage.getItem('categorySelected_' + category.id) ? ' checked=""' : '') + '><label class="form-check-label" for="categoryCheck_' + category.id + '">' + category.name + '</label></div>');
	});

	wards.forEach(ward => {
		$('#ward-list').append('<div class="col-6 col-sm-4 col-md-3 col-lg-2"><button class="btn btn-lg btn-primary w-100 mb-3" onclick="openWard(\'' + ward + '\')">' + ward + '</button></div>');
	})
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

function toggleCategorySelected(id) {
	if ($('#categoryCheck_' + id).is(':checked'))
		localStorage.setItem('categorySelected_' + id, true);
	else
		localStorage.removeItem('categorySelected_' + id);
}
