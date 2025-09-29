var ordineatt = null;

function ultimiassociati() {
	menuColor('bg-info');
	$('#page-header').html('<h3 class="m-0"><button class="btn btn-info" onclick="initList();"><i class="bi bi-caret-left-fill"></i></button> Ultimi associati');
	$('#page-body').html('');
	let sorting = [];
	$.getJSON("ajax.php?a=ultimi")
	.done(function(json) {
		try {
			$.each(json, function(i, res) {
				fatti[res.id] = res;
				sorting.push(res.id);
			});
		} catch (err) {
			$('#page-body').html('<span class="text-danger"><strong>Errore nell\'elaborazione della richiesta:</strong></span>' + json);
		}
	})
	.fail(function(jqxhr, textStatus, error) {
		$('#page-body').html('<span class="text-danger"><strong>Errore durante la richiesta:</strong></span>' + jqxhr.responseText);
	})
	.always(function() {
		let sortingc = ordiniCookie();
		
		let out = fatti.concat(ordinic);
		if (out.length > 1)
			out.sort(function(a, b) {
				if (a == null || b == null)
					return 0;
				return b.ora - a.ora});
		let delay = 0;
		for (let i = sortingc.length - 1; i >= 0; i--) {
			$('#page-body').append('<button class="btn btn-secondary w-100 mb-3 ordinesala" style="animation-delay: ' + delay + 's;" onclick="apriordine(' + ordinic[sortingc[i]].id + ', \'ordinic\');"><div class="row"><div class="col-4"><big>&emsp;&emsp;' + ordinic[sortingc[i]].progressivo + '</big></div><div class="col my-auto">' + ordinic[sortingc[i]].cliente + '</div></div></button><br>');
			delay += 0.02;
		}
		for (let i = 0; i < sorting.length; i++) {
			$('#page-body').append('<button class="btn btn-secondary w-100 mb-3 ordinesala" style="animation-delay: ' + delay + 's;" onclick="apriordine(' + sorting[i] + ', \'fatti\');"><div class="row"><div class="col-4"><big><i class="bi bi-check' + (fatti[sorting[i]].stato > 0 ? '-all text-info' : '') + '"></i>&emsp;' + fatti[sorting[i]].progressivo + '</big></div><div class="col my-auto">' + fatti[sorting[i]].cliente + '</div></div></button><br>');
			delay += 0.02;
		}
		if (delay == 0)
			$('#page-body').append('Nessun ordine associato recentemente.');
		updateStatus();
	});
}

let istati = [['compass', 'printer', 'clipboard2-pulse'],
			['hourglass-split', 'clipboard2-pulse']];
let lstati = [['In attesa di associazione al tavolo', 'In attesa di stampa', 'In lavorazione'],
			['In attesa', 'In lavorazione']];

function apriordine(id, array = false) {
	// Pescaggio dell'ordine da mostrare
	if (array == 'ordinic') {
		ordineatt = ordinic[id];
	} else if (array == 'fatti') {
		ordineatt = fatti[id];
	} else {
		ordineatt = trovati[id];
	}
	
	loadOrderHeader(ordineatt, 'info', (array == 'trovati' ? (tipocerca > 2 ? 'rescerca();' : 'cercaordine();') : 'ultimiassociati();'));
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
	fatti[ordineatt.id] = null;
	ordineatt = null;
	modal.hide();
	ultimiassociati();
	
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
		ultimiassociati();
	} else {
		ordine = fatti[current_id];
		fatti[current_id] = null;
		$.ajax({
			url: "ajax.php?a=dissocia&id=" + current_id,
			success: function(res) {
				if (res == '1') {
					orders[current_id] = ordine;
					orders[current_id].tavolo = null;
					modal.hide();
					ultimiassociati();
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
