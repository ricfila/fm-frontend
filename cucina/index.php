<!DOCTYPE html>
<html lang="it">
<head>
	<title>Cucina - Festival Management</title>

	<base href="../" />
	<?php include "../bootstrap.php" ?>

	<link href="cucina/style.css" rel="stylesheet" />
	<link href="media/display-fill.png" rel="icon" type="image/png" />

	<script src="js/session.js"></script>
	<script src="cucina/js/main.js"></script>
	<script src="cucina/js/alerts.js"></script>
	<script src="cucina/js/manage_stocks.js"></script>
	<script src="cucina/js/residuals.js"></script>
	<script src="cucina/js/stocks.js"></script>
	<script src="cucina/js/tickets.js"></script>
</head>
<body style="height: 100vh;">
	<audio id="alert-sound" src="media/alert_kitchen.mp3" preload="auto"></audio>
	<div class="container-lg h-100" style="padding-top: 53px;">
		<nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-warning">
			<div class="container-lg">
				<span class="navbar-brand">
					<a class="navbar-brand"><i class="bi bi-display-fill"></i><span class="d-none d-md-inline ms-3">Cucina</span></a>
				</span>
				<ul class="navbar-nav me-auto nav flex-row">
					<li class="nav-item lead m-0">
						<a class="nav-link px-3 active" data-bs-toggle="tab" data-bs-target="#residuals"><i class="bi bi-list-nested"></i><span class="d-none d-md-inline ms-2">Residui</span></a>
					</li>
					<li class="nav-item lead m-0">
						<a class="nav-link px-3" data-bs-toggle="tab" data-bs-target="#alerts"><i class="bi bi-bell-fill"></i><span class="d-none d-md-inline ms-2">Notifiche</span></a>
					</li>
					<li class="nav-item lead m-0">
						<a class="nav-link px-3" id="wards-link" data-bs-toggle="tab" data-bs-target="#stocks"><i class="bi bi-database-fill"></i><span class="d-none d-md-inline ms-2">Stock</span></a>
					</li>
					<li class="nav-item lead m-0">
						<a class="nav-link px-3" data-bs-toggle="tab" data-bs-target="#settings"><i class="bi bi-gear-fill"></i><span class="d-none d-md-inline ms-2">Impostazioni</span></a>
					</li>
					<li class="nav-item lead m-0">
						<a class="nav-link px-3" data-bs-toggle="tab" data-bs-target="#tickets"><i class="bi bi-printer-fill"></i><span class="d-none d-md-inline ms-2">Comande</span></a>
					</li>
				</ul>
			</div>
		</nav>

		<div class="tab-content h-100 pt-3 pt-md-4">
			<div class="tab-pane fade h-100 show active" id="residuals" role="tabpanel" aria-labelledby="residuals-tab">
				<div class="tab-content h-100 d-flex flex-column">
					<div class="row mb-3">
						<div class="col my-auto">
							<h4 class="m-0"><strong>Quantità residue</strong></h4>
						</div>
						<div class="col-auto">
							<button class="btn btn-lg btn-light py-1" onclick="getResidualQuantities();"><i class="bi bi-arrow-clockwise"></i><span class="d-none d-md-inline ms-2">Aggiorna</span></button>
						</div>
					</div>
					<div id="residuals-body" class="flex-fill" style="overflow-x: hidden; overflow-y: auto;"></div>
				</div>
			</div>

			<div class="tab-pane fade h-100" id="alerts" role="tabpanel" aria-labelledby="alerts-tab">
				<div class="tab-content h-100 d-flex flex-column">
					<div class="row mb-3">
						<div class="col my-auto">
							<h4 class="m-0"><strong>Notifiche</strong></h4>
						</div>
						<div class="col-auto">
							<button class="btn btn-lg btn-light py-1" onclick="getStockQuantities();"><i class="bi bi-arrow-clockwise"></i><span class="d-none d-md-inline ms-2">Aggiorna</span></button>
						</div>
					</div>
					<div id="alert-list" class="flex-fill" style="overflow-x: hidden; overflow-y: auto;"></div>
				</div>
			</div>

			<div class="tab-pane fade h-100" id="stocks" role="tabpanel" aria-labelledby="stocks-tab">
				<div class="tab-content h-100 d-flex flex-column">
					<div class="row mb-3">
						<div class="col my-auto">
							<h4 class="m-0"><strong>Stock</strong></h4>
						</div>
						<div class="col-auto">
							<button class="btn btn-lg btn-light py-1" onclick="getStockQuantities();"><i class="bi bi-arrow-clockwise"></i><span class="d-none d-md-inline ms-2">Aggiorna</span></button>
						</div>
					</div>
					<div id="stock-list" class="flex-fill" style="overflow-x: hidden; overflow-y: auto;"></div>
				</div>
			</div>

			<div class="tab-pane fade" id="settings" role="tabpanel" aria-labelledby="alerts-tab">
				<div class="tab-content">
					<h4><strong>Impostazioni</strong></h4>

					<div class="row">
						<div class="col-auto">
							<div class="form-check ps-0 m-0 h-100">
								<input type="checkbox" class="btn-check" id="toggleAutoUpdate" autocomplete="off" onchange="toggleAutoUpdate(this.checked);" checked="">
								<label class="btn btn-outline-primary" id="labeltoggleAutoUpdate" for="toggleAutoUpdate"><i class="bi bi-pause-circle-fill"></i></label>
							</div>
						</div>
						<div class="col my-auto"><h6 class="m-0">Aggiornamento automatico</h6></div>
					</div>

					<hr>
					<h2 class="text-primary">Reparti monitorati</h2>
					<div id="ward-list"></div>

					<hr>
					<h2 class="text-primary">Ricevi nuove quantità</h2>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="inputAwaitCookingTime" id="inputAwaitCookingTime_false" value="false" onchange="toggleAwaitCookingTime('false');">
							<label class="form-check-label" for="inputAwaitCookingTime_false">Subito dopo la vendita</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="inputAwaitCookingTime" id="inputAwaitCookingTime_true" value="true" onchange="toggleAwaitCookingTime('true');">
							<label class="form-check-label" for="inputAwaitCookingTime_true">In anticipo sincronizzato sulla comanda</label>
						</div>

					<hr>
					<h2 class="text-primary">Attiva le notifiche per</h2>
					Puoi selezionare anche ingredienti di reparti non monitorati.
					<div id="ingredientListAlerts"></div>
				</div>
			</div>

			<div class="tab-pane fade h-100" id="tickets" role="tabpanel" aria-labelledby="tickets-tab">
				<div class="tab-content h-100 d-flex flex-column">
					<div class="accordion" id="accordionSettings">
						<div class="accordion-item">
							<h4 class="accordion-header" id="headingSettings">
								<button class="accordion-button p-2 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
									<i class="bi bi-gear-fill me-2"></i>Categorie
								</button>
							</h4>
							<div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingSettings" data-bs-parent="#accordionSettings" style="">
								<div class="accordion-body" id="categoryList"></div>
							</div>
						</div>
					</div>

					<ul class="nav nav-tabs d-flex flex-row">
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center active" onclick="getTickets(0);" id="linktickets0"><i class="bi bi-cart-fill"></i><span class="d-none d-sm-inline ms-2">Ordinate</span></a>
						</li>
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center" onclick="getTickets(1);" id="linktickets1"><i class="bi bi-compass-fill"></i><span class="d-none d-sm-inline ms-2">Confermate</span></a>
						</li>
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center" onclick="getTickets(2);" id="linktickets2"><i class="bi bi-printer-fill"></i><span class="d-none d-sm-inline ms-2">Stampate</span></a>
						</li>
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center" onclick="getTickets(3);" id="linktickets3"><i class="bi bi-patch-check-fill"></i><span class="d-none d-sm-inline ms-2">Evase</span></a>
						</li>
					</ul>
					<div id="ticketList" class="pt-3 flex-fill" style="overflow-x: hidden; overflow-y: auto;"></div>
				</div>
				</div>
			</div>
		</div>


		<div id="divtoast" class="toast-container bottom-0 end-0 p-3" style="z-index: 1100; position: fixed;"></div>
		<?php include "../js/toast.php"; ?>
	</div>
	
</body>
</html>
