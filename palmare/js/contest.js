var degrees = [
    {name: 'Associatore novizio', icon: 'dice-1-fill', color: '#90bd12'},
    {name: 'Addetto in esercizio', icon: 'dice-2-fill', color: '#66aa14'},
    {name: 'Principiante promettente', icon: 'dice-3-fill', color: '#25ab36'},
    {name: 'Tirocinante competente', icon: 'dice-4-fill', color: '#0b9e54'},
    {name: 'Valletto allenato', icon: 'dice-5-fill', color: '#009e75'},
    {name: 'Gira-tavoli ferrato', icon: 'dice-6-fill', color: '#009e99'},
    {name: 'Emissario errante', icon: 'signpost-split', color: '#009bba'},
    {name: 'Aitante aiutante', icon: 'life-preserver', color: '#008ad4'},
    {name: 'Cameriere bersagliere', icon: 'speedometer2', color: '#1a6ee8'},
    {name: 'Maratoneta senza barriere', icon: 'strava', color: '#3459e6'},
    {name: 'Adocchia-clienti provetto', icon: 'binoculars-fill', color: '#4a47e6'},
    {name: 'Stacanovista quasi perfetto', icon: 'rocket-takeoff-fill', color: '#6d3ce0'},
    {name: 'Garzone per sfizio', icon: 'sunglasses', color: '#9933d1'},
    {name: 'Esperto del sodalizio', icon: 'search-heart', color: '#c22ebf'},
    {name: 'Sapiente abbinatore', icon: 'mortarboard-fill', color: '#d92b8d'},
    {name: 'Servitore assessore', icon: 'award-fill', color: '#e62e5c'},
    {name: 'Veterano redditizio', icon: 'graph-up-arrow', color: '#e63b34'},
    {name: 'Maestro del servizio', icon: 'crosshair', color: '#e0531b'},
    {name: 'Maggiordomo qualificato', icon: 'fire', color: '#d66f00'},
    {name: 'Ufficiale pluridecorato', icon: 'stars', color: '#e59508'},
    {name: 'Sovrano della sala', icon: 'trophy-fill', color: '#ffb011'}
];

$(document).one('fm:sessionReady', function() {
	$.ajax({
		url: apiUrl + '/orders/',
		type: "GET",
		data: {confirmed_by_user: true},
		contentType: 'application/json; charset=utf-8',
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			let degree = response.total_count >= 100 ? 11 : Math.floor(response.total_count / 10) + 1;
			let out = '<h6>Fino ad ora hai abbinato <strong>' + response.total_count + '</strong> ordin' + (response.total_count == 1 ? 'e' : 'i') + '</h6>';
			out += '<p>Hai raggiunto il grado ' + (degree == 11 ? 'massimo' : degree) + '</p>';
			out += '<h5>' + printDegree(degree) + '</h5>';
			out += '<button class="btn btn-sm btn-outline-secondary" onclick="showDegrees();">Mostra tutti i gradi</button>';
			$('#contest').html(out);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			msg_err = 'Errore nella lettura degli ordini associati per il concorso: ' + getErrorMessage(jqXHR, textStatus, errorThrown);
		}
	});
});

function printDegree(degree) {
	//class="text-' + (degree < 7 ? 'primary' : (degree < 11 ? 'danger' : 'warning')) + '"
	return '<span style="color: ' + degrees[degree - 1].color + ';"><i class="bi bi-' + degrees[degree - 1].icon + ' me-2"></i>' + degrees[degree - 1].name + '</span>';
}

function showDegrees() {
	let out = '';
	for (let i = 1; i <= degrees.length; i++)
		out += printDegree(i) + '<br/>';
	dialog('Gradi', out);
}
