$(document).ready(function() {
	getSettings();
	getProducts();
	newOrder();
	loadComponents();
});

var order = null;
var order_products = [];
var last_products = null;
var subcats = [];
var subcat_products = [];
var payment_methods = [];

var cover_charge = null;
var receipt_header = null;
var order_requires_confirmation = null;

function loadProducts() {
	let subcat_ids = [];
	subcats = [];
	subcat_products = [];

	for (let i = 0; i < last_products.length; i++) {
		let product = last_products[i];
		let subcategory = product.subcategory;

		let index = subcat_ids.indexOf(subcategory.id);
		if (index == -1) {
			subcat_ids.push(subcategory.id);
			subcats.push(subcategory);
			subcat_products.push([]);
			index = subcat_ids.length - 1;
		}

		subcat_products[index].push(product);
	}

	let out = '';
	for (let i = 0; i < subcats.length; i++) {
		out += headSubcat(subcats[i].name);
		out += '<div class="row">';
		for (let j = 0; j < subcat_products[i].length; j++) {
			let prod = subcat_products[i][j];
			out += '<div class="col-3 ps-0 pe-1">';
			out += '<button class="btn btn-product px-2 mb-1 text-light" style="--bg-color: ' + prod.color + ';" onclick="addProd(' + i + ', ' + j + ');">' + prod.short_name + '</button>';
			out += '</div>';
		}
		out += '</div>';
	}
	$('#productList').html(out+out);
}

function newOrder() {
	order = {
		id: null,
		customer: '',
		guests: null,
		is_take_away: false,
		table: null,
		is_voucher: false,
		has_tickets: true,
		notes: null,
		payment_method_id: payment_methods[0].id,
		price: 0
	};

	order_products = [];
	subcats.forEach((_, i) => {
		order_products[i] = [];
	});

	loadOrder();
}

function loadOrderProducts() {
	let out = '';
	subcats.forEach((subcat, i) => {
		if (order_products[i].length > 0) {
			out += headSubcat(subcat.name);
		}
		order_products[i].forEach((p, j) => {
			let prod = subcat_products[i][j];
			out += productRow(i, j, prod.name, prod.price, p.quantity, p.notes);
		});
	});

	$('#orderProducts').html(out);
	updatePrice();
}

function headSubcat(name) {
	let out = '<div class="row mt-2">';
	out += '<div class="col-auto my-auto"><h6>' + name + '</h6></div>';
	out += '<div class="col p-0"><hr class="m-2"></div>';
	out += '</div>';
	return out;
}

function productRow(i, j, name, price, quantity, notes) {
	let id = i + '_' + j;
	let out = '';
	out += '<div class="row d-flex align-items-center order-row py-1">';

	// Buttons and quantity
	out += '<div class="col-auto p-0"><div class="row d-flex align-items-center">';
	out += '<div class="col pe-1"><button class="btn btn-sm btn-dark" onclick="removeProd(' + i + ', ' + j + ');"><i class="bi bi-dash-lg"></i></button></div>';
	out += '<div class="col p-0 text-right"><button class="btn btn-sm btn-info" onclick="addProd(' + i + ', ' + j + ');"><i class="bi bi-plus-lg"></i></button></div>';
	out += '<div class="col"><strong>' + quantity + '</strong></div>';
	out += '</div>';

	// Name and notes
	out += '</div><div class="col">' + name;
	out += '<span id="btnaddnotes' + id + '"' + (notes != null ? ' class="d-none"' : '') + '>&emsp;<button class="btn btn-sm btn-light" onclick="addNotes(' + i + ', ' + j + ');"><i class="bi bi-plus-lg"></i> Note</button></span>';
	out += '<span id="tagnotes' + id + '"' + (notes == null ? ' class="d-none"' : '') + '><br>';
	out += '<i class="bi bi-arrow-return-right"></i>&nbsp;';
	out += '<input class="form-control form-control-sm d-inline" type="text" id="notes' + id + '" onchange="updateNotes(' + i + ', ' + j + ');" maxlength="63" style="width: 300px;" value="' + (notes != null ? notes : '') + '" />&nbsp;';
	out += '<button class="btn btn-sm btn-light" onclick="removeNotes(' + i + ', ' + j + ');"><i class="bi bi-x-lg"></i></button></span>';
	out += '</div>';

	// Price
	out += '<div class="col-auto p-0">' + formatPrice(price * quantity) + '</div></div>';
	return out;
}

function formatPrice(p) {
	return '&euro;&nbsp;' + ('' + p).replace(".", ",") + ((p - Math.trunc(p)) != 0 ? '0' : ',00');
}

async function saveOrder() {
	// Check products
	let include_cover_charge = false;
	let num_products = 0;
	order_products.forEach((list, i) => {
		num_products += list.length;
		if (list.length > 0 && subcats[i].include_cover_charge) {
			include_cover_charge = true;
		}
	});
	if (num_products == 0) {
		showToast(false, 'Nessun prodotto selezionato!', 1);
		return;
	}

	// Check fields
	if (order.customer.trim() == '') {
		showToast(false, 'Inserire il nome del cliente!', 1);
		$('#customer').focus();
		return;
	}
	if (!order.is_take_away && order.has_tickets && order.guests == null) {
		showToast(false, 'Inserire il numero di coperti!', 1);
		$('#guests').focus();
		return;
	}

	// Check include cover charge
	if (order.guests != null && order.guests > 0) {
		if (!include_cover_charge) {
			let ok = await modalConfirm('Conferma ordine senza coperto', 'Nessun prodotto selezionato prevede il coperto, pertanto <strong>i coperti indicati verranno azzerati.</strong><br>Continuare?');
			if (!ok) return;
			$('#guests').val(0);
			order.guests = 0;
			updatePrice();
		}
	}

	// Alert for no tickets
	if (!order.has_tickets) {
		let ok = await modalConfirm('Conferma cassa veloce', 'La modalità <strong>cassa veloce</strong> non prevede la stampa delle comande, e dopo la stampa della ricevuta l\'ordine verrà contrassegnato come completato.<br>Confermi la modalità <strong>cassa veloce</strong>?');
		if (!ok) return;
	}

	sendOrder();
}

async function printOrder() {

}
