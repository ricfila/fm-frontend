var modSearch;
var searchType = 0;
var found = [];


$(document).ready(function() {
	modSearch = new bootstrap.Modal(document.getElementById('mod-search'));
	document.getElementById('mod-search').addEventListener('shown.bs.modal', function (e) {
		document.getElementById("search-input").focus();
	});
});


function selectSearchMode() {
	lastMenuFunction = selectSearchMode;
	updateHeader('info', 'caret-left-fill', 'initList();', 'Cerca un ordine');

	$('#page-body').html('<div class="btn-group-vertical w-100">\
		<button class="btn btn-lg btn-outline-info" onclick="searchDialog(1);"><i class="bi bi-123 me-2"></i>Per numero</button>\
		<button class="btn btn-outline-info btn-lg" onclick="searchDialog(2);"><i class="bi bi-diamond me-2"></i>Per tavolo</button>\
		<button class="btn btn-outline-info btn-lg" onclick="searchDialog(3);"><i class="bi bi-person me-2"></i>Per nominativo</button>\
	</div>');
}


function searchDialog(type) {
	searchType = type;
	$('#search-error').html('');
	$('#search-input').val('');
	switch (type) {
		case 1:
			$('#search-desc').html('Inserisci il numero dell\'ordine:');
			$('#search-input').attr('type', 'number');
			break;
		case 2:
			$('#search-desc').html('Inserisci il numero del tavolo:<br>(senza indicare SX, DX o CX)');
			$('#search-input').attr('type', 'number');
			break;
		case 3:
			$('#search-desc').html('Inserisci il nome del cliente:');
			$('#search-input').attr('type', 'text');
			break;
		default:
			break;
	}
	modSearch.show();
	found = [];
}


function search() {
	let params = {};
	if (searchType == 2)
		params.search_by_table = $('#search-input').val();
	if (searchType == 3)
		params.search_by_customer = $('#search-input').val();

	$.ajax({
		url: apiUrl + '/orders/' + (searchType == 1 ? $('#search-input').val() : ''),
		type: "GET",
		data: Object.assign({}, required_for_summary, params),
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			if (searchType == 1) {
				confirmed[response.id] = response;
				orderSummary(response.id);
			} else {
				found = response.orders;
				searchResult();
			}
			modSearch.hide();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status === 404) {
				$('#search-error').html('<strong class="text-danger">Ordine non trovato</strong>');
			} else {
				$('#search-error').html('<span class="text-danger"><strong>Errore durante la richiesta:</strong></span>' + getErrorMessage(jqXHR, textStatus, errorThrown));
			}
		}
	});
}


async function searchResult() {
	lastMenuFunction = searchResult;
	updateHeader('info', 'caret-left-fill', 'selectSearchMode();', 'Ordini ' + (searchType == 2 ? 'del tavolo ' : (searchType == 3 ? 'associati al nome ' : 'numerati ')) + $('#search-input').val());
	
	if (found.length == 0) {
		$('#page-body').html('Nessun ordine trovato.');
	} else {
		$('#page-body').html('');
		let delay = 0;
		
		for (let i = 0; i < found.length; i++) {
			if (found[i].parent_order_id != null && found[i].parent_order == null)
				found[i].parent_order = await fetchOrder(found[i].parent_order_id, required_for_summary);
			
			confirmed[found[i].id] = found[i];
			$('#page-body').append(btnOrder(found[i], delay));

			delay += 0.02;
		}
	}
}
