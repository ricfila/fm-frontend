async function printOrder() {
	let called = false;

	window.__printWindowReady = function(print_w) {
		called = true;
		populateAndPrint(print_w);
		delete window.__printWindowReady;
	};

	let print_w = window.open('cassa/print.html', 'PRINT', 'height=400,width=600');

    if (!print_w) {
        showToast(false, 'Impossibile aprire la finestra di stampa (popup bloccato)');
        return;
    }

	setTimeout(() => {
		try {
			if (!called) populateAndPrint(print_w);
		} catch(e) {
			showToast(false, 'Timeout preparazione stampa');
		}
	}, 3000);
}

function populateAndPrint(print_w) {
	try {
		const dateObj = new Date(order.created_at);
		const dateStr = new Intl.DateTimeFormat('it-IT', {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}).format(dateObj).replace(/\./g, '');

		print_w.document.getElementById('outDate').innerHTML = dateStr;
		print_w.document.getElementById('outUser').innerHTML = order.user.name + (order.payment_method_id > 1 ? '*' : '');
		print_w.document.getElementById('outId').innerHTML = order.id;
		print_w.document.getElementById('outCustomer').innerHTML = order.customer;

		let has_table = order.table != null && order.table != '';
		print_w.document.getElementById('outService').style.display = order.is_take_away || (!order.has_tickets && !has_table) ? 'none' : 'block';
		if (!order.has_tickets && has_table)
			print_w.document.getElementById('outService').innerHTML = 'Tavolo: <strong>' + order.table + '</strong>';

		print_w.document.getElementById('outGuests').innerHTML = order.is_take_away ? 'ASPORTO' :
			(order.guests == null || order.guests == 0 ? 'AGGIUNTA' :
				'COPERTI: <strong>' + order.guests + '</strong>' +
				(cover_charge > 0 ? '&emsp;(' + formatPrice(order.guests * cover_charge) + ')' : '')
			);

		let products = '';
		subcats.forEach((subcat, i) => {
			if (order_products[i].length > 0) {
				products += headSubcat(subcat.name);
			}
			order_products[i].forEach((p, j) => {
				let prod = subcat_products[i][j];
				products += productRowPrint(prod.name, prod.price, p.quantity, p.notes);
			});
		});
		print_w.document.getElementById('orderProducts').innerHTML = products;

		print_w.document.getElementById('outPrice').innerHTML = formatPrice(order.price);
		if (order.notes != null && order.notes != '') {
			print_w.document.getElementById('outNotes').innerHTML = order.notes;
			print_w.document.getElementById('divNotes').style.display = 'block';
		} else {
			print_w.document.getElementById('divNotes').style.display = 'none';
		}

		print_w.focus(); // necessary for IE >= 10
		print_w.print();
	} catch (e) {
		showToast(false, 'Errore nella preparazione della stampa: ' + e.message);
		console.error('Errore durante populateAndPrint:', e);
	}
};

function productRowPrint(name, price, quantity, notes) {
	let out = '';
	out += '<div class="row">';

	out += '<div class="col-1 text-end">' + quantity + '</div>';

	out += '<div class="col">' + name;
	if (notes != null && notes != '')
		out +='<br><i class="bi bi-arrow-return-right"></i>&nbsp;' + notes;
	out += '</div>';

	out += '<div class="col-auto">' + formatPrice(price * quantity) + '</div>';
	out += '</div>';
	return out;
}
