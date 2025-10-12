var actual_ward = null;

$(document).one('fm:sessionReady', function() {
	$.ajax({
		url: apiUrl + '/ingredients/wards',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			wards = response.wards;
			wards.forEach(ward => {
				$('#ward-list').append('<div class="col-6 col-sm-4 col-md-3 col-lg-2"><button class="btn btn-lg btn-warning w-100 mb-3" onclick="openWard(\'' + ward + '\');">' + ward + '</button></div>');
			})
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura dei reparti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
});


function openWard(ward) {
	actual_ward = ward;
	update();
	setInterval(update, 20000);
}


function update() {
	$.ajax({
		url: apiUrl + '/ingredients',
		type: "GET",
		data: {
			include_completed_quantities: true,
			ward: actual_ward,
			from_date: shiftDates.start,
			to_date: shiftDates.end
		},
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			$('#body').html('');
			let out = '<div class="row">';
			response.ingredients.forEach((ingredient, i) => {
				out += '<div class="col-12 col-md-6 mb-4">';
				out += '<div class="row"><div class="col-auto">';
				out += '<h4>' + ingredient.name + ':</h4>';
				out += '</div><div class="col-auto">';
				out += '<div class="bg-' + (ingredient.sold_quantity == 0 ? "dark" : (ingredient.sold_quantity < 20 ? "success" : "danger")) + ' stock-result" style="animation-delay: ' + (i * 0.05) + 's;"><h4 class="text-light m-0">' + ingredient.sold_quantity + '</h4></div>';
				out += '</div></div>';
				out += '<p>Ordinati: ' + (parseInt(ingredient.sold_quantity) + parseInt(ingredient.completed_quantity)) + ' - Evasi: ' + ingredient.completed_quantity + '</p>';
				out += '</div>';
			});
			out += '</div>';
			$('#body').html(out);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura degli ingredienti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}
