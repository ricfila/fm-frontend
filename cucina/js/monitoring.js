var wardsTab, monitoringTab;
var actual_ward = null;

$(document).ready(function() {
	wardsTab = bootstrap.Tab.getOrCreateInstance(document.querySelector('#wards-link'));
	monitoringTab = bootstrap.Tab.getOrCreateInstance(document.querySelector('#monitoring-link'));

	$('#monitoring-link').on('shown.bs.tab', function(e) {
		$('#wards-link').addClass('active');
	}).on('hide.bs.tab', function(e) {
		$('#monitoring-link').removeClass('active');
	});

	$('#wards-link').on('click', function(e) {
		$(this).removeClass('active');
		wardsTab.show();
	});
});

function openWard(ward) {
	actual_ward = ward;
	monitoringTab.show();
}