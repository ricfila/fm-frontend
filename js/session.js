var token;
var username;
var shiftDates = null;

var settings = {};
var categories = [];
var subcategories = [];
var wards = [];

const SPLIT_HOUR = 17; // 17:00 (5 PM)


$(document).ready(function() {
	token = localStorage.getItem('fm_token');
	username = localStorage.getItem('fm_username');
	if (token) {
		$.each($('.username'), function() {
			$(this).text(username);
		});
		shiftDates = getShiftDates();
		
        getSettings();
		$(document).trigger('fm:sessionReady');
	} else {
		setCookie('login_redirect', window.location.href);
		window.location.href = 'login/';
	}
});


function logout() {
	localStorage.removeItem('fm_token');
	localStorage.removeItem('fm_username');
	setCookie('login_redirect', window.location.href);
	window.location.href = 'login/';
}


function isThisSession(fullStr) {
    const dateObj = new Date(fullStr);
    const now = new Date();

	// Compare date
    const actualDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const orderDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    if (actualDate.getTime() != orderDate.getTime()) {
        return false;
    }

	// Compare time
    const actualSession = (now.getHours() >= 0 && now.getHours() < SPLIT_HOUR ? 0 : 1);
	const orderSession = (dateObj.getHours() >= 0 && dateObj.getHours() < SPLIT_HOUR ? 0 : 1);
	return actualSession == orderSession;
}


function getShiftDates() {
    const now = new Date();
    const currentHour = now.getHours();

    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    let startDate, endDate;

    if (currentHour >= 0 && currentHour < SPLIT_HOUR) {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0);
    }
    else {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0);
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        endDate = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 0, 0);
    }
    
    return {
        start: formatDateTime(startDate),
        end: formatDateTime(endDate)
    };
}


function getSettings() {
    $.ajax({
		async: false,
		url: apiUrl + '/settings/',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
            settings = response.settings;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella ricezione delle impostazioni: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
			if (jqXHR.status == 401)
				logout();
		}
	});
    $.ajax({
        async: false,
		url: apiUrl + '/categories',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			response.categories.forEach(cat => categories[cat.id] = cat); 
		},
		error: function(jqXHR, textStatus, errorThrown) {
			msg_err = 'Errore nella lettura delle categorie: ' + getErrorMessage(jqXHR, textStatus, errorThrown);
		}
	});
    $.ajax({ // Warning: this call is async
		url: apiUrl + '/subcategories',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			response.subcategories.forEach(subcat => subcategories[subcat.id] = subcat); 
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura delle sottocategorie: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
    $.ajax({
        async: false,
		url: apiUrl + '/ingredients/wards',
		type: "GET",
		headers: { "Authorization": "Bearer " + token },
		success: function(response) {
			wards = response.wards;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			showToast(false, 'Errore nella lettura dei reparti: ' + getErrorMessage(jqXHR, textStatus, errorThrown));
		}
	});
}
