$(document).one('fm:sessionReady', function() {
	let degrees = ['Associatore novizio', 'Principiante promettente', 'Abile tirocinante', 'Adocchia-clienti provetto', 'Gira-tavoli ferrato', 'Cameriere bersagliere', 'Abbinatore esperto', 'Servitore assessore', 'Maggiordomo qualificato', 'Generale pluridecorato', 'Sovrano della sala'];
	let icons = ['dice-1-fill', 'dice-2-fill', 'dice-3-fill', 'dice-4-fill', 'dice-5-fill', 'dice-6-fill', 'fire', 'award-fill', 'mortarboard-fill', 'stars', 'trophy-fill'];

	$.ajax({
		url: apiUrl + '/orders',
		type: "GET",
		data: {confirmed_by_user: true},
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			let degree = response.total_count >= 100 ? 11 : Math.floor(response.total_count / 10) + 1;
			let out = '<h6>Fino ad ora hai abbinato <strong>' + response.total_count + '</strong> ordin' + (response.total_count == 1 ? 'e' : 'i') + '</h6>';
			out += '<p>Hai raggiunto il grado ' + (degree == 11 ? 'massimo' : degree) + '</p>';
			out += '<h5 class="text-' + (degree < 7 ? 'primary' : (degree < 11 ? 'danger' : 'warning')) + '"><i class="bi bi-' + icons[degree - 1] + '"></i>&nbsp;' + degrees[degree - 1] + '</h5>';
			$('#contest').html(out);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			msg_err = 'Errore nella lettura degli ordini associati per il concorso: ' + getErrorMessage(jqXHR, textStatus, errorThrown);
		}
	});
});
