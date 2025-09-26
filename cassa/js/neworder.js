$('.nav-pills a[data-bs-target="#tabneworder"]').on('show.bs.tab', function () {
});

$(document).ready(function() {
	getProducts();
	newOrder();
});

var order = null;
var order_products = [];
var last_products = null;
var subcats = [];
var subcat_products = [];

function getProducts() {
	const params = {
		offset: 0,
		order_by: 'order',
		only_name: false,
		include_dates: false,
		include_ingredients: false,
		include_roles: false,
		include_subcategory: true,
		include_variants: false
	};

	$.ajax({
		async: false,
		url: apiUrl + '/products/',
		type: "GET",
		data: params,
		headers: {
			"Authorization": "Bearer " + token
		},
		success: function(response) {
			console.log("Dati ricevuti dal backend:", response);
			last_products = response.products;
			loadProducts();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			let errorMessage = '';

			if (jqXHR.status === 0) {
				errorMessage = 'Impossibile connettersi al server. Il server potrebbe essere offline o irraggiungibile.';
			} else if (jqXHR.status === 401) {
				errorMessage = 'Accesso non autorizzato. Controlla il tuo token.';
			} else if (jqXHR.status === 404) {
				errorMessage = 'Risorsa non trovata. Controlla l\'URL della richiesta.';
			} else if (jqXHR.status >= 500) {
				errorMessage = 'Errore interno del server. Riprova più tardi.';
			} else {
				errorMessage = `Si è verificato un errore: ${textStatus} ${errorThrown}`;
			}

			$('#productList').html('<div class="alert alert-danger mt-3" role="alert">' + errorMessage + '</div>');
			console.error("Errore AJAX:", textStatus, errorThrown, jqXHR);
		}
	});
}

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
			out += '<button class="btn btn-product px-1 mb-1 text-light" style="--bg-color: ' + prod.color + ';" onclick="addProd(' + i + ', ' + j + ');">' + prod.short_name + '</button>';
			out += '</div>';
		}
		out += '</div>';
	}
	$('#productList').html(out+out);
}

function headSubcat(name) {
	let out = '<div class="row mt-2">';
	out += '<div class="col-auto my-auto"><h6>' + name + '</h6></div>';
	out += '<div class="col p-0"><hr class="m-2"></div>';
	out += '</div>';
	return out;
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
		price: 0
	};

	order_products = [];
	subcats.forEach((_, i) => {
		order_products[i] = [];
	});

	loadOrder();
}

function loadOrder() {
	$('#customer').val(order.customer);
	$('#guests').val(order.guests == null ? '' : order.guests);
	$('#is_take_away').prop('checked', order.is_take_away);
	$('#is_fast_order').prop('checked', !order.has_tickets);
	$('#table').val(order.table == null ? '' : order.table);
	$('#is_voucher').prop('checked', order.is_voucher);
	$('#notes').val(order.notes == null ? '' : order.notes);
	checkInputDisabled();
	loadOrderProducts();
}

function checkInputDisabled() {
	$('#guests').prop('disabled', order.is_take_away);
	$('#table').prop('disabled', order.is_take_away || order.has_tickets);
	// Cambiare totale
}

function loadOrderProducts() {
	let out = '';
	subcats.forEach((subcat, i) => {
		if (order_products[i].length > 0) {
			out += '<div class="row mt-2"><div class="col-12" style="border-bottom: 2px solid #000;"><strong>' + subcat.name + '</strong></div></div>';
			//out += headSubcat(subcat.name);
		}
		order_products[i].forEach((p, j) => {
			let prod = subcat_products[i][j];
			out += productRow(i, j, prod.name, prod.price, p.quantity, p.notes);
			/*
			out += '<div class="row mb-1">';
			out += '<div class="col-3 pe-0"><div class="row d-flex align-items-center">';

			out += '<div class="col pe-0"><button class="btn btn-sm btn-dark" onclick="removeProd(' + i + ', ' + j + ');"><i class="bi bi-dash-lg"></i></button></div>';
			out += '<div class="col text-center p-0"><strong>' + p.quantity + '</strong></div>';
			out += '<div class="col ps-0 text-right"><button class="btn btn-sm btn-info" onclick="addProd(' + i + ', ' + j + ');"><i class="bi bi-plus-lg"></i></button></div>';
			out += '</div></div>';

			out += '<div class="col my-auto">' + prod.name + '</div>';

			out += '<div class="col-2 text-end">';
			out += '</div>';
			out += '</div>';
			*/
		});
	});

	$('#orderProducts').html(out);


}

