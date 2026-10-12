function getResidualQuantities() {
	$.ajax({
		url: apiUrl + '/ingredients/',
		type: "GET",
		data: {
			include_completed_quantities: true,
			only_monitored: true,
			from_date: shiftDates.start,
			to_date: shiftDates.end
		},
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			let out = '<div class="row">';
			let j = 0;
			response.ingredients.forEach((ingredient, i) => {
				if (isActiveWard(ingredient.ward)) {
					out += '<div class="col-12 col-md-6 mb-4">';
					out += '<div class="row">';
					out += '<div class="col-auto">';
					out += '<div class="bg-' + (ingredient.sold_quantity == 0 ? "dark" : (ingredient.sold_quantity < 20 ? "success" : "danger")) + ' stock-result" style="animation-delay: ' + (j * 0.05) + 's;"><h4 class="text-light m-0">' + ingredient.sold_quantity + '</h4></div>';
					out += '</div>';
					out += '<div class="col my-auto ps-0">';
					out += '<h5 class="m-0">' + ingredient.name + '</h5>';
					out += '<p>Ordinati: ' + (Math.ceil(ingredient.sold_quantity) + Math.ceil(ingredient.completed_quantity)) + ' - Evasi: ' + ingredient.completed_quantity + '</p>';
					out += '</div>';
					out += '</div>';
					out += '</div>';
					j++;
				}
			});
			out += '</div>';
			$('#residuals-body').html(out);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura degli ingredienti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}
