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
	<script src="cucina/js/stock.js"></script>
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
					<div class="row mb-3">
						<div class="col my-auto"><h5 class="mb-0" id="title-monitoring"></h5></div>
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
			<div class="tab-pane fade" id="prints" role="tabpanel" aria-labelledby="prints-tab">
				<div class="tab-content">
					Prints
				</div>
			</div>
		</div>


		<div id="divtoast" class="toast-container bottom-0 end-0 p-3" style="z-index: 1100; position: fixed;"></div>
		<?php include "../js/toast.php"; ?>
	</div>
	
</body>
</html>
