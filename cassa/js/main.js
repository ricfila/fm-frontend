var order = null;
var order_products = [];
var last_products = null;
var subgroups = [];
var subgroup_products = [];
var payment_methods = [];

var recent_orders = [];
const MAX_RECENT_ORDERS = 10;


$(document).one('fm:sessionReady', function () {
	initialize();
	newOrder();
	loadComponents();
});

function initialize() {
	$.ajax({
		async: false,
		url: apiUrl + '/payment_methods/',
		type: "GET",
		data: { order_by: 'order' },
		headers: { "Authorization": "Bearer " + token },
		success: function (response) {
			payment_methods = response.payment_methods;
			payment_methods.forEach(element => {
				$('#paymentMethod').append('<option value="' + element.id + '">' + element.name + '</option>');
			});
		},
		error: function (jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione dei metodi di pagamento: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});

	$.ajax({
		async: true,
		url: apiUrl + '/orders/',
		type: "GET",
		data: { limit: MAX_RECENT_ORDERS, order_by: '-created_at', created_by_user: true },
		headers: { "Authorization": "Bearer " + token },
		success: function (response) {
			recent_orders = response.orders;
		},
		error: function (jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione degli ordini recenti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});

	initSettings();
	loadTakeAwayButtons();
}

$(document).ready(function () {
	$('#newOrderItem').click(async function () {
		if (selectedProducts() > 0) {
			let ok = await modalConfirm('<span class="text-success"><i class="bi bi-plus-circle me-2"></i>Nuovo ordine</span>', 'Iniziare un <strong>nuovo ordine</strong>? Tutte le modifiche non salvate andranno perse.');
			if (ok) newOrder();
		} else newOrder();
	});

	$('#dropdownOrdersContainer').on('show.bs.dropdown', function () {
		$('#dropdownOrdersMenu').html('');
		recent_orders.forEach(order => {
			$('#dropdownOrdersMenu').append('<li class="dropdown-item" onclick="loadFromServer(' + order.id + ');">' + order.id + '<i class="bi bi-dot"></i>' + order.customer + '</li>');
		});
	});
});

function loadTakeAwayButtons() {
	let icons = ['handbag-fill', 'cup-hot-fill'];

	//descrizioni automatiche per ordini da asporto -> sarrebbe da integrare nell'oggetto della categoria ma per ora va bene anche qui
	//nb asporto vuoto perchè va valorizzato manualmente dall'utente
	let fastDescription = ['', 'BAR'];

	let out = '';
	take_away_categories = getTakeAwayCategories();
	take_away_categories.forEach(cat => {
		out += '\
		<div class="col px-1">\
			<input type="checkbox" class="btn-check take_away_button" id="take_away_' + cat.take_away_type + '" value="' + cat.take_away_type + '" autocomplete="off" data-fast-description="' + fastDescription[cat.take_away_type - 1] + '">\
			<label class="btn btn-sm btn-outline-success w-100" for="take_away_' + cat.take_away_type + '"><i class="bi bi-' + icons[cat.take_away_type - 1] + ' me-2"></i>' + cat.name.charAt(0).toUpperCase() + cat.name.slice(1) + '</label>\
		</div>';
	});

	out += '\
	<div class="col px-1">\
		<input type="checkbox" class="btn-check" id="is_fast_order" autocomplete="off" data-fast-description="FLASH">\
		<label class="btn btn-sm btn-outline-primary w-100" for="is_fast_order"><i class="bi bi-lightning-charge-fill me-2"></i>Flash</label>\
	</div>';

	$('#take_away_buttons').html(out);
	updateTakeAwayButtons();
}

function updateTakeAwayButtons() {
	let showAll = (order != null && order.id != null);

	$('.take_away_button').each(function () {
		if (showAll || localStorage.getItem('FM_show_take_away_' + $(this).val()) != 'false')
			$(this).parent().show();
		else
			$(this).parent().hide();
	});
}
