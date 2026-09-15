var order = null;
var order_products = [];
var last_products = null;
var subcats = [];
var subcat_products = [];
var payment_methods = [];

var parent_order_customer = null;

var recent_orders = [];
const MAX_RECENT_ORDERS = 10;


$(document).one('fm:sessionReady', function() {
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
		success: function(response) {
			payment_methods = response.payment_methods;
			payment_methods.forEach(element => {
				$('#paymentMethod').append('<option value="' + element.id + '">' + element.name + '</option>');
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione dei metodi di pagamento: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
	$.ajax({
		async: true,
		url: apiUrl + '/orders/',
		type: "GET",
		data: { limit: MAX_RECENT_ORDERS, order_by: '-created_at', created_by_user: true },
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			recent_orders = response.orders;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione degli ordini recenti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}

$(document).ready(function() {
	$('#newOrderItem').click(async function() {
		if (selectedProducts() > 0) {
			let ok = await modalConfirm('<span class="text-success"><i class="bi bi-plus-circle me-2"></i>Nuovo ordine</span>', 'Iniziare un <strong>nuovo ordine</strong>? Tutte le modifiche non salvate andranno perse.');
			if (ok) newOrder();
		} else newOrder();
	});
	
	$('#dropdownOrdersContainer').on('show.bs.dropdown', function(){
		$('#dropdownOrdersMenu').html('');
		recent_orders.forEach(order => {
			$('#dropdownOrdersMenu').append('<li class="dropdown-item" onclick="loadFromServer(' + order.id + ');">' + order.id + '<i class="bi bi-dot"></i>' + order.customer + '</li>');
		});
	});
});
