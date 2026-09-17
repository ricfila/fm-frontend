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
	<script src="palmare/js/orders.js"></script>
	<script src="palmare/js/confirm_order.js"></script>
	<script src="palmare/js/last_associated.js"></script>
	<script src="palmare/js/order_summary.js"></script>
	<script src="palmare/js/search.js"></script>
	<script src="palmare/js/bookmarks.js"></script>
	<script src="palmare/js/contest.js"></script>
</head>
<body style="height: 100vh;">
	<div class="container-lg h-100" style="padding-top: 53px;">
		<nav class="fixed-top navbar navbar-expand-lg navbar-dark bg-success" style="transition: 0.2s;">
			<div class="container-lg">
				<span class="navbar-brand">
					<a class="navbar-brand me-4" onclick="initList();"><i class="bi bi-compass-fill me-3"></i>Palmare sagra</a><span id="attesa" class="me-4"></span><span id="errorIcon" onclick="showError();"></span>
				</span>
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>
				
				<div class="collapse navbar-collapse" id="navbarColor01">
					<ul class="navbar-nav me-auto">
						<li class="nav-item mt-3 mt-lg-0">
							<a class="nav-link" onclick="logout();"><strong class="lead me-4"><i class="bi bi-person-fill me-2"></i><i class="username"></i></strong><i class="bi bi-door-open-fill me-2"></i>Disconnettiti</a>
						</li>
						<li class="nav-item lead mt-3 mt-lg-0">
							<a class="nav-link" onclick="lastAssociated();"><i class="bi bi-clock-history me-2"></i>Ultimi associati</a>
						</li>
						<li class="nav-item lead mt-3 mt-lg-0 mb-lg-0">
							<a class="nav-link" onclick="selectSearchMode();"><i class="bi bi-search me-2"></i>Cerca un ordine</a>
						</li>
						<li class="nav-item lead mt-3 mt-lg-0 mb-2 mb-lg-0">
							<a class="nav-link" onclick="bookmarks();"><i class="bi bi-bookmark me-2"></i>Segnalibri</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>
		
		<div id="page-header" style="transition: 0.3s;" class="pt-3">
			<div class="alert alert-success mb-4" style="width: 100%; padding: 50px 15px;" onclick="$(this).remove(); $('#page-body').html(''); initList();">
				<h4 class="text-success">Bentornato/a, <strong class="username"></strong></h4>
				Tocca qui per iniziare
			</div>
			<div id="contest" class="mb-3"></div>
		</div>
		<hr>
		<div id="page-body">
			<button class="btn btn-outline-danger" onclick="logout();">Cambia utente</button>
		</div>
		
		<div class="modal fade" id="mod-search">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Cerca</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
							<span aria-hidden="true"></span>
						</button>
					</div>
					<div class="modal-body">
						<span id="search-desc"></span><br>
						<div class="input-group mb-3 mt-3">
							<input class="form-control form-control-lg" type="number" id="search-input" onkeyup="if (event.keyCode == 13) search();">
							<button class="btn btn-lg btn-success" onclick="search();"><i class="bi bi-search"></i></button>
						</div>
						<div id="search-error" style="text-align: center;"></div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<?php include "../js/toast.php"; ?>
</body>
</html>