function productRow(i, j, name, price, quantity, notes) {
	let id = i + '_' + j;
	let out = '';
	out += '<div class="row d-flex align-items-center orderrow py-1">';
	out += '<div class="col-2 p-0"><div class="row d-flex align-items-center">';

	// Decremento
	out += '<div class="col" style="padding-right: 0px;"><button class="btn btn-sm btn-dark" onclick="removeProd(' + i + ', ' + j + ');"><i class="bi bi-dash-lg"></i></button></div>';

	// Aumento
	out += '<div class="col" style="padding-left: 0px; text-align: right;"><button class="btn btn-sm btn-info" onclick="addProd(' + i + ', ' + j + ');"><i class="bi bi-plus-lg"></i></button></div>';

	// Quantità
	out += '<div class="col text-center p-0"><strong>' + quantity + '</strong></div>';

	out += '</div>';

	out += '</div><div class="col-8">' + name;
	out += '<span id="btnaddnotes' + id + '"' + (notes != null ? ' class="d-none"' : '') + '>&emsp;<button class="btn btn-sm btn-light" onclick="addNotes(' + i + ', ' + j + ');"><i class="bi bi-plus-lg"></i> Note</button></span>';
	out += '<span id="tagnotes' + id + '"' + (notes == null ? ' class="d-none"' : '') + '><br>→&nbsp;<input class="form-control form-control-sm d-inline" type="text" id="notes' + id + '" onchange="updateNotes(' + i + ', ' + j + ');" maxlength="63" style="width: 300px;" value="' + (notes != null ? notes : '') + '" />&nbsp;<button class="btn btn-sm btn-light" onclick="removeNotes(' + i + ', ' + j + ');"><i class="bi bi-x-lg"></i></button></span>' + '</div>';
	out += '<div class="col-2" style="text-align: right;">' + formatPrice(price * quantity) + '</div></div>';
	return out;
}

function formatPrice(p) {
	return '&euro;&nbsp;' + ('' + p).replace(".", ",") + ((p - Math.trunc(p)) != 0 ? '0' : ',00');
}

$('#customer').change(function() {
	order.customer = $(this).val().trim();
});

$('#guests').change(function() {
	let val = parseInt($(this).val());
	if (isNaN(val) || val < 0) {
		order.guests = null;
		$(this).val('');
	} else {
		order.guests = val;
	}
});

$('#is_take_away').change(function() {
	order.is_take_away = $(this).is(':checked');
	checkInputDisabled();
});

$('#is_fast_order').change(function() {
	order.has_tickets = !$(this).is(':checked');
	checkInputDisabled();
});

$('#table').change(function() {
	let val = $(this).val().trim();
	order.table = val == '' ? null : val;
});

$('#is_voucher').change(function() {
	order.is_voucher = $(this).is(':checked');
	checkInputDisabled();
});

$('#notes').change(function() {
	let val = $(this).val().trim();
	order.notes = val == '' ? null : val;
});

function addProd(subcat_index, prod_index) {
	let p = order_products[subcat_index][prod_index];
	if (p) {
		p.quantity++;
	} else {
		order_products[subcat_index][prod_index] = { quantity: 1, notes: null };
	}
	loadOrderProducts();
}

function removeProd(subcat_index, prod_index) {
	let p = order_products[subcat_index][prod_index];
	if (p) {
		p.quantity--;
		if (p.quantity <= 0) {
			order_products[subcat_index].splice(prod_index, 1);
			if (order_products[subcat_index].filter( element => element.id != "" ).length == 0) {
				order_products[subcat_index] = [];
			}
		}
	}
	loadOrderProducts();
}

function addNotes(subcat_index, prod_index) {
	let id = subcat_index + '_' + prod_index;
	$('#tagnotes' + id).removeClass('d-none');
	$('#btnaddnotes' + id).addClass('d-none');
	$('#notes' + id).val('').focus();
}

function updateNotes(subcat_index, prod_index) {
	let val = $('#notes' + subcat_index + '_' + prod_index).val().trim();
	order_products[subcat_index][prod_index].notes = val == '' ? null : val;
}

function removeNotes(subcat_index, prod_index) {
	let id = subcat_index + '_' + prod_index;
	$('#btnaddnotes' + id).removeClass('d-none');
	$('#tagnotes' + id).addClass('d-none');
	order_products[subcat_index][prod_index].notes = null;
}
