var ordineatt = null;

let istati = [['compass', 'printer', 'clipboard2-pulse'],
			['hourglass-split', 'clipboard2-pulse']];
let lstati = [['In attesa di associazione al tavolo', 'In attesa di stampa', 'In lavorazione'],
			['In attesa', 'In lavorazione']];

function orderSummary(id, array = false) {
	// Pescaggio dell'ordine da mostrare
	if (array == 'ordinic') {
		ordineatt = ordinic[id];
	} else if (array == 'confirmed') {
		ordineatt = confirmed[id];
	} else {
		ordineatt = trovati[id];
	}
	
	loadOrderHeader(ordineatt, 'info', (array == 'trovati' ? (tipocerca > 2 ? 'rescerca();' : 'cercaordine();') : 'lastAssociated();'));
	let out = '';
	if (!ordineatt.questoturno)
		out += '<div class="p-2 alert alert-danger"><strong class="text-danger">Attenzione!</strong> Il presente ordine non è stato emesso in questo turno di servizio. Verifica la data sulla comanda!</div>';
	out += '<h4 class="mb-0">Cliente: <strong>' + ordineatt.cliente + '</strong></h4>';
	out += (ordineatt.coperti != null ? '&emsp;<strong>' + ordineatt.coperti + '</strong> copert' + (ordineatt.coperti == 1 ? 'o' : 'i') : '');
	out += (ordineatt.note.length > 0 ? '<br>&emsp;<i class="bi bi-sticky-fill"></i>&nbsp;' + ordineatt.note : '');

	if (ordineatt.esportazione == true) {
		out += '<h4 class="mt-2">Ordine per ASPORTO</h4>';
	} else {
		let notavolo = ordineatt.tavolo == null || ordineatt.tavolo == '' || ordineatt.tavolo == 'null';
		out += '<h4 class="mt-2 mb-0">Tavolo: <strong>';
		if (notavolo) {
			if (orders[ordineatt.id] == null)
				orders[ordineatt.id] = ordineatt;
			out += '<small class="text-body-secondary"><i>non associato</i>&emsp;<button class="btn btn-sm btn-success" onclick="associateOrder(' + ordineatt.id + ');">Associa ora</button></small>';
		} else
			out += ordineatt.tavolo;
		out += '</strong>' + (array == 'ordinic' || (!notavolo && ordineatt.stato == 0) ? '&emsp;<button class="btn btn-sm btn-outline-danger" onclick="dialogRipristina();">Dissocia</button>' : '') + '</h4>';
		out += (array == 'ordinic' ? '&emsp;Associato da <strong><i>te stesso</i></strong>' :
			(ordineatt.associazione != null && ordineatt.associazione != 'null' ? '&emsp;Associato da <strong>' + ordineatt.cameriere + '</strong> alle ' + ordineatt.associazione.substr(0, 5) : ''));
	}
	if (array != 'ordinic') {
		out += '<br><hr>';
		let statocomanda;
		if (ordineatt.esportazione) {
			if (ordineatt.stato == 0)
				statocomanda = 0; // In attesa
			else
				statocomanda = 1; // In lavorazione
		} else {
			if (ordineatt.associazione == null || ordineatt.associazione == 'null')
				statocomanda = 0; // In attesa di associazione al tavolo
			else {
				if (ordineatt.stato == 0)
					statocomanda = 1; // Trascrizione tavolo in corso
				else
					statocomanda = 2; // In lavorazione
			}
		}
		let bevasa = ordineatt.stato_bar != 'ordinato';
		let cevasa = ordineatt.stato_cucina != 'ordinato';
		if (ordineatt.copia_bar && !ordineatt.esportazione) {
			out += '<div class="row"><div class="col"><h4 class="mb-0 text-info">Comanda bevande:</h4></div>';
			out += '<div class="col-auto"><button class="btn btn-sm btn-info" onclick="apricomanda(1);"><i class="bi bi-list-task"></i> Leggi</button></div></div>';
			for (let i = 0; i < 3; i++) {
				out += '&emsp;<i class="bi bi-' + istati[0][i] + (i < statocomanda || bevasa ? '-fill' : '') + '"></i> ' + (i == statocomanda && !bevasa ? lstati[0][i] : '') + '<br>';
			}
			out += '&emsp;<i class="bi bi-star' + (bevasa ? '-fill"></i> Evasa' + (ordineatt.stato_bar != '' ? ' alle ' + ordineatt.stato_bar.substr(0, 5) : '') : '"></i>');
		}
		if (ordineatt.copia_cucina) {
			out += '<div class="row"><div class="col"><h4 class="mt-2 mb-0" style="color: var(--bs-orange);">Comanda cucina:</h4></div>';
			out += '<div class="col-auto"><button class="btn btn-sm text-light" style="background-color: var(--bs-orange);" onclick="apricomanda(2);"><i class="bi bi-list-task"></i> Leggi</button></div></div>';
			for (let i = 0; i < 3; i++) {
				if (ordineatt.esportazione && i == 2)
					break;
				out += '&emsp;<i class="bi bi-' + istati[(ordineatt.esportazione ? 1 : 0)][i] + (i < statocomanda || cevasa ? '-fill' : '') + '"></i> ' + (i == statocomanda && !cevasa ? lstati[(ordineatt.esportazione ? 1 : 0)][i] : '') + '<br>';
			}
			out += '&emsp;<i class="bi bi-star' + (cevasa ? '-fill"></i> Evasa' + (ordineatt.stato_cucina != '' ? ' alle ' + ordineatt.stato_cucina.substr(0, 5) : '') : '"></i>');
		}
	}
	$('#page-body')
	.css('opacity', 0)
	.html(out)
	.animate({opacity: 1});
}

