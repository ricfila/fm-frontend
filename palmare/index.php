<!DOCTYPE html>
<html lang="it">
<head>
	<title>Palmare sagra</title>

	<base href="../" />
	<?php include "../bootstrap.php" ?>

	<link href="palmare/style.css" rel="stylesheet" />
	<link href="media/compass-fill.png" rel="icon" type="image/png" />

	<script src="js/session.js"></script>
	<script src="palmare/js/main.js"></script>
</head>
<body style="height: 100vh;">
	<div class="container-lg h-100" style="padding-top: 53px;">
		<nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-success" style="transition: 0.2s;">
			<div class="container-lg">
				<span class="navbar-brand">
					<a href="#" class="navbar-brand" onclick="initList();"><i class="bi bi-compass-fill"></i> Palmare sagra&emsp;</a><span id="attesa"></span>&nbsp;<span id="errorIcon" onclick="showError();"></span>
				</span>
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>
				
				<div class="collapse navbar-collapse" id="navbarColor01">
					<ul class="navbar-nav me-auto">
						<li class="nav-item">
							<a class="nav-link" onclick="logout();"><strong class="lead"><i class="bi bi-person-fill"></i>&nbsp;<i class="username"></i></strong>&emsp;<i class="bi bi-door-open-fill"></i> Disconnettiti</a>
						</li>
						<li class="nav-item lead">
							<a class="nav-link" href="#" onclick="ultimiassociati();"><i class="bi bi-clock-history"></i> Ultimi associati</a>
						</li>
						<li class="nav-item lead">
							<a class="nav-link" href="#" onclick="cercaordine();"><i class="bi bi-search"></i> Cerca un ordine</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>
		
		<div id="page-header" style="transition: 0.3s;" class="pt-3">
			<div class="alert alert-success" style="width: 100%; padding: 50px 15px;" onclick="$(this).remove(); $('#page-body').html(''); initList();">
				<h4 class="text-success">Bentornato/a, <strong class="username"></strong></h4>
				Tocca qui per iniziare
			</div>
			<?php
			/*
			$tot = pg_fetch_assoc(pg_query($conn, "SELECT count(*) as tot FROM ordini WHERE cassiere = '" . $_COOKIE['cameriere'] . "';"))['tot'];
			$gradi = ['Associatore novizio', 'Principiante promettente', 'Abile tirocinante', 'Adocchia-clienti provetto', 'Gira-tavoli ferrato', 'Cameriere bersagliere',
			'Abbinatore esperto', 'Servitore assessore', 'Maggiordomo qualificato', 'Generale pluridecorato', 'Sovrano della sala'];
			$icone = ['dice-1-fill', 'dice-2-fill', 'dice-3-fill', 'dice-4-fill', 'dice-5-fill', 'dice-6-fill',
			'fire', 'award-fill', 'mortarboard-fill', 'stars', 'trophy-fill'];
			$grado = $tot >= 100 ? 11 : intval($tot / 10) + 1;
			*/
			$tot = 0; $grado = '';
			?>
			<br>
			<h6>Fino ad ora hai abbinato <strong><?php echo $tot; ?></strong> ordini</h6>
			<p>Hai raggiunto il grado <?php echo ($grado == 11 ? 'massimo' : $grado);?>:</p>
			<?php //echo '<h5 class="text-' . ($grado < 7 ? 'primary' : ($grado < 11 ? 'danger' : 'warning')) . '"><i class="bi bi-' . $icone[$grado - 1] . '"></i>&nbsp;' . $gradi[$grado - 1] . '</h5>'; ?>
			<br>
		</div>
		<hr>
		<div id="page-body">
			<button class="btn btn-outline-danger" onclick="logout();">Cambia utente</button>
		</div>
		
		<div class="modal fade" id="dialog">
			<div class="modal-dialog modal-dialog-centered" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="dialogtitle"></h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
							<span aria-hidden="true"></span>
						</button>
					</div>
					<div class="modal-body" id="dialogbody"></div>
					<div class="modal-footer" id="dialogfooter"></div>
				</div>
			</div>
		</div>
		<div class="modal fade" id="modalcerca">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Cerca</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
							<span aria-hidden="true"></span>
						</button>
					</div>
					<div class="modal-body">
						<span id="desccerca"></span><br>
						<div class="input-group mb-3 mt-3">
							<input class="form-control form-control-lg" type="number" id="inputcerca" onkeyup="if (event.keyCode == 13) cerca();">
							<button class="btn btn-lg btn-success" onclick="cerca();"><i class="bi bi-search"></i></button>
						</div>
						<div id="rescerca" style="text-align: center;"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<?php
	include '../pannello/php/toast.php';
	?>
	<!--script src="pagineblu.js"></script>
	<script src="cercapalmare.js"></script-->
	<script>
	
	let modal = new bootstrap.Modal(document.getElementById('dialog'));
	function dialog(title, body, azione = null) {
		$('#dialogtitle').html(title);
		$('#dialogbody').html(body);
		if (azione != null)
			$('#dialogfooter').html('<button class="btn btn-danger" onclick="modal.hide();"><i class="bi bi-x-circle"></i>&emsp;Annulla</button>&nbsp;' + azione).show();
		else
			$('#dialogfooter').hide();
		modal.show();
	}
	
	function menuColor(colore) {
		$('nav').removeClass('bg-warning').removeClass('bg-info').removeClass('bg-success').addClass(colore);
		$(".collapse").collapse('hide');
	}
	</script>
</body>
</html>
