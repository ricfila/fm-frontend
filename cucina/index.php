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
	<script src="cucina/js/monitoring_stocks.js"></script>
	<script src="cucina/js/manage_stocks.js"></script>
	<script src="cucina/js/tickets.js"></script>
</head>
<body>
	<audio id="alert-sound" src="media/alert_kitchen.mp3" preload="auto"></audio>
	<div class="container-lg h-100" style="padding-top: 53px;">
		<nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-primary">
			<div class="container-lg">
				<span class="navbar-brand">
					<a class="navbar-brand"><i class="bi bi-star-fill"></i> Cucina</a>
				</span>
				<ul class="navbar-nav me-auto nav flex-row">
					<li class="nav-item lead">
						<a class="nav-link px-3 active" id="wards-link" data-bs-toggle="tab" data-bs-target="#wards"><i class="bi bi-unlock2-fill"></i><span class="d-none d-md-inline"> Stock</span></a>
					</li>
					<li class="nav-item lead">
						<a class="nav-link px-3" data-bs-toggle="tab" data-bs-target="#tickets"><i class="bi bi-receipt"></i><span class="d-none d-md-inline"> Comande</span></a>
					</li>
					<li class="nav-item d-none">
						<a class="nav-link" id="stocks-link" data-bs-toggle="tab" data-bs-target="#stocks"></a>
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
			<div class="tab-pane fade" id="stocks" role="tabpanel" aria-labelledby="stocks-tab">
				<div class="tab-content">
					<div class="row mb-3">
						<div class="col my-auto"><h5 class="mb-0" id="title-stocks"></h5></div>
						<div class="col-auto d-flex flex-row">
							<div class="form-check ps-0">
								<input type="checkbox" class="btn-check" id="toggleAutoUpdate" autocomplete="off" onchange="toggleAutoUpdate(this.checked);" checked="">
								<label class="btn btn-outline-primary" id="labeltoggleAutoUpdate" for="toggleAutoUpdate"><i class="bi bi-pause-circle-fill"></i></label>
							</div>
							<button class="btn btn-light ms-2" onclick="toggleAutoUpdate(true);"><i class="bi bi-arrow-clockwise"></i><span class="d-none d-md-inline"> Aggiorna</span></button>
						</div>
					</div>
					<div id="ingredient-list"></div>
				</div>
			</div>
			<div class="tab-pane fade" id="tickets" role="tabpanel" aria-labelledby="tickets-tab">
				<div class="tab-content">
					<div class="accordion" id="accordionSettings">
						<div class="accordion-item">
							<h4 class="accordion-header" id="headingSettings">
								<button class="accordion-button p-2 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
									<i class="bi bi-gear-fill"></i>&nbsp;Impostazioni
								</button>
							</h4>
							<div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingSettings" data-bs-parent="#accordionSettings" style="">
							<div class="accordion-body" id="categoryList"></div>
						</div>
					</div>

					<ul class="nav nav-tabs d-flex flex-row">
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center active" onclick="getTickets(0);" id="linktickets0"><i class="bi bi-cart3"></i><span class="d-none d-sm-inline"> Ordinate</span></a>
						</li>
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center" onclick="getTickets(1);" id="linktickets1"><i class="bi bi-compass"></i><span class="d-none d-sm-inline"> Confermate</span></a>
						</li>
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center" onclick="getTickets(2);" id="linktickets2"><i class="bi bi-printer"></i><span class="d-none d-sm-inline"> Stampate</span></a>
						</li>
						<li class="nav-item flex-fill">
							<a class="nav-link link-tickets px-2 text-center" onclick="getTickets(3);" id="linktickets3"><i class="bi bi-check2-circle"></i><span class="d-none d-sm-inline"> Evase</span></a>
						</li>
					</ul>
					<div id="ticketList" class="pt-3"></div>
				</div>
				</div>
			</div>
		</div>


		<div id="divtoast" class="toast-container bottom-0 end-0 p-3" style="z-index: 1100; position: fixed;"></div>
		<?php include "../js/toast.php"; ?>
	</div>
	
</body>
</html>