function apricomanda(tipo) {
	out = '';
	$.getJSON("ajax.php?a=comanda&id=" + ordineatt.id + "&tipo=" + tipo)
	.done(function(json) {
		try {
			tipologia = null;
			$.each(json, function(i, art) {
				if (art.tipologia != tipologia) {
					out += '<h6 class="' + (tipologia != null ? 'mt-3 ' : '') + 'p-2 text-light" style="background: var(--bs-gray);">' + art.tipologia + '</h6>';
					tipologia = art.tipologia;
				}
				out += '<div class="row"><div class="col-1">' + art.quantita + '</div><div class="col">' + art.descrizione + '</div></div>';
				if (art.note.length > 0)
					out += '<div class="row"><div class="col-1"></div><div class="col"><i class="bi bi-sticky-fill"></i>&nbsp;' + art.note + '</div></div>';
			});
		} catch (err) {
			out = '<span class="text-danger"><strong>Errore nell\'elaborazione della richiesta:</strong></span>' + json;
		}
	})
	.fail(function(jqxhr, textStatus, error) {
		out = '<span class="text-danger"><strong>Errore durante la richiesta:</strong></span>' + jqxhr.responseText;
	})
	.always(function() {
		dialog((tipo == 1 ? '<strong class="text-info">Comanda bevande</strong>' : '<strong style="color: var(--bs-orange);">Comanda cucina</strong>'), out);
	});
}

function dialogRipristina() {
	dialog('Dissocia tavolo', 'Sei sicuro di voler annullare l\'associazione al tavolo di questo ordine?<br><br><span id="msgdrip"></span>', '<button class="btn btn-success" onclick="ripristina();"><i class="bi bi-check-circle-fill"></i> Conferma</button>');
}

function ripristina() {
	setCookie('action' + Date.now(), '-_' + ordineatt.id);
	ordineatt.tavolo = null;
	orders[ordineatt.id] = ordineatt;
	confirmed[ordineatt.id] = null;
	ordineatt = null;
	modal.hide();
	lastAssociated();
	
	/*
	let ordine;
	$('#msgdrip').html('<span class="text-success">Elaborazione in corso...</span>');
	if (array == 'salvati') {
		let salvati2;
		for (let i = 0; i < salvati.length; i++) {
			if (salvati[0].id == id) {
				ordine = salvati.shift();
			} else {
				salvati2.push(salvati.shift());
			}
		}
		salvati = salvati2;
		orders[current_id] = ordine;
		orders[current_id].tavolo = null;
		modal.hide();
		lastAssociated();
	} else {
		ordine = confirmed[current_id];
		confirmed[current_id] = null;
		$.ajax({
			url: "ajax.php?a=dissocia&id=" + current_id,
			success: function(res) {
				if (res == '1') {
					orders[current_id] = ordine;
					orders[current_id].tavolo = null;
					modal.hide();
					lastAssociated();
				} else {
					$('#msgdrip').html('<span class="text-danger">' + res + '</span>');
				}
			},
			error: function(xhr, status, error) { // Server non raggiungibile
				$('#msgdrip').html('<span class="text-danger">Errore nell\'invio dei dati: ' + error + '</span>');
			},
			timeout: 2000
		});
	}
	*/
}
