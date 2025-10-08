var order = null;
var order_products = [];
var last_products = null;
var subcats = [];
var subcat_products = [];
var payment_methods = [];
var recent_orders = [];

var cover_charge = null;
var order_requires_confirmation = null;

$(document).one('fm:sessionReady', function() {
	getSettings();
	getProducts();
	newOrder();
	loadComponents();
});

function getSettings() {
	$.ajax({
		async: false,
		url: apiUrl + '/settings/',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			cover_charge = response.settings.cover_charge;
			order_requires_confirmation = response.settings.order_requires_confirmation;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione delle impostazioni: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});

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
		data: { limit: 5, order_by: '-created_at', created_by_user: true },
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			recent_orders = response.orders;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione degli ordini recenti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}
