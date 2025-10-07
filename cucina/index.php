<!DOCTYPE html>
<html lang="it">
<head>
	<title>Cucina - Festival Management</title>

	<base href="../" />
	<?php include "../bootstrap.php" ?>

	<link href="cucina/style.css" rel="stylesheet" />
	<link href="media/star-fill.png" rel="icon" type="image/png" />

	<script src="js/session.js"></script>
	<script src="cucina/js/main.js"></script>
	<script src="cucina/js/monitoring.js"></script>
</head>
<body>
	<div class="container-lg h-100" style="padding-top: 53px;">
		<nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-primary">
			<div class="container-lg">
				<span class="navbar-brand">
					<a class="navbar-brand"><i class="bi bi-star-fill"></i> Cucina</a>
				</span>
				<ul class="navbar-nav me-auto nav flex-row">
					<li class="nav-item lead">
						<a class="nav-link px-3 active" id="wards-link" data-bs-toggle="tab" data-bs-target="#wards"><i class="bi bi-display"></i><span class="d-none d-md-inline"> Monitoraggio</span></a>
					</li>
					<li class="nav-item lead">
						<a class="nav-link px-3" data-bs-toggle="tab" data-bs-target="#prints"><i class="bi bi-printer"></i><span class="d-none d-md-inline"> Stampe</span></a>
					</li>
					<li class="nav-item d-none">
						<a class="nav-link" id="monitoring-link" data-bs-toggle="tab" data-bs-target="#monitoring"></a>
					</li>
				</ul>

				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>
				
				<div class="collapse navbar-collapse" id="navbarColor01">
					<ul class="navbar-nav ms-auto">
						<li class="nav-item mt-3 mt-lg-0">
							<a class="nav-link" onclick="logout();"><strong class="lead"><i class="bi bi-person-fill"></i>&nbsp;<i class="username"></i></strong>&emsp;<i class="bi bi-door-open-fill"></i> Disconnettiti</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>

		<div class="tab-content pt-3 pt-md-4">
			<div class="tab-pane fade show active" id="wards" role="tabpanel" aria-labelledby="wards-tab">
				<div class="tab-content">
					<h3>Seleziona il reparto da monitorare:</h3>
					<div class="row mt-3" id="ward-list"></div>
				</div>
			</div>
			<div class="tab-pane fade" id="monitoring" role="tabpanel" aria-labelledby="monitoring-tab">
				<div class="tab-content">
					Monitoring



					<p id="err" aclass="mb-0">&nbsp;</p>
					<div id="corpo"></div>

					<script>
						function aggiorna() {
							let pre = $('#corpo').html();
							$('#err').html('<div class="spinner-border spinner-border-sm"></div> Caricamento in corso...');

							$.getJSON("ajax.php?a=ingredienti&settore=")
							.done(function(json) {
								$('#err').html('&nbsp;');
								try {
									let out = '<div class="row">';
									$.each(json, function(i, res) {
										out += '<div class="col-12 col-md-6 mb-4">';
										out += '<div class="row"><div class="col-auto">';
										out += '<h4>' + res.descrizione + ':</h4>';
										out += '</div><div class="col-auto">';
										out += '<div class="bg-' + (res.qta_attiva == 0 ? "dark" : (res.qta_attiva < 10 ? "success" : "danger")) + ' text-center py-1 px-0 rounded-3 rigaing" style="animation-delay: ' + (i * 0.05) + 's;"><h4 class="text-light m-0">' + res.qta_attiva + '</h4></div>';
										out += '</div></div>';
										out += '<p>Ordinati: ' + (parseInt(res.qta_attiva) + parseInt(res.qta_evasa)) + ' - Evasi: ' + res.qta_evasa + '</p>';
										out += '</div>';
									});
									out += '</div>';
									$('#corpo').html(out);
								} catch (err) {
									$('#err').html('<span class="text-danger"><strong>Errore nell\'elaborazione della richiesta:</strong></span>' + json);
								}
							})
							.fail(function(jqxhr, textStatus, error) {
								$('#err').html('<span class="text-danger"><strong>Errore durante la richiesta:</strong></span>' + jqxhr.responseText);
								$('#corpo').html(pre);
							})
						}
						//aggiorna();
						//setInterval(aggiorna, 30*1000);
					</script>
				</div>
			</div>
			<div class="tab-pane fade" id="prints" role="tabpanel" aria-labelledby="prints-tab">
				<div class="tab-content">
					Prints
				</div>
			</div>
		</div>


		<div id="divtoast" class="toast-container bottom-0 end-0 p-3" style="z-index: 1100; position: absolute;"></div>
		<?php include "../js/toast.php"; ?>
	</div>
	
</body>
</html>
