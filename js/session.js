var token;
var username;
var shiftDates = null;

$(document).ready(function() {
	token = localStorage.getItem('fm_token');
	username = localStorage.getItem('fm_username');
	if (token) {
		$.each($('.username'), function() {
			$(this).text(username);
		});
		shiftDates = getShiftDates();
		
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
